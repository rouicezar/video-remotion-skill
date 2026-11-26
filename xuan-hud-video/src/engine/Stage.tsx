import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { COLORS, FONTS, WEIGHTS } from '../design/tokens';
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
  const watermark = theme?.watermark;

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        // 纯中性深炭黑工作室底色（R≈G≈B）：彻底清除左上蓝雾与右下橙雾，杜绝任何背景彩光污染前景组件
        backgroundColor: '#0A0B0D',
        backgroundImage:
          'radial-gradient(ellipse 76% 68% at 50% 42%, #15171B 0%, #0D0E11 62%, #08090B 100%)',
        fontFamily: FONTS.sans,
        fontWeight: WEIGHTS.light,
        fontSynthesis: 'none',
        WebkitFontSmoothing: 'antialiased',
        MozOsxFontSmoothing: 'grayscale',
        color: COLORS.white,
        boxSizing: 'border-box',
      }}
    >
      {/* Plane 1A: 远景 68° 纯中性白灰透视地面网格（零蓝色偏） */}
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
          opacity: 0.34,
        }}
      >
        <div
          style={{
            width: '100%',
            height: '100%',
            transform: 'rotateX(68deg)',
            transformOrigin: 'center bottom',
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.11) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.11) 1px, transparent 1px)',
            backgroundSize: '76px 76px',
            WebkitMaskImage: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.24) 55%, transparent 92%)',
            maskImage: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.24) 55%, transparent 92%)',
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
                fontWeight: WEIGHTS.medium,
                color: 'transparent',
                WebkitTextStroke: '1px rgba(255,255,255,0.85)',
                letterSpacing: 6,
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
              fontWeight: WEIGHTS.regular,
              color: '#C8D3E6',
              letterSpacing: 2,
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
                  height: 3,
                  borderRadius: 3,
                  backgroundColor:
                    w === 0
                      ? 'rgba(255,255,255,0.14)'
                      : mixRgb([120, 95, 48], accent, w),
                  boxShadow: s === stepIndex ? `0 0 12px rgba(${ar},${ag},${ab},0.55)` : 'none',
                }}
              />
            );
          })}
        </div>
        <div style={{ fontFamily: FONTS.mono, fontSize: 24, fontWeight: WEIGHTS.light, color: '#9BA8BE', letterSpacing: 1.5 }}>
          {String(stepIndex).padStart(2, '0')} / {String(totalSteps).padStart(2, '0')}
        </div>
      </div>

      {/* 主舞台安全区 */}
      <div style={{ position: 'absolute', top: 96, left: 72, right: 72, bottom: 148, boxSizing: 'border-box' }}>
        {children}
      </div>

      {/* 底部全局字幕（54px 细常规白体，干净通透不糊边） */}
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
              backgroundColor: 'rgba(12, 15, 22, 0.82)',
              border: '1.5px solid rgba(255,255,255,0.11)',
              padding: '12px 38px',
              borderRadius: 16,
              fontSize: 54,
              fontWeight: WEIGHTS.regular,
              color: '#F4F7FC',
              letterSpacing: 1.8,
              maxWidth: 1740,
              textAlign: 'center',
              boxShadow: '0 10px 32px rgba(0,0,0,0.42)',
            }}
          >
            {activeSub.zh}
          </div>
        </div>
      )}
    </div>
  );
};
