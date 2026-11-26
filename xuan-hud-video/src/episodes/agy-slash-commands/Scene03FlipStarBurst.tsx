import React from 'react';
import { useCurrentFrame } from 'remotion';
import { COLORS, FONTS, FPS, WEIGHTS } from '../../design/tokens';
import {
  CameraRig,
  clamp01,
  easeInOutCubic,
  easeOutExpo,
  FlipSlab3D,
  mixRgb,
  PhysicalGlass3D,
  SfxGroup,
  StarBurstTopology,
} from '../../engine';

export const SCENE03_START_SEC = 23.45;
export const SCENE03_END_SEC = 42.35;
export const SCENE03_FRAMES = Math.round((SCENE03_END_SEC - SCENE03_START_SEC) * FPS); // 567f

const rel = (absSec: number) => Math.round((absSec - SCENE03_START_SEC) * FPS);

/**
 * Scene 03（00:23.45 – 00:42.35, 567f）：
 * 串行排队阻塞 + 上下文溢出警示 → 15 帧干脆 3D 厚砖翻转 → `<StarBurstTopology>` 四角命名子 Agent 并发迸射
 */
export const Scene03FlipStarBurst: React.FC = () => {
  const frame = useCurrentFrame();

  const enterP = easeOutExpo(frame / 14);
  const q1 = clamp01(easeInOutCubic((frame - rel(25.3)) / 14));
  const q2 = clamp01(easeInOutCubic((frame - rel(27.4)) / 14));
  const q3 = clamp01(easeInOutCubic((frame - rel(29.4)) / 14));
  const ctxBoom = clamp01(easeInOutCubic((frame - rel(31.4)) / 14));
  const ctxPct = Math.round(32 + q1 * 20 + q2 * 22 + ctxBoom * 26);

  const flipAt = rel(33.15);
  const starExpand = clamp01(easeInOutCubic((frame - rel(36.35)) / 18));
  const workersPopAt = rel(39.1);
  const togetherGlow = clamp01(easeInOutCubic((frame - rel(41.3)) / 14));

  const sfxEvents = [
    { kind: 'pop' as const, at: rel(25.3) },
    { kind: 'pop' as const, at: rel(27.4) },
    { kind: 'drop' as const, at: rel(31.4) },
    { kind: 'whoosh' as const, at: rel(36.35) },
    { kind: 'flow' as const, at: workersPopAt - 4 },
    { kind: 'deal' as const, at: workersPopAt },
    { kind: 'deal' as const, at: workersPopAt + 5 },
    { kind: 'deal' as const, at: workersPopAt + 10 },
    { kind: 'deal' as const, at: workersPopAt + 15 },
    { kind: 'pop' as const, at: rel(41.3) },
  ];

  const painAccent: [number, number, number] = [
    Math.round(148 + (235 - 148) * ctxBoom),
    Math.round(168 + (87 - 168) * ctxBoom),
    Math.round(204 + (87 - 204) * ctxBoom),
  ];

  const painFront = (
    <PhysicalGlass3D active={0.35 + ctxBoom * 0.65} accentRgb={painAccent} radius={28} slabPx={16} extrudeX={0} padding="48px 56px 54px" sheenSpeed={0.45}>
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: 420 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 42, fontWeight: WEIGHTS.regular, color: COLORS.white, letterSpacing: 1.5 }}>单 Agent 串行排队</span>
          <span style={{ fontFamily: FONTS.mono, fontSize: 26, fontWeight: WEIGHTS.regular, color: mixRgb([176, 190, 214], [252, 146, 146], ctxBoom), padding: '8px 22px', borderRadius: 12, border: `1.5px solid ${mixRgb([120, 136, 164], [234, 67, 53], ctxBoom)}` }}>
            CONTEXT · {ctxPct}%
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 22 }}>
          {[
            { label: '任务 01', state: '进行中', w: q1, d: 0 },
            { label: '任务 02', state: '排队等待', w: q2, d: 0 },
            { label: '任务 03', state: '排队等待', w: q3, d: 0 },
            // 零提前剧透：口播未讲到 31.4s 前仅显示中性待命文案，绝不提前以半透明挂出“上下文溢出”
            { label: '任务 04', state: ctxBoom > 0.15 ? '上下文溢出' : '排队待命', w: ctxBoom, d: ctxBoom },
          ].map((slot) => (
            <div
              key={slot.label}
              style={{
                padding: '26px 24px',
                borderRadius: 18,
                backgroundColor: `rgba(255,255,255,${(0.03 + slot.w * 0.05).toFixed(3)})`,
                border: `2px solid ${mixRgb([72, 84, 110], [Math.round(245 - 11 * slot.d), Math.round(166 - 99 * slot.d), Math.round(35 + 18 * slot.d)], slot.w * 0.85)}`,
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
                opacity: 0.35 + slot.w * 0.65,
              }}
            >
              <span style={{ fontFamily: FONTS.mono, fontSize: 24, color: '#9AA8C0' }}>{slot.label}</span>
              <span style={{ fontSize: 30, fontWeight: WEIGHTS.regular, color: mixRgb([210, 220, 236], [255, 150, 150], slot.d) }}>
                {slot.state}
              </span>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ height: 12, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
            <div style={{ width: `${ctxPct}%`, height: '100%', borderRadius: 8, backgroundColor: mixRgb([245, 166, 35], [234, 67, 53], ctxBoom) }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 26, fontWeight: WEIGHTS.light, color: mixRgb([164, 178, 202], [255, 168, 168], ctxBoom) }}>
            <span>逐个串行阻塞</span>
            <span style={{ opacity: 0.25 + ctxBoom * 0.75 }}>长任务上下文迅速爆满</span>
          </div>
        </div>
      </div>
    </PhysicalGlass3D>
  );

  const swarmBack = (
    <PhysicalGlass3D active={1} accentRgb={[245, 166, 35]} radius={28} slabPx={16} extrudeX={0} padding="52px 58px" sheenSpeed={0.7}>
      <div style={{ height: 420, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 26 }}>
        <span style={{ fontFamily: FONTS.mono, fontSize: 26, color: '#FFD992', letterSpacing: 3 }}>PARADIGM SHIFT · 模式切换</span>
        <div style={{ fontFamily: FONTS.mono, fontSize: 112, fontWeight: WEIGHTS.regular, color: COLORS.amber, lineHeight: 0.95 }}>/swarm</div>
        <div style={{ fontSize: 44, fontWeight: WEIGHTS.light, color: COLORS.white, letterSpacing: 2.5 }}>协调者拆活 · 多子 Agent 并行开干</div>
      </div>
    </PhysicalGlass3D>
  );

  return (
    <CameraRig
      keyframes={[
        { at: 0, dur: 14, scale: 1, x: 0, y: 0, rotateX: 3 },
        { at: flipAt, dur: 16, scale: 1.04, x: 0, y: 0, rotateX: 2 },
        { at: rel(36.35), dur: 18, scale: 1, x: 0, y: 0, rotateX: 4 },
        { at: rel(41.3), dur: 16, scale: 1.05, x: 0, y: -8, rotateX: 5 },
      ]}
    >
      <SfxGroup events={sfxEvents} />
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
          opacity: enterP,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <div style={{ fontSize: 48, fontWeight: WEIGHTS.light, color: COLORS.white, letterSpacing: 2 }}>
            {frame < flipAt + 8 ? '传统单线程痛点' : '多 Agent 蜂群并发拓扑'}
          </div>
          <span style={{ fontFamily: FONTS.mono, fontSize: 25, color: mixRgb([156, 170, 196], [52, 168, 83], togetherGlow), letterSpacing: 2 }}>
            {frame < flipAt + 8 ? 'SERIAL BOTTLENECK' : 'COORDINATOR + 4 NAMED WORKERS'}
          </span>
        </div>

        <div style={{ position: 'relative', width: 1560, height: 740, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {starExpand < 0.98 && (
            <div style={{ width: 1260, height: 536, opacity: 1 - starExpand, transform: `scale(${(1 - starExpand * 0.36).toFixed(4)})` }}>
              <FlipSlab3D flipAt={flipAt} front={painFront} back={swarmBack} />
            </div>
          )}

          {starExpand > 0.02 && (
            <StarBurstTopology
              hubBadge="COORDINATOR"
              hubTitle="协调者拆活"
              hubSub="/swarm 总控"
              expandProgress={starExpand}
              burstAt={workersPopAt}
              syncGlow={togetherGlow}
              nodes={[
                { id: '@worker-auth', label: '鉴权模块', statusText: '并行中' },
                { id: '@worker-api', label: '接口补全', statusText: '并行中' },
                { id: '@worker-test', label: '单测覆盖', statusText: '并行中' },
                { id: '@worker-docs', label: '竞品比对', statusText: '并行中' },
              ]}
            />
          )}
        </div>
      </div>
    </CameraRig>
  );
};
