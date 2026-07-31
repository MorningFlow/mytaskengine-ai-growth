'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { getDeepgramAgentConfig, MAX_CALL_DURATION_SECONDS } from '@/lib/deepgram-agent-config';

export type AgentStatus = 'idle' | 'connecting' | 'connected' | 'error';

interface UseDeepgramAgentOptions {
  onAudioLevel?: (level: number) => void;
  onCallTimeout?: () => void;
}

interface UseDeepgramAgentReturn {
  status: AgentStatus;
  connect: () => Promise<void>;
  disconnect: () => void;
  audioLevel: number;
  transcript: string;
  agentTranscript: string;
  error: string | null;
  elapsedSeconds: number;
}

/**
 * Custom hook that manages the full Deepgram Voice Agent WebSocket lifecycle:
 * - Fetches a temporary API key from our server
 * - Opens a WebSocket to Deepgram's agent endpoint
 * - Streams mic audio as raw PCM to Deepgram
 * - Receives and plays back AI-generated audio
 * - Tracks transcripts, audio levels, and call duration
 */
export function useDeepgramAgent(options: UseDeepgramAgentOptions = {}): UseDeepgramAgentReturn {
  const [status, setStatus] = useState<AgentStatus>('idle');
  const [audioLevel, setAudioLevel] = useState(0);
  const [transcript, setTranscript] = useState('');
  const [agentTranscript, setAgentTranscript] = useState('');
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

      // Convert linear16 (Int16) to Float32 for Web Audio
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
      setTranscript('');
      setAgentTranscript('');
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

      // 2. Request mic access
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

      // Set up analyser for visual feedback
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 512;
      analyserRef.current.smoothingTimeConstant = 0.3;
      analyserDataRef.current = new Uint8Array(analyserRef.current.frequencyBinCount);
      source.connect(analyserRef.current);

      // 4. Set up playback context
      playbackContextRef.current = new AudioContext({ sampleRate: 24000 });

      // 5. Open WebSocket to Deepgram Voice Agent
      // Deepgram uses the 'token' subprotocol for browser WebSocket authentication
      const ws = new WebSocket(`wss://agent.deepgram.com/v1/agent/converse`, ['token', key]);
      wsRef.current = ws;

      ws.onopen = () => {
        // Send Settings message
        const config = getDeepgramAgentConfig();
        ws.send(JSON.stringify(config));
        setStatus('connected');

        // Start audio capture via ScriptProcessor (widely supported fallback)
        // Use 4096 buffer for a good balance between latency and performance
        const processor = audioContextRef.current!.createScriptProcessor(4096, 1, 1);
        scriptProcessorRef.current = processor;

        processor.onaudioprocess = (e) => {
          if (ws.readyState !== WebSocket.OPEN) return;
          if (!settingsAppliedRef.current) return; // Wait for SettingsApplied before sending audio

          const inputData = e.inputBuffer.getChannelData(0);
          // Convert Float32 to Int16 (linear16)
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
                break;

              case 'ConversationText':
                if (msg.role === 'user') {
                  setTranscript(msg.content || '');
                } else if (msg.role === 'assistant') {
                  setAgentTranscript(msg.content || '');
                }
                break;

              case 'AgentThinking':
                break;

              case 'AgentStartedSpeaking':
                // Reset play timeline to avoid old scheduled audio playing during an interruption
                if (playbackContextRef.current) {
                  nextPlayTimeRef.current = playbackContextRef.current.currentTime;
                }
                break;

              case 'AgentAudioDone':
                break;

              case 'Error':
                console.error('Deepgram agent error:', msg);
                setError(msg.message || 'Agent error occurred');
                break;

              default:
                // Log unknown message types in dev
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
        // The actual cause will appear in the onclose handler with the code/reason
      };

      ws.onclose = (e) => {
        if (process.env.NODE_ENV === 'development') {
          console.log(`WebSocket closed — code: ${e.code}, reason: "${e.reason}", clean: ${e.wasClean}`);
        }
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

      // Provide user-friendly error messages
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
  }, [cleanup, disconnect, playAudioChunk, startAudioLevelMonitoring, options]);

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
    transcript,
    agentTranscript,
    error,
    elapsedSeconds,
  };
}
