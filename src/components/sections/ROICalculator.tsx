'use client'
import { useState, useCallback } from 'react'
import { formatCurrency } from '@/lib/utils'

export default function ROICalculator() {
  const [leads, setLeads] = useState(80)
  const [dealValue, setDealValue] = useState(1500)
  const [closeRate, setCloseRate] = useState(18)

  const totalPossible = leads * dealValue * (closeRate / 100)
  const lostRev = totalPossible * 0.40
  const recLow = Math.round(lostRev * 0.20)
  const recHigh = Math.round(lostRev * 0.40)

  const getSliderBg = useCallback((value: number, min: number, max: number) => {
    const pct = ((value - min) / (max - min)) * 100
    return `linear-gradient(to right, var(--color-accent) 0%, var(--color-accent) ${pct}%, var(--color-border) ${pct}%, var(--color-border) 100%)`
  }, [])

  return (
    <section id="calculator" style={{
      background: 'var(--color-ink)',
      padding: 'var(--section-py) 24px',
    }}>
      <div style={{
        maxWidth: 1200,
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: '1fr 1.2fr',
        gap: 64,
        alignItems: 'start',
      }} className="calc-layout">
        {/* Left */}
        <div style={{ position: 'sticky', top: 120 }} className="calc-left">
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
            REVENUE CALCULATOR
          </div>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            fontSize: 'clamp(32px, 5vw, 52px)',
            lineHeight: 1.1,
            color: '#fff',
            marginBottom: 16,
          }}>
            What is manual follow-up actually costing you?
          </h2>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.4)', lineHeight: 1.7 }}>
            Enter your numbers. See the monthly revenue leaking through slow replies, cold leads, and unanswered messages.
          </p>
        </div>

        {/* Right — Calculator card */}
        <div style={{
          background: '#fff',
          borderRadius: 24,
          padding: 40,
        }}>
          {/* Leads slider */}
          <div style={{ marginBottom: 32 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <label style={{ fontSize: 13, color: 'var(--color-muted)', fontWeight: 500 }}>Monthly new leads</label>
              <span style={{
                fontSize: 13, fontWeight: 600, color: 'var(--color-ink)',
                background: 'rgba(13,17,23,0.08)', padding: '4px 8px', borderRadius: 6,
              }}>{leads}</span>
            </div>
            <input
              type="range" min={5} max={500} step={5} value={leads}
              onChange={e => setLeads(Number(e.target.value))}
              style={{ width: '100%', background: getSliderBg(leads, 5, 500) }}
            />
          </div>

          {/* Deal value input */}
          <div style={{ marginBottom: 32 }}>
            <label style={{ fontSize: 13, color: 'var(--color-muted)', fontWeight: 500, display: 'block', marginBottom: 12 }}>
              Average deal / booking value
            </label>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              border: '1px solid var(--color-border)', borderRadius: 8, padding: '8px 12px',
            }}>
              <span style={{ fontSize: 14, color: 'var(--color-muted)' }}>$</span>
              <input
                type="number" value={dealValue} min={100} step={100}
                onChange={e => setDealValue(Number(e.target.value))}
                style={{
                  flex: 1, outline: 'none', border: 'none', fontSize: 14,
                  color: 'var(--color-ink)', fontFamily: 'inherit', background: 'transparent',
                }}
              />
            </div>
          </div>

          {/* Close rate slider */}
          <div style={{ marginBottom: 32 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <label style={{ fontSize: 13, color: 'var(--color-muted)', fontWeight: 500 }}>Current close rate</label>
              <span style={{
                fontSize: 13, fontWeight: 600, color: 'var(--color-ink)',
                background: 'rgba(13,17,23,0.08)', padding: '4px 8px', borderRadius: 6,
              }}>{closeRate}%</span>
            </div>
            <input
              type="range" min={1} max={80} step={1} value={closeRate}
              onChange={e => setCloseRate(Number(e.target.value))}
              style={{ width: '100%', background: getSliderBg(closeRate, 1, 80) }}
            />
          </div>

          <hr style={{ border: 'none', height: 1, background: 'var(--color-border)', marginBottom: 32 }} />

          {/* Results */}
          <div style={{ background: '#FEF2F2', borderRadius: 14, padding: 20, marginBottom: 12 }}>
            <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#EF4444', marginBottom: 6 }}>
              ESTIMATED MONTHLY REVENUE LOST TO SLOW / MISSED FOLLOW-UP
            </p>
            <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 36, color: '#DC2626' }}>
              {formatCurrency(lostRev)}
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }} className="calc-results-grid">
            <div style={{ background: '#F0FDF4', borderRadius: 14, padding: 20, textAlign: 'center' }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: '#16A34A', marginBottom: 4 }}>Conservative recovery</p>
              <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 24, color: '#16A34A' }}>
                {formatCurrency(recLow)}
              </p>
            </div>
            <div style={{ background: '#F0FDF4', borderRadius: 14, padding: 20, textAlign: 'center' }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: '#16A34A', marginBottom: 4 }}>Optimistic recovery</p>
              <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 24, color: '#16A34A' }}>
                {formatCurrency(recHigh)}
              </p>
            </div>
          </div>

          <p style={{ fontSize: 11, color: 'var(--color-muted)', lineHeight: 1.6, marginBottom: 24 }}>
            * Industry benchmark: 30–40% of inbound leads are lost to delayed response. Recovery estimates based on average client outcomes.
          </p>

          <button
            data-cal-link="mytaskengine/30min"
            data-cal-namespace="30min"
            data-cal-config='{"layout":"month_view","useSlotsViewOnSmallScreen":"true","theme":"dark"}'
            style={{
              display: 'block',
              width: '100%',
              textAlign: 'center',
              background: 'var(--color-ink)',
              color: '#fff',
              fontWeight: 600,
              padding: '16px',
              borderRadius: 12,
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontSize: 15,
              transition: 'background 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = '#1a2030')}
            onMouseLeave={e => (e.currentTarget.style.background = 'var(--color-ink)')}
          >
            Book My Audit and See the Real Number →
          </button>
        </div>
      </div>
      <style>{`
        @media (max-width: 1024px) {
          .calc-layout { grid-template-columns: 1fr !important; gap: 40px !important; }
          .calc-left { position: static !important; }
        }
        @media (max-width: 640px) {
          .calc-results-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  )
}
