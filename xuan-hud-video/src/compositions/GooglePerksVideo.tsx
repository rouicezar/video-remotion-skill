import React from 'react';
import { Audio, Img, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { HudFrame, SubtitleOverlay, WorldCanvas } from '../design/Chrome';
import { COLORS, FONTS, FPS } from '../design/tokens';
import {
  easeInOutCubic,
  easeOutQuint,
  glassSheenStyle,
  glassSurface,
  smoothFocusWeight,
  smoothSceneEnvelope,
} from '../design/motion';
import {
  AppleLogo,
  DeepSeekLogo,
  GeminiLogo,
  GoogleAIStudioLogo,
  GoogleFlowLogo,
  GoogleGLogo,
  GoogleOneLogo,
} from '../design/BrandLogos';
import { GOOGLE_PERKS_SUBTITLES } from '../data/googlePerksSubtitles';
import { MoveBumperScene } from '../components/scenes/ChapterAndBumper';

const f = (sec: number) => Math.round(sec * FPS);
export const GOOGLE_PERKS_TOTAL_FRAMES = 1432; // 47.72s @ 30fps

/**
 * Ultra-clear smoked crystal glass slab
 */
const crystalGlass = (active = 0, radius = 18): React.CSSProperties => ({
  ...glassSurface({ active, blurPx: 12, radius, opacity: 0.26 + active * 0.12 }),
  backgroundImage: `linear-gradient(135deg, rgba(255,255,255,${(0.14 + active * 0.08).toFixed(3)}) 0%, rgba(160,180,220,0.04) 45%, rgba(245,166,35,${(0.03 + active * 0.14).toFixed(3)}) 100%)`,
});

/**
 * Reusable Official Website Evidence Badge (shows source domain cleanly)
 */
const OfficialSourcePill: React.FC<{ domain: string; logo?: React.ReactNode }> = ({ domain, logo }) => (
  <div
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8,
      padding: '4px 12px',
      borderRadius: 999,
      backgroundColor: 'rgba(13, 16, 22, 0.84)',
      border: '1px solid rgba(255,255,255,0.22)',
      fontFamily: FONTS.mono,
      fontSize: 15,
      fontWeight: 700,
      color: COLORS.textPrimary,
      backdropFilter: 'blur(8px)',
    }}
  >
    {logo}
    <span>{domain}</span>
    <span style={{ color: COLORS.green, fontSize: 13 }}>● OFFICIAL</span>
  </div>
);

const SceneWrap: React.FC<{ durationInFrames: number; children: React.ReactNode }> = ({
  durationInFrames,
  children,
}) => {
  const frame = useCurrentFrame();
  const env = smoothSceneEnvelope(frame, durationInFrames, 16, 14);
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        opacity: env.opacity,
        transform: `translateY(${env.translateY}px) scale(${env.scale})`,
      }}
    >
      {children}
    </div>
  );
};

/* ============================================================================
 * BEATS 01–03 (00:00.0 – 00:06.1): Official Google AI Plans + Brand Logos -> $100+ -> Smooth Alert (NO SHAKE)
 * ==========================================================================*/
