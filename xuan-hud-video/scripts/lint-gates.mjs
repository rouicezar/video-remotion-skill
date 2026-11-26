#!/usr/bin/env node
/**
 * 源码静态门禁检查（Gate 2 / Gate 3 / 色彩克制 / 架构隔离）：
 * 扫描 `src/engine` 与 `src/episodes`（新架构目录，零历史豁免）：
 * 1. 禁止 fontSize < 24（手机端可读硬底线）
 * 2. 禁止 fontWeight >= 600 或 bold（细体通透铁律）
 * 3. 禁止 Chrome 四色（橙、蓝、红、绿）之外的第 5 种高饱和彩色（禁紫色/粉红/洋红/荧光青等）
 * 4. 禁止 Math.sin（落位静止铁律）
 * 5. 禁止内联 SVG 硬编码 `id="..."`（必须走 useId 模板字符串）
 * 6. 禁止颜色三元硬切 `? '#...' : '#...'`（必须走 mixRgb）
 * 7. 禁止 import legacy 或跨剧集 import
 * 8. `src/episodes/**` 单场景文件 ≤ 250 行
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const TARGET_DIRS = ['src/engine', 'src/episodes'];
const issues = [];

function rgbToHsl(r, g, b) {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const d = max - min;
  const l = (max + min) / 2;
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
  let h = 0;
  if (d !== 0) {
    if (max === rn) h = ((gn - bn) / d) % 6;
    else if (max === gn) h = (bn - rn) / d + 2;
    else h = (rn - gn) / d + 4;
    h = Math.round(h * 60);
    if (h < 0) h += 360;
  }
  return { h, s, l };
}

/** 仅允许中性灰白黑（低饱和度）或 Chrome 四色色域：红(345–20°) / 橙黄(20–62°) / 绿(95–165°) / 蓝(195–240°) */
function isAllowedChromeColor(r, g, b) {
  const { h, s } = rgbToHsl(r, g, b);
  if (s < 0.32) return true; // 中性暗调灰白黑允许
  const isRed = h >= 345 || h <= 20;
  const isOrange = h > 20 && h <= 62;
  const isGreen = h >= 95 && h <= 165;
  const isBlue = h >= 195 && h <= 240;
  return isRed || isOrange || isGreen || isBlue;
}

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
    // 校验十六进制颜色是否落在 Chrome 四色或中性灰白黑
    for (const m of line.matchAll(/#([0-9a-fA-F]{6})\b/g)) {
      const hex = m[1];
      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);
      if (!isAllowedChromeColor(r, g, b)) {
        issues.push(`${file}:${ln} 颜色 #${hex} 超出 Chrome 四色白名单（仅限橙/蓝/红/绿 + 中性灰白）`);
      }
    }
    // 校验 RGB 三元组（仅检查颜色相关上下文，避开坐标数组如 [118, 365, 612]）
    for (const m of line.matchAll(/(?:Rgb|mixRgb|accent|secondary|danger|win|lose|pass|result)\s*[=:(]\s*\[(\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})\]/g)) {
      const [r, g, b] = [Number(m[1]), Number(m[2]), Number(m[3])];
      if (r <= 255 && g <= 255 && b <= 255 && !isAllowedChromeColor(r, g, b)) {
        issues.push(`${file}:${ln} RGB [${r},${g},${b}] 超出 Chrome 四色白名单（仅限橙/蓝/红/绿 + 中性灰白）`);
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
