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
        gap: 20,
      }}>
        {/* Official Meta Tech Provider Authority Pill */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 10,
          background: 'rgba(0, 0, 0, 0.025)',
          border: '1px solid rgba(0, 0, 0, 0.08)',
          borderRadius: 100,
          padding: '4px 16px 4px 6px',
          boxShadow: '0 1px 6px rgba(0, 0, 0, 0.02)',
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: 100,
            padding: '2px 8px',
            display: 'flex',
            alignItems: 'center',
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
            border: '1px solid rgba(0,0,0,0.06)',
          }}>
            <Image
              src="/meta-tech-provider.png"
              alt="Official Meta Tech Provider"
              width={76}
              height={30}
              priority
              style={{ objectFit: 'contain', height: 20, width: 'auto' }}
            />
          </div>
          <span style={{
            fontSize: 12,
            fontWeight: 600,
            color: 'var(--color-ink)',
            letterSpacing: '-0.01em',
          }}>
            Official Meta Tech Provider · Verified Graph & Messenger API Architecture
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
      <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--color-muted)', marginTop: 14, opacity: 0.6, margin: '14px 0 0' }}>
        * Internal data as of August 2026. Results vary by business type and engagement scope.
      </p>
    </section>
  );
}