const Beats01to03Hook: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Gentle cinematic easing (24 frames = 0.8s, never rushed!)
  const beat2T = easeInOutCubic((frame - 68) / 24);
  const beat3T = easeInOutCubic((frame - 122) / 22);
  const roll100 = Math.round(interpolate(frame, [72, 122], [0, 100], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }));
  const impactPct = interpolate(frame, [122, 162], [95, 10], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const meterRevealT = easeOutQuint((frame - 86) / 20);
  const badgeRevealT = easeOutQuint((frame - 134) / 20);
  const officialProofIn = easeOutQuint((frame - 6) / 22);

  const plans = [
    { name: 'Google AI Pro', badge: 'PRO', price: '$10 / 月赠送', color: '#74B3F5', logo: <GeminiLogo size={34} /> },
    { name: 'Google AI 5X', badge: '5X', price: '$40 / 月赠送', color: '#f5a623', logo: <GoogleGLogo size={32} /> },
    { name: 'Google AI Ultra', badge: '20X', price: '$100 / 月赠送', color: '#34d399', logo: <GoogleOneLogo size={34} /> },
  ];

  const camBreath = 1 + frame * 0.00035;

  return (
    <SceneWrap durationInFrames={dur}>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', perspective: 1300, paddingBottom: 110 }}>
        {/* Official Google AI Plans Website Evidence Backdrop Strip */}
        <div
          style={{
            position: 'absolute',
            top: 44,
            width: 1120,
            opacity: officialProofIn * (1 - beat2T * 0.78),
            transform: `translateY(${(1 - officialProofIn) * -18 - beat2T * 45}px) scale(${0.96 + officialProofIn * 0.04})`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <OfficialSourcePill domain="one.google.com/about/google-ai-plans" logo={<GoogleGLogo size={18} />} />
          <div
            style={{
              width: 1060,
              height: 295,
              borderRadius: 18,
              overflow: 'hidden',
              border: '1.5px solid rgba(255,255,255,0.22)',
              boxShadow: '0 18px 50px rgba(0,0,0,0.55)',
              position: 'relative',
            }}
          >
            <Img
              src={staticFile('assets_google/crop_ai_plans_cards.png')}
              style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top', opacity: 0.92 }}
            />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(17,19,24,0.06) 0%, rgba(17,19,24,0.55) 100%)' }} />
          </div>
        </div>

        {/* Beat 01: 3 Subscription Cards enter sequentially in front of official proof */}
        <div
          style={{
            marginTop: 225,
            display: 'flex',
            gap: 32,
            transform: `scale(${(1 - beat2T * 0.14) * camBreath}) translateY(${-beat2T * 185}px) rotateX(${beat2T * 14}deg)`,
            opacity: 1 - beat2T * 0.78,
          }}
        >
          {plans.map((p, i) => {
            const dealP = spring({ frame: Math.max(0, frame - 8 - i * 10), fps, config: { damping: 20, stiffness: 82 } });
            const arcY = Math.sin(Math.min(1, dealP) * Math.PI) * -55;
            const x = interpolate(dealP, [0, 1], [-240, 0]);
            const y = interpolate(dealP, [0, 1], [110, 0]) + arcY + Math.sin(frame * 0.045 + i) * 3.5;
            const rotY = (i - 1) * -8;
            return (
              <div
                key={p.name}
                style={{
                  ...crystalGlass(i === 1 ? 0.78 : 0.3, 20),
                  width: 420,
                  height: 225,
                  padding: '24px 28px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  position: 'relative',
                  overflow: 'hidden',
                  transform: `translate(${x}px, ${y}px) rotateY(${rotY}deg) scale(${0.86 + dealP * 0.14})`,
                  opacity: dealP,
                }}
              >
                <div style={glassSheenStyle(frame + i * 25, 0.85)} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    {p.logo}
                    <span style={{ backgroundColor: p.color, color: '#111318', padding: '4px 16px', borderRadius: 8, fontFamily: FONTS.mono, fontWeight: 900, fontSize: 22 }}>
                      {p.badge}
                    </span>
                  </div>
                  <span style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: p.color, boxShadow: `0 0 14px ${p.color}` }} />
                </div>
                <div>
                  <div style={{ fontSize: 38, fontWeight: 900, color: COLORS.white }}>{p.name}</div>
                  <div style={{ fontSize: 24, fontWeight: 700, color: COLORS.textSecondary, marginTop: 6 }}>{p.price}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Beat 02 & 03: Large Mobile-Friendly Value Card + Official Brand Lockup + Sequential Right Meter */}
        {beat2T > 0.02 && (
          <div
            style={{
              position: 'absolute',
              display: 'flex',
              alignItems: 'center',
              gap: 54,
              opacity: beat2T,
              transform: `scale(${0.9 + beat2T * 0.1 + beat3T * 0.025})`,
            }}
          >
            <div
              style={{
                ...crystalGlass(beat3T > 0.4 ? 0.25 : 0.9, 28),
                width: 920,
                height: 415,
                padding: '36px 54px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                position: 'relative',
                overflow: 'hidden',
                borderColor: beat3T > 0.35 ? 'rgba(239, 83, 80, 0.85)' : COLORS.amberBorder,
                boxShadow:
                  beat3T > 0.35
                    ? '0 0 70px rgba(239, 83, 80, 0.38), 0 24px 60px rgba(0,0,0,0.55)'
                    : undefined,
              }}
            >
              <div style={glassSheenStyle(frame, 1.0)} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 10 }}>
                <GoogleGLogo size={32} />
                <GeminiLogo size={32} />
                <span style={{ fontFamily: FONTS.mono, fontSize: 22, letterSpacing: 4, color: COLORS.textSecondary, fontWeight: 700 }}>
                  GOOGLE AI PRO · OFFICIAL PERKS
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 16 }}>
                <span
                  style={{
                    fontFamily: FONTS.display,
                    fontSize: 185,
                    fontWeight: 900,
                    color: beat3T > 0.4 ? COLORS.red : COLORS.amber,
                    lineHeight: 0.88,
                    textShadow: `0 0 60px ${beat3T > 0.4 ? 'rgba(239,83,80,0.5)' : COLORS.amberGlow}`,
                  }}
                >
                  ${roll100}+
                </span>
                <span style={{ fontSize: 52, fontWeight: 900, color: COLORS.white }}>隐藏福利</span>
              </div>

              {badgeRevealT > 0.02 && (
                <div
                  style={{
                    marginTop: 22,
                    padding: '12px 36px',
                    borderRadius: 14,
                    backgroundColor: COLORS.red,
                    color: COLORS.white,
                    fontSize: 36,
                    fontWeight: 900,
                    letterSpacing: 2,
                    opacity: badgeRevealT,
                    transform: `translateY(${(1 - badgeRevealT) * 18}px)`,
                    boxShadow: '0 0 42px rgba(239,83,80,0.55)',
                  }}
                >
                  不领就真的亏大了
                </div>
              )}
            </div>

            {/* Right Value Meter enters sequentially after card settles */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, opacity: meterRevealT, transform: `translateX(${(1 - meterRevealT) * 28}px)` }}>
              <div style={{ fontSize: 26, fontWeight: 900, color: beat3T > 0.35 ? COLORS.red : COLORS.amber }}>剩余价值</div>
              <div style={{ ...crystalGlass(0.25, 28), width: 64, height: 300, padding: 7, display: 'flex', alignItems: 'flex-end' }}>
                <div
                  style={{
                    width: '100%',
                    height: `${impactPct}%`,
                    borderRadius: 22,
                    backgroundColor: impactPct < 45 ? COLORS.red : COLORS.amber,
                    boxShadow: `0 0 24px ${impactPct < 45 ? 'rgba(239,83,80,0.55)' : COLORS.amberGlow}`,
                  }}
                />
              </div>
              <div style={{ fontFamily: FONTS.mono, fontSize: 34, fontWeight: 900, color: impactPct < 45 ? COLORS.red : COLORS.amber }}>
                {Math.round(impactPct)}%
              </div>
            </div>
          </div>
        )}
      </div>
    </SceneWrap>
  );
};

/* ============================================================================
 * BEATS 04–06 (00:05.87 – 00:16.5): $1,000+ Bundle -> Sequential Drop & Gather -> 3-Col Roadmap w/ Official Logos
 * ==========================================================================*/
