import React, { useId } from 'react';
import { spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { COLORS, FONTS, WEIGHTS } from '../../design/tokens';
import { clamp01, CRISP_SPRING, easeInOutCubic, mixRgb, Rgb, smoothFocusWeight, steppedGlide } from '../motion';
import { PhysicalGlass3D } from '../PhysicalGlass3D';
import { SfxGroup } from '../Sfx';

export interface OrbitPhaseSpec {
  num: string;
  title: string;
  sub: string;
  /** 相对当前场景的触发帧 */
  at: number;
}

// 四象限槽位（1560×740 画布，中心圆盘 cx=780, cy=370，连线起止严格落在卡片与圆环外边缘）
const QUADRANTS = [
  { x: 580, y: 20, w: 400, extrudeX: 0 },   // Top (12 o'clock)
  { x: 1090, y: 272, w: 410, extrudeX: 7 }, // Right (3 o'clock)
  { x: 580, y: 525, w: 400, extrudeX: 0 },  // Bottom (6 o'clock)
  { x: 60, y: 272, w: 410, extrudeX: -7 },  // Left (9 o'clock)
] as const;

// 四段圆弧连接上下左右四块卡片边缘，避免穿过卡片内部
const ARC_PATHS = [
  'M 980 112 A 230 230 0 0 1 1088 295',
  'M 1088 445 A 230 230 0 0 1 980 628',
  'M 580 628 A 230 230 0 0 1 472 445',
  'M 472 295 A 230 230 0 0 1 580 112',
] as const;

/**
 * 引擎积木库（第 5 类几何骨架）：环形星轨四象限闭环（OrbitLoopRing）
 * 适用语义：多轮迭代打磨、PDCA 飞轮、找茬修复闭环、正反馈循环。
 */
export const OrbitLoopRing: React.FC<{
  coreTag: string;
  coreTitle: string;
  phases: [OrbitPhaseSpec, OrbitPhaseSpec, OrbitPhaseSpec, OrbitPhaseSpec];
  solvedAt?: number;
  solvedLabel?: string;
  accentRgb?: Rgb;
  solvedRgb?: Rgb;
  sfxMuted?: boolean;
}> = ({
  coreTag,
  coreTitle,
  phases,
  solvedAt,
  solvedLabel = '闭环收敛 ✓',
  accentRgb = [245, 166, 35],
  solvedRgb = [52, 211, 153],
  sfxMuted = false,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const uid = useId().replace(/:/g, '');

  const focusPos = steppedGlide(
    frame,
    phases.map((p, i) => ({ at: p.at, dur: i === 0 ? 1 : 14, target: i }))
  );

  const solvedP = solvedAt !== undefined ? clamp01(easeInOutCubic((frame - solvedAt) / 14)) : 0;
  const curCoreRgb: Rgb = [
    Math.round(accentRgb[0] + (solvedRgb[0] - accentRgb[0]) * solvedP),
    Math.round(accentRgb[1] + (solvedRgb[1] - accentRgb[1]) * solvedP),
    Math.round(accentRgb[2] + (solvedRgb[2] - accentRgb[2]) * solvedP),
  ];

  const sfxEvents = [
    ...phases.map((p) => ({ kind: 'pop' as const, at: p.at })),
    ...(solvedAt !== undefined ? [{ kind: 'deal' as const, at: solvedAt }] : []),
  ];

  return (
    <div style={{ position: 'relative', width: 1560, height: 740 }}>
      <SfxGroup events={sfxEvents} muted={sfxMuted} />

      {/* 四段圆周切线星轨弧（严格起止于卡片外边缘） */}
      <svg width="1560" height="740" viewBox="0 0 1560 740" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 2 }}>
        <defs>
          <linearGradient id={`orbit-arc-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={`rgba(${accentRgb[0]}, ${accentRgb[1]}, ${accentRgb[2]}, 0.9)`} />
            <stop offset="100%" stopColor={`rgba(${curCoreRgb[0]}, ${curCoreRgb[1]}, ${curCoreRgb[2]}, 0.85)`} />
          </linearGradient>
        </defs>

        <circle cx="780" cy="370" r="142" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1.5" strokeDasharray="6 10" />

        {ARC_PATHS.map((d, idx) => {
          const triggerAt = phases[Math.min(3, idx + 1)]?.at ?? phases[0].at + 20;
          const drawP = clamp01(easeInOutCubic((frame - (idx === 3 ? (solvedAt ?? triggerAt + 18) - 8 : triggerAt - 8)) / 16));
          return (
            <path
              key={idx}
              d={d}
              fill="none"
              stroke={`url(#orbit-arc-${uid})`}
              strokeWidth="2.8"
              pathLength={1}
              strokeDasharray={1}
              strokeDashoffset={1 - drawP}
              strokeLinecap="round"
              opacity={drawP <= 0.02 ? 0 : 0.9}
            />
          );
        })}
      </svg>

      {/* 中心引擎核心圆砖 */}
      <div
        style={{
          position: 'absolute',
          left: 650,
          top: 266,
          width: 260,
          transform: `scale(${(0.96 + solvedP * 0.06).toFixed(4)})`,
          zIndex: 4,
        }}
      >
        <PhysicalGlass3D active={0.85 + solvedP * 0.15} accentRgb={curCoreRgb} radius={32} slabPx={15} extrudeX={0} padding="32px 24px 36px">
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, textAlign: 'center' }}>
            <span style={{ fontFamily: FONTS.mono, fontSize: 24, color: mixRgb(accentRgb, solvedRgb, solvedP), letterSpacing: 2 }}>
              {coreTag}
            </span>
            <span style={{ fontSize: 36, fontWeight: WEIGHTS.regular, color: COLORS.white, letterSpacing: 1.5 }}>
              {solvedP > 0.5 ? solvedLabel : coreTitle}
            </span>
          </div>
        </PhysicalGlass3D>
      </div>

      {/* 四象限 2.5D 迭代节点 */}
      {phases.map((ph, idx) => {
        const slot = QUADRANTS[idx];
        const p = spring({ frame: Math.max(0, frame - ph.at), fps, config: CRISP_SPRING });
        const w = frame >= ph.at ? smoothFocusWeight(idx, focusPos, 0.85) : 0;
        const act = clamp01(Math.max(w, solvedP * 0.55));

        return (
          <div
            key={ph.num}
            style={{
              position: 'absolute',
              left: slot.x,
              top: slot.y,
              width: slot.w,
              opacity: p,
              transform: `translate3d(0, ${((1 - p) * 24 - act * 6).toFixed(1)}px, 0) scale(${(0.94 + p * 0.06 + act * 0.03).toFixed(4)})`,
              zIndex: 5,
            }}
          >
            <PhysicalGlass3D
              active={0.2 + act * 0.8}
              accentRgb={curCoreRgb}
              radius={24}
              slabPx={14}
              extrudeX={slot.extrudeX}
              padding="26px 32px 30px"
              sheenSpeed={0.5}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 18 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <span style={{ fontSize: 36, fontWeight: WEIGHTS.regular, color: COLORS.white, letterSpacing: 1.5 }}>
                    {ph.title}
                  </span>
                  <span style={{ fontSize: 25, fontWeight: WEIGHTS.light, color: '#AAB8CE', letterSpacing: 1 }}>
                    {ph.sub}
                  </span>
                </div>
                <span
                  style={{
                    fontFamily: FONTS.display,
                    fontSize: 52,
                    fontWeight: WEIGHTS.light,
                    color: mixRgb([138, 152, 178], curCoreRgb, act),
                  }}
                >
                  {ph.num}
                </span>
              </div>
            </PhysicalGlass3D>
          </div>
        );
      })}
    </div>
  );
};
