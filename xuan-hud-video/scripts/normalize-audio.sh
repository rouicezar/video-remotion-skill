#!/usr/bin/env bash
# 两遍 EBU R128 响度标准化：人声统一到 -14 LUFS / 真峰值 -1 dBFS（短视频平台常用目标）
# 用法：scripts/normalize-audio.sh <输入音频> <输出.wav> [目标LUFS，默认 -14]
set -euo pipefail
IN="$1"; OUT="$2"; TARGET="${3:--14}"
[ -f "$IN" ] || { echo "输入不存在：$IN" >&2; exit 1; }

STATS=$(ffmpeg -hide_banner -nostats -i "$IN" \
  -af "loudnorm=I=${TARGET}:TP=-1.0:LRA=11:print_format=json" -f null - 2>&1 \
  | awk '/^\{/,/^\}/')
get() { echo "$STATS" | grep "\"$1\"" | sed -E 's/.*: "([^"]+)".*/\1/'; }

mkdir -p "$(dirname "$OUT")"
ffmpeg -hide_banner -loglevel error -y -i "$IN" -af \
  "loudnorm=I=${TARGET}:TP=-1.0:LRA=11:measured_I=$(get input_i):measured_TP=$(get input_tp):measured_LRA=$(get input_lra):measured_thresh=$(get input_thresh):offset=$(get target_offset):linear=true" \
  -ar 48000 -c:a pcm_s16le "$OUT"

echo "输入响度 $(get input_i) LUFS → 输出："
ffmpeg -hide_banner -nostats -i "$OUT" -af ebur128=peak=true -f null - 2>&1 | grep -E "^\s+(I|Peak):" | tail -2
