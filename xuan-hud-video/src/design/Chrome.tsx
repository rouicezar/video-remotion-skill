import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { COLORS, FONTS } from './tokens';
import { glassSheenStyle, glassSurface } from './motion';
import { PromptToken, ReadoutMetric, SubtitleCue } from '../types/timeline';

export const WorldCanvas: React.FC<{
  watermark?: string;
  children: React.ReactNode;
}> = ({ watermark = 'Xuan', children }) => {
  const frame = useCurrentFrame();
  // Slow continuous drift of the watermark wall matching original video
  const driftX = (frame * 0.45) % 360;
  const driftY = (frame * 0.18) % 220;

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: COLORS.bg,
        backgroundImage:
          'radial-gradient(ellipse 80% 70% at 50% 45%, #161a24 0%, #111318 65%, #0c0e13 100%)',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: FONTS.sans,
        color: COLORS.textPrimary,
      }}
    >
      {/* Slowly drifting faint watermark wall */}
      {watermark ? (
        <div
          style={{
            position: 'absolute',
            inset: -440,
            transform: `translate(${-driftX}px, ${-driftY}px)`,
            display: 'grid',
            gridTemplateColumns: `repeat(7, ${watermark.length > 7 ? 760 : 460}px)`,
            gridAutoRows: '240px',
            pointerEvents: 'none',
            userSelect: 'none',
            opacity: 0.046,
          }}
        >
          {Array.from({ length: 56 }).map((_, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transform: `translateX(${(Math.floor(i / 7) % 2) * 180}px) skewX(-10deg)`,
                fontFamily: FONTS.sans,
                fontWeight: 900,
                fontSize: 96,
                letterSpacing: 2,
                whiteSpace: 'nowrap',
                color: 'transparent',
                WebkitTextStroke: '2px rgba(255,255,255,0.85)',
              }}
            >
              {watermark}
            </div>
          ))}
        </div>
      ) : null}

      {/* Main Content */}
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        {children}
      </div>
    </div>
  );
};

export const TopProgressBar: React.FC<{
  current: number; // 1-based
  total: number;
}> = ({ current, total }) => {
  const { width } = useVideoConfig();
  const sideInset = width <= 1650 ? 56 : 110;
  return (
    <div
      style={{
        position: 'absolute',
        top: 42,
        left: sideInset,
        right: sideInset,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        zIndex: 20,
      }}
    >
      <div style={{ flex: 1, display: 'flex', gap: 8, alignItems: 'center' }}>
        {Array.from({ length: total }).map((_, idx) => {
          const step = idx + 1;
          const isCurrent = step === current;
          const isDone = step < current;
          return (
            <div
              key={idx}
              style={{
                flex: 1,
                height: isCurrent ? 4 : 3,
                borderRadius: 2,
                backgroundColor: isCurrent
                  ? COLORS.amberBright
                  : isDone
                    ? 'rgba(245, 166, 35, 0.45)'
                    : 'rgba(255, 255, 255, 0.12)',
                boxShadow: isCurrent ? `0 0 12px ${COLORS.amberGlow}` : 'none',
              }}
            />
          );
        })}
      </div>
      <div
        style={{
          fontFamily: FONTS.mono,
          fontSize: 17,
          letterSpacing: 1.5,
          color: COLORS.textSecondary,
          marginLeft: 12,
          minWidth: 74,
          textAlign: 'right',
        }}
      >
        {String(current).padStart(2, '0')} / {String(total).padStart(2, '0')}
      </div>
    </div>
  );
};

