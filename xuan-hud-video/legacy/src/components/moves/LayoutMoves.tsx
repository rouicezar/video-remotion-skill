import React from 'react';
import { Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { HudFrame } from '../../design/Chrome';
import { COLORS, FONTS } from '../../design/tokens';
import { PromptToken } from '../../types/timeline';

const ARCH_WORKS = [
  { image: 'assets/card_03.jpg', title: '古罗马 · 万神殿', sub: '穹顶开天窗，光线从上洒下来' },
  { image: 'assets/arch_01.jpg', title: '拜占庭 · 圣索菲亚', sub: '巨大的穹顶浮在一圈窗户上' },
  { image: 'assets/card_04.jpg', title: '哥特式 · 尖拱与彩窗', sub: '把光线染成彩色直指天穹' },
  { image: 'assets/card_06.jpg', title: '表现主义 · 悉尼歌剧院', sub: '一组白色的帆，停在海边' },
  { image: 'assets/card_02.jpg', title: '古希腊 · 女像柱廊', sub: '以雕塑承托檐部的古典秩序' },
  { image: 'assets/arch_04.jpg', title: '高技派 · 蓬皮杜中心', sub: '把管道和结构全部翻到外面' },
  { image: 'assets/card_07.jpg', title: '风格派 · 施罗德住宅', sub: '红黄蓝三原色与几何体块' },
  { image: 'assets/card_08.jpg', title: '粗野主义 · 巴比肯', sub: '裸露混凝土与粗犷几何体量' },
  { image: 'assets/arch_07.jpg', title: '现代主义 · 玻璃幕墙', sub: '少即是多，纯粹的功能与光线' },
  { image: 'assets/arch_11.jpg', title: '解构主义 · 自由曲面', sub: '打破对称与重力的空间张力' },
];

const DEFAULT_PROMPT_04: PromptToken[] = [
  { text: '作品沿 ' },
  { text: '纵深方向', highlight: true },
  { text: ' 每隔一段排开、' },
  { text: '左右交替', highlight: true },
  { text: '，镜头 ' },
  { text: '连续往前推', highlight: true },
  { text: '、每件约 ' },
  { text: '0.7 秒', highlight: true },
  { text: '，穿过的那件 ' },
  { text: '放大变虚', highlight: true },
  { text: '、下一件从深处 ' },
  { text: '淡入', highlight: true },
  { text: '，介绍文字放在对侧' },
];

export const Move04DepthTunnelDemo: React.FC<{
  moveIndex?: number;
  totalMoves?: number;
  titleZh?: string;
  titleEn?: string;
  promptTokens?: PromptToken[];
  works?: Array<{ image: string; title: string; sub: string }>;
}> = ({
  moveIndex = 4,
  totalMoves = 9,
  titleZh = '纵深穿梭',
  titleEn = 'DEPTH TUNNEL',
  promptTokens = DEFAULT_PROMPT_04,
  works = ARCH_WORKS,
}) => {
  const frame = useCurrentFrame();
  // True exhilarating 3D fly-through: large cards alternating left/right, rushing past camera with blur!
  const zSpacing = 980;
  const maxZ = (works.length - 1) * zSpacing;
  const camZ = interpolate(frame, [0, 410], [80, maxZ + 220], { extrapolateRight: 'clamp' });
  const activeIdx = Math.min(works.length - 1, Math.max(0, Math.floor((camZ + 320) / zSpacing)));
  const speed = frame < 45 ? 0.0 : Number((0.6 + 0.9 * Math.abs(Math.sin(frame * 0.07))).toFixed(1));
  const status = frame < 60 ? 'WORK 01' : 'FLY THROUGH';

  return (
    <HudFrame
      moveIndex={moveIndex}
      totalMoves={totalMoves}
      titleZh={titleZh}
      titleEn={titleEn}
      cameraMoving={true}
      status={status}
      metrics={[
        { labelEn: 'CAM.Z', labelZh: '相机深度', value: `${Math.round(camZ * 1.4)} px`, accent: true },
        { labelEn: 'WORK', labelZh: '当前作品', value: `${activeIdx + 1} / ${works.length}` },
        { labelEn: 'SPEED', labelZh: '推进速度', value: `${speed.toFixed(1)}×` },
      ]}
      graphMode={frame < 60 ? 'flat' : 'sine'}
      graphProgress={camZ / maxZ}
      promptTokens={promptTokens}
      promptStartFrame={80}
    >
      <div style={{ position: 'absolute', inset: 0, perspective: 950, overflow: 'hidden' }}>
        {/* Radial depth speed lines */}
        <svg width="100%" height="100%" viewBox="0 0 1180 560" style={{ position: 'absolute', inset: 0, opacity: 0.24 }}>
          {Array.from({ length: 20 }).map((_, i) => {
            const angle = (i / 20) * Math.PI * 2;
            const r1 = 80;
            const r2 = 720;
            return (
              <line
                key={i}
                x1={590 + Math.cos(angle) * r1}
                y1={275 + Math.sin(angle) * r1}
                x2={590 + Math.cos(angle) * r2}
                y2={275 + Math.sin(angle) * r2}
                stroke="#ffffff"
                strokeWidth={1}
              />
            );
          })}
        </svg>

        {frame > 180 && (
          <div style={{ position: 'absolute', top: 18, left: 24, backgroundColor: COLORS.amber, color: '#111318', padding: '5px 14px', borderRadius: 6, fontSize: 16, fontWeight: 800, zIndex: 30 }}>
            第 {activeIdx + 1} / {works.length} 件 · 一件一件往里走
          </div>
        )}

        {/* HUGE Alternating Left/Right 3D Tunnel Cards */}
        {works.map((w, i) => {
          const itemZ = i * zSpacing + 860;
          const relZ = itemZ - camZ;
          if (relZ < -320 || relZ > 3200) return null;

          // Perspective scale: large 540x360 cards staying bold & prominent!
          const scale = Math.min(2.2, Math.max(0.14, 920 / Math.max(180, relZ)));
          const isRight = i % 2 === 1;
          const baseOffsetX = isRight ? 225 : -225;
          const x = 590 + baseOffsetX * scale;
          const y = 275;
          const opacity =
            relZ > 2600
              ? interpolate(relZ, [2600, 3600], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
              : relZ < 420
                ? interpolate(relZ, [-220, 420], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
                : 1;
          const blur = relZ < 480 ? interpolate(relZ, [80, 480], [16, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) : 0;

          return (
            <React.Fragment key={i}>
              <div
                style={{
                  position: 'absolute',
                  left: x,
                  top: y,
                  width: 540,
                  height: 360,
                  transform: `translate(-50%, -50%) scale(${scale})`,
                  borderRadius: 14,
                  overflow: 'hidden',
                  border: '1.5px solid rgba(255,255,255,0.25)',
                  boxShadow: '0 26px 70px rgba(0,0,0,0.7)',
                  opacity,
                  filter: blur > 0.5 ? `blur(${blur.toFixed(1)}px)` : 'none',
                  zIndex: Math.round(5000 - relZ),
                }}
              >
                <Img src={staticFile(w.image)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>

              {/* Bold Opposite-Side Caption sliding in cleanly */}
              {i === activeIdx && relZ > 280 && relZ < 1550 && (
                <div
                  style={{
                    position: 'absolute',
                    left: isRight ? 76 : 710,
                    top: 205,
                    width: 400,
                    zIndex: 6000,
                    opacity: interpolate(relZ, [280, 440, 1150, 1550], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
                  }}
                >
                  <div style={{ fontFamily: FONTS.mono, fontSize: 14, letterSpacing: 2, color: COLORS.textSecondary, marginBottom: 8 }}>
                    {String(i + 1).padStart(2, '0')} / {works.length} — ARCHITECTURE
                  </div>
                  <div style={{ fontSize: 38, fontWeight: 900, color: COLORS.white, marginBottom: 10, textShadow: '0 4px 18px rgba(0,0,0,0.8)' }}>
                    {w.title}
                  </div>
                  <div style={{ fontSize: 20, color: COLORS.textSecondary, lineHeight: 1.45 }}>
                    {w.sub}
                  </div>
                </div>
              )}
            </React.Fragment>
          );
        })}

        {/* Bottom-right Side-View Camera Route Minimap */}
        <div style={{ position: 'absolute', right: 22, bottom: 20, width: 225, height: 112, borderRadius: 10, backgroundColor: 'rgba(13, 16, 22, 0.9)', border: `1px solid ${COLORS.border}`, padding: '10px 14px', zIndex: 7000 }}>
          <div style={{ fontSize: 12, color: COLORS.textMuted, marginBottom: 8 }}>侧视 · 相机路线</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', height: 60 }}>
            {works.slice(0, 8).map((_, idx) => (
              <div key={idx} style={{ width: 8, height: 22, borderRadius: 2, backgroundColor: idx <= activeIdx ? COLORS.amber : 'rgba(255,255,255,0.2)', transform: `translateY(${idx % 2 === 0 ? -15 : 15}px)` }} />
            ))}
            <div style={{ position: 'absolute', left: `${(activeIdx / (works.length - 1)) * 86}%`, top: '50%', transform: 'translateY(-50%)', width: 12, height: 12, borderRadius: 3, backgroundColor: COLORS.amberBright, boxShadow: `0 0 12px ${COLORS.amber}` }} />
          </div>
        </div>
      </div>
    </HudFrame>
  );
};

const DEFAULT_PROMPT_05: PromptToken[] = [
  { text: '图 ' },
  { text: '围着中心排成圆筒', highlight: true },
  { text: '，每层 6 到 8 张、一层层往上，相机绕着转：' },
  { text: '先快后慢 转开', highlight: true },
  { text: '，再 ' },
  { text: '匀速慢慢转', highlight: true },
  { text: '，并慢慢抬高，一次看到很多张' },
];

export const Move05HelixDemo: React.FC<{
  moveIndex?: number;
  totalMoves?: number;
  titleZh?: string;
  titleEn?: string;
  promptTokens?: PromptToken[];
  cards?: string[];
}> = ({
  moveIndex = 5,
  totalMoves = 9,
  titleZh = '环筒螺旋',
  titleEn = 'HELIX',
  promptTokens = DEFAULT_PROMPT_05,
  cards = [
    'assets/card_01.jpg', 'assets/card_02.jpg', 'assets/card_03.jpg', 'assets/card_04.jpg',
    'assets/card_05.jpg', 'assets/card_06.jpg', 'assets/card_07.jpg', 'assets/card_08.jpg',
    'assets/arch_01.jpg', 'assets/arch_04.jpg', 'assets/arch_07.jpg', 'assets/arch_11.jpg',
  ],
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Exact choreography matching strip_m5_helix.jpg:
  // 0..85f: TOP VIEW (steep -42deg pitch, 1/4 spacious ring!)
  // 85..175f: STACK (1/4 -> 4/4 layers pop in spirally as pitch levels to -10deg)
  // 175..end: ORBIT (fast-out spin into smooth steady helical orbit with real 3D depth fading!)
  const visibleLayers = frame < 85 ? 1 : Math.min(4, 1 + Math.floor((frame - 75) / 26));
  const status = frame < 85 ? 'TOP VIEW' : frame < 175 ? 'STACK' : 'ORBIT';
  const camPitch = interpolate(frame, [0, 85, 195], [-42, -32, -8], { extrapolateRight: 'clamp' });
  const rotY = frame < 175 ? frame * 1.15 : 175 * 1.15 + (frame - 175) * 1.85;
  const orbitDeg = Math.round(rotY % 360);
  const radius = 385; // Spacious! Zero overlap!
  const perLayer = 7;

  return (
    <HudFrame
      moveIndex={moveIndex}
      totalMoves={totalMoves}
      titleZh={titleZh}
      titleEn={titleEn}
      cameraMoving={true}
      status={status}
      metrics={[
        { labelEn: 'LAYERS', labelZh: '层数', value: `${visibleLayers} / 4`, accent: visibleLayers === 4 },
        { labelEn: 'PER LAYER', labelZh: '每层', value: '6–8 张' },
        { labelEn: 'ORBIT', labelZh: '环绕角度', value: `${orbitDeg}°` },
      ]}
      graphMode={status === 'ORBIT' ? 'flat' : 'curve'}
      graphProgress={visibleLayers / 4}
      graphSteps={4}
      promptTokens={promptTokens}
      promptStartFrame={110}
    >
      <div style={{ position: 'absolute', inset: 0, perspective: 1200, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        {visibleLayers >= 2 && (
          <div style={{ position: 'absolute', top: 18, left: 22, display: 'flex', gap: 10, zIndex: 30 }}>
            <div style={{ backgroundColor: COLORS.amber, color: '#111318', padding: '4px 12px', borderRadius: 6, fontSize: 15, fontWeight: 800 }}>每层 6–8 张</div>
            <div style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: COLORS.textPrimary, padding: '4px 12px', borderRadius: 6, fontSize: 15, fontWeight: 700 }}>
              第 {visibleLayers} 层 · 画面里 {visibleLayers * perLayer} 张
            </div>
          </div>
        )}

        {/* Spacious Depth-Sorted 3D Cylinder Helix */}
        <div
          style={{
            width: 0,
            height: 0,
            position: 'relative',
            transformStyle: 'preserve-3d',
            transform: `rotateX(${camPitch}deg) rotateY(${-rotY}deg) translateY(${(visibleLayers - 1) * 34}px)`,
          }}
        >
          {Array.from({ length: visibleLayers }).map((_, layerIdx) =>
            Array.from({ length: perLayer }).map((__, slotIdx) => {
              const angle = (slotIdx / perLayer) * 360 + layerIdx * 26;
              const worldAngleRad = ((angle - rotY) * Math.PI) / 180;
              const depthCos = Math.cos(worldAngleRad); // +1 front, -1 back
              const brightness = interpolate(depthCos, [-1, 1], [0.35, 1.0]);
              const y = -layerIdx * 116 + 60;
              const src = cards[(layerIdx * perLayer + slotIdx) % cards.length];
              const pop = layerIdx === 0 ? 1 : spring({ frame: Math.max(0, frame - (75 + layerIdx * 26 + slotIdx * 2)), fps, config: { damping: 14, stiffness: 130 } });

              return (
                <div
                  key={`${layerIdx}-${slotIdx}`}
                  style={{
                    position: 'absolute',
                    left: -82,
                    top: -52,
                    width: 164,
                    height: 104,
                    borderRadius: 8,
                    overflow: 'hidden',
                    border: '1px solid rgba(255,255,255,0.22)',
                    boxShadow: '0 10px 26px rgba(0,0,0,0.6)',
                    filter: `brightness(${brightness.toFixed(2)})`,
                    transform: `rotateY(${angle}deg) translateZ(${radius}px) translateY(${y}px) scale(${pop})`,
                  }}
                >
                  <Img src={staticFile(src)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              );
            })
          )}
        </div>

        {/* Top-down Radar Minimap */}
        <div style={{ position: 'absolute', right: 22, bottom: 20, width: 148, height: 122, borderRadius: 10, backgroundColor: 'rgba(13, 16, 22, 0.9)', border: `1px solid ${COLORS.border}`, padding: 10, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ fontSize: 11, color: COLORS.textMuted, alignSelf: 'flex-start' }}>俯视 · 相机环绕</div>
          <svg width="82" height="82" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="30" fill="none" stroke="rgba(255,255,255,0.2)" strokeDasharray="4 4" />
            {Array.from({ length: 7 }).map((_, i) => {
              const a = (i / 7) * Math.PI * 2;
              return <circle key={i} cx={50 + Math.cos(a) * 28} cy={50 + Math.sin(a) * 28} r={3.5} fill={COLORS.amber} />;
            })}
            <circle cx={50 + Math.cos((orbitDeg * Math.PI) / 180) * 42} cy={50 + Math.sin((orbitDeg * Math.PI) / 180) * 42} r={5} fill={COLORS.amberBright} />
          </svg>
        </div>
      </div>
    </HudFrame>
  );
};

const DUNHUANG_PANELS = [
  { image: 'assets/dunhuang_01.jpg', title: '一眼千年', sub: '穿越敦煌莫高窟的色彩与回响' },
  { image: 'assets/dunhuang_02.jpg', title: '寻鹿 · 入林', sub: '九色鹿踏入山林，星光微明' },
  { image: 'assets/dunhuang_03.jpg', title: '寻鹿 · 相遇', sub: '壁画深处的光影与故事' },
  { image: 'assets/dunhuang_04.jpg', title: '寻鹿 · 同行', sub: '一人一鹿，走向洞窟深处' },
  { image: 'assets/dunhuang_05.jpg', title: '飞天 · 起舞', sub: '衣袂飘举，飞天在云上起舞' },
  { image: 'assets/dunhuang_06.jpg', title: '飞天 · 定格', sub: '化作洞窟深处的永恒壁画' },
];

const DEFAULT_PROMPT_06: PromptToken[] = [
  { text: '封面和介绍 ' },
  { text: '拼成一块展板', highlight: true },
  { text: '，一块接一块 ' },
  { text: '往上滚', highlight: true },
  { text: '，每块随滚动 ' },
  { text: '绕横轴大角度翻转', highlight: true },
  { text: '，转到正面完整显色，其余 ' },
  { text: '压暗到 30%', highlight: true },
  { text: '，中间横过一条 ' },
  { text: '金色英文', highlight: true },
];

export const Move06Flip3DDemo: React.FC<{
  moveIndex?: number;
  totalMoves?: number;
  titleZh?: string;
  titleEn?: string;
  promptTokens?: PromptToken[];
  panels?: Array<{ image: string; title: string; sub: string }>;
  marqueeText?: string;
}> = ({
  moveIndex = 6,
  totalMoves = 9,
  titleZh = '三维翻转',
  titleEn = '3D FLIP',
  promptTokens = DEFAULT_PROMPT_06,
  panels = DUNHUANG_PANELS,
  marqueeText = 'DUNHUANG / A THOUSAND YEARS IN ONE GLANCE / SEEKING THE DEER / FLYING APSARA / ',
}) => {
  const frame = useCurrentFrame();
  const totalVirtual = 14;
  const scrollPos = interpolate(frame, [0, 520], [0, totalVirtual - 1], { extrapolateRight: 'clamp' });
  const activeNum = Math.min(totalVirtual, Math.floor(scrollPos) + 1);
  const dimOthers = frame >= 245;
  const status = frame < 190 ? 'RING' : frame < 245 ? 'FRONT' : 'FOCUS';
  const marqueeX = -(frame * 4.2) % 1600;

  return (
    <HudFrame
      moveIndex={moveIndex}
      totalMoves={totalMoves}
      titleZh={titleZh}
      titleEn={titleEn}
      cameraMoving={true}
      status={status}
      metrics={[
        { labelEn: 'FRONT', labelZh: '正面', value: `第 ${activeNum} / ${totalVirtual} 张`, accent: true },
        { labelEn: 'OTHERS', labelZh: '其余亮度', value: dimOthers ? '30%' : '100%' },
        { labelEn: 'FLIP', labelZh: '翻转角度', value: '±95°' },
      ]}
      graphMode="flat"
      graphProgress={activeNum / totalVirtual}
      promptTokens={promptTokens}
      promptStartFrame={115}
    >
      <div style={{ position: 'absolute', inset: 0, perspective: 1000, overflow: 'hidden', backgroundColor: '#0c0e13' }}>
        {Array.from({ length: totalVirtual }).map((_, i) => {
          const delta = i - scrollPos;
          if (Math.abs(delta) > 1.7) return null;
          const panel = panels[i % panels.length];
          const rotX = interpolate(delta, [-1.5, 0, 1.5], [82, 0, -82]);
          const y = 265 + delta * 260;
          const isCenter = Math.abs(delta) < 0.42;
          const brightness = isCenter ? 1 : dimOthers ? 0.3 : 0.72;
          const scale = 1 - Math.abs(delta) * 0.1;

          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: 90,
                top: y - 135,
                width: 960,
                height: 270,
                display: 'flex',
                alignItems: 'center',
                gap: 44,
                transform: `rotateX(${rotX}deg) scale(${scale})`,
                transformOrigin: 'center center',
                filter: `brightness(${brightness})`,
                zIndex: isCenter ? 20 : 10,
              }}
            >
              <div style={{ width: 490, height: 264, borderRadius: 12, overflow: 'hidden', border: isCenter ? `2px solid ${COLORS.amberBorder}` : '1px solid rgba(255,255,255,0.14)', boxShadow: '0 18px 44px rgba(0,0,0,0.65)' }}>
                <Img src={staticFile(panel.image)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: FONTS.mono, fontSize: 13, color: COLORS.textMuted, marginBottom: 8 }}>
                  {String(i + 1).padStart(2, '0')} / {totalVirtual} — 敦煌入画
                </div>
                <div style={{ fontSize: 32, fontWeight: 800, color: COLORS.white, marginBottom: 10 }}>{panel.title}</div>
                <div style={{ fontSize: 18, color: COLORS.textSecondary }}>{panel.sub}</div>
              </div>
            </div>
          );
        })}

        {/* Golden Horizontal Marquee */}
        <div style={{ position: 'absolute', left: 0, right: 0, top: '50%', transform: 'translateY(-50%)', whiteSpace: 'nowrap', fontFamily: FONTS.display, fontSize: 64, fontWeight: 900, letterSpacing: 3, color: '#e8d08e', textShadow: '0 4px 20px rgba(0,0,0,0.75)', pointerEvents: 'none', zIndex: 35, opacity: 0.92 }}>
          <span style={{ display: 'inline-block', transform: `translateX(${marqueeX}px)` }}>
            {marqueeText}
            {marqueeText}
          </span>
        </div>

        {/* Side-view Camera Route Minimap */}
        <div style={{ position: 'absolute', right: 22, bottom: 20, width: 170, height: 126, borderRadius: 10, backgroundColor: 'rgba(13, 16, 22, 0.9)', border: `1px solid ${COLORS.border}`, padding: '10px 14px', zIndex: 40 }}>
          <div style={{ fontSize: 11, color: COLORS.textMuted, marginBottom: 8 }}>侧视 · 相机路线</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around' }}>
            <div style={{ width: 12, height: 12, borderRadius: 2, backgroundColor: COLORS.amber }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              {Array.from({ length: 6 }).map((_, idx) => (
                <div key={idx} style={{ width: 44, height: 8, borderRadius: 2, backgroundColor: idx === 2 ? COLORS.amber : 'rgba(255,255,255,0.22)' }} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </HudFrame>
  );
};
