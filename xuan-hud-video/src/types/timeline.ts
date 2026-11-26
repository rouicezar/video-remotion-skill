export type MoveType =
  // Episode 2: Image & Transition (9 moves)
  | 'skeleton-fill'
  | 'deal-in'
  | 'drop-gather'
  | 'depth-tunnel'
  | 'helix'
  | 'flip-3d'
  | 'lift-make-way'
  | 'color-swap'
  | 'slice-swap'
  // Episode 1: Space & Camera (8 moves)
  | 'world-canvas'
  | 'tilted-placement'
  | 'depth-parallax'
  | 'angled-dolly'
  | 'slow-push-in'
  | 'walk-in'
  | 'bg-blur-pushback'
  | 'in-place-zoom';

export interface SubtitleCue {
  startSec: number;
  endSec: number;
  zh: string;
  en?: string;
}

export interface PromptToken {
  text: string;
  highlight?: boolean;
}

export interface ReadoutMetric {
  labelEn: string;
  labelZh: string;
  value: string;
  accent?: boolean;
}

export interface UniversalScene {
  id: string;
  type:
    | 'hook'
    | 'overview'
    | 'chapter'
    | 'move-bumper'
    | 'move-demo'
    | 'comparison'
    | 'rule-chart'
    | 'summary'
    | 'cheatsheet-cta';
  startSec: number;
  endSec: number;
  title?: string;
  subtitle?: string;
  badge?: string;
  index?: number;
  total?: number;
  moveType?: MoveType;
  cameraMoving?: boolean;
  promptTokens?: PromptToken[];
  ctaText?: string;
  items?: Array<{
    code: string;
    title: string;
    subtitle?: string;
    category?: string;
    description?: string;
    image?: string;
    color?: string;
    tag?: string;
  }>;
  metrics?: {
    status: string;
    items: ReadoutMetric[];
    graphMode?: 'step' | 'sine' | 'pulse' | 'curve' | 'flat';
  };
}

export interface UniversalTimeline {
  meta: {
    title: string;
    episodeBadge?: string;
    watermark?: string;
    fps: number;
    durationSec: number;
    audioFile?: string;
  };
  subtitles: SubtitleCue[];
  scenes: UniversalScene[];
}
