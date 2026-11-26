import React from 'react';
import { spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { COLORS, FONTS, WEIGHTS } from '../../design/tokens';
import { clamp01, CRISP_SPRING, easeOutExpo, mixRgb, Rgb } from '../motion';
import { PhysicalGlass3D } from '../PhysicalGlass3D';
import { SfxGroup } from '../Sfx';

export interface SupportingMetricSpec {
  value: string;
  label: string;
  at: number;
}

/**
 * 引擎积木库（第 12 类几何骨架）：超大数字冲击主卡 + 三维支撑指标（HeroMetricSpotlight）
 * 适用语义：重磅福利额度（如 5TB 空间 / 免费额度）、效率提升倍数、成本直降百分比、核心跑分。
 * 动效逻辑：144px 等宽细体大数字从 `fromValue -> toValue` 指数减速跳动到位（零宽度抖动），下方 3 张支撑副指标按口播逐拍落位。
 */
export const HeroMetricSpotlight: React.FC<{
  eyebrow: string;
  fromValue?: number;
  toValue: number;
  decimals?: number;
  prefix?: string;
  unit: string;
  caption: string;
  countStartAt?: number;
  countDurFrames?: number;
  pillars: [SupportingMetricSpec, SupportingMetricSpec, SupportingMetricSpec];
  accentRgb?: Rgb;
  sfxMuted?: boolean;
}> = ({
  eyebrow,
  fromValue = 0,
  toValue,
  decimals = 0,
  prefix = '',
  unit,
  caption,
  countStartAt = 4,
  countDurFrames = 26,
  pillars,
  accentRgb = [245, 166, 35],
  sfxMuted = false,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const heroIn = spring({ frame: Math.max(0, frame - 2), fps, config: CRISP_SPRING });
  const countT = clamp01(easeOutExpo((frame - countStartAt) / Math.max(1, countDurFrames)));
  const curVal = fromValue + (toValue - fromValue) * countT;
  const formatted = decimals > 0 ? curVal.toFixed(decimals) : String(Math.round(curVal));

  const sfxEvents = [
    { kind: 'drop' as const, at: 3 },
    { kind: 'flow' as const, at: countStartAt },
    ...pillars.map((p) => ({ kind: 'deal' as const, at: p.at })),
  ];

  return (
    <div
      style={{
        width: '100%',
        height: 740,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: 38,
      }}
    >
      <SfxGroup events={sfxEvents} muted={sfxMuted} />

      {/* 上层巨物数字主砖 */}
      <div
        style={{
          opacity: heroIn,
          transform: `perspective(1600px) translate3d(0, ${((1 - heroIn) * 30).toFixed(1)}px, 0) rotateX(4deg)`,
        }}
      >
        <PhysicalGlass3D active={0.45 + countT * 0.55} accentRgb={accentRgb} radius={30} slabPx={18} extrudeX={0} padding="48px 64px 54px" sheenSpeed={0.55}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 48 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <span style={{ fontFamily: FONTS.mono, fontSize: 25, color: mixRgb(accentRgb, accentRgb, 1), letterSpacing: 2.5 }}>
                {eyebrow}
              </span>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 22 }}>
                <span
                  style={{
                    fontFamily: FONTS.display,
                    fontSize: 144,
                    fontWeight: WEIGHTS.light,
                    fontVariantNumeric: 'tabular-nums',
                    color: mixRgb([238, 244, 252], accentRgb, countT * 0.85),
                    lineHeight: 0.9,
                    letterSpacing: -2,
                  }}
                >
                  {prefix}
                  {formatted}
                </span>
                <span style={{ fontSize: 48, fontWeight: WEIGHTS.light, color: COLORS.white, letterSpacing: 2 }}>
                  {unit}
                </span>
              </div>
            </div>

            <div
              style={{
                maxWidth: 560,
                fontSize: 33,
                fontWeight: WEIGHTS.light,
                color: '#D4DFEE',
                lineHeight: 1.62,
                letterSpacing: 1.2,
              }}
            >
              {caption}
            </div>
          </div>
        </PhysicalGlass3D>
      </div>

      {/* 下层 3 张支撑副指标 2.5D 厚砖（上下双层对齐，三卡严格等高、零单字孤行） */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 36, perspective: 1500 }}>
        {pillars.map((pl, idx) => {
          const pp = spring({ frame: Math.max(0, frame - pl.at), fps, config: CRISP_SPRING });
          return (
            <div
              key={pl.label}
              style={{
                opacity: pp,
                transform: `translate3d(0, ${((1 - pp) * 26).toFixed(1)}px, 0) rotateX(4deg)`,
              }}
            >
              <PhysicalGlass3D
                active={0.38 + pp * 0.35}
                accentRgb={accentRgb}
                radius={24}
                slabPx={14}
                extrudeX={(idx - 1) * 5}
                padding="30px 38px 34px"
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <span style={{ fontSize: 26, fontWeight: WEIGHTS.light, color: '#9FB0C8', letterSpacing: 1.4, whiteSpace: 'nowrap' }}>
                    {pl.label}
                  </span>
                  <span style={{ fontFamily: FONTS.display, fontSize: 48, fontWeight: WEIGHTS.light, lineHeight: 1.25, color: COLORS.white, fontVariantNumeric: 'tabular-nums', letterSpacing: 1, whiteSpace: 'nowrap' }}>
                    {pl.value}
                  </span>
                </div>
              </PhysicalGlass3D>
            </div>
          );
        })}
      </div>
    </div>
  );
};
