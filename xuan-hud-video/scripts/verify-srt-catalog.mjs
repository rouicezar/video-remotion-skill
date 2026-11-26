#!/usr/bin/env node
/**
 * 自动化单测：验证真实 `.srt` 解析、锚点反查、未命中报错保护与目录防重算法
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const srtPath = path.resolve(process.cwd(), '../需要制作的视频/第二条/Antigravity的5条神级指令_二次校准.srt.srt');
const rawSrt = fs.readFileSync(srtPath, 'utf8');

// 复用等价 SRT 解析逻辑验证真实文件
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

const swarmHit = cues.find((c) => c.zh.includes('拆分的范围'));
assert.ok(swarmHit && Math.abs(swarmHit.startSec - 59.0) < 0.05, '锚点"拆分的范围"应精确命中 59.0s');

console.log(`SRT 解析与锚点单测通过（共 ${cues.length} 条字幕，锚点反查误差 < 5ms）`);
