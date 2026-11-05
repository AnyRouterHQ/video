#!/bin/bash
# render_d4.sh : d4 at 1080p then 4K, both cuts, plus a music-free master of each (same silent video, VO + SFX only).
# Renders go through heavy.sh inside batch.sh (one at a time).
cd "$(dirname "$0")" || exit 1
for pid in main short; do audio/master.sh audio/$pid-nomusic.wav audio/$pid-nomusic.m.wav >/dev/null; done
for spec in "main-16x9c 1 d4" "short-9x16c 1 d4" "main-16x9c 2 d4-4k" "short-9x16c 2 d4-4k"; do
  set -- $spec; comp=$1; lab=$3; pid=${comp%%-*}
  ./batch.sh $comp $2 $lab || exit 1
  ./finish.sh out/silent/$comp-$lab.silent.mp4 audio/$pid-nomusic.m.wav out/$comp-$lab-nomusic.mp4 > out/$comp-$lab-nomusic.loud.txt
  echo "$comp $lab done $(date +%T)"
done
