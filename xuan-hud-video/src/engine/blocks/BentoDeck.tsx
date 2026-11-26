import React from 'react';
import { spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { FONTS, WEIGHTS } from '../../design/tokens';
import { clamp01, CRISP_SPRING, mixRgb, Rgb, smoothFocusWeight } from '../motion';
import { PhysicalGlass3D } from '../PhysicalGlass3D';

export interface BentoDeckCardSpec {
  code: string;
  subtitle: string;
  tag: string;
}

/**
 * 引擎积木库：2 + 3 错落立体阶梯卡阵（BentoDeck2Plus3）
 * - 严格按重力顺序入场：底层 3 卡先落、顶层 2 卡后落
 * - 支持单向扫描焦点 `scanPos * scanAlive` 与独立目标直切 `lockedIndex`（零中间卡片倒跑抖动）
 */
export const BentoDeck2Plus3: React.FC<{
  items: [BentoDeckCardSpec, BentoDeckCardSpec, BentoDeckCardSpec, BentoDeckCardSpec, BentoDeckCardSpec];
  enterBaseFrame: number;
  visibility?: number;
  scanPos: number;
  scanAlive?: number;
  lockedIndex?: number;
  lockStrength?: number;
  accentRgb?: Rgb;
}> = ({
  items,
  enterBaseFrame,
  visibility = 1,
  scanPos,
  scanAlive = 1,
  lockedIndex,
  lockStrength = 0,
  accentRgb = [245, 166, 35],
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const dropFrame = (idx: number) => (idx >= 2 ? enterBaseFrame + (idx - 2) * 5 : enterBaseFrame + 16 + idx * 5);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 34, opacity: clamp01(visibility) }}>
      {[0, 1].map((rowIdx) => {
        const rowItems = items
          .map((it, idx) => ({ ...it, idx }))
          .filter((it) => (rowIdx === 0 ? it.idx < 2 : it.idx >= 2));
        return (
          <div
            key={rowIdx}
            style={{
              display: 'grid',
              gridTemplateColumns: rowIdx === 0 ? '1fr 1fr' : 'repeat(3, 1fr)',
              gap: 34,
              perspective: 1500,
            }}
          >
            {rowItems.map((item) => {
              const p = spring({ frame: Math.max(0, frame - dropFrame(item.idx)), fps, config: CRISP_SPRING });
              const scanW = smoothFocusWeight(item.idx, scanPos, 0.88) * clamp01(scanAlive);
              const isLocked = lockedIndex === item.idx;
              const fadeOthers = lockedIndex === undefined || isLocked ? 1 : 1 - clamp01(lockStrength) * 0.72;
              const active = clamp01(isLocked ? Math.max(scanW, lockStrength) : scanW);
              const liftY = (1 - p) * -46 - active * 10;
              const extrudeX = rowIdx === 0 ? (item.idx === 0 ? -6 : 6) : (item.idx - 3) * 5;

              return (
                <div
                  key={item.code}
                  style={{
                    opacity: p * fadeOthers,
                    transform: `translate3d(0, ${liftY.toFixed(1)}px, 0) scale(${(0.94 + p * 0.06 + (isLocked ? lockStrength * 0.06 : 0)).toFixed(4)}) rotateX(4deg)`,
                  }}
                >
                  <PhysicalGlass3D
                    active={active}
                    accentRgb={accentRgb}
                    radius={26}
                    slabPx={15}
                    extrudeX={extrudeX}
                    padding={rowIdx === 0 ? '36px 42px 42px' : '32px 34px 38px'}
                    sheenSpeed={0.5}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 22 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span
                          style={{
                            fontFamily: FONTS.mono,
                            fontSize: 24,
                            fontWeight: WEIGHTS.regular,
                            letterSpacing: 1.6,
                            color: mixRgb([152, 168, 194], accentRgb, 0.25 + active * 0.75),
                          }}
                        >
                          {item.tag}
                        </span>
                        <span
                          style={{
                            width: 12,
                            height: 12,
                            borderRadius: '50%',
                            backgroundColor: mixRgb([88, 102, 128], accentRgb, active),
                            boxShadow: `0 0 ${(18 * active).toFixed(0)}px rgba(${accentRgb[0]},${accentRgb[1]},${accentRgb[2]},${(0.7 * active).toFixed(2)})`,
                          }}
                        />
                      </div>
                      <div
                        style={{
                          fontFamily: FONTS.mono,
                          fontSize: rowIdx === 0 ? 60 : 46,
                          fontWeight: WEIGHTS.regular,
                          color: mixRgb([236, 242, 250], [255, 196, 86], active),
                          lineHeight: 1.05,
                        }}
                      >
                        {item.code}
                      </div>
                      <div
                        style={{
                          fontSize: rowIdx === 0 ? 32 : 28,
                          fontWeight: WEIGHTS.light,
                          color: mixRgb([176, 190, 212], [255, 255, 255], active),
                          letterSpacing: 1.5,
                        }}
                      >
                        {item.subtitle}
                      </div>
                    </div>
                  </PhysicalGlass3D>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};
