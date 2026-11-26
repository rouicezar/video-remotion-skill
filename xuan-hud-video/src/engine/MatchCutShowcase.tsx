import React from 'react';
import { Sequence, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { CHROME_RGB, COLORS, FONTS, WEIGHTS } from '../design/tokens';
import { Stage } from './Stage';
import { CameraRig } from './CameraRig';
import { MatchCutBridge } from './MatchCutBridge';
import { CRISP_SPRING, clamp01, easeInOutCubic } from './motion';
import { DiamondGate3D, Disc3D, HexNode3D, Pill3D } from './shapes/Geometry3D';
import { FunnelFilterStack } from './blocks/FunnelFilterStack';
import { CircularGaugeConsole } from './blocks/CircularGaugeConsole';
import { Sfx } from './Sfx';

export const MATCHCUT_SHOWCASE_FRAMES = 480; // 16s @ 30fps

/**
 * 16 秒专项验证片（MatchCutShowcase）：
 * 验证三大根治项：
 * 1. 非方形原生 2.5D 几何体（Disc3D / Pill3D / HexNode3D / DiamondGate3D / Trapezoid3D）
 * 2. 跨场真匹配剪辑（MatchCutBridge）：太阳橙圆盘 → 车灯红圆盘 → 等腰梯形漏斗 → 圆形仪表盘
 * 3. 暗底清晰字体（400/500 无暗阴影，零颜色污染糊边）
 */
export const MatchCutShowcase: React.FC = () => {
  const frame = useCurrentFrame();
  const stepIndex = frame < 116 ? 1 : frame < 236 ? 2 : frame < 356 ? 3 : 4;
  const chapterLabel =
    stepIndex === 1
      ? '01 · 太阳圆盘 · DISC 3D'
      : stepIndex === 2
        ? '02 · 车灯警报 · HEX + SHIELD'
        : stepIndex === 3
          ? '03 · 梯形漏斗 · TRAPEZOID 3D'
          : '04 · 圆形仪表 · GAUGE DISC';

  const activeAccent =
    stepIndex === 1
      ? CHROME_RGB.orange
      : stepIndex === 2
        ? CHROME_RGB.red
        : stepIndex === 3
          ? CHROME_RGB.green
          : CHROME_RGB.blue;

  return (
    <Stage
      stepIndex={stepIndex}
      totalSteps={4}
      chapterLabel={chapterLabel}
      theme={{ accentRgb: activeAccent, watermark: 'GEOMETRY · MATCH CUT' }}
    >
      {/* ── Act 1 (0–116f): 橙色太阳 Disc3D + 胶囊标签 ── */}
      <Sequence from={0} durationInFrames={116}>
        <Act1SunDisc />
      </Sequence>

      {/* ── Act 2 (116–236f): 红色车灯 Disc3D + 四角六边形 HexNode3D + 底部盾形门禁 ── */}
      <Sequence from={116} durationInFrames={120}>
        <Act2TailLightCluster />
      </Sequence>

      {/* ── Act 3 (236–356f): 真等腰梯形漏斗 FunnelFilterStack ── */}
      <Sequence from={236} durationInFrames={120}>
        <Act3TrapezoidFunnel />
      </Sequence>

      {/* ── Act 4 (356–480f): 无外方框真圆盘仪表盘 CircularGaugeConsole ── */}
      <Sequence from={356} durationInFrames={124}>
        <Act4CircularGauge />
      </Sequence>

      {/* ── 跨场真匹配剪辑桥 1：橙色太阳圆盘 → 红色车灯圆盘（108–124f）── */}
      <MatchCutBridge
        startFrame={108}
        durationFrames={16}
        from={{ cx: 888, cy: 500, width: 280, height: 280, radius: 140, accentRgb: CHROME_RGB.orange, slabPx: 16 }}
        to={{ cx: 888, cy: 460, width: 248, height: 248, radius: 124, accentRgb: CHROME_RGB.red, slabPx: 16 }}
        labelFrom="太阳核心"
        labelTo="车灯警报"
      />

      {/* ── 跨场真匹配剪辑桥 2：红色车灯圆盘 → 顶部梯形入口（228–244f）── */}
      <MatchCutBridge
        startFrame={228}
        durationFrames={16}
        from={{ cx: 888, cy: 460, width: 248, height: 248, radius: 124, accentRgb: CHROME_RGB.red, slabPx: 16 }}
        to={{ cx: 888, cy: 266, width: 1120, height: 112, radius: 22, accentRgb: CHROME_RGB.orange, slabPx: 14 }}
        labelFrom="警报汇聚"
        labelTo="漏斗筛选"
      />

      {/* ── 跨场真匹配剪辑桥 3：绿色漏斗输出卡 → 右侧真圆盘仪表（348–364f）── */}
      <MatchCutBridge
        startFrame={348}
        durationFrames={16}
        from={{ cx: 1335, cy: 502, width: 540, height: 344, radius: 28, accentRgb: CHROME_RGB.green, slabPx: 14 }}
        to={{ cx: 1452, cy: 518, width: 476, height: 476, radius: 238, accentRgb: CHROME_RGB.blue, slabPx: 16 }}
        labelFrom="最终收敛"
        labelTo="100%"
      />
    </Stage>
  );
};

const Act1SunDisc: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame, fps, config: CRISP_SPRING });
  const exitFade = 1 - clamp01(easeInOutCubic((frame - 106) / 10));

  return (
    <CameraRig keyframes={[{ at: 0, dur: 1, x: 0, y: 0, scale: 0.96 }, { at: 20, dur: 24, x: 0, y: 0, scale: 1.02 }]}>
      <Sfx kind="enter" at={0} />
      <div style={{ position: 'relative', width: '100%', height: '100%', opacity: exitFade }}>
        {/* 左侧胶囊 */}
        <div style={{ position: 'absolute', left: 210, top: 458, opacity: pop, transform: `translate3d(${(1 - pop) * -40}px, 0, 0)` }}>
          <Pill3D active={0.85} accentRgb={CHROME_RGB.orange}>
            <span style={{ fontSize: 30, fontWeight: WEIGHTS.medium, color: COLORS.white, letterSpacing: 1 }}>原生圆盘 · 非方框</span>
          </Pill3D>
        </div>

        {/* 中心橙色太阳圆盘 */}
        <div
          style={{
            position: 'absolute',
            left: 888 - 140,
            top: 500 - 140,
            transform: `scale(${(0.84 + pop * 0.16).toFixed(4)})`,
          }}
        >
          <Disc3D size={280} active={0.95} accentRgb={CHROME_RGB.orange} slabPx={16}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
              <span style={{ fontFamily: FONTS.mono, fontSize: 24, fontWeight: WEIGHTS.regular, color: '#FFD27D', letterSpacing: 2 }}>
                SUN · 01
              </span>
              <span style={{ fontSize: 44, fontWeight: WEIGHTS.medium, color: COLORS.white }}>太阳核心</span>
            </div>
          </Disc3D>
        </div>

        {/* 右侧胶囊 */}
        <div style={{ position: 'absolute', right: 210, top: 458, opacity: pop, transform: `translate3d(${(1 - pop) * 40}px, 0, 0)` }}>
          <Pill3D active={0.85} accentRgb={CHROME_RGB.blue}>
            <span style={{ fontSize: 30, fontWeight: WEIGHTS.medium, color: COLORS.white, letterSpacing: 1 }}>同构形变 · 匹配剪辑</span>
          </Pill3D>
        </div>
      </div>
    </CameraRig>
  );
};

