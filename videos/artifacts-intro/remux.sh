#!/bin/bash
# remux.sh : rebuild every finished mp4 from out/silent/*.silent.mp4 and the mastered wav
cd "$(dirname "$0")"
for s in out/silent/*.silent.mp4; do
  b=$(basename $s .silent.mp4); id=${b%%-*}; rest=${b#*-}; take=${rest%%-*}; style=kinetic; [ $take = B ] && style=calm
  ./finish.sh $s audio/$id-$style.m.wav out/$b.mp4 | sed "s#^#$b #"
done
