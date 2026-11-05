#!/bin/bash
cd "$(dirname "$0")"
./batch.sh hero A 16x9 1 1080p
./batch.sh hero A 9x16 1 1080p 12 6 250
./batch.sh hero A 16x9 2 4k 12 4 420
./batch.sh hero A 9x16 2 4k 12 6 250
for e in 1 2 3 4 5 6 7; do ./batch.sh ep$e A 9x16 1 1080p 8 8 200; ./batch.sh ep$e A 16x9 1 1080p 8 4 420; done
./batch.sh hero B 16x9 1 1080p
echo ALLDONE >> out/summary.txt
