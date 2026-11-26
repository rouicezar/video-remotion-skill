import React from 'react';
import { Sequence, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { GeminiLogo, PythonLogo } from '../design/BrandLogos';
import { COLORS, FONTS, WEIGHTS } from '../design/tokens';
import { CRISP_SPRING, mixRgb, PhysicalGlass3D, Stage } from './index';
import { AgySwarmPromptScene } from '../episodes/agy-slash-commands/Scene04SwarmPrompt';

/**
 * 引擎组件画廊（EngineGallery）：
 * Frame 0..59   ：三态 `<PhysicalGlass3D>` 材质与多主题强调色对比（静息 / 半激活 / 满激活蚀刻扫光）
 * Frame 60..476 ：单源示范章节 `AgySwarmPromptScene`（可抽帧验收各微拍点亮态）
 */
export const ENGINE_GALLERY_FRAMES = 480;

const GlassMaterialSpecimen: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const cards = [
    {
      num: '01',
      title: '静息磨砂态',
      tag: 'ACTIVE 0.0',
      metric: '6px',
      unit: '厚底切边',
      active: 0,
      accent: [245, 166, 35] as [number, number, number],
      icon: <GeminiLogo size={42} />,
    },
    {
      num: '02',
      title: '琥珀聚焦态',
      tag: 'ACTIVE 1.0',
      metric: 'z-10',
      unit: '顶层扫光',
      active: 1,
      accent: [245, 166, 35] as [number, number, number],
      icon: <GeminiLogo size={42} />,
    },
    {
      num: '03',
      title: '异主题换肤',
      tag: 'EMERALD THEME',
      metric: '24px+',
      unit: '零小字底线',
      active: 0.9,
      accent: [52, 211, 153] as [number, number, number],
      icon: <PythonLogo size={42} />,
    },
  ];

  return (
    <Stage
      stepIndex={2}
      totalSteps={4}
      chapterLabel="ENGINE GALLERY · PHYSICAL GLASS 3D"
      subtitles={[{ startSec: 0, endSec: 2, zh: '真蚀刻 3D 磨砂玻璃 · 噪点层 + 文字上方折射扫光' }]}
      theme={{ watermark: 'STUDIO' }}
    >
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: 40,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 24 }}>
          <span style={{ fontFamily: FONTS.display, fontSize: 62, fontWeight: WEIGHTS.light, color: COLORS.white, letterSpacing: 1 }}>
            PhysicalGlass3D
          </span>
          <span style={{ fontSize: 30, fontWeight: WEIGHTS.light, color: '#9BA8BE', letterSpacing: 2 }}>
            材质基线与多主题换肤
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 32, perspective: 1400 }}>
          {cards.map((c, i) => {
            const p = spring({ frame: Math.max(0, frame - i * 4), fps, config: CRISP_SPRING });
            return (
              <div
                key={c.num}
                style={{
                  opacity: p,
                  transform: `translate3d(0, ${((1 - p) * 26).toFixed(1)}px, 0) rotateY(${(i - 1) * -5}deg)`,
                }}
              >
                <PhysicalGlass3D
                  active={c.active}
                  accentRgb={c.accent}
                  radius={26}
                  padding="38px 36px"
                  sheenPulse={0.52}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span
                        style={{
                          fontFamily: FONTS.mono,
                          fontSize: 24,
                          fontWeight: WEIGHTS.regular,
                          letterSpacing: 1.8,
                          color: mixRgb([162, 176, 200], c.accent, 0.3 + c.active * 0.7),
                        }}
                      >
                        {c.num} · {c.tag}
                      </span>
                      {c.icon}
                    </div>
                    <div style={{ fontSize: 48, fontWeight: WEIGHTS.regular, color: '#F4F7FC', letterSpacing: 2 }}>
                      {c.title}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 16 }}>
                      <span
                        style={{
                          fontFamily: FONTS.display,
                          fontSize: 78,
                          fontWeight: WEIGHTS.light,
                          fontVariantNumeric: 'tabular-nums',
                          letterSpacing: -1,
                          color: mixRgb([232, 238, 248], c.accent, c.active),
                          lineHeight: 0.95,
                        }}
                      >
                        {c.metric}
                      </span>
                      <span style={{ fontSize: 28, fontWeight: WEIGHTS.light, color: '#A8B5CA', letterSpacing: 1.5 }}>
                        {c.unit}
                      </span>
                    </div>
                  </div>
                </PhysicalGlass3D>
              </div>
            );
          })}
        </div>
      </div>
    </Stage>
  );
};

export const EngineGallery: React.FC = () => {
  return (
    <>
      <Sequence from={0} durationInFrames={60}>
        <GlassMaterialSpecimen />
      </Sequence>
      <Sequence from={60} durationInFrames={ENGINE_GALLERY_FRAMES - 60}>
        <AgySwarmPromptScene />
      </Sequence>
    </>
  );
};
