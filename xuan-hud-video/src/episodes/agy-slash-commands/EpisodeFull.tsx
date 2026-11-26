import React from 'react';
import { Audio, Sequence, staticFile, useCurrentFrame } from 'remotion';
import { AntigravityLogo } from '../../design/BrandLogos';
import { FPS } from '../../design/tokens';
import { AGY_COMMANDS_SUBTITLES } from '../../data/agyCommandsSubtitles';
import { Stage, validateTimelineContinuity } from '../../engine';
import { SCENE01_END_SEC, SCENE01_FRAMES, SCENE01_START_SEC, Scene01HookDeck } from './Scene01HookDeck';
import { SCENE02_END_SEC, SCENE02_FRAMES, SCENE02_START_SEC, Scene02SwarmFanOut } from './Scene02SwarmFanOut';
import { SCENE03_END_SEC, SCENE03_FRAMES, SCENE03_START_SEC, Scene03FlipStarBurst } from './Scene03FlipStarBurst';
import {
  SCENE03B_END_SEC,
  SCENE03B_START_SEC,
  Scene03bSwarmBoardVerifier,
} from './Scene03bSwarmBoardVerifier';
import {
  AgySwarmPromptContent,
  SCENE04_END_SEC,
  SCENE04_START_SEC,
} from './Scene04SwarmPrompt';

/** 声明式场景时间表（构建/加载期立即执行连续性硬门禁校验，任何断档或重叠 > 0.06s 直接报错！） */
export const AGY_TIMELINE_SEGMENTS = [
  { id: 'Scene01HookDeck', startSec: SCENE01_START_SEC, endSec: SCENE01_END_SEC },
  { id: 'Scene02SwarmFanOut', startSec: SCENE02_START_SEC, endSec: SCENE02_END_SEC },
  { id: 'Scene03FlipStarBurst', startSec: SCENE03_START_SEC, endSec: SCENE03_END_SEC },
  { id: 'Scene03bSwarmBoardVerifier', startSec: SCENE03B_START_SEC, endSec: SCENE03B_END_SEC },
  { id: 'Scene04SwarmPrompt', startSec: SCENE04_START_SEC, endSec: SCENE04_END_SEC },
];

validateTimelineContinuity(AGY_TIMELINE_SEGMENTS);

export const AGY_SAMPLE_END_FRAME = SCENE01_FRAMES + SCENE02_FRAMES + SCENE03_FRAMES - 1; // 0..1269 (42.33s)
export const AGY_EPISODE_TOTAL_FRAMES = Math.round(SCENE04_END_SEC * FPS);

const f = (sec: number) => Math.round(sec * FPS);

/**
 * 正式单源全片唯一入口（EpisodeFull）：
 * - 每场起点由其真实的 `startSec` 精确换算，并通过 `validateTimelineContinuity` 强制校验零断档/零重叠
 * - 样片直接 `--frames=0-1269` 从本入口截取；严格原样挂载用户原始口播 `assets_agy/agy_commands.wav`
 */
export const AgyEpisodeFull: React.FC = () => {
  const frame = useCurrentFrame();
  const s2From = f(SCENE02_START_SEC);
  const s3From = f(SCENE03_START_SEC);
  const s3bFrom = f(SCENE03B_START_SEC);
  const s4From = f(SCENE04_START_SEC);

  const chapterLabel =
    frame < s2From
      ? 'OVERVIEW · 5 SLASH COMMANDS'
      : frame < s3From
        ? '01 · /swarm · 1-TO-3 PARALLEL SPLIT'
        : frame < s3bFrom
          ? '01 · /swarm · 3D FLIP TO STAR TOPOLOGY'
          : frame < s4From
            ? '01 · /swarm · SHARED BOARD & @VERIFIER'
            : '01 · /swarm · COPY-READY PROMPT';

  return (
    <Stage
      stepIndex={1}
      totalSteps={5}
      chapterLabel={chapterLabel}
      subtitles={AGY_COMMANDS_SUBTITLES}
      theme={{
        watermark: 'ANTIGRAVITY',
        brandIcon: <AntigravityLogo size={30} />,
      }}
    >
      <Audio src={staticFile('assets_agy/agy_commands.wav')} volume={1} />

      <Sequence from={0} durationInFrames={s2From}>
        <Scene01HookDeck />
      </Sequence>

      <Sequence from={s2From} durationInFrames={s3From - s2From}>
        <Scene02SwarmFanOut />
      </Sequence>

      <Sequence from={s3From} durationInFrames={s3bFrom - s3From}>
        <Scene03FlipStarBurst />
      </Sequence>

      <Sequence from={s3bFrom} durationInFrames={s4From - s3bFrom}>
        <Scene03bSwarmBoardVerifier />
      </Sequence>

      <Sequence from={s4From} durationInFrames={AGY_EPISODE_TOTAL_FRAMES - s4From}>
        <AgySwarmPromptContent />
      </Sequence>
    </Stage>
  );
};
