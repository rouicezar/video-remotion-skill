import React from 'react';
import { Audio, Sequence, staticFile } from 'remotion';

export type SfxKind = 'drop' | 'deal' | 'flow' | 'pop' | 'flip' | 'whoosh';

const SFX_SPEC: Record<SfxKind, { file: string; vol: number; durFrames: number }> = {
  drop: { file: 'engine/sfx/drop.wav', vol: 0.14, durFrames: 18 },
  deal: { file: 'engine/sfx/deal.wav', vol: 0.13, durFrames: 18 },
  flow: { file: 'engine/sfx/flow.wav', vol: 0.12, durFrames: 24 },
  pop: { file: 'engine/sfx/pop.wav', vol: 0.11, durFrames: 16 },
  flip: { file: 'engine/sfx/flip.wav', vol: 0.16, durFrames: 20 },
  whoosh: { file: 'engine/sfx/whoosh.wav', vol: 0.15, durFrames: 22 },
};

/**
 * 组件内聚微音效（Co-located Foley SFX）。
 * 直接在各场景/组件内随动画触发帧 `at` 挂载，杜绝根组件末尾手工维护全局帧偏移表。
 */
export const Sfx: React.FC<{
  kind: SfxKind;
  at: number;
  gain?: number;
  muted?: boolean;
}> = ({ kind, at, gain = 1, muted = false }) => {
  if (muted || at < 0) return null;
  const spec = SFX_SPEC[kind];
  const from = Math.round(at);
  const volume = Math.max(0, Math.min(0.22, spec.vol * gain));
  return (
    <Sequence from={from} durationInFrames={spec.durFrames} layout="none">
      <Audio src={staticFile(spec.file)} volume={volume} />
    </Sequence>
  );
};

export interface SfxEvent {
  kind: SfxKind;
  at: number;
  gain?: number;
}

/**
 * 批量挂载同一组件内的多个音效，自动对间隔 < 8 帧的密集音效做错峰（≥2f）与 ×0.75 音量递减，防同相叠加爆音。
 */
export const SfxGroup: React.FC<{ events: SfxEvent[]; muted?: boolean }> = ({ events, muted = false }) => {
  if (muted || events.length === 0) return null;
  const sorted = [...events].sort((a, b) => a.at - b.at);
  const adjusted: Array<{ kind: SfxKind; at: number; gain: number }> = [];
  for (const ev of sorted) {
    let at = Math.round(ev.at);
    let gain = ev.gain ?? 1;
    const prev = adjusted[adjusted.length - 1];
    if (prev && at - prev.at < 8) {
      if (at - prev.at < 2) at = prev.at + 2;
      gain *= 0.75;
    }
    adjusted.push({ kind: ev.kind, at, gain });
  }
  return (
    <>
      {adjusted.map((ev, i) => (
        <Sfx key={`${ev.kind}-${ev.at}-${i}`} kind={ev.kind} at={ev.at} gain={ev.gain} />
      ))}
    </>
  );
};
