'use client'
import * as Accordion from '@radix-ui/react-accordion'
import RevealOnScroll from '@/components/ui/RevealOnScroll'
import { faqs } from '@/lib/constants'

export default function FAQ() {
  return (
    <section id="faq" style={{
      background: 'var(--color-surface)',
      padding: 'var(--section-py) 24px',
    }}>
      <div style={{ maxWidth: 680, margin: '0 auto' }}>
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
              FREQUENTLY ASKED QUESTIONS
            </div>
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: 'clamp(32px, 5vw, 52px)',
              lineHeight: 1.1,
              color: 'var(--color-ink)',
            }}>
              Questions We Get Asked Every Time.
            </h2>
          </div>
        </RevealOnScroll>

        <Accordion.Root type="single" collapsible defaultValue="item-0">
          {faqs.map((faq, i) => (
            <RevealOnScroll key={i} delay={i * 0.04}>
              <Accordion.Item
                value={`item-${i}`}
                style={{ borderBottom: '1px solid var(--color-border)' }}
              >
                <Accordion.Trigger
                  style={{
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '18px 0',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontFamily: 'inherit',
                  }}
                  className="faq-trigger"
                >
                  <span style={{
                    fontWeight: 600,
                    fontSize: 16,
                    color: 'var(--color-ink)',
                    transition: 'color 0.15s',
                  }}>
                    {faq.q}
                  </span>
                  <span
                    className="faq-icon"
                    style={{
                      fontSize: 20,
                      color: 'var(--color-muted)',
                      marginLeft: 16,
                      transition: 'transform 0.2s',
                      flexShrink: 0,
                    }}
                  >
                    +
                  </span>
                </Accordion.Trigger>
                <Accordion.Content className="animate-slideDown" style={{ overflow: 'hidden' }}>
                  <p style={{
                    fontSize: 15,
                    color: 'var(--color-muted)',
                    lineHeight: 1.7,
                    paddingBottom: 20,
                  }}>
                    {faq.a}
                  </p>
                </Accordion.Content>
              </Accordion.Item>
            </RevealOnScroll>
          ))}
        </Accordion.Root>
      </div>
      <style>{`
        .faq-trigger:hover span:first-child { color: var(--color-accent) !important; }
        [data-state="open"] .faq-icon { transform: rotate(45deg); }
      `}</style>
    </section>
  )
}
