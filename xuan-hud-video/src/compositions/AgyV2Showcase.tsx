import React from 'react';
import { Img, staticFile, useCurrentFrame } from 'remotion';
import { COLORS, FONTS } from '../design/tokens';
import { glassSheenStyle, glassSurface } from '../design/motion';
import {
  AntigravityLogo,
  DesktopAppIcon,
  IdeCodeIcon,
  PythonLogo,
  TerminalCliIcon,
} from '../design/BrandLogos';

/**
 * Luminous Dark-Studio Atmospheric Canvas (NEVER dead black!)
 * Logical 1920x1280 (3:2) -> rendered at --scale=2 => true 3840x2560 4K
 */
const LuminousCanvas: React.FC<{
  stepIndex: number;
  totalSteps?: number;
  chapterLabel: string;
  subtitleZh: string;
  children: React.ReactNode;
}> = ({ stepIndex, totalSteps = 5, chapterLabel, subtitleZh, children }) => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: '#10141E',
        backgroundImage: [
          'radial-gradient(ellipse 68% 58% at 22% 24%, rgba(58, 92, 160, 0.24) 0%, transparent 65%)',
          'radial-gradient(ellipse 62% 54% at 78% 72%, rgba(245, 166, 35, 0.16) 0%, transparent 62%)',
          'radial-gradient(ellipse 90% 80% at 50% 50%, #171C28 0%, #0E1119 72%, #0A0C12 100%)',
        ].join(', '),
        fontFamily: FONTS.sans,
        color: COLORS.white,
        boxSizing: 'border-box',
      }}
    >
      {/* Subtle architectural perspective dot-grid atmosphere */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.085) 1.2px, transparent 1.2px)',
          backgroundSize: '44px 44px',
          opacity: 0.55,
          pointerEvents: 'none',
        }}
      />

      {/* Faint spacious ANTIGRAVITY watermark */}
      <div
        style={{
          position: 'absolute',
          inset: -260,
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

      {/* Ultra-minimal top hairline progress (NO bulky box frame!) */}
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
          {Array.from({ length: totalSteps }).map((_, i) => {
            const active = i + 1 === stepIndex;
            const done = i + 1 < stepIndex;
            return (
              <div
                key={i}
                style={{
                  flex: 1,
                  height: active ? 4 : 3,
                  borderRadius: 3,
                  backgroundColor: active
                    ? COLORS.amber
                    : done
                      ? 'rgba(245, 166, 35, 0.45)'
                      : 'rgba(255,255,255,0.16)',
                  boxShadow: active ? '0 0 14px rgba(245,166,35,0.65)' : 'none',
                }}
              />
            );
          })}
        </div>
        <div style={{ fontFamily: FONTS.mono, fontSize: 22, fontWeight: 800, color: '#A6B2C7' }}>
          {String(stepIndex).padStart(2, '0')} / {String(totalSteps).padStart(2, '0')}
        </div>
      </div>

      {/* Free Full-Screen Stage Area */}
      <div
        style={{
          position: 'absolute',
          top: 96,
          left: 72,
          right: 72,
          bottom: 148,
          boxSizing: 'border-box',
        }}
      >
        {children}
      </div>

      {/* Crisp Mobile-Friendly Bottom Subtitle */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 34,
          display: 'flex',
          justifyContent: 'center',
          zIndex: 50,
        }}
      >
        <div
          style={{
            backgroundColor: 'rgba(12, 15, 22, 0.86)',
            border: '1px solid rgba(255,255,255,0.12)',
            padding: '12px 38px',
            borderRadius: 16,
            fontSize: 54,
            fontWeight: 900,
            color: COLORS.white,
            letterSpacing: 1,
            boxShadow: '0 10px 34px rgba(0,0,0,0.45)',
          }}
        >
          {subtitleZh}
        </div>
      </div>

      {/* Subtle corner lens vignette sheen */}
      <div style={{ ...glassSheenStyle(frame, 0.14), pointerEvents: 'none' }} />
    </div>
  );
};

const crystal = (active = 0, radius = 22): React.CSSProperties => ({
  ...glassSurface({ active, blurPx: 14, radius, opacity: 0.34 + active * 0.16 }),
  boxSizing: 'border-box',
  backgroundImage: `linear-gradient(145deg, rgba(255,255,255,${(0.14 + active * 0.09).toFixed(3)}) 0%, rgba(180,200,235,0.05) 48%, rgba(245,166,35,${(0.03 + active * 0.16).toFixed(3)}) 100%)`,
});

