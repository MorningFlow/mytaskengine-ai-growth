'use client'
import { useInView } from 'react-intersection-observer'
import { motion } from 'framer-motion'

interface Props {
  children: React.ReactNode
  delay?: number
  direction?: 'up' | 'left' | 'right'
  className?: string
}

export default function RevealOnScroll({
  children,
  delay = 0,
  direction = 'up',
  className,
}: Props) {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 })

  const variants = {
    hidden: {
      opacity: 0,
      y: direction === 'up' ? 24 : 0,
      x: direction === 'left' ? -24 : direction === 'right' ? 24 : 0,
    },
    visible: { opacity: 1, y: 0, x: 0 },
  }

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      variants={variants}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
