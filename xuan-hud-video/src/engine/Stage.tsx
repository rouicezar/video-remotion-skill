import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { COLORS, FONTS } from '../design/tokens';
import { SubtitleCue } from '../types/timeline';
import { mixRgb, Rgb } from './motion';

export interface StageTheme {
  accentRgb?: Rgb;
  coolGlowRgba?: string;
  warmGlowRgba?: string;
  watermark?: string;
  brandIcon?: React.ReactNode;
}

export interface StageProps {
  stepIndex: number;
  totalSteps: number;
  chapterLabel: string;
  subtitles?: SubtitleCue[];
  theme?: StageTheme;
  children: React.ReactNode;
}

/**
 * 剧集无关三层空间舞台（3:2 逻辑 1920×1280）：
 * - Plane 1：深蓝暗调底色 + 静止冷暖双光源（消除逐帧全画幅重绘导致的码率暴涨）+ 68° 透视地面网格 + 中央径向遮罩减淡水印
 * - Top Hairline：参数化品牌图标、章节标签与 N 段进度条（零字号 < 24px）
 * - Bottom Subtitle：56px 粗白体单行安全字幕
 */
export const Stage: React.FC<StageProps> = ({
  stepIndex,
  totalSteps,
  chapterLabel,
  subtitles = [],
  theme,
  children,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sec = frame / fps;
  const activeSub = subtitles.find((s) => sec >= s.startSec && sec <= s.endSec);

  const accent: Rgb = theme?.accentRgb ?? [245, 166, 35];
  const [ar, ag, ab] = accent;
  const coolGlow = theme?.coolGlowRgba ?? 'rgba(62, 102, 180, 0.24)';
  const warmGlow = theme?.warmGlowRgba ?? `rgba(${ar}, ${ag}, ${ab}, 0.15)`;
  const watermark = theme?.watermark;

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: '#0C1018',
        backgroundImage: [
          `radial-gradient(ellipse 62% 52% at 22% 24%, ${coolGlow} 0%, transparent 66%)`,
          `radial-gradient(ellipse 58% 50% at 78% 70%, ${warmGlow} 0%, transparent 62%)`,
          'radial-gradient(ellipse 88% 78% at 50% 48%, #151B28 0%, #0C1018 70%, #07090E 100%)',
        ].join(', '),
        fontFamily: FONTS.sans,
        color: COLORS.white,
        boxSizing: 'border-box',
      }}
    >
      {/* Plane 1A: 远景 68° 透视地面网格（静止，编码器友好） */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          left: '-20%',
          right: '-20%',
          bottom: -140,
          height: 620,
          perspective: 900,
          pointerEvents: 'none',
          opacity: 0.4,
        }}
      >
        <div
          style={{
            width: '100%',
            height: '100%',
            transform: 'rotateX(68deg)',
            transformOrigin: 'center bottom',
            backgroundImage:
              'linear-gradient(rgba(148,175,220,0.16) 1px, transparent 1px), linear-gradient(90deg, rgba(148,175,220,0.16) 1px, transparent 1px)',
            backgroundSize: '76px 76px',
            WebkitMaskImage: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.26) 55%, transparent 92%)',
            maskImage: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.26) 55%, transparent 92%)',
          }}
        />
      </div>

      {/* Plane 1B: 暗调点阵（中央主体区柔和压暗） */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.06) 1.1px, transparent 1.1px)',
          backgroundSize: '48px 48px',
          opacity: 0.44,
          pointerEvents: 'none',
        }}
      />

      {/* Plane 1C: 可选背景描边水印（避开顶底栏并在中央主体区径向遮罩减淡，零穿透毛玻璃文字） */}
      {watermark && (
        <div
          aria-hidden
          style={{
            position: 'absolute',
            top: 104,
            bottom: 148,
            left: 0,
            right: 0,
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gridAutoRows: '340px',
            columnGap: 120,
            opacity: 0.026,
            pointerEvents: 'none',
            WebkitMaskImage:
              'radial-gradient(ellipse 58% 54% at 50% 50%, rgba(0,0,0,0.06) 0%, rgba(0,0,0,0.32) 60%, rgba(0,0,0,0.9) 100%)',
            maskImage:
              'radial-gradient(ellipse 58% 54% at 50% 50%, rgba(0,0,0,0.06) 0%, rgba(0,0,0,0.32) 60%, rgba(0,0,0,0.9) 100%)',
          }}
        >
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transform: 'skewX(-10deg)',
                fontSize: 88,
                fontWeight: 900,
                color: 'transparent',
                WebkitTextStroke: '2px rgba(255,255,255,0.9)',
                whiteSpace: 'nowrap',
              }}
            >
              {watermark}
            </div>
          ))}
        </div>
      )}

      {/* 顶部进度细栏（最小字号 24px，符合 Gate 2） */}
      <div
        style={{
          position: 'absolute',
          top: 34,
          left: 72,
          right: 72,
          display: 'flex',
          alignItems: 'center',
          gap: 22,
          zIndex: 30,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
          {theme?.brandIcon}
          <span
            style={{
              fontFamily: FONTS.mono,
              fontSize: 24,
              fontWeight: 800,
              color: '#D6DFEE',
              letterSpacing: 1,
            }}
          >
            {chapterLabel}
          </span>
        </div>
        <div style={{ flex: 1, display: 'flex', gap: 10 }}>
          {Array.from({ length: Math.max(1, totalSteps) }).map((_, idx) => {
            const s = idx + 1;
            const w = s === stepIndex ? 1 : s < stepIndex ? 0.45 : 0;
            return (
              <div
                key={s}
                style={{
                  flex: 1,
                  height: 4,
                  borderRadius: 3,
                  backgroundColor:
                    w === 0
                      ? 'rgba(255,255,255,0.16)'
                      : mixRgb([120, 95, 48], accent, w),
                  boxShadow: s === stepIndex ? `0 0 14px rgba(${ar},${ag},${ab},0.65)` : 'none',
                }}
              />
            );
          })}
        </div>
        <div style={{ fontFamily: FONTS.mono, fontSize: 24, fontWeight: 800, color: '#B2BED2' }}>
          {String(stepIndex).padStart(2, '0')} / {String(totalSteps).padStart(2, '0')}
        </div>
      </div>

      {/* 主舞台安全区 */}
      <div style={{ position: 'absolute', top: 96, left: 72, right: 72, bottom: 148, boxSizing: 'border-box' }}>
        {children}
      </div>

      {/* 底部全局字幕（56px 粗白体，符合 Gate 2 54–58px 区间） */}
      {activeSub && (
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 30,
            display: 'flex',
            justifyContent: 'center',
            zIndex: 50,
            pointerEvents: 'none',
          }}
        >
          <div
            style={{
              backgroundColor: 'rgba(12, 15, 22, 0.88)',
              border: '2px solid rgba(255,255,255,0.14)',
              padding: '12px 38px',
              borderRadius: 16,
              fontSize: 56,
              fontWeight: 900,
              color: COLORS.white,
              letterSpacing: 1,
              maxWidth: 1740,
              textAlign: 'center',
              boxShadow: '0 10px 34px rgba(0,0,0,0.48)',
            }}
          >
            {activeSub.zh}
          </div>
        </div>
      )}
    </div>
  );
};
