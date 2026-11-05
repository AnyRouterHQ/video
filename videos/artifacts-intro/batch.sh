#!/bin/bash
# batch.sh <id> <take A|B> <aspect> <scale> <label>   one job: render, mux, contact sheet. Serialized by heavy.sh.
cd "$(dirname "$0")"
id=$1; take=$2; asp=$3; sc=$4; lab=$5
style=kinetic; [ $take = B ] && style=calm
comp=$id-$take-$asp; sil=out/$comp-$lab.silent.mp4; fin=out/$comp-$lab.mp4
[ -f audio/$id-$style.m.wav ] || audio/master.sh audio/$id-$style.wav audio/$id-$style.m.wav >/dev/null
remotion/render.sh $comp $sc ../$sil > out/$comp-$lab.log 2>&1
./finish.sh $sil audio/$id-$style.m.wav $fin > out/$comp-$lab.loud.txt
mkdir -p out/silent; mv $sil out/silent/
./contact.sh $fin out/$comp-$lab.contact.png ${6:-12} ${7:-4} ${8:-420} >/dev/null 2>&1
echo "$fin $(du -h $fin | cut -f1) $(cat out/$comp-$lab.loud.txt)" >> out/summary.txt
