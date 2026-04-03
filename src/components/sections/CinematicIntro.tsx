'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface CinematicIntroProps {
  children: React.ReactNode
}

export default function CinematicIntro({ children }: CinematicIntroProps) {
  const [phase, setPhase] = useState<'intro' | 'transitioning' | 'hero'>('intro')
  const videoRef = useRef<HTMLVideoElement>(null)
  const heroVideoRef = useRef<HTMLVideoElement>(null)
  const transitionTime = 5 // seconds into video to start transition

  const handleTimeUpdate = useCallback(() => {
    const video = videoRef.current
    if (!video) return
    if (video.currentTime >= transitionTime && phase === 'intro') {
      setPhase('transitioning')
      // After transition animation completes, switch to hero phase
      setTimeout(() => {
        setPhase('hero')
      }, 1200)
    }
  }, [phase])

  // Sync hero video time with intro video
  useEffect(() => {
    if (phase === 'transitioning' && videoRef.current && heroVideoRef.current) {
      heroVideoRef.current.currentTime = videoRef.current.currentTime
      heroVideoRef.current.play().catch(() => {})
    }
  }, [phase])

  // Autoplay video on mount
  useEffect(() => {
    const video = videoRef.current
    if (video) {
      video.play().catch(() => {})
    }
  }, [])

  // Lock scroll during intro
  useEffect(() => {
    if (phase !== 'hero') {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [phase])

  // Allow skip on click/tap
  const handleSkip = useCallback(() => {
    if (phase === 'intro') {
      setPhase('transitioning')
      setTimeout(() => {
        setPhase('hero')
      }, 1200)
    }
  }, [phase])

  return (
    <>
      {/* ==================== FULLSCREEN INTRO VIDEO ==================== */}
      <AnimatePresence>
        {(phase === 'intro' || phase === 'transitioning') && (
          <motion.div
            initial={{ opacity: 1 }}
            animate={{
              opacity: phase === 'transitioning' ? 0 : 1,
              scale: phase === 'transitioning' ? 1.05 : 1,
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 9999,
              background: '#000',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
            onClick={handleSkip}
          >
            {/* The fullscreen intro video */}
            <video
              ref={videoRef}
              src="/hero-intro.mp4"
              muted
              playsInline
              onTimeUpdate={handleTimeUpdate}
              onEnded={() => {
                if (phase === 'intro') {
                  setPhase('transitioning')
                  setTimeout(() => setPhase('hero'), 1200)
                }
              }}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />

            {/* Skip hint */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2, duration: 0.6 }}
              style={{
                position: 'absolute',
                bottom: 40,
                right: 40,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <span style={{
                fontSize: 12,
                fontWeight: 500,
                color: 'rgba(255,255,255,0.4)',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                fontFamily: 'var(--font-body)',
              }}>
                Click to skip
              </span>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ opacity: 0.4 }}>
                <path d="M6 3l5 5-5 5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </motion.div>

            {/* Progress bar */}
            <div style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: 3,
              background: 'rgba(255,255,255,0.1)',
            }}>
              <motion.div
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: transitionTime, ease: 'linear' }}
                style={{
                  height: '100%',
                  background: 'var(--color-accent)',
                  borderRadius: 2,
                }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ==================== MAIN SITE CONTENT ==================== */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: phase === 'hero' ? 1 : 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: phase === 'hero' ? 0.1 : 0 }}
      >
        {children}
      </motion.div>

      {/* ==================== HERO BACKGROUND VIDEO (persists after transition) ==================== */}
      {(phase === 'transitioning' || phase === 'hero') && (
        <video
          ref={heroVideoRef}
          src="/hero-intro.mp4"
          muted
          loop
          playsInline
          autoPlay
          id="hero-bg-video"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100vh',
            objectFit: 'cover',
            zIndex: 0,
            pointerEvents: 'none',
          }}
        />
      )}
    </>
  )
}
