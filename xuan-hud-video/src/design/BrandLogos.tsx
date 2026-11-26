import React from 'react';

interface LogoProps {
  size?: number;
  style?: React.CSSProperties;
}

/** Official 4-color Google "G" mark */
export const GoogleGLogo: React.FC<LogoProps> = ({ size = 36, style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={{ flexShrink: 0, ...style }}>
    <path
      fill="#4285F4"
      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
    />
    <path
      fill="#34A853"
      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.14C3.26 21.3 7.31 24 12 24z"
    />
    <path
      fill="#FBBC05"
      d="M5.28 14.24c-.24-.72-.38-1.49-.38-2.24s.14-1.52.38-2.24V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.99-3.14z"
    />
    <path
      fill="#EA4335"
      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.99 3.14c.95-2.85 3.6-4.96 6.72-4.96z"
    />
  </svg>
);

/** Official Gemini 4-point gradient sparkle */
export const GeminiLogo: React.FC<LogoProps> = ({ size = 36, style }) => (
  <svg width={size} height={size} viewBox="0 0 28 28" style={{ flexShrink: 0, ...style }}>
    <defs>
      <linearGradient id="geminiGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#1C7DF7" />
        <stop offset="48%" stopColor="#8E75FF" />
        <stop offset="100%" stopColor="#E66482" />
      </linearGradient>
    </defs>
    <path
      fill="url(#geminiGrad)"
      d="M14 0C14 7.732 20.268 14 28 14C20.268 14 14 20.268 14 28C14 20.268 7.732 14 0 14C7.732 14 14 7.732 14 0Z"
    />
  </svg>
);

/** Official Google One 4-color "1" mark */
export const GoogleOneLogo: React.FC<LogoProps> = ({ size = 36, style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={{ flexShrink: 0, ...style }}>
    <path fill="#EA4335" d="M10.5 3.6L5.8 7.5a2 2 0 0 0 2.55 3.08l4.7-3.9A2 2 0 0 0 10.5 3.6z" />
    <path fill="#4285F4" d="M13 3a2 2 0 0 0-2 2v6.5h4V5a2 2 0 0 0-2-2z" />
    <path fill="#FBBC05" d="M11 11.5h4v4h-4z" />
    <path fill="#34A853" d="M11 15.5h4V19a2 2 0 0 1-4 0v-3.5z" />
  </svg>
);

/** Google Flow cinematic mark */
export const GoogleFlowLogo: React.FC<LogoProps> = ({ size = 36, style }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" style={{ flexShrink: 0, ...style }}>
    <defs>
      <linearGradient id="flowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#60A5FA" />
        <stop offset="50%" stopColor="#A78BFA" />
        <stop offset="100%" stopColor="#F5A623" />
      </linearGradient>
    </defs>
    <rect x="2" y="2" width="28" height="28" rx="8" fill="rgba(255,255,255,0.08)" stroke="url(#flowGrad)" strokeWidth="1.8" />
    <path
      d="M8 20.5C10.5 14 14.5 10.5 23.5 10.5M9.5 23C13.5 18.5 17.5 16.5 24 16.5"
      stroke="url(#flowGrad)"
      strokeWidth="2.8"
      strokeLinecap="round"
      fill="none"
    />
    <circle cx="22.5" cy="10.5" r="2.2" fill="#F5A623" />
  </svg>
);

/** DeepSeek recognizable blue whale mark */
export const DeepSeekLogo: React.FC<LogoProps> = ({ size = 36, style }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" style={{ flexShrink: 0, ...style }}>
    <defs>
      <linearGradient id="dsGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#4D6BFE" />
        <stop offset="100%" stopColor="#60A5FA" />
      </linearGradient>
    </defs>
    <circle cx="16" cy="16" r="14.5" fill="rgba(77,107,254,0.16)" stroke="#4D6BFE" strokeWidth="1.5" />
    <path
      fill="url(#dsGrad)"
      d="M7.5 17.8c0-4.6 3.7-8.1 8.9-8.1 4.1 0 7.1 2.2 8.2 5.4l2.1-1.3c.6-.4 1.3.2 1 0.9-.6 1.5-1.6 3.1-3.1 4.1-1.8 2.6-4.9 4.1-8.5 4.1-5.1 0-8.6-2.2-8.6-5.1zm11.2-1.8a1.3 1.3 0 1 0 0-2.6 1.3 1.3 0 0 0 0 2.6z"
    />
  </svg>
);

/** Official Apple silhouette mark */
export const AppleLogo: React.FC<LogoProps & { color?: string }> = ({ size = 32, color = '#FFFFFF', style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={{ flexShrink: 0, ...style }}>
    <path
      fill={color}
      d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.96 6.32c.67-.82 1.13-1.95 1-3.09-.97.04-2.15.65-2.85 1.46-.62.72-1.17 1.88-1.02 2.99 1.09.08 2.2-.55 2.87-1.36z"
    />
  </svg>
);

/** Google AI Studio / API Key official-style badge */
export const GoogleAIStudioLogo: React.FC<LogoProps> = ({ size = 36, style }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" style={{ flexShrink: 0, ...style }}>
    <rect x="2" y="2" width="28" height="28" rx="8" fill="rgba(66,133,244,0.18)" stroke="#4285F4" strokeWidth="1.6" />
    <path
      fill="#74B3F5"
      d="M16 6.5C16 11.75 20.25 16 25.5 16C20.25 16 16 20.25 16 25.5C16 20.25 11.75 16 6.5 16C11.75 16 16 11.75 16 6.5Z"
    />
  </svg>
);

/** Official Google Antigravity rainbow-arch "A" mark */
export const AntigravityLogo: React.FC<LogoProps> = ({ size = 36, style }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" style={{ flexShrink: 0, ...style }}>
    <defs>
      <linearGradient id="agyArch" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#34A853" />
        <stop offset="35%" stopColor="#4285F4" />
        <stop offset="70%" stopColor="#FBBC05" />
        <stop offset="100%" stopColor="#EA4335" />
      </linearGradient>
    </defs>
    <path
      d="M6.5 25.5C10 18.5 13 6.5 16 6.5C19 6.5 22 18.5 25.5 25.5"
      fill="none"
      stroke="url(#agyArch)"
      strokeWidth="4.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M10.5 20.5C12.8 18.4 19.2 18.4 21.5 20.5"
      fill="none"
      stroke="#4285F4"
      strokeWidth="2.8"
      strokeLinecap="round"
    />
  </svg>
);

/** Official Python dual-snake emblem */
export const PythonLogo: React.FC<LogoProps> = ({ size = 34, style }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" style={{ flexShrink: 0, ...style }}>
    <path
      fill="#3776AB"
      d="M15.8 4c-5.4 0-5.1 2.3-5.1 2.3v2.5h5.2v.8H8.6S5 9.2 5 15.1s3.1 5.6 3.1 5.6h1.9v-2.7s-.1-3.1 3-3.1h5.3s2.9 0 2.9-2.8V6.9S21.6 4 15.8 4zm-2.9 1.7a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"
    />
    <path
      fill="#FFD43B"
      d="M16.2 28c5.4 0 5.1-2.3 5.1-2.3v-2.5h-5.2v-.8h7.3s3.6.4 3.6-5.5-3.1-5.6-3.1-5.6h-1.9v2.7s.1 3.1-3 3.1h-5.3s-2.9 0-2.9 2.8v5.2S10.4 28 16.2 28zm2.9-1.7a1 1 0 1 1 0-2 1 1 0 0 1 0 2z"
    />
  </svg>
);

/** OpenAI / Codex geometric knot emblem */
export const OpenAICodexLogo: React.FC<LogoProps> = ({ size = 32, style }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" style={{ flexShrink: 0, ...style }}>
    <circle cx="16" cy="16" r="14" fill="rgba(16,163,127,0.16)" stroke="#10A37F" strokeWidth="1.6" />
    <path
      d="M16 8.5l6.5 3.75v7.5L16 23.5l-6.5-3.75v-7.5L16 8.5zm0 3.2l-3.7 2.15v4.3L16 20.3l3.7-2.15v-4.3L16 11.7z"
      fill="none"
      stroke="#10A37F"
      strokeWidth="2"
      strokeLinejoin="round"
    />
  </svg>
);

/** Anthropic / Claude warm starburst emblem */
export const ClaudeLogo: React.FC<LogoProps> = ({ size = 32, style }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" style={{ flexShrink: 0, ...style }}>
    <circle cx="16" cy="16" r="14" fill="rgba(217,119,87,0.18)" stroke="#D97757" strokeWidth="1.6" />
    <path
      d="M16 7v18M7 16h18M9.6 9.6l12.8 12.8M22.4 9.6L9.6 22.4"
      stroke="#D97757"
      strokeWidth="2.4"
      strokeLinecap="round"
    />
  </svg>
);

/** Desktop App / CLI / IDE compact vector badges */
export const DesktopAppIcon: React.FC<LogoProps> = ({ size = 22, style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, ...style }}>
    <rect x="3" y="4" width="18" height="12" rx="2" />
    <path d="M8 20h8M12 16v4" />
  </svg>
);

export const TerminalCliIcon: React.FC<LogoProps> = ({ size = 22, style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, ...style }}>
    <polyline points="4 17 10 11 4 5" />
    <line x1="12" y1="19" x2="20" y2="19" />
  </svg>
);

export const IdeCodeIcon: React.FC<LogoProps> = ({ size = 22, style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, ...style }}>
    <polyline points="16 18 22 12 16 6" />
    <polyline points="8 6 2 12 8 18" />
  </svg>
);
