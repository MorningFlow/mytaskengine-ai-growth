'use client';

import React, { useState, useRef, useEffect, useCallback, CSSProperties } from 'react';
import { Send, Bot, X, AlertCircle, Sparkles, CheckCircle2, ArrowRight, Calendar, Cpu, ArrowLeft } from 'lucide-react';
import { ExtractedLeadData } from '@/app/api/leads/extract/route';

/* ─── Scoped keyframes (namespaced with mte- prefix) ─────────────────────── */
const STYLES = `
  @keyframes mte-pop-in {
    0%   { opacity: 0; transform: scale(0.88) translateY(16px); }
    100% { opacity: 1; transform: scale(1)    translateY(0);     }
  }
  @keyframes mte-ping {
    0%   { transform: scale(1);   opacity: 0.22; }
    75%  { transform: scale(2.0); opacity: 0;    }
    100% { transform: scale(2.0); opacity: 0;    }
  }
  @keyframes mte-pulse-dot {
    0%, 100% { opacity: 1; transform: scale(1); }
    50%       { opacity: 0.35; transform: scale(0.85); }
  }
  @keyframes mte-typing {
    0%, 80%, 100% { transform: translateY(0);   opacity: 0.4; }
    40%            { transform: translateY(-5px); opacity: 1;   }
  }
  @keyframes mte-fade-in {
    from { opacity: 0; transform: translateY(6px); }
    to   { opacity: 1; transform: translateY(0);   }
  }
  .mte-fab {
    transition: transform 0.32s ease, box-shadow 0.32s ease;
  }
  .mte-fab:hover {
    transform: scale(1.1) rotate(4deg) !important;
    box-shadow:
      0 0 32px rgba(22, 199, 132, 0.7),
      0 0 58px rgba(22, 199, 132, 0.5),
      0 0 78px rgba(22, 199, 132, 0.3) !important;
  }
  .mte-send:hover {
    transform: scale(1.06) !important;
    filter: brightness(1.18);
  }
  .mte-send { transition: transform 0.18s ease, filter 0.18s ease; }
  .mte-close-btn:hover { background: rgba(255,255,255,0.08) !important; }
  .mte-intel-pill:hover { filter: brightness(1.15); transform: translateY(-1px); }
  .mte-textarea:focus { outline: none; }
  .mte-scroll::-webkit-scrollbar { width: 4px; }
  .mte-scroll::-webkit-scrollbar-track { background: transparent; }
  .mte-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
  .mte-chip:hover {
    background: rgba(22, 199, 132, 0.12) !important;
    border-color: rgba(22, 199, 132, 0.4) !important;
    color: #16C784 !important;
    transform: translateY(-1px);
  }
  .mte-cal-btn:hover {
    filter: brightness(1.12);
    transform: translateY(-1px);
  }
`;

/* ─── Design Tokens (aligned with luxury dark theme) ─────────────────────── */
const C = {
  accent: '#16C784',
  accentDk: '#0E9F6E',
  accentBg: 'rgba(22, 199, 132, 0.08)',
  accentBorder: 'rgba(22, 199, 132, 0.25)',
  bg: '#0A0D12',
  surface: '#0F141C',
  border: 'rgba(255, 255, 255, 0.08)',
  divider: 'rgba(255, 255, 255, 0.06)',
  text: '#F3F4F6',
  muted: '#9CA3AF',
  subtle: '#6B7280',
  ink: '#030712',
};

const INITIAL_MSG =
  "Hello. I am Aria, MyTaskEngine's AI Sales & Solutions Assistant. Which operational bottleneck can we help you solve today?";

const ERROR_MSG =
  "I encountered a temporary connection issue. Please feel free to schedule an audit directly using the button above.";

const QUICK_CHIPS = [
  'Missed Call Receptionist',
  'Social DM Booking Engine',
  'Google Review Accelerator',
  'Automated Outbound Pipeline',
];

interface Message {
  id: string;
  role: 'user' | 'bot';
  text: string;
}

