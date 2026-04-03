'use client'
import RevealOnScroll from '@/components/ui/RevealOnScroll'
import GlowCard from '@/components/ui/GlowCard'
import { testimonials } from '@/lib/constants'

export default function Testimonials() {
  return (
    <section style={{
      background: 'var(--color-white)',
      padding: 'var(--section-py) 24px',
      paddingTop: 60,
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <RevealOnScroll>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 12,
              color: 'var(--color-accent)',
              fontSize: 12,
              fontWeight: 500,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              marginBottom: 16,
            }}>
              <span style={{ width: 24, height: 1, background: 'var(--color-accent)', display: 'inline-block' }} />
              WHAT CLIENTS SAY
            </div>
          </div>
        </RevealOnScroll>

        <div className="masonry-3">
          {testimonials.map((t, i) => (
            <RevealOnScroll key={i} delay={i * 0.06}>
              <GlowCard
                style={{
                  background: '#fff',
                  border: '1px solid var(--color-border)',
                }}
              >
                <div style={{ padding: 28 }}>
                  <span style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 48,
                    color: 'var(--color-accent)',
                    lineHeight: 1,
                    display: 'block',
                    marginBottom: 8,
                  }}>
                    &ldquo;
                  </span>
                  <p style={{
                    fontSize: 15,
                    color: 'var(--color-ink)',
                    lineHeight: 1.7,
                    marginBottom: 20,
                  }}>
                    {t.text}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 40,
                      height: 40,
                      borderRadius: 12,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontFamily: 'var(--font-display)',
                      fontSize: 16,
                      fontWeight: 700,
                      color: '#fff',
                      background: t.color,
                      flexShrink: 0,
                    }}>
                      {t.initial}
                    </div>
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-ink)' }}>{t.name}</p>
                      <p style={{ fontSize: 12, color: 'var(--color-muted)' }}>{t.role}</p>
                    </div>
                  </div>
                </div>
              </GlowCard>
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  )
}
