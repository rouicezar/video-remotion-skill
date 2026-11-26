/**
 * 引擎动效原语（全项目唯一来源）。剧集只能从 src/engine/* import，禁止跨剧集 import 业务组件。
 */
import { easeInOutCubic } from '../design/motion';

export { easeInOutCubic, easeOutExpo, easeOutQuint, smoothFocusWeight } from '../design/motion';

/** 统一干脆弹簧：10–14 帧利落落位 */
export const CRISP_SPRING = { damping: 24, stiffness: 185, mass: 0.72 };

/** 3D 翻卡帧数（规范 14–16 帧） */
export const FLIP_FRAMES = 16;

export const clamp01 = (t: number): number => Math.max(0, Math.min(1, t));

export type Rgb = [number, number, number];

/** 连续 RGB 插值——禁止 `t > 0.5 ? a : b` 布尔硬切 */
export function mixRgb(c1: Rgb, c2: Rgb, t: number): string {
  const k = clamp01(t);
  const r = Math.round(c1[0] + (c2[0] - c1[0]) * k);
  const g = Math.round(c1[1] + (c2[1] - c1[1]) * k);
  const b = Math.round(c1[2] + (c2[2] - c1[2]) * k);
  return `rgb(${r},${g},${b})`;
}

/** 三次贝塞尔求点（光点沿曲线运动） */
export function cubicPt(
  t: number,
  p0: [number, number],
  p1: [number, number],
  p2: [number, number],
  p3: [number, number]
): [number, number] {
  const u = 1 - t;
  const x = u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0];
  const y = u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1];
  return [x, y];
}

/** 分段滑移：0 → 1 → 2 … 每段在 at 开始、dur 帧内 S 曲线到位 */
export function steppedGlide(frame: number, waypoints: Array<{ at: number; dur: number; target: number }>): number {
  let val = waypoints[0].target;
  for (let i = 1; i < waypoints.length; i++) {
    const prev = waypoints[i - 1].target;
    const { at, dur, target } = waypoints[i];
    if (frame < at) return val;
    if (frame < at + dur) return prev + (target - prev) * easeInOutCubic((frame - at) / dur);
    val = target;
  }
  return val;
}

/** 口播卡点强调：at 起 10 帧亮起；给 endAt 则 12 帧回落，否则常亮 */
export const beatHighlight = (frame: number, at: number, endAt?: number): number => {
  const enter = easeInOutCubic((frame - at) / 10);
  if (endAt === undefined) return enter;
  return enter * (1 - easeInOutCubic((frame - endAt) / 12));
};
