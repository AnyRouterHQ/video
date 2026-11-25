#!/bin/bash
# render_d5_short4k.sh : the 9:16 short at 4K (scale 2), plus its music-free master. Run after render_d5.sh.
cd "$(dirname "$0")" || exit 1
./batch.sh short-9x16c 2 d5-4k || exit 1
./finish.sh out/silent/short-9x16c-d5-4k.silent.mp4 audio/short-nomusic.m.wav out/short-9x16c-d5-4k-nomusic.mp4 > out/short-9x16c-d5-4k-nomusic.loud.txt
echo "short-9x16c d5-4k done $(date +%T)"
