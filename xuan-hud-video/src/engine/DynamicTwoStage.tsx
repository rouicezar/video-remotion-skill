import React from 'react';
import { spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { clamp01, CRISP_SPRING, easeInOutCubic } from './motion';

/**
 * 动态重心双栏容器（DynamicTwoStage）：
 * 彻底从结构上消灭“右半屏前 7 秒大面积死黑空洞”问题：
 * - 在 `secondEnterAt` 之前：`primary` 自动居中偏大展示（scale 1.06），占据舞台视觉重心；
 * - 当 `secondEnterAt` 到达时：`primary` 丝滑左移让位（16 帧 S 曲线），`secondary` 同步从右侧干脆滑入落位！
 */
export const DynamicTwoStage: React.FC<{
  secondEnterAt: number;
  primaryWidth?: number;
  secondaryWidth?: number;
  gap?: number;
  primary: React.ReactNode;
  secondary: React.ReactNode;
}> = ({
  secondEnterAt,
  primaryWidth = 780,
  secondaryWidth = 720,
  gap = 52,
  primary,
  secondary,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // 左卡提前 10 帧开始利落左移让位（14f 到位），右卡从右侧 +140px 滑入，确保全程零帧重叠碰撞！
  const splitT = clamp01(easeInOutCubic((frame - (secondEnterAt - 10)) / 14));
  const secondIn = spring({ frame: Math.max(0, frame - (secondEnterAt + 2)), fps, config: CRISP_SPRING });

  const totalW = primaryWidth + gap + secondaryWidth;
  // splitT=0 时 primary 严格居中；splitT=1 时 primary 精确落到左侧目标位
  const centerLeft = (1560 - primaryWidth) / 2;
  const finalLeft = (1560 - totalW) / 2;
  const curPrimaryX = centerLeft + (finalLeft - centerLeft) * splitT;
  const primaryScale = 1.06 - splitT * 0.06;

  const finalRightX = finalLeft + primaryWidth + gap;

  return (
    <div style={{ position: 'relative', width: 1560, height: 740, display: 'flex', alignItems: 'center' }}>
      <div
        style={{
          position: 'absolute',
          left: curPrimaryX,
          width: primaryWidth,
          transform: `scale(${primaryScale.toFixed(4)})`,
          transformOrigin: 'center center',
          zIndex: 4,
        }}
      >
        {primary}
      </div>

      {frame >= secondEnterAt - 2 && (
        <div
          style={{
            position: 'absolute',
            left: finalRightX,
            width: secondaryWidth,
            opacity: secondIn,
            transform: `translate3d(${((1 - secondIn) * 140).toFixed(1)}px, 0, 0) scale(${(0.95 + secondIn * 0.05).toFixed(4)})`,
            zIndex: 5,
          }}
        >
          {secondary}
        </div>
      )}
    </div>
  );
};
