'use client';

import React from 'react';

interface MetaTechProviderBadgeProps {
  className?: string;
  theme?: 'dark' | 'light' | 'auto';
  height?: number;
  style?: React.CSSProperties;
}

/**
 * Pixel-perfect, borderless Meta Tech Provider vector badge.
 * Eliminates artificial PNG bounding boxes and double borders.
 */
export default function MetaTechProviderBadge({
  className = '',
  theme = 'light',
  height = 24,
  style,
}: MetaTechProviderBadgeProps) {
  const textColor = theme === 'dark' ? '#FFFFFF' : '#0F172A';
  const subtextColor = theme === 'dark' ? 'rgba(255,255,255,0.7)' : '#475569';

  return (
    <div
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        height,
        lineHeight: 1,
        userSelect: 'none',
        ...style,
      }}
      title="Meta Tech Provider"
    >
      {/* Official Meta Infinity Symbol */}
      <svg
        height={height}
        viewBox="0 0 36 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ height: '100%', width: 'auto', flexShrink: 0 }}
      >
        <path
          d="M34.8 6.4C34.1 3.5 31.9 1.4 29 0.7C24.7 -0.2 20.3 0.8 17.5 3.9C15.4 1.5 12.3 0.2 9.1 0.4C5.2 0.7 1.8 3.3 0.6 7.1C-0.6 11.2 0.6 15.6 3.6 18.4C6.5 21.1 10.7 21.9 14.4 20.3C16.8 19.3 18.7 17.4 19.8 15.1C21.4 18.8 25 21.3 29.1 21.3C32.9 21.3 36.4 18.8 37.6 15.1C38.8 11.2 37.8 7.5 34.8 6.4ZM9.1 16.8C6.3 16.8 4.1 14.6 4.1 11.8C4.1 9 6.3 6.8 9.1 6.8C11.9 6.8 14.1 9 14.1 11.8C14.1 14.6 11.9 16.8 9.1 16.8ZM28.9 16.8C26.1 16.8 23.9 14.6 23.9 11.8C23.9 9 26.1 6.8 28.9 6.8C31.7 6.8 33.9 9 33.9 11.8C33.9 14.6 31.7 16.8 28.9 16.8Z"
          fill="url(#meta_grad)"
        />
        <defs>
          <linearGradient id="meta_grad" x1="0" y1="10.5" x2="38" y2="10.5" gradientUnits="userSpaceOnUse">
            <stop stopColor="#0064E0" />
            <stop offset="0.45" stopColor="#0081FB" />
            <stop offset="1" stopColor="#0064E0" />
          </linearGradient>
        </defs>
      </svg>

      {/* Typography: Meta | Tech Provider */}
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 1 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
          <span
            style={{
              fontSize: height * 0.58,
              fontWeight: 800,
              color: textColor,
              letterSpacing: '-0.03em',
              fontFamily: 'system-ui, -apple-system, sans-serif',
            }}
          >
            Meta
          </span>
          <span
            style={{
              fontSize: height * 0.44,
              fontWeight: 600,
              color: subtextColor,
              letterSpacing: '-0.01em',
              fontFamily: 'system-ui, -apple-system, sans-serif',
            }}
          >
            Tech Provider
          </span>
        </div>
      </div>
    </div>
  );
}
