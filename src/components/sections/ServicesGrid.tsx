'use client'
import RevealOnScroll from '@/components/ui/RevealOnScroll'
import GlowCard from '@/components/ui/GlowCard'
import { services } from '@/lib/constants'

export default function ServicesGrid() {
  const aiServices = services.filter(s => s.category === 'ai')
  const growthServices = services.filter(s => s.category === 'growth')

  return (
    <section id="services" style={{
      background: 'var(--color-surface)',
      padding: 'var(--section-py) 24px',
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <RevealOnScroll>
          <div style={{ marginBottom: 48 }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              color: 'var(--color-accent)',
              fontSize: 12,
              fontWeight: 500,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              marginBottom: 16,
            }}>
              <span style={{ width: 24, height: 1, background: 'var(--color-accent)', display: 'inline-block' }} />
              WHAT WE BUILD
            </div>
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: 'clamp(32px, 5vw, 52px)',
              lineHeight: 1.1,
              color: 'var(--color-ink)',
              maxWidth: 700,
            }}>
              Step Inside The Engine Room.
            </h2>
          </div>
        </RevealOnScroll>

        {/* AI Systems */}
        <p style={{
          fontSize: 11,
          fontWeight: 500,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: 'var(--color-muted)',
          marginBottom: 20,
        }}>
          AI SYSTEMS
        </p>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 24,
          marginBottom: 48,
        }} className="services-grid-2">
          {aiServices.map((s, i) => (
            <RevealOnScroll key={s.name} delay={i * 0.07}>
              <GlowCard
                style={{
                  background: 'var(--color-white)',
                  border: '1px solid var(--color-border)',
                }}
              >
                <div style={{ padding: 28 }}>
                  <h3 style={{
                    fontFamily: 'var(--font-display)',
                    fontWeight: 600,
                    fontSize: 18,
                    color: 'var(--color-ink)',
                    marginBottom: 10,
                  }}>
                    {s.name}
                  </h3>
                  <p style={{ fontSize: 14, color: 'rgba(13,17,23,0.8)', lineHeight: 1.6, marginBottom: 16 }}>
                    {s.hook}
                  </p>
                  <p style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    gap: 8,
                    fontSize: 12,
                    color: 'var(--color-muted)',
                  }}>
                    <span style={{
                      display: 'inline-block',
                      width: 5,
                      height: 5,
                      borderRadius: '50%',
                      background: 'var(--color-accent)',
                      flexShrink: 0,
                      position: 'relative',
                      top: -1,
                    }} />
                    {s.for}
                  </p>
                </div>
              </GlowCard>
            </RevealOnScroll>
          ))}
        </div>

        {/* Growth Infrastructure */}
        <p style={{
          fontSize: 11,
          fontWeight: 500,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: 'var(--color-muted)',
          marginBottom: 20,
        }}>
          GROWTH INFRASTRUCTURE
        </p>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 24,
        }} className="services-grid-3">
          {growthServices.map((s, i) => (
            <RevealOnScroll key={s.name} delay={i * 0.07}>
              <GlowCard
                style={{
                  background: 'var(--color-white)',
                  border: '1px solid var(--color-border)',
                }}
              >
                <div style={{ padding: 28 }}>
                  <h3 style={{
                    fontFamily: 'var(--font-display)',
                    fontWeight: 600,
                    fontSize: 18,
                    color: 'var(--color-ink)',
                    marginBottom: 10,
                  }}>
                    {s.name}
                  </h3>
                  <p style={{ fontSize: 14, color: 'rgba(13,17,23,0.8)', lineHeight: 1.6, marginBottom: 16 }}>
                    {s.hook}
                  </p>
                  <p style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    gap: 8,
                    fontSize: 12,
                    color: 'var(--color-muted)',
                  }}>
                    <span style={{
                      display: 'inline-block',
                      width: 5,
                      height: 5,
                      borderRadius: '50%',
                      background: 'var(--color-accent)',
                      flexShrink: 0,
                      position: 'relative',
                      top: -1,
                    }} />
                    {s.for}
                  </p>
                </div>
              </GlowCard>
            </RevealOnScroll>
          ))}
        </div>
      </div>
      <style>{`
        @media (max-width: 768px) {
          .services-grid-2 { grid-template-columns: 1fr !important; }
          .services-grid-3 { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  )
}
