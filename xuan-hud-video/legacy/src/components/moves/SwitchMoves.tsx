import React from 'react';
import { Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { CornerBrackets, HudFrame } from '../../design/Chrome';
import { COLORS, FONTS } from '../../design/tokens';
import { PromptToken } from '../../types/timeline';

const XUAN_CHARS = [
  { image: 'assets/xuan_gray.jpg', cutout: 'assets/xuan_gray_cutout.png', label: '灰', bgHex: '#8E8B88' },
  { image: 'assets/xuan_orange.jpg', cutout: 'assets/xuan_orange_cutout.png', label: '橙', bgHex: '#EE8458' },
  { image: 'assets/xuan_green.jpg', cutout: 'assets/xuan_green_cutout.png', label: '绿', bgHex: '#5E8C61' },
  { image: 'assets/xuan_blue.jpg', cutout: 'assets/xuan_blue_cutout.png', label: '蓝', bgHex: '#74B3F5' },
  { image: 'assets/xuan_pink.jpg', cutout: 'assets/xuan_pink_cutout.png', label: '粉', bgHex: '#E88BA8' },
];

const DEFAULT_PROMPT_07: PromptToken[] = [
  { text: '一排图 ' },
  { text: '排成扇形', highlight: true },
  { text: '，讲到谁 ' },
  { text: '谁就抬起放大到 1.3 倍', highlight: true },
  { text: '，左右往两边让开，其他图 ' },
  { text: '都还看得见', highlight: true },
  { text: '；也可以 ' },
  { text: '排成圆环匀速转', highlight: true },
  { text: '，转到 ' },
  { text: '正前方的那张放大', highlight: true },
];

export const Move07LiftMakeWayDemo: React.FC<{
  moveIndex?: number;
  totalMoves?: number;
  titleZh?: string;
  titleEn?: string;
  promptTokens?: PromptToken[];
  items?: Array<{ image: string; label: string }>;
}> = ({
  moveIndex = 7,
  totalMoves = 9,
  titleZh = '放大让位',
  titleEn = 'LIFT & MAKE WAY',
  promptTokens = DEFAULT_PROMPT_07,
  items = XUAN_CHARS,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const isFan = frame < 52;
  const isRing = frame >= 310;
  const sequence = [2, 3, 4, 1];
  const stepDur = 64;
  const stepIdx = isFan ? -1 : Math.min(sequence.length - 1, Math.floor((frame - 52) / stepDur));
  const activeIdx = stepIdx >= 0 ? sequence[stepIdx] : -1;
  const prevActiveIdx = stepIdx > 0 ? sequence[stepIdx - 1] : -1;
  const localStepFrame = isFan ? 0 : (frame - 52) % stepDur;
  const transP = spring({ frame: localStepFrame, fps, config: { damping: 14, stiffness: 115 } });

  const status = isFan ? 'FAN' : isRing ? 'RING' : 'LIFT';
  const activeLabel = activeIdx >= 0 ? `第 ${activeIdx + 1} / ${items.length} 张` : '—';

  const getPose = (i: number, act: number) => {
    const baseX = 165 + i * 208;
    const baseY = 278 + Math.abs(i - 2) * 24;
    const baseRot = (i - 2) * 7;
    if (act < 0) return { x: baseX, y: baseY, rot: baseRot, scale: 0.96 };
    if (i === act) return { x: baseX, y: baseY - 88, rot: 0, scale: 1.3 };
    return { x: baseX + (i < act ? -88 : 88), y: baseY, rot: baseRot, scale: 0.94 };
  };

  return (
    <HudFrame
      moveIndex={moveIndex}
      totalMoves={totalMoves}
      titleZh={titleZh}
      titleEn={titleEn}
      cameraMoving={false}
      status={status}
      metrics={[
        { labelEn: 'ACTIVE', labelZh: '当前', value: isRing ? '第 3 / 5 张' : activeLabel, accent: !isFan },
        { labelEn: 'SCALE', labelZh: '放大', value: isFan ? '1.00×' : '1.30×' },
        { labelEn: 'SHIFT', labelZh: '左右让位', value: '+90 px' },
      ]}
      graphMode={isFan ? 'flat' : 'curve'}
      graphProgress={isFan ? 0.1 : transP}
      promptTokens={promptTokens}
      promptStartFrame={75}
    >
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
        {!isFan && !isRing && (
          <div style={{ position: 'absolute', top: 22, left: 28, display: 'flex', alignItems: 'center', gap: 12, zIndex: 30 }}>
            <div style={{ padding: '4px 12px', borderRadius: 6, border: `1px solid ${COLORS.amberBorder}`, fontFamily: FONTS.mono, fontSize: 16 }}>1.0</div>
            <div style={{ width: 90, height: 3, backgroundColor: COLORS.amber }} />
            <div style={{ padding: '5px 14px', borderRadius: 6, backgroundColor: COLORS.amber, color: '#111318', fontFamily: FONTS.mono, fontSize: 17, fontWeight: 800 }}>1.30×</div>
          </div>
        )}

        {isRing ? (
          <div style={{ position: 'absolute', inset: 0, perspective: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ position: 'absolute', top: 18, left: 22, backgroundColor: COLORS.amber, color: '#111318', padding: '5px 14px', borderRadius: 6, fontSize: 16, fontWeight: 800 }}>
              也可以排成圆环：转到正前方的那张放大
            </div>
            <div style={{ width: 0, height: 0, position: 'relative', transformStyle: 'preserve-3d', transform: `rotateY(${-(frame - 310) * 1.8}deg)` }}>
              {['assets/card_01.jpg', 'assets/card_03.jpg', 'assets/card_04.jpg', 'assets/card_06.jpg', 'assets/card_07.jpg'].map((src, i) => {
                const a = (i / 5) * 360;
                const worldRad = ((a - (frame - 310) * 1.8) * Math.PI) / 180;
                const frontBoost = 1 + Math.max(0, Math.cos(worldRad)) * 0.25;
                return (
                  <div key={i} style={{ position: 'absolute', left: -135, top: -85, width: 270, height: 170, borderRadius: 12, overflow: 'hidden', border: `1.5px solid ${COLORS.amberBorder}`, transform: `rotateY(${a}deg) translateZ(295px) scale(${frontBoost.toFixed(3)})` }}>
                    <Img src={staticFile(src)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div style={{ position: 'absolute', inset: 0 }}>
            {items.map((item, i) => {
              const fromPose = getPose(i, prevActiveIdx);
              const toPose = getPose(i, activeIdx);
              const x = interpolate(transP, [0, 1], [fromPose.x, toPose.x]);
              const y = interpolate(transP, [0, 1], [fromPose.y, toPose.y]);
              const rot = interpolate(transP, [0, 1], [fromPose.rot, toPose.rot]);
              const scale = interpolate(transP, [0, 1], [fromPose.scale, toPose.scale]);
              const isActive = i === activeIdx;

              return (
                <div
                  key={i}
                  style={{
                    position: 'absolute',
                    left: x - 92,
                    top: y - 125,
                    width: 184,
                    height: 256,
                    transform: `rotate(${rot}deg) scale(${scale})`,
                    zIndex: isActive ? 30 : 10 + i,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                  }}
                >
                  <div
                    style={{
                      width: '100%',
                      height: '100%',
                      borderRadius: 16,
                      overflow: 'hidden',
                      backgroundColor: '#f5f6f8',
                      border: isActive ? `3px solid ${COLORS.amber}` : '1.5px solid rgba(255,255,255,0.2)',
                      boxShadow: isActive ? `0 0 42px ${COLORS.amberGlow}, 0 22px 48px rgba(0,0,0,0.6)` : '0 14px 30px rgba(0,0,0,0.45)',
                    }}
                  >
                    <Img src={staticFile(item.image)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div style={{ marginTop: 10, fontSize: 20, fontWeight: 800, color: isActive ? COLORS.amberBright : COLORS.textSecondary }}>
                    {item.label}
                  </div>
                </div>
              );
            })}

            {!isFan && (
              <>
                <div style={{ position: 'absolute', bottom: 26, left: '50%', transform: 'translateX(-50%)', backgroundColor: 'rgba(13,16,22,0.88)', border: `1px solid ${COLORS.border}`, padding: '4px 14px', borderRadius: 6, fontSize: 15, color: COLORS.textSecondary }}>
                  ← 左右让开 →
                </div>
                <div style={{ position: 'absolute', bottom: 24, left: 30, fontFamily: FONTS.mono, fontSize: 13, color: COLORS.textMuted, letterSpacing: 1.5 }}>
                  🔒 CAMERA LOCKED
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </HudFrame>
  );
};

const DEFAULT_PROMPT_08: PromptToken[] = [
  { text: '换图时，' },
  { text: '背景整块换成这张图的主色', highlight: true },
  { text: '，用时 ' },
  { text: '0.5 秒', highlight: true },
  { text: '，观众 ' },
  { text: '一眼知道换了', highlight: true },
  { text: '，节奏 ' },
  { text: '不被打断', highlight: true },
];

function lerpHex(a: string, b: string, t: number): string {
  const parse = (h: string) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
  const ca = parse(a);
  const cb = parse(b);
  return `rgb(${Math.round(ca[0] + (cb[0] - ca[0]) * t)}, ${Math.round(ca[1] + (cb[1] - ca[1]) * t)}, ${Math.round(ca[2] + (cb[2] - ca[2]) * t)})`;
}

export const Move08ColorSwapDemo: React.FC<{
  moveIndex?: number;
  totalMoves?: number;
  titleZh?: string;
  titleEn?: string;
  promptTokens?: PromptToken[];
}> = ({
  moveIndex = 8,
  totalMoves = 9,
  titleZh = '背景换色',
  titleEn = 'COLOR SWAP',
  promptTokens = DEFAULT_PROMPT_08,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const slides = [
    { cutout: 'assets/xuan_orange_cutout.png', label: '橙', bgHex: '#EE8458', left: 'assets/xuan_gray_cutout.png', right: 'assets/xuan_green_cutout.png' },
    { cutout: 'assets/xuan_gray_cutout.png', label: '灰', bgHex: '#8E8B88', left: 'assets/xuan_blue_cutout.png', right: 'assets/xuan_orange_cutout.png' },
    { cutout: 'assets/xuan_blue_cutout.png', label: '蓝', bgHex: '#74B3F5', left: 'assets/xuan_pink_cutout.png', right: 'assets/xuan_gray_cutout.png' },
    { cutout: 'assets/xuan_pink_cutout.png', label: '粉', bgHex: '#E88BA8', left: 'assets/xuan_blue_cutout.png', right: 'assets/xuan_orange_cutout.png' },
  ];
  const swatches = [
    { label: '绿', hex: '#5E8C61' },
    { label: '橙', hex: '#EE8458' },
    { label: '灰', hex: '#8E8B88' },
    { label: '蓝', hex: '#74B3F5' },
    { label: '粉', hex: '#E88BA8' },
  ];

  const holdFrames = 75;
  const idx = Math.min(slides.length - 1, Math.floor(frame / holdFrames));
  const prevIdx = Math.max(0, idx - 1);
  const localFrame = frame % holdFrames;
  const swapT = interpolate(localFrame, [0, 15], [0, 1], { extrapolateRight: 'clamp' }); // exact 0.5s
  const bgColor = idx === 0 ? slides[0].bgHex : lerpHex(slides[prevIdx].bgHex, slides[idx].bgHex, swapT);

  const cur = slides[idx];
  const next = slides[(idx + 1) % slides.length];
  const enter = spring({ frame: localFrame, fps, config: { damping: 13, stiffness: 125 } });

  return (
    <HudFrame
      moveIndex={moveIndex}
      totalMoves={totalMoves}
      titleZh={titleZh}
      titleEn={titleEn}
      cameraMoving={false}
      status="SWAP"
      metrics={[
        { labelEn: 'COLOR', labelZh: '背景主色', value: cur.bgHex, accent: true },
        { labelEn: 'DURATION', labelZh: '换色时长', value: '0.5 s' },
        { labelEn: 'NEXT', labelZh: '下一张', value: next.label },
      ]}
      graphMode="step"
      graphProgress={(idx + 1) / slides.length}
      graphSteps={slides.length}
      promptTokens={promptTokens}
      promptStartFrame={30}
    >
      <div style={{ position: 'absolute', inset: '22px 26px 52px 26px', borderRadius: 16, backgroundColor: bgColor, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 16px 48px rgba(0,0,0,0.45)' }}>
        <CornerBrackets inset={14} size={18} color="rgba(255,255,255,0.65)" />

        {/* 0.5s pulse pill top-right during color swap */}
        {localFrame < 24 && (
          <div style={{ position: 'absolute', top: 18, right: 24, backgroundColor: COLORS.amber, color: '#111318', padding: '4px 12px', borderRadius: 8, fontFamily: FONTS.mono, fontSize: 16, fontWeight: 900, zIndex: 25 }}>
            0.5s
          </div>
        )}

        {/* Giant bold white 3D XUAN backdrop text */}
        <div style={{ position: 'absolute', fontFamily: FONTS.display, fontSize: 225, fontWeight: 900, color: 'rgba(255,255,255,0.95)', letterSpacing: 6, userSelect: 'none', transform: `scale(${interpolate(enter, [0, 1], [0.94, 1])})` }}>
          3D XUAN
        </div>

        {/* Left & Right flanking mini transparent cutouts */}
        <Img src={staticFile(cur.left)} style={{ position: 'absolute', left: 195, bottom: 22, height: 145, objectFit: 'contain', filter: 'drop-shadow(0 12px 18px rgba(0,0,0,0.35))', zIndex: 8 }} />
        <Img src={staticFile(cur.right)} style={{ position: 'absolute', right: 195, bottom: 22, height: 145, objectFit: 'contain', filter: 'drop-shadow(0 12px 18px rgba(0,0,0,0.35))', zIndex: 8 }} />

        {/* Center HERO TRANSPARENT CUTOUT (no white box!) */}
        <Img
          src={staticFile(cur.cutout)}
          style={{
            position: 'relative',
            height: 390,
            objectFit: 'contain',
            filter: 'drop-shadow(0 22px 32px rgba(0,0,0,0.45))',
            transform: `translateY(${interpolate(enter, [0, 1], [42, 16])}px) scale(${interpolate(enter, [0, 1], [0.88, 1])})`,
            zIndex: 15,
          }}
        />

        <div style={{ position: 'absolute', left: 22, bottom: 16, fontFamily: FONTS.mono, fontSize: 13, color: 'rgba(255,255,255,0.85)', letterSpacing: 1.5 }}>
          🔒 CAMERA LOCKED
        </div>
        <div style={{ position: 'absolute', right: 22, bottom: 16, fontFamily: FONTS.mono, fontSize: 14, fontWeight: 700, color: 'rgba(255,255,255,0.88)', letterSpacing: 2 }}>
          MEET XUAN
        </div>
      </div>

      {/* Bottom 5 Color Swatch Pills matching strip_m8_color.jpg */}
      <div style={{ position: 'absolute', left: 28, bottom: 12, display: 'flex', gap: 10 }}>
        {swatches.map((sw) => {
          const isCur = sw.label === cur.label;
          return (
            <div
              key={sw.label}
              style={{
                padding: '3px 16px',
                borderRadius: 6,
                backgroundColor: sw.hex,
                color: '#ffffff',
                fontSize: 14,
                fontWeight: 800,
                border: isCur ? '2px solid #ffffff' : '1px solid rgba(255,255,255,0.2)',
                opacity: isCur ? 1 : 0.55,
              }}
            >
              {sw.label}
            </div>
          );
        })}
      </div>
    </HudFrame>
  );
};

const SLICE_ITEMS = [
  { num: '04', title: '拜占庭', image: 'assets/arch_01.jpg' },
  { num: '06', title: '文艺复兴', image: 'assets/arch_03.jpg' },
  { num: '07', title: '新古典', image: 'assets/arch_04.jpg' },
  { num: '09', title: '表现主义', image: 'assets/arch_06.jpg' },
  { num: '11', title: '风格派', image: 'assets/arch_08.jpg' },
  { num: '13', title: '新现代', image: 'assets/arch_10.jpg' },
  { num: '15', title: '解构主义', image: 'assets/arch_12.jpg' },
];

const DEFAULT_PROMPT_09: PromptToken[] = [
  { text: '一长串同类图换图时，' },
  { text: '切成 5 条', highlight: true },
  { text: '，新图 ' },
  { text: '一条条从下面长上来', highlight: true },
  { text: '、每条 ' },
  { text: '错开 0.07 秒', highlight: true },
  { text: '，编号 ' },
  { text: '同步翻牌', highlight: true },
];

export const Move09SliceSwapDemo: React.FC<{
  moveIndex?: number;
  totalMoves?: number;
  titleZh?: string;
  titleEn?: string;
  promptTokens?: PromptToken[];
  items?: Array<{ num: string; title: string; image: string }>;
}> = ({
  moveIndex = 9,
  totalMoves = 9,
  titleZh = '切片换图',
  titleEn = 'SLICE SWAP',
  promptTokens = DEFAULT_PROMPT_09,
  items = SLICE_ITEMS,
}) => {
  const frame = useCurrentFrame();
  const perSlide = 52;
  const idx = Math.min(items.length - 1, Math.floor(frame / perSlide));
  const prevIdx = Math.max(0, idx - 1);
  const localFrame = frame % perSlide;

  const cur = items[idx];
  const prev = items[prevIdx];
  const isHold = idx === items.length - 1 && localFrame > 25;
  const flipRot = interpolate(localFrame, [0, 10], [-90, 0], { extrapolateRight: 'clamp' });

  return (
    <HudFrame
      moveIndex={moveIndex}
      totalMoves={totalMoves}
      titleZh={titleZh}
      titleEn={titleEn}
      cameraMoving={false}
      status={isHold ? 'HOLD' : 'SLICING'}
      metrics={[
        { labelEn: 'SLICES', labelZh: '切片数', value: '5 条', accent: true },
        { labelEn: 'STAGGER', labelZh: '每条错开', value: '0.07 s' },
        { labelEn: 'INDEX', labelZh: '编号', value: `${cur.num} / 20` },
      ]}
      graphMode="pulse"
      graphProgress={(idx + 1) / items.length}
      promptTokens={promptTokens}
      promptStartFrame={45}
    >
      <div style={{ position: 'absolute', inset: 22, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ flex: 1, borderRadius: 12, overflow: 'hidden', position: 'relative', backgroundColor: '#000' }}>
          <Img src={staticFile(prev.image)} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />

          {[0, 1, 2, 3, 4].map((sIdx) => {
            const p = interpolate(localFrame - sIdx * 2.2, [0, 13], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
            const eased = 1 - Math.pow(1 - p, 3);
            return (
              <div key={sIdx} style={{ position: 'absolute', inset: 0, clipPath: `inset(${(1 - eased) * 100}% ${(4 - sIdx) * 20}% 0% ${sIdx * 20}%)` }}>
                <Img src={staticFile(cur.image)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            );
          })}

          {/* 3D Mechanical Flip-Clock Counter Badge */}
          <div style={{ position: 'absolute', left: 20, bottom: 18, display: 'flex', alignItems: 'center', gap: 12, backgroundColor: 'rgba(13, 16, 22, 0.88)', padding: '6px 16px 6px 8px', borderRadius: 10, border: `1px solid ${COLORS.amberBorder}`, zIndex: 20, perspective: 400 }}>
            <div style={{ backgroundColor: COLORS.amber, color: '#111318', fontFamily: FONTS.mono, fontWeight: 900, fontSize: 22, padding: '3px 10px', borderRadius: 6, transform: `rotateX(${flipRot}deg)` }}>
              {cur.num}
            </div>
            <div style={{ fontSize: 22, fontWeight: 700, color: COLORS.white }}>{cur.title}</div>
          </div>
        </div>

        <div style={{ height: 56, display: 'flex', gap: 8 }}>
          {items.map((it, i) => (
            <div key={i} style={{ flex: 1, borderRadius: 6, overflow: 'hidden', border: i === idx ? `2px solid ${COLORS.amber}` : '1px solid rgba(255,255,255,0.12)', opacity: i === idx ? 1 : 0.45 }}>
              <Img src={staticFile(it.image)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          ))}
        </div>
      </div>
    </HudFrame>
  );
};
