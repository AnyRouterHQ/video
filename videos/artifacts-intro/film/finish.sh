#!/bin/bash
# finish.sh <silent.mp4> <master.wav> <out.mp4> : mux AAC 320k, then report LUFS/true peak of the final file
F=/usr/lib/jellyfin-ffmpeg/ffmpeg
$F -hide_banner -loglevel error -y -i "$1" -i "$2" -c:v copy -af lowpass=f=15000 -c:a libfdk_aac -b:a 320k -ar 48000 -movflags +faststart -shortest "$3"
$F -hide_banner -nostats -i "$3" -af ebur128=peak=true -f null - 2>&1 | grep -E '^\s+(I|Peak):' | tail -2 | tr '\n' ' '; echo
