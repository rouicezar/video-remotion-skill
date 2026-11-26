import React, { useId } from 'react';
import { spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { COLORS, FONTS, WEIGHTS } from '../../design/tokens';
import { clamp01, CRISP_SPRING, easeInOutCubic, mixRgb, Rgb, smoothFocusWeight, steppedGlide } from '../motion';
import { PhysicalGlass3D } from '../PhysicalGlass3D';
import { SfxGroup } from '../Sfx';

export interface MilestoneStageSpec {
  code: string;
  title: string;
  sub: string;
  at: number;
}

export interface GateCheckpointSpec {
  roleLabel: string;
  verdictLabel: string;
  /** 严格按因果时序点亮门禁，严禁提前挂出 PASS */
  at: number;
}

/**
 * 引擎积木库（第 6 类几何骨架）：斜向阶梯里程碑 + 审查门禁（MilestoneGateTrack）
 * 适用语义：分阶段推进、审批关卡、里程碑验收、CI/CD 流水线。
 */
export const MilestoneGateTrack: React.FC<{
  stages: [MilestoneStageSpec, MilestoneStageSpec, MilestoneStageSpec];
  gates: [GateCheckpointSpec, GateCheckpointSpec];
  accentRgb?: Rgb;
  passRgb?: Rgb;
  sfxMuted?: boolean;
}> = ({
  stages,
  gates,
  accentRgb = [245, 166, 35],
  passRgb = [52, 168, 83],
  sfxMuted = false,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const uid = useId().replace(/:/g, '');

  // 三级斜向递升坐标（左下 -> 中 -> 右上，形成清晰向上进阶态势）
  const slots = [
    { x: 0, y: 420, extrudeX: -6 },
    { x: 560, y: 245, extrudeX: 0 },
    { x: 1120, y: 70, extrudeX: 6 },
  ] as const;

  const gateSlots = [
    { x: 420, y: 112, from: [440, 505] as [number, number], to: [560, 345] as [number, number] },
    { x: 1030, y: 518, from: [1000, 330] as [number, number], to: [1120, 170] as [number, number] },
  ] as const;

  const focusPos = steppedGlide(
    frame,
    stages.map((s, i) => ({ at: s.at, dur: i === 0 ? 1 : 14, target: i }))
  );

  const sfxEvents = [
    ...stages.map((s) => ({ kind: 'drop' as const, at: s.at })),
    ...gates.map((g) => ({ kind: 'pop' as const, at: g.at })),
  ];

  return (
    <div style={{ position: 'relative', width: 1560, height: 740 }}>
      <SfxGroup events={sfxEvents} muted={sfxMuted} />

      <svg width="1560" height="740" viewBox="0 0 1560 740" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 3 }}>
        <defs>
          <linearGradient id={`step-beam-${uid}`} x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={`rgba(${accentRgb[0]}, ${accentRgb[1]}, ${accentRgb[2]}, 0.9)`} />
            <stop offset="100%" stopColor={`rgba(${passRgb[0]}, ${passRgb[1]}, ${passRgb[2]}, 0.9)`} />
          </linearGradient>
        </defs>

        {gateSlots.map((gs, idx) => {
          const lineP = clamp01(easeInOutCubic((frame - (gates[idx].at - 6)) / 14));
          const midX = (gs.from[0] + gs.to[0]) / 2;
          const d = `M ${gs.from[0]} ${gs.from[1]} C ${midX} ${gs.from[1]}, ${midX} ${gs.to[1]}, ${gs.to[0]} ${gs.to[1]}`;
          return (
            <path
              key={idx}
              d={d}
              fill="none"
              stroke={`url(#step-beam-${uid})`}
              strokeWidth="3"
              pathLength={1}
              strokeDasharray={1}
              strokeDashoffset={1 - lineP}
              strokeLinecap="round"
              opacity={lineP <= 0.02 ? 0 : 0.92}
            />
          );
        })}
      </svg>

      {/* 3 个阶梯里程碑 2.5D 厚卡（宽度 440） */}
      {stages.map((st, idx) => {
        const slot = slots[idx];
        const p = spring({ frame: Math.max(0, frame - st.at), fps, config: CRISP_SPRING });
        const w = frame >= st.at ? smoothFocusWeight(idx, focusPos, 0.85) : 0;
        const passed = idx < 2 ? clamp01(easeInOutCubic((frame - gates[idx].at) / 12)) : 0;
        const curRgb: Rgb = [
          Math.round(accentRgb[0] + (passRgb[0] - accentRgb[0]) * passed),
          Math.round(accentRgb[1] + (passRgb[1] - accentRgb[1]) * passed),
          Math.round(accentRgb[2] + (passRgb[2] - accentRgb[2]) * passed),
        ];

        return (
          <div
            key={st.code}
            style={{
              position: 'absolute',
              left: slot.x,
              top: slot.y,
              width: 440,
              opacity: p,
              transform: `translate3d(0, ${((1 - p) * 32 - w * 8).toFixed(1)}px, 0) rotateX(4deg)`,
              zIndex: 4,
            }}
          >
            <PhysicalGlass3D
              active={0.28 + Math.max(w, passed * 0.65) * 0.72}
              accentRgb={curRgb}
              radius={26}
              slabPx={15}
              extrudeX={slot.extrudeX}
              padding="36px 38px 40px"
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontFamily: FONTS.mono, fontSize: 25, color: mixRgb(accentRgb, passRgb, passed), letterSpacing: 2 }}>
                    {st.code}
                  </span>
                  {passed > 0.05 && (
                    <span
                      style={{
                        fontFamily: FONTS.mono,
                        fontSize: 24,
                        color: mixRgb([180, 240, 210], passRgb, 0.5),
                        opacity: passed,
                      }}
                    >
                      VERIFIED ✓
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 42, fontWeight: WEIGHTS.regular, color: COLORS.white, letterSpacing: 1.5 }}>
                  {st.title}
                </div>
                <div style={{ fontSize: 27, fontWeight: WEIGHTS.light, color: '#AEBCD2', letterSpacing: 1 }}>
                  {st.sub}
                </div>
              </div>
            </PhysicalGlass3D>
          </div>
        );
      })}

      {/* 2 枚独立审查门禁徽章（仅在口播讲到门禁时弹出，零提前剧透） */}
      {gates.map((gt, idx) => {
        const gs = gateSlots[idx];
        const gp = spring({ frame: Math.max(0, frame - gt.at), fps, config: CRISP_SPRING });
        if (frame < gt.at - 1) return null;
        return (
          <div
            key={gt.roleLabel}
            style={{
              position: 'absolute',
              left: gs.x - 110,
              top: gs.y,
              width: 340,
              opacity: gp,
              transform: `scale(${(0.86 + gp * 0.14).toFixed(4)})`,
              zIndex: 6,
            }}
          >
            <PhysicalGlass3D active={0.92} accentRgb={passRgb} radius={20} slabPx={11} extrudeX={0} padding="20px 26px 24px" sheenSpeed={0.6}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14 }}>
                <span style={{ fontFamily: FONTS.mono, fontSize: 25, color: '#D4FCE8' }}>{gt.roleLabel}</span>
                <span style={{ fontSize: 25, fontWeight: WEIGHTS.regular, color: COLORS.white }}>{gt.verdictLabel}</span>
              </div>
            </PhysicalGlass3D>
          </div>
        );
      })}
    </div>
  );
};
