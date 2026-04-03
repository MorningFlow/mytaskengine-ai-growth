'use client'
import { useRef, useState, useCallback } from 'react'

interface GlowCardProps {
  children: React.ReactNode
  style?: React.CSSProperties
  className?: string
  glowColor?: string
  borderRadius?: number
  as?: 'div' | 'article'
}

/**
 * Premium card with cursor-tracking spotlight glow on the border.
 * Tracks mouse position and renders a radial gradient that follows
 * the cursor along the card edges, creating a premium "spotlight" effect.
 * Also adds a subtle 3D tilt on hover.
 */
export default function GlowCard({
  children,
  style,
  className,
  glowColor = 'rgba(22, 199, 132, 0.5)',
  borderRadius = 16,
  as: Tag = 'div',
}: GlowCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [isHovered, setIsHovered] = useState(false)

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const card = cardRef.current
    if (!card) return
    const rect = card.getBoundingClientRect()
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    })
  }, [])

  const handleMouseEnter = useCallback(() => setIsHovered(true), [])
  const handleMouseLeave = useCallback(() => setIsHovered(false), [])

  // Subtle tilt based on cursor position
  const tiltX = isHovered && cardRef.current
    ? ((mousePos.y / cardRef.current.offsetHeight) - 0.5) * -4
    : 0
  const tiltY = isHovered && cardRef.current
    ? ((mousePos.x / cardRef.current.offsetWidth) - 0.5) * 4
    : 0

  return (
    <Tag
      ref={cardRef as any}
      className={className}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        position: 'relative',
        borderRadius,
        overflow: 'hidden',
        transform: `perspective(800px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) ${isHovered ? 'translateY(-4px)' : 'translateY(0)'}`,
        transition: 'transform 0.35s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.35s ease',
        boxShadow: isHovered
          ? '0 20px 40px rgba(0,0,0,0.08), 0 8px 16px rgba(0,0,0,0.04)'
          : '0 1px 3px rgba(0,0,0,0.04)',
        willChange: 'transform',
        ...style,
      }}
    >
      {/* Spotlight border glow — follows cursor */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 'inherit',
          opacity: isHovered ? 1 : 0,
          transition: 'opacity 0.35s ease',
          background: `radial-gradient(600px circle at ${mousePos.x}px ${mousePos.y}px, ${glowColor}, transparent 40%)`,
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />
      {/* Inner content with background to mask the glow interior */}
      <div
        style={{
          position: 'relative',
          zIndex: 2,
          borderRadius: 'inherit',
          margin: 1,
          background: style?.background || '#fff',
          height: 'calc(100% - 2px)',
          overflow: 'hidden',
        }}
      >
        {/* Inner spotlight shimmer — subtle fill effect */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            opacity: isHovered ? 1 : 0,
            transition: 'opacity 0.4s ease',
            background: `radial-gradient(400px circle at ${mousePos.x}px ${mousePos.y}px, rgba(22,199,132,0.04), transparent 40%)`,
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />
        <div style={{ position: 'relative', zIndex: 1 }}>
          {children}
        </div>
      </div>
    </Tag>
  )
}
