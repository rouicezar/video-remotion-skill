import React from 'react';
import { Audio, Img, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { HudFrame, SubtitleOverlay, WorldCanvas } from '../design/Chrome';
import { COLORS, FONTS, FPS } from '../design/tokens';
import {
  easeInOutCubic,
  easeOutQuint,
  glassSheenStyle,
  glassSurface,
  smoothFocusWeight,
} from '../design/motion';
import {
  AntigravityLogo,
  ClaudeLogo,
  DesktopAppIcon,
  IdeCodeIcon,
  OpenAICodexLogo,
  PythonLogo,
  TerminalCliIcon,
} from '../design/BrandLogos';
import { AGY_COMMANDS_SUBTITLES } from '../data/agyCommandsSubtitles';
import { MoveBumperScene } from '../components/scenes/ChapterAndBumper';

const f = (sec: number) => Math.round(sec * FPS);
export const AGY_COMMANDS_TOTAL_FRAMES = 8415; // 280.50s @ 30fps

/**
 * Smoked crystal glass slab — strict border-box so text NEVER overflows container
 */
const crystalGlass = (active = 0, radius = 18): React.CSSProperties => ({
  ...glassSurface({ active, blurPx: 12, radius, opacity: 0.28 + active * 0.12 }),
  boxSizing: 'border-box',
  backgroundImage: `linear-gradient(135deg, rgba(255,255,255,${(0.14 + active * 0.08).toFixed(3)}) 0%, rgba(160,180,220,0.04) 45%, rgba(245,166,35,${(0.03 + active * 0.14).toFixed(3)}) 100%)`,
});

type TransitionKind =
  | 'dolly-zoom'
  | 'pan-left'
  | 'angled-dolly'
  | 'flip-reveal'
  | 'blur-pushback'
  | 'pull-gather';

/**
 * Semantic & Shape-Matched Transition Wrapper — ZERO hard cuts & NO two adjacent scenes share the same transition!
 */
const SceneWrap: React.FC<{
  durationInFrames: number;
  kind?: TransitionKind;
  children: React.ReactNode;
}> = ({ durationInFrames, kind = 'dolly-zoom', children }) => {
  const frame = useCurrentFrame();
  const inP = easeOutQuint(frame / 22);
  const outP = easeInOutCubic(Math.max(0, frame - (durationInFrames - 18)) / 18);
  const opacity = Math.min(inP, 1 - outP);

  let transform = 'none';
  let filter: string | undefined;

  if (kind === 'dolly-zoom') {
    const s = interpolate(inP, [0, 1], [0.92, 1]) * interpolate(outP, [0, 1], [1, 1.05]);
    transform = `scale(${s.toFixed(4)})`;
  } else if (kind === 'pan-left') {
    const x = interpolate(inP, [0, 1], [110, 0]) + interpolate(outP, [0, 1], [0, -90]);
    transform = `translateX(${x.toFixed(1)}px)`;
  } else if (kind === 'angled-dolly') {
    const ry = interpolate(inP, [0, 1], [-9, 0]) + interpolate(outP, [0, 1], [0, 7]);
    const s = interpolate(inP, [0, 1], [0.94, 1]);
    transform = `perspective(1400px) rotateY(${ry.toFixed(2)}deg) scale(${s.toFixed(4)})`;
  } else if (kind === 'flip-reveal') {
    const rx = interpolate(inP, [0, 1], [10, 0]) + interpolate(outP, [0, 1], [0, -8]);
    const y = interpolate(inP, [0, 1], [36, 0]) + interpolate(outP, [0, 1], [0, -28]);
    transform = `perspective(1400px) rotateX(${rx.toFixed(2)}deg) translateY(${y.toFixed(1)}px)`;
  } else if (kind === 'blur-pushback') {
    const s = interpolate(inP, [0, 1], [1.06, 1]) * interpolate(outP, [0, 1], [1, 0.94]);
    const blur = (1 - inP) * 5 + outP * 4.5;
    transform = `scale(${s.toFixed(4)})`;
    filter = blur > 0.2 ? `blur(${blur.toFixed(1)}px)` : undefined;
  } else if (kind === 'pull-gather') {
    const s = interpolate(inP, [0, 1], [1.08, 1]);
    const y = interpolate(inP, [0, 1], [-22, 0]);
    transform = `scale(${s.toFixed(4)}) translateY(${y.toFixed(1)}px)`;
  }

  return (
    <div style={{ position: 'absolute', inset: 0, opacity, transform, filter }}>
      {children}
    </div>
  );
};

/**
 * Official source domain badge with live subtle pulse dot
 */
const OfficialPill: React.FC<{ path: string }> = ({ path }) => {
  const frame = useCurrentFrame();
  const pulse = 0.65 + 0.35 * Math.sin(frame * 0.12);
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        padding: '5px 14px',
        borderRadius: 999,
        backgroundColor: 'rgba(13, 16, 22, 0.88)',
        border: '1px solid rgba(255,255,255,0.22)',
        fontFamily: FONTS.mono,
        fontSize: 15,
        fontWeight: 700,
        color: COLORS.textPrimary,
        whiteSpace: 'nowrap',
      }}
    >
      <AntigravityLogo size={18} />
      <span>{path}</span>
      <span style={{ color: COLORS.green, fontSize: 13, opacity: pulse }}>● OFFICIAL</span>
    </div>
  );
};

/**
 * Framed official docs screenshot — continuous gentle Ken Burns push-in + glass sheen, objectFit: contain = ZERO clipped text
 */
const OfficialDocPreview: React.FC<{
  src: string;
  domain: string;
  height: number;
  darkBg?: boolean;
}> = ({ src, domain, height, darkBg = false }) => {
  const frame = useCurrentFrame();
  const kenBurns = 1 + Math.min(0.035, frame * 0.00012);
  const floatY = Math.sin(frame * 0.035) * 3;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%', boxSizing: 'border-box', transform: `translateY(${floatY}px)` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <OfficialPill path={domain} />
      </div>
      <div
        style={{
          width: '100%',
          height,
          borderRadius: 14,
          overflow: 'hidden',
          border: '1.5px solid rgba(255,255,255,0.24)',
          backgroundColor: darkBg ? '#0d1016' : '#ffffff',
          boxShadow: '0 14px 36px rgba(0,0,0,0.45)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        <Img
          src={staticFile(src)}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            objectPosition: 'center center',
            transform: `scale(${kenBurns})`,
          }}
        />
        <div style={glassSheenStyle(frame, 0.28)} />
      </div>
    </div>
  );
};

/**
 * Mobile-friendly Copy-Ready Prompt Card — LIVE typewriter reveal + staggered key tags = ZERO dead air!
 */
const CopyPromptCard: React.FC<{
  command: string;
  body: string;
  tags: string[];
  reveal: number;
  startFrame: number;
  frame: number;
}> = ({ command, body, tags, reveal, startFrame, frame }) => {
  const { fps } = useVideoConfig();
  const localF = Math.max(0, frame - startFrame);
  const chars = Math.min(body.length, Math.floor(localF * 0.85));
  const typed = body.slice(0, chars);
  const cursorOn = Math.floor(frame / 10) % 2 === 0;

  return (
    <div
      style={{
        ...crystalGlass(0.92, 20),
        width: '100%',
        padding: '22px 28px',
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
        position: 'relative',
        overflow: 'hidden',
        opacity: reveal,
        transform: `translateY(${(1 - reveal) * 24 + Math.sin(frame * 0.04) * 2.5}px)`,
      }}
    >
      <div style={glassSheenStyle(frame, 0.85)} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span
            style={{
              backgroundColor: COLORS.amber,
              color: '#111318',
              padding: '4px 14px',
              borderRadius: 8,
              fontSize: 20,
              fontWeight: 900,
            }}
          >
            直接抄作业 · 提示词
          </span>
          <span style={{ fontFamily: FONTS.mono, fontSize: 22, fontWeight: 900, color: COLORS.amber }}>
            {command}
          </span>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {tags.map((t, idx) => {
            const tp = spring({ frame: Math.max(0, localF - 14 - idx * 14), fps, config: { damping: 20, stiffness: 85 } });
            return (
              <span
                key={t}
                style={{
                  padding: '4px 12px',
                  borderRadius: 8,
                  backgroundColor: 'rgba(116, 179, 245, 0.16)',
                  border: '1px solid rgba(116, 179, 245, 0.4)',
                  color: '#93c5fd',
                  fontSize: 18,
                  fontWeight: 800,
                  opacity: tp,
                  transform: `scale(${0.86 + tp * 0.14})`,
                }}
              >
                {t}
              </span>
            );
          })}
        </div>
      </div>
      <div
        style={{
          fontSize: 26,
          fontWeight: 800,
          color: COLORS.white,
          lineHeight: 1.48,
          letterSpacing: 0.3,
          wordBreak: 'break-word',
          minHeight: 78,
        }}
      >
        <span style={{ color: COLORS.amber, fontFamily: FONTS.mono, marginRight: 8 }}>{command}</span>
        {typed}
        <span
          style={{
            display: 'inline-block',
            width: 10,
            height: 26,
            backgroundColor: COLORS.amber,
            marginLeft: 5,
            verticalAlign: 'middle',
            opacity: cursorOn ? 0.95 : 0.15,
          }}
        />
      </div>
    </div>
  );
};

