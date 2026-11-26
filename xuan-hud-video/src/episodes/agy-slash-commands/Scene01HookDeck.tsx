import React from 'react';
import { spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { AntigravityLogo } from '../../design/BrandLogos';
import { COLORS, FONTS, FPS, WEIGHTS } from '../../design/tokens';
import {
  CameraRig,
  clamp01,
  CRISP_SPRING,
  easeInOutCubic,
  mixRgb,
  PhysicalGlass3D,
  SfxGroup,
  smoothFocusWeight,
  steppedGlide,
} from '../../engine';

export const SCENE01_START_SEC = 0;
export const SCENE01_END_SEC = 13.28;
export const SCENE01_FRAMES = Math.round((SCENE01_END_SEC - SCENE01_START_SEC) * FPS); // 398f

const f = (sec: number) => Math.round(sec * FPS);

const COMMAND_DECK = [
  { cmd: '/swarm', pain: '活多能拆', tag: '01 · 并行蜂群', row: 0 },
  { cmd: '/boost', pain: '硬骨头难啃', tag: '02 · 深度推理', row: 0 },
  { cmd: '/teamwork', pain: '跨天大工程', tag: '03 · 阶段门禁', row: 1 },
  { cmd: '/run-workflow', pain: '批量流水线', tag: '04 · 脚本扇出', row: 1 },
  { cmd: '/goal', pain: '挂机死磕到底', tag: '05 · 自动闭环', row: 1 },
] as const;

/**
 * Scene 01（00:00.0 – 00:13.28, 398f）：
 * - Micro-beat A (0.0–4.4s) ：「居中巨物开场 → 丝滑推顶归位」（消除开场下半屏空洞，2.4s 琥珀导光唤醒“真正魅力”）
 * - Micro-beat B (4.5–10.2s)：2+3 立体 Bento 阶梯卡组按“底层先落、顶层后落”重力级联入场，磁吸焦点丝滑掠过 5 种卡点
 * - Micro-beat C (10.3–13.28s)：口播念“第一个立刻上手的 /swarm”，其余 4 卡向景深退隐，摄像机平滑俯冲推进 /swarm 完成几何无缝接力转场！
 */
export const Scene01HookDeck: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const heroEnter = spring({ frame: Math.max(0, frame - 2), fps, config: CRISP_SPRING });
  const charmGlow = clamp01(easeInOutCubic((frame - f(2.45)) / 14));
  // 4.45s 起标题平滑上推归位，给 5 张 2.5D 厚玻璃砖让出黄金主舞台
  const dockT = clamp01(easeInOutCubic((frame - f(4.45)) / 18));

  // 磁吸焦点连续滑移（6.5s ~ 10.7s 掠过 5 张卡并最终锁死在 index=0 `/swarm`）
  const focusPos = steppedGlide(frame, [
    { at: f(5.4), dur: 1, target: 0 },
    { at: f(6.6), dur: 12, target: 1 },
    { at: f(7.4), dur: 12, target: 2 },
    { at: f(8.2), dur: 12, target: 3 },
    { at: f(9.0), dur: 12, target: 4 },
    { at: f(10.3), dur: 14, target: 0 },
  ]);

  // 10.75s 聚焦锁定 /swarm，12.55s 摄像机俯冲切入下一幕（Shape-Match Dive）
  const lockSwarm = clamp01(easeInOutCubic((frame - f(10.75)) / 14));
  const diveOut = clamp01(easeInOutCubic((frame - f(12.55)) / 20));

  // 重力顺序：底层 row=1 先落（f=138,143,148），顶层 row=0 后落（f=154,159）
  const dropFrame = (idx: number) => (idx >= 2 ? f(4.6) + (idx - 2) * 5 : f(5.15) + idx * 5);

  const sfxEvents = [
    { kind: 'drop' as const, at: 3 }, { kind: 'flow' as const, at: f(2.45) }, { kind: 'whoosh' as const, at: f(4.45) },
    { kind: 'deal' as const, at: f(4.6) }, { kind: 'deal' as const, at: f(4.77) }, { kind: 'deal' as const, at: f(4.95) },
    { kind: 'drop' as const, at: f(5.15) }, { kind: 'drop' as const, at: f(5.32) }, { kind: 'pop' as const, at: f(6.6) },
    { kind: 'pop' as const, at: f(8.2) }, { kind: 'pop' as const, at: f(10.75) }, { kind: 'whoosh' as const, at: f(12.55) },
  ];

  return (
    <CameraRig
      keyframes={[
        { at: 0, dur: 1, scale: 1, x: 0, y: 0, rotateX: 0 },
        { at: f(4.5), dur: 20, scale: 1, x: 0, y: 0, rotateX: 3 },
        { at: f(10.75), dur: 18, scale: 1.12, x: 210, y: 55, rotateX: 4, rotateY: 3 },
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
        {/* Opening Hero Center Slab (0–4.45s): 居中饱满 2.5D 大主牌，4.45s 丝滑折叠让位 */}
        {dockT < 0.98 && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: heroEnter * (1 - dockT),
              transform: `translate3d(0, ${((1 - heroEnter) * 36 - dockT * 180).toFixed(1)}px, 0) scale(${(0.94 + heroEnter * 0.06 - dockT * 0.14).toFixed(4)}) rotateX(5deg)`,
              pointerEvents: 'none',
              zIndex: 8,
            }}
          >
            <PhysicalGlass3D active={0.35 + charmGlow * 0.65} accentRgb={[245, 166, 35]} radius={30} slabPx={18} extrudeX={0} padding="64px 86px 70px">
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 28 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
                  <AntigravityLogo size={48} />
                  <span style={{ fontFamily: FONTS.mono, fontSize: 26, color: '#B8C6DC', letterSpacing: 3 }}>
                    ANTIGRAVITY · POWER WORKFLOWS
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 26 }}>
                  <span style={{ fontSize: 82, fontWeight: WEIGHTS.light, color: COLORS.white, letterSpacing: 3 }}>5 条神级</span>
                  <span style={{ fontFamily: FONTS.mono, fontSize: 108, fontWeight: WEIGHTS.regular, color: mixRgb([240, 244, 252], [245, 166, 35], 0.4 + charmGlow * 0.6) }}>
                    /指令
                  </span>
                </div>
                <div style={{ fontSize: 32, fontWeight: WEIGHTS.light, color: mixRgb([156, 172, 198], [255, 226, 168], charmGlow), letterSpacing: 3 }}>
                  按真实工作卡点拆解 · 看完直接上手
                </div>
              </div>
            </PhysicalGlass3D>
          </div>
        )}

        {/* 归位后的顶部标题栏（4.45s 承接亮相） */}
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

        {/* 2 + 3 错落 2.5D 厚玻璃卡阵（底层先落、顶层后落） */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 34, opacity: dockT }}>
          {[0, 1].map((rowIdx) => {
            const items = COMMAND_DECK.map((it, idx) => ({ ...it, idx })).filter((it) => it.row === rowIdx);
            return (
              <div
                key={rowIdx}
                style={{
                  display: 'grid',
                  gridTemplateColumns: rowIdx === 0 ? '1fr 1fr' : 'repeat(3, 1fr)',
                  gap: 34,
                  perspective: 1500,
                }}
              >
                {items.map((item) => {
                  const p = spring({ frame: Math.max(0, frame - dropFrame(item.idx)), fps, config: CRISP_SPRING });
                  const w = smoothFocusWeight(item.idx, focusPos, 0.9);
                  const isSwarm = item.idx === 0;
                  const fadeOthers = isSwarm ? 1 : 1 - lockSwarm * 0.72;
                  const active = clamp01(isSwarm ? Math.max(w, lockSwarm) : w * (1 - lockSwarm));
                  const liftY = (1 - p) * -46 - active * 10;
                  const extrudeX = rowIdx === 0 ? (item.idx === 0 ? -6 : 6) : (item.idx - 3) * 5;

                  return (
                    <div
                      key={item.cmd}
                      style={{
                        opacity: p * fadeOthers,
                        transform: `translate3d(0, ${liftY.toFixed(1)}px, 0) scale(${(0.94 + p * 0.06 + (isSwarm ? lockSwarm * 0.06 : 0)).toFixed(4)}) rotateX(4deg)`,
                      }}
                    >
                      <PhysicalGlass3D
                        active={active}
                        accentRgb={[245, 166, 35]}
                        radius={26}
                        slabPx={15}
                        extrudeX={extrudeX}
                        padding={rowIdx === 0 ? '36px 42px 42px' : '32px 34px 38px'}
                        sheenSpeed={0.5}
                      >
                        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 22 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span
                              style={{
                                fontFamily: FONTS.mono,
                                fontSize: 24,
                                fontWeight: WEIGHTS.regular,
                                letterSpacing: 1.6,
                                color: mixRgb([152, 168, 194], [245, 166, 35], 0.25 + active * 0.75),
                              }}
                            >
                              {item.tag}
                            </span>
                            <span
                              style={{
                                width: 12,
                                height: 12,
                                borderRadius: '50%',
                                backgroundColor: mixRgb([88, 102, 128], [245, 166, 35], active),
                                boxShadow: `0 0 ${(18 * active).toFixed(0)}px rgba(245,166,35,${(0.7 * active).toFixed(2)})`,
                              }}
                            />
                          </div>

                          <div
                            style={{
                              fontFamily: FONTS.mono,
                              fontSize: rowIdx === 0 ? 60 : 46,
                              fontWeight: WEIGHTS.regular,
                              color: mixRgb([236, 242, 250], [255, 196, 86], active),
                              lineHeight: 1.05,
                            }}
                          >
                            {item.cmd}
                          </div>

                          <div
                            style={{
                              fontSize: rowIdx === 0 ? 32 : 28,
                              fontWeight: WEIGHTS.light,
                              color: mixRgb([176, 190, 212], [255, 255, 255], active),
                              letterSpacing: 1.5,
                            }}
                          >
                            {item.pain}
                          </div>
                        </div>
                      </PhysicalGlass3D>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </CameraRig>
  );
};
