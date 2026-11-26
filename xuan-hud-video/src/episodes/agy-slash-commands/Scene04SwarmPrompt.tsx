import React from 'react';
import { Audio, staticFile } from 'remotion';
import { AntigravityLogo, DesktopAppIcon, TerminalCliIcon } from '../../design/BrandLogos';
import { FPS } from '../../design/tokens';
import { AGY_COMMANDS_SUBTITLES } from '../../data/agyCommandsSubtitles';
import { PromptConsole, Stage } from '../../engine';

const SCENE_START_SEC = 54.4;
const SCENE_END_SEC = 68.3;
export const AGY_SCENE04_FRAMES = Math.round((SCENE_END_SEC - SCENE_START_SEC) * FPS);

const relFrame = (absSec: number) => Math.round((absSec - SCENE_START_SEC) * FPS);

const LOCAL_SUBTITLES = AGY_COMMANDS_SUBTITLES
  .filter((c) => c.endSec > SCENE_START_SEC && c.startSec < SCENE_END_SEC)
  .map((c) => ({
    ...c,
    startSec: Math.max(0, c.startSec - SCENE_START_SEC),
    endSec: c.endSec - SCENE_START_SEC,
  }));

/**
 * 新引擎示范章节（≤ 250 行单源架构 `src/episodes/<slug>/SceneXX.tsx`）：
 * 用 `src/engine` 复现《Antigravity 的 5 条神级斜杠指令》Scene04（/swarm 抄作业提示词卡），
 * 同时修复旧版问题：人声 -14 LUFS 标准化音频、PhysicalGlass3D 顶层折射扫光、零 <24px 小字、组件内聚音效。
 */
export const AgySwarmPromptScene: React.FC<{ withVoiceover?: boolean }> = ({ withVoiceover = false }) => {
  return (
    <Stage
      stepIndex={1}
      totalSteps={5}
      chapterLabel="01 · /swarm · PARALLEL TOPOLOGY"
      subtitles={LOCAL_SUBTITLES}
      theme={{
        watermark: 'ANTIGRAVITY',
        brandIcon: <AntigravityLogo size={30} />,
      }}
    >
      {withVoiceover && (
        <Audio
          src={staticFile('assets_agy/agy_commands_norm.wav')}
          startFrom={Math.round(SCENE_START_SEC * FPS)}
          volume={1}
        />
      )}
      <PromptConsole
        command="/swarm"
        headline="范围 + 验收"
        promptBody="把 src/modules 下面这 5 个独立模块都补齐错误处理和单元测试，完成后统一跑全量测试通过。"
        tags={[
          { label: '① 拆分范围', at: relFrame(59.0) },
          { label: '② 验收标准', at: relFrame(60.0) },
        ]}
        platforms={[
          { label: 'Antigravity App', at: relFrame(63.0), icon: <DesktopAppIcon size={26} /> },
          { label: 'Antigravity CLI', at: relFrame(64.23), icon: <TerminalCliIcon size={26} /> },
        ]}
        planBadge={{ label: '免费计划可用', at: relFrame(66.1), tone: 'green' }}
      />
    </Stage>
  );
};
