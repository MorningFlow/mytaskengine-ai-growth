'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { getDeepgramAgentConfig, MAX_CALL_DURATION_SECONDS } from '@/lib/deepgram-agent-config';

export type AgentStatus = 'idle' | 'connecting' | 'connected' | 'error';
export type ActiveSpeaker = 'user' | 'assistant' | 'idle';

export interface ConversationTurn {
  role: 'user' | 'assistant';
  text: string;
  time: number;
}

interface UseDeepgramAgentOptions {
  onAudioLevel?: (level: number) => void;
  onCallTimeout?: () => void;
  onCallEnded?: (history: ConversationTurn[]) => void;
}

interface UseDeepgramAgentReturn {
  status: AgentStatus;
  connect: () => Promise<void>;
  disconnect: () => void;
  audioLevel: number;
  transcript: string;
  userTranscript: string;
  agentTranscript: string;
  activeSpeaker: ActiveSpeaker;
  isUserSpeaking: boolean;
  isAgentSpeaking: boolean;
  conversationHistory: ConversationTurn[];
  error: string | null;
  elapsedSeconds: number;
}

/**
 * Custom hook that manages the full Deepgram Voice Agent WebSocket lifecycle:
 * - Uses browser WebRTC hardware Acoustic Echo Cancellation (AEC)
 * - Streams mic audio as raw PCM to Deepgram
 * - Receives and plays back AI-generated audio
 * - Delivers fluid word-by-word streaming transcription with zero speaker bleed
 */