/**
 * Platform & Plan Availability Bar — Badges pop in SEQUENTIALLY one by one synced to voice!
 */
const PlatformBar: React.FC<{
  platforms: Array<'App' | 'CLI' | 'IDE'>;
  plan: '免费计划可用' | '需付费计划' | '全平台支持';
  planColor: string;
  startFrame: number;
  frame: number;
}> = ({ platforms, plan, planColor, startFrame, frame }) => {
  const { fps } = useVideoConfig();
  const localF = Math.max(0, frame - startFrame);
  const barIn = easeOutQuint(localF / 20);
  const planP = spring({ frame: Math.max(0, localF - 14 - platforms.length * 14), fps, config: { damping: 18, stiffness: 86 } });

  if (localF <= 0) return null;

  return (
    <div
      style={{
        ...crystalGlass(0.45, 14),
        width: '100%',
        padding: '14px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        opacity: barIn,
        transform: `translateY(${(1 - barIn) * 18}px)`,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <span style={{ fontSize: 20, fontWeight: 800, color: COLORS.textSecondary }}>支持端：</span>
        {platforms.map((p, idx) => {
          const pp = spring({ frame: Math.max(0, localF - 8 - idx * 14), fps, config: { damping: 18, stiffness: 86 } });
          return (
            <span
              key={p}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '6px 16px',
                borderRadius: 10,
                backgroundColor: 'rgba(255,255,255,0.09)',
                border: '1px solid rgba(255,255,255,0.22)',
                color: COLORS.white,
                fontSize: 21,
                fontWeight: 800,
                opacity: pp,
                transform: `translateY(${(1 - pp) * 14}px) scale(${0.9 + pp * 0.1})`,
              }}
            >
              {p === 'App' ? <DesktopAppIcon size={20} /> : p === 'CLI' ? <TerminalCliIcon size={20} /> : <IdeCodeIcon size={20} />}
              {p === 'IDE' ? 'IDE 扩展' : `Antigravity ${p}`}
            </span>
          );
        })}
      </div>
      <span
        style={{
          padding: '6px 20px',
          borderRadius: 10,
          backgroundColor: planColor,
          color: '#111318',
          fontSize: 22,
          fontWeight: 900,
          opacity: planP,
          transform: `scale(${0.86 + planP * 0.14})`,
          boxShadow: `0 0 22px ${planColor}55`,
        }}
      >
        {plan}
      </span>
    </div>
  );
};

/* ============================================================================
 * 0. INTRO (00:00.0 – 00:10.23): Official Overview w/ Live Callout -> 5 Cards w/ Continuous Focus Sweep
 * ==========================================================================*/
