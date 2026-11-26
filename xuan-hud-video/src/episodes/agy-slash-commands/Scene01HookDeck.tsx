import React from 'react';
import { spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { AntigravityLogo } from '../../design/BrandLogos';
import { COLORS, FONTS, FPS, WEIGHTS } from '../../design/tokens';
import {
  BentoDeck2Plus3,
  CameraRig,
  clamp01,
  CRISP_SPRING,
  easeInOutCubic,
  mixRgb,
  PhysicalGlass3D,
  SfxGroup,
  steppedGlide,
} from '../../engine';

export const SCENE01_START_SEC = 0;
export const SCENE01_END_SEC = 13.28;
export const SCENE01_FRAMES = Math.round((SCENE01_END_SEC - SCENE01_START_SEC) * FPS); // 398f

const f = (sec: number) => Math.round(sec * FPS);

/**
 * Scene 01（00:00.0 – 00:13.28, 398f）：
 * - Beat 0A (1f → 14f)：声学重音逐词演绎「玩转」→「Antigravity」中心大字亮相
 * - Beat 0B (39f → 134f)：「玩转 Antigravity」丝滑上收为眉标，顺势展开「5 条神级 /指令」2.5D 厚主牌（75f 琥珀导光点亮）
 * - Beat 1  (4.45s → 10.2s)：主牌折叠推顶，`<BentoDeck2Plus3>` 按底层先落、顶层后落入场，焦点单向扫过 0→4
 * - Beat 2  (10.23s“那第一个呢”)：零倒跑抖动！/goal 原地平顺熄灭，/swarm 直接独立点亮并衔接摄像机推进转场
 */
export const Scene01HookDeck: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const playIn = spring({ frame: Math.max(0, frame - 1), fps, config: CRISP_SPRING });
  const brandIn = spring({ frame: Math.max(0, frame - 14), fps, config: CRISP_SPRING });
  const cardMorph = clamp01(easeInOutCubic((frame - 39) / 16));
  const cardSpring = spring({ frame: Math.max(0, frame - 40), fps, config: CRISP_SPRING });
  const charmGlow = clamp01(easeInOutCubic((frame - 75) / 15));
  const dockT = clamp01(easeInOutCubic((frame - f(4.45)) / 18));

  const scanPos = steppedGlide(frame, [
    { at: f(5.4), dur: 1, target: 0 },
    { at: f(6.6), dur: 12, target: 1 },
    { at: f(7.35), dur: 12, target: 2 },
    { at: f(8.1), dur: 12, target: 3 },
    { at: f(8.85), dur: 12, target: 4 },
  ]);
  const scanAlive = 1 - clamp01(easeInOutCubic((frame - f(10.23)) / 10));
  const lockSwarm = clamp01(easeInOutCubic((frame - f(10.28)) / 12));
  const diveOut = clamp01(easeInOutCubic((frame - f(12.55)) / 20));

  const sfxEvents = [
    { kind: 'pop' as const, at: 2 }, { kind: 'drop' as const, at: 14 }, { kind: 'deal' as const, at: 40 },
    { kind: 'flow' as const, at: 75 }, { kind: 'whoosh' as const, at: f(4.45) },
    { kind: 'deal' as const, at: f(4.6) }, { kind: 'deal' as const, at: f(4.77) }, { kind: 'deal' as const, at: f(4.95) },
    { kind: 'drop' as const, at: f(5.15) }, { kind: 'drop' as const, at: f(5.32) },
    { kind: 'pop' as const, at: f(6.6) }, { kind: 'pop' as const, at: f(8.1) },
    { kind: 'pop' as const, at: f(10.28) }, { kind: 'whoosh' as const, at: f(12.55) },
  ];

  return (
    <CameraRig
      keyframes={[
        { at: 0, dur: 1, scale: 1, x: 0, y: 0, rotateX: 0 },
        { at: f(4.5), dur: 20, scale: 1, x: 0, y: 0, rotateX: 3 },
        { at: f(10.65), dur: 18, scale: 1.12, x: 210, y: 55, rotateX: 4, rotateY: 3 },
        { at: f(12.55), dur: 20, scale: 1.62, x: 360, y: 110, rotateX: 2, rotateY: 0 },
      ]}
    >
      <SfxGroup events={sfxEvents} />
      <div
        style={{
          width: '100%',
          maxWidth: 1580,
          height: '100%',
          margin: '0 auto',
          padding: '38px 0 32px',
          boxSizing: 'border-box',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          opacity: 1 - diveOut * 0.85,
        }}
      >
        {dockT < 0.98 && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: 1 - dockT,
              transform: `translate3d(0, ${(-dockT * 170).toFixed(1)}px, 0) scale(${(1 - dockT * 0.14).toFixed(4)})`,
              pointerEvents: 'none',
              zIndex: 8,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transform: `translate3d(0, ${(135 * (1 - cardMorph) - 24 * cardMorph).toFixed(1)}px, 0) scale(${(1 - cardMorph * 0.48).toFixed(4)})`,
                transformOrigin: 'center center',
              }}
            >
              <span
                style={{
                  fontSize: 96,
                  fontWeight: WEIGHTS.light,
                  color: mixRgb([255, 255, 255], [245, 166, 35], 0.18 + (1 - cardMorph) * 0.42),
                  letterSpacing: 8,
                  opacity: playIn,
                  transform: `translate3d(0, ${((1 - playIn) * 26).toFixed(1)}px, 0) scale(${(0.88 + playIn * 0.12).toFixed(4)})`,
                  display: 'inline-block',
                  whiteSpace: 'nowrap',
                }}
              >
                玩转
              </span>

              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 22,
                  maxWidth: `${(brandIn * 680).toFixed(1)}px`,
                  marginLeft: `${(brandIn * 30).toFixed(1)}px`,
                  overflow: 'hidden',
                  opacity: brandIn,
                  transform: `translate3d(${((1 - brandIn) * 24).toFixed(1)}px, 0, 0) scale(${(0.92 + brandIn * 0.08).toFixed(4)})`,
                  whiteSpace: 'nowrap',
                }}
              >
                <AntigravityLogo size={88} />
                <span style={{ fontFamily: FONTS.display, fontSize: 102, fontWeight: WEIGHTS.light, color: COLORS.white, letterSpacing: 1.5 }}>
                  Antigravity
                </span>
              </div>
            </div>

            <div
              style={{
                opacity: cardMorph,
                transform: `perspective(1500px) translate3d(0, ${((1 - cardSpring) * 42).toFixed(1)}px, 0) scale(${(0.9 + cardSpring * 0.1).toFixed(4)}) rotateX(5deg)`,
              }}
            >
              <PhysicalGlass3D active={0.35 + charmGlow * 0.65} accentRgb={[245, 166, 35]} radius={30} slabPx={18} extrudeX={0} padding="52px 86px 58px">
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 26 }}>
                    <span style={{ fontSize: 80, fontWeight: WEIGHTS.light, color: COLORS.white, letterSpacing: 3 }}>5 条神级</span>
                    <span style={{ fontFamily: FONTS.mono, fontSize: 106, fontWeight: WEIGHTS.regular, color: mixRgb([240, 244, 252], [245, 166, 35], 0.4 + charmGlow * 0.6) }}>
                      /指令
                    </span>
                  </div>
                  <div style={{ fontSize: 32, fontWeight: WEIGHTS.light, color: mixRgb([152, 168, 194], [255, 226, 168], charmGlow), letterSpacing: 3, opacity: 0.35 + charmGlow * 0.65 }}>
                    真正体会核心魅力 · 看完直接上手
                  </div>
                </div>
              </PhysicalGlass3D>
            </div>
          </div>
        )}

        <div
          style={{
            transform: `translate3d(0, ${((1 - dockT) * 28).toFixed(1)}px, 0)`,
            opacity: dockT * (1 - lockSwarm * 0.35),
            display: 'flex',
            alignItems: 'center',
            gap: 24,
            zIndex: 5,
          }}
        >
          <AntigravityLogo size={54} />
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 20 }}>
            <span style={{ fontSize: 54, fontWeight: WEIGHTS.light, color: COLORS.white, letterSpacing: 2 }}>5 条神级</span>
            <span style={{ fontFamily: FONTS.mono, fontSize: 66, fontWeight: WEIGHTS.regular, color: COLORS.amber }}>/指令</span>
            <span style={{ fontSize: 30, fontWeight: WEIGHTS.light, color: '#9BAAC2', letterSpacing: 2, marginLeft: 8 }}>对应 5 种真实卡点</span>
          </div>
        </div>

        <BentoDeck2Plus3
          enterBaseFrame={f(4.6)}
          visibility={dockT}
          scanPos={scanPos}
          scanAlive={scanAlive}
          lockedIndex={frame >= f(10.25) ? 0 : undefined}
          lockStrength={lockSwarm}
          items={[
            { code: '/swarm', subtitle: '活多能拆', tag: '01 · 并行蜂群' },
            { code: '/boost', subtitle: '硬骨头难啃', tag: '02 · 深度推理' },
            { code: '/teamwork', subtitle: '跨天大工程', tag: '03 · 阶段门禁' },
            { code: '/run-workflow', subtitle: '批量流水线', tag: '04 · 脚本扇出' },
            { code: '/goal', subtitle: '挂机死磕到底', tag: '05 · 自动闭环' },
          ]}
        />
      </div>
    </CameraRig>
  );
};
