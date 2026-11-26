import React from 'react';
import { Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { HudFrame } from '../../design/Chrome';
import { COLORS, FONTS } from '../../design/tokens';
import { PromptToken } from '../../types/timeline';

const PROMPT_E1_05: PromptToken[] = [
  { text: '停在素材上时 ' },
  { text: '不完全静止', highlight: true },
  { text: '：镜头 ' },
  { text: '每秒往前推 3%', highlight: true },
  { text: '、角度 ' },
  { text: '慢慢飘半度', highlight: true },
  { text: '，几乎感受不到，画面 ' },
  { text: '始终在呼吸', highlight: true },
];

export const Ep1Move05SlowPushIn: React.FC<{
  moveIndex?: number;
  totalMoves?: number;
  promptTokens?: PromptToken[];
  cardImage?: string;
}> = ({
  moveIndex = 5,
  totalMoves = 8,
  promptTokens = PROMPT_E1_05,
  cardImage = 'assets_v2/planet_card.jpg',
}) => {
  const frame = useCurrentFrame();
  const elapsedSec = frame / 30;
  const zoomPct = Math.round(100 + elapsedSec * 3);
  const driftDeg = (elapsedSec * 0.5).toFixed(1);
  const status = frame < 35 ? 'HOLD' : frame < 140 ? 'FROZEN = STIFF' : 'PUSH-IN';

  // Live ECG heartbeat pulse for the right panel
  const ecgPoints = Array.from({ length: 60 }).map((_, i) => {
    const x = i * 8;
    const phase = ((i + frame * 1.4) % 28) / 28;
    let y = 26;
    if (phase > 0.42 && phase < 0.48) y = 8;
    else if (phase >= 0.48 && phase < 0.54) y = 42;
    else if (phase >= 0.54 && phase < 0.6) y = 20;
    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ');

  return (
    <HudFrame
      moveIndex={moveIndex}
      totalMoves={totalMoves}
      titleZh="缓慢推进"
      titleEn="SLOW PUSH-IN"
      cameraMoving={true}
      status={status}
      metrics={[
        { labelEn: 'ZOOM', labelZh: '每秒 +3%', value: `${zoomPct}%`, accent: frame >= 140 },
        { labelEn: 'DRIFT', labelZh: '角度慢飘', value: `+${driftDeg}°` },
        { labelEn: 'ELAPSED', labelZh: '停留时长', value: `${elapsedSec.toFixed(1)} s` },
      ]}
      graphMode="curve"
      graphProgress={Math.min(1, elapsedSec / 12)}
      promptTokens={promptTokens}
      promptStartFrame={120}
    >
      <div style={{ position: 'absolute', inset: 22, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Left: Frozen Stiff + Flat Dead Heartbeat */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ flex: 1, borderRadius: 14, overflow: 'hidden', position: 'relative', border: `1.5px solid ${COLORS.border}`, backgroundColor: '#0a0c10' }}>
            <Img src={staticFile(cardImage)} style={{ width: '100%', height: '100%', objectFit: 'contain', filter: 'saturate(0.45) brightness(0.82)' }} />
            <div style={{ position: 'absolute', top: 12, left: 12, display: 'flex', gap: 8 }}>
              <span style={{ backgroundColor: 'rgba(13,16,22,0.9)', padding: '4px 12px', borderRadius: 6, fontSize: 16, fontWeight: 700 }}>完全静止</span>
              <span style={{ backgroundColor: COLORS.red, color: COLORS.white, padding: '4px 12px', borderRadius: 6, fontSize: 16, fontWeight: 800 }}>呆板</span>
            </div>
          </div>
          <div style={{ height: 68, borderRadius: 10, backgroundColor: 'rgba(13,16,22,0.85)', border: `1px solid ${COLORS.border}`, padding: '6px 12px' }}>
            <div style={{ fontSize: 12, color: COLORS.textMuted }}>静止的心跳</div>
            <svg width="100%" height="44" viewBox="0 0 472 48">
              <line x1="0" y1="26" x2="472" y2="26" stroke={COLORS.red} strokeWidth="2.5" opacity={0.85} />
            </svg>
          </div>
        </div>

        {/* Right: Slow Push-In + Alive Breathing Heartbeat */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ flex: 1, borderRadius: 14, overflow: 'hidden', position: 'relative', border: `2px solid ${COLORS.amber}`, backgroundColor: '#0a0c10' }}>
            <Img
              src={staticFile(cardImage)}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                transform: `scale(${1 + elapsedSec * 0.03}) rotate(${elapsedSec * 0.35}deg)`,
              }}
            />
            <div style={{ position: 'absolute', top: 12, left: 12, backgroundColor: COLORS.amber, color: '#111318', padding: '4px 12px', borderRadius: 6, fontSize: 16, fontWeight: 900 }}>
              慢推
            </div>
            {frame > 220 && (
              <div style={{ position: 'absolute', right: 16, bottom: 16, width: 82, height: 82, borderRadius: '50%', backgroundColor: 'rgba(17,19,24,0.92)', border: `3px solid ${COLORS.amber}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ fontSize: 11, color: COLORS.textSecondary }}>1 秒只推</div>
                <div style={{ fontFamily: FONTS.mono, fontSize: 22, fontWeight: 900, color: COLORS.amber }}>3%</div>
              </div>
            )}
          </div>
          <div style={{ height: 68, borderRadius: 10, backgroundColor: 'rgba(13,16,22,0.85)', border: `1px solid ${COLORS.amberBorder}`, padding: '6px 12px' }}>
            <div style={{ fontSize: 12, color: COLORS.amber }}>画面的心跳，一直在动</div>
            <svg width="100%" height="44" viewBox="0 0 472 48">
              <path d={ecgPoints} fill="none" stroke={COLORS.amber} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      </div>
    </HudFrame>
  );
};

const PROMPT_E1_06: PromptToken[] = [
  { text: '讲流程、时间线时把内容 ' },
  { text: '铺成一条路', highlight: true },
  { text: '：地面 ' },
  { text: '倾 70°', highlight: true },
  { text: '，镜头 ' },
  { text: '压低俯仰 50°', highlight: true },
  { text: '，贴着地面往里走，走到哪一步 ' },
  { text: '哪一步亮', highlight: true },
];

export const Ep1Move06WalkIn: React.FC<{
  moveIndex?: number;
  totalMoves?: number;
  promptTokens?: PromptToken[];
}> = ({ moveIndex = 6, totalMoves = 8, promptTokens = PROMPT_E1_06 }) => {
  const frame = useCurrentFrame();
  const isDunhuang = frame >= 185;
  const roadStep = Math.min(4, Math.floor(frame / 45) + 1);
  const walkStep = isDunhuang ? Math.min(10, Math.floor((frame - 185) / 11)) : 0;
  const steps = ['1 写稿', '2 录音', '3 B-roll', '4 出片'];

  return (
    <HudFrame
      moveIndex={moveIndex}
      totalMoves={totalMoves}
      titleZh="走进画面"
      titleEn="WALK-IN"
      cameraMoving={true}
      status={isDunhuang ? (walkStep >= 5 ? 'WALK INTO' : 'EP.22 DUNHUANG') : roadStep === 1 ? 'LOW DOLLY' : `STEP ${roadStep} / 4`}
      metrics={[
        { labelEn: 'CAM PITCH', labelZh: '镜头俯仰', value: '50.0°' },
        { labelEn: 'PLANE TILT', labelZh: '地面倾角', value: '70.0°' },
        {
          labelEn: isDunhuang ? 'STEPS' : 'STEP',
          labelZh: isDunhuang ? '走入步数' : '当前步骤',
          value: isDunhuang ? `${walkStep} 步` : `${roadStep} / 4`,
          accent: true,
        },
      ]}
      graphMode="curve"
      graphProgress={isDunhuang ? walkStep / 10 : roadStep / 4}
      promptTokens={promptTokens}
      promptStartFrame={35}
    >
      {isDunhuang ? (
        <div style={{ position: 'absolute', inset: 18, borderRadius: 12, overflow: 'hidden' }}>
          <Img
            src={staticFile('assets_v2/dunhuang_walkin.jpg')}
            style={{ width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${1 + walkStep * 0.032})` }}
          />
          <div style={{ position: 'absolute', top: 16, left: 16, backgroundColor: COLORS.amber, color: '#111318', padding: '5px 14px', borderRadius: 6, fontSize: 16, fontWeight: 900 }}>
            EP.22 敦煌 · 一眼千年
          </div>
          <div style={{ position: 'absolute', right: 20, bottom: 20, width: 160, height: 100, borderRadius: 10, backgroundColor: 'rgba(13,16,22,0.9)', border: `1.5px solid ${COLORS.green}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 700, color: COLORS.green }}>
            ✓ 走进画面 ({walkStep}步)
          </div>
        </div>
      ) : (
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 18, left: 24, display: 'flex', gap: 12, zIndex: 20 }}>
            {steps.map((s, idx) => (
              <div key={s} style={{ padding: '5px 14px', borderRadius: 6, backgroundColor: idx + 1 === roadStep ? COLORS.amber : 'rgba(255,255,255,0.08)', color: idx + 1 === roadStep ? '#111318' : COLORS.textSecondary, fontSize: 16, fontWeight: 800 }}>
                {s}
              </div>
            ))}
          </div>

          <svg width="100%" height="100%" viewBox="0 0 1120 520" style={{ position: 'absolute', inset: 0 }}>
            <polygon points="510,120 610,120 960,520 160,520" fill="rgba(245,166,35,0.07)" stroke={COLORS.amber} strokeWidth="2.5" />
            <line x1="560" y1="120" x2="560" y2="520" stroke={COLORS.amber} strokeWidth="3" strokeDasharray="18 16" strokeDashoffset={-frame * 5} />
          </svg>

          {steps.map((s, i) => {
            const active = i + 1 === roadStep;
            const left = i % 2 === 0 ? 185 + i * 75 : 675 - i * 42;
            const top = 335 - i * 56;
            return (
              <div
                key={s}
                style={{
                  position: 'absolute',
                  left,
                  top,
                  padding: active ? '16px 32px' : '8px 18px',
                  borderRadius: 12,
                  backgroundColor: active ? COLORS.amber : COLORS.surface,
                  color: active ? '#111318' : COLORS.textSecondary,
                  border: `2px solid ${active ? COLORS.amberBright : COLORS.border}`,
                  fontSize: active ? 32 : 20,
                  fontWeight: 900,
                  boxShadow: active ? `0 0 38px ${COLORS.amberGlow}` : 'none',
                }}
              >
                {s}
              </div>
            );
          })}

          {/* Bottom-right SIDE VIEW Pitch/Tilt Diagram */}
          <div style={{ position: 'absolute', right: 20, bottom: 20, width: 215, height: 112, borderRadius: 10, backgroundColor: 'rgba(13,16,22,0.92)', border: `1px solid ${COLORS.border}`, padding: '8px 12px', zIndex: 25 }}>
            <div style={{ fontSize: 11, color: COLORS.textMuted, marginBottom: 4 }}>SIDE VIEW · 侧面图</div>
            <svg width="190" height="74" viewBox="0 0 190 74">
              <line x1="18" y1="58" x2="175" y2="58" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" />
              <line x1="40" y1="58" x2="160" y2="18" stroke={COLORS.amber} strokeWidth="2.5" />
              <rect x="22" y="24" width="18" height="12" rx="2" fill={COLORS.white} />
              <line x1="40" y1="30" x2="120" y2="48" stroke={COLORS.amberBright} strokeWidth="1.5" strokeDasharray="4 3" />
              <text x="52" y="24" fill={COLORS.textSecondary} fontSize="11">镜头俯仰 50°</text>
              <text x="128" y="68" fill={COLORS.amber} fontSize="11">地面 70°</text>
            </svg>
          </div>
        </div>
      )}
    </HudFrame>
  );
};

export const Ep1RuleVelocityScene: React.FC = () => {
  const frame = useCurrentFrame();

  if (frame < 105) {
    return (
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', paddingBottom: 100 }}>
        <div style={{ position: 'relative', width: 480, height: 480, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: 150, height: 150, borderRadius: '50%', backgroundColor: '#374151', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 28, fontSize: 36, color: COLORS.white }}>
            <span>{frame > 48 ? '@' : '•'}</span>
            <span>{frame > 48 ? '@' : '•'}</span>
          </div>
          {Array.from({ length: 10 }).map((_, i) => {
            const a = (i / 10) * Math.PI * 2 + frame * 0.08;
            return (
              <div key={i} style={{ position: 'absolute', left: 240 + Math.cos(a) * 195 - 24, top: 240 + Math.sin(a) * 195 - 16, width: 48, height: 32, borderRadius: 6, backgroundColor: frame > 48 ? COLORS.white : '#6b7280', transform: `rotate(${(a * 180) / Math.PI}deg)` }} />
            );
          })}
        </div>
      </div>
    );
  }

  const f = frame - 105;
  const playheadX = interpolate(f, [0, 260], [60, 820], { extrapolateRight: 'clamp' });
  const previewImg = playheadX < 280 ? 'assets_v2/pink_xuan.jpg' : playheadX < 560 ? 'assets_v2/dunhuang_mural.jpg' : 'assets_v2/planet_card.jpg';

  return (
    <div style={{ position: 'absolute', inset: '140px 140px 210px 140px', borderRadius: 20, backgroundColor: COLORS.surface, border: `1.5px solid ${COLORS.amberBorder}`, padding: '28px 34px', display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <span style={{ backgroundColor: COLORS.amber, color: '#111318', padding: '5px 14px', borderRadius: 8, fontSize: 22, fontWeight: 900 }}>我的规则</span>
        <span style={{ fontSize: 32, fontWeight: 800, color: COLORS.white }}>镜头只在切换素材时快速移动</span>
      </div>
      <div style={{ flex: 1, display: 'flex', gap: 28, alignItems: 'center' }}>
        <div style={{ flex: 1, height: '100%', backgroundColor: COLORS.stageBg, borderRadius: 14, border: `1px solid ${COLORS.border}`, position: 'relative', padding: 18 }}>
          <svg width="100%" height="100%" viewBox="0 0 860 360">
            <rect x="40" y="255" width="780" height="65" fill="rgba(52, 211, 153, 0.12)" />
            <path d="M 40 300 L 140 300 Q 170 300 185 60 Q 200 300 230 300 L 420 300 Q 450 300 465 60 Q 480 300 510 300 L 680 300 Q 710 300 725 60 Q 740 300 770 300 L 820 300" fill="none" stroke={COLORS.amber} strokeWidth="3.5" />
            <line x1={playheadX} y1="20" x2={playheadX} y2="330" stroke={COLORS.white} strokeWidth="2" strokeDasharray="5 5" />
            <text x="185" y="42" fill={COLORS.amber} fontSize="16" fontFamily={FONTS.mono} textAnchor="middle">&lt;1s</text>
            <text x="465" y="42" fill={COLORS.amber} fontSize="16" fontFamily={FONTS.mono} textAnchor="middle">&lt;1s</text>
            <text x="725" y="42" fill={COLORS.amber} fontSize="16" fontFamily={FONTS.mono} textAnchor="middle">&lt;1s</text>
            <text x="320" y="290" fill={COLORS.green} fontSize="18" fontWeight="700">其余时间：缓慢平稳</text>
          </svg>
        </div>
        <div style={{ width: 420, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ height: 240, borderRadius: 12, overflow: 'hidden', border: `2px solid ${COLORS.amberBorder}` }}>
            <Img src={staticFile(previewImg)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 24, fontWeight: 800, color: COLORS.green }}>
            <span style={{ width: 32, height: 32, borderRadius: '50%', backgroundColor: COLORS.green, color: '#111318', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>✓</span>
            <span>不晕</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const PROMPT_E1_07: PromptToken[] = [
  { text: '新内容出现时，原来那一层 ' },
  { text: '整体往后退到 94%', highlight: true },
  { text: '，同时 ' },
  { text: '变虚 4px、变暗到 55%', highlight: true },
  { text: '，视线 ' },
  { text: '自然落到新内容上', highlight: true },
];

export const Ep1Move07BgBlur: React.FC<{
  moveIndex?: number;
  totalMoves?: number;
  promptTokens?: PromptToken[];
}> = ({ moveIndex = 7, totalMoves = 8, promptTokens = PROMPT_E1_07 }) => {
  const frame = useCurrentFrame();
  const isBlur = frame >= 60;
  const isCompare = frame >= 195;
  const pushT = interpolate(frame, [60, 115], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const bgScale = interpolate(pushT, [0, 1], [1, 0.94]);
  const bgBlur = interpolate(pushT, [0, 1], [0, 4.0]);
  const bgBright = interpolate(pushT, [0, 1], [1, 0.55]);

  const bg6 = [
    'assets_v2/pink_xuan.jpg', 'assets_v2/dunhuang_mural.jpg', 'assets_v2/planet_card.jpg',
    'assets_v2/pixel_ui.jpg', 'assets/card_04.jpg', 'assets/card_06.jpg',
  ];

  const render6Grid = (scale: number, blurPx: number, bright: number) => (
    <div style={{ position: 'absolute', inset: 18, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, transform: `scale(${scale})`, filter: `blur(${blurPx}px) brightness(${bright})` }}>
      {bg6.map((src, i) => (
        <div key={i} style={{ borderRadius: 10, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.16)' }}>
          <Img src={staticFile(src)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      ))}
    </div>
  );

  return (
    <HudFrame
      moveIndex={moveIndex}
      totalMoves={totalMoves}
      titleZh="背景虚化"
      titleEn="BACKGROUND BLUR"
      cameraMoving={true}
      status={isCompare ? 'OVERLAY vs PUSH BACK' : isBlur ? 'PUSH BACK' : 'NEW LAYER'}
      metrics={[
        { labelEn: 'BACK SCALE', labelZh: '后层退后', value: `${Math.round(bgScale * 100)}%`, accent: isBlur },
        { labelEn: 'BACK BLUR', labelZh: '后层变虚', value: `${bgBlur.toFixed(1)} px`, accent: isBlur },
        { labelEn: 'BACK BRIGHT', labelZh: '后层变暗', value: `${Math.round(bgBright * 100)}%` },
      ]}
      graphMode="curve"
      graphProgress={pushT}
      promptTokens={promptTokens}
      promptStartFrame={75}
    >
      {isCompare ? (
        <div style={{ position: 'absolute', inset: 22, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 22 }}>
          <div style={{ borderRadius: 12, overflow: 'hidden', position: 'relative', border: `2px solid ${COLORS.red}` }}>
            {render6Grid(1, 0, 1)}
            <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', backgroundColor: 'rgba(17,19,24,0.88)', border: `1.5px solid ${COLORS.amber}`, padding: '14px 26px', borderRadius: 10, fontSize: 24, fontWeight: 800 }}>
              你想先试哪一个？
            </div>
            <div style={{ position: 'absolute', top: 14, left: 14, backgroundColor: COLORS.red, color: COLORS.white, padding: '4px 12px', borderRadius: 6, fontSize: 16, fontWeight: 800 }}>
              直接盖上去 ✕ 看不清、抢戏
            </div>
          </div>
          <div style={{ borderRadius: 12, overflow: 'hidden', position: 'relative', border: `2px solid ${COLORS.amber}` }}>
            {render6Grid(0.94, 4, 0.55)}
            <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', backgroundColor: 'rgba(17,19,24,0.96)', border: `2px solid ${COLORS.amber}`, padding: '14px 26px', borderRadius: 10, fontSize: 24, fontWeight: 800, boxShadow: `0 0 36px ${COLORS.amberGlow}` }}>
              你想先试哪一个？
            </div>
            <div style={{ position: 'absolute', top: 14, left: 14, backgroundColor: COLORS.amber, color: '#111318', padding: '4px 12px', borderRadius: 6, fontSize: 16, fontWeight: 900 }}>
              后层退后 ✓ 主次清晰
            </div>
          </div>
        </div>
      ) : (
        <div style={{ position: 'absolute', inset: 16, borderRadius: 12, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {render6Grid(bgScale, bgBlur, bgBright)}
          <div style={{ position: 'relative', zIndex: 10, backgroundColor: 'rgba(17,19,24,0.95)', border: `2.5px solid ${COLORS.amber}`, padding: '22px 44px', borderRadius: 14, fontSize: 34, fontWeight: 900, boxShadow: `0 0 48px ${COLORS.amberGlow}` }}>
            你想先试哪一个？
          </div>
          <div style={{ position: 'absolute', left: 20, bottom: 20, display: 'flex', gap: 10, zIndex: 20 }}>
            <span style={{ backgroundColor: COLORS.amber, color: '#111318', padding: '4px 12px', borderRadius: 6, fontSize: 15, fontWeight: 800 }}>往后退 {Math.round(bgScale * 100)}%</span>
            {bgBlur > 0.5 && <span style={{ backgroundColor: 'rgba(13,16,22,0.9)', border: `1px solid ${COLORS.amberBorder}`, color: COLORS.amber, padding: '4px 12px', borderRadius: 6, fontSize: 15, fontWeight: 700 }}>变虚 {bgBlur.toFixed(1)}px</span>}
          </div>
        </div>
      )}
    </HudFrame>
  );
};

const PROMPT_E1_08: PromptToken[] = [
  { text: '从多个内容里挑出重点讲时 ' },
  { text: '不切换新画面', highlight: true },
  { text: '，让它 ' },
  { text: '在原来的位置 直接放大 2.4 倍', highlight: true },
  { text: '，其余内容 ' },
  { text: '淡化到 30%', highlight: true },
  { text: ' 往后退，观众看清 ' },
  { text: '它从哪里来', highlight: true },
];

export const Ep1Move08InPlaceZoom: React.FC<{
  moveIndex?: number;
  totalMoves?: number;
  promptTokens?: PromptToken[];
}> = ({ moveIndex = 8, totalMoves = 8, promptTokens = PROMPT_E1_08 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const zoomP = spring({ frame: Math.max(0, frame - 65), fps, config: { damping: 16, stiffness: 100 } });
  const dimP = interpolate(frame, [130, 175], [1, 0.3], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const scaleVal = interpolate(zoomP, [0, 1], [1.0, 2.4]);
  const status = frame < 65 ? 'WALL' : frame < 150 ? 'ZOOM IN PLACE' : frame < 235 ? 'OTHERS BACK' : 'ORIGIN TRACE';

  return (
    <HudFrame
      moveIndex={moveIndex}
      totalMoves={totalMoves}
      titleZh="原位放大"
      titleEn="IN-PLACE ZOOM"
      cameraMoving={true}
      status={status}
      metrics={[
        { labelEn: 'GRID POS', labelZh: '所在位置', value: '2 · 3' },
        { labelEn: 'SCALE', labelZh: '原位放大', value: `×${scaleVal.toFixed(2)}`, accent: frame >= 65 },
        { labelEn: 'OTHERS', labelZh: '其余亮度', value: `${Math.round(dimP * 100)}%`, accent: frame >= 150 },
      ]}
      graphMode="curve"
      graphProgress={zoomP}
      promptTokens={promptTokens}
      promptStartFrame={85}
    >
      <div style={{ position: 'absolute', inset: 22, borderRadius: 12, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Img
          src={staticFile('assets_v2/video_wall.jpg')}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: `brightness(${dimP})`, transform: `scale(${interpolate(dimP, [0.3, 1], [0.95, 1])})` }}
        />

        {frame >= 60 && (
          <div style={{ position: 'relative', width: 240, height: 145, borderRadius: 10, overflow: 'hidden', border: `2.5px solid ${COLORS.amber}`, boxShadow: `0 0 50px ${COLORS.amberGlow}, 0 24px 60px rgba(0,0,0,0.75)`, transform: `scale(${scaleVal})`, zIndex: 20 }}>
            <Img src={staticFile('assets_v2/dunhuang_walkin.jpg')} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        )}

        {frame >= 235 && (
          <div style={{ position: 'absolute', bottom: 34, left: '50%', transform: 'translateX(-50%)', backgroundColor: COLORS.green, color: '#111318', padding: '6px 18px', borderRadius: 8, fontSize: 18, fontWeight: 900, zIndex: 30 }}>
            ✓ 从这来（保留空间锚点）
          </div>
        )}
      </div>
    </HudFrame>
  );
};
