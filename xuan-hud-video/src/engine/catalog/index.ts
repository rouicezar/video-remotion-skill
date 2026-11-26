import { FONTS, WEIGHTS } from '../../design/tokens';
import { Rgb } from '../motion';

/**
 * 五维参数化设计目录库（Design & Motion Catalog v1）：
 * 1. TypographyScale（字号与细体字重梯度库）
 * 2. LayoutZonePreset（3:2 画布黄金空间网格库）
 * 3. MotionArchetype（入场/焦点/镜头/无感转场词典）
 * 4. BlockArchetype（语义意图 → 2.5D 几何积木映射表 + 连续防重冷却约束）
 * 5. ThemePalette（跨赛道主题色板库）
 */

export const TYPOGRAPHY_SCALE = {
  heroCommand: { fontFamily: FONTS.mono, fontSize: 96, fontWeight: WEIGHTS.regular, letterSpacing: -1.5 },
  heroMetric: { fontFamily: FONTS.display, fontSize: 84, fontWeight: WEIGHTS.light, letterSpacing: -1 },
  sceneTitle: { fontFamily: FONTS.sans, fontSize: 56, fontWeight: WEIGHTS.light, letterSpacing: 2.2 },
  cardTitle: { fontFamily: FONTS.sans, fontSize: 44, fontWeight: WEIGHTS.regular, letterSpacing: 1.6 },
  promptBody: { fontFamily: FONTS.sans, fontSize: 44, fontWeight: WEIGHTS.light, letterSpacing: 1.2, lineHeight: 1.72 },
  subLabel: { fontFamily: FONTS.sans, fontSize: 30, fontWeight: WEIGHTS.light, letterSpacing: 1.4 },
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
  | 'orbit-quadrant-loop';

export interface LayoutPresetSpec {
  id: LayoutPresetId;
  maxWidth: number;
  verticalPadding: [number, number];
  maxVisibleSubjects: number;
  requiresCameraFollowAboveNodes: number;
}

export const LAYOUT_PRESETS: Record<LayoutPresetId, LayoutPresetSpec> = {
  'hero-center-to-dock': { id: 'hero-center-to-dock', maxWidth: 1560, verticalPadding: [48, 42], maxVisibleSubjects: 1, requiresCameraFollowAboveNodes: 4 },
  'three-zone-spotlight': { id: 'three-zone-spotlight', maxWidth: 1500, verticalPadding: [44, 36], maxVisibleSubjects: 2, requiresCameraFollowAboveNodes: 4 },
  'bento-2plus3-deck': { id: 'bento-2plus3-deck', maxWidth: 1600, verticalPadding: [44, 38], maxVisibleSubjects: 5, requiresCameraFollowAboveNodes: 4 },
  'split-root-fanout-1to3': { id: 'split-root-fanout-1to3', maxWidth: 1620, verticalPadding: [46, 40], maxVisibleSubjects: 4, requiresCameraFollowAboveNodes: 3 },
  'center-flip-to-radial-star': { id: 'center-flip-to-radial-star', maxWidth: 1600, verticalPadding: [42, 36], maxVisibleSubjects: 5, requiresCameraFollowAboveNodes: 4 },
  'step-milestone-gates': { id: 'step-milestone-gates', maxWidth: 1620, verticalPadding: [46, 40], maxVisibleSubjects: 4, requiresCameraFollowAboveNodes: 3 },
  'orbit-quadrant-loop': { id: 'orbit-quadrant-loop', maxWidth: 1560, verticalPadding: [44, 38], maxVisibleSubjects: 4, requiresCameraFollowAboveNodes: 4 },
};

export type SemanticBeatIntent =
  | 'hook-overview'
  | 'parallel-fanout'
  | 'pain-to-reversal'
  | 'iterative-loop'
  | 'staged-gates'
  | 'verifiable-gauge'
  | 'official-proof'
  | 'copy-prompt'
  | 'decision-summary';

export type EngineBlockName =
  | 'BentoDeck2Plus3'
  | 'SplitFanOut'
  | 'FlipSlab3D+StarBurstTopology'
  | 'OrbitLoopRing'
  | 'MilestoneGateTrack'
  | 'CircularGaugeConsole'
  | 'OfficialCropWindow'
  | 'PromptConsole';

export interface ArchetypeRule {
  intent: SemanticBeatIntent;
  block: EngineBlockName;
  preferredLayouts: LayoutPresetId[];
  transitionIn: 'z-drop' | 'camera-dive-morph' | 'flip-3d-16f' | 'whip-pan-match';
  /** 冷却窗口：至少间隔多少个场景才允许再次使用同一几何骨架，防止单调 */
  cooldownScenes: number;
}

export const ARCHETYPE_RULES: Record<SemanticBeatIntent, ArchetypeRule> = {
  'hook-overview': {
    intent: 'hook-overview',
    block: 'BentoDeck2Plus3',
    preferredLayouts: ['hero-center-to-dock', 'bento-2plus3-deck'],
    transitionIn: 'z-drop',
    cooldownScenes: 4,
  },
  'parallel-fanout': {
    intent: 'parallel-fanout',
    block: 'SplitFanOut',
    preferredLayouts: ['split-root-fanout-1to3', 'center-flip-to-radial-star'],
    transitionIn: 'camera-dive-morph',
    cooldownScenes: 2,
  },
  'pain-to-reversal': {
    intent: 'pain-to-reversal',
    block: 'FlipSlab3D+StarBurstTopology',
    preferredLayouts: ['center-flip-to-radial-star'],
    transitionIn: 'flip-3d-16f',
    cooldownScenes: 2,
  },
  'iterative-loop': {
    intent: 'iterative-loop',
    block: 'OrbitLoopRing',
    preferredLayouts: ['orbit-quadrant-loop'],
    transitionIn: 'whip-pan-match',
    cooldownScenes: 3,
  },
  'staged-gates': {
    intent: 'staged-gates',
    block: 'MilestoneGateTrack',
    preferredLayouts: ['step-milestone-gates'],
    transitionIn: 'whip-pan-match',
    cooldownScenes: 3,
  },
  'verifiable-gauge': {
    intent: 'verifiable-gauge',
    block: 'CircularGaugeConsole',
    preferredLayouts: ['three-zone-spotlight'],
    transitionIn: 'camera-dive-morph',
    cooldownScenes: 3,
  },
  'official-proof': {
    intent: 'official-proof',
    block: 'OfficialCropWindow',
    preferredLayouts: ['three-zone-spotlight'],
    transitionIn: 'whip-pan-match',
    cooldownScenes: 2,
  },
  'copy-prompt': {
    intent: 'copy-prompt',
    block: 'PromptConsole',
    preferredLayouts: ['three-zone-spotlight'],
    transitionIn: 'camera-dive-morph',
    cooldownScenes: 1,
  },
  'decision-summary': {
    intent: 'decision-summary',
    block: 'BentoDeck2Plus3',
    preferredLayouts: ['bento-2plus3-deck'],
    transitionIn: 'z-drop',
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
};

/**
 * 确定性防重布局选择器：根据章节语义意图序列，自动避开冷却窗口内的重复布局，杜绝连续两幕长相雷同。
 */
export function selectDiverseLayouts(intents: SemanticBeatIntent[]): LayoutPresetId[] {
  const chosen: LayoutPresetId[] = [];
  for (let i = 0; i < intents.length; i++) {
    const rule = ARCHETYPE_RULES[intents[i]];
    const recent = chosen.slice(Math.max(0, i - rule.cooldownScenes));
    const candidate = rule.preferredLayouts.find((id) => !recent.includes(id)) ?? rule.preferredLayouts[0];
    chosen.push(candidate);
  }
  return chosen;
}
