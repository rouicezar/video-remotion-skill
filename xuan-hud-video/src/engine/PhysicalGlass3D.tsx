import React, { useId } from 'react';
import { staticFile, useCurrentFrame } from 'remotion';
import { clamp01, mixRgb, Rgb } from './motion';

export interface PhysicalGlass3DProps {
  children: React.ReactNode;
  /** 0..1 连续激活权重，仅精准驱动顶部 2px 导光棱线与细边框，严禁污染整块玻璃底色与厚侧壁 */
  active?: number;
  /** Chrome 四色点睛 RGB（橙/蓝/红/绿），默认橙 [245, 166, 35] */
  accentRgb?: Rgb;
  radius?: number;
  /** 实体板材垂直厚度像素（默认 15px） */
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
 * 零颜色污染 · 纯中性钛灰 2.5D 实体玻璃砖（PhysicalGlass3D v3）：
 * 严格遵循暗黑界面 60-30-10 克制美学：
 * 1. 面板底色 & 16px 实体厚侧壁永远保持 100% 纯中性石墨/钛灰金属质感（R=G=B），绝不把大面积板材染成红/绿/蓝/橙色雾；
 * 2. Chrome 四色（`accentRgb`）仅克制地落在「顶部 2px 锐利导光棱线」与「激活时极细的 1.5px 边线」上，
 *    彻底根除背景串色、彩色外发光染缸与红+蓝偏紫问题。
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

  // 顶面细边框：静息为干净银灰，激活时克制点亮为纯正 accentRgb（无外溢彩雾）
  const topBorderRgb = mixRgb([84, 86, 90], accentRgb, a * 0.85);
  const topBorderColor = topBorderRgb
    .replace('rgb(', 'rgba(')
    .replace(')', `, ${(0.52 + a * 0.44).toFixed(3)})`);

  // 16px 实体厚侧壁：100% 纯中性阳极氧化钛金属/烟熏玻璃灰阶（完全无彩色污染，高辨识度实体厚度）
  const wallHighlight = mixRgb([96, 98, 102], [122, 124, 128], a);
  const wallBody = mixRgb([58, 60, 64], [74, 76, 80], a);
  const wallShade = mixRgb([34, 35, 38], [44, 46, 50], a);
  const wallBottomRim = `rgba(182, 184, 190, ${(0.28 + a * 0.16).toFixed(3)})`;

  const sweepPos =
    sheenPulse !== undefined
      ? -35 + clamp01(sheenPulse) * 170
      : sheenSpeed > 0
        ? ((frame * sheenSpeed) % 260) - 70
        : -999;

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
      {/* Layer 0: 纯黑深距悬浮落影（零彩色染雾外溢） */}
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
            boxShadow: '0 26px 52px -8px rgba(0, 0, 0, 0.9), 0 10px 20px rgba(0, 0, 0, 0.72)',
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />
      )}

      {/* Layer 1: 实心连续挤出纯中性钛金属厚侧壁 */}
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
              boxShadow: isBottomEdge ? 'inset 0 -2px 4px rgba(0, 0, 0, 0.5)' : 'none',
              pointerEvents: 'none',
              zIndex: 1,
            }}
          />
        );
      })}

      {/* Layer 2: 顶层纯中性深石墨磨砂主面板（零背景彩色染缸） */}
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
          backgroundColor: '#15171A',
          backgroundImage:
            'linear-gradient(155deg, rgba(255,255,255,0.085) 0%, rgba(255,255,255,0.015) 45%, rgba(0,0,0,0.12) 100%)',
          boxShadow: [
            `inset 0 1.5px 0 rgba(255, 255, 255, ${(0.28 + a * 0.14).toFixed(3)})`,
            'inset 0 -1px 0 rgba(255, 255, 255, 0.08)',
            '0 2px 3px rgba(0, 0, 0, 0.58)',
          ].join(', '),
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
            opacity: 0.04,
            mixBlendMode: 'overlay',
            pointerEvents: 'none',
            zIndex: 1,
          }}
        />

        {/* Plane B: 顶部 2.5px 精准 Chrome 语义导光棱线（唯一的载体彩色点睛位） */}
        <svg
          aria-hidden
          width="100%"
          height="3"
          preserveAspectRatio="none"
          style={{ position: 'absolute', top: 0, left: 0, right: 0, pointerEvents: 'none', zIndex: 2 }}
        >
          <defs>
            <linearGradient id={`rim-${uid}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.04)" />
              <stop offset="22%" stopColor={`rgba(${ar},${ag},${ab},${(0.18 + a * 0.82).toFixed(2)})`} />
              <stop offset="50%" stopColor={`rgba(${ar},${ag},${ab},${(0.28 + a * 0.72).toFixed(2)})`} />
              <stop offset="78%" stopColor={`rgba(${ar},${ag},${ab},${(0.18 + a * 0.82).toFixed(2)})`} />
              <stop offset="100%" stopColor="rgba(255,255,255,0.04)" />
            </linearGradient>
          </defs>
          <rect x="0" y="0" width="100%" height="2.5" fill={`url(#rim-${uid})`} />
        </svg>

        {/* Plane C: 实际前景内容与文字 */}
        <div style={{ position: 'relative', zIndex: 3, width: '100%', height: '100%', boxSizing: 'border-box' }}>
          {children}
        </div>

        {/* Plane D: 纯白折射反光扫光层（zIndex: 10，覆盖在文字正上方） */}
        {sweepPos > -500 && (
          <div
            aria-hidden
            style={{
              position: 'absolute',
              inset: 0,
              background: `linear-gradient(114deg, transparent ${sweepPos - 17}%, rgba(255,255,255,${(0.065 + a * 0.035).toFixed(3)}) ${sweepPos}%, transparent ${sweepPos + 17}%)`,
              pointerEvents: 'none',
              zIndex: 10,
            }}
          />
        )}
      </div>
    </div>
  );
};