const DarkOfficialFloatingWindow: React.FC<{
  src: string;
  domain: string;
  tiltY?: number;
  tiltX?: number;
  width?: number | string;
  height: number;
}> = ({ src, domain, tiltY = -8, tiltX = 3, width = '100%', height }) => (
  <div
    style={{
      width,
      perspective: 1400,
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
      boxSizing: 'border-box',
    }}
  >
    <div
      style={{
        transform: `rotateY(${tiltY}deg) rotateX(${tiltX}deg)`,
        borderRadius: 18,
        overflow: 'hidden',
        border: '1.5px solid rgba(255,255,255,0.22)',
        backgroundColor: '#13161B',
        boxShadow: '0 28px 64px rgba(0,0,0,0.58), 0 0 28px rgba(245,166,35,0.08)',
      }}
    >
      {/* Sleek dark browser chrome bar */}
      <div
        style={{
          height: 36,
          padding: '0 16px',
          backgroundColor: 'rgba(255,255,255,0.05)',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', gap: 7 }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#FF5F56' }} />
          <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#FFBD2E' }} />
          <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#27C93F' }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: FONTS.mono, fontSize: 16, fontWeight: 700, color: '#C8D1E0' }}>
          <AntigravityLogo size={16} />
          <span>{domain}</span>
          <span style={{ color: '#2ECC71', fontSize: 14 }}>● OFFICIAL</span>
        </div>
        <div style={{ width: 42 }} />
      </div>
      <div style={{ height, backgroundColor: '#13161B', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Img src={staticFile(src)} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
      </div>
    </div>
  </div>
);

/* ============================================================================
 * FRAME 0 (01_intro_3d_layers): 3D 透视斜叠 5 层烟熏玻璃空间阶梯（对标原片核心质感）
 * ==========================================================================*/
const Sample01IntroLayers: React.FC = () => {
  const layers = [
    { num: '05', cmd: '/goal', label: '目标明确 · 下班挂机' },
    { num: '04', cmd: '/run-workflow', label: '批量定制 · 编排流水' },
    { num: '03', cmd: '/teamwork', label: '跨天大工程 · 里程碑' },
    { num: '02', cmd: '/boost', label: '活难啃不动 · 深度推理' },
    { num: '01', cmd: '/swarm', label: '活多能拆 · 并行开干' },
  ];
  const activeIdx = 4; // 01 /swarm highlighted

  return (
    <LuminousCanvas stepIndex={1} chapterLabel="OVERVIEW · 5 SLASH COMMANDS" subtitleZh="按照平时干活遇到的 5 种卡点拆解">
      <div style={{ width: '100%', height: '100%', display: 'grid', gridTemplateColumns: '0.92fr 1.15fr', gap: 48, alignItems: 'center' }}>
        {/* Left: Extreme Typographic Hierarchy + Clean Index Pills (Supporting items 75% luminous, NOT dead black!) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
              <AntigravityLogo size={46} />
              <span style={{ fontFamily: FONTS.mono, fontSize: 28, fontWeight: 800, color: '#C8D1E0' }}>Google Antigravity</span>
            </div>
            <div style={{ fontSize: 96, fontWeight: 900, lineHeight: 1.04, letterSpacing: 1 }}>
              5 条神级 <span style={{ color: COLORS.amber, fontFamily: FONTS.mono }}>/</span> 指令
            </div>
            <div style={{ fontSize: 32, fontWeight: 700, color: '#B4BFD4', marginTop: 14 }}>
              看完直接上手 · 彻底告别单线程死等
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, width: 560 }}>
            {[...layers].reverse().map((item, idx) => {
              const isAct = idx === 0;
              return (
                <div
                  key={item.cmd}
                  style={{
                    padding: '15px 26px',
                    borderRadius: 14,
                    backgroundColor: isAct ? COLORS.amber : 'rgba(255,255,255,0.08)',
                    border: isAct ? `2px solid ${COLORS.amberBright}` : '1.5px solid rgba(255,255,255,0.18)',
                    color: isAct ? '#111318' : '#E2E8F4',
                    boxShadow: isAct ? '0 0 36px rgba(245,166,35,0.45)' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transform: isAct ? 'translateX(14px) scale(1.03)' : 'none',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <span style={{ fontFamily: FONTS.mono, fontSize: 24, fontWeight: 900, opacity: isAct ? 1 : 0.7 }}>{item.num}</span>
                    <span style={{ fontFamily: FONTS.mono, fontSize: 30, fontWeight: 900 }}>{item.cmd}</span>
                  </div>
                  <span style={{ fontSize: 23, fontWeight: 800, opacity: isAct ? 0.92 : 0.78 }}>{item.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Genuine 3D Isometric Stacked Smoked-Crystal Glass Layers (like reference image!) */}
        <div style={{ position: 'relative', width: '100%', height: 760, perspective: 1600, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {layers.map((layer, i) => {
            const isAct = i === activeIdx;
            const yOffset = (i - 2) * 108;
            const zLift = isAct ? 48 : 0;
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
                  backgroundColor: isAct ? 'rgba(245, 166, 35, 0.14)' : 'rgba(255, 255, 255, 0.055)',
                  border: isAct ? '2.5px solid #F5A623' : '1.5px solid rgba(255, 255, 255, 0.28)',
                  boxShadow: isAct
                    ? '0 0 64px rgba(245, 166, 35, 0.42), inset 0 1px 0 rgba(255,255,255,0.45)'
                    : '0 22px 44px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255,255,255,0.22)',
                  backdropFilter: 'blur(10px)',
                  transform: `translateY(${yOffset}px) translateZ(${zLift}px) rotateX(50deg) rotateZ(-22deg)`,
                }}
              >
                <div>
                  <div style={{ fontFamily: FONTS.mono, fontSize: 22, fontWeight: 900, color: isAct ? COLORS.amber : '#B4BFD4' }}>
                    LAYER {layer.num}
                  </div>
                  <div style={{ fontFamily: FONTS.mono, fontSize: 54, fontWeight: 900, color: isAct ? COLORS.white : 'rgba(255,255,255,0.72)' }}>
                    {layer.cmd}
                  </div>
                </div>
                <div style={{ fontSize: 28, fontWeight: 800, color: isAct ? COLORS.amberBright : 'rgba(220,230,245,0.68)' }}>
                  {layer.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </LuminousCanvas>
  );
};

/* ============================================================================
 * FRAME 1 (02_swarm_topology): 星型放射拓扑节点图 + 六边形 @verifier 盾牌 + 3D 微倾深色消息板
 * ==========================================================================*/
const Sample02SwarmTopology: React.FC = () => {
  const workers = [
    { name: '@auth', pct: 100, x: 465, y: 120 },
    { name: '@order', pct: 86, x: 505, y: 345 },
    { name: '@pay', pct: 94, x: 465, y: 570 },
  ];

  return (
    <LuminousCanvas stepIndex={1} chapterLabel="01 · /swarm · PARALLEL TOPOLOGY" subtitleZh="分配给多个带名字的子 Agent 一起干，配专属 @verifier 验收">
      <div style={{ width: '100%', height: '100%', display: 'grid', gridTemplateColumns: '1.12fr 0.95fr', gap: 36, alignItems: 'center' }}>
        {/* Left: Radial Hub-and-Spoke Topology Graph (Circles + Curved Energy Beams + Hexagon Shield!) */}
        <div style={{ position: 'relative', width: '100%', height: 760 }}>
          {/* Hero Header above diagram */}
          <div style={{ position: 'absolute', top: 0, left: 0, display: 'flex', alignItems: 'baseline', gap: 22 }}>
            <span style={{ fontFamily: FONTS.mono, fontSize: 92, fontWeight: 900, color: COLORS.amber, lineHeight: 0.95 }}>/swarm</span>
            <span style={{ fontSize: 38, fontWeight: 900, color: COLORS.white }}>活多能拆 · 多节点并行</span>
          </div>

          {/* SVG Curved Glowing Topology Connections */}
          <svg width="920" height="650" viewBox="0 0 920 650" style={{ position: 'absolute', top: 115, left: 0 }}>
            <defs>
              <linearGradient id="beamAmber" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#F5A623" />
                <stop offset="100%" stopColor="#E2E8F4" />
              </linearGradient>
              <linearGradient id="beamGreen" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#E2E8F4" />
                <stop offset="100%" stopColor="#2ECC71" />
              </linearGradient>
            </defs>
            {/* Coordinator -> 3 Workers */}
            <path d="M 190 345 C 295 345, 315 120, 410 120" fill="none" stroke="url(#beamAmber)" strokeWidth="4" strokeDasharray="10 7" />
            <path d="M 190 345 L 430 345" fill="none" stroke="url(#beamAmber)" strokeWidth="4" strokeDasharray="10 7" />
            <path d="M 190 345 C 295 345, 315 570, 410 570" fill="none" stroke="url(#beamAmber)" strokeWidth="4" strokeDasharray="10 7" />
            {/* 3 Workers -> Hexagon Verifier */}
            <path d="M 555 120 C 640 120, 665 310, 720 330" fill="none" stroke="url(#beamGreen)" strokeWidth="3.5" />
            <path d="M 595 345 L 718 345" fill="none" stroke="url(#beamGreen)" strokeWidth="3.5" />
            <path d="M 555 570 C 640 570, 665 380, 720 360" fill="none" stroke="url(#beamGreen)" strokeWidth="3.5" />

            {/* Hexagon @verifier Shield Node (NO rounded rectangle!) */}
            <polygon
              points="815,242 904,293 904,397 815,448 726,397 726,293"
              fill="rgba(46, 204, 113, 0.14)"
              stroke="#2ECC71"
              strokeWidth="3.5"
            />
          </svg>

          {/* Center-Left Circular Hub: @coordinator */}
          <div
            style={{
              ...crystal(0.95, 999),
              position: 'absolute',
              left: 16,
              top: 345,
              width: 218,
              height: 218,
              borderRadius: '50%',
              border: '3px solid #F5A623',
              boxShadow: '0 0 54px rgba(245,166,35,0.42)',
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

          {/* 3 Circular Worker Nodes with SVG Progress Rings */}
          {workers.map((w) => {
            const circ = 2 * Math.PI * 76;
            const offset = circ * (1 - w.pct / 100);
            return (
              <div
                key={w.name}
                style={{
                  position: 'absolute',
                  left: w.x - 84,
                  top: w.y + 30,
                  width: 170,
                  height: 170,
                  borderRadius: '50%',
                  backgroundColor: 'rgba(26, 32, 46, 0.82)',
                  backdropFilter: 'blur(10px)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 14px 34px rgba(0,0,0,0.45)',
                }}
              >
                <svg width="170" height="170" style={{ position: 'absolute', inset: 0, transform: 'rotate(-90deg)' }}>
                  <circle cx="85" cy="85" r="76" fill="none" stroke="rgba(255,255,255,0.16)" strokeWidth="6" />
                  <circle cx="85" cy="85" r="76" fill="none" stroke={COLORS.amber} strokeWidth="6" strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" />
                </svg>
                <div style={{ fontFamily: FONTS.mono, fontSize: 26, fontWeight: 900, color: COLORS.white }}>{w.name}</div>
                <div style={{ fontFamily: FONTS.mono, fontSize: 22, fontWeight: 800, color: COLORS.amber }}>{w.pct}%</div>
              </div>
            );
          })}

          {/* Hexagon Verifier Label */}
          <div
            style={{
              position: 'absolute',
              left: 726,
              top: 398,
              width: 178,
              textAlign: 'center',
            }}
          >
            <div style={{ fontFamily: FONTS.mono, fontSize: 25, fontWeight: 900, color: '#2ECC71' }}>@verifier</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: COLORS.white, marginTop: 4 }}>审 Diff · 验收</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: '#2ECC71', marginTop: 4 }}>PASS ✓</div>
          </div>
        </div>

        {/* Right: 3D Perspective-Tilted Native Dark Swarm UI Screenshot + Platform Pill */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
          <DarkOfficialFloatingWindow
            src="assets_agy/crop_swarm_ui.png"
            domain="Antigravity Swarm · 共享消息板实景"
            tiltY={-9}
            tiltX={3}
            height={470}
          />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 8px' }}>
            <div style={{ display: 'flex', gap: 14 }}>
              <span style={{ ...crystal(0.3, 12), padding: '10px 20px', fontSize: 24, fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: 10 }}>
                <DesktopAppIcon size={22} /> App
              </span>
              <span style={{ ...crystal(0.3, 12), padding: '10px 20px', fontSize: 24, fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: 10 }}>
                <TerminalCliIcon size={22} /> CLI
              </span>
            </div>
            <span style={{ backgroundColor: '#2ECC71', color: '#0E1119', padding: '10px 24px', borderRadius: 12, fontSize: 24, fontWeight: 900 }}>
              免费计划可用
            </span>
          </div>
        </div>
      </div>
    </LuminousCanvas>
  );
};

/* ============================================================================
 * FRAME 2 (03_boost_orbital): 巨幅环形轨道闭环图（Orbital Ring）+ 3D 微倾原生深色文档
 * ==========================================================================*/
const Sample03BoostOrbital: React.FC = () => {
  const nodes = [
    { num: '01', title: '先实现一版', sub: '生成候选方案', x: 350, y: 46, active: false },
    { num: '02', title: '挑战找茬', sub: '独立对抗审查', x: 640, y: 315, active: true },
    { num: '03', title: '揪出漏洞修复', sub: '根因精准修补', x: 350, y: 585, active: false },
    { num: '04', title: '重新验证打磨', sub: '直至彻底解决', x: 60, y: 315, active: false },
  ];

  return (
    <LuminousCanvas stepIndex={2} chapterLabel="02 · /boost · DEEP REASONING LOOP" subtitleZh="先实现一版，专门挑战找茬，揪出漏洞反复打磨">
      <div style={{ width: '100%', height: '100%', display: 'grid', gridTemplateColumns: '1.15fr 0.9fr', gap: 36, alignItems: 'center' }}>
        {/* Left: Giant Luminous Orbital Reasoning Ring (ZERO stacked bars!) */}
        <div style={{ position: 'relative', width: 920, height: 740, margin: '0 auto' }}>
          <svg width="920" height="740" viewBox="0 0 920 740" style={{ position: 'absolute', inset: 0 }}>
            <defs>
              <linearGradient id="orbitGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="rgba(255,255,255,0.22)" />
                <stop offset="45%" stopColor="#F5A623" />
                <stop offset="100%" stopColor="rgba(255,255,255,0.22)" />
              </linearGradient>
            </defs>
            {/* Outer ambient dashed halo */}
            <circle cx="460" cy="370" r="306" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="2" strokeDasharray="8 10" />
            {/* Main glowing orbital track */}
            <circle cx="460" cy="370" r="256" fill="none" stroke="url(#orbitGrad)" strokeWidth="6" />
            {/* Active quadrant highlight arc (top -> right) */}
            <path d="M 460 114 A 256 256 0 0 1 716 370" fill="none" stroke="#F5A623" strokeWidth="10" strokeLinecap="round" style={{ filter: 'drop-shadow(0 0 16px rgba(245,166,35,0.75))' }} />
          </svg>

          {/* Center Hero Anchor */}
          <div
            style={{
              position: 'absolute',
              left: 460 - 155,
              top: 370 - 110,
              width: 310,
              height: 220,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
            }}
          >
            <div style={{ fontFamily: FONTS.mono, fontSize: 96, fontWeight: 900, color: COLORS.amber, lineHeight: 0.95, textShadow: '0 0 42px rgba(245,166,35,0.45)' }}>
              /boost
            </div>
            <div style={{ fontSize: 30, fontWeight: 900, color: COLORS.white, marginTop: 12 }}>多轮深度推理</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#B4BFD4', marginTop: 4 }}>拆不开的硬骨头专用</div>
          </div>

          {/* 4 Orbital Quadrant Nodes — Supporting nodes stay at 78% crisp glass (NEVER black-dead!) */}
          {nodes.map((n) => (
            <div
              key={n.num}
              style={{
                ...crystal(n.active ? 1.0 : 0.35, 999),
                position: 'absolute',
                left: n.x,
                top: n.y,
                width: 240,
                padding: '18px 24px',
                borderRadius: 999,
                border: n.active ? '2.5px solid #F5A623' : '1.5px solid rgba(255,255,255,0.28)',
                boxShadow: n.active ? '0 0 46px rgba(245,166,35,0.48)' : '0 14px 32px rgba(0,0,0,0.4)',
                textAlign: 'center',
                transform: n.active ? 'scale(1.08)' : 'none',
              }}
            >
              <div style={{ fontFamily: FONTS.mono, fontSize: 22, fontWeight: 900, color: n.active ? COLORS.amber : '#C8D1E0' }}>
                PHASE {n.num}
              </div>
              <div style={{ fontSize: 30, fontWeight: 900, color: COLORS.white, marginTop: 2 }}>{n.title}</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: n.active ? '#FFE0A3' : '#B4BFD4', marginTop: 2 }}>{n.sub}</div>
            </div>
          ))}
        </div>

        {/* Right: 3D Tilted Native Dark Boost Official Doc + Plan Badge */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
          <div style={{ fontSize: 36, fontWeight: 900, color: COLORS.white, lineHeight: 1.25 }}>
            不靠多派人，靠<span style={{ color: COLORS.amber }}>对抗找茬</span>彻底解根因
          </div>
          <DarkOfficialFloatingWindow
            src="assets_agy/dark_boost_doc.png"
            domain="antigravity.google/docs/boost"
            tiltY={-8}
            tiltX={3}
            height={440}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: 12 }}>
              {['App', 'CLI', 'IDE'].map((p) => (
                <span key={p} style={{ ...crystal(0.3, 12), padding: '8px 18px', fontSize: 22, fontWeight: 800 }}>
                  {p}
                </span>
              ))}
            </div>
            <span style={{ backgroundColor: COLORS.amber, color: '#0E1119', padding: '10px 22px', borderRadius: 12, fontSize: 23, fontWeight: 900 }}>
              需付费计划
            </span>
          </div>
        </div>
      </div>
    </LuminousCanvas>
  );
};

/* ============================================================================
 * FRAME 3 (04_teamwork_milestones): 3D 斜向透视里程碑光轨 + 锐利菱形审查门禁（Diamond Gates）
 * ==========================================================================*/
const Sample04TeamworkMilestones: React.FC = () => {
  const milestones = [
    { num: 'M1', title: '需求访谈', sub: '问清边界目标', x: 90, y: 500, active: false },
    { num: 'M2', title: '多角色推进', sub: 'Sentinel 统筹', x: 520, y: 340, active: true },
    { num: 'M3', title: '整库交付', sub: '跨天不跑偏', x: 960, y: 175, active: false },
  ];
  const gates = [
    { name: 'Critic', role: '方案审查', x: 355, y: 425 },
    { name: 'Auditor', role: '门禁验收', x: 785, y: 260 },
  ];

  return (
    <LuminousCanvas stepIndex={3} chapterLabel="03 · /teamwork · MILESTONE GATES" subtitleZh="每过一个阶段都有 Critic 和 Auditor 审查门禁把关">
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        {/* Top-Left Giant Typographic Anchor */}
        <div style={{ position: 'absolute', top: 0, left: 0 }}>
          <div style={{ fontFamily: FONTS.mono, fontSize: 92, fontWeight: 900, color: COLORS.amber, lineHeight: 0.95 }}>/teamwork</div>
          <div style={{ fontSize: 38, fontWeight: 900, color: COLORS.white, marginTop: 10 }}>正式立项 · 里程碑阶梯推进</div>
        </div>

        {/* Diagonal Rising Light Track */}
        <svg width="1320" height="720" viewBox="0 0 1320 720" style={{ position: 'absolute', inset: 0 }}>
          <line x1="190" y1="570" x2="1080" y2="235" stroke="rgba(255,255,255,0.22)" strokeWidth="6" strokeDasharray="12 10" />
          <line x1="190" y1="570" x2="825" y2="332" stroke="#F5A623" strokeWidth="7" strokeLinecap="round" style={{ filter: 'drop-shadow(0 0 16px rgba(245,166,35,0.65))' }} />
        </svg>

        {/* 3 Elevated Milestone Pedestals along diagonal */}
        {milestones.map((m) => (
          <div
            key={m.num}
            style={{
              ...crystal(m.active ? 0.95 : 0.38, 22),
              position: 'absolute',
              left: m.x,
              top: m.y,
              width: 270,
              padding: '22px 26px',
              border: m.active ? '2.5px solid #F5A623' : '1.5px solid rgba(255,255,255,0.28)',
              boxShadow: m.active ? '0 0 48px rgba(245,166,35,0.42)' : '0 20px 44px rgba(0,0,0,0.45)',
              transform: 'perspective(1200px) rotateY(7deg) rotateX(4deg)',
            }}
          >
            <div style={{ fontFamily: FONTS.mono, fontSize: 22, fontWeight: 900, color: m.active ? COLORS.amber : '#C8D1E0' }}>
              MILESTONE {m.num}
            </div>
            <div style={{ fontSize: 34, fontWeight: 900, color: COLORS.white, marginTop: 6 }}>{m.title}</div>
            <div style={{ fontSize: 23, fontWeight: 700, color: '#C8D1E0', marginTop: 4 }}>{m.sub}</div>
          </div>
        ))}

        {/* 2 Sharp 45° Rotated Diamond Gatekeepers (Critic & Auditor!) */}
        {gates.map((g) => (
          <div
            key={g.name}
            style={{
              position: 'absolute',
              left: g.x,
              top: g.y,
              width: 148,
              height: 148,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                position: 'absolute',
                inset: 14,
                transform: 'rotate(45deg)',
                borderRadius: 16,
                backgroundColor: 'rgba(245, 166, 35, 0.18)',
                border: '2.5px solid #F5A623',
                boxShadow: '0 0 36px rgba(245,166,35,0.38)',
                backdropFilter: 'blur(12px)',
              }}
            />
            <div style={{ position: 'relative', textAlign: 'center', zIndex: 5 }}>
              <div style={{ fontFamily: FONTS.mono, fontSize: 25, fontWeight: 900, color: COLORS.amberBright }}>{g.name}</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: COLORS.white, marginTop: 2 }}>{g.role}</div>
            </div>
          </div>
        ))}

        {/* Bottom-Right 3D Tilted Native Dark Teamwork Doc */}
        <div style={{ position: 'absolute', right: 0, bottom: 10, width: 620 }}>
          <DarkOfficialFloatingWindow
            src="assets_agy/dark_teamwork_doc.png"
            domain="antigravity.google/docs/teamwork"
            tiltY={-9}
            tiltX={4}
            height={365}
          />
        </div>
      </div>
    </LuminousCanvas>
  );
};

