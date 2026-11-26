import { FONTS, WEIGHTS } from '../../design/tokens';
import { Rgb } from '../motion';

/**
 * 五维参数化设计目录库（Design & Motion Catalog v2 · 13 大异构 2.5D 积木全集）：
 * 1. TypographyScale（字号与细体字重梯度库）
 * 2. LayoutPreset（3:2 画布黄金空间网格库）
 * 3. TransitionKind（无叠影几何/运镜转场词典）
 * 4. EngineBlockName（13 大异构 2.5D 拓扑积木库）
 * 5. ThemePalette（跨赛道主题色板库）+ 冷却防重算法 `planStoryboardFromIntents`
 */

export const TYPOGRAPHY_SCALE = {
  heroNumber: { fontFamily: FONTS.display, fontSize: 144, fontWeight: WEIGHTS.light, letterSpacing: -2 },
  heroCommand: { fontFamily: FONTS.mono, fontSize: 96, fontWeight: WEIGHTS.regular, letterSpacing: -1.5 },
  heroMetric: { fontFamily: FONTS.display, fontSize: 84, fontWeight: WEIGHTS.light, letterSpacing: -1 },
  sceneTitle: { fontFamily: FONTS.sans, fontSize: 52, fontWeight: WEIGHTS.light, letterSpacing: 2 },
  cardTitle: { fontFamily: FONTS.sans, fontSize: 42, fontWeight: WEIGHTS.regular, letterSpacing: 1.5 },
  promptBody: { fontFamily: FONTS.sans, fontSize: 44, fontWeight: WEIGHTS.light, letterSpacing: 1.2, lineHeight: 1.72 },
  codeLine: { fontFamily: FONTS.mono, fontSize: 30, fontWeight: WEIGHTS.regular, letterSpacing: 0.4 },
  subLabel: { fontFamily: FONTS.sans, fontSize: 28, fontWeight: WEIGHTS.light, letterSpacing: 1.2 },
  pillLabel: { fontFamily: FONTS.sans, fontSize: 27, fontWeight: WEIGHTS.light, letterSpacing: 1 },
  microTag: { fontFamily: FONTS.mono, fontSize: 24, fontWeight: WEIGHTS.regular, letterSpacing: 1.8 },
  subtitle: { fontFamily: FONTS.sans, fontSize: 54, fontWeight: WEIGHTS.regular, letterSpacing: 1.8 },
} as const;

export type LayoutPresetId =
  | 'hero-center-to-dock'
  | 'three-zone-spotlight'
  | 'bento-2plus3-deck'
  | 'split-root-fanout-1to3'
  | 'center-flip-to-radial-star'
  | 'step-milestone-gates'
  | 'orbit-quadrant-loop'
  | 'dual-versus-arena'
  | 'code-terminal-stage'
  | 'staggered-horizontal-timeline'
  | 'hero-metric-pillars'
  | 'converging-funnel-stage';

export type TransitionKind = 'z-drop' | 'camera-dive-morph' | 'flip-3d-16f' | 'whip-pan-match';

export type EngineBlockName =
  | 'BentoDeck2Plus3'
  | 'SplitFanOut'
  | 'FlipSlab3D'
  | 'StarBurstTopology'
  | 'OrbitLoopRing'
  | 'MilestoneGateTrack'
  | 'CircularGaugeConsole'
  | 'OfficialCropWindow'
  | 'PromptConsole'
  | 'VersusCompareArena'
  | 'DarkCodeTerminal'
  | 'HorizontalTimelineTrack'
  | 'HeroMetricSpotlight'
  | 'FunnelFilterStack';

export type SemanticBeatIntent =
  | 'hook-overview'
  | 'parallel-fanout'
  | 'pain-to-reversal'
  | 'iterative-loop'
  | 'staged-gates'
  | 'verifiable-gauge'
  | 'official-proof'
  | 'copy-prompt'
  | 'versus-compare'
  | 'code-walkthrough'
  | 'chronological-steps'
  | 'number-shock'
  | 'filter-narrowing'
  | 'decision-summary';

