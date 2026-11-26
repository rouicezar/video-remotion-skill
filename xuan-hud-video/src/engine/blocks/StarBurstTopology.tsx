import React, { useId } from 'react';
import { spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { COLORS, FONTS, WEIGHTS } from '../../design/tokens';
import { clamp01, CRISP_SPRING, easeInOutCubic, mixRgb, Rgb } from '../motion';
import { PhysicalGlass3D } from '../PhysicalGlass3D';

export interface StarNodeSpec {
  id: string;
  label: string;
  statusText: string;
}

const SLOTS = [
  { x: 170, y: 90, edgeX: 490, edgeY: 205, hubX: 640, hubY: 300, extrudeX: -6 },
  { x: 1070, y: 90, edgeX: 1070, edgeY: 205, hubX: 920, hubY: 300, extrudeX: 6 },
  { x: 170, y: 500, edgeX: 490, edgeY: 560, hubX: 640, hubY: 440, extrudeX: -6 },
  { x: 1070, y: 500, edgeX: 1070, edgeY: 560, hubX: 920, hubY: 440, extrudeX: 6 },
] as const;

/**
 * 引擎积木库：中心枢纽 → 四角并发星型拓扑迸射（StarBurstTopology）
 */
export const StarBurstTopology: React.FC<{
  hubBadge: string;
  hubTitle: string;
  hubSub: string;
  nodes: [StarNodeSpec, StarNodeSpec, StarNodeSpec, StarNodeSpec];
  expandProgress: number;
  burstAt: number;
  syncGlow: number;
  accentRgb?: Rgb;
  syncRgb?: Rgb;
}> = ({
  hubBadge,
  hubTitle,
  hubSub,
  nodes,
  expandProgress,
  burstAt,
  syncGlow,
  accentRgb = [245, 166, 35],
  syncRgb = [52, 168, 83],
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const uid = useId().replace(/:/g, '');
  const g = clamp01(syncGlow);

  return (
    <div style={{ position: 'absolute', inset: 0, opacity: clamp01(expandProgress) }}>
      <svg width="1560" height="740" viewBox="0 0 1560 740" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 3 }}>
        <defs>
          <linearGradient id={`star-beam-${uid}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={`rgba(${accentRgb[0]}, ${accentRgb[1]}, ${accentRgb[2]}, 0.92)`} />
            <stop offset="100%" stopColor={`rgba(${syncRgb[0]}, ${syncRgb[1]}, ${syncRgb[2]}, 0.88)`} />
          </linearGradient>
        </defs>
        {SLOTS.map((s, i) => {
          const lineP = clamp01(easeInOutCubic((frame - (burstAt - 4 + i * 4)) / 14));
          return (
            <line
              key={i}
              x1={s.hubX}
              y1={s.hubY}
              x2={s.edgeX}
              y2={s.edgeY}
              stroke={`url(#star-beam-${uid})`}
              strokeWidth="2.6"
              pathLength={1}
              strokeDasharray={1}
              strokeDashoffset={1 - lineP}
              strokeLinecap="round"
              opacity={lineP <= 0.02 ? 0 : 0.9}
            />
          );
        })}
      </svg>

      {/* 中心总控枢纽（x: 640..920） */}
      <div
        style={{
          position: 'absolute',
          left: 640,
          top: 262,
          width: 280,
          transform: `scale(${(0.86 + clamp01(expandProgress) * 0.14 + g * 0.04).toFixed(4)})`,
        }}
      >
        <PhysicalGlass3D active={1} accentRgb={accentRgb} radius={24} slabPx={15} extrudeX={0} padding="30px 24px 34px">
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, textAlign: 'center' }}>
            <span style={{ fontFamily: FONTS.mono, fontSize: 24, color: mixRgb(accentRgb, accentRgb, 1) }}>{hubBadge}</span>
            <span style={{ fontSize: 36, fontWeight: WEIGHTS.regular, color: COLORS.white }}>{hubTitle}</span>
            <span style={{ fontSize: 24, fontWeight: WEIGHTS.light, color: '#CBD6E8' }}>{hubSub}</span>
          </div>
        </PhysicalGlass3D>
      </div>

      {/* 四角并发节点（宽度 320，内边缘严格贴合 490 / 1070） */}
      {nodes.map((node, i) => {
        const s = SLOTS[i];
        const wp = spring({ frame: Math.max(0, frame - (burstAt + i * 4)), fps, config: CRISP_SPRING });
        const dx = i % 2 === 0 ? (1 - wp) * 55 : (1 - wp) * -55;
        const curAccent: Rgb = [
          Math.round(accentRgb[0] + (syncRgb[0] - accentRgb[0]) * g),
          Math.round(accentRgb[1] + (syncRgb[1] - accentRgb[1]) * g),
          Math.round(accentRgb[2] + (syncRgb[2] - accentRgb[2]) * g),
        ];
        return (
          <div
            key={node.id}
            style={{
              position: 'absolute',
              left: s.x,
              top: s.y,
              width: 320,
              opacity: wp,
              transform: `translate3d(${dx.toFixed(1)}px, ${((1 - wp) * 18).toFixed(1)}px, 0) scale(${(0.92 + wp * 0.08 + g * 0.04).toFixed(4)})`,
            }}
          >
            <PhysicalGlass3D active={0.45 + g * 0.55} accentRgb={curAccent} radius={22} slabPx={13} extrudeX={s.extrudeX} padding="24px 28px 28px" sheenSpeed={0.55}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <span style={{ fontFamily: FONTS.mono, fontSize: 25, fontWeight: WEIGHTS.regular, color: mixRgb([245, 186, 82], [94, 234, 178], g) }}>
                  {node.id}
                </span>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 32, fontWeight: WEIGHTS.regular, color: COLORS.white }}>{node.label}</span>
                  <span style={{ fontSize: 24, fontWeight: WEIGHTS.light, color: mixRgb([180, 194, 216], [167, 243, 208], g) }}>
                    {node.statusText}
                  </span>
                </div>
              </div>
            </PhysicalGlass3D>
          </div>
        );
      })}
    </div>
  );
};
