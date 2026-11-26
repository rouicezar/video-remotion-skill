export const COLORS = {
  bg: '#111318',
  bgDeep: '#0b0d12',
  surface: '#151820',
  surfaceLight: '#1c202b',
  stageBg: '#0d1016',
  border: '#282d38',
  borderSubtle: '#1e232e',
  bracket: '#566074',

  amber: '#f5a623',
  amberBright: '#ffb838',
  amberDim: 'rgba(245, 166, 35, 0.2)',
  amberBorder: 'rgba(245, 166, 35, 0.55)',
  amberGlow: 'rgba(245, 166, 35, 0.35)',

  textPrimary: '#f3f5f8',
  textSecondary: '#9aa3b2',
  textMuted: '#636c7d',

  red: '#ef5350',
  green: '#34d399',
  white: '#ffffff',
} as const;

export const FONTS = {
  display: "'DIN Condensed', 'Avenir Next Condensed', 'Impact', 'Arial Narrow', sans-serif",
  sans: "'PingFang SC', 'Hiragino Sans GB', 'SF Pro Display', 'Noto Sans CJK SC', sans-serif",
  mono: "'SF Mono', 'Menlo', 'Monaco', 'JetBrains Mono', monospace",
} as const;

export const FPS = 30;
// 3:2 逻辑画布（--scale=2 → 3840×2560 真 4K）。全项目唯一画幅来源，禁止在合成里写字面量。
export const WIDTH = 1920;
export const HEIGHT = 1280;
