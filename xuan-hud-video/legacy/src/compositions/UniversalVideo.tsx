import React from 'react';
import { Audio, Img, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { HudFrame, SubtitleOverlay, WorldCanvas } from '../design/Chrome';
import { COLORS, FONTS } from '../design/tokens';
import { glassSheenStyle, glassSurface, smoothFocusWeight } from '../design/motion';
import { UniversalScene, UniversalTimeline } from '../types/timeline';
import { ChapterDividerScene, MoveBumperScene } from '../components/scenes/ChapterAndBumper';
import { CheatSheetCTAScene } from '../components/scenes/OutroScenes';

const TopicVisualCard: React.FC<{
  code: string;
  title: string;
  subtitle?: string;
  image?: string;
  accentColor?: string;
  activeWeight?: number; // 0..1 continuous focus weight!
  active?: boolean;
}> = ({ code, title, subtitle, image, accentColor = COLORS.amber, activeWeight, active = false }) => {
  const frame = useCurrentFrame();
  const w = activeWeight !== undefined ? activeWeight : active ? 1 : 0;
  return (
    <div
      style={{
        ...glassSurface({ active: w, blurPx: 16, radius: 14, opacity: 0.58 }),
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: image ? 0 : 20,
      }}
    >
      <div style={glassSheenStyle(frame, 0.55)} />
      {image ? (
        <>
          <Img src={staticFile(image)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <div
            style={{
              position: 'absolute',
              inset: 'auto 0 0 0',
              background: 'linear-gradient(transparent, rgba(11,13,18,0.92))',
              padding: '24px 16px 12px 16px',
            }}
          >
            <div style={{ fontSize: 20, fontWeight: 800, color: COLORS.white }}>{title}</div>
            {subtitle ? <div style={{ fontSize: 13, color: COLORS.textSecondary }}>{subtitle}</div> : null}
          </div>
        </>
      ) : (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div
              style={{
                backgroundColor: accentColor,
                color: '#111318',
                fontFamily: FONTS.display,
                fontSize: 24,
                fontWeight: 900,
                padding: '2px 10px',
                borderRadius: 6,
              }}
            >
              {code}
            </div>
            <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: accentColor }} />
          </div>
          <div>
            <div style={{ fontSize: 26, fontWeight: 800, color: COLORS.white, lineHeight: 1.25, marginBottom: 6 }}>
              {title}
            </div>
            {subtitle ? (
              <div style={{ fontSize: 15, color: COLORS.textSecondary, lineHeight: 1.45 }}>{subtitle}</div>
            ) : null}
          </div>
        </>
      )}
    </div>
  );
};

