---
name: hud-explainer-video
description: >-
  Produces true-4K (3840x2560 3:2) 30fps dark-studio 2.5D/3D frosted-glass motion-graphics explainer videos in Remotion with voiceover-synced micro-beats, mobile-first large typography, co-located Foley micro-SFX, and post-delivery retrospectives. Use whenever turning narration audio and SRT subtitles into an explainer video, motion sample, or visual storyboard.
---

# 2.5D/3D 动效解说视频制作规范（v6.0 · 单源工业流）

本规范是项目视频生产的**唯一执行标准**，通过**单源分章架构**与**六大量化门禁**消除手写波动、声画错位及后半段质量衰减，稳守 75 分底线并持续向 90 分演进。

---

## 一、强制五步单源工作流（Single-Source SOP · 严禁跳步）

> **架构铁律**：静态样图、动效样片、真 4K 成片**必须直接渲染同一套章节组件**（`src/episodes/<slug>/Scene01.tsx ... Scene0N.tsx`），严禁单独复制静态 `Showcase` 文件，严禁跨剧集直接 `import` 历史单集业务组件，单章节文件控制在 **`≤ 250` 行**以内以杜绝长文件注意力衰减。

### Step 1 · 前置校准与微节拍方案对齐（必经用户确认）
1. 读取 [retrospective-log.md](./references/retrospective-log.md) 中锁定的**本期定向升级实验项**（2–3 项）。
2. 通读口播原稿与 `.srt` 字幕，修正语音识别错别字与平台敏感词，探测音频精确时长（`ffprobe`）。
3. 输出结构化**《章节几何选型 & 1.5–3.0s 微节拍分镜表》**（列明：起止秒数、口播触发词、画面 2–6 字核心大词、组件几何形态、组间形变/运镜衔接方式），**经用户确认后方可编码**。

### Step 2 · 素材锐度体检 + 同源静态样图验收（必经用户确认）
1. **官网局部证据采集与锐度硬检**：使用 Chrome Headless 深色模式 `3×` DPI（`--force-dark-mode --enable-features=WebContentsForceDark --force-device-scale-factor=3`）**仅截取核心标题与 1–2 行关键结论局部**（去净导航栏与侧栏，严禁截取整页密密麻麻小字段落）；落盘后立即执行 `sips -g pixelWidth` 校验，确保 **`原图宽 ≥ 容器逻辑宽 × 2`**，不达标则改为 1:1 矢量深色 UI 组件精绘。
2. 编写核心代表章节组件，直接通过 `npx remotion still` 抽取 **5–7 张真实场景静帧**提交用户验收构图、立体层次与手机端字号可读性。

### Step 3 · 30–40s 动效样片快速验收（必经用户确认）
1. 组合前 2–3 个已验收章节组件，挂载原声与组件内聚微音效，以预览分辨率（`1920×1280`，`--scale=1`）快速渲染 30–40 秒动效样片。
2. 提交用户确认**物理阻尼手感、口播卡点精度、扫光融合度与音效平衡**，通过后再横向扩写剩余章节。

### Step 4 · 全片分章实现 + 渲染前全章静帧门禁（Pre-Render Gate）
1. 按相同颗粒度独立实现中段、后段与结尾全部 `SceneXX.tsx`，严禁中后段降级为纯文字卡片堆砌。
2. 执行 `npx tsc --noEmit` 确保零类型错误，并用 `remotion still` 批量输出覆盖**前、中、后、尾全部章节**的关键微拍静帧，对照 [approval-gates.md](./references/approval-gates.md) 逐条核验；**任意一项 FAIL 必须先修复重检，严禁带病启动 4K 渲染**。

### Step 5 · 真 4K 成片渲染 + 终审交付 + 强制复盘
1. 启动真 4K（`3840×2560`）标准编码渲染；完成后运行 `ffprobe` 校验流参数并抽取前/中/后/尾 4 帧实检。
2. 交付成片后，立即按模板向 [retrospective-log.md](./references/retrospective-log.md) 追加本期复盘与下期实验项。

