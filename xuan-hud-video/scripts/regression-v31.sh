#!/usr/bin/env bash
# 共享组件变更 V3.1 回归对照工具：
# 将「已批准的 V3.1 样片视频」与「当前唯一全片入口 Episode-AgySlashCommands 实时渲染帧」左右并排拼图，
# 直观检验任何共享组件改动是否破坏了 V3.1 已确认的画面层级、厚度、字体与配色质感。
set -euo pipefail
REF_VID="../output/Antigravity动效样片-V3.1-开场与直切校准版.mp4"
OUT_DIR="../output/regression_v31"
[ -f "$REF_VID" ] || { echo "缺少 V3.1 批准基准视频：$REF_VID" >&2; exit 1; }
mkdir -p "$OUT_DIR"

# 4 个代表性关键微拍帧号（30fps）
PAIRS=(
  "85:01_hero_card"
  "240:02_bento_deck"
  "660:03_split_fanout"
  "1230:04_star_topology"
)

for item in "${PAIRS[@]}"; do
  F="${item%%:*}"
  NAME="${item##*:}"
  SEC=$(awk "BEGIN{printf \"%.3f\", $F/30}")
  REF_IMG="$OUT_DIR/${NAME}_ref.png"
  CUR_IMG="$OUT_DIR/${NAME}_cur.png"
  CMP_IMG="$OUT_DIR/compare_${NAME}.jpg"

  ffmpeg -hide_banner -loglevel error -y -ss "$SEC" -i "$REF_VID" -frames:v 1 "$REF_IMG"
  ./node_modules/.bin/remotion still src/index.ts Episode-AgySlashCommands "$CUR_IMG" --frame="$F" >/dev/null
  ffmpeg -hide_banner -loglevel error -y -i "$REF_IMG" -i "$CUR_IMG" \
    -filter_complex "[0:v]scale=960:-2[l];[1:v]scale=960:-2[r];[l][r]hstack=inputs=2" \
    -q:v 2 "$CMP_IMG"
  rm -f "$REF_IMG" "$CUR_IMG"
  echo "✓ 已生成并排回归图（左=V3.1批准版 | 右=当前实时版）：$CMP_IMG"
done
