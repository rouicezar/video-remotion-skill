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
  typeStartFrame?: number;
  charsPerFrame?: number;
  saveLabel?: string;
  accentRgb?: Rgb;
  sfxMuted?: boolean;
}

/**
 * 2.5D 立体键帽胶囊（用于底部载体与计划标签，带真实受光厚底切面）
 */
const KeycapPill: React.FC<{
  children: React.ReactNode;
  accentRgb: Rgb;
  active: number;
  enterP: number;
  padding?: string;
}> = ({ children, accentRgb, active, enterP, padding = '14px 30px' }) => {
  const [ar, ag, ab] = accentRgb;
  const a = clamp01(active);
  return (
    <div
      style={{
        display: 'inline-block',
        opacity: enterP,
        transform: `translate3d(0, ${((1 - enterP) * 18 - a * 3).toFixed(1)}px, 0) scale(${(0.92 + enterP * 0.08 + a * 0.04).toFixed(4)})`,
      }}
    >
      <PhysicalGlass3D
        active={0.22 + a * 0.78}
        accentRgb={accentRgb}
        radius={16}
        slabPx={8}
        extrudeX={3}
        padding={padding}
        sheenSpeed={0}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 12,
            fontSize: 27,
            fontWeight: WEIGHTS.light,
            letterSpacing: 1,
            color: mixRgb([216, 226, 242], [255, 255, 255], a),
            whiteSpace: 'nowrap',
          }}
        >
          {children}
        </div>
      </PhysicalGlass3D>
    </div>
  );
};

