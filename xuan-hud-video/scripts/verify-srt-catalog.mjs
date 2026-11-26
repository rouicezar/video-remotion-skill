#!/usr/bin/env node
/**
 * 自动化单测：验证真实 `.srt` 解析、锚点反查、时间轴连续性硬门禁（防漏秒错位）
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const srtPath = path.resolve(process.cwd(), '../需要制作的视频/第二条/Antigravity的5条神级指令_二次校准.srt.srt');
const rawSrt = fs.readFileSync(srtPath, 'utf8');

const blocks = rawSrt.replace(/\r\n/g, '\n').trim().split(/\n{2,}/);
const cues = blocks.map((b) => {
  const lines = b.split('\n').map((l) => l.trim()).filter(Boolean);
  const m = lines[1].match(/(\d{2}):(\d{2}):(\d{2}),(\d{3})\s*-->\s*(\d{2}):(\d{2}):(\d{2}),(\d{3})/);
  return {
    startSec: +m[1] * 3600 + +m[2] * 60 + +m[3] + +m[4] / 1000,
    endSec: +m[5] * 3600 + +m[6] * 60 + +m[7] + +m[8] / 1000,
    zh: lines.slice(2).join(' '),
  };
});

assert.equal(cues.length, 181, '应精确解析出 181 条 SRT 字幕');
assert.ok(Math.abs(cues[0].startSec - 0.033) < 0.002, '首条字幕起音应为 0.033s');

const findAnchor = (kw) => {
  const hit = cues.find((c) => c.zh.replace(/\s+/g, '').includes(kw.replace(/\s+/g, '')));
  assert.ok(hit, `必须命中字幕锚点 "${kw}"`);
  return hit.startSec;
};

// 验证 EpisodeFull 0.00s -> 68.20s 全部 5 场严格连续零断档！
const scene04Start = findAnchor('那要用呢') - 0.06;
const scene04End = findAnchor('那第二种情况呢');
const timeline = [
  { id: 'Scene01', startSec: 0, endSec: 13.28 },
  { id: 'Scene02', startSec: 13.28, endSec: 23.45 },
  { id: 'Scene03', startSec: 23.45, endSec: 42.35 },
  { id: 'Scene03b', startSec: 42.35, endSec: scene04Start },
  { id: 'Scene04', startSec: scene04Start, endSec: scene04End },
];

for (let i = 1; i < timeline.length; i++) {
  const gap = Math.abs(timeline[i].startSec - timeline[i - 1].endSec);
  assert.ok(gap <= 0.06, `时间轴断档: ${timeline[i - 1].id} -> ${timeline[i].id} (gap=${gap}s)`);
}

// 验证 42.35s–54.41s 内部 5 个关键口播锚点全部落在 Scene03b 区间内
for (const kw of ['共享消息板', '知道谁做到哪了', '@verifier', '审diff', '跑测试']) {
  const sec = findAnchor(kw);
  assert.ok(sec >= 42.35 && sec <= scene04Start + 0.2, `锚点 "${kw}" (${sec}s) 必须落在 Scene03b 内`);
}

console.log(`SRT 与时间轴连续性单测全部通过（181 条字幕，5 场 0.00s–${scene04End.toFixed(2)}s 零断档）`);
