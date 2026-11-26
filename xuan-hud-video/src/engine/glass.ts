import React from 'react';
import { glassSurface } from '../design/motion';

/**
 * 2.5D/3D 厚玻璃板表面样式：顶部高光棱线 + 6px 厚底切边 + 深悬浮投影，边框恒定 2px。
 * 新组件请优先用 <PhysicalGlass3D>，它在此基础上补齐噪点层与文字上方扫光层。
 */
export const crystal = (active = 0, radius = 22): React.CSSProperties => ({
  ...glassSurface({ active, blurPx: 16, radius, opacity: 0.44 + active * 0.16 }),
  boxSizing: 'border-box',
  borderWidth: 2,
  borderStyle: 'solid',
  borderColor: `rgba(${Math.round(255 - active * 10)}, ${Math.round(255 - active * 89)}, ${Math.round(255 - active * 220)}, ${(0.24 + active * 0.72).toFixed(3)})`,
  backgroundColor: `rgba(18, 23, 35, ${(0.82 + active * 0.1).toFixed(2)})`,
  backgroundImage: `linear-gradient(155deg, rgba(255,255,255,${(0.16 + active * 0.1).toFixed(3)}) 0%, rgba(160,185,225,0.04) 44%, rgba(245,166,35,${(0.03 + active * 0.16).toFixed(3)}) 100%)`,
  boxShadow: [
    'inset 0 1.5px 0 rgba(255,255,255,0.34)',
    'inset 0 -1px 0 rgba(255,255,255,0.08)',
    `0 6px 0 rgba(8, 11, 18, 0.94)`,
    `0 7px 0 rgba(${Math.round(180 + active * 65)}, ${Math.round(195 - active * 29)}, ${Math.round(220 - active * 185)}, ${(0.14 + active * 0.28).toFixed(2)})`,
    '0 26px 54px -10px rgba(0, 0, 0, 0.78)',
    `0 0 ${(36 * active).toFixed(0)}px rgba(245, 166, 35, ${(0.34 * active).toFixed(2)})`,
  ].join(', '),
});
