import React from 'react';
import { Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { COLORS, FONTS } from '../../design/tokens';
import { easeInOutCubic, easeOutQuint, glassSheenStyle, glassSurface, smoothFocusWeight } from '../../design/motion';

const EP1_8_MOVES = [
  { num: '01', title: '世界画布', img: 'assets_v2/pink_xuan.jpg', prompt: '铺一块 #111318 的深色大画布，叠一层很淡的 Xuan 字墙慢慢漂；素材按讲述顺序沿镜头路线摆好' },
  { num: '02', title: '倾斜摆放', img: 'assets_v2/planet_card.jpg', prompt: '每张素材自己斜一点：左右偏 8-18°、上下偏 4-12°，镜头再往反方向偏一点，既有透视感字也看得清' },
  { num: '03', title: '景深分层', img: 'assets_v2/dunhuang_mural.jpg', prompt: '把画面分成近、中、远三层：离焦点越远越虚 0 / 4 / 8px，让观众的视线落在最清楚的那一层' },
  { num: '04', title: '斜向运镜', img: 'assets_v2/pink_xuan.jpg', prompt: '换素材时不硬切，镜头斜着推过去、路上多绕 7-10°；每次切换 0.6-0.9 秒，先慢再快再慢' },
  { num: '05', title: '缓慢推进', img: 'assets_v2/planet_card.jpg', prompt: '停在素材上时不完全静止：镜头每秒往前推 3%、角度慢慢飘半度，几乎感受不到，画面始终在呼吸' },
  { num: '06', title: '走进画面', img: 'assets_v2/dunhuang_walkin.jpg', prompt: '讲流程、时间线时把内容铺成一条路：地面倾 70°，镜头压低俯仰 50°，走到哪一步哪一步亮' },
  { num: '07', title: '背景虚化', img: 'assets_v2/pink_xuan.jpg', prompt: '新内容出现时，原来那一层整体往后退到 94%，同时变虚 4px、变暗到 55%，视线自然落到新内容上' },
  { num: '08', title: '原位放大', img: 'assets_v2/video_wall.jpg', prompt: '从多个内容里挑出重点讲时不切换新画面，让它在原来的位置直接放大 2.4 倍，其余淡化到 30%' },
];

/**
 * True Frosted-Glass 4-Layer Isometric Stack with REAL layered UI content & silky continuous physics
 * (Zero discrete snapping — every layer floats, breathes, and cross-fades glow continuously!)
 */
const FrostedGlassLayerStack: React.FC<{
  localFrame: number;
  compact?: boolean;
}> = ({ localFrame, compact = false }) => {
  const { fps } = useVideoConfig();
  const layers = [
    { idx: 0, num: '1', label: '素材摆在哪' },
    { idx: 1, num: '2', label: '数字和重点' },
    { idx: 2, num: '3', label: '卡片和转场' },
    { idx: 3, num: '4', label: '字和包装' },
  ];

  // Continuous fluid focus wave sweeping 0 -> 3 -> all-lit (NEVER integer Math.floor snapping!)
  const sweepPos = interpolate(localFrame, [10, 120], [0, 3.2], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const allLitBlend = easeInOutCubic((localFrame - 120) / 28);
  const stackBreathY = Math.sin(localFrame * 0.045) * 6;
  const stackRotZ = -21 + Math.sin(localFrame * 0.03) * 2.2;
  const stackRotX = 55 + Math.cos(localFrame * 0.035) * 2.0;
  const rollNum = Math.round(interpolate(localFrame, [0, 90], [221, 290], { extrapolateRight: 'clamp' }));

  const slabW = compact ? 440 : 620;
  const slabH = compact ? 235 : 330;
  const gapZ = compact ? 38 : 54;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: compact ? 0 : 72, position: 'relative' }}>
      {/* Left 4-Layer Indicator Pills (continuous glow + width/scale breathing) */}
      {!compact && (
        <div style={{ display: 'flex', flexDirection: 'column-reverse', gap: 16, zIndex: 20 }}>
          {layers.map((l) => {
            const w = Math.max(smoothFocusWeight(l.idx, sweepPos, 0.95), allLitBlend);
            const pillScale = 1 + w * 0.05;
            return (
              <div
                key={l.num}
                style={{
                  ...glassSurface({ active: w, blurPx: 14, radius: 12, opacity: 0.6 }),
                  padding: '11px 22px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  transform: `translateX(${w * 10}px) scale(${pillScale})`,
                }}
              >
                <span
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 7,
                    backgroundColor: `rgba(245, 166, 35, ${(0.22 + w * 0.78).toFixed(3)})`,
                    color: w > 0.45 ? '#111318' : COLORS.textSecondary,
                    fontFamily: FONTS.display,
                    fontSize: 22,
                    fontWeight: 900,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {l.num}
                </span>
                <span
                  style={{
                    fontSize: 24,
                    fontWeight: 800,
                    color: `rgba(243, 245, 248, ${(0.48 + w * 0.52).toFixed(3)})`,
                  }}
                >
                  {l.label}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Right 3D Isometric Frosted-Glass Stack */}
      <div
        style={{
          position: 'relative',
          width: compact ? 520 : 760,
          height: compact ? 360 : 490,
          perspective: 1250,
          transformStyle: 'preserve-3d',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {layers.map((l) => {
          const dropSpring = spring({
            frame: Math.max(0, localFrame - l.idx * 7),
            fps,
            config: { damping: 16, stiffness: 90, mass: 0.9 },
          });
          const focusW = Math.max(smoothFocusWeight(l.idx, sweepPos, 0.95), allLitBlend * 0.85);
          // Smooth continuous floating elevation when focused + gentle harmonic float
          const floatOffset = Math.sin(localFrame * 0.05 + l.idx * 1.1) * 4;
          const focusLift = focusW * 16;
          const baseTop = (compact ? 185 : 245) - l.idx * gapZ - focusLift + stackBreathY + floatOffset;
          const dropY = interpolate(dropSpring, [0, 1], [-120, 0]);
          const opacity = interpolate(dropSpring, [0, 0.35, 1], [0, 0.7, 1]);

          return (
            <div
              key={l.num}
              style={{
                ...glassSurface({ active: focusW, blurPx: 14, radius: 18, opacity: 0.34 }),
                position: 'absolute',
                width: slabW,
                height: slabH,
                top: baseTop - slabH / 2 + dropY,
                transform: `rotateX(${stackRotX}deg) rotateZ(${stackRotZ}deg) scale(${0.96 + focusW * 0.04})`,
                opacity,
                overflow: 'hidden',
                zIndex: 10 + l.idx,
              }}
            >
              {/* Animated glass specular sheen */}
              <div style={glassSheenStyle(localFrame + l.idx * 35, 0.9)} />

              {/* REAL translucent content inside each frosted glass layer! */}
              {l.idx === 0 && (
                <div style={{ position: 'absolute', inset: 18, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, opacity: 0.72 }}>
                  <div style={{ borderRadius: 10, backgroundColor: 'rgba(30,58,138,0.28)', border: '1px solid rgba(147,197,253,0.3)', padding: 14, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div style={{ fontSize: 13, color: '#93c5fd', fontFamily: FONTS.mono }}>● 原理图 · CANVAS</div>
                    <div style={{ height: 4, width: '70%', borderRadius: 2, backgroundColor: 'rgba(147,197,253,0.45)' }} />
                  </div>
                  <div style={{ borderRadius: 10, backgroundColor: 'rgba(127,29,29,0.24)', border: '1px solid rgba(252,165,165,0.28)', padding: 14, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div style={{ fontSize: 13, color: '#fca5a5', fontFamily: FONTS.mono }}>● 演示层 · SPACE</div>
                    <div style={{ height: 4, width: '55%', borderRadius: 2, backgroundColor: 'rgba(252,165,165,0.4)' }} />
                  </div>
                </div>
              )}

              {l.idx === 1 && (
                <div style={{ position: 'absolute', inset: 22, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                    <span style={{ fontFamily: FONTS.display, fontSize: compact ? 52 : 76, fontWeight: 900, color: COLORS.amber, textShadow: `0 0 24px ${COLORS.amberGlow}` }}>
                      {rollNum}
                    </span>
                    <span style={{ fontSize: 20, color: COLORS.amber, fontWeight: 700 }}>张</span>
                  </div>
                  <div style={{ width: compact ? 110 : 165, height: compact ? 110 : 165, borderRadius: '50%', border: `2px solid rgba(245,166,35,${0.4 + focusW * 0.5})`, boxShadow: `0 0 28px rgba(245,166,35,${0.25 + focusW * 0.35})`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ width: '58%', height: '58%', borderRadius: '50%', border: '1.5px dashed rgba(255,255,255,0.35)' }} />
                  </div>
                </div>
              )}

              {l.idx === 2 && (
                <div style={{ position: 'absolute', inset: 20, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 14 }}>
                  {['assets_v2/pink_xuan.jpg', 'assets_v2/dunhuang_mural.jpg'].map((src, k) => (
                    <div key={k} style={{ width: compact ? 130 : 195, height: compact ? 84 : 124, borderRadius: 10, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.3)', opacity: 0.78 }}>
                      <Img src={staticFile(src)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  ))}
                </div>
              )}

              {l.idx === 3 && (
                <div style={{ position: 'absolute', inset: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ width: 52, height: 52, borderRadius: '50%', overflow: 'hidden', border: `2px solid ${COLORS.amber}` }}>
                    <Img src={staticFile('assets/xuan_orange.jpg')} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div style={{ fontSize: compact ? 22 : 32, fontWeight: 900, color: 'rgba(255,255,255,0.92)', letterSpacing: 2, textShadow: '0 4px 16px rgba(0,0,0,0.6)' }}>
                    一层一层搭起来的
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const Ep1IntroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  if (frame < 120) {
    return (
      <div style={{ position: 'absolute', inset: 0 }}>
        <Img
          src={staticFile(frame < 62 ? 'assets_v2/dunhuang_mural.jpg' : 'assets_v2/intro_arc.jpg')}
          style={{ width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${1 + frame * 0.0018})` }}
        />
      </div>
    );
  }

  if (frame < 200) {
    const pop = spring({ frame: frame - 120, fps, config: { damping: 14, stiffness: 120 } });
    return (
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', paddingBottom: 80 }}>
        <Img src={staticFile('assets_v2/intro_particle_bg.jpg')} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.92 }} />
        <div
          style={{
            ...glassSurface({ active: 0.95, blurPx: 20, radius: 26, opacity: 0.55 }),
            position: 'relative',
            padding: '40px 92px',
            fontSize: 118,
            fontWeight: 900,
            color: COLORS.white,
            letterSpacing: 6,
            transform: `scale(${pop})`,
          }}
        >
          不像 PPT?
        </div>
      </div>
    );
  }

  if (frame < 495) {
    const f = frame - 200;
    // Smooth cross-dissolve & zoom transition from Split Comparison -> Centered 4-Layer Frosted Glass Stack!
    const morphT = easeInOutCubic((f - 125) / 28);
    return (
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', paddingBottom: 85 }}>
        {morphT < 0.98 && (
          <div
            style={{
              position: 'absolute',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 52,
              width: 1480,
              opacity: 1 - morphT,
              transform: `scale(${1 - morphT * 0.06}) translateX(${-morphT * 90}px)`,
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ ...glassSurface({ blurPx: 12, radius: 10, opacity: 0.6 }), alignSelf: 'flex-start', padding: '8px 20px', fontSize: 24, fontWeight: 700 }}>
                一张一张贴上去
              </div>
              <div style={{ ...glassSurface({ blurPx: 14, radius: 16, opacity: 0.55 }), height: 400, overflow: 'hidden', position: 'relative', borderColor: 'rgba(239,83,80,0.6)' }}>
                <Img src={staticFile('assets_v2/pixel_ui.jpg')} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.72 }} />
                <div style={{ position: 'absolute', bottom: 20, right: 20, width: 56, height: 56, borderRadius: '50%', backgroundColor: COLORS.red, color: COLORS.white, fontSize: 28, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  ✕
                </div>
              </div>
              <div style={{ fontSize: 22, color: COLORS.textSecondary }}>平的、停住、硬切</div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ alignSelf: 'flex-start', padding: '8px 20px', borderRadius: 10, backgroundColor: COLORS.amber, color: '#111318', fontSize: 24, fontWeight: 900 }}>
                一层一层搭起来
              </div>
              <div style={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                <FrostedGlassLayerStack localFrame={f} compact />
                {f > 75 && (
                  <div style={{ position: 'absolute', bottom: 16, right: 24, width: 52, height: 52, borderRadius: '50%', backgroundColor: COLORS.green, color: '#111318', fontSize: 28, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 40 }}>
                    ✓
                  </div>
                )}
              </div>
              <div style={{ fontSize: 22, color: COLORS.amber, fontWeight: 700 }}>有前后、有层次、一直在动</div>
            </div>
          </div>
        )}

        {morphT > 0.02 && (
          <div
            style={{
              opacity: morphT,
              transform: `scale(${0.92 + morphT * 0.08})`,
            }}
          >
            <FrostedGlassLayerStack localFrame={Math.max(0, f - 120)} />
          </div>
        )}
      </div>
    );
  }

  if (frame < 880) {
    const f = frame - 495;
    const parts = [
      { ep: '第一期', title: '空间和运镜', img: 'assets_v2/pink_xuan.jpg' },
      { ep: '第二期', title: '数据和聚焦', img: 'assets_v2/planet_card.jpg' },
      { ep: '第三期', title: '卡片和转场', img: 'assets/card_06.jpg' },
      { ep: '第四期', title: '文字和包装', img: 'assets_v2/dunhuang_mural.jpg' },
    ];
    const heroBlend = easeOutQuint((f - 210) / 30);
    return (
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 36, paddingBottom: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <span style={{ fontSize: 48, fontWeight: 900 }}>口播动效讲解技巧</span>
          <span style={{ backgroundColor: COLORS.amber, color: '#111318', padding: '6px 20px', borderRadius: 10, fontSize: 34, fontWeight: 900 }}>共 4 期</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 340px)', gap: 24 }}>
          {parts.map((p, i) => {
            const isHero = i === 0 ? heroBlend : 0;
            const pop = spring({ frame: Math.max(0, f - i * 8), fps, config: { damping: 15, stiffness: 110 } });
            const scale = pop * (1 + isHero * 0.08);
            const dim = i === 0 ? 1 : 1 - heroBlend * 0.45;
            return (
              <div
                key={p.ep}
                style={{
                  ...glassSurface({ active: isHero, blurPx: 16, radius: 18, opacity: 0.65 }),
                  overflow: 'hidden',
                  transform: `translateY(${Math.sin(f * 0.04 + i) * 4 - isHero * 12}px) scale(${scale})`,
                  opacity: dim,
                }}
              >
                <div style={{ height: 210 }}>
                  <Img src={staticFile(p.img)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ padding: '18px 20px' }}>
                  <div style={{ fontSize: 20, fontWeight: 800, color: COLORS.amber }}>{p.ep}</div>
                  <div style={{ fontSize: 32, fontWeight: 900, color: COLORS.white, marginTop: 4 }}>{p.title}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (frame < 1260) {
    const f = frame - 880;
    const camBlend = easeInOutCubic((f - 110) / 24);
    return (
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 28, paddingBottom: 100 }}>
        <div style={{ display: 'flex', gap: 14 }}>
          <div style={{ ...glassSurface({ active: 1 - camBlend, blurPx: 12, radius: 12 }), padding: '10px 26px', fontSize: 28, fontWeight: 900, color: camBlend < 0.5 ? COLORS.amber : COLORS.textSecondary }}>
            素材摆在哪
          </div>
          <div style={{ ...glassSurface({ active: camBlend, blurPx: 12, radius: 12 }), padding: '10px 26px', fontSize: 28, fontWeight: 900, color: camBlend >= 0.5 ? COLORS.amber : COLORS.textSecondary }}>
            镜头怎么走
          </div>
        </div>
        <div style={{ ...glassSurface({ active: 0.4, blurPx: 16, radius: 18 }), width: 1320, height: 560, overflow: 'hidden' }}>
          <Img
            src={staticFile(f > 210 ? 'assets_v2/dunhuang_mural.jpg' : 'assets_v2/video_wall.jpg')}
            style={{ width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${1 + f * 0.0005})` }}
          />
        </div>
      </div>
    );
  }

  const f = frame - 1260;
  const calloutT = easeOutQuint((f - 155) / 22);
  return (
    <div style={{ position: 'absolute', inset: '90px 150px 180px 150px', display: 'flex', flexDirection: 'column', gap: 22 }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <div style={{ backgroundColor: COLORS.amber, color: '#111318', padding: '8px 24px', borderRadius: 12, fontSize: 34, fontWeight: 900 }}>
          共 8 招
        </div>
      </div>
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, opacity: 1 - calloutT * 0.65, filter: `blur(${calloutT * 3}px)` }}>
        {EP1_8_MOVES.map((m, i) => (
          <div key={m.num} style={{ ...glassSurface({ active: i === 3 ? 0.8 : 0, blurPx: 14, radius: 14 }), overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <Img src={staticFile(m.img)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'baseline', gap: 10 }}>
              <span style={{ fontFamily: FONTS.display, fontSize: 32, fontWeight: 900, color: COLORS.amber }}>{m.num}</span>
              <span style={{ fontSize: 24, fontWeight: 800 }}>{m.title}</span>
            </div>
          </div>
        ))}
      </div>

      {calloutT > 0.02 && (
        <div
          style={{
            ...glassSurface({ active: 0.95, blurPx: 24, radius: 18, opacity: 0.85 }),
            position: 'absolute',
            left: '50%',
            top: '52%',
            transform: `translate(-50%, -50%) scale(${0.92 + calloutT * 0.08})`,
            opacity: calloutT,
            width: 960,
            padding: '28px 36px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
            <span style={{ backgroundColor: COLORS.amber, color: '#111318', padding: '4px 12px', borderRadius: 6, fontSize: 18, fontWeight: 900 }}>怎么跟 AI 说</span>
            <span style={{ fontSize: 20, fontWeight: 700, color: COLORS.textSecondary }}>04 斜向运镜</span>
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, color: COLORS.white, lineHeight: 1.55 }}>
            镜头从这一张素材斜着推到下一张，用 0.6–0.9 秒，先慢、再快、再慢；路上多绕 7–10°，推进去之前先往后拉一点。
          </div>
        </div>
      )}
    </div>
  );
};

export const Ep1OutroScene: React.FC = () => {
  const frame = useCurrentFrame();

  if (frame < 220) {
    return (
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 28, paddingBottom: 110 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <span style={{ fontFamily: FONTS.display, fontSize: 140, fontWeight: 900, color: COLORS.amber, lineHeight: 0.9 }}>8</span>
          <div>
            <div style={{ fontSize: 26, color: COLORS.amber, fontWeight: 700 }}>总结</div>
            <div style={{ fontSize: 64, fontWeight: 900 }}>8 招回顾</div>
            <div style={{ fontFamily: FONTS.mono, fontSize: 16, letterSpacing: 4, color: COLORS.textMuted }}>RECAP</div>
          </div>
        </div>
        {frame > 95 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ padding: '10px 28px', borderRadius: 99, background: 'linear-gradient(90deg, #8b5cf6, #ec4899)', fontSize: 28, fontWeight: 900 }}>✦ 特效</span>
            <span style={{ width: 42, height: 42, borderRadius: '50%', backgroundColor: COLORS.red, color: COLORS.white, fontSize: 24, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</span>
          </div>
        )}
      </div>
    );
  }

  const f = frame - 220;
  const focusPos = interpolate(f, [40, 120], [0, 3], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const showSent = f > 170;

  return (
    <div style={{ ...glassSurface({ active: 0.35, blurPx: 22, radius: 22, opacity: 0.78 }), position: 'absolute', inset: '52px 140px 168px 140px', padding: '22px 32px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={glassSheenStyle(frame, 0.3)} />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 14 }}>
          <span style={{ fontFamily: FONTS.display, fontSize: 60, fontWeight: 900, color: COLORS.amber, lineHeight: 0.9 }}>8</span>
          <span style={{ fontSize: 38, fontWeight: 900 }}>招 · AI 描述词</span>
          <span style={{ fontFamily: FONTS.mono, fontSize: 16, color: COLORS.textMuted, letterSpacing: 2 }}>PROMPTS · 截图就能用</span>
        </div>
        <div style={{ padding: '8px 20px', borderRadius: 10, border: `1.5px solid ${COLORS.green}`, color: COLORS.green, fontSize: 20, fontWeight: 800 }}>
          评论区置顶也有 ✓
        </div>
      </div>

      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {EP1_8_MOVES.map((m, i) => {
          const w = f > 35 ? smoothFocusWeight(i, focusPos, 0.9) : 0;
          return (
            <div key={m.num} style={{ ...glassSurface({ active: w, blurPx: 14, radius: 14, opacity: 0.55 }), padding: '14px 18px', display: 'flex', gap: 16, alignItems: 'center', transform: `scale(${1 + w * 0.02})` }}>
              <div style={{ width: 106, height: 68, borderRadius: 8, overflow: 'hidden', flexShrink: 0 }}>
                <Img src={staticFile(m.img)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ backgroundColor: COLORS.amber, color: '#111318', fontFamily: FONTS.display, fontWeight: 900, fontSize: 20, padding: '1px 7px', borderRadius: 5 }}>{m.num}</span>
                  <span style={{ fontSize: 22, fontWeight: 800 }}>{m.title}</span>
                </div>
                <div style={{ fontSize: 15, color: COLORS.textSecondary, lineHeight: 1.4 }}>{m.prompt}</div>
              </div>
            </div>
          );
        })}
      </div>

      {f > 110 && (
        <div style={{ marginTop: 14, alignSelf: 'center', width: 780, padding: '11px 18px', borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.95)', color: '#111318', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 14px 40px rgba(0,0,0,0.55)' }}>
          <div style={{ fontSize: 22, fontWeight: 700 }}>{showSent ? '已发送 · 我想先试第 4 招：斜向运镜' : '我想先试第 4 招：斜向运镜...'}</div>
          <div style={{ padding: '7px 20px', borderRadius: 10, backgroundColor: showSent ? COLORS.green : COLORS.amber, color: '#111318', fontSize: 20, fontWeight: 900 }}>{showSent ? '✓' : '发送'}</div>
        </div>
      )}
    </div>
  );
};
