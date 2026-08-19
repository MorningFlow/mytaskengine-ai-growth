import Link from 'next/link'

export default function NotFound() {
  return (
    <>
      <style>{`
        @keyframes not-found-float {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-12px); }
        }
        @keyframes not-found-glow {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50%       { opacity: 0.8; transform: scale(1.08); }
        }
        .nf-cta:hover {
          transform: translateY(-2px) !important;
          box-shadow: 0 8px 32px rgba(22, 199, 132, 0.55) !important;
        }
        .nf-link:hover { color: #16C784 !important; }
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
        {/* Grid texture */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.03, pointerEvents: 'none',
          backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }} />

        {/* Ambient glow */}
        <div style={{
          position: 'absolute', top: '30%', left: '50%', transform: 'translate(-50%, -50%)',
          width: 500, height: 500, borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(22, 199, 132, 0.07) 0%, transparent 70%)',
          animation: 'not-found-glow 4s ease-in-out infinite',
          pointerEvents: 'none',
        }} />

        <div style={{ position: 'relative', textAlign: 'center', maxWidth: 560 }}>
          {/* Floating 404 */}
          <div style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 800,
            fontSize: 'clamp(96px, 20vw, 160px)',
            lineHeight: 1,
            letterSpacing: '-0.04em',
            color: 'transparent',
            WebkitTextStroke: '1px rgba(255,255,255,0.08)',
            userSelect: 'none',
            animation: 'not-found-float 4s ease-in-out infinite',
            marginBottom: 8,
          }}>
            404
          </div>

          {/* Accent line */}
          <div style={{
            width: 48, height: 2,
            background: '#16C784',
            margin: '0 auto 28px',
            borderRadius: 2,
            boxShadow: '0 0 12px rgba(22,199,132,0.6)',
          }} />

          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            fontSize: 'clamp(24px, 4vw, 36px)',
            color: '#fff',
            letterSpacing: '-0.02em',
            marginBottom: 16,
          }}>
            Page not found
          </h1>

          <p style={{
            fontSize: 16,
            color: 'rgba(255,255,255,0.45)',
            lineHeight: 1.7,
            marginBottom: 40,
            fontFamily: 'var(--font-body)',
          }}>
            The page you&apos;re looking for doesn&apos;t exist or has moved.
            Let&apos;s get you back on track.
          </p>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              href="/"
              className="nf-cta"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                height: 48,
                padding: '0 28px',
                background: '#16C784',
                color: '#0D1117',
                fontSize: 14,
                fontWeight: 700,
                borderRadius: 12,
                textDecoration: 'none',
                fontFamily: 'var(--font-body)',
                boxShadow: '0 4px 20px rgba(22, 199, 132, 0.35)',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              }}
            >
              ← Back to Home
            </Link>

            <a
              href="mailto:taskengin3@gmail.com"
              className="nf-link"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                height: 48,
                padding: '0 24px',
                background: 'rgba(255,255,255,0.05)',
                color: 'rgba(255,255,255,0.6)',
                fontSize: 14,
                fontWeight: 500,
                borderRadius: 12,
                textDecoration: 'none',
                border: '1px solid rgba(255,255,255,0.1)',
                fontFamily: 'var(--font-body)',
                transition: 'color 0.2s',
              }}
            >
              Contact Support
            </a>
          </div>
        </div>
      </main>
    </>
  )
}