---

## 二、核心视听与代码实现标准

### 1. 画幅与渲染编码规格
| 场景 | 逻辑画布 | 缩放与输出分辨率 | 推荐 CLI 渲染参数 |
| :--- | :--- | :--- | :--- |
| **默认标准（3:2 真 4K）** | `1920×1280` (`30fps`) | `--scale=2` → `3840×2560` | `--codec=h264 --pixel-format=yuv420p --crf=18 --concurrency=8`（若开启 `--hardware-acceleration=if-possible` 须加 `--video-bitrate=16M` 防体积失控与二压色带） |
| **样片预览（3:2 高清）** | `1920×1280` (`30fps`) | `--scale=1` → `1920×1280` | `--codec=h264 --pixel-format=yuv420p --crf=20 --concurrency=8` |

*(注：除非用户明确要求 `16:9`，一律采用 `3:2` 逻辑 `1920×1280` 画布。)*

### 2. 三层空间深度与 3D 磨砂毛玻璃“文字物理融合”
- **Plane 1（远景舞台层）**：深蓝暗调工作室底色（`#0C1018`）+ 底部 `rotateX(68deg)` 透视地面网格 + 柔和冷暖双光源；若设背景描边水印，**必须在舞台中央主体区叠加径向遮罩减淡**，严禁穿透毛玻璃干扰前景文字。
- **Plane 2（中景标题层）**：阶段胶囊徽章 + 深投影主标题 + 渐变底杠；支持“开场居中大字演绎 → 组件入场时丝滑上推归位”的动态重心转移，消除画面下半部阶段性留白空洞。
- **Plane 3（前景组件层 · 同质地多形态）**：全片统一 **3D 磨砂毛玻璃材质**（微细噪点层 + 顶部高光棱线 + `6–8px` 厚底立体切边 + 深悬浮投影），交替组合多元几何形态：
  - **并行分发型** → 星型拓扑节点 + 边缘流光连线
  - **循环演进型** → 环形星轨闭环 + 象限节点
  - **阶段把关型** → 斜向阶梯节点 + 双层立体菱形/盾形门禁
  - **逻辑流水型** → 拟真暗黑代码终端 + 并发分叉树
  - **持续达标型** → 大号圆形进度仪表盘 + 验证控制台
  - **痛点反转/误区纠偏** → `14–16` 帧 3D 翻卡（`FlipCard3D`）
  - **结尾总结选型** → 错落 Bento 决策矩阵（严禁单调长条满屏堆叠）
- **去贴纸感铁律（DOM 层级强制要求）**：
  1. 卡片容器必须设置 `position: 'relative', overflow: 'hidden'`；
  2. **动态反光扫光层（`Sheen`）必须作为最后一个子节点渲染（或显式设 `zIndex: 10, pointerEvents: 'none'`），覆盖在文字层正上方同步扫过**，配合微弱内雕文字阴影，使文字呈现封装于玻璃内部的蚀刻质感；
  3. 组件做 `180°` 3D 翻转时，正反面各自独立封装背向隐藏层，避免依赖在 `preserve-3d` 下会失效的 `backdrop-filter` 或单向 2D 下坠阴影；
  4. 所有内联 SVG `<linearGradient>` / `<filter>` 必须通过 React `useId()` 生成唯一 ID，严禁硬编码全局静态 ID。