const Act2TailLightCluster: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enterP = clamp01(easeInOutCubic((frame - 6) / 10));
  const exitFade = 1 - clamp01(easeInOutCubic((frame - 110) / 10));

  const hexNodes = [
    { x: 300, y: 180, title: '节点 A', sub: '六边形集群', rgb: CHROME_RGB.blue, at: 10 },
    { x: 1216, y: 180, title: '节点 B', sub: '零锯齿矢量', rgb: CHROME_RGB.orange, at: 18 },
    { x: 300, y: 520, title: '节点 C', sub: '暗底清晰字', rgb: CHROME_RGB.green, at: 26 },
    { x: 1216, y: 520, title: '节点 D', sub: '四色白名单', rgb: CHROME_RGB.red, at: 34 },
  ];

  return (
    <CameraRig keyframes={[{ at: 0, dur: 1, x: 0, y: 0, scale: 1.0 }, { at: 30, dur: 24, x: 0, y: -6, scale: 1.02 }]}>
      <div style={{ position: 'relative', width: '100%', height: '100%', opacity: exitFade }}>
        {/* 中心红色车灯圆盘（无缝承接太阳圆盘） */}
        <div style={{ position: 'absolute', left: 888 - 124, top: 460 - 124, opacity: enterP }}>
          <Disc3D size={248} active={1} accentRgb={CHROME_RGB.red} slabPx={16}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <span style={{ fontFamily: FONTS.mono, fontSize: 24, fontWeight: WEIGHTS.regular, color: '#FF9A92', letterSpacing: 2 }}>
                ALERT · 02
              </span>
              <span style={{ fontSize: 42, fontWeight: WEIGHTS.medium, color: COLORS.white }}>车灯警报</span>
            </div>
          </Disc3D>
        </div>

        {/* 四角六边形集群节点（HexNode3D） */}
        {hexNodes.map((n) => {
          const p = spring({ frame: Math.max(0, frame - n.at), fps, config: CRISP_SPRING });
          return (
            <div
              key={n.title}
              style={{
                position: 'absolute',
                left: n.x,
                top: n.y,
                opacity: p,
                transform: `scale(${(0.86 + p * 0.14).toFixed(4)})`,
              }}
            >
              <HexNode3D width={260} height={224} slabPx={14} active={0.85} accentRgb={n.rgb}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 34, fontWeight: WEIGHTS.medium, color: COLORS.white }}>{n.title}</span>
                  <span style={{ fontSize: 24, fontWeight: WEIGHTS.regular, color: '#D0DAE8' }}>{n.sub}</span>
                </div>
              </HexNode3D>
            </div>
          );
        })}

        {/* 底部切角盾形门禁（DiamondGate3D） */}
        <div style={{ position: 'absolute', left: 888 - 200, bottom: 38, opacity: enterP }}>
          <DiamondGate3D width={400} height={124} slabPx={12} active={0.95} accentRgb={CHROME_RGB.green}>
            <span style={{ fontSize: 32, fontWeight: WEIGHTS.medium, color: COLORS.white, letterSpacing: 1.5 }}>
              盾形门禁 · 全部放行 ✓
            </span>
          </DiamondGate3D>
        </div>
      </div>
    </CameraRig>
  );
};

