import React from 'react';
import { Sequence, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { GeminiLogo, PythonLogo } from '../design/BrandLogos';
import { COLORS, FONTS, WEIGHTS } from '../design/tokens';
import {
  CircularGaugeConsole,
  CRISP_SPRING,
  MilestoneGateTrack,
  mixRgb,
  OrbitLoopRing,
  PhysicalGlass3D,
  Stage,
} from './index';
import { AgySwarmPromptScene } from '../episodes/agy-slash-commands/Scene04SwarmPrompt';

/**
 * 引擎积木全检画廊（EngineGallery）：
 * - 0..59    : PhysicalGlass3D 材质三态
 * - 60..149  : OrbitLoopRing（环形星轨四象限迭代闭环）
 * - 150..239 : MilestoneGateTrack（斜向阶梯里程碑 + 审查门禁）
 * - 240..329 : CircularGaugeConsole（大号圆形进度仪表盘 + 机器核验台）
 * - 330..509 : PromptConsole（SRT 锚点自动驱动示范）
 */
export const ENGINE_GALLERY_FRAMES = 510;

const GlassMaterialSpecimen: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const cards = [
    { num: '01', title: '静息磨砂态', tag: 'ACTIVE 0.0', metric: '16px', unit: '实体侧壁', active: 0.08, accent: [148, 178, 232] as [number, number, number], extrudeX: -8, tiltY: 5, icon: <GeminiLogo size={42} /> },
    { num: '02', title: '琥珀导光态', tag: 'ACTIVE 1.0', metric: '2.5D', unit: '导光厚底座', active: 1, accent: [245, 166, 35] as [number, number, number], extrudeX: 0, tiltY: 0, icon: <GeminiLogo size={42} /> },
    { num: '03', title: '异主题换肤', tag: 'EMERALD THEME', metric: '24px+', unit: '细体零粘连', active: 0.92, accent: [52, 211, 153] as [number, number, number], extrudeX: 9, tiltY: -6, icon: <PythonLogo size={42} /> },
  ];

  return (
    <Stage stepIndex={1} totalSteps={5} chapterLabel="GALLERY 01 · PHYSICAL GLASS 3D" subtitles={[{ startSec: 0, endSec: 2, zh: '真 2.5D 实体挤出侧壁 · 3:2 纵向三段舒展比例' }]} theme={{ watermark: 'STUDIO' }}>
      <div style={{ width: '100%', maxWidth: 1620, height: '100%', margin: '0 auto', padding: '48px 0 42px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 28 }}>
          <span style={{ fontFamily: FONTS.display, fontSize: 68, fontWeight: WEIGHTS.light, color: COLORS.white, letterSpacing: 1 }}>PhysicalGlass3D</span>
          <span style={{ fontSize: 32, fontWeight: WEIGHTS.light, color: '#9BA8BE', letterSpacing: 2.5 }}>真 2.5D 实体厚侧壁与黄金空间比例</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 44, perspective: 1500 }}>
          {cards.map((c, i) => {
            const p = spring({ frame: Math.max(0, frame - i * 4), fps, config: CRISP_SPRING });
            return (
              <div key={c.num} style={{ opacity: p, transform: `translate3d(0, ${((1 - p) * 26).toFixed(1)}px, 0) rotateX(6deg) rotateY(${c.tiltY}deg)` }}>
                <PhysicalGlass3D active={c.active} accentRgb={c.accent} radius={28} slabPx={16} extrudeX={c.extrudeX} padding="50px 44px 56px" sheenPulse={0.52}>
                  <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: 340 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontFamily: FONTS.mono, fontSize: 24, fontWeight: WEIGHTS.regular, letterSpacing: 1.8, color: mixRgb([162, 176, 200], c.accent, 0.3 + c.active * 0.7) }}>{c.num} · {c.tag}</span>
                      {c.icon}
                    </div>
                    <div style={{ fontSize: 48, fontWeight: WEIGHTS.regular, color: '#F4F7FC', letterSpacing: 2 }}>{c.title}</div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 16 }}>
                      <span style={{ fontFamily: FONTS.display, fontSize: 82, fontWeight: WEIGHTS.light, fontVariantNumeric: 'tabular-nums', letterSpacing: -1, color: mixRgb([232, 238, 248], c.accent, c.active), lineHeight: 0.95 }}>{c.metric}</span>
                      <span style={{ fontSize: 28, fontWeight: WEIGHTS.light, color: '#A8B5CA', letterSpacing: 1.5 }}>{c.unit}</span>
                    </div>
                  </div>
                </PhysicalGlass3D>
              </div>
            );
          })}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 25, fontWeight: WEIGHTS.light, color: '#7D8CA6', letterSpacing: 2 }}>
          <span>顶面亮棱倒角 · 16px 连续挤出受光侧壁 · 底部悬浮落影</span>
          <span>3:2 画布黄金三段纵深</span>
        </div>
      </div>
    </Stage>
  );
};

