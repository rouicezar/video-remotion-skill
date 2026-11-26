import React, { useId } from 'react';
import { CHROME_RGB, COLORS } from '../../design/tokens';
import { clamp01, mixRgb, Rgb } from '../motion';

/**
 * 原生非方形 2.5D 几何体库（Geometry3D）：
 * 打破“全员圆角矩形”单调感，提供 5 类与 `PhysicalGlass3D` 同质地、同抗锯齿、同 Chrome 四色的非方形实体：
 * 1. `Disc3D`        : 真圆盘 2.5D 厚水晶砖（太阳/车灯/核心枢纽/圆形仪表盘）
 * 2. `Pill3D`        : 真全圆角 2.5D 胶囊
 * 3. `HexNode3D`     : 真 2.5D 立体六边形集群节点（SVG 逐像素平滑挤出）
 * 4. `DiamondGate3D` : 真 2.5D 立体菱形/盾形门禁（SVG 逐像素平滑挤出）
 * 5. `Trapezoid3D`   : 真 2.5D 等腰梯形漏斗层（SVG 逐像素平滑挤出）
 */

function computeSlabColors(accentRgb: Rgb, active: number) {
  const a = clamp01(active);
  const [ar, ag, ab] = accentRgb;
  const topBorder = mixRgb([206, 206, 206], accentRgb, 0.28 + a * 0.72)
    .replace('rgb(', 'rgba(')
    .replace(')', `, ${(0.55 + a * 0.42).toFixed(3)})`);
  const wallHighlight = mixRgb([108, 108, 108], accentRgb, 0.28 + a * 0.62);
  const wallBody = mixRgb(
    [62, 62, 62],
    [Math.round(ar * 0.72), Math.round(ag * 0.68), Math.round(ab * 0.62)],
    0.26 + a * 0.6
  );
  const wallRim = mixRgb([164, 164, 164], accentRgb, 0.3 + a * 0.66)
    .replace('rgb(', 'rgba(')
    .replace(')', `, ${(0.58 + a * 0.36).toFixed(3)})`);
  return { a, ar, ag, ab, topBorder, wallHighlight, wallBody, wallRim };
}