### 3. 颗粒级微拍演绎与几何无感转场
- **1.5–3.0 秒微拍锁死**：将长逻辑拆分为短促干脆的微切面，严禁单布局线性慢拖 10–15 秒。
- **几何形态无感匹配转场（Shape-Match Morph）**：相邻场景/微拍优先复用同构几何主体变形衔接（如：圆形节点 → 放大展开为星轨环/环形仪表盘；横向胶囊条 → 拉伸展开为终端窗口），**严禁全片依赖简单的 `opacity` 交叉淡入淡出导致双层文字半透明叠影**。
- **多节点镜头推近跟随**：当场景含 4 个以上流程节点时，在整体关系亮相后，通过舞台容器 `scale(1.4–1.7) + translate3d` 平滑推近当前讲述节点，确保手机小屏始终主体饱满。
- **严格时序因果与递进点亮**：
  - 并列概念/平台/标签必须按口播念到的**精确先后帧**逐个触发缩放+光晕强调；未讲到的终态徽章（如通过/完成标识）严禁提前静态挂出；
  - 两段式递进核心句：前半句先白亮登场、后半句低对比压暗待命；念到后半句瞬间，**保持前半句白亮不变**，后半句以琥珀金（`#F5A623`）动效点亮。

### 4. 物理曲线、零闪抖与声画内聚微音效
- **统一干脆弹簧**：`CRISP_SPRING = { damping: 24, stiffness: 185, mass: 0.72 }`（`10–14` 帧利落落位）；3D 翻卡严格控制在 **`14–16` 帧**。
- **落位静止 & 重力顺序**：落定后严禁叠加任何持续 `Math.sin` 上下漂浮；立体叠卡必须**最底层最先落、最顶层最后落**。
- **零闪抖与零穿模**：
  - 颜色切换全量使用连续 RGB 插值（`mixRgb`），**严禁 `val > 0.5 ? colorA : colorB` 布尔硬切跳色**；
  - 边框恒定 `borderWidth: 2`（严禁动态改边框宽度引发布局 1px 抖动）；列表焦点切换采用**行内连续 RGB 填充**（严禁跨行间空隙的独立滑块）；
  - SVG 连线起点与终点必须贴合节点几何外边缘（圆周切点或矩形边中点），且当绘制进度 `<= 0.02` 时设 `opacity: 0` 消除 `strokeLinecap="round"` 残余圆点。
- **声画内聚微音效（Co-located Foley SFX）**：
  - 公共音效统一存放在 `public/sfx/`（或剧集独立音效目录），包含 6 类低音量拟声：`drop`（落卡 `0.14`）、`deal`（发卡 `0.13`）、`flow`（流光 `0.12`）、`pop`（弹出 `0.11`）、`flip`（翻卡 `0.16`）、`whoosh`（推镜/形变 `0.15`）。
  - **禁止在全片入口末尾手工维护全局帧偏移算式表**：音效组件必须封装在各场景/动效原语内部，与动画触发帧共用同一个时间变量；若连续音效间隔 `< 8` 帧，需错开或递减单次音量（`×0.75`）防止同相叠加爆音。

---

## 三、工程资产与参考说明
- **Remotion 根目录**：`/Users/rouice/视频探索/xuan-hud-video`
- **共享基础设计层**：
  - 色彩与字体常量：[tokens.ts](file:///Users/rouice/视频探索/xuan-hud-video/src/design/tokens.ts)
  - 缓动与连续权重函数：[motion.ts](file:///Users/rouice/视频探索/xuan-hud-video/src/design/motion.ts)
  - 矢量官方品牌 Logo 库（新增产品图标统一沉淀至此，严禁用 emoji 代替）：[BrandLogos.tsx](file:///Users/rouice/视频探索/xuan-hud-video/src/design/BrandLogos.tsx)
- **历史基线参考（只读参考，新剧集请建 `src/episodes/<slug>/` 独立模块，勿直接 import 耦合）**：
  - 第 1 期 75 分成片实现参考：[AgyV2FullVideo.tsx](file:///Users/rouice/视频探索/xuan-hud-video/src/compositions/AgyV2FullVideo.tsx)
- **已淘汰模块（严禁调用）**：`scripts/generate_hud_video.py`、`src/compositions/UniversalVideo.tsx`、`src/design/Chrome.tsx`（`HudFrame`）、`src/components/moves/*`。
