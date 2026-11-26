import React, { useId } from 'react';
import { staticFile, useCurrentFrame } from 'remotion';
import { clamp01, mixRgb, Rgb } from './motion';

export interface PhysicalGlass3DProps {
  children: React.ReactNode;
  /** 0..1 连续激活权重，驱动侧壁导光与顶面棱光 */
  active?: number;
  /** 主强调色 RGB，默认琥珀金 [245, 166, 35] */
  accentRgb?: Rgb;
  radius?: number;
  /** 实体板材垂直厚度像素（默认 15px，0 表示平面） */
  slabPx?: number;
  /** 侧向挤出偏移像素（正值露右侧壁，负值露左侧壁，让 2.5D 斜切厚度一眼可见） */
  extrudeX?: number;
  padding?: React.CSSProperties['padding'];
  /** 扫光速度（帧推进系数），设 0 关闭动态扫光 */
  sheenSpeed?: number;
  /** 额外单次扫光脉冲进度 0..1 */
  sheenPulse?: number;
  style?: React.CSSProperties;
}

/**
 * 真·双层实体挤出 2.5D/3D 磨砂玻璃砖（PhysicalGlass3D v2.1）：
 * 用明确的四层明暗物理结构表现“看得见的板材厚度”，绝不用一条淡线糊弄：
 * 1. Ground Shadow（舞台地面落影）：深距悬浮投影，把整块厚砖托离背景；
 * 2. Extruded Bevel Sidewall（高辨识度实体厚侧壁）：多层无缝阶梯挤出 `(extrudeX, slabPx)`，
 *    采用明显亮于暗背景的金属冷钢/主题色导光渐变 + 拐角高光带 + 清晰底棱线；
 * 3. Chamfer Rim（顶面与侧壁交界亮棱）：顶面玻璃底边与侧壁顶边形成清晰折角分界；
 * 4. Etched Top Face（顶面磨砂玻璃）：内置噪点层 + 置于文字上方（zIndex: 10）的折射扫光。
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

  // 顶面玻璃外框：采用纯中性无色偏灰（R=G=B）与 accentRgb 混合，彻底杜绝“红 + 蓝灰 = 紫色”光学偏色！
  const topBorderRgb = mixRgb([206, 206, 206], accentRgb, 0.28 + a * 0.72);
  const topBorderColor = topBorderRgb
    .replace('rgb(', 'rgba(')
    .replace(')', `, ${(0.48 + a * 0.48).toFixed(3)})`);

  // 实体侧壁（厚度切面）：同样用纯中性灰作为基底，确保红/橙/绿/蓝四色无论在何种激活度下都保持绝对纯正色相
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

  // 6 层密集微步挤出，确保任意斜角 `(extrudeX, slabPx)` 圆角侧壁 100% 实心平滑无锯齿断层
  const steps = slabPx > 0 ? 6 : 0;

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
              `0 28px 54px -6px rgba(0, 0, 0, 0.88)`,
              `0 10px 20px rgba(0, 0, 0, 0.75)`,
              `0 8px ${(42 * a).toFixed(0)}px rgba(${ar}, ${ag}, ${ab}, ${(0.28 * a).toFixed(3)})`,
            ].join(', '),
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />
      )}

      {/* Layer 1: 实心连续挤出 2.5D 厚侧壁（左右正负 extrudeX 完全镜像对称） */}
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
            `0 2px 3px rgba(0, 0, 0, 0.55)`,
          ].join(', '),
          textShadow: '0 1px 2px rgba(4, 7, 14, 0.6)',
          zIndex: 2,
        }}
      >
        {/* Plane A: 磨砂微细噪点层 */}
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

        {/* Plane B: 顶部折射高光棱线 */}
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

        {/* Plane C: 实际前景内容与文字 */}
        <div style={{ position: 'relative', zIndex: 3, width: '100%', height: '100%', boxSizing: 'border-box' }}>
          {children}
        </div>

        {/* Plane D: 强制顶层折射反光扫光层（zIndex: 10，覆盖在文字正上方） */}
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
