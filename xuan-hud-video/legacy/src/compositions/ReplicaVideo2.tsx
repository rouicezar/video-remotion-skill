import React from 'react';
import { Audio, Sequence, staticFile } from 'remotion';
import { SubtitleOverlay, WorldCanvas } from '../design/Chrome';
import { FPS } from '../design/tokens';
import { REPLICA2_SUBTITLES } from '../data/replica2Subtitles';
import { Ep1IntroScene, Ep1OutroScene } from '../components/scenes/Ep1Scenes';
import { MoveBumperScene } from '../components/scenes/ChapterAndBumper';
import {
  Ep1Move01WorldCanvas,
  Ep1Move02TiltedPlacement,
  Ep1Move03DepthParallax,
  Ep1Move04AngledDolly,
} from '../components/moves/SpatialMoves';
import {
  Ep1Move05SlowPushIn,
  Ep1Move06WalkIn,
  Ep1Move07BgBlur,
  Ep1Move08InPlaceZoom,
  Ep1RuleVelocityScene,
} from '../components/moves/CameraMoves';

const f = (sec: number) => Math.round(sec * FPS);

export const REPLICA2_TOTAL_FRAMES = 8066; // 268.87s @ 30fps

export const ReplicaVideo2: React.FC = () => {
  return (
    <WorldCanvas watermark="Xuan">
      <Audio src={staticFile('assets/audio_v2.m4a')} />

      {/* 00:00.00 - 00:54.40 : Episode 1 Intro + 4-Layer Architecture + 4-Part Roadmap + 8-Move Overview */}
      <Sequence from={f(0)} durationInFrames={f(54.4)}>
        <Ep1IntroScene />
      </Sequence>

      {/* 00:54.40 - 00:56.80 : Move 01 Bumper */}
      <Sequence from={f(54.4)} durationInFrames={f(56.8 - 54.4)}>
        <MoveBumperScene
          moveNum="01"
          labelTop="第 1 招"
          titleZh="世界画布"
          titleEn="WORLD CANVAS"
          subtitleTags={['一块大画布', '深色底 #111318']}
        />
      </Sequence>

      {/* 00:56.80 - 01:27.80 : Move 01 World Canvas Demo */}
      <Sequence from={f(56.8)} durationInFrames={f(87.8 - 56.8)}>
        <Ep1Move01WorldCanvas />
      </Sequence>

      {/* 01:27.80 - 01:34.30 : Move 02 Bumper */}
      <Sequence from={f(87.8)} durationInFrames={f(94.3 - 87.8)}>
        <MoveBumperScene
          moveNum="02"
          labelTop="第 2 招"
          titleZh="倾斜摆放"
          titleEn="TILTED PLACEMENT"
          subtitleTags={['正面太平', '自己斜一点']}
        />
      </Sequence>

      {/* 01:34.30 - 01:45.72 : Move 02 Tilted Placement Demo */}
      <Sequence from={f(94.3)} durationInFrames={f(105.72 - 94.3)}>
        <Ep1Move02TiltedPlacement />
      </Sequence>

      {/* 01:45.72 - 01:52.96 : Move 03 Bumper */}
      <Sequence from={f(105.72)} durationInFrames={f(112.96 - 105.72)}>
        <MoveBumperScene
          moveNum="03"
          labelTop="第 3 招"
          titleZh="景深分层"
          titleEn="DEPTH & PARALLAX"
          subtitleTags={['倾角 ✓', '还缺：前后层次']}
        />
      </Sequence>

      {/* 01:52.96 - 02:10.52 : Move 03 Depth Parallax Demo */}
      <Sequence from={f(112.96)} durationInFrames={f(130.52 - 112.96)}>
        <Ep1Move03DepthParallax />
      </Sequence>

      {/* 02:10.52 - 02:18.72 : Move 04 Bumper */}
      <Sequence from={f(130.52)} durationInFrames={f(138.72 - 130.52)}>
        <MoveBumperScene
          moveNum="04"
          labelTop="第 4 招"
          titleZh="斜向运镜"
          titleEn="ANGLED CAMERA MOVE"
          subtitleTags={['不硬切 ✕', '斜着推 + 多绕 7-10°']}
        />
      </Sequence>

      {/* 02:18.72 - 02:38.20 : Move 04 Angled Dolly Demo */}
      <Sequence from={f(138.72)} durationInFrames={f(158.2 - 138.72)}>
        <Ep1Move04AngledDolly />
      </Sequence>

      {/* 02:38.20 - 02:44.52 : Move 05 Bumper */}
      <Sequence from={f(158.2)} durationInFrames={f(164.52 - 158.2)}>
        <MoveBumperScene
          moveNum="05"
          labelTop="第 5 招"
          titleZh="缓慢推进"
          titleEn="SLOW PUSH-IN"
          subtitleTags={['到一张素材上', '停止不动？']}
        />
      </Sequence>

      {/* 02:44.52 - 02:57.72 : Move 05 Slow Push-In Demo */}
      <Sequence from={f(164.52)} durationInFrames={f(177.72 - 164.52)}>
        <Ep1Move05SlowPushIn />
      </Sequence>

      {/* 02:57.72 - 03:06.36 : Move 06 Bumper */}
      <Sequence from={f(177.72)} durationInFrames={f(186.36 - 177.72)}>
        <MoveBumperScene
          moveNum="06"
          labelTop="第 6 招"
          titleZh="走进画面"
          titleEn="WALK-IN"
          subtitleTags={['流程 · 时间线', '铺成一条路', '镜头压低']}
        />
      </Sequence>

      {/* 03:06.36 - 03:16.28 : Move 06 Walk-In Demo */}
      <Sequence from={f(186.36)} durationInFrames={f(196.28 - 186.36)}>
        <Ep1Move06WalkIn />
      </Sequence>

      {/* 03:16.28 - 03:30.04 : Motion Sickness Rule Interlude */}
      <Sequence from={f(196.28)} durationInFrames={f(210.04 - 196.28)}>
        <Ep1RuleVelocityScene />
      </Sequence>

      {/* 03:30.04 - 03:39.20 : Move 07 Bumper */}
      <Sequence from={f(210.04)} durationInFrames={f(219.2 - 210.04)}>
        <MoveBumperScene
          moveNum="07"
          labelTop="第 7 招"
          titleZh="背景虚化"
          titleEn="BACKGROUND BLUR"
          subtitleTags={['新内容出现', '后层退后 94% · 虚化 4px']}
        />
      </Sequence>

      {/* 03:39.20 - 03:49.28 : Move 07 Background Blur Demo */}
      <Sequence from={f(219.2)} durationInFrames={f(229.28 - 219.2)}>
        <Ep1Move07BgBlur />
      </Sequence>

      {/* 03:49.28 - 03:54.60 : Move 08 Bumper */}
      <Sequence from={f(229.28)} durationInFrames={f(234.6 - 229.28)}>
        <MoveBumperScene
          moveNum="08"
          labelTop="第 8 招"
          titleZh="原位放大"
          titleEn="IN-PLACE ZOOM"
          subtitleTags={['多个内容', '挑出重点 · 原位 ×2.4']}
        />
      </Sequence>

      {/* 03:54.60 - 04:07.16 : Move 08 In-Place Zoom Demo */}
      <Sequence from={f(234.6)} durationInFrames={f(247.16 - 234.6)}>
        <Ep1Move08InPlaceZoom />
      </Sequence>

      {/* 04:07.16 - 04:28.87 : 8-Move Recap + Prompt Cheat-Sheet + Comment CTA */}
      <Sequence from={f(247.16)} durationInFrames={REPLICA2_TOTAL_FRAMES - f(247.16)}>
        <Ep1OutroScene />
      </Sequence>

      <SubtitleOverlay subtitles={REPLICA2_SUBTITLES} />
    </WorldCanvas>
  );
};
