'use client'
import { motion } from 'framer-motion'
import RevealOnScroll from '@/components/ui/RevealOnScroll'

const steps = [
  {
    number: '01',
    title: 'Book Your Free AI Audit',
    body: 'We map your current workflow, identify your biggest leaks, and build a clear picture of where AI fits. No prep needed.',
    time: '30 minutes',
  },
  {
    number: '02',
    title: 'We Build & Configure Your Systems',
    body: 'We handle everything from setup to integration, training, and testing. You don\'t need to be technical.',
    time: '3–7 business days',
  },
  {
    number: '03',
    title: 'Your Business Runs Smarter',
    body: 'Systems go live. Leads get followed up. Bookings come in. Reviews stack up. You get back your time.',
    time: 'Ongoing (Automated)',
  },
]

export default function HowItWorks() {
  return (
    <section id="how-it-works" style={{
      background: 'var(--color-surface)',
      padding: 'var(--section-py) 24px',
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <RevealOnScroll>
          <div style={{ marginBottom: 64, maxWidth: 560 }}>
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
              THE PROCESS
            </div>
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: 'clamp(32px, 5vw, 52px)',
              lineHeight: 1.1,
              color: 'var(--color-ink)',
              marginBottom: 16,
            }}>
              From Audit to Automation in Under a Week.
            </h2>
            <p style={{ color: 'var(--color-muted)', lineHeight: 1.7 }}>
              You don&apos;t need to understand AI to benefit from it. We translate your workflow into systems that work while you sleep.
            </p>
          </div>
        </RevealOnScroll>

        <div style={{ position: 'relative', marginTop: 40 }}>
          
          {/* Desktop Timeline Line */}
          <div className="hidden md:block" style={{
            position: 'absolute',
            top: 39,
            left: '16.66%',
            right: '16.66%',
            height: 2,
            background: 'rgba(13,17,23,0.08)',
            zIndex: 0,
          }}>
            <motion.div 
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true, margin: '-10% 0px' }}
              transition={{ duration: 1.5, ease: "easeInOut", delay: 0.2 }}
              style={{
                width: '100%',
                height: '100%',
                background: 'var(--color-ink)',
                zIndex: 1,
                transformOrigin: 'left'
              }}
            />
          </div>

          {/* Mobile Timeline Line */}
          <div className="block md:hidden" style={{
            position: 'absolute',
            top: 40,
            bottom: 40,
            left: 39,
            width: 2,
            background: 'rgba(13,17,23,0.08)',
            zIndex: 0,
          }}>
            <motion.div 
              initial={{ scaleY: 0 }}
              whileInView={{ scaleY: 1 }}
              viewport={{ once: true, margin: '-10% 0px' }}
              transition={{ duration: 1.5, ease: "easeInOut", delay: 0.2 }}
              style={{
                width: '100%',
                height: '100%',
                background: 'var(--color-ink)',
                zIndex: 1,
                transformOrigin: 'top'
              }}
            />
          </div>

          <div style={{
            display: 'grid',
            gap: 24,
            position: 'relative',
            zIndex: 2,
          }} className="steps-grid">
            {steps.map((step, i) => (
              <div key={i} className="step-card">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: i * 0.4 + 0.2, type: "spring", stiffness: 120 }}
                  className="step-circle"
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    background: 'var(--color-surface)',
                    border: '2px solid var(--color-ink)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
                    flexShrink: 0,
                    position: 'relative',
                  }}
                >
                   <span style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800, color: 'var(--color-ink)' }}>
                     {i + 1}
                   </span>
                   {/* Ripple pulse behind the circle */}
                   <motion.div
                     initial={{ opacity: 0, scale: 0.8 }}
                     whileInView={{ opacity: [0, 0.4, 0], scale: [0.8, 1.4, 1.8] }}
                     transition={{ duration: 2, delay: i * 0.4 + 0.8, ease: "easeOut" }}
                     style={{
                       position: 'absolute',
                       inset: -2,
                       borderRadius: '50%',
                       border: '2px solid var(--color-ink)',
                       zIndex: -1,
                     }}
                   />
                </motion.div>

                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: i * 0.4 + 0.4 }}
                  className="step-content"
                >
                  <h3 style={{
                    fontFamily: 'var(--font-display)',
                    fontWeight: 700,
                    fontSize: 20,
                    color: 'var(--color-ink)',
                    marginBottom: 12,
                  }}>
                    {step.title}
                  </h3>
                  <p style={{
                    fontSize: 15,
                    color: 'var(--color-muted)',
                    lineHeight: 1.6,
                    marginBottom: 20,
                    maxWidth: 320,
                  }}>
                    {step.body}
                  </p>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    height: 28,
                    padding: '0 14px',
                    borderRadius: 100,
                    background: 'rgba(22,199,132,0.1)',
                    color: 'var(--color-accent)',
                    fontSize: 12,
                    fontWeight: 700,
                  }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--color-accent)' }} />
                    {step.time}
                  </span>
                </motion.div>
              </div>
            ))}
          </div>
        </div>

        <RevealOnScroll delay={0.4}>
          <div style={{ textAlign: 'center', marginTop: 64 }}>
            <button
              data-cal-link="mytaskengine/30min"
              data-cal-namespace="30min"
              data-cal-config='{"layout":"month_view","useSlotsViewOnSmallScreen":"true","theme":"dark"}'
              style={{
                marginTop: 40,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                height: 52,
                padding: '0 32px',
                background: 'var(--color-ink)',
                color: '#fff',
                fontSize: 15,
                fontWeight: 600,
                borderRadius: 12,
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'inherit',
                transition: 'transform 0.2s, background 0.2s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'scale(1.02)'
                e.currentTarget.style.background = '#1a2030'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'scale(1)'
                e.currentTarget.style.background = 'var(--color-ink)'
              }}
            >
              Start With Step 1 <span>→</span>
            </button>
          </div>
        </RevealOnScroll>
      </div>
      <style>{`
        .steps-grid { grid-template-columns: repeat(3, 1fr); }
        .step-card { display: flex; flex-direction: column; align-items: center; text-align: center; }
        .step-circle { margin-bottom: 24px; }
        .step-content p { margin-left: auto; margin-right: auto; }

        @media (max-width: 768px) {
          .steps-grid { grid-template-columns: 1fr; gap: 48px !important; }
          .step-card { flex-direction: row; align-items: flex-start; text-align: left; gap: 24px; }
          .step-circle { margin-bottom: 0; }
          .step-content p { margin-left: 0; margin-right: 0; }
        }
      `}</style>
    </section>
  )
}
