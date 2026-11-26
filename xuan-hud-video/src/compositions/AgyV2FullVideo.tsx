import React from 'react';
import { Audio, Img, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { COLORS, FONTS, FPS } from '../design/tokens';
import {
  easeInOutCubic,
  easeOutExpo,
  glassSheenStyle,
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
import { CRISP_SPRING, mixRgb, steppedGlide } from '../engine/motion';
import { crystal } from '../engine/glass';
import {
  LuminousStage,
  Scene01Intro3DLayers,
  Scene02SwarmUseCases,
  Scene03FlipToSwarmTopology,
} from './AgyV2MotionSample';

const f = (sec: number) => Math.round(sec * FPS);
export const AGY_V2_FULL_FRAMES = 8415; // 280.50s @ 30fps

type SfxKind = 'drop' | 'deal' | 'flow' | 'pop' | 'flip' | 'whoosh';
const SFX_FILES: Record<SfxKind, { file: string; vol: number }> = {
  drop: { file: 'assets_agy/sfx/sfx_card_drop.wav', vol: 0.14 },
  deal: { file: 'assets_agy/sfx/sfx_card_deal.wav', vol: 0.13 },
  flow: { file: 'assets_agy/sfx/sfx_flow.wav', vol: 0.12 },
  pop: { file: 'assets_agy/sfx/sfx_pop.wav', vol: 0.11 },
  flip: { file: 'assets_agy/sfx/sfx_flip.wav', vol: 0.16 },
  whoosh: { file: 'assets_agy/sfx/sfx_whoosh.wav', vol: 0.15 },
};

const SfxCue: React.FC<{ at: number; kind: SfxKind; vol?: number }> = ({ at, kind, vol }) => {
  const cfg = SFX_FILES[kind];
  if (at < 0 || at >= AGY_V2_FULL_FRAMES) return null;
  return (
    <Sequence from={at} durationInFrames={24}>
      <Audio src={staticFile(cfg.file)} volume={vol ?? cfg.vol} />
    </Sequence>
  );
};

/** Helper: crisp voiceover-synced emphasis pulse (0 -> 1 -> 0 over a beat window, or stays 1 if hold=true) */
const beatHighlight = (frame: number, at: number, endAt?: number): number => {
  const enter = easeInOutCubic((frame - at) / 10);
  if (endAt === undefined) return enter;
  const leave = easeInOutCubic((frame - endAt) / 12);
  return enter * (1 - leave);
};

/** Reusable 3D Perspective 3x-Retina Dark Official Doc Window with Optional Mid-Scene Focus Shift */
const DarkOfficialWindow: React.FC<{
  src: string;
  domain: string;
  height: number;
  tiltY?: number;
  startFrame?: number;
  focusAt?: number;
  focusEnd?: number;
}> = ({ src, domain, height, tiltY = -9, startFrame = 4, focusAt, focusEnd }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: Math.max(0, frame - startFrame), fps, config: CRISP_SPRING });
  const focus = focusAt !== undefined ? beatHighlight(frame, focusAt, focusEnd) : 0;
  const curTiltY = tiltY * (1 - focus * 0.78);
  const curScale = 1 + focus * 0.055;

  return (
    <div style={{ perspective: 1400, opacity: p, transform: `translate3d(${((1 - p) * 56).toFixed(1)}px, 0, 0)` }}>
      <div
        style={{
          transform: `rotateY(${curTiltY.toFixed(2)}deg) rotateX(${(3 - focus * 2).toFixed(2)}deg) scale(${curScale.toFixed(4)})`,
          borderRadius: 20,
          overflow: 'hidden',
          border: `2px solid ${mixRgb([255, 255, 255], [245, 166, 35], 0.24 + focus * 0.72)}`,
          backgroundColor: '#13161B',
          boxShadow: [
            'inset 0 1.5px 0 rgba(255,255,255,0.32)',
            '0 8px 0 rgba(7,10,16,0.96)',
            '0 9px 0 rgba(255,255,255,0.12)',
            `0 34px 72px rgba(0,0,0,0.78), 0 0 ${(28 + focus * 36).toFixed(0)}px rgba(245,166,35,${(0.12 + focus * 0.24).toFixed(2)})`,
          ].join(', '),
        }}
      >
        <div style={{ height: 38, padding: '0 16px', backgroundColor: 'rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: 7 }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#FF5F56' }} />
            <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#FFBD2E' }} />
            <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#27C93F' }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: FONTS.mono, fontSize: 16, fontWeight: 700, color: '#C8D1E0' }}>
            <AntigravityLogo size={16} />
            <span>{domain}</span>
            <span style={{ color: '#2ECC71', fontSize: 14 }}>● OFFICIAL</span>
          </div>
          <div style={{ width: 40 }} />
        </div>
        <div style={{ height, backgroundColor: '#13161B', position: 'relative', overflow: 'hidden' }}>
          <Img src={staticFile(src)} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          <div style={glassSheenStyle(frame, 0.24)} />
        </div>
      </div>
    </div>
  );
};

/** Voiceover-Synced Sequential Platform Pill Bar (App -> CLI -> IDE -> Plan) */
const SequentialPlatformBar: React.FC<{
  platforms: Array<{ name: 'App' | 'CLI' | 'IDE'; at: number }>;
  plan?: { text: string; free: boolean; at: number };
}> = ({ platforms, plan }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 6px' }}>
      <div style={{ display: 'flex', gap: 16 }}>
        {platforms.map((item, i) => {
          const pp = spring({ frame: Math.max(0, frame - item.at), fps, config: CRISP_SPRING });
          const nextAt = platforms[i + 1]?.at ?? (plan ? plan.at : item.at + 36);
          const active = beatHighlight(frame, item.at, nextAt);
          const borderCol = mixRgb([190, 200, 220], [245, 166, 35], 0.25 + active * 0.75);
          const bgAlpha = 0.08 + active * 0.2;
          return (
            <span
              key={item.name}
              style={{
                padding: '12px 24px',
                borderRadius: 14,
                backgroundColor: `rgba(245, 166, 35, ${bgAlpha.toFixed(3)})`,
                border: `2px solid ${borderCol}`,
                boxShadow: `0 0 ${(28 * active).toFixed(0)}px rgba(245,166,35,${(0.45 * active).toFixed(2)})`,
                color: active > 0.2 ? '#FFFFFF' : '#E2E8F4',
                fontSize: 25,
                fontWeight: 900,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 10,
                opacity: pp,
                transform: `translate3d(0, ${((1 - pp) * 16).toFixed(1)}px, 0) scale(${(1 + active * 0.07).toFixed(4)})`,
              }}
            >
              {item.name === 'App' ? <DesktopAppIcon size={24} /> : item.name === 'CLI' ? <TerminalCliIcon size={24} /> : <IdeCodeIcon size={24} />}
              {item.name === 'IDE' ? 'IDE 扩展' : `Antigravity ${item.name}`}
            </span>
          );
        })}
      </div>
      {plan && (() => {
        const plP = spring({ frame: Math.max(0, frame - plan.at), fps, config: CRISP_SPRING });
        const glow = beatHighlight(frame, plan.at, plan.at + 45);
        return (
          <span
            style={{
              backgroundColor: plan.free ? '#2ECC71' : COLORS.amber,
              color: '#0E1119',
              padding: '12px 28px',
              borderRadius: 14,
              fontSize: 26,
              fontWeight: 900,
              boxShadow: plan.free
                ? `0 0 ${(32 * glow).toFixed(0)}px rgba(46,204,113,0.65)`
                : `0 0 ${(32 * glow).toFixed(0)}px rgba(245,166,35,0.65)`,
              opacity: plP,
              transform: `scale(${(0.86 + plP * 0.14 + glow * 0.06).toFixed(4)})`,
            }}
          >
            {plan.text}
          </span>
        );
      })()}
    </div>
  );
};

/** Reusable Spotlight Copy-Ready Prompt Console with Exact Voiceover-Synced Tag & Platform Beats */
const SpotlightPromptView: React.FC<{
  command: string;
  headline: string;
  body: string;
  tags: Array<{ label: string; at: number }>;
  platforms: Array<{ name: 'App' | 'CLI' | 'IDE'; at: number }>;
  plan: { text: string; free: boolean; at: number };
  typeStart: number;
  dur: number;
}> = ({ command, headline, body, tags, platforms, plan, typeStart, dur }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const inP = easeOutExpo(frame / 14);
  const outP = easeInOutCubic((frame - (dur - 16)) / 16);
  const cardP = spring({ frame: Math.max(0, frame - 4), fps, config: CRISP_SPRING });
  const localType = Math.max(0, frame - typeStart);
  const typed = body.slice(0, Math.min(body.length, Math.floor(localType * 1.15)));
  const cursorOn = Math.floor(frame / 10) % 2 === 0;

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        gap: 30,
        padding: '0 46px',
        boxSizing: 'border-box',
        opacity: inP * (1 - outP),
        transform: `scale(${(0.96 + inP * 0.04 - outP * 0.04).toFixed(4)})`,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 24 }}>
        <span style={{ fontFamily: FONTS.mono, fontSize: 92, fontWeight: 900, color: COLORS.amber, lineHeight: 0.95 }}>{command}</span>
        <span style={{ fontSize: 38, fontWeight: 900, color: COLORS.white }}>{headline}</span>
      </div>

      {/* Spotlight Command Console Card */}
      <div style={{ perspective: 1400 }}>
        <div
          style={{
            ...crystal(0.95, 26),
            padding: '36px 42px',
            borderColor: '#F5A623',
            boxShadow: '0 0 58px rgba(245,166,35,0.26), 0 24px 60px rgba(0,0,0,0.55)',
            transform: `translate3d(0, ${((1 - cardP) * 32).toFixed(1)}px, 0) rotateX(${((1 - cardP) * 8).toFixed(2)}deg)`,
            opacity: cardP,
            overflow: 'hidden',
          }}
        >
          <div style={glassSheenStyle(frame, 0.7)} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
            <span style={{ backgroundColor: COLORS.amber, color: '#0E1119', padding: '7px 20px', borderRadius: 10, fontSize: 23, fontWeight: 900 }}>
              直接抄作业 · 截屏保存
            </span>
            <div style={{ display: 'flex', gap: 12 }}>
              {tags.map((t, i) => {
                const tp = spring({ frame: Math.max(0, frame - t.at), fps, config: CRISP_SPRING });
                const nextTagAt = tags[i + 1]?.at ?? t.at + 36;
                const active = beatHighlight(frame, t.at, nextTagAt);
                return (
                  <span
                    key={t.label}
                    style={{
                      padding: '6px 16px',
                      borderRadius: 10,
                      backgroundColor: `rgba(245, 166, 35, ${(0.08 + active * 0.22).toFixed(2)})`,
                      border: `2px solid ${mixRgb([200, 210, 225], [245, 166, 35], 0.25 + active * 0.75)}`,
                      color: active > 0.2 ? '#FFE0A3' : '#E2E8F4',
                      fontSize: 22,
                      fontWeight: 900,
                      opacity: tp,
                      transform: `scale(${(0.86 + tp * 0.14 + active * 0.06).toFixed(4)})`,
                    }}
                  >
                    {t.label}
                  </span>
                );
              })}
            </div>
          </div>

          <div style={{ fontSize: 40, fontWeight: 900, color: COLORS.white, lineHeight: 1.5, minHeight: 120, wordBreak: 'break-word' }}>
            <span style={{ fontFamily: FONTS.mono, color: COLORS.amber, marginRight: 10 }}>{command}</span>
            {typed}
            {typed.length < body.length && (
              <span style={{ display: 'inline-block', width: 12, height: 34, backgroundColor: COLORS.amber, marginLeft: 6, verticalAlign: 'middle', opacity: cursorOn ? 1 : 0.15 }} />
            )}
          </div>
        </div>
      </div>

      {/* Exact Voiceover-Synced Sequential Platform & Plan Pills */}
      <SequentialPlatformBar platforms={platforms} plan={plan} />
    </div>
  );
};