const IntroScene: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const heroIn = easeOutQuint(frame / 24);
  const docIn = easeOutQuint((frame - 14) / 24);
  const calloutIn = easeOutQuint((frame - 58) / 22);
  const gridT = easeInOutCubic((frame - 122) / 26);

  // Continuous silky focus sweep across cards 01 -> 05 during 6.0s..10.2s (ZERO dead air!)
  const sweepIdx = interpolate(frame, [175, 295], [0, 4], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  const cmds = [
    { num: '01', cmd: '/swarm', desc: '活多能拆 · 并行开干', color: '#34d399' },
    { num: '02', cmd: '/boost', desc: '活难啃不动 · 深度推理', color: '#f5a623' },
    { num: '03', cmd: '/teamwork', desc: '跨天大工程 · 里程碑', color: '#74B3F5' },
    { num: '04', cmd: '/run-workflow', desc: '批量定制 · 编排流水', color: '#c084fc' },
    { num: '05', cmd: '/goal', desc: '目标明确 · 挂机死磕', color: '#fb7185' },
  ];

  return (
    <>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          padding: '44px 56px 148px 56px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 26,
          boxSizing: 'border-box',
        }}
      >
        {/* Top Brand Lockup */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 12,
            opacity: heroIn,
            transform: `translateY(${(1 - heroIn) * 20 - gridT * 14}px) scale(${1 + frame * 0.00018})`,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <AntigravityLogo size={54} />
            <span style={{ fontFamily: FONTS.mono, fontSize: 30, fontWeight: 900, color: COLORS.textPrimary, letterSpacing: 2 }}>
              Google Antigravity
            </span>
          </div>
          <div style={{ fontSize: 64, fontWeight: 900, color: COLORS.white, letterSpacing: 2, textAlign: 'center', lineHeight: 1.12 }}>
            5 条神级 <span style={{ color: COLORS.amber, fontFamily: FONTS.mono }}>/</span> 斜杠指令
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, color: COLORS.textSecondary }}>
            按平时干活遇到的 5 种真实卡点拆解 · 看完直接上手
          </div>
        </div>

        {/* Act A (0–4.1s): Official Docs Overview + Floating Callout | Act B (4.1–10.2s): 5 Cards w/ Spotlight Sweep */}
        <div style={{ position: 'relative', width: '100%', maxWidth: 1480, height: 430, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {gridT < 0.98 && (
            <div style={{ position: 'absolute', width: 1120, opacity: docIn * (1 - gridT), transform: `scale(${0.95 + docIn * 0.05 - gridT * 0.05})` }}>
              <OfficialDocPreview src="assets_agy/crop_slash_overview.png" domain="antigravity.google/docs/slash-commands" height={360} />
              {calloutIn > 0.02 && (
                <div
                  style={{
                    ...crystalGlass(0.92, 14),
                    position: 'absolute',
                    right: 26,
                    bottom: 22,
                    padding: '10px 22px',
                    fontSize: 24,
                    fontWeight: 900,
                    color: COLORS.amber,
                    opacity: calloutIn,
                    transform: `translateY(${(1 - calloutIn) * 16}px)`,
                  }}
                >
                  ✦ 敲下 / 即可唤起 5 大核心工作流
                </div>
              )}
            </div>
          )}

          {gridT > 0.02 && (
            <div
              style={{
                position: 'absolute',
                width: '100%',
                display: 'grid',
                gridTemplateColumns: 'repeat(5, 1fr)',
                gap: 20,
                opacity: gridT,
              }}
            >
              {cmds.map((c, i) => {
                const p = spring({ frame: Math.max(0, frame - 128 - i * 10), fps, config: { damping: 20, stiffness: 82 } });
                const focusW = frame > 170 ? smoothFocusWeight(i, sweepIdx, 0.85) : 0;
                return (
                  <div
                    key={c.cmd}
                    style={{
                      ...crystalGlass(0.4 + focusW * 0.55, 20),
                      height: 310,
                      padding: '24px 20px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      opacity: p,
                      transform: `translateY(${(1 - p) * 34 - focusW * 16 + Math.sin(frame * 0.045 + i) * 3}px) scale(${1 + focusW * 0.045})`,
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                  >
                    <div style={glassSheenStyle(frame + i * 24, 0.7 + focusW * 0.3)} />
                    <span
                      style={{
                        alignSelf: 'flex-start',
                        backgroundColor: c.color,
                        color: '#111318',
                        fontFamily: FONTS.display,
                        fontSize: 32,
                        fontWeight: 900,
                        padding: '2px 12px',
                        borderRadius: 8,
                      }}
                    >
                      {c.num}
                    </span>
                    <div style={{ fontFamily: FONTS.mono, fontSize: c.cmd.length > 10 ? 24 : 30, fontWeight: 900, color: focusW > 0.4 ? COLORS.amber : COLORS.white, wordBreak: 'break-word' }}>
                      {c.cmd}
                    </div>
                    <div style={{ fontSize: 21, fontWeight: 700, color: COLORS.textSecondary, lineHeight: 1.38 }}>
                      {c.desc}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

/* ============================================================================
 * 1. /swarm (00:13.30 – 01:08.20, 54.9s = 1647f) — ZERO DEAD AIR!
 * ==========================================================================*/
const Cmd01SwarmScene: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const toAct2 = easeInOutCubic((frame - 294) / 22);
  const toAct3 = easeInOutCubic((frame - 582) / 24);
  const toAct4 = easeInOutCubic((frame - 1224) / 24);

  const act1Focus = interpolate(frame, [40, 260], [0, 2], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const queueFocus = interpolate(frame, [330, 540], [0, 4], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const ctxPct = interpolate(frame, [320, 560], [18, 99], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const verifierIn = easeOutQuint((frame - 1040) / 24);
  const diffCheckIn = easeOutQuint((frame - 1100) / 20);
  const testCheckIn = easeOutQuint((frame - 1155) / 20);
  const promptIn = easeOutQuint((frame - 1240) / 24);

  const status = frame < 306 ? 'USE CASES' : frame < 594 ? 'CONTEXT OVERFLOW' : frame < 1236 ? 'PARALLEL SWARM' : 'COPY PROMPT';

  const useCases = [
    { num: '01', title: '同时改 7–8 个模块', sub: '彼此独立、互不阻塞' },
    { num: '02', title: '批量文件补单测', sub: '多线程并行编写测试' },
    { num: '03', title: '并行调研竞品方案', sub: '同时检索汇总对比' },
  ];

  const workers = [
    { name: '@auth-mod', task: '错误处理 + 单测', pct: interpolate(frame, [650, 1080], [8, 100], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) },
    { name: '@order-mod', task: '错误处理 + 单测', pct: interpolate(frame, [680, 1120], [5, 100], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) },
    { name: '@pay-mod', task: '错误处理 + 单测', pct: interpolate(frame, [710, 1160], [6, 100], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) },
  ];

  return (
    <>
      <HudFrame
        moveIndex={1}
        totalMoves={5}
        titleZh="指令 01 · /swarm 多 Agent 并行"
        titleEn="AGENT SWARM · PARALLEL"
        cameraMoving={frame >= 594 && frame < 1236}
        status={status}
        metrics={[
          { labelEn: 'MODE', labelZh: '适用卡点', value: '活多能拆', accent: true },
          { labelEn: 'ROLES', labelZh: '验收角色', value: '@verifier' },
          { labelEn: 'PLAN', labelZh: '使用门槛', value: '免费可用' },
        ]}
        graphMode={frame < 594 ? 'step' : 'curve'}
        graphProgress={Math.min(1, frame / 1350)}
        graphSteps={4}
        promptTokens={[
          { text: '/swarm ', highlight: true },
          { text: '把任务拆给多个命名子 Agent 并行执行，共享消息板同步，' },
          { text: '@verifier 验收', highlight: true },
        ]}
        promptLabel="核心机制"
        promptBadge="SWARM"
        promptStartFrame={20}
      >
        <div style={{ position: 'absolute', inset: 22, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {/* ACT 1: Use cases w/ continuous spotlight sweep + Live Official Doc */}
          {toAct2 < 0.98 && (
            <div style={{ position: 'absolute', inset: 0, display: 'grid', gridTemplateColumns: '1fr 1.05fr', gap: 24, alignItems: 'center', opacity: 1 - toAct2, transform: `scale(${1 - toAct2 * 0.05})` }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ fontSize: 32, fontWeight: 900, color: COLORS.amber }}>适用场景：任务面广、能拆开</div>
                {useCases.map((u, i) => {
                  const p = spring({ frame: Math.max(0, frame - 20 - i * 48), fps, config: { damping: 20, stiffness: 82 } });
                  const w = smoothFocusWeight(i, act1Focus, 0.8);
                  return (
                    <div
                      key={u.num}
                      style={{
                        ...crystalGlass(0.35 + w * 0.55, 16),
                        padding: '18px 22px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 16,
                        opacity: p,
                        transform: `translateX(${(1 - p) * -28 + w * 10}px) scale(${1 + w * 0.025})`,
                      }}
                    >
                      <span style={{ backgroundColor: '#34d399', color: '#111318', fontFamily: FONTS.display, fontSize: 30, fontWeight: 900, padding: '2px 11px', borderRadius: 8 }}>
                        {u.num}
                      </span>
                      <div>
                        <div style={{ fontSize: 28, fontWeight: 900, color: COLORS.white }}>{u.title}</div>
                        <div style={{ fontSize: 20, fontWeight: 700, color: COLORS.textSecondary, marginTop: 2 }}>{u.sub}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div style={{ opacity: easeOutQuint((frame - 12) / 24) }}>
                <OfficialDocPreview src="assets_agy/crop_swarm_doc.png" domain="antigravity.google/docs/swarm" height={370} />
              </div>
            </div>
          )}

          {/* ACT 2: Serial Queue w/ Moving Active Pointer + Live Climbing Context Overflow */}
          {toAct2 > 0.02 && toAct3 < 0.98 && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 26, padding: '0 24px', opacity: toAct2 * (1 - toAct3) }}>
              <div style={{ fontSize: 36, fontWeight: 900, color: COLORS.white }}>
                普通单 Agent 痛点：<span style={{ color: COLORS.red }}>串行排队 · 上下文很快爆掉</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                {['模块 1', '模块 2', '模块 3', '模块 4', '模块 5...'].map((m, i) => {
                  const p = spring({ frame: Math.max(0, frame - 315 - i * 18), fps, config: { damping: 20, stiffness: 82 } });
                  const w = smoothFocusWeight(i, queueFocus, 0.75);
                  return (
                    <React.Fragment key={m}>
                      <div style={{ ...crystalGlass(0.18 + w * 0.7, 14), flex: 1, padding: '22px 14px', textAlign: 'center', opacity: p, transform: `translateY(${(1 - p) * 20 - w * 10}px)` }}>
                        <div style={{ fontSize: 26, fontWeight: 900, color: w > 0.4 ? COLORS.amber : COLORS.white }}>{m}</div>
                        <div style={{ fontSize: 18, color: w > 0.4 ? COLORS.amber : COLORS.textMuted, marginTop: 6, fontWeight: 700 }}>
                          {w > 0.4 ? '串行执行中…' : i < queueFocus ? '已堆积上下文' : '等待阻塞'}
                        </div>
                      </div>
                      {i < 4 && <span style={{ fontSize: 26, color: i < queueFocus ? COLORS.amber : COLORS.textMuted, fontWeight: 900 }}>→</span>}
                    </React.Fragment>
                  );
                })}
              </div>
              <div style={{ ...crystalGlass(0.75, 18), padding: '22px 28px', borderColor: ctxPct > 78 ? COLORS.red : COLORS.amberBorder }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <span style={{ fontSize: 26, fontWeight: 900, color: ctxPct > 78 ? COLORS.red : COLORS.amber }}>单会话上下文窗口占用</span>
                  <span style={{ fontFamily: FONTS.mono, fontSize: 34, fontWeight: 900, color: ctxPct > 78 ? COLORS.red : COLORS.amber }}>
                    {Math.round(ctxPct)}% {ctxPct > 84 ? '⚠ 上下文爆仓' : ''}
                  </span>
                </div>
                <div style={{ height: 22, borderRadius: 11, backgroundColor: 'rgba(255,255,255,0.1)', overflow: 'hidden' }}>
                  <div style={{ width: `${ctxPct}%`, height: '100%', borderRadius: 11, backgroundColor: ctxPct > 78 ? COLORS.red : COLORS.amber, boxShadow: ctxPct > 78 ? '0 0 24px rgba(239,83,80,0.6)' : undefined }} />
                </div>
              </div>
            </div>
          )}

          {/* ACT 3: /swarm Parallel Workers + REAL Official Swarm UI + Sequential @verifier Checkmarks */}
          {toAct3 > 0.02 && toAct4 < 0.98 && (
            <div style={{ position: 'absolute', inset: 0, display: 'grid', gridTemplateColumns: '0.95fr 1.15fr', gap: 22, alignItems: 'center', opacity: toAct3 * (1 - toAct4) }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ ...crystalGlass(0.85, 14), padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <AntigravityLogo size={28} />
                    <span style={{ fontSize: 26, fontWeight: 900, color: COLORS.amber }}>@coordinator 拆活派发</span>
                  </div>
                  <span style={{ fontFamily: FONTS.mono, fontSize: 16, color: COLORS.green, fontWeight: 900, opacity: 0.65 + 0.35 * Math.sin(frame * 0.14) }}>● LIVE</span>
                </div>

                {workers.map((w, i) => {
                  const p = spring({ frame: Math.max(0, frame - 635 - i * 26), fps, config: { damping: 20, stiffness: 82 } });
                  return (
                    <div key={w.name} style={{ ...crystalGlass(0.45, 14), padding: '14px 18px', opacity: p, transform: `translateX(${(1 - p) * -22}px) translateY(${Math.sin(frame * 0.045 + i) * 2.5}px)` }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                        <span style={{ fontFamily: FONTS.mono, fontSize: 22, fontWeight: 900, color: '#74B3F5' }}>{w.name}</span>
                        <span style={{ fontSize: 19, fontWeight: 700, color: COLORS.textSecondary }}>{w.task} · {Math.round(w.pct)}%</span>
                      </div>
                      <div style={{ height: 10, borderRadius: 5, backgroundColor: 'rgba(255,255,255,0.1)', overflow: 'hidden' }}>
                        <div style={{ width: `${w.pct}%`, height: '100%', backgroundColor: '#34d399', borderRadius: 5 }} />
                      </div>
                    </div>
                  );
                })}

                {verifierIn > 0.02 && (
                  <div
                    style={{
                      ...crystalGlass(0.95, 14),
                      padding: '16px 20px',
                      borderColor: COLORS.green,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      opacity: verifierIn,
                      transform: `translateY(${(1 - verifierIn) * 18}px)`,
                    }}
                  >
                    <div>
                      <div style={{ fontFamily: FONTS.mono, fontSize: 24, fontWeight: 900, color: COLORS.green }}>@verifier 专属验收</div>
                      <div style={{ display: 'flex', gap: 14, marginTop: 4, fontSize: 19, fontWeight: 800 }}>
                        <span style={{ color: COLORS.white, opacity: diffCheckIn }}>✓ 审 Diff</span>
                        <span style={{ color: COLORS.green, opacity: testCheckIn }}>✓ 跑全量测试</span>
                      </div>
                    </div>
                    <span style={{ backgroundColor: COLORS.green, color: '#111318', padding: '5px 14px', borderRadius: 8, fontSize: 20, fontWeight: 900, opacity: testCheckIn, transform: `scale(${0.85 + testCheckIn * 0.15})` }}>
                      PASS ✓
                    </span>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <OfficialDocPreview src="assets_agy/crop_swarm_ui.png" domain="Antigravity Swarm 共享消息板实景" height={340} darkBg />
                <div style={{ fontSize: 20, fontWeight: 700, color: COLORS.textSecondary, textAlign: 'center' }}>
                  多个命名子 Agent 在同一共享消息板实时同步进度
                </div>
              </div>
            </div>
          )}

          {/* ACT 4: Live Typewriter Prompt Card + Sequential Platform Pills */}
          {toAct4 > 0.02 && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 22, padding: '0 16px', opacity: toAct4 }}>
              <div style={{ fontSize: 30, fontWeight: 900, color: COLORS.white }}>
                敲下 <span style={{ color: COLORS.amber, fontFamily: FONTS.mono }}>/swarm</span>，说清两件事：
                <span style={{ color: '#34d399' }}>① 拆分范围</span> + <span style={{ color: '#74B3F5' }}>② 验收标准</span>
              </div>
              <CopyPromptCard
                command="/swarm"
                body="把 src/modules 下面这 5 个独立模块都补齐错误处理和单元测试，完成后统一跑全量测试通过。"
                tags={['拆分范围', '验收标准']}
                reveal={promptIn}
                startFrame={1275}
                frame={frame}
              />
              <PlatformBar platforms={['App', 'CLI']} plan="免费计划可用" planColor="#34d399" startFrame={1435} frame={frame} />
            </div>
          )}
        </div>
      </HudFrame>
    </>
  );
};

/* ============================================================================
 * 2. /boost (01:12.00 – 01:53.63, 41.63s = 1249f) — ZERO DEAD AIR!
 * ==========================================================================*/
const Cmd02BoostScene: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const toAct2 = easeInOutCubic((frame - 450) / 24);
  const toAct3 = easeInOutCubic((frame - 940) / 24);
  const spinIn = easeOutQuint((frame - 250) / 24);
  const switchPillIn = easeOutQuint((frame - 375) / 22);
  const promptIn = easeOutQuint((frame - 955) / 24);

  const hardCases = [
    { title: '偶发竞态条件', sub: '死活复现不稳定' },
    { title: '高耦合架构重构', sub: '牵一发而动全身' },
    { title: '算法性能瓶颈', sub: '怎么调都卡死' },
  ];

  const stages = [
    { step: '01', title: '先实现一版', sub: '生成候选方案', start: 530, color: '#74B3F5' },
    { step: '02', title: '挑战找茬', sub: '独立对抗审查', start: 635, color: '#f5a623' },
    { step: '03', title: '揪出漏洞修复', sub: '根因精准修补', start: 745, color: '#fb7185' },
    { step: '04', title: '重新验证打磨', sub: '直至彻底解决', start: 840, color: '#34d399' },
  ];

  const activeStageFocus = interpolate(frame, [530, 880], [0, 3], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const status = frame < 462 ? 'HARD PROBLEM' : frame < 951 ? 'DEEP REASONING' : 'COPY PROMPT';

  return (
    <>
      <HudFrame
        moveIndex={2}
        totalMoves={5}
        titleZh="指令 02 · /boost 深度推理"
        titleEn="BOOST · DEEP REASONING"
        cameraMoving={frame >= 462 && frame < 951}
        status={status}
        metrics={[
          { labelEn: 'MODE', labelZh: '适用卡点', value: '拆不开·难', accent: true },
          { labelEn: 'ENGINE', labelZh: '核心机制', value: '多轮找茬' },
          { labelEn: 'PLAN', labelZh: '使用门槛', value: '付费计划' },
        ]}
        graphMode="sine"
        graphProgress={Math.min(1, frame / 1100)}
        promptTokens={[
          { text: '/boost ', highlight: true },
          { text: '多轮深度推理流水线：' },
          { text: '实现 → 挑战找茬 → 修复 → 复验', highlight: true },
        ]}
        promptLabel="核心机制"
        promptBadge="BOOST"
        promptStartFrame={20}
      >
        <div style={{ position: 'absolute', inset: 22, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {/* ACT 1: 3 Hard Bugs + Animated Spinning "原地打转" Cycle */}
          {toAct2 < 0.98 && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 24, opacity: 1 - toAct2 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
                {hardCases.map((c, i) => {
                  const p = spring({ frame: Math.max(0, frame - 8 - i * 68), fps, config: { damping: 20, stiffness: 82 } });
                  return (
                    <div key={c.title} style={{ ...crystalGlass(0.55, 18), padding: '24px 22px', opacity: p, transform: `translateY(${(1 - p) * 26 + Math.sin(frame * 0.045 + i) * 3}px)` }}>
                      <div style={{ fontFamily: FONTS.mono, fontSize: 18, color: COLORS.amber, fontWeight: 900, marginBottom: 8 }}>HARD CASE 0{i + 1}</div>
                      <div style={{ fontSize: 30, fontWeight: 900, color: COLORS.white }}>{c.title}</div>
                      <div style={{ fontSize: 21, fontWeight: 700, color: COLORS.textSecondary, marginTop: 6 }}>{c.sub}</div>
                    </div>
                  );
                })}
              </div>

              {spinIn > 0.02 && (
                <div
                  style={{
                    ...crystalGlass(0.78, 18),
                    padding: '22px 28px',
                    borderColor: COLORS.red,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 18,
                    opacity: spinIn,
                    transform: `translateY(${(1 - spinIn) * 20}px)`,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
                    {/* Smooth rotating SVG loop icon illustrating "原地打转" */}
                    <svg width="54" height="54" viewBox="0 0 54 54" style={{ flexShrink: 0, transform: `rotate(${frame * 3.2}deg)` }}>
                      <circle cx="27" cy="27" r="21" fill="none" stroke="rgba(239,83,80,0.28)" strokeWidth="4" />
                      <path d="M27 6 A21 21 0 0 1 48 27" fill="none" stroke={COLORS.red} strokeWidth="4.5" strokeLinecap="round" />
                      <path d="M27 48 A21 21 0 0 1 6 27" fill="none" stroke={COLORS.amber} strokeWidth="4.5" strokeLinecap="round" />
                    </svg>
                    <div>
                      <div style={{ fontSize: 30, fontWeight: 900, color: COLORS.red }}>普通模式聊 3 轮就开始原地打转</div>
                      <div style={{ fontSize: 22, fontWeight: 700, color: COLORS.textPrimary, marginTop: 6 }}>
                        改好一个 Bug → 又引出一个新问题 → 陷入死循环
                      </div>
                    </div>
                  </div>
                  <div
                    style={{
                      fontFamily: FONTS.mono,
                      fontSize: 26,
                      fontWeight: 900,
                      color: COLORS.amber,
                      padding: '10px 22px',
                      borderRadius: 12,
                      border: `2px solid ${COLORS.amber}`,
                      opacity: switchPillIn,
                      transform: `scale(${0.88 + switchPillIn * 0.12})`,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    直接切 /boost →
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ACT 2: 4-Stage Deep Reasoning Pipeline w/ Continuous Spotlight + Live Official Doc */}
          {toAct2 > 0.02 && toAct3 < 0.98 && (
            <div style={{ position: 'absolute', inset: 0, display: 'grid', gridTemplateColumns: '1fr 1.05fr', gap: 22, alignItems: 'center', opacity: toAct2 * (1 - toAct3) }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ fontSize: 28, fontWeight: 900, color: COLORS.amber }}>多轮深度推理流水线</div>
                {stages.map((s, idx) => {
                  const p = spring({ frame: Math.max(0, frame - s.start), fps, config: { damping: 20, stiffness: 82 } });
                  const active = frame >= s.start;
                  const w = active ? smoothFocusWeight(idx, activeStageFocus, 0.85) : 0;
                  return (
                    <div
                      key={s.step}
                      style={{
                        ...(active ? crystalGlass(0.45 + w * 0.5, 14) : { borderRadius: 14, border: '1.5px dashed rgba(255,255,255,0.16)', backgroundColor: 'rgba(255,255,255,0.03)' }),
                        padding: '14px 20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        opacity: active ? p : 0.45,
                        transform: active ? `translateX(${(1 - p) * -20 + w * 10}px)` : 'none',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <span style={{ backgroundColor: s.color, color: '#111318', fontFamily: FONTS.display, fontSize: 26, fontWeight: 900, padding: '2px 10px', borderRadius: 7 }}>
                          {s.step}
                        </span>
                        <span style={{ fontSize: 26, fontWeight: 900, color: COLORS.white }}>{s.title}</span>
                      </div>
                      <span style={{ fontSize: 19, fontWeight: 700, color: COLORS.textSecondary }}>{s.sub}</span>
                    </div>
                  );
                })}
              </div>
              <OfficialDocPreview src="assets_agy/crop_boost_doc.png" domain="antigravity.google/docs/boost" height={370} />
            </div>
          )}

          {/* ACT 3: Live Typewriter Boost Prompt + Sequential Platform Bar */}
          {toAct3 > 0.02 && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 22, padding: '0 16px', opacity: toAct3 }}>
              <div style={{ fontSize: 28, fontWeight: 900, color: COLORS.white }}>
                说清三要素：<span style={{ color: COLORS.amber }}>报错现象</span> · <span style={{ color: '#74B3F5' }}>复现路径</span> · <span style={{ color: '#34d399' }}>底线约束</span>
              </div>
              <CopyPromptCard
                command="/boost"
                body="排查订单并发扣库存偶发超卖的问题，定位根因并给出修复方案，要求不破坏现有事务边界，并用并发测试验证通过。"
                tags={['报错现象', '底线约束', '并发验证']}
                reveal={promptIn}
                startFrame={970}
                frame={frame}
              />
              <PlatformBar platforms={['App', 'CLI', 'IDE']} plan="需付费计划" planColor="#f5a623" startFrame={1060} frame={frame} />
            </div>
          )}
        </div>
      </HudFrame>
    </>
  );
};

/* ============================================================================
 * 3. /teamwork (01:57.90 – 02:54.63, 56.73s = 1702f) — ZERO DEAD AIR!
 * ==========================================================================*/
const Cmd03TeamworkScene: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const toAct2 = easeInOutCubic((frame - 546) / 24);
  const toAct3 = easeInOutCubic((frame - 1150) / 24);
  const act2Focus = interpolate(frame, [610, 1080], [0, 2], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const criticBadgeIn = easeOutQuint((frame - 980) / 20);
  const auditBadgeIn = easeOutQuint((frame - 1045) / 20);
  const bottomArrowIn = easeOutQuint((frame - 1445) / 22);

  const flowSteps = [
    { step: '01', title: '先做需求访谈', sub: '把边界与目标全部问清楚，不闷头改代码', badge: 'INTERVIEW', color: '#74B3F5', start: 600 },
    { step: '02', title: '多角色里程碑推进', sub: 'Sentinel & Project Orchestrator 统筹推进', badge: 'MILESTONES', color: '#f5a623', start: 775 },
    { step: '03', title: '阶段审查门禁把关', sub: 'Critic + Auditor 严防大项目做到一半跑偏', badge: 'GATEKEEP', color: '#34d399', start: 915 },
  ];

  const status = frame < 558 ? 'SWARM VS TEAMWORK' : frame < 1161 ? 'MILESTONE GATES' : 'BEST PRACTICE';

  return (
    <>
      <HudFrame
        moveIndex={3}
        totalMoves={5}
        titleZh="指令 03 · /teamwork 工程立项"
        titleEn="TEAMWORK · AGENT TEAMS"
        cameraMoving={frame >= 558 && frame < 1161}
        status={status}
        metrics={[
          { labelEn: 'MODE', labelZh: '适用卡点', value: '跨天大工程', accent: true },
          { labelEn: 'GATES', labelZh: '审查门禁', value: 'Critic·Audit' },
          { labelEn: 'PLAN', labelZh: '使用门槛', value: '付费计划' },
        ]}
        graphMode="step"
        graphProgress={Math.min(1, frame / 1500)}
        graphSteps={3}
        promptTokens={[
          { text: '/teamwork ', highlight: true },
          { text: '先需求访谈 → 多角色里程碑推进 → ' },
          { text: 'Critic / Auditor 门禁把关', highlight: true },
        ]}
        promptLabel="核心机制"
        promptBadge="TEAMWORK"
        promptStartFrame={20}
      >
        <div style={{ position: 'absolute', inset: 22, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {/* ACT 1: /swarm vs /teamwork + Sequential Scenario Chips (ZERO dead air!) */}
          {toAct2 < 0.98 && (
            <div style={{ position: 'absolute', inset: 0, display: 'grid', gridTemplateColumns: '1fr 1.05fr', gap: 22, alignItems: 'center', opacity: 1 - toAct2 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ fontSize: 28, fontWeight: 900, color: COLORS.amber }}>一句话分清 /swarm 与 /teamwork</div>
                <div style={{ ...crystalGlass(0.35, 16), padding: '18px 22px', opacity: easeOutQuint((frame - 75) / 24), transform: `translateY(${Math.sin(frame * 0.04) * 2.5}px)` }}>
                  <div style={{ fontFamily: FONTS.mono, fontSize: 28, fontWeight: 900, color: '#34d399' }}>/swarm</div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: COLORS.white, marginTop: 6 }}>拉个群 · 快速把几件平行小事干完</div>
                </div>
                <div style={{ ...crystalGlass(0.88, 16), padding: '20px 22px', borderColor: '#74B3F5', opacity: easeOutQuint((frame - 210) / 24), transform: `translateY(${Math.sin(frame * 0.04 + 1.2) * 2.5}px)` }}>
                  <div style={{ fontFamily: FONTS.mono, fontSize: 28, fontWeight: 900, color: '#74B3F5' }}>/teamwork</div>
                  <div style={{ fontSize: 24, fontWeight: 900, color: COLORS.white, marginTop: 6 }}>正式立项 · 按里程碑推进大型工程</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 12 }}>
                    {[
                      { label: '整库迁移', start: 335 },
                      { label: '复杂仿真', start: 390 },
                      { label: '几小时~几天深度研究', start: 445 },
                    ].map((chip) => {
                      const cp = spring({ frame: Math.max(0, frame - chip.start), fps, config: { damping: 18, stiffness: 86 } });
                      return (
                        <span
                          key={chip.label}
                          style={{
                            padding: '5px 14px',
                            borderRadius: 9,
                            backgroundColor: 'rgba(116, 179, 245, 0.18)',
                            border: '1px solid rgba(116, 179, 245, 0.5)',
                            color: '#bfdbfe',
                            fontSize: 19,
                            fontWeight: 800,
                            opacity: cp,
                            transform: `scale(${0.86 + cp * 0.14})`,
                          }}
                        >
                          ✦ {chip.label}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>
              <OfficialDocPreview src="assets_agy/crop_teamwork_doc.png" domain="antigravity.google/docs/teamwork" height={370} />
            </div>
          )}

          {/* ACT 2: 3-Stage Milestone Pipeline + Live Critic & Auditor Shields */}
          {toAct2 > 0.02 && toAct3 < 0.98 && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 18, padding: '0 20px', opacity: toAct2 * (1 - toAct3) }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: 32, fontWeight: 900, color: COLORS.white }}>
                  为什么大项目不会跑偏？<span style={{ color: COLORS.amber }}>三阶段闭环管控</span>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <span style={{ padding: '5px 14px', borderRadius: 9, backgroundColor: 'rgba(52,211,153,0.18)', border: `1px solid ${COLORS.green}`, color: COLORS.green, fontSize: 18, fontWeight: 900, opacity: criticBadgeIn }}>
                    ✓ Critic 审查
                  </span>
                  <span style={{ padding: '5px 14px', borderRadius: 9, backgroundColor: 'rgba(245,166,35,0.18)', border: `1px solid ${COLORS.amber}`, color: COLORS.amber, fontSize: 18, fontWeight: 900, opacity: auditBadgeIn }}>
                    ✓ Auditor 门禁
                  </span>
                </div>
              </div>
              {flowSteps.map((s, idx) => {
                const p = spring({ frame: Math.max(0, frame - s.start), fps, config: { damping: 20, stiffness: 82 } });
                const active = frame >= s.start;
                const w = active ? smoothFocusWeight(idx, act2Focus, 0.85) : 0;
                return (
                  <div
                    key={s.step}
                    style={{
                      ...(active ? crystalGlass(0.45 + w * 0.5, 16) : { borderRadius: 16, border: '1.5px dashed rgba(255,255,255,0.16)', backgroundColor: 'rgba(255,255,255,0.03)' }),
                      padding: '18px 26px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      opacity: active ? p : 0.4,
                      transform: active ? `translateX(${(1 - p) * -26 + w * 10}px)` : 'none',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
                      <span style={{ backgroundColor: s.color, color: '#111318', fontFamily: FONTS.display, fontSize: 32, fontWeight: 900, padding: '2px 12px', borderRadius: 8 }}>
                        {s.step}
                      </span>
                      <div>
                        <div style={{ fontSize: 30, fontWeight: 900, color: COLORS.white }}>{s.title}</div>
                        <div style={{ fontSize: 21, fontWeight: 700, color: COLORS.textSecondary, marginTop: 4 }}>{s.sub}</div>
                      </div>
                    </div>
                    <span style={{ fontFamily: FONTS.mono, fontSize: 18, fontWeight: 900, color: s.color, padding: '5px 14px', borderRadius: 8, border: `1px solid ${s.color}` }}>
                      {s.badge}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {/* ACT 3: Best Practice Formula — Strictly Sequential + Staggered Platform Bar */}
          {toAct3 > 0.02 && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 20, padding: '0 16px', opacity: toAct3 }}>
              <div style={{ ...crystalGlass(0.45, 14), padding: '14px 24px', borderColor: 'rgba(239,83,80,0.65)', fontSize: 24, fontWeight: 800, color: '#fca5a5', opacity: easeOutQuint((frame - 1175) / 22) }}>
                ✕ 避坑：不要第一炮就把所有需求文档全部写完
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18 }}>
                {[
                  { num: '①', title: '大目标', sub: '最终要交付什么结果', start: 1295 },
                  { num: '②', title: '现状仓库', sub: '代码位置与背景现状', start: 1345 },
                  { num: '③', title: '硬约束', sub: '不能动什么 / 必须满足什么', start: 1395 },
                ].map((it, i) => {
                  const p = spring({ frame: Math.max(0, frame - it.start), fps, config: { damping: 20, stiffness: 82 } });
                  return (
                    <div key={it.title} style={{ ...crystalGlass(0.85, 16), padding: '22px 20px', opacity: p, transform: `translateY(${(1 - p) * 24 + Math.sin(frame * 0.045 + i) * 2.5}px)` }}>
                      <div style={{ fontSize: 30, fontWeight: 900, color: COLORS.amber }}>{it.num} {it.title}</div>
                      <div style={{ fontSize: 20, fontWeight: 700, color: COLORS.textSecondary, marginTop: 8 }}>{it.sub}</div>
                    </div>
                  );
                })}
              </div>
              <div style={{ fontSize: 24, fontWeight: 800, color: COLORS.white, textAlign: 'center', opacity: bottomArrowIn, transform: `translateY(${(1 - bottomArrowIn) * 14}px)` }}>
                丢给 <span style={{ color: COLORS.amber, fontFamily: FONTS.mono }}>/teamwork</span> → 顺着它的需求访谈逐步落实细节即可 ✓
              </div>
              <PlatformBar platforms={['App', 'CLI', 'IDE']} plan="需付费计划" planColor="#f5a623" startFrame={1530} frame={frame} />
            </div>
          )}
        </div>
      </HudFrame>
    </>
  );
};

/* ============================================================================
 * 4. /run-workflow (02:58.90 – 03:39.93, 41.03s = 1231f) — ZERO DEAD AIR!
 * ==========================================================================*/
const Cmd04WorkflowScene: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const toAct2 = easeInOutCubic((frame - 336) / 24);
  const toAct3 = easeInOutCubic((frame - 1054) / 24);
  const fearIn = easeOutQuint((frame - 110) / 22);
  const reliefIn = easeOutQuint((frame - 215) / 22);
  const fileCount = Math.round(interpolate(frame, [375, 515], [1, 20], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }));
  const aggIn = easeOutQuint((frame - 760) / 24);
  const promptIn = easeOutQuint((frame - 1066) / 20);

  const status = frame < 348 ? 'AUTO PYTHON' : frame < 1065 ? 'FAN-OUT PIPELINE' : 'COPY PROMPT';

  return (
    <>
      <HudFrame
        moveIndex={4}
        totalMoves={5}
        titleZh="指令 04 · /run-workflow 定制流水线"
        titleEn="DYNAMIC WORKFLOWS · BATCH"
        cameraMoving={frame >= 348 && frame < 1065}
        status={status}
        metrics={[
          { labelEn: 'MODE', labelZh: '适用卡点', value: '批量流水线', accent: true },
          { labelEn: 'LOGIC', labelZh: '编排能力', value: '循环·聚合' },
          { labelEn: 'PLAN', labelZh: '使用门槛', value: '免费可用' },
        ]}
        graphMode="step"
        graphProgress={Math.min(1, frame / 1100)}
        graphSteps={3}
        promptTokens={[
          { text: '/run-workflow ', highlight: true },
          { text: '由 Agent 现场生成 Python 编排脚本：' },
          { text: '循环 + 并行 + 汇总聚合', highlight: true },
        ]}
        promptLabel="核心机制"
        promptBadge="WORKFLOW"
        promptStartFrame={20}
      >
        <div style={{ position: 'absolute', inset: 22, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {/* ACT 1: Sequential Myth Buster (Official Quote -> Fear -> Relief!) */}
          {toAct2 < 0.98 && (
            <div style={{ position: 'absolute', inset: 0, display: 'grid', gridTemplateColumns: '0.95fr 1.1fr', gap: 22, alignItems: 'center', opacity: 1 - toAct2 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ ...crystalGlass(0.55, 16), padding: '18px 22px', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <PythonLogo size={38} />
                  <div style={{ fontSize: 24, fontWeight: 900, color: COLORS.white }}>官方：现场写一段 Python 编排脚本</div>
                </div>
                <div style={{ ...crystalGlass(0.45, 16), padding: '16px 22px', borderColor: 'rgba(239,83,80,0.6)', fontSize: 23, fontWeight: 800, color: '#fca5a5', opacity: fearIn, transform: `translateX(${(1 - fearIn) * -22}px)` }}>
                  “诶？我不会写 Python 代码啊！”
                </div>
                <div style={{ ...crystalGlass(0.92, 18), padding: '20px 22px', borderColor: COLORS.green, opacity: reliefIn, transform: `translateY(${(1 - reliefIn) * 20}px)` }}>
                  <div style={{ fontSize: 26, fontWeight: 900, color: COLORS.green, marginBottom: 6 }}>✓ 千万别被吓倒！</div>
                  <div style={{ fontSize: 23, fontWeight: 800, color: COLORS.white, lineHeight: 1.45 }}>
                    代码由 <span style={{ color: COLORS.amber }}>Agent 现场替你自动编写</span>，不需要你自己手写一行！
                  </div>
                </div>
              </div>
              <OfficialDocPreview src="assets_agy/crop_workflow_doc.png" domain="antigravity.google/docs/dynamic-workflows" height={370} />
            </div>
          )}

          {/* ACT 2: Live 1->20 File Counter -> Flowing Arrows -> Parallel Reviewers -> Aggregated List -> 3 Sequential Pills */}
          {toAct2 > 0.02 && toAct3 < 0.98 && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 22, padding: '0 16px', opacity: toAct2 * (1 - toAct3) }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1.25fr auto 1fr', gap: 14, alignItems: 'center' }}>
                <div style={{ ...crystalGlass(0.65, 18), padding: '24px 20px', textAlign: 'center', transform: `translateY(${Math.sin(frame * 0.045) * 3}px)` }}>
                  <div style={{ fontFamily: FONTS.display, fontSize: 82, fontWeight: 900, color: COLORS.amber, lineHeight: 0.95 }}>{fileCount}</div>
                  <div style={{ fontSize: 24, fontWeight: 900, color: COLORS.white, marginTop: 8 }}>个改动文件</div>
                  <div style={{ fontFamily: FONTS.mono, fontSize: 16, color: COLORS.textSecondary, marginTop: 4 }}>for file in diff</div>
                </div>

                {/* Animated flowing dashed beam */}
                <svg width="52" height="24" viewBox="0 0 52 24">
                  <line x1="2" y1="12" x2="48" y2="12" stroke={COLORS.amber} strokeWidth="4" strokeDasharray="8 6" strokeDashoffset={-frame * 1.8} />
                </svg>

                <div style={{ ...crystalGlass(0.85, 18), padding: '20px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ fontFamily: FONTS.mono, fontSize: 18, fontWeight: 900, color: '#c084fc' }}>parallel(Reviewer × 20)</div>
                  {['Reviewer #01 · 安全与空指针', 'Reviewer #02 · 越界与边界检查', 'Reviewer #20 · 独立隔离审查'].map((r, i) => {
                    const p = spring({ frame: Math.max(0, frame - 560 - i * 36), fps, config: { damping: 20, stiffness: 82 } });
                    return (
                      <div key={r} style={{ padding: '8px 14px', borderRadius: 10, backgroundColor: 'rgba(192,132,252,0.14)', border: '1px solid rgba(192,132,252,0.45)', fontSize: 19, fontWeight: 800, color: COLORS.white, opacity: p, transform: `translateX(${(1 - p) * -18}px)` }}>
                        {r}
                      </div>
                    );
                  })}
                </div>

                <svg width="52" height="24" viewBox="0 0 52 24" style={{ opacity: aggIn }}>
                  <line x1="2" y1="12" x2="48" y2="12" stroke={COLORS.green} strokeWidth="4" strokeDasharray="8 6" strokeDashoffset={-frame * 1.8} />
                </svg>

                <div style={{ ...crystalGlass(0.92, 18), padding: '24px 20px', borderColor: COLORS.green, textAlign: 'center', opacity: aggIn, transform: `scale(${0.9 + aggIn * 0.1})` }}>
                  <div style={{ fontSize: 28, fontWeight: 900, color: COLORS.green }}>汇总问题清单</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: COLORS.textPrimary, marginTop: 10, lineHeight: 1.4 }}>
                    按文件分组输出<br />零遗漏
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', gap: 20 }}>
                {[
                  { tag: '带循环 (Loop)', start: 865 },
                  { tag: '带阶段 (Phase)', start: 910 },
                  { tag: '带聚合逻辑 (Aggregate)', start: 955 },
                ].map((it) => {
                  const p = spring({ frame: Math.max(0, frame - it.start), fps, config: { damping: 18, stiffness: 86 } });
                  return (
                    <span key={it.tag} style={{ ...crystalGlass(0.6, 12), padding: '10px 22px', fontSize: 22, fontWeight: 900, color: COLORS.amber, opacity: p, transform: `translateY(${(1 - p) * 16}px)` }}>
                      ✦ {it.tag}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {/* ACT 3: Live Typewriter Workflow Prompt + Sequential Platform Bar */}
          {toAct3 > 0.02 && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 22, padding: '0 16px', opacity: toAct3 }}>
              <CopyPromptCard
                command="/run-workflow"
                body="扫描当前分支所有改动的文件，并行给每个文件配一个代码审查子 Agent 查空指针和越界风险，最后汇总输出一份按文件分组的问题清单。"
                tags={['循环遍历', '并行审查', '分组汇总']}
                reveal={promptIn}
                startFrame={1068}
                frame={frame}
              />
              <PlatformBar platforms={['App', 'CLI']} plan="免费计划可用" planColor="#34d399" startFrame={1125} frame={frame} />
            </div>
          )}
        </div>
      </HudFrame>
    </>
  );
};

/* ============================================================================
 * 5. /goal (03:44.16 – 04:36.20, 52.04s = 1561f) — ZERO DEAD AIR!
 * ==========================================================================*/
const Cmd05GoalScene: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();

  const toAct2 = easeInOutCubic((frame - 514) / 24);
  const toAct3 = easeInOutCubic((frame - 1238) / 24);
  const codexIn = easeOutQuint((frame - 10) / 20);
  const claudeIn = easeOutQuint((frame - 48) / 20);
  const painBoxIn = easeOutQuint((frame - 155) / 22);
  const bubble1In = easeOutQuint((frame - 250) / 22);
  const bubble2In = easeOutQuint((frame - 365) / 22);

  const badIn = easeOutQuint((frame - 805) / 22);
  const goodIn = easeOutQuint((frame - 985) / 22);
  const npmTestBadge = easeOutQuint((frame - 1100) / 20);
  const npmBuildBadge = easeOutQuint((frame - 1165) / 20);
  const overnightPct = interpolate(frame, [1265, 1495], [12, 100], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  const status = frame < 526 ? 'PREMATURE STOP' : frame < 1250 ? 'VERIFIABLE GOAL' : 'OVERNIGHT RUN';

  return (
    <>
      <HudFrame
        moveIndex={5}
        totalMoves={5}
        titleZh="指令 05 · /goal 下班挂机神器"
        titleEn="GOAL MODE · AUTONOMOUS"
        cameraMoving={frame >= 526 && frame < 1250}
        status={status}
        metrics={[
          { labelEn: 'MODE', labelZh: '适用卡点', value: '挂机死磕', accent: true },
          { labelEn: 'RULE', labelZh: '核心铁律', value: '机器可验' },
          { labelEn: 'PLAN', labelZh: '支持范围', value: '全端支持' },
        ]}
        graphMode="curve"
        graphProgress={Math.min(1, frame / 1380)}
        promptTokens={[
          { text: '/goal ', highlight: true },
          { text: '目标不完成不许停下来 · 终点必须是 ' },
          { text: '机器可自动验证的标准', highlight: true },
        ]}
        promptLabel="核心机制"
        promptBadge="GOAL"
        promptStartFrame={20}
      >
        <div style={{ position: 'absolute', inset: 22, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {/* ACT 1: Sequential Codex/Claude -> Pain Box -> Bubble 1 -> Bubble 2 */}
          {toAct2 < 0.98 && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 22, padding: '0 20px', opacity: 1 - toAct2 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <span style={{ ...crystalGlass(0.5, 12), padding: '10px 18px', display: 'inline-flex', alignItems: 'center', gap: 10, fontSize: 22, fontWeight: 800, color: COLORS.white, opacity: codexIn, transform: `translateY(${(1 - codexIn) * 14}px)` }}>
                  <OpenAICodexLogo size={28} /> Codex 目标模式
                </span>
                <span style={{ ...crystalGlass(0.5, 12), padding: '10px 18px', display: 'inline-flex', alignItems: 'center', gap: 10, fontSize: 22, fontWeight: 800, color: COLORS.white, opacity: claudeIn, transform: `translateY(${(1 - claudeIn) * 14}px)` }}>
                  <ClaudeLogo size={28} /> Claude 长任务
                </span>
                <span style={{ fontSize: 22, fontWeight: 700, color: COLORS.textSecondary, opacity: claudeIn }}>用过的朋友都懂这个痛点 ↓</span>
              </div>

              <div style={{ ...crystalGlass(0.75, 18), padding: '24px 28px', borderColor: COLORS.red, opacity: painBoxIn, transform: `translateY(${(1 - painBoxIn) * 20}px)` }}>
                <div style={{ fontSize: 30, fontWeight: 900, color: COLORS.red, marginBottom: 14 }}>平时让 AI 干长任务：干两步就停下来反问！</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
                  <div style={{ padding: '16px 20px', borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.06)', fontSize: 22, fontWeight: 700, color: COLORS.textPrimary, lineHeight: 1.45, opacity: bubble1In, transform: `translateX(${(1 - bubble1In) * -18}px)` }}>
                    “我已经帮你做了第 1、2 步，<br />下一步我打算做第 3 步……”（停下等你）
                  </div>
                  <div style={{ padding: '16px 20px', borderRadius: 12, backgroundColor: 'rgba(239,83,80,0.16)', border: `1.5px solid ${COLORS.red}`, fontSize: 22, fontWeight: 900, color: COLORS.white, lineHeight: 1.45, opacity: bubble2In, transform: `translateX(${(1 - bubble2In) * 18}px)` }}>
                    明明都知道下一步要干啥了，还要停下来问我？直接把人套牢！
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ACT 2: /goal Official Doc + Bad vs Good Verifiable Prompt + Live Test Badges */}
          {toAct2 > 0.02 && toAct3 < 0.98 && (
            <div style={{ position: 'absolute', inset: 0, display: 'grid', gridTemplateColumns: '1.08fr 0.95fr', gap: 22, alignItems: 'center', opacity: toAct2 * (1 - toAct3) }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ fontSize: 28, fontWeight: 900, color: COLORS.amber }}>死磕模式铁律：终点必须“机器能自己验证”</div>

                {/* BAD Example */}
                <div style={{ ...crystalGlass(0.4, 16), padding: '16px 22px', borderColor: COLORS.red, opacity: badIn, transform: `translateY(${(1 - badIn) * 20}px)` }}>
                  <div style={{ fontSize: 21, fontWeight: 900, color: COLORS.red, marginBottom: 6 }}>✕ 错误写法（无客观标准，无法判定结束）</div>
                  <div style={{ fontSize: 23, fontWeight: 800, color: COLORS.textSecondary }}>
                    <span style={{ fontFamily: FONTS.mono }}>/goal</span> 把这个项目优化得更好看
                  </div>
                </div>

                {/* GOOD Example */}
                <div style={{ ...crystalGlass(0.95, 16), padding: '18px 22px', borderColor: COLORS.green, opacity: goodIn, transform: `translateY(${(1 - goodIn) * 20}px)` }}>
                  <div style={{ fontSize: 21, fontWeight: 900, color: COLORS.green, marginBottom: 8 }}>✓ 正确写法（机器可自动验证 · 抄作业）</div>
                  <div style={{ fontSize: 23, fontWeight: 900, color: COLORS.white, lineHeight: 1.45 }}>
                    <span style={{ fontFamily: FONTS.mono, color: COLORS.amber }}>/goal </span>
                    修复项目里所有 <span style={{ color: '#74B3F5', fontFamily: FONTS.mono }}>npm test</span> 失败的用例，并且保证 <span style={{ color: COLORS.green, fontFamily: FONTS.mono }}>npm run build</span> 零报错通过。
                  </div>
                  <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
                    <span style={{ padding: '4px 12px', borderRadius: 8, backgroundColor: 'rgba(116,179,245,0.18)', border: '1px solid #74B3F5', color: '#93c5fd', fontFamily: FONTS.mono, fontSize: 17, fontWeight: 900, opacity: npmTestBadge }}>
                      ✓ npm test PASS
                    </span>
                    <span style={{ padding: '4px 12px', borderRadius: 8, backgroundColor: 'rgba(52,211,153,0.2)', border: `1px solid ${COLORS.green}`, color: COLORS.green, fontFamily: FONTS.mono, fontSize: 17, fontWeight: 900, opacity: npmBuildBadge }}>
                      ✓ npm run build 0 ERRORS
                    </span>
                  </div>
                </div>
              </div>

              <OfficialDocPreview src="assets_agy/crop_goal_doc.png" domain="antigravity.google/docs/commands/goal" height={370} />
            </div>
          )}

          {/* ACT 3: Live Animated Overnight Progress + Sequential Platform Bar */}
          {toAct3 > 0.02 && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 22, padding: '0 20px', opacity: toAct3 }}>
              <div style={{ ...crystalGlass(0.9, 20), padding: '26px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontFamily: FONTS.mono, fontSize: 19, color: COLORS.amber, fontWeight: 900, marginBottom: 6 }}>AUTONOMOUS GOAL MODE · OVERNIGHT</div>
                    <div style={{ fontSize: 38, fontWeight: 900, color: COLORS.white }}>验收标准写死 → 过夜/跨天放心挂机</div>
                  </div>
                  <AntigravityLogo size={64} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ flex: 1, height: 16, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.1)', overflow: 'hidden' }}>
                    <div style={{ width: `${overnightPct}%`, height: '100%', borderRadius: 8, backgroundColor: overnightPct > 98 ? COLORS.green : COLORS.amber }} />
                  </div>
                  <span style={{ fontFamily: FONTS.mono, fontSize: 24, fontWeight: 900, color: overnightPct > 98 ? COLORS.green : COLORS.amber, minWidth: 110, textAlign: 'right' }}>
                    {Math.round(overnightPct)}% {overnightPct > 98 ? 'DONE ✓' : ''}
                  </span>
                </div>
              </div>
              <PlatformBar platforms={['App', 'CLI', 'IDE']} plan="全平台支持" planColor="#34d399" startFrame={1405} frame={frame} />
            </div>
          )}
        </div>
      </HudFrame>
    </>
  );
};

/* ============================================================================
 * 6. OUTRO (04:36.20 – 04:40.50, 4.3s = 129f): 3-Second Selection Cheatsheet w/ Smooth Sweep
 * ==========================================================================*/
const OutroCheatsheetScene: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sweepRow = interpolate(frame, [42, 118], [0, 4], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  const rows = [
    { pain: '活多能拆', cmd: '/swarm', platforms: 'App · CLI', plan: '免费可用', color: '#34d399' },
    { pain: '活难啃不动', cmd: '/boost', platforms: 'App · CLI · IDE', plan: '付费计划', color: '#f5a623' },
    { pain: '跨天大工程', cmd: '/teamwork', platforms: 'App · CLI · IDE', plan: '付费计划', color: '#74B3F5' },
    { pain: '批量定制流水线', cmd: '/run-workflow', platforms: 'App · CLI', plan: '免费可用', color: '#c084fc' },
    { pain: '目标明确想挂机', cmd: '/goal', platforms: 'App · CLI · IDE', plan: '全端支持', color: '#fb7185' },
  ];

  return (
    <>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          padding: '38px 64px 148px 64px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: 18,
          boxSizing: 'border-box',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <AntigravityLogo size={46} />
            <span style={{ fontSize: 44, fontWeight: 900, color: COLORS.white }}>Antigravity 3 秒选型口诀</span>
          </div>
          <span style={{ backgroundColor: COLORS.amber, color: '#111318', padding: '8px 22px', borderRadius: 12, fontSize: 24, fontWeight: 900 }}>
            建议直接截图保存
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {rows.map((r, i) => {
            const p = spring({ frame: Math.max(0, frame - 4 - i * 8), fps, config: { damping: 20, stiffness: 88 } });
            const w = frame > 40 ? smoothFocusWeight(i, sweepRow, 0.85) : 0;
            return (
              <div
                key={r.cmd}
                style={{
                  ...crystalGlass(0.55 + w * 0.4, 16),
                  padding: '18px 30px',
                  display: 'grid',
                  gridTemplateColumns: '1.25fr auto 1.1fr 0.95fr 0.65fr',
                  alignItems: 'center',
                  gap: 18,
                  opacity: p,
                  transform: `translateX(${(1 - p) * 32 + w * 8}px)`,
                }}
              >
                <div style={{ fontSize: 32, fontWeight: 900, color: COLORS.white }}>{r.pain}</div>
                <span style={{ fontSize: 28, color: COLORS.amber, fontWeight: 900 }}>→</span>
                <div style={{ fontFamily: FONTS.mono, fontSize: 32, fontWeight: 900, color: r.color }}>{r.cmd}</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: COLORS.textSecondary }}>{r.platforms}</div>
                <div style={{ justifySelf: 'end', padding: '5px 16px', borderRadius: 9, backgroundColor: r.plan === '付费计划' ? 'rgba(245,166,35,0.2)' : 'rgba(52,211,153,0.2)', border: `1px solid ${r.plan === '付费计划' ? COLORS.amber : COLORS.green}`, color: r.plan === '付费计划' ? COLORS.amber : COLORS.green, fontSize: 20, fontWeight: 900 }}>
                  {r.plan}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};

export const AgySlashCommandsVideo: React.FC = () => {
  const ov = 10;

  return (
    <WorldCanvas watermark="ANTIGRAVITY">
      <Audio src={staticFile('assets_agy/agy_commands.wav')} />

      <Sequence from={0} durationInFrames={f(10.23) + ov}>
        <SceneWrap durationInFrames={f(10.23) + ov} kind="dolly-zoom">
          <IntroScene dur={f(10.23) + ov} />
        </SceneWrap>
      </Sequence>

      <Sequence from={f(10.23)} durationInFrames={f(13.30 - 10.23) + ov}>
        <SceneWrap durationInFrames={f(13.30 - 10.23) + ov} kind="pan-left">
          <MoveBumperScene moveNum="01" labelTop="神级指令 01" titleZh="/swarm 并行拆活" titleEn="AGENT SWARM" subtitleTags={['活多能拆', '共享消息板 · @verifier 验收']} />
        </SceneWrap>
      </Sequence>
      <Sequence from={f(13.30)} durationInFrames={f(68.20 - 13.30) + ov}>
        <SceneWrap durationInFrames={f(68.20 - 13.30) + ov} kind="pan-left">
          <Cmd01SwarmScene dur={f(68.20 - 13.30) + ov} />
        </SceneWrap>
      </Sequence>

      <Sequence from={f(68.20)} durationInFrames={f(72.00 - 68.20) + ov}>
        <SceneWrap durationInFrames={f(72.00 - 68.20) + ov} kind="flip-reveal">
          <MoveBumperScene moveNum="02" labelTop="神级指令 02" titleZh="/boost 深度推理" titleEn="DEEP REASONING" subtitleTags={['活难啃不动', '多轮挑战找茬 · 彻底解决']} />
        </SceneWrap>
      </Sequence>
      <Sequence from={f(72.00)} durationInFrames={f(113.63 - 72.00) + ov}>
        <SceneWrap durationInFrames={f(113.63 - 72.00) + ov} kind="blur-pushback">
          <Cmd02BoostScene dur={f(113.63 - 72.00) + ov} />
        </SceneWrap>
      </Sequence>

      <Sequence from={f(113.63)} durationInFrames={f(117.90 - 113.63) + ov}>
        <SceneWrap durationInFrames={f(117.90 - 113.63) + ov} kind="angled-dolly">
          <MoveBumperScene moveNum="03" labelTop="神级指令 03" titleZh="/teamwork 工程立项" titleEn="AGENT TEAMS" subtitleTags={['跨天大工程', '需求访谈 · Critic 门禁把关']} />
        </SceneWrap>
      </Sequence>
      <Sequence from={f(117.90)} durationInFrames={f(174.63 - 117.90) + ov}>
        <SceneWrap durationInFrames={f(174.63 - 117.90) + ov} kind="angled-dolly">
          <Cmd03TeamworkScene dur={f(174.63 - 117.90) + ov} />
        </SceneWrap>
      </Sequence>

      <Sequence from={f(174.63)} durationInFrames={f(178.90 - 174.63) + ov}>
        <SceneWrap durationInFrames={f(178.90 - 174.63) + ov} kind="dolly-zoom">
          <MoveBumperScene moveNum="04" labelTop="神级指令 04" titleZh="/run-workflow 流水线" titleEn="DYNAMIC WORKFLOWS" subtitleTags={['批量定制流水线', 'Agent 自动写编排 · 免费可用']} />
        </SceneWrap>
      </Sequence>
      <Sequence from={f(178.90)} durationInFrames={f(219.93 - 178.90) + ov}>
        <SceneWrap durationInFrames={f(219.93 - 178.90) + ov} kind="pan-left">
          <Cmd04WorkflowScene dur={f(219.93 - 178.90) + ov} />
        </SceneWrap>
      </Sequence>

      <Sequence from={f(219.93)} durationInFrames={f(224.16 - 219.93) + ov}>
        <SceneWrap durationInFrames={f(224.16 - 219.93) + ov} kind="blur-pushback">
          <MoveBumperScene moveNum="05" labelTop="神级指令 05" titleZh="/goal 下班挂机神器" titleEn="AUTONOMOUS GOAL" subtitleTags={['目标明确想挂机', '机器可验证 · 死磕不早停']} />
        </SceneWrap>
      </Sequence>
      <Sequence from={f(224.16)} durationInFrames={f(276.20 - 224.16) + ov}>
        <SceneWrap durationInFrames={f(276.20 - 224.16) + ov} kind="flip-reveal">
          <Cmd05GoalScene dur={f(276.20 - 224.16) + ov} />
        </SceneWrap>
      </Sequence>

      <Sequence from={f(276.20)} durationInFrames={AGY_COMMANDS_TOTAL_FRAMES - f(276.20)}>
        <SceneWrap durationInFrames={AGY_COMMANDS_TOTAL_FRAMES - f(276.20)} kind="pull-gather">
          <OutroCheatsheetScene dur={AGY_COMMANDS_TOTAL_FRAMES - f(276.20)} />
        </SceneWrap>
      </Sequence>

      <SubtitleOverlay subtitles={AGY_COMMANDS_SUBTITLES} />
    </WorldCanvas>
  );
};