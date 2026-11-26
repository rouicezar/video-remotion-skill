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

  // Chrome 四色克制体系（橙、蓝、红、绿，严禁引入第 5 种彩色）
  orange: '#f5a623',
  blue: '#4285f4',
  red: '#ea4335',
  green: '#34a853',
  white: '#ffffff',
} as const;

/** 全项目唯一彩色 RGB 真相源：严格限定 Chrome 图标 4 色（橙、蓝、红、绿），其余仅用中性灰白黑 */
export const CHROME_RGB = {
  orange: [245, 166, 35] as [number, number, number],
  blue: [66, 133, 244] as [number, number, number],
  red: [234, 67, 53] as [number, number, number],
  green: [52, 168, 83] as [number, number, number],
} as const;

export const FONTS = {
  // 弃用挤压粗糙的 DIN Condensed，统一使用几何感极干净的 SF Pro Display + PingFang SC
  display: "'SF Pro Display', 'Inter', 'Helvetica Neue', 'PingFang SC', sans-serif",
  sans: "'PingFang SC', 'SF Pro Display', 'Hiragino Sans GB', 'Noto Sans CJK SC', sans-serif",
  mono: "'SF Mono', 'JetBrains Mono', 'Menlo', monospace",
} as const;

/**
 * 清亮锐利的字重体系（避免 300 过细被黑底蚀字发糊，同时严禁 >= 600 触发 PingFang SC 伪粗体）：
 * - light (400)  : 副标、顶部栏、辅助标签（24–32px 小字统一用 400 Regular 保证手机端笔画清晰不发灰）
 * - regular (400): 正文、胶囊、底部字幕
 * - medium (500) : 卡片主锚点词、关键标题与核心指令（原生 PingFang Medium 锐利提神不臃肿）
 */
export const WEIGHTS = {
  light: 400,
  regular: 400,
  medium: 500,
} as const;

export const FPS = 30;
// 3:2 逻辑画布（--scale=2 → 3840×2560 真 4K）。全项目唯一画幅来源，禁止在合成里写字面量。
export const WIDTH = 1920;
export const HEIGHT = 1280;