/**
 * 通用「抄作业 · 截屏保存」提示词控制台积木（适配 3:2 画布黄金比例）：
 * - 拒绝上下大片空洞 + 中间拥挤扁长条：水平收拢至黄金宽度（1500px 居中），
 *   纵向按「顶部主标题区 → 68px 呼吸带 → 高体量 2.5D 厚玻璃主台 → 68px 呼吸带 → 2.5D 键帽底栏」舒展排布
 * - 主玻璃台采用微倾 3D 姿态 + 16px 实体斜切厚侧壁，一眼呈现真实亚克力/水晶砖厚度
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
        alignItems: 'center',
        justifyContent: 'center',
        boxSizing: 'border-box',
        opacity: inP,
        transform: `translate3d(0, ${((1 - inP) * 20).toFixed(1)}px, 0)`,
      }}
    >
      <SfxGroup events={sfxEvents} muted={sfxMuted} />

      {/* 黄金比例居中容器：左右留足舞台呼吸感，纵向舒展三段分布 */}
      <div
        style={{
          width: '100%',
          maxWidth: 1500,
          height: '100%',
          padding: '44px 0 36px',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        {/* 第 1 段：顶部超大锚点标题区 */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 30, paddingLeft: 6 }}>
          {command && (
            <span
              style={{
                fontFamily: FONTS.mono,
                fontSize: 94,
                fontWeight: WEIGHTS.regular,
                color: accentHex,
                lineHeight: 0.95,
                letterSpacing: -1.5,
                textShadow: `0 0 36px rgba(${ar},${ag},${ab},0.28)`,
              }}
            >
              {command}
            </span>
          )}
          <span style={{ fontSize: 50, fontWeight: WEIGHTS.light, color: '#EEF3FA', letterSpacing: 2.5 }}>
            {headline}
          </span>
        </div>

        {/* 第 2 段：中央丰满体量 2.5D 实体厚玻璃控制台（微倾露出底壁 + 右侧壁厚度） */}
        <div
          style={{
            perspective: 1600,
            opacity: cardP,
            transform: `translate3d(0, ${((1 - cardP) * 28).toFixed(1)}px, 0)`,
          }}
        >
          <div style={{ transform: 'rotateX(5deg)', transformOrigin: 'center center' }}>
            <PhysicalGlass3D
              active={0.92}
              accentRgb={accentRgb}
              radius={28}
              slabPx={16}
              extrudeX={0}
              padding="52px 58px 58px"
              sheenSpeed={0.6}
            >
              {/* 控制台顶栏 + 细分隔线 */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 24,
                  paddingBottom: 32,
                  marginBottom: 36,
                  borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                <span
                  style={{
                    backgroundColor: `rgba(${ar}, ${ag}, ${ab}, 0.14)`,
                    border: `1.5px solid ${accentHex}`,
                    color: mixRgb([255, 240, 205], accentRgb, 0.5),
                    padding: '9px 24px',
                    borderRadius: 12,
                    fontSize: 25,
                    fontWeight: WEIGHTS.regular,
                    letterSpacing: 1.8,
                  }}
                >
                  {saveLabel}
                </span>

                <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                  {tags.map((t, i) => {
                    const tp = spring({ frame: Math.max(0, frame - t.at), fps, config: CRISP_SPRING });
                    const nextAt = tags[i + 1]?.at ?? t.at + 42;
                    const act = clamp01(beatHighlight(frame, t.at, nextAt));
                    return (
                      <span
                        key={t.label}
                        style={{
                          padding: '9px 22px',
                          borderRadius: 12,
                          backgroundColor: `rgba(${ar}, ${ag}, ${ab}, ${(0.06 + act * 0.18).toFixed(3)})`,
                          borderWidth: 1.5,
                          borderStyle: 'solid',
                          borderColor: mixRgb([180, 194, 216], accentRgb, 0.28 + act * 0.72),
                          color: mixRgb([214, 224, 240], [255, 232, 182], act),
                          fontSize: 25,
                          fontWeight: WEIGHTS.light,
                          letterSpacing: 1.4,
                          opacity: tp,
                          transform: `scale(${(0.88 + tp * 0.12 + act * 0.05).toFixed(4)})`,
                          boxSizing: 'border-box',
                        }}
                      >
                        {t.label}
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* 提示词核心正文区（舒展行高与呼吸余量） */}
              <div
                style={{
                  fontSize: 44,
                  fontWeight: WEIGHTS.light,
                  color: COLORS.white,
                  lineHeight: 1.72,
                  letterSpacing: 1.2,
                  minHeight: 168,
                  wordBreak: 'break-word',
                }}
              >
                {command && (
                  <span style={{ fontFamily: FONTS.mono, fontWeight: WEIGHTS.regular, color: accentHex, marginRight: 16 }}>
                    {command}
                  </span>
                )}
                {typedText}
                {!typingDone && (
                  <span
                    style={{
                      display: 'inline-block',
                      width: 3,
                      height: 42,
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
        </div>

        {/* 第 3 段：底部 2.5D 立体键帽胶囊栏 */}
        {(platforms.length > 0 || planBadge) && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 4px' }}>
            <div style={{ display: 'flex', gap: 22 }}>
              {platforms.map((item, i) => {
                const pp = spring({ frame: Math.max(0, frame - item.at), fps, config: CRISP_SPRING });
                const nextAt = platforms[i + 1]?.at ?? (planBadge ? planBadge.at : item.at + 40);
                const act = clamp01(beatHighlight(frame, item.at, nextAt));
                return (
                  <KeycapPill key={item.label} accentRgb={accentRgb} active={act} enterP={pp}>
                    {item.icon}
                    {item.label}
                  </KeycapPill>
                );
              })}
            </div>

            {planBadge && (() => {
              const plP = spring({ frame: Math.max(0, frame - planBadge.at), fps, config: CRISP_SPRING });
              const glow = clamp01(beatHighlight(frame, planBadge.at, planBadge.at + 45));
              const isGreen = (planBadge.tone ?? 'green') === 'green';
              const badgeRgb: Rgb = isGreen ? [52, 211, 153] : accentRgb;
              return (
                <KeycapPill accentRgb={badgeRgb} active={0.65 + glow * 0.35} enterP={plP} padding="14px 34px">
                  <span style={{ color: mixRgb([242, 248, 252], badgeRgb, 0.32), fontWeight: WEIGHTS.regular }}>
                    {planBadge.label}
                  </span>
                </KeycapPill>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
};
