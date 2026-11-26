import React from 'react';
import { Audio, Sequence, staticFile } from 'remotion';
import { SubtitleOverlay, WorldCanvas } from '../design/Chrome';
import { FPS } from '../design/tokens';
import { REPLICA_SUBTITLES } from '../data/replicaSubtitles';
import {
  Episode1RecapScene,
  Episode2OverviewScene,
  IntroHookScene,
} from '../components/scenes/IntroScenes';
import { ChapterDividerScene, MoveBumperScene } from '../components/scenes/ChapterAndBumper';
import {
  Move01SkeletonDemo,
  Move02DealInDemo,
  Move03DropGatherDemo,
} from '../components/moves/EntranceMoves';
import {
  Move04DepthTunnelDemo,
  Move05HelixDemo,
  Move06Flip3DDemo,
} from '../components/moves/LayoutMoves';
import {
  Move07LiftMakeWayDemo,
  Move08ColorSwapDemo,
  Move09SliceSwapDemo,
} from '../components/moves/SwitchMoves';
import { CheatSheetCTAScene, SummaryRecapScene } from '../components/scenes/OutroScenes';

const f = (sec: number) => Math.round(sec * FPS);

export const REPLICA_TOTAL_FRAMES = 6971; // 232.37s @ 30fps

export const ReplicaVideo: React.FC = () => {
  return (
    <WorldCanvas watermark="Xuan">
      <Audio src={staticFile('assets/audio.m4a')} />

      {/* 00:00.00 - 00:10.76 : Intro Hook */}
      <Sequence from={f(0)} durationInFrames={f(10.76)}>
        <IntroHookScene />
      </Sequence>

      {/* 00:10.76 - 00:14.70 : Episode 1 Recap */}
      <Sequence from={f(10.76)} durationInFrames={f(14.7 - 10.76)}>
        <Episode1RecapScene />
      </Sequence>

      {/* 00:14.70 - 00:35.50 : Episode 2 Overview Matrix */}
      <Sequence from={f(14.7)} durationInFrames={f(35.5 - 14.7)}>
        <Episode2OverviewScene />
      </Sequence>

      {/* 00:35.50 - 00:41.36 : Chapter 01 Entrance */}
      <Sequence from={f(35.5)} durationInFrames={f(41.36 - 35.5)}>
        <ChapterDividerScene
          chapterNum="01"
          labelTop="第一块"
          titleZh="出场"
          titleEn="ENTRANCE"
          cameraMoving={false}
          diagramType="entrance"
        />
      </Sequence>

      {/* 00:41.36 - 00:43.44 : Move 01 Bumper */}
      <Sequence from={f(41.36)} durationInFrames={f(43.44 - 41.36)}>
        <MoveBumperScene
          moveNum="01"
          labelTop="第 1 招"
          titleZh="骨架填充"
          titleEn="SKELETON FILL"
          subtitleTags={['空骨架', '填内容']}
        />
      </Sequence>

      {/* 00:43.44 - 01:00.96 : Move 01 Demo */}
      <Sequence from={f(43.44)} durationInFrames={f(60.96 - 43.44)}>
        <Move01SkeletonDemo durationFrames={f(60.96 - 43.44)} />
      </Sequence>

      {/* 01:00.96 - 01:03.02 : Move 02 Bumper */}
      <Sequence from={f(60.96)} durationInFrames={f(63.02 - 60.96)}>
        <MoveBumperScene
          moveNum="02"
          labelTop="第 2 招"
          titleZh="发牌入场"
          titleEn="DEAL IN"
          subtitleTags={['一张接一张', '落到位置']}
        />
      </Sequence>

      {/* 01:03.02 - 01:19.16 : Move 02 Demo */}
      <Sequence from={f(63.02)} durationInFrames={f(79.16 - 63.02)}>
        <Move02DealInDemo />
      </Sequence>

      {/* 01:19.16 - 01:21.00 : Move 03 Bumper */}
      <Sequence from={f(79.16)} durationInFrames={f(81.0 - 79.16)}>
        <MoveBumperScene
          moveNum="03"
          labelTop="第 3 招"
          titleZh="落下收拢"
          titleEn="DROP & GATHER"
          subtitleTags={['一堆', '挑几张']}
        />
      </Sequence>

      {/* 01:21.00 - 01:39.00 : Move 03 Demo */}
      <Sequence from={f(81.0)} durationInFrames={f(99.0 - 81.0)}>
        <Move03DropGatherDemo />
      </Sequence>

      {/* 01:39.00 - 01:51.64 : Chapter 02 Layout */}
      <Sequence from={f(99.0)} durationInFrames={f(111.64 - 99.0)}>
        <ChapterDividerScene
          chapterNum="02"
          labelTop="第二块"
          titleZh="排布"
          titleEn="LAYOUT"
          cameraMoving={true}
          diagramType="layout"
        />
      </Sequence>

      {/* 01:51.64 - 01:53.72 : Move 04 Bumper */}
      <Sequence from={f(111.64)} durationInFrames={f(113.72 - 111.64)}>
        <MoveBumperScene
          moveNum="04"
          labelTop="第 4 招"
          titleZh="纵深穿梭"
          titleEn="DEPTH TUNNEL"
          subtitleTags={['往里的通道']}
        />
      </Sequence>

      {/* 01:53.72 - 02:08.00 : Move 04 Demo */}
      <Sequence from={f(113.72)} durationInFrames={f(128.0 - 113.72)}>
        <Move04DepthTunnelDemo />
      </Sequence>

      {/* 02:08.00 - 02:10.00 : Move 05 Bumper */}
      <Sequence from={f(128.0)} durationInFrames={f(130.0 - 128.0)}>
        <MoveBumperScene
          moveNum="05"
          labelTop="第 5 招"
          titleZh="环筒螺旋"
          titleEn="HELIX"
          subtitleTags={['圈成圆筒', '一层层往上']}
        />
      </Sequence>

      {/* 02:10.00 - 02:22.40 : Move 05 Demo */}
      <Sequence from={f(130.0)} durationInFrames={f(142.4 - 130.0)}>
        <Move05HelixDemo />
      </Sequence>

      {/* 02:22.40 - 02:24.52 : Move 06 Bumper */}
      <Sequence from={f(142.4)} durationInFrames={f(144.52 - 142.4)}>
        <MoveBumperScene
          moveNum="06"
          labelTop="第 6 招"
          titleZh="三维翻转"
          titleEn="3D FLIP"
          subtitleTags={['排成一圈']}
        />
      </Sequence>

      {/* 02:24.52 - 02:43.40 : Move 06 Demo */}
      <Sequence from={f(144.52)} durationInFrames={f(163.4 - 144.52)}>
        <Move06Flip3DDemo />
      </Sequence>

      {/* 02:43.40 - 02:52.04 : Chapter 03 Switch */}
      <Sequence from={f(163.4)} durationInFrames={f(172.04 - 163.4)}>
        <ChapterDividerScene
          chapterNum="03"
          labelTop="第三块"
          titleZh="切换"
          titleEn="SWITCH"
          cameraMoving={false}
          diagramType="switch"
          bgImages={['assets/xuan_orange.jpg', 'assets/xuan_green.jpg', 'assets/card_04.jpg']}
        />
      </Sequence>

      {/* 02:52.04 - 02:54.08 : Move 07 Bumper */}
      <Sequence from={f(172.04)} durationInFrames={f(174.08 - 172.04)}>
        <MoveBumperScene
          moveNum="07"
          labelTop="第 7 招"
          titleZh="放大让位"
          titleEn="LIFT & MAKE WAY"
          subtitleTags={['扇形抬起', '左右让开']}
        />
      </Sequence>

      {/* 02:54.08 - 03:06.70 : Move 07 Demo */}
      <Sequence from={f(174.08)} durationInFrames={f(186.7 - 174.08)}>
        <Move07LiftMakeWayDemo />
      </Sequence>

      {/* 03:06.70 - 03:08.82 : Move 08 Bumper */}
      <Sequence from={f(186.7)} durationInFrames={f(188.82 - 186.7)}>
        <MoveBumperScene
          moveNum="08"
          labelTop="第 8 招"
          titleZh="背景换色"
          titleEn="COLOR SWAP"
          subtitleTags={['换一张图', '背景跟着换']}
        />
      </Sequence>

      {/* 03:08.82 - 03:18.20 : Move 08 Demo */}
      <Sequence from={f(188.82)} durationInFrames={f(198.2 - 188.82)}>
        <Move08ColorSwapDemo />
      </Sequence>

      {/* 03:18.20 - 03:20.44 : Move 09 Bumper */}
      <Sequence from={f(198.2)} durationInFrames={f(200.44 - 198.2)}>
        <MoveBumperScene
          moveNum="09"
          labelTop="第 9 招"
          titleZh="切片换图"
          titleEn="SLICE SWAP"
          subtitleTags={['切成 5 条', '从下往上']}
        />
      </Sequence>

      {/* 03:20.44 - 03:33.50 : Move 09 Demo */}
      <Sequence from={f(200.44)} durationInFrames={f(213.5 - 200.44)}>
        <Move09SliceSwapDemo />
      </Sequence>

      {/* 03:33.50 - 03:41.20 : Summary Recap */}
      <Sequence from={f(213.5)} durationInFrames={f(221.2 - 213.5)}>
        <SummaryRecapScene />
      </Sequence>

      {/* 03:41.20 - 03:52.37 : Full 9-Move Prompt Cheat-Sheet + CTA */}
      <Sequence from={f(221.2)} durationInFrames={REPLICA_TOTAL_FRAMES - f(221.2)}>
        <CheatSheetCTAScene />
      </Sequence>

      {/* Global Bilingual Subtitles */}
      <SubtitleOverlay subtitles={REPLICA_SUBTITLES} />
    </WorldCanvas>
  );
};
