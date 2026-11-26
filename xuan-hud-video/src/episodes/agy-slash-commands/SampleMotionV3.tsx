import React from 'react';
import { Audio, Sequence, staticFile, useCurrentFrame } from 'remotion';
import { AntigravityLogo } from '../../design/BrandLogos';
import { FPS } from '../../design/tokens';
import { AGY_COMMANDS_SUBTITLES } from '../../data/agyCommandsSubtitles';
import { selectDiverseLayouts, Stage } from '../../engine';
import { SCENE01_FRAMES, Scene01HookDeck } from './Scene01HookDeck';
import { SCENE02_FRAMES, SCENE02_START_SEC, Scene02SwarmFanOut } from './Scene02SwarmFanOut';
import { SCENE03_END_SEC, SCENE03_FRAMES, SCENE03_START_SEC, Scene03FlipStarBurst } from './Scene03FlipStarBurst';

export const SAMPLE_V3_TOTAL_FRAMES = SCENE01_FRAMES + SCENE02_FRAMES + SCENE03_FRAMES; // 1270f (~42.33s)

// 通过目录库确定性校验连续 3 幕布局零重复（hook-overview -> parallel-fanout -> pain-to-reversal）
export const SAMPLE_V3_LAYOUT_PLAN = selectDiverseLayouts([
  'hook-overview',
  'parallel-fanout',
  'pain-to-reversal',
]);

const SAMPLE_SUBTITLES = AGY_COMMANDS_SUBTITLES.filter((c) => c.startSec < SCENE03_END_SEC);

/**
 * V3 灵魂动效审核样片（细体 300/400 + 16px 真 2.5D 挤出受光厚底座 + 3:2 三段舒展比例）：
 * - 零 Sequence 交叉重叠（彻底杜绝双层文字半透明叠影，全靠摄像机推进扩张与动势接力转场）
 * - 挂载 -14.6 LUFS 标准化口播原声 + 各场景内部同源内聚微音效
 */
export const SampleMotionV3: React.FC = () => {
  const frame = useCurrentFrame();
  const s2From = SCENE01_FRAMES;
  const s3From = SCENE01_FRAMES + SCENE02_FRAMES;

  const chapterLabel =
    frame < s2From
      ? 'OVERVIEW · 5 SLASH COMMANDS'
      : frame < s3From
        ? '01 · /swarm · 1-TO-3 PARALLEL SPLIT'
        : '01 · /swarm · 3D FLIP TO STAR TOPOLOGY';

  return (
    <Stage
      stepIndex={1}
      totalSteps={5}
      chapterLabel={chapterLabel}
      subtitles={SAMPLE_SUBTITLES}
      theme={{
        watermark: 'ANTIGRAVITY',
        brandIcon: <AntigravityLogo size={30} />,
      }}
    >
      <Audio
        src={staticFile('assets_agy/agy_commands_norm.wav')}
        endAt={Math.round(SCENE03_END_SEC * FPS)}
        volume={1}
      />

      <Sequence from={0} durationInFrames={SCENE01_FRAMES}>
        <Scene01HookDeck />
      </Sequence>

      <Sequence from={s2From} durationInFrames={SCENE02_FRAMES}>
        <Scene02SwarmFanOut />
      </Sequence>

      <Sequence from={s3From} durationInFrames={SCENE03_FRAMES}>
        <Scene03FlipStarBurst />
      </Sequence>
    </Stage>
  );
};

export { SCENE02_START_SEC, SCENE03_START_SEC };
