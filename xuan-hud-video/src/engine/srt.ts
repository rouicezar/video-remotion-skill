import { SubtitleCue } from '../types/timeline';

/**
 * 标准 SRT 原始文本解析器：
 * 直接把 `.srt` 内容解析为 `SubtitleCue[]`，彻底淘汰手工抄写 180 条 TS 字幕数组。
 */
export function parseSrt(rawSrt: string): SubtitleCue[] {
  const normalized = rawSrt.replace(/\r\n/g, '\n').trim();
  if (!normalized) return [];

  const blocks = normalized.split(/\n{2,}/);
  const cues: SubtitleCue[] = [];

  for (const block of blocks) {
    const lines = block
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);
    if (lines.length < 2) continue;

    const timeLineIdx = lines.findIndex((l) => l.includes('-->'));
    if (timeLineIdx === -1) continue;

    const match = lines[timeLineIdx].match(
      /(\d{2}):(\d{2}):(\d{2})[,.](\d{3})\s*-->\s*(\d{2}):(\d{2}):(\d{2})[,.](\d{3})/
    );
    if (!match) continue;

    const startSec =
      Number(match[1]) * 3600 +
      Number(match[2]) * 60 +
      Number(match[3]) +
      Number(match[4]) / 1000;
    const endSec =
      Number(match[5]) * 3600 +
      Number(match[6]) * 60 +
      Number(match[7]) +
      Number(match[8]) / 1000;

    const zh = lines.slice(timeLineIdx + 1).join(' ');
    if (zh) cues.push({ startSec, endSec, zh });
  }

  return cues;
}

export interface BeatAnchorQuery {
  /** 在 SRT 字幕文本中检索的短语锚点（支持忽略空格匹配） */
  anchor: string;
  /** 命中同一锚点词的第几次出现（默认 0 即首次命中，也可限定在当前场景时间窗内自动命中） */
  occurrence?: number;
  /** 相对于该条字幕起音点的微调秒数（如句中后半拍词可设 +0.5s） */
  offsetSec?: number;
  /** 是否取该条字幕的结束时间而非起始时间 */
  align?: 'start' | 'end' | 'mid';
}

const stripSpaces = (s: string) => s.replace(/\s+/g, '').toLowerCase();

/**
 * 确定性字幕锚点反查器：
 * 根据口播关键词在 `[minSec, maxSec]` 窗口内定位精确秒数；若未命中直接抛错拦截，杜绝重录/改稿后静默声画错位！
 */
export function resolveAnchorSec(
  cues: SubtitleCue[],
  query: string | BeatAnchorQuery,
  window?: { minSec?: number; maxSec?: number }
): number {
  const q: BeatAnchorQuery = typeof query === 'string' ? { anchor: query } : query;
  const target = stripSpaces(q.anchor);
  const minSec = window?.minSec ?? -Infinity;
  const maxSec = window?.maxSec ?? Infinity;

  const candidates = cues.filter(
    (c) => c.endSec >= minSec && c.startSec <= maxSec && stripSpaces(c.zh).includes(target)
  );

  const hit = candidates[q.occurrence ?? 0];
  if (!hit) {
    throw new Error(
      `[SRT Anchor Miss] 未能在区间 [${minSec}s, ${maxSec}s] 找到字幕锚点 "${q.anchor}"（共扫描 ${cues.length} 条字幕）`
    );
  }

  const base =
    q.align === 'end'
      ? hit.endSec
      : q.align === 'mid'
        ? (hit.startSec + hit.endSec) / 2
        : hit.startSec;

  return base + (q.offsetSec ?? 0);
}

/**
 * 为单个场景创建相对帧求解器：自动把全局 SRT 关键词锚点转换为相对当前场景 `0..durFrames` 的精确帧号。
 */
export function createSceneBeatSolver(
  cues: SubtitleCue[],
  sceneStartSec: number,
  sceneEndSec: number,
  fps = 30
) {
  return {
    at(query: string | BeatAnchorQuery): number {
      const absSec = resolveAnchorSec(cues, query, {
        minSec: sceneStartSec - 0.2,
        maxSec: sceneEndSec + 0.2,
      });
      return Math.max(0, Math.round((absSec - sceneStartSec) * fps));
    },
    localSubtitles(): SubtitleCue[] {
      return cues
        .filter((c) => c.endSec > sceneStartSec && c.startSec < sceneEndSec)
        .map((c) => ({
          ...c,
          startSec: Math.max(0, c.startSec - sceneStartSec),
          endSec: c.endSec - sceneStartSec,
        }));
    },
  };
}

/**
 * Gate 1 节奏密度审计器：检查场景内相邻微拍最大空档是否超过 `maxGapSec`（默认 3.0s）。
 */
export function auditBeatGaps(
  beatFrames: number[],
  totalFrames: number,
  fps = 30,
  maxGapSec = 3.0
): { ok: boolean; maxGapSec: number; violations: Array<{ fromSec: number; toSec: number; gapSec: number }> } {
  const pts = [0, ...beatFrames.filter((f) => f >= 0 && f <= totalFrames), totalFrames].sort((a, b) => a - b);
  const violations: Array<{ fromSec: number; toSec: number; gapSec: number }> = [];
  let maxObserved = 0;

  for (let i = 1; i < pts.length; i++) {
    const gapSec = (pts[i] - pts[i - 1]) / fps;
    if (gapSec > maxObserved) maxObserved = gapSec;
    if (gapSec > maxGapSec + 0.05) {
      violations.push({
        fromSec: Number((pts[i - 1] / fps).toFixed(2)),
        toSec: Number((pts[i] / fps).toFixed(2)),
        gapSec: Number(gapSec.toFixed(2)),
      });
    }
  }

  return { ok: violations.length === 0, maxGapSec: Number(maxObserved.toFixed(2)), violations };
}

export interface TimelineSegmentSpec {
  id: string;
  startSec: number;
  endSec: number;
}

/**
 * 引擎级时间轴连续性硬门禁（封死 Scene 拼接漏秒/错位漏洞）：
 * 检查首场是否从 0s 开始、任意相邻两场是否存在 > maxToleranceSec 的断档或重叠，违者直接抛错阻断渲染！
 */
export function validateTimelineContinuity(
  segments: TimelineSegmentSpec[],
  maxToleranceSec = 0.06
): void {
  if (segments.length === 0) throw new Error('[Timeline Error] 时间轴不能为空');
  if (Math.abs(segments[0].startSec) > maxToleranceSec) {
    throw new Error(`[Timeline Error] 首场 "${segments[0].id}" 起点为 ${segments[0].startSec}s，必须从 0s 开始`);
  }
  for (let i = 0; i < segments.length; i++) {
    const cur = segments[i];
    if (cur.endSec <= cur.startSec) {
      throw new Error(`[Timeline Error] 场景 "${cur.id}" 时长非法 (${cur.startSec}s -> ${cur.endSec}s)`);
    }
    if (i > 0) {
      const prev = segments[i - 1];
      const gap = cur.startSec - prev.endSec;
      if (Math.abs(gap) > maxToleranceSec) {
        const kind = gap > 0 ? `缺失断档 +${gap.toFixed(2)}s` : `交叉重叠 ${gap.toFixed(2)}s`;
        throw new Error(
          `[Timeline Continuity Fail] "${prev.id}" (${prev.endSec}s) 与 "${cur.id}" (${cur.startSec}s) 之间存在 ${kind}，严禁带错位渲染！`
        );
      }
    }
  }
}
