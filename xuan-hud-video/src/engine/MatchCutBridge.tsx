import React from 'react';
import { useCurrentFrame } from 'remotion';
import { clamp01, easeInOutCubic, mixRgb, Rgb } from './motion';
import { Sfx } from './Sfx';

export interface MorphAnchor {
  /** 相对于 Stage 主安全区（1776×1036）的中心坐标 cx, cy */
  cx: number;
  cy: number;
  width: number;
  height: number;
  /** 圆角 px（取 min(w,h)/2 即真圆盘，26 即圆角方卡，999 即胶囊） */
  radius: number;
  accentRgb: Rgb;
  slabPx?: number;
}

/**
 * 跨场真匹配剪辑桥接层（MatchCutBridge · 太阳 → 车灯式同构几何形变）：
 * 独立渲染在相邻两个 `<Sequence>` 之上，在 `[startFrame, startFrame + durationFrames]` 窗口内存活，
 * 将上一场主角的坐标、尺寸、几何轮廓（圆 ↔ 方 ↔ 胶囊）与 Chrome 色彩连续插值变形成下一场主角，
 * 真正实现“上一镜主体不销毁、直接变身为下一镜主角”的电影级 Match-Cut！
 */
export const MatchCutBridge: React.FC<{
  startFrame: number;
  durationFrames?: number;
  from: MorphAnchor;
  to: MorphAnchor;
  labelFrom?: string;
  labelTo?: string;
  sfxMuted?: boolean;
}> = ({
  startFrame,
  durationFrames = 16,
  from,
  to,
  labelFrom,
  labelTo,
  sfxMuted = false,
}) => {
  const frame = useCurrentFrame();
  if (frame < startFrame || frame > startFrame + durationFrames) return null;

  const raw = clamp01((frame - startFrame) / Math.max(1, durationFrames));
  const t = easeInOutCubic(raw);

  const cx = from.cx + (to.cx - from.cx) * t;
  const cy = from.cy + (to.cy - from.cy) * t;
  const w = from.width + (to.width - from.width) * t;
  const h = from.height + (to.height - from.height) * t;
  const r = from.radius + (to.radius - from.radius) * t;
  const slab = Math.round((from.slabPx ?? 14) + ((to.slabPx ?? 14) - (from.slabPx ?? 14)) * t);

  const curRgb: Rgb = [
    Math.round(from.accentRgb[0] + (to.accentRgb[0] - from.accentRgb[0]) * t),
    Math.round(from.accentRgb[1] + (to.accentRgb[1] - from.accentRgb[1]) * t),
    Math.round(from.accentRgb[2] + (to.accentRgb[2] - from.accentRgb[2]) * t),
  ];
  const [ar, ag, ab] = curRgb;
  const borderCol = `rgba(${ar}, ${ag}, ${ab}, 0.92)`;
  const wallCol = mixRgb([68, 68, 68], [Math.round(ar * 0.72), Math.round(ag * 0.68), Math.round(ab * 0.62)], 0.8);
  const steps = Math.max(slab, 1);

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 25 }}>
      <Sfx kind="transition" at={startFrame} muted={sfxMuted} />
      <div
        style={{
          position: 'absolute',
          left: cx - w / 2,
          top: cy - h / 2,
          width: w,
          height: h,
          outline: '1px solid transparent',
        }}
      >
        {/* 连续挤出 2.5D 厚度随变形同步缩放变色 */}
        {Array.from({ length: steps }).map((_, idx) => {
          const dy = idx + 1;
          return (
            <div
              key={dy}
              style={{
                position: 'absolute',
                inset: 0,
                borderRadius: r,
                transform: `translate3d(0, ${dy}px, 0)`,
                backgroundColor: wallCol,
                outline: '1px solid transparent',
              }}
            />
          );
        })}

        {/* 变形中的玻璃主面 */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            borderRadius: r,
            borderWidth: 2,
            borderStyle: 'solid',
            borderColor: borderCol,
            backgroundColor: '#131824',
            backgroundImage: `radial-gradient(circle at 35% 30%, rgba(255,255,255,0.18) 0%, rgba(${ar},${ag},${ab},0.22) 60%, rgba(12,16,24,0.94) 100%)`,
            boxShadow: `0 22px 46px rgba(0,0,0,0.82), 0 0 42px rgba(${ar},${ag},${ab},0.36)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            zIndex: 2,
          }}
        >
          {labelFrom && t < 0.5 && (
            <span style={{ fontSize: 36, color: '#FFFFFF', opacity: 1 - t * 2 }}>{labelFrom}</span>
          )}
          {labelTo && t >= 0.5 && (
            <span style={{ fontSize: 36, color: '#FFFFFF', opacity: (t - 0.5) * 2 }}>{labelTo}</span>
          )}
        </div>
      </div>
    </div>
  );
};
