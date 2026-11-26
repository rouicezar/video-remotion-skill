import React, { useId } from 'react';
import { spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { COLORS, FONTS, WEIGHTS } from '../../design/tokens';
import { clamp01, CRISP_SPRING, easeInOutCubic, mixRgb, Rgb } from '../motion';
import { PhysicalGlass3D } from '../PhysicalGlass3D';
import { SfxGroup } from '../Sfx';

export interface CheckCriterionSpec {
  commandText: string;
  verdictText: string;
  /** 核验通过触发帧（此前不提前亮绿标） */
  passAt: number;
}

/**
 * 引擎积木库（第 7 类几何骨架）：大号圆形进度仪表盘 + 机器核验控制台（CircularGaugeConsole）
 * 适用语义：量化指标冲顶、过夜自动收敛、测试通过率、性能提升对比。
 */
export const CircularGaugeConsole: React.FC<{
  consoleTitle: string;
  consoleBody: string;
  criteria: CheckCriterionSpec[];
  gaugeLabel: string;
  startAt: number;
  completeAt: number;
  runningStatus?: string;
  doneStatus?: string;
  accentRgb?: Rgb;
  passRgb?: Rgb;
  sfxMuted?: boolean;
}> = ({
  consoleTitle,
  consoleBody,
  criteria,
  gaugeLabel,
  startAt,
  completeAt,
  runningStatus = '自动死磕验证中',
  doneStatus = '全部达标 · 自动收工 ✓',
  accentRgb = [245, 166, 35],
  passRgb = [52, 211, 153],
  sfxMuted = false,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const uid = useId().replace(/:/g, '');

  const cardIn = spring({ frame: Math.max(0, frame - 3), fps, config: CRISP_SPRING });
  const runProgress = clamp01(easeInOutCubic((frame - startAt) / Math.max(12, completeAt - startAt)));
  const pct = Math.round(12 + runProgress * 88);
  const doneWeight = clamp01(easeInOutCubic((frame - (completeAt - 6)) / 12));

  const radius = 196;
  const circ = 2 * Math.PI * radius;

  const curRgb: Rgb = [
    Math.round(accentRgb[0] + (passRgb[0] - accentRgb[0]) * doneWeight),
    Math.round(accentRgb[1] + (passRgb[1] - accentRgb[1]) * doneWeight),
    Math.round(accentRgb[2] + (passRgb[2] - accentRgb[2]) * doneWeight),
  ];

  const sfxEvents = [
    { kind: 'drop' as const, at: 4 },
    { kind: 'flow' as const, at: startAt },
    ...criteria.map((c) => ({ kind: 'pop' as const, at: c.passAt })),
  ];

  return (
    <div
      style={{
        width: '100%',
        height: 740,
        display: 'grid',
        gridTemplateColumns: '1.18fr 0.82fr',
        gap: 54,
        alignItems: 'center',
      }}
    >
      <SfxGroup events={sfxEvents} muted={sfxMuted} />

      {/* 左侧 2.5D 可验证目标控制台 */}
      <div style={{ opacity: cardIn, transform: `perspective(1500px) translate3d(0, ${((1 - cardIn) * 28).toFixed(1)}px, 0) rotateY(3deg)` }}>
        <PhysicalGlass3D active={0.75 + doneWeight * 0.25} accentRgb={curRgb} radius={28} slabPx={16} extrudeX={-6} padding="46px 50px 52px">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 30 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 36, fontWeight: WEIGHTS.regular, color: COLORS.white, letterSpacing: 1.5 }}>
                {consoleTitle}
              </span>
              <span style={{ fontFamily: FONTS.mono, fontSize: 24, color: mixRgb(accentRgb, passRgb, doneWeight), letterSpacing: 2 }}>
                VERIFIABLE TARGET
              </span>
            </div>

            <div style={{ fontSize: 38, fontWeight: WEIGHTS.light, color: '#EEF3FA', lineHeight: 1.65, letterSpacing: 1 }}>
              {consoleBody}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingTop: 22, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
              {criteria.map((c) => {
                const cp = clamp01(easeInOutCubic((frame - c.passAt) / 12));
                return (
                  <div
                    key={c.commandText}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '14px 24px',
                      borderRadius: 14,
                      backgroundColor: `rgba(${curRgb[0]}, ${curRgb[1]}, ${curRgb[2]}, ${(0.05 + cp * 0.12).toFixed(3)})`,
                      border: `1.5px solid ${mixRgb([92, 106, 134], passRgb, cp * 0.88)}`,
                    }}
                  >
                    <span style={{ fontFamily: FONTS.mono, fontSize: 26, color: '#E2EBF8' }}>{c.commandText}</span>
                    <span style={{ fontFamily: FONTS.mono, fontSize: 25, color: mixRgb([152, 166, 190], [167, 243, 208], cp), opacity: 0.35 + cp * 0.65 }}>
                      {cp > 0.4 ? c.verdictText : 'PENDING…'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </PhysicalGlass3D>
      </div>

      {/* 右侧 2.5D 大号圆形进度仪表盘 */}
      <div style={{ display: 'flex', justifyContent: 'center', transform: `perspective(1500px) rotateY(-4deg) scale(${(0.96 + doneWeight * 0.05).toFixed(4)})` }}>
        <PhysicalGlass3D active={0.6 + doneWeight * 0.4} accentRgb={curRgb} radius={34} slabPx={16} extrudeX={6} padding="44px 44px 48px">
          <div style={{ position: 'relative', width: 440, height: 440, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="440" height="440" viewBox="0 0 450 450" style={{ transform: 'rotate(-90deg)' }}>
              <defs>
                <linearGradient id={`gauge-grad-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor={mixRgb(accentRgb, passRgb, doneWeight * 0.6)} />
                  <stop offset="100%" stopColor={mixRgb(accentRgb, passRgb, doneWeight)} />
                </linearGradient>
              </defs>
              <circle cx="225" cy="225" r="212" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="2" strokeDasharray="6 10" />
              <circle cx="225" cy="225" r={radius} fill="none" stroke="rgba(255,255,255,0.09)" strokeWidth="18" />
              <circle
                cx="225"
                cy="225"
                r={radius}
                fill="none"
                stroke={`url(#gauge-grad-${uid})`}
                strokeWidth="18"
                strokeLinecap="round"
                strokeDasharray={circ}
                strokeDashoffset={circ * (1 - pct / 100)}
              />
            </svg>

            <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
              <span style={{ fontFamily: FONTS.mono, fontSize: 24, color: '#9EB0CA', letterSpacing: 2.5 }}>{gaugeLabel}</span>
              <span
                style={{
                  fontFamily: FONTS.display,
                  fontSize: 112,
                  fontWeight: WEIGHTS.light,
                  fontVariantNumeric: 'tabular-nums',
                  color: mixRgb(accentRgb, passRgb, doneWeight),
                  lineHeight: 0.94,
                }}
              >
                {pct}%
              </span>
              <span style={{ fontSize: 27, fontWeight: WEIGHTS.light, color: mixRgb([214, 224, 240], [180, 250, 218], doneWeight), letterSpacing: 1.5 }}>
                {doneWeight > 0.5 ? doneStatus : runningStatus}
              </span>
            </div>
          </div>
        </PhysicalGlass3D>
      </div>
    </div>
  );
};
