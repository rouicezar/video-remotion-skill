import React from 'react';
import { spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { COLORS, FONTS, WEIGHTS } from '../../design/tokens';
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

      {/* 顶部超大锚点词（细常规精密几何体，靠字号与色彩对比而非粗重笔画） */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 26 }}>
        {command && (
          <span
            style={{
              fontFamily: FONTS.mono,
              fontSize: 86,
              fontWeight: WEIGHTS.regular,
              color: accentHex,
              lineHeight: 0.95,
              letterSpacing: -1,
              textShadow: `0 0 32px rgba(${ar},${ag},${ab},0.28)`,
            }}
          >
            {command}
          </span>
        )}
        <span style={{ fontSize: 46, fontWeight: WEIGHTS.light, color: '#EEF3FA', letterSpacing: 2 }}>
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
                backgroundColor: `rgba(${ar}, ${ag}, ${ab}, 0.16)`,
                border: `1.5px solid ${accentHex}`,
                color: mixRgb([255, 240, 205], accentRgb, 0.55),
                padding: '7px 22px',
                borderRadius: 12,
                fontSize: 25,
                fontWeight: WEIGHTS.regular,
                letterSpacing: 1.5,
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
                      backgroundColor: `rgba(${ar}, ${ag}, ${ab}, ${(0.06 + act * 0.18).toFixed(3)})`,
                      borderWidth: 2,
                      borderStyle: 'solid',
                      borderColor: mixRgb([180, 194, 216], accentRgb, 0.24 + act * 0.76),
                      color: mixRgb([214, 224, 240], [255, 232, 182], act),
                      fontSize: 25,
                      fontWeight: WEIGHTS.light,
                      letterSpacing: 1.2,
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
              fontSize: 40,
              fontWeight: WEIGHTS.light,
              color: '#F2F6FC',
              lineHeight: 1.58,
              letterSpacing: 1,
              minHeight: 126,
              wordBreak: 'break-word',
            }}
          >
            {command && (
              <span style={{ fontFamily: FONTS.mono, fontWeight: WEIGHTS.regular, color: accentHex, marginRight: 14 }}>{command}</span>
            )}
            {typedText}
            {!typingDone && (
              <span
                style={{
                  display: 'inline-block',
                  width: 3,
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

      {/* 底部口播同步载体胶囊 + 计划徽章（全量细常规体） */}
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
                    backgroundColor: `rgba(${ar}, ${ag}, ${ab}, ${(0.06 + act * 0.16).toFixed(3)})`,
                    borderWidth: 2,
                    borderStyle: 'solid',
                    borderColor: mixRgb([180, 194, 216], accentRgb, 0.22 + act * 0.78),
                    boxShadow: `0 0 ${(26 * act).toFixed(0)}px rgba(${ar},${ag},${ab},${(0.36 * act).toFixed(2)})`,
                    color: mixRgb([214, 224, 240], [255, 255, 255], act),
                    fontSize: 27,
                    fontWeight: WEIGHTS.light,
                    letterSpacing: 0.8,
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
                  backgroundColor: `rgba(${bgRgb[0]}, ${bgRgb[1]}, ${bgRgb[2]}, 0.16)`,
                  border: `2px solid ${mixRgb(bgRgb, bgRgb, 1)}`,
                  color: isGreen ? mixRgb([210, 250, 228], bgRgb, 0.45) : mixRgb([255, 238, 198], bgRgb, 0.45),
                  padding: '11px 28px',
                  borderRadius: 14,
                  fontSize: 27,
                  fontWeight: WEIGHTS.regular,
                  letterSpacing: 1.5,
                  boxShadow: `0 0 ${(28 * glow).toFixed(0)}px rgba(${bgRgb[0]},${bgRgb[1]},${bgRgb[2]},0.45)`,
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
