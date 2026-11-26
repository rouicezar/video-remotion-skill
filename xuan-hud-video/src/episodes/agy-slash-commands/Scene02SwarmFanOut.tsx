import React from 'react';
import { spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { COLORS, FONTS, FPS, WEIGHTS } from '../../design/tokens';
import { CameraRig, clamp01, CRISP_SPRING, easeInOutCubic, easeOutExpo, mixRgb, SfxGroup, SplitFanOut } from '../../engine';

export const SCENE02_START_SEC = 13.28;
export const SCENE02_END_SEC = 23.45;
export const SCENE02_FRAMES = Math.round((SCENE02_END_SEC - SCENE02_START_SEC) * FPS); // 305f

const rel = (absSec: number) => Math.round((absSec - SCENE02_START_SEC) * FPS);

/**
 * Scene 02（00:13.28 – 00:23.45, 305f）：
 * 承接 Scene 01 推进动势 → 两段式金句点亮 → 引擎库 `<SplitFanOut>` 1 拆 3 贝塞尔流光扇出 + 镜头摇移跟随
 */
export const Scene02SwarmFanOut: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const morphIn = easeOutExpo(frame / 14);
  const clause1P = spring({ frame: Math.max(0, frame - rel(14.35)), fps, config: CRISP_SPRING });
  const clause2P = spring({ frame: Math.max(0, frame - rel(16.0)), fps, config: CRISP_SPRING });
  const whipOut = clamp01(easeInOutCubic((frame - (SCENE02_FRAMES - 14)) / 14));

  const sfxEvents = [
    { kind: 'pop' as const, at: rel(14.35) },
    { kind: 'pop' as const, at: rel(16.0) },
    { kind: 'flow' as const, at: rel(17.35) },
    { kind: 'deal' as const, at: rel(17.55) },
    { kind: 'flow' as const, at: rel(19.25) },
    { kind: 'deal' as const, at: rel(19.45) },
    { kind: 'flow' as const, at: rel(21.25) },
    { kind: 'deal' as const, at: rel(21.45) },
    { kind: 'whoosh' as const, at: SCENE02_FRAMES - 14 },
  ];

  return (
    <div
      style={{
        width: '100%',
        maxWidth: 1560,
        height: '100%',
        margin: '0 auto',
        padding: '28px 0 24px',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        opacity: morphIn * (1 - whipOut * 0.7),
        transform: `scale(${(0.94 + morphIn * 0.06).toFixed(4)})`,
      }}
    >
      <SfxGroup events={sfxEvents} />

      {/* Plane 2 中景标题层稳驻上方黄金位，不随下方拓扑镜头平移撞顶栏 */}
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', zIndex: 6 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 24 }}>
          <span style={{ fontFamily: FONTS.mono, fontSize: 64, fontWeight: WEIGHTS.regular, color: COLORS.amber }}>/swarm</span>
          <div style={{ fontSize: 50, fontWeight: WEIGHTS.light, letterSpacing: 2 }}>
            <span style={{ color: COLORS.white, opacity: 0.25 + clause1P * 0.75, display: 'inline-block', transform: `translate3d(0, ${((1 - clause1P) * 16).toFixed(1)}px, 0)` }}>
              任务面很广 ·{' '}
            </span>
            <span
              style={{
                color: mixRgb([126, 138, 160], [245, 166, 35], clause2P),
                opacity: 0.32 + clause2P * 0.68,
                textShadow: `0 0 ${(34 * clause2P).toFixed(0)}px rgba(245,166,35,${(0.45 * clause2P).toFixed(2)})`,
                display: 'inline-block',
                transform: `scale(${(0.96 + clause2P * 0.04).toFixed(4)})`,
              }}
            >
              且能独立拆开
            </span>
          </div>
        </div>
        <span style={{ fontFamily: FONTS.mono, fontSize: 25, fontWeight: WEIGHTS.light, color: '#94A4BC', letterSpacing: 2 }}>
          1 → N PARALLEL SPLIT
        </span>
      </div>

      {/* Plane 3 前景拓扑层：独立挂载 CameraRig 平滑推近摇移跟随焦点 */}
      <div style={{ width: 1560, height: 740 }}>
        <CameraRig
          keyframes={[
            { at: 0, dur: 14, scale: 1, x: 0, y: 0, rotateY: 0 },
            { at: rel(17.5), dur: 16, scale: 1.05, x: -32, y: 34, rotateY: -2 },
            { at: rel(19.4), dur: 16, scale: 1.05, x: -32, y: 0, rotateY: -2 },
            { at: rel(21.4), dur: 16, scale: 1.05, x: -32, y: -34, rotateY: -2 },
            { at: SCENE02_FRAMES - 14, dur: 14, scale: 0.94, x: -200, y: 0, rotateY: -5 },
          ]}
        >
          <SplitFanOut
            rootTag="USE WHEN · 适用信号"
            rootTitle="平行独立子任务"
            rootSub="互不阻塞 · 分头推进"
            branches={[
              { num: '01', title: '改七八个模块', sub: '互不依赖 · 同时改', at: rel(17.5), glyph: 'grid' },
              { num: '02', title: '批量补单测', sub: '几十文件 · 并行测', at: rel(19.4), glyph: 'check' },
              { num: '03', title: '多方案调研', sub: '多路竞品 · 同步查', at: rel(21.4), glyph: 'search' },
            ]}
          />
        </CameraRig>
      </div>
    </div>
  );
};
