import React, { useId } from 'react';
import { staticFile, useCurrentFrame } from 'remotion';
import { clamp01, mixRgb, Rgb } from './motion';

export interface PhysicalGlass3DProps {
  children: React.ReactNode;
  /** 0..1 连续激活权重，驱动琥珀棱光与内发光 */
  active?: number;
  /** 主强调色 RGB，默认琥珀金 [245, 166, 35] */
  accentRgb?: Rgb;
  radius?: number;
  /** 厚底立体切边像素（6–8px），0 表示关闭 */
  slabPx?: number;
  padding?: React.CSSProperties['padding'];
  /** 扫光速度（帧推进系数），设 0 关闭动态扫光 */
  sheenSpeed?: number;
  /** 额外单次扫光脉冲进度 0..1（如入场/点亮瞬间扫过） */
  sheenPulse?: number;
  style?: React.CSSProperties;
}

/**
 * 真蚀刻 3D 磨砂毛玻璃容器（实验 3 标准落地组件）：
 * 1. position: relative + overflow: hidden 锁死裁剪边界
 * 2. 恒定 2px 连续插值边框（零 1px 抖动）+ 6–8px 厚底立体切边 + 深悬浮投影
 * 3. 内置磨砂微细噪点层（noise.png 平铺）+ useId() 安全局部光泽定义
 * 4. 动态折射扫光层（Sheen）强制作为最后一个子节点、zIndex: 10 覆盖于文字正上方，消除文字贴纸感
 */
export const PhysicalGlass3D: React.FC<PhysicalGlass3DProps> = ({
  children,
  active = 0,
  accentRgb = [245, 166, 35],
  radius = 24,
  slabPx = 7,
  padding = '32px 36px',
  sheenSpeed = 0.55,
  sheenPulse,
  style,
}) => {
  const frame = useCurrentFrame();
  const uid = useId().replace(/:/g, '');
  const a = clamp01(active);

  const borderRgb = mixRgb([196, 208, 228], accentRgb, 0.18 + a * 0.82);
  const borderAlpha = (0.28 + a * 0.66).toFixed(3);
  const borderColor = borderRgb.replace('rgb(', 'rgba(').replace(')', `, ${borderAlpha})`);

  const rimColor = mixRgb([175, 192, 220], accentRgb, a * 0.85)
    .replace('rgb(', 'rgba(')
    .replace(')', `, ${(0.18 + a * 0.34).toFixed(3)})`);
  const [ar, ag, ab] = accentRgb;

  const boxShadow = [
    `inset 0 1.5px 0 rgba(255, 255, 255, ${(0.34 + a * 0.14).toFixed(3)})`,
    `inset 0 -1px 0 rgba(255, 255, 255, 0.08)`,
    slabPx > 0 ? `0 ${slabPx}px 0 rgba(7, 10, 17, 0.95)` : '',
    slabPx > 0 ? `0 ${slabPx + 1}px 0 ${rimColor}` : '',
    `0 26px 56px -10px rgba(0, 0, 0, 0.78)`,
    `0 0 ${(42 * a).toFixed(1)}px rgba(${ar}, ${ag}, ${ab}, ${(0.34 * a).toFixed(3)})`,
  ]
    .filter(Boolean)
    .join(', ');

  const sweepPos =
    sheenPulse !== undefined
      ? -35 + clamp01(sheenPulse) * 170
      : sheenSpeed > 0
        ? ((frame * sheenSpeed) % 260) - 70
        : -999;

  return (
    <div
      data-glass-id={uid}
      style={{
        position: 'relative',
        overflow: 'hidden',
        boxSizing: 'border-box',
        borderRadius: radius,
        padding,
        borderWidth: 2,
        borderStyle: 'solid',
        borderColor,
        backgroundColor: `rgba(17, 22, 34, ${(0.84 + a * 0.08).toFixed(3)})`,
        backgroundImage: `linear-gradient(152deg, rgba(255,255,255,${(0.15 + a * 0.09).toFixed(3)}) 0%, rgba(155,180,220,0.04) 46%, rgba(${ar},${ag},${ab},${(0.03 + a * 0.15).toFixed(3)}) 100%)`,
        backdropFilter: 'blur(18px) saturate(1.25)',
        WebkitBackdropFilter: 'blur(18px) saturate(1.25)',
        boxShadow,
        textShadow: '0 1px 2px rgba(4, 7, 14, 0.65)',
        ...style,
      }}
    >
      {/* Plane A: 磨砂微细噪点层（zIndex: 1） */}
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

      {/* Plane B: 顶部折射高光棱线（useId 隔离 SVG 渐变 ID，zIndex: 2） */}
      <svg
        aria-hidden
        width="100%"
        height="3"
         preserveAspectRatio="none"
        style={{ position: 'absolute', top: 0, left: 0, right: 0, pointerEvents: 'none', zIndex: 2 }}
      >
        <defs>
          <linearGradient id={`rim-${uid}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.05)" />
            <stop offset="38%" stopColor={`rgba(255,255,255,${(0.45 + a * 0.25).toFixed(2)})`} />
            <stop offset="72%" stopColor={`rgba(${ar},${ag},${ab},${(0.22 + a * 0.48).toFixed(2)})`} />
            <stop offset="100%" stopColor="rgba(255,255,255,0.04)" />
          </linearGradient>
        </defs>
        <rect x="0" y="0" width="100%" height="2" fill={`url(#rim-${uid})`} />
      </svg>

      {/* Plane C: 实际前景内容与文字（zIndex: 3） */}
      <div style={{ position: 'relative', zIndex: 3, width: '100%', height: '100%', boxSizing: 'border-box' }}>
        {children}
      </div>

      {/* Plane D: 强制顶层折射反光扫光层（zIndex: 10，覆盖在文字正上方实现物理封装感） */}
      {sweepPos > -500 && (
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            background: `linear-gradient(114deg, transparent ${sweepPos - 17}%, rgba(255,255,255,${(0.085 + a * 0.045).toFixed(3)}) ${sweepPos}%, transparent ${sweepPos + 17}%)`,
            pointerEvents: 'none',
            zIndex: 10,
          }}
        />
      )}
    </div>
  );
};
