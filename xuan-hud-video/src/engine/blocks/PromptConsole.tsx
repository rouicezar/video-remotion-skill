import React from 'react';
import { spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { COLORS, FONTS } from '../../design/tokens';
import { beatHighlight, clamp01, CRISP_SPRING, easeOutExpo, mixRgb, Rgb } from '../motion';
import { PhysicalGlass3D } from '../PhysicalGlass3D';
import { SfxEvent, SfxGroup } from '../Sfx';

export interface BeatChipItem {
  label: string;
  /** 相对当前场景起点的触发帧 */
  at: number;
  icon?: React.ReactNode;
}

export interface PlanBadgeSpec {
  label: string;
  at: number;
  tone?: 'green' | 'amber';
}

export interface PromptConsoleProps {
  /** 核心指令或前缀大词（如 `/swarm`），可选 */
  command?: string;
  /** 2–6 字核心锚点短词（Gate 2：严禁长句） */
  headline: string;
  /** 供观众截屏保存的抄作业提示词正文（Gate 1/2 合法豁免长文本区） */
  promptBody: string;
  /** 右上角口播同步点亮的要素短签（2–6 字） */
  tags: BeatChipItem[];
  /** 底部左侧口播同步点亮的平台/载体胶囊 */
  platforms?: BeatChipItem[];
  /** 底部右侧口播同步点亮的门槛/结论徽章 */
  planBadge?: PlanBadgeSpec;
  /** 打字机起始帧与速度（字符/帧） */
  typeStartFrame?: number;
  charsPerFrame?: number;
  saveLabel?: string;
  accentRgb?: Rgb;
  sfxMuted?: boolean;
}

/**
 * 通用「抄作业 · 截屏保存」提示词控制台积木：
 * - 全量字号 ≥ 26px（彻底清零 < 24px 小字）
 * - 全量颜色切换走 mixRgb 连续插值（零布尔阈值硬跳色）
 * - 底层封装 <PhysicalGlass3D>（噪点层 + 文字上方 zIndex:10 折射扫光）
 * - 内聚 <SfxGroup> 与各触发帧同源绑定（零外部帧偏移表）
 */
export const PromptConsole: React.FC<PromptConsoleProps> = ({
  command,
  headline,
  promptBody,
  tags,
  platforms = [],
  planBadge,
  typeStartFrame = 14,
  charsPerFrame = 1.25,
  saveLabel = '直接抄作业 · 截屏保存',
  accentRgb = [245, 166, 35],
  sfxMuted = false,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const inP = easeOutExpo(frame / 12);
  const cardP = spring({ frame: Math.max(0, frame - 3), fps, config: CRISP_SPRING });

  const typedCount = Math.min(
    promptBody.length,
    Math.max(0, Math.floor((frame - typeStartFrame) * charsPerFrame))
  );
  const typedText = promptBody.slice(0, typedCount);
  const typingDone = typedCount >= promptBody.length;
  const cursorAlpha = 0.25 + 0.75 * (0.5 + 0.5 * Math.cos(frame * 0.45));

  const sfxEvents: SfxEvent[] = [
    { kind: 'whoosh', at: 1 },
    { kind: 'drop', at: 4 },
    ...tags.map((t) => ({ kind: 'pop' as const, at: t.at })),
    ...platforms.map((p) => ({ kind: 'pop' as const, at: p.at })),
    ...(planBadge ? [{ kind: 'deal' as const, at: planBadge.at }] : []),
  ];

  const [ar, ag, ab] = accentRgb;
  const accentHex = mixRgb(accentRgb, accentRgb, 1);

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        gap: 32,
        padding: '0 40px',
        boxSizing: 'border-box',
        opacity: inP,
        transform: `translate3d(0, ${((1 - inP) * 20).toFixed(1)}px, 0)`,
      }}
    >
      <SfxGroup events={sfxEvents} muted={sfxMuted} />

      {/* 顶部超大锚点词（command 92px + 2–6 字短标题 48px） */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 26 }}>
        {command && (
          <span
            style={{
              fontFamily: FONTS.mono,
              fontSize: 92,
              fontWeight: 900,
              color: accentHex,
              lineHeight: 0.95,
              textShadow: `0 0 36px rgba(${ar},${ag},${ab},0.35)`,
            }}
          >
            {command}
          </span>
        )}
        <span style={{ fontSize: 48, fontWeight: 900, color: COLORS.white, letterSpacing: 0.5 }}>
          {headline}
        </span>
      </div>

      {/* 3D 真蚀刻磨砂毛玻璃控制台 */}
      <div
        style={{
          perspective: 1400,
          opacity: cardP,
          transform: `translate3d(0, ${((1 - cardP) * 28).toFixed(1)}px, 0) rotateX(${((1 - cardP) * 7).toFixed(2)}deg)`,
        }}
      >
        <PhysicalGlass3D active={0.92} accentRgb={accentRgb} radius={26} padding="36px 42px" sheenSpeed={0.6}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 20,
              marginBottom: 24,
            }}
          >
            <span
              style={{
                backgroundColor: accentHex,
                color: '#0E1119',
                padding: '8px 22px',
                borderRadius: 12,
                fontSize: 26,
                fontWeight: 900,
              }}
            >
              {saveLabel}
            </span>

            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
              {tags.map((t, i) => {
                const tp = spring({ frame: Math.max(0, frame - t.at), fps, config: CRISP_SPRING });
                const nextAt = tags[i + 1]?.at ?? t.at + 42;
                const act = clamp01(beatHighlight(frame, t.at, nextAt));
                return (
                  <span
                    key={t.label}
                    style={{
                      padding: '8px 20px',
                      borderRadius: 12,
                      backgroundColor: `rgba(${ar}, ${ag}, ${ab}, ${(0.09 + act * 0.22).toFixed(3)})`,
                      borderWidth: 2,
                      borderStyle: 'solid',
                      borderColor: mixRgb([196, 206, 224], accentRgb, 0.28 + act * 0.72),
                      color: mixRgb([226, 232, 244], [255, 230, 175], act),
                      fontSize: 26,
                      fontWeight: 900,
                      opacity: tp,
                      transform: `scale(${(0.88 + tp * 0.12 + act * 0.06).toFixed(4)})`,
                      boxSizing: 'border-box',
                    }}
                  >
                    {t.label}
                  </span>
                );
              })}
            </div>
          </div>

          <div
            style={{
              fontSize: 42,
              fontWeight: 900,
              color: COLORS.white,
              lineHeight: 1.5,
              minHeight: 126,
              wordBreak: 'break-word',
            }}
          >
            {command && (
              <span style={{ fontFamily: FONTS.mono, color: accentHex, marginRight: 12 }}>{command}</span>
            )}
            {typedText}
            {!typingDone && (
              <span
                style={{
                  display: 'inline-block',
                  width: 14,
                  height: 38,
                  backgroundColor: accentHex,
                  marginLeft: 8,
                  verticalAlign: 'middle',
                  opacity: cursorAlpha,
                }}
              />
            )}
          </div>
        </PhysicalGlass3D>
      </div>

      {/* 底部口播同步载体胶囊 + 计划徽章（全量 ≥ 28px） */}
      {(platforms.length > 0 || planBadge) && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 4px' }}>
          <div style={{ display: 'flex', gap: 18 }}>
            {platforms.map((item, i) => {
              const pp = spring({ frame: Math.max(0, frame - item.at), fps, config: CRISP_SPRING });
              const nextAt = platforms[i + 1]?.at ?? (planBadge ? planBadge.at : item.at + 40);
              const act = clamp01(beatHighlight(frame, item.at, nextAt));
              return (
                <span
                  key={item.label}
                  style={{
                    padding: '12px 26px',
                    borderRadius: 14,
                    backgroundColor: `rgba(${ar}, ${ag}, ${ab}, ${(0.08 + act * 0.2).toFixed(3)})`,
                    borderWidth: 2,
                    borderStyle: 'solid',
                    borderColor: mixRgb([190, 202, 222], accentRgb, 0.26 + act * 0.74),
                    boxShadow: `0 0 ${(28 * act).toFixed(0)}px rgba(${ar},${ag},${ab},${(0.44 * act).toFixed(2)})`,
                    color: mixRgb([224, 232, 244], [255, 255, 255], act),
                    fontSize: 28,
                    fontWeight: 900,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 12,
                    opacity: pp,
                    transform: `translate3d(0, ${((1 - pp) * 16).toFixed(1)}px, 0) scale(${(1 + act * 0.06).toFixed(4)})`,
                    boxSizing: 'border-box',
                  }}
                >
                  {item.icon}
                  {item.label}
                </span>
              );
            })}
          </div>

          {planBadge && (() => {
            const plP = spring({ frame: Math.max(0, frame - planBadge.at), fps, config: CRISP_SPRING });
            const glow = clamp01(beatHighlight(frame, planBadge.at, planBadge.at + 45));
            const isGreen = (planBadge.tone ?? 'green') === 'green';
            const bgRgb: Rgb = isGreen ? [46, 204, 113] : accentRgb;
            return (
              <span
                style={{
                  backgroundColor: mixRgb(bgRgb, bgRgb, 1),
                  color: '#0E1119',
                  padding: '12px 30px',
                  borderRadius: 14,
                  fontSize: 28,
                  fontWeight: 900,
                  boxShadow: `0 0 ${(32 * glow).toFixed(0)}px rgba(${bgRgb[0]},${bgRgb[1]},${bgRgb[2]},0.65)`,
                  opacity: plP,
                  transform: `scale(${(0.88 + plP * 0.12 + glow * 0.06).toFixed(4)})`,
                }}
              >
                {planBadge.label}
              </span>
            );
          })()}
        </div>
      )}
    </div>
  );
};
