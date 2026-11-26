import React, { useId } from 'react';
import { staticFile, useCurrentFrame } from 'remotion';
import { clamp01, mixRgb, Rgb } from './motion';

export interface PhysicalGlass3DProps {
  children: React.ReactNode;
  /** 0..1 连续激活权重，驱动侧壁导光与顶面棱光 */
  active?: number;
  /** Chrome 四色点睛 RGB（橙/蓝/红/绿），默认橙 [245, 166, 35] */
  accentRgb?: Rgb;
  radius?: number;
  /** 实体板材垂直厚度像素（默认 15px，0 表示平面） */
  slabPx?: number;
  /** 侧向挤出偏移像素（正值露右侧壁，负值露左侧壁） */
  extrudeX?: number;
  padding?: React.CSSProperties['padding'];
  /** 扫光速度（帧推进系数），设 0 关闭动态扫光 */
  sheenSpeed?: number;
  /** 额外单次扫光脉冲进度 0..1 */
  sheenPulse?: number;
  style?: React.CSSProperties;
}

/**
 * 抗锯齿平滑 2.5D/3D 磨砂玻璃砖（PhysicalGlass3D v2.2）：
 * 1. 彻底消除 2.67px 阶梯层叠圆角锯齿：将厚侧壁从 6 层粗阶梯改为逐像素平滑挤出（每步 ≤ 1px）+ 外层 `outline: 1px solid transparent` 强制 Chromium 在 3D rotateX/rotateY 变换下启用边缘抗锯齿插值；
 * 2. 纯中性无色偏混色基灰（R=G=B），确保 Chrome 四色（橙/蓝/红/绿）在任意激活度下绝不偏紫或串色；
 * 3. 内置磨砂噪点层 + 顶部折射高光棱线 + 强制置于文字上方（zIndex: 10）的折射扫光层。
 */
