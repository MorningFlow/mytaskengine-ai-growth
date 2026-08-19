'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[MyTaskEngine Error]', error)
  }, [error])

  return (
    <>
      <style>{`
        .err-btn:hover { transform: translateY(-1px) !important; box-shadow: 0 6px 24px rgba(22,199,132,0.5) !important; }
        .err-retry:hover { background: rgba(255,255,255,0.09) !important; color: rgba(255,255,255,0.9) !important; }
      `}</style>
      <main style={{
        minHeight: '100vh',
        background: 'var(--color-ink)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '80px 24px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.03, pointerEvents: 'none',
          backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }} />

        <div style={{ position: 'relative', textAlign: 'center', maxWidth: 520 }}>
          {/* Icon */}
          <div style={{
            width: 72, height: 72, borderRadius: 20,
            background: 'rgba(226,75,74,0.12)',
            border: '1px solid rgba(226,75,74,0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 28px',
          }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#E24B4A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </div>

          <div style={{
            width: 48, height: 2, background: '#E24B4A',
            margin: '0 auto 28px', borderRadius: 2,
          }} />

          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            fontSize: 'clamp(24px, 4vw, 36px)',
            color: '#fff',
            letterSpacing: '-0.02em',
            marginBottom: 16,
          }}>
            Something went wrong
          </h1>

          <p style={{
            fontSize: 15,
            color: 'rgba(255,255,255,0.45)',
            lineHeight: 1.7,
            marginBottom: 40,
            fontFamily: 'var(--font-body)',
          }}>
            An unexpected error occurred. Our team has been notified.
            You can try again or return to the home page.
          </p>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={reset}
              className="err-btn"
              style={{
                height: 48, padding: '0 28px',
                background: '#16C784', color: '#0D1117',
                fontSize: 14, fontWeight: 700,
                borderRadius: 12, border: 'none', cursor: 'pointer',
                fontFamily: 'var(--font-body)',
                boxShadow: '0 4px 20px rgba(22,199,132,0.35)',
                transition: 'transform 0.2s, box-shadow 0.2s',
              }}
            >
              Try again
            </button>
            <Link
              href="/"
              className="err-retry"
              style={{
                display: 'inline-flex', alignItems: 'center',
                height: 48, padding: '0 24px',
                background: 'rgba(255,255,255,0.05)',
                color: 'rgba(255,255,255,0.6)',
                fontSize: 14, fontWeight: 500,
                borderRadius: 12, textDecoration: 'none',
                border: '1px solid rgba(255,255,255,0.1)',
                fontFamily: 'var(--font-body)',
                transition: 'background 0.2s, color 0.2s',
              }}
            >
              ← Home
            </Link>
          </div>

          {process.env.NODE_ENV === 'development' && error?.message && (
            <p style={{
              marginTop: 32, fontSize: 11, color: 'rgba(255,255,255,0.2)',
              fontFamily: 'monospace', wordBreak: 'break-all',
            }}>
              {error.message}
            </p>
          )}
        </div>
      </main>
    </>
  )
}
