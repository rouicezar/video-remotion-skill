import React from 'react';
import { Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { PromptBar } from '../../design/Chrome';
import { COLORS, FONTS } from '../../design/tokens';

const GALLERY = [
  'assets/card_01.jpg',
  'assets/card_02.jpg',
  'assets/card_03.jpg',
  'assets/card_04.jpg',
  'assets/card_05.jpg',
  'assets/card_06.jpg',
  'assets/card_07.jpg',
  'assets/card_08.jpg',
  'assets/arch_01.jpg',
];

export const IntroHookScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // 0..55f (0.0-1.83s): 3D floating photo cloud
  // 55..98f (1.83-3.27s): 3D Dunhuang ring showcase
  // 98..185f (3.27-6.17s): PPT window + VISUAL IMPACT dropping meter
  // 185..240f (6.17-8.0s): 9-card preview grid
  // 240..323f (8.0-10.76s): Glowing Dunhuang hero card
  if (frame < 55) {
    return (
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', perspective: 1100 }}>
        {GALLERY.map((src, i) => {
          const angle = ((i - 4) / 4) * 28;
          const x = (i - 4) * 85;
          const y = Math.sin(i * 1.4 + frame * 0.08) * 35;
          const z = -Math.abs(i - 4) * 50 + frame * 2;
          const pop = spring({ frame: Math.max(0, frame - i * 2), fps, config: { damping: 14, stiffness: 120 } });
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                width: 260,
                height: 170,
                borderRadius: 12,
                overflow: 'hidden',
                border: '1.5px solid rgba(255,255,255,0.2)',
                boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
                transform: `translate3d(${x}px, ${y}px, ${z}px) rotateY(${angle}deg) scale(${pop})`,
              }}
            >
              <Img src={staticFile(src)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          );
        })}
      </div>
    );
  }

  if (frame < 98) {
    const f = frame - 55;
    return (
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', perspective: 1000 }}>
        <div
          style={{
            width: 0,
            height: 0,
            transformStyle: 'preserve-3d',
            transform: `rotateY(${f * 2.2}deg)`,
          }}
        >
          {['assets/dunhuang_01.jpg', 'assets/dunhuang_02.jpg', 'assets/dunhuang_03.jpg', 'assets/dunhuang_04.jpg', 'assets/dunhuang_05.jpg', 'assets/dunhuang_06.jpg'].map((src, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: -180,
                top: -120,
                width: 360,
                height: 240,
                borderRadius: 12,
                overflow: 'hidden',
                border: `1.5px solid ${COLORS.amberBorder}`,
                transform: `rotateY(${i * 60}deg) translateZ(380px)`,
                opacity: 0.9,
              }}
            >
              <Img src={staticFile(src)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (frame < 185) {
    const f = frame - 98;
    const slideIdx = Math.floor(f / 26) % 4;
    const impactPct = interpolate(f, [15, 75], [82, 12], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
    return (
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 56 }}>
        {/* Mock PowerPoint Window */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ fontSize: 38, fontWeight: 700, color: COLORS.textPrimary }}>就像在翻 PPT</div>
          <div
            style={{
              width: 1120,
              height: 670,
              backgroundColor: '#e5e7eb',
              borderRadius: 14,
              overflow: 'hidden',
              boxShadow: '0 24px 60px rgba(0,0,0,0.6)',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* macOS Titlebar */}
            <div style={{ height: 38, backgroundColor: '#d1d5db', display: 'flex', alignItems: 'center', padding: '0 16px', gap: 8 }}>
              <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#ef4444' }} />
              <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#f59e0b' }} />
              <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#22c55e' }} />
              <div style={{ marginLeft: 14, fontSize: 15, color: '#374151', fontWeight: 600 }}>我的视频素材.pptx</div>
            </div>
            <div style={{ flex: 1, display: 'flex', padding: 14, gap: 14 }}>
              {/* Left thumbnail rail */}
              <div style={{ width: 150, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {GALLERY.slice(0, 6).map((src, i) => (
                  <div
                    key={i}
                    style={{
                      height: 84,
                      borderRadius: 4,
                      overflow: 'hidden',
                      border: i === slideIdx ? `3px solid ${COLORS.amber}` : '1px solid #9ca3af',
                    }}
                  >
                    <Img src={staticFile(src)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                ))}
              </div>
              {/* Main slide */}
              <div style={{ flex: 1, backgroundColor: '#fff', borderRadius: 4, overflow: 'hidden', position: 'relative' }}>
                <Img src={staticFile(GALLERY[slideIdx])} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', bottom: 10, right: 16, fontSize: 18, color: '#111', backgroundColor: 'rgba(255,255,255,0.8)', padding: '2px 10px', borderRadius: 4 }}>
                  {slideIdx + 1} / 9
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Visual Impact Dropping Meter */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
          <div style={{ fontFamily: FONTS.mono, fontSize: 13, letterSpacing: 2, color: COLORS.textMuted }}>VISUAL IMPACT</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: COLORS.textPrimary }}>视觉冲击力</div>
          <div
            style={{
              width: 56,
              height: 360,
              borderRadius: 28,
              backgroundColor: '#1b1f2a',
              border: `1.5px solid ${COLORS.border}`,
              padding: 6,
              display: 'flex',
              alignItems: 'flex-end',
            }}
          >
            <div
              style={{
                width: '100%',
                height: `${impactPct}%`,
                borderRadius: 22,
                background: impactPct < 30 ? COLORS.red : COLORS.amber,
                boxShadow: `0 0 24px ${impactPct < 30 ? 'rgba(239,83,80,0.5)' : COLORS.amberGlow}`,
              }}
            />
          </div>
          <div style={{ fontFamily: FONTS.mono, fontSize: 26, fontWeight: 800, color: impactPct < 30 ? COLORS.red : COLORS.amber }}>
            {Math.round(impactPct)}%
          </div>
        </div>
      </div>
    );
  }

  if (frame < 240) {
    const f = frame - 185;
    const labels = [
      '01 骨架填充', '02 发牌入场', '03 落下收拢',
      '04 纵深穿梭', '05 环筒螺旋', '06 三维翻转',
      '07 放大让位', '08 背景换色', '09 切片换图',
    ];
    return (
      <div style={{ position: 'absolute', inset: '90px 260px 180px 260px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 22 }}>
        {labels.map((lbl, i) => {
          const pop = spring({ frame: Math.max(0, f - i * 3), fps, config: { damping: 14, stiffness: 140 } });
          return (
            <div
              key={i}
              style={{
                borderRadius: 12,
                overflow: 'hidden',
                backgroundColor: COLORS.surface,
                border: `1.5px solid ${COLORS.border}`,
                transform: `scale(${pop})`,
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <Img src={staticFile(GALLERY[i % GALLERY.length])} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={{ padding: '8px 14px', fontSize: 18, fontWeight: 700, color: COLORS.amber }}>{lbl}</div>
            </div>
          );
        })}
      </div>
    );
  }

  // 240..323f: Glowing Dunhuang Hero Card
  const f = frame - 240;
  const s = spring({ frame: f, fps, config: { damping: 16, stiffness: 90 } });
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div
        style={{
          width: 820,
          height: 540,
          borderRadius: 18,
          overflow: 'hidden',
          border: `2px solid ${COLORS.amberBorder}`,
          boxShadow: `0 0 90px ${COLORS.amberGlow}, 0 30px 70px rgba(0,0,0,0.7)`,
          transform: `scale(${interpolate(s, [0, 1], [0.85, 1.03])})`,
        }}
      >
        <Img src={staticFile('assets/dunhuang_01.jpg')} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>
    </div>
  );
};

export const Episode1RecapScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 16, stiffness: 120 } });

  const ep1Moves = [
    ['01 世界画布', '铺一块 #111318 的深色大画布，叠一层很淡的 Xuan 字墙慢慢漂'],
    ['02 倾斜摆放', '每张素材自己斜一点：左右偏 8-18°，镜头再往反方向偏一点'],
    ['03 景深分层', '把画面分成近、中、远三层：离焦点越远越虚 0 / 4 / 8px'],
    ['04 斜向运镜', '换素材时不硬切，镜头斜着推过去、路上多绕 7-10°'],
    ['05 缓慢推进', '停在素材上时不完全静止：镜头每秒往前推 3%'],
    ['06 走进画面', '讲流程、时间线时把内容铺成一条路：地面倾 70°'],
    ['07 背景虚化', '新内容出现时，原来那一层整体往后退到 94%、变暗到 55%'],
    ['08 原位放大', '从多个内容里挑出重点讲时不切换新画面，直接放大 2.4 倍'],
  ];

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 28,
        paddingBottom: 90,
        transform: `scale(${interpolate(enter, [0, 1], [0.94, 1])})`,
      }}
    >
      {/* Top Pill */}
      <div
        style={{
          padding: '16px 46px',
          borderRadius: 18,
          border: `2px solid ${COLORS.amberBorder}`,
          backgroundColor: 'rgba(17,19,24,0.9)',
          display: 'flex',
          alignItems: 'baseline',
          gap: 16,
        }}
      >
        <span style={{ fontSize: 42, fontWeight: 800, color: COLORS.amber }}>第</span>
        <span style={{ fontFamily: FONTS.display, fontSize: 82, fontWeight: 900, color: COLORS.amber, lineHeight: 0.9 }}>1</span>
        <span style={{ fontSize: 42, fontWeight: 800, color: COLORS.amber }}>期</span>
        <span style={{ fontSize: 52, fontWeight: 800, color: COLORS.white, marginLeft: 8 }}>空间与运镜</span>
        <span style={{ fontSize: 28, fontWeight: 700, color: COLORS.textSecondary, marginLeft: 8 }}>8 招</span>
      </div>

      {/* 8-Move Prompt Board */}
      <div
        style={{
          width: 1180,
          borderRadius: 18,
          backgroundColor: COLORS.surface,
          border: `1.5px solid ${COLORS.amberBorder}`,
          padding: '26px 32px',
          boxShadow: '0 24px 60px rgba(0,0,0,0.6)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 18 }}>
          <span style={{ fontFamily: FONTS.display, fontSize: 38, fontWeight: 900, color: COLORS.amber }}>8</span>
          <span style={{ fontSize: 28, fontWeight: 800 }}>招 · AI 描述词</span>
          <span style={{ fontFamily: FONTS.mono, fontSize: 13, color: COLORS.textMuted, letterSpacing: 2 }}>PROMPTS · 截图就能用</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          {ep1Moves.map(([title, desc], i) => (
            <div
              key={i}
              style={{
                backgroundColor: COLORS.surfaceLight,
                borderRadius: 10,
                padding: '12px 16px',
                border: `1px solid ${COLORS.border}`,
              }}
            >
              <div style={{ fontSize: 18, fontWeight: 800, color: COLORS.amber, marginBottom: 4 }}>{title}</div>
              <div style={{ fontSize: 14, color: COLORS.textSecondary, lineHeight: 1.4 }}>{desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const Episode2OverviewScene: React.FC<{
  badgeText?: string;
  groups?: Array<{
    num: string;
    title: string;
    moves: Array<{ num: string; title: string; image: string }>;
  }>;
}> = ({
  badgeText = '第 2 期  图片与转场',
  groups = [
    {
      num: '01',
      title: '出场',
      moves: [
        { num: '01', title: '骨架填充', image: 'assets/ui_m1_filled.jpg' },
        { num: '02', title: '发牌入场', image: 'assets/card_03.jpg' },
        { num: '03', title: '落下收拢', image: 'assets/gather_dark.jpg' },
      ],
    },
    {
      num: '02',
      title: '排布',
      moves: [
        { num: '04', title: '纵深穿梭', image: 'assets/card_06.jpg' },
        { num: '05', title: '环筒螺旋', image: 'assets/card_04.jpg' },
        { num: '06', title: '三维翻转', image: 'assets/dunhuang_01.jpg' },
      ],
    },
    {
      num: '03',
      title: '切换',
      moves: [
        { num: '07', title: '放大让位', image: 'assets/xuan_blue.jpg' },
        { num: '08', title: '背景换色', image: 'assets/xuan_green.jpg' },
        { num: '09', title: '切片换图', image: 'assets/arch_01.jpg' },
      ],
    },
  ],
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Sub-beats across ~20.8s (624f):
  // 0..115f: Badge + fanned photo deck -> horizontal strip + big amber 9招 counter
  // 115..390f: 3-column Overview matrix (+ ? highlight at 320..390f)
  // 390..480f: "谁在动?" camera + 3-images diagram
  // 480..end: 3-column Overview matrix + bottom AI 描述词 typewriter bar
  const showStrip = frame < 115;
  const showWhoMoves = frame >= 390 && frame < 480;
  const showQuestion = frame >= 310 && frame < 390;
  const showPrompt = frame >= 480;

  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      {/* Top-Left Amber Episode Badge */}
      <div
        style={{
          position: 'absolute',
          top: 56,
          left: 100,
          backgroundColor: COLORS.amber,
          color: '#111318',
          padding: '14px 36px',
          borderRadius: 16,
          fontSize: 44,
          fontWeight: 900,
          letterSpacing: 2,
          boxShadow: `0 10px 30px ${COLORS.amberGlow}`,
        }}
      >
        {badgeText}
      </div>

      {showStrip ? (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            {GALLERY.slice(0, 6).map((src, i) => {
              const spread = spring({ frame: Math.max(0, frame - 45), fps, config: { damping: 14, stiffness: 100 } });
              const x = interpolate(spread, [0, 1], [(2.5 - i) * 140, 0]);
              const rot = interpolate(spread, [0, 1], [(i - 2.5) * 6, 0]);
              return (
                <div
                  key={i}
                  style={{
                    width: 220,
                    height: 155,
                    borderRadius: 12,
                    overflow: 'hidden',
                    border: '1.5px solid rgba(255,255,255,0.2)',
                    transform: `translateX(${x}px) rotate(${rot}deg)`,
                    boxShadow: '0 14px 36px rgba(0,0,0,0.55)',
                  }}
                >
                  <Img src={staticFile(src)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              );
            })}
          </div>
          {frame > 55 && (
            <div
              style={{
                position: 'absolute',
                right: 170,
                top: 230,
                display: 'flex',
                alignItems: 'baseline',
                gap: 6,
              }}
            >
              <span style={{ fontFamily: FONTS.display, fontSize: 140, fontWeight: 900, color: COLORS.amber, lineHeight: 0.9 }}>
                {Math.min(9, 1 + Math.floor((frame - 55) / 6))}
              </span>
              <span style={{ fontSize: 42, fontWeight: 800, color: COLORS.amber }}>招</span>
            </div>
          )}
        </div>
      ) : showWhoMoves ? (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div
            style={{
              width: 960,
              height: 460,
              borderRadius: 20,
              backgroundColor: COLORS.surface,
              border: `1.5px solid ${COLORS.border}`,
              padding: 36,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ alignSelf: 'flex-start', fontSize: 28, fontWeight: 700, color: COLORS.textPrimary }}>谁在动？</div>
            <div style={{ display: 'flex', gap: 24 }}>
              {GALLERY.slice(0, 3).map((src, i) => (
                <div
                  key={i}
                  style={{
                    width: 240,
                    height: 165,
                    borderRadius: 12,
                    overflow: 'hidden',
                    border: `2px solid ${COLORS.amberBorder}`,
                    transform: `translateY(${Math.sin(frame * 0.15 + i) * 8}px)`,
                  }}
                >
                  <Img src={staticFile(src)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              ))}
            </div>
            {/* Camera icon */}
            <div
              style={{
                width: 90,
                height: 54,
                borderRadius: 12,
                border: `2.5px solid ${COLORS.textSecondary}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transform: `translateX(${Math.sin(frame * 0.12) * 30}px)`,
              }}
            >
              <div style={{ width: 22, height: 22, borderRadius: '50%', border: `2.5px solid ${COLORS.amber}` }} />
            </div>
          </div>
        </div>
      ) : (
        <div
          style={{
            position: 'absolute',
            top: showPrompt ? 190 : 250,
            left: 110,
            right: 110,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          {showQuestion && (
            <div style={{ fontFamily: FONTS.display, fontSize: 64, fontWeight: 900, color: COLORS.amber, marginBottom: 4 }}>?</div>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 42, width: '100%' }}>
            {groups.map((g, gi) => {
              const pop = spring({
                frame: Math.max(0, frame - 115 - gi * 10),
                fps,
                config: { damping: 16, stiffness: 120 },
              });
              return (
                <div
                  key={g.num}
                  style={{
                    backgroundColor: COLORS.surface,
                    borderRadius: 22,
                    border: `1.5px solid ${COLORS.border}`,
                    padding: '28px 26px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 16,
                    boxShadow: '0 22px 54px rgba(0,0,0,0.5)',
                    transform: `scale(${pop})`,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 12, marginBottom: 6 }}>
                    <span style={{ fontFamily: FONTS.display, fontSize: 52, fontWeight: 900, color: COLORS.amber }}>{g.num}</span>
                    <span style={{ fontSize: 40, fontWeight: 800, color: COLORS.white }}>{g.title}</span>
                  </div>
                  {g.moves.map((m) => (
                    <div
                      key={m.num}
                      style={{
                        backgroundColor: 'rgba(13,16,22,0.75)',
                        borderRadius: 14,
                        border: `1px solid ${COLORS.border}`,
                        padding: '12px 16px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 16,
                      }}
                    >
                      <div style={{ width: 92, height: 60, borderRadius: 8, overflow: 'hidden', flexShrink: 0 }}>
                        <Img src={staticFile(m.image)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                      <span style={{ fontFamily: FONTS.display, fontSize: 34, fontWeight: 900, color: COLORS.amber }}>{m.num}</span>
                      <span style={{ fontSize: 28, fontWeight: 700, color: COLORS.textPrimary }}>{m.title}</span>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>

          {showPrompt && (
            <div style={{ width: '100%', marginTop: 18 }}>
              <PromptBar
                startFrame={485}
                tokens={[
                  { text: '一组图 ' },
                  { text: '不要同时出现', highlight: true },
                  { text: '，像发牌一样 ' },
                  { text: '一张接一张飞进来', highlight: true },
                  { text: '，沿 ' },
                  { text: '弧线', highlight: true },
                  { text: ' 落到各自位置，每张 ' },
                  { text: '错开 0.1 秒', highlight: true },
                ]}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
