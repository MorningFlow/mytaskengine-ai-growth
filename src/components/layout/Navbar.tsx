'use client'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrollY, setScrollY] = useState(0)
  const [introPhase, setIntroPhase] = useState<'intro' | 'transitioning' | 'done' | null>(null)
  // True once we've read the DOM — prevents flicker on homepage before Hero sets its attribute
  const [hasCheckedIntro, setHasCheckedIntro] = useState(false)

  // Read intro phase from the document root attribute set by Hero.
  // On non-hero pages (legal etc.) the attribute is never set → introPhase stays null → show nav.
  useEffect(() => {
    const root = document.documentElement
    const initial = root.getAttribute('data-intro-phase') as typeof introPhase
    setIntroPhase(initial)

    const observer = new MutationObserver(() => {
      setIntroPhase(root.getAttribute('data-intro-phase') as typeof introPhase)
    })
    observer.observe(root, { attributes: true, attributeFilter: ['data-intro-phase'] })

    // Short delay so Hero's useEffect has time to set 'intro' before we reveal the nav
    const t = setTimeout(() => setHasCheckedIntro(true), 80)
    return () => { observer.disconnect(); clearTimeout(t) }
  }, [])

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const overHero = scrollY < (typeof window !== 'undefined' ? window.innerHeight * 0.85 : 700)

  const glassBg = overHero
    ? 'rgba(13, 17, 23, 0.35)'
    : 'rgba(13, 17, 23, 0.65)'

  const glassBorder = overHero
    ? '1px solid rgba(255, 255, 255, 0.15)'
    : '1px solid rgba(255, 255, 255, 0.10)'

  const glowShadow = overHero
    ? `0 0 0 0.5px rgba(255,255,255,0.05) inset,
       0 1px 0 rgba(255,255,255,0.18) inset,
       0 8px 32px rgba(0,0,0,0.25),
       0 2px 8px rgba(0,0,0,0.15)`
    : `0 0 0 0.5px rgba(255,255,255,0.04) inset,
       0 1px 0 rgba(255,255,255,0.10) inset,
       0 8px 32px rgba(0,0,0,0.35),
       0 2px 8px rgba(0,0,0,0.25)`

  const links = [
    { label: 'Services',     href: '#services' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Calculator',   href: '#calculator' },
    { label: 'FAQ',          href: '#faq' },
  ]

  // Show nav when: on non-intro pages (null) OR after intro has transitioned/finished.
  // hasCheckedIntro prevents a flash on the homepage before Hero sets its attribute.
  const showNav = hasCheckedIntro && (introPhase === null || introPhase === 'done' || introPhase === 'transitioning')

  const isIntro = introPhase === 'intro'

  const pillStyle: React.CSSProperties = {
    background: glassBg,
    backdropFilter: 'blur(28px) saturate(180%) brightness(1.05)',
    WebkitBackdropFilter: 'blur(28px) saturate(180%) brightness(1.05)',
    border: glassBorder,
    boxShadow: glowShadow,
    transition: 'background 0.4s ease, border 0.4s ease, box-shadow 0.4s ease',
  }

  return (
    <>
      {/* ─── TOP PROGRESS BAR — Now handled strictly by Hero.tsx ─── */}
      {/* ─── NAVBAR — hidden during intro, slides in after ─── */}
      <motion.div
        initial={{ y: -80, opacity: 0, scale: 0.96 }}
        animate={showNav ? { y: 0, opacity: 1, scale: 1 } : { y: -80, opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: showNav ? 0.2 : 0 }}
        style={{
          position: 'fixed',
          top: 16,
          left: 0,
          right: 0,
          zIndex: 9000,
          display: 'flex',
          justifyContent: 'center',
          padding: '0 16px',
          pointerEvents: 'none',
        }}
      >
        {/* ─── DESKTOP PILL ─── */}
        <nav
          className="desktop-pill"
          style={{
            ...pillStyle,
            pointerEvents: 'auto',
            display: 'flex',
            alignItems: 'center',
            height: 52,
            padding: '0 8px',
            borderRadius: 100,
          }}
        >
          <a
            href="#hero"
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: 14,
              color: '#fff',
              textDecoration: 'none',
              padding: '0 16px',
              letterSpacing: '-0.01em',
              whiteSpace: 'nowrap',
              textShadow: '0 1px 8px rgba(0,0,0,0.5)',
            }}
          >
            MyTaskEngine
          </a>

          <span style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.15)', flexShrink: 0, margin: '0 4px' }} />

          {links.map(link => (
            <a
              key={link.label}
              href={link.href}
              style={{
                fontSize: 13,
                fontWeight: 500,
                color: 'rgba(255,255,255,0.8)',
                textDecoration: 'none',
                padding: '0 14px',
                height: 36,
                display: 'flex',
                alignItems: 'center',
                borderRadius: 100,
                transition: 'color 0.2s, background 0.2s',
                whiteSpace: 'nowrap',
                textShadow: '0 1px 4px rgba(0,0,0,0.4)',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.color = '#fff'
                e.currentTarget.style.background = 'rgba(255,255,255,0.12)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.color = 'rgba(255,255,255,0.8)'
                e.currentTarget.style.background = 'transparent'
              }}
            >
              {link.label}
            </a>
          ))}

          <button
            data-cal-link="mytaskengine/30min"
            data-cal-namespace="30min"
            data-cal-config='{"layout":"month_view","useSlotsViewOnSmallScreen":"true","theme":"dark"}'
            style={{
              marginLeft: 6,
              height: 36,
              padding: '0 18px',
              background: 'var(--color-accent)',
              color: '#0D1117',
              fontSize: 13,
              fontWeight: 700,
              borderRadius: 100,
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'inherit',
              display: 'flex',
              alignItems: 'center',
              whiteSpace: 'nowrap',
              boxShadow: '0 2px 12px rgba(22,199,132,0.45), 0 1px 0 rgba(255,255,255,0.25) inset',
              transition: 'transform 0.2s, box-shadow 0.2s',
              letterSpacing: '-0.01em',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'scale(1.05)'
              e.currentTarget.style.boxShadow = '0 4px 20px rgba(22,199,132,0.6), 0 1px 0 rgba(255,255,255,0.25) inset'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'scale(1)'
              e.currentTarget.style.boxShadow = '0 2px 12px rgba(22,199,132,0.45), 0 1px 0 rgba(255,255,255,0.25) inset'
            }}
          >
            Book Free Audit →
          </button>
        </nav>

        {/* ─── MOBILE PILL ─── */}
        <nav
          className="mobile-pill"
          style={{
            ...pillStyle,
            pointerEvents: 'auto',
            display: 'none',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            maxWidth: 480,
            height: 52,
            padding: '0 16px',
            borderRadius: 100,
          }}
        >
          <a
            href="#hero"
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: 14,
              color: '#fff',
              textDecoration: 'none',
              textShadow: '0 1px 6px rgba(0,0,0,0.5)',
            }}
          >
            MyTaskEngine
          </a>

          <button
            onClick={() => setMobileOpen(o => !o)}
            aria-label="Toggle menu"
            style={{
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: 100,
              width: 36,
              height: 36,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, width: 16 }}>
              {[0, 1, 2].map(i => (
                <span key={i} style={{
                  display: 'block',
                  height: 1.5,
                  borderRadius: 2,
                  background: '#fff',
                  transform: i === 0 && mobileOpen ? 'rotate(45deg) translate(4px, 4px)'
                            : i === 2 && mobileOpen ? 'rotate(-45deg) translate(4px, -4px)'
                            : 'none',
                  opacity: i === 1 && mobileOpen ? 0 : 1,
                  transition: 'transform 0.25s, opacity 0.2s',
                  transformOrigin: 'left',
                }} />
              ))}
            </div>
          </button>
        </nav>
      </motion.div>

      {/* ─── MOBILE DROPDOWN ─── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            style={{
              position: 'fixed',
              top: 80,
              left: 16,
              right: 16,
              zIndex: 8999,
              borderRadius: 20,
              padding: 8,
              background: 'rgba(13, 17, 23, 0.82)',
              backdropFilter: 'blur(32px) saturate(180%)',
              WebkitBackdropFilter: 'blur(32px) saturate(180%)',
              border: '1px solid rgba(255,255,255,0.12)',
              boxShadow: '0 16px 48px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.08) inset',
            }}
          >
            {links.map((link, i) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                style={{
                  display: 'block',
                  padding: '14px 16px',
                  fontSize: 15,
                  fontWeight: 500,
                  color: 'rgba(255,255,255,0.85)',
                  textDecoration: 'none',
                  borderRadius: 12,
                  transition: 'background 0.15s, color 0.15s',
                  borderBottom: i < links.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.08)'
                  e.currentTarget.style.color = '#fff'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.color = 'rgba(255,255,255,0.85)'
                }}
              >
                {link.label}
              </a>
            ))}
            <button
              data-cal-link="mytaskengine/30min"
              data-cal-namespace="30min"
              data-cal-config='{"layout":"month_view","useSlotsViewOnSmallScreen":"true","theme":"dark"}'
              onClick={() => setMobileOpen(false)}
              style={{
                display: 'block',
                width: '100%',
                marginTop: 8,
                padding: '13px 16px',
                textAlign: 'center',
                fontSize: 14,
                fontWeight: 700,
                color: '#0D1117',
                background: 'var(--color-accent)',
                borderRadius: 12,
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'inherit',
                boxShadow: '0 2px 12px rgba(22,199,132,0.35)',
              }}
            >
              Book Free Audit →
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @media (max-width: 768px) {
          .desktop-pill { display: none !important; }
          .mobile-pill  { display: flex !important; }
        }
      `}</style>
    </>
  )
}
