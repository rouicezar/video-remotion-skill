import React from 'react';
import { Composition, Folder } from 'remotion';
import { FPS, HEIGHT, WIDTH } from './design/tokens';
import { AgyV2Showcase } from './compositions/AgyV2Showcase';
import { AGY_V2_SAMPLE_FRAMES, AgyV2MotionSample } from './compositions/AgyV2MotionSample';
import { AGY_V2_FULL_FRAMES, AgyV2FullVideo } from './compositions/AgyV2FullVideo';
import { ENGINE_GALLERY_FRAMES, EngineGallery } from './engine/EngineGallery';
import { SAMPLE_V3_TOTAL_FRAMES, SampleMotionV3 } from './episodes/agy-slash-commands/SampleMotionV3';
import { AGY_SCENE04_FRAMES, AgySwarmPromptScene } from './episodes/agy-slash-commands/Scene04SwarmPrompt';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Folder name="Engine">
        <Composition
          id="SampleMotionV3"
          component={SampleMotionV3}
          durationInFrames={SAMPLE_V3_TOTAL_FRAMES}
          fps={FPS}
          width={WIDTH}
          height={HEIGHT}
        />
        <Composition
          id="EngineGallery"
          component={EngineGallery}
          durationInFrames={ENGINE_GALLERY_FRAMES}
          fps={FPS}
          width={WIDTH}
          height={HEIGHT}
        />
        <Composition
          id="Episode-AgySwarmPrompt"
          component={() => <AgySwarmPromptScene withVoiceover />}
          durationInFrames={AGY_SCENE04_FRAMES}
          fps={FPS}
          width={WIDTH}
          height={HEIGHT}
        />
      </Folder>

      <Folder name="BaselineV2">
        <Composition id="AgyV2Showcase" component={AgyV2Showcase} durationInFrames={7} fps={FPS} width={WIDTH} height={HEIGHT} />
        <Composition id="AgyV2MotionSample" component={AgyV2MotionSample} durationInFrames={AGY_V2_SAMPLE_FRAMES} fps={FPS} width={WIDTH} height={HEIGHT} />
        <Composition id="AgyV2FullVideo" component={AgyV2FullVideo} durationInFrames={AGY_V2_FULL_FRAMES} fps={FPS} width={WIDTH} height={HEIGHT} />
      </Folder>
    </>
  );
};
