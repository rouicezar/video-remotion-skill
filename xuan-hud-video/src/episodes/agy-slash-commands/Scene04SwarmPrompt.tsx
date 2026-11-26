import React from 'react';
import { Audio, staticFile } from 'remotion';
import { AntigravityLogo, DesktopAppIcon, TerminalCliIcon } from '../../design/BrandLogos';
import { FPS } from '../../design/tokens';
import { AGY_COMMANDS_SUBTITLES } from '../../data/agyCommandsSubtitles';
import { createSceneBeatSolver, PromptConsole, resolveAnchorSec, Stage } from '../../engine';

// 场景起止边界与内部所有微拍均由 SRT 文本锚点自动反查
export const SCENE04_START_SEC = resolveAnchorSec(AGY_COMMANDS_SUBTITLES, '那要用呢') - 0.06;
export const SCENE04_END_SEC = resolveAnchorSec(AGY_COMMANDS_SUBTITLES, '那第二种情况呢');
export const AGY_SCENE04_FRAMES = Math.round((SCENE04_END_SEC - SCENE04_START_SEC) * FPS);

const beats = createSceneBeatSolver(AGY_COMMANDS_SUBTITLES, SCENE04_START_SEC, SCENE04_END_SEC, FPS);
const LOCAL_SUBTITLES = beats.localSubtitles();

/** 供正式全片时间线 `EpisodeFull.tsx` 直接挂载的纯内容层（无重复 Stage/Audio） */
export const AgySwarmPromptContent: React.FC = () => (
  <PromptConsole
    command="/swarm"
    headline="范围 + 验收"
    promptBody="把 src/modules 下面这 5 个独立模块都补齐错误处理和单元测试，完成后统一跑全量测试通过。"
    tags={[
      { label: '① 拆分范围', at: beats.at('拆分的范围') },
      { label: '② 验收标准', at: beats.at({ anchor: '拆分的范围', offsetSec: 0.95 }) },
    ]}
    platforms={[
      { label: 'Antigravity App', at: beats.at('在Antigravity的App'), icon: <DesktopAppIcon size={26} /> },
      { label: 'Antigravity CLI', at: beats.at('在CLI里'), icon: <TerminalCliIcon size={26} /> },
    ]}
    planBadge={{ label: '免费计划可用', at: beats.at('免费用户'), tone: 'green' }}
  />
);

/** 单章预览包装（同样原样挂载原始口播 `agy_commands.wav`） */
export const AgySwarmPromptScene: React.FC<{ withVoiceover?: boolean }> = ({ withVoiceover = false }) => (
  <Stage
    stepIndex={1}
    totalSteps={5}
    chapterLabel="01 · /swarm · COPY-READY PROMPT"
    subtitles={LOCAL_SUBTITLES}
    theme={{
      watermark: 'ANTIGRAVITY',
      brandIcon: <AntigravityLogo size={30} />,
    }}
  >
    {withVoiceover && (
      <Audio
        src={staticFile('assets_agy/agy_commands.wav')}
        startFrom={Math.round(SCENE04_START_SEC * FPS)}
        volume={1}
      />
    )}
    <AgySwarmPromptContent />
  </Stage>
);
