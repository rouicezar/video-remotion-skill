import React from 'react';
import { useCurrentFrame } from 'remotion';
import { clamp01, easeInOutCubic, FLIP_FRAMES } from './motion';
import { Sfx } from './Sfx';

export interface FlipSlab3DProps {
  /** 翻转触发帧（默认 15 帧干脆完成 180° 翻转） */
  flipAt: number;
  flipFrames?: number;
  front: React.ReactNode;
  back: React.ReactNode;
  width?: number | string;
  height?: number | string;
  sfxMuted?: boolean;
}

/**
 * 干脆 15 帧 3D 双面翻转器（FlipSlab3D）：
 * 遵循规范 Gate 3：正反面各自独立封装背向隐藏层，翻转中段微微向镜头抬升（translateZ 脉冲）增强实体翻转空气感，
 * 内聚 `flip` 音效与 `flipAt` 同源触发。
 */
export const FlipSlab3D: React.FC<FlipSlab3DProps> = ({
  flipAt,
  flipFrames = FLIP_FRAMES - 1,
  front,
  back,
  width = '100%',
  height = '100%',
  sfxMuted = false,
}) => {
  const frame = useCurrentFrame();
  const raw = clamp01((frame - flipAt) / Math.max(1, flipFrames));
  const p = easeInOutCubic(raw);
  const deg = p * 180;
  // 翻转至 90° 中点时向镜头微抬升 4% scale，模拟真实厚板翻面立体弧线
  const lift = 4 * p * (1 - p);

  return (
    <div
      style={{
        width,
        height,
        position: 'relative',
        perspective: 1800,
      }}
    >
      <Sfx kind="flip" at={flipAt} muted={sfxMuted} />
      <div
        style={{
          width: '100%',
          height: '100%',
          position: 'relative',
          transformStyle: 'preserve-3d',
          transform: `scale(${(1 + lift * 0.045).toFixed(4)}) rotateY(${deg.toFixed(2)}deg)`,
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            pointerEvents: p < 0.5 ? 'auto' : 'none',
          }}
        >
          {front}
        </div>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            pointerEvents: p >= 0.5 ? 'auto' : 'none',
          }}
        >
          {back}
        </div>
      </div>
    </div>
  );
};
