#!/bin/bash
# probe.sh <mp4> : integrated loudness and true peak of the mp4's audio
/usr/lib/jellyfin-ffmpeg/ffmpeg -hide_banner -nostats -i "$1" -af ebur128=peak=true -f null - 2>&1 | grep -E '^\s+(I|Peak):' | tail -2 | tr '\n' ' '; echo