/* ============================================================================
 * FRAME 4 (05_workflow_terminal_tree): 3D 暗黑终端代码窗 + 叠影 20 文件 + 扇形汇聚树 + 翻卡徽章
 * ==========================================================================*/
const Sample05WorkflowTerminal: React.FC = () => {
  return (
    <LuminousCanvas stepIndex={4} chapterLabel="04 · /run-workflow · SCRIPTED FAN-OUT" subtitleZh="一次改了 20 个文件，每个文件派独立 Reviewer 并汇总清单">
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        {/* Top Row: Giant Title + Flipped Python Reassurance Badge */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 22 }}>
            <span style={{ fontFamily: FONTS.mono, fontSize: 84, fontWeight: 900, color: COLORS.amber }}>/run-workflow</span>
            <span style={{ fontSize: 36, fontWeight: 900, color: COLORS.white }}>批量定制流水线</span>
          </div>
          {/* 3D Flipped Card Pill showing Python myth busted */}
          <div
            style={{
              ...crystal(0.85, 18),
              padding: '14px 26px',
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              border: '2px solid #2ECC71',
              transform: 'perspective(900px) rotateY(-8deg)',
            }}
          >
            <PythonLogo size={40} />
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#2ECC71' }}>3D 翻卡破焦虑 ✓</div>
              <div style={{ fontSize: 26, fontWeight: 900, color: COLORS.white }}>Agent 现场替你写 Python</div>
            </div>
          </div>
        </div>

        {/* Center Visual Stage: Stacked 20 Files -> 3D Dark Terminal Window -> Fan-In Report Document */}
        <div style={{ position: 'relative', flex: 1, display: 'grid', gridTemplateColumns: '0.72fr 1.45fr 0.78fr', gap: 28, alignItems: 'center' }}>
          {/* Left: 3D Stacked File Deck with Giant 20 */}
          <div style={{ position: 'relative', height: 390, display: 'flex', alignItems: 'center', justifyContent: 'center', perspective: 1200 }}>
            {[2, 1, 0].map((layer) => (
              <div
                key={layer}
                style={{
                  ...crystal(layer === 0 ? 0.85 : 0.28, 22),
                  position: 'absolute',
                  width: 310,
                  height: 350,
                  transform: `translate(${layer * 18 - 18}px, ${layer * -16 + 16}px) rotateY(12deg) rotateZ(${layer * 3 - 3}deg)`,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: layer === 0 ? '2.5px solid #F5A623' : '1.5px solid rgba(255,255,255,0.24)',
                }}
              >
                {layer === 0 && (
                  <>
                    <div style={{ fontFamily: FONTS.display, fontSize: 136, fontWeight: 900, color: COLORS.amber, lineHeight: 0.9 }}>20</div>
                    <div style={{ fontSize: 32, fontWeight: 900, color: COLORS.white, marginTop: 10 }}>个改动文件</div>
                    <div style={{ fontFamily: FONTS.mono, fontSize: 22, color: '#B4BFD4', marginTop: 6 }}>git diff --name-only</div>
                  </>
                )}
              </div>
            ))}
          </div>

          {/* Center: 3D Perspective macOS Dark Code Terminal Window */}
          <div style={{ perspective: 1400 }}>
            <div
              style={{
                borderRadius: 22,
                overflow: 'hidden',
                backgroundColor: 'rgba(15, 18, 28, 0.92)',
                border: '2px solid rgba(245, 166, 35, 0.55)',
                boxShadow: '0 30px 70px rgba(0,0,0,0.6), 0 0 42px rgba(245,166,35,0.16)',
                transform: 'rotateX(4deg)',
              }}
            >
              <div style={{ height: 46, padding: '0 20px', backgroundColor: 'rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', gap: 9 }}>
                  <span style={{ width: 13, height: 13, borderRadius: '50%', backgroundColor: '#FF5F56' }} />
                  <span style={{ width: 13, height: 13, borderRadius: '50%', backgroundColor: '#FFBD2E' }} />
                  <span style={{ width: 13, height: 13, borderRadius: '50%', backgroundColor: '#27C93F' }} />
                </div>
                <span style={{ fontFamily: FONTS.mono, fontSize: 20, fontWeight: 800, color: '#C8D1E0' }}>workflow_audit.py · AUTO-GENERATED</span>
                <PythonLogo size={22} />
              </div>
              <div style={{ padding: '28px 34px', fontFamily: FONTS.mono, fontSize: 28, lineHeight: 1.68, color: '#E2E8F4' }}>
                <div><span style={{ color: '#94A3B8' }}>01  </span><span style={{ color: '#F5A623', fontWeight: 900 }}>files</span> = git_changed_files()</div>
                <div><span style={{ color: '#94A3B8' }}>02  </span><span style={{ color: '#F5A623', fontWeight: 900 }}>reviews</span> = parallel([</div>
                <div><span style={{ color: '#94A3B8' }}>03  </span>    agent(<span style={{ color: '#2ECC71' }}>"安全/空指针审查"</span>, f)</div>
                <div><span style={{ color: '#94A3B8' }}>04  </span>    <span style={{ color: '#F5A623' }}>for</span> f <span style={{ color: '#F5A623' }}>in</span> files</div>
                <div><span style={{ color: '#94A3B8' }}>05  </span>])</div>
                <div><span style={{ color: '#94A3B8' }}>06  </span><span style={{ color: '#2ECC71', fontWeight: 900 }}>export_grouped_report</span>(reviews)</div>
              </div>
            </div>
          </div>

          {/* Right: Folded-Corner Document Icon (Aggregated Report) */}
          <div style={{ position: 'relative', height: 390, display: 'flex', alignItems: 'center', justifyContent: 'center', perspective: 1200 }}>
            <div
              style={{
                ...crystal(0.9, 22),
                width: 340,
                height: 360,
                padding: '32px 28px',
                border: '2.5px solid #2ECC71',
                boxShadow: '0 0 46px rgba(46,204,113,0.28)',
                transform: 'rotateY(-12deg)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ fontFamily: FONTS.mono, fontSize: 22, fontWeight: 900, color: '#2ECC71' }}>AGGREGATED REPORT</div>
              <div>
                <div style={{ fontSize: 38, fontWeight: 900, color: COLORS.white, lineHeight: 1.2 }}>按文件分组<br />安全问题清单</div>
                <div style={{ fontSize: 23, fontWeight: 700, color: '#C8D1E0', marginTop: 12 }}>20 / 20 审查聚合完成 ✓</div>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <span style={{ padding: '6px 14px', borderRadius: 8, backgroundColor: 'rgba(245,166,35,0.2)', color: COLORS.amber, fontSize: 20, fontWeight: 900 }}>循环</span>
                <span style={{ padding: '6px 14px', borderRadius: 8, backgroundColor: 'rgba(245,166,35,0.2)', color: COLORS.amber, fontSize: 20, fontWeight: 900 }}>并行</span>
                <span style={{ padding: '6px 14px', borderRadius: 8, backgroundColor: 'rgba(46,204,113,0.2)', color: '#2ECC71', fontSize: 20, fontWeight: 900 }}>聚合</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </LuminousCanvas>
  );
};

/* ============================================================================
 * FRAME 5 (06_goal_prompt_gauge): 全屏聚光命令行抄作业卡 + 巨幅圆形挂机仪表盘
 * ==========================================================================*/
const Sample06GoalPromptGauge: React.FC = () => {
  const circ = 2 * Math.PI * 192;
  return (
    <LuminousCanvas stepIndex={5} chapterLabel="05 · /goal · VERIFIABLE AUTONOMOUS MODE" subtitleZh="修复项目里所有 npm test 失败的用例，保证 npm run build 零报错">
      <div style={{ width: '100%', height: '100%', display: 'grid', gridTemplateColumns: '1.22fr 0.82fr', gap: 44, alignItems: 'center' }}>
        {/* Left: Antigravity Spotlight Command Input Box (Copy-Ready Prompt w/ Screenshot Hold!) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 26 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 20 }}>
            <span style={{ fontFamily: FONTS.mono, fontSize: 94, fontWeight: 900, color: COLORS.amber, lineHeight: 0.95 }}>/goal</span>
            <span style={{ fontSize: 38, fontWeight: 900, color: COLORS.white }}>终点必须机器可自动验证</span>
          </div>

          {/* Struck-through Anti-pattern (compact, translucent red) */}
          <div style={{ padding: '16px 26px', borderRadius: 16, backgroundColor: 'rgba(229, 72, 77, 0.14)', border: '1.5px solid rgba(229, 72, 77, 0.55)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 28, fontWeight: 800, color: '#FCA5A5', textDecoration: 'line-through' }}>
              ✕ /goal 把这个项目优化得更好看
            </span>
            <span style={{ fontSize: 22, fontWeight: 800, color: '#E5484D' }}>无机器标准 · 无法结束</span>
          </div>

          {/* Hero Spotlight Command Console (Copy-Ready Prompt) */}
          <div
            style={{
              ...crystal(0.95, 24),
              padding: '32px 36px',
              border: '2.5px solid #F5A623',
              boxShadow: '0 0 58px rgba(245,166,35,0.28), 0 24px 60px rgba(0,0,0,0.55)',
              transform: 'perspective(1400px) rotateY(4deg)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <span style={{ backgroundColor: COLORS.amber, color: '#0E1119', padding: '6px 18px', borderRadius: 10, fontSize: 22, fontWeight: 900 }}>
                直接抄作业 · 截屏保存
              </span>
              <span style={{ fontFamily: FONTS.mono, fontSize: 22, color: '#2ECC71', fontWeight: 900 }}>● VERIFIABLE</span>
            </div>
            <div style={{ fontSize: 38, fontWeight: 900, color: COLORS.white, lineHeight: 1.48 }}>
              <span style={{ fontFamily: FONTS.mono, color: COLORS.amber }}>/goal </span>
              修复项目里所有 <span style={{ fontFamily: FONTS.mono, color: COLORS.amberBright }}>npm test</span> 失败的用例，并且保证 <span style={{ fontFamily: FONTS.mono, color: '#2ECC71' }}>npm run build</span> 零报错通过。
            </div>
            {/* Live CLI verification strip */}
            <div style={{ marginTop: 22, paddingTop: 18, borderTop: '1px solid rgba(255,255,255,0.14)', display: 'flex', gap: 18 }}>
              <span style={{ fontFamily: FONTS.mono, fontSize: 23, fontWeight: 900, color: '#2ECC71', backgroundColor: 'rgba(46,204,113,0.16)', padding: '8px 18px', borderRadius: 10 }}>
                $ npm test → PASS ✓
              </span>
              <span style={{ fontFamily: FONTS.mono, fontSize: 23, fontWeight: 900, color: '#2ECC71', backgroundColor: 'rgba(46,204,113,0.16)', padding: '8px 18px', borderRadius: 10 }}>
                $ npm run build → 0 ERRORS ✓
              </span>
            </div>
          </div>
        </div>

        {/* Right: Giant Circular Overnight Autonomy Gauge (NOT a rectangle!) */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22 }}>
          <div style={{ position: 'relative', width: 450, height: 450, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="450" height="450" viewBox="0 0 450 450" style={{ transform: 'rotate(-90deg)' }}>
              <circle cx="225" cy="225" r="214" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="2" strokeDasharray="6 10" />
              <circle cx="225" cy="225" r="192" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="22" />
              <circle
                cx="225"
                cy="225"
                r="192"
                fill="none"
                stroke="#F5A623"
                strokeWidth="22"
                strokeLinecap="round"
                strokeDasharray={circ}
                strokeDashoffset={circ * 0.06}
                style={{ filter: 'drop-shadow(0 0 22px rgba(245,166,35,0.65))' }}
              />
            </svg>
            <div style={{ position: 'absolute', textAlign: 'center' }}>
              <div style={{ fontFamily: FONTS.mono, fontSize: 22, fontWeight: 800, color: '#B4BFD4', letterSpacing: 2, marginBottom: 12 }}>OVERNIGHT RUN</div>
              <div style={{ fontFamily: FONTS.display, fontSize: 124, fontWeight: 900, color: COLORS.amber, lineHeight: 0.94 }}>100%</div>
              <div style={{ fontSize: 28, fontWeight: 900, color: '#2ECC71', marginTop: 10 }}>不达标不早停 ✓</div>
            </div>
          </div>
          <div style={{ fontSize: 26, fontWeight: 800, color: '#C8D1E0' }}>App · CLI · IDE 扩展 全平台支持</div>
        </div>
      </div>
    </LuminousCanvas>
  );
};

/* ============================================================================
 * FRAME 6 (07_outro_bento): 2+3 错落 Bento 玻璃决策矩阵（彻底告别 5 条横条，一屏截屏保存！）
 * ==========================================================================*/
const Sample07OutroBento: React.FC = () => {
  const top2 = [
    { num: '01', pain: '活多能拆', cmd: '/swarm', detail: '多 Agent 并行拆活 · @verifier 验收', plan: '免费可用', free: true },
    { num: '02', pain: '活难啃不动', cmd: '/boost', detail: '多轮深度推理找茬 · 攻克硬骨头', plan: '付费计划', free: false },
  ];
  const bot3 = [
    { num: '03', pain: '跨天大工程', cmd: '/teamwork', detail: '需求访谈 · 里程碑门禁', plan: '付费计划', free: false },
    { num: '04', pain: '批量定制流水线', cmd: '/run-workflow', detail: 'Agent 自动写 Python 编排', plan: '免费可用', free: true },
    { num: '05', pain: '目标明确想挂机', cmd: '/goal', detail: '机器可验证 · 过夜死磕', plan: '全端支持', free: true },
  ];

  return (
    <LuminousCanvas stepIndex={5} chapterLabel="CHEATSHEET · 3-SECOND SELECTION" subtitleZh="最后留一张 3 秒选型口诀，建议直接截图保存">
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 26 }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            <AntigravityLogo size={54} />
            <span style={{ fontSize: 56, fontWeight: 900, color: COLORS.white }}>Antigravity 3 秒选型口诀</span>
          </div>
          <span style={{ backgroundColor: COLORS.amber, color: '#0E1119', padding: '12px 28px', borderRadius: 14, fontSize: 28, fontWeight: 900, boxShadow: '0 0 32px rgba(245,166,35,0.4)' }}>
            建议直接截图保存
          </span>
        </div>

        {/* Top Row: 2 Wide Hero Bento Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 26, flex: 1.05 }}>
          {top2.map((c) => (
            <div
              key={c.cmd}
              style={{
                ...crystal(c.num === '01' ? 0.9 : 0.5, 26),
                padding: '32px 38px',
                border: c.num === '01' ? '2.5px solid #F5A623' : '1.5px solid rgba(255,255,255,0.24)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 42, fontWeight: 900, color: COLORS.white }}>{c.pain}</span>
                <span style={{ padding: '7px 18px', borderRadius: 10, backgroundColor: c.free ? 'rgba(46,204,113,0.2)' : 'rgba(245,166,35,0.2)', border: `1.5px solid ${c.free ? '#2ECC71' : COLORS.amber}`, color: c.free ? '#2ECC71' : COLORS.amber, fontSize: 22, fontWeight: 900 }}>
                  {c.plan}
                </span>
              </div>
              <div style={{ fontFamily: FONTS.mono, fontSize: 74, fontWeight: 900, color: COLORS.amber, lineHeight: 1 }}>{c.cmd}</div>
              <div style={{ fontSize: 26, fontWeight: 700, color: '#C8D1E0' }}>{c.detail}</div>
            </div>
          ))}
        </div>

        {/* Bottom Row: 3 Balanced Bento Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 26, flex: 1 }}>
          {bot3.map((c) => (
            <div
              key={c.cmd}
              style={{
                ...crystal(0.42, 24),
                padding: '28px 30px',
                border: '1.5px solid rgba(255,255,255,0.24)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 32, fontWeight: 900, color: COLORS.white }}>{c.pain}</span>
                <span style={{ padding: '5px 14px', borderRadius: 9, backgroundColor: c.free ? 'rgba(46,204,113,0.18)' : 'rgba(245,166,35,0.18)', border: `1px solid ${c.free ? '#2ECC71' : COLORS.amber}`, color: c.free ? '#2ECC71' : COLORS.amber, fontSize: 20, fontWeight: 900, flexShrink: 0 }}>
                  {c.plan}
                </span>
              </div>
              <div style={{ fontFamily: FONTS.mono, fontSize: c.cmd.length > 10 ? 46 : 58, fontWeight: 900, color: COLORS.amber, lineHeight: 1.05 }}>{c.cmd}</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#C8D1E0' }}>{c.detail}</div>
            </div>
          ))}
        </div>
      </div>
    </LuminousCanvas>
  );
};

export const AgyV2Showcase: React.FC = () => {
  const frame = useCurrentFrame();
  if (frame === 0) return <Sample01IntroLayers />;
  if (frame === 1) return <Sample02SwarmTopology />;
  if (frame === 2) return <Sample03BoostOrbital />;
  if (frame === 3) return <Sample04TeamworkMilestones />;
  if (frame === 4) return <Sample05WorkflowTerminal />;
  if (frame === 5) return <Sample06GoalPromptGauge />;
  return <Sample07OutroBento />;
};
