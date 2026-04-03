'use client'

export default function Footer() {
  return (
    <footer style={{
      background: 'var(--color-ink)',
      borderTop: '1px solid rgba(255,255,255,0.06)',
      padding: '48px 24px 24px',
    }}>
      <div style={{
        maxWidth: 1200,
        margin: '0 auto',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        paddingBottom: 32,
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        flexWrap: 'wrap',
        gap: 24,
      }}>
        <div>
          <a href="#hero" style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 800,
            fontSize: 18,
            color: '#fff',
            textDecoration: 'none',
          }}>
            MyTaskEngine
          </a>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', marginTop: 6 }}>
            AI systems that run your business while you sleep.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
          {['Services', 'How It Works', 'Calculator', 'FAQ'].map(link => (
            <a
              key={link}
              href={`#${link.toLowerCase().replace(/\s+/g, '-')}`}
              style={{
                fontSize: 13,
                color: 'rgba(255,255,255,0.5)',
                textDecoration: 'none',
                transition: 'color 0.2s',
              }}
              onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.5)')}
            >
              {link}
            </a>
          ))}
        </div>
      </div>
      <div style={{ maxWidth: 1200, margin: '0 auto', paddingTop: 24 }}>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)' }}>
          © 2026 MyTaskEngine. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
