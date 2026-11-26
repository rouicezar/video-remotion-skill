import React from 'react';
import { Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { HudFrame } from '../../design/Chrome';
import { COLORS, FONTS } from '../../design/tokens';
import { PromptToken } from '../../types/timeline';

const DEFAULT_CARDS = [
  'assets/card_01.jpg',
  'assets/card_02.jpg',
  'assets/card_03.jpg',
  'assets/card_04.jpg',
  'assets/card_05.jpg',
  'assets/card_06.jpg',
  'assets/card_07.jpg',
  'assets/card_08.jpg',
];

const DEFAULT_PROMPT_01: PromptToken[] = [
  { text: '复杂界面先出 ' },
  { text: '灰色骨架线框', highlight: true },
  { text: '，再按阅读顺序 ' },
  { text: '一块块填进真实内容', highlight: true },
  { text: '，每块间隔 ' },
  { text: '0.15 秒', highlight: true },
  { text: '，让观众 ' },
  { text: '先看懂结构', highlight: true },
];

export const Move01SkeletonDemo: React.FC<{
  moveIndex?: number;
  totalMoves?: number;
  titleZh?: string;
  titleEn?: string;
  promptTokens?: PromptToken[];
  filledImage?: string;
  fullImage?: string;
  durationFrames?: number;
}> = ({
  moveIndex = 1,
  totalMoves = 9,
  titleZh = '骨架填充',
  titleEn = 'SKELETON FILL',
  promptTokens = DEFAULT_PROMPT_01,
  filledImage = 'assets/ui_m1_filled.jpg',
  fullImage = 'assets/ui_m1_full.jpg',
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Exact sync with 01-待复刻视频.MP4 (Move 01 Demo starts at 43.44s):
  // 0..175f (43.44..49.27s): ALL AT ONCE (0/6) + red X callout
  // 175..275f (49.27..52.60s): PURE EMPTY SKELETON (0/6 — ZERO real image bleeding through!)
  // 275..370f (52.60..55.77s): BLOCK-BY-BLOCK CENTER-GROW FILL (1/6 -> 6/6, Δ 0.15s arrow)
  // 370..end (55.77..60.96s): Full UI zoom-out showcase ("我的片子 · 16 期新拟物")
  const isAllAtOnce = frame < 175;
  const isPureSkeleton = frame >= 175 && frame < 275;
  const isFullShowcase = frame >= 405;

  const fillStart = 275;
  const stepF = 14;
  const filledCount =
    isAllAtOnce || isPureSkeleton
      ? 0
      : Math.min(6, Math.floor((frame - fillStart) / stepF) + 1);

  const status = isAllAtOnce
    ? 'ALL AT ONCE'
    : filledCount < 6
      ? 'SKELETON'
      : 'FILLED';

  const blocks = [
    { id: 1, cx: 28, cy: 50, r: 34, left: '6%', top: '12%', width: '44%', height: '76%', radius: '50%', isCircle: true },
    { id: 2, cx: 80, cy: 46, r: 10, left: '72%', top: '34%', width: '16%', height: '24%', radius: '50%', isCircle: true },
    { id: 3, cx: 79, cy: 68, r: 10, left: '71%', top: '61%', width: '17%', height: '14%', radius: '12px', isCircle: false },
    { id: 4, cx: 68, cy: 75, r: 10, left: '61%', top: '64%', width: '15%', height: '23%', radius: '50%', isCircle: true },
    { id: 5, cx: 68, cy: 92, r: 9, left: '60%', top: '87%', width: '16%', height: '11%', radius: '10px', isCircle: false },
    { id: 6, cx: 89, cy: 85, r: 8, left: '83%', top: '80%', width: '12%', height: '10%', radius: '10px', isCircle: false },
  ];

  const calloutScale = spring({
    frame: Math.max(0, frame - 42),
    fps,
    config: { damping: 13, stiffness: 160 },
  });

  const fullRevealSpring = spring({
    frame: Math.max(0, frame - 405),
    fps,
    config: { damping: 16, stiffness: 100 },
  });

  return (
    <HudFrame
      moveIndex={moveIndex}
      totalMoves={totalMoves}
      titleZh={titleZh}
      titleEn={titleEn}
      cameraMoving={false}
      status={status}
      metrics={[
        { labelEn: 'FILLED', labelZh: '已填', value: `${filledCount} / 6`, accent: filledCount > 0 },
        { labelEn: 'STEP', labelZh: '每块间隔', value: '0.15 s' },
        { labelEn: 'ORDER', labelZh: '顺序', value: isAllAtOnce ? '—' : '骨架 → 内容' },
      ]}
      graphMode={isAllAtOnce || isPureSkeleton ? 'flat' : 'step'}
      graphProgress={filledCount / 6}
      graphSteps={6}
      promptTokens={promptTokens}
      promptStartFrame={270}
    >
      <div style={{ position: 'absolute', inset: 22, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {isFullShowcase ? (
          <div style={{ width: '100%', height: '100%', position: 'relative', transform: `scale(${interpolate(fullRevealSpring, [0, 1], [0.92, 1])})` }}>
            <Img
              src={staticFile(fullImage)}
              style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: 12 }}
            />
            <div
              style={{
                position: 'absolute',
                bottom: 14,
                left: '50%',
                transform: 'translateX(-50%)',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
              }}
            >
              <div style={{ backgroundColor: 'rgba(17, 19, 24, 0.94)', border: `1.5px solid ${COLORS.amberBorder}`, color: COLORS.textPrimary, padding: '7px 16px', borderRadius: 10, fontSize: 17, fontWeight: 700 }}>
                ① 先从底面浮出空的骨架
              </div>
              <div style={{ backgroundColor: COLORS.amber, color: '#111318', padding: '7px 16px', borderRadius: 10, fontSize: 17, fontWeight: 800 }}>
                ② 再从中心长出内容
              </div>
              <div style={{ width: 32, height: 32, borderRadius: '50%', backgroundColor: COLORS.green, color: '#111318', fontWeight: 900, fontSize: 19, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                ✓
              </div>
            </div>
          </div>
        ) : (
          <div
            style={{
              width: '92%',
              height: '92%',
              backgroundColor: '#e8eaee',
              borderRadius: 16,
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 14px 40px rgba(0,0,0,0.45)',
            }}
          >
            {isAllAtOnce ? (
              <>
                <Img src={staticFile(filledImage)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                {frame > 42 && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 16,
                      right: 16,
                      width: 310,
                      borderRadius: 12,
                      border: `3px solid ${COLORS.red}`,
                      backgroundColor: '#f3f5f8',
                      padding: 10,
                      boxShadow: '0 12px 32px rgba(0,0,0,0.45)',
                      transform: `scale(${calloutScale})`,
                    }}
                  >
                    <Img src={staticFile(filledImage)} style={{ width: '100%', height: 145, objectFit: 'cover', borderRadius: 8 }} />
                    <div style={{ position: 'absolute', bottom: 18, left: 18, backgroundColor: '#111318', color: COLORS.white, padding: '4px 12px', borderRadius: 6, fontSize: 17, fontWeight: 700 }}>
                      一下子全出来
                    </div>
                    <div style={{ position: 'absolute', top: 12, right: 12, width: 32, height: 32, borderRadius: '50%', backgroundColor: COLORS.red, color: COLORS.white, fontWeight: 900, fontSize: 19, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      ✕
                    </div>
                  </div>
                )}
              </>
            ) : (
              <>
                {/* 1. Pure light-gray skeleton placeholders (100% opaque when unfilled!) */}
                {blocks.map((b, idx) => {
                  const skelPop = spring({
                    frame: Math.max(0, frame - 175 - idx * 4),
                    fps,
                    config: { damping: 14, stiffness: 150 },
                  });
                  const isFilled = idx < filledCount;
                  return (
                    <div
                      key={`sk-${b.id}`}
                      style={{
                        position: 'absolute',
                        left: b.left,
                        top: b.top,
                        width: b.width,
                        height: b.height,
                        borderRadius: b.radius,
                        backgroundColor: '#d1d5dc',
                        transform: `scale(${skelPop})`,
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'center',
                        paddingTop: 14,
                        zIndex: 2,
                      }}
                    >
                      {!isFilled && (
                        <div style={{ width: 28, height: 28, borderRadius: 6, backgroundColor: '#6b7280', color: COLORS.white, fontFamily: FONTS.mono, fontSize: 15, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {b.id}
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* 2. Per-block clipped real UI growing outward from each block's center! */}
                {blocks.map((b, idx) => {
                  if (idx >= filledCount) return null;
                  const blockP = spring({
                    frame: Math.max(0, frame - (fillStart + idx * stepF)),
                    fps,
                    config: { damping: 14, stiffness: 140 },
                  });
                  const rad = b.r * blockP;
                  return (
                    <div
                      key={`real-${b.id}`}
                      style={{
                        position: 'absolute',
                        inset: 0,
                        clipPath: `circle(${rad}% at ${b.cx}% ${b.cy}%)`,
                        zIndex: 5 + idx,
                      }}
                    >
                      <Img src={staticFile(filledImage)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  );
                })}

                {/* Full clean reveal once all 6 filled */}
                {filledCount === 6 && (
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      opacity: interpolate(frame - (fillStart + 5 * stepF), [0, 12], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
                      zIndex: 15,
                    }}
                  >
                    <Img src={staticFile(filledImage)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                )}

                {/* Δ 0.15s callout pill between block 1 & block 2 */}
                {filledCount >= 4 && (
                  <div
                    style={{
                      position: 'absolute',
                      left: '53%',
                      top: '44%',
                      backgroundColor: COLORS.amber,
                      color: '#111318',
                      padding: '5px 14px',
                      borderRadius: 8,
                      fontFamily: FONTS.mono,
                      fontSize: 16,
                      fontWeight: 900,
                      boxShadow: `0 0 20px ${COLORS.amberGlow}`,
                      zIndex: 25,
                    }}
                  >
                    Δ 0.15s →
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </HudFrame>
  );
};

const DEFAULT_PROMPT_02: PromptToken[] = [
  { text: '一组图 ' },
  { text: '不要同时出现', highlight: true },
  { text: '，像发牌一样 ' },
  { text: '一张接一张飞进来', highlight: true },
  { text: '，沿 ' },
  { text: '弧线', highlight: true },
  { text: ' 落到各自位置，每张 ' },
  { text: '错开 0.1 秒', highlight: true },
];

export const Move02DealInDemo: React.FC<{
  moveIndex?: number;
  totalMoves?: number;
  titleZh?: string;
  titleEn?: string;
  promptTokens?: PromptToken[];
  cards?: string[];
}> = ({
  moveIndex = 2,
  totalMoves = 9,
  titleZh = '发牌入场',
  titleEn = 'DEAL IN',
  promptTokens = DEFAULT_PROMPT_02,
  cards = DEFAULT_CARDS,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Exact sync with 01-待复刻视频.MP4 (starts at 63.02s):
  // 0..105f (63.0..66.5s): ALL AT ONCE (red X)
  // 105..270f (66.5..72.0s): DEALING -> LANDED (8 cards fly in along 3D curved Bezier arcs staggered 4 frames = 0.13s)
  // 270..end (72.0..79.16s): Second wave rapid deal-in showcase
  const isAllAtOnce = frame < 105;
  const dealStart = 108;
  const stagger = 5;

  const landedCount = isAllAtOnce
    ? 0
    : Math.min(8, Math.max(0, Math.floor((frame - dealStart) / stagger) + 1));

  const status = isAllAtOnce
    ? 'ALL AT ONCE'
    : landedCount < 8
      ? 'DEALING'
      : 'LANDED';

  return (
    <HudFrame
      moveIndex={moveIndex}
      totalMoves={totalMoves}
      titleZh={titleZh}
      titleEn={titleEn}
      cameraMoving={false}
      status={status}
      metrics={[
        { labelEn: 'CARDS', labelZh: '已落', value: `${landedCount} / 8`, accent: landedCount > 0 },
        { labelEn: 'STAGGER', labelZh: '每张错开', value: '0.1 s' },
        { labelEn: 'PATH', labelZh: '飞行路线', value: '弧线飞入', accent: !isAllAtOnce },
      ]}
      graphMode={isAllAtOnce ? 'flat' : 'step'}
      graphProgress={landedCount / 8}
      graphSteps={8}
      promptTokens={promptTokens}
      promptStartFrame={120}
    >
      <div style={{ position: 'absolute', inset: 0, padding: '44px 48px', perspective: 1000 }}>
        {isAllAtOnce ? (
          <>
            <div style={{ position: 'absolute', top: 22, left: 34, padding: '6px 16px', borderRadius: 8, border: `1.5px solid ${COLORS.amberBorder}`, fontSize: 20, fontWeight: 700 }}>
              同时出现
            </div>
            <div style={{ position: 'absolute', top: 22, right: 34, width: 46, height: 46, borderRadius: '50%', backgroundColor: COLORS.red, color: COLORS.white, fontSize: 24, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              ✕
            </div>
          </>
        ) : (
          <div style={{ position: 'absolute', top: 22, left: 34, padding: '6px 14px', borderRadius: 8, backgroundColor: COLORS.amber, color: '#111318', fontSize: 17, fontWeight: 800 }}>
            Δ 0.1s / 张 · 弧线飞入
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginTop: 46, height: 400 }}>
          {cards.slice(0, 8).map((src, i) => {
            const tilt = (i % 2 === 0 ? -1 : 1) * (1.2 + (i % 3) * 0.6);
            if (isAllAtOnce) {
              const pop = spring({ frame, fps, config: { damping: 16, stiffness: 180 } });
              return (
                <div key={i} style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.14)', boxShadow: '0 10px 28px rgba(0,0,0,0.45)', transform: `scale(${pop}) rotate(${tilt}deg)` }}>
                  <Img src={staticFile(src)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              );
            }

            // 3D curved Bezier deal-in with flip & overshoot
            const cardStart = dealStart + i * stagger;
            const t = spring({
              frame: Math.max(0, frame - cardStart),
              fps,
              config: { damping: 13, stiffness: 135, mass: 0.75 },
            });
            const opacity = interpolate(frame - cardStart, [0, 4], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
            const startX = -560 - (i % 4) * 110;
            const startY = 380;
            const arcLift = Math.sin(Math.min(1, t) * Math.PI) * -175;
            const x = interpolate(t, [0, 1], [startX, 0]);
            const y = interpolate(t, [0, 1], [startY, 0]) + arcLift;
            const rotZ = interpolate(t, [0, 1], [-45, tilt]);
            const rotY = interpolate(t, [0, 1], [-55, 0]);
            const scale = interpolate(t, [0, 1], [0.45, 1]);

            return (
              <div
                key={i}
                style={{
                  borderRadius: 12,
                  overflow: 'hidden',
                  border: '1px solid rgba(255,255,255,0.2)',
                  boxShadow: '0 14px 32px rgba(0,0,0,0.55)',
                  opacity,
                  transform: `translate(${x}px, ${y}px) rotateY(${rotY}deg) rotateZ(${rotZ}deg) scale(${scale})`,
                }}
              >
                <Img src={staticFile(src)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            );
          })}
        </div>
      </div>
    </HudFrame>
  );
};

const DEFAULT_PROMPT_03: PromptToken[] = [
  { text: '从很多里挑几个讲时：' },
  { text: '一堆图', highlight: true },
  { text: ' 从上方落下，' },
  { text: '收拢成扇形', highlight: true },
  { text: ' 只留 ' },
  { text: '要讲的 3 张', highlight: true },
  { text: '，其余 ' },
  { text: '掉出画面', highlight: true },
];

export const Move03DropGatherDemo: React.FC<{
  moveIndex?: number;
  totalMoves?: number;
  titleZh?: string;
  titleEn?: string;
  promptTokens?: PromptToken[];
  keepCards?: Array<{ image: string; label: string }>;
  extraCards?: string[];
}> = ({
  moveIndex = 3,
  totalMoves = 9,
  titleZh = '落下收拢',
  titleEn = 'DROP & GATHER',
  promptTokens = DEFAULT_PROMPT_03,
  keepCards = [
    { image: 'assets/gather_beige.jpg', label: '米色版' },
    { image: 'assets/gather_dark.jpg', label: '深色版' },
    { image: 'assets/gather_light.jpg', label: '浅色版' },
  ],
  extraCards = DEFAULT_CARDS,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // 0..135f: PILE (12 cards floating at top + ?)
  // 135..210f: DROPPING (staggered gravity bounce from above)
  // 210..315f: GATHER (fan out into 26° arc, highlight 3 hero cards)
  // 315..end: KEEP 3 (other 9 accelerate downward under gravity y += g*t^2 and spin out!)
  const phase = frame < 135 ? 'PILE' : frame < 210 ? 'DROPPING' : frame < 315 ? 'GATHER' : 'KEEP 3';
  const gatherP = spring({ frame: Math.max(0, frame - 210), fps, config: { damping: 14, stiffness: 105 } });
  const ejectT = Math.max(0, (frame - 315) / 28); // quadratic gravity acceleration!
  const remainingExtra = phase === 'KEEP 3' ? Math.max(0, 9 - Math.floor(ejectT * 9)) : 9;

  return (
    <HudFrame
      moveIndex={moveIndex}
      totalMoves={totalMoves}
      titleZh={titleZh}
      titleEn={titleEn}
      cameraMoving={false}
      status={phase}
      metrics={[
        { labelEn: 'TOTAL -> KEEP', labelZh: '总数留几张', value: `${3 + remainingExtra} → 3`, accent: phase === 'KEEP 3' },
        { labelEn: 'FAN', labelZh: '扇形角度', value: '26°' },
        { labelEn: 'DROP', labelZh: '落下时间', value: '0.5 s' },
      ]}
      graphMode="curve"
      graphProgress={phase === 'PILE' ? 0.15 : phase === 'DROPPING' ? 0.45 : phase === 'GATHER' ? 0.78 : 1}
      promptTokens={promptTokens}
      promptStartFrame={150}
    >
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
        {phase === 'PILE' && (
          <div style={{ position: 'absolute', left: '50%', top: '58%', transform: 'translate(-50%, -50%)', fontFamily: FONTS.display, fontSize: 120, fontWeight: 900, color: COLORS.amber, opacity: 0.85 }}>
            ?
          </div>
        )}

        {phase === 'KEEP 3' && frame > 340 && (
          <div style={{ position: 'absolute', top: 34, left: '50%', transform: 'translateX(-50%)', display: 'flex', alignItems: 'center', gap: 12, zIndex: 30 }}>
            <div style={{ backgroundColor: COLORS.amber, color: '#111318', padding: '7px 18px', borderRadius: 10, fontSize: 22, fontWeight: 800 }}>
              挑出来的 3 个
            </div>
            <div style={{ width: 34, height: 34, borderRadius: '50%', backgroundColor: COLORS.green, color: '#111318', fontWeight: 900, fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              ✓
            </div>
          </div>
        )}

        {/* 9 Extra cards: staggered drop + true quadratic gravity eject */}
        {Array.from({ length: 9 }).map((_, i) => {
          const src = extraCards[i % extraCards.length];
          const dropP = spring({ frame: Math.max(0, frame - 135 - i * 3), fps, config: { damping: 12, stiffness: 95 } });
          const pileX = 160 + i * 95;
          const pileY = 26 + (i % 3) * 14;
          const centerX = 240 + (i - 4) * 76 + 280;
          const centerY = 275 + (i % 2) * 26;
          const localEject = Math.max(0, ejectT - i * 0.06);
          const gravityY = localEject * localEject * 680;
          const x = interpolate(dropP, [0, 1], [pileX, centerX]) + localEject * (i < 4 ? -90 : 90);
          const y = phase === 'KEEP 3' ? centerY + gravityY : interpolate(dropP, [0, 1], [pileY, centerY]);
          const rot = (i - 4) * 10 + localEject * (i % 2 === 0 ? -55 : 55);
          const opacity = phase === 'KEEP 3' ? Math.max(0, 0.78 - localEject * 0.85) : 0.75;

          return (
            <div
              key={`extra-${i}`}
              style={{
                position: 'absolute',
                left: x - 110,
                top: y - 72,
                width: 220,
                height: 144,
                borderRadius: 10,
                overflow: 'hidden',
                border: '1px solid rgba(255,255,255,0.16)',
                transform: `rotate(${rot}deg)`,
                opacity,
                zIndex: 5,
              }}
            >
              <Img src={staticFile(src)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          );
        })}

        {/* 3 Chosen Hero Cards fanning into 26° arc */}
        {keepCards.map((c, idx) => {
          const fanOffsets = [
            { x: 315, y: 312, rot: -13 },
            { x: 565, y: 280, rot: 0 },
            { x: 815, y: 312, rot: 13 },
          ];
          const target = fanOffsets[idx];
          const dropP = spring({ frame: Math.max(0, frame - 140 - idx * 5), fps, config: { damping: 13, stiffness: 100 } });
          const x = interpolate(dropP, [0, 1], [320 + idx * 240, target.x]);
          const y = interpolate(dropP, [0, 1], [44, target.y]);
          const rot = interpolate(gatherP, [0, 1], [(idx - 1) * 4, target.rot]);
          const scale = interpolate(gatherP, [0, 1], [0.86, 1.14]);

          return (
            <div
              key={`keep-${idx}`}
              style={{
                position: 'absolute',
                left: x - 145,
                top: y - 94,
                width: 290,
                height: 188,
                transform: `rotate(${rot}deg) scale(${scale})`,
                zIndex: 15 + idx,
              }}
            >
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: 14,
                  overflow: 'hidden',
                  border: `2.5px solid rgba(245, 166, 35, ${0.25 + 0.75 * gatherP})`,
                  boxShadow: `0 0 ${32 * gatherP}px rgba(245, 166, 35, ${0.48 * gatherP}), 0 18px 40px rgba(0,0,0,0.6)`,
                }}
              >
                <Img src={staticFile(c.image)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              {gatherP > 0.4 && (
                <div style={{ position: 'absolute', bottom: -16, left: '50%', transform: 'translateX(-50%)', backgroundColor: COLORS.amber, color: '#111318', padding: '4px 14px', borderRadius: 6, fontSize: 16, fontWeight: 800, whiteSpace: 'nowrap', opacity: gatherP }}>
                  {c.label}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </HudFrame>
  );
};
