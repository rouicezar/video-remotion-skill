import React from 'react';
import { Sequence, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { GeminiLogo, PythonLogo } from '../design/BrandLogos';
import { COLORS, FONTS, WEIGHTS } from '../design/tokens';
import { CRISP_SPRING, mixRgb, PhysicalGlass3D, Stage } from './index';
import { AgySwarmPromptScene } from '../episodes/agy-slash-commands/Scene04SwarmPrompt';

export const ENGINE_GALLERY_FRAMES = 480;

const GlassMaterialSpecimen: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const cards = [
    {
      num: '01',
      title: '静息磨砂态',
      tag: 'ACTIVE 0.0',
      metric: '16px',
      unit: '实体侧壁',
      active: 0.08,
      accent: [148, 178, 232] as [number, number, number],
      extrudeX: -8,
      tiltY: 5,
      icon: <GeminiLogo size={42} />,
    },
    {
      num: '02',
      title: '琥珀导光态',
      tag: 'ACTIVE 1.0',
      metric: '2.5D',
      unit: '导光厚底座',
      active: 1,
      accent: [245, 166, 35] as [number, number, number],
      extrudeX: 0,
      tiltY: 0,
      icon: <GeminiLogo size={42} />,
    },
    {
      num: '03',
      title: '异主题换肤',
      tag: 'EMERALD THEME',
      metric: '24px+',
      unit: '细体零粘连',
      active: 0.92,
      accent: [52, 211, 153] as [number, number, number],
      extrudeX: 9,
      tiltY: -6,
      icon: <PythonLogo size={42} />,
    },
  ];

  return (
    <Stage
      stepIndex={2}
      totalSteps={4}
      chapterLabel="ENGINE GALLERY · PHYSICAL GLASS 3D"
      subtitles={[{ startSec: 0, endSec: 2, zh: '真 2.5D 实体挤出侧壁 · 3:2 纵向三段舒展比例' }]}
      theme={{ watermark: 'STUDIO' }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 1620,
          height: '100%',
          margin: '0 auto',
          padding: '48px 0 42px',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 28 }}>
          <span style={{ fontFamily: FONTS.display, fontSize: 68, fontWeight: WEIGHTS.light, color: COLORS.white, letterSpacing: 1 }}>
            PhysicalGlass3D
          </span>
          <span style={{ fontSize: 32, fontWeight: WEIGHTS.light, color: '#9BA8BE', letterSpacing: 2.5 }}>
            真 2.5D 实体厚侧壁与黄金空间比例
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 44, perspective: 1500 }}>
          {cards.map((c, i) => {
            const p = spring({ frame: Math.max(0, frame - i * 4), fps, config: CRISP_SPRING });
            return (
              <div
                key={c.num}
                style={{
                  opacity: p,
                  transform: `translate3d(0, ${((1 - p) * 26).toFixed(1)}px, 0) rotateX(6deg) rotateY(${c.tiltY}deg)`,
                }}
              >
                <PhysicalGlass3D
                  active={c.active}
                  accentRgb={c.accent}
                  radius={28}
                  slabPx={16}
                  extrudeX={c.extrudeX}
                  padding="50px 44px 56px"
                  sheenPulse={0.52}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: 340 }}>
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
                          fontSize: 82,
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

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 25, fontWeight: WEIGHTS.light, color: '#7D8CA6', letterSpacing: 2 }}>
          <span>顶面亮棱倒角 · 16px 连续挤出受光侧壁 · 底部悬浮落影</span>
          <span>3:2 画布黄金三段纵深</span>
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