/* ============================================================================
 * SCENE 04 (00:54.4 – 01:08.3, 417f): /swarm Copy-Ready Prompt Console
 * Exact speech beats: 59.0s(138f) 拆分范围 -> 60.0s(168f) 验收标准 -> 63.0s(258f) App -> 64.2s(294f) CLI -> 66.1s(351f) 免费
 * ==========================================================================*/
const Scene04SwarmPrompt: React.FC<{ dur: number }> = ({ dur }) => (
  <SpotlightPromptView
    command="/swarm"
    headline="说清两件事：拆分范围 + 验收标准"
    body="把 src/modules 下面这 5 个独立模块都补齐错误处理和单元测试，完成后统一跑全量测试通过。"
    tags={[
      { label: '① 拆分范围', at: 138 },
      { label: '② 验收标准', at: 168 },
    ]}
    platforms={[
      { name: 'App', at: 258 },
      { name: 'CLI', at: 294 },
    ]}
    plan={{ text: '免费计划可用', free: true, at: 351 }}
    typeStart={18}
    dur={dur}
  />
);

/* ============================================================================
 * SCENE 05 (01:08.1 – 01:53.7, 1368f): /boost
 * Progressive "任务拆不开(白) -> 且非常有难度(金黄)" -> 3 Hard Cases -> 16f Flip -> Orbital Ring + 3x Doc -> Prompt
 * ==========================================================================*/
