#!/bin/bash
# still1.sh <comp> <out dir> <frames> : a few stills at half scale (heavy lock), for spot checks
cd "$(dirname "$0")/remotion"
CHROME=$(ls ~/.cache/hyperframes/chrome/chrome-headless-shell/*/*/chrome-headless-shell | head -1) NODE_OPTIONS=--max-old-space-size=2048 "${HEAVY:-$HOME/project/anyrouter-dev/anyrouter/scripts/heavy.sh}" heavy -- node stills.mjs "$1" "../$2" "$3" 0.5 2>&1 | tail -1
