'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import dynamic from 'next/dynamic'

const VoiceReceptionistDemo = dynamic(
  () => import('@/components/ui/VoiceReceptionistDemo'),
  { ssr: false }
)

export default function Hero() {
  // phase: 'intro' → video plays fullscreen
  // phase: 'transitioning' → overlay + text animate in over the same video
  // phase: 'done' → video still visible as bg, everything settled
  const [phase, setPhase] = useState<'intro' | 'transitioning' | 'done'>('intro')
  const [isMobile, setIsMobile] = useState(false)
  const [voiceDemoOpen, setVoiceDemoOpen] = useState(false)
  const [coverScale, setCoverScale] = useState(1)
  const [isZoomedOut, setIsZoomedOut] = useState(false)
  const [hasHydrated, setHasHydrated] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const TRANSITION_AT = 5 // seconds of video content
  const PLAYBACK_SPEED = 1.75

  // Autoplay on mount + Skip logic for direct section access
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768
      setIsMobile(mobile)

      const containerW = window.innerWidth
      const containerH = window.innerHeight
      const videoAspect = 16 / 9
      const containerAspect = containerW / containerH

      let renderedW, renderedH
      if (containerAspect > videoAspect) {
        renderedH = containerH
        renderedW = containerH * videoAspect
      } else {
        renderedW = containerW
        renderedH = containerW / videoAspect
      }

      const scale = Math.max(containerW / renderedW, containerH / renderedH)
      setCoverScale(scale)
    }
    handleResize()
    setHasHydrated(true)
    window.addEventListener('resize', handleResize)
    const checkSkip = () => {
      if (window.scrollY > 20 || window.location.hash) {
        setPhase(curr => (curr === 'intro' ? 'done' : curr))
      }
    }

    // Check immediately
    checkSkip()

    // Browser might restore scroll slightly after mount
    const t1 = setTimeout(checkSkip, 50)
    const t2 = setTimeout(checkSkip, 150)
    const t3 = setTimeout(checkSkip, 300)

    // Listen to scroll events (e.g. from browser scroll restoration)
    window.addEventListener('scroll', checkSkip, { passive: true })

    if (videoRef.current) {
      videoRef.current.playbackRate = PLAYBACK_SPEED
      videoRef.current.play().catch(() => { })
    }

    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
      window.removeEventListener('scroll', checkSkip)
      window.removeEventListener('resize', handleResize)
    }
  }, [PLAYBACK_SPEED])

  // Unlock scroll only after content is visible
  useEffect(() => {
    document.body.style.overflow = phase === 'done' ? '' : 'hidden'
    // Expose phase to document so Navbar can coordinate glow
    document.documentElement.setAttribute('data-intro-phase', phase)
    return () => {
      document.body.style.overflow = ''
      document.documentElement.removeAttribute('data-intro-phase')
    }
  }, [phase])

  const startTransition = useCallback(() => {
    if (phase !== 'intro') return
    setPhase('transitioning')
    // Let the overlay + content animations finish, then mark done
    setTimeout(() => setPhase('done'), 1600)
  }, [phase])

  const handleTimeUpdate = useCallback(() => {
    const v = videoRef.current
    if (v) {
      if (v.currentTime >= TRANSITION_AT) {
        startTransition()
      } else if (v.currentTime >= 1.8 && phase === 'intro') {
        if (!isZoomedOut) setIsZoomedOut(true)
      }
    }
  }, [startTransition, phase, isZoomedOut])

  // Derived animation values
  const isIntro = phase === 'intro'
  const isTransitioning = phase === 'transitioning'
  const isDone = phase === 'done'
  const overlayVisible = isTransitioning || isDone
  const contentVisible = isDone

  return (
    <section
      id="hero"
      style={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        background: '#000', // fallback behind video
        overflow: 'hidden',
      }}
    >

      {/* ─── SINGLE VIDEO — slides right on reveal ─── */}
      <motion.div
        initial={{ x: 0, scale: 1 }}
        animate={
          overlayVisible
            ? { x: '28%', scale: 1.04 }
            : { x: 0, scale: 1 }
        }
        transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 0,
        }}
      >
        <motion.video
          ref={videoRef}
          src="/hero-intro.mp4"
          muted
          playsInline
          onTimeUpdate={handleTimeUpdate}
          onEnded={startTransition}
          initial={{ scale: 1 }}
          animate={{
            scale: !hasHydrated
              ? 1
              : isMobile
                ? (overlayVisible ? coverScale : (isZoomedOut ? 1.5 : coverScale))
                : coverScale
          }}
          transition={{
            duration: (phase === 'intro' && !isZoomedOut) ? 0 : 1.6,
            ease: [0.22, 1, 0.36, 1]
          }}
          style={{
            width: '100%',
            height: '100%',
            objectFit: hasHydrated ? 'contain' : 'cover',
            objectPosition: 'center',
            display: 'block',
          }}
        />
      </motion.div>

      {/* ─── DIRECTIONAL OVERLAY – dark on left (behind text), clear on right (robot) ─── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: overlayVisible ? 1 : 0 }}
        transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(105deg, rgba(13,17,23,1) 0%, rgba(13,17,23,0.97) 32%, rgba(13,17,23,0.55) 58%, rgba(13,17,23,0.08) 100%)',
          zIndex: 1,
          pointerEvents: 'none',
        }}
      />

      {/* ─── GRID TEXTURE – fades in with overlay ─── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: overlayVisible ? 0.035 : 0 }}
        transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px),linear-gradient(90deg,rgba(255,255,255,1) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
          zIndex: 2,
          pointerEvents: 'none',
        }}
      />

      {/* ─── SKIP HINT (visible only during intro) ─── */}
      <motion.button
        onClick={startTransition}
        initial={{ opacity: 0 }}
        animate={{ opacity: isIntro ? 1 : 0 }}
        transition={{ delay: 1.5, duration: 0.5 }}
        style={{
          position: 'absolute',
          bottom: 48,
          right: 40,
          zIndex: 10,
          background: 'none',
          border: '1px solid rgba(255,255,255,0.2)',
          borderRadius: 8,
          padding: '8px 16px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          pointerEvents: isIntro ? 'auto' : 'none',
        }}
      >
        <span style={{
          fontSize: 12,
          fontWeight: 500,
          color: 'rgba(255,255,255,0.5)',
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          fontFamily: 'var(--font-body)',
        }}>
          Skip intro
        </span>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M5 3l4 4-4 4" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M10 3v8" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </motion.button>

      {/* ─── TOP PROGRESS BAR (visible only during intro) ─── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isIntro ? 1 : 0 }}
        transition={{ duration: 0.4 }}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          zIndex: 10000,
          background: 'rgba(255,255,255,0.08)',
          pointerEvents: 'none',
        }}
      >
        <motion.div
          initial={{ width: '0%' }}
          animate={{ width: isIntro ? '100%' : '0%' }}
          transition={{ duration: TRANSITION_AT / PLAYBACK_SPEED, ease: 'linear' }}
          style={{
            height: '100%',
            background: 'linear-gradient(90deg, var(--color-accent), #20E89C)',
            borderRadius: '0 2px 2px 0',
            boxShadow: '0 0 12px rgba(22,199,132,0.5), 0 0 4px rgba(22,199,132,0.3)',
          }}
        />
      </motion.div>

      {/* ─── HERO CONTENT — left column only, robot free on right ─── */}
      <div style={{
        position: 'relative',
        zIndex: 3,
        width: '100%',
        maxWidth: 1200,
        margin: '0 auto',
        padding: '128px 48px 96px',
        display: 'flex',
        alignItems: 'center',
        minHeight: '100vh',
      }}>
        {/* Text block — left 48% */}
        <div className="hero-text-col" style={{ maxWidth: 560, width: '100%' }}>

          {/* Eyebrow */}
          <motion.div
            initial={{ opacity: 0, x: -32, y: 8 }}
            animate={contentVisible ? { opacity: 1, x: 0, y: 0 } : { opacity: 0, x: -32, y: 8 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.05 }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 12,
              color: 'var(--color-accent)',
              fontSize: 12,
              fontWeight: 500,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              marginBottom: 24,
            }}
          >
            <span style={{ width: 24, height: 1, background: 'var(--color-accent)', display: 'inline-block' }} />
            AI SYSTEMS FOR GROWTH-FOCUSED BUSINESS OWNERS
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, x: -48, y: 12 }}
            animate={contentVisible ? { opacity: 1, x: 0, y: 0 } : { opacity: 0, x: -48, y: 12 }}
            transition={{ duration: 1.0, ease: [0.22, 1, 0.36, 1], delay: 0.18 }}
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 800,
              fontSize: 'clamp(36px, 5.5vw, 68px)',
              lineHeight: 0.97,
              letterSpacing: '-0.02em',
              color: '#fff',
              marginBottom: 32,
            }}
          >
            Your Business Deserves to Run{' '}
            <span style={{ color: 'var(--color-accent)' }}>Without You</span>{' '}
            in the Room.
          </motion.h1>

          {/* Sub-headline */}
          <motion.p
            initial={{ opacity: 0, x: -36, y: 8 }}
            animate={contentVisible ? { opacity: 1, x: 0, y: 0 } : { opacity: 0, x: -36, y: 8 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.32 }}
            style={{
              fontSize: 17,
              fontWeight: 400,
              color: 'rgba(255,255,255,0.6)',
              lineHeight: 1.7,
              marginBottom: 40,
            }}
          >
            You run the business. The systems run the busywork, from the DMs and bookings to the follow-up and the 5-star reviews that used to slip through the cracks.
          </motion.p>

          {/* CTA group */}
          <motion.div
            initial={{ opacity: 0, x: -28 }}
            animate={contentVisible ? { opacity: 1, x: 0 } : { opacity: 0, x: -28 }}
            transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1], delay: 0.46 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 12 }}
          >
            <button
              data-cal-link="mytaskengine/30min"
              data-cal-namespace="30min"
              data-cal-config='{"layout":"month_view","useSlotsViewOnSmallScreen":"true","theme":"dark"}'
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                height: 52,
                padding: '0 32px',
                background: 'var(--color-accent)',
                color: 'var(--color-ink)',
                fontSize: 15,
                fontWeight: 600,
                borderRadius: 12,
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'inherit',
                transition: 'transform 0.2s ease-out, box-shadow 0.2s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'scale(1.02)'
                e.currentTarget.style.boxShadow = '0 0 32px rgba(22,199,132,0.3)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'scale(1)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              Book My Free AI Audit <span>→</span>
            </button>
            <button
              onClick={() => setVoiceDemoOpen(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                height: 44,
                padding: '0 24px',
                background: 'rgba(255,255,255,0.06)',
                color: 'rgba(255,255,255,0.7)',
                fontSize: 14,
                fontWeight: 500,
                borderRadius: 10,
                border: '1px solid rgba(255,255,255,0.12)',
                cursor: 'pointer',
                fontFamily: 'inherit',
                transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                backdropFilter: 'blur(8px)',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(22, 199, 132, 0.12)'
                e.currentTarget.style.borderColor = 'rgba(22, 199, 132, 0.3)'
                e.currentTarget.style.color = 'var(--color-accent)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.06)'
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'
                e.currentTarget.style.color = 'rgba(255,255,255,0.7)'
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                <line x1="12" y1="19" x2="12" y2="23"/>
                <line x1="8" y1="23" x2="16" y2="23"/>
              </svg>
              Talk to Aria
            </button>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)' }}>
              Free. No pitch. Just clarity.
            </p>
          </motion.div>
        </div>{/* end text column */}

        {/* Scroll indicator — outside text column, bottom of outer wrapper */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={contentVisible ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.6, delay: 0.9 }}
          className="scroll-indicator"
          style={{
            position: 'absolute',
            bottom: 40,
            left: 48,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <span style={{
            fontSize: 12,
            fontWeight: 500,
            color: 'rgba(255,255,255,0.3)',
            writingMode: 'vertical-rl',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
          }}>
            Scroll
          </span>
          <span style={{
            display: 'block',
            width: 1,
            height: 48,
            background: 'rgba(255,255,255,0.2)',
            animation: 'scrollPulse 2s ease-in-out infinite',
          }} />
        </motion.div>
      </div>{/* end outer wrapper */}

      <style>{`
        @keyframes scrollPulse {
          0%, 100% { opacity: 0.2; }
          50%       { opacity: 0.6; }
        }
        @media (max-width: 768px) {
          .scroll-indicator { display: none !important; }
          .hero-text-col { max-width: 100% !important; }
        }
      `}</style>

      <VoiceReceptionistDemo
        open={voiceDemoOpen}
        onClose={() => setVoiceDemoOpen(false)}
      />
    </section>
  )
}
