#!/bin/bash
# stills.sh <round>   key-frame stills for main-16x9c and short-9x16c at half scale, plus contact sheets
cd "$(dirname "$0")/remotion"
export CHROME=$(ls ~/.cache/hyperframes/chrome/chrome-headless-shell/*/*/chrome-headless-shell | head -1)
R=$1; M=$(grep main ../review/frames.txt | cut -d' ' -f2); S=$(grep short ../review/frames.txt | cut -d' ' -f2)
NODE_OPTIONS=--max-old-space-size=2048 "${HEAVY:-$HOME/project/anyrouter-dev/anyrouter/scripts/heavy.sh}" heavy -- bash -c "node stills.mjs main-16x9c ../review/$R $M 0.5 && node stills.mjs short-9x16c ../review/${R}v $S 0.5" 2>&1 | grep -v -E '^\s+at |heavy.sh: waiting' | tail -5
cd ..; python3 sheet.py review/$R-sheet.png 3 640 $(ls review/$R/*.png | sort -t- -k3 -n); python3 sheet.py review/${R}v-sheet.png 5 300 $(ls review/${R}v/*.png | sort -t- -k3 -n)