function getOrCreateSessionId(): string {
  if (typeof window === 'undefined') return 'ssr-session';
  const key = 'mte_chat_session_id';
  let id = localStorage.getItem(key);
  if (!id) {
    id = `sess-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    localStorage.setItem(key, id);
  }
  return id;
}

const TypingDots = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 0' }}>
    {[0, 1, 2].map(i => (
      <span key={i} style={{
        display: 'inline-block',
        width: 7, height: 7, borderRadius: '50%',
        background: C.muted,
        animation: `mte-typing 1.2s ease-in-out ${i * 0.18}s infinite`,
      }} />
    ))}
  </div>
);

/**
 * On-Demand Structured AI Intelligence Drawer View
 */
const IntelligenceDrawerView = ({
  data,
  onClose,
  onEmailSubmit,
}: {
  data: ExtractedLeadData;
  onClose: () => void;
  onEmailSubmit?: (email: string) => void;
}) => {
  const [emailInput, setEmailInput] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) return;
    onEmailSubmit?.(emailInput.trim());
    setSubmitted(true);
  };

  return (
    <div className="mte-scroll" style={{
      flex: 1,
      overflowY: 'auto',
      padding: '16px',
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
      animation: 'mte-fade-in 0.22s ease forwards',
      boxSizing: 'border-box',
    }}>
      {/* Top Bar with Back button and status badge */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button
          onClick={onClose}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 5,
            background: 'rgba(255,255,255,0.06)',
            border: `1px solid ${C.border}`,
            borderRadius: 8,
            padding: '5px 10px',
            fontSize: 11.5,
            fontWeight: 600,
            color: C.text,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          <ArrowLeft size={13} />
          <span>Back to Chat</span>
        </button>

        <span style={{
          fontSize: 10.5,
          fontWeight: 600,
          color: data.leadScore === 'High Priority' ? C.accent : '#F59E0B',
          background: data.leadScore === 'High Priority' ? C.accentBg : 'rgba(245, 158, 11, 0.08)',
          border: `1px solid ${data.leadScore === 'High Priority' ? C.accentBorder : 'rgba(245, 158, 11, 0.25)'}`,
          padding: '3px 8px',
          borderRadius: 6,
        }}>
          {data.leadScore}
        </span>
      </div>

      <div>
        <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>
          Structured Intelligence Captured
        </div>
        <p style={{ fontSize: 11.5, color: C.muted, margin: '3px 0 0', lineHeight: 1.45 }}>
          Aria extracted these parameters directly from your conversation stream without forms.
        </p>
      </div>

      {/* Grid: Contact & Industry */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px 12px', borderRadius: 10, border: `1px solid ${C.border}` }}>
          <div style={{ fontSize: 10, color: C.subtle, textTransform: 'uppercase', fontWeight: 600 }}>Contact</div>
          <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {data.name || 'Inbound Prospect'}
          </div>
          <div style={{ fontSize: 11.5, color: data.email ? C.accent : C.muted, marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {data.email || 'Pending email'}
          </div>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px 12px', borderRadius: 10, border: `1px solid ${C.border}` }}>
          <div style={{ fontSize: 10, color: C.subtle, textTransform: 'uppercase', fontWeight: 600 }}>Industry</div>
          <div style={{ fontSize: 13, fontWeight: 600, color: data.businessType ? C.text : C.muted, marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {data.businessType || 'General Inbound'}
          </div>
          <div style={{ fontSize: 11.5, color: C.muted, marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {data.volumeOrScale || 'Scale not stated'}
          </div>
        </div>
      </div>

      {/* Bottleneck */}
      <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px 12px', borderRadius: 10, border: `1px solid ${C.border}` }}>
        <div style={{ fontSize: 10, color: C.subtle, textTransform: 'uppercase', fontWeight: 600 }}>Identified Bottleneck</div>
        <div style={{ fontSize: 12.5, color: data.primaryBottleneck ? '#E5E7EB' : C.muted, lineHeight: 1.45, marginTop: 3 }}>
          {data.primaryBottleneck || 'No operational bottlenecks specified in chat.'}
        </div>
      </div>

      {/* Recommended Solution */}
      <div style={{ background: C.accentBg, border: `1px solid ${C.accentBorder}`, padding: '10px 12px', borderRadius: 10 }}>
        <div style={{ fontSize: 10, color: C.accent, textTransform: 'uppercase', fontWeight: 600 }}>Recommended Architecture</div>
        <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginTop: 3 }}>
          {data.recommendedSolution}
        </div>
      </div>

      {/* Missing Email Recovery Form */}
      {!data.email && !submitted && (
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 6, marginTop: 2 }}>
          <input
            type="email"
            required
            placeholder="Enter email for implementation roadmap…"
            value={emailInput}
            onChange={(e) => setEmailInput(e.target.value)}
            style={{
              flex: 1,
              background: 'rgba(255,255,255,0.05)',
              border: `1px solid ${C.border}`,
              borderRadius: 8,
              padding: '8px 10px',
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
              borderRadius: 8,
              padding: '8px 14px',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            Save
          </button>
        </form>
      )}

      {submitted && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: C.accent }}>
          <CheckCircle2 size={14} />
          Roadmap queued for delivery to {emailInput}.
        </div>
      )}

      {/* 1-Click Cal.com Button */}
      <button
        className="mte-cal-btn"
        data-cal-link="mytaskengine/30min"
        data-cal-namespace="30min"
        data-cal-config='{"layout":"month_view"}'
        style={{
          width: '100%',
          background: `linear-gradient(135deg, ${C.accent}, ${C.accentDk})`,
          color: C.ink,
          border: 'none',
          padding: '10px 16px',
          borderRadius: 8,
          fontSize: 12.5,
          fontWeight: 700,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
          boxShadow: `0 4px 16px rgba(22, 199, 132, 0.3)`,
          marginTop: 'auto',
        }}
      >
        <Calendar size={14} />
        Schedule Free 30-Min AI Audit
      </button>
    </div>
  );
};

export const GlowingAiChatAssistant: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: 'init', role: 'bot', text: INITIAL_MSG },
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [hasExtracted, setHasExtracted] = useState(false);
  const [latestLeadData, setLatestLeadData] = useState<ExtractedLeadData | null>(null);
  const [showIntelDrawer, setShowIntelDrawer] = useState(false);

  const [sessionId] = useState<string>(() => {
    if (typeof window === 'undefined') return 'ssr-placeholder';
    return getOrCreateSessionId();
  });

  const chatRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  /* Auto-scroll to bottom */
  useEffect(() => {
    if (scrollRef.current && !showIntelDrawer)
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, typing, showIntelDrawer]);

  /* Focus textarea when open */
  useEffect(() => {
    if (open && !showIntelDrawer) setTimeout(() => textareaRef.current?.focus(), 60);
  }, [open, showIntelDrawer]);

  /* Close on outside click */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const t = e.target as Element;
      if (chatRef.current && !chatRef.current.contains(t) && !t.closest('.mte-fab-wrap'))
        setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Trigger lead extraction and update header state
  const triggerExtraction = useCallback(async (allMessages: Message[]) => {
    const transcriptForApi = allMessages
      .filter(m => m.role === 'user' || m.role === 'bot')
      .map(m => ({ role: m.role === 'user' ? ('user' as const) : ('assistant' as const), text: m.text || '' }));

    if (transcriptForApi.length < 2) return;

    try {
      const res = await fetch('/api/leads/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript: transcriptForApi }),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          setLatestLeadData(json.data);
          setHasExtracted(true);

          // Submit to central lead storage
          await fetch('/api/leads', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              source: 'website_chat_assistant',
              sessionId,
              lead: json.data,
              transcript: transcriptForApi,
            }),
          });
        }
      }
    } catch (err) {
      console.warn('Chat extraction error:', err);
    }
  }, [sessionId]);

  /* Send message */
  const send = useCallback(async (overrideText?: string) => {
    const text = (overrideText || input).trim();
    if (!text || typing) return;

    const userMsg: Message = { id: `u-${Date.now()}`, role: 'user', text };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput('');
    setTyping(true);

    try {
      const historyPayload = updatedMessages
        .filter(m => m.role === 'user' || m.role === 'bot')
        .map(m => ({ role: m.role, text: m.text }));

      const res = await fetch('/api/mte-webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          sessionId,
          history: historyPayload,
        }),
      });

      let reply = "I received your message and will structure a customized solution.";
      if (res.ok) {
        const data = await res.json();
        reply = data?.reply ?? data?.output ?? data?.text ?? data?.message ?? reply;
      }

      const botMsg: Message = { id: `b-${Date.now()}`, role: 'bot', text: reply };
      const nextMessages = [...updatedMessages, botMsg];
      setMessages(nextMessages);

      // Check if contact information (email / phone) or 2+ turns reached
      const hasEmail = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/.test(text);
      if (hasEmail || nextMessages.filter(m => m.role === 'user').length >= 2) {
        triggerExtraction(nextMessages);
      }
    } catch (err) {
      console.error('[MTE Chat]', err);
      setMessages(prev => [...prev, { id: `err-${Date.now()}`, role: 'bot', text: ERROR_MSG }]);
    } finally {
      setTyping(false);
    }
  }, [input, typing, sessionId, messages, triggerExtraction]);

  const onKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  };

  const handleManualEmailUpdate = async (email: string) => {
    if (!latestLeadData) return;
    const updated = {
      ...latestLeadData,
      email,
      leadScore: 'High Priority' as const,
    };
    setLatestLeadData(updated);

    try {
      await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source: 'website_chat_assistant',
          sessionId,
          lead: updated,
        }),
      });
    } catch (err) {
      console.warn('Manual email save error:', err);
    }
  };

  /* ── Styles ── */
  const fab: CSSProperties = {
    position: 'relative',
    width: 58,
    height: 58,
    borderRadius: '50%',
    background: `linear-gradient(135deg, ${C.accent}, ${C.accentDk})`,
    border: 'none',
    boxShadow: `0 0 20px rgba(22, 199, 132, 0.45), 0 8px 30px rgba(0,0,0,0.6)`,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
  };

  const panel: CSSProperties = {
    position: 'absolute',
    bottom: 74,
    right: 0,
    width: 'min(400px, calc(100vw - 32px))',
    background: 'rgba(10, 13, 18, 0.94)',
    border: `1px solid ${C.border}`,
    borderRadius: 20,
    boxShadow: '0 28px 72px rgba(0,0,0,0.75), 0 0 0 1px rgba(255,255,255,0.03)',
    backdropFilter: 'blur(32px)',
    WebkitBackdropFilter: 'blur(32px)',
    overflow: 'hidden',
    display: 'flex', flexDirection: 'column',
    animation: 'mte-pop-in 0.28s cubic-bezier(0.175,0.885,0.32,1.275) forwards',
    boxSizing: 'border-box',
    maxHeight: 'min(600px, calc(100dvh - 100px))',
  };

  return (
    <div className="mte-fab-wrap" style={{ position: 'fixed', bottom: 20, right: 20, zIndex: 9999, boxSizing: 'border-box', maxWidth: 'calc(100vw - 24px)' }}>
      {/* ── FAB ── */}
      <button className="mte-fab" style={fab} onClick={() => setOpen(o => !o)} aria-label="Toggle Aria AI Assistant">
        <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'linear-gradient(to bottom, rgba(255,255,255,0.3), transparent)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: C.accent, opacity: 0.2, animation: 'mte-ping 2.4s ease-out infinite', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 1, color: C.ink, display: 'flex' }}>
          {open ? <X size={22} /> : <Bot size={26} />}
        </div>
      </button>

      {/* ── Chat Panel ── */}
      {open && (
        <div ref={chatRef} style={panel}>
          {/* Header */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '12px 16px',
            borderBottom: `1px solid ${C.divider}`,
            flexShrink: 0,
            boxSizing: 'border-box',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
              <div style={{
                width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
                background: `linear-gradient(135deg, ${C.accent}, ${C.accentDk})`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '1px solid rgba(255,255,255,0.12)',
              }}>
                <Bot size={15} color={C.ink} />
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.text, lineHeight: 1.2 }}>
                  Aria
                </div>
                <div style={{ fontSize: 11, color: C.muted, display: 'flex', alignItems: 'center', gap: 5, marginTop: 1 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: C.accent, animation: 'mte-pulse-dot 2s ease-in-out infinite', flexShrink: 0 }} />
                  Solutions Assistant · Active
                </div>
              </div>
            </div>

            {/* Clean Header Close Button */}
            <button
              className="mte-close-btn"
              onClick={() => setOpen(false)}
              style={{
                background: 'transparent', border: 'none', cursor: 'pointer',
                color: C.muted, display: 'flex', padding: 6, borderRadius: 8,
                transition: 'background 0.15s',
              }}
              aria-label="Close chat"
            >
              <X size={16} />
            </button>
          </div>

          {/* Sub-Header AI Roadmap Ribbon (High-Converting, Uncluttered CTA) */}
          {latestLeadData && !showIntelDrawer && (
            <div style={{
              background: 'linear-gradient(90deg, rgba(22, 199, 132, 0.14), rgba(22, 199, 132, 0.05))',
              borderBottom: '1px solid rgba(22, 199, 132, 0.22)',
              padding: '8px 14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 10,
              animation: 'mte-fade-in 0.25s ease forwards',
              flexShrink: 0,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, minWidth: 0 }}>
                <Sparkles size={13} color={C.accent} style={{ flexShrink: 0 }} />
                <span style={{ fontSize: 11.5, fontWeight: 600, color: C.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {latestLeadData.recommendedSolution ? `AI Blueprint: ${latestLeadData.recommendedSolution}` : 'Custom AI Roadmap Prepared'}
                </span>
              </div>
              <button
                onClick={() => setShowIntelDrawer(true)}
                style={{
                  background: `linear-gradient(135deg, ${C.accent}, ${C.accentDk})`,
                  color: C.ink,
                  border: 'none',
                  borderRadius: 14,
                  padding: '4px 10px',
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  boxShadow: '0 2px 8px rgba(22, 199, 132, 0.25)',
                  transition: 'transform 0.15s ease',
                }}
              >
                <span>View Roadmap</span>
                <ArrowRight size={11} />
              </button>
            </div>
          )}

          {/* Conditional View: Structured Intelligence Drawer OR Clean Chat Message Stream */}
          {showIntelDrawer && latestLeadData ? (
            <IntelligenceDrawerView
              data={latestLeadData}
              onClose={() => setShowIntelDrawer(false)}
              onEmailSubmit={handleManualEmailUpdate}
            />
          ) : (
            <>
              {/* Messages Area */}
              <div
                ref={scrollRef}
                className="mte-scroll"
                style={{
                  flex: 1, overflowY: 'auto',
                  padding: '16px 16px 8px',
                  display: 'flex', flexDirection: 'column',
                  minHeight: 220,
                  boxSizing: 'border-box',
                }}
              >
                {messages.map(m => {
                  const isUser = m.role === 'user';
                  return (
                    <div key={m.id} style={{
                      display: 'flex',
                      justifyContent: isUser ? 'flex-end' : 'flex-start',
                      animation: 'mte-fade-in 0.22s ease forwards',
                      marginBottom: 10,
                    }}>
                      {!isUser && (
                        <div style={{
                          width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
                          background: `linear-gradient(135deg, ${C.accent}, ${C.accentDk})`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          marginRight: 8, marginTop: 2,
                        }}>
                          <Bot size={13} color={C.ink} />
                        </div>
                      )}
                      <div style={{
                        maxWidth: '80%',
                        padding: '9px 13px',
                        borderRadius: isUser ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                        background: isUser
                          ? `linear-gradient(135deg, ${C.accent}, ${C.accentDk})`
                          : 'rgba(255,255,255,0.06)',
                        border: isUser ? 'none' : `1px solid ${C.border}`,
                        color: isUser ? C.ink : C.text,
                        fontSize: 13,
                        lineHeight: 1.55,
                        boxShadow: isUser ? `0 4px 14px rgba(22, 199, 132, 0.25)` : 'none',
                        wordBreak: 'break-word',
                        whiteSpace: 'pre-wrap',
                        fontWeight: isUser ? 500 : 400,
                      }}>
                        {m.text}
                      </div>
                    </div>
                  );
                })}

                {/* Quick Action Chips (shown on turn 1) */}
                {messages.length === 1 && (
                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 6,
                    marginTop: 4,
                    marginBottom: 12,
                    animation: 'mte-fade-in 0.3s ease forwards',
                  }}>
                    {QUICK_CHIPS.map(chip => (
                      <button
                        key={chip}
                        className="mte-chip"
                        onClick={() => send(`We are evaluating ${chip}. How does it work?`)}
                        style={{
                          background: 'rgba(255,255,255,0.04)',
                          border: `1px solid ${C.border}`,
                          borderRadius: 20,
                          padding: '6px 12px',
                          fontSize: 11.5,
                          fontWeight: 500,
                          color: C.muted,
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        {chip}
                      </button>
                    ))}
                  </div>
                )}

                {/* Typing Indicator */}
                {typing && (
                  <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: 10, animation: 'mte-fade-in 0.2s ease forwards' }}>
                    <div style={{
                      width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
                      background: `linear-gradient(135deg, ${C.accent}, ${C.accentDk})`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      marginRight: 8, marginTop: 2,
                    }}>
                      <Bot size={13} color={C.ink} />
                    </div>
                    <div style={{
                      padding: '9px 13px',
                      borderRadius: '14px 14px 14px 4px',
                      background: 'rgba(255,255,255,0.06)',
                      border: `1px solid ${C.border}`,
                    }}>
                      <TypingDots />
                    </div>
                  </div>
                )}
              </div>

              {/* Input Area */}
              <div style={{
                borderTop: `1px solid ${C.divider}`,
                padding: '10px 14px',
                display: 'flex', alignItems: 'flex-end', gap: 8,
                flexShrink: 0,
              }}>
                <textarea
                  ref={textareaRef}
                  className="mte-textarea"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={onKey}
                  rows={1}
                  placeholder="Describe your business or workflow bottleneck…"
                  style={{
                    flex: 1,
                    background: 'rgba(255,255,255,0.05)',
                    border: `1px solid ${C.border}`,
                    borderRadius: 10,
                    padding: '9px 12px',
                    fontSize: 13,
                    lineHeight: 1.5,
                    color: C.text,
                    fontFamily: 'inherit',
                    resize: 'none',
                    outline: 'none',
                    caretColor: C.accent,
                    maxHeight: 90,
                    overflowY: 'auto',
                    transition: 'border-color 0.15s',
                  }}
                  onFocus={e => (e.target.style.borderColor = `rgba(22, 199, 132, 0.45)`)}
                  onBlur={e  => (e.target.style.borderColor = C.border)}
                />
                <button
                  className="mte-send"
                  onClick={() => send()}
                  disabled={!input.trim() || typing}
                  aria-label="Send message"
                  style={{
                    width: 38, height: 38, borderRadius: 10, border: 'none', flexShrink: 0,
                    background: input.trim() && !typing
                      ? `linear-gradient(135deg, ${C.accent}, ${C.accentDk})`
                      : 'rgba(255,255,255,0.07)',
                    boxShadow: input.trim() && !typing ? `0 4px 14px rgba(22, 199, 132, 0.3)` : 'none',
                    cursor: input.trim() && !typing ? 'pointer' : 'not-allowed',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: input.trim() && !typing ? C.ink : C.subtle,
                  }}
                >
                  <Send size={15} />
                </button>
              </div>
            </>
          )}

          {/* Footer Privacy Disclosure */}
          <div style={{
            padding: '7px 14px',
            textAlign: 'center',
            fontSize: 10.5,
            color: C.subtle,
            borderTop: `1px solid ${C.divider}`,
            flexShrink: 0,
          }}>
            Conversations are structured by AI for qualification.{' '}
            <a href="/privacy" style={{ color: C.muted, textDecoration: 'underline' }}>Privacy Policy</a>
          </div>

          {/* Scoped CSS */}
          <style>{STYLES}</style>
        </div>
      )}
    </div>
  );
};

export const FloatingAiAssistant = GlowingAiChatAssistant;
export default GlowingAiChatAssistant;
