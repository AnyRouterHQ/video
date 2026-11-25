#!/bin/bash
# contact.sh <video.mp4> <out.png> [n=15] [cols=5] [w=480]: n evenly spaced frames, one sheet
V="$1"; O="$2"; N=${3:-15}; C=${4:-5}; W=${5:-480}
F=/usr/lib/jellyfin-ffmpeg; D=$($F/ffprobe -v error -show_entries format=duration -of csv=p=0 "$V")
T=$(mktemp -d /tmp/contact.XXXXXX); i=0
for t in $(python3 -c "d=$D;n=$N;print(' '.join(f'{(k+0.5)*d/n:.2f}' for k in range(n)))"); do $F/ffmpeg -hide_banner -loglevel error -ss $t -i "$V" -frames:v 1 $T/f$(printf %02d $i).png; i=$((i+1)); done
python3 "$(dirname "$0")/sheet.py" "$O" $C $W $T/f*.png; cp -r /dev/null /dev/null 2>&1; echo "$O"
