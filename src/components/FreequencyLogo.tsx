import React from 'react';

export interface FreequencyLogoProps {
  size?: number;
  variant?: 'full' | 'icon';
  theme?: 'light' | 'dark';
}

export const FreequencyLogo: React.FC<FreequencyLogoProps> = ({
  size = 40,
  variant = 'full',
  theme = 'dark',
}) => {
  const textColor = theme === 'dark' ? '#ffffff' : '#0f172a';
  const subtitleColor = theme === 'dark' ? '#94a3b8' : '#64748b'; // slate-400 : slate-500

  const svgIcon = (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ flexShrink: 0 }}
    >
      {/* Background Circle */}
      <circle cx="50" cy="50" r="50" fill="#1a6ff4" />
      
      {/* Letter F */}
      <path
        d="M 32 25 L 32 75 M 32 25 L 58 25 M 32 48 L 52 48"
        stroke="#ffffff"
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      
      {/* Music Note Overlapping */}
      <g>
        {/* Note Head */}
        <circle cx="62" cy="65" r="14" fill="#ffffff" />
        {/* Note Stem */}
        <path
          d="M 74 65 L 74 22"
          stroke="#ffffff"
          strokeWidth="8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Note Flag */}
        <path
          d="M 74 24 Q 88 24 88 42"
          stroke="#ffffff"
          strokeWidth="8"
          strokeLinecap="round"
          fill="none"
        />
      </g>
    </svg>
  );

  if (variant === 'icon') {
    return svgIcon;
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      {svgIcon}
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <span
          style={{
            color: textColor,
            fontWeight: 'bold',
            fontSize: `${Math.max(12, size * 0.45)}px`,
            lineHeight: 1.1,
            fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          }}
        >
          Freequency
        </span>
        <span
          style={{
            color: subtitleColor,
            fontSize: `${Math.max(10, size * 0.28)}px`,
            lineHeight: 1.2,
            fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            letterSpacing: '0.02em',
          }}
        >
          Music Streaming
        </span>
      </div>
    </div>
  );
};
