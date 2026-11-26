import React from 'react';
import { Audio, Img, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { COLORS, FONTS, FPS } from '../design/tokens';
import {
  easeInOutCubic,
  easeOutExpo,
  easeOutQuint,
  glassSheenStyle,
  glassSurface,
  smoothFocusWeight,
} from '../design/motion';
import { AntigravityLogo, DesktopAppIcon, TerminalCliIcon } from '../design/BrandLogos';
import { AGY_COMMANDS_SUBTITLES } from '../data/agyCommandsSubtitles';

const f = (sec: number) => Math.round(sec * FPS);
export const AGY_V2_SAMPLE_FRAMES = f(42.6); // 42.6s @ 30fps = 1278 frames

import { CRISP_SPRING, cubicPt, mixRgb, steppedGlide } from '../engine/motion';
import { crystal } from '../engine/glass';

// 原语已迁到 src/engine/，此处仅为兼容旧 import 而转出。
export { CRISP_SPRING, cubicPt, crystal, mixRgb, steppedGlide };

/**
 * Luminous Free-Stage Atmospheric Canvas (3:2 logical 1920x1280)
 * 3-Plane Spatial Depth: Far 3D Perspective Floor + Vignette -> Midground Title -> Foreground 2.5D/3D Components
 */
export const LuminousStage: React.FC<{
  stepIndex: number;
  chapterLabel: string;
  children: React.ReactNode;
}> = ({ stepIndex, chapterLabel, children }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sec = frame / fps;
  const activeSub = AGY_COMMANDS_SUBTITLES.find((s) => sec >= s.startSec && sec <= s.endSec);

  const glow1X = 22 + Math.sin(frame * 0.01) * 7;
  const glow1Y = 24 + Math.cos(frame * 0.009) * 5;
  const glow2X = 76 + Math.cos(frame * 0.01) * 7;
  const glow2Y = 68 + Math.sin(frame * 0.011) * 5;
  const wmX = (frame * 0.35) % 760;
  const wmY = (frame * 0.12) % 280;

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: '#0C1018',
        backgroundImage: [
          `radial-gradient(ellipse 62% 52% at ${glow1X.toFixed(1)}% ${glow1Y.toFixed(1)}%, rgba(62, 102, 180, 0.24) 0%, transparent 66%)`,
          `radial-gradient(ellipse 58% 50% at ${glow2X.toFixed(1)}% ${glow2Y.toFixed(1)}%, rgba(245, 166, 35, 0.16) 0%, transparent 62%)`,
          'radial-gradient(ellipse 88% 78% at 50% 48%, #151B28 0%, #0C1018 70%, #07090E 100%)',
        ].join(', '),
        fontFamily: FONTS.sans,
        color: COLORS.white,
        boxSizing: 'border-box',
      }}
    >
      {/* Plane 1A: Far Background 3D Perspective Studio Floor Grid (creates unmistakable Z-depth!) */}
      <div
        style={{
          position: 'absolute',
          left: '-20%',
          right: '-20%',
          bottom: -140,
          height: 620,
          perspective: 900,
          pointerEvents: 'none',
          opacity: 0.42,
        }}
      >
        <div
          style={{
            width: '100%',
            height: '100%',
            transform: 'rotateX(68deg)',
            transformOrigin: 'center bottom',
            backgroundImage:
              'linear-gradient(rgba(148,175,220,0.16) 1px, transparent 1px), linear-gradient(90deg, rgba(148,175,220,0.16) 1px, transparent 1px)',
            backgroundSize: '76px 76px',
            WebkitMaskImage: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.28) 55%, transparent 92%)',
            maskImage: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.28) 55%, transparent 92%)',
          }}
        />
      </div>

      {/* Plane 1B: Subtle Studio Atmospheric Dot Matrix */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.065) 1.1px, transparent 1.1px)',
          backgroundSize: '48px 48px',
          opacity: 0.48,
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          position: 'absolute',
          inset: -420,
          transform: `translate(${-wmX}px, ${-wmY}px)`,
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 760px)',
          gridAutoRows: '280px',
          opacity: 0.032,
          pointerEvents: 'none',
        }}
      >
        {Array.from({ length: 30 }).map((_, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transform: `translateX(${(Math.floor(i / 5) % 2) * 220}px) skewX(-10deg)`,
              fontSize: 96,
              fontWeight: 900,
              color: 'transparent',
              WebkitTextStroke: '2px rgba(255,255,255,0.9)',
              whiteSpace: 'nowrap',
            }}
          >
            ANTIGRAVITY
          </div>
        ))}
      </div>

      {/* Minimal Top Hairline Progress */}
      <div
        style={{
          position: 'absolute',
          top: 38,
          left: 72,
          right: 72,
          display: 'flex',
          alignItems: 'center',
          gap: 20,
          zIndex: 30,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <AntigravityLogo size={30} />
          <span style={{ fontFamily: FONTS.mono, fontSize: 22, fontWeight: 800, color: '#D0D8E8', letterSpacing: 1 }}>
            {chapterLabel}
          </span>
        </div>
        <div style={{ flex: 1, display: 'flex', gap: 10 }}>
          {[1, 2, 3, 4, 5].map((s) => (
            <div
              key={s}
              style={{
                flex: 1,
                height: s === stepIndex ? 4 : 3,
                borderRadius: 3,
                backgroundColor: s === stepIndex ? COLORS.amber : s < stepIndex ? 'rgba(245,166,35,0.45)' : 'rgba(255,255,255,0.16)',
                boxShadow: s === stepIndex ? '0 0 14px rgba(245,166,35,0.65)' : 'none',
              }}
            />
          ))}
        </div>
        <div style={{ fontFamily: FONTS.mono, fontSize: 22, fontWeight: 800, color: '#A6B2C7' }}>
          {String(stepIndex).padStart(2, '0')} / 05
        </div>
      </div>

      <div style={{ position: 'absolute', top: 96, left: 72, right: 72, bottom: 148, boxSizing: 'border-box' }}>
        {children}
      </div>

      {activeSub && (
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 32, display: 'flex', justifyContent: 'center', zIndex: 50, pointerEvents: 'none' }}>
          <div
            style={{
              backgroundColor: 'rgba(12, 15, 22, 0.86)',
              border: '1px solid rgba(255,255,255,0.12)',
              padding: '12px 36px',
              borderRadius: 16,
              fontSize: 54,
              fontWeight: 900,
              color: COLORS.white,
              letterSpacing: 1,
              maxWidth: 1720,
              textAlign: 'center',
              boxShadow: '0 10px 34px rgba(0,0,0,0.45)',
            }}
          >
            {activeSub.zh}
          </div>
        </div>
      )}
    </div>
  );
};

