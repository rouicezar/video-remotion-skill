#!/usr/bin/env bash
# 成片自动质检（Gate 5/6 确定性部分）：规格、码率、音轨完整与防爆音、冻帧、黑帧 + 抽帧严格校验
# 音频口径：严禁篡改用户原始口播响度，综合响度仅作 INFO 记录；黑帧检测与抽帧绝不吞错！
set -uo pipefail
VID="$1"; EW="${2:-3840}"; EH="${3:-2560}"
[ -f "$VID" ] || { echo "文件不存在：$VID" >&2; exit 2; }
DIR="${VID%.*}.qc"; mkdir -p "$DIR"; REPORT="$DIR/qc-report.md"
FAILS=0
row() { # 名称 实测 标准 状态(1=PASS, 0=FAIL, info=INFO)
  local s="PASS"
  if [ "$4" = "info" ]; then s="INFO"
  elif [ "$4" != "1" ]; then s="**FAIL**"; FAILS=$((FAILS+1)); fi
  echo "| $1 | $2 | $3 | $s |" >> "$REPORT"
}
probe() { ffprobe -v error -select_streams "$1" -show_entries "stream=$2" -of default=nw=1:nk=1 "$VID" | head -1; }

W=$(probe v:0 width); H=$(probe v:0 height); FR=$(probe v:0 r_frame_rate)
PF=$(probe v:0 pix_fmt); VC=$(probe v:0 codec_name); AC=$(probe a:0 codec_name)
DUR=$(ffprobe -v error -show_entries format=duration -of default=nw=1:nk=1 "$VID")
BR=$(ffprobe -v error -show_entries format=bit_rate -of default=nw=1:nk=1 "$VID")
MBPS=$(awk "BEGIN{printf \"%.1f\", $BR/1e6}")
if [ "$W" -ge 3000 ]; then LO=1.5; HI=20; else LO=0.3; HI=8; fi

LUFS=$(ffmpeg -hide_banner -nostats -i "$VID" -vn -af ebur128=peak=true -f null - 2>&1 | awk '/Integrated loudness/{f=1} f&&/I:/{print $2; exit}')
TP=$(ffmpeg -hide_banner -nostats -i "$VID" -vn -af ebur128=peak=true -f null - 2>&1 | awk '/True peak/{f=1} f&&/Peak:/{print $2; exit}')

# 冻帧检测（显式校验 ffmpeg 退出码，不吞错）
FREEZE_LOG=$(mktemp)
if ffmpeg -hide_banner -nostats -i "$VID" -vf "scale=480:-2,freezedetect=n=0.002:d=3" -map 0:v -f null - 2>"$FREEZE_LOG"; then
  FREEZES=$(grep -oE "freeze_start: [0-9.]+|freeze_duration: [0-9.]+" "$FREEZE_LOG" | paste - - | sed -E 's/freeze_start: ([0-9.]+)\tfreeze_duration: ([0-9.]+)/\1s(+\2s)/' | tr '\n' ' ')
  FREEZE_OK=$([ -z "$FREEZES" ] && echo 1 || echo 0)
else
  FREEZES="ffmpeg 检测异常"
  FREEZE_OK=0
fi
rm -f "$FREEZE_LOG"

# 黑帧检测（显式校验 ffmpeg 退出码，不吞错）
BLACK_LOG=$(mktemp)
if ffmpeg -hide_banner -nostats -i "$VID" -vf "scale=480:-2,blackdetect=d=0.3:pix_th=0.05" -map 0:v -f null - 2>"$BLACK_LOG"; then
  BLACKS=$(grep -c "black_start" "$BLACK_LOG" || true)
  BLACK_OK=$([ "$BLACKS" = 0 ] && echo 1 || echo 0)
else
  BLACKS="ffmpeg 检测异常"
  BLACK_OK=0
fi
rm -f "$BLACK_LOG"

{
  echo "# QC 报告：$(basename "$VID")"; echo; echo "生成时间：$(date '+%F %T')"; echo
  echo "| 项目 | 实测 | 标准 | 结果 |"; echo "|---|---|---|---|"
} > "$REPORT"
row "分辨率" "${W}×${H}" "${EW}×${EH}" $([ "$W" = "$EW" ] && [ "$H" = "$EH" ] && echo 1 || echo 0)
row "帧率" "$FR" "30/1" $([ "$FR" = "30/1" ] && echo 1 || echo 0)
row "像素格式" "$PF" "yuv420p" $([ "$PF" = "yuv420p" ] && echo 1 || echo 0)
row "编码" "$VC + ${AC:-无音轨}" "h264 + aac" $([ "$VC" = "h264" ] && [ "$AC" = "aac" ] && echo 1 || echo 0)
row "平均码率" "${MBPS} Mbps" "${LO}–${HI} Mbps" $(awk "BEGIN{print ($MBPS>=$LO && $MBPS<=$HI)?1:0}")
row "综合响度（原声保留）" "${LUFS} LUFS" "保留用户原声不篡改" "info"
row "真峰值（防爆音）" "${TP} dBFS" "≤ -0.5 dBFS" $(awk "BEGIN{print ($TP<=-0.5)?1:0}")
row "冻帧 ≥3s" "${FREEZES:-无}" "无（截屏保存段可人工豁免）" "$FREEZE_OK"
row "黑帧段" "$BLACKS" "0" "$BLACK_OK"

# 4 处抽帧同样严格检查退出码与非空落盘，失败直接计入 FAIL！
SNAP_OK=1
SNAP_LINES=""
i=0
for pct in 0.08 0.35 0.65 0.97; do
  i=$((i+1)); T=$(awk "BEGIN{printf \"%.2f\", $DUR*$pct}")
  OUT_JPG="$DIR/frame_${i}_${T}s.jpg"
  if ffmpeg -hide_banner -loglevel error -y -ss "$T" -i "$VID" -frames:v 1 -vf "scale=960:-2" "$OUT_JPG" && [ -s "$OUT_JPG" ]; then
    SNAP_LINES="${SNAP_LINES}![${T}s](frame_${i}_${T}s.jpg)"$'\n'
  else
    SNAP_OK=0
  fi
done
row "关键抽帧完整性" "$([ "$SNAP_OK" = 1 ] && echo '4/4 成功' || echo '抽帧缺失/失败')" "4/4 非空落盘" "$SNAP_OK"

echo >> "$REPORT"; echo "时长：${DUR}s" >> "$REPORT"; echo >> "$REPORT"
printf "%s" "$SNAP_LINES" >> "$REPORT"

echo; cat "$REPORT" | sed -n '1,22p'
[ "$FAILS" = 0 ] && echo "QC 全部通过" || { echo "QC 有 ${FAILS} 项 FAIL"; exit 1; }
