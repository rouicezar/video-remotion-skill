import React from 'react';
import { spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { CHROME_RGB, COLORS, FONTS, FPS, WEIGHTS } from '../../design/tokens';
import { AGY_COMMANDS_SUBTITLES } from '../../data/agyCommandsSubtitles';
import {
  clamp01,
  createSceneBeatSolver,
  CRISP_SPRING,
  DynamicTwoStage,
  easeInOutCubic,
  mixRgb,
  PhysicalGlass3D,
  resolveAnchorSec,
  SceneShell,
  SfxGroup,
  smoothFocusWeight,
  steppedGlide,
} from '../../engine';
import { SCENE03_END_SEC } from './Scene03FlipStarBurst';

export const SCENE03B_START_SEC = SCENE03_END_SEC;
export const SCENE03B_END_SEC = resolveAnchorSec(AGY_COMMANDS_SUBTITLES, '那要用呢') - 0.06;
export const SCENE03B_FRAMES = Math.round((SCENE03B_END_SEC - SCENE03B_START_SEC) * FPS);

const beats = createSceneBeatSolver(AGY_COMMANDS_SUBTITLES, SCENE03B_START_SEC, SCENE03B_END_SEC, FPS);

/**
 * Scene 03B（00:42.35 – 00:54.41）：共享消息板实时同步 + 专属 `@verifier` 验收
 * - 套用 `<SceneShell>`（承接 Scene03 推进动势无空屏 + 内置 3D CameraRig + 末尾平滑横移接力 Scene04）
 * - 套用 `<DynamicTwoStage>`（42.35–49.2s 消息板先居中大主体展示，49.2s 念到 `@verifier` 时平滑左移让位，彻底消灭 7 秒右半屏空洞！）
 */
export const Scene03bSwarmBoardVerifier: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const boardAt = beats.at('共享消息板');
  const syncAt = beats.at('知道谁做到哪了');
  const verifierAt = beats.at('@verifier');
  const diffAt = beats.at('审diff');
  const testAt = beats.at('跑测试');

  const syncGlow = clamp01(easeInOutCubic((frame - syncAt) / 12));
  const diffPass = clamp01(easeInOutCubic((frame - diffAt) / 12));
  const testPass = clamp01(easeInOutCubic((frame - testAt) / 12));

  // 三条消息按口播节奏 1.5–2.2s 一微拍逐条落位并聚焦，杜绝 44s–47s 静置
  const feedItems = [
    { who: '@worker-auth', msg: '鉴权边界补全 · 100%', at: 6 },
    { who: '@worker-api', msg: '错误码统一收敛 · 同步完成', at: boardAt },
    { who: '@worker-test', msg: '24 条单测就绪 · 进度同步', at: syncAt },
  ];

  const feedFocus = steppedGlide(frame, [
    { at: 6, dur: 1, target: 0 },
    { at: boardAt, dur: 12, target: 1 },
    { at: syncAt, dur: 12, target: 2 },
  ]);

  const sfxEvents = [
    { kind: 'transition' as const, at: 0 },
    { kind: 'enter' as const, at: 6 },
    { kind: 'focus' as const, at: boardAt },
    { kind: 'focus' as const, at: syncAt },
    { kind: 'enter' as const, at: verifierAt },
    { kind: 'focus' as const, at: diffAt },
    { kind: 'focus' as const, at: testAt },
    { kind: 'transition' as const, at: SCENE03B_FRAMES - 12 },
  ];

  const header = (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
      <div style={{ fontSize: 48, fontWeight: WEIGHTS.light, color: COLORS.white, letterSpacing: 2 }}>
        共享消息板同步 · 专属验收兜底
      </div>
      <span style={{ fontFamily: FONTS.mono, fontSize: 25, color: mixRgb(CHROME_RGB.orange, CHROME_RGB.green, testPass), letterSpacing: 2 }}>
        SHARED BOARD + @VERIFIER
      </span>
    </div>
  );

  const boardCard = (
    <div style={{ transform: 'perspective(1500px) rotateY(3deg)', outline: '1px solid transparent' }}>
      <PhysicalGlass3D active={0.55 + syncGlow * 0.45} accentRgb={CHROME_RGB.orange} radius={28} slabPx={16} extrudeX={-6} padding="44px 46px 50px">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 26, minHeight: 460 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 38, fontWeight: WEIGHTS.regular, color: COLORS.white, letterSpacing: 1.5 }}>共享消息板</span>
            <span style={{ fontFamily: FONTS.mono, fontSize: 24, color: mixRgb([168, 176, 192], CHROME_RGB.orange, 0.45 + syncGlow * 0.55), letterSpacing: 1.5 }}>
              LIVE SYNC
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {feedItems.map((it, idx) => {
              const p = spring({ frame: Math.max(0, frame - it.at), fps, config: CRISP_SPRING });
              const w = frame >= it.at ? smoothFocusWeight(idx, feedFocus, 0.85) : 0;
              return (
                <div
                  key={it.who}
                  style={{
                    padding: '20px 24px',
                    borderRadius: 16,
                    backgroundColor: `rgba(245, 166, 35, ${(0.03 + w * 0.11).toFixed(3)})`,
                    borderWidth: 2,
                    borderStyle: 'solid',
                    borderColor: mixRgb([72, 80, 96], CHROME_RGB.orange, 0.2 + w * 0.8),
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                    opacity: p,
                    transform: `translate3d(0, ${((1 - p) * 18).toFixed(1)}px, 0) scale(${(0.98 + w * 0.025).toFixed(4)})`,
                  }}
                >
                  <span style={{ fontFamily: FONTS.mono, fontSize: 24, color: COLORS.amber }}>{it.who}</span>
                  <span style={{ fontSize: 28, fontWeight: WEIGHTS.light, color: COLORS.white, letterSpacing: 1 }}>{it.msg}</span>
                </div>
              );
            })}
          </div>
        </div>
      </PhysicalGlass3D>
    </div>
  );

  const verifierCard = (
    <div style={{ transform: 'perspective(1500px) rotateY(-3deg)', outline: '1px solid transparent' }}>
      <PhysicalGlass3D active={0.45 + Math.max(diffPass, testPass) * 0.55} accentRgb={CHROME_RGB.green} radius={28} slabPx={16} extrudeX={6} padding="44px 46px 50px">
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 28, minHeight: 460 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontFamily: FONTS.mono, fontSize: 40, fontWeight: WEIGHTS.regular, color: COLORS.green }}>@verifier</span>
            <span style={{ fontFamily: FONTS.mono, fontSize: 24, color: mixRgb([164, 178, 196], CHROME_RGB.green, testPass), letterSpacing: 1.5 }}>
              QUALITY GATE
            </span>
          </div>

          <div style={{ fontSize: 32, fontWeight: WEIGHTS.light, color: '#DCE4F0', letterSpacing: 1.2 }}>
            独立代码验收 · 不通过不放行
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {[
              { cmd: '01 · 审查代码 Diff', pass: diffPass, okText: 'DIFF CLEAN ✓' },
              { cmd: '02 · 跑全量自动化测试', pass: testPass, okText: 'TESTS PASS ✓' },
            ].map((ck) => (
              <div
                key={ck.cmd}
                style={{
                  padding: '22px 24px',
                  borderRadius: 16,
                  backgroundColor: `rgba(52, 168, 83, ${(0.04 + ck.pass * 0.14).toFixed(3)})`,
                  borderWidth: 2,
                  borderStyle: 'solid',
                  borderColor: mixRgb([82, 92, 108], CHROME_RGB.green, ck.pass * 0.9),
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span style={{ fontSize: 28, fontWeight: WEIGHTS.light, color: COLORS.white }}>{ck.cmd}</span>
                <span style={{ fontFamily: FONTS.mono, fontSize: 24, color: mixRgb([146, 158, 176], CHROME_RGB.green, ck.pass), opacity: ck.pass }}>
                  {ck.okText}
                </span>
              </div>
            ))}
          </div>
        </div>
      </PhysicalGlass3D>
    </div>
  );

  return (
    <SceneShell
      durationInFrames={SCENE03B_FRAMES}
      header={header}
      enter="dive-zoom"
      exit="whip-left"
      cameraKeyframes={[
        { at: 0, dur: 14, scale: 1.03, x: 0, y: 0, rotateX: 3 },
        { at: syncAt, dur: 16, scale: 1.05, x: 0, y: -6, rotateX: 4 },
        { at: verifierAt, dur: 16, scale: 1, x: 0, y: 0, rotateX: 3 },
        { at: diffAt, dur: 14, scale: 1.04, x: -36, y: 0, rotateX: 3, rotateY: -2 },
      ]}
    >
      <SfxGroup events={sfxEvents} />
      <DynamicTwoStage secondEnterAt={verifierAt} primary={boardCard} secondary={verifierCard} />
    </SceneShell>
  );
};
