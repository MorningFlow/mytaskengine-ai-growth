'use client';

import AnimatedCounter from '@/components/ui/AnimatedCounter';
import MetaTechProviderBadge from '@/components/ui/MetaTechProviderBadge';

const stats = [
  { end: 47, suffix: '+', label: 'Businesses automated' },
  { end: 5, prefix: '< ', suffix: ' days', label: 'Average deployment' },
  { end: 3.1, suffix: '×', label: 'Lead response rate', decimals: 1 },
  { end: 0, prefix: '$', suffix: '', label: 'Cost to audit' },
];

export default function TrustBar() {
  return (
    <section style={{
      borderTop: '1px solid var(--color-border)',
      borderBottom: '1px solid var(--color-border)',
      background: 'var(--color-white)',
      padding: '24px 20px',
    }}>
      <div style={{
        maxWidth: 1200,
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 18,
      }}>
        {/* Clean, Subtle & Prominent Meta Tech Provider Strip */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 12,
          background: 'rgba(0, 0, 0, 0.02)',
          border: '1px solid rgba(0, 0, 0, 0.07)',
          borderRadius: 100,
          padding: '5px 16px',
        }}>
          <MetaTechProviderBadge height={18} />
          <span style={{
            fontSize: 12,
            fontWeight: 500,
            color: 'var(--color-muted)',
            borderLeft: '1px solid rgba(0, 0, 0, 0.1)',
            paddingLeft: 10,
            whiteSpace: 'nowrap',
          }}>
            Official API Architecture
          </span>
        </div>

        {/* Core Metric Counters Grid */}
        <div style={{
          width: '100%',
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 24,
        }} className="trust-bar-grid">
          {stats.map((s, i) => (
            <div key={i} style={{ textAlign: 'center', padding: '4px 0' }}>
              <p style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: 28,
                color: 'var(--color-ink)',
                margin: 0,
              }}>
                <AnimatedCounter
                  end={s.end}
                  prefix={s.prefix}
                  suffix={s.suffix}
                  decimals={s.decimals ?? 0}
                />
              </p>
              <p style={{ fontSize: 12, fontWeight: 500, color: 'var(--color-muted)', marginTop: 4, margin: '4px 0 0' }}>
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .trust-bar-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 16px !important; }
        }
      `}</style>
      <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--color-muted)', marginTop: 12, opacity: 0.6, margin: '12px 0 0' }}>
        * Internal data as of August 2026. Results vary by business type and engagement scope.
      </p>
    </section>
  );
}
