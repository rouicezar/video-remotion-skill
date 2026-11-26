#!/usr/bin/env python3
"""
HUD Explainer Video Generator v2.0 (Audio + SRT -> 1080p Dark-HUD Motion Graphics MP4)
Upgraded with:
- 17 Motion Engines (9 Image/Transition + 8 Spatial/Camera)
- Semantic SRT Boundary Detection (never splits mid-sentence)
- Semantic Move Selection (matches narration intent to best motion engine)
- Strict Pre-Render Schema & Timing Validation Gate
"""

import argparse
import json
import re
import shutil
import subprocess
import sys
from pathlib import Path

ENGINE_DIR = Path(__file__).resolve().parent.parent

# Full 17-move catalog: (moveType, englishLabel, cameraMoving, graphMode, semanticKeywords)
MOVES_CATALOG = [
    ("skeleton-fill", "SKELETON FILL", False, "step", ["骨架", "结构", "复杂", "框架", "界面", "系统", "架构"]),
    ("world-canvas", "WORLD CANVAS", True, "curve", ["画布", "空间", "全局", "全景", "地图", "底层", "路线"]),
    ("deal-in", "DEAL IN", False, "step", ["一组", "清单", "工具", "案例", "发牌", "依次", "列表"]),
    ("tilted-placement", "TILTED PLACEMENT", True, "curve", ["视角", "立体", "透视", "倾斜", "维度", "角度"]),
    ("depth-parallax", "DEPTH PARALLAX", True, "sine", ["分层", "层次", "景深", "前后", "核心层", "远近"]),
    ("angled-dolly", "ANGLED DOLLY", True, "curve", ["切换", "过渡", "对比", "硬切", "连贯", "衔接", "反差"]),
    ("slow-push-in", "SLOW PUSH-IN", True, "curve", ["细节", "沉浸", "呼吸", "停留", "深入", "观察"]),
    ("walk-in", "WALK-IN", True, "curve", ["流程", "步骤", "时间线", "阶段", "第一步", "路线", "推进"]),
    ("drop-gather", "DROP & GATHER", False, "curve", ["挑选", "筛选", "精选", "只留", "去掉", "过滤"]),
    ("depth-tunnel", "DEPTH TUNNEL", True, "sine", ["纵深", "穿梭", "演变", "历史", "一连串", "递进"]),
    ("helix", "HELIX", True, "curve", ["生态", "矩阵", "海量", "全景", "多层", "围绕"]),
    ("flip-3d", "3D FLIP", True, "flat", ["展板", "翻转", "图文", "逐条", "展开", "故事"]),
    ("lift-make-way", "LIFT & MAKE WAY", False, "curve", ["放大", "主角", "重点", "核心", "突出", "优先"]),
    ("bg-blur-pushback", "BG BLUR", True, "curve", ["主次", "聚焦", "虚化", "突出", "弹窗", "提示", "原则"]),
    ("in-place-zoom", "IN-PLACE ZOOM", True, "curve", ["原位", "局部", "追根", "来源", "细节", "定位"]),
    ("color-swap", "COLOR SWAP", False, "step", ["风格", "主题", "色系", "分类", "情绪", "换色"]),
    ("slice-swap", "SLICE SWAP", False, "pulse", ["节奏", "快速", "同类", "对比", "系列", "切片"]),
]
VALID_MOVES = {m[0] for m in MOVES_CATALOG}
VALID_SCENE_TYPES = {
    "hook",
    "overview",
    "chapter",
    "move-bumper",
    "move-demo",
    "comparison",
    "rule-chart",
    "summary",
    "cheatsheet-cta",
}
PALETTE = ["#f5a623", "#74B3F5", "#34d399", "#EE8458", "#E88BA8", "#a78bfa"]

BOUNDARY_PATTERN = re.compile(
    r"^(第[一二三四五六七八九十0-9]+[招步条点块个期]|首先|其次|再看|最后|总结|所以|那|接下来|核心|原则)"
)


def probe_duration(audio_path: Path) -> float:
    cmd = [
        "ffprobe",
        "-v",
        "error",
        "-show_entries",
        "format=duration",
        "-of",
        "default=noprint_wrappers=1:nokey=1",
        str(audio_path),
    ]
    out = subprocess.check_output(cmd, text=True).strip()
    return float(out)