export const StatePill: React.FC<{
  cameraMoving: boolean;
  size?: 'sm' | 'lg';
}> = ({ cameraMoving, size = 'sm' }) => {
  const isLg = size === 'lg';
  const dotSize = isLg ? 14 : 11;
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: isLg ? 16 : 12,
        padding: isLg ? '10px 24px' : '7px 16px',
        borderRadius: isLg ? 14 : 10,
        border: `1.5px solid ${COLORS.amberBorder}`,
        backgroundColor: 'rgba(17, 19, 24, 0.85)',
        boxShadow: `0 0 16px rgba(245, 166, 35, 0.12)`,
        fontSize: isLg ? 26 : 18,
        fontWeight: 600,
        color: COLORS.textPrimary,
        letterSpacing: 1,
      }}
    >
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>
        相机
        <span
          style={{
            width: dotSize,
            height: dotSize,
            borderRadius: '50%',
            backgroundColor: cameraMoving ? COLORS.amber : 'transparent',
            border: `2px solid ${cameraMoving ? COLORS.amber : COLORS.textSecondary}`,
            boxShadow: cameraMoving ? `0 0 10px ${COLORS.amber}` : 'none',
            display: 'inline-block',
          }}
        />
      </span>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>
        图
        <span
          style={{
            width: dotSize,
            height: dotSize,
            borderRadius: '50%',
            backgroundColor: !cameraMoving ? COLORS.amber : 'transparent',
            border: `2px solid ${!cameraMoving ? COLORS.amber : COLORS.textSecondary}`,
            boxShadow: !cameraMoving ? `0 0 10px ${COLORS.amber}` : 'none',
            display: 'inline-block',
          }}
        />
      </span>
    </div>
  );
};

export const CornerBrackets: React.FC<{
  inset?: number;
  size?: number;
  color?: string;
}> = ({ inset = 14, size = 22, color = COLORS.bracket }) => {
  const styleBase: React.CSSProperties = {
    position: 'absolute',
    width: size,
    height: size,
    pointerEvents: 'none',
  };
  return (
    <>
      <div
        style={{
          ...styleBase,
          top: inset,
          left: inset,
          borderTop: `1.5px solid ${color}`,
          borderLeft: `1.5px solid ${color}`,
        }}
      />
      <div
        style={{
          ...styleBase,
          top: inset,
          right: inset,
          borderTop: `1.5px solid ${color}`,
          borderRight: `1.5px solid ${color}`,
        }}
      />
      <div
        style={{
          ...styleBase,
          bottom: inset,
          left: inset,
          borderBottom: `1.5px solid ${color}`,
          borderLeft: `1.5px solid ${color}`,
        }}
      />
      <div
        style={{
          ...styleBase,
          bottom: inset,
          right: inset,
          borderBottom: `1.5px solid ${color}`,
          borderRight: `1.5px solid ${color}`,
        }}
      />
    </>
  );
};

