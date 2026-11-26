import React from 'react';
import { useCurrentFrame } from 'remotion';
import { easeInOutCubic } from './motion';

export interface CameraKeyframe {
  /** 相对当前场景起点的触发帧 */
  at: number;
  /** 过渡耗时帧数 */
  dur: number;
  scale: number;
  /** 画面水平位移 px（正值画面右移=聚焦左侧，负值聚焦右侧） */
  x: number;
  /** 画面垂直位移 px */
  y: number;
  rotateX?: number;
  rotateY?: number;
}

/**
 * 3D 虚拟摄像机推拉摇移容器（CameraRig）：
 * - 当同屏超过 3 个流程节点时，先全景交代关系，再平滑推近（scale 1.15–1.55）跟随当前口播焦点
 * - 支持场景首尾动势接力（Camera Zoom/Whip Match-Cut），消除生硬透明度叠影
 */
export const CameraRig: React.FC<{
  keyframes: CameraKeyframe[];
  children: React.ReactNode;
}> = ({ keyframes, children }) => {
  const frame = useCurrentFrame();

  let scale = keyframes[0]?.scale ?? 1;
  let x = keyframes[0]?.x ?? 0;
  let y = keyframes[0]?.y ?? 0;
  let rx = keyframes[0]?.rotateX ?? 0;
  let ry = keyframes[0]?.rotateY ?? 0;

  for (let i = 1; i < keyframes.length; i++) {
    const prev = keyframes[i - 1];
    const cur = keyframes[i];
    if (frame < cur.at) break;
    const t = cur.dur <= 0 ? 1 : easeInOutCubic((frame - cur.at) / cur.dur);
    scale = prev.scale + (cur.scale - prev.scale) * t;
    x = prev.x + (cur.x - prev.x) * t;
    y = prev.y + (cur.y - prev.y) * t;
    rx = (prev.rotateX ?? 0) + ((cur.rotateX ?? 0) - (prev.rotateX ?? 0)) * t;
    ry = (prev.rotateY ?? 0) + ((cur.rotateY ?? 0) - (prev.rotateY ?? 0)) * t;
    if (frame >= cur.at + cur.dur) {
      scale = cur.scale;
      x = cur.x;
      y = cur.y;
      rx = cur.rotateX ?? 0;
      ry = cur.rotateY ?? 0;
    }
  }

  return (
    <div style={{ width: '100%', height: '100%', perspective: 1600, overflow: 'visible' }}>
      <div
        style={{
          width: '100%',
          height: '100%',
          transformOrigin: 'center center',
          transform: `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0) scale(${scale.toFixed(4)}) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg)`,
          outline: '1px solid transparent',
          willChange: 'transform',
        }}
      >
        {children}
      </div>
    </div>
  );
};
