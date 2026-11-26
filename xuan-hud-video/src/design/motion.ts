import React from 'react';
import { COLORS } from './tokens';

/**
 * Smooth cubic-bezier S-curve (0..1 -> 0..1): slow -> fast -> slow
 */
export const easeInOutCubic = (t: number): number => {
  const x = Math.max(0, Math.min(1, t));
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
};

/**
 * Exponential ease-out for silky deceleration without abrupt stops
 */
export const easeOutExpo = (t: number): number => {
  const x = Math.max(0, Math.min(1, t));
  return x === 1 ? 1 : 1 - Math.pow(2, -10 * x);
};

/**
 * Smooth quintic ease-out for ultra-refined Apple-style motion
 */
export const easeOutQuint = (t: number): number => {
  const x = Math.max(0, Math.min(1, t));
  return 1 - Math.pow(1 - x, 5);
};

/**
 * Continuous Gaussian/cosine focus weight (0..1) for item `index` given a continuous float `focusPos`.
 * Eliminates mechanical integer-snapping (`i === Math.floor(...)`)!
 */
export const smoothFocusWeight = (index: number, focusPos: number, radius = 0.85): number => {
  const dist = Math.abs(index - focusPos);
  if (dist >= radius) return 0;
  return 0.5 * (1 + Math.cos((dist / radius) * Math.PI));
};

/**
 * Continuous damped camera position moving through waypoints with S-curve dwell + glide.
 * Never teleports between stations!
 */
export const smoothWaypointProgress = (
  frame: number,
  startFrame: number,
  framesPerStop: number,
  numStops: number,
  dwellRatio = 0.42
): number => {
  if (frame <= startFrame || numStops <= 1) return 0;
  const elapsed = frame - startFrame;
  const maxSeg = numStops - 1;
  const segIndex = Math.min(maxSeg - 1, Math.floor(elapsed / framesPerStop));
  if (elapsed >= maxSeg * framesPerStop) return maxSeg;
  const localT = (elapsed % framesPerStop) / framesPerStop;
  if (localT < dwellRatio) return segIndex;
  const moveT = (localT - dwellRatio) / (1 - dwellRatio);
  return segIndex + easeInOutCubic(moveT);
};

/**
 * Premium dark frosted-glass surface style (replaces flat matte black rectangles!).
 */
export const glassSurface = (opts?: {
  active?: number; // 0..1 continuous highlight weight!
  blurPx?: number;
  radius?: number;
  opacity?: number;
}): React.CSSProperties => {
  const active = Math.max(0, Math.min(1, opts?.active ?? 0));
  const blurPx = opts?.blurPx ?? 18;
  const radius = opts?.radius ?? 16;
  const baseOpacity = opts?.opacity ?? 0.62;

  const borderAlpha = 0.14 + active * 0.68;
  const borderColor =
    active > 0.05
      ? `rgba(245, 166, 35, ${borderAlpha.toFixed(3)})`
      : `rgba(255, 255, 255, 0.14)`;

  return {
    borderRadius: radius,
    backgroundColor: `rgba(22, 26, 36, ${baseOpacity})`,
    backgroundImage: `linear-gradient(135deg, rgba(255,255,255,${(0.11 + active * 0.06).toFixed(3)}) 0%, rgba(160,175,210,0.04) 48%, rgba(245,166,35,${(0.02 + active * 0.12).toFixed(3)}) 100%)`,
    backdropFilter: `blur(${blurPx}px) saturate(1.25)`,
    WebkitBackdropFilter: `blur(${blurPx}px) saturate(1.25)`,
    border: `1.5px solid ${borderColor}`,
    boxShadow: [
      `inset 0 1px 0 rgba(255, 255, 255, ${(0.22 + active * 0.16).toFixed(3)})`,
      `inset 0 -1px 0 rgba(255, 255, 255, 0.05)`,
      active > 0.05 ? `0 0 ${Math.round(38 * active)}px rgba(245, 166, 35, ${(0.38 * active).toFixed(3)})` : '',
      `0 22px 54px rgba(0, 0, 0, 0.52)`,
    ]
      .filter(Boolean)
      .join(', '),
  };
};

/**
 * Animated diagonal glass light-sheen sweep overlay
 */
export const glassSheenStyle = (frame: number, speed = 0.8): React.CSSProperties => {
  const pos = ((frame * speed) % 240) - 60;
  return {
    position: 'absolute',
    inset: 0,
    background: `linear-gradient(115deg, transparent ${pos - 18}%, rgba(255,255,255,0.09) ${pos}%, transparent ${pos + 18}%)`,
    pointerEvents: 'none',
  };
};

export const AMBER_GLOW_COLOR = COLORS.amberGlow;

/**
 * Smooth cross-dolly scene wrapper (eliminates ALL hard cuts between Sequences!)
 */
export const smoothSceneEnvelope = (
  frame: number,
  durationInFrames: number,
  fadeInFrames = 16,
  fadeOutFrames = 14
): { opacity: number; scale: number; translateY: number } => {
  const inT = easeOutQuint(frame / Math.max(1, fadeInFrames));
  const outStart = Math.max(fadeInFrames, durationInFrames - fadeOutFrames);
  const outT = frame > outStart ? easeInOutCubic((frame - outStart) / Math.max(1, fadeOutFrames)) : 0;
  return {
    opacity: inT * (1 - outT),
    scale: (0.96 + inT * 0.04) * (1 - outT * 0.03),
    translateY: (1 - inT) * 18 - outT * 12,
  };
};