export const PhysicalGlass3D: React.FC<PhysicalGlass3DProps> = ({
  children,
  active = 0,
  accentRgb = [245, 166, 35],
  radius = 26,
  slabPx = 15,
  extrudeX = 6,
  padding = '48px 54px',
  sheenSpeed = 0.55,
  sheenPulse,
  style,
}) => {
  const frame = useCurrentFrame();
  const uid = useId().replace(/:/g, '');
  const a = clamp01(active);
  const [ar, ag, ab] = accentRgb;

  const topBorderRgb = mixRgb([206, 206, 206], accentRgb, 0.28 + a * 0.72);
  const topBorderColor = topBorderRgb
    .replace('rgb(', 'rgba(')
    .replace(')', `, ${(0.48 + a * 0.48).toFixed(3)})`);

  const wallHighlight = mixRgb([106, 106, 106], accentRgb, 0.26 + a * 0.64);
  const wallBody = mixRgb([62, 62, 62], [Math.round(ar * 0.72), Math.round(ag * 0.68), Math.round(ab * 0.62)], 0.24 + a * 0.62);
  const wallShade = mixRgb([36, 36, 36], [Math.round(ar * 0.44), Math.round(ag * 0.4), Math.round(ab * 0.36)], 0.22 + a * 0.56);
  const wallBottomRim = mixRgb([156, 156, 156], accentRgb, 0.28 + a * 0.68)
    .replace('rgb(', 'rgba(')
    .replace(')', `, ${(0.55 + a * 0.38).toFixed(3)})`);

  const sweepPos =
    sheenPulse !== undefined
      ? -35 + clamp01(sheenPulse) * 170
      : sheenSpeed > 0
        ? ((frame * sheenSpeed) % 260) - 70
        : -999;

  // 逐像素平滑步进（每步 ≤ 1px），彻底消除圆角与斜向侧壁的阶梯状锯齿
  const steps = slabPx > 0 ? Math.max(slabPx, Math.abs(extrudeX), 1) : 0;
  const padLeft = extrudeX < 0 ? -extrudeX : 0;
  const padRight = extrudeX > 0 ? extrudeX : 0;

  return (
    <div
      data-glass-id={uid}
      style={{
        position: 'relative',
        boxSizing: 'border-box',
        paddingBottom: slabPx > 0 ? slabPx : 0,
        paddingLeft: padLeft,
        paddingRight: padRight,
        // 强制 Chromium/Skia 在 3D rotateX/rotateY 纹理边界启用亚像素抗锯齿，消除斜边毛刺
        outline: '1px solid transparent',
        WebkitBackfaceVisibility: 'hidden',
        backfaceVisibility: 'hidden',
        ...style,
      }}
    >
      {/* Layer 0: 地面悬浮落影 + 导光底辉 */}
      {slabPx > 0 && (
        <div
          aria-hidden
          style={{
            position: 'absolute',
            top: slabPx,
            left: padLeft + extrudeX,
            right: padRight - extrudeX,
            bottom: 0,
            borderRadius: radius,
            boxShadow: [
              '0 28px 54px -6px rgba(0, 0, 0, 0.88)',
              '0 10px 20px rgba(0, 0, 0, 0.75)',
              `0 8px ${(42 * a).toFixed(0)}px rgba(${ar}, ${ag}, ${ab}, ${(0.28 * a).toFixed(3)})`,
            ].join(', '),
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />
      )}

      {/* Layer 1: 逐像素平滑挤出 2.5D 厚侧壁（每步 ≤ 1px，零阶梯圆角锯齿） */}
      {Array.from({ length: steps }).map((_, idx) => {
        const t = (idx + 1) / steps;
        const isBottomEdge = idx === steps - 1;
        const dx = (extrudeX * t).toFixed(2);
        const dy = (slabPx * t).toFixed(2);
        return (
          <div
            key={idx}
            aria-hidden
            style={{
              position: 'absolute',
              top: 0,
              left: padLeft,
              right: padRight,
              bottom: slabPx,
              transform: `translate3d(${dx}px, ${dy}px, 0)`,
              borderRadius: radius,
              boxSizing: 'border-box',
              background: `linear-gradient(108deg, ${wallShade} 0%, ${wallHighlight} 22%, ${wallBody} 54%, ${wallHighlight} 82%, ${wallShade} 100%)`,
              borderWidth: isBottomEdge ? 1.5 : 0,
              borderStyle: 'solid',
              borderColor: wallBottomRim,
              boxShadow: isBottomEdge ? 'inset 0 -2px 4px rgba(0, 0, 0, 0.45)' : 'none',
              outline: '1px solid transparent',
              pointerEvents: 'none',
              zIndex: 1,
            }}
          />
        );
      })}

      {/* Layer 2: 顶层磨砂蚀刻玻璃主面板 */}
      <div
        style={{
          position: 'relative',
          overflow: 'hidden',
          boxSizing: 'border-box',
          borderRadius: radius,
          padding,
          borderWidth: 2,
          borderStyle: 'solid',
          borderColor: topBorderColor,
          backgroundColor: `rgba(16, 21, 33, ${(0.92 + a * 0.04).toFixed(3)})`,
          backgroundImage: `linear-gradient(152deg, rgba(255,255,255,${(0.14 + a * 0.07).toFixed(3)}) 0%, rgba(155,180,220,0.03) 48%, rgba(${ar},${ag},${ab},${(0.03 + a * 0.12).toFixed(3)}) 100%)`,
          backdropFilter: 'blur(18px) saturate(1.25)',
          WebkitBackdropFilter: 'blur(18px) saturate(1.25)',
          boxShadow: [
            `inset 0 1.5px 0 rgba(255, 255, 255, ${(0.45 + a * 0.18).toFixed(3)})`,
            `inset 0 -1.5px 0 rgba(255, 255, 255, ${(0.18 + a * 0.2).toFixed(3)})`,
            '0 2px 3px rgba(0, 0, 0, 0.55)',
          ].join(', '),
          outline: '1px solid transparent',
          textShadow: '0 1px 2px rgba(4, 7, 14, 0.6)',
          zIndex: 2,
        }}
      >
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url(${staticFile('engine/noise.png')})`,
            backgroundSize: '180px 180px',
            opacity: 0.045,
            mixBlendMode: 'overlay',
            pointerEvents: 'none',
            zIndex: 1,
          }}
        />

        <svg
          aria-hidden
          width="100%"
          height="3"
          preserveAspectRatio="none"
          style={{ position: 'absolute', top: 0, left: 0, right: 0, pointerEvents: 'none', zIndex: 2 }}
        >
          <defs>
            <linearGradient id={`rim-${uid}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.06)" />
              <stop offset="35%" stopColor={`rgba(255,255,255,${(0.52 + a * 0.25).toFixed(2)})`} />
              <stop offset="72%" stopColor={`rgba(${ar},${ag},${ab},${(0.28 + a * 0.5).toFixed(2)})`} />
              <stop offset="100%" stopColor="rgba(255,255,255,0.05)" />
            </linearGradient>
          </defs>
          <rect x="0" y="0" width="100%" height="2" fill={`url(#rim-${uid})`} />
        </svg>

        <div style={{ position: 'relative', zIndex: 3, width: '100%', height: '100%', boxSizing: 'border-box' }}>
          {children}
        </div>

        {sweepPos > -500 && (
          <div
            aria-hidden
            style={{
              position: 'absolute',
              inset: 0,
              background: `linear-gradient(114deg, transparent ${sweepPos - 17}%, rgba(255,255,255,${(0.08 + a * 0.045).toFixed(3)}) ${sweepPos}%, transparent ${sweepPos + 17}%)`,
              pointerEvents: 'none',
              zIndex: 10,
            }}
          />
        )}
      </div>
    </div>
  );
};
