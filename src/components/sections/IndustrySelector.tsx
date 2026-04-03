'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import RevealOnScroll from '@/components/ui/RevealOnScroll'
import { industries } from '@/lib/constants'

export default function IndustrySelector() {
  const [active, setActive] = useState(industries[0])

  return (
    <section id="industries" style={{
      background: 'var(--color-white)',
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
              BUILT FOR YOUR WORLD
            </div>
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: 'clamp(32px, 5vw, 52px)',
              lineHeight: 1.1,
              color: 'var(--color-ink)',
            }}>
              Built for Businesses That Can&apos;t Afford to Miss a Lead.
            </h2>
          </div>
        </RevealOnScroll>

        {/* Pills */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 10,
          marginBottom: 40,
        }} className="industry-pills-row">
          {industries.map(ind => (
            <button
              key={ind.id}
              onClick={() => setActive(ind)}
              style={{
                fontSize: 12,
                fontWeight: 600,
                padding: '10px 20px',
                borderRadius: 100,
                border: `1px solid ${active.id === ind.id ? 'var(--color-ink)' : 'var(--color-border)'}`,
                background: active.id === ind.id ? 'var(--color-ink)' : 'var(--color-white)',
                color: active.id === ind.id ? '#fff' : 'var(--color-muted)',
                cursor: 'pointer',
                transition: 'all 0.2s',
                flexShrink: 0,
              }}
            >
              {ind.label}
            </button>
          ))}
        </div>

        {/* Panel */}
        <AnimatePresence mode="wait">
          <motion.div
            key={active.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 40,
              background: 'var(--color-surface)',
              borderRadius: 16,
              padding: 40,
            }}
            className="industry-panel-grid"
          >
            <div>
              <p style={{
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color: 'var(--color-danger)',
                marginBottom: 12,
              }}>
                THE PROBLEM
              </p>
              <p style={{
                fontFamily: 'var(--font-display)',
                fontSize: 20,
                fontWeight: 500,
                color: 'var(--color-ink)',
                lineHeight: 1.4,
              }}>
                {active.pain}
              </p>
            </div>
            <div>
              <p style={{
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color: 'var(--color-accent)',
                marginBottom: 12,
              }}>
                THE FIX
              </p>
              <p style={{
                fontFamily: 'var(--font-display)',
                fontSize: 20,
                fontWeight: 500,
                color: 'var(--color-ink)',
                lineHeight: 1.4,
              }}>
                {active.fix}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
      <style>{`
        @media (max-width: 768px) {
          .industry-pills-row {
            flex-wrap: nowrap !important;
            overflow-x: auto !important;
            -ms-overflow-style: none !important;
            scrollbar-width: none !important;
          }
          .industry-pills-row::-webkit-scrollbar { display: none !important; }
          .industry-panel-grid { grid-template-columns: 1fr !important; gap: 24px !important; padding: 24px !important; }
        }
      `}</style>
    </section>
  )
}
