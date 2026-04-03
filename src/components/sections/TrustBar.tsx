'use client'
import AnimatedCounter from '@/components/ui/AnimatedCounter'

const stats = [
  { end: 47, suffix: '+', label: 'Businesses automated' },
  { end: 5, prefix: '< ', suffix: ' days', label: 'Average deployment' },
  { end: 3.1, suffix: '×', label: 'Lead response rate', decimals: 1 },
  { end: 0, prefix: '$', suffix: '', label: 'Cost to audit' },
]

export default function TrustBar() {
  return (
    <section style={{
      borderTop: '1px solid var(--color-border)',
      borderBottom: '1px solid var(--color-border)',
      background: 'var(--color-white)',
      padding: '24px',
    }}>
      <div style={{
        maxWidth: 1200,
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 24,
      }} className="trust-bar-grid">
        {stats.map((s, i) => (
          <div key={i} style={{ textAlign: 'center', padding: '8px 0' }}>
            <p style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: 28,
              color: 'var(--color-ink)',
            }}>
              <AnimatedCounter
                end={s.end}
                prefix={s.prefix}
                suffix={s.suffix}
                decimals={s.decimals ?? 0}
              />
            </p>
            <p style={{ fontSize: 12, fontWeight: 500, color: 'var(--color-muted)', marginTop: 4 }}>
              {s.label}
            </p>
          </div>
        ))}
      </div>
      <style>{`
        @media (max-width: 768px) {
          .trust-bar-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
    </section>
  )
}
