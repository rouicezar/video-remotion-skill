import React from 'react';
import { Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { StatePill } from '../../design/Chrome';
import { COLORS, FONTS } from '../../design/tokens';

export const ChapterDividerScene: React.FC<{
  chapterNum: string; // '01', '02', '03'
  labelTop: string; // '第一块', '第二块', '第三块'
  titleZh: string; // '出场', '排布', '切换'
  titleEn: string; // 'ENTRANCE', 'LAYOUT', 'SWITCH'
  cameraMoving: boolean;
  diagramType?: 'entrance' | 'layout' | 'switch';
  bgImages?: string[];
}> = ({
  chapterNum,
  labelTop,
  titleZh,
  titleEn,
  cameraMoving,
  diagramType = 'entrance',
  bgImages = ['assets/card_01.jpg', 'assets/card_03.jpg', 'assets/card_04.jpg'],
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Brief white flash on entry for Chapter 01 matching original
  const flashOpacity = chapterNum === '01' ? interpolate(frame, [0, 12], [0.75, 0], { extrapolateRight: 'clamp' }) : 0;
  const enter = spring({ frame, fps, config: { damping: 16, stiffness: 120 } });
  const diagEnter = spring({ frame: Math.max(0, frame - 35), fps, config: { damping: 15, stiffness: 110 } });

  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      {/* Blurred atmospheric background cards */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.25,
          filter: 'blur(4px)',
          pointerEvents: 'none',
        }}
      >
        {bgImages.map((src, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: 680 + i * 360,
              top: 160 + (i % 2) * 260,
              width: 340,
              height: 220,
              borderRadius: 14,
              overflow: 'hidden',
              border: '1px solid rgba(255,255,255,0.12)',
            }}
          >
            <Img src={staticFile(src)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        ))}
      </div>

      {/* Giant Amber Chapter Header (Top-Left) */}
      <div
        style={{
          position: 'absolute',
          top: 96,
          left: 120,
          display: 'flex',
          alignItems: 'center',
          gap: 28,
          transform: `translateY(${interpolate(enter, [0, 1], [28, 0])}px)`,
          opacity: enter,
        }}
      >
        <div
          style={{
            fontFamily: FONTS.display,
            fontSize: 230,
            fontWeight: 900,
            color: COLORS.amber,
            lineHeight: 0.82,
            textShadow: `0 0 60px ${COLORS.amberGlow}`,
          }}
        >
          {chapterNum}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ fontSize: 32, fontWeight: 700, color: COLORS.amber }}>{labelTop}</div>
          <div style={{ fontSize: 108, fontWeight: 900, color: COLORS.white, lineHeight: 1.0 }}>{titleZh}</div>
          <div style={{ fontFamily: FONTS.mono, fontSize: 22, letterSpacing: 7, color: COLORS.textSecondary, marginTop: 4 }}>
            {titleEn}
          </div>
        </div>
      </div>

      {/* Top-Right State Pill */}
      <div
        style={{
          position: 'absolute',
          top: 150,
          right: 130,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: 10,
          opacity: enter,
        }}
      >
        <StatePill cameraMoving={cameraMoving} size="lg" />
        {cameraMoving && (
          <div style={{ fontSize: 20, color: COLORS.amber, fontWeight: 700 }}>正好反过来</div>
        )}
      </div>

      {/* Bottom Concept Diagram */}
      <div
        style={{
          position: 'absolute',
          left: 120,
          right: 120,
          bottom: 220,
          opacity: diagEnter,
          transform: `translateY(${interpolate(diagEnter, [0, 1], [30, 0])}px)`,
        }}
      >
        {diagramType === 'layout' ? (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 36 }}>
            {[
              { name: '一条通道', desc: 'Depth Tunnel' },
              { name: '一个圆筒', desc: 'Cylinder Helix' },
              { name: '一个圆环', desc: '3D Flip Ring' },
            ].map((geo, i) => (
              <div
                key={i}
                style={{
                  width: 310,
                  height: 210,
                  borderRadius: 16,
                  backgroundColor: 'rgba(21, 24, 32, 0.9)',
                  border: `1.5px solid ${COLORS.border}`,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 18,
                }}
              >
                <svg width="160" height="90" viewBox="0 0 160 90">
                  {i === 0 && (
                    <>
                      <rect x="20" y="30" width="22" height="30" rx="3" fill={COLORS.amber} />
                      <line x1="48" y1="45" x2="140" y2="45" stroke={COLORS.amber} strokeWidth="2" strokeDasharray="5 4" />
                      <rect x="65" y="14" width="20" height="16" rx="2" fill="#4b5563" />
                      <rect x="95" y="60" width="20" height="16" rx="2" fill="#4b5563" />
                      <rect x="125" y="14" width="20" height="16" rx="2" fill={COLORS.amber} />
                    </>
                  )}
                  {i === 1 && (
                    <>
                      <ellipse cx="80" cy="24" rx="46" ry="14" fill="none" stroke={COLORS.amber} strokeWidth="2" />
                      <ellipse cx="80" cy="48" rx="46" ry="14" fill="none" stroke="rgba(245,166,35,0.6)" strokeWidth="2" />
                      <ellipse cx="80" cy="72" rx="46" ry="14" fill="none" stroke="rgba(245,166,35,0.35)" strokeWidth="2" />
                    </>
                  )}
                  {i === 2 && (
                    <>
                      <ellipse cx="80" cy="46" rx="54" ry="26" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" strokeDasharray="4 4" />
                      {Array.from({ length: 8 }).map((_, k) => {
                        const a = (k / 8) * Math.PI * 2;
                        return (
                          <rect
                            key={k}
                            x={80 + Math.cos(a) * 52 - 6}
                            y={46 + Math.sin(a) * 24 - 6}
                            width="12"
                            height="12"
                            rx="2"
                            fill={k === 2 ? COLORS.amber : '#6b7280'}
                          />
                        );
                      })}
                    </>
                  )}
                </svg>
                <div style={{ fontSize: 22, fontWeight: 700, color: COLORS.textPrimary }}>{geo.name}</div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 46 }}>
            {/* Locked Camera Icon */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
              <div
                style={{
                  width: 112,
                  height: 76,
                  borderRadius: 14,
                  backgroundColor: '#252a36',
                  border: `2px solid ${COLORS.textSecondary}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                }}
              >
                <div style={{ width: 28, height: 28, borderRadius: '50%', border: '3px solid #9aa3b2' }} />
                <div
                  style={{
                    position: 'absolute',
                    top: -14,
                    right: -14,
                    width: 34,
                    height: 34,
                    borderRadius: 8,
                    backgroundColor: COLORS.red,
                    color: COLORS.white,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 18,
                    fontWeight: 900,
                  }}
                >
                  🔒
                </div>
              </div>
              <div style={{ fontSize: 24, fontWeight: 700, color: COLORS.textPrimary }}>相机不动</div>
            </div>

            {/* Active Image Demo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
              <div
                style={{
                  width: 340,
                  height: 210,
                  borderRadius: 14,
                  overflow: 'hidden',
                  border: `2.5px solid ${COLORS.amber}`,
                  boxShadow: `0 0 36px ${COLORS.amberGlow}`,
                  transform: `rotate(${diagramType === 'entrance' ? Math.sin(frame * 0.1) * 4 : 0}deg)`,
                }}
              >
                <Img
                  src={staticFile(diagramType === 'switch' && frame > 80 ? 'assets/card_04.jpg' : 'assets/card_03.jpg')}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              <div style={{ fontSize: 28, fontWeight: 800, color: COLORS.amber }}>
                {diagramType === 'switch' ? '图自己换' : '图自己出场'}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* White flash overlay */}
      {flashOpacity > 0.01 && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: '#d1d5db',
            opacity: flashOpacity,
            pointerEvents: 'none',
            zIndex: 60,
          }}
        />
      )}
    </div>
  );
};

export const MoveBumperScene: React.FC<{
  moveNum: string; // '01'..'09'
  labelTop: string; // '第 1 招'
  titleZh: string;
  titleEn: string;
  subtitleTags?: string[];
}> = ({ moveNum, labelTop, titleZh, titleEn, subtitleTags = [] }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 14, stiffness: 130 } });

  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <div
        style={{
          position: 'absolute',
          top: 130,
          left: 140,
          display: 'flex',
          alignItems: 'center',
          gap: 32,
          transform: `translateY(${interpolate(enter, [0, 1], [32, 0])}px)`,
          opacity: enter,
        }}
      >
        <div
          style={{
            fontFamily: FONTS.display,
            fontSize: 220,
            fontWeight: 900,
            color: COLORS.amber,
            lineHeight: 0.85,
            textShadow: `0 0 55px ${COLORS.amberGlow}`,
          }}
        >
          {moveNum}
        </div>
        <div>
          <div style={{ fontSize: 30, fontWeight: 700, color: COLORS.amber, marginBottom: 6 }}>{labelTop}</div>
          <div style={{ fontSize: 96, fontWeight: 900, color: COLORS.white, lineHeight: 1.0 }}>{titleZh}</div>
          <div style={{ fontFamily: FONTS.mono, fontSize: 20, letterSpacing: 6, color: COLORS.textMuted, marginTop: 10 }}>
            {titleEn}
          </div>
        </div>
      </div>

      {subtitleTags.length > 0 && (
        <div
          style={{
            position: 'absolute',
            left: 140,
            top: 470,
            display: 'flex',
            gap: 28,
            opacity: enter,
          }}
        >
          {subtitleTags.map((tag, i) => (
            <div
              key={i}
              style={{
                padding: '16px 32px',
                borderRadius: 14,
                backgroundColor: COLORS.surface,
                border: `1.5px solid ${COLORS.amberBorder}`,
                fontSize: 26,
                fontWeight: 700,
                color: COLORS.textPrimary,
              }}
            >
              {tag}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
