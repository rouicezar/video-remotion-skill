import React, { useId } from 'react';
import { spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { COLORS, FONTS, WEIGHTS } from '../../design/tokens';
import { clamp01, CRISP_SPRING, easeInOutCubic, mixRgb, Rgb } from '../motion';
import { PhysicalGlass3D } from '../PhysicalGlass3D';
import { Trapezoid3D } from '../shapes/Geometry3D';
import { SfxGroup } from '../Sfx';

export interface FunnelStageSpec {
  countTag: string;
  title: string;
  at: number;
}

/**
 * 引擎积木库（第 13 类几何骨架）：三级递进收窄漏斗 + 提纯结果卡（FunnelFilterStack）
 * 适用语义：海量扫描过滤（如 20 文件 → 筛除噪音 → 锁定高危 Bug）、选题漏斗、候选人/模型层层淘汰。
 */
export const FunnelFilterStack: React.FC<{
  layers: [FunnelStageSpec, FunnelStageSpec, FunnelStageSpec];
  output: { badge: string; title: string; metric: string; sub: string; at: number };
  accentRgb?: Rgb;
  resultRgb?: Rgb;
  sfxMuted?: boolean;
}> = ({
  layers,
  output,
  accentRgb = [245, 166, 35],
  resultRgb = [52, 168, 83],
  sfxMuted = false,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const uid = useId().replace(/:/g, '');

  // 真等腰梯形上底/下底宽度，构成肉眼一眼可辨的立体漏斗斜边！
  const trapSpecs = [
    { topW: 840, botW: 720 },
    { topW: 690, botW: 580 },
    { topW: 550, botW: 450 },
  ] as const;
  const centerLeft = 430; // 第3层右腰中点约在 x = 430 + 250 = 680
  const outP = spring({ frame: Math.max(0, frame - output.at), fps, config: CRISP_SPRING });
  const beamP = clamp01(easeInOutCubic((frame - (output.at - 6)) / 14));

  const sfxEvents = [
    ...layers.map((l) => ({ kind: 'deal' as const, at: l.at })),
    { kind: 'flow' as const, at: Math.max(0, output.at - 5) },
    { kind: 'drop' as const, at: output.at },
  ];

  return (
    <div style={{ position: 'relative', width: 1560, height: 740 }}>
      <SfxGroup events={sfxEvents} muted={sfxMuted} />

      {/* 漏斗底层出口 → 右侧提纯结果卡精确贴边导光连线 */}
      <svg width="1560" height="740" viewBox="0 0 1560 740" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 3 }}>
        <defs>
          <linearGradient id={`funnel-out-${uid}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={`rgba(${accentRgb[0]}, ${accentRgb[1]}, ${accentRgb[2]}, 0.9)`} />
            <stop offset="100%" stopColor={`rgba(${resultRgb[0]}, ${resultRgb[1]}, ${resultRgb[2]}, 0.95)`} />
          </linearGradient>
        </defs>
        <path
          d="M 710 566 C 825 566, 845 370, 980 370"
          fill="none"
          stroke={`url(#funnel-out-${uid})`}
          strokeWidth="3.2"
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={1 - beamP}
          strokeLinecap="round"
          opacity={beamP <= 0.02 ? 0 : 0.92}
        />
      </svg>

      {/* 左侧由宽到窄三级真 2.5D 等腰梯形漏斗（Trapezoid3D，彻底告别三根方条） */}
      {layers.map((ly, idx) => {
        const sp = trapSpecs[idx];
        const lp = spring({ frame: Math.max(0, frame - ly.at), fps, config: CRISP_SPRING });
        const top = 74 + idx * 204;
        const boxW = sp.topW + 8;
        return (
          <div
            key={ly.title}
            style={{
              position: 'absolute',
              left: centerLeft - boxW / 2,
              top,
              opacity: lp,
              transform: `translate3d(0, ${((1 - lp) * -28).toFixed(1)}px, 0)`,
              zIndex: 4 + idx,
            }}
          >
            <Trapezoid3D topWidth={sp.topW} bottomWidth={sp.botW} height={124} slabPx={14} active={0.35 + (idx / 2) * 0.55} accentRgb={accentRgb}>
              <div style={{ width: sp.botW - 28, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 18 }}>
                <span style={{ fontSize: 32, fontWeight: WEIGHTS.medium, color: COLORS.white, letterSpacing: 1, whiteSpace: 'nowrap' }}>
                  {ly.title}
                </span>
                <span style={{ fontFamily: FONTS.mono, fontSize: 24, fontWeight: WEIGHTS.regular, color: mixRgb([216, 224, 238], accentRgb, 0.45 + idx * 0.28), whiteSpace: 'nowrap', flexShrink: 0 }}>
                  {ly.countTag}
                </span>
              </div>
            </Trapezoid3D>
          </div>
        );
      })}

      {/* 右侧提纯高光结果大砖（左边缘精确起于 x=980） */}
      <div
        style={{
          position: 'absolute',
          left: 980,
          top: 185,
          width: 580,
          opacity: outP,
          transform: `perspective(1500px) translate3d(${((1 - outP) * 38).toFixed(1)}px, 0, 0) rotateY(-4deg)`,
          zIndex: 6,
        }}
      >
        <PhysicalGlass3D active={0.95} accentRgb={resultRgb} radius={28} slabPx={16} extrudeX={7} padding="46px 48px 52px" sheenSpeed={0.6}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <span style={{ fontFamily: FONTS.mono, fontSize: 24, color: mixRgb([180, 244, 214], resultRgb, 0.7), letterSpacing: 2 }}>
              {output.badge}
            </span>
            <div style={{ fontFamily: FONTS.display, fontSize: 96, fontWeight: WEIGHTS.light, color: mixRgb([235, 252, 244], resultRgb, 0.8), lineHeight: 0.95 }}>
              {output.metric}
            </div>
            <div style={{ fontSize: 40, fontWeight: WEIGHTS.regular, color: COLORS.white, letterSpacing: 1.5 }}>
              {output.title}
            </div>
            <div style={{ fontSize: 27, fontWeight: WEIGHTS.light, color: '#B8C8DE', letterSpacing: 1 }}>
              {output.sub}
            </div>
          </div>
        </PhysicalGlass3D>
      </div>
    </div>
  );
};
