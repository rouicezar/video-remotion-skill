import React from 'react';
import { Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { COLORS, FONTS } from '../../design/tokens';

const CHEATSHEET_ITEMS = [
  { num: '01', title: '骨架填充', cat: '出场', img: 'assets/ui_m1_filled.jpg', prompt: '复杂界面先出灰色骨架线框，再按阅读顺序一块块填进真实内容，每块间隔 0.15 秒，让观众先看懂结构' },
  { num: '02', title: '发牌入场', cat: '出场', img: 'assets/card_03.jpg', prompt: '一组图不要同时出现，像发牌一样一张接一张飞进来，沿弧线落到各自位置，每张错开 0.1 秒' },
  { num: '03', title: '落下收拢', cat: '出场', img: 'assets/gather_dark.jpg', prompt: '从很多里挑几个讲时：一堆图从上方落下，收拢成扇形只留要讲的 3 张，其余掉出画面' },
  { num: '04', title: '纵深穿梭', cat: '排布', img: 'assets/card_06.jpg', prompt: '作品沿纵深方向每隔一段排开、左右交替，镜头连续往前推、每件约 0.7 秒，穿过的放大变虚' },
  { num: '05', title: '环筒螺旋', cat: '排布', img: 'assets/card_04.jpg', prompt: '图围着中心排成圆筒，每层 6 到 8 张、一层层往上，相机绕着转先快后慢转开，再匀速慢慢抬高' },
  { num: '06', title: '三维翻转', cat: '排布', img: 'assets/dunhuang_01.jpg', prompt: '封面和介绍拼成一块展板，一块接一块往上滚，每块绕横轴大角度翻转，其余压暗到 30%' },
  { num: '07', title: '放大让位', cat: '切换', img: 'assets/xuan_blue.jpg', prompt: '一排图排成扇形，讲到谁谁就抬起放大到 1.3 倍，左右往两边让开，其他图都还看得见' },
  { num: '08', title: '背景换色', cat: '切换', img: 'assets/xuan_green.jpg', prompt: '换图时，背景整块换成这张图的主色，用时 0.5 秒，观众一眼知道换了，节奏不被打断' },
  { num: '09', title: '切片换图', cat: '切换', img: 'assets/arch_01.jpg', prompt: '一长串同类图换图时，切成 5 条，新图一条条从下面长上来、每条错开 0.07 秒，编号同步翻牌' },
];

export const SummaryRecapScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // 0..105f: "9 总结 招回顾 · 同样一组图" horizontal strip
  // 105..end: 3x3 categorized grid (出场 / 排布 / 切换) with PPT -> green checkmark badge
  if (frame < 105) {
    const enter = spring({ frame, fps, config: { damping: 16, stiffness: 110 } });
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
          paddingBottom: 110,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, transform: `scale(${enter})` }}>
          <span style={{ fontFamily: FONTS.display, fontSize: 130, fontWeight: 900, color: COLORS.amber, lineHeight: 0.9 }}>9</span>
          <div>
            <div style={{ fontSize: 24, fontWeight: 700, color: COLORS.amber }}>总结</div>
            <div style={{ fontSize: 60, fontWeight: 900, color: COLORS.white, lineHeight: 1.0 }}>招回顾</div>
          </div>
        </div>
        <div style={{ fontSize: 28, color: COLORS.textSecondary, fontWeight: 600 }}>同样一组图</div>
        <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
          {['assets/card_01.jpg', 'assets/card_02.jpg', 'assets/card_03.jpg', 'assets/card_04.jpg', 'assets/card_05.jpg', 'assets/card_06.jpg', 'assets/card_07.jpg', 'assets/card_08.jpg'].map((src, i) => (
            <div
              key={i}
              style={{
                width: 195,
                height: 128,
                borderRadius: 10,
                overflow: 'hidden',
                border: '1px solid rgba(255,255,255,0.18)',
                transform: `translateY(${Math.sin(frame * 0.1 + i * 0.6) * 6}px)`,
              }}
            >
              <Img src={staticFile(src)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const f = frame - 105;
  const rows = [
    { label: '出场', items: CHEATSHEET_ITEMS.slice(0, 3) },
    { label: '排布', items: CHEATSHEET_ITEMS.slice(3, 6) },
    { label: '切换', items: CHEATSHEET_ITEMS.slice(6, 9) },
  ];

  return (
    <div style={{ position: 'absolute', inset: '72px 170px 170px 170px', display: 'flex', flexDirection: 'column', gap: 20, justifyContent: 'center' }}>
      {rows.map((row, ri) => (
        <div key={row.label} style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
          <div style={{ width: 90, fontSize: 32, fontWeight: 800, color: COLORS.amber, textAlign: 'right' }}>{row.label}</div>
          <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 22 }}>
            {row.items.map((it, ci) => {
              const pop = spring({ frame: Math.max(0, f - (ri * 3 + ci) * 4), fps, config: { damping: 14, stiffness: 120 } });
              return (
                <div
                  key={it.num}
                  style={{
                    height: 220,
                    borderRadius: 14,
                    overflow: 'hidden',
                    backgroundColor: COLORS.surface,
                    border: `1.5px solid ${COLORS.border}`,
                    position: 'relative',
                    transform: `scale(${pop})`,
                  }}
                >
                  <Img src={staticFile(it.img)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div
                    style={{
                      position: 'absolute',
                      left: 12,
                      bottom: 12,
                      backgroundColor: 'rgba(13,16,22,0.88)',
                      padding: '4px 12px',
                      borderRadius: 8,
                      fontSize: 18,
                      fontWeight: 700,
                      color: COLORS.amber,
                    }}
                  >
                    {it.num} {it.title}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Center PPT -> Checkmark badge */}
      {f > 40 && (
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            display: 'flex',
            alignItems: 'center',
            gap: 20,
            backgroundColor: 'rgba(17,19,24,0.92)',
            padding: '18px 34px',
            borderRadius: 20,
            border: `2px solid ${COLORS.amber}`,
            boxShadow: '0 20px 60px rgba(0,0,0,0.75)',
          }}
        >
          <span style={{ fontSize: 44, fontWeight: 900, color: COLORS.red, textDecoration: 'line-through' }}>PPT</span>
          <div
            style={{
              width: 58,
              height: 58,
              borderRadius: '50%',
              backgroundColor: COLORS.green,
              color: '#111318',
              fontSize: 34,
              fontWeight: 900,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            ✓
          </div>
        </div>
      )}
    </div>
  );
};

export const CheatSheetCTAScene: React.FC<{
  titlePrefix?: string;
  countNum?: string;
  episodeSubtitle?: string;
  ctaText?: string;
  ctaDelayFrames?: number;
  items?: Array<{ num: string; title: string; cat: string; img?: string; prompt: string }>;
}> = ({
  titlePrefix = '招 · AI 描述词',
  countNum = '9',
  episodeSubtitle = '第 2 期 · 图片与转场  PROMPTS  ·  截图就能用',
  ctaText = '你最想先试第几招？',
  ctaDelayFrames = 95,
  items = CHEATSHEET_ITEMS,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 16, stiffness: 120 } });
  const ctaPop = spring({ frame: Math.max(0, frame - ctaDelayFrames), fps, config: { damping: 12, stiffness: 140 } });

  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      {/* Main 3x3 Cheat-Sheet Board */}
      <div
        style={{
          position: 'absolute',
          top: 72,
          left: 140,
          right: 140,
          bottom: 92,
          borderRadius: 22,
          backgroundColor: COLORS.surface,
          border: `1.5px solid ${COLORS.amberBorder}`,
          padding: '28px 34px',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 26px 70px rgba(0,0,0,0.65)',
          transform: `scale(${interpolate(enter, [0, 1], [0.95, 1])})`,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, marginBottom: 20 }}>
          <span style={{ fontFamily: FONTS.display, fontSize: 64, fontWeight: 900, color: COLORS.amber, lineHeight: 0.9 }}>
            {countNum}
          </span>
          <span style={{ fontSize: 40, fontWeight: 900, color: COLORS.white }}>{titlePrefix}</span>
          <span style={{ fontSize: 20, color: COLORS.textSecondary, marginLeft: 10 }}>{episodeSubtitle}</span>
        </div>

        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18 }}>
          {items.map((it) => (
            <div
              key={it.num}
              style={{
                backgroundColor: 'rgba(13,16,22,0.72)',
                borderRadius: 14,
                border: `1px solid ${COLORS.border}`,
                padding: '16px 18px',
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  {it.img ? (
                    <div style={{ width: 64, height: 42, borderRadius: 6, overflow: 'hidden', flexShrink: 0 }}>
                      <Img src={staticFile(it.img)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  ) : null}
                  <div
                    style={{
                      backgroundColor: COLORS.amber,
                      color: '#111318',
                      fontFamily: FONTS.display,
                      fontWeight: 900,
                      fontSize: 24,
                      padding: '2px 8px',
                      borderRadius: 6,
                    }}
                  >
                    {it.num}
                  </div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: COLORS.white }}>{it.title}</div>
                </div>
                <div style={{ fontSize: 15, color: COLORS.textMuted }}>{it.cat}</div>
              </div>
              <div style={{ fontSize: 16, color: COLORS.textSecondary, lineHeight: 1.5 }}>{it.prompt}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Center Glowing Amber Pill CTA */}
      {frame >= ctaDelayFrames && (
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: `translate(-50%, -50%) scale(${ctaPop})`,
            backgroundColor: COLORS.amber,
            color: '#111318',
            padding: '28px 66px',
            borderRadius: 24,
            fontSize: 74,
            fontWeight: 900,
            letterSpacing: 2,
            boxShadow: `0 0 80px ${COLORS.amberGlow}, 0 24px 60px rgba(0,0,0,0.75)`,
            zIndex: 40,
            whiteSpace: 'nowrap',
          }}
        >
          {ctaText}
        </div>
      )}
    </div>
  );
};
