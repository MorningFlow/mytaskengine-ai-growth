'use client'
import RevealOnScroll from '@/components/ui/RevealOnScroll'
import { comparison } from '@/lib/constants'

export default function BeforeAfter() {
  return (
    <section style={{
      background: 'var(--color-white)',
      padding: 'var(--section-py) 24px',
    }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
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
              TWO WAYS TO RUN A BUSINESS
            </div>
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: 'clamp(32px, 5vw, 52px)',
              lineHeight: 1.1,
              color: 'var(--color-ink)',
            }}>
              One is costing you clients.
            </h2>
          </div>
        </RevealOnScroll>

        <div style={{
          border: '1px solid var(--color-border)',
          borderRadius: 16,
          overflow: 'hidden',
        }}>
          {/* Header */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }} className="ba-grid">
            <div style={{
              background: 'var(--color-surface)',
              padding: '12px 24px',
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: 'var(--color-muted)',
            }}>
              Without The Engine Room
            </div>
            <div style={{
              background: 'var(--color-ink)',
              padding: '12px 24px',
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.6)',
            }}>
              With The Engine Room
            </div>
          </div>

          {/* Rows */}
          {comparison.map((row, i) => (
            <RevealOnScroll key={i} delay={i * 0.05}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                borderTop: '0.5px solid #F3F4F6',
              }} className="ba-grid">
                <div style={{
                  padding: '16px 24px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 10,
                  background: '#fff',
                }}>
                  <span style={{ color: 'var(--color-danger)', fontWeight: 700, fontSize: 13, flexShrink: 0, marginTop: 1 }}>✗</span>
                  <p style={{ fontSize: 14, color: 'var(--color-muted)' }}>{row.without}</p>
                </div>
                <div style={{
                  padding: '16px 24px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 10,
                  background: '#F9FAFB',
                }}>
                  <span style={{ color: 'var(--color-accent)', fontWeight: 700, fontSize: 13, flexShrink: 0, marginTop: 1 }}>✓</span>
                  <p style={{ fontSize: 14, color: 'var(--color-ink)', fontWeight: 500 }}>{row.with}</p>
                </div>
              </div>
            </RevealOnScroll>
          ))}

          {/* Footer */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            borderTop: '1px solid var(--color-border)',
          }} className="ba-grid">
            <div style={{
              padding: '20px 24px',
              background: '#fff',
              fontStyle: 'italic',
              color: 'var(--color-muted)',
              fontSize: 14,
            }}>
              Your day is full of tasks that don&apos;t grow the business.
            </div>
            <div style={{
              padding: '20px 24px',
              background: 'rgba(22,199,132,0.1)',
              borderLeft: '2px solid var(--color-accent)',
            }}>
              <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-ink)' }}>
                Your systems run the busywork. You run the business.
              </p>
            </div>
          </div>
        </div>
      </div>
      <style>{`
        @media (max-width: 640px) {
          .ba-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  )
}
