import React from 'react';
import { spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { CHROME_RGB, COLORS, FONTS, FPS, WEIGHTS } from '../../design/tokens';
import { AGY_COMMANDS_SUBTITLES } from '../../data/agyCommandsSubtitles';
import {
  clamp01,
  createSceneBeatSolver,
  CRISP_SPRING,
  easeInOutCubic,
  easeOutExpo,
  mixRgb,
  PhysicalGlass3D,
  resolveAnchorSec,
  SfxGroup,
} from '../../engine';
import { SCENE03_END_SEC } from './Scene03FlipStarBurst';

// 精确承接 Scene03 终点（42.35s）至 Scene04 起点（“那要用呢”前 0.06s = 54.406s），严丝合缝零断档！
export const SCENE03B_START_SEC = SCENE03_END_SEC;
export const SCENE03B_END_SEC = resolveAnchorSec(AGY_COMMANDS_SUBTITLES, '那要用呢') - 0.06;
export const SCENE03B_FRAMES = Math.round((SCENE03B_END_SEC - SCENE03B_START_SEC) * FPS);

const beats = createSceneBeatSolver(AGY_COMMANDS_SUBTITLES, SCENE03B_START_SEC, SCENE03B_END_SEC, FPS);

/**
 * Scene 03B（00:42.35 – 00:54.41）：共享消息板实时同步进度 + 专属 `@verifier` 审 diff 跑测试验收
 * 全量使用 SRT 文本锚点自动定位，严守零提前剧透（验收 PASS 仅在口播念到“审 diff / 跑测试”瞬间亮起）。
 */
export const Scene03bSwarmBoardVerifier: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enterP = easeOutExpo(frame / 12);
  const boardAt = beats.at('共享消息板');
  const syncAt = beats.at('知道谁做到哪了');
  const verifierAt = beats.at('@verifier');
  const diffAt = beats.at('审diff');
  const testAt = beats.at('跑测试');

  const boardIn = spring({ frame: Math.max(0, frame - 4), fps, config: CRISP_SPRING });
  const boardFocus = clamp01(easeInOutCubic((frame - boardAt) / 14)) * (1 - clamp01(easeInOutCubic((frame - verifierAt) / 14)) * 0.65);
  const syncGlow = clamp01(easeInOutCubic((frame - syncAt) / 12));
  const verifierIn = spring({ frame: Math.max(0, frame - verifierAt), fps, config: CRISP_SPRING });
  const diffPass = clamp01(easeInOutCubic((frame - diffAt) / 12));
  const testPass = clamp01(easeInOutCubic((frame - testAt) / 12));

  const sfxEvents = [
    { kind: 'enter' as const, at: 4 },
    { kind: 'focus' as const, at: boardAt },
    { kind: 'focus' as const, at: syncAt },
    { kind: 'enter' as const, at: verifierAt },
    { kind: 'focus' as const, at: diffAt },
    { kind: 'focus' as const, at: testAt },
  ];

  const feedItems = [
    { who: '@worker-auth', msg: '鉴权边界补全 · 100%', at: 8 },
    { who: '@worker-api', msg: '错误码统一收敛 · 同步完成', at: Math.max(16, boardAt - 8) },
    { who: '@worker-test', msg: '24 条单测就绪 · 待验收', at: syncAt },
  ];

  return (
    <div
      style={{
        width: '100%',
        maxWidth: 1560,
        height: '100%',
        margin: '0 auto',
        padding: '28px 0 24px',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        opacity: enterP,
      }}
    >
      <SfxGroup events={sfxEvents} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <div style={{ fontSize: 48, fontWeight: WEIGHTS.light, color: COLORS.white, letterSpacing: 2 }}>
          共享消息板同步 · 专属验收兜底
        </div>
        <span style={{ fontFamily: FONTS.mono, fontSize: 25, color: mixRgb(CHROME_RGB.orange, CHROME_RGB.green, testPass), letterSpacing: 2 }}>
          SHARED BOARD + @VERIFIER
        </span>
      </div>

      <div style={{ width: '100%', height: 740, display: 'grid', gridTemplateColumns: '1.08fr 0.92fr', gap: 52, alignItems: 'center' }}>
        {/* 左侧：2.5D 共享消息板 */}
        <div
          style={{
            opacity: boardIn,
            transform: `perspective(1500px) translate3d(0, ${((1 - boardIn) * 28).toFixed(1)}px, 0) rotateY(4deg)`,
          }}
        >
          <PhysicalGlass3D active={0.4 + boardFocus * 0.6} accentRgb={CHROME_RGB.orange} radius={28} slabPx={16} extrudeX={-6} padding="44px 46px 50px">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 26, minHeight: 460 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 38, fontWeight: WEIGHTS.regular, color: COLORS.white, letterSpacing: 1.5 }}>共享消息板</span>
                <span style={{ fontFamily: FONTS.mono, fontSize: 24, color: mixRgb([168, 176, 192], CHROME_RGB.orange, 0.4 + syncGlow * 0.6), letterSpacing: 1.5 }}>
                  LIVE SYNC
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                {feedItems.map((it) => {
                  const p = spring({ frame: Math.max(0, frame - it.at), fps, config: CRISP_SPRING });
                  return (
                    <div
                      key={it.who}
                      style={{
                        padding: '20px 24px',
                        borderRadius: 16,
                        backgroundColor: 'rgba(255,255,255,0.04)',
                        border: `1.5px solid ${mixRgb([76, 84, 98], CHROME_RGB.orange, 0.25 + syncGlow * 0.5)}`,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 8,
                        opacity: p,
                        transform: `translate3d(0, ${((1 - p) * 18).toFixed(1)}px, 0)`,
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

        {/* 右侧：@verifier 专属验收台（仅在口播念到 @verifier 时干脆亮相，审 diff / 跑测试逐条点亮） */}
        <div
          style={{
            opacity: verifierIn,
            transform: `perspective(1500px) translate3d(${((1 - verifierIn) * 40).toFixed(1)}px, 0, 0) rotateY(-4deg)`,
          }}
        >
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
                      border: `1.5px solid ${mixRgb([82, 92, 108], CHROME_RGB.green, ck.pass * 0.9)}`,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <span style={{ fontSize: 28, fontWeight: WEIGHTS.light, color: COLORS.white }}>{ck.cmd}</span>
                    <span
                      style={{
                        fontFamily: FONTS.mono,
                        fontSize: 24,
                        color: mixRgb([146, 158, 176], CHROME_RGB.green, ck.pass),
                        opacity: ck.pass,
                      }}
                    >
                      {ck.okText}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </PhysicalGlass3D>
        </div>
      </div>
    </div>
  );
};
