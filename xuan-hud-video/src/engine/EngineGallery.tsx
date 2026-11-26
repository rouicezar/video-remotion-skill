import React from 'react';
import { Sequence } from 'remotion';
import { COLORS, WEIGHTS } from '../design/tokens';
import {
  CircularGaugeConsole,
  DarkCodeTerminal,
  FunnelFilterStack,
  HeroMetricSpotlight,
  HorizontalTimelineTrack,
  MilestoneGateTrack,
  OrbitLoopRing,
  Stage,
  VersusCompareArena,
} from './index';
import { AgySwarmPromptScene } from '../episodes/agy-slash-commands/Scene04SwarmPrompt';

/**
 * 引擎积木全检画廊（EngineGallery · 覆盖全部核心异构 2.5D 积木家族）：
 * 每个切片 90 帧（3 秒），支持随时通过 `remotion still` 抽帧检阅任意积木。
 */
export const ENGINE_GALLERY_FRAMES = 810;

const GallerySlide: React.FC<{ step: number; label: string; title: string; sub: string; children: React.ReactNode }> = ({
  step,
  label,
  title,
  sub,
  children,
}) => (
  <Stage stepIndex={step} totalSteps={9} chapterLabel={label} subtitles={[{ startSec: 0, endSec: 3, zh: sub }]}>
    <div style={{ width: '100%', maxWidth: 1560, height: '100%', margin: '0 auto', padding: '24px 0', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <div style={{ fontSize: 50, fontWeight: WEIGHTS.light, color: COLORS.white, letterSpacing: 2 }}>{title}</div>
      {children}
    </div>
  </Stage>
);

export const EngineGallery: React.FC = () => (
  <>
    <Sequence from={0} durationInFrames={90}>
      <GallerySlide step={1} label="BLOCK 04 · ORBIT LOOP RING" title="环形星轨四象限闭环" sub="适配多轮迭代推理与飞轮演进">
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
      </GallerySlide>
    </Sequence>

    <Sequence from={90} durationInFrames={90}>
      <GallerySlide step={2} label="BLOCK 05 · MILESTONE GATE TRACK" title="斜向阶梯里程碑 + 审查门禁" sub="适配分阶段推进与卡点验收">
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
      </GallerySlide>
    </Sequence>

    <Sequence from={180} durationInFrames={90}>
      <GallerySlide step={3} label="BLOCK 06 · CIRCULAR GAUGE CONSOLE" title="大号圆形动态仪表盘 + 核验清单" sub="适配量化达标与过夜自治收敛">
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
      </GallerySlide>
    </Sequence>

    <Sequence from={270} durationInFrames={90}>
      <GallerySlide step={4} label="BLOCK 09 · VERSUS COMPARE ARENA" title="左右正反双栏 2.5D 对决台" sub="适配新旧范式对比与误区纠偏">
        <VersusCompareArena
          rightEnterAt={16}
          winAt={38}
          left={{
            badge: 'LEGACY · 传统做法',
            title: '一上来闷头写代码',
            points: [
              { text: '需求边界模糊，边写边返工', at: 6 },
              { text: '多文件耦合冲突，越改越乱', at: 12 },
              { text: '缺少独立把关，隐患带上线', at: 18 },
            ],
          }}
          right={{
            badge: 'UPGRADED · 工程流',
            title: '契约先行 + 独立门禁',
            points: [
              { text: '先对齐接口与验收硬指标', at: 24 },
              { text: '薄垂直切片逐块提交可回滚', at: 32 },
              { text: '自动脚本守门，零人工伪通过', at: 42 },
            ],
          }}
          sfxMuted
        />
      </GallerySlide>
    </Sequence>

    <Sequence from={360} durationInFrames={90}>
      <GallerySlide step={5} label="BLOCK 10 · DARK CODE TERMINAL" title="2.5D 拟真暗黑代码与命令终端" sub="全字号 ≥24px · 行内连续插值零滑条">
        <DarkCodeTerminal
          fileTitle="workflow/audit_branch.py"
          langBadge="PYTHON · WORKFLOW"
          lines={[
            { token: 'files =', code: 'git_changed_files("HEAD~1")', comment: '提取改动文件', at: 6 },
            { token: 'reviews =', code: 'parallel([agent(f) for f in files])', comment: '20 路并发审查', at: 20 },
            { token: 'report =', code: 'aggregate_findings(reviews)', comment: '汇总风险清单', at: 34 },
          ]}
          outputSummary={{ label: 'DONE · 20 FILES SCANNED', detail: '锁定 3 处越界隐患 · 耗时 14s ✓', at: 50 }}
          sfxMuted
        />
      </GallerySlide>
    </Sequence>

    <Sequence from={450} durationInFrames={90}>
      <GallerySlide step={6} label="BLOCK 11 · HORIZONTAL TIMELINE TRACK" title="上下交错横向时间轴演进轨" sub="双层悬挑吃满 3:2 高度 · 拒绝单排扁条">
        <HorizontalTimelineTrack
          stops={[
            { timeTag: 'STEP 01', title: '字幕校准', sub: '修正错词与时长', at: 6 },
            { timeTag: 'STEP 02', title: '意图匹配', sub: '冷却防重选积木', at: 20 },
            { timeTag: 'STEP 03', title: '静帧门禁', sub: '渲染前全章核验', at: 34 },
            { timeTag: 'STEP 04', title: '4K 成片 QC', sub: '响度码率双达标', at: 48 },
          ]}
          sfxMuted
        />
      </GallerySlide>
    </Sequence>

    <Sequence from={540} durationInFrames={90}>
      <GallerySlide step={7} label="BLOCK 12 · HERO METRIC SPOTLIGHT" title="超大数字冲击主卡 + 三维副指标" sub="144px 等宽细体跳数 · 零宽度抖动">
        <HeroMetricSpotlight
          eyebrow="CLOUD STORAGE PERK · 核心额度"
          fromValue={0}
          toValue={5}
          unit="TB 云空间"
          caption="单账号直享大容量云盘与全套高阶模型配额，零额外投入。"
          pillars={[
            { label: 'Gemini Pro 额度', value: '全量开放', at: 22 },
            { label: '多端同步共享', value: '5 人家庭组', at: 32 },
            { label: '综合年省成本', value: '¥2,400+', at: 42 },
          ]}
          accentRgb={[96, 165, 250]}
          sfxMuted
        />
      </GallerySlide>
    </Sequence>

    <Sequence from={630} durationInFrames={90}>
      <GallerySlide step={8} label="BLOCK 13 · FUNNEL FILTER STACK" title="三级递进收窄漏斗 + 提纯结果卡" sub="适配海量输入过滤与高价值提纯">
        <FunnelFilterStack
          layers={[
            { title: '全仓改动文件扫描', countTag: '24 FILES', at: 6 },
            { title: '静态类型与门禁初筛', countTag: '9 CANDIDATES', at: 20 },
            { title: '边界并发深度复核', countTag: '3 CRITICAL', at: 34 },
          ]}
          output={{
            badge: 'FINAL REPORT · 提纯结论',
            metric: '100%',
            title: '高危漏洞精准闭环',
            sub: '按文件分组输出可一键修复补丁',
            at: 50,
          }}
          sfxMuted
        />
      </GallerySlide>
    </Sequence>

    <Sequence from={720} durationInFrames={90}>
      <AgySwarmPromptScene />
    </Sequence>
  </>
);
