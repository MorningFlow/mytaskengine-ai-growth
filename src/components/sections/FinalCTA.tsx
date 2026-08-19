'use client'
import RevealOnScroll from '@/components/ui/RevealOnScroll'
import GlowCard from '@/components/ui/GlowCard'

const trustPoints = [
  { label: 'No commitment', body: 'If it\'s not a fit, we\'ll tell you that on the call.' },
  { label: 'No tech knowledge needed', body: 'Describe your workflow. We handle the rest.' },
  { label: 'Results in weeks', body: 'Most systems go live in 3–7 business days.' },
]

export default function FinalCTA() {
  return (
    <section id="book" style={{
      background: 'var(--color-ink)',
      padding: 'var(--section-py) 24px',
      textAlign: 'center',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Grid bg */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.03,
          backgroundImage:
            'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
          pointerEvents: 'none',
        }}
      />

      <div style={{ position: 'relative', maxWidth: 800, margin: '0 auto' }}>
        <RevealOnScroll>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 800,
            fontSize: 'clamp(36px, 7vw, 76px)',
            lineHeight: 0.95,
            letterSpacing: '-0.02em',
            color: '#fff',
            marginBottom: 24,
          }}>
            One Conversation Could Change How Your Business Operates.
          </h2>
          <p style={{
            fontSize: 18,
            color: 'rgba(255,255,255,0.5)',
            maxWidth: 520,
            margin: '0 auto 40px',
            lineHeight: 1.7,
          }}>
            In 30 minutes, we&apos;ll map out exactly where your business is leaking
            time and money and show you the systems that fix it. No jargon.
            No hard sell. Just clarity.
          </p>
        </RevealOnScroll>

        <RevealOnScroll delay={0.1}>
          <button
            data-cal-link="mytaskengine/30min"
            data-cal-namespace="30min"
            data-cal-config='{"layout":"month_view","useSlotsViewOnSmallScreen":"true","theme":"dark"}'
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              height: 56,
              minWidth: 280,
              padding: '0 36px',
              background: 'var(--color-accent)',
              color: 'var(--color-ink)',
              fontSize: 16,
              fontWeight: 600,
              borderRadius: 16,
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'inherit',
              transition: 'transform 0.2s ease-out, box-shadow 0.2s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'scale(1.03)'
              e.currentTarget.style.boxShadow = '0 0 40px rgba(22,199,132,0.3)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'scale(1)'
              e.currentTarget.style.boxShadow = 'none'
            }}
          >
            Book My 30-Minute Free Audit <span>→</span>
          </button>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.25)', marginTop: 16 }}>
            We book a maximum of 8 audits per week. Reserve your slot.
          </p>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.18)', marginTop: 8 }}>
            By booking, you agree to our{' '}
            <a href="/terms" style={{ color: 'rgba(255,255,255,0.35)', textDecoration: 'underline', textUnderlineOffset: 3 }}>Terms of Service</a>
            {' '}and{' '}
            <a href="/privacy" style={{ color: 'rgba(255,255,255,0.35)', textDecoration: 'underline', textUnderlineOffset: 3 }}>Privacy Policy</a>.
          </p>
        </RevealOnScroll>

        {/* Trust cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 16,
          marginTop: 64,
        }} className="final-trust-grid">
          {trustPoints.map((t, i) => (
            <RevealOnScroll key={i} delay={i * 0.08}>
              <GlowCard
                glowColor="rgba(22, 199, 132, 0.45)"
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
              >
                <div style={{ padding: 20, textAlign: 'left' }}>
                  <p style={{ fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.8)', marginBottom: 6 }}>
                    {t.label}
                  </p>
                  <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', lineHeight: 1.6 }}>
                    {t.body}
                  </p>
                </div>
              </GlowCard>
            </RevealOnScroll>
          ))}
        </div>
      </div>
      <style>{`
        @media (max-width: 768px) {
          .final-trust-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  )
}
