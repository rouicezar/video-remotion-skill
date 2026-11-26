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
 * 干净克制的字重体系（严禁 >= 700 触发 macOS PingFang SC 浏览器合成伪粗体导致笔画粘连发脏）：
 * - light (300)  : 顶部栏、副标、单位说明、大号精密数字
 * - regular (400): 正文、胶囊标签、底部字幕
 * - medium (500) : 卡片主锚点词、关键指令（最高允许 500，靠字号与色彩拉开层级而非粗黑笔画）
 */
export const WEIGHTS = {
  light: 300,
  regular: 400,
  medium: 500,
} as const;

export const FPS = 30;
// 3:2 逻辑画布（--scale=2 → 3840×2560 真 4K）。全项目唯一画幅来源，禁止在合成里写字面量。
export const WIDTH = 1920;
export const HEIGHT = 1280;
