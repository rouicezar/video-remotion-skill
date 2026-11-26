#!/usr/bin/env bash
# 成片自动质检（Gate 5/6 的确定性部分）：规格、码率、响度、冻帧、黑帧 + 前/中/后/尾抽帧
# 用法：scripts/qc.sh <成片.mp4> [期望宽 3840] [期望高 2560]
# 结果写入 <成片同目录>/<文件名>.qc/qc-report.md；任一项 FAIL 退出码为 1
set -uo pipefail
VID="$1"; EW="${2:-3840}"; EH="${3:-2560}"
[ -f "$VID" ] || { echo "文件不存在：$VID" >&2; exit 2; }
DIR="${VID%.*}.qc"; mkdir -p "$DIR"; REPORT="$DIR/qc-report.md"
FAILS=0
row() { # 名称 实测 标准 是否通过(0/1)
  local s="PASS"; [ "$4" = 1 ] || { s="**FAIL**"; FAILS=$((FAILS+1)); }
  echo "| $1 | $2 | $3 | $s |" >> "$REPORT"
}
probe() { ffprobe -v error -select_streams "$1" -show_entries "stream=$2" -of default=nw=1:nk=1 "$VID" | head -1; }

W=$(probe v:0 width); H=$(probe v:0 height); FR=$(probe v:0 r_frame_rate)
PF=$(probe v:0 pix_fmt); VC=$(probe v:0 codec_name); AC=$(probe a:0 codec_name)
DUR=$(ffprobe -v error -show_entries format=duration -of default=nw=1:nk=1 "$VID")
BR=$(ffprobe -v error -show_entries format=bit_rate -of default=nw=1:nk=1 "$VID")
MBPS=$(awk "BEGIN{printf \"%.1f\", $BR/1e6}")
# CRF 恒定画质编码在静止暗调舞台下码率极省，主要防范 >20 Mbps 虚胖与 <0.3/1.5 Mbps 异常压糊
if [ "$W" -ge 3000 ]; then LO=1.5; HI=20; else LO=0.3; HI=8; fi

LUFS=$(ffmpeg -hide_banner -nostats -i "$VID" -vn -af ebur128=peak=true -f null - 2>&1 | awk '/Integrated loudness/{f=1} f&&/I:/{print $2; exit}')
TP=$(ffmpeg -hide_banner -nostats -i "$VID" -vn -af ebur128=peak=true -f null - 2>&1 | awk '/True peak/{f=1} f&&/Peak:/{print $2; exit}')

# 冻帧：480px 缩略后检测 ≥3.0s 几乎无变化的片段（截屏保存段需人工复核白名单）
FREEZES=$(ffmpeg -hide_banner -nostats -i "$VID" -vf "scale=480:-2,freezedetect=n=0.002:d=3" -map 0:v -f null - 2>&1 \
  | grep -oE "freeze_start: [0-9.]+|freeze_duration: [0-9.]+" | paste - - | sed -E 's/freeze_start: ([0-9.]+)\tfreeze_duration: ([0-9.]+)/\1s(+\2s)/' | tr '\n' ' ')
BLACKS=$(ffmpeg -hide_banner -nostats -i "$VID" -vf "scale=480:-2,blackdetect=d=0.3:pix_th=0.05" -map 0:v -f null - 2>&1 | grep -c black_start || true)

{
  echo "# QC 报告：$(basename "$VID")"; echo; echo "生成时间：$(date '+%F %T')"; echo
  echo "| 项目 | 实测 | 标准 | 结果 |"; echo "|---|---|---|---|"
} > "$REPORT"
row "分辨率" "${W}×${H}" "${EW}×${EH}" $([ "$W" = "$EW" ] && [ "$H" = "$EH" ] && echo 1 || echo 0)
row "帧率" "$FR" "30/1" $([ "$FR" = "30/1" ] && echo 1 || echo 0)
row "像素格式" "$PF" "yuv420p" $([ "$PF" = "yuv420p" ] && echo 1 || echo 0)
row "编码" "$VC + ${AC:-无音轨}" "h264 + aac" $([ "$VC" = "h264" ] && [ "$AC" = "aac" ] && echo 1 || echo 0)
row "平均码率" "${MBPS} Mbps" "${LO}–${HI} Mbps" $(awk "BEGIN{print ($MBPS>=$LO && $MBPS<=$HI)?1:0}")
row "综合响度" "${LUFS} LUFS" "-14 ±1.5 LUFS" $(awk "BEGIN{print ($LUFS>=-15.5 && $LUFS<=-12.5)?1:0}")
row "真峰值" "${TP} dBFS" "≤ -0.5 dBFS" $(awk "BEGIN{print ($TP<=-0.5)?1:0}")
row "冻帧 ≥3s" "${FREEZES:-无}" "无（截屏保存段可人工豁免）" $([ -z "$FREEZES" ] && echo 1 || echo 0)
row "黑帧段" "$BLACKS" "0" $([ "$BLACKS" = 0 ] && echo 1 || echo 0)
echo >> "$REPORT"; echo "时长：${DUR}s" >> "$REPORT"; echo >> "$REPORT"

# 前/中/后/尾 抽帧 + 拼图，供人工目视终审
i=0
for pct in 0.08 0.35 0.65 0.97; do
  i=$((i+1)); T=$(awk "BEGIN{printf \"%.2f\", $DUR*$pct}")
  ffmpeg -hide_banner -loglevel error -y -ss "$T" -i "$VID" -frames:v 1 -vf "scale=960:-2" "$DIR/frame_${i}_${T}s.jpg"
  echo "![${T}s](frame_${i}_${T}s.jpg)" >> "$REPORT"
done

echo; cat "$REPORT" | sed -n '1,20p'
[ "$FAILS" = 0 ] && echo "QC 全部通过" || { echo "QC 有 ${FAILS} 项 FAIL"; exit 1; }
