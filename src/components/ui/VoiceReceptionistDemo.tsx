'use client';

import React, { useState, useEffect, useCallback, CSSProperties } from 'react';
import { X, Phone, PhoneOff, Loader2, AlertCircle, RotateCcw, CheckCircle2, ArrowRight, ShieldCheck, Cpu, Calendar, Send, Sparkles } from 'lucide-react';
import { VoicePoweredOrb } from '@/components/ui/voice-powered-orb';
import { useDeepgramAgent, ConversationTurn } from '@/lib/use-deepgram-agent';
import { AGENT_GREETING, MAX_CALL_DURATION_SECONDS } from '@/lib/deepgram-agent-config';
import { ExtractedLeadData } from '@/app/api/leads/extract/route';

/* ─── Scoped keyframes ─────────────────────────────────────────────────────── */
const STYLES = `
  @keyframes vrd-fade-in {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes vrd-slide-up {
    from { opacity: 0; transform: translateY(28px) scale(0.97); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }
  @keyframes vrd-pulse-ring {
    0%   { transform: scale(1);   opacity: 0.3; }
    50%  { transform: scale(1.15); opacity: 0.08; }
    100% { transform: scale(1);   opacity: 0.3; }
  }
  @keyframes vrd-spin {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }
  @keyframes vrd-transcript-in {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .vrd-close:hover { background: rgba(255,255,255,0.1) !important; }
  .vrd-btn:hover { transform: translateY(-2px) !important; }
  .vrd-btn:active { transform: translateY(0) scale(0.97) !important; }
  .vrd-cal-btn:hover {
    filter: brightness(1.12);
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(22, 199, 132, 0.35) !important;
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
  bg: '#0D1117',
  bgOverlay: 'rgba(13, 17, 23, 0.94)',
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
  cardBg: 'rgba(255, 255, 255, 0.03)',
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
  const [sessionId] = useState(() => `voice_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`);

  const handleCallTimeout = useCallback(() => {
    setShowTimeoutMessage(true);
  }, []);

  const {
    status,
    connect,
    disconnect,
    audioLevel,
    transcript,
    agentTranscript,
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
      // 1. Extract structured lead data from transcript
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

          // 2. Submit to central lead capture route (Option A)
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

  if (!open) return null;

  const isConnected = status === 'connected';
  const isConnecting = status === 'connecting';
  const isError = status === 'error';
  const remaining = MAX_CALL_DURATION_SECONDS - elapsedSeconds;
  const displayTranscript = agentTranscript || transcript;

  /* ── Styles ── */
  const overlay: CSSProperties = {
    position: 'fixed',
    inset: 0,
    zIndex: 10000,
    background: C.bgOverlay,
    backdropFilter: 'blur(28px)',
    WebkitBackdropFilter: 'blur(28px)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    animation: 'vrd-fade-in 0.3s ease forwards',
    fontFamily: 'inherit',
    overflowY: 'auto',
    padding: '24px 16px',
  };

  const modalContainer: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    maxWidth: extractedLead ? 680 : 480,
    width: '100%',
    animation: 'vrd-slide-up 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
    position: 'relative',
    zIndex: 1,
  };

  const orbContainer: CSSProperties = {
    position: 'relative',
    width: 'min(300px, 65vw)',
    height: 'min(300px, 65vw)',
  };

  const callBtn: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    height: 52,
    padding: '0 32px',
    borderRadius: 14,
    border: 'none',
    cursor: isConnecting ? 'wait' : 'pointer',
    fontFamily: 'inherit',
    fontSize: 15,
    fontWeight: 600,
    letterSpacing: '-0.01em',
    transition: 'transform 0.18s ease, box-shadow 0.18s ease, filter 0.18s ease',
  };

  return (
    <div style={overlay} role="dialog" aria-modal="true" aria-label="Aria Voice Receptionist Demo">
      {/* ── Top Bar ── */}
      <div style={{
        position: 'absolute',
        top: 24,
        left: 24,
        right: 24,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        zIndex: 2,
      }}>
        {/* Status Badge */}
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
            ? 'Structuring Real-Time Intelligence…'
            : extractedLead
            ? 'Voice Intelligence Summary'
            : 'AI Voice Receptionist'}
        </div>

        {/* Close Button */}
        <button
          className="vrd-close"
          onClick={handleClose}
          style={{
            width: 38,
            height: 38,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.06)',
            border: `1px solid ${C.border}`,
            color: C.muted,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background 0.15s ease',
          }}
          aria-label="Close demo"
        >
          <X size={18} />
        </button>
      </div>

      <div style={modalContainer}>
        {/* ─────────────────────────────────────────────────────────────────── */}
        {/* VIEW 1: LIVE CONVERSATION & CALL STATE                              */}
        {/* ─────────────────────────────────────────────────────────────────── */}
        {!extractedLead && !isExtracting && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24, width: '100%' }}>
            {/* Header */}
            <div style={{ textAlign: 'center' }}>
              <h2 style={{ fontSize: 22, fontWeight: 700, color: C.text, margin: 0, letterSpacing: '-0.02em' }}>
                Aria · Autonomous Voice Agent
              </h2>
              <p style={{ fontSize: 13.5, color: C.muted, marginTop: 6, marginBottom: 0 }}>
                High-precision voice assistant for qualification and booking.
              </p>
            </div>

            {/* Orb Visualizer */}
            <div style={orbContainer}>
              <VoicePoweredOrb
                enableVoiceControl={isConnected}
                voiceSensitivity={1.8}
                externalAudioLevel={audioLevel}
              />
            </div>

            {/* Live Transcript / Subtitle Box */}
            <div style={{
              minHeight: 52,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              padding: '0 16px',
              maxWidth: 420,
            }}>
              {isConnected && displayTranscript && (
                <p style={{
                  fontSize: 14,
                  color: agentTranscript ? C.text : C.muted,
                  lineHeight: 1.55,
                  margin: 0,
                  animation: 'vrd-transcript-in 0.25s ease forwards',
                }}>
                  {agentTranscript ? `"${displayTranscript}"` : `You: "${displayTranscript}"`}
                </p>
              )}

              {isConnecting && (
                <p style={{ fontSize: 13, color: C.muted, margin: 0 }}>
                  Connecting to real-time voice infrastructure…
                </p>
              )}

              {status === 'idle' && !micConsented && (
                <p style={{ fontSize: 13, color: C.muted, margin: 0 }}>
                  Experience human-like voice qualification with sub-second latency.
                </p>
              )}
            </div>

            {/* Microphone Permission Card */}
            {micConsented && status === 'idle' && !showTimeoutMessage && (
              <div style={{
                background: C.accentBg,
                border: `1px solid ${C.accentBorder}`,
                borderRadius: 14,
                padding: '18px 20px',
                maxWidth: 380,
                width: '100%',
                textAlign: 'center',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 8 }}>
                  <ShieldCheck size={16} color={C.accent} />
                  <span style={{ fontSize: 13.5, fontWeight: 600, color: C.accent }}>Microphone Required</span>
                </div>
                <p style={{ fontSize: 12.5, color: C.muted, lineHeight: 1.6, marginBottom: 16 }}>
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
                    boxShadow: `0 4px 20px rgba(22, 199, 132, 0.35)`,
                  }}
                >
                  <Phone size={16} />
                  Allow &amp; Start Call
                </button>
              </div>
            )}

            {/* Action Buttons */}
            {!(micConsented && status === 'idle' && !showTimeoutMessage) && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, width: '100%' }}>
                {isError && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: C.danger, fontSize: 13, marginBottom: 4 }}>
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
                      <Loader2 size={17} style={{ animation: 'vrd-spin 1s linear infinite' }} />
                      Connecting…
                    </>
                  ) : isConnected ? (
                    <>
                      <PhoneOff size={17} />
                      End Call &amp; View Summary
                    </>
                  ) : (
                    <>
                      <Phone size={17} />
                      Start Voice Demo
                    </>
                  )}
                </button>

                {isConnected && (
                  <span style={{ fontSize: 12, color: getRemainingColor(elapsedSeconds), fontWeight: 500 }}>
                    {remaining}s remaining in demo
                  </span>
                )}
              </div>
            )}
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────────── */}
        {/* VIEW 2: EXTRACTION IN PROGRESS                                      */}
        {/* ─────────────────────────────────────────────────────────────────── */}
        {isExtracting && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '48px 24px',
            textAlign: 'center',
            gap: 16,
          }}>
            <Loader2 size={32} color={C.accent} style={{ animation: 'vrd-spin 1s linear infinite' }} />
            <div>
              <div style={{ fontSize: 16, fontWeight: 600, color: C.text }}>
                Extracting Structured Intelligence…
              </div>
              <div style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>
                Parsing business parameters, qualification metrics, and recommended architecture.
              </div>
            </div>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────────── */}
        {/* VIEW 3: LIVE AI DATA CAPTURE SHOWCASE (THE CAPABILITIES FLEX)       */}
        {/* ─────────────────────────────────────────────────────────────────── */}
        {extractedLead && !isExtracting && (
          <div style={{
            width: '100%',
            background: 'rgba(255, 255, 255, 0.02)',
            border: `1px solid ${C.border}`,
            borderRadius: 20,
            padding: '24px 24px 20px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
            boxSizing: 'border-box',
          }}>
            {/* Showcase Header Banner */}
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              paddingBottom: 16,
              borderBottom: `1px solid ${C.border}`,
              marginBottom: 20,
              gap: 16,
            }}>
              <div>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: C.accent,
                  background: C.accentBg,
                  border: `1px solid ${C.accentBorder}`,
                  padding: '3px 9px',
                  borderRadius: 6,
                  marginBottom: 8,
                }}>
                  <Cpu size={12} /> Real-Time Voice Intelligence
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: C.text, margin: 0, letterSpacing: '-0.02em' }}>
                  Structured Data Extracted in Real Time
                </h3>
                <p style={{ fontSize: 12.5, color: C.muted, margin: '4px 0 0', lineHeight: 1.5 }}>
                  Aria captured, qualified, and structured these parameters directly from your spoken conversation.
                </p>
              </div>

              <span style={{
                fontSize: 11,
                fontWeight: 600,
                color: extractedLead.leadScore === 'High Priority' ? C.accent : '#F59E0B',
                background: extractedLead.leadScore === 'High Priority' ? C.accentBg : 'rgba(245, 158, 11, 0.08)',
                border: `1px solid ${extractedLead.leadScore === 'High Priority' ? C.accentBorder : 'rgba(245, 158, 11, 0.25)'}`,
                padding: '4px 10px',
                borderRadius: 8,
                whiteSpace: 'nowrap',
              }}>
                {extractedLead.leadScore}
              </span>
            </div>

            {/* Structured Data Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 12, marginBottom: 16 }}>
              {/* Prospect Profile */}
              <div style={{
                background: C.cardBg,
                border: `1px solid ${C.border}`,
                borderRadius: 12,
                padding: '14px 16px',
              }}>
                <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', color: C.subtle, letterSpacing: '0.04em', marginBottom: 8 }}>
                  Contact Identification
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 2 }}>
                  {extractedLead.name || 'Visitor (Name not stated)'}
                </div>
                <div style={{ fontSize: 12.5, color: extractedLead.email ? C.accent : C.muted }}>
                  {extractedLead.email || extractedLead.phone || 'Contact not provided'}
                </div>
              </div>

              {/* Business Profile */}
              <div style={{
                background: C.cardBg,
                border: `1px solid ${C.border}`,
                borderRadius: 12,
                padding: '14px 16px',
              }}>
                <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', color: C.subtle, letterSpacing: '0.04em', marginBottom: 8 }}>
                  Target Industry
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 2 }}>
                  {extractedLead.businessType}
                </div>
                <div style={{ fontSize: 12.5, color: C.muted }}>
                  {extractedLead.volumeOrScale}
                </div>
              </div>
            </div>

            {/* Identified Bottleneck */}
            <div style={{
              background: C.cardBg,
              border: `1px solid ${C.border}`,
              borderRadius: 12,
              padding: '14px 16px',
              marginBottom: 12,
            }}>
              <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', color: C.subtle, letterSpacing: '0.04em', marginBottom: 6 }}>
                Identified Operational Bottleneck
              </div>
              <div style={{ fontSize: 13, color: '#E5E7EB', lineHeight: 1.5 }}>
                {extractedLead.primaryBottleneck}
              </div>
            </div>

            {/* Recommended AI Architecture */}
            <div style={{
              background: 'rgba(22, 199, 132, 0.04)',
              border: `1px solid ${C.accentBorder}`,
              borderRadius: 12,
              padding: '14px 16px',
              marginBottom: 16,
            }}>
              <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', color: C.accent, letterSpacing: '0.04em', marginBottom: 6 }}>
                Recommended Architecture
              </div>
              <div style={{ fontSize: 13.5, fontWeight: 600, color: C.text, lineHeight: 1.4 }}>
                {extractedLead.recommendedSolution}
              </div>
              <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>
                {extractedLead.executiveSummary}
              </div>
            </div>

            {/* Missing Email Recovery Form */}
            {!extractedLead.email && !emailSubmitted && (
              <form onSubmit={handleManualEmailSubmit} style={{
                background: 'rgba(255,255,255,0.03)',
                border: `1px dashed ${C.border}`,
                borderRadius: 12,
                padding: '12px 14px',
                marginBottom: 16,
                display: 'flex',
                alignItems: 'center',
                gap: 10,
              }}>
                <input
                  type="email"
                  required
                  placeholder="Enter email to receive custom AI roadmap…"
                  value={manualEmail}
                  onChange={(e) => setManualEmail(e.target.value)}
                  style={{
                    flex: 1,
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    fontSize: 13,
                    color: C.text,
                    fontFamily: 'inherit',
                  }}
                />
                <button
                  type="submit"
                  style={{
                    background: `linear-gradient(135deg, ${C.accent}, ${C.accentDk})`,
                    color: C.ink,
                    border: 'none',
                    borderRadius: 8,
                    padding: '8px 14px',
                    fontSize: 12.5,
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    whiteSpace: 'nowrap',
                  }}
                >
                  <Send size={13} />
                  Send Roadmap
                </button>
              </form>
            )}

            {emailSubmitted && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                fontSize: 12.5,
                color: C.accent,
                background: C.accentBg,
                padding: '10px 14px',
                borderRadius: 10,
                marginBottom: 16,
              }}>
                <CheckCircle2 size={15} />
                Implementation roadmap queued for delivery to {manualEmail}.
              </div>
            )}

            {/* Enterprise Capability Callout */}
            <div style={{
              fontSize: 11.5,
              color: C.muted,
              lineHeight: 1.6,
              borderTop: `1px solid ${C.border}`,
              paddingTop: 14,
              marginBottom: 16,
            }}>
              <strong style={{ color: C.text, fontWeight: 600 }}>Capability Demonstration:</strong> This exact conversational intelligence pipeline can be deployed on your phone lines, website, or messaging channels to capture and qualify demand 24/7 without forms.
            </div>

            {/* Action Bar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
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
                  padding: '10px 18px',
                  borderRadius: 10,
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <RotateCcw size={14} />
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
                  padding: '10px 22px',
                  borderRadius: 10,
                  fontSize: 13.5,
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  boxShadow: `0 4px 16px rgba(22, 199, 132, 0.25)`,
                  transition: 'all 0.2s ease',
                }}
              >
                <Calendar size={15} />
                Book Free 30-Min AI Audit
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Ambient background glow */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: `radial-gradient(ellipse at 50% 40%, rgba(22, 199, 132, 0.05) 0%, transparent 60%)`,
        pointerEvents: 'none',
        zIndex: 0,
      }} />
    </div>
  );
}
