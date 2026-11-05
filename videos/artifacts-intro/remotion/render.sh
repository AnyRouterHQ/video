#!/bin/bash
# render.sh <comp> <scale> <out.mp4 (silent)>   one render at a time, via heavy.sh
export CHROME=$(ls ~/.cache/hyperframes/chrome/chrome-headless-shell/*/*/chrome-headless-shell | head -1)
cd "$(dirname "$0")"
NODE_OPTIONS=--max-old-space-size=2048 "${HEAVY:-$HOME/project/anyrouter-dev/anyrouter/scripts/heavy.sh}" heavy -- npx remotion render src/index.ts "$1" "$3" --scale "$2" --codec h264 --crf ${CRF:-16} --pixel-format yuv420p --browser-executable "$CHROME" --concurrency 1 --muted --image-format ${FMT:-jpeg} --log=warn 2>&1 | grep -v -E 'heavy.sh|close-done|^\s+at |mainPath|not inside|^\s*\^|^$|Node.js'
