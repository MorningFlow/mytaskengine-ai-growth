'use client'

export default function Footer() {
  const navLinks = ['Services', 'How It Works', 'Calculator', 'FAQ']
  const legalLinks = [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Cookie Policy', href: '/cookies' },
  ]

  const linkBase: React.CSSProperties = {
    fontSize: 13,
    color: 'rgba(255,255,255,0.45)',
    textDecoration: 'none',
    transition: 'color 0.2s',
    display: 'block',
    marginBottom: 10,
  }

  return (
    <footer style={{
      background: 'var(--color-ink)',
      borderTop: '1px solid rgba(255,255,255,0.06)',
      padding: '56px 24px 32px',
    }}>
      <div style={{
        maxWidth: 1200,
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: '2fr 1fr 1fr 1fr',
        gap: 40,
        paddingBottom: 40,
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }} className="footer-grid">

        {/* Brand */}
        <div>
          <a href="/#hero" style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 800,
            fontSize: 18,
            color: '#fff',
            textDecoration: 'none',
            display: 'block',
            marginBottom: 10,
          }}>
            MyTaskEngine
          </a>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', lineHeight: 1.65, marginBottom: 16, maxWidth: 260 }}>
            AI systems that run your business while you sleep.
          </p>
          <a
            href="mailto:taskengin3@gmail.com"
            style={{
              fontSize: 13,
              color: 'rgba(255,255,255,0.45)',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              transition: 'color 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = '#16C784')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.45)')}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="20" height="16" x="2" y="4" rx="2"/>
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
            </svg>
            taskengin3@gmail.com
          </a>
        </div>

        {/* Navigation */}
        <div>
          <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', marginBottom: 16 }}>
            Product
          </p>
          {navLinks.map(link => (
            <a
              key={link}
              href={`/#${link.toLowerCase().replace(/\s+/g, '-')}`}
              style={linkBase}
              onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.45)')}
            >
              {link}
            </a>
          ))}
          <a
            href="/#book"
            style={linkBase}
            onMouseEnter={e => (e.currentTarget.style.color = '#16C784')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.45)')}
          >
            Book Free Audit
          </a>
        </div>

        {/* Legal */}
        <div>
          <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', marginBottom: 16 }}>
            Legal
          </p>
          {legalLinks.map(l => (
            <a
              key={l.href}
              href={l.href}
              style={linkBase}
              onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.45)')}
            >
              {l.label}
            </a>
          ))}
        </div>

        {/* Contact */}
        <div>
          <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', marginBottom: 16 }}>
            Contact
          </p>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', lineHeight: 1.65, marginBottom: 4 }}>
            General enquiries
          </p>
          <a href="mailto:taskengin3@gmail.com" style={{ ...linkBase, marginBottom: 16 }}
            onMouseEnter={e => (e.currentTarget.style.color = '#16C784')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.45)')}
          >
            taskengin3@gmail.com
          </a>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', lineHeight: 1.65, marginBottom: 4 }}>
            Grievance officer
          </p>
          <a href="mailto:taskengin3@gmail.com" style={{ ...linkBase }}
            onMouseEnter={e => (e.currentTarget.style.color = '#16C784')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.45)')}
          >
            taskengin3@gmail.com
          </a>
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{ maxWidth: 1200, margin: '0 auto', paddingTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.18)' }}>
          © 2026 MyTaskEngine. All rights reserved.
        </p>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.18)' }}>
          India &nbsp;·&nbsp; Built with AI
        </p>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .footer-grid { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 480px) {
          .footer-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </footer>
  )
}