/* ============================================================================
 * SCENE 1 (00:00.0 – 00:13.3, 399f):
 * Crisp agile entrance (~12f) -> Liquid Magnetic Sliding Pill (ZERO flash/jitter!) -> Crisp Match-Cut Dive!
 * ==========================================================================*/
export const Scene01Intro3DLayers: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const headerP = easeOutExpo(frame / 14);

  // Liquid stepped magnetic glide: crisp 15-frame glide between items + calm readable dwell — ZERO jitter!
  const focusIdx = steppedGlide(frame, [
    { at: 0, dur: 1, target: 0 },
    { at: 108, dur: 16, target: 1 },
    { at: 152, dur: 16, target: 2 },
    { at: 196, dur: 16, target: 3 },
    { at: 240, dur: 16, target: 4 },
    { at: 292, dur: 18, target: 0 },
  ]);

  // Crisp Match-Cut 3D Dive into /swarm (22 frames = 0.73s — agile & smooth!)
  const diveT = easeInOutCubic((frame - 344) / 24);
  const exitFade = 1 - easeInOutCubic((frame - 374) / 14);

  const items = [
    { num: '01', cmd: '/swarm', label: '活多能拆 · 并行开干' },
    { num: '02', cmd: '/boost', label: '活难啃不动 · 深度推理' },
    { num: '03', cmd: '/teamwork', label: '跨天大工程 · 里程碑' },
    { num: '04', cmd: '/run-workflow', label: '批量定制 · 编排流水' },
    { num: '05', cmd: '/goal', label: '目标明确 · 下班挂机' },
  ];

  // Physical gravity stacking order (matching reference video!):
  // Layer 01 (bottom) renders FIRST & lands FIRST -> Layer 02 drops ON TOP -> ... -> Layer 05 (top) lands LAST!
  const stackOrder = [0, 1, 2, 3, 4];
  const ROW_H = 68;
  const ROW_GAP = 14;
  const ROW_STEP = ROW_H + ROW_GAP;

  return (
    <div style={{ width: '100%', height: '100%', opacity: exitFade }}>
      <div style={{ width: '100%', height: '100%', display: 'grid', gridTemplateColumns: '0.92fr 1.15fr', gap: 48, alignItems: 'center' }}>
        {/* Left: Crisp Header + Zero-Jitter Magnetic Sliding Pill Selector */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 28,
            opacity: headerP * (1 - diveT * 0.92),
            transform: `translateX(${(1 - headerP) * -28 - diveT * 90}px)`,
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
              <AntigravityLogo size={46} />
              <span style={{ fontFamily: FONTS.mono, fontSize: 28, fontWeight: 800, color: '#C8D1E0' }}>Google Antigravity</span>
            </div>
            <div style={{ fontSize: 96, fontWeight: 900, lineHeight: 1.04, letterSpacing: 1 }}>
              5 条神级 <span style={{ color: COLORS.amber, fontFamily: FONTS.mono }}>/</span> 指令
            </div>
            <div style={{ fontSize: 32, fontWeight: 700, color: '#B4BFD4', marginTop: 14 }}>
              按 5 种真实干活卡点拆解 · 看完直接上手
            </div>
          </div>

          {/* 5 Fixed-Height Rows — Pure Continuous Cross-Fade Illumination (ZERO flash, ZERO 1px jitter, ZERO bar crossing gaps!) */}
          <div style={{ position: 'relative', width: 575, height: ROW_STEP * 5 - ROW_GAP }}>
            {items.map((item, idx) => {
              const enterP = spring({ frame: Math.max(0, frame - 6 - idx * 4), fps, config: CRISP_SPRING });
              const w = smoothFocusWeight(idx, focusIdx, 0.62);
              const textColor = mixRgb([226, 232, 244], [17, 19, 24], w);
              const subColor = mixRgb([184, 196, 218], [24, 27, 34], w);
              const bgR = Math.round(255 + (245 - 255) * w);
              const bgG = Math.round(255 + (166 - 255) * w);
              const bgB = Math.round(255 + (35 - 255) * w);
              const bgA = 0.08 + w * 0.92;
              const bdCol = `rgba(${Math.round(255 - w * 10)}, ${Math.round(255 - w * 52)}, ${Math.round(255 - w * 148)}, ${(0.18 + w * 0.82).toFixed(3)})`;
              return (
                <div
                  key={item.cmd}
                  style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    top: idx * ROW_STEP,
                    height: ROW_H,
                    padding: '0 26px',
                    borderRadius: 14,
                    backgroundColor: `rgba(${bgR},${bgG},${bgB},${bgA.toFixed(3)})`,
                    borderWidth: 2,
                    borderStyle: 'solid',
                    borderColor: bdCol,
                    boxShadow: `0 0 ${(32 * w).toFixed(0)}px rgba(245,166,35,${(0.45 * w).toFixed(2)})`,
                    boxSizing: 'border-box',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    opacity: enterP,
                    transform: `translate3d(${((1 - enterP) * -28 + w * 14).toFixed(2)}px, 0, 0)`,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <span style={{ fontFamily: FONTS.mono, fontSize: 24, fontWeight: 900, color: subColor }}>{item.num}</span>
                    <span style={{ fontFamily: FONTS.mono, fontSize: 30, fontWeight: 900, color: textColor, whiteSpace: 'nowrap' }}>{item.cmd}</span>
                  </div>
                  <span style={{ fontSize: 23, fontWeight: 800, color: subColor, whiteSpace: 'nowrap' }}>{item.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: 5 Smoked-Crystal 3D Isometric Glass Slabs — ZERO post-land bobbing, ZERO 1px border jump! */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: 760,
            perspective: 1600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {stackOrder.map((itemIdx, stackPos) => {
            const layer = items[itemIdx];
            // Physical gravity drop order: bottom Layer 01 (stackPos=0) lands FIRST, top Layer 05 (stackPos=4) lands LAST!
            const dealP = spring({ frame: Math.max(0, frame - 4 - stackPos * 5), fps, config: CRISP_SPRING });
            const w = smoothFocusWeight(itemIdx, focusIdx, 0.58);
            const isHeroSwarm = itemIdx === 0;

            // Stack bottom-to-top: Layer 01 at bottom (+216px) -> Layer 05 at top (-216px), dropping cleanly from above!
            const baseY = (2 - stackPos) * 104;
            const slideY = interpolate(dealP, [0, 1], [-110, 0]) + baseY - w * 22;
            const slideX = interpolate(dealP, [0, 1], [35, 0]) + w * 20;

            const finalX = isHeroSwarm ? interpolate(diveT, [0, 1], [slideX, -320]) : slideX + diveT * 240;
            const finalY = isHeroSwarm ? interpolate(diveT, [0, 1], [slideY, -10]) : slideY - diveT * 110;
            const rotX = isHeroSwarm ? interpolate(diveT, [0, 1], [50 - w * 5, 0]) : 50 - w * 5;
            const rotZ = isHeroSwarm ? interpolate(diveT, [0, 1], [-22 + w * 2.5, 0]) : -22 + w * 2.5;
            const scale = isHeroSwarm ? interpolate(diveT, [0, 1], [1 + w * 0.035, 1.24]) : 1 + w * 0.035;
            const opacity = isHeroSwarm ? dealP : dealP * (1 - diveT * 0.95);

            // Continuous border & text RGB interpolation — ZERO flash!
            const borderCol = `rgba(${Math.round(255 - w * 10)}, ${Math.round(255 - w * 89)}, ${Math.round(255 - w * 220)}, ${(0.26 + w * 0.74).toFixed(3)})`;
            const titleCol = mixRgb([205, 214, 230], [255, 255, 255], w);
            const tagCol = mixRgb([180, 191, 212], [245, 166, 35], w);

            return (
              <div
                key={layer.cmd}
                style={{
                  position: 'absolute',
                  width: 720,
                  height: 290,
                  borderRadius: 28,
                  padding: '32px 42px',
                  boxSizing: 'border-box',
                  display: 'flex',
                  alignItems: 'flex-end',
                  justifyContent: 'space-between',
                  overflow: 'hidden',
                  backgroundColor: `rgba(${Math.round(255 - w * 10)}, ${Math.round(255 - w * 89)}, ${Math.round(255 - w * 220)}, ${(0.055 + w * 0.115).toFixed(3)})`,
                  borderWidth: 2,
                  borderStyle: 'solid',
                  borderColor: borderCol,
                  boxShadow: `0 0 ${(58 * w).toFixed(0)}px rgba(245, 166, 35, ${(0.44 * w).toFixed(2)}), 0 20px 42px rgba(0, 0, 0, 0.36), inset 0 1px 0 rgba(255,255,255,${(0.22 + w * 0.24).toFixed(2)})`,
                  backdropFilter: 'blur(10px)',
                  transform: `translate3d(${finalX.toFixed(2)}px, ${finalY.toFixed(2)}px, 0) rotateX(${rotX.toFixed(2)}deg) rotateZ(${rotZ.toFixed(2)}deg) scale(${scale.toFixed(4)})`,
                  opacity,
                }}
              >
                <div style={glassSheenStyle(frame + stackPos * 22, 0.45 + w * 0.5)} />
                <div>
                  <div style={{ fontFamily: FONTS.mono, fontSize: 22, fontWeight: 900, color: tagCol }}>
                    LAYER {layer.num}
                  </div>
                  <div style={{ fontFamily: FONTS.mono, fontSize: layer.cmd.length > 10 ? 40 : 52, fontWeight: 900, color: titleCol, whiteSpace: 'nowrap' }}>
                    {layer.cmd}
                  </div>
                </div>
                <div style={{ fontSize: 26, fontWeight: 800, color: tagCol, whiteSpace: 'nowrap' }}>
                  {layer.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

/* ============================================================================
 * SCENE 2 (00:13.0 – 00:23.8, 324f):
 * Crisp agile card slide-ins (~12f, ZERO post-land bobbing!) + Flowing Glowing Spine + 3D Official Dark Window
 * ==========================================================================*/
export const Scene02SwarmUseCases: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const inP = easeOutExpo(frame / 14);
  const outP = easeInOutCubic((frame - 302) / 18);

  const cases = [
    { num: '01', title: '同时改 7–8 个独立模块', sub: '彼此隔离、互不阻塞', start: 46, y: 185 },
    { num: '02', title: '给一堆文件批量补单测', sub: '多路并行编写与验证', start: 122, y: 390 },
    { num: '03', title: '同时调研多个竞品方案', sub: '并发检索并汇总对比', start: 192, y: 595 },
  ];

  // Crisp stepped focus glide across the 3 landed cards
  const cardFocus = steppedGlide(frame, [
    { at: 0, dur: 1, target: 0 },
    { at: 122, dur: 14, target: 1 },
    { at: 192, dur: 14, target: 2 },
  ]);

  const beam12 = easeOutExpo((frame - 110) / 18);
  const beam23 = easeOutExpo((frame - 180) / 18);
  const orbT = (frame % 60) / 60;
  const docIn = spring({ frame: Math.max(0, frame - 6), fps, config: CRISP_SPRING });

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        opacity: inP * (1 - outP),
        transform: `translate3d(${interpolate(outP, [0, 1], [0, -120]).toFixed(1)}px, 0, 0)`,
        display: 'grid',
        gridTemplateColumns: '1.08fr 0.96fr',
        gap: 44,
        alignItems: 'center',
      }}
    >
      {/* Left: Hero Header + 3 Crisp Sliding 3D Cards (ROCK SOLID once landed!) */}
      <div style={{ position: 'relative', height: 760 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 22, transform: `translate3d(0, ${((1 - inP) * 18).toFixed(1)}px, 0)` }}>
          <span style={{ fontFamily: FONTS.mono, fontSize: 94, fontWeight: 900, color: COLORS.amber, lineHeight: 0.95 }}>/swarm</span>
          <span style={{ fontSize: 38, fontWeight: 900, color: COLORS.white }}>什么时候用？活多、能拆开</span>
        </div>

        {/* Glowing Energy Connector Spine with Smooth Traveling Light Orbs */}
        <svg width="80" height="580" viewBox="0 0 80 580" style={{ position: 'absolute', left: 32, top: 155 }}>
          <defs>
            <filter id="glowOrb">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <line x1="40" y1="95" x2="40" y2={95 + beam12 * 195} stroke={COLORS.amber} strokeWidth="4" strokeDasharray="10 7" strokeDashoffset={-frame * 1.8} />
          {beam12 > 0.2 && <circle cx="40" cy={95 + orbT * beam12 * 195} r="6.5" fill="#FFE0A3" filter="url(#glowOrb)" />}
          <line x1="40" y1="300" x2="40" y2={300 + beam23 * 195} stroke={COLORS.amber} strokeWidth="4" strokeDasharray="10 7" strokeDashoffset={-frame * 1.8} />
          {beam23 > 0.2 && <circle cx="40" cy={300 + orbT * beam23 * 195} r="6.5" fill="#FFE0A3" filter="url(#glowOrb)" />}
        </svg>

        {cases.map((c, idx) => {
          const p = spring({ frame: Math.max(0, frame - c.start), fps, config: CRISP_SPRING });
          const active = frame >= c.start;
          const focusW = smoothFocusWeight(idx, cardFocus, 0.65);
          const slideX = interpolate(p, [0, 1], [-80, 0]);
          const rotY = interpolate(p, [0, 1], [-14, 0]);
          const numCol = mixRgb([195, 206, 224], [245, 166, 35], focusW);

          return (
            <div key={c.num} style={{ position: 'absolute', left: 112, top: c.y, width: 760, perspective: 1200 }}>
              <div
                style={{
                  position: 'absolute',
                  left: -58,
                  top: 52,
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  backgroundColor: `rgba(245, 166, 35, ${(0.18 + focusW * 0.82).toFixed(2)})`,
                  border: '2px solid rgba(255, 224, 163, 0.7)',
                  boxShadow: `0 0 ${(24 * focusW).toFixed(0)}px rgba(245,166,35,${(0.75 * focusW).toFixed(2)})`,
                  transform: `scale(${active ? p : 0.35})`,
                }}
              />
              <div
                style={{
                  ...crystal(0.32 + focusW * 0.62, 22),
                  padding: '24px 32px',
                  boxShadow: `0 0 ${(38 * focusW).toFixed(0)}px rgba(245,166,35,${(0.28 * focusW).toFixed(2)}), 0 16px 36px rgba(0,0,0,0.4)`,
                  opacity: p,
                  // ZERO post-land sin bobbing — settles rock-solid!
                  transform: `translate3d(${slideX.toFixed(2)}px, 0, 0) rotateY(${rotY.toFixed(2)}deg) scale(${(1 + focusW * 0.02).toFixed(4)})`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 24,
                  overflow: 'hidden',
                }}
              >
                <div style={glassSheenStyle(frame + idx * 28, 0.5 + focusW * 0.4)} />
                <span style={{ fontFamily: FONTS.display, fontSize: 52, fontWeight: 900, color: numCol, lineHeight: 0.9 }}>
                  {c.num}
                </span>
                <div>
                  <div style={{ fontSize: 34, fontWeight: 900, color: COLORS.white }}>{c.title}</div>
                  <div style={{ fontSize: 23, fontWeight: 700, color: '#B4BFD4', marginTop: 6 }}>{c.sub}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Right: 3D Tilted Native Dark Official Doc Window (slides cleanly in & stays rock-solid!) */}
      <div style={{ perspective: 1400, opacity: docIn, transform: `translate3d(${((1 - docIn) * 60).toFixed(1)}px, 0, 0)` }}>
        <div
          style={{
            transform: 'rotateY(-9deg) rotateX(3deg)',
            borderRadius: 20,
            overflow: 'hidden',
            border: '2px solid rgba(255,255,255,0.22)',
            backgroundColor: '#13161B',
            boxShadow: '0 32px 72px rgba(0,0,0,0.58), 0 0 36px rgba(245,166,35,0.1)',
          }}
        >
          <div style={{ height: 40, padding: '0 18px', backgroundColor: 'rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', gap: 8 }}>
              <span style={{ width: 11, height: 11, borderRadius: '50%', backgroundColor: '#FF5F56' }} />
              <span style={{ width: 11, height: 11, borderRadius: '50%', backgroundColor: '#FFBD2E' }} />
              <span style={{ width: 11, height: 11, borderRadius: '50%', backgroundColor: '#27C93F' }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: FONTS.mono, fontSize: 17, fontWeight: 700, color: '#C8D1E0' }}>
              <AntigravityLogo size={18} />
              <span>antigravity.google/docs/swarm</span>
              <span style={{ color: '#2ECC71', fontSize: 14 }}>● OFFICIAL</span>
            </div>
            <div style={{ width: 42 }} />
          </div>
          <div style={{ height: 470, backgroundColor: '#13161B', position: 'relative', overflow: 'hidden' }}>
            <Img src={staticFile('assets_agy/dark_swarm_doc.png')} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            <div style={glassSheenStyle(frame, 0.25)} />
          </div>
        </div>
      </div>
    </div>
  );
};

/* ============================================================================
 * SCENE 3 (00:23.3 – 00:42.6, 579f):
 * Crisp Serial Queue -> Agile 15-Frame 3D Card Flip (0.5s!) -> Living Star Topology with Flowing Light Orbs!
 * ==========================================================================*/
export const Scene03FlipToSwarmTopology: React.FC<{ outAt?: number }> = ({ outAt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sceneOut = outAt ? 1 - easeInOutCubic((frame - outAt) / 16) : 1;

  const enterP = easeOutExpo(frame / 14);

  // Agile 15-frame 3D card flip (0.50s crisp poker-card flip!) synced right at "敲上 /swarm" (33.1s -> local f=295)
  const flipStageIn = easeOutExpo((frame - 284) / 12);
  const flipP = easeInOutCubic((frame - 302) / 16); // ONLY 16 frames = 0.53s agile crisp flip!
  const flipDeg = interpolate(flipP, [0, 1], [0, 180]);
  const flipScaleLift = 1 + Math.sin(flipP * Math.PI) * 0.08;
  const toTopology = easeOutExpo((frame - 368) / 16);

  // Stepped crisp glide along the 5 serial tasks
  const queueIdx = steppedGlide(frame, [
    { at: 0, dur: 1, target: 0 },
    { at: 55, dur: 14, target: 1 },
    { at: 105, dur: 14, target: 2 },
    { at: 155, dur: 14, target: 3 },
    { at: 205, dur: 14, target: 4 },
  ]);
  const ctxPct = interpolate(frame, [20, 265], [18, 99], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // Agile star topology expansion (~16f beam draw + ~12f crisp worker pops — ZERO sluggishness!)
  const beamDraw = easeOutExpo((frame - 384) / 22);
  const workerPop = [
    spring({ frame: Math.max(0, frame - 398), fps, config: CRISP_SPRING }),
    spring({ frame: Math.max(0, frame - 406), fps, config: CRISP_SPRING }),
    spring({ frame: Math.max(0, frame - 414), fps, config: CRISP_SPRING }),
  ];
  const verifyBeam = easeOutExpo((frame - 450) / 18);
  const verifyPop = spring({ frame: Math.max(0, frame - 462), fps, config: CRISP_SPRING });
  const uiSlide = spring({ frame: Math.max(0, frame - 402), fps, config: CRISP_SPRING });

  const orb1T = ((frame - 384) * 0.025) % 1;
  const orb2T = ((frame - 366) * 0.025) % 1;
  const orb3T = ((frame - 348) * 0.025) % 1;

  const c1: [[number, number], [number, number], [number, number], [number, number]] = [[218, 335], [315, 335], [335, 118], [418, 118]];
  const c2: [[number, number], [number, number], [number, number], [number, number]] = [[218, 335], [310, 335], [375, 335], [440, 335]];
  const c3: [[number, number], [number, number], [number, number], [number, number]] = [[218, 335], [315, 335], [335, 552], [418, 552]];

  const pOrb1 = cubicPt(Math.max(0, orb1T), c1[0], c1[1], c1[2], c1[3]);
  const pOrb2 = cubicPt(Math.max(0, orb2T), c2[0], c2[1], c2[2], c2[3]);
  const pOrb3 = cubicPt(Math.max(0, orb3T), c3[0], c3[1], c3[2], c3[3]);

  const workers = [
    { name: '@auth', pct: interpolate(frame, [405, 550], [10, 100], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }), x: 495, y: 118 },
    { name: '@order', pct: interpolate(frame, [415, 565], [8, 94], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }), x: 525, y: 335 },
    { name: '@pay', pct: interpolate(frame, [425, 575], [6, 98], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }), x: 495, y: 552 },
  ];

  // Relative to 23.3s:
  // 44.0s = 621f ("共享消息板上互相同步进度"), 46.4s = 693f ("相互之间也知道谁做到哪了")
  // 49.1s = 774f ("专门的 @verifier"), 51.0s = 831f ("审 diff"), 53.0s = 891f ("跑测试进行验收")
  const boardFocus =
    easeInOutCubic((frame - 618) / 16) * (1 - easeInOutCubic((frame - 762) / 16));
  const verifierFocus = easeInOutCubic((frame - 770) / 14);
  const diffBadgeP = spring({ frame: Math.max(0, frame - 828), fps, config: CRISP_SPRING });
  const testBadgeP = spring({ frame: Math.max(0, frame - 888), fps, config: CRISP_SPRING });

  const boardMessages = [
    {
      id: '#1',
      from: '@coordinator',
      to: '@auth @order @pay @verifier',
      text: 'You own src/auth/ & auth_test.ts (parallel slice #1)',
      color: '#F5A623',
      at: 472,
    },
    {
      id: '#2',
      from: '@coordinator',
      to: '@order',
      text: 'You own src/order/ & order_test.ts (parallel slice #2)',
      color: '#F5A623',
      at: 486,
    },
    {
      id: '#3',
      from: '@coordinator',
      to: '@verifier',
      text: 'Read-only verifier: audit diff & run full test suite',
      color: '#2ECC71',
      at: 622,
    },
    {
      id: '#5',
      from: '@auth',
      to: '@verifier',
      text: 'src/auth/ complete & synced — ready for review (ref #1)',
      color: '#60A5FA',
      at: 693,
    },
    {
      id: '#6',
      from: '@verifier',
      to: 'ALL',
      text: testBadgeP > 0.5 ? 'Diff clean · Full test suite PASS ✓' : 'Auditing diff & running test suite…',
      color: '#2ECC71',
      at: 780,
    },
  ];

  const topoScale = 1 - boardFocus * 0.05;
  const topoOpacity = toTopology * (1 - boardFocus * 0.22);
  const boardRotateY = -10 + boardFocus * 8;
  const boardScale = 1 + boardFocus * 0.065;
  const verifierScale = (0.82 + verifyPop * 0.18) * (1 + verifierFocus * 0.12);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', opacity: sceneOut }}>
      {/* PHASE A (0..296f): Crisp Serial Queue + Context Overflow Meter */}
      {flipStageIn < 0.98 && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            gap: 44,
            opacity: enterP * (1 - flipStageIn),
            transform: `scale(${(1 - flipStageIn * 0.06).toFixed(4)})`,
          }}
        >
          <div>
            <div style={{ fontSize: 30, fontWeight: 800, color: '#B4BFD4', marginBottom: 10 }}>平时给 AI 一句话的痛点</div>
            <div style={{ fontSize: 66, fontWeight: 900, color: COLORS.white }}>
              单 Agent <span style={{ color: '#E5484D' }}>串行排队 · 上下文很快爆掉</span>
            </div>
          </div>

          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 22, perspective: 1400 }}>
            {['任务 01', '任务 02', '任务 03', '任务 04', '任务 05'].map((t, i) => {
              const p = spring({ frame: Math.max(0, frame - 4 - i * 5), fps, config: CRISP_SPRING });
              const w = smoothFocusWeight(i, queueIdx, 0.6);
              const titleC = mixRgb([255, 255, 255], [245, 166, 35], w);
              const subC = mixRgb([148, 163, 184], [255, 224, 163], w);
              return (
                <React.Fragment key={t}>
                  <div
                    style={{
                      ...crystal(0.24 + w * 0.72, 22),
                      flex: 1,
                      padding: '34px 20px',
                      textAlign: 'center',
                      // Rock-solid once landed; lifts smoothly ONLY while active focus!
                      transform: `translate3d(0, ${((1 - p) * 26 - w * 14).toFixed(1)}px, 0) rotateY(${(i - 2) * -6}deg)`,
                      opacity: p,
                      overflow: 'hidden',
                    }}
                  >
                    <div style={glassSheenStyle(frame + i * 20, 0.45)} />
                    <div style={{ fontSize: 34, fontWeight: 900, color: titleC }}>{t}</div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: subC, marginTop: 10 }}>
                      {w > 0.5 ? '单线程执行中…' : i < queueIdx ? '上下文已堆积' : '排队干等'}
                    </div>
                  </div>
                  {i < 4 && (
                    <svg width="46" height="24" viewBox="0 0 46 24" style={{ flexShrink: 0 }}>
                      <line
                        x1="2"
                        y1="12"
                        x2="42"
                        y2="12"
                        stroke={i < queueIdx ? COLORS.amber : 'rgba(255,255,255,0.22)'}
                        strokeWidth="4"
                        strokeDasharray="8 6"
                        strokeDashoffset={i < queueIdx ? -frame * 1.8 : 0}
                      />
                    </svg>
                  )}
                </React.Fragment>
              );
            })}
          </div>

          <div style={{ ...crystal(0.7, 22), padding: '26px 34px', borderColor: ctxPct > 78 ? '#E5484D' : COLORS.amberBorder }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <span style={{ fontSize: 30, fontWeight: 900, color: ctxPct > 78 ? '#FCA5A5' : COLORS.amber }}>
                单会话上下文窗口占用
              </span>
              <span style={{ fontFamily: FONTS.mono, fontSize: 44, fontWeight: 900, color: ctxPct > 78 ? '#E5484D' : COLORS.amber }}>
                {Math.round(ctxPct)}% {ctxPct > 84 ? '⚠ 即将爆仓' : ''}
              </span>
            </div>
            <div style={{ height: 24, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.1)', overflow: 'hidden' }}>
              <div
                style={{
                  width: `${ctxPct}%`,
                  height: '100%',
                  borderRadius: 12,
                  backgroundColor: ctxPct > 78 ? '#E5484D' : COLORS.amber,
                  boxShadow: ctxPct > 78 ? '0 0 28px rgba(229,72,77,0.75)' : '0 0 22px rgba(245,166,35,0.55)',
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* PHASE B (284..382f): Agile Crisp 16-Frame 3D Card Flip (0.53s light poker-card snap!) */}
      {flipStageIn > 0.02 && toTopology < 0.98 && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            perspective: 1600,
            opacity: flipStageIn * (1 - toTopology),
            transform: `scale(${(flipScaleLift * interpolate(toTopology, [0, 1], [1, 0.9])).toFixed(4)})`,
          }}
        >
          <div
            style={{
              width: 960,
              height: 440,
              position: 'relative',
              transformStyle: 'preserve-3d',
              transform: `rotateY(${flipDeg.toFixed(2)}deg)`,
            }}
          >
            <div
              style={{
                ...crystal(0.7, 30),
                position: 'absolute',
                inset: 0,
                backfaceVisibility: 'hidden',
                borderColor: 'rgba(229, 72, 77, 0.78)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 16,
              }}
            >
              <div style={{ fontSize: 32, fontWeight: 800, color: '#FCA5A5' }}>传统单线程对话模式</div>
              <div style={{ fontSize: 82, fontWeight: 900, color: '#E5484D' }}>排队 · 阻塞 · 爆上下文</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: '#C8D1E0' }}>执行之前，敲下这一条指令 →</div>
            </div>

            <div
              style={{
                ...crystal(1.0, 30),
                position: 'absolute',
                inset: 0,
                backfaceVisibility: 'hidden',
                transform: 'rotateY(180deg)',
                borderColor: '#F5A623',
                boxShadow: '0 0 80px rgba(245,166,35,0.45)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 18,
                overflow: 'hidden',
              }}
            >
              <div style={glassSheenStyle(frame, 1.0)} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <AntigravityLogo size={54} />
                <span style={{ fontFamily: FONTS.mono, fontSize: 28, fontWeight: 900, color: '#FFE0A3', letterSpacing: 3 }}>SWARM ACTIVATED</span>
              </div>
              <div style={{ fontFamily: FONTS.mono, fontSize: 132, fontWeight: 900, color: COLORS.amber, lineHeight: 0.92, textShadow: '0 0 54px rgba(245,166,35,0.55)' }}>
                /swarm
              </div>
              <div style={{ fontSize: 40, fontWeight: 900, color: COLORS.white }}>玩法彻底改变 · 多 Agent 并行开干</div>
            </div>
          </div>
        </div>
      )}

      {/* PHASE C (368..935f): Crisp Star Topology + Vector Swarm Shared Board + @verifier Emphasis */}
      {toTopology > 0.02 && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'grid',
            gridTemplateColumns: '1.12fr 0.95fr',
            gap: 36,
            alignItems: 'center',
            opacity: toTopology,
          }}
        >
          <div
            style={{
              position: 'relative',
              width: '100%',
              height: 760,
              opacity: topoOpacity,
              transform: `scale(${topoScale.toFixed(4)})`,
              transformOrigin: 'left center',
            }}
          >
            <div style={{ position: 'absolute', top: 0, left: 0, display: 'flex', alignItems: 'baseline', gap: 22 }}>
              <span style={{ fontFamily: FONTS.mono, fontSize: 92, fontWeight: 900, color: COLORS.amber, lineHeight: 0.95 }}>/swarm</span>
              <span style={{ fontSize: 38, fontWeight: 900, color: COLORS.white }}>总控拆活 · 多节点并行</span>
            </div>

            <svg width="920" height="650" viewBox="0 0 920 650" style={{ position: 'absolute', top: 115, left: 0 }}>
              <defs>
                <linearGradient id="liveAmber" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#F5A623" />
                  <stop offset="100%" stopColor="#FFE0A3" />
                </linearGradient>
                <filter id="orbGlow2">
                  <feGaussianBlur stdDeviation="5" result="b" />
                  <feMerge>
                    <feMergeNode in="b" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {[
                'M 218 335 C 315 335, 335 118, 418 118',
                'M 218 335 C 310 335, 375 335, 440 335',
                'M 218 335 C 315 335, 335 552, 418 552',
              ].map((d, idx) => (
                <React.Fragment key={idx}>
                  <path d={d} fill="none" stroke="rgba(245, 166, 35, 0.24)" strokeWidth="6" pathLength={100} strokeDasharray={100} strokeDashoffset={(1 - beamDraw) * 100} />
                  <path d={d} fill="none" stroke="url(#liveAmber)" strokeWidth="3.5" strokeDasharray="10 8" strokeDashoffset={-frame * 2.4} opacity={beamDraw} />
                </React.Fragment>
              ))}

              {beamDraw > 0.65 && (
                <>
                  <circle cx={pOrb1[0]} cy={pOrb1[1]} r="7" fill="#FFF3D6" filter="url(#orbGlow2)" />
                  <circle cx={pOrb2[0]} cy={pOrb2[1]} r="7" fill="#FFF3D6" filter="url(#orbGlow2)" />
                  <circle cx={pOrb3[0]} cy={pOrb3[1]} r="7" fill="#FFF3D6" filter="url(#orbGlow2)" />
                </>
              )}

              {[
                'M 575 118 C 655 118, 675 305, 728 322',
                'M 610 335 L 724 335',
                'M 575 552 C 655 552, 675 365, 728 348',
              ].map((d, idx) => (
                <React.Fragment key={idx}>
                  <path d={d} fill="none" stroke="#2ECC71" strokeWidth={3.5 + verifierFocus * 2} pathLength={100} strokeDasharray={100} strokeDashoffset={(1 - verifyBeam) * 100} />
                  {verifierFocus > 0.2 && (
                    <path d={d} fill="none" stroke="#A7F3D0" strokeWidth="3" strokeDasharray="8 10" strokeDashoffset={-frame * 2.6} opacity={verifierFocus} />
                  )}
                </React.Fragment>
              ))}

              {/* Dedicated @verifier outer emphasis halo when voiceover hits 49.1s */}
              {verifierFocus > 0.05 && (
                <polygon
                  points="815,216 918,275 918,395 815,454 712,395 712,275"
                  fill="none"
                  stroke="#2ECC71"
                  strokeWidth="2.5"
                  strokeDasharray="10 6"
                  opacity={verifierFocus * 0.85}
                />
              )}
              <polygon
                points="815,232 904,283 904,387 815,438 726,387 726,283"
                fill={`rgba(46, 204, 113, ${(0.16 + verifierFocus * 0.18).toFixed(2)})`}
                stroke="#2ECC71"
                strokeWidth={3.5 + verifierFocus * 1.5}
                filter={verifierFocus > 0.2 ? 'url(#orbGlow2)' : undefined}
                opacity={verifyPop}
              />
            </svg>

            {/* Rock-Solid @coordinator Core */}
            <div
              style={{
                ...crystal(0.95, 999),
                position: 'absolute',
                left: 16,
                top: 340,
                width: 218,
                height: 218,
                borderRadius: '50%',
                borderColor: '#F5A623',
                boxShadow: `0 0 ${(44 + Math.sin(frame * 0.12) * 14).toFixed(0)}px rgba(245,166,35,0.52)`,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                gap: 6,
              }}
            >
              <AntigravityLogo size={42} />
              <div style={{ fontFamily: FONTS.mono, fontSize: 24, fontWeight: 900, color: COLORS.amber }}>@coordinator</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: COLORS.white }}>总控拆活</div>
            </div>

            {/* 3 Circular Worker Nodes */}
            {workers.map((w, idx) => {
              const pop = workerPop[idx];
              const circ = 2 * Math.PI * 76;
              const offset = circ * (1 - w.pct / 100);
              return (
                <div
                  key={w.name}
                  style={{
                    position: 'absolute',
                    left: w.x - 85,
                    top: w.y + 30,
                    width: 170,
                    height: 170,
                    borderRadius: '50%',
                    backgroundColor: 'rgba(26, 32, 46, 0.86)',
                    backdropFilter: 'blur(10px)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 14px 34px rgba(0,0,0,0.45)',
                    opacity: pop,
                    transform: `scale(${(0.72 + pop * 0.28).toFixed(4)})`,
                  }}
                >
                  <svg width="170" height="170" style={{ position: 'absolute', inset: 0, transform: 'rotate(-90deg)' }}>
                    <circle cx="85" cy="85" r="76" fill="none" stroke="rgba(255,255,255,0.16)" strokeWidth="6" />
                    <circle cx="85" cy="85" r="76" fill="none" stroke={COLORS.amber} strokeWidth="6" strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" />
                  </svg>
                  <div style={{ fontFamily: FONTS.mono, fontSize: 26, fontWeight: 900, color: COLORS.white }}>{w.name}</div>
                  <div style={{ fontFamily: FONTS.mono, fontSize: 22, fontWeight: 800, color: COLORS.amber }}>{Math.round(w.pct)}%</div>
                </div>
              );
            })}

            {/* @verifier Label + Sequential Diff/Test Emphasis Badges */}
            <div
              style={{
                position: 'absolute',
                left: 726,
                top: 386,
                width: 178,
                textAlign: 'center',
                opacity: verifyPop,
                transform: `scale(${verifierScale.toFixed(4)})`,
              }}
            >
              <div style={{ fontFamily: FONTS.mono, fontSize: 26, fontWeight: 900, color: '#2ECC71', textShadow: verifierFocus > 0.2 ? '0 0 18px rgba(46,204,113,0.65)' : 'none' }}>
                @verifier
              </div>
              <div style={{ fontSize: 22, fontWeight: 800, color: COLORS.white, marginTop: 4 }}>独立审查验收</div>
              <div style={{ fontSize: 22, fontWeight: 900, color: '#2ECC71', marginTop: 4 }}>PASS ✓</div>
            </div>

            {/* Voiceover-synced @verifier action pills (51.0s 审 diff -> 53.0s 跑测试验收) */}
            <div style={{ position: 'absolute', left: 668, top: 590, display: 'flex', flexDirection: 'column', gap: 10, width: 252 }}>
              <div
                style={{
                  padding: '8px 16px',
                  borderRadius: 12,
                  backgroundColor: 'rgba(46,204,113,0.18)',
                  border: '2px solid #2ECC71',
                  color: '#FFFFFF',
                  fontSize: 21,
                  fontWeight: 900,
                  textAlign: 'center',
                  opacity: diffBadgeP,
                  transform: `translate3d(0, ${((1 - diffBadgeP) * 14).toFixed(1)}px, 0)`,
                }}
              >
                ① 专职审 Diff ✓
              </div>
              <div
                style={{
                  padding: '8px 16px',
                  borderRadius: 12,
                  backgroundColor: 'rgba(245,166,35,0.2)',
                  border: '2px solid #F5A623',
                  color: '#FFE0A3',
                  fontSize: 21,
                  fontWeight: 900,
                  textAlign: 'center',
                  opacity: testBadgeP,
                  transform: `translate3d(0, ${((1 - testBadgeP) * 14).toFixed(1)}px, 0)`,
                }}
              >
                ② 跑全量测试验收 ✓
              </div>
            </div>
          </div>

          {/* Right: Ultra-Crisp 1:1 Vector Native-Dark Antigravity Swarm Shared Message Board (ZERO BLUR in 4K!) */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 20,
              perspective: 1400,
              opacity: uiSlide,
              transform: `translate3d(${((1 - uiSlide) * 58).toFixed(1)}px, 0, 0)`,
            }}
          >
            <div
              style={{
                transform: `rotateY(${boardRotateY.toFixed(2)}deg) rotateX(${(3 - boardFocus * 2).toFixed(2)}deg) scale(${boardScale.toFixed(4)})`,
                borderRadius: 22,
                overflow: 'hidden',
                border: `2px solid ${mixRgb([255, 255, 255], [245, 166, 35], 0.25 + boardFocus * 0.75)}`,
                backgroundColor: '#12151C',
                boxShadow: `0 28px 64px rgba(0,0,0,0.58), 0 0 ${(28 + boardFocus * 44).toFixed(0)}px rgba(245,166,35,${(0.12 + boardFocus * 0.28).toFixed(2)})`,
              }}
            >
              {/* macOS Window Chrome */}
              <div style={{ height: 42, padding: '0 18px', backgroundColor: 'rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', gap: 7 }}>
                  <span style={{ width: 11, height: 11, borderRadius: '50%', backgroundColor: '#FF5F56' }} />
                  <span style={{ width: 11, height: 11, borderRadius: '50%', backgroundColor: '#FFBD2E' }} />
                  <span style={{ width: 11, height: 11, borderRadius: '50%', backgroundColor: '#27C93F' }} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: FONTS.mono, fontSize: 17, fontWeight: 800, color: '#D8E0EE' }}>
                  <AntigravityLogo size={17} />
                  <span>Swarm 共享消息板</span>
                  <span style={{ color: '#2ECC71', fontSize: 15 }}>● LIVE</span>
                </div>
                <div style={{ width: 40 }} />
              </div>

              {/* Crisp 1:1 Official Swarm Board Header & Tabs */}
              <div style={{ padding: '16px 22px 12px', borderBottom: '1px solid rgba(255,255,255,0.09)', backgroundColor: '#151922' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontFamily: FONTS.mono, fontSize: 21, fontWeight: 900, color: '#FFFFFF' }}>stats and dedupe packages</span>
                  <span style={{ fontFamily: FONTS.mono, fontSize: 15, fontWeight: 800, color: '#2ECC71', backgroundColor: 'rgba(46,204,113,0.15)', padding: '3px 10px', borderRadius: 999 }}>
                    ● Live Sync
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 22, marginTop: 10, fontFamily: FONTS.mono, fontSize: 16, fontWeight: 800 }}>
                  <span style={{ color: '#FFFFFF', borderBottom: '2.5px solid #F5A623', paddingBottom: 6 }}>Board 8</span>
                  <span style={{ color: '#8A97AD' }}>Members 4</span>
                  <span style={{ color: '#8A97AD' }}>Graph</span>
                </div>
              </div>

              {/* Live Progressive Message Stream (Razor-Sharp Vector Text in 4K!) */}
              <div style={{ padding: '16px 20px 20px', display: 'flex', flexDirection: 'column', gap: 11, minHeight: 410, position: 'relative' }}>
                {boardMessages.map((m) => {
                  const mp = spring({ frame: Math.max(0, frame - m.at), fps, config: CRISP_SPRING });
                  const isNewest = m.id === '#6' ? verifierFocus : m.id === '#5' ? boardFocus : 0;
                  return (
                    <div
                      key={m.id}
                      style={{
                        padding: '11px 15px',
                        borderRadius: 12,
                        backgroundColor: isNewest > 0.3 ? 'rgba(245,166,35,0.13)' : 'rgba(255,255,255,0.045)',
                        border: `1.5px solid ${isNewest > 0.3 ? m.color : 'rgba(255,255,255,0.09)'}`,
                        opacity: mp,
                        transform: `translate3d(0, ${((1 - mp) * 16).toFixed(1)}px, 0)`,
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: FONTS.mono, fontSize: 16 }}>
                          <span style={{ fontWeight: 900, color: m.color }}>{m.from}</span>
                          <span style={{ color: '#8A97AD' }}>→ {m.to}</span>
                        </div>
                        <span style={{ fontFamily: FONTS.mono, fontSize: 14, color: '#8A97AD' }}>{m.id}</span>
                      </div>
                      <div style={{ fontFamily: FONTS.mono, fontSize: 17, fontWeight: 700, color: '#E8EDF7', lineHeight: 1.35 }}>
                        {m.text}
                      </div>
                    </div>
                  );
                })}
                <div style={glassSheenStyle(frame, 0.22)} />
              </div>
            </div>

            {/* Live Sync Status Strip (Replaces premature App/CLI pills!) */}
            <div
              style={{
                ...crystal(0.35 + boardFocus * 0.45, 14),
                padding: '12px 22px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: 22,
                fontWeight: 800,
              }}
            >
              <span style={{ color: '#E2E8F4' }}>
                {verifierFocus > 0.4 ? '专职 @verifier 自动审 Diff + 跑测试' : '同一个共享消息板 · 彼此实时同步进度'}
              </span>
              <span style={{ fontFamily: FONTS.mono, color: verifierFocus > 0.4 ? '#2ECC71' : COLORS.amber, fontWeight: 900 }}>
                {verifierFocus > 0.4 ? 'VERIFIED ✓' : 'SYNC 3/3'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const AgyV2MotionSample: React.FC = () => {
  const frame = useCurrentFrame();
  const chapterLabel =
    frame < f(13.0)
      ? 'OVERVIEW · 5 SLASH COMMANDS'
      : frame < f(23.5)
        ? '01 · /swarm · USE CASES'
        : frame < f(34.5)
          ? '01 · /swarm · SERIAL VS PARALLEL'
          : '01 · /swarm · PARALLEL TOPOLOGY';

  return (
    <LuminousStage stepIndex={1} chapterLabel={chapterLabel}>
      <Audio src={staticFile('assets_agy/agy_commands.wav')} endAt={AGY_V2_SAMPLE_FRAMES} />

      <Sequence from={0} durationInFrames={f(13.3)}>
        <Scene01Intro3DLayers />
      </Sequence>

      <Sequence from={f(12.9)} durationInFrames={f(23.8 - 12.9)}>
        <Scene02SwarmUseCases />
      </Sequence>

      <Sequence from={f(23.3)} durationInFrames={AGY_V2_SAMPLE_FRAMES - f(23.3)}>
        <Scene03FlipToSwarmTopology />
      </Sequence>
    </LuminousStage>
  );
};