const Scene05BoostFull: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Relative to 68.1s:
  // 69.9s (54f): "任务拆不开" (white highlight), "且非常有难度" dimmed
  // 70.9s (84f): "并且任务有难度" -> "且非常有难度" pops amber gold while "任务拆不开" stays crisp white!
  // 72.1s (120f): Case 01, 75.2s (213f): Case 02, 77.6s (285f): Case 03
  // 80.4s (369f): "普通模式聊三轮原地打转", 82.8s (441f): "改好一个又引出新问题", 85.7s (528f): "直接切 /boost"
  // 86.9s (565f): 16f 3D Flip into /boost
  // 89.4s (639f): Orbital Ring enters ("不靠多派人" white -> 91.1s 690f "多轮深度推理" amber)
  // 94.2s (783f) P1 -> 95.2s (813f) P2 -> 98.3s (906f) P3 + Doc Focus Shift -> 100.5s (972f) P4 + SOLVED badge
  // 103.7s (1068f): /boost Prompt Console -> 106.3s (1146f) App -> 107.4s (1179f) CLI -> 108.6s (1215f) IDE -> 110.6s (1275f) Paid
  const inP = easeOutExpo(frame / 14);
  const part1P = spring({ frame: Math.max(0, frame - 48), fps, config: CRISP_SPRING });
  const part2P = spring({ frame: Math.max(0, frame - 84), fps, config: CRISP_SPRING });

  const painIn = spring({ frame: Math.max(0, frame - 369), fps, config: CRISP_SPRING });
  const painPart2 = easeInOutCubic((frame - 441) / 12);
  const boostCtaP = spring({ frame: Math.max(0, frame - 525), fps, config: CRISP_SPRING });

  const flipIn = easeOutExpo((frame - 552) / 12);
  const flipP = easeInOutCubic((frame - 568) / 16);
  const toOrbital = easeOutExpo((frame - 624) / 16);
  const orbTitle2 = easeInOutCubic((frame - 690) / 12);
  const solvedBadge = spring({ frame: Math.max(0, frame - 995), fps, config: CRISP_SPRING });
  const toPrompt = easeOutExpo((frame - 1065) / 16);

  const hardFocus = steppedGlide(frame, [
    { at: 0, dur: 1, target: 0 },
    { at: 213, dur: 14, target: 1 },
    { at: 285, dur: 14, target: 2 },
  ]);

  const phaseFocus = steppedGlide(frame, [
    { at: 624, dur: 1, target: 0 },
    { at: 813, dur: 14, target: 1 },
    { at: 906, dur: 14, target: 2 },
    { at: 972, dur: 14, target: 3 },
  ]);

  const orbAngle = -Math.PI / 2 + (phaseFocus / 4) * Math.PI * 2 + ((frame - 624) * 0.018);
  const orbX = 460 + Math.cos(orbAngle) * 256;
  const orbY = 370 + Math.sin(orbAngle) * 256;

  const hardCases = [
    { num: '01', title: '偶发竞态条件', sub: '死活复现不稳定', start: 120 },
    { num: '02', title: '高耦合架构重构', sub: '牵一发而动全身', start: 213 },
    { num: '03', title: '算法性能瓶颈', sub: '怎么调都卡死', start: 285 },
  ];

  const orbitNodes = [
    { num: '01', title: '先实现一版', sub: '生成候选方案', x: 340, y: 46, start: 760 },
    { num: '02', title: '挑战找茬', sub: '独立对抗审查', x: 640, y: 315, start: 813 },
    { num: '03', title: '揪出漏洞修复', sub: '根因精准修补', x: 340, y: 585, start: 906 },
    { num: '04', title: '重新验证打磨', sub: '直至彻底解决', x: 40, y: 315, start: 972 },
  ];

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', opacity: inP }}>
      {/* PHASE A: Progressive Headline + 3 Hard Cases */}
      {flipIn < 0.98 && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 38, opacity: 1 - flipIn }}>
          <div>
            <div style={{ fontSize: 30, fontWeight: 800, color: '#B4BFD4', marginBottom: 12 }}>第二种卡点 · 刚好反过来</div>
            <div style={{ fontSize: 78, fontWeight: 900, display: 'flex', alignItems: 'baseline', flexWrap: 'wrap' }}>
              {/* First clause: bright white on "任务拆不开" */}
              <span
                style={{
                  color: '#FFFFFF',
                  opacity: part1P,
                  transform: `translate3d(0, ${((1 - part1P) * 22).toFixed(1)}px, 0)`,
                  display: 'inline-block',
                }}
              >
                任务拆不开，
              </span>
              {/* Second clause: dimmed first, then pops AMBER GOLD on "且非常有难度" while first stays crisp white! */}
              <span
                style={{
                  color: mixRgb([128, 138, 158], [245, 166, 35], part2P),
                  opacity: 0.28 + part2P * 0.72,
                  textShadow: part2P > 0.2 ? `0 0 ${(38 * part2P).toFixed(0)}px rgba(245,166,35,0.48)` : 'none',
                  transform: `translate3d(0, ${((1 - part2P) * 14).toFixed(1)}px, 0) scale(${(0.96 + part2P * 0.04).toFixed(4)})`,
                  display: 'inline-block',
                }}
              >
                且非常有难度
              </span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 28, perspective: 1400 }}>
            {hardCases.map((c, i) => {
              const p = spring({ frame: Math.max(0, frame - c.start), fps, config: CRISP_SPRING });
              const w = smoothFocusWeight(i, hardFocus, 0.65);
              return (
                <div
                  key={c.num}
                  style={{
                    ...crystal(0.32 + w * 0.62, 24),
                    padding: '38px 34px',
                    opacity: p,
                    transform: `translate3d(0, ${((1 - p) * 32 - w * 12).toFixed(1)}px, 0) rotateY(${(i - 1) * -6}deg)`,
                  }}
                >
                  <div style={{ fontFamily: FONTS.mono, fontSize: 24, fontWeight: 900, color: mixRgb([180, 191, 212], [245, 166, 35], w) }}>
                    HARD CASE {c.num}
                  </div>
                  <div style={{ fontSize: 38, fontWeight: 900, color: COLORS.white, marginTop: 14 }}>{c.title}</div>
                  <div style={{ fontSize: 25, fontWeight: 700, color: '#B4BFD4', marginTop: 10 }}>{c.sub}</div>
                </div>
              );
            })}
          </div>

          {frame > 365 && (
            <div style={{ ...crystal(0.78, 20), padding: '22px 34px', borderColor: 'rgba(229,72,77,0.78)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', opacity: painIn, transform: `translate3d(0, ${((1 - painIn) * 18).toFixed(1)}px, 0)` }}>
              <div style={{ fontSize: 32, fontWeight: 900 }}>
                <span style={{ color: '#FFFFFF' }}>普通模式聊三轮就原地打转：</span>
                <span style={{ color: mixRgb([130, 140, 160], [252, 165, 165], painPart2), opacity: 0.35 + painPart2 * 0.65 }}>
                  改好一个，又引出新问题！
                </span>
              </div>
              <span style={{ fontFamily: FONTS.mono, fontSize: 28, fontWeight: 900, color: COLORS.amber, opacity: boostCtaP, transform: `scale(${0.86 + boostCtaP * 0.14})` }}>
                直接切 /boost →
              </span>
            </div>
          )}
        </div>
      )}

      {/* PHASE B: Agile 16f 3D Flip into /boost */}
      {flipIn > 0.02 && toOrbital < 0.98 && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', perspective: 1600, opacity: flipIn * (1 - toOrbital) }}>
          <div style={{ width: 940, height: 420, position: 'relative', transformStyle: 'preserve-3d', transform: `rotateY(${(flipP * 180).toFixed(2)}deg) scale(${(1 + Math.sin(flipP * Math.PI) * 0.08).toFixed(4)})` }}>
            <div style={{ ...crystal(0.7, 30), position: 'absolute', inset: 0, backfaceVisibility: 'hidden', borderColor: 'rgba(229,72,77,0.8)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
              <div style={{ fontSize: 32, fontWeight: 800, color: '#FCA5A5' }}>普通模式硬改</div>
              <div style={{ fontSize: 78, fontWeight: 900, color: '#E5484D' }}>原地打转 · 越改越乱</div>
            </div>
            <div style={{ ...crystal(1.0, 30), position: 'absolute', inset: 0, backfaceVisibility: 'hidden', transform: 'rotateY(180deg)', borderColor: '#F5A623', boxShadow: '0 0 80px rgba(245,166,35,0.45)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
              <div style={{ fontFamily: FONTS.mono, fontSize: 132, fontWeight: 900, color: COLORS.amber, lineHeight: 0.92 }}>/boost</div>
              <div style={{ fontSize: 40, fontWeight: 900, color: COLORS.white }}>多轮深度推理流水线 · 彻底解根因</div>
            </div>
          </div>
        </div>
      )}

      {/* PHASE C: Giant Luminous Orbital Reasoning Ring + 3x Retina Boost Doc with Mid-Scene Focus Shift */}
      {toOrbital > 0.02 && toPrompt < 0.98 && (
        <div style={{ position: 'absolute', inset: 0, display: 'grid', gridTemplateColumns: '1.15fr 0.9fr', gap: 36, alignItems: 'center', opacity: toOrbital * (1 - toPrompt) }}>
          <div style={{ position: 'relative', width: 920, height: 740, margin: '0 auto' }}>
            <svg width="920" height="740" viewBox="0 0 920 740" style={{ position: 'absolute', inset: 0 }}>
              <defs>
                <filter id="boostOrbGlow">
                  <feGaussianBlur stdDeviation="5" result="b" />
                  <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
              </defs>
              <circle cx="460" cy="370" r="306" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="2" strokeDasharray="8 10" />
              <circle cx="460" cy="370" r="256" fill="none" stroke="rgba(245,166,35,0.38)" strokeWidth="6" strokeDasharray="12 8" strokeDashoffset={-frame * 1.8} />
              <circle cx={orbX} cy={orbY} r="9" fill="#FFF3D6" filter="url(#boostOrbGlow)" />
            </svg>

            <div style={{ position: 'absolute', left: 305, top: 255, width: 310, height: 230, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
              <div style={{ fontFamily: FONTS.mono, fontSize: 96, fontWeight: 900, color: COLORS.amber, lineHeight: 0.95 }}>/boost</div>
              <div style={{ fontSize: 30, fontWeight: 900, color: COLORS.white, marginTop: 12 }}>多轮深度推理</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: '#B4BFD4', marginTop: 4 }}>拆不开的硬骨头专用</div>
              {solvedBadge > 0.05 && (
                <div style={{ marginTop: 10, padding: '5px 16px', borderRadius: 999, backgroundColor: 'rgba(46,204,113,0.2)', border: '2px solid #2ECC71', color: '#2ECC71', fontFamily: FONTS.mono, fontSize: 20, fontWeight: 900, opacity: solvedBadge, transform: `scale(${0.82 + solvedBadge * 0.18})` }}>
                  ROOT CAUSE SOLVED ✓
                </div>
              )}
            </div>

            {orbitNodes.map((n, idx) => {
              const p = spring({ frame: Math.max(0, frame - n.start), fps, config: CRISP_SPRING });
              const w = smoothFocusWeight(idx, phaseFocus, 0.62);
              return (
                <div
                  key={n.num}
                  style={{
                    ...crystal(0.32 + w * 0.68, 999),
                    position: 'absolute',
                    left: n.x,
                    top: n.y,
                    width: 244,
                    padding: '18px 22px',
                    borderRadius: 999,
                    boxShadow: `0 0 ${(44 * w).toFixed(0)}px rgba(245,166,35,${(0.45 * w).toFixed(2)}), 0 14px 32px rgba(0,0,0,0.4)`,
                    textAlign: 'center',
                    opacity: p,
                    transform: `scale(${((0.82 + p * 0.18) * (1 + w * 0.07)).toFixed(4)})`,
                  }}
                >
                  <div style={{ fontFamily: FONTS.mono, fontSize: 21, fontWeight: 900, color: mixRgb([200, 209, 224], [245, 166, 35], w) }}>PHASE {n.num}</div>
                  <div style={{ fontSize: 29, fontWeight: 900, color: COLORS.white, marginTop: 2 }}>{n.title}</div>
                  <div style={{ fontSize: 21, fontWeight: 700, color: mixRgb([180, 191, 212], [255, 224, 163], w), marginTop: 2 }}>{n.sub}</div>
                </div>
              );
            })}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
            <div style={{ fontSize: 36, fontWeight: 900, lineHeight: 1.3 }}>
              <span style={{ color: '#FFFFFF' }}>不靠多派人，</span>
              <span style={{ color: mixRgb([140, 152, 174], [245, 166, 35], orbTitle2), opacity: 0.32 + orbTitle2 * 0.68 }}>
                靠多轮对抗找茬解根因
              </span>
            </div>
            <DarkOfficialWindow
              src="assets_agy/dark_boost_doc.png"
              domain="antigravity.google/docs/boost"
              height={430}
              startFrame={638}
              focusAt={895}
              focusEnd={968}
            />
          </div>
        </div>
      )}

      {/* PHASE D: Copy-Ready /boost Prompt Console with Sequential App -> CLI -> IDE -> Paid Beats */}
      {toPrompt > 0.02 && (
        <div style={{ position: 'absolute', inset: 0, opacity: toPrompt }}>
          <SpotlightPromptView
            command="/boost"
            headline="说清三要素：报错现象 · 复现路径 · 底线约束"
            body="排查订单并发扣库存偶发超卖的问题，定位根因并给出修复方案，要求不破坏现有事务边界，并用并发测试验证通过。"
            tags={[
              { label: '① 报错现象', at: 1080 },
              { label: '② 底线约束', at: 1094 },
              { label: '③ 并发验证', at: 1108 },
            ]}
            platforms={[
              { name: 'App', at: 1146 },
              { name: 'CLI', at: 1179 },
              { name: 'IDE', at: 1215 },
            ]}
            plan={{ text: '需付费计划', free: false, at: 1275 }}
            typeStart={1076}
            dur={dur}
          />
        </div>
      )}
    </div>
  );
};

/* ============================================================================
 * SCENE 06 (01:53.5 – 02:54.7, 1836f): /teamwork
 * /swarm vs /teamwork -> 3D Diagonal Milestone Track + Critic/Auditor Diamond Gates -> Practice 3D Flip + Platforms
 * ==========================================================================*/
const Scene06TeamworkFull: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Relative to 113.5s:
  // 121.7s (246f): /swarm card, 126.4s (387f): /teamwork card ("正式立项" white -> 128.5s 450f "按里程碑推进" amber)
  // 130.3s (504f) 整库迁移, 131.7s (546f) 复杂仿真, 132.6s (573f) 跨天深度研究
  // 136.5s (690f): Phase B Milestone Track -> 140.0s (795f) M1 -> 145.4s (957f) M2
  // 149.0s (1065f) Critic Diamond Emphasis -> 151.5s (1140f) Auditor Diamond Emphasis -> 153.7s (1206f) M3 + Doc Focus Shift
  // 157.5s (1320f): Phase C Practice -> 163.2s (1491f) 16f Flip -> 163.6s(1503f) ① 大目标 -> 165.0s(1545f) ② 现状仓库 -> 166.0s(1575f) ③ 硬约束
  // 167.5s (1620f) 顺着访谈落实细节 -> 170.6s(1713f) App -> 171.3s(1734f) CLI -> 172.0s(1755f) IDE -> 173.0s(1785f) 付费
  const inP = easeOutExpo(frame / 14);
  const swarmCardP = spring({ frame: Math.max(0, frame - 246), fps, config: CRISP_SPRING });
  const twCardP = spring({ frame: Math.max(0, frame - 387), fps, config: CRISP_SPRING });
  const twSubAmber = easeInOutCubic((frame - 450) / 12);

  const toMilestones = easeOutExpo((frame - 684) / 16);
  const toPractice = easeOutExpo((frame - 1315) / 16);
  const outP = easeInOutCubic((frame - (dur - 16)) / 16);

  const mFocus = steppedGlide(frame, [
    { at: 690, dur: 1, target: 0 },
    { at: 957, dur: 14, target: 1 },
    { at: 1206, dur: 14, target: 2 },
  ]);

  // Clean non-overlapping 5-node ascending staircase across the full stage (ZERO overlaps, ZERO dangling lines!)
  // M1 (20..280) --gap 66--> Critic (346..482) --gap 66--> M2 (548..808) --gap 66--> Auditor (874..1010) --gap 66--> M3 (1076..1336)
  const seg1Prog = easeOutExpo((frame - 935) / 22);  // M1 -> Critic/M2
  const seg2Prog = easeOutExpo((frame - 1125) / 22); // M2 -> Auditor
  const seg3Prog = easeOutExpo((frame - 1192) / 22); // Auditor -> M3

  const milestones = [
    { num: 'M1', title: '需求访谈', sub: '问清边界目标', x: 20, y: 475, start: 785 },
    { num: 'M2', title: '多角色推进', sub: '团队按阶段协作', x: 548, y: 315, start: 957 },
    { num: 'M3', title: '整库交付', sub: '跨天绝不跑偏', x: 1076, y: 155, start: 1206 },
  ];
  const gates = [
    { name: 'Critic', role: '方案审查', x: 346, y: 395, start: 1065, end: 1138 },
    { name: 'Auditor', role: '门禁验收', x: 874, y: 235, start: 1140, end: 1204 },
  ];

  const practiceFlip = easeInOutCubic((frame - 1488) / 16);
  const interviewFollowP = spring({ frame: Math.max(0, frame - 1620), fps, config: CRISP_SPRING });

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', opacity: inP * (1 - outP) }}>
      {/* PHASE A: /swarm vs /teamwork Split + 3x Retina Doc */}
      {toMilestones < 0.98 && (
        <div style={{ position: 'absolute', inset: 0, display: 'grid', gridTemplateColumns: '1.05fr 0.95fr', gap: 40, alignItems: 'center', opacity: 1 - toMilestones }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div style={{ fontFamily: FONTS.mono, fontSize: 90, fontWeight: 900, color: COLORS.amber, lineHeight: 0.95 }}>/teamwork</div>
            <div style={{ fontSize: 34, fontWeight: 900, color: COLORS.white, opacity: easeOutExpo((frame - 125) / 14) }}>
              一句话分清 /swarm 与 /teamwork
            </div>

            <div
              style={{
                ...crystal(0.35 + (1 - twCardP) * 0.45, 22),
                padding: '26px 32px',
                opacity: swarmCardP * (1 - twCardP * 0.25),
                transform: `translate3d(0, ${((1 - swarmCardP) * 20).toFixed(1)}px, 0)`,
              }}
            >
              <div style={{ fontFamily: FONTS.mono, fontSize: 34, fontWeight: 900, color: '#2ECC71' }}>/swarm</div>
              <div style={{ fontSize: 30, fontWeight: 900, color: COLORS.white, marginTop: 8 }}>拉个群 · 快速把几件平行小事干完</div>
            </div>

            <div
              style={{
                ...crystal(0.92, 22),
                padding: '28px 32px',
                borderColor: '#F5A623',
                opacity: twCardP,
                transform: `translate3d(0, ${((1 - twCardP) * 24).toFixed(1)}px, 0)`,
              }}
            >
              <div style={{ fontFamily: FONTS.mono, fontSize: 34, fontWeight: 900, color: COLORS.amber }}>/teamwork</div>
              <div style={{ fontSize: 30, fontWeight: 900, marginTop: 8 }}>
                <span style={{ color: '#FFFFFF' }}>正式立项 · </span>
                <span style={{ color: mixRgb([150, 160, 180], [245, 166, 35], twSubAmber), opacity: 0.35 + twSubAmber * 0.65 }}>
                  按里程碑推进大型工程
                </span>
              </div>
              <div style={{ display: 'flex', gap: 12, marginTop: 16, flexWrap: 'wrap' }}>
                {[
                  { label: '整库迁移', start: 504 },
                  { label: '复杂仿真', start: 546 },
                  { label: '跨天深度研究', start: 573 },
                ].map((c) => {
                  const cp = spring({ frame: Math.max(0, frame - c.start), fps, config: CRISP_SPRING });
                  return (
                    <span key={c.label} style={{ padding: '7px 16px', borderRadius: 10, backgroundColor: 'rgba(245,166,35,0.18)', border: '1.5px solid rgba(245,166,35,0.65)', color: '#FFE0A3', fontSize: 22, fontWeight: 800, opacity: cp, transform: `scale(${0.86 + cp * 0.14})` }}>
                      ✦ {c.label}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
          <DarkOfficialWindow
            src="assets_agy/dark_teamwork_doc.png"
            domain="antigravity.google/docs/teamwork"
            height={450}
            startFrame={20}
            focusAt={500}
            focusEnd={660}
          />
        </div>
      )}

      {/* PHASE B: 3D Diagonal Milestone Track + Dedicated Critic & Auditor Diamond Gate Emphasis */}
      {toMilestones > 0.02 && toPractice < 0.98 && (
        <div style={{ position: 'absolute', inset: 0, opacity: toMilestones * (1 - toPractice) }}>
          <div style={{ position: 'absolute', top: 0, left: 0 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12, padding: '5px 14px', borderRadius: 999, backgroundColor: 'rgba(245,166,35,0.12)', border: '1px solid rgba(245,166,35,0.35)', fontFamily: FONTS.mono, fontSize: 16, fontWeight: 800, color: COLORS.amberBright, letterSpacing: 1.5, marginBottom: 10 }}>
              PHASE 03 · MILESTONE ARCHITECTURE
            </div>
            <div style={{ fontFamily: FONTS.mono, fontSize: 90, fontWeight: 900, color: COLORS.amber, lineHeight: 0.95, textShadow: '0 10px 28px rgba(0,0,0,0.75)' }}>/teamwork</div>
            <div style={{ fontSize: 36, fontWeight: 900, color: '#E8EEF8', marginTop: 10, textShadow: '0 6px 18px rgba(0,0,0,0.7)' }}>先需求访谈 · 再按里程碑门禁推进</div>
            <div style={{ width: 92, height: 4, borderRadius: 999, background: 'linear-gradient(90deg, #F5A623, transparent)', marginTop: 14 }} />
          </div>

          <svg width="1400" height="720" viewBox="0 0 1400 720" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
            <defs>
              <filter id="twOrb"><feGaussianBlur stdDeviation="4" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
            </defs>
            {/* Segmented clean connectors: strictly edge-to-edge, ZERO dangling dots! */}
            <path
              d="M 284 548 C 318 548, 318 470, 352 470"
              fill="none"
              stroke="#F5A623"
              strokeWidth="4.5"
              strokeLinecap="round"
              pathLength={100}
              strokeDasharray={100}
              strokeDashoffset={(1 - seg1Prog) * 100}
              opacity={seg1Prog > 0.02 ? 1 : 0}
            />
            <path
              d="M 476 456 C 512 456, 512 390, 548 390"
              fill="none"
              stroke="#F5A623"
              strokeWidth="4.5"
              strokeLinecap="round"
              pathLength={100}
              strokeDasharray={100}
              strokeDashoffset={(1 - seg1Prog) * 100}
              opacity={seg1Prog > 0.02 ? 1 : 0}
            />
            <path
              d="M 812 388 C 846 388, 846 310, 880 310"
              fill="none"
              stroke="#F5A623"
              strokeWidth="4.5"
              strokeLinecap="round"
              pathLength={100}
              strokeDasharray={100}
              strokeDashoffset={(1 - seg2Prog) * 100}
              opacity={seg2Prog > 0.02 ? 1 : 0}
            />
            <path
              d="M 1004 296 C 1040 296, 1040 230, 1076 230"
              fill="none"
              stroke="#F5A623"
              strokeWidth="4.5"
              strokeLinecap="round"
              pathLength={100}
              strokeDasharray={100}
              strokeDashoffset={(1 - seg3Prog) * 100}
              opacity={seg3Prog > 0.02 ? 1 : 0}
            />
          </svg>

          {milestones.map((m, idx) => {
            const p = spring({ frame: Math.max(0, frame - m.start), fps, config: CRISP_SPRING });
            const w = smoothFocusWeight(idx, mFocus, 0.65);
            return (
              <div
                key={m.num}
                style={{
                  ...crystal(0.36 + w * 0.62, 22),
                  position: 'absolute',
                  left: m.x,
                  top: m.y,
                  width: 262,
                  padding: '22px 24px',
                  opacity: p,
                  transform: `perspective(1200px) rotateX(6deg) rotateY(-5deg) translate3d(0, ${((1 - p) * 24 - w * 8).toFixed(1)}px, 0) scale(${(1 + w * 0.04).toFixed(4)})`,
                }}
              >
                <div style={{ fontFamily: FONTS.mono, fontSize: 21, fontWeight: 900, color: mixRgb([200, 209, 224], [245, 166, 35], w) }}>MILESTONE {m.num}</div>
                <div style={{ fontSize: 33, fontWeight: 900, color: COLORS.white, marginTop: 6 }}>{m.title}</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: '#C8D1E0', marginTop: 4 }}>{m.sub}</div>
              </div>
            );
          })}

          {gates.map((g) => {
            const p = spring({ frame: Math.max(0, frame - g.start), fps, config: CRISP_SPRING });
            const active = beatHighlight(frame, g.start, g.end);
            return (
              <div
                key={g.name}
                style={{
                  position: 'absolute',
                  left: g.x,
                  top: g.y,
                  width: 136,
                  height: 136,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: p,
                  transform: `perspective(1000px) rotateX(8deg) scale(${((0.72 + p * 0.28) * (1 + active * 0.12)).toFixed(4)})`,
                }}
              >
                {/* 3D Extruded Bottom Bevel Layer (real physical thickness!) */}
                <div
                  style={{
                    position: 'absolute',
                    inset: 14,
                    transform: 'translateY(8px) rotate(45deg)',
                    borderRadius: 16,
                    backgroundColor: '#0A0D16',
                    border: '2px solid rgba(245,166,35,0.45)',
                    boxShadow: '0 22px 38px rgba(0,0,0,0.82)',
                  }}
                />
                {/* Top Lit 3D Jewel Face */}
                <div
                  style={{
                    position: 'absolute',
                    inset: 14,
                    transform: 'rotate(45deg)',
                    borderRadius: 16,
                    background: `linear-gradient(145deg, rgba(245,166,35,${(0.28 + active * 0.24).toFixed(2)}) 0%, rgba(22,28,42,0.96) 62%, rgba(12,16,26,0.98) 100%)`,
                    border: '2.5px solid #F5A623',
                    boxShadow: `inset 0 2px 0 rgba(255,255,255,0.42), 0 0 ${(28 + active * 42).toFixed(0)}px rgba(245,166,35,${(0.36 + active * 0.44).toFixed(2)})`,
                  }}
                />
                <div style={{ position: 'relative', textAlign: 'center', zIndex: 5 }}>
                  <div style={{ fontFamily: FONTS.mono, fontSize: 23, fontWeight: 900, color: COLORS.amberBright, textShadow: '0 2px 8px rgba(0,0,0,0.8)' }}>{g.name}</div>
                  <div style={{ fontSize: 19, fontWeight: 800, color: COLORS.white, marginTop: 2 }}>{g.role}</div>
                </div>
              </div>
            );
          })}

          <div style={{ position: 'absolute', right: 0, bottom: 10, width: 590 }}>
            <DarkOfficialWindow
              src="assets_agy/dark_teamwork_doc.png"
              domain="antigravity.google/docs/teamwork"
              height={340}
              startFrame={720}
              focusAt={1200}
              focusEnd={1295}
            />
          </div>
        </div>
      )}

      {/* PHASE C: Best Practice 3D Flip + Sequential 3 Inputs + Sequential Platforms */}
      {toPractice > 0.02 && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 28, padding: '0 46px', opacity: toPractice }}>
          <div style={{ fontSize: 42, fontWeight: 900, color: COLORS.white }}>
            <span style={{ color: COLORS.amber, fontFamily: FONTS.mono }}>/teamwork</span> 实战心法
          </div>

          <div style={{ perspective: 1600, height: 350 }}>
            <div style={{ width: '100%', height: '100%', position: 'relative', transformStyle: 'preserve-3d', transform: `rotateX(${(practiceFlip * 180).toFixed(2)}deg)` }}>
              {/* Front */}
              <div style={{ ...crystal(0.7, 26), position: 'absolute', inset: 0, backfaceVisibility: 'hidden', borderColor: 'rgba(229,72,77,0.8)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: '#FCA5A5' }}>✕ 常见误区</div>
                <div style={{ fontSize: 56, fontWeight: 900, color: COLORS.white }}>不要第一炮就把所有文档全写完！</div>
              </div>
              {/* Back: 3 Core Inputs pop & highlight in exact speech order! */}
              <div style={{ ...crystal(0.95, 26), position: 'absolute', inset: 0, backfaceVisibility: 'hidden', transform: 'rotateX(180deg)', borderColor: '#F5A623', padding: '28px 38px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 28, fontWeight: 900, color: '#2ECC71' }}>✓ 正确姿势：先丢三件事给它</span>
                  <span style={{ padding: '6px 18px', borderRadius: 10, backgroundColor: 'rgba(46,204,113,0.18)', border: '1.5px solid #2ECC71', color: '#2ECC71', fontSize: 22, fontWeight: 900, opacity: interviewFollowP, transform: `scale(${0.86 + interviewFollowP * 0.14})` }}>
                    → 再顺着需求访谈落实细节 ✓
                  </span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 22 }}>
                  {[
                    { num: '①', t: '大目标', s: '最终要交付什么', at: 1503, end: 1545 },
                    { num: '②', t: '现状仓库', s: '代码位置与背景', at: 1545, end: 1575 },
                    { num: '③', t: '硬约束', s: '不可触碰的底线', at: 1575, end: 1620 },
                  ].map((it) => {
                    const ip = spring({ frame: Math.max(0, frame - it.at), fps, config: CRISP_SPRING });
                    const active = beatHighlight(frame, it.at, it.end);
                    return (
                      <div
                        key={it.t}
                        style={{
                          padding: '22px 24px',
                          borderRadius: 16,
                          backgroundColor: `rgba(245,166,35,${(0.06 + active * 0.18).toFixed(2)})`,
                          border: `2px solid ${mixRgb([200, 210, 225], [245, 166, 35], 0.25 + active * 0.75)}`,
                          boxShadow: `0 0 ${(28 * active).toFixed(0)}px rgba(245,166,35,${(0.4 * active).toFixed(2)})`,
                          opacity: ip,
                          transform: `translate3d(0, ${((1 - ip) * 18).toFixed(1)}px, 0) scale(${(1 + active * 0.05).toFixed(4)})`,
                        }}
                      >
                        <div style={{ fontSize: 34, fontWeight: 900, color: COLORS.amber }}>{it.num} {it.t}</div>
                        <div style={{ fontSize: 23, fontWeight: 700, color: '#E2E8F4', marginTop: 6 }}>{it.s}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <SequentialPlatformBar
            platforms={[
              { name: 'App', at: 1713 },
              { name: 'CLI', at: 1734 },
              { name: 'IDE', at: 1755 },
            ]}
            plan={{ text: '需付费计划', free: false, at: 1785 }}
          />
        </div>
      )}
    </div>
  );
};

/* ============================================================================
 * SCENE 07 (02:54.5 – 03:40.0, 1365f): /run-workflow
 * Python Myth Flip -> 3 Capability Pills + 20 Files + Perspective Terminal Shift + Sequential Tags -> Prompt
 * ==========================================================================*/
const Scene07WorkflowFull: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Relative to 174.5s:
  // 179.9s (162f): front card + doc focus, 182.5s (240f): quote highlight, 185.6s (333f): 16f flip
  // 191.2s (500f): Phase B -> 191.5s(510f) 高度定制, 193.0s(555f) 固定规矩, 194.7s(606f) 批量流水
  // 199.4s (747f): 20 files drop & counter rolls, 202.9s (852f): terminal focus shift & parallel reviewer lines
  // 205.9s (942f): Aggregated Report pops -> 208.2s(1011f) 循环, 209.2s(1041f) 阶段, 210.2s(1071f) 聚合
  // 214.5s (1200f): Phase C Prompt -> 216.2s(1251f) App -> 217.2s(1281f) CLI -> 218.7s(1326f) 免费
  const inP = easeOutExpo(frame / 14);
  const pyQuoteHot = easeInOutCubic((frame - 240) / 12);
  const pyFlip = easeInOutCubic((frame - 330) / 16);
  const toTerminal = easeOutExpo((frame - 495) / 16);
  const toPrompt = easeOutExpo((frame - 1195) / 16);
  const outP = easeInOutCubic((frame - (dur - 16)) / 16);

  const fileNum = Math.round(interpolate(frame, [747, 815], [1, 20], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }));
  const termFocus = beatHighlight(frame, 848, 938);
  const reportPop = spring({ frame: Math.max(0, frame - 942), fps, config: CRISP_SPRING });

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', opacity: inP * (1 - outP) }}>
      {/* PHASE A: 3D Flip Python Myth Buster + 3x Retina Workflow Doc */}
      {toTerminal < 0.98 && (
        <div style={{ position: 'absolute', inset: 0, display: 'grid', gridTemplateColumns: '1.05fr 0.95fr', gap: 40, alignItems: 'center', opacity: 1 - toTerminal }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 26 }}>
            <div style={{ fontFamily: FONTS.mono, fontSize: 82, fontWeight: 900, color: COLORS.amber, lineHeight: 0.95 }}>/run-workflow</div>
            <div style={{ fontSize: 34, fontWeight: 900, color: COLORS.white }}>最容易被忽略的宝藏命令</div>

            <div style={{ perspective: 1400, height: 320 }}>
              <div style={{ width: '100%', height: '100%', position: 'relative', transformStyle: 'preserve-3d', transform: `rotateY(${(pyFlip * 180).toFixed(2)}deg)` }}>
                <div style={{ ...crystal(0.65, 24), position: 'absolute', inset: 0, backfaceVisibility: 'hidden', borderColor: 'rgba(229,72,77,0.75)', padding: '34px 36px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <PythonLogo size={46} />
                    <span style={{ fontSize: 30, fontWeight: 900, color: '#FCA5A5' }}>官方：现场写 Python 编排脚本</span>
                  </div>
                  <div style={{ fontSize: 40, fontWeight: 900, color: mixRgb([210, 218, 232], [255, 224, 163], pyQuoteHot), transform: `scale(${(1 + pyQuoteHot * 0.03).toFixed(4)})`, transformOrigin: 'left center' }}>
                    “诶？我也不会写 Python 代码啊！”
                  </div>
                </div>

                <div style={{ ...crystal(0.95, 24), position: 'absolute', inset: 0, backfaceVisibility: 'hidden', transform: 'rotateY(180deg)', borderColor: '#2ECC71', boxShadow: '0 0 46px rgba(46,204,113,0.28)', padding: '34px 36px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <PythonLogo size={46} />
                    <span style={{ fontSize: 30, fontWeight: 900, color: '#2ECC71' }}>千万别被吓倒 ✓</span>
                  </div>
                  <div style={{ fontSize: 38, fontWeight: 900, color: COLORS.white, lineHeight: 1.35 }}>
                    代码由 <span style={{ color: COLORS.amber }}>Agent 现场替你写</span>，不用自己手写一行！
                  </div>
                </div>
              </div>
            </div>
          </div>
          <DarkOfficialWindow
            src="assets_agy/dark_workflow_doc.png"
            domain="antigravity.google/docs/dynamic-workflows"
            height={450}
            startFrame={16}
            focusAt={162}
            focusEnd={310}
          />
        </div>
      )}

      {/* PHASE B: 3 Capability Pills + 3D Stacked 20 Files + Perspective-Shifting Python Terminal + Report */}
      {toTerminal > 0.02 && toPrompt < 0.98 && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', opacity: toTerminal * (1 - toPrompt) }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 22 }}>
              <span style={{ fontFamily: FONTS.mono, fontSize: 80, fontWeight: 900, color: COLORS.amber }}>/run-workflow</span>
              <span style={{ fontSize: 34, fontWeight: 900, color: COLORS.white }}>批量定制流水线</span>
            </div>
            {/* 3 Sequential Capability Pills synced to 191.5s / 193.0s / 194.7s */}
            <div style={{ display: 'flex', gap: 12 }}>
              {[
                { label: '① 高度定制', at: 510, end: 555 },
                { label: '② 固定规矩', at: 555, end: 606 },
                { label: '③ 批量流水', at: 606, end: 720 },
              ].map((pill) => {
                const pp = spring({ frame: Math.max(0, frame - pill.at), fps, config: CRISP_SPRING });
                const active = beatHighlight(frame, pill.at, pill.end);
                return (
                  <span
                    key={pill.label}
                    style={{
                      padding: '10px 20px',
                      borderRadius: 12,
                      backgroundColor: `rgba(245,166,35,${(0.1 + active * 0.22).toFixed(2)})`,
                      border: `2px solid ${mixRgb([200, 210, 225], [245, 166, 35], 0.3 + active * 0.7)}`,
                      color: active > 0.2 ? '#FFE0A3' : '#FFFFFF',
                      fontSize: 23,
                      fontWeight: 900,
                      opacity: pp,
                      transform: `scale(${(0.86 + pp * 0.14 + active * 0.06).toFixed(4)})`,
                    }}
                  >
                    {pill.label}
                  </span>
                );
              })}
            </div>
          </div>

          <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '0.72fr 1.45fr 0.78fr', gap: 28, alignItems: 'center' }}>
            {/* 3D Stacked File Deck (drops when "一次改了20个文件" hits at 747f) */}
            <div style={{ position: 'relative', height: 390, display: 'flex', alignItems: 'center', justifyContent: 'center', perspective: 1200 }}>
              {[2, 1, 0].map((layer) => {
                const p = spring({ frame: Math.max(0, frame - 740 - (2 - layer) * 5), fps, config: CRISP_SPRING });
                return (
                  <div
                    key={layer}
                    style={{
                      ...crystal(layer === 0 ? 0.85 : 0.28, 22),
                      position: 'absolute',
                      width: 310,
                      height: 350,
                      opacity: p,
                      transform: `translate3d(${layer * 18 - 18}px, ${(layer * -16 + 16 - (1 - p) * 60).toFixed(1)}px, 0) rotateY(12deg) rotateZ(${layer * 3 - 3}deg)`,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {layer === 0 && (
                      <>
                        <div style={{ fontFamily: FONTS.display, fontSize: 136, fontWeight: 900, color: COLORS.amber, lineHeight: 0.9 }}>{fileNum}</div>
                        <div style={{ fontSize: 32, fontWeight: 900, color: COLORS.white, marginTop: 10 }}>个改动文件</div>
                        <div style={{ fontFamily: FONTS.mono, fontSize: 22, color: '#B4BFD4', marginTop: 6 }}>git diff --name-only</div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>

            {/* 3D macOS Dark Code Terminal Window with Perspective Focus Shift on Reviewer Dispatch */}
            <div style={{ perspective: 1400 }}>
              <div
                style={{
                  borderRadius: 22,
                  overflow: 'hidden',
                  backgroundColor: 'rgba(15, 18, 28, 0.92)',
                  border: `2px solid ${mixRgb([245, 166, 35], [255, 224, 163], termFocus)}`,
                  boxShadow: `0 30px 70px rgba(0,0,0,0.6), 0 0 ${(36 + termFocus * 38).toFixed(0)}px rgba(245,166,35,${(0.16 + termFocus * 0.24).toFixed(2)})`,
                  transform: `rotateX(${(4 - termFocus * 4).toFixed(2)}deg) scale(${(1 + termFocus * 0.045).toFixed(4)})`,
                }}
              >
                <div style={{ height: 46, padding: '0 20px', backgroundColor: 'rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', gap: 9 }}>
                    <span style={{ width: 13, height: 13, borderRadius: '50%', backgroundColor: '#FF5F56' }} />
                    <span style={{ width: 13, height: 13, borderRadius: '50%', backgroundColor: '#FFBD2E' }} />
                    <span style={{ width: 13, height: 13, borderRadius: '50%', backgroundColor: '#27C93F' }} />
                  </div>
                  <span style={{ fontFamily: FONTS.mono, fontSize: 20, fontWeight: 800, color: '#C8D1E0' }}>workflow_audit.py · AUTO-GENERATED</span>
                  <PythonLogo size={22} />
                </div>
                <div style={{ padding: '28px 34px', fontFamily: FONTS.mono, fontSize: 28, lineHeight: 1.68, color: '#E2E8F4' }}>
                  <div style={{ opacity: easeOutExpo((frame - 750) / 14) }}><span style={{ color: '#94A3B8' }}>01  </span><span style={{ color: '#F5A623', fontWeight: 900 }}>files</span> = git_changed_files()</div>
                  <div style={{ opacity: easeOutExpo((frame - 800) / 14) }}><span style={{ color: '#94A3B8' }}>02  </span><span style={{ color: '#F5A623', fontWeight: 900 }}>reviews</span> = parallel([</div>
                  <div style={{ opacity: easeOutExpo((frame - 852) / 14), backgroundColor: termFocus > 0.2 ? 'rgba(245,166,35,0.14)' : 'transparent', borderRadius: 8, padding: '0 6px', margin: '0 -6px' }}>
                    <span style={{ color: '#94A3B8' }}>03  </span>    agent(<span style={{ color: '#2ECC71', fontWeight: 900 }}>"独立 Reviewer 安全审查"</span>, f)
                  </div>
                  <div style={{ opacity: easeOutExpo((frame - 878) / 14) }}><span style={{ color: '#94A3B8' }}>04  </span>    <span style={{ color: '#F5A623' }}>for</span> f <span style={{ color: '#F5A623' }}>in</span> files</div>
                  <div style={{ opacity: easeOutExpo((frame - 900) / 14) }}><span style={{ color: '#94A3B8' }}>05  </span>])</div>
                  <div style={{ opacity: easeOutExpo((frame - 942) / 14) }}><span style={{ color: '#94A3B8' }}>06  </span><span style={{ color: '#2ECC71', fontWeight: 900 }}>export_grouped_report</span>(reviews)</div>
                </div>
              </div>
            </div>

            {/* Right Aggregated Report Card + Sequential 循环 / 阶段 / 聚合 Tag Pops */}
            <div style={{ position: 'relative', height: 390, display: 'flex', alignItems: 'center', justifyContent: 'center', perspective: 1200 }}>
              <div style={{ ...crystal(0.9, 22), width: 340, height: 360, padding: '32px 28px', borderColor: '#2ECC71', boxShadow: '0 0 46px rgba(46,204,113,0.28)', transform: `rotateY(-12deg) scale(${0.86 + reportPop * 0.14})`, opacity: reportPop, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div style={{ fontFamily: FONTS.mono, fontSize: 22, fontWeight: 900, color: '#2ECC71' }}>AGGREGATED REPORT</div>
                <div>
                  <div style={{ fontSize: 38, fontWeight: 900, color: COLORS.white, lineHeight: 1.2 }}>按文件分组<br />安全问题清单</div>
                  <div style={{ fontSize: 23, fontWeight: 700, color: '#C8D1E0', marginTop: 12 }}>20 / 20 审查聚合完成 ✓</div>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  {[
                    { tag: '循环', at: 1011, end: 1041 },
                    { tag: '阶段', at: 1041, end: 1071 },
                    { tag: '聚合', at: 1071, end: 1120 },
                  ].map((item, i) => {
                    const tp = spring({ frame: Math.max(0, frame - item.at), fps, config: CRISP_SPRING });
                    const act = beatHighlight(frame, item.at, item.end);
                    return (
                      <span
                        key={item.tag}
                        style={{
                          padding: '6px 14px',
                          borderRadius: 8,
                          backgroundColor: i === 2 ? `rgba(46,204,113,${(0.2 + act * 0.25).toFixed(2)})` : `rgba(245,166,35,${(0.2 + act * 0.25).toFixed(2)})`,
                          border: `1.5px solid ${i === 2 ? '#2ECC71' : COLORS.amber}`,
                          color: i === 2 ? '#2ECC71' : COLORS.amber,
                          fontSize: 20,
                          fontWeight: 900,
                          opacity: tp,
                          transform: `scale(${(0.86 + tp * 0.14 + act * 0.12).toFixed(4)})`,
                        }}
                      >
                        {item.tag}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PHASE C: Copy-Ready /run-workflow Prompt Console */}
      {toPrompt > 0.02 && (
        <div style={{ position: 'absolute', inset: 0, opacity: toPrompt }}>
          <SpotlightPromptView
            command="/run-workflow"
            headline="带循环 · 带阶段 · 带聚合逻辑直接这样说"
            body="扫描当前分支所有改动的文件，并行给每个文件配一个代码审查子 Agent 查空指针和越界风险，最后汇总输出一份按文件分组的问题清单。"
            tags={[
              { label: '循环遍历', at: 1205 },
              { label: '并行审查', at: 1217 },
              { label: '分组汇总', at: 1229 },
            ]}
            platforms={[
              { name: 'App', at: 1251 },
              { name: 'CLI', at: 1281 },
            ]}
            plan={{ text: '免费计划可用', free: true, at: 1326 }}
            typeStart={1200}
            dur={dur}
          />
        </div>
      )}
    </div>
  );
};

/* ============================================================================
 * SCENE 08 (03:39.9 – 04:36.2, 1689f): /goal
 * Sequential Codex/Claude -> Pain -> 16f Flip + Progressive Clause -> Verifiable Console + Focusing Gauge + Platforms
 * ==========================================================================*/
const Scene08GoalFull: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Relative to 219.9s:
  // 224.2s (129f) Codex -> 225.4s (165f) Claude -> 227.7s (234f) 目标模式
  // 228.8s (267f) Pain box -> 233.0s (393f) Left quote -> 237.4s (525f) Right frustration
  // 241.7s (654f) 16f Flip -> 245.1s (756f) "目标不完成"(white) -> 246.0s (783f) "不许停下来"(amber)
  // 248.4s (855f) Phase C -> 249.7s (894f) "必须机器可自动验证"(amber)
  // 252.0s (963f) Red bad example -> 254.9s (1050f) Red tag pop
  // 258.0s (1143f) Verifiable Console -> 261.0s (1233f) npm test PASS -> 264.7s (1344f) npm run build 0 ERRORS
  // 265.8s (1377f) Gauge Focus Scale-Up + 100% Emerald -> 273.1s(1596f) App -> 273.9s(1620f) CLI -> 274.7s(1644f) IDE
  const inP = easeOutExpo(frame / 14);
  const codexP = spring({ frame: Math.max(0, frame - 129), fps, config: CRISP_SPRING });
  const codexAct = beatHighlight(frame, 129, 165);
  const claudeP = spring({ frame: Math.max(0, frame - 165), fps, config: CRISP_SPRING });
  const claudeAct = beatHighlight(frame, 165, 234);
  const goalModeP = spring({ frame: Math.max(0, frame - 234), fps, config: CRISP_SPRING });

  const flipIn = easeOutExpo((frame - 638) / 12);
  const flipP = easeInOutCubic((frame - 654) / 16);
  const flipClause2 = easeInOutCubic((frame - 783) / 12);

  const toGauge = easeOutExpo((frame - 855) / 16);
  const verifyHeader2 = easeInOutCubic((frame - 894) / 12);
  const outP = easeInOutCubic((frame - (dur - 16)) / 16);

  const badIn = spring({ frame: Math.max(0, frame - 963), fps, config: CRISP_SPRING });
  const badTagIn = spring({ frame: Math.max(0, frame - 1050), fps, config: CRISP_SPRING });
  const goodIn = spring({ frame: Math.max(0, frame - 1143), fps, config: CRISP_SPRING });
  const testBadge = spring({ frame: Math.max(0, frame - 1233), fps, config: CRISP_SPRING });
  const buildBadge = spring({ frame: Math.max(0, frame - 1344), fps, config: CRISP_SPRING });
  const gaugeFocus = beatHighlight(frame, 1377, 1585);

  const gaugePct = interpolate(frame, [880, 1480], [18, 100], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const circ = 2 * Math.PI * 192;

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', opacity: inP * (1 - outP) }}>
      {/* PHASE A: Sequential Codex / Claude / 目标模式 + Pain */}
      {flipIn < 0.98 && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 32, padding: '0 36px', opacity: 1 - flipIn }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <span style={{ fontFamily: FONTS.mono, fontSize: 90, fontWeight: 900, color: COLORS.amber, lineHeight: 0.95 }}>/goal</span>
            <span style={{ fontSize: 40, fontWeight: 900, color: COLORS.white }}>梦寐以求的下班神器</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            <span style={{ ...crystal(0.45 + codexAct * 0.45, 14), padding: '12px 24px', borderColor: mixRgb([200, 210, 225], [245, 166, 35], 0.25 + codexAct * 0.75), display: 'inline-flex', alignItems: 'center', gap: 12, fontSize: 26, fontWeight: 900, opacity: codexP, transform: `scale(${(1 + codexAct * 0.06).toFixed(4)})` }}>
              <OpenAICodexLogo size={32} /> Codex
            </span>
            <span style={{ ...crystal(0.45 + claudeAct * 0.45, 14), padding: '12px 24px', borderColor: mixRgb([200, 210, 225], [245, 166, 35], 0.25 + claudeAct * 0.75), display: 'inline-flex', alignItems: 'center', gap: 12, fontSize: 26, fontWeight: 900, opacity: claudeP, transform: `scale(${(1 + claudeAct * 0.06).toFixed(4)})` }}>
              <ClaudeLogo size={32} /> Claude
            </span>
            <span style={{ backgroundColor: COLORS.amber, color: '#0E1119', padding: '12px 26px', borderRadius: 14, fontSize: 26, fontWeight: 900, opacity: goalModeP, transform: `scale(${0.86 + goalModeP * 0.14})` }}>
              = 目标模式
            </span>
          </div>

          <div style={{ ...crystal(0.8, 24), padding: '32px 38px', borderColor: 'rgba(229,72,77,0.75)', opacity: spring({ frame: Math.max(0, frame - 267), fps, config: CRISP_SPRING }) }}>
            <div style={{ fontSize: 36, fontWeight: 900, color: '#FCA5A5', marginBottom: 20 }}>平时让 AI 干长任务最烦的：干两步就停下来反问！</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
              <div style={{ padding: '22px 26px', borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.06)', fontSize: 26, fontWeight: 800, color: '#E2E8F4', lineHeight: 1.45, opacity: spring({ frame: Math.max(0, frame - 393), fps, config: CRISP_SPRING }) }}>
                “我已经帮你做了什么，下一步我会怎么做……”（停下来等你回复）
              </div>
              <div style={{ padding: '22px 26px', borderRadius: 16, backgroundColor: 'rgba(229,72,77,0.18)', border: '2px solid rgba(229,72,77,0.65)', fontSize: 26, fontWeight: 900, color: COLORS.white, lineHeight: 1.45, opacity: spring({ frame: Math.max(0, frame - 525), fps, config: CRISP_SPRING }) }}>
                明明都知道下一步要干啥了还问我？直接把人套牢！
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PHASE B: Crisp 16f 3D Flip + Progressive "目标不完成(白) · 就不许停下来(金黄)" */}
      {flipIn > 0.02 && toGauge < 0.98 && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', perspective: 1600, opacity: flipIn * (1 - toGauge) }}>
          <div style={{ width: 960, height: 430, position: 'relative', transformStyle: 'preserve-3d', transform: `rotateY(${(flipP * 180).toFixed(2)}deg)` }}>
            <div style={{ ...crystal(0.7, 30), position: 'absolute', inset: 0, backfaceVisibility: 'hidden', borderColor: 'rgba(229,72,77,0.8)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
              <div style={{ fontSize: 72, fontWeight: 900, color: '#E5484D' }}>干两步就停下来等你</div>
            </div>
            <div style={{ ...crystal(1.0, 30), position: 'absolute', inset: 0, backfaceVisibility: 'hidden', transform: 'rotateY(180deg)', borderColor: '#F5A623', boxShadow: '0 0 80px rgba(245,166,35,0.45)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 18 }}>
              <div style={{ fontFamily: FONTS.mono, fontSize: 132, fontWeight: 900, color: COLORS.amber, lineHeight: 0.92 }}>/goal</div>
              <div style={{ fontSize: 44, fontWeight: 900 }}>
                <span style={{ color: '#FFFFFF' }}>目标不完成，</span>
                <span style={{ color: mixRgb([150, 160, 180], [245, 166, 35], flipClause2), opacity: 0.3 + flipClause2 * 0.7 }}>
                  它就不许停下来！
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PHASE C: Verifiable Prompt Console + Focusing Giant Circular Overnight Gauge + Sequential Platforms */}
      {toGauge > 0.02 && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 22, opacity: toGauge }}>
          <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1.22fr 0.82fr', gap: 44, alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 18 }}>
                <span style={{ fontFamily: FONTS.mono, fontSize: 88, fontWeight: 900, color: COLORS.amber, lineHeight: 0.95 }}>/goal</span>
                <span style={{ fontSize: 36, fontWeight: 900 }}>
                  <span style={{ color: '#FFFFFF' }}>给它的终点，</span>
                  <span style={{ color: mixRgb([140, 152, 174], [245, 166, 35], verifyHeader2), opacity: 0.3 + verifyHeader2 * 0.7 }}>
                    必须机器可自动验证
                  </span>
                </span>
              </div>

              <div style={{ padding: '16px 26px', borderRadius: 16, backgroundColor: 'rgba(229, 72, 77, 0.14)', border: '1.5px solid rgba(229, 72, 77, 0.55)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', opacity: badIn, transform: `translate3d(0, ${((1 - badIn) * 20).toFixed(1)}px, 0)` }}>
                <span style={{ fontSize: 28, fontWeight: 800, color: '#FCA5A5', textDecoration: 'line-through' }}>
                  ✕ /goal 把这个项目优化得更好看
                </span>
                <span style={{ fontSize: 22, fontWeight: 900, color: '#E5484D', opacity: badTagIn, transform: `scale(${0.86 + badTagIn * 0.14})` }}>
                  无机器标准 · 无法结束
                </span>
              </div>

              <div style={{ ...crystal(0.95, 24), padding: '30px 36px', borderColor: '#F5A623', boxShadow: '0 0 58px rgba(245,166,35,0.28), 0 24px 60px rgba(0,0,0,0.55)', transform: `perspective(1400px) rotateY(4deg) translate3d(0, ${((1 - goodIn) * 24).toFixed(1)}px, 0)`, opacity: goodIn }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <span style={{ backgroundColor: COLORS.amber, color: '#0E1119', padding: '6px 18px', borderRadius: 10, fontSize: 22, fontWeight: 900 }}>
                    直接抄作业 · 截屏保存
                  </span>
                  <span style={{ fontFamily: FONTS.mono, fontSize: 22, color: '#2ECC71', fontWeight: 900 }}>● VERIFIABLE</span>
                </div>
                <div style={{ fontSize: 36, fontWeight: 900, color: COLORS.white, lineHeight: 1.48 }}>
                  <span style={{ fontFamily: FONTS.mono, color: COLORS.amber }}>/goal </span>
                  修复项目里所有 <span style={{ fontFamily: FONTS.mono, color: COLORS.amberBright }}>npm test</span> 失败的用例，并且保证 <span style={{ fontFamily: FONTS.mono, color: '#2ECC71' }}>npm run build</span> 零报错通过。
                </div>
                <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.14)', display: 'flex', gap: 18 }}>
                  <span style={{ fontFamily: FONTS.mono, fontSize: 23, fontWeight: 900, color: '#2ECC71', backgroundColor: 'rgba(46,204,113,0.16)', border: '1.5px solid #2ECC71', padding: '8px 18px', borderRadius: 10, opacity: testBadge, transform: `scale(${0.86 + testBadge * 0.14})` }}>
                    $ npm test → PASS ✓
                  </span>
                  <span style={{ fontFamily: FONTS.mono, fontSize: 23, fontWeight: 900, color: '#2ECC71', backgroundColor: 'rgba(46,204,113,0.16)', border: '1.5px solid #2ECC71', padding: '8px 18px', borderRadius: 10, opacity: buildBadge, transform: `scale(${0.86 + buildBadge * 0.14})` }}>
                    $ npm run build → 0 ERRORS ✓
                  </span>
                </div>
              </div>
            </div>

            {/* Giant Circular Overnight Autonomy Gauge with Focus Scale-Up on "过夜任务/几天任务" */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18, transform: `scale(${(1 + gaugeFocus * 0.08).toFixed(4)})` }}>
              <div style={{ position: 'relative', width: 440, height: 440, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="440" height="440" viewBox="0 0 450 450" style={{ transform: 'rotate(-90deg)' }}>
                  <circle cx="225" cy="225" r="214" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="2" strokeDasharray="6 10" />
                  <circle cx="225" cy="225" r="192" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="22" />
                  <circle cx="225" cy="225" r="192" fill="none" stroke={gaugePct >= 99 ? '#2ECC71' : '#F5A623'} strokeWidth="22" strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={circ * (1 - gaugePct / 100)} />
                </svg>
                <div style={{ position: 'absolute', textAlign: 'center' }}>
                  <div style={{ fontFamily: FONTS.mono, fontSize: 22, fontWeight: 800, color: '#B4BFD4', letterSpacing: 2, marginBottom: 10 }}>OVERNIGHT RUN</div>
                  <div style={{ fontFamily: FONTS.display, fontSize: 120, fontWeight: 900, color: gaugePct >= 99 ? '#2ECC71' : COLORS.amber, lineHeight: 0.94 }}>{Math.round(gaugePct)}%</div>
                  <div style={{ fontSize: 26, fontWeight: 900, color: '#2ECC71', marginTop: 10 }}>
                    {gaugePct >= 99 ? '过夜达标 · 自动收工 ✓' : '死磕验证中…'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Exact Voiceover-Synced App -> CLI -> IDE Pills (273.1s ~ 276.1s) */}
          <SequentialPlatformBar
            platforms={[
              { name: 'App', at: 1596 },
              { name: 'CLI', at: 1620 },
              { name: 'IDE', at: 1644 },
            ]}
          />
        </div>
      )}
    </div>
  );
};

/* ============================================================================
 * SCENE 09 (04:36.0 – 04:40.5, 135f): 2+3 Staggered Bento Decision Matrix
 * ==========================================================================*/
const Scene09OutroBento: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const savePulse = beatHighlight(frame, 80, 128);

  const top2 = [
    { num: '01', pain: '活多能拆', cmd: '/swarm', detail: '多 Agent 并行拆活 · @verifier 验收', plan: '免费可用', free: true },
    { num: '02', pain: '活难啃不动', cmd: '/boost', detail: '多轮深度推理找茬 · 攻克硬骨头', plan: '付费计划', free: false },
  ];
  const bot3 = [
    { num: '03', pain: '跨天大工程', cmd: '/teamwork', detail: '需求访谈 · 里程碑门禁', plan: '付费计划', free: false },
    { num: '04', pain: '批量定制流水线', cmd: '/run-workflow', detail: 'Agent 自动写 Python 编排', plan: '免费可用', free: true },
    { num: '05', pain: '目标明确想挂机', cmd: '/goal', detail: '机器可验证 · 过夜死磕', plan: '全端支持', free: true },
  ];

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 26, opacity: easeOutExpo(frame / 12) }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <AntigravityLogo size={54} />
          <span style={{ fontSize: 56, fontWeight: 900, color: COLORS.white }}>Antigravity 3 秒选型口诀</span>
        </div>
        <span
          style={{
            backgroundColor: COLORS.amber,
            color: '#0E1119',
            padding: '12px 28px',
            borderRadius: 14,
            fontSize: 28,
            fontWeight: 900,
            boxShadow: `0 0 ${(32 + savePulse * 36).toFixed(0)}px rgba(245,166,35,${(0.4 + savePulse * 0.45).toFixed(2)})`,
            transform: `scale(${(1 + savePulse * 0.08).toFixed(4)})`,
          }}
        >
          建议直接截图保存
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 26, flex: 1.05 }}>
        {top2.map((c, i) => {
          const p = spring({ frame: Math.max(0, frame - 4 - i * 4), fps, config: CRISP_SPRING });
          return (
            <div key={c.cmd} style={{ ...crystal(i === 0 ? 0.9 : 0.5, 26), padding: '32px 38px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', opacity: p, transform: `translate3d(0, ${((1 - p) * 26).toFixed(1)}px, 0)` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 42, fontWeight: 900, color: COLORS.white }}>{c.pain}</span>
                <span style={{ padding: '7px 18px', borderRadius: 10, backgroundColor: c.free ? 'rgba(46,204,113,0.2)' : 'rgba(245,166,35,0.2)', border: `1.5px solid ${c.free ? '#2ECC71' : COLORS.amber}`, color: c.free ? '#2ECC71' : COLORS.amber, fontSize: 22, fontWeight: 900 }}>{c.plan}</span>
              </div>
              <div style={{ fontFamily: FONTS.mono, fontSize: 74, fontWeight: 900, color: COLORS.amber, lineHeight: 1 }}>{c.cmd}</div>
              <div style={{ fontSize: 26, fontWeight: 700, color: '#C8D1E0' }}>{c.detail}</div>
            </div>
          );
        })}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 26, flex: 1 }}>
        {bot3.map((c, i) => {
          const p = spring({ frame: Math.max(0, frame - 12 - i * 4), fps, config: CRISP_SPRING });
          return (
            <div key={c.cmd} style={{ ...crystal(0.42, 24), padding: '28px 30px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', opacity: p, transform: `translate3d(0, ${((1 - p) * 26).toFixed(1)}px, 0)` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 32, fontWeight: 900, color: COLORS.white }}>{c.pain}</span>
                <span style={{ padding: '5px 14px', borderRadius: 9, backgroundColor: c.free ? 'rgba(46,204,113,0.18)' : 'rgba(245,166,35,0.18)', border: `1px solid ${c.free ? '#2ECC71' : COLORS.amber}`, color: c.free ? '#2ECC71' : COLORS.amber, fontSize: 20, fontWeight: 900, flexShrink: 0 }}>{c.plan}</span>
              </div>
              <div style={{ fontFamily: FONTS.mono, fontSize: c.cmd.length > 10 ? 46 : 58, fontWeight: 900, color: COLORS.amber, lineHeight: 1.05 }}>{c.cmd}</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#C8D1E0' }}>{c.detail}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ============================================================================
 * FULL 4m40s V2.2 PRODUCTION VIDEO (Gate 0 High-Density Voiceover-Synced Micro-Beats!)
 * ==========================================================================*/
export const AgyV2FullVideo: React.FC = () => {
  const frame = useCurrentFrame();

  const stepIndex =
    frame < f(68.1) ? 1 : frame < f(113.5) ? 2 : frame < f(174.5) ? 3 : frame < f(219.9) ? 4 : 5;

  const chapterLabel =
    frame < f(13.0)
      ? 'OVERVIEW · 5 SLASH COMMANDS'
      : frame < f(68.1)
        ? '01 · /swarm · PARALLEL TOPOLOGY'
        : frame < f(113.5)
          ? '02 · /boost · DEEP REASONING LOOP'
          : frame < f(174.5)
            ? '03 · /teamwork · MILESTONE GATES'
            : frame < f(219.9)
              ? '04 · /run-workflow · SCRIPTED FAN-OUT'
              : frame < f(276.0)
                ? '05 · /goal · VERIFIABLE AUTONOMOUS'
                : 'CHEATSHEET · 3-SECOND SELECTION';

  // Exact frame-synced subtle physical Foley SFX cue sheet (all ducked to 0.11–0.16!)
  const sfxCues: Array<{ at: number; kind: SfxKind }> = [
    // Intro: 5 gravity card drops + focus ticks + Match-Cut whoosh
    { at: 4, kind: 'drop' }, { at: 9, kind: 'drop' }, { at: 14, kind: 'drop' }, { at: 19, kind: 'drop' }, { at: 24, kind: 'drop' },
    { at: 108, kind: 'pop' }, { at: 152, kind: 'pop' }, { at: 196, kind: 'pop' }, { at: 240, kind: 'pop' }, { at: 292, kind: 'pop' },
    { at: 344, kind: 'whoosh' },
    // Scene 02: /swarm use cases card deals + flowing spine
    { at: f(12.9) + 46, kind: 'deal' }, { at: f(12.9) + 110, kind: 'flow' }, { at: f(12.9) + 122, kind: 'deal' }, { at: f(12.9) + 180, kind: 'flow' }, { at: f(12.9) + 192, kind: 'deal' },
    // Scene 03: Serial queue -> 3D flip -> Star topology + Board shift + @verifier emphasis + Diff/Test badges
    { at: f(23.3), kind: 'whoosh' },
    { at: f(23.3) + 302, kind: 'flip' },
    { at: f(23.3) + 384, kind: 'flow' },
    { at: f(23.3) + 398, kind: 'pop' }, { at: f(23.3) + 406, kind: 'pop' }, { at: f(23.3) + 414, kind: 'pop' },
    { at: f(23.3) + 462, kind: 'drop' },
    { at: f(23.3) + 618, kind: 'whoosh' }, { at: f(23.3) + 695, kind: 'pop' },
    { at: f(23.3) + 772, kind: 'pop' }, { at: f(23.3) + 828, kind: 'pop' }, { at: f(23.3) + 888, kind: 'pop' },
    // Scene 04: /swarm prompt + tags + App/CLI/Free
    { at: f(54.4), kind: 'whoosh' }, { at: f(54.4) + 138, kind: 'pop' }, { at: f(54.4) + 168, kind: 'pop' },
    { at: f(54.4) + 258, kind: 'pop' }, { at: f(54.4) + 294, kind: 'pop' }, { at: f(54.4) + 351, kind: 'drop' },
    // Scene 05: /boost progressive headline + 3 hard cases + flip + orbital + doc shift + prompt platforms
    { at: f(68.1), kind: 'whoosh' }, { at: f(68.1) + 84, kind: 'pop' },
    { at: f(68.1) + 120, kind: 'deal' }, { at: f(68.1) + 213, kind: 'deal' }, { at: f(68.1) + 285, kind: 'deal' },
    { at: f(68.1) + 568, kind: 'flip' },
    { at: f(68.1) + 638, kind: 'flow' }, { at: f(68.1) + 813, kind: 'pop' }, { at: f(68.1) + 906, kind: 'pop' }, { at: f(68.1) + 972, kind: 'pop' },
    { at: f(68.1) + 1065, kind: 'whoosh' },
    { at: f(68.1) + 1146, kind: 'pop' }, { at: f(68.1) + 1179, kind: 'pop' }, { at: f(68.1) + 1215, kind: 'pop' }, { at: f(68.1) + 1275, kind: 'drop' },
    // Scene 06: /teamwork compare + milestones + Critic/Auditor gates + practice flip + 3 inputs + platforms
    { at: f(113.5), kind: 'whoosh' }, { at: f(113.5) + 246, kind: 'deal' }, { at: f(113.5) + 387, kind: 'deal' },
    { at: f(113.5) + 684, kind: 'whoosh' }, { at: f(113.5) + 715, kind: 'flow' },
    { at: f(113.5) + 785, kind: 'drop' }, { at: f(113.5) + 957, kind: 'drop' },
    { at: f(113.5) + 1065, kind: 'pop' }, { at: f(113.5) + 1140, kind: 'pop' }, { at: f(113.5) + 1206, kind: 'drop' },
    { at: f(113.5) + 1315, kind: 'whoosh' }, { at: f(113.5) + 1488, kind: 'flip' },
    { at: f(113.5) + 1503, kind: 'pop' }, { at: f(113.5) + 1545, kind: 'pop' }, { at: f(113.5) + 1575, kind: 'pop' },
    { at: f(113.5) + 1713, kind: 'pop' }, { at: f(113.5) + 1734, kind: 'pop' }, { at: f(113.5) + 1755, kind: 'pop' }, { at: f(113.5) + 1785, kind: 'drop' },
    // Scene 07: /run-workflow flip + capability pills + 20 files + terminal focus + report + tags + prompt platforms
    { at: f(174.5), kind: 'whoosh' }, { at: f(174.5) + 330, kind: 'flip' },
    { at: f(174.5) + 495, kind: 'whoosh' }, { at: f(174.5) + 510, kind: 'pop' }, { at: f(174.5) + 555, kind: 'pop' }, { at: f(174.5) + 606, kind: 'pop' },
    { at: f(174.5) + 740, kind: 'drop' }, { at: f(174.5) + 745, kind: 'drop' }, { at: f(174.5) + 750, kind: 'drop' },
    { at: f(174.5) + 848, kind: 'flow' }, { at: f(174.5) + 942, kind: 'drop' },
    { at: f(174.5) + 1011, kind: 'pop' }, { at: f(174.5) + 1041, kind: 'pop' }, { at: f(174.5) + 1071, kind: 'pop' },
    { at: f(174.5) + 1195, kind: 'whoosh' }, { at: f(174.5) + 1251, kind: 'pop' }, { at: f(174.5) + 1281, kind: 'pop' }, { at: f(174.5) + 1326, kind: 'drop' },
    // Scene 08: /goal Codex/Claude + flip + verifiable console + gauge focus + platforms
    { at: f(219.9), kind: 'whoosh' }, { at: f(219.9) + 129, kind: 'pop' }, { at: f(219.9) + 165, kind: 'pop' }, { at: f(219.9) + 234, kind: 'pop' },
    { at: f(219.9) + 654, kind: 'flip' }, { at: f(219.9) + 855, kind: 'flow' },
    { at: f(219.9) + 963, kind: 'deal' }, { at: f(219.9) + 1143, kind: 'drop' },
    { at: f(219.9) + 1233, kind: 'pop' }, { at: f(219.9) + 1344, kind: 'pop' }, { at: f(219.9) + 1377, kind: 'flow' },
    { at: f(219.9) + 1596, kind: 'pop' }, { at: f(219.9) + 1620, kind: 'pop' }, { at: f(219.9) + 1644, kind: 'pop' },
    // Scene 09: Outro Bento 5 cards deal-in + save badge pulse
    { at: f(276.0), kind: 'whoosh' }, { at: f(276.0) + 4, kind: 'deal' }, { at: f(276.0) + 8, kind: 'deal' }, { at: f(276.0) + 12, kind: 'deal' }, { at: f(276.0) + 80, kind: 'pop' },
  ];

  return (
    <LuminousStage stepIndex={stepIndex} chapterLabel={chapterLabel}>
      {/* Main Voiceover Audio */}
      <Audio src={staticFile('assets_agy/agy_commands.wav')} volume={1.0} />

      {/* Frame-Synced Low-Volume Physical Foley SFX */}
      {sfxCues.map((c, idx) => (
        <SfxCue key={idx} at={c.at} kind={c.kind} />
      ))}

      {/* 00:00.0 – 00:13.3: EXACT APPROVED Scene01 */}
      <Sequence from={0} durationInFrames={f(13.3)}>
        <Scene01Intro3DLayers />
      </Sequence>

      {/* 00:12.9 – 00:23.8: EXACT APPROVED Scene02 */}
      <Sequence from={f(12.9)} durationInFrames={f(23.8 - 12.9)}>
        <Scene02SwarmUseCases />
      </Sequence>

      {/* 00:23.3 – 00:54.8: Upgraded Scene03 (Vector Swarm Board + Perspective Shift + @verifier Emphasis!) */}
      <Sequence from={f(23.3)} durationInFrames={f(54.8 - 23.3)}>
        <Scene03FlipToSwarmTopology outAt={f(54.5 - 23.3)} />
      </Sequence>

      {/* 00:54.4 – 01:08.3: /swarm Copy-Ready Prompt + Sequential App/CLI/Free */}
      <Sequence from={f(54.4)} durationInFrames={f(68.3 - 54.4)}>
        <Scene04SwarmPrompt dur={f(68.3 - 54.4)} />
      </Sequence>

      {/* 01:08.1 – 01:53.7: /boost Progressive Clause + Orbital Ring + 3x Doc + Sequential Platforms */}
      <Sequence from={f(68.1)} durationInFrames={f(113.7 - 68.1)}>
        <Scene05BoostFull dur={f(113.7 - 68.1)} />
      </Sequence>

      {/* 01:53.5 – 02:54.7: /teamwork Milestones + Critic/Auditor Gates + 3 Inputs + Sequential Platforms */}
      <Sequence from={f(113.5)} durationInFrames={f(174.7 - 113.5)}>
        <Scene06TeamworkFull dur={f(174.7 - 113.5)} />
      </Sequence>

      {/* 02:54.5 – 03:40.0: /run-workflow Flip + 20 Files + Perspective Terminal + Sequential Tags */}
      <Sequence from={f(174.5)} durationInFrames={f(220.0 - 174.5)}>
        <Scene07WorkflowFull dur={f(220.0 - 174.5)} />
      </Sequence>

      {/* 03:39.9 – 04:36.2: /goal Codex/Claude + Verifiable Console + Focusing Gauge + Sequential Platforms */}
      <Sequence from={f(219.9)} durationInFrames={f(276.2 - 219.9)}>
        <Scene08GoalFull dur={f(276.2 - 219.9)} />
      </Sequence>

      {/* 04:36.0 – 04:40.5: 2+3 Bento Cheatsheet + Save Badge Pulse */}
      <Sequence from={f(276.0)} durationInFrames={AGY_V2_FULL_FRAMES - f(276.0)}>
        <Scene09OutroBento />
      </Sequence>
    </LuminousStage>
  );
};
