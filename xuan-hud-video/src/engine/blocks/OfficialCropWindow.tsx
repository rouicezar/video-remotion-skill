import React from 'react';
import { Img, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { FONTS, WEIGHTS } from '../../design/tokens';
import { beatHighlight, clamp01, CRISP_SPRING, mixRgb, Rgb } from '../motion';
import { PhysicalGlass3D } from '../PhysicalGlass3D';

/**
 * 引擎积木库（第 8 类几何骨架）：2.5D 立体官方局部证据视窗（OfficialCropWindow）
 * 修复旧版 `DarkOfficialWindow` 的两项违规：
 * 1. 窗口眉栏字号从 14px/16px 全面升级至 24px（零 <24px 小字）；
 * 2. 底层接入 `<PhysicalGlass3D>` 15px 实体挤出厚底座 + 焦点推近扶正姿态。
 */
export const OfficialCropWindow: React.FC<{
  src: string;
  domainLabel: string;
  badgeText?: string;
  height?: number;
  tiltY?: number;
  enterAt?: number;
  focusAt?: number;
  focusEndAt?: number;
  brandIcon?: React.ReactNode;
  accentRgb?: Rgb;
}> = ({
  src,
  domainLabel,
  badgeText = 'OFFICIAL DOC',
  height = 460,
  tiltY = -6,
  enterAt = 3,
  focusAt,
  focusEndAt,
  brandIcon,
  accentRgb = [245, 166, 35],
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const p = spring({ frame: Math.max(0, frame - enterAt), fps, config: CRISP_SPRING });
  const focus = focusAt !== undefined ? clamp01(beatHighlight(frame, focusAt, focusEndAt)) : 0;
  const curTiltY = tiltY * (1 - focus * 0.75);
  const curScale = 1 + focus * 0.045;

  return (
    <div
      style={{
        perspective: 1500,
        opacity: p,
        transform: `translate3d(${((1 - p) * 44).toFixed(1)}px, 0, 0)`,
      }}
    >
      <div
        style={{
          transform: `rotateY(${curTiltY.toFixed(2)}deg) rotateX(${(4 - focus * 2).toFixed(2)}deg) scale(${curScale.toFixed(4)})`,
        }}
      >
        <PhysicalGlass3D
          active={0.3 + focus * 0.7}
          accentRgb={accentRgb}
          radius={26}
          slabPx={15}
          extrudeX={tiltY < 0 ? 6 : -6}
          padding={0}
          sheenSpeed={0.45}
        >
          {/* 顶部浏览器深色眉栏（全量 ≥ 24px） */}
          <div
            style={{
              height: 56,
              padding: '0 26px',
              backgroundColor: 'rgba(255, 255, 255, 0.04)',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', gap: 10 }}>
              <span style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#FF5F56' }} />
              <span style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#FFBD2E' }} />
              <span style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#27C93F' }} />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontFamily: FONTS.mono, fontSize: 24, fontWeight: WEIGHTS.light, color: '#D4DEEE' }}>
              {brandIcon}
              <span>{domainLabel}</span>
            </div>

            <span style={{ fontFamily: FONTS.mono, fontSize: 24, fontWeight: WEIGHTS.regular, color: mixRgb([132, 224, 178], [52, 168, 83], focus) }}>
              ● {badgeText}
            </span>
          </div>

          <div style={{ height, backgroundColor: '#111520', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 18, boxSizing: 'border-box' }}>
            <Img src={staticFile(src)} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
        </PhysicalGlass3D>
      </div>
    </div>
  );
};
