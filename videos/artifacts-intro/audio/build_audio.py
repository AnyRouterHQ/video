"""python build_audio.py <id> <style kinetic|calm>  -> audio/<id>-<style>.wav (pre-loudnorm) + public/<id>.timeline.json
Everything here is synthesized in numpy (no samples, no library music): no licence or Content ID exposure."""
import json, sys, os, hashlib, math, shutil
import numpy as np, soundfile as sf
SR = 48000
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
VO_DIR = f"{ROOT}/audio/vo-cache"; os.makedirs(VO_DIR, exist_ok=True)
VOICE, SPEED = "af_heart", 1.1
prods = json.load(open(f"{ROOT}/content/productions.json"))

def key(say): return hashlib.sha1(f"{VOICE}|{SPEED}|{say}".encode()).hexdigest()[:16]

def ensure_vo(ids):
    todo = {}
    for i in ids:
        for l in prods[i]["lines"]:
            p = f"{VO_DIR}/{key(l['say'])}.wav"
            if not os.path.exists(p): todo[p] = l["say"]
    if not todo: return
    import kokoro_onnx
    k = kokoro_onnx.Kokoro(os.path.expanduser("~/.cache/hyperframes/tts/models/kokoro-v1.0.onnx"), os.path.expanduser("~/.cache/hyperframes/tts/voices/voices-v1.0.bin"))
    for p, say in todo.items():
        s, sr = k.create(say, voice=VOICE, speed=SPEED); sf.write(p, s, sr)
        print("tts", say[:40], round(len(s)/sr, 2), flush=True)

def timeline(pid):
    P = prods[pid]; beat = 60 / P["bpm"]; grid = beat / 2
    snap = lambda t: math.ceil(t / grid - 1e-6) * grid
    t = snap(0.2); lines = []
    for l in P["lines"]:
        w, sr = sf.read(f"{VO_DIR}/{key(l['say'])}.wav"); dur = len(w) / sr
        lines.append({"say": l["say"], "start": t, "dur": dur, "scenes": [dict(s) for s in l["scenes"]], "w": l.get("w"), "wav": f"{key(l['say'])}.wav"})
        t = snap(t + dur + P.get('gap', 0.45))
    last = lines[-1]; total = snap(last["start"] + last["dur"] + P["tail"]); total = math.ceil(total / (beat * 4) - 1e-6) * beat * 4
    for i, l in enumerate(lines):
        end = lines[i + 1]["start"] if i + 1 < len(lines) else total
        n = len(l["scenes"]); ws = l["w"] or [1 / n] * n
        cum = 0; edges = [l["start"]]
        for x in ws[:-1]:
            cum += x; edges.append(snap(l["start"] + cum * (end - l["start"])))
        edges.append(end)
        for j, s in enumerate(l["scenes"]): s["start"], s["end"] = edges[j], edges[j + 1]
        l["end"] = end
    return {"id": pid, "fps": 30, "bpm": P["bpm"], "total": total, "voEnd": last["start"] + last["dur"], "lines": lines}

# ---------- synth ----------
rng = np.random.default_rng(7)
def env(n, a=0.002, d=0.1): t = np.arange(n) / SR; return np.minimum(t / a, 1) * np.exp(-t / d)
def mix_at(buf, x, t, g=1.0):
    i = int(t * SR); 
    if i >= len(buf): return
    x = x[: len(buf) - i]; buf[i:i + len(x)] += x * g
def hp(x): return np.concatenate([[0], np.diff(x)])
def lp(x, k): 
    c = np.cumsum(np.insert(x, 0, 0)); y = (c[k:] - c[:-k]) / k; return np.concatenate([np.full(k - 1, y[0]), y])
def kick():
    n = int(.28 * SR); t = np.arange(n) / SR; f = 46 + 90 * np.exp(-t * 28); ph = 2 * np.pi * np.cumsum(f) / SR
    return (np.sin(ph) * np.exp(-t * 11) + 0.25 * hp(rng.standard_normal(n)) * np.exp(-t * 300)) 
def hat(o=False):
    n = int((.16 if o else .045) * SR); return hp(rng.standard_normal(n)) * np.exp(-np.arange(n) / SR / (.05 if o else .012)) * .5
