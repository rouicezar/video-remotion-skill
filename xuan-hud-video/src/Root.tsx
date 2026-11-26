import React from 'react';
import { Composition } from 'remotion';
import { FPS, HEIGHT, WIDTH } from './design/tokens';
import { AgyV2Showcase } from './compositions/AgyV2Showcase';
import { AGY_V2_SAMPLE_FRAMES, AgyV2MotionSample } from './compositions/AgyV2MotionSample';
import { AGY_V2_FULL_FRAMES, AgyV2FullVideo } from './compositions/AgyV2FullVideo';

// 已淘汰的 HudFrame 时代合成（Universal/Replica/GooglePerks/AgySlashCommands）已移到 legacy/，不再注册。
export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition id="AgyV2Showcase" component={AgyV2Showcase} durationInFrames={7} fps={FPS} width={WIDTH} height={HEIGHT} />
      <Composition id="AgyV2MotionSample" component={AgyV2MotionSample} durationInFrames={AGY_V2_SAMPLE_FRAMES} fps={FPS} width={WIDTH} height={HEIGHT} />
      <Composition id="AgyV2FullVideo" component={AgyV2FullVideo} durationInFrames={AGY_V2_FULL_FRAMES} fps={FPS} width={WIDTH} height={HEIGHT} />
    </>
  );
};