const Act3TrapezoidFunnel: React.FC = () => {
  const frame = useCurrentFrame();
  const enterP = clamp01(easeInOutCubic((frame - 6) / 10));
  const exitFade = 1 - clamp01(easeInOutCubic((frame - 110) / 10));

  return (
    <CameraRig keyframes={[{ at: 0, dur: 1, x: 0, y: 0, scale: 0.98 }, { at: 24, dur: 24, x: 0, y: 0, scale: 1.02 }]}>
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: enterP * exitFade }}>
        <FunnelFilterStack
          layers={[
            { countTag: '1,200 条', title: '原始候选 · 等腰梯形一层', at: 8 },
            { countTag: '180 条', title: '门禁过滤 · 斜边收窄', at: 24 },
            { countTag: '12 条', title: '高置信收敛 · 进入仪表', at: 42 },
          ]}
          output={{
            badge: 'OUTPUT',
            title: '精准提纯结果',
            metric: '12 项',
            sub: '即将无缝变形成圆盘仪表',
            at: 56,
          }}
          accentRgb={CHROME_RGB.orange}
          resultRgb={CHROME_RGB.green}
        />
      </div>
    </CameraRig>
  );
};

const Act4CircularGauge: React.FC = () => {
  const frame = useCurrentFrame();
  const enterP = clamp01(easeInOutCubic((frame - 6) / 10));

  return (
    <CameraRig keyframes={[{ at: 0, dur: 1, x: 0, y: 0, scale: 0.98 }, { at: 24, dur: 24, x: 0, y: 0, scale: 1.02 }]}>
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: enterP }}>
        <CircularGaugeConsole
          consoleTitle="无外方框真圆盘仪表"
          consoleBody="脱掉冗余圆角外框，搭配 400/500 无暗阴影清晰字体与跨场真匹配剪辑。"
          criteria={[
            { commandText: 'fontWeight: 400 / 500', verdictText: 'PASS · 零糊边 ✓', passAt: 18 },
            { commandText: 'Geometry3D (5 Shapes)', verdictText: 'PASS · 非方形 ✓', passAt: 36 },
            { commandText: 'MatchCutBridge (3x)', verdictText: 'PASS · 同构变形 ✓', passAt: 54 },
          ]}
          gaugeLabel="画质清晰度"
          startAt={8}
          completeAt={68}
          accentRgb={CHROME_RGB.blue}
          passRgb={CHROME_RGB.green}
        />
      </div>
    </CameraRig>
  );
};