export interface ArchetypeRule {
  intent: SemanticBeatIntent;
  candidates: Array<{ block: EngineBlockName; layout: LayoutPresetId }>;
  preferredTransitions: TransitionKind[];
  cooldownScenes: number;
}

export const ARCHETYPE_RULES: Record<SemanticBeatIntent, ArchetypeRule> = {
  'hook-overview': {
    intent: 'hook-overview',
    candidates: [
      { block: 'BentoDeck2Plus3', layout: 'hero-center-to-dock' },
      { block: 'HeroMetricSpotlight', layout: 'hero-metric-pillars' },
    ],
    preferredTransitions: ['z-drop', 'camera-dive-morph'],
    cooldownScenes: 4,
  },
  'parallel-fanout': {
    intent: 'parallel-fanout',
    candidates: [
      { block: 'SplitFanOut', layout: 'split-root-fanout-1to3' },
      { block: 'StarBurstTopology', layout: 'center-flip-to-radial-star' },
    ],
    preferredTransitions: ['camera-dive-morph', 'whip-pan-match'],
    cooldownScenes: 2,
  },
  'pain-to-reversal': {
    intent: 'pain-to-reversal',
    candidates: [
      { block: 'StarBurstTopology', layout: 'center-flip-to-radial-star' },
      { block: 'VersusCompareArena', layout: 'dual-versus-arena' },
    ],
    preferredTransitions: ['flip-3d-16f', 'whip-pan-match'],
    cooldownScenes: 2,
  },
  'iterative-loop': {
    intent: 'iterative-loop',
    candidates: [
      { block: 'OrbitLoopRing', layout: 'orbit-quadrant-loop' },
      { block: 'HorizontalTimelineTrack', layout: 'staggered-horizontal-timeline' },
    ],
    preferredTransitions: ['whip-pan-match', 'camera-dive-morph'],
    cooldownScenes: 3,
  },
  'staged-gates': {
    intent: 'staged-gates',
    candidates: [
      { block: 'MilestoneGateTrack', layout: 'step-milestone-gates' },
      { block: 'HorizontalTimelineTrack', layout: 'staggered-horizontal-timeline' },
    ],
    preferredTransitions: ['whip-pan-match', 'z-drop'],
    cooldownScenes: 3,
  },
  'verifiable-gauge': {
    intent: 'verifiable-gauge',
    candidates: [
      { block: 'CircularGaugeConsole', layout: 'three-zone-spotlight' },
      { block: 'HeroMetricSpotlight', layout: 'hero-metric-pillars' },
    ],
    preferredTransitions: ['camera-dive-morph', 'z-drop'],
    cooldownScenes: 3,
  },
  'official-proof': {
    intent: 'official-proof',
    candidates: [{ block: 'OfficialCropWindow', layout: 'three-zone-spotlight' }],
    preferredTransitions: ['whip-pan-match', 'z-drop'],
    cooldownScenes: 2,
  },
  'copy-prompt': {
    intent: 'copy-prompt',
    candidates: [
      { block: 'PromptConsole', layout: 'three-zone-spotlight' },
      { block: 'DarkCodeTerminal', layout: 'code-terminal-stage' },
    ],
    preferredTransitions: ['camera-dive-morph', 'whip-pan-match'],
    cooldownScenes: 2,
  },
  'versus-compare': {
    intent: 'versus-compare',
    candidates: [
      { block: 'VersusCompareArena', layout: 'dual-versus-arena' },
      { block: 'FlipSlab3D', layout: 'three-zone-spotlight' },
    ],
    preferredTransitions: ['whip-pan-match', 'flip-3d-16f'],
    cooldownScenes: 2,
  },
  'code-walkthrough': {
    intent: 'code-walkthrough',
    candidates: [
      { block: 'DarkCodeTerminal', layout: 'code-terminal-stage' },
      { block: 'PromptConsole', layout: 'three-zone-spotlight' },
    ],
    preferredTransitions: ['camera-dive-morph', 'z-drop'],
    cooldownScenes: 2,
  },
  'chronological-steps': {
    intent: 'chronological-steps',
    candidates: [
      { block: 'HorizontalTimelineTrack', layout: 'staggered-horizontal-timeline' },
      { block: 'MilestoneGateTrack', layout: 'step-milestone-gates' },
    ],
    preferredTransitions: ['whip-pan-match', 'camera-dive-morph'],
    cooldownScenes: 3,
  },
  'number-shock': {
    intent: 'number-shock',
    candidates: [
      { block: 'HeroMetricSpotlight', layout: 'hero-metric-pillars' },
      { block: 'CircularGaugeConsole', layout: 'three-zone-spotlight' },
    ],
    preferredTransitions: ['z-drop', 'camera-dive-morph'],
    cooldownScenes: 3,
  },
  'filter-narrowing': {
    intent: 'filter-narrowing',
    candidates: [
      { block: 'FunnelFilterStack', layout: 'converging-funnel-stage' },
      { block: 'SplitFanOut', layout: 'split-root-fanout-1to3' },
    ],
    preferredTransitions: ['whip-pan-match', 'z-drop'],
    cooldownScenes: 3,
  },
  'decision-summary': {
    intent: 'decision-summary',
    candidates: [{ block: 'BentoDeck2Plus3', layout: 'bento-2plus3-deck' }],
    preferredTransitions: ['z-drop'],
    cooldownScenes: 5,
  },
};

