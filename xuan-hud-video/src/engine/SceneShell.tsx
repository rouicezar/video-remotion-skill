import React from 'react';
import { useCurrentFrame } from 'remotion';
import { CameraKeyframe, CameraRig } from './CameraRig';
import { clamp01, easeInOutCubic, easeOutExpo } from './motion';

export type SceneTransitionStyle = 'dive-zoom' | 'whip-left' | 'lift-settle' | 'none';

/**
 * 统一场景运镜与无缝衔接外壳（SceneShell）：
 * 强制每个章节同时具备：
 * 1. 非零首帧入场动势（第 0 帧即带缩放/位移承接上一镜，彻底消除切场瞬间闪出一整帧纯空黑屏！）；
 * 2. 末尾平滑退场收束（默认末 12 帧带推进/横移收拢，彻底消除帧间硬切！）；
 * 3. 内置 `<CameraRig>` 仅作用于前景主体，中景标题层稳驻顶栏下方绝不撞顶栏。
 */
export const SceneShell: React.FC<{
  durationInFrames: number;
  header?: React.ReactNode;
  enter?: SceneTransitionStyle;
  exit?: SceneTransitionStyle;
  cameraKeyframes?: CameraKeyframe[];
  maxWidth?: number;
  children: React.ReactNode;
}> = ({
  durationInFrames,
  header,
  enter = 'dive-zoom',
  exit = 'whip-left',
  cameraKeyframes = [{ at: 0, dur: 1, scale: 1, x: 0, y: 0, rotateX: 2 }],
  maxWidth = 1560,
  children,
}) => {
  const frame = useCurrentFrame();

  // 入场从 0.35 起步（第 0 帧即有主体可见，零全黑空屏闪烁！）
  const inP = enter === 'none' ? 1 : easeOutExpo(frame / 11);
  const outP =
    exit === 'none'
      ? 0
      : clamp01(easeInOutCubic((frame - (durationInFrames - 12)) / 12));

  const enterOpacity = enter === 'none' ? 1 : 0.35 + inP * 0.65;
  const exitOpacity = 1 - outP * 0.72;

  const enterX = enter === 'whip-left' ? (1 - inP) * 140 : 0;
  const enterY = enter === 'lift-settle' ? (1 - inP) * 32 : 0;
  const enterScale = enter === 'dive-zoom' ? 0.9 + inP * 0.1 : 1;

  const exitX = exit === 'whip-left' ? -outP * 160 : 0;
  const exitScale = exit === 'dive-zoom' ? 1 + outP * 0.14 : 1 - outP * 0.05;

  return (
    <div
      style={{
        width: '100%',
        maxWidth,
        height: '100%',
        margin: '0 auto',
        padding: '28px 0 24px',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        opacity: enterOpacity * exitOpacity,
        transform: `translate3d(${(enterX + exitX).toFixed(1)}px, ${enterY.toFixed(1)}px, 0) scale(${(enterScale * exitScale).toFixed(4)})`,
        outline: '1px solid transparent',
      }}
    >
      {header && <div style={{ zIndex: 6 }}>{header}</div>}
      <div style={{ width: '100%', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CameraRig keyframes={cameraKeyframes}>{children}</CameraRig>
      </div>
    </div>
  );
};