/** 1. 真圆盘 2.5D 厚水晶砖（Disc3D） */
export const Disc3D: React.FC<{
  size: number;
  active?: number;
  accentRgb?: Rgb;
  slabPx?: number;
  extrudeX?: number;
  children?: React.ReactNode;
}> = ({ size, active = 0.8, accentRgb = CHROME_RGB.orange, slabPx = 14, extrudeX = 0, children }) => {
  const { a, ar, ag, ab, topBorder, wallHighlight, wallBody, wallRim } = computeSlabColors(accentRgb, active);
  const steps = Math.max(slabPx, Math.abs(extrudeX), 1);

  return (
    <div
      style={{
        position: 'relative',
        width: size,
        height: size + slabPx,
        boxSizing: 'border-box',
        outline: '1px solid transparent',
      }}
    >
      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: slabPx,
          left: extrudeX,
          width: size,
          height: size,
          borderRadius: '50%',
          boxShadow: `0 24px 48px rgba(0,0,0,0.85), 0 6px ${(38 * a).toFixed(0)}px rgba(${ar},${ag},${ab},${(0.32 * a).toFixed(2)})`,
        }}
      />
      {Array.from({ length: steps }).map((_, idx) => {
        const t = (idx + 1) / steps;
        const isBot = idx === steps - 1;
        return (
          <div
            key={idx}
            aria-hidden
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: size,
              height: size,
              borderRadius: '50%',
              transform: `translate3d(${(extrudeX * t).toFixed(2)}px, ${(slabPx * t).toFixed(2)}px, 0)`,
              background: `linear-gradient(108deg, ${wallBody} 0%, ${wallHighlight} 35%, ${wallBody} 78%)`,
              border: isBot ? `1.5px solid ${wallRim}` : 'none',
              boxSizing: 'border-box',
              outline: '1px solid transparent',
            }}
          />
        );
      })}
      <div
        style={{
          position: 'relative',
          width: size,
          height: size,
          borderRadius: '50%',
          overflow: 'hidden',
          boxSizing: 'border-box',
          borderWidth: 2,
          borderStyle: 'solid',
          borderColor: topBorder,
          backgroundColor: '#131824',
          backgroundImage: `radial-gradient(circle at 32% 24%, rgba(255,255,255,${(0.16 + a * 0.08).toFixed(2)}) 0%, rgba(${ar},${ag},${ab},${(0.05 + a * 0.14).toFixed(2)}) 58%, rgba(10,14,22,0.92) 100%)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: COLORS.white,
          outline: '1px solid transparent',
          zIndex: 2,
        }}
      >
        {children}
      </div>
    </div>
  );
};

/** 2. 真全圆角 2.5D 胶囊（Pill3D） */
export const Pill3D: React.FC<{
  active?: number;
  accentRgb?: Rgb;
  slabPx?: number;
  padding?: string;
  children: React.ReactNode;
}> = ({ active = 0.7, accentRgb = CHROME_RGB.orange, slabPx = 9, padding = '14px 34px', children }) => {
  const { a, ar, ag, ab, topBorder, wallHighlight, wallBody, wallRim } = computeSlabColors(accentRgb, active);
  const steps = Math.max(slabPx, 1);

  return (
    <div style={{ position: 'relative', display: 'inline-block', paddingBottom: slabPx, outline: '1px solid transparent' }}>
      {Array.from({ length: steps }).map((_, idx) => {
        const t = (idx + 1) / steps;
        const isBot = idx === steps - 1;
        return (
          <div
            key={idx}
            aria-hidden
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: slabPx,
              borderRadius: 999,
              transform: `translate3d(0, ${(slabPx * t).toFixed(2)}px, 0)`,
              background: `linear-gradient(108deg, ${wallBody} 0%, ${wallHighlight} 35%, ${wallBody} 80%)`,
              border: isBot ? `1.5px solid ${wallRim}` : 'none',
              boxSizing: 'border-box',
            }}
          />
        );
      })}
      <div
        style={{
          position: 'relative',
          borderRadius: 999,
          padding,
          borderWidth: 2,
          borderStyle: 'solid',
          borderColor: topBorder,
          backgroundColor: '#131824',
          backgroundImage: `linear-gradient(155deg, rgba(255,255,255,0.14) 0%, rgba(${ar},${ag},${ab},${(0.06 + a * 0.14).toFixed(2)}) 100%)`,
          boxShadow: `0 14px 28px rgba(0,0,0,0.62)`,
          zIndex: 2,
        }}
      >
        {children}
      </div>
    </div>
  );
};

/** 公共 SVG 异形多边形 2.5D 挤出器（零锯齿纯矢量平滑挤出） */
const SvgExtrudedPolygon3D: React.FC<{
  width: number;
  height: number;
  slabPx: number;
  points: string;
  active: number;
  accentRgb: Rgb;
  children?: React.ReactNode;
}> = ({ width, height, slabPx, points, active, accentRgb, children }) => {
  const uid = useId().replace(/:/g, '');
  const { a, ar, ag, ab, topBorder, wallHighlight, wallBody, wallRim } = computeSlabColors(accentRgb, active);
  const totalH = height + slabPx + 18;

  return (
    <div style={{ position: 'relative', width, height: height + slabPx, outline: '1px solid transparent' }}>
      <svg
        width={width}
        height={totalH}
        viewBox={`0 0 ${width} ${totalH}`}
        style={{ position: 'absolute', top: 0, left: 0, overflow: 'visible', pointerEvents: 'none' }}
      >
        <defs>
          <linearGradient id={`poly-face-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(34, 42, 60, 0.96)" />
            <stop offset="55%" stopColor="rgba(18, 23, 35, 0.96)" />
            <stop offset="100%" stopColor={`rgba(${Math.round(18 + ar * 0.14 * a)}, ${Math.round(23 + ag * 0.14 * a)}, ${Math.round(35 + ab * 0.14 * a)}, 0.96)`} />
          </linearGradient>
          <linearGradient id={`poly-wall-${uid}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={wallBody} />
            <stop offset="32%" stopColor={wallHighlight} />
            <stop offset="72%" stopColor={wallBody} />
            <stop offset="100%" stopColor={wallHighlight} />
          </linearGradient>
          <filter id={`poly-shadow-${uid}`} x="-25%" y="-25%" width="150%" height="160%">
            <feDropShadow dx="0" dy={slabPx + 10} stdDeviation="14" floodColor="#000000" floodOpacity="0.72" />
          </filter>
        </defs>

        {/* 底层阴影 */}
        <polygon points={points} fill="rgba(0,0,0,0.4)" filter={`url(#poly-shadow-${uid})`} />

        {/* 逐像素 1px 矢量挤出侧壁（边缘完全抗锯齿！） */}
        {Array.from({ length: slabPx }).map((_, idx) => {
          const dy = idx + 1;
          const isBot = dy === slabPx;
          return (
            <polygon
              key={dy}
              points={points}
              transform={`translate(0, ${dy})`}
              fill={`url(#poly-wall-${uid})`}
              stroke={isBot ? wallRim : 'none'}
              strokeWidth={isBot ? 1.5 : 0}
              strokeLinejoin="round"
            />
          );
        })}

        {/* 顶面玻璃面板 */}
        <polygon
          points={points}
          fill={`url(#poly-face-${uid})`}
          stroke={topBorder}
          strokeWidth="2.2"
          strokeLinejoin="round"
        />
      </svg>

      <div
        style={{
          position: 'relative',
          width,
          height,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2,
          boxSizing: 'border-box',
        }}
      >
        {children}
      </div>
    </div>
  );
};

/** 3. 真 2.5D 立体六边形集群节点（HexNode3D） */
export const HexNode3D: React.FC<{
  width?: number;
  height?: number;
  slabPx?: number;
  active?: number;
  accentRgb?: Rgb;
  children?: React.ReactNode;
}> = ({ width = 260, height = 228, slabPx = 14, active = 0.75, accentRgb = CHROME_RGB.orange, children }) => {
  const pad = 4;
  const w = width - pad * 2;
  const h = height - pad * 2;
  const pts = [
    `${pad + w * 0.25},${pad}`,
    `${pad + w * 0.75},${pad}`,
    `${pad + w},${pad + h * 0.5}`,
    `${pad + w * 0.75},${pad + h}`,
    `${pad + w * 0.25},${pad + h}`,
    `${pad},${pad + h * 0.5}`,
  ].join(' ');
  return (
    <SvgExtrudedPolygon3D width={width} height={height} slabPx={slabPx} points={pts} active={active} accentRgb={accentRgb}>
      {children}
    </SvgExtrudedPolygon3D>
  );
};

/** 4. 真 2.5D 立体菱形/盾形门禁（DiamondGate3D） */
export const DiamondGate3D: React.FC<{
  width?: number;
  height?: number;
  slabPx?: number;
  active?: number;
  accentRgb?: Rgb;
  children?: React.ReactNode;
}> = ({ width = 320, height = 136, slabPx = 12, active = 0.9, accentRgb = CHROME_RGB.green, children }) => {
  const pad = 4;
  const w = width - pad * 2;
  const h = height - pad * 2;
  // 切角盾牌六点形：左右尖角如门禁关卡，内部留足横向文字空间
  const pts = [
    `${pad + 36},${pad}`,
    `${pad + w - 36},${pad}`,
    `${pad + w},${pad + h * 0.5}`,
    `${pad + w - 36},${pad + h}`,
    `${pad + 36},${pad + h}`,
    `${pad},${pad + h * 0.5}`,
  ].join(' ');
  return (
    <SvgExtrudedPolygon3D width={width} height={height} slabPx={slabPx} points={pts} active={active} accentRgb={accentRgb}>
      {children}
    </SvgExtrudedPolygon3D>
  );
};

/** 5. 真 2.5D 等腰梯形漏斗层（Trapezoid3D） */
export const Trapezoid3D: React.FC<{
  topWidth: number;
  bottomWidth: number;
  height?: number;
  slabPx?: number;
  active?: number;
  accentRgb?: Rgb;
  children?: React.ReactNode;
}> = ({ topWidth, bottomWidth, height = 116, slabPx = 14, active = 0.75, accentRgb = CHROME_RGB.orange, children }) => {
  const pad = 4;
  const w = Math.max(topWidth, bottomWidth) + pad * 2;
  const topInset = (w - topWidth) / 2;
  const botInset = (w - bottomWidth) / 2;
  const pts = [
    `${topInset},${pad}`,
    `${w - topInset},${pad}`,
    `${w - botInset},${height - pad}`,
    `${botInset},${height - pad}`,
  ].join(' ');
  return (
    <SvgExtrudedPolygon3D width={w} height={height} slabPx={slabPx} points={pts} active={active} accentRgb={accentRgb}>
      {children}
    </SvgExtrudedPolygon3D>
  );
};
