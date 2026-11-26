#!/usr/bin/env node
/**
 * 源码静态门禁检查（全量工程化硬约束，覆盖 Gate 1–6 可静态校验的全部条款）：
 * 扫描 `src/engine` 与 `src/episodes`（零历史豁免）：
 *  1. 禁止 fontSize < 24（手机端可读硬底线）
 *  2. 禁止 fontWeight >= 600 或 bold（细体通透铁律）
 *  3. 禁止 Chrome 四色（橙/蓝/红/绿）之外的第 5 种高饱和彩色
 *  4. 禁止组件单侧边缘装饰竖线（borderLeft / borderRight）
 *  5. 禁止动态 borderWidth（必须恒定数字常量，防 1px 抖动）
 *  6. 禁止 Math.sin（落位静止铁律）
 *  7. 禁止内联 SVG 硬编码 `id="..."`（必须走 useId 模板字符串）
 *  8. 禁止颜色三元硬切 `? '#...' : '#...'`（必须走 mixRgb）
 *  9. 禁止引用已废除的响度篡改文件 `*_norm.wav`
 * 10. 禁止 import legacy、跨剧集 import 或 import 旧 compositions 单体
 * 11. `src/episodes/<slug>/Scene*.tsx` 单文件 ≤ 250 行且必须挂载 `<SceneShell` 或 `<CameraRig`（强制运镜与衔接）
 * 12. `remotion.config.ts` 必须使用无损 `png` 中间帧（杜绝 JPEG 4:2:0 斜边锯齿）
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const TARGET_DIRS = ['src/engine', 'src/episodes'];
const issues = [];

// 规则 12：核验 remotion.config.ts 锁死无损 PNG 中间帧
const cfgPath = path.join(ROOT, 'remotion.config.ts');
if (fs.existsSync(cfgPath)) {
  const cfgText = fs.readFileSync(cfgPath, 'utf8');
  if (!/setVideoImageFormat\(['"]png['"]\)/.test(cfgText)) {
    issues.push('remotion.config.ts: 必须配置 setVideoImageFormat("png") 消除暗黑斜边 JPEG 锯齿');
  }
}

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

function isAllowedChromeColor(r, g, b) {
  const { h, s } = rgbToHsl(r, g, b);
  if (s < 0.32) return true;
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
  const base = path.basename(file);

  if (file.startsWith('src/episodes/') && lines.length > 250) {
    issues.push(`${file}: 文件行数 ${lines.length} > 250（违反单章节防衰减上限）`);
  }

  // 规则 11：所有正式章节组件必须挂载 SceneShell 或 CameraRig（防遗漏 3D 运镜与硬切）
  if (file.startsWith('src/episodes/') && /^Scene.*\.tsx$/.test(base)) {
    if (!/<(SceneShell|CameraRig)\b/.test(text)) {
      issues.push(`${file}: 章节组件必须挂载 <SceneShell> 或 <CameraRig>（禁止无运镜静态硬切场景）`);
    }
  }

  lines.forEach((line, idx) => {
    const ln = idx + 1;
    for (const m of line.matchAll(/fontSize:\s*(\d+)/g)) {
      if (Number(m[1]) < 24) issues.push(`${file}:${ln} fontSize=${m[1]} < 24px`);
    }
    for (const m of line.matchAll(/fontWeight:\s*(\d+|['"]bold['"]|['"]bolder['"])/g)) {
      const v = m[1];
      if (v.includes('bold') || Number(v) >= 600) {
        issues.push(`${file}:${ln} fontWeight=${v} 过粗（仅允许 WEIGHTS.light=300 / regular=400 / medium=500）`);
      }
    }
    for (const m of line.matchAll(/#([0-9a-fA-F]{6})\b/g)) {
      const hex = m[1];
      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);
      if (!isAllowedChromeColor(r, g, b)) {
        issues.push(`${file}:${ln} 颜色 #${hex} 超出 Chrome 四色白名单（仅限橙/蓝/红/绿 + 中性灰白）`);
      }
    }
    for (const m of line.matchAll(/(?:Rgb|mixRgb|accent|secondary|danger|win|lose|pass|result)\s*[=:(]\s*\[(\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})\]/g)) {
      const [r, g, b] = [Number(m[1]), Number(m[2]), Number(m[3])];
      if (r <= 255 && g <= 255 && b <= 255 && !isAllowedChromeColor(r, g, b)) {
        issues.push(`${file}:${ln} RGB [${r},${g},${b}] 超出 Chrome 四色白名单`);
      }
    }
    if (/\bborder(Left|Right)\s*:/.test(line)) {
      issues.push(`${file}:${ln} 严禁在组件单侧边缘加装饰竖线（borderLeft/borderRight）`);
    }
    // 规则 5：禁止动态 borderWidth（允许 PhysicalGlass3D 内部按层固定静态切片 isBottomEdge）
    if (/\bborderWidth:\s*[^0-9\s]/.test(line) && !file.endsWith('PhysicalGlass3D.tsx')) {
      issues.push(`${file}:${ln} 禁止动态 borderWidth（必须恒定数字常量防 1px 抖动）`);
    }
    if (/_norm\.wav/.test(line)) {
      issues.push(`${file}:${ln} 禁止引用 _norm.wav 响度篡改音频，必须原样挂载用户原始口播`);
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
console.log(`静态门禁检查通过（扫描 ${TARGET_DIRS.join(', ')} 与 remotion.config.ts 零违规）`);
