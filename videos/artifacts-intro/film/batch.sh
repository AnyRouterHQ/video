#!/bin/bash
# batch.sh <comp> <scale> <label> : render silent video, master + mux audio, contact sheet. Render serialized by heavy.sh.
cd "$(dirname "$0")"
comp=$1; sc=$2; lab=$3; pid=${comp%%-*}
sil=out/$comp-$lab.silent.mp4; fin=out/$comp-$lab.mp4
[ -f audio/$pid-kinetic.m.wav ] && [ audio/$pid-kinetic.m.wav -nt audio/$pid-kinetic.wav ] || audio/master.sh audio/$pid-kinetic.wav audio/$pid-kinetic.m.wav >/dev/null
remotion/render.sh $comp $sc ../$sil > out/$comp-$lab.log 2>&1
./finish.sh $sil audio/$pid-kinetic.m.wav $fin > out/$comp-$lab.loud.txt
mkdir -p out/silent; mv $sil out/silent/
./contact.sh $fin out/$comp-$lab.contact.png 15 5 384 >/dev/null 2>&1
echo "$fin $(du -h $fin | cut -f1) $(cat out/$comp-$lab.loud.txt)" >> out/summary.txt
