#!/bin/bash
cd "$(dirname "$0")"
until grep -q ALLDONE out/summary.txt; do sleep 10; done
CRF=12 FMT=png ./batch.sh hero A 16x9 2 4k 12 4 420
CRF=12 FMT=png ./batch.sh hero A 9x16 2 4k 12 6 250
echo 4KDONE >> out/summary.txt
