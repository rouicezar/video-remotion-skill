import React from 'react';
import { spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { COLORS, FONTS, WEIGHTS } from '../../design/tokens';
import { clamp01, CRISP_SPRING, easeInOutCubic, mixRgb, Rgb, smoothFocusWeight, steppedGlide } from '../motion';
import { PhysicalGlass3D } from '../PhysicalGlass3D';
import { SfxGroup } from '../Sfx';

export interface TerminalLineSpec {
  /** 代码前缀高亮词（如关键字/函数名），可选 */
  token?: string;
  code: string;
  comment?: string;
  at: number;
}

/**
 * 引擎积木库（第 10 类几何骨架）：2.5D 拟真暗黑代码/命令终端（DarkCodeTerminal）
 * 适用语义：CLI 命令流、Python/TS 编排脚本拆解（如 `/run-workflow`）、配置对比、实时构建输出。
 * 严格遵循 Gate 2 & Gate 3：
 * - 代码与行号全量 ≥ 24px（手机小屏一眼看清）；
 * - 焦点切换采用行内连续 RGB 背景插值（严禁跨行间空隙的滑动高亮条）。
 */
export const DarkCodeTerminal: React.FC<{
  fileTitle: string;
  langBadge: string;
  lines: TerminalLineSpec[];
  outputSummary?: { label: string; detail: string; at: number };
  accentRgb?: Rgb;
  passRgb?: Rgb;
  sfxMuted?: boolean;
}> = ({
  fileTitle,
  langBadge,
  lines,
  outputSummary,
  accentRgb = [245, 166, 35],
  passRgb = [52, 168, 83],
  sfxMuted = false,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const winIn = spring({ frame: Math.max(0, frame - 2), fps, config: CRISP_SPRING });
  const focusIdx = steppedGlide(
    frame,
    lines.map((l, i) => ({ at: l.at, dur: i === 0 ? 1 : 12, target: i }))
  );
  const outP = outputSummary ? clamp01(easeInOutCubic((frame - outputSummary.at) / 14)) : 0;

  const sfxEvents = [
    { kind: 'drop' as const, at: 3 },
    ...lines.map((l) => ({ kind: 'pop' as const, at: l.at })),
    ...(outputSummary ? [{ kind: 'deal' as const, at: outputSummary.at }] : []),
  ];

  return (
    <div
      style={{
        width: '100%',
        height: 740,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        opacity: winIn,
        transform: `perspective(1600px) translate3d(0, ${((1 - winIn) * 28).toFixed(1)}px, 0) rotateX(4deg)`,
      }}
    >
      <SfxGroup events={sfxEvents} muted={sfxMuted} />

      <PhysicalGlass3D active={0.78} accentRgb={accentRgb} radius={28} slabPx={16} extrudeX={0} padding={0} sheenSpeed={0.5}>
        {/* 终端顶部栏 */}
        <div
          style={{
            height: 64,
            padding: '0 34px',
            backgroundColor: 'rgba(255, 255, 255, 0.04)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ width: 13, height: 13, borderRadius: '50%', backgroundColor: '#FF5F56' }} />
            <span style={{ width: 13, height: 13, borderRadius: '50%', backgroundColor: '#FFBD2E' }} />
            <span style={{ width: 13, height: 13, borderRadius: '50%', backgroundColor: '#27C93F' }} />
            <span style={{ fontFamily: FONTS.mono, fontSize: 25, fontWeight: WEIGHTS.light, color: '#D0DCED', marginLeft: 16 }}>
              {fileTitle}
            </span>
          </div>
          <span style={{ fontFamily: FONTS.mono, fontSize: 24, color: mixRgb(accentRgb, accentRgb, 1), letterSpacing: 2 }}>
            {langBadge}
          </span>
        </div>

        {/* 代码主体行列表（行内连续 RGB 插值高亮，零跨行滑块） */}
        <div style={{ padding: '32px 38px 36px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {lines.map((ln, idx) => {
            const lp = spring({ frame: Math.max(0, frame - ln.at), fps, config: CRISP_SPRING });
            const w = frame >= ln.at ? smoothFocusWeight(idx, focusIdx, 0.82) : 0;
            return (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px 24px',
                  borderRadius: 14,
                  backgroundColor: `rgba(${accentRgb[0]}, ${accentRgb[1]}, ${accentRgb[2]}, ${(0.02 + w * 0.14).toFixed(3)})`,
                  borderWidth: 2,
                  borderStyle: 'solid',
                  borderColor: mixRgb([42, 52, 72], accentRgb, w * 0.85),
                  opacity: lp,
                  transform: `translate3d(${((1 - lp) * 24).toFixed(1)}px, 0, 0)`,
                  boxSizing: 'border-box',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 24 }}>
                  <span style={{ fontFamily: FONTS.mono, fontSize: 24, color: mixRgb([106, 120, 146], accentRgb, w), width: 36 }}>
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  <div style={{ fontFamily: FONTS.mono, fontSize: 30, fontWeight: WEIGHTS.regular, color: COLORS.white, letterSpacing: 0.4 }}>
                    {ln.token && (
                      <span style={{ color: mixRgb([245, 186, 82], accentRgb, 0.8), marginRight: 14 }}>{ln.token}</span>
                    )}
                    <span>{ln.code}</span>
                  </div>
                </div>

                {ln.comment && (
                  <span style={{ fontSize: 25, fontWeight: WEIGHTS.light, color: mixRgb([146, 162, 188], [255, 232, 184], w), letterSpacing: 1 }}>
                    {ln.comment}
                  </span>
                )}
              </div>
            );
          })}

          {/* 底部实时执行结果回显栏 */}
          {outputSummary && (
            <div
              style={{
                marginTop: 14,
                padding: '18px 26px',
                borderRadius: 16,
                backgroundColor: `rgba(${passRgb[0]}, ${passRgb[1]}, ${passRgb[2]}, ${(0.06 + outP * 0.1).toFixed(3)})`,
                border: `2px solid ${mixRgb([72, 96, 90], passRgb, outP * 0.9)}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                opacity: outP,
                transform: `translate3d(0, ${((1 - outP) * 14).toFixed(1)}px, 0)`,
              }}
            >
              <span style={{ fontFamily: FONTS.mono, fontSize: 26, color: mixRgb([170, 242, 208], passRgb, 0.6) }}>
                ▸ {outputSummary.label}
              </span>
              <span style={{ fontSize: 27, fontWeight: WEIGHTS.regular, color: COLORS.white, letterSpacing: 1 }}>
                {outputSummary.detail}
              </span>
            </div>
          )}
        </div>
      </PhysicalGlass3D>
    </div>
  );
};