const Beats04to06BundleAndPick3: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const roll1000 = Math.round(interpolate(frame, [14, 118], [100, 1000], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }));
  const gatherP = easeInOutCubic((frame - 142) / 28); // silky 0.93s gather
  const ejectT = Math.max(0, (frame - 175) / 34); // gentle gravity exit
  const roadmapT = easeInOutCubic((frame - 228) / 26);

  const extraPerks = ['Cloud Credit', 'NotebookLM', 'Workspace AI', 'Colab GPU', 'Project Genie'];
  const keep3 = [
    { num: '01', title: '会员赠送金', sub: '每月 $10–$100', color: '#f5a623', logo: <GoogleAIStudioLogo size={38} /> },
    { num: '02', title: '谷歌 Flow', sub: '电影级视频·0 Token', color: '#74B3F5', logo: <GoogleFlowLogo size={38} /> },
    { num: '03', title: '5TB 空间', sub: 'Google One 云盘', color: '#34d399', logo: <GoogleOneLogo size={38} /> },
  ];

  const phaseStatus = frame < 142 ? 'BUNDLE $1000+' : frame < 228 ? 'KEEP 3' : 'ROADMAP';

  return (
    <SceneWrap durationInFrames={dur}>
      <HudFrame
        moveIndex={1}
        totalMoves={3}
        titleZh="谷歌订阅隐藏福利包"
        titleEn="DROP & GATHER · TOP 3"
        cameraMoving={false}
        status={phaseStatus}
        metrics={[
          { labelEn: 'TOTAL VALUE', labelZh: '福利总价值', value: `$${roll1000.toLocaleString()}+`, accent: true },
          { labelEn: 'SELECTED', labelZh: '精选重点', value: frame < 142 ? '8 → 3' : '3 / 3' },
          { labelEn: 'OFFICIAL', labelZh: '官方订阅', value: 'Google One' },
        ]}
        graphMode="curve"
        graphProgress={Math.min(1, frame / 230)}
        promptTokens={[
          { text: '合计 ' },
          { text: '$1,000+ 福利包', highlight: true },
          { text: ' 精选 ' },
          { text: '3 个最高价值权益', highlight: true },
          { text: '：会员赠送金 · 谷歌 Flow · 5TB 空间' },
        ]}
        promptLabel="核心要点"
        promptBadge="SUMMARY"
        promptStartFrame={115}
      >
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
          {/* Subtle official Google AI Plans texture behind the bundle */}
          <Img
            src={staticFile('assets_google/crop_ai_plans_cards.png')}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              opacity: 0.14 * (1 - roadmapT * 0.45),
              filter: 'blur(2px)',
            }}
          />

          {/* Top glowing banner with official Google G logo */}
          <div style={{ position: 'absolute', top: 20, left: '50%', transform: 'translateX(-50%)', display: 'flex', alignItems: 'center', gap: 14, zIndex: 30 }}>
            <div style={{ backgroundColor: COLORS.amber, color: '#111318', padding: '8px 26px', borderRadius: 10, fontSize: 26, fontWeight: 900, display: 'flex', alignItems: 'center', gap: 10 }}>
              <GoogleGLogo size={24} />
              <span>{frame < 142 ? `合计价值 $${roll1000.toLocaleString()}+ 福利包` : '挑出最有价值的 3 个'}</span>
            </div>
            {frame >= 165 && (
              <div style={{ width: 38, height: 38, borderRadius: '50%', backgroundColor: COLORS.green, color: '#111318', fontWeight: 900, fontSize: 22, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                ✓
              </div>
            )}
          </div>

          {/* 5 Extra Perk Cards enter sequentially (staggered 8f), float calmly, then glide down */}
          {extraPerks.map((label, i) => {
            const enterP = spring({ frame: Math.max(0, frame - 10 - i * 8), fps, config: { damping: 20, stiffness: 80 } });
            const baseX = 160 + i * 205;
            const baseY = interpolate(enterP, [0, 1], [-80, 168 + (i % 2) * 52]) + Math.sin(frame * 0.045 + i) * 6;
            const locEj = Math.max(0, ejectT - i * 0.08);
            const y = baseY + locEj * locEj * 560;
            const rot = (i - 2) * 4 + locEj * (i % 2 === 0 ? -28 : 28);
            const opacity = enterP * Math.max(0, 0.72 - locEj * 0.9);

            return (
              <div
                key={label}
                style={{
                  ...crystalGlass(0, 14),
                  position: 'absolute',
                  left: baseX - 102,
                  top: y - 50,
                  width: 204,
                  height: 98,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  fontSize: 22,
                  fontWeight: 800,
                  color: COLORS.textSecondary,
                  transform: `rotate(${rot}deg)`,
                  opacity,
                  zIndex: 5,
                }}
              >
                <GeminiLogo size={20} />
                <span>{label}</span>
              </div>
            );
          })}

          {/* 3 Hero Core Cards with Official Product Logos: sequential entrance -> 26° fan -> 3-column roadmap */}
          {keep3.map((c, idx) => {
            const cardEnter = spring({ frame: Math.max(0, frame - 26 - idx * 12), fps, config: { damping: 18, stiffness: 85 } });
            const fanPos = [
              { x: 245, y: 310, rot: -12 },
              { x: 560, y: 276, rot: 0 },
              { x: 875, y: 310, rot: 12 },
            ][idx];
            const roadPos = { x: 215 + idx * 345, y: 278, rot: 0 };

            const startX = 240 + idx * 320;
            const startY = interpolate(cardEnter, [0, 1], [540, 345]) + Math.sin(frame * 0.045 + idx) * 6;
            const midX = interpolate(gatherP, [0, 1], [startX, fanPos.x]);
            const midY = interpolate(gatherP, [0, 1], [startY, fanPos.y]);
            const x = interpolate(roadmapT, [0, 1], [midX, roadPos.x]);
            const y = interpolate(roadmapT, [0, 1], [midY, roadPos.y]);
            const rot = interpolate(roadmapT, [0, 1], [interpolate(gatherP, [0, 1], [(idx - 1) * 3, fanPos.rot]), 0]);
            const scale = interpolate(gatherP, [0, 1], [0.92, 1.04]);

            return (
              <div
                key={c.num}
                style={{
                  ...crystalGlass(0.45 + gatherP * 0.45, 20),
                  position: 'absolute',
                  left: x - 160,
                  top: y - 120,
                  width: 320,
                  height: 240,
                  padding: '24px 26px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transform: `rotate(${rot}deg) scale(${scale})`,
                  opacity: cardEnter,
                  zIndex: 15 + idx,
                  overflow: 'hidden',
                }}
              >
                <div style={glassSheenStyle(frame + idx * 30, 0.75)} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    {c.logo}
                    <span style={{ backgroundColor: c.color, color: '#111318', fontFamily: FONTS.display, fontSize: 32, fontWeight: 900, padding: '2px 12px', borderRadius: 8 }}>
                      {c.num}
                    </span>
                  </div>
                  <span style={{ fontFamily: FONTS.mono, fontSize: 16, fontWeight: 800, color: COLORS.amber }}>TOP PICK</span>
                </div>
                <div>
                  <div style={{ fontSize: 38, fontWeight: 900, color: COLORS.white, lineHeight: 1.15 }}>{c.title}</div>
                  <div style={{ fontSize: 23, fontWeight: 700, color: COLORS.textSecondary, marginTop: 8 }}>{c.sub}</div>
                </div>
              </div>
            );
          })}

          {roadmapT > 0.15 && (
            <div style={{ ...crystalGlass(0.3, 12), position: 'absolute', bottom: 18, left: '50%', transform: `translate(-50%, ${(1 - roadmapT) * 16}px)`, padding: '8px 26px', fontSize: 23, fontWeight: 700, color: COLORS.textPrimary, opacity: roadmapT, display: 'flex', alignItems: 'center', gap: 10 }}>
              <GoogleOneLogo size={22} />
              <span>其余权益可登录 one.google.com 逐个查查看 →</span>
            </div>
          )}
        </div>
      </HudFrame>
    </SceneWrap>
  );
};