def clap():
    n = int(.22 * SR); x = np.zeros(n)
    for off in (0, .011, .022): i = int(off * SR); m = n - i; x[i:] += hp(lp(rng.standard_normal(m), 3)) * np.exp(-np.arange(m) / SR / .006)
    return x * 1.2 * np.exp(-np.arange(n) / SR / .09)
def bell(f, d=.9, bright=1.0):
    n = int(d * SR); t = np.arange(n) / SR
    return (np.sin(2*np.pi*f*t) + .35*bright*np.sin(2*np.pi*f*2.76*t)*np.exp(-t*9) + .2*np.sin(2*np.pi*f*5.4*t)*np.exp(-t*14)) * env(n, .002, d / 4)
def pluck(f, d=.35):
    n = int(d * SR); t = np.arange(n) / SR
    return (np.sin(2*np.pi*f*t) + .3*np.sin(4*np.pi*f*t) + .12*np.sin(6*np.pi*f*t)) * env(n, .003, d / 3.2)
def bass(f, d):
    n = int(d * SR); t = np.arange(n) / SR; x = np.sin(2*np.pi*f*t) + .4*np.sin(4*np.pi*f*t)
    return np.tanh(x * 1.6) * np.minimum(t / .006, 1) * np.minimum((d - t) / .03, 1).clip(0, 1)
def pad(freqs, d):
    n = int(d * SR); t = np.arange(n) / SR; x = 0
    for f in freqs:
        for dt in (-.4, .4): x = x + np.sin(2*np.pi*(f + dt)*t + rng.uniform(0, 6))
    return x / (len(freqs) * 2) * np.minimum(t / .5, 1) * np.minimum((d - t) / .4, 1).clip(0, 1)
def whoosh(d=.38, up=True):
    n = int(d * SR); t = np.arange(n) / SR; x = rng.standard_normal(n)
    y = np.zeros(n); k = 0
    # swept lowpass by blending box filters
    outs = [lp(x, k) for k in (3, 8, 24, 70)]
    sweep = np.linspace(0, 3, n) if up else np.linspace(3, 0, n)
    for j, o in enumerate(outs): y += o * np.clip(1 - abs(sweep - j), 0, 1)
    return y * np.sin(np.pi * np.clip(t / d, 0, 1)) ** 1.5 * 1.6
def click(): n = int(.03 * SR); return hp(rng.standard_normal(n)) * np.exp(-np.arange(n) / SR / .004) * 1.1
def pop(): 
    n = int(.22 * SR); t = np.arange(n) / SR; return np.sin(2*np.pi*np.cumsum(70 + 180*np.exp(-t*40))/SR) * np.exp(-t*16) * 1.3
def riser(d):
    n = int(d * SR); t = np.arange(n) / SR; ph = 2*np.pi*np.cumsum(220 * 2 ** (t / d * 2.2)) / SR
    return (np.sin(ph) * .5 + hp(lp(rng.standard_normal(n), 2)) * .5) * (t / d) ** 2.2 * np.minimum((d - t) / .02, 1)
def audio_logo():
    """Same 1.3 s signature on every video: C6 - G6 - C7 bell arp over a soft bloom."""
    n = int(1.5 * SR); x = np.zeros(n)
    for i, f in enumerate((1046.5, 1568.0, 2093.0)): mix_at(x, bell(f, 1.2), i * .13, .55)
    mix_at(x, pad([261.6, 392.0, 523.3], 1.4), 0, .35)
    return x
def ding(): return bell(1318.5, 1.0) * .8

