'use client'
import { useEffect, useRef } from 'react'
import { useInView } from 'react-intersection-observer'

interface Props {
  end: number
  duration?: number
  prefix?: string
  suffix?: string
  decimals?: number
}

export default function AnimatedCounter({
  end,
  duration = 2000,
  prefix = '',
  suffix = '',
  decimals = 0,
}: Props) {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.5 })
  const elRef = useRef<HTMLSpanElement>(null)
  const started = useRef(false)

  useEffect(() => {
    if (!inView || started.current) return
    started.current = true
    const start = performance.now()

    const update = (now: number) => {
      const elapsed = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - elapsed, 4)
      const current = eased * end
      if (elRef.current) {
        elRef.current.textContent = prefix + current.toFixed(decimals) + suffix
      }
      if (elapsed < 1) requestAnimationFrame(update)
    }

    requestAnimationFrame(update)
  }, [inView, end, duration, prefix, suffix, decimals])

  return (
    <span ref={ref}>
      <span ref={elRef}>{prefix}0{suffix}</span>
    </span>
  )
}
