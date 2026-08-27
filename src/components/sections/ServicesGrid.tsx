'use client'
import { useState } from 'react'
import dynamic from 'next/dynamic'
import RevealOnScroll from '@/components/ui/RevealOnScroll'
import GlowCard from '@/components/ui/GlowCard'
import { services } from '@/lib/constants'
import { OriginButton } from '@/components/ui/origin-button'
import { ArrowRight, ExternalLink, Mic } from 'lucide-react'
import MetaTechProviderBadge from '@/components/ui/MetaTechProviderBadge'

const VoiceReceptionistDemo = dynamic(
  () => import('@/components/ui/VoiceReceptionistDemo'),
  { ssr: false }
)

type Service = (typeof services)[number]

export default function ServicesGrid() {
  const [voiceDemoOpen, setVoiceDemoOpen] = useState(false)
  const aiServices = services.filter(s => s.category === 'ai')
  const buildServices = services.filter(s => s.category === 'build')

  return (
    <section id="services" style={{
      background: 'var(--color-surface)',
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
              WHAT WE BUILD
            </div>
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: 'clamp(32px, 5vw, 52px)',
              lineHeight: 1.1,
              color: 'var(--color-ink)',
              maxWidth: 700,
            }}>
              Step Inside The Engine Room.
            </h2>
          </div>
        </RevealOnScroll>

        {/* AI Systems */}
        <p style={{
          fontSize: 11,
          fontWeight: 500,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: 'var(--color-muted)',
          marginBottom: 20,
        }}>
          AI SYSTEMS
        </p>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 24,
          marginBottom: 48,
        }} className="services-grid-2">
          {aiServices.map((s, i) => {
            const svc = s as Service & { demoUrl?: string; demoLabel?: string }
            return (
              <RevealOnScroll key={s.name} delay={i * 0.07}>
                <GlowCard
                  style={{
                    background: 'var(--color-white)',
                    border: '1px solid var(--color-border)',
                    height: '100%',
                  }}
                >
                  <div style={{ padding: 28, display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, marginBottom: 10 }}>
                      <h3 style={{
                        fontFamily: 'var(--font-display)',
                        fontWeight: 600,
                        fontSize: 18,
                        color: 'var(--color-ink)',
                        margin: 0,
                      }}>
                        {s.name}
                      </h3>
                      {s.name === 'DM Setter Engine' && (
                        <div
                          title="Official Meta Tech Provider"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            flexShrink: 0,
                          }}
                        >
                          <MetaTechProviderBadge height={16} />
                        </div>
                      )}
                    </div>
                    <p style={{ fontSize: 14, color: 'rgba(13,17,23,0.8)', lineHeight: 1.6, marginBottom: 16 }}>
                      {s.hook}
                    </p>
                    <p style={{
                      display: 'flex',
                      alignItems: 'baseline',
                      gap: 8,
                      fontSize: 12,
                      color: 'var(--color-muted)',
                      marginBottom: (svc.demoUrl || (svc as any).demoType === 'voice-receptionist') ? 16 : 0,
                    }}>
                      <span style={{
                        display: 'inline-block',
                        width: 5,
                        height: 5,
                        borderRadius: '50%',
                        background: 'var(--color-accent)',
                        flexShrink: 0,
                        position: 'relative',
                        top: -1,
                      }} />
                      {s.for}
                    </p>

                    {s.name === 'DM Setter Engine' && (
                      <div style={{
                        fontSize: 11.5,
                        color: '#0369A1',
                        background: 'rgba(2, 132, 199, 0.05)',
                        border: '1px solid rgba(2, 132, 199, 0.16)',
                        padding: '5px 10px',
                        borderRadius: 6,
                        marginBottom: 18,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        fontWeight: 500,
                      }}>
                        <span style={{ color: '#0284C7', fontWeight: 700 }}>✓</span>
                        <span>Built on official Meta Graph APIs with zero ban risk.</span>
                      </div>
                    )}

                    {svc.demoUrl && (
                      <OriginButton
                        onClick={() => window.open(svc.demoUrl, '_blank', 'noopener,noreferrer')}
                        style={{ marginTop: 'auto', alignSelf: 'flex-start', paddingLeft: '28px', paddingRight: '28px' }}
                        className="h-10 text-sm rounded-lg border border-[#0d1117] bg-white text-[#0d1117] font-semibold"
                      >
                        <ExternalLink size={13} />
                        {svc.demoLabel ?? 'Try the demo'}
                        <ArrowRight size={13} />
                      </OriginButton>
                    )}

                    {(svc as any).demoType === 'voice-receptionist' && (
                      <OriginButton
                        onClick={() => setVoiceDemoOpen(true)}
                        style={{ marginTop: 'auto', alignSelf: 'flex-start', paddingLeft: '28px', paddingRight: '28px' }}
                        className="h-10 text-sm rounded-lg border border-[#0d1117] bg-white text-[#0d1117] font-semibold"
                      >
                        <Mic size={13} />
                        {(svc as any).demoLabel ?? 'Try the AI Receptionist'}
                        <ArrowRight size={13} />
                      </OriginButton>
                    )}
                  </div>
                </GlowCard>
              </RevealOnScroll>
            )
          })}
        </div>

        {/* Digital Products */}
        <p style={{
          fontSize: 11,
          fontWeight: 500,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: 'var(--color-muted)',
          marginBottom: 20,
        }}>
          DIGITAL PRODUCTS
        </p>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 24,
        }} className="services-grid-2">
          {buildServices.map((s, i) => {
            const svc = s as Service & {
              playStoreLinks?: { name: string; url: string }[]
              siteLinks?: { name: string; url: string }[]
            }
            return (
              <RevealOnScroll key={s.name} delay={i * 0.07}>
                <GlowCard
                  style={{
                    background: 'var(--color-white)',
                    border: '1px solid var(--color-border)',
                    height: '100%',
                  }}
                >
                  <div style={{ padding: 28, display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <h3 style={{
                      fontFamily: 'var(--font-display)',
                      fontWeight: 600,
                      fontSize: 18,
                      color: 'var(--color-ink)',
                      marginBottom: 10,
                    }}>
                      {s.name}
                    </h3>
                    <p style={{ fontSize: 14, color: 'rgba(13,17,23,0.8)', lineHeight: 1.6, marginBottom: 16 }}>
                      {s.hook}
                    </p>
                    <p style={{
                      display: 'flex',
                      alignItems: 'baseline',
                      gap: 8,
                      fontSize: 12,
                      color: 'var(--color-muted)',
                    }}>
                      <span style={{
                        display: 'inline-block',
                        width: 5,
                        height: 5,
                        borderRadius: '50%',
                        background: 'var(--color-accent)',
                        flexShrink: 0,
                        position: 'relative',
                        top: -1,
                      }} />
                      {s.for}
                    </p>

                    {/* Sample website links */}
                    {svc.siteLinks && svc.siteLinks.length > 0 && (
                      <div style={{ marginTop: 20, display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                        {svc.siteLinks.map(site => (
                          <a
                            key={site.name}
                            href={site.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 7,
                              padding: '6px 14px',
                              borderRadius: 6,
                              border: '1px solid var(--color-border)',
                              background: 'var(--color-surface)',
                              fontSize: 12,
                              fontWeight: 600,
                              color: 'var(--color-ink)',
                              textDecoration: 'none',
                              transition: 'border-color 0.2s, color 0.2s',
                              cursor: 'pointer',
                            }}
                            onMouseEnter={e => {
                              e.currentTarget.style.borderColor = 'var(--color-accent)'
                              e.currentTarget.style.color = 'var(--color-accent)'
                            }}
                            onMouseLeave={e => {
                              e.currentTarget.style.borderColor = 'var(--color-border)'
                              e.currentTarget.style.color = 'var(--color-ink)'
                            }}
                          >
                            {/* Globe icon */}
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                              <circle cx="12" cy="12" r="10"/>
                              <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                            </svg>
                            {site.name}
                          </a>
                        ))}
                      </div>
                    )}

                    {/* Play Store badges */}
                    {svc.playStoreLinks && svc.playStoreLinks.length > 0 && (
                      <div style={{ marginTop: 20, display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                        {svc.playStoreLinks.map(app => (
                          <a
                            key={app.name}
                            href={app.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 7,
                              padding: '6px 14px',
                              borderRadius: 6,
                              border: '1px solid var(--color-border)',
                              background: 'var(--color-surface)',
                              fontSize: 12,
                              fontWeight: 600,
                              color: 'var(--color-ink)',
                              textDecoration: 'none',
                              transition: 'border-color 0.2s, color 0.2s',
                              cursor: 'pointer',
                            }}
                            onMouseEnter={e => {
                              e.currentTarget.style.borderColor = 'var(--color-accent)'
                              e.currentTarget.style.color = 'var(--color-accent)'
                            }}
                            onMouseLeave={e => {
                              e.currentTarget.style.borderColor = 'var(--color-border)'
                              e.currentTarget.style.color = 'var(--color-ink)'
                            }}
                          >
                            {/* Google Play icon */}
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M3.18 23.76c.37.21.8.22 1.19.02l12.09-6.97-2.89-2.89-10.39 9.84zm-1.01-20.1A1.64 1.64 0 0 0 2 4.58v14.84c0 .47.18.92.51 1.25l.07.07 8.31-8.31v-.19L2.17 3.66zm18.35 7.88-2.94-1.7-3.23 3.23 3.23 3.23 2.96-1.71a1.66 1.66 0 0 0 0-3.05zM4.37.22 16.46 7.2l-2.9 2.89L3.18.26A1.32 1.32 0 0 1 4.37.22z"/>
                            </svg>
                            {app.name}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </GlowCard>
              </RevealOnScroll>
            )
          })}
        </div>
      </div>

      <VoiceReceptionistDemo
        open={voiceDemoOpen}
        onClose={() => setVoiceDemoOpen(false)}
      />

      <style>{`
        @media (max-width: 768px) {
          .services-grid-2 { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  )
}
