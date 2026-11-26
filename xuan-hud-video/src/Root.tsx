import React from 'react';
import { Composition, Folder } from 'remotion';
import { FPS, HEIGHT, WIDTH } from './design/tokens';
import { ENGINE_GALLERY_FRAMES, EngineGallery } from './engine/EngineGallery';
import { AGY_EPISODE_TOTAL_FRAMES, AgyEpisodeFull } from './episodes/agy-slash-commands/EpisodeFull';
import { AGY_V2_FULL_FRAMES, AgyV2FullVideo } from './compositions/AgyV2FullVideo';

/**
 * 唯一正式生产入口：
 * - `Episode-*` 是单源全片入口；样片直接用 `--frames=0-1269` 从正式全片截取，严禁再另建分叉样片入口！
 * - `LegacyBaseline` 仅保留旧版 V2 只读对照，严禁用于新视频渲染。
 */
export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Folder name="Episodes">
        <Composition
          id="Episode-AgySlashCommands"
          component={AgyEpisodeFull}
          durationInFrames={AGY_EPISODE_TOTAL_FRAMES}
          fps={FPS}
          width={WIDTH}
          height={HEIGHT}
        />
      </Folder>

      <Folder name="Engine">
        <Composition
          id="EngineGallery"
          component={EngineGallery}
          durationInFrames={ENGINE_GALLERY_FRAMES}
          fps={FPS}
          width={WIDTH}
          height={HEIGHT}
        />
      </Folder>

      <Folder name="LegacyBaseline">
        <Composition
          id="AgyV2FullVideo"
          component={AgyV2FullVideo}
          durationInFrames={AGY_V2_FULL_FRAMES}
          fps={FPS}
          width={WIDTH}
          height={HEIGHT}
        />
      </Folder>
    </>
  );
};
