import React, { useId } from 'react';
import { spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { COLORS, FONTS, WEIGHTS } from '../../design/tokens';
import { clamp01, CRISP_SPRING, easeInOutCubic, mixRgb, Rgb, smoothFocusWeight, steppedGlide } from '../motion';
import { PhysicalGlass3D } from '../PhysicalGlass3D';
import { SfxGroup } from '../Sfx';

export interface TimelineStopSpec {
  timeTag: string;
  title: string;
  sub: string;
  at: number;
}

/**
 * 引擎积木库（第 11 类几何骨架）：交错横向时间轴演进轨（HorizontalTimelineTrack）
 * 适用语义：版本迭代、Day1→Day7 演进、四步实操路线图、历史脉络。
 * 空间设计：4 个站点采用「上-下-上-下」双层交错悬挑在中央流光时间脊线两侧，完美吃满 3:2 纵向高度，拒绝挤成单排小卡片。
 */
export const HorizontalTimelineTrack: React.FC<{
  stops: [TimelineStopSpec, TimelineStopSpec, TimelineStopSpec, TimelineStopSpec];
  accentRgb?: Rgb;
  sfxMuted?: boolean;
}> = ({ stops, accentRgb = [245, 166, 35], sfxMuted = false }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const uid = useId().replace(/:/g, '');

  const xs = [195, 585, 975, 1365] as const;
  const spineY = 370;

  const focusPos = steppedGlide(
    frame,
    stops.map((s, i) => ({ at: s.at, dur: i === 0 ? 1 : 14, target: i }))
  );

  const spineProgress = clamp01(focusPos / 3);
  const sfxEvents = stops.map((s) => ({ kind: 'pop' as const, at: s.at }));

  return (
    <div style={{ position: 'relative', width: 1560, height: 740 }}>
      <SfxGroup events={sfxEvents} muted={sfxMuted} />

      {/* 中轴时间脊线 + 垂直支杆（严格止于卡片上下外框） */}
      <svg width="1560" height="740" viewBox="0 0 1560 740" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 2 }}>
        <defs>
          <linearGradient id={`tl-spine-${uid}`} gradientUnits="userSpaceOnUse" x1={xs[0]} y1={spineY} x2={xs[3]} y2={spineY}>
            <stop offset="0%" stopColor={`rgba(${accentRgb[0]}, ${accentRgb[1]}, ${accentRgb[2]}, 0.95)`} />
            <stop offset="100%" stopColor="rgba(255, 232, 178, 0.9)" />
          </linearGradient>
        </defs>

        {/* 底轨暗线 */}
        <line x1={xs[0]} y1={spineY} x2={xs[3]} y2={spineY} stroke="rgba(255,255,255,0.14)" strokeWidth="3" />

        {/* 激活推进亮轨 */}
        {spineProgress > 0.01 && (
          <line
            x1={xs[0]}
            y1={spineY}
            x2={xs[0] + (xs[3] - xs[0]) * spineProgress}
            y2={spineY}
            stroke={`url(#tl-spine-${uid})`}
            strokeWidth="4"
            strokeLinecap="round"
          />
        )}

        {/* 各站点圆环锚点与垂直连接支杆 */}
        {stops.map((st, idx) => {
          const isTop = idx % 2 === 0;
          const reached = clamp01(easeInOutCubic((frame - st.at) / 10));
          const stemEndY = isTop ? 248 : 492;
          const r = 11;
          return (
            <g key={st.timeTag} opacity={0.28 + reached * 0.72}>
              <line
                x1={xs[idx]}
                y1={isTop ? spineY - r : spineY + r}
                x2={xs[idx]}
                y2={stemEndY}
                stroke={mixRgb([110, 126, 154], accentRgb, reached)}
                strokeWidth="2.2"
              />
              <circle
                cx={xs[idx]}
                cy={spineY}
                r={r}
                fill="#0E131E"
                stroke={mixRgb([132, 148, 178], accentRgb, reached)}
                strokeWidth="3.2"
              />
            </g>
          );
        })}
      </svg>

      {/* 上下交错 4 张 2.5D 节点厚卡 */}
      {stops.map((st, idx) => {
        const isTop = idx % 2 === 0;
        const p = spring({ frame: Math.max(0, frame - st.at), fps, config: CRISP_SPRING });
        const w = frame >= st.at ? smoothFocusWeight(idx, focusPos, 0.88) : 0;
        const cardW = 360;
        const left = xs[idx] - cardW / 2;
        const top = isTop ? 36 : 492;

        return (
          <div
            key={st.timeTag}
            style={{
              position: 'absolute',
              left,
              top,
              width: cardW,
              opacity: p,
              transform: `translate3d(0, ${((1 - p) * (isTop ? -24 : 24) + (isTop ? -w * 6 : w * 6)).toFixed(1)}px, 0) scale(${(0.94 + p * 0.06 + w * 0.04).toFixed(4)})`,
              zIndex: 4,
            }}
          >
            <PhysicalGlass3D
              active={0.22 + w * 0.78}
              accentRgb={accentRgb}
              radius={24}
              slabPx={14}
              extrudeX={(idx - 1.5) * 3}
              padding="26px 30px 30px"
              sheenSpeed={0.5}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <span style={{ fontFamily: FONTS.mono, fontSize: 24, color: mixRgb([158, 174, 200], accentRgb, 0.35 + w * 0.65), letterSpacing: 1.8 }}>
                  {st.timeTag}
                </span>
                <div style={{ fontSize: 36, fontWeight: WEIGHTS.regular, color: COLORS.white, letterSpacing: 1.2 }}>
                  {st.title}
                </div>
                <div style={{ fontSize: 25, fontWeight: WEIGHTS.light, color: '#AEBCD2', letterSpacing: 1 }}>
                  {st.sub}
                </div>
              </div>
            </PhysicalGlass3D>
          </div>
        );
      })}
    </div>
  );
};
