'use client';

import React, { useState, useEffect, useCallback, CSSProperties } from 'react';
import { X, Phone, PhoneOff, Loader2, AlertCircle, RotateCcw } from 'lucide-react';
import { VoicePoweredOrb } from '@/components/ui/voice-powered-orb';
import { useDeepgramAgent } from '@/lib/use-deepgram-agent';
import { AGENT_GREETING, MAX_CALL_DURATION_SECONDS } from '@/lib/deepgram-agent-config';

/* ─── Scoped keyframes ─────────────────────────────────────────────────────── */
const STYLES = `
  @keyframes vrd-fade-in {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes vrd-slide-up {
    from { opacity: 0; transform: translateY(32px) scale(0.96); }
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
`;

/* ─── Style injection ──────────────────────────────────────────────────────── */
function useInjectStyles() {
  useEffect(() => {
    if (document.getElementById('vrd-styles')) return;
    const tag = document.createElement('style');
    tag.id = 'vrd-styles';
    tag.textContent = STYLES;
    document.head.appendChild(tag);
  }, []);
}

/* ─── Design tokens (matching site brand) ──────────────────────────────────── */
const C = {
  bg: '#0D1117',
  bgOverlay: 'rgba(13, 17, 23, 0.92)',
  text: '#FFFFFF',
  muted: '#6B7280',
  subtle: 'rgba(255,255,255,0.4)',
  accent: '#16C784',
  accentDk: '#13B371',
  danger: '#E24B4A',
  dangerDk: '#C93C3B',
  border: 'rgba(255,255,255,0.08)',
  ink: '#0D1117',
} as const;

/* ─── Timer display ────────────────────────────────────────────────────────── */
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

/* ─── Main component ──────────────────────────────────────────────────────── */
interface VoiceReceptionistDemoProps {
  open: boolean;
  onClose: () => void;
}

