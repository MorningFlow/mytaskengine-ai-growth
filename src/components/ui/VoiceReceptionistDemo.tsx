'use client';

import React, { useState, useEffect, useCallback, CSSProperties } from 'react';
import { X, Phone, PhoneOff, Loader2, AlertCircle, RotateCcw, CheckCircle2, ArrowRight, ShieldCheck, Cpu, Calendar, Send } from 'lucide-react';
import { VoicePoweredOrb } from '@/components/ui/voice-powered-orb';
import { useDeepgramAgent, ConversationTurn } from '@/lib/use-deepgram-agent';
import { MAX_CALL_DURATION_SECONDS, AGENT_GREETING } from '@/lib/deepgram-agent-config';
import { ExtractedLeadData } from '@/app/api/leads/extract/route';

/* ─── Scoped keyframes ─────────────────────────────────────────────────────── */
const STYLES = `
  @keyframes vrd-fade-in {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes vrd-slide-up {
    from { opacity: 0; transform: translateY(18px) scale(0.98); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }
  @keyframes vrd-spin {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }
  @keyframes vrd-transcript-in {
    from { opacity: 0; transform: translateY(4px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .vrd-close:hover { background: rgba(255,255,255,0.14) !important; color: #FFFFFF !important; }
  .vrd-btn:hover { transform: translateY(-1px) !important; filter: brightness(1.08); }
  .vrd-btn:active { transform: translateY(0) scale(0.98) !important; }
  .vrd-cal-btn:hover {
    filter: brightness(1.12);
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(22, 199, 132, 0.4) !important;
  }
  .vrd-scroll::-webkit-scrollbar { width: 5px; }
  .vrd-scroll::-webkit-scrollbar-track { background: transparent; }
  .vrd-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); border-radius: 4px; }
  @media (max-width: 640px) {
    .vrd-actions {
      flex-direction: column-reverse !important;
    }
    .vrd-actions button {
      width: 100% !important;
      justify-content: center !important;
    }
  }
`;

function useInjectStyles() {
  useEffect(() => {
    if (document.getElementById('vrd-styles')) return;
    const tag = document.createElement('style');
    tag.id = 'vrd-styles';
    tag.textContent = STYLES;
    document.head.appendChild(tag);
  }, []);
}

const C = {
  bgOverlay: 'rgba(10, 14, 20, 0.95)',
  cardBg: 'rgba(13, 17, 23, 0.98)',
  text: '#FFFFFF',
  muted: '#9CA3AF',
  subtle: 'rgba(255,255,255,0.45)',
  accent: '#16C784',
  accentDk: '#13B371',
  accentBg: 'rgba(22, 199, 132, 0.08)',
  accentBorder: 'rgba(22, 199, 132, 0.25)',
  danger: '#E24B4A',
  dangerDk: '#C93C3B',
  border: 'rgba(255,255,255,0.08)',
  tileBg: 'rgba(255, 255, 255, 0.03)',
  ink: '#0D1117',
} as const;

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function getRemainingColor(elapsed: number): string {
  const remaining = MAX_CALL_DURATION_SECONDS - elapsed;
  if (remaining <= 10) return C.danger;
  if (remaining <= 20) return '#F59E0B';
  return C.subtle;
}

interface VoiceReceptionistDemoProps {
  open: boolean;
  onClose: () => void;
}

