"""duck_check.py <pid> : music level vs the voice, per voiced line and in the lifted (no-voice) spans.
music = <pid>-kinetic.wav - <pid>-nomusic.wav (pre-master mixes, same VO and SFX)."""
import json, sys, numpy as np, soundfile as sf
R = __file__.rsplit("/", 2)[0]; pid = sys.argv[1]
a, sr = sf.read(f"{R}/audio/{pid}-kinetic.wav"); b, _ = sf.read(f"{R}/audio/{pid}-nomusic.wav")
mus = (a - b).mean(1); vo = b.mean(1)
tl = json.load(open(f"{R}/remotion/public/{pid}.timeline.json"))
db = lambda x: 20 * np.log10(np.sqrt(np.mean(x ** 2)) + 1e-12)
for l in tl["lines"]:
    s, e = int((l["start"] + .3) * sr), int((l["start"] + l["dur"] - .1) * sr)
    if l["wav"]: print(f'{l["id"]:9s} {l["start"]:5.1f}s  music vs voice {db(mus[s:e]) - db(vo[s:e]):6.1f} dB')
    else: print(f'{l["id"]:9s} {l["start"]:5.1f}s  (no voice) music {db(mus[s:e]):6.1f} dBFS')
v = np.concatenate([vo[int(l["start"] * sr):int((l["start"] + l["dur"]) * sr)] for l in tl["lines"] if l["wav"]])
s = int((tl["voEnd"] + .3) * sr); print(f'close tail music {db(mus[s:s + sr]):.1f} dBFS, voice avg {db(v):.1f} dBFS')