def parse_srt_time(ts: str) -> float:
    ts = ts.strip().replace(",", ".")
    h, m, s = ts.split(":")
    return int(h) * 3600 + int(m) * 60 + float(s)


def split_long_cue(cue: dict, max_zh_chars: int = 15) -> list[dict]:
    """
    Enforce crisp single-line short subtitles (<=15 Chinese chars) so captions NEVER wrap
    into bulky 2-line boxes that occlude the bottom HUD prompt bar.
    """
    zh = cue["zh"].strip()
    if len(zh) <= max_zh_chars:
        return [cue]
    parts = [p.strip() for p in re.split(r"[，。；！？、]+", zh) if p.strip()]
    # Further split any long clause without punctuation
    chunks = []
    for p in parts:
        while len(p) > max_zh_chars:
            chunks.append(p[:max_zh_chars])
            p = p[max_zh_chars:]
        if p:
            chunks.append(p)
    if len(chunks) <= 1:
        return [cue]
    total_chars = sum(len(c) for c in chunks)
    dur = max(0.4, cue["endSec"] - cue["startSec"])
    out = []
    cur_t = cue["startSec"]
    for idx, ch in enumerate(chunks):
        seg_dur = dur * (len(ch) / total_chars)
        nxt_t = cue["endSec"] if idx == len(chunks) - 1 else round(cur_t + seg_dur, 3)
        sub = {"startSec": round(cur_t, 3), "endSec": nxt_t, "zh": ch}
        if idx == 0 and cue.get("en"):
            sub["en"] = cue["en"]
        out.append(sub)
        cur_t = nxt_t
    return out


def parse_srt(srt_path: Path) -> list[dict]:
    raw = srt_path.read_text(encoding="utf-8-sig").strip()
    blocks = re.split(r"\r?\n\r?\n+", raw)
    cues = []
    for blk in blocks:
        lines = [l.strip() for l in blk.splitlines() if l.strip()]
        if len(lines) < 2:
            continue
        time_line_idx = next((i for i, l in enumerate(lines) if "-->" in l), -1)
        if time_line_idx < 0:
            continue
        start_s, end_s = lines[time_line_idx].split("-->")
        text_lines = lines[time_line_idx + 1 :]
        if not text_lines:
            continue
        start_sec = round(parse_srt_time(start_s), 3)
        end_sec = round(parse_srt_time(end_s), 3)
        if end_sec <= start_sec:
            end_sec = round(start_sec + 0.5, 3)
        cue = {"startSec": start_sec, "endSec": end_sec, "zh": text_lines[0]}
        if len(text_lines) > 1:
            cue["en"] = text_lines[1]
        cues.extend(split_long_cue(cue))
    return cues


def build_prompt_tokens(text: str) -> list[dict]:
    parts = re.split(r"([0-9]+(?:\.[0-9]+)?[%秒倍张条个步°x×]*|「[^」]+」|“[^”]+”)", text)
    tokens = []
    for p in parts:
        if not p:
            continue
        is_hl = bool(re.match(r"^[0-9「“]", p))
        tokens.append({"text": p, "highlight": is_hl})
    if not any(t["highlight"] for t in tokens) and len(text) > 10:
        mid = len(text) // 3
        tokens = [
            {"text": text[:mid], "highlight": False},
            {"text": text[mid : mid * 2], "highlight": True},
            {"text": text[mid * 2 :], "highlight": False},
        ]
    return tokens


def pick_semantic_move(text: str, used_moves: set[str], fallback_idx: int):
    best = None
    best_score = 0
    for entry in MOVES_CATALOG:
        m_type, _, _, _, keywords = entry
        score = sum(1 for kw in keywords if kw in text)
        if m_type in used_moves:
            score -= 0.5
        if score > best_score:
            best_score = score
            best = entry
    if best and best_score > 0:
        used_moves.add(best[0])
        return best
    # Rotate through unused moves deterministically
    for offset in range(len(MOVES_CATALOG)):
        cand = MOVES_CATALOG[(fallback_idx + offset) % len(MOVES_CATALOG)]
        if cand[0] not in used_moves:
            used_moves.add(cand[0])
            return cand
    return MOVES_CATALOG[fallback_idx % len(MOVES_CATALOG)]


