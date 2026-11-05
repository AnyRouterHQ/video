#!/bin/bash
# render_d5.sh : d5 (age said once, on the title: "AnyRouter turns 3 months") at 1080p for both cuts and 4K for main,
# plus a music-free master of each (same silent video, VO + SFX only). Renders go through heavy.sh inside batch.sh.
cd "$(dirname "$0")" || exit 1
for pid in main short; do audio/master.sh audio/$pid-nomusic.wav audio/$pid-nomusic.m.wav >/dev/null; done
for spec in "main-16x9c 1 d5" "short-9x16c 1 d5" "main-16x9c 2 d5-4k"; do
  set -- $spec; comp=$1; lab=$3; pid=${comp%%-*}
  ./batch.sh $comp $2 $lab || exit 1
  ./finish.sh out/silent/$comp-$lab.silent.mp4 audio/$pid-nomusic.m.wav out/$comp-$lab-nomusic.mp4 > out/$comp-$lab-nomusic.loud.txt
  echo "$comp $lab done $(date +%T)"
done
