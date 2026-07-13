'use client'
import RevealOnScroll from '@/components/ui/RevealOnScroll'

const pains = [
  { scenario: 'A lead calls after hours.', consequence: 'They book your competitor by morning.' },
  { scenario: 'A DM comes in at midnight.', consequence: 'You reply at 9am. They\'ve moved on.' },
  { scenario: 'A past client goes cold.', consequence: 'You meant to follow up. Never did.' },
  { scenario: 'A happy client leaves without a review.', consequence: 'Your next prospect never finds you.' },
  { scenario: 'You run ads. Leads come in.', consequence: 'No one follows up fast enough. They die.' },
  { scenario: 'You chase every booking manually.', consequence: '3 hours a day on tasks a bot should handle.' },
]

export default function ProblemSection() {
  return (
    <section id="problem" style={{
      background: 'var(--color-ink)',
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
              THE REAL COST OF DOING IT MANUALLY
            </div>
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: 'clamp(32px, 5vw, 52px)',
              lineHeight: 1.1,
              letterSpacing: '-0.01em',
              color: '#fff',
              maxWidth: 560,
            }}>
              This is what running on manual actually costs.
            </h2>
          </div>
        </RevealOnScroll>

        {/* Pain grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 16,
        }} className="pain-grid-container">
          {pains.map((pain, i) => (
            <RevealOnScroll key={i} delay={i * 0.06}>
              <div style={{
                background: 'rgba(255,255,255,0.04)',
                borderLeft: '2px solid var(--color-danger)',
                borderRadius: '0 8px 8px 0',
                padding: '20px 18px',
                transition: 'border-color 0.3s, background 0.3s, transform 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
                cursor: 'default',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderLeftColor = 'rgba(255,255,255,0.6)'
                e.currentTarget.style.background = 'rgba(255,255,255,0.08)'
                e.currentTarget.style.transform = 'translateX(6px)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderLeftColor = 'var(--color-danger)'
                e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
                e.currentTarget.style.transform = 'translateX(0)'
              }}
              >
                <p style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 4 }}>
                  {pain.scenario}
                </p>
                <p style={{ fontSize: 13, fontWeight: 400, color: 'rgba(255,255,255,0.5)' }}>
                  {pain.consequence}
                </p>
              </div>
            </RevealOnScroll>
          ))}
        </div>

        {/* Bridge */}
        <RevealOnScroll delay={0.4}>
          <div style={{ marginTop: 48 }}>
            <hr style={{ border: 'none', height: 1, background: 'rgba(255,255,255,0.1)', marginBottom: 20 }} />
            <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.3)', maxWidth: 640, lineHeight: 1.7 }}>
              Every unanswered message, every cold lead, and every missed review compounds.
              The Engine Room closes those gaps automatically.
            </p>
          </div>
        </RevealOnScroll>
      </div>
      <style>{`
        @media (max-width: 768px) {
          .pain-grid-container { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  )
}