def snap_to_cue_boundary(target_sec: float, cues: list[dict], min_sec: float, max_sec: float) -> float:
    candidates = [c["startSec"] for c in cues if min_sec <= c["startSec"] <= max_sec]
    if not candidates:
        return round(target_sec, 3)
    return round(min(candidates, key=lambda t: abs(t - target_sec)), 3)


def auto_storyboard(
    cues: list[dict],
    duration_sec: float,
    title: str,
    badge: str,
    watermark: str,
    cta_text: str,
    audio_rel: str,
    user_images: list[str],
) -> dict:
    """
    Semantic SRT-aligned auto-storyboarder (v2.0):
    - Aligns scene cuts to exact SRT cue boundaries (never cuts mid-sentence)
    - Detects structural markers ("第一", "第二", "总结", etc.)
    - Selects semantically matching motion engines from all 17 moves
    """
    # 1. Hook boundary snapped to cue
    raw_hook_end = min(max(3.2, duration_sec * 0.14), min(10.0, duration_sec * 0.28))
    hook_end = snap_to_cue_boundary(raw_hook_end, cues, 2.5, min(12.0, duration_sec * 0.35))

    # 2. Outro boundary snapped to cue (prefer cue containing 总结/最后/评论/关注)
    raw_outro_start = max(hook_end + 3.0, duration_sec - min(max(3.5, duration_sec * 0.16), 12.0))
    outro_kw_cues = [
        c["startSec"]
        for c in cues
        if c["startSec"] > duration_sec * 0.72 and re.search(r"(总结|回顾|最后|评论|关注|点赞|哪一)", c["zh"])
    ]
    outro_start = (
        round(outro_kw_cues[0], 3)
        if outro_kw_cues
        else snap_to_cue_boundary(raw_outro_start, cues, hook_end + 3.0, duration_sec - 2.5)
    )
    if outro_start <= hook_end + 2.0:
        outro_start = round(max(hook_end + 2.0, duration_sec * 0.8), 3)

    # 3. Middle demo segments: detect semantic cue boundaries first!
    mid_cues = [c for c in cues if hook_end - 0.1 <= c["startSec"] < outro_start - 0.1]
    split_points = [hook_end]
    for c in mid_cues[1:]:
        if BOUNDARY_PATTERN.match(c["zh"]) and (c["startSec"] - split_points[-1]) >= 3.2:
            split_points.append(round(c["startSec"], 3))

    # If too few semantic splits for a long video, subdivide evenly at cue boundaries
    if len(split_points) == 1 and (outro_start - hook_end) >= 12.0:
        target_n = max(2, min(9, round((outro_start - hook_end) / 11.0)))
        step = (outro_start - hook_end) / target_n
        for i in range(1, target_n):
            pt = snap_to_cue_boundary(hook_end + i * step, mid_cues, split_points[-1] + 2.5, outro_start - 2.5)
            if pt > split_points[-1] + 1.5:
                split_points.append(pt)
    split_points.append(outro_start)

    num_demos = len(split_points) - 1
    used_moves: set[str] = set()
    demo_scenes = []
    summary_items = []

    for i in range(num_demos):
        s_start = split_points[i]
        s_end = split_points[i + 1]
        seg_cues = [c for c in cues if c["startSec"] >= s_start - 0.2 and c["startSec"] < s_end - 0.05]
        joined = "，".join(c["zh"] for c in seg_cues) if seg_cues else f"核心要点 {i + 1}"
        short_title = re.sub(r"^[，。、\s]+", "", seg_cues[0]["zh"])[:12] if seg_cues else f"要点 {i + 1}"

        move_type, move_en, cam_moving, graph_mode, _ = pick_semantic_move(joined, used_moves, i)

        # Build 4 distinct cards from clauses in this segment
        clauses = [p.strip() for p in re.split(r"[，。；！？、]+", joined) if len(p.strip()) >= 2]
        cards = []
        for k in range(4):
            c_text = clauses[k] if k < len(clauses) else (seg_cues[min(len(seg_cues) - 1, k)]["zh"] if seg_cues else f"{short_title} · 拆解 {k + 1}")
            img_rel = user_images[(i * 4 + k) % len(user_images)] if user_images else None
            card = {
                "code": f"{k + 1:02d}",
                "title": c_text[:14],
                "subtitle": c_text[14:40] if len(c_text) > 14 else f"关键节点 {k + 1} / 4",
                "color": PALETTE[(i + k) % len(PALETTE)],
            }
            if img_rel:
                card["image"] = img_rel
            cards.append(card)

        demo_scenes.append(
            {
                "id": f"demo-{i + 1:02d}",
                "type": "move-demo",
                "startSec": s_start,
                "endSec": s_end,
                "index": i + 1,
                "total": num_demos,
                "title": short_title,
                "subtitle": move_en,
                "moveType": move_type,
                "cameraMoving": cam_moving,
                "items": cards,
                "promptTokens": build_prompt_tokens(joined[:68]),
                "metrics": {
                    "status": move_en,
                    "graphMode": graph_mode,
                    "items": [
                        {"labelEn": "SECTION", "labelZh": "当前章节", "value": f"{i + 1:02d} / {num_demos:02d}", "accent": True},
                        {"labelEn": "ENGINE", "labelZh": "动效引擎", "value": move_en},
                        {"labelEn": "CAMERA", "labelZh": "运镜状态", "value": "MOVE" if cam_moving else "LOCKED"},
                    ],
                },
            }
        )

        summary_items.append(
            {
                "code": f"{i + 1:02d}",
                "title": short_title,
                "category": move_en.split()[0],
                "description": joined[:46],
                "color": PALETTE[i % len(PALETTE)],
                **({"image": user_images[i % len(user_images)]} if user_images else {}),
            }
        )

    hook_cues = [c["zh"] for c in cues if c["startSec"] < hook_end]
    hook_sub = " · ".join(hook_cues[:2]) if hook_cues else "结构化拆解与动效演示"

    scenes = [
        {
            "id": "hook",
            "type": "hook",
            "startSec": 0.0,
            "endSec": hook_end,
            "badge": badge,
            "title": title,
            "subtitle": hook_sub[:52],
            "items": summary_items[:4],
        },
        *demo_scenes,
        {
            "id": "outro",
            "type": "cheatsheet-cta",
            "startSec": outro_start,
            "endSec": round(duration_sec, 3),
            "title": "核心要点回顾",
            "subtitle": f"{badge} · KEY TAKEAWAYS · 截图保存",
            "ctaText": cta_text,
            "items": summary_items,
        },
    ]

    return {
        "meta": {
            "title": title,
            "episodeBadge": badge,
            "watermark": watermark,
            "fps": 30,
            "durationSec": round(duration_sec, 3),
            "audioFile": audio_rel,
        },
        "subtitles": cues,
        "scenes": scenes,
    }


