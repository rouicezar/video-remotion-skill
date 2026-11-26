import React from 'react';
import { Audio, Sequence, staticFile } from 'remotion';

/**
 * 4 种标准微音效类型（严格克制，不再发散）：
 * - enter      : 入场 / 落卡 / 发卡
 * - focus      : 焦点点亮 / 关键元素弹出
 * - flip       : 3D 翻转 / 痛点反转
 * - transition : 镜头推拉 / 几何形变 / 流光切场
 */
export type CoreSfxKind = 'enter' | 'focus' | 'flip' | 'transition';

/** 兼容旧调用名称的薄别名，内部全部收敛到上述 4 种核心音效 */
export type SfxKind = CoreSfxKind | 'drop' | 'deal' | 'pop' | 'flow' | 'whoosh';

/** 固定 -16 dB 线性增益（10^(-16/20) ≈ 0.1585），不做自适应音量 */
export const SFX_FIXED_DB = -16;
export const SFX_FIXED_VOLUME = Number(Math.pow(10, SFX_FIXED_DB / 20).toFixed(4)); // 0.1585

const CORE_SFX_SPEC: Record<CoreSfxKind, { file: string; durFrames: number }> = {
  enter: { file: 'engine/sfx/enter.wav', durFrames: 18 },
  focus: { file: 'engine/sfx/focus.wav', durFrames: 16 },
  flip: { file: 'engine/sfx/flip.wav', durFrames: 20 },
  transition: { file: 'engine/sfx/transition.wav', durFrames: 22 },
};

export function resolveCoreSfxKind(kind: SfxKind): CoreSfxKind {
  if (kind === 'enter' || kind === 'drop' || kind === 'deal') return 'enter';
  if (kind === 'focus' || kind === 'pop') return 'focus';
  if (kind === 'flip') return 'flip';
  return 'transition'; // transition | whoosh | flow
}

/**
 * 组件内聚微音效（Co-located Foley SFX）：
 * - 严格收敛为 4 种核心音效（enter / focus / flip / transition）
 * - 全量统一固定 -16 dB（0.1585），不随人声做自适应音量变动
 */
export const Sfx: React.FC<{
  kind: SfxKind;
  at: number;
  muted?: boolean;
}> = ({ kind, at, muted = false }) => {
  if (muted || at < 0) return null;
  const core = resolveCoreSfxKind(kind);
  const spec = CORE_SFX_SPEC[core];
  return (
    <Sequence from={Math.round(at)} durationInFrames={spec.durFrames} layout="none">
      <Audio src={staticFile(spec.file)} volume={SFX_FIXED_VOLUME} />
    </Sequence>
  );
};

export interface SfxEvent {
  kind: SfxKind;
  at: number;
}

/**
 * 批量挂载同一组件内的多个音效：统一使用固定 -16 dB，仅对间隔 < 2 帧的同帧重叠做最小错峰（+2f）防爆音。
 */
export const SfxGroup: React.FC<{ events: SfxEvent[]; muted?: boolean }> = ({ events, muted = false }) => {
  if (muted || events.length === 0) return null;
  const sorted = [...events].sort((a, b) => a.at - b.at);
  const adjusted: Array<{ kind: CoreSfxKind; at: number }> = [];
  for (const ev of sorted) {
    let at = Math.round(ev.at);
    const prev = adjusted[adjusted.length - 1];
    if (prev && at - prev.at < 2) at = prev.at + 2;
    adjusted.push({ kind: resolveCoreSfxKind(ev.kind), at });
  }
  return (
    <>
      {adjusted.map((ev, i) => (
        <Sfx key={`${ev.kind}-${ev.at}-${i}`} kind={ev.kind} at={ev.at} />
      ))}
    </>
  );
};