export const TelemetryGraph: React.FC<{
  mode: 'step' | 'sine' | 'pulse' | 'curve' | 'flat';
  progress: number; // 0..1
  steps?: number;
}> = ({ mode, progress, steps = 6 }) => {
  const frame = useCurrentFrame();
  const w = 420;
  const h = 135;
  const padX = 12;
  const padY = 18;
  const innerW = w - padX * 2;
  const innerH = h - padY * 2;

  const points: Array<[number, number]> = [];
  const sampleCount = 80;
  for (let i = 0; i <= sampleCount; i++) {
    const t = i / sampleCount;
    const x = padX + t * innerW;
    let yNorm = 0.08;
    if (mode === 'flat') {
      yNorm = 0.08;
    } else if (mode === 'step') {
      const activeSteps = Math.floor(progress * steps);
      const stepIdx = Math.min(steps, Math.floor(t * (steps + 1)));
      const clampedStep = Math.min(stepIdx, activeSteps);
      yNorm = 0.08 + (clampedStep / Math.max(1, steps)) * 0.82;
    } else if (mode === 'sine') {
      const phase = t * Math.PI * 7 - frame * 0.14;
      yNorm = 0.5 + Math.sin(phase) * 0.36;
    } else if (mode === 'pulse') {
      const cycle = ((t * 5 - frame * 0.04) % 1 + 1) % 1;
      yNorm = cycle < 0.18 ? 0.12 + (cycle / 0.18) * 0.78 : cycle < 0.45 ? 0.9 : 0.12;
    } else if (mode === 'curve') {
      yNorm = 0.1 + (1 - Math.exp(-t * 9 * Math.max(0.15, progress))) * 0.8;
    }
    const y = padY + (1 - yNorm) * innerH;
    points.push([x, y]);
  }

  const d = points
    .map(([x, y], idx) => `${idx === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`)
    .join(' ');
  const last = points[points.length - 1];

  return (
    <div
      style={{
        width: '100%',
        height: 145,
        borderRadius: 10,
        backgroundColor: 'rgba(13, 16, 22, 0.75)',
        border: `1px solid ${COLORS.borderSubtle}`,
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <svg width="100%" height="100%" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
        {[0.25, 0.5, 0.75].map((g) => (
          <line
            key={g}
            x1={0}
            y1={h * g}
            x2={w}
            y2={h * g}
            stroke="rgba(255,255,255,0.05)"
            strokeWidth={1}
          />
        ))}
        <path
          d={d}
          fill="none"
          stroke={COLORS.amber}
          strokeWidth={2.8}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx={last[0]} cy={last[1]} r={5} fill={COLORS.amberBright} />
        <circle cx={last[0]} cy={last[1]} r={10} fill="rgba(245, 166, 35, 0.28)" />
      </svg>
    </div>
  );
};

export const PromptBar: React.FC<{
  tokens: PromptToken[];
  startFrame?: number;
  charsPerFrame?: number;
  label?: string;
  badge?: string;
}> = ({ tokens, startFrame = 0, charsPerFrame = 1.6, label = 'AI 描述词', badge = 'PROMPT' }) => {
  const frame = useCurrentFrame();
  const localFrame = Math.max(0, frame - startFrame);
  const visibleChars = Math.floor(localFrame * charsPerFrame);
  const fullLen = tokens.reduce((acc, t) => acc + t.text.length, 0);
  const showBar = frame >= startFrame;

  if (!showBar) return null;

  let remaining = visibleChars;
  const rendered = tokens.map((tok, idx) => {
    if (remaining <= 0) return null;
    const slice = tok.text.slice(0, remaining);
    remaining -= slice.length;
    return (
      <span
        key={idx}
        style={{
          color: tok.highlight ? COLORS.amberBright : COLORS.textPrimary,
          fontWeight: tok.highlight ? 700 : 500,
        }}
      >
        {slice}
      </span>
    );
  });

  const cursorOn = Math.floor(frame / 10) % 2 === 0;
  const opacity = interpolate(localFrame, [0, 8], [0, 1], { extrapolateRight: 'clamp' });

  return (
    <div
      style={{
        marginTop: 14,
        padding: '13px 22px',
        borderRadius: 12,
        border: `1.2px solid ${COLORS.amberBorder}`,
        backgroundColor: 'rgba(13, 16, 22, 0.92)',
        display: 'flex',
        alignItems: 'center',
        gap: 18,
        opacity,
        minHeight: 74,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          color: COLORS.amber,
          fontSize: 18,
          fontWeight: 700,
          whiteSpace: 'nowrap',
          flexShrink: 0,
        }}
      >
        <span>✦</span>
        <span>{label}</span>
      </div>
      <div
        style={{
          flex: 1,
          fontSize: 25,
          lineHeight: 1.42,
          letterSpacing: 0.4,
        }}
      >
        {rendered}
        {visibleChars < fullLen + 30 && (
          <span
            style={{
              display: 'inline-block',
              width: 10,
              height: 22,
              backgroundColor: COLORS.amber,
              marginLeft: 4,
              verticalAlign: 'middle',
              opacity: cursorOn ? 1 : 0.25,
            }}
          />
        )}
      </div>
      <div
        style={{
          fontFamily: FONTS.mono,
          fontSize: 13,
          letterSpacing: 2,
          color: COLORS.textMuted,
          flexShrink: 0,
        }}
      >
        {badge}
      </div>
    </div>
  );
};

export const HudFrame: React.FC<{
  moveIndex: number;
  totalMoves: number;
  titleZh: string;
  titleEn: string;
  cameraMoving: boolean;
  status: string;
  metrics: ReadoutMetric[];
  graphMode: 'step' | 'sine' | 'pulse' | 'curve' | 'flat';
  graphProgress?: number;
  graphSteps?: number;
  promptTokens?: PromptToken[];
  promptStartFrame?: number;
  promptLabel?: string;
  promptBadge?: string;
  children: React.ReactNode;
}> = ({
  moveIndex,
  totalMoves,
  titleZh,
  titleEn,
  cameraMoving,
  status,
  metrics,
  graphMode,
  graphProgress = 1,
  graphSteps = 6,
  promptTokens,
  promptStartFrame = 30,
  promptLabel,
  promptBadge,
  children,
}) => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  const isCompact = width <= 1650;
  const sideInset = isCompact ? 56 : 110;
  const sidebarW = isCompact ? 336 : 440;
  const enter = spring({ frame, fps, config: { damping: 16, stiffness: 105 } });
  // Smooth angled 3D dolly-in + subtle continuous breathing (per Episode 1 camera grammar!)
  const breathe = 1 + Math.min(0.014, frame * 0.00004);
  const scale = interpolate(enter, [0, 1], [0.94, 1]) * breathe;
  const rotY = interpolate(enter, [0, 1], [-6.5, 0]);
  const transY = interpolate(enter, [0, 1], [24, 0]);
  const opacity = interpolate(frame, [0, 10], [0, 1], { extrapolateRight: 'clamp' });

  const hasPrompt = Boolean(promptTokens && frame >= promptStartFrame);

  return (
    <>
      <TopProgressBar current={moveIndex} total={totalMoves} />
      <div
        style={{
          ...glassSurface({ active: 0.18, blurPx: 22, radius: 18, opacity: 0.74 }),
          position: 'absolute',
          top: 90,
          left: sideInset,
          right: sideInset,
          bottom: 170,
          padding: isCompact ? '20px 24px 18px 24px' : '22px 28px 20px 28px',
          display: 'flex',
          flexDirection: 'column',
          transform: `perspective(1400px) translateY(${transY}px) rotateY(${rotY}deg) scale(${scale})`,
          opacity,
          overflow: 'hidden',
        }}
      >
        <div style={glassSheenStyle(frame, 0.35)} />
        <CornerBrackets inset={12} size={20} />

        {/* Header Row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 14,
            paddingLeft: 8,
            paddingRight: 8,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                backgroundColor: COLORS.amber,
                color: '#111318',
                fontFamily: FONTS.display,
                fontWeight: 900,
                fontSize: 25,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                lineHeight: 1,
              }}
            >
              {String(moveIndex).padStart(2, '0')}
            </div>
            <div style={{ fontSize: 26, fontWeight: 700, color: COLORS.textPrimary }}>
              {titleZh}
            </div>
            <div
              style={{
                fontFamily: FONTS.mono,
                fontSize: 15,
                letterSpacing: 3,
                color: COLORS.textMuted,
                marginLeft: 4,
              }}
            >
              {titleEn}
            </div>
          </div>
          <StatePill cameraMoving={cameraMoving} />
        </div>

        {/* Main Body: Left Stage + Right LIVE READOUT */}
        <div style={{ flex: 1, display: 'flex', gap: 28, minHeight: 0 }}>
          {/* Left Viewport Stage */}
          <div
            style={{
              flex: 1,
              backgroundColor: COLORS.stageBg,
              borderRadius: 14,
              border: `1px solid ${COLORS.borderSubtle}`,
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {children}
            {/* Subtle bottom ruler ticks */}
            <div
              style={{
                position: 'absolute',
                left: 14,
                right: 14,
                bottom: 0,
                height: 10,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-end',
                pointerEvents: 'none',
                opacity: 0.25,
              }}
            >
              {Array.from({ length: 48 }).map((_, i) => (
                <div
                  key={i}
                  style={{
                    width: 1,
                    height: i % 5 === 0 ? 8 : 4,
                    backgroundColor: COLORS.textSecondary,
                  }}
                />
              ))}
            </div>
          </div>

          {/* Right LIVE READOUT Telemetry Panel */}
          <div
            style={{
              width: sidebarW,
              flexShrink: 0,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              paddingRight: 6,
            }}
          >
            <div>
              {/* Live indicator */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 8,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    fontFamily: FONTS.mono,
                    fontSize: 14,
                    letterSpacing: 2,
                    color: COLORS.textSecondary,
                  }}
                >
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      backgroundColor: COLORS.red,
                      opacity: 0.55 + 0.45 * Math.sin(frame * 0.25),
                    }}
                  />
                  LIVE READOUT
                </div>
                <div
                  style={{
                    fontFamily: FONTS.mono,
                    fontSize: 14,
                    letterSpacing: 2,
                    color: COLORS.textSecondary,
                  }}
                >
                  LIVE
                </div>
              </div>

              {/* Giant Condensed Amber Status */}
              <div
                style={{
                  fontFamily: FONTS.display,
                  fontSize: isCompact ? 54 : 68,
                  fontWeight: 900,
                  color: COLORS.amber,
                  lineHeight: 0.96,
                  letterSpacing: 1,
                  marginBottom: 18,
                  textTransform: 'uppercase',
                  wordBreak: 'break-word',
                }}
              >
                {status}
              </div>

              {/* Metrics */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: hasPrompt ? 14 : 20 }}>
                {metrics.map((m, idx) => (
                  <div
                    key={idx}
                    style={{
                      borderLeft: `3px solid ${m.accent ? COLORS.amber : COLORS.border}`,
                      paddingLeft: 14,
                    }}
                  >
                    <div
                      style={{
                        fontFamily: FONTS.mono,
                        fontSize: 13,
                        letterSpacing: 1.5,
                        color: COLORS.textMuted,
                        marginBottom: 3,
                      }}
                    >
                      {m.labelEn} · {m.labelZh}
                    </div>
                    <div
                      style={{
                        fontFamily: FONTS.mono,
                        fontSize: isCompact ? 36 : 44,
                        fontWeight: 800,
                        color: m.accent ? COLORS.amber : COLORS.textPrimary,
                        lineHeight: 1.1,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {m.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Live Graph */}
            <div style={{ marginTop: 12 }}>
              <TelemetryGraph mode={graphMode} progress={graphProgress} steps={graphSteps} />
            </div>
          </div>
        </div>

        {/* Bottom Typewriter Prompt Bar */}
        {promptTokens ? (
          <PromptBar tokens={promptTokens} startFrame={promptStartFrame} label={promptLabel} badge={promptBadge} />
        ) : null}
      </div>
    </>
  );
};

export const SubtitleOverlay: React.FC<{
  subtitles: SubtitleCue[];
}> = ({ subtitles }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sec = frame / fps;

  const active = subtitles.find((s) => sec >= s.startSec && sec <= s.endSec);
  if (!active) return null;

  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 34,
        display: 'flex',
        justifyContent: 'center',
        pointerEvents: 'none',
        zIndex: 50,
      }}
    >
      <div
        style={{
          backgroundColor: 'rgba(14, 17, 22, 0.88)',
          padding: '12px 32px 14px 32px',
          borderRadius: 14,
          textAlign: 'center',
          maxWidth: 1480,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
        }}
      >
        <div
          style={{
            fontSize: 54,
            fontWeight: 800,
            color: COLORS.white,
            lineHeight: 1.22,
            letterSpacing: 1,
          }}
        >
          {active.zh}
        </div>
        {active.en ? (
          <div
            style={{
              fontSize: 27,
              fontWeight: 400,
              color: 'rgba(235, 240, 248, 0.86)',
              lineHeight: 1.3,
              marginTop: 4,
            }}
          >
            {active.en}
          </div>
        ) : null}
      </div>
    </div>
  );
};