def validate_timeline(timeline: dict) -> list[str]:
    """Pre-render validation gate to guarantee stable deterministic rendering."""
    errors = []
    meta = timeline.get("meta", {})
    if not meta.get("durationSec") or meta["durationSec"] <= 0:
        errors.append("meta.durationSec must be > 0")
    scenes = timeline.get("scenes", [])
    if not scenes:
        errors.append("scenes must not be empty")
    for idx, sc in enumerate(scenes):
        sid = sc.get("id", f"scene#{idx}")
        if sc.get("type") not in VALID_SCENE_TYPES:
            errors.append(f"{sid}: invalid scene type '{sc.get('type')}'")
        if sc.get("endSec", 0) <= sc.get("startSec", 0):
            errors.append(f"{sid}: endSec ({sc.get('endSec')}) must be > startSec ({sc.get('startSec')})")
        if sc.get("moveType") and sc["moveType"] not in VALID_MOVES:
            errors.append(f"{sid}: unknown moveType '{sc['moveType']}'")
    return errors


def main():
    parser = argparse.ArgumentParser(description="HUD Explainer Video Generator v2.0 (Audio + SRT -> 1080p MP4)")
    parser.add_argument("--audio", required=True, help="Path to audio file (.mp3, .m4a, .wav)")
    parser.add_argument("--srt", required=True, help="Path to SRT subtitle file (.srt)")
    parser.add_argument("--output", required=True, help="Output MP4 path")
    parser.add_argument("--title", default="核心知识拆解", help="Video main title")
    parser.add_argument("--badge", default="HUD 动效专栏", help="Top badge text")
    parser.add_argument("--watermark", default="STUDIO", help="Subtle background watermark text (empty to disable)")
    parser.add_argument("--cta", default="你最想先试哪一点？", help="Outro CTA pill text")
    parser.add_argument("--assets-dir", default=None, help="Optional folder of custom images (.jpg/.png/.webp)")
    parser.add_argument("--storyboard", default=None, help="Optional custom timeline JSON overriding auto-storyboard")
    parser.add_argument("--dump-timeline", default=None, help="Optional path to save generated timeline JSON")
    parser.add_argument("--validate-only", action="store_true", help="Validate storyboard and exit without rendering")
    parser.add_argument("--concurrency", type=int, default=6, help="Remotion render concurrency")
    args = parser.parse_args()

    audio_path = Path(args.audio).expanduser().resolve()
    srt_path = Path(args.srt).expanduser().resolve()
    output_path = Path(args.output).expanduser().resolve()
    output_path.parent.mkdir(parents=True, exist_ok=True)

    if not audio_path.exists():
        sys.exit(f"Audio file not found: {audio_path}")
    if not srt_path.exists():
        sys.exit(f"SRT file not found: {srt_path}")

    stage_dir = ENGINE_DIR / "public" / "universal_run"
    if stage_dir.exists():
        shutil.rmtree(stage_dir)
    stage_dir.mkdir(parents=True, exist_ok=True)

    audio_dest = stage_dir / f"audio{audio_path.suffix.lower()}"
    shutil.copy2(audio_path, audio_dest)
    audio_rel = f"universal_run/{audio_dest.name}"

    user_images = []
    if args.assets_dir:
        adir = Path(args.assets_dir).expanduser().resolve()
        if adir.exists():
            for idx, img in enumerate(sorted(adir.iterdir())):
                if img.suffix.lower() in {".jpg", ".jpeg", ".png", ".webp"}:
                    dest = stage_dir / f"img_{idx:02d}{img.suffix.lower()}"
                    shutil.copy2(img, dest)
                    user_images.append(f"universal_run/{dest.name}")

    duration_sec = probe_duration(audio_path)
    cues = parse_srt(srt_path)

    if args.storyboard:
        timeline = json.loads(Path(args.storyboard).expanduser().read_text(encoding="utf-8"))
        timeline["meta"]["audioFile"] = audio_rel
        timeline["meta"]["durationSec"] = round(duration_sec, 3)
        if not timeline.get("subtitles"):
            timeline["subtitles"] = cues
    else:
        timeline = auto_storyboard(
            cues=cues,
            duration_sec=duration_sec,
            title=args.title,
            badge=args.badge,
            watermark=args.watermark,
            cta_text=args.cta,
            audio_rel=audio_rel,
            user_images=user_images,
        )

    errors = validate_timeline(timeline)
    if errors:
        sys.exit("Pre-render validation FAILED:\n- " + "\n- ".join(errors))

    props_file = stage_dir / "props.json"
    props_file.write_text(json.dumps({"timeline": timeline}, ensure_ascii=False, indent=2), encoding="utf-8")

    if args.dump_timeline:
        Path(args.dump_timeline).write_text(json.dumps(timeline, ensure_ascii=False, indent=2), encoding="utf-8")

    print(
        f"[HUD Engine v2.0] Validated OK | Audio: {duration_sec:.2f}s | Subtitles: {len(cues)} | "
        f"Scenes: {len(timeline['scenes'])} | Moves: {[s.get('moveType') for s in timeline['scenes'] if s.get('moveType')]}"
    )

    if args.validate_only:
        return

    cmd = [
        "npx",
        "remotion",
        "render",
        "src/index.ts",
        "UniversalVideo",
        str(output_path),
        f"--props={props_file}",
        "--codec=h264",
        "--pixel-format=yuv420p",
        f"--concurrency={args.concurrency}",
    ]
    subprocess.run(cmd, cwd=str(ENGINE_DIR), check=True)
    print(f"[HUD Engine v2.0] SUCCESS -> {output_path}")


if __name__ == "__main__":
    main()