export default function VoiceReceptionistDemo({ open, onClose }: VoiceReceptionistDemoProps) {
  useInjectStyles();

  const [showTimeoutMessage, setShowTimeoutMessage] = useState(false);
  const [micConsented, setMicConsented] = useState(false);

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
    error,
    elapsedSeconds,
  } = useDeepgramAgent({
    onCallTimeout: handleCallTimeout,
  });

  // Lock body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  // Reset consent when demo closes so it re-shows on next open
  const handleClose = useCallback(() => {
    disconnect();
    setShowTimeoutMessage(false);
    setMicConsented(false);
    onClose();
  }, [disconnect, onClose]);

  // Start / stop call
  const handleToggleCall = useCallback(() => {
    if (status === 'connected') {
      disconnect();
    } else if (status === 'idle' || status === 'error') {
      setShowTimeoutMessage(false);
      if (!micConsented) {
        // Show disclosure first — browser permission fires on next click
        setMicConsented(true);
        return;
      }
      connect();
    }
  }, [status, connect, disconnect, micConsented]);

  // Retry after error
  const handleRetry = useCallback(() => {
    setShowTimeoutMessage(false);
    connect();
  }, [connect]);

  if (!open) return null;

  const isConnected = status === 'connected';
  const isConnecting = status === 'connecting';
  const isError = status === 'error';
  const remaining = MAX_CALL_DURATION_SECONDS - elapsedSeconds;

  // Determine which transcript to show
  const displayTranscript = agentTranscript || transcript;
  const showGreeting = status === 'idle' && !displayTranscript;

  /* ── Styles ── */
  const overlay: CSSProperties = {
    position: 'fixed',
    inset: 0,
    zIndex: 10000,
    background: C.bgOverlay,
    backdropFilter: 'blur(24px)',
    WebkitBackdropFilter: 'blur(24px)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    animation: 'vrd-fade-in 0.3s ease forwards',
    fontFamily: 'var(--font-body)',
  };

  const contentWrap: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 28,
    maxWidth: 480,
    width: '100%',
    padding: '0 24px',
    animation: 'vrd-slide-up 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) 0.1s forwards',
    opacity: 0,
  };

  const orbContainer: CSSProperties = {
    position: 'relative',
    width: 'min(320px, 70vw)',
    height: 'min(320px, 70vw)',
  };

  const callBtn: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    height: 52,
    padding: '0 32px',
    borderRadius: 16,
    border: 'none',
    cursor: isConnecting ? 'wait' : 'pointer',
    fontFamily: 'inherit',
    fontSize: 15,
    fontWeight: 600,
    transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
    ...(isConnected
      ? {
          background: C.danger,
          color: C.text,
          boxShadow: `0 4px 20px rgba(226, 75, 74, 0.35)`,
        }
      : {
          background: `linear-gradient(135deg, ${C.accent}, ${C.accentDk})`,
          color: C.ink,
          boxShadow: `0 4px 20px rgba(22, 199, 132, 0.35)`,
        }),
  };

  return (
    <div style={overlay}>
      {/* ── Header bar ── */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '20px 24px',
        zIndex: 2,
      }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            background: `linear-gradient(135deg, ${C.accent}, ${C.accentDk})`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: `1px solid rgba(255,255,255,0.12)`,
          }}>
            <Phone size={14} color={C.ink} />
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.text, lineHeight: 1.2 }}>
              AI Receptionist Demo
            </div>
            <div style={{ fontSize: 11, color: C.muted, display: 'flex', alignItems: 'center', gap: 5, marginTop: 2 }}>
              {isConnected && (
                <>
                  <div style={{
                    width: 6, height: 6, borderRadius: '50%',
                    background: C.accent,
                    animation: 'vrd-pulse-ring 2s ease-in-out infinite',
                    flexShrink: 0,
                  }} />
                  Live · {formatTime(elapsedSeconds)}
                </>
              )}
              {isConnecting && 'Connecting…'}
              {status === 'idle' && 'Ready to demo'}
              {isError && 'Connection error'}
            </div>
          </div>
        </div>

        {/* Timer + Close */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {isConnected && (
            <div style={{
              fontSize: 12,
              fontWeight: 600,
              color: getRemainingColor(elapsedSeconds),
              fontFamily: 'monospace',
              letterSpacing: '0.05em',
              transition: 'color 0.3s',
            }}>
              {formatTime(remaining)} left
            </div>
          )}
          <button
            className="vrd-close"
            onClick={handleClose}
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: `1px solid ${C.border}`,
              borderRadius: 10,
              width: 36,
              height: 36,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: C.muted,
              transition: 'all 0.2s',
            }}
            aria-label="Close demo"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* ── Main content ── */}
      <div style={contentWrap}>
        {/* Orb with pulse rings */}
        <div style={orbContainer}>
          {/* Ambient pulse rings */}
          {isConnected && (
            <>
              <div style={{
                position: 'absolute',
                inset: -20,
                borderRadius: '50%',
                border: `1px solid ${C.accent}`,
                opacity: 0.1,
                animation: 'vrd-pulse-ring 3s ease-in-out infinite',
                pointerEvents: 'none',
              }} />
              <div style={{
                position: 'absolute',
                inset: -40,
                borderRadius: '50%',
                border: `1px solid ${C.accent}`,
                opacity: 0.05,
                animation: 'vrd-pulse-ring 3s ease-in-out 0.5s infinite',
                pointerEvents: 'none',
              }} />
            </>
          )}

          <VoicePoweredOrb
            hue={140}
            enableVoiceControl={isConnected}
            externalAudioLevel={audioLevel}
            voiceSensitivity={1.8}
            maxRotationSpeed={1.5}
            maxHoverIntensity={0.9}
            className="rounded-full overflow-hidden"
          />
        </div>

        {/* Transcript area */}
        <div style={{
          minHeight: 60,
          textAlign: 'center',
          maxWidth: 380,
          width: '100%',
        }}>
          {showGreeting && (
            <p style={{
              fontSize: 15,
              color: C.subtle,
              lineHeight: 1.6,
              animation: 'vrd-transcript-in 0.4s ease forwards',
            }}>
              {AGENT_GREETING}
            </p>
          )}

          {showTimeoutMessage && (
            <div style={{
              animation: 'vrd-transcript-in 0.4s ease forwards',
              textAlign: 'center',
            }}>
              <p style={{ fontSize: 14, color: '#F59E0B', marginBottom: 8 }}>
                Demo time limit reached (1 minute)
              </p>
              <p style={{ fontSize: 13, color: C.muted }}>
                Want to see the full experience? Book a free AI audit call.
              </p>
            </div>
          )}

          {isError && error && !showTimeoutMessage && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              animation: 'vrd-transcript-in 0.3s ease forwards',
            }}>
              <AlertCircle size={14} color={C.danger} />
              <p style={{ fontSize: 13, color: C.danger }}>{error}</p>
            </div>
          )}

          {isConnected && displayTranscript && (
            <p style={{
              fontSize: 15,
              color: agentTranscript ? C.text : C.subtle,
              lineHeight: 1.6,
              animation: 'vrd-transcript-in 0.3s ease forwards',
              fontWeight: agentTranscript ? 400 : 300,
              fontStyle: agentTranscript ? 'normal' : 'italic',
            }}
            key={displayTranscript.slice(0, 30)}
            >
              {agentTranscript ? `"${displayTranscript}"` : `You: "${displayTranscript}"`}
            </p>
          )}

          {isConnecting && (
            <p style={{
              fontSize: 13,
              color: C.muted,
              animation: 'vrd-transcript-in 0.3s ease forwards',
            }}>
              Setting up your connection…
            </p>
          )}
        </div>

          {/* ── Mic disclosure card (shown after first click, before connect) ── */}
          {micConsented && status === 'idle' && !showTimeoutMessage && (
            <div style={{
              background: 'rgba(22,199,132,0.07)',
              border: '1px solid rgba(22,199,132,0.2)',
              borderRadius: 14,
              padding: '16px 20px',
              maxWidth: 380,
              width: '100%',
              textAlign: 'center',
              animation: 'vrd-transcript-in 0.3s ease forwards',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 10 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16C784" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                  <line x1="12" y1="19" x2="12" y2="23"/>
                </svg>
                <span style={{ fontSize: 13, fontWeight: 600, color: C.accent }}>Microphone Required</span>
              </div>
              <p style={{ fontSize: 12, color: C.muted, lineHeight: 1.65, marginBottom: 14 }}>
                This demo captures your voice and streams it to{' '}
                <a href="https://deepgram.com/privacy" target="_blank" rel="noopener noreferrer" style={{ color: C.accent, textDecoration: 'underline' }}>Deepgram</a>
                {' '}for real-time AI processing. No audio is stored by us.
                Your browser will ask for microphone permission on the next step.
              </p>
              <button
                className="vrd-btn"
                onClick={() => { connect(); }}
                style={{
                  ...callBtn,
                  background: `linear-gradient(135deg, ${C.accent}, ${C.accentDk})`,
                  color: C.ink,
                  boxShadow: `0 4px 20px rgba(22, 199, 132, 0.35)`,
                  width: '100%',
                  justifyContent: 'center',
                }}
              >
                <Phone size={15} />
                Allow &amp; Start Demo
              </button>
            </div>
          )}

          {/* Action buttons (hidden when mic disclosure is showing) */}
          {!(micConsented && status === 'idle' && !showTimeoutMessage) && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
              {isError && !showTimeoutMessage && (
                <button
                  className="vrd-btn"
                  onClick={handleRetry}
                  style={{
                    ...callBtn,
                    background: `linear-gradient(135deg, ${C.accent}, ${C.accentDk})`,
                    color: C.ink,
                    boxShadow: `0 4px 20px rgba(22, 199, 132, 0.35)`,
                  }}
                >
                  <RotateCcw size={17} />
                  Try Again
                </button>
              )}

              {showTimeoutMessage && (
                <button
                  className="vrd-btn"
                  onClick={handleRetry}
                  style={{
                    ...callBtn,
                    background: `linear-gradient(135deg, ${C.accent}, ${C.accentDk})`,
                    color: C.ink,
                    boxShadow: `0 4px 20px rgba(22, 199, 132, 0.35)`,
                  }}
                >
                  <RotateCcw size={17} />
                  Try Again
                </button>
              )}

              {!isError && !showTimeoutMessage && (
                <button
                  className="vrd-btn"
                  onClick={handleToggleCall}
                  disabled={isConnecting}
                  style={{ ...callBtn, opacity: isConnecting ? 0.7 : 1 }}
                >
                  {isConnecting ? (
                    <>
                      <Loader2 size={17} style={{ animation: 'vrd-spin 1s linear infinite' }} />
                      Connecting…
                    </>
                  ) : isConnected ? (
                    <>
                      <PhoneOff size={17} />
                      End Call
                    </>
                  ) : (
                    <>
                      <Phone size={17} />
                      Talk to Aria
                    </>
                  )}
                </button>
              )}

              {/* Sub-text */}
              {status === 'idle' && !showTimeoutMessage && (
                <p style={{ fontSize: 12, color: C.muted, textAlign: 'center' }}>
                  1-minute live demo · Powered by Deepgram
                </p>
              )}
            </div>
          )}
      </div>


      {/* ── Footer ── */}
      <div style={{
        position: 'absolute',
        bottom: 20,
        left: 0,
        right: 0,
        textAlign: 'center',
        fontSize: 11,
        color: 'rgba(255,255,255,0.15)',
        letterSpacing: '0.04em',
      }}>
        MyTaskEngine · AI-Powered Business Automation
      </div>

      {/* Ambient gradient overlay */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: `radial-gradient(ellipse at 50% 40%, rgba(22, 199, 132, 0.04) 0%, transparent 60%)`,
        pointerEvents: 'none',
        zIndex: 0,
      }} />
    </div>
  );
}