export interface ThemeSpec {
  id: string;
  accentRgb: Rgb;
  secondaryRgb: Rgb;
  dangerRgb: Rgb;
  watermark?: string;
}

export const THEME_PALETTES: Record<string, ThemeSpec> = {
  amberStudio: { id: 'amberStudio', accentRgb: [245, 166, 35], secondaryRgb: [52, 211, 153], dangerRgb: [235, 87, 87] },
  emeraldTech: { id: 'emeraldTech', accentRgb: [52, 211, 153], secondaryRgb: [96, 165, 250], dangerRgb: [239, 68, 68] },
  cobaltPrecision: { id: 'cobaltPrecision', accentRgb: [96, 165, 250], secondaryRgb: [245, 166, 35], dangerRgb: [244, 63, 94] },
  violetCreative: { id: 'violetCreative', accentRgb: [167, 139, 250], secondaryRgb: [52, 211, 153], dangerRgb: [251, 113, 133] },
};

export interface PlannedSceneSpec {
  intent: SemanticBeatIntent;
  block: EngineBlockName;
  layout: LayoutPresetId;
  transitionIn: TransitionKind;
}

/**
 * 确定性分镜编排求解器：
 * 输入整条口播提炼出的语义意图数组，按冷却窗口自动分配不重样的 2.5D 几何积木 + 交替无叠影转场方式！
 */
export function planStoryboardFromIntents(intents: SemanticBeatIntent[]): PlannedSceneSpec[] {
  const plan: PlannedSceneSpec[] = [];
  for (let i = 0; i < intents.length; i++) {
    const rule = ARCHETYPE_RULES[intents[i]];
    const recentBlocks = plan.slice(Math.max(0, i - rule.cooldownScenes)).map((p) => p.block);
    const chosenPair =
      rule.candidates.find((c) => !recentBlocks.includes(c.block)) ?? rule.candidates[0];

    const prevTransition = plan[i - 1]?.transitionIn;
    const transitionIn =
      rule.preferredTransitions.find((t) => t !== prevTransition) ?? rule.preferredTransitions[0];

    plan.push({
      intent: intents[i],
      block: chosenPair.block,
      layout: chosenPair.layout,
      transitionIn,
    });
  }
  return plan;
}

/** 兼容旧版导出签名 */
export function selectDiverseLayouts(intents: SemanticBeatIntent[]): LayoutPresetId[] {
  return planStoryboardFromIntents(intents).map((p) => p.layout);
}
