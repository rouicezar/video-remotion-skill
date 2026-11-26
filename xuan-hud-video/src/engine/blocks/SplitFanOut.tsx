import React, { useId } from 'react';
import { spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { COLORS, FONTS, WEIGHTS } from '../../design/tokens';
import { beatHighlight, clamp01, CRISP_SPRING, cubicPt, easeInOutCubic, mixRgb, Rgb, smoothFocusWeight, steppedGlide } from '../motion';
import { PhysicalGlass3D } from '../PhysicalGlass3D';

export type MicroGlyphKind = 'grid' | 'check' | 'search';

export const MicroGlyph: React.FC<{ kind: MicroGlyphKind; active: number; accentRgb?: Rgb }> = ({
  kind,
  active,
  accentRgb = [245, 166, 35],
}) => {
  const stroke = mixRgb([168, 184, 210], accentRgb, 0.35 + active * 0.65);
  if (kind === 'grid') {
    return (
      <svg width="46" height="46" viewBox="0 0 46 46">
        {[0, 1, 2, 3].map((i) => (
          <rect key={i} x={(i % 2) * 22 + 4} y={Math.floor(i / 2) * 22 + 4} width="16" height="16" rx="4" fill="none" stroke={stroke} strokeWidth="2.2" />
        ))}
      </svg>
    );
  }
  if (kind === 'check') {
    return (
      <svg width="46" height="46" viewBox="0 0 46 46">
        <rect x="6" y="6" width="34" height="34" rx="8" fill="none" stroke={stroke} strokeWidth="2.2" />
        <path d="M15 24 L21 30 L32 17" fill="none" stroke={mixRgb([180, 210, 195], [52, 211, 153], active)} strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  return (
    <svg width="46" height="46" viewBox="0 0 46 46">
      <circle cx="20" cy="20" r="12" fill="none" stroke={stroke} strokeWidth="2.2" />
      <line x1="29" y1="29" x2="40" y2="40" stroke={stroke} strokeWidth="2.8" strokeLinecap="round" />
    </svg>
  );
};

export interface FanOutBranchItem {
  num: string;
  title: string;
  sub: string;
  at: number;
  glyph: MicroGlyphKind;
}

/**
 * 引擎积木库：1 拆 3 精确边缘三次贝塞尔流光扇出拓扑（SplitFanOut）
 */
export const SplitFanOut: React.FC<{
  rootTag: string;
  rootTitle: string;
  rootSub: string;
  branches: [FanOutBranchItem, FanOutBranchItem, FanOutBranchItem];
  accentRgb?: Rgb;
}> = ({ rootTag, rootTitle, rootSub, branches, accentRgb = [245, 166, 35] }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const uid = useId().replace(/:/g, '');
  const targetYs = [118, 365, 612] as const;
  const rootEdge: [number, number] = [470, 365];

  const focusIdx = steppedGlide(
    frame,
    branches.map((b, i) => ({ at: b.at, dur: i === 0 ? 1 : 14, target: i }))
  );

  return (
    <div style={{ position: 'relative', width: 1560, height: 740 }}>
      <svg width="1560" height="740" viewBox="0 0 1560 740" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 4 }}>
        <defs>
          <linearGradient id={`fan-line-${uid}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={`rgba(${accentRgb[0]}, ${accentRgb[1]}, ${accentRgb[2]}, 0.9)`} />
            <stop offset="100%" stopColor="rgba(255, 228, 168, 0.75)" />
          </linearGradient>
          <filter id={`orb-blur-${uid}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {branches.map((c, idx) => {
          const ty = targetYs[idx];
          const drawP = clamp01(easeInOutCubic((frame - (c.at - 6)) / 14));
          const p1: [number, number] = [585, 365];
          const p2: [number, number] = [605, ty];
          const p3: [number, number] = [710, ty];
          const d = `M ${rootEdge[0]} ${rootEdge[1]} C ${p1[0]} ${p1[1]}, ${p2[0]} ${p2[1]}, ${p3[0]} ${p3[1]}`;
          const orbT = clamp01((frame - c.at) / 26);
          const [ox, oy] = cubicPt(orbT, rootEdge, p1, p2, p3);
          return (
            <g key={c.num} opacity={drawP <= 0.02 ? 0 : 1}>
              <path d={d} fill="none" stroke={`url(#fan-line-${uid})`} strokeWidth="2.5" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - drawP} strokeLinecap="round" />
              {frame >= c.at && orbT < 0.99 && <circle cx={ox} cy={oy} r="6.5" fill="#FFD27D" filter={`url(#orb-blur-${uid})`} />}
            </g>
          );
        })}
      </svg>

      <div style={{ position: 'absolute', left: 0, top: 235, width: 470, transform: 'perspective(1400px) rotateY(4deg)' }}>
        <PhysicalGlass3D active={0.88} accentRgb={accentRgb} radius={26} slabPx={16} extrudeX={-6} padding="40px 40px 44px">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <span style={{ fontFamily: FONTS.mono, fontSize: 24, fontWeight: WEIGHTS.regular, color: mixRgb(accentRgb, accentRgb, 1), letterSpacing: 2 }}>
              {rootTag}
            </span>
            <div style={{ fontSize: 44, fontWeight: WEIGHTS.regular, color: COLORS.white, letterSpacing: 1.5 }}>{rootTitle}</div>
            <div style={{ fontSize: 28, fontWeight: WEIGHTS.light, color: '#B4C2D8', letterSpacing: 1 }}>{rootSub}</div>
          </div>
        </PhysicalGlass3D>
      </div>

      {branches.map((c, idx) => {
        const ty = targetYs[idx];
        const p = spring({ frame: Math.max(0, frame - c.at), fps, config: CRISP_SPRING });
        const w = frame >= c.at ? smoothFocusWeight(idx, focusIdx, 0.85) : 0;
        const pulse = clamp01(beatHighlight(frame, c.at, c.at + 45));
        const act = clamp01(Math.max(w, pulse * 0.7));
        return (
          <div
            key={c.num}
            style={{
              position: 'absolute',
              left: 710,
              top: ty - 96,
              width: 850,
              opacity: p,
              transform: `perspective(1400px) translate3d(${((1 - p) * 44).toFixed(1)}px, 0, 0) scale(${(0.95 + p * 0.05 + act * 0.03).toFixed(4)}) rotateY(-3deg)`,
            }}
          >
            <PhysicalGlass3D active={0.22 + act * 0.78} accentRgb={accentRgb} radius={24} slabPx={14} extrudeX={6} padding="28px 38px 32px" sheenSpeed={0.5}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 28 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
                  <MicroGlyph kind={c.glyph} active={act} accentRgb={accentRgb} />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{ fontSize: 40, fontWeight: WEIGHTS.regular, color: COLORS.white, letterSpacing: 1.5 }}>{c.title}</div>
                    <div style={{ fontSize: 27, fontWeight: WEIGHTS.light, color: '#ACBACE', letterSpacing: 1.2 }}>{c.sub}</div>
                  </div>
                </div>
                <span style={{ fontFamily: FONTS.display, fontSize: 56, fontWeight: WEIGHTS.light, color: mixRgb([138, 152, 178], accentRgb, act) }}>
                  {c.num}
                </span>
              </div>
            </PhysicalGlass3D>
          </div>
        );
      })}
    </div>
  );
};