CH = [[261.6, 329.6, 392.0], [196.0, 246.9, 392.0], [220.0, 261.6, 329.6], [174.6, 220.0, 261.6]]
ROOTS = [65.4, 49.0, 55.0, 43.65]
def music(tl, style):
    total = tl["total"]; N = int((total + 1) * SR); b = 60 / tl["bpm"]; m = np.zeros(N); step = b / 4
    nb = int(total / b) + 1
    kin = style == "kinetic"
    for s in range(int(total / step) + 1):
        t0 = s * step; bar = int(t0 / (b * 4)); ch = CH[bar % 4]; sixteenth = s % 16
        if kin:
            if sixteenth % 4 == 0 and t0 < total - b * 2: mix_at(m, kick(), t0, .7)
            if sixteenth in (4, 12) and bar >= 1: mix_at(m, clap(), t0, .35)
            if sixteenth % 2 == 0: mix_at(m, hat(sixteenth % 4 == 2), t0, .22)
            if sixteenth % 4 in (0, 2) or sixteenth in (7, 15): mix_at(m, bass(ROOTS[bar % 4] * (2 if sixteenth in (7, 15) else 1), step * 1.6), t0, .4)
            f = ch[(s * 5) % 3] * (2 if s % 8 < 4 else 4); mix_at(m, pluck(f), t0, .2 + .06 * (s % 2))
        else:
            if sixteenth % 8 == 0: mix_at(m, bass(ROOTS[bar % 4], b * 1.8), t0, .4)
            if sixteenth % 4 == 0: mix_at(m, bell(ch[(s // 4) % 3] * 4, .9, .6), t0, .13)
            if sixteenth == 0: mix_at(m, pad(ch, b * 4.2), t0, .5)
            if sixteenth in (6, 14): mix_at(m, hat(False), t0, .12)
    # end chord
    mix_at(m, pad(CH[0] + [523.3], 2.6), total - 2.4, .45 if not kin else .3)
    return m

def duck(n, intervals):
    g = np.ones(n)
    for a, b2 in intervals: g[int(a * SR):int(b2 * SR)] = 0.0
    k = int(.18 * SR); g = lp(g, k)
    return 1 - (1 - g) * 0.62        # music drops to ~ -8.4 dB under voice

def build(pid, style):
    tl = timeline(pid); total = tl["total"]; N = int((total + 1) * SR)
    vo = np.zeros(N); sfx = np.zeros(N)
    for l in tl["lines"]:
        w, sr = sf.read(f"{VO_DIR}/{l['wav']}"); assert sr == SR or True
        if sr != SR: w = np.interp(np.arange(int(len(w) * SR / sr)) / SR, np.arange(len(w)) / sr, w)
        mix_at(vo, w, l["start"], 1.0)
    sfxlog = []
    def S(x, t, g, name): mix_at(sfx, x, t, g); sfxlog.append((round(t, 3), name))
    flat = [(l, s) for l in tl["lines"] for s in l["scenes"]]
    for i, (l, s) in enumerate(flat):
        a, e = s["start"], s["end"]
        if i > 0 and s["t"] != "cta": S(whoosh(.34, True), a - .14, .5, "whoosh")
        if s["t"] == "slam": S(pop(), a + .2, .9, "pop")
        if s["t"] == "term":
            d = e - a; tt = a + d * .08
            for c in range(0, 24): S(click(), tt + c * (d * .42 / 24), .35, "key") if c % 2 == 0 else None
            S(click(), a + d * .52, .6, "enter"); S(ding(), a + d * .72, .55, "ding")
        if s["t"] == "stack": S(pop(), a + .25, .4, "pop"); S(pop(), a + .62 * (e - a) + .12, .6, "click-together")
        if s["t"] == "vis":
            for q in ((0, 1/3, 2/3) if s.get("cycle") else (0,)): S(click(), a + .15 + q * (e - a), .5, "click")
        if s["t"] == "cta":
            S(riser(1.1), a - 1.0, .55, "riser"); S(audio_logo(), a + .05, .8, "audio-logo")
    mus = music(tl, style) * duck(N, [(l["start"] - .05, l["start"] + l["dur"] + .1) for l in tl["lines"]])
    # fade music tail
    f = int(1.0 * SR); mus[int(total * SR) - f: int(total * SR)] *= np.linspace(1, 0, f); mus[int(total * SR):] = 0
    mix = vo * 1.0 + mus * (.5 if style == "kinetic" else .6) + sfx * .55
    mix = np.tanh(mix * 0.9) / 0.9
    out = f"{ROOT}/audio/{pid}-{style}.wav"; sf.write(out, np.stack([mix, mix], 1)[: int(total * SR)], SR, subtype="PCM_24")
    json.dump(tl, open(f"{ROOT}/remotion/public/{pid}.timeline.json", "w"), indent=1)
    json.dump(sfxlog, open(f"{ROOT}/audio/{pid}-{style}.sfx.json", "w"))
    print(pid, style, "total", round(total, 2), "voEnd", round(tl["voEnd"], 2), "sfx", len(sfxlog), flush=True)

if __name__ == "__main__":
    ids = sys.argv[1].split(","); ids = list(prods) if ids == ["all"] else ids
    ensure_vo(ids)
    for i in ids: build(i, sys.argv[2] if len(sys.argv) > 2 else "kinetic")
