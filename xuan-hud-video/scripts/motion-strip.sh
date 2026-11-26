#!/usr/bin/env bash
# 中后段动态连拍条工具（Motion Strip）：
# 在任意章节或转场衔接区间 [startSec, endSec] 内均匀抽取 8 帧连续画面，拼成 4×2 连拍图，
# 用于检查入场阻尼、翻卡干脆度、焦点切换是否抖动以及跨章衔接，补齐“单张静帧看不出动效”的盲区。
# 用法：scripts/motion-strip.sh <视频.mp4> <起始秒> <结束秒> <输出.jpg>
set -euo pipefail
VID="$1"; START="$2"; END="$3"; OUT="$4"
[ -f "$VID" ] || { echo "视频不存在：$VID" >&2; exit 1; }
mkdir -p "$(dirname "$OUT")"
SPAN=$(awk "BEGIN{print ($END - $START)}")
FPS_EXPR=$(awk "BEGIN{printf \"%.4f\", 8 / ($SPAN > 0.1 ? $SPAN : 0.1)}")

ffmpeg -hide_banner -loglevel error -y -ss "$START" -t "$SPAN" -i "$VID" \
  -vf "fps=${FPS_EXPR},scale=480:-2,tile=4x2:padding=6:margin=6:color=0x0b0d12" \
  -frames:v 1 -q:v 2 "$OUT"

echo "✓ 已生成 8 帧连续动态连拍条（${START}s–${END}s）：$OUT"
