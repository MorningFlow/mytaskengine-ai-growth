'use client';

import React, { useState, useRef, useEffect, useCallback, CSSProperties } from 'react';
import { Send, Bot, X, AlertCircle } from 'lucide-react';

/* ─── Scoped keyframes (namespaced with mte- prefix) ─────────────────────── */
const STYLES = `
  @keyframes mte-pop-in {
    0%   { opacity: 0; transform: scale(0.84) translateY(16px); }
    100% { opacity: 1; transform: scale(1)    translateY(0);     }
  }
  @keyframes mte-ping {
    0%   { transform: scale(1);   opacity: 0.22; }
    75%  { transform: scale(2.0); opacity: 0;    }
    100% { transform: scale(2.0); opacity: 0;    }
  }
  @keyframes mte-pulse-dot {
    0%, 100% { opacity: 1;   }
    50%       { opacity: 0.35; }
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
    transform: scale(1.12) rotate(5deg) !important;
    box-shadow:
      0 0 32px rgba(22, 199, 132, 0.7),
      0 0 58px rgba(22, 199, 132, 0.5),
      0 0 78px rgba(22, 199, 132, 0.3) !important;
  }
  .mte-send:hover {
    transform: scale(1.08) rotate(-3deg) !important;
    filter: brightness(1.18);
  }
  .mte-send { transition: transform 0.18s ease, filter 0.18s ease; }
  .mte-close-btn:hover { background: rgba(255,255,255,0.08) !important; }
  .mte-textarea:focus { outline: none; }
  .mte-scroll::-webkit-scrollbar { width: 4px; }
  .mte-scroll::-webkit-scrollbar-track { background: transparent; }
  .mte-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
`;

/* ─── Session ID ──────────────────────────────────────────────────────────── */
function getOrCreateSessionId(): string {
  const KEY = 'mte_chat_session';
  try {
    const existing = sessionStorage.getItem(KEY);
    if (existing) return existing;
    const id = typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
    sessionStorage.setItem(KEY, id);
    return id;
  } catch {
    // SSR / private browsing fallback
    return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
  }
}

/* ─── Types ───────────────────────────────────────────────────────────────── */
type Role = 'bot' | 'user';

interface Message {
  id: string;
  role: Role;
  text: string;
}

const WELCOME: Message = {
  id: 'welcome',
  role: 'bot',
  text: "Hi there! 👋 I'm Aria, MyTaskEngine’s AI Sales Assistant. How can I help you discover the perfect AI solutions for your business today?",
};

const ERROR_MSG = "Something went wrong on our end. Please try again or reach us at taskengin3@gmail.com.";

/* ─── Design tokens ───────────────────────────────────────────────────────── */
const C = {
  bg:       '#0D1117', // var(--color-ink)
  border:   'rgba(255,255,255,0.08)',
  divider:  'rgba(255,255,255,0.06)',
  text:     '#FFFFFF',
  muted:    '#6B7280',
  subtle:   '#52525b',
  accent:   '#16C784',
  accentDk: '#13B371',
  ink:      '#0D1117',
} as const;

/* ─── Style injection ─────────────────────────────────────────────────────── */
function useInjectStyles() {
  useEffect(() => {
    if (document.getElementById('mte-chat-styles')) return;
    const tag = document.createElement('style');
    tag.id = 'mte-chat-styles';
    tag.textContent = STYLES;
    document.head.appendChild(tag);
    // Keep styles alive for the lifetime of the page
  }, []);
}

/* ─── Typing dots ─────────────────────────────────────────────────────────── */
const TypingDots = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '2px 0' }}>
    {[0, 1, 2].map(i => (
      <div key={i} style={{
        width: 7, height: 7, borderRadius: '50%',
        background: C.muted,
        animation: `mte-typing 1.2s ease-in-out ${i * 0.18}s infinite`,
      }} />
    ))}
  </div>
);

/* ─── Message bubble ──────────────────────────────────────────────────────── */
const Bubble = ({ msg }: { msg: Message }) => {
  const isUser = msg.role === 'user';
  return (
    <div style={{
      display: 'flex',
      justifyContent: isUser ? 'flex-end' : 'flex-start',
      animation: 'mte-fade-in 0.22s ease forwards',
      marginBottom: 10,
      boxSizing: 'border-box',
    }}>
      {!isUser && (
        <div style={{
          width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
          background: `linear-gradient(135deg, ${C.accent}, ${C.accentDk})`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginRight: 8, marginTop: 2,
          border: '1px solid rgba(255,255,255,0.1)',
          boxSizing: 'border-box',
        }}>
          <Bot size={14} color={C.ink} />
        </div>
      )}
      <div style={{
        maxWidth: '78%',
        padding: '10px 14px',
        borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
        background: isUser
          ? `linear-gradient(135deg, ${C.accent}, ${C.accentDk})`
          : 'rgba(255,255,255,0.06)',
        border: isUser ? 'none' : `1px solid ${C.border}`,
        color: isUser ? C.ink : C.text,
        fontSize: 13.5,
        lineHeight: 1.6,
        boxShadow: isUser ? `0 4px 14px rgba(22, 199, 132, 0.25)` : 'none',
        wordBreak: 'break-word',
        boxSizing: 'border-box',
        whiteSpace: 'pre-wrap',
        fontWeight: isUser ? 500 : 400,
      }}>
        {msg.text}
      </div>
    </div>
  );
};