const OrbitSpecimen: React.FC = () => (
  <Stage stepIndex={2} totalSteps={5} chapterLabel="GALLERY 02 · ORBIT LOOP RING" subtitles={[{ startSec: 0, endSec: 3, zh: '环形星轨四象限闭环 · 适配多轮迭代推理与飞轮演进' }]}>
    <div style={{ width: '100%', maxWidth: 1560, height: '100%', margin: '0 auto', padding: '24px 0', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <div style={{ fontSize: 50, fontWeight: WEIGHTS.light, color: COLORS.white, letterSpacing: 2 }}>/boost 多轮对抗深挖闭环</div>
      <OrbitLoopRing
        coreTag="DEEP LOOP"
        coreTitle="多轮推理"
        solvedAt={58}
        phases={[
          { num: '01', title: '初版方案', sub: '生成候选解', at: 4 },
          { num: '02', title: '对抗找茬', sub: '独立挑刺挑战', at: 18 },
          { num: '03', title: '根因修复', sub: '修补边界漏洞', at: 32 },
          { num: '04', title: '回归打磨', sub: '压力验证收敛', at: 46 },
        ]}
        sfxMuted
      />
    </div>
  </Stage>
);

const MilestoneSpecimen: React.FC = () => (
  <Stage stepIndex={3} totalSteps={5} chapterLabel="GALLERY 03 · MILESTONE GATE TRACK" subtitles={[{ startSec: 0, endSec: 3, zh: '斜向阶梯里程碑 + 审查门禁 · 严守因果零提前剧透' }]}>
    <div style={{ width: '100%', maxWidth: 1560, height: '100%', margin: '0 auto', padding: '24px 0', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <div style={{ fontSize: 50, fontWeight: WEIGHTS.light, color: COLORS.white, letterSpacing: 2 }}>/teamwork 阶段里程碑门禁</div>
      <MilestoneGateTrack
        stages={[
          { code: 'M1 · SPEC', title: '需求访谈对齐', sub: '锁定边界契约', at: 4 },
          { code: 'M2 · BUILD', title: '分片并行实现', sub: '独立分支开发', at: 24 },
          { code: 'M3 · SHIP', title: '全量集成合并', sub: '端到端可交付', at: 48 },
        ]}
        gates={[
          { roleLabel: '@critic', verdictLabel: '契约通过 ✓', at: 16 },
          { roleLabel: '@auditor', verdictLabel: '单测零挂 ✓', at: 38 },
        ]}
        sfxMuted
      />
    </div>
  </Stage>
);

const GaugeSpecimen: React.FC = () => (
  <Stage stepIndex={4} totalSteps={5} chapterLabel="GALLERY 04 · CIRCULAR GAUGE CONSOLE" subtitles={[{ startSec: 0, endSec: 3, zh: '大号圆形进度仪表盘 + 机器核验清单 · 连续色彩插值' }]}>
    <div style={{ width: '100%', maxWidth: 1560, height: '100%', margin: '0 auto', padding: '24px 0', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <div style={{ fontSize: 50, fontWeight: WEIGHTS.light, color: COLORS.white, letterSpacing: 2 }}>/goal 机器可验证过夜自治</div>
      <CircularGaugeConsole
        consoleTitle="可自动验证终点"
        consoleBody="修复全部失败单测，确保生产构建与静态门禁零报错通过。"
        gaugeLabel="OVERNIGHT RUN"
        startAt={6}
        completeAt={56}
        criteria={[
          { commandText: '$ npm test', verdictText: 'PASS ✓', passAt: 34 },
          { commandText: '$ npm run build', verdictText: '0 ERRORS ✓', passAt: 52 },
        ]}
        sfxMuted
      />
    </div>
  </Stage>
);

export const EngineGallery: React.FC = () => (
  <>
    <Sequence from={0} durationInFrames={60}><GlassMaterialSpecimen /></Sequence>
    <Sequence from={60} durationInFrames={90}><OrbitSpecimen /></Sequence>
    <Sequence from={150} durationInFrames={90}><MilestoneSpecimen /></Sequence>
    <Sequence from={240} durationInFrames={90}><GaugeSpecimen /></Sequence>
    <Sequence from={330} durationInFrames={180}><AgySwarmPromptScene /></Sequence>
  </>
);