export default function VoiceReceptionistDemo({ open, onClose }: VoiceReceptionistDemoProps) {
  useInjectStyles();

  const [showTimeoutMessage, setShowTimeoutMessage] = useState(false);
  const [micConsented, setMicConsented] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedLead, setExtractedLead] = useState<ExtractedLeadData | null>(null);
  const [manualEmail, setManualEmail] = useState('');
  const [emailSubmitted, setEmailSubmitted] = useState(false);
  const [showSecondaryForm, setShowSecondaryForm] = useState(false);
  const [secondaryEmail, setSecondaryEmail] = useState('');
  const [secondarySubmitted, setSecondarySubmitted] = useState(false);
  const [sessionId] = useState(() => `voice_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`);

  const handleCallTimeout = useCallback(() => {
    setShowTimeoutMessage(true);
  }, []);

  const {
    status,
    connect,
    disconnect,
    audioLevel,
    userTranscript,
    agentTranscript,
    activeSpeaker,
    isUserSpeaking,
    isAgentSpeaking,
    conversationHistory,
    error,
    elapsedSeconds,
  } = useDeepgramAgent({
    onCallTimeout: handleCallTimeout,
  });

  // Extract structured intelligence upon call completion
  const processPostCallExtraction = useCallback(async (history: ConversationTurn[]) => {
    if (!history || history.length === 0) return;
    const hasUserSpeech = history.some(h => h.role === 'user');
    if (!hasUserSpeech) return;

    setIsExtracting(true);
    try {
      const res = await fetch('/api/leads/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript: history }),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          setExtractedLead(json.data);
          if (json.data.email) {
            setManualEmail(json.data.email);
          }

          // Submit to central lead capture route (Option A)
          await fetch('/api/leads', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              source: 'voice_receptionist_demo',
              sessionId,
              lead: json.data,
              transcript: history,
            }),
          });
        }
      }
    } catch (err) {
      console.warn('[PostCall Extraction] Error:', err);
    } finally {
      setIsExtracting(false);
    }
  }, [sessionId]);

  // Handle call hangup
  const handleHangup = useCallback(() => {
    const historySnapshot = [...conversationHistory];
    disconnect();
    if (historySnapshot.length > 0) {
      processPostCallExtraction(historySnapshot);
    }
  }, [conversationHistory, disconnect, processPostCallExtraction]);

  // Lock body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  // Trigger post-call extraction on call timeout
  useEffect(() => {
    if (showTimeoutMessage && conversationHistory.length > 0 && !extractedLead && !isExtracting) {
      processPostCallExtraction(conversationHistory);
    }
  }, [showTimeoutMessage, conversationHistory, extractedLead, isExtracting, processPostCallExtraction]);

  // Reset state when demo closes
  const handleClose = useCallback(() => {
    disconnect();
    setShowTimeoutMessage(false);
    setMicConsented(false);
    setExtractedLead(null);
    setIsExtracting(false);
    setEmailSubmitted(false);
    onClose();
  }, [disconnect, onClose]);

  // Start / stop call
  const handleToggleCall = useCallback(() => {
    if (status === 'connected') {
      handleHangup();
    } else if (status === 'idle' || status === 'error') {
      setShowTimeoutMessage(false);
      setExtractedLead(null);
      if (!micConsented) {
        setMicConsented(true);
        return;
      }
      connect();
    }
  }, [status, connect, handleHangup, micConsented]);

  // Submit fallback email if missing
  const handleManualEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualEmail.trim() || !extractedLead) return;

    const updatedLead: ExtractedLeadData = {
      ...extractedLead,
      email: manualEmail.trim(),
      leadScore: 'High Priority',
      missingFields: extractedLead.missingFields.filter(f => f !== 'email'),
    };

    setExtractedLead(updatedLead);
    setEmailSubmitted(true);

    try {
      await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source: 'voice_receptionist_demo',
          sessionId,
          lead: updatedLead,
          transcript: conversationHistory,
        }),
      });
    } catch (err) {
      console.warn('Manual email submission error:', err);
    }
  };

  // Submit secondary email copy
  const handleSecondaryEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!secondaryEmail.trim() || !extractedLead) return;

    setSecondarySubmitted(true);

    try {
      await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source: 'voice_receptionist_demo',
          sessionId,
          lead: { ...extractedLead, email: secondaryEmail.trim() },
          transcript: conversationHistory,
        }),
      });
    } catch (err) {
      console.warn('Secondary email submission error:', err);
    }
  };

  if (!open) return null;

  const isConnected = status === 'connected';
  const isConnecting = status === 'connecting';
  const isError = status === 'error';
  const remaining = MAX_CALL_DURATION_SECONDS - elapsedSeconds;

  /* ── Overlay Style (Clean flex column layout with safe scrolling) ── */
  const overlay: CSSProperties = {
    position: 'fixed',
    inset: 0,
    zIndex: 10000,
    background: C.bgOverlay,
    backdropFilter: 'blur(28px)',
    WebkitBackdropFilter: 'blur(28px)',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    boxSizing: 'border-box',
    padding: 'clamp(12px, 2.5vh, 24px) clamp(16px, 3vw, 32px)',
    fontFamily: 'inherit',
    animation: 'vrd-fade-in 0.25s ease forwards',
  };

  const orbContainer: CSSProperties = {
    position: 'relative',
    width: 'clamp(170px, 30vh, 260px)',
    height: 'clamp(170px, 30vh, 260px)',
    flexShrink: 0,
  };

  const callBtn: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    height: 48,
    padding: '0 28px',
    borderRadius: 14,
    border: 'none',
    cursor: isConnecting ? 'wait' : 'pointer',
    fontFamily: 'inherit',
    fontSize: 14.5,
    fontWeight: 600,
    letterSpacing: '-0.01em',
    transition: 'all 0.18s ease',
  };

  return (
    <div style={overlay} role="dialog" aria-modal="true" aria-label="Aria Voice Receptionist Demo">
      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* VIEW A: FULL-SCREEN IMMERSIVE VOICE CALL VIEW                       */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {!extractedLead && (
        <>
          {/* Top Bar Navigation (Always in normal document flow at the top) */}
          <div style={{
            width: '100%',
            maxWidth: 960,
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
            zIndex: 20,
            marginBottom: 10,
          }}>
            {/* Status Pill */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 14px',
              borderRadius: 20,
              background: 'rgba(255,255,255,0.06)',
              border: `1px solid ${C.border}`,
              fontSize: 12.5,
              color: C.text,
              fontWeight: 500,
            }}>
              <span style={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                background: isConnected ? C.accent : isConnecting ? '#F59E0B' : isError ? C.danger : C.muted,
                boxShadow: isConnected ? `0 0 8px ${C.accent}` : 'none',
              }} />
              {isConnected
                ? `Live Call · ${formatTime(elapsedSeconds)}`
                : isConnecting
                ? 'Initializing Aria…'
                : isExtracting
                ? 'Structuring Voice Intelligence…'
                : 'AI Voice Receptionist'}
            </div>

            {/* Close Button */}
            <button
              className="vrd-close"
              onClick={handleClose}
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.06)',
                border: `1px solid ${C.border}`,
                color: C.muted,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.15s ease',
              }}
              aria-label="Close demo"
            >
              <X size={17} />
            </button>
          </div>

          {/* Center Call Content (Naturally centered using margin: auto) */}
          <div style={{
            margin: 'auto',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 'clamp(12px, 2vh, 18px)',
            maxWidth: 460,
            width: '100%',
            animation: 'vrd-slide-up 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards',
            padding: '6px 0',
            boxSizing: 'border-box',
          }}>
            {/* Header Titles */}
            <div style={{ textAlign: 'center' }}>
              <h2 style={{ fontSize: 'clamp(19px, 3.5vw, 23px)', fontWeight: 700, color: C.text, margin: 0, letterSpacing: '-0.02em' }}>
                Aria · Autonomous Voice Agent
              </h2>
              <p style={{ fontSize: 13, color: C.muted, marginTop: 4, marginBottom: 0 }}>
                High-precision voice assistant for qualification and booking.
              </p>
            </div>

            {/* Orb Visualizer */}
            {!isExtracting && (
              <div style={orbContainer}>
                <VoicePoweredOrb
                  enableVoiceControl={isConnected}
                  voiceSensitivity={1.8}
                  externalAudioLevel={audioLevel}
                />
              </div>
            )}

            {/* Extraction Loader */}
            {isExtracting && (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '36px 20px',
                textAlign: 'center',
                gap: 14,
              }}>
                <Loader2 size={34} color={C.accent} style={{ animation: 'vrd-spin 1s linear infinite' }} />
                <div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: C.text }}>
                    Extracting Structured Intelligence…
                  </div>
                  <div style={{ fontSize: 12.5, color: C.muted, marginTop: 4 }}>
                    Parsing business parameters and qualifying the conversation.
                  </div>
                </div>
              </div>
            )}

            {/* Live Real-time Subtitle & Transcription Stream */}
            {!isExtracting && (
              <div style={{
                minHeight: 48,
                width: '100%',
                maxWidth: 420,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                padding: '0 4px',
              }}>
                {/* User Live Speech Subtitle */}
                {isConnected && (activeSpeaker === 'user' || isUserSpeaking) && (
                  <div style={{
                    background: 'rgba(22, 199, 132, 0.08)',
                    border: '1px solid rgba(22, 199, 132, 0.25)',
                    borderRadius: 12,
                    padding: '8px 14px',
                    width: '100%',
                    boxSizing: 'border-box',
                    animation: 'vrd-transcript-in 0.2s ease forwards',
                    textAlign: 'left',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                      <span style={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        background: C.accent,
                        boxShadow: `0 0 6px ${C.accent}`,
                      }} />
                      <span style={{ fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: C.accent }}>
                        {isUserSpeaking ? 'You (Speaking…)' : 'You'}
                      </span>
                    </div>
                    <p style={{ fontSize: 13, color: '#FFFFFF', lineHeight: 1.45, margin: 0 }}>
                      {userTranscript ? `"${userTranscript}"` : 'Listening to your speech…'}
                    </p>
                  </div>
                )}

                {/* Aria Speech Subtitle */}
                {isConnected && (activeSpeaker === 'assistant' || isAgentSpeaking || (activeSpeaker === 'idle' && agentTranscript)) && (
                  <div style={{
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: `1px solid ${C.border}`,
                    borderRadius: 12,
                    padding: '8px 14px',
                    width: '100%',
                    boxSizing: 'border-box',
                    animation: 'vrd-transcript-in 0.2s ease forwards',
                    textAlign: 'left',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.accent }} />
                      <span style={{ fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: C.muted }}>
                        {isAgentSpeaking ? 'Aria (Speaking…)' : 'Aria'}
                      </span>
                    </div>
                    <p style={{ fontSize: 13, color: '#FFFFFF', lineHeight: 1.45, margin: 0 }}>
                      "{agentTranscript || AGENT_GREETING}"
                    </p>
                  </div>
                )}

                {/* Connecting state */}
                {isConnecting && (
                  <p style={{ fontSize: 12.5, color: C.muted, margin: 0 }}>
                    Connecting to voice infrastructure…
                  </p>
                )}

                {/* Idle initial state */}
                {status === 'idle' && !micConsented && (
                  <p style={{ fontSize: 12.5, color: C.muted, margin: 0 }}>
                    Experience real-time two-way voice qualification.
                  </p>
                )}

                {/* Connected initial idle state */}
                {isConnected && !userTranscript && !agentTranscript && (
                  <p style={{ fontSize: 12.5, color: C.muted, margin: 0 }}>
                    Speak into your microphone to talk to Aria…
                  </p>
                )}
              </div>
            )}

            {/* Microphone Permission Card */}
            {!isExtracting && micConsented && status === 'idle' && !showTimeoutMessage && (
              <div style={{
                background: C.accentBg,
                border: `1px solid ${C.accentBorder}`,
                borderRadius: 14,
                padding: '14px 18px',
                maxWidth: 380,
                width: '100%',
                textAlign: 'center',
                boxSizing: 'border-box',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 6 }}>
                  <ShieldCheck size={16} color={C.accent} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: C.accent }}>Microphone Required</span>
                </div>
                <p style={{ fontSize: 12, color: C.muted, lineHeight: 1.5, marginBottom: 12 }}>
                  Streams real-time audio to Deepgram for voice processing. Audio is never stored.
                </p>
                <button
                  className="vrd-btn"
                  onClick={() => connect()}
                  style={{
                    ...callBtn,
                    background: `linear-gradient(135deg, ${C.accent}, ${C.accentDk})`,
                    color: C.ink,
                    width: '100%',
                    height: 44,
                    fontSize: 13.5,
                    boxShadow: `0 4px 18px rgba(22, 199, 132, 0.35)`,
                  }}
                >
                  <Phone size={15} />
                  Allow &amp; Start Call
                </button>
              </div>
            )}

            {/* Action Buttons */}
            {!isExtracting && !(micConsented && status === 'idle' && !showTimeoutMessage) && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, width: '100%' }}>
                {isError && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: C.danger, fontSize: 12.5, marginBottom: 2 }}>
                    <AlertCircle size={15} />
                    {error || 'Call disconnected unexpectedly'}
                  </div>
                )}

                <button
                  className="vrd-btn"
                  onClick={handleToggleCall}
                  disabled={isConnecting}
                  style={{
                    ...callBtn,
                    background: isConnected
                      ? `linear-gradient(135deg, ${C.danger}, ${C.dangerDk})`
                      : `linear-gradient(135deg, ${C.accent}, ${C.accentDk})`,
                    color: isConnected ? '#FFFFFF' : C.ink,
                    boxShadow: isConnected
                      ? `0 4px 20px rgba(226, 75, 74, 0.35)`
                      : `0 4px 20px rgba(22, 199, 132, 0.35)`,
                    opacity: isConnecting ? 0.7 : 1,
                  }}
                >
                  {isConnecting ? (
                    <>
                      <Loader2 size={16} style={{ animation: 'vrd-spin 1s linear infinite' }} />
                      Connecting…
                    </>
                  ) : isConnected ? (
                    <>
                      <PhoneOff size={16} />
                      End Call &amp; View Summary
                    </>
                  ) : (
                    <>
                      <Phone size={16} />
                      Start Voice Demo
                    </>
                  )}
                </button>

                {isConnected && (
                  <span style={{ fontSize: 11.5, color: getRemainingColor(elapsedSeconds), fontWeight: 500 }}>
                    {formatTime(remaining)} remaining in demo
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Footer Subtext */}
          <div style={{
            width: '100%',
            textAlign: 'center',
            fontSize: 11,
            color: 'rgba(255,255,255,0.25)',
            letterSpacing: '0.04em',
            flexShrink: 0,
            marginTop: 'auto',
            paddingTop: 8,
          }}>
            MyTaskEngine · Autonomous AI Infrastructure
          </div>
        </>
      )}

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* VIEW B: POST-CALL INTELLIGENCE EXTRACTOR SHOWCASE                   */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {extractedLead && (
        <div style={{
          margin: 'auto',
          display: 'flex',
          flexDirection: 'column',
          maxWidth: 640,
          width: '100%',
          maxHeight: 'min(88vh, calc(100dvh - 36px))',
          background: C.cardBg,
          border: `1px solid ${C.border}`,
          borderRadius: 20,
          boxShadow: '0 24px 72px rgba(0, 0, 0, 0.85), 0 0 0 1px rgba(255, 255, 255, 0.04)',
          overflow: 'hidden',
          animation: 'vrd-slide-up 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards',
          boxSizing: 'border-box',
          position: 'relative',
          zIndex: 1,
        }}>
          {/* Showcase Card Header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 20px',
            borderBottom: `1px solid ${C.border}`,
            background: 'rgba(255, 255, 255, 0.02)',
            flexShrink: 0,
          }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 11,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: C.accent,
              background: C.accentBg,
              border: `1px solid ${C.accentBorder}`,
              padding: '3px 9px',
              borderRadius: 6,
            }}>
              <Cpu size={12} /> Real-Time Voice Intelligence
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{
                fontSize: 11,
                fontWeight: 600,
                color: extractedLead.leadScore === 'High Priority' ? C.accent : '#F59E0B',
                background: extractedLead.leadScore === 'High Priority' ? C.accentBg : 'rgba(245, 158, 11, 0.08)',
                border: `1px solid ${extractedLead.leadScore === 'High Priority' ? C.accentBorder : 'rgba(245, 158, 11, 0.25)'}`,
                padding: '3px 8px',
                borderRadius: 6,
                whiteSpace: 'nowrap',
              }}>
                {extractedLead.leadScore}
              </span>

              <button
                className="vrd-close"
                onClick={handleClose}
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.06)',
                  border: `1px solid ${C.border}`,
                  color: C.muted,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.15s ease',
                }}
                aria-label="Close demo"
              >
                <X size={15} />
              </button>
            </div>
          </div>

          {/* Showcase Scrollable Content */}
          <div className="vrd-scroll" style={{
            flex: 1,
            overflowY: 'auto',
            padding: '18px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            boxSizing: 'border-box',
          }}>
            <div>
              <h3 style={{ fontSize: 'clamp(16px, 3.5vw, 18px)', fontWeight: 700, color: C.text, margin: 0, letterSpacing: '-0.02em' }}>
                Structured Data Extracted in Real Time
              </h3>
              <p style={{ fontSize: 12.5, color: C.muted, margin: '3px 0 0', lineHeight: 1.45 }}>
                Aria captured, qualified, and structured these parameters directly from your spoken conversation.
              </p>
            </div>

            {/* Data Grid: Contact & Industry */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
              <div style={{ background: C.tileBg, border: `1px solid ${C.border}`, borderRadius: 10, padding: '12px 14px' }}>
                <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', color: C.subtle, letterSpacing: '0.04em' }}>
                  Contact Identification
                </div>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: C.text, marginTop: 4 }}>
                  {extractedLead.name || 'Visitor (Name not stated)'}
                </div>
                <div style={{ fontSize: 12, color: extractedLead.email ? C.accent : C.muted, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {extractedLead.email || extractedLead.phone || 'Contact not provided'}
                </div>
              </div>

              <div style={{ background: C.tileBg, border: `1px solid ${C.border}`, borderRadius: 10, padding: '12px 14px' }}>
                <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', color: C.subtle, letterSpacing: '0.04em' }}>
                  Target Industry
                </div>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: extractedLead.businessType ? C.text : C.muted, marginTop: 4 }}>
                  {extractedLead.businessType || 'General Inbound (Industry not stated)'}
                </div>
                <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>
                  {extractedLead.volumeOrScale || 'Scale not specified'}
                </div>
              </div>
            </div>

            {/* Identified Bottleneck */}
            <div style={{ background: C.tileBg, border: `1px solid ${C.border}`, borderRadius: 10, padding: '12px 14px' }}>
              <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', color: C.subtle, letterSpacing: '0.04em' }}>
                Identified Operational Bottleneck
              </div>
              <div style={{ fontSize: 13, color: extractedLead.primaryBottleneck ? '#E5E7EB' : C.muted, lineHeight: 1.45, marginTop: 4 }}>
                {extractedLead.primaryBottleneck || 'No operational bottlenecks specified during conversation.'}
              </div>
            </div>

            {/* Recommended Architecture */}
            <div style={{ background: 'rgba(22, 199, 132, 0.04)', border: `1px solid ${C.accentBorder}`, borderRadius: 10, padding: '12px 14px' }}>
              <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', color: C.accent, letterSpacing: '0.04em' }}>
                Recommended Architecture
              </div>
              <div style={{ fontSize: 13.5, fontWeight: 600, color: C.text, marginTop: 3 }}>
                {extractedLead.recommendedSolution}
              </div>
              <div style={{ fontSize: 12, color: C.muted, marginTop: 3, lineHeight: 1.45 }}>
                {extractedLead.executiveSummary}
              </div>
            </div>

            {/* Delivery Status Card & Email Dispatch */}
            {(extractedLead.email || emailSubmitted) ? (
              <div style={{
                background: 'rgba(22, 199, 132, 0.06)',
                border: `1px solid ${C.accentBorder}`,
                borderRadius: 10,
                padding: '12px 14px',
                display: 'flex',
                flexDirection: 'column',
                gap: 6,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: C.accent, fontSize: 12.5, fontWeight: 700 }}>
                  <CheckCircle2 size={15} />
                  Roadmap Dispatched to Email
                </div>
                <div style={{ fontSize: 12, color: C.text, lineHeight: 1.45 }}>
                  Your custom AI implementation roadmap and workflow specifications have been queued for delivery to:
                  <div style={{ fontWeight: 600, color: C.accent, marginTop: 2, wordBreak: 'break-all' }}>
                    {manualEmail || extractedLead.email}
                  </div>
                </div>

                {!showSecondaryForm && !secondarySubmitted && (
                  <button
                    onClick={() => setShowSecondaryForm(true)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: C.muted,
                      fontSize: 11,
                      fontWeight: 600,
                      cursor: 'pointer',
                      padding: '4px 0 0',
                      textAlign: 'left',
                      textDecoration: 'underline',
                    }}
                  >
                    + Send copy to another email
                  </button>
                )}

                {showSecondaryForm && !secondarySubmitted && (
                  <form onSubmit={handleSecondaryEmailSubmit} style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                    <input
                      type="email"
                      required
                      placeholder="Enter secondary email address…"
                      value={secondaryEmail}
                      onChange={e => setSecondaryEmail(e.target.value)}
                      style={{
                        flex: 1,
                        background: 'rgba(255,255,255,0.06)',
                        border: `1px solid ${C.border}`,
                        borderRadius: 7,
                        padding: '6px 10px',
                        fontSize: 11.5,
                        color: C.text,
                        outline: 'none',
                      }}
                    />
                    <button
                      type="submit"
                      style={{
                        background: C.accent,
                        color: C.ink,
                        border: 'none',
                        borderRadius: 7,
                        padding: '6px 12px',
                        fontSize: 11.5,
                        fontWeight: 700,
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      Send Copy
                    </button>
                  </form>
                )}

                {secondarySubmitted && (
                  <div style={{ fontSize: 11, color: C.accent, marginTop: 2 }}>
                    ✓ Additional copy queued for {secondaryEmail}.
                  </div>
                )}
              </div>
            ) : (
              /* Missing Email Form */
              <form onSubmit={handleManualEmailSubmit} style={{
                background: 'rgba(255,255,255,0.02)',
                border: `1px dashed ${C.border}`,
                borderRadius: 10,
                padding: '10px 12px',
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
              }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: C.accent }}>
                  Receive Your Full Architecture Roadmap
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <input
                    type="email"
                    required
                    placeholder="Enter email to receive custom AI roadmap…"
                    value={manualEmail}
                    onChange={(e) => setManualEmail(e.target.value)}
                    style={{
                      flex: 1,
                      background: 'rgba(255,255,255,0.06)',
                      border: `1px solid ${C.border}`,
                      borderRadius: 7,
                      padding: '7px 10px',
                      fontSize: 12,
                      color: C.text,
                      outline: 'none',
                      fontFamily: 'inherit',
                    }}
                  />
                  <button
                    type="submit"
                    style={{
                      background: `linear-gradient(135deg, ${C.accent}, ${C.accentDk})`,
                      color: C.ink,
                      border: 'none',
                      borderRadius: 7,
                      padding: '7px 14px',
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 5,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <Send size={12} />
                    Send Roadmap
                  </button>
                </div>
              </form>
            )}

            {/* Capability Demonstration Notice */}
            <div style={{
              fontSize: 11,
              color: C.muted,
              lineHeight: 1.5,
              borderTop: `1px solid ${C.border}`,
              paddingTop: 10,
            }}>
              <strong style={{ color: C.text, fontWeight: 600 }}>Capability Demonstration:</strong> This exact conversational intelligence pipeline can be deployed on your phone lines, website, or messaging channels to capture and qualify demand 24/7 without forms.
            </div>

            {/* Actions Footer Bar */}
            <div className="vrd-actions" style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              justifyContent: 'flex-end',
              paddingTop: 4,
            }}>
              <button
                onClick={() => {
                  setExtractedLead(null);
                  setShowTimeoutMessage(false);
                  connect();
                }}
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: `1px solid ${C.border}`,
                  color: C.text,
                  padding: '9px 16px',
                  borderRadius: 8,
                  fontSize: 12.5,
                  fontWeight: 500,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <RotateCcw size={13} />
                Test Another Scenario
              </button>

              <button
                className="vrd-cal-btn"
                data-cal-link="mytaskengine/30min"
                data-cal-namespace="30min"
                data-cal-config='{"layout":"month_view"}'
                style={{
                  background: `linear-gradient(135deg, ${C.accent}, ${C.accentDk})`,
                  color: C.ink,
                  border: 'none',
                  padding: '9px 18px',
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  boxShadow: `0 4px 14px rgba(22, 199, 132, 0.25)`,
                  transition: 'all 0.2s ease',
                }}
              >
                <Calendar size={14} />
                Book Free 30-Min AI Audit
                <ArrowRight size={13} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
