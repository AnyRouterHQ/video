"""fit_music.py <pid> <bars> <at_s> : lengthen music/<pid>.raw.wav by repeating <bars> whole bars that start at <at_s>,
so the track's own ending lands on the close. The loop length is the lag (near <bars> bars at ~118 BPM) where the audio
best matches itself, found by cross-correlation, so the jump back is on the beat. Writes music/<pid>.wav."""
import sys, numpy as np, soundfile as sf
pid, bars, at = sys.argv[1], int(sys.argv[2]), float(sys.argv[3])
D = __file__.rsplit("/", 1)[0] + "/music"
m, sr = sf.read(f"{D}/{pid}.raw.wav"); mono = m.mean(1)
a = int(at * sr); w = int(1.5 * sr)

def score(L): x, y = mono[a:a + w], mono[a + L:a + L + w]; return float(np.dot(x, y) / (np.linalg.norm(x) * np.linalg.norm(y) + 1e-12))
est = bars * 4 * 60 / 118 * sr
best = max(range(int(est * .9), int(est * 1.1), 48), key=score)              # 1 ms coarse grid
best = max(range(best - 48, best + 49), key=score)                           # sample-exact
x = int(.03 * sr); fade = np.linspace(0, 1, x)[:, None]
head, loop, tail = m[:a + best], m[a:a + best], m[a + best:]
join1 = head[-x:] * (1 - fade) + loop[:x] * fade                              # 30 ms crossfades at both joins
out = np.concatenate([head[:-x], join1, loop[x:-x], loop[-x:] * (1 - fade) + tail[:x] * fade, tail[x:]])
sf.write(f"{D}/{pid}.wav", out, sr, subtype="PCM_24")
print(pid, "loop", round(best / sr, 3), "s", "corr", round(score(best), 3), "new length", round(len(out) / sr, 2))
