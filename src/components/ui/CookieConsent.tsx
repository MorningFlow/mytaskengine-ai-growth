'use client';

import { useEffect, useState } from 'react';

/* ─── Constants ─────────────────────────────────────────────────────────────── */
export const CONSENT_KEY = 'mte_cookie_consent';
export const CONSENT_EVENT = 'mte:consent-update';

export type ConsentValue = 'accepted' | 'declined';

/** Read the stored consent value synchronously (safe to call in useEffect). */
export function getStoredConsent(): ConsentValue | null {
  try {
    return (localStorage.getItem(CONSENT_KEY) as ConsentValue) ?? null;
  } catch {
    return null;
  }
}

/** Persist the choice and notify all listeners. */
export function setConsent(value: ConsentValue) {
  try {
    localStorage.setItem(CONSENT_KEY, value);
  } catch { /* private-browsing fallback */ }
  window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: value }));
}

/* ─── Scoped styles ─────────────────────────────────────────────────────────── */
const STYLES = `
  @keyframes mte-cookie-slide-up {
    from { opacity: 0; transform: translateY(24px); }
    to   { opacity: 1; transform: translateY(0);    }
  }
  @keyframes mte-cookie-slide-down {
    from { opacity: 1; transform: translateY(0);    }
    to   { opacity: 0; transform: translateY(24px); }
  }
  .mte-cookie-wrap {
    animation: mte-cookie-slide-up 0.42s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  }
  .mte-cookie-wrap.dismissing {
    animation: mte-cookie-slide-down 0.32s cubic-bezier(0.55, 0, 1, 0.45) forwards;
  }
  .mte-cookie-accept {
    transition: transform 0.18s ease, box-shadow 0.18s ease, background 0.18s ease;
  }
  .mte-cookie-accept:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 24px rgba(22, 199, 132, 0.55) !important;
  }
  .mte-cookie-accept:active {
    transform: scale(0.97) translateY(0);
  }
  .mte-cookie-decline {
    transition: background 0.18s ease, color 0.18s ease;
  }
  .mte-cookie-decline:hover {
    background: rgba(255,255,255,0.08) !important;
    color: rgba(255,255,255,0.9) !important;
  }
`;

function useInjectStyles() {
  useEffect(() => {
    if (document.getElementById('mte-cookie-styles')) return;
    const tag = document.createElement('style');
    tag.id = 'mte-cookie-styles';
    tag.textContent = STYLES;
    document.head.appendChild(tag);
  }, []);
}

/* ─── Component ─────────────────────────────────────────────────────────────── */
export default function CookieConsent() {
  useInjectStyles();

  // null → undecided (banner shown)
  const [consent, setConsentState] = useState<ConsentValue | null | 'loading'>('loading');
  const [dismissing, setDismissing] = useState(false);

  useEffect(() => {
    // Hydrate from storage after mount to avoid SSR mismatch
    setConsentState(getStoredConsent());
  }, []);

  if (consent !== null) return null; // Already decided (or still loading — renders nothing)

  function handleChoice(value: ConsentValue) {
    setDismissing(true);
    // Let the slide-down animation finish before unmounting
    setTimeout(() => {
      setConsent(value);
      setConsentState(value);
      setDismissing(false);
    }, 340);
  }

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-label="Cookie consent"
      className={`mte-cookie-wrap${dismissing ? ' dismissing' : ''}`}
      style={{
        position: 'fixed',
        bottom: 20,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 10500,
        width: 'min(640px, calc(100vw - 32px))',
        background: 'rgba(13, 17, 23, 0.92)',
        backdropFilter: 'blur(28px) saturate(180%)',
        WebkitBackdropFilter: 'blur(28px) saturate(180%)',
        border: '1px solid rgba(255, 255, 255, 0.10)',
        boxShadow:
          '0 0 0 0.5px rgba(255,255,255,0.04) inset, 0 1px 0 rgba(255,255,255,0.10) inset, 0 24px 64px rgba(0,0,0,0.6)',
        borderRadius: 20,
        padding: '20px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
      }}
    >
      {/* Top row: icon + text */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
        {/* Cookie icon */}
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: 'rgba(22, 199, 132, 0.12)',
            border: '1px solid rgba(22, 199, 132, 0.22)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            marginTop: 2,
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10"
              stroke="#16C784"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M12 2a9.96 9.96 0 0 1 10 8.5"
              stroke="#16C784"
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray="2 3"
            />
            <circle cx="9"  cy="10" r="1.25" fill="#16C784" />
            <circle cx="14" cy="15" r="1.25" fill="#16C784" />
            <circle cx="15" cy="9"  r="1"    fill="#16C784" opacity="0.6" />
            <circle cx="10" cy="14" r="0.75" fill="#16C784" opacity="0.5" />
          </svg>
        </div>

        <div>
          <p
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: '#fff',
              marginBottom: 5,
              lineHeight: 1.3,
              fontFamily: 'var(--font-body)',
            }}
          >
            We use cookies &amp; third-party services
          </p>
          <p
            style={{
              fontSize: 13,
              color: 'rgba(255,255,255,0.45)',
              lineHeight: 1.65,
              fontFamily: 'var(--font-body)',
              margin: 0,
            }}
          >
            We use{' '}
            <strong style={{ color: 'rgba(255,255,255,0.6)', fontWeight: 500 }}>Cal.com</strong>{' '}
            for booking and{' '}
            <strong style={{ color: 'rgba(255,255,255,0.6)', fontWeight: 500 }}>Deepgram</strong>{' '}
            for our voice demo — both load only with your consent. See our{' '}
            <a
              href="/cookies"
              style={{
                color: '#16C784',
                textDecoration: 'underline',
                textUnderlineOffset: 3,
                fontWeight: 500,
              }}
            >
              Cookie Policy
            </a>{' '}
            for details.
          </p>
        </div>
      </div>

      {/* Button row */}
      <div
        style={{
          display: 'flex',
          gap: 10,
          justifyContent: 'flex-end',
          flexWrap: 'wrap',
        }}
      >
        <button
          className="mte-cookie-decline"
          onClick={() => handleChoice('declined')}
          style={{
            height: 38,
            padding: '0 18px',
            borderRadius: 10,
            border: '1px solid rgba(255,255,255,0.12)',
            background: 'transparent',
            color: 'rgba(255,255,255,0.5)',
            fontSize: 13,
            fontWeight: 500,
            cursor: 'pointer',
            fontFamily: 'var(--font-body)',
            whiteSpace: 'nowrap',
          }}
        >
          Essential only
        </button>

        <button
          className="mte-cookie-accept"
          onClick={() => handleChoice('accepted')}
          style={{
            height: 38,
            padding: '0 22px',
            borderRadius: 10,
            border: 'none',
            background: '#16C784',
            color: '#0D1117',
            fontSize: 13,
            fontWeight: 700,
            cursor: 'pointer',
            fontFamily: 'var(--font-body)',
            boxShadow: '0 4px 16px rgba(22, 199, 132, 0.4)',
            whiteSpace: 'nowrap',
          }}
        >
          Accept all
        </button>
      </div>
    </div>
  );
}
