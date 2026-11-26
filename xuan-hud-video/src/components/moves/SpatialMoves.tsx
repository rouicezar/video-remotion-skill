import React from 'react';
import { Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { HudFrame } from '../../design/Chrome';
import { COLORS, FONTS } from '../../design/tokens';
import { easeInOutCubic, smoothFocusWeight, smoothWaypointProgress } from '../../design/motion';
import { PromptToken } from '../../types/timeline';

const PROMPT_E1_01: PromptToken[] = [
  { text: '铺一块 ' },
  { text: '#111318', highlight: true },
  { text: ' 的深色大画布，叠一层很淡的 ' },
  { text: 'Xuan 字墙 慢慢漂', highlight: true },
  { text: '；素材按讲述顺序 ' },
  { text: '沿镜头路线', highlight: true },
  { text: ' 摆好，镜头 ' },
  { text: '从一张移到下一张', highlight: true },
];

export const Ep1Move01WorldCanvas: React.FC<{
  moveIndex?: number;
  totalMoves?: number;
  promptTokens?: PromptToken[];
}> = ({ moveIndex = 1, totalMoves = 8, promptTokens = PROMPT_E1_01 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Total ~35s (~1050f):
  // 0..220f: HARD CUT bad example ("错误示范：一张一张铺满")
  // 220..420f: CANVAS (dark #111318 canvas + drifting watermark + 6 slots)
  // 420..560f: PLACE (6 assets drop into slots)
  // 560..710f: LINKED (5 dashed segments connecting 1->6)
  // 710..end: CAMERA PATH (viewfinder moves smoothly from 1->6 + live preview inset)
  const isHardCut = frame < 220;
  const isCanvas = frame >= 220 && frame < 420;
  const isPlace = frame >= 420 && frame < 560;
  const isLinked = frame >= 560 && frame < 710;
  const isCamPath = frame >= 710;

  const placedCount = isCanvas ? 0 : isPlace ? Math.min(6, Math.floor((frame - 420) / 20) + 1) : 6;
  const linkedCount = isLinked || isCamPath ? 5 : 0;

  const slots = [
    { x: 110, y: 120, img: 'assets_v2/pink_xuan.jpg' },
    { x: 460, y: 120, img: 'assets_v2/dunhuang_mural.jpg' },
    { x: 810, y: 120, img: 'assets_v2/planet_card.jpg' },
    { x: 810, y: 345, img: 'assets/card_04.jpg' },
    { x: 460, y: 345, img: 'assets_v2/pixel_ui.jpg' },
    { x: 110, y: 345, img: 'assets/card_06.jpg' },
  ];

  // Silky S-curve dwell + glide camera path across all 6 stations (zero mechanical snapping!)
  const pathProgress = isCamPath ? smoothWaypointProgress(frame, 710, 56, 6, 0.35) : 0;
  const segIdx = Math.min(4, Math.floor(pathProgress));
  const segT = pathProgress - segIdx;
  const camX = isCamPath
    ? slots[segIdx].x + (slots[segIdx + 1].x - slots[segIdx].x) * segT
    : 420;
  const camY = isCamPath
    ? slots[segIdx].y + (slots[segIdx + 1].y - slots[segIdx].y) * segT
    : 330;
  const activeSlot = Math.min(5, Math.round(pathProgress));

  const status = isHardCut
    ? 'HARD CUT'
    : isCanvas
      ? 'CANVAS'
      : isPlace
        ? 'PLACE'
        : isLinked
          ? 'LINKED'
          : 'CAMERA PATH';

  const hardCutSlide = Math.floor(frame / 72) % 3;
  const hardCutImgs = ['assets_v2/pink_xuan.jpg', 'assets_v2/dunhuang_mural.jpg', 'assets_v2/pixel_ui.jpg'];

  return (
    <HudFrame
      moveIndex={moveIndex}
      totalMoves={totalMoves}
      titleZh={isHardCut ? '错误示范：一张一张铺满' : '世界画布'}
      titleEn={isHardCut ? 'FLAT SLIDES' : 'WORLD CANVAS'}
      cameraMoving={!isHardCut}
      status={status}
      metrics={
        isHardCut
          ? [
              { labelEn: 'CAM MOVE', labelZh: '相机移动', value: '0 px' },
              { labelEn: 'DEPTH', labelZh: '空间层次', value: '无' },
              { labelEn: 'SLIDES', labelZh: '切换页数', value: `${hardCutSlide + 1} / 3` },
            ]
          : [
              { labelEn: 'CAM.XY', labelZh: '镜头坐标', value: `${Math.round(camX * 2)} · ${Math.round(camY * 2)}`, accent: isCamPath },
              { labelEn: 'STATIONS', labelZh: '素材位', value: `${isCamPath ? activeSlot + 1 : placedCount} / 6` },
              { labelEn: 'LINKS', labelZh: '路径段', value: `${linkedCount} / 5 段` },
            ]
      }
      graphMode={isHardCut ? 'step' : isCamPath ? 'curve' : 'flat'}
      graphProgress={isHardCut ? (hardCutSlide + 1) / 3 : isCamPath ? (pathProgress + 1) / 6 : placedCount / 6}
      graphSteps={isHardCut ? 3 : 6}
      promptTokens={promptTokens}
      promptStartFrame={580}
    >
      {isHardCut ? (
        <div style={{ position: 'absolute', inset: 22, borderRadius: 12, overflow: 'hidden' }}>
          <Img src={staticFile(hardCutImgs[hardCutSlide])} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <div
            style={{
              position: 'absolute',
              top: 16,
              right: 18,
              backgroundColor: 'rgba(13,16,22,0.85)',
              padding: '4px 12px',
              borderRadius: 6,
              fontFamily: FONTS.mono,
              fontSize: 18,
            }}
          >
            {hardCutSlide + 1} / 3
          </div>
        </div>
      ) : (
        <div style={{ position: 'absolute', inset: 18, backgroundColor: '#111318', borderRadius: 12, border: `1px solid ${COLORS.border}`, overflow: 'hidden' }}>
          {/* Top tag badges */}
          <div style={{ position: 'absolute', top: 14, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 10, zIndex: 20 }}>
            <div style={{ backgroundColor: COLORS.amber, color: '#111318', padding: '4px 12px', borderRadius: 6, fontSize: 14, fontWeight: 800 }}>
              深色大画布 #111318
            </div>
            {frame > 290 && (
              <div style={{ backgroundColor: 'rgba(245,166,35,0.2)', border: `1px solid ${COLORS.amberBorder}`, color: COLORS.amber, padding: '4px 12px', borderRadius: 6, fontSize: 14, fontWeight: 700 }}>
                {isCamPath ? '同一个空间 ✓ · 沿镜头路线' : 'Xuan 字墙 · 慢慢漂 →'}
              </div>
            )}
          </div>

          {/* Dashed Camera Route SVG */}
          {linkedCount > 0 && (
            <svg width="100%" height="100%" viewBox="0 0 1120 520" style={{ position: 'absolute', inset: 0, zIndex: 5 }}>
              <polyline
                points={slots.map((s) => `${s.x + 115},${s.y + 72}`).join(' ')}
                fill="none"
                stroke={COLORS.amber}
                strokeWidth="2.5"
                strokeDasharray="8 6"
                opacity={0.75}
              />
            </svg>
          )}

          {/* 6 Asset Stations */}
          {slots.map((s, idx) => {
            const isPlaced = idx < placedCount;
            const pop = spring({ frame: Math.max(0, frame - (420 + idx * 20)), fps, config: { damping: 14, stiffness: 130 } });
            return (
              <div
                key={idx}
                style={{
                  position: 'absolute',
                  left: s.x,
                  top: s.y,
                  width: 230,
                  height: 144,
                  borderRadius: 10,
                  border: isPlaced ? `1.5px solid ${idx === activeSlot && isCamPath ? COLORS.amber : 'rgba(255,255,255,0.2)'}` : '1.5px dashed rgba(255,255,255,0.16)',
                  overflow: 'hidden',
                  backgroundColor: 'rgba(255,255,255,0.03)',
                  transform: isPlaced ? `scale(${pop})` : 'scale(1)',
                  zIndex: 10,
                }}
              >
                {isPlaced && <Img src={staticFile(s.img)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                <div
                  style={{
                    position: 'absolute',
                    top: 6,
                    left: 6,
                    width: 22,
                    height: 22,
                    borderRadius: 5,
                    backgroundColor: COLORS.amber,
                    color: '#111318',
                    fontFamily: FONTS.mono,
                    fontSize: 13,
                    fontWeight: 900,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {idx + 1}
                </div>
              </div>
            );
          })}

          {/* Animated Camera Viewfinder Box */}
          {isCamPath && (
            <div
              style={{
                position: 'absolute',
                left: camX - 16,
                top: camY - 14,
                width: 262,
                height: 172,
                borderRadius: 12,
                border: `2.5px solid ${COLORS.white}`,
                boxShadow: `0 0 28px ${COLORS.amberGlow}`,
                zIndex: 25,
                pointerEvents: 'none',
              }}
            >
              <div style={{ position: 'absolute', top: -22, left: 4, fontFamily: FONTS.mono, fontSize: 13, color: COLORS.amber, fontWeight: 700 }}>
                ● CAM
              </div>
            </div>
          )}

          {/* Live Camera Preview Inset */}
          {isCamPath && (
            <div
              style={{
                position: 'absolute',
                right: 18,
                bottom: 18,
                width: 210,
                height: 132,
                borderRadius: 10,
                border: `1.5px solid ${COLORS.amber}`,
                overflow: 'hidden',
                backgroundColor: '#000',
                zIndex: 30,
              }}
            >
              <Img src={staticFile(slots[activeSlot].img)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <div style={{ position: 'absolute', top: 4, left: 6, backgroundColor: 'rgba(17,19,24,0.85)', padding: '2px 7px', borderRadius: 4, fontSize: 11, color: COLORS.amber }}>
                镜头看到的
              </div>
            </div>
          )}
        </div>
      )}
    </HudFrame>
  );
};

const PROMPT_E1_02: PromptToken[] = [
  { text: '每张素材 ' },
  { text: '自己斜一点', highlight: true },
  { text: '：左右偏 ' },
  { text: '8–18°', highlight: true },
  { text: '、上下偏 ' },
  { text: '4–12°', highlight: true },
  { text: '，镜头再往 ' },
  { text: '反方向 偏一点', highlight: true },
  { text: '，既有透视感、字也能看得清' },
];

export const Ep1Move02TiltedPlacement: React.FC<{
  moveIndex?: number;
  totalMoves?: number;
  promptTokens?: PromptToken[];
  cardImage?: string;
}> = ({
  moveIndex = 2,
  totalMoves = 8,
  promptTokens = PROMPT_E1_02,
  cardImage = 'assets_v2/planet_card.jpg',
}) => {
  const frame = useCurrentFrame();

  // 0..75f: FLAT (0, 0)
  // 75..195f: TILT FOLLOW (rotY -14°, rotX +8°)
  // 195..310f: COUNTER YAW (cam counter yaw +6°)
  // 310..end: PERSPECTIVE (gentle breathing + readability highlight)
  const isFlat = frame < 75;
  const isTilt = frame >= 75 && frame < 195;
  const isCounter = frame >= 195 && frame < 310;

  const rotY = isFlat ? 0 : interpolate(Math.sin((frame - 75) * 0.045), [-1, 1], [-17.3, -9.5]);
  const rotX = frame < 130 ? 0 : interpolate(Math.cos((frame - 130) * 0.04), [-1, 1], [4.5, 10.9]);
  const camYaw = frame < 195 ? 0 : interpolate(Math.sin((frame - 195) * 0.04), [-1, 1], [4.5, 9.4]);

  const status = isFlat ? 'FLAT' : isTilt ? 'TILT FOLLOW' : isCounter ? 'COUNTER YAW' : 'PERSPECTIVE';

  return (
    <HudFrame
      moveIndex={moveIndex}
      totalMoves={totalMoves}
      titleZh="倾斜摆放"
      titleEn="TILTED PLACEMENT"
      cameraMoving={true}
      status={status}
      metrics={[
        { labelEn: 'TILT Y / X', labelZh: '素材偏角', value: `${rotY.toFixed(1)}° · +${rotX.toFixed(1)}°`, accent: !isFlat },
        { labelEn: 'CAM YAW', labelZh: '镜头反角', value: `+${camYaw.toFixed(1)}°`, accent: camYaw > 0 },
        { labelEn: 'READABLE', labelZh: '文字清晰', value: '100%' },
      ]}
      graphMode={isFlat ? 'flat' : 'curve'}
      graphProgress={isFlat ? 0.1 : Math.min(1, (frame - 75) / 240)}
      promptTokens={promptTokens}
      promptStartFrame={80}
    >
      <div style={{ position: 'absolute', inset: 0, perspective: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {/* Golden Angle Arc Overlay */}
        {!isFlat && (
          <svg width="100%" height="100%" viewBox="0 0 1120 520" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 25 }}>
            <path d="M 480 75 A 120 120 0 0 1 640 75" fill="none" stroke={COLORS.amber} strokeWidth="2" strokeDasharray="5 4" />
            <text x="560" y="64" fill={COLORS.amber} fontSize="18" fontFamily={FONTS.mono} textAnchor="middle">
              左右 {Math.abs(rotY).toFixed(1)}°
            </text>
            {rotX > 0 && (
              <text x="955" y="290" fill={COLORS.amber} fontSize="18" fontFamily={FONTS.mono}>
                上下 +{rotX.toFixed(1)}°
              </text>
            )}
            {camYaw > 0 && (
              <text x="720" y="455" fill={COLORS.amberBright} fontSize="18" fontWeight="700">
                镜头反角 +{camYaw.toFixed(1)}°
              </text>
            )}
          </svg>
        )}

        {/* 3D Tilted Card */}
        <div
          style={{
            width: 680,
            height: 380,
            borderRadius: 16,
            overflow: 'hidden',
            border: `2px solid ${!isFlat ? COLORS.amberBorder : COLORS.border}`,
            boxShadow: '0 28px 64px rgba(0,0,0,0.65)',
            transform: `rotateY(${rotY + camYaw * 0.35}deg) rotateX(${rotX}deg)`,
            position: 'relative',
          }}
        >
          <Img src={staticFile(cardImage)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          {frame > 310 && (
            <div
              style={{
                position: 'absolute',
                left: 110,
                bottom: 24,
                width: 96,
                height: 96,
                borderRadius: '50%',
                border: `4px solid ${COLORS.amber}`,
                boxShadow: `0 0 24px ${COLORS.amberGlow}`,
              }}
            />
          )}
        </div>
      </div>
    </HudFrame>
  );
};

const PROMPT_E1_03: PromptToken[] = [
  { text: '把画面分成 ' },
  { text: '近、中、远 三层', highlight: true },
  { text: '：离焦点越远越虚 ' },
  { text: '0 / 4 / 8px', highlight: true },
  { text: '，让观众的视线落在 ' },
  { text: '最清楚的那一层', highlight: true },
];

export const Ep1Move03DepthParallax: React.FC<{
  moveIndex?: number;
  totalMoves?: number;
  promptTokens?: PromptToken[];
  muralImage?: string;
}> = ({
  moveIndex = 3,
  totalMoves = 8,
  promptTokens = PROMPT_E1_03,
  muralImage = 'assets_v2/dunhuang_mural.jpg',
}) => {
  const frame = useCurrentFrame();
  const isFocus = frame >= 260;
  const shift = Math.sin(frame * 0.045);
  const nearX = Math.round(shift * 42);
  const midX = Math.round(shift * 34);
  const farX = Math.round(shift * 26);

  return (
    <HudFrame
      moveIndex={moveIndex}
      totalMoves={totalMoves}
      titleZh="景深分层"
      titleEn="DEPTH & PARALLAX"
      cameraMoving={true}
      status={frame < 60 ? 'LAYERS' : isFocus ? 'FOCUS · 近' : 'NEAR · MID · FAR'}
      metrics={[
        { labelEn: 'NEAR', labelZh: '近景 blur 0px', value: `${nearX >= 0 ? '+' : ''}${nearX} px`, accent: isFocus },
        { labelEn: 'MID', labelZh: '中景 blur 4px', value: `${midX >= 0 ? '+' : ''}${midX} px` },
        { labelEn: 'FAR', labelZh: '远景 blur 8px', value: `${farX >= 0 ? '+' : ''}${farX} px` },
      ]}
      graphMode="sine"
      graphProgress={0.7}
      promptTokens={promptTokens}
      promptStartFrame={65}
    >
      <div style={{ position: 'absolute', inset: 18, borderRadius: 12, overflow: 'hidden', backgroundColor: '#0c0e13' }}>
        {/* Far Layer (blur 8px) */}
        <div
          style={{
            position: 'absolute',
            inset: -30,
            transform: `translateX(${farX}px) scale(1.06)`,
            filter: frame > 120 ? 'blur(7px) brightness(0.65)' : 'none',
          }}
        >
          <Img src={staticFile(muralImage)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>

        {/* Mid Layer (blur 4px) */}
        <div
          style={{
            position: 'absolute',
            inset: -20,
            clipPath: 'inset(10% 18% 10% 18%)',
            transform: `translateX(${midX}px) scale(1.03)`,
            filter: frame > 120 ? 'blur(3.5px) brightness(0.85)' : 'none',
          }}
        >
          <Img src={staticFile(muralImage)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>

        {/* Near Layer (sharp 0px) */}
        <div
          style={{
            position: 'absolute',
            inset: -12,
            clipPath: 'polygon(0 0, 32% 0, 26% 100%, 0 100%)',
            transform: `translateX(${nearX}px)`,
            borderRight: isFocus ? `2px solid ${COLORS.amber}` : 'none',
          }}
        >
          <Img src={staticFile(muralImage)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>

        {/* Layer blur callout tags */}
        {frame > 130 && (
          <>
            <div style={{ position: 'absolute', top: 54, left: 320, backgroundColor: 'rgba(13,16,22,0.88)', border: `1px solid ${COLORS.border}`, padding: '4px 12px', borderRadius: 6, fontSize: 15, fontFamily: FONTS.mono }}>
              远 blur 8px
            </div>
            <div style={{ position: 'absolute', top: 210, left: 610, backgroundColor: 'rgba(13,16,22,0.88)', border: `1px solid ${COLORS.border}`, padding: '4px 12px', borderRadius: 6, fontSize: 15, fontFamily: FONTS.mono }}>
              中 blur 4px
            </div>
            <div
              style={{
                position: 'absolute',
                bottom: 90,
                left: 60,
                backgroundColor: isFocus ? COLORS.amber : 'rgba(13,16,22,0.88)',
                color: isFocus ? '#111318' : COLORS.white,
                padding: '5px 14px',
                borderRadius: 6,
                fontSize: 16,
                fontWeight: 800,
                fontFamily: FONTS.mono,
              }}
            >
              近 blur 0px {isFocus ? '👁' : ''}
            </div>
          </>
        )}

        {/* Side View Focal Plane Minimap */}
        <div
          style={{
            position: 'absolute',
            right: 20,
            bottom: 20,
            width: 195,
            height: 112,
            borderRadius: 10,
            backgroundColor: 'rgba(13,16,22,0.9)',
            border: `1px solid ${COLORS.border}`,
            padding: '8px 12px',
          }}
        >
          <div style={{ fontSize: 11, color: COLORS.textMuted, marginBottom: 8 }}>SIDE VIEW · 景深分层</div>
          <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', height: 64 }}>
            <div style={{ width: 6, height: 52, borderRadius: 3, backgroundColor: COLORS.amber, boxShadow: `0 0 10px ${COLORS.amber}` }} />
            <div style={{ width: 6, height: 42, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.45)' }} />
            <div style={{ width: 6, height: 32, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.2)' }} />
          </div>
        </div>
      </div>
    </HudFrame>
  );
};

const PROMPT_E1_04: PromptToken[] = [
  { text: '换素材时 ' },
  { text: '不硬切', highlight: true },
  { text: '，镜头 ' },
  { text: '斜着推 过去', highlight: true },
  { text: '、路上 ' },
  { text: '多绕 7–10°', highlight: true },
  { text: '；每次切换 ' },
  { text: '0.6–0.9 秒', highlight: true },
  { text: '，节奏 ' },
  { text: '先慢再快再慢', highlight: true },
  { text: '，推进前 ' },
  { text: '先往后拉一点', highlight: true },
];

export const Ep1Move04AngledDolly: React.FC<{
  moveIndex?: number;
  totalMoves?: number;
  promptTokens?: PromptToken[];
}> = ({ moveIndex = 4, totalMoves = 8, promptTokens = PROMPT_E1_04 }) => {
  const frame = useCurrentFrame();

  // 0..340f: DOLLY + ORBIT (cycling pink_xuan <-> dunhuang_mural with S-curve pullback + angled orbit)
  // 340..end: HARD CUT vs DOLLY split comparison
  const isCompare = frame >= 340;
  const cycleLen = 85;
  const cycleIdx = Math.floor(frame / cycleLen);
  const localF = frame % cycleLen;
  const t = Math.min(1, localF / 24); // 0.8s transition
  const easeS = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  const pullback = Math.sin(t * Math.PI) * -0.05; // dips to ~95% before pushing in
  const orbitDeg = Math.sin(t * Math.PI) * 9.5;
  const imgA = cycleIdx % 2 === 0 ? 'assets_v2/pink_xuan.jpg' : 'assets_v2/dunhuang_mural.jpg';
  const imgB = cycleIdx % 2 === 0 ? 'assets_v2/dunhuang_mural.jpg' : 'assets_v2/pink_xuan.jpg';
  const secVal = (localF / 30).toFixed(2);

  return (
    <HudFrame
      moveIndex={moveIndex}
      totalMoves={totalMoves}
      titleZh="斜向运镜"
      titleEn="ANGLED CAMERA MOVE"
      cameraMoving={true}
      status={isCompare ? (frame > 460 ? 'CONTINUITY' : 'HARD CUT vs DOLLY') : 'DOLLY + ORBIT'}
      metrics={[
        { labelEn: 'DURATION', labelZh: '切换时长', value: `${secVal} s`, accent: true },
        { labelEn: 'CAM YAW', labelZh: '路上多绕', value: `${orbitDeg >= 0 ? '+' : ''}${orbitDeg.toFixed(1)}°` },
        { labelEn: 'ZOOM', labelZh: '推进缩放', value: `${Math.round((1 + pullback) * 100)}%` },
      ]}
      graphMode="curve"
      graphProgress={easeS}
      promptTokens={promptTokens}
      promptStartFrame={85}
    >
      {isCompare ? (
        <div style={{ position: 'absolute', inset: 22, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 22 }}>
          {/* Left: HARD CUT with jagged red crack */}
          <div style={{ borderRadius: 12, overflow: 'hidden', position: 'relative', border: `2px solid ${COLORS.red}` }}>
            <Img src={staticFile(localF < 42 ? imgA : imgB)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <div style={{ position: 'absolute', top: 14, left: 14, backgroundColor: COLORS.red, color: COLORS.white, padding: '4px 12px', borderRadius: 6, fontSize: 18, fontWeight: 900 }}>
              硬切 · 断！
            </div>
            <svg width="100%" height="100%" viewBox="0 0 500 480" style={{ position: 'absolute', inset: 0 }}>
              <polyline points="260,0 230,140 275,260 220,380 255,480" fill="none" stroke={COLORS.red} strokeWidth="5" />
            </svg>
          </div>
          {/* Right: Smooth Angled Dolly */}
          <div style={{ borderRadius: 12, overflow: 'hidden', position: 'relative', border: `2px solid ${COLORS.amber}`, perspective: 900 }}>
            <div
              style={{
                width: '100%',
                height: '100%',
                transform: `scale(${1 + pullback}) rotateY(${orbitDeg}deg)`,
              }}
            >
              <Img src={staticFile(t < 0.5 ? imgA : imgB)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div style={{ position: 'absolute', top: 14, left: 14, backgroundColor: COLORS.amber, color: '#111318', padding: '4px 12px', borderRadius: 6, fontSize: 18, fontWeight: 900 }}>
              斜推 · 连贯 ✓
            </div>
          </div>
        </div>
      ) : (
        <div style={{ position: 'absolute', inset: 0, perspective: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
          <div
            style={{
              position: 'absolute',
              top: 22,
              left: 26,
              backgroundColor: 'rgba(13,16,22,0.88)',
              border: `1.5px solid ${COLORS.amberBorder}`,
              padding: '6px 14px',
              borderRadius: 8,
              fontFamily: FONTS.mono,
              fontSize: 22,
              color: COLORS.amber,
              fontWeight: 800,
              zIndex: 20,
            }}
          >
            ⏱ {secVal}s
          </div>
          {/* True simultaneous 3D angled dolly: outgoing Card A & incoming Card B glide smoothly without hard-cutting! */}
          <div
            style={{
              position: 'absolute',
              width: 740,
              height: 400,
              borderRadius: 16,
              overflow: 'hidden',
              border: `2px solid ${COLORS.amberBorder}`,
              boxShadow: '0 24px 60px rgba(0,0,0,0.65)',
              transform: `translate3d(${interpolate(easeS, [0, 1], [0, -860])}px, ${interpolate(easeS, [0, 1], [0, -90])}px, ${pullback * 600}px) scale(${1 + pullback}) rotateY(${orbitDeg}deg)`,
              opacity: interpolate(easeS, [0, 0.85, 1], [1, 0.4, 0], { extrapolateRight: 'clamp' }),
            }}
          >
            <Img src={staticFile(imgA)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div
            style={{
              position: 'absolute',
              width: 740,
              height: 400,
              borderRadius: 16,
              overflow: 'hidden',
              border: `2px solid ${COLORS.amberBorder}`,
              boxShadow: '0 24px 60px rgba(0,0,0,0.65)',
              transform: `translate3d(${interpolate(easeS, [0, 1], [860, 0])}px, ${interpolate(easeS, [0, 1], [90, 0])}px, ${pullback * 600}px) scale(${1 + pullback}) rotateY(${-orbitDeg}deg)`,
              opacity: interpolate(easeS, [0, 0.15, 1], [0, 0.6, 1], { extrapolateRight: 'clamp' }),
            }}
          >
            <Img src={staticFile(imgB)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div
            style={{
              position: 'absolute',
              bottom: 24,
              left: 28,
              backgroundColor: COLORS.amber,
              color: '#111318',
              padding: '4px 14px',
              borderRadius: 6,
              fontSize: 15,
              fontWeight: 800,
            }}
          >
            先往后拉 97% → 再斜向推进
          </div>
        </div>
      )}
    </HudFrame>
  );
};
