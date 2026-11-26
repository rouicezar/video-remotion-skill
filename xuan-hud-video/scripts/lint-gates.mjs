#!/usr/bin/env node
/**
 * 源码静态门禁检查（Gate 2 / Gate 3 / 架构隔离）：
 * 默认扫描 `src/engine` 与 `src/episodes`（新架构目录，零历史豁免）：
 * 1. 禁止 fontSize < 24（手机端可读硬底线）
 * 2. 禁止 Math.sin（落位静止铁律）
 * 3. 禁止内联 SVG 硬编码 `id="..."`（必须走 useId 模板字符串）
 * 4. 禁止颜色三元硬切 `? '#...' : '#...'`（必须走 mixRgb）
 * 5. 禁止 import legacy 或跨剧集 import
 * 6. `src/episodes/**` 单场景文件 ≤ 250 行
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const TARGET_DIRS = ['src/engine', 'src/episodes'];
const issues = [];

function walk(dir) {
  const abs = path.join(ROOT, dir);
  if (!fs.existsSync(abs)) return [];
  const out = [];
  for (const ent of fs.readdirSync(abs, { withFileTypes: true })) {
    const rel = path.join(dir, ent.name);
    if (ent.isDirectory()) out.push(...walk(rel));
    else if (/\.(ts|tsx)$/.test(ent.name)) out.push(rel);
  }
  return out;
}

for (const file of TARGET_DIRS.flatMap(walk)) {
  const text = fs.readFileSync(path.join(ROOT, file), 'utf8');
  const lines = text.split('\n');

  if (file.startsWith('src/episodes/') && lines.length > 250) {
    issues.push(`${file}: 文件行数 ${lines.length} > 250（违反单章节防衰减上限）`);
  }

  lines.forEach((line, idx) => {
    const ln = idx + 1;
    for (const m of line.matchAll(/fontSize:\s*(\d+)/g)) {
      if (Number(m[1]) < 24) issues.push(`${file}:${ln} fontSize=${m[1]} < 24px`);
    }
    for (const m of line.matchAll(/fontWeight:\s*(\d+|['"]bold['"]|['"]bolder['"])/g)) {
      const v = m[1];
      if (v.includes('bold') || Number(v) >= 600) {
        issues.push(`${file}:${ln} fontWeight=${v} 过粗（请用 WEIGHTS.light=300 / regular=400 / medium=500，严禁 >=600 粗体导致画面厚重发脏）`);
      }
    }
    if (/\bMath\.sin\s*\(/.test(line)) {
      issues.push(`${file}:${ln} 禁止使用 Math.sin 持续漂浮`);
    }
    if (/<(linearGradient|radialGradient|filter|clipPath|mask)\b[^>]*\bid="[^"]+"/.test(line)) {
      issues.push(`${file}:${ln} SVG <defs> 禁止硬编码静态字符串 id，请使用 useId()`);
    }
    if (/\?\s*['"]#[0-9a-fA-F]{3,8}['"]\s*:\s*['"]#[0-9a-fA-F]{3,8}['"]/.test(line)) {
      issues.push(`${file}:${ln} 禁止布尔三元硬切十六进制颜色，请使用 mixRgb()`);
    }
    if (/from\s+['"][^'"]*legacy\//.test(line)) {
      issues.push(`${file}:${ln} 禁止 import legacy 已淘汰模块`);
    }
    if (file.startsWith('src/episodes/')) {
      const epSlug = file.split('/')[2];
      const m = line.match(/from\s+['"](\.\.\/[^'"]+)['"]/);
      if (m && m[1].startsWith('../') && !m[1].startsWith('../..')) {
        const target = path.posix.normalize(path.posix.join(path.posix.dirname(file), m[1]));
        if (target.startsWith('src/episodes/') && target.split('/')[2] !== epSlug) {
          issues.push(`${file}:${ln} 禁止跨剧集 import (${target})`);
        }
      }
      if (/from\s+['"][^'"]*compositions\//.test(line)) {
        issues.push(`${file}:${ln} 新剧集禁止 import 旧 compositions 单体文件`);
      }
    }
  });
}

if (issues.length > 0) {
  console.error(`静态门禁检查发现 ${issues.length} 项违规：`);
  for (const it of issues) console.error(`  ✗ ${it}`);
  process.exit(1);
}
console.log(`静态门禁检查通过（扫描 ${TARGET_DIRS.join(', ')} 零违规）`);
