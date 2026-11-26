import React from 'react';
import { Composition } from 'remotion';
import { FPS, HEIGHT, WIDTH } from './design/tokens';
import { REPLICA_TOTAL_FRAMES, ReplicaVideo } from './compositions/ReplicaVideo';
import { REPLICA2_TOTAL_FRAMES, ReplicaVideo2 } from './compositions/ReplicaVideo2';
import { GOOGLE_PERKS_TOTAL_FRAMES, GooglePerksVideo } from './compositions/GooglePerksVideo';
import { AGY_COMMANDS_TOTAL_FRAMES, AgySlashCommandsVideo } from './compositions/AgySlashCommandsVideo';
import { AgyV2Showcase } from './compositions/AgyV2Showcase';
import { AGY_V2_SAMPLE_FRAMES, AgyV2MotionSample } from './compositions/AgyV2MotionSample';
import { AGY_V2_FULL_FRAMES, AgyV2FullVideo } from './compositions/AgyV2FullVideo';
import { UniversalVideo } from './compositions/UniversalVideo';
import { UniversalTimeline } from './types/timeline';

const DEFAULT_UNIVERSAL_TIMELINE: UniversalTimeline = {
  meta: {
    title: 'Universal HUD Video Demo',
    episodeBadge: 'HUD 动效模板',
    watermark: 'STUDIO',
    fps: FPS,
    durationSec: 12,
  },
  subtitles: [
    { startSec: 0, endSec: 4, zh: '只需提供音频与字幕', en: 'Just provide audio and subtitles' },
    { startSec: 4, endSec: 8, zh: '自动生成暗黑 HUD 动效视频', en: 'Auto-generate dark HUD motion graphics' },
    { startSec: 8, endSec: 12, zh: '支持任意主题稳定产出', en: 'Stable output for any topic' },
  ],
  scenes: [
    {
      id: 'hook',
      type: 'hook',
      startSec: 0,
      endSec: 4,
      badge: 'UNIVERSAL ENGINE',
      title: '音频 + 字幕 自动生成',
      subtitle: '暗黑 HUD 动效视频引擎',
    },
    {
      id: 'demo-1',
      type: 'move-demo',
      startSec: 4,
      endSec: 8,
      index: 1,
      total: 3,
      title: '骨架填充',
      subtitle: 'SKELETON FILL',
      moveType: 'skeleton-fill',
      cameraMoving: false,
      promptTokens: [
        { text: '提供 ' },
        { text: '音频 + SRT 字幕', highlight: true },
        { text: '，自动解析分镜并渲染 ' },
        { text: '1080p 30fps 成片', highlight: true },
      ],
    },
    {
      id: 'outro',
      type: 'cheatsheet-cta',
      startSec: 8,
      endSec: 12,
      title: '要点回顾',
      ctaText: '立即开始创作',
      items: [
        { code: '01', title: '音频驱动', category: '输入', description: '自动读取音频精确时长' },
        { code: '02', title: '字幕分镜', category: '编排', description: '按字幕语义与节奏切分章节与动效' },
        { code: '03', title: '稳定渲染', category: '输出', description: 'Remotion 逐帧确定性渲染 H.264 MP4' },
      ],
    },
  ],
};

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="ReplicaVideo"
        component={ReplicaVideo}
        durationInFrames={REPLICA_TOTAL_FRAMES}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />
      <Composition
        id="ReplicaVideo2"
        component={ReplicaVideo2}
        durationInFrames={REPLICA2_TOTAL_FRAMES}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />
      <Composition
        id="GooglePerksVideo"
        component={GooglePerksVideo}
        durationInFrames={GOOGLE_PERKS_TOTAL_FRAMES}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />
      <Composition
        id="AgySlashCommandsVideo"
        component={AgySlashCommandsVideo}
        durationInFrames={AGY_COMMANDS_TOTAL_FRAMES}
        fps={FPS}
        width={1920}
        height={1280}
      />
      <Composition
        id="AgyV2Showcase"
        component={AgyV2Showcase}
        durationInFrames={7}
        fps={FPS}
        width={1920}
        height={1280}
      />
      <Composition
        id="AgyV2MotionSample"
        component={AgyV2MotionSample}
        durationInFrames={AGY_V2_SAMPLE_FRAMES}
        fps={FPS}
        width={1920}
        height={1280}
      />
      <Composition
        id="AgyV2FullVideo"
        component={AgyV2FullVideo}
        durationInFrames={AGY_V2_FULL_FRAMES}
        fps={FPS}
        width={1920}
        height={1280}
      />
      <Composition
        id="UniversalVideo"
        component={UniversalVideo}
        durationInFrames={360}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
        defaultProps={{ timeline: DEFAULT_UNIVERSAL_TIMELINE }}
        calculateMetadata={({ props }) => {
          const fpsVal = props.timeline?.meta?.fps ?? FPS;
          const durSec = props.timeline?.meta?.durationSec ?? 12;
          return {
            durationInFrames: Math.max(30, Math.ceil(durSec * fpsVal)),
            fps: fpsVal,
          };
        }}
      />
    </>
  );
};