/* ─── Main component ──────────────────────────────────────────────────────── */
const FloatingAiAssistant = () => {
  useInjectStyles();

  const [open, setOpen]       = useState(false);
  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const [input, setInput]     = useState('');
  const [typing, setTyping]   = useState(false);
  const [sessionId]           = useState<string>(() => {
    if (typeof window === 'undefined') return 'ssr-placeholder';
    return getOrCreateSessionId();
  });

  const chatRef    = useRef<HTMLDivElement>(null);
  const scrollRef  = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  /* Auto-scroll to bottom when new messages arrive */
  useEffect(() => {
    if (scrollRef.current)
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, typing]);

  /* Focus textarea when panel opens */
  useEffect(() => {
    if (open) setTimeout(() => textareaRef.current?.focus(), 60);
  }, [open]);

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

  /* Send message → n8n webhook */
  const send = useCallback(async () => {
    const text = input.trim();
    if (!text || typing) return;

    const userMsg: Message = { id: `u-${Date.now()}`, role: 'user', text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setTyping(true);

    try {
      const res = await fetch('/api/mte-webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, sessionId }),
      });

      if (!res.ok) throw new Error(`n8n returned ${res.status}`);

      const data = await res.json();
      // n8n Respond to Webhook node → { reply: "..." }
      const reply: string =
        data?.reply ??
        data?.output ??
        data?.text ??
        data?.message ??
        "I received your message and I'm looking into it.";

      setMessages(prev => [...prev, { id: `b-${Date.now()}`, role: 'bot', text: reply }]);
    } catch (err) {
      console.error('[MTE Chat]', err);
      setMessages(prev => [...prev, { id: `err-${Date.now()}`, role: 'bot', text: ERROR_MSG }]);
    } finally {
      setTyping(false);
    }
  }, [input, typing, sessionId]);

  const onKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  };

  /* ── Inline styles ── */
  const fab: CSSProperties = {
    width: 60, height: 60, borderRadius: '50%',
    border: '1.5px solid rgba(255,255,255,0.18)',
    background: `linear-gradient(135deg, ${C.accent} 0%, ${C.accentDk} 100%)`,
    boxShadow: `0 0 22px rgba(22, 199, 132, 0.5), 0 0 44px rgba(22, 199, 132, 0.35), 0 0 64px rgba(22, 199, 132, 0.2)`,
    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
    position: 'relative', outline: 'none',
    transform: open ? 'rotate(90deg)' : 'rotate(0deg)',
    boxSizing: 'border-box', padding: 0,
  };

  const panel: CSSProperties = {
    position: 'absolute', bottom: 76, right: 0,
    width: 400,
    background: 'rgba(13, 17, 23, 0.98)', // matched to var(--color-ink)
    border: `1px solid ${C.border}`,
    borderRadius: 20,
    boxShadow: '0 28px 72px rgba(0,0,0,0.75), 0 0 0 1px rgba(255,255,255,0.03)',
    backdropFilter: 'blur(32px)',
    WebkitBackdropFilter: 'blur(32px)',
    overflow: 'hidden',
    display: 'flex', flexDirection: 'column',
    animation: 'mte-pop-in 0.28s cubic-bezier(0.175,0.885,0.32,1.275) forwards',
    boxSizing: 'border-box',
    maxHeight: '80vh',
  };

  return (
    <div className="mte-fab-wrap" style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999, boxSizing: 'border-box' }}>

      {/* ── FAB ── */}
      <button className="mte-fab" style={fab} onClick={() => setOpen(o => !o)} aria-label="Toggle MyTaskEngine support chat">
        <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'linear-gradient(to bottom, rgba(255,255,255,0.3), transparent)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: C.accent, opacity: 0.2, animation: 'mte-ping 2.4s ease-out infinite', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 1, color: C.ink, display: 'flex' }}>
          {open ? <X size={22} /> : <Bot size={26} />}
        </div>
      </button>

      {/* ── Panel ── */}
      {open && (
        <div ref={chatRef} style={panel}>

          {/* Header */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '15px 18px 13px',
            borderBottom: `1px solid ${C.divider}`,
            flexShrink: 0,
            boxSizing: 'border-box',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                background: `linear-gradient(135deg, ${C.accent}, ${C.accentDk})`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '1px solid rgba(255,255,255,0.12)',
                boxSizing: 'border-box',
              }}>
                <Bot size={16} color={C.ink} />
              </div>
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: C.text, lineHeight: 1.2, letterSpacing: '-0.01em' }}>
                  MyTaskEngine Support
                </div>
                <div style={{ fontSize: 11, color: C.muted, display: 'flex', alignItems: 'center', gap: 5, marginTop: 2 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: C.accent, animation: 'mte-pulse-dot 2s ease-in-out infinite', flexShrink: 0 }} />
                  AI-powered · usually replies instantly
                </div>
              </div>
            </div>
            <button
              className="mte-close-btn"
              onClick={() => setOpen(false)}
              style={{
                background: 'transparent', border: 'none', cursor: 'pointer',
                color: C.muted, display: 'flex', padding: 6, borderRadius: 8,
                boxSizing: 'border-box', transition: 'background 0.15s',
              }}
              aria-label="Close chat"
            >
              <X size={16} />
            </button>
          </div>

          {/* Message history */}
          <div
            ref={scrollRef}
            className="mte-scroll"
            style={{
              flex: 1, overflowY: 'auto',
              padding: '16px 16px 8px',
              display: 'flex', flexDirection: 'column',
              minHeight: 200,
              boxSizing: 'border-box',
            }}
          >
            {messages.map(m => <Bubble key={m.id} msg={m} />)}

            {/* Typing indicator */}
            {typing && (
              <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: 10, animation: 'mte-fade-in 0.2s ease forwards' }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                  background: `linear-gradient(135deg, ${C.accent}, ${C.accentDk})`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginRight: 8, marginTop: 2,
                  border: '1px solid rgba(255,255,255,0.1)',
                  boxSizing: 'border-box',
                }}>
                  <Bot size={14} color={C.ink} />
                </div>
                <div style={{
                  padding: '10px 14px',
                  borderRadius: '16px 16px 16px 4px',
                  background: 'rgba(255,255,255,0.06)',
                  border: `1px solid ${C.border}`,
                  boxSizing: 'border-box',
                }}>
                  <TypingDots />
                </div>
              </div>
            )}
          </div>

          {/* Input row */}
          <div style={{
            borderTop: `1px solid ${C.divider}`,
            padding: '12px 14px',
            display: 'flex', alignItems: 'flex-end', gap: 10,
            flexShrink: 0,
            boxSizing: 'border-box',
          }}>
            <textarea
              ref={textareaRef}
              className="mte-textarea"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={onKey}
              rows={1}
              placeholder="Type your message…"
              style={{
                flex: 1,
                background: 'rgba(255,255,255,0.05)',
                border: `1px solid ${C.border}`,
                borderRadius: 12,
                padding: '10px 13px',
                fontSize: 13.5,
                lineHeight: 1.55,
                color: C.text,
                fontFamily: 'inherit',
                resize: 'none',
                outline: 'none',
                caretColor: C.accent,
                boxSizing: 'border-box',
                maxHeight: 110,
                overflowY: 'auto',
                transition: 'border-color 0.15s',
              }}
              onFocus={e => (e.target.style.borderColor = `rgba(22, 199, 132, 0.45)`)}
              onBlur={e  => (e.target.style.borderColor = C.border)}
            />
            <button
              className="mte-send"
              onClick={send}
              disabled={!input.trim() || typing}
              aria-label="Send message"
              style={{
                width: 42, height: 42, borderRadius: 12, border: 'none', flexShrink: 0,
                background: input.trim() && !typing
                  ? `linear-gradient(135deg, ${C.accent}, ${C.accentDk})`
                  : 'rgba(255,255,255,0.07)',
                boxShadow: input.trim() && !typing ? `0 4px 16px rgba(22, 199, 132, 0.3)` : 'none',
                cursor: input.trim() && !typing ? 'pointer' : 'not-allowed',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: input.trim() && !typing ? C.ink : C.subtle,
                boxSizing: 'border-box',
                transition: 'background 0.2s, box-shadow 0.2s, color 0.2s',
              }}
            >
              <Send size={17} />
            </button>
          </div>

          {/* Privacy disclosure */}
          <div style={{
            padding: '6px 14px 10px',
            fontSize: 11,
            color: C.subtle,
            fontFamily: 'inherit',
            flexShrink: 0,
            boxSizing: 'border-box',
            textAlign: 'center',
            lineHeight: 1.5,
            borderTop: `1px solid ${C.divider}`,
          }}>
            Chats are processed by our AI.{' '}
            <a
              href="/privacy"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: C.accent, textDecoration: 'underline', textUnderlineOffset: 2 }}
            >
              Privacy Policy
            </a>
          </div>

          {/* Session debug info (dev only) */}
          {process.env.NODE_ENV === 'development' && (
            <div style={{
              padding: '4px 14px 8px',
              fontSize: 10, color: C.subtle, fontFamily: 'monospace',
              borderTop: `1px solid ${C.divider}`,
              flexShrink: 0, boxSizing: 'border-box',
              display: 'flex', alignItems: 'center', gap: 5,
            }}>
              <AlertCircle size={9} />
              session: {sessionId.slice(0, 18)}…
            </div>
          )}

          {/* Ambient overlay */}
          <div style={{
            position: 'absolute', inset: 0, borderRadius: 20, pointerEvents: 'none',
            background: 'linear-gradient(135deg, rgba(22, 199, 132, 0.05), transparent 55%, rgba(22, 199, 132, 0.02))',
          }} />
        </div>
      )}
    </div>
  );
};

export { FloatingAiAssistant };