/* ============================================================================
 * BEATS 08–10 (00:18.27 – 00:35.1): Perk 01 — Official DeepSeek/Gemini API Evidence -> Sequential Tier Lift -> Apple iOS Trap
 * ==========================================================================*/
const Beats08to10Perk01Credit: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Smooth cross-dissolve from API Flow (0..185f) -> Tiers (185..336f) -> Bg Blur Warning (336..end)
  const toTiersT = easeInOutCubic((frame - 175) / 22);
  const pushT = easeOutQuint((frame - 336) / 26);
  const iosRowT = easeOutQuint((frame - 404) / 22);
  const iosBadgeT = easeOutQuint((frame - 455) / 18);

  // Smooth continuous tier focus synced to audio: Pro (185f), 5X (248f), 20X (290f)
  const tierFocus =
    frame < 244
      ? 0
      : frame < 288
        ? easeInOutCubic((frame - 244) / 20)
        : 1 + easeInOutCubic((frame - 288) / 20);
  const currentDollars = frame < 185 ? 10 : Math.round(interpolate(tierFocus, [0, 1, 2], [10, 40, 100]));

  const tiers = [
    { name: 'Pro 档', amount: '$10', unit: '/ 月', tag: 'Google AI Pro', color: '#74B3F5', logo: <GeminiLogo size={32} /> },
    { name: '5X 档', amount: '$40', unit: '/ 月', tag: 'Google AI 5X', color: '#f5a623', logo: <GoogleGLogo size={30} /> },
    { name: '20X 档', amount: '$100', unit: '/ 月', tag: 'Google AI Ultra', color: '#34d399', logo: <GoogleOneLogo size={32} /> },
  ];

  const flowNodes = [
    {
      id: 1,
      title: '会员赠送金',
      sub: 'Google 订阅自带额度',
      logo: <GoogleOneLogo size={36} />,
      proofImg: 'assets_google/crop_google_ai_pro_5tb.png',
      proofDomain: 'one.google.com',
      color: '#f5a623',
      startF: 10,
    },
    {
      id: 2,
      title: 'DeepSeek 同款',
      sub: '复制 API Key 接入',
      logo: <DeepSeekLogo size={36} />,
      proofImg: 'assets_google/crop_deepseek_api_key.png',
      proofDomain: 'api-docs.deepseek.com',
      color: '#74B3F5',
      startF: 50,
    },
    {
      id: 3,
      title: '调用 Gemini',
      sub: '任意第三方工具可用',
      logo: <GeminiLogo size={36} />,
      proofImg: 'assets_google/crop_gemini_api_hero.png',
      proofDomain: 'ai.google.dev',
      color: '#34d399',
      startF: 104,
    },
  ];

  const status = frame < 185 ? 'API FLOW' : frame < 336 ? 'LIFT & COMPARE' : 'PUSH BACK';

  return (
    <SceneWrap durationInFrames={dur}>
      <HudFrame
        moveIndex={1}
        totalMoves={3}
        titleZh="福利一 · 会员赠送金"
        titleEn="GEMINI API CREDIT"
        cameraMoving={frame >= 336}
        status={status}
        metrics={
          frame >= 336
            ? [
                { labelEn: 'BACK SCALE', labelZh: '后层退后', value: `${Math.round(interpolate(pushT, [0, 1], [100, 94]))}%`, accent: true },
                { labelEn: 'BACK BLUR', labelZh: '后层虚化', value: `${interpolate(pushT, [0, 1], [0, 4.0]).toFixed(1)} px` },
                { labelEn: 'REQUIRE', labelZh: '领取前提', value: '有效支付' },
              ]
            : [
                { labelEn: 'CREDIT', labelZh: '每月赠送', value: `$${currentDollars} / 月`, accent: true },
                { labelEn: 'COMPAT', labelZh: '调用方式', value: 'API KEY' },
                { labelEn: 'TIERS', labelZh: '档位梯度', value: '10·40·100' },
              ]
        }
        graphMode={frame < 185 ? 'step' : 'curve'}
        graphProgress={frame < 185 ? Math.min(1, frame / 145) : frame < 336 ? (tierFocus + 0.5) / 2.5 : pushT}
        graphSteps={3}
        promptTokens={[
          { text: '用 ' },
          { text: 'API Key 调用 Gemini', highlight: true },
          { text: '（Pro ' },
          { text: '$10', highlight: true },
          { text: ' / 5X ' },
          { text: '$40', highlight: true },
          { text: ' / 20X ' },
          { text: '$100', highlight: true },
          { text: '），需 ' },
          { text: '有效支付方式', highlight: true },
        ]}
        promptLabel="核心要点"
        promptBadge="SUMMARY"
        promptStartFrame={35}
      >
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {/* Beat 08: Sequential Cause-and-Effect API Flow WITH REAL OFFICIAL WEBSITE PARTIAL SCREENSHOTS */}
          {toTiersT < 0.98 && (
            <div style={{ position: 'absolute', width: '95%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', opacity: 1 - toTiersT, transform: `scale(${1 - toTiersT * 0.06})` }}>
              <svg width="100%" height="120" viewBox="0 0 1000 120" style={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', zIndex: 1 }}>
                <line x1="260" y1="60" x2={interpolate(frame, [26, 54], [260, 405], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })} y2="60" stroke={COLORS.amber} strokeWidth="4" strokeDasharray="10 8" strokeDashoffset={-frame * 2.2} />
                {frame > 70 && (
                  <line x1="595" y1="60" x2={interpolate(frame, [70, 108], [595, 740], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })} y2="60" stroke={COLORS.amber} strokeWidth="4" strokeDasharray="10 8" strokeDashoffset={-frame * 2.2} />
                )}
              </svg>
              {flowNodes.map((n, i) => {
                const pop = spring({ frame: Math.max(0, frame - n.startF), fps, config: { damping: 18, stiffness: 85 } });
                const active = frame >= n.startF;
                return (
                  <div
                    key={n.id}
                    style={{
                      ...(active ? crystalGlass(0.75, 20) : { borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.05)', border: '1.5px dashed rgba(255,255,255,0.18)' }),
                      width: 342,
                      height: 360,
                      padding: '20px 22px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      position: 'relative',
                      zIndex: 10,
                      transform: active ? `scale(${0.86 + pop * 0.14}) translateY(${Math.sin(frame * 0.045 + i) * 3.5}px)` : 'scale(0.94)',
                      overflow: 'hidden',
                    }}
                  >
                    {active ? (
                      <>
                        <div style={glassSheenStyle(frame + i * 25, 0.75)} />
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            {n.logo}
                            <span style={{ fontFamily: FONTS.mono, fontSize: 16, color: n.color, fontWeight: 900 }}>STEP 0{n.id}</span>
                          </div>
                          <span style={{ fontFamily: FONTS.mono, fontSize: 13, color: COLORS.textMuted }}>{n.proofDomain}</span>
                        </div>

                        {/* REAL Official Website Partial Screenshot */}
                        <div
                          style={{
                            width: '100%',
                            height: 165,
                            borderRadius: 12,
                            overflow: 'hidden',
                            border: '1px solid rgba(255,255,255,0.22)',
                            backgroundColor: n.id === 1 ? '#090d18' : '#ffffff',
                          }}
                        >
                          <Img
                            src={staticFile(n.proofImg)}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: n.id === 1 ? 'cover' : 'contain',
                              objectPosition: n.id === 1 ? 'center top' : 'center center',
                            }}
                          />
                        </div>

                        <div>
                          <div style={{ fontSize: 34, fontWeight: 900, color: COLORS.white, lineHeight: 1.15 }}>{n.title}</div>
                          <div style={{ fontSize: 21, fontWeight: 700, color: COLORS.textSecondary, marginTop: 4 }}>{n.sub}</div>
                        </div>
                      </>
                    ) : (
                      <div style={{ margin: 'auto', fontFamily: FONTS.mono, color: COLORS.textMuted, fontSize: 22 }}>STEP 0{n.id}</div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Beat 09 & 10: Sequential Tier Cards w/ Official Logos + Bg Blur Warning w/ Apple Logo */}
          {toTiersT > 0.02 && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: toTiersT }}>
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transform: `scale(${interpolate(pushT, [0, 1], [1, 0.94])})`,
                  filter: `blur(${interpolate(pushT, [0, 1], [0, 4.2]).toFixed(1)}px) brightness(${interpolate(pushT, [0, 1], [1, 0.52]).toFixed(2)})`,
                }}
              >
                {tiers.map((t, i) => {
                  const cardIn = spring({ frame: Math.max(0, frame - 180 - i * 10), fps, config: { damping: 18, stiffness: 85 } });
                  const w = smoothFocusWeight(i, tierFocus, 0.88);
                  const baseX = (i - 1) * 340;
                  const shiftX = (i < tierFocus ? -38 : i > tierFocus ? 38 : 0) * (1 - w);
                  const liftY = -42 * w;
                  const scale = (0.92 + w * 0.26) * (0.85 + cardIn * 0.15);
                  const rot = (i - 1) * 6 * (1 - w);
                  return (
                    <div
                      key={t.name}
                      style={{
                        ...crystalGlass(w, 22),
                        position: 'absolute',
                        width: 315,
                        height: 335,
                        padding: '26px 26px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        transform: `translate(${baseX + shiftX}px, ${liftY}px) rotate(${rot}deg) scale(${scale})`,
                        opacity: cardIn,
                        zIndex: Math.round(10 + w * 20),
                        overflow: 'hidden',
                      }}
                    >
                      <div style={glassSheenStyle(frame + i * 20, 0.75)} />
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          {t.logo}
                          <span style={{ backgroundColor: t.color, color: '#111318', padding: '5px 14px', borderRadius: 8, fontSize: 23, fontWeight: 900 }}>{t.name}</span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                        <span style={{ fontFamily: FONTS.display, fontSize: 118, fontWeight: 900, color: w > 0.4 ? COLORS.amber : COLORS.white, lineHeight: 0.88 }}>
                          {t.amount}
                        </span>
                        <span style={{ fontSize: 28, fontWeight: 700, color: COLORS.textSecondary }}>{t.unit}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 19, fontWeight: 700, color: COLORS.textSecondary }}>{t.tag}</span>
                        <span style={{ fontFamily: FONTS.mono, fontSize: 14, color: COLORS.amber }}>API CREDIT</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Beat 10: Sequential Foreground Warning (Google Requirement -> Official Apple Logo Row -> Red Seal) */}
              {pushT > 0.04 && (
                <div
                  style={{
                    ...crystalGlass(0.92, 24),
                    position: 'relative',
                    zIndex: 40,
                    width: 840,
                    padding: '36px 44px',
                    transform: `scale(${0.9 + pushT * 0.1})`,
                    opacity: pushT,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 24,
                    overflow: 'hidden',
                  }}
                >
                  <div style={glassSheenStyle(frame, 0.85)} />
                  <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                    <div style={{ width: 62, height: 62, borderRadius: 16, backgroundColor: 'rgba(245,166,35,0.18)', border: `2px solid ${COLORS.amber}`, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                      <GoogleGLogo size={36} />
                    </div>
                    <div>
                      <div style={{ fontFamily: FONTS.mono, fontSize: 17, color: COLORS.amber, letterSpacing: 2, fontWeight: 700 }}>GOOGLE BILLING REQUIREMENT</div>
                      <div style={{ fontSize: 44, fontWeight: 900, color: COLORS.white }}>必须绑定有效支付方式</div>
                    </div>
                  </div>

                  {iosRowT > 0.02 && (
                    <div
                      style={{
                        padding: '20px 26px',
                        borderRadius: 16,
                        backgroundColor: 'rgba(239, 83, 80, 0.18)',
                        border: `2px solid ${COLORS.red}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        opacity: iosRowT,
                        transform: `translateY(${(1 - iosRowT) * 20}px)`,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 32, fontWeight: 900, color: COLORS.white }}>
                        <AppleLogo size={34} color="#FFFFFF" />
                        <span>iOS App Store 订阅渠道</span>
                      </div>
                      <div style={{ backgroundColor: COLORS.red, color: COLORS.white, padding: '8px 22px', borderRadius: 10, fontSize: 26, fontWeight: 900, opacity: iosBadgeT, transform: `scale(${0.85 + iosBadgeT * 0.15})` }}>
                        ✕ 暂不可领
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </HudFrame>
    </SceneWrap>
  );
};

/* ============================================================================
 * BEATS 12–13 (00:36.17 – 00:44.1): Perk 02 — REAL Official Google Flow Dark Hero + Sequential Dual Tracks
 * ==========================================================================*/
const Beats12to13Perk02Flow: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const splitT = easeInOutCubic((frame - 78) / 26); // smooth 0.87s lift
  const leftTrackT = easeOutQuint((frame - 88) / 22);
  const rightTrackT = easeOutQuint((frame - 158) / 22); // enters right when voice says "不消耗 API TOKEN"!
  const creditPct = interpolate(frame, [105, 220], [100, 58], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const tcSec = Math.floor(frame / 30);
  const tcFrm = frame % 30;

  return (
    <SceneWrap durationInFrames={dur}>
      <HudFrame
        moveIndex={2}
        totalMoves={3}
        titleZh="福利二 · 谷歌 Flow"
        titleEn="CINEMATIC AI VIDEO"
        cameraMoving={true}
        status={frame < 85 ? 'FLOW OFFICIAL' : '0 TOKEN COST'}
        metrics={[
          { labelEn: 'QUALITY', labelZh: '画面质感', value: '电影级', accent: true },
          { labelEn: 'BILLING', labelZh: '扣费来源', value: '赠送点数' },
          { labelEn: 'API TOKEN', labelZh: 'Token 消耗', value: '0', accent: rightTrackT > 0.3 },
        ]}
        graphMode="sine"
        graphProgress={0.8}
        promptTokens={[
          { text: '谷歌 Flow 生成 ' },
          { text: '电影质感视频', highlight: true },
          { text: '：扣 ' },
          { text: '赠送点数', highlight: true },
          { text: ' · ' },
          { text: '0 消耗 API Token', highlight: true },
        ]}
        promptLabel="核心要点"
        promptBadge="SUMMARY"
        promptStartFrame={24}
      >
        <div style={{ position: 'absolute', inset: 22, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 18 }}>
          {/* 2.39:1 Anamorphic Cinema Viewport featuring REAL OFFICIAL flow.google.com DARK SCREENSHOT */}
          <div
            style={{
              ...crystalGlass(0.6, 18),
              height: interpolate(splitT, [0, 1], [375, 228]),
              position: 'relative',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#090b10',
            }}
          >
            <Img
              src={staticFile('assets_google/crop_google_flow_hero.png')}
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'center 14%',
                transform: `scale(${1.02 + frame * 0.0004})`,
              }}
            />
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 18, backgroundColor: 'rgba(0,0,0,0.86)' }} />
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 18, backgroundColor: 'rgba(0,0,0,0.86)' }} />
            <div style={glassSheenStyle(frame, 0.7)} />

            <div
              style={{
                position: 'absolute',
                bottom: 24,
                left: 20,
                padding: '6px 18px',
                borderRadius: 10,
                backgroundColor: 'rgba(13, 16, 22, 0.78)',
                border: '1px solid rgba(245, 166, 35, 0.45)',
                fontSize: 22,
                fontWeight: 900,
                color: COLORS.white,
                letterSpacing: 1,
              }}
            >
              电影质感 AI 视频生成 · 2.39:1 CINEMA
            </div>

            <div style={{ position: 'absolute', left: 18, top: 26 }}>
              <OfficialSourcePill domain="flow.google.com" logo={<GoogleFlowLogo size={20} />} />
            </div>

            <div style={{ position: 'absolute', right: 20, bottom: 24, fontFamily: FONTS.mono, fontSize: 18, color: COLORS.amber, fontWeight: 700, textShadow: '0 2px 10px rgba(0,0,0,0.9)' }}>
              REC ● 00:00:{String(tcSec).padStart(2, '0')}:{String(tcFrm).padStart(2, '0')}
            </div>
          </div>

          {/* Beat 13: Sequential Dual Tracks w/ Official GoogleFlowLogo & GeminiLogo */}
          {splitT > 0.02 && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 22 }}>
              <div style={{ ...crystalGlass(0.8, 18), padding: '22px 26px', display: 'flex', flexDirection: 'column', gap: 14, opacity: leftTrackT, transform: `translateY(${(1 - leftTrackT) * 24}px)` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <GoogleFlowLogo size={34} />
                    <span style={{ fontSize: 30, fontWeight: 900, color: COLORS.amber }}>Flow 赠送点数</span>
                  </div>
                  <span style={{ fontFamily: FONTS.mono, fontSize: 20, color: COLORS.amber, fontWeight: 900 }}>扣除中</span>
                </div>
                <div style={{ height: 16, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.1)', overflow: 'hidden' }}>
                  <div style={{ width: `${creditPct}%`, height: '100%', borderRadius: 8, backgroundColor: COLORS.amber, boxShadow: `0 0 18px ${COLORS.amberGlow}` }} />
                </div>
                <div style={{ fontSize: 22, fontWeight: 700, color: COLORS.textSecondary }}>优先消耗订阅赠送点数</div>
              </div>

              <div style={{ ...crystalGlass(rightTrackT, 18), padding: '22px 26px', display: 'flex', flexDirection: 'column', gap: 14, borderColor: rightTrackT > 0.2 ? COLORS.green : undefined, opacity: rightTrackT, transform: `translateY(${(1 - rightTrackT) * 24}px)` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <GeminiLogo size={34} />
                    <span style={{ fontSize: 30, fontWeight: 900, color: COLORS.green }}>API TOKEN</span>
                  </div>
                  <span style={{ backgroundColor: COLORS.green, color: '#111318', padding: '4px 16px', borderRadius: 8, fontFamily: FONTS.mono, fontSize: 22, fontWeight: 900 }}>
                    0 消耗 ✓
                  </span>
                </div>
                <div style={{ height: 16, borderRadius: 8, backgroundColor: 'rgba(52,211,153,0.18)', overflow: 'hidden' }}>
                  <div style={{ width: '100%', height: '100%', borderRadius: 8, backgroundColor: COLORS.green, boxShadow: '0 0 18px rgba(52,211,153,0.5)' }} />
                </div>
                <div style={{ fontSize: 22, fontWeight: 700, color: COLORS.textSecondary }}>完全不占用 Gemini API 额度</div>
              </div>
            </div>
          )}
        </div>
      </HudFrame>
    </SceneWrap>
  );
};

/* ============================================================================
 * BEAT 14 (00:43.90 – 00:47.72): Perk 03 — Official Google AI Pro 5TB Card + Ring + Sequential Logo Summary
 * ==========================================================================*/
const Beat14Perk03Storage: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const fillP = easeOutQuint(frame / 54);
  const tbVal = (fillP * 5.0).toFixed(1);
  const circ = 2 * Math.PI * 116;
  const dashOffset = circ * (1 - fillP * 0.92);
  const cardIn = easeOutQuint(frame / 22);

  const summaryRows = [
    { num: '01', text: '会员赠送金 · $10–$100/月', logo: <GoogleAIStudioLogo size={30} /> },
    { num: '02', text: '谷歌 Flow · 0 消耗 Token', logo: <GoogleFlowLogo size={30} /> },
    { num: '03', text: '5TB 云空间 · 大家都懂 ✓', logo: <GoogleOneLogo size={30} /> },
  ];

  return (
    <SceneWrap durationInFrames={dur}>
      <HudFrame
        moveIndex={3}
        totalMoves={3}
        titleZh="福利三 · 5TB 存储空间"
        titleEn="GOOGLE ONE STORAGE"
        cameraMoving={false}
        status="5.0 TB"
        metrics={[
          { labelEn: 'CAPACITY', labelZh: '云端容量', value: `${tbVal} TB`, accent: true },
          { labelEn: 'OFFICIAL', labelZh: '官方权益', value: 'Google One' },
          { labelEn: 'SUMMARY', labelZh: '精选福利', value: '3 / 3' },
        ]}
        graphMode="curve"
        graphProgress={fillP}
        promptTokens={[
          { text: '三大核心福利：' },
          { text: '01 会员赠送金', highlight: true },
          { text: ' · ' },
          { text: '02 谷歌 Flow', highlight: true },
          { text: ' · ' },
          { text: '03 5TB 存储空间', highlight: true },
        ]}
        promptLabel="核心要点"
        promptBadge="SUMMARY"
        promptStartFrame={16}
      >
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 38, padding: '0 28px' }}>
          {/* Left: REAL Official Google AI Pro 5 TB Storage Card Screenshot */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 10,
              opacity: cardIn,
              transform: `scale(${0.92 + cardIn * 0.08})`,
            }}
          >
            <OfficialSourcePill domain="one.google.com" logo={<GoogleOneLogo size={18} />} />
            <div
              style={{
                width: 280,
                height: 332,
                borderRadius: 18,
                overflow: 'hidden',
                border: `2px solid ${COLORS.amberBorder}`,
                boxShadow: `0 0 36px ${COLORS.amberGlow}`,
              }}
            >
              <Img
                src={staticFile('assets_google/crop_google_ai_pro_5tb.png')}
                style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }}
              />
            </div>
          </div>

          {/* Center: Animated 5.0 TB Storage Ring */}
          <div style={{ position: 'relative', width: 270, height: 270, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${1 + frame * 0.0005})` }}>
            <svg width="270" height="270" viewBox="0 0 270 270" style={{ transform: 'rotate(-90deg)' }}>
              <circle cx="135" cy="135" r="116" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="18" />
              <circle
                cx="135"
                cy="135"
                r="116"
                fill="none"
                stroke={COLORS.amber}
                strokeWidth="18"
                strokeLinecap="round"
                strokeDasharray={circ}
                strokeDashoffset={dashOffset}
                style={{ filter: `drop-shadow(0 0 20px ${COLORS.amberGlow})` }}
              />
            </svg>
            <div style={{ position: 'absolute', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <GoogleOneLogo size={32} style={{ marginBottom: 4 }} />
              <div style={{ fontFamily: FONTS.display, fontSize: 96, fontWeight: 900, color: COLORS.amber, lineHeight: 0.88 }}>
                {tbVal}
              </div>
              <div style={{ fontFamily: FONTS.mono, fontSize: 20, fontWeight: 800, color: COLORS.white, letterSpacing: 3, marginTop: 4 }}>
                TERABYTES
              </div>
            </div>
          </div>

          {/* Right: 3 Summary Pills enter sequentially with Official Logos */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {summaryRows.map((it, i) => {
              const p = spring({ frame: Math.max(0, frame - 14 - i * 12), fps, config: { damping: 18, stiffness: 85 } });
              return (
                <div
                  key={it.num}
                  style={{
                    ...crystalGlass(i === 2 ? 0.92 : 0.3, 16),
                    padding: '16px 24px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                    opacity: p,
                    transform: `translateX(${(1 - p) * 34}px)`,
                  }}
                >
                  {it.logo}
                  <span style={{ backgroundColor: COLORS.amber, color: '#111318', fontFamily: FONTS.display, fontSize: 26, fontWeight: 900, padding: '2px 10px', borderRadius: 7 }}>
                    {it.num}
                  </span>
                  <span style={{ fontSize: 26, fontWeight: 900, color: COLORS.white }}>{it.text}</span>
                </div>
              );
            })}
          </div>
        </div>
      </HudFrame>
    </SceneWrap>
  );
};

export const GooglePerksVideo: React.FC = () => {
  // Overlapping 10-frame cross-dolly boundaries = ZERO HARD CUTS across the entire 47.72s video!
  const ov = 10;
  return (
    <WorldCanvas watermark="GOOGLE">
      <Audio src={staticFile('assets_google/google_perks.wav')} />

      {/* Beats 01–03 */}
      <Sequence from={0} durationInFrames={f(5.87) + ov}>
        <Beats01to03Hook dur={f(5.87) + ov} />
      </Sequence>

      {/* Beats 04–06 */}
      <Sequence from={f(5.87)} durationInFrames={f(16.2 - 5.87) + ov}>
        <Beats04to06BundleAndPick3 dur={f(16.2 - 5.87) + ov} />
      </Sequence>

      {/* Beat 07: Bumper 01 */}
      <Sequence from={f(16.2)} durationInFrames={f(18.27 - 16.2) + ov}>
        <SceneWrap durationInFrames={f(18.27 - 16.2) + ov}>
          <MoveBumperScene moveNum="01" labelTop="福利一" titleZh="会员赠送金" titleEn="GEMINI API CREDIT" subtitleTags={['每月 $10–$100', '第三方调用 Gemini']} />
        </SceneWrap>
      </Sequence>

      {/* Beats 08–10: Perk 01 */}
      <Sequence from={f(18.27)} durationInFrames={f(34.87 - 18.27) + ov}>
        <Beats08to10Perk01Credit dur={f(34.87 - 18.27) + ov} />
      </Sequence>

      {/* Beat 11: Bumper 02 */}
      <Sequence from={f(34.87)} durationInFrames={f(36.17 - 34.87) + ov}>
        <SceneWrap durationInFrames={f(36.17 - 34.87) + ov}>
          <MoveBumperScene moveNum="02" labelTop="福利二" titleZh="谷歌 Flow" titleEn="GOOGLE FLOW" subtitleTags={['电影质感视频', '0 消耗 API Token']} />
        </SceneWrap>
      </Sequence>

      {/* Beats 12–13: Perk 02 */}
      <Sequence from={f(36.17)} durationInFrames={f(43.9 - 36.17) + ov}>
        <Beats12to13Perk02Flow dur={f(43.9 - 36.17) + ov} />
      </Sequence>

      {/* Beat 14: Perk 03 */}
      <Sequence from={f(43.9)} durationInFrames={GOOGLE_PERKS_TOTAL_FRAMES - f(43.9)}>
        <Beat14Perk03Storage dur={GOOGLE_PERKS_TOTAL_FRAMES - f(43.9)} />
      </Sequence>

      <SubtitleOverlay subtitles={GOOGLE_PERKS_SUBTITLES} />
    </WorldCanvas>
  );
};