export function useDeepgramAgent(options: UseDeepgramAgentOptions = {}): UseDeepgramAgentReturn {
  const [status, setStatus] = useState<AgentStatus>('idle');
  const [audioLevel, setAudioLevel] = useState(0);
  const [userTranscript, setUserTranscript] = useState('');
  const [agentTranscript, setAgentTranscript] = useState('');
  const [activeSpeaker, setActiveSpeaker] = useState<ActiveSpeaker>('idle');
  const [isUserSpeaking, setIsUserSpeaking] = useState(false);
  const [isAgentSpeaking, setIsAgentSpeaking] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<ConversationTurn[]>([]);
  const conversationHistoryRef = useRef<ConversationTurn[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const wsRef = useRef<WebSocket | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const workletNodeRef = useRef<AudioWorkletNode | null>(null);
  const playbackContextRef = useRef<AudioContext | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const analyserDataRef = useRef<Uint8Array<ArrayBuffer> | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const isCleaningUpRef = useRef(false);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const nextPlayTimeRef = useRef<number>(0);
  const settingsAppliedRef = useRef(false);

  // Timers for smooth word-by-word stream animations
  const userStreamIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const agentStreamIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Animate text word by word
  const streamWords = useCallback((fullText: string, setter: (text: string) => void, intervalRef: React.MutableRefObject<any>, speedMs = 35) => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (!fullText || !fullText.trim()) {
      setter('');
      return;
    }

    const words = fullText.trim().split(/\s+/);
    if (words.length <= 1) {
      setter(fullText);
      return;
    }

    let currentCount = 1;
    setter(words[0]);

    intervalRef.current = setInterval(() => {
      currentCount++;
      if (currentCount <= words.length) {
        setter(words.slice(0, currentCount).join(' '));
      } else {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      }
    }, speedMs);
  }, []);

  // Audio level monitoring loop
  const startAudioLevelMonitoring = useCallback(() => {
    const tick = () => {
      if (analyserRef.current && analyserDataRef.current) {
        analyserRef.current.getByteFrequencyData(analyserDataRef.current);
        let sum = 0;
        for (let i = 0; i < analyserDataRef.current.length; i++) {
          const val = analyserDataRef.current[i] / 255;
          sum += val * val;
        }
        const rms = Math.sqrt(sum / analyserDataRef.current.length);
        const level = Math.min(rms * 3.0, 1);
        setAudioLevel(level);
        options.onAudioLevel?.(level);
      }
      animFrameRef.current = requestAnimationFrame(tick);
    };
    animFrameRef.current = requestAnimationFrame(tick);
  }, [options]);

  const stopAudioLevelMonitoring = useCallback(() => {
    if (animFrameRef.current !== null) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    setAudioLevel(0);
  }, []);

  // Play received audio from the agent
  const playAudioChunk = useCallback(async (audioData: ArrayBuffer) => {
    try {
      if (!playbackContextRef.current || playbackContextRef.current.state === 'closed') {
        playbackContextRef.current = new AudioContext({ sampleRate: 24000 });
      }

      const ctx = playbackContextRef.current;
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }

      const int16Array = new Int16Array(audioData);
      const float32Array = new Float32Array(int16Array.length);
      for (let i = 0; i < int16Array.length; i++) {
        float32Array[i] = int16Array[i] / 32768;
      }

      const buffer = ctx.createBuffer(1, float32Array.length, 24000);
      buffer.getChannelData(0).set(float32Array);

      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);

      const currentTime = ctx.currentTime;
      if (nextPlayTimeRef.current < currentTime) {
        nextPlayTimeRef.current = currentTime;
      }

      source.start(nextPlayTimeRef.current);
      nextPlayTimeRef.current += buffer.duration;
    } catch (err) {
      console.warn('Audio playback error:', err);
    }
  }, []);

  // Cleanup everything
  const cleanup = useCallback(() => {
    if (isCleaningUpRef.current) return;
    isCleaningUpRef.current = true;

    stopAudioLevelMonitoring();

    if (userStreamIntervalRef.current) {
      clearInterval(userStreamIntervalRef.current);
      userStreamIntervalRef.current = null;
    }
    if (agentStreamIntervalRef.current) {
      clearInterval(agentStreamIntervalRef.current);
      agentStreamIntervalRef.current = null;
    }

    // Clear timers
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    // Close WebSocket
    if (wsRef.current) {
      try {
        if (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING) {
          wsRef.current.close();
        }
      } catch { /* ignore */ }
      wsRef.current = null;
    }

    // Stop ScriptProcessor
    if (scriptProcessorRef.current) {
      try {
        scriptProcessorRef.current.disconnect();
      } catch { /* ignore */ }
      scriptProcessorRef.current = null;
    }

    // Stop AudioWorklet
    if (workletNodeRef.current) {
      try {
        workletNodeRef.current.disconnect();
      } catch { /* ignore */ }
      workletNodeRef.current = null;
    }

    // Stop media stream
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(t => t.stop());
      mediaStreamRef.current = null;
    }

    // Close audio contexts
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      try { audioContextRef.current.close(); } catch { /* ignore */ }
      audioContextRef.current = null;
    }
    if (playbackContextRef.current && playbackContextRef.current.state !== 'closed') {
      try { playbackContextRef.current.close(); } catch { /* ignore */ }
      playbackContextRef.current = null;
    }

    analyserRef.current = null;
    analyserDataRef.current = null;
    nextPlayTimeRef.current = 0;
    settingsAppliedRef.current = false;
    setIsUserSpeaking(false);
    setIsAgentSpeaking(false);

    isCleaningUpRef.current = false;
  }, [stopAudioLevelMonitoring]);

  const disconnect = useCallback(() => {
    cleanup();
    setStatus('idle');
    setElapsedSeconds(0);
    setAudioLevel(0);
  }, [cleanup]);

  const connect = useCallback(async () => {
    try {
      setStatus('connecting');
      setError(null);
      setUserTranscript('');
      setAgentTranscript('');
      setActiveSpeaker('idle');
      setIsUserSpeaking(false);
      setIsAgentSpeaking(false);
      setElapsedSeconds(0);

      // 1. Get API key from our server
      const tokenRes = await fetch('/api/deepgram-token', { method: 'POST' });
      if (!tokenRes.ok) {
        throw new Error('Failed to get Deepgram token');
      }
      const { key } = await tokenRes.json();
      if (!key) {
        throw new Error('No API key received');
      }

      // 2. Request mic access with hardware Acoustic Echo Cancellation
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 48000,
        },
      });
      mediaStreamRef.current = stream;

      // 3. Set up audio context for capture + analysis
      audioContextRef.current = new AudioContext({ sampleRate: 48000 });
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }

      const source = audioContextRef.current.createMediaStreamSource(stream);

      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 512;
      analyserRef.current.smoothingTimeConstant = 0.3;
      analyserDataRef.current = new Uint8Array(analyserRef.current.frequencyBinCount);
      source.connect(analyserRef.current);

      // 4. Set up playback context
      playbackContextRef.current = new AudioContext({ sampleRate: 24000 });

      // 5. Open WebSocket to Deepgram Voice Agent
      const ws = new WebSocket(`wss://agent.deepgram.com/v1/agent/converse`, ['token', key]);
      wsRef.current = ws;

      ws.onopen = () => {
        // Send Settings message
        const config = getDeepgramAgentConfig();
        ws.send(JSON.stringify(config));
        setStatus('connected');

        // Start audio capture via ScriptProcessor
        const processor = audioContextRef.current!.createScriptProcessor(4096, 1, 1);
        scriptProcessorRef.current = processor;

        processor.onaudioprocess = (e) => {
          if (ws.readyState !== WebSocket.OPEN) return;
          if (!settingsAppliedRef.current) return;

          const inputData = e.inputBuffer.getChannelData(0);
          const int16Array = new Int16Array(inputData.length);
          for (let i = 0; i < inputData.length; i++) {
            const s = Math.max(-1, Math.min(1, inputData[i]));
            int16Array[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
          }
          ws.send(int16Array.buffer);
        };

        source.connect(processor);
        processor.connect(audioContextRef.current!.destination);

        // Start audio level monitoring
        startAudioLevelMonitoring();

        // Start elapsed time counter
        timerRef.current = setInterval(() => {
          setElapsedSeconds(prev => prev + 1);
        }, 1000);

        // Set call timeout
        timeoutRef.current = setTimeout(() => {
          options.onCallTimeout?.();
          disconnect();
        }, MAX_CALL_DURATION_SECONDS * 1000);
      };

      ws.onmessage = async (event) => {
        if (event.data instanceof Blob) {
          // Binary data = audio from the agent
          const arrayBuffer = await event.data.arrayBuffer();
          playAudioChunk(arrayBuffer);
        } else {
          // Text data = JSON messages
          try {
            const msg = JSON.parse(event.data);

            switch (msg.type) {
              case 'SettingsApplied':
                settingsAppliedRef.current = true;
                break;

              case 'UserStartedSpeaking':
                setIsUserSpeaking(true);
                setIsAgentSpeaking(false);
                setActiveSpeaker('user');
                setUserTranscript('');
                break;

              case 'ConversationText':
                if (msg.role === 'user') {
                  const userText = msg.content || '';
                  setActiveSpeaker('user');
                  streamWords(userText, setUserTranscript, userStreamIntervalRef, 35);
                } else if (msg.role === 'assistant') {
                  const agentText = msg.content || '';
                  setActiveSpeaker('assistant');
                  streamWords(agentText, setAgentTranscript, agentStreamIntervalRef, 40);
                }
                if (msg.content && msg.content.trim()) {
                  const turn: ConversationTurn = {
                    role: msg.role === 'user' ? 'user' : 'assistant',
                    text: msg.content.trim(),
                    time: elapsedSeconds,
                  };
                  setConversationHistory(prev => {
                    const next = [...prev, turn];
                    conversationHistoryRef.current = next;
                    return next;
                  });
                }
                break;

              case 'AgentThinking':
                setIsUserSpeaking(false);
                break;

              case 'AgentStartedSpeaking':
                setIsAgentSpeaking(true);
                setIsUserSpeaking(false);
                setActiveSpeaker('assistant');
                if (playbackContextRef.current) {
                  nextPlayTimeRef.current = playbackContextRef.current.currentTime;
                }
                break;

              case 'AgentAudioDone':
                setIsAgentSpeaking(false);
                break;

              case 'Error':
                console.error('Deepgram agent error:', msg);
                setError(msg.message || 'Agent error occurred');
                break;

              default:
                if (process.env.NODE_ENV === 'development') {
                  console.log('Deepgram msg:', msg.type, msg);
                }
            }
          } catch {
            // Non-JSON text message, ignore
          }
        }
      };

      ws.onerror = (e) => {
        console.error('WebSocket error event:', e);
      };

      ws.onclose = (e) => {
        if (!isCleaningUpRef.current) {
          let msg = 'Connection closed. Please try again.';
          if (e.code === 1006) {
            msg = 'Could not reach Deepgram — check your API key and network.';
          } else if (e.code === 4000) {
            msg = 'Invalid API key. Please check your Deepgram credentials.';
          } else if (e.reason) {
            msg = e.reason;
          } else if (e.code !== 1000) {
            msg = `Connection closed unexpectedly (code: ${e.code})`;
          }

          if (e.code !== 1000) {
            setError(msg);
            setStatus('error');
          } else {
            setStatus('idle');
          }
          cleanup();
        }
      };

    } catch (err: any) {
      console.error('Connection error:', err);

      let errorMessage = 'Failed to connect. Please try again.';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        errorMessage = 'Microphone access denied. Please allow microphone access and try again.';
      } else if (err.name === 'NotFoundError') {
        errorMessage = 'No microphone found. Please connect a microphone and try again.';
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
      setStatus('error');
      cleanup();
    }
  }, [cleanup, disconnect, playAudioChunk, startAudioLevelMonitoring, streamWords, options, elapsedSeconds]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  return {
    status,
    connect,
    disconnect,
    audioLevel,
    transcript: userTranscript || agentTranscript,
    userTranscript,
    agentTranscript,
    activeSpeaker,
    isUserSpeaking,
    isAgentSpeaking,
    conversationHistory,
    error,
    elapsedSeconds,
  };
}
