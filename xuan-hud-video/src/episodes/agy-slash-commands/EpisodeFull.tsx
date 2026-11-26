import React from 'react';
import { Audio, Sequence, staticFile, useCurrentFrame } from 'remotion';
import { AntigravityLogo } from '../../design/BrandLogos';
import { AGY_COMMANDS_SUBTITLES } from '../../data/agyCommandsSubtitles';
import { Stage } from '../../engine';
import { SCENE01_FRAMES, Scene01HookDeck } from './Scene01HookDeck';
import { SCENE02_FRAMES, Scene02SwarmFanOut } from './Scene02SwarmFanOut';
import { SCENE03_FRAMES, Scene03FlipStarBurst } from './Scene03FlipStarBurst';
import { AGY_SCENE04_FRAMES, AgySwarmPromptContent } from './Scene04SwarmPrompt';

/**
 * 正式单源全片唯一入口（EpisodeFull）：
 * - 样片与成片彻底共用同一条时间线：审样片直接 `--frames=0-1269` 截取前 3 场，批准段原样留在全片中
 * - 严格挂载用户原始口播 `assets_agy/agy_commands.wav`（原音量、原语速、原停顿，严禁做响度标准化篡改）
 * - 零 Sequence 交叉重叠（彻底杜绝双层文字叠影）
 */
export const AGY_SAMPLE_END_FRAME = SCENE01_FRAMES + SCENE02_FRAMES + SCENE03_FRAMES - 1; // 0..1269 (42.33s)
export const AGY_EPISODE_TOTAL_FRAMES =
  SCENE01_FRAMES + SCENE02_FRAMES + SCENE03_FRAMES + AGY_SCENE04_FRAMES;

export const AgyEpisodeFull: React.FC = () => {
  const frame = useCurrentFrame();
  const s2From = SCENE01_FRAMES;
  const s3From = s2From + SCENE02_FRAMES;
  const s4From = s3From + SCENE03_FRAMES;

  const chapterLabel =
    frame < s2From
      ? 'OVERVIEW · 5 SLASH COMMANDS'
      : frame < s3From
        ? '01 · /swarm · 1-TO-3 PARALLEL SPLIT'
        : frame < s4From
          ? '01 · /swarm · 3D FLIP TO STAR TOPOLOGY'
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
      {/* 严格原样挂载用户提供的原始口播音频，不做任何响度/动态范围篡改 */}
      <Audio src={staticFile('assets_agy/agy_commands.wav')} volume={1} />

      <Sequence from={0} durationInFrames={SCENE01_FRAMES}>
        <Scene01HookDeck />
      </Sequence>

      <Sequence from={s2From} durationInFrames={SCENE02_FRAMES}>
        <Scene02SwarmFanOut />
      </Sequence>

      <Sequence from={s3From} durationInFrames={SCENE03_FRAMES}>
        <Scene03FlipStarBurst />
      </Sequence>

      <Sequence from={s4From} durationInFrames={AGY_SCENE04_FRAMES}>
        <AgySwarmPromptContent />
      </Sequence>
    </Stage>
  );
};
