#!/bin/bash
# master.sh <in.wav> <out.wav> : two-pass loudnorm to -14 LUFS, TP -1.5
F=/usr/lib/jellyfin-ffmpeg/ffmpeg
J=$($F -hide_banner -nostats -i "$1" -af alimiter=limit=0.8:attack=2:release=60,loudnorm=I=-13.8:TP=${3:--3.0}:LRA=11:print_format=json -f null - 2>&1 | sed -n '/^{/,/^}/p')
g(){ echo "$J" | python3 -c "import json,sys;print(json.load(sys.stdin)['$1'])"; }
$F -hide_banner -loglevel error -y -i "$1" -af "alimiter=limit=0.8:attack=2:release=60,loudnorm=I=-13.8:TP=${3:--3.0}:LRA=11:measured_I=$(g input_i):measured_TP=$(g input_tp):measured_LRA=$(g input_lra):measured_thresh=$(g input_thresh):offset=$(g target_offset):linear=true" -ar 48000 -c:a pcm_s24le "$2"
$F -hide_banner -nostats -i "$2" -af ebur128=peak=true -f null - 2>&1 | grep -E 'I:|Peak:' | tail -2
