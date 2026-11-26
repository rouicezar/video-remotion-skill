import React from 'react';
import { spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { COLORS, FONTS, WEIGHTS } from '../../design/tokens';
import { clamp01, CRISP_SPRING, easeInOutCubic, mixRgb, Rgb } from '../motion';
import { PhysicalGlass3D } from '../PhysicalGlass3D';
import { SfxGroup } from '../Sfx';

export interface VersusSideSpec {
  badge: string;
  title: string;
  points: Array<{ text: string; at: number }>;
}

/**
 * 引擎积木库（第 9 类几何骨架）：左右正反双栏 2.5D 对决台（VersusCompareArena）
 * 适用语义：误区 vs 正解、传统方式 vs 新范式、竞品双雄对比、免费 vs 专业版。
 * 动效逻辑：左栏先入场陈述痛点 → `winAt` 触发右侧胜出方案亮起，同时左栏自动压暗微退让出视觉焦点。
 */
export const VersusCompareArena: React.FC<{
  left: VersusSideSpec;
  right: VersusSideSpec;
  rightEnterAt: number;
  winAt: number;
  loseRgb?: Rgb;
  winRgb?: Rgb;
  sfxMuted?: boolean;
}> = ({
  left,
  right,
  rightEnterAt,
  winAt,
  loseRgb = [234, 67, 53],
  winRgb = [52, 168, 83],
  sfxMuted = false,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const leftIn = spring({ frame: Math.max(0, frame - 2), fps, config: CRISP_SPRING });
  const rightIn = spring({ frame: Math.max(0, frame - rightEnterAt), fps, config: CRISP_SPRING });
  const winShift = clamp01(easeInOutCubic((frame - winAt) / 16));

  const sfxEvents = [
    { kind: 'drop' as const, at: 3 },
    ...left.points.map((p) => ({ kind: 'pop' as const, at: p.at })),
    { kind: 'deal' as const, at: rightEnterAt },
    ...right.points.map((p) => ({ kind: 'pop' as const, at: p.at })),
    { kind: 'flow' as const, at: winAt },
  ];

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: 740,
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 72,
        alignItems: 'center',
      }}
    >
      <SfxGroup events={sfxEvents} muted={sfxMuted} />

      {/* 左栏：旧方案 / 痛点侧（右侧胜出后柔和退让 22% 亮度与 3% 缩放） */}
      <div
        style={{
          opacity: leftIn * (1 - winShift * 0.22),
          transform: `perspective(1500px) translate3d(0, ${((1 - leftIn) * 30).toFixed(1)}px, 0) scale(${(1 - winShift * 0.03).toFixed(4)}) rotateY(4deg)`,
        }}
      >
        <PhysicalGlass3D
          active={0.62 * (1 - winShift * 0.3)}
          accentRgb={loseRgb}
          radius={28}
          slabPx={15}
          extrudeX={-7}
          padding="46px 48px 52px"
          sheenSpeed={0.35}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 28, minHeight: 460 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span
                style={{
                  fontFamily: FONTS.mono,
                  fontSize: 24,
                  color: mixRgb([214, 198, 196], loseRgb, 0.78),
                  letterSpacing: 2,
                }}
              >
                {left.badge}
              </span>
              <span style={{ fontSize: 26, color: mixRgb([214, 198, 196], loseRgb, 0.82) }}>✕</span>
            </div>

            <div style={{ fontSize: 44, fontWeight: WEIGHTS.regular, color: COLORS.white, letterSpacing: 1.5 }}>
              {left.title}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 18, marginTop: 8 }}>
              {left.points.map((pt) => {
                const pp = spring({ frame: Math.max(0, frame - pt.at), fps, config: CRISP_SPRING });
                return (
                  <div
                    key={pt.text}
                    style={{
                      padding: '18px 24px',
                      borderRadius: 14,
                      backgroundColor: '#1C1E22',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderLeft: `3px solid ${mixRgb(loseRgb, loseRgb, 1)}`,
                      fontSize: 29,
                      fontWeight: WEIGHTS.light,
                      color: '#D8DCE3',
                      letterSpacing: 1,
                      opacity: pp,
                      transform: `translate3d(0, ${((1 - pp) * 16).toFixed(1)}px, 0)`,
                    }}
                  >
                    {pt.text}
                  </div>
                );
              })}
            </div>
          </div>
        </PhysicalGlass3D>
      </div>

      {/* 中轴悬浮 2.5D VS 徽章 */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: `translate(-50%, -50%) scale(${(0.9 + rightIn * 0.1).toFixed(4)})`,
          opacity: Math.max(leftIn * 0.5, rightIn),
          zIndex: 8,
        }}
      >
        <PhysicalGlass3D active={0.4 + winShift * 0.6} accentRgb={[245, 166, 35]} radius={22} slabPx={10} extrudeX={0} padding="16px 22px 18px" sheenSpeed={0}>
          <span style={{ fontFamily: FONTS.mono, fontSize: 26, fontWeight: WEIGHTS.regular, color: COLORS.amber, letterSpacing: 2 }}>
            VS
          </span>
        </PhysicalGlass3D>
      </div>

      {/* 右栏：新范式 / 胜出侧 */}
      <div
        style={{
          opacity: rightIn,
          transform: `perspective(1500px) translate3d(0, ${((1 - rightIn) * 32 - winShift * 8).toFixed(1)}px, 0) scale(${(0.96 + rightIn * 0.04 + winShift * 0.03).toFixed(4)}) rotateY(-4deg)`,
        }}
      >
        <PhysicalGlass3D
          active={0.45 + winShift * 0.55}
          accentRgb={winRgb}
          radius={28}
          slabPx={16}
          extrudeX={7}
          padding="46px 48px 52px"
          sheenSpeed={0.6}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 28, minHeight: 460 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span
                style={{
                  fontFamily: FONTS.mono,
                  fontSize: 24,
                  color: mixRgb([180, 238, 210], winRgb, 0.75),
                  letterSpacing: 2,
                }}
              >
                {right.badge}
              </span>
              <span style={{ fontSize: 26, color: mixRgb([170, 242, 208], winRgb, 0.85) }}>✓</span>
            </div>

            <div style={{ fontSize: 44, fontWeight: WEIGHTS.regular, color: COLORS.white, letterSpacing: 1.5 }}>
              {right.title}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 18, marginTop: 8 }}>
              {right.points.map((pt) => {
                const pp = spring({ frame: Math.max(0, frame - pt.at), fps, config: CRISP_SPRING });
                return (
                  <div
                    key={pt.text}
                    style={{
                      padding: '18px 24px',
                      borderRadius: 14,
                      backgroundColor: '#1C1E22',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderLeft: `3px solid ${mixRgb(winRgb, winRgb, 1)}`,
                      fontSize: 29,
                      fontWeight: WEIGHTS.light,
                      color: COLORS.white,
                      letterSpacing: 1,
                      opacity: pp,
                      transform: `translate3d(0, ${((1 - pp) * 16).toFixed(1)}px, 0)`,
                    }}
                  >
                    {pt.text}
                  </div>
                );
              })}
            </div>
          </div>
        </PhysicalGlass3D>
      </div>
    </div>
  );
};