const UniversalHookScene: React.FC<{ scene: UniversalScene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 15, stiffness: 110 } });
  const cards = scene.items ?? [];

  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 36, paddingBottom: 110 }}>
      {scene.badge ? (
        <div
          style={{
            backgroundColor: COLORS.amber,
            color: '#111318',
            padding: '10px 28px',
            borderRadius: 12,
            fontSize: 28,
            fontWeight: 900,
            transform: `scale(${enter})`,
          }}
        >
          {scene.badge}
        </div>
      ) : null}
      <div
        style={{
          fontSize: 82,
          fontWeight: 900,
          color: COLORS.white,
          textAlign: 'center',
          maxWidth: 1400,
          lineHeight: 1.15,
          transform: `translateY(${interpolate(enter, [0, 1], [28, 0])}px)`,
          opacity: enter,
        }}
      >
        {scene.title}
      </div>
      {scene.subtitle ? (
        <div style={{ fontSize: 30, color: COLORS.textSecondary, maxWidth: 1100, textAlign: 'center' }}>
          {scene.subtitle}
        </div>
      ) : null}
      {cards.length > 0 && (
        <div style={{ display: 'flex', gap: 22, marginTop: 12, perspective: 1000 }}>
          {cards.slice(0, 4).map((c, i) => {
            const p = spring({ frame: Math.max(0, frame - i * 5), fps, config: { damping: 14, stiffness: 120 } });
            return (
              <div
                key={i}
                style={{
                  width: 300,
                  height: 190,
                  transform: `scale(${p}) rotateY(${(i - 1.5) * 6}deg)`,
                }}
              >
                <TopicVisualCard code={c.code} title={c.title} subtitle={c.subtitle} image={c.image} accentColor={c.color} active={i === 1} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const UniversalOverviewScene: React.FC<{ scene: UniversalScene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const items = scene.items ?? [];

  return (
    <div style={{ position: 'absolute', inset: '72px 110px 175px 110px', display: 'flex', flexDirection: 'column', gap: 28 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        {scene.badge ? (
          <div style={{ backgroundColor: COLORS.amber, color: '#111318', padding: '10px 26px', borderRadius: 12, fontSize: 32, fontWeight: 900 }}>
            {scene.badge}
          </div>
        ) : null}
        <div style={{ fontSize: 44, fontWeight: 900, color: COLORS.white }}>{scene.title}</div>
      </div>
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: `repeat(${Math.min(3, Math.max(1, items.length))}, 1fr)`, gap: 24 }}>
        {items.slice(0, 9).map((it, i) => {
          const p = spring({ frame: Math.max(0, frame - i * 4), fps, config: { damping: 15, stiffness: 120 } });
          return (
            <div key={i} style={{ transform: `scale(${p})` }}>
              <TopicVisualCard code={it.code} title={it.title} subtitle={it.subtitle ?? it.description} image={it.image} accentColor={it.color} />
            </div>
          );
        })}
      </div>
    </div>
  );
};

const UniversalMoveDemoScene: React.FC<{ scene: UniversalScene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const items =
    scene.items && scene.items.length > 0
      ? scene.items
      : [
          { code: '01', title: scene.title ?? '核心要点 1', subtitle: scene.subtitle ?? '结构化拆解', color: '#f5a623' },
          { code: '02', title: '关键步骤 2', subtitle: '节奏与视觉推进', color: '#74B3F5' },
          { code: '03', title: '落地验证 3', subtitle: '清晰结论输出', color: '#34d399' },
          { code: '04', title: '进阶扩展 4', subtitle: '复用与举一反三', color: '#EE8458' },
        ];

  const durationFrames = Math.max(30, Math.round((scene.endSec - scene.startSec) * fps));
  const progress = Math.min(1, frame / Math.max(1, durationFrames - 15));
  const moveType = scene.moveType ?? 'deal-in';
  const focusPos = progress * Math.max(1, items.length - 1);
  const activeIdx = Math.min(items.length - 1, Math.round(focusPos));

  const renderStage = () => {
    // --- EPISODE 1: 8 SPATIAL & CAMERA MOVES ---
    if (moveType === 'world-canvas') {
      const cols = [
        { x: 110, y: 80 },
        { x: 600, y: 80 },
        { x: 600, y: 290 },
        { x: 110, y: 290 },
      ];
      const seg = Math.min(2, Math.floor(focusPos));
      const t = focusPos - seg;
      const easeT = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      const camX = cols[seg].x + (cols[seg + 1].x - cols[seg].x) * easeT;
      const camY = cols[seg].y + (cols[seg + 1].y - cols[seg].y) * easeT;
      return (
        <div style={{ position: 'absolute', inset: 18 }}>
          <svg width="100%" height="100%" viewBox="0 0 1100 500" style={{ position: 'absolute', inset: 0 }}>
            <polyline points="280,165 770,165 770,375 280,375" fill="none" stroke={COLORS.amber} strokeWidth="2.5" strokeDasharray="8 6" opacity={0.7} />
          </svg>
          {items.slice(0, 4).map((it, i) => (
            <div key={i} style={{ position: 'absolute', left: cols[i].x, top: cols[i].y, width: 350, height: 170 }}>
              <TopicVisualCard code={it.code} title={it.title} subtitle={it.subtitle} image={it.image} accentColor={it.color} activeWeight={smoothFocusWeight(i, focusPos, 0.9)} />
            </div>
          ))}
          <div
            style={{
              position: 'absolute',
              left: camX - 10,
              top: camY - 10,
              width: 370,
              height: 190,
              borderRadius: 16,
              border: `2.5px solid ${COLORS.white}`,
              boxShadow: `0 0 28px ${COLORS.amberGlow}`,
              pointerEvents: 'none',
            }}
          />
        </div>
      );
    }

    if (moveType === 'tilted-placement') {
      const cur = items[activeIdx];
      const rotY = interpolate(Math.sin(frame * 0.05), [-1, 1], [-15, -7]);
      const rotX = interpolate(Math.cos(frame * 0.04), [-1, 1], [4, 10]);
      return (
        <div style={{ position: 'absolute', inset: 0, perspective: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: 680, height: 360, transform: `rotateY(${rotY}deg) rotateX(${rotX}deg)` }}>
            <TopicVisualCard code={cur.code} title={cur.title} subtitle={cur.subtitle} image={cur.image} accentColor={cur.color} active />
          </div>
        </div>
      );
    }

    if (moveType === 'depth-parallax') {
      const shift = Math.sin(frame * 0.05) * 32;
      return (
        <div style={{ position: 'absolute', inset: 28, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {items.slice(0, 3).map((it, i) => {
            const blur = i === 0 ? 0 : i === 1 ? 3 : 6;
            const x = (i - 1) * 280 + shift * (1 - i * 0.3);
            const scale = 1 - i * 0.12;
            return (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  width: 440,
                  height: 270,
                  transform: `translateX(${x}px) scale(${scale})`,
                  filter: `blur(${blur}px) brightness(${1 - i * 0.2})`,
                  zIndex: 10 - i,
                }}
              >
                <TopicVisualCard code={it.code} title={it.title} subtitle={it.subtitle} image={it.image} accentColor={it.color} active={i === 0} />
              </div>
            );
          })}
        </div>
      );
    }

    if (moveType === 'angled-dolly') {
      const cur = items[activeIdx];
      const segF = Math.max(15, Math.floor(durationFrames / items.length));
      const localF = frame % segF;
      const t = Math.min(1, localF / 20);
      const pullback = Math.sin(t * Math.PI) * -0.05;
      const orbit = Math.sin(t * Math.PI) * 9;
      return (
        <div style={{ position: 'absolute', inset: 0, perspective: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: 700, height: 370, transform: `scale(${1 + pullback}) rotateY(${orbit}deg)` }}>
            <TopicVisualCard code={cur.code} title={cur.title} subtitle={cur.subtitle} image={cur.image} accentColor={cur.color} active />
          </div>
        </div>
      );
    }

    if (moveType === 'slow-push-in') {
      const cur = items[activeIdx];
      const sec = frame / fps;
      return (
        <div style={{ position: 'absolute', inset: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
          <div style={{ width: 740, height: 390, transform: `scale(${1 + sec * 0.025}) rotate(${sec * 0.3}deg)` }}>
            <TopicVisualCard code={cur.code} title={cur.title} subtitle={cur.subtitle} image={cur.image} accentColor={cur.color} active />
          </div>
        </div>
      );
    }

    if (moveType === 'walk-in') {
      return (
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
          <svg width="100%" height="100%" viewBox="0 0 1120 520" style={{ position: 'absolute', inset: 0 }}>
            <polygon points="500,140 620,140 940,520 180,520" fill="rgba(245,166,35,0.08)" stroke={COLORS.amber} strokeWidth="2" />
            <line x1="560" y1="140" x2="560" y2="520" stroke={COLORS.amber} strokeWidth="3" strokeDasharray="14 14" strokeDashoffset={-frame * 4} />
          </svg>
          {items.slice(0, 4).map((it, i) => {
            const active = i === activeIdx;
            const left = i % 2 === 0 ? 180 + i * 50 : 620 - i * 30;
            const top = 330 - i * 58;
            return (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  left,
                  top,
                  width: 310,
                  height: 110,
                  transform: `scale(${active ? 1.12 : 0.88})`,
                  zIndex: active ? 20 : 10,
                }}
              >
                <TopicVisualCard code={it.code} title={it.title} subtitle={it.subtitle} image={it.image} accentColor={it.color} active={active} />
              </div>
            );
          })}
        </div>
      );
    }

    if (moveType === 'bg-blur-pushback') {
      const bgItem = items[0];
      const fgItem = items[Math.min(items.length - 1, Math.max(1, activeIdx))];
      const pushT = interpolate(progress, [0.15, 0.4], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
      return (
        <div style={{ position: 'absolute', inset: 28, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div
            style={{
              position: 'absolute',
              inset: 20,
              transform: `scale(${interpolate(pushT, [0, 1], [1, 0.94])})`,
              filter: `blur(${interpolate(pushT, [0, 1], [0, 4])}px) brightness(${interpolate(pushT, [0, 1], [1, 0.55])})`,
            }}
          >
            <TopicVisualCard code={bgItem.code} title={bgItem.title} subtitle={bgItem.subtitle} image={bgItem.image} accentColor={bgItem.color} />
          </div>
          {pushT > 0.1 && (
            <div style={{ position: 'relative', zIndex: 20, width: 560, height: 280, transform: `scale(${pushT})` }}>
              <TopicVisualCard code={fgItem.code} title={fgItem.title} subtitle={fgItem.subtitle} image={fgItem.image} accentColor={COLORS.amber} active />
            </div>
          )}
        </div>
      );
    }

    if (moveType === 'in-place-zoom') {
      const zoomT = interpolate(progress, [0.2, 0.45], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
      return (
        <div style={{ position: 'absolute', inset: 28, display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 22 }}>
          {items.slice(0, 4).map((it, i) => {
            const isHero = i === activeIdx;
            return (
              <div
                key={i}
                style={{
                  transform: isHero ? `scale(${interpolate(zoomT, [0, 1], [1, 1.18])})` : 'scale(0.95)',
                  filter: isHero ? 'none' : `brightness(${interpolate(zoomT, [0, 1], [1, 0.32])})`,
                  zIndex: isHero ? 20 : 5,
                }}
              >
                <TopicVisualCard code={it.code} title={it.title} subtitle={it.subtitle} image={it.image} accentColor={it.color} active={isHero} />
              </div>
            );
          })}
        </div>
      );
    }

    // --- EPISODE 2: 9 IMAGE & TRANSITION MOVES ---
    if (moveType === 'skeleton-fill') {
      const filled = Math.min(items.length, Math.floor(progress * (items.length + 1)));
      return (
        <div style={{ position: 'absolute', inset: 34, display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 22 }}>
          {items.slice(0, 4).map((it, i) => {
            const isFilled = i < filled;
            return (
              <div key={i} style={{ position: 'relative' }}>
                {isFilled ? (
                  <TopicVisualCard code={it.code} title={it.title} subtitle={it.subtitle} image={it.image} accentColor={it.color} active={i === filled - 1} />
                ) : (
                  <div
                    style={{
                      width: '100%',
                      height: '100%',
                      borderRadius: 14,
                      backgroundColor: 'rgba(255,255,255,0.06)',
                      border: '1.5px dashed rgba(255,255,255,0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontFamily: FONTS.mono,
                      fontSize: 28,
                      color: COLORS.textMuted,
                    }}
                  >
                    SKELETON #{i + 1}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      );
    }

    if (moveType === 'depth-tunnel') {
      return (
        <div style={{ position: 'absolute', inset: 0, perspective: 900, overflow: 'hidden' }}>
          {items.map((it, i) => {
            const zSpacing = 1200;
            const camZ = progress * (items.length - 0.5) * zSpacing;
            const relZ = i * zSpacing + 650 - camZ;
            if (relZ < -200 || relZ > 3200) return null;
            const scale = Math.max(0.15, 620 / Math.max(140, relZ));
            const x = 580 + (i % 2 === 0 ? -170 : 170) * scale;
            const opacity = relZ < 260 ? interpolate(relZ, [-100, 260], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) : 1;
            return (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  left: x,
                  top: 265,
                  width: 390,
                  height: 240,
                  transform: `translate(-50%, -50%) scale(${scale})`,
                  opacity,
                  zIndex: Math.round(4000 - relZ),
                }}
              >
                <TopicVisualCard code={it.code} title={it.title} subtitle={it.subtitle} image={it.image} accentColor={it.color} active={i === activeIdx} />
              </div>
            );
          })}
        </div>
      );
    }

    if (moveType === 'lift-make-way') {
      return (
        <div style={{ position: 'absolute', inset: 0 }}>
          {items.slice(0, 5).map((it, i) => {
            const isActive = i === activeIdx;
            const count = Math.min(5, items.length);
            const spacing = 840 / Math.max(1, count);
            const baseX = 180 + i * spacing;
            const shiftX = isActive ? 0 : i < activeIdx ? -55 : 55;
            const liftY = isActive ? -60 : 0;
            return (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  left: baseX + shiftX - 95,
                  top: 280 + liftY - 115,
                  width: 210,
                  height: 240,
                  transform: `rotate(${isActive ? 0 : (i - 2) * 6}deg) scale(${isActive ? 1.24 : 0.94})`,
                  zIndex: isActive ? 30 : 10 + i,
                }}
              >
                <TopicVisualCard code={it.code} title={it.title} subtitle={it.subtitle} image={it.image} accentColor={it.color} active={isActive} />
              </div>
            );
          })}
        </div>
      );
    }

    if (moveType === 'color-swap') {
      const palette = ['#EE8458', '#5E8C61', '#74B3F5', '#E88BA8', '#f5a623'];
      const cur = items[activeIdx];
      const bg = cur.color ?? palette[activeIdx % palette.length];
      return (
        <div
          style={{
            position: 'absolute',
            inset: 26,
            borderRadius: 16,
            backgroundColor: bg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div style={{ width: 520, height: 320 }}>
            <TopicVisualCard code={cur.code} title={cur.title} subtitle={cur.subtitle} image={cur.image} accentColor="#ffffff" active />
          </div>
        </div>
      );
    }

    if (moveType === 'slice-swap') {
      const cur = items[activeIdx];
      const prev = items[Math.max(0, activeIdx - 1)];
      const segFrames = Math.max(15, Math.floor(durationFrames / items.length));
      const localF = frame % segFrames;
      return (
        <div style={{ position: 'absolute', inset: 28, borderRadius: 14, overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0 }}>
            <TopicVisualCard code={prev.code} title={prev.title} subtitle={prev.subtitle} image={prev.image} accentColor={prev.color} />
          </div>
          {[0, 1, 2, 3, 4].map((s) => {
            const p = interpolate(localF - s * 3, [0, 12], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
            const topClip = (1 - p) * 100;
            return (
              <div key={s} style={{ position: 'absolute', inset: 0, clipPath: `inset(${topClip}% ${(4 - s) * 20}% 0% ${s * 20}%)` }}>
                <TopicVisualCard code={cur.code} title={cur.title} subtitle={cur.subtitle} image={cur.image} accentColor={cur.color} active />
              </div>
            );
          })}
        </div>
      );
    }

    // Default: Deal-in / Drop-Gather / Helix / Flip-3D animated card grid
    return (
      <div style={{ position: 'absolute', inset: 34, display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 22 }}>
        {items.slice(0, 4).map((it, i) => {
          const p = spring({ frame: Math.max(0, frame - i * 8), fps, config: { damping: 14, stiffness: 110 } });
          const x = interpolate(p, [0, 1], [-220, 0]);
          const y = interpolate(p, [0, 1], [140, 0]);
          return (
            <div key={i} style={{ transform: `translate(${x}px, ${y}px) scale(${p})`, opacity: p }}>
              <TopicVisualCard code={it.code} title={it.title} subtitle={it.subtitle} image={it.image} accentColor={it.color} active={i === activeIdx} />
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <HudFrame
      moveIndex={scene.index ?? 1}
      totalMoves={scene.total ?? 6}
      titleZh={scene.title ?? '核心演示'}
      titleEn={scene.subtitle ?? moveType.toUpperCase()}
      cameraMoving={Boolean(scene.cameraMoving)}
      status={scene.metrics?.status ?? moveType.replace(/-/g, ' ').toUpperCase()}
      metrics={
        scene.metrics?.items ?? [
          { labelEn: 'ACTIVE', labelZh: '当前进度', value: `${activeIdx + 1} / ${items.length}`, accent: true },
          { labelEn: 'MODE', labelZh: '动效引擎', value: moveType.toUpperCase() },
          { labelEn: 'SYNC', labelZh: '音频对齐', value: 'LOCKED' },
        ]
      }
      graphMode={scene.metrics?.graphMode ?? 'step'}
      graphProgress={progress}
      graphSteps={items.length}
      promptTokens={scene.promptTokens}
      promptStartFrame={18}
    >
      {renderStage()}
    </HudFrame>
  );
};

export const UniversalVideo: React.FC<{ timeline: UniversalTimeline }> = ({ timeline }) => {
  const { fps } = useVideoConfig();
  const toF = (sec: number) => Math.round(sec * fps);

  return (
    <WorldCanvas watermark={timeline.meta.watermark ?? 'HUD'}>
      {timeline.meta.audioFile ? <Audio src={staticFile(timeline.meta.audioFile)} /> : null}

      {timeline.scenes.map((scene) => {
        const from = toF(scene.startSec);
        const dur = Math.max(1, toF(scene.endSec) - from);

        return (
          <Sequence key={scene.id} from={from} durationInFrames={dur}>
            {scene.type === 'hook' && <UniversalHookScene scene={scene} />}
            {scene.type === 'overview' && <UniversalOverviewScene scene={scene} />}
            {scene.type === 'chapter' && (
              <ChapterDividerScene
                chapterNum={String(scene.index ?? 1).padStart(2, '0')}
                labelTop={scene.badge ?? `第 ${scene.index ?? 1} 块`}
                titleZh={scene.title ?? '核心章节'}
                titleEn={scene.subtitle ?? 'CHAPTER'}
                cameraMoving={Boolean(scene.cameraMoving)}
                diagramType={scene.cameraMoving ? 'layout' : 'entrance'}
              />
            )}
            {scene.type === 'move-bumper' && (
              <MoveBumperScene
                moveNum={String(scene.index ?? 1).padStart(2, '0')}
                labelTop={scene.badge ?? `第 ${scene.index ?? 1} 招`}
                titleZh={scene.title ?? '要点'}
                titleEn={scene.subtitle ?? 'HIGHLIGHT'}
              />
            )}
            {(scene.type === 'move-demo' || scene.type === 'comparison' || scene.type === 'rule-chart') && (
              <UniversalMoveDemoScene scene={scene} />
            )}
            {(scene.type === 'summary' || scene.type === 'cheatsheet-cta') && (
              <CheatSheetCTAScene
                countNum={String(scene.items?.length ?? scene.total ?? 6)}
                titlePrefix={scene.title ?? '核心要点总结'}
                episodeSubtitle={scene.subtitle ?? 'KEY TAKEAWAYS · 截图保存'}
                ctaText={scene.ctaText ?? '欢迎在评论区交流'}
                ctaDelayFrames={Math.round(dur * 0.55)}
                items={(scene.items ?? []).map((it) => ({
                  num: it.code,
                  title: it.title,
                  cat: it.category ?? '要点',
                  img: it.image,
                  prompt: it.description ?? it.subtitle ?? '',
                }))}
              />
            )}
          </Sequence>
        );
      })}

      <SubtitleOverlay subtitles={timeline.subtitles} />
    </WorldCanvas>
  );
};
