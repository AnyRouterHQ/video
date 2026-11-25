#!/bin/bash
# render_when_free.sh <cmd...> : run one render only after the heavy lock has been free of renders
# (no live holder, or a holder that is not a render) on two checks 3 minutes apart, then leave the
# lock free for 5 minutes afterwards so queued code lanes get in before the next render.
H=/tmp/anyr-heavy.holder
render_holds() {
  read -r pid _ cmd < "$H" 2>/dev/null || return 1
  kill -0 "$pid" 2>/dev/null || return 1
  case "$cmd" in *"remotion render"*|*stills.mjs*|*ffmpeg*) return 0 ;; *) return 1 ;; esac
}
ok=0
while [ "$ok" -lt 2 ]; do
  if render_holds; then ok=0; else ok=$((ok + 1)); fi
  [ "$ok" -lt 2 ] && sleep 180
done
echo "lock free of renders on two checks, starting: $* ($(date +%T))"
"$@"; rc=$?
echo "finished rc=$rc ($(date +%T)); leaving the lock free for 5 minutes"
sleep 300
exit $rc
