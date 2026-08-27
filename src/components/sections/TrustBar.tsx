'use client';

import Image from 'next/image';
import AnimatedCounter from '@/components/ui/AnimatedCounter';

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
        gap: 16,
      }}>
        {/* Exact Official Meta Tech Provider Badge */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Image
            src="/meta-tech-provider.png"
            alt="Meta Tech Provider"
            width={120}
            height={48}
            priority
            style={{
              height: 'auto',
              maxHeight: 44,
              width: 'auto',
              display: 'block',
            }}
          />
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
