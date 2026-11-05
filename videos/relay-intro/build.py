"""Write index.html for one aspect: python3 build.py 9x16|16x9 <narration.json> <segments.json> <words.json>"""
import json, math, re, sys

V = sys.argv[1] == "9x16"
NAR = json.load(open(sys.argv[2]))
SEG = json.load(open(sys.argv[3]))
WORDS = json.load(open(sys.argv[4]))
W, H = (1080, 1920) if V else (1920, 1080)
AUDIO = SEG[-1]["end"]
DUR = round(AUDIO + 1.6, 2)

INK, MUTED, PAPER, LINE, ACC = "#0a0a0a", "#52525b", "#fafaf9", "#d6d3d1", "#c2410c"
TONES = {
    "stone": ("#ffffff", "#e7e5e4", "#d6d3d1"),
    "dark": ("#3f3f46", "#27272a", "#18181b"),
    "accent": ("#fb923c", "#ea580c", "#c2410c"),
    "pad": ("#f5f5f4", "#e7e5e4", "#d6d3d1"),
}


def scene_start(name):
    return next(s["start"] for s, n in zip(SEG, NAR) if n["scene"] == name)


def line_start(text):
    return next(s["start"] for s, n in zip(SEG, NAR) if n["show"].startswith(text))


def word_time(word, after=0.0):
    w = word.lower()
    return next(x["start"] for x in WORDS if x["start"] >= after and x["text"].lower().strip(".,'") .startswith(w))


T = {n: scene_start(n) for n in ["hook", "problem", "command", "flow", "only", "compare", "cta"]}
SCENES = ["hook", "problem", "command", "flow", "compare", "cta"]
BOUNDS = [(n, max(0, T[n] - 0.25), (T[SCENES[i + 1]] - 0.25) if i + 1 < len(SCENES) else DUR) for i, n in enumerate(SCENES)]

# ---------- isometric kit ----------
C30, S30 = math.cos(math.pi / 6), 0.5


def P(x, y, z, k=1.0):
    return ((x - y) * C30 * k, (x + y) * S30 * k - z * k)


def poly(pts, fill, extra=""):
    d = " ".join(f"{a:.1f},{b:.1f}" for a, b in pts)
    return f'<polygon points="{d}" fill="{fill}" stroke="{INK}" stroke-width="1.6" stroke-linejoin="round" {extra}/>'


def box(x, y, z, w, d, h, tone="stone", extra=""):
    top, left, right = TONES[tone] if isinstance(tone, str) else tone
    t = [P(x, y, z + h), P(x + w, y, z + h), P(x + w, y + d, z + h), P(x, y + d, z + h)]
    l = [P(x, y + d, z), P(x + w, y + d, z), P(x + w, y + d, z + h), P(x, y + d, z + h)]
    r = [P(x + w, y, z), P(x + w, y + d, z), P(x + w, y + d, z + h), P(x + w, y, z + h)]
    return f"<g {extra}>" + poly(l, left) + poly(r, right) + poly(t, top) + "</g>"


def topface_text(x, y, z, txt, size=7, fill=INK, weight=600, mono=False):
    # text lying on a top face, sheared into the iso plane along +x
    sx, sy = P(x, y, z)
    fam = "Geist Mono" if mono else "Geist"
    return (f'<text transform="translate({sx:.1f},{sy:.1f}) matrix({C30:.4f},{S30:.4f},{-C30:.4f},{S30:.4f},0,0)" '
            f'font-family="{fam}" font-size="{size}" font-weight="{weight}" fill="{fill}">{txt}</text>')


def rface_text(x, y, z, txt, size=6, fill=INK, weight=600):
    # text on a +x facing side, running along +y
    sx, sy = P(x, y, z)
    return (f'<text transform="translate({sx:.1f},{sy:.1f}) matrix({-C30:.4f},{S30:.4f},0,1,0,0)" '
            f'font-family="Geist" font-size="{size}" font-weight="{weight}" fill="{fill}">{txt}</text>')


def lface_text(x, y, z, txt, size=6, fill=INK, weight=600):
    # text on a +y facing side, running along +x
    sx, sy = P(x, y, z)
    return (f'<text transform="translate({sx:.1f},{sy:.1f}) matrix({C30:.4f},{S30:.4f},0,1,0,0)" '
            f'font-family="Geist" font-size="{size}" font-weight="{weight}" fill="{fill}">{txt}</text>')


def logo_on_top(x, y, z, href, s):
    sx, sy = P(x, y, z)
    return (f'<image href="{href}" width="{s}" height="{s}" '
            f'transform="translate({sx:.1f},{sy:.1f}) matrix({C30:.4f},{S30:.4f},{-C30:.4f},{S30:.4f},0,0)"/>')


def logo_on_left(x, y, z, href, s):
    sx, sy = P(x, y, z)
    return (f'<image href="{href}" width="{s}" height="{s}" '
            f'transform="translate({sx:.1f},{sy:.1f}) matrix({C30:.4f},{S30:.4f},0,1,0,0)"/>')


# ---------- the relay bench ----------
# world: requests travel along +x. Units are arbitrary; the svg viewBox is fitted below.
parts, labels, anchors = [], [], {}


def station_base(x, y, w, d, name):
    parts.append(box(x - 4, y - 4, 0, w + 8, d + 8, 3, "pad", f'id="base-{name}"'))


# 1. app: a laptop
station_base(0, 0, 36, 30, "app")
parts.append(box(2, 6, 3, 32, 22, 2, "stone"))                       # deck
for i in range(4):
    for j in range(8):
        parts.append(box(5 + j * 3.4, 9 + i * 3.6, 5, 2.4, 2.4, 0.6, "pad"))
parts.append(box(2, 4, 5, 32, 2, 22, "dark"))                         # screen back
anchors["app"] = P(18, 15, 30)

# 2. key: a key card in a reader slot
station_base(60, 2, 30, 26, "key")
parts.append(box(62, 6, 3, 26, 18, 8, "stone"))                        # reader
parts.append(box(66, 12, 11, 18, 3, 1, "dark"))                        # slot
parts.append(box(67, 12.5, 12, 16, 2, 14, "accent", 'id="keycard"'))    # card
parts.append(lface_text(68.5, 14.5, 22, "sk-ar-v1", 3.4, "#0a0a0a", 700))
anchors["key"] = P(75, 13, 30)

# 3. edge: anyrouter tower
station_base(112, -2, 38, 34, "edge")
parts.append(box(114, 0, 3, 34, 30, 6, "stone"))
parts.append(box(118, 4, 9, 26, 22, 30, "stone", 'id="edge-tower"'))
for i in range(5):
    parts.append(box(118, 26, 13 + i * 5, 26, 0.01, 0.8, "pad"))
parts.append(logo_on_top(125, 8, 39, "assets/anyrouter-logo-black.svg", 12))
anchors["edge"] = P(131, 15, 44)

# 4. tunnel: a sleeved pipe from the edge to the Mac
TX0, TX1, TY = 148, 236, 12
for k in range(TX0, TX1, 8):
    parts.append(box(k, TY, 16, 8, 6, 6, "dark"))
    parts.append(box(k + 6.6, TY - 0.6, 15.4, 1.4, 7.2, 7.2, "accent"))
anchors["tunnel"] = P((TX0 + TX1) / 2, TY + 3, 26)

# 5. your Mac: a Mac mini on its pad
station_base(240, -6, 46, 42, "mac")
parts.append(box(242, -4, 3, 42, 38, 12, "stone", 'id="mac-body"'))
parts.append(box(244, -2, 15, 38, 34, 0.6, "pad"))
parts.append(logo_on_top(258, 10, 15.8, "assets/apple.svg", 10))
parts.append(box(250, 34, 6, 6, 0.01, 2, "dark"))
anchors["mac"] = P(263, 15, 16)

# 6. engines on the Mac, fanned along y
ENG = [("apple.svg", "Apple FM"), ("perplexity-color.svg", "Decider"), ("ollama.svg", "Ollama"), (None, "LM Studio")]
for i, (logo, name) in enumerate(ENG):
    ex, ey = 302, -30 + i * 26
    parts.append(f'<g id="eng{i}" class="eng">' + box(ex, ey, 0, 22, 18, 3, "pad")
                 + box(ex + 2, ey + 2, 3, 18, 14, 9, "stone") + "</g>")
    if logo:
        parts.append(logo_on_top(ex + 6, ey + 4, 12, f"assets/{logo}", 8))
    lx, ly = P(ex + 22, ey + 18, 0)
    parts.append(f'<text x="{lx + 3:.1f}" y="{ly + 2:.1f}" font-family="Geist" font-size="6.5" font-weight="700" fill="{INK}">{name}</text>')
    anchors[f"eng{i}"] = P(ex + 11, ey + 9, 12)
    # short lead from Mac to engine
    parts.append(f'<path d="M{P(284, 15, 8)[0]:.1f},{P(284, 15, 8)[1]:.1f} L{P(ex + 2, ey + 9, 6)[0]:.1f},{P(ex + 2, ey + 9, 6)[1]:.1f}" '
                 f'stroke="{INK}" stroke-width="1.2" fill="none" stroke-dasharray="2 2" opacity=".55"/>')

# the request path (screen coords) used by packets
PATH_OUT = [P(18, 15, 14), P(70, 15, 14), P(131, 15, 14), P(TX0, TY + 3, 19), P(TX1, TY + 3, 19), P(263, 15, 16), P(313, 11, 12)]

# fit viewBox
pts = [tuple(map(float, m)) for m in re.findall(r"(-?\d+\.?\d*),(-?\d+\.?\d*)", " ".join(parts))]
xs, ys = [p[0] for p in pts], [p[1] for p in pts]
PAD = 14
VB = (min(xs) - PAD, min(ys) - PAD - 20, max(xs) - min(xs) + 2 * PAD + 40, max(ys) - min(ys) + 2 * PAD + 20)

# step pills floating above stations (in svg coords)
STEPS = [("app", "1  your app"), ("key", "2  your key"), ("edge", "3  edge"), ("tunnel", "4  tunnel"), ("mac", "5  your Mac")]
for i, (a, txt) in enumerate(STEPS):
    x, y = anchors[a]
    y -= 14 if a != "mac" else 30
    w = 7 + len(txt) * 3.6
    labels.append(f'<g class="pill" id="pill{i}" opacity="0.25"><rect x="{x - w / 2:.1f}" y="{y - 7:.1f}" width="{w:.1f}" height="11" rx="5.5" fill="#ffffff" stroke="{INK}" stroke-width="1"/>'
                  f'<text x="{x:.1f}" y="{y + 1:.1f}" text-anchor="middle" font-family="Geist" font-size="6" font-weight="700" fill="{INK}">{txt}</text></g>')

packets = "".join(f'<circle class="pk" id="pk{i}" r="3.2" fill="{ACC}" stroke="#fff" stroke-width="1" opacity="0"/>' for i in range(3))
back = "".join(f'<circle class="bk" id="bk{i}" r="2.6" fill="#16a34a" stroke="#fff" stroke-width="1" opacity="0"/>' for i in range(6))
ghosts = "".join(f'<g id="gh{i}" opacity="0"><circle r="3.2" fill="#a1a1aa" stroke="#fff" stroke-width="1"/></g>' for i in range(2))
BENCH = (f'<svg id="bench" viewBox="{VB[0]:.1f} {VB[1]:.1f} {VB[2]:.1f} {VB[3]:.1f}" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">'
         + "".join(parts) + "".join(labels) + ghosts + packets + back + "</svg>")

# ---------- captions ----------
def chunks(text, n):
    ws = text.split()
    k = max(1, math.ceil(len(ws) / n))
    size = math.ceil(len(ws) / k)
    return [" ".join(ws[i:i + size]) for i in range(0, len(ws), size)]


CAPS = []
for s, n in zip(SEG, NAR):
    if n["scene"] in ("command",) and n["show"].startswith("anyr"):
        continue  # the terminal shows the command itself
    if n["show"].startswith("anyr upgrade") or n["show"] == "anyrouter.dev":
        continue
    parts_ = chunks(n["show"], 10 if V else 14)
    span = [w for w in WORDS if s["start"] - 0.15 <= w["start"] < s["end"] + 0.05]
    total = sum(len(p.split()) for p in parts_)
    idx = 0
    for j, p in enumerate(parts_):
        a = span[min(len(span) - 1, round(idx * len(span) / total))]["start"] if span else s["start"]
        idx += len(p.split())
        b = span[min(len(span) - 1, round(idx * len(span) / total) - 1)]["end"] if span and j < len(parts_) - 1 else s["end"]
        CAPS.append((round(max(a, s["start"]), 2), round(b + 0.12, 2), p))
for i in range(len(CAPS) - 1):  # no overlap
    a, b, p = CAPS[i]
    CAPS[i] = (a, min(b, CAPS[i + 1][0]), p)

cap_html = "".join(f'<div class="capline" id="cap{i}">{p}</div>' for i, (_, _, p) in enumerate(CAPS))

# ---------- layout ----------
if V:
    TITLE = "left:80px;right:80px;top:170px;text-align:center"
    FIG = "left:30px;right:30px;top:470px;height:880px"
    CAPBOX = "left:70px;right:70px;top:1400px;height:200px"
    T1, T2, CS = 96, 46, 54
else:
    TITLE = "left:110px;right:110px;top:70px;text-align:left"
    FIG = "left:90px;right:90px;top:230px;height:640px"
    CAPBOX = "left:200px;right:200px;top:915px;height:120px"
    T1, T2, CS = 76, 36, 44

# compare panel content
CMP_Q = "Which queue should this ticket go to?"
CMP_OPTS = ["billing", "bug", "sales"]
CMP = [
    dict(tag="Your Mac", model="perplexity/pplx-decider-flash-v1.2", logo="perplexity-color.svg", probs=[0.81, 0.14, 0.05], ms=1),
    dict(tag="Hosted", model="typesafe/jev", logo="typesafe-color.svg", probs=[0.77, 0.17, 0.06], ms=2),
]


def cmp_col(i, c):
    rows = "".join(
        f'<div class="opt"><span>{o}</span><div class="bar"><i id="b{i}{j}" data-w="{p * 100:.0f}"></i></div><b>{p:.2f}</b></div>'
        for j, (o, p) in enumerate(zip(CMP_OPTS, c["probs"])))
    return (f'<div class="col" id="col{i}"><div class="colhead"><img src="assets/{c["logo"]}"><div><div class="tag">{c["tag"]}</div>'
            f'<div class="mid">{c["model"]}</div></div></div>{rows}'
            f'<div class="time"><span>time</span><div class="tbar"><i id="t{i}"></i></div><b id="tl{i}"></b></div></div>')


CMP_HTML = (f'<div class="cmp"><div class="q">Choice · {CMP_Q}</div><div class="cols">{cmp_col(0, CMP[0])}{cmp_col(1, CMP[1])}</div>'
            f'<div class="agree" id="agree">Agreement: both pick <b>billing</b></div>'
            f'<div class="note">Preview with sample numbers. Your timings depend on your Mac and network.</div></div>')

css = f"""
@font-face{{font-family:"Geist";font-weight:100 900;font-display:block;src:url("assets/geist.woff2") format("woff2-variations")}}
@font-face{{font-family:"Geist Mono";font-weight:100 900;font-display:block;src:url("assets/geist-mono.woff2") format("woff2-variations")}}
*{{margin:0;padding:0;box-sizing:border-box}}
html,body{{width:{W}px;height:{H}px;overflow:hidden;background:{PAPER}}}
#root{{position:relative;width:{W}px;height:{H}px;overflow:hidden;background:{PAPER};color:{INK};font-family:"Geist",sans-serif}}
.grid{{position:absolute;inset:0;background-image:radial-gradient(#d6d3d1 1.4px,transparent 1.4px);background-size:36px 36px;opacity:.55}}
.s{{position:absolute;inset:0;opacity:0}}
.title{{position:absolute;{TITLE};font-weight:700;font-size:{T1}px;line-height:1.04;letter-spacing:-0.035em}}
.title .sub{{display:block;font-weight:500;font-size:{T2}px;line-height:1.25;letter-spacing:-0.01em;color:{MUTED};margin-top:22px}}
.acc{{color:{ACC}}}
.fig{{position:absolute;{FIG}}}
.card{{position:absolute;{FIG};border:2px solid #e7e5e4;border-radius:28px;background:#fff;box-shadow:0 24px 70px rgba(0,0,0,.08)}}
.cardhead{{position:absolute;left:28px;right:28px;top:20px;display:flex;justify-content:space-between;font:600 {26 if V else 22}px/1 "Geist Mono",monospace;color:{MUTED}}}
.readout{{color:{ACC}}}
.benchwrap{{position:absolute;left:10px;right:10px;top:{70 if V else 60}px;bottom:20px}}
.caps{{position:absolute;{CAPBOX};display:flex;align-items:center;justify-content:center;text-align:center}}
.capline{{position:absolute;left:0;right:0;opacity:0;font-weight:650;font-size:{CS}px;line-height:1.18;letter-spacing:-0.01em;color:#fff;}}
.capline{{display:flex;justify-content:center}}
.capin{{background:rgba(10,10,10,.86);padding:12px 26px;border-radius:16px}}
.term{{position:absolute;{"left:70px;right:70px;top:760px;height:420px" if V else "left:330px;right:330px;top:400px;height:330px"};border-radius:28px;background:#111113;box-shadow:0 30px 80px rgba(0,0,0,.25);padding:{"60px 54px" if V else "56px 60px"};font:500 {58 if V else 56}px/1.5 "Geist Mono",monospace;color:#e4e4e7}}
.term .ok{{font-size:{38 if V else 34}px;color:#a1a1aa;margin-top:26px;opacity:0}}
.island{{position:absolute;{FIG}}}
.chip{{display:inline-flex;align-items:center;gap:14px;font:600 {40 if V else 34}px/1 "Geist Mono",monospace;padding:18px 26px;border-radius:16px;background:#fff;border:2px solid #e7e5e4;color:#3f3f46}}
.chip img{{width:{40 if V else 34}px;height:{40 if V else 34}px}}
.cmp{{position:absolute;{FIG};background:#fff;border:2px solid #e7e5e4;border-radius:28px;padding:{"40px 36px" if V else "34px 40px"};box-shadow:0 24px 70px rgba(0,0,0,.08)}}
.cmp .q{{font:600 {38 if V else 32}px/1.25 "Geist",sans-serif;color:{INK};margin-bottom:{30 if V else 24}px}}
.cols{{display:flex;flex-direction:{"column" if V else "row"};gap:{28 if V else 32}px}}
.col{{flex:1;border:2px solid #e7e5e4;border-radius:20px;padding:{"26px 28px" if V else "24px 28px"};background:{PAPER}}}
.colhead{{display:flex;align-items:center;gap:18px;margin-bottom:18px}}
.colhead img{{width:{56 if V else 48}px;height:{56 if V else 48}px}}
.tag{{font:700 {34 if V else 30}px/1.1 "Geist",sans-serif}}
.mid{{font:500 {26 if V else 22}px/1.3 "Geist Mono",monospace;color:{MUTED}}}
.opt,.time{{display:flex;align-items:center;gap:16px;font:600 {30 if V else 26}px/1 "Geist Mono",monospace;margin:{12 if V else 10}px 0}}
.opt span,.time span{{width:{150 if V else 120}px;color:#3f3f46}}
.opt b,.time b{{width:{110 if V else 130}px;text-align:right}}
.bar,.tbar{{flex:1;height:{22 if V else 18}px;border-radius:11px;background:#e7e5e4;overflow:hidden}}
.bar i,.tbar i{{display:block;height:100%;width:0;background:{INK};border-radius:11px}}
.tbar i{{background:{ACC}}}
.agree{{margin-top:{26 if V else 20}px;font:600 {34 if V else 28}px/1.2 "Geist",sans-serif;opacity:0}}
.agree b{{color:{ACC}}}
.note{{margin-top:12px;font:500 {24 if V else 20}px/1.3 "Geist",sans-serif;color:{MUTED}}}
.only{{position:absolute;{"left:80px;right:80px;top:1180px" if V else "left:0;right:0;top:760px"};text-align:center;font:500 {34 if V else 30}px/1.3 "Geist",sans-serif;color:{MUTED};opacity:0}}
"""

# ---------- scenes ----------
tb = T["flow"]
html_scenes = f"""
<div class="s" id="s-hook">
  <div class="title" style="{TITLE.replace('text-align:left', 'text-align:center') if not V else TITLE}">Your Mac already runs <span class="acc">good models.</span></div>
  <div class="island" style="display:flex;flex-wrap:wrap;align-content:center;justify-content:center;gap:{26 if V else 30}px">
    <span class="chip hc"><img src="assets/apple.svg">Apple Foundation Model</span>
    <span class="chip hc"><img src="assets/perplexity-color.svg">Perplexity Decider</span>
    <span class="chip hc"><img src="assets/ollama.svg">Ollama</span>
    <span class="chip hc">LM Studio</span>
  </div>
</div>

<div class="s" id="s-problem">
  <div class="title" style="{TITLE}">Stuck on one machine.<span class="sub">Each one on its own localhost port, behind its own API.</span></div>
  <div class="island" style="display:flex;flex-direction:column;align-items:center;justify-content:center;gap:{24 if V else 20}px">
    <span class="chip pc">localhost:1976 · fm serve</span>
    <span class="chip pc">localhost:8080 · /v1/decisions</span>
    <span class="chip pc">localhost:11434 · Ollama</span>
    <span class="chip pc">localhost:1234 · LM Studio</span>
    <span class="chip" id="noreach" style="border-color:#dc2626;color:#b91c1c;opacity:0">your apps: can't reach it</span>
  </div>
</div>

<div class="s" id="s-command">
  <div class="title" style="{TITLE}">One command.<span class="sub">Dials out from your Mac. No ports to open.</span></div>
  <div class="term">
    <div><span style="color:#a1a1aa">$</span> <span id="typed"></span><span id="caret" style="background:#e4e4e7;color:#111113">&#160;</span></div>
    <div class="ok" id="ok1">uses the AnyRouter key you already have</div>
  </div>
</div>

<div class="s" id="s-flow">
  <div class="title" id="flowtitle" style="{TITLE}">How a request reaches <span class="acc">your Mac</span></div>
  <div class="card">
    <div class="cardhead"><span>anyr relay · anatomy</span><span class="readout" id="readout">step 1 of 5</span></div>
    <div class="benchwrap">{BENCH}</div>
  </div>
</div>

<div class="s" id="s-compare">
  <div class="title" style="{TITLE}">Side by side<span class="sub">Your Mac next to a hosted model.</span></div>
  {CMP_HTML}
</div>

<div class="s" id="s-cta" style="text-align:center">
  <img src="assets/anyrouter-logo-black.svg" style="position:absolute;left:50%;top:{470 if V else 150}px;width:{170 if V else 140}px;margin-left:-{85 if V else 70}px">
  <div class="title" style="left:60px;right:60px;top:{700 if V else 330}px;text-align:center;font-size:{120 if V else 110}px">anyr relay</div>
  <div class="term" style="{"left:60px;right:60px;top:900px;height:250px;padding:50px 40px;font-size:42px" if V else "left:360px;right:360px;top:490px;height:150px;padding:44px 50px;font-size:44px"};text-align:left"><span style="color:#a1a1aa">$</span> anyr upgrade &amp;&amp; anyr relay start</div>
  <div style="position:absolute;left:0;right:0;top:{1220 if V else 700}px;font:700 {64 if V else 58}px/1.2 'Geist Mono',monospace">anyrouter.dev</div>
</div>
"""

# ---------- timeline ----------
js_caps = json.dumps([[a, b] for a, b, _ in CAPS])
t_cmd = line_start("anyr relay start")
t_up = line_start("anyr upgrade")
t_app = line_start("Your app calls")
t_edge = line_start("The edge")
t_tunnel = word_time("tunnel", t_edge)
t_eng = [word_time("Apple's", t_edge), word_time("Perplexity", t_edge), word_time("Oh", t_edge) if any(w["text"].lower().startswith("oh") for w in WORDS) else word_time("Ol", t_edge), word_time("LM", t_edge)]
t_back = word_time("reply", t_edge)
t_only = T["only"]
t_cmp = T["compare"]
t_see = line_start("See both")

script = f"""
const tl = gsap.timeline({{paused:true}});
const B = {json.dumps([[f"#s-{n}", round(a, 2), round(b, 2)] for n, a, b in BOUNDS])};
const DUR = {DUR};
for (const [id,a,b] of B) {{
  tl.fromTo(id,{{opacity:0,y:30}},{{opacity:1,y:0,duration:.45,ease:"power2.out"}},a);
  if (b < DUR) tl.to(id,{{opacity:0,duration:.3,ease:"power1.in"}},b-.3);
}}
// captions
const CAPS = {js_caps};
CAPS.forEach(([a,b],i)=>{{
  const el=document.getElementById("cap"+i); el.innerHTML='<span class="capin">'+el.textContent+'</span>';
  tl.set(el,{{opacity:1}},a); tl.set(el,{{opacity:0}},b);
}});
// hook chips
document.querySelectorAll(".hc").forEach((c,i)=>tl.fromTo(c,{{opacity:0,y:24}},{{opacity:1,y:0,duration:.35}},.5+i*.25));
// problem
document.querySelectorAll(".pc").forEach((c,i)=>tl.fromTo(c,{{opacity:0,x:-30}},{{opacity:1,x:0,duration:.3}},{T['problem']:.2f}+.3+i*.3));
tl.to("#noreach",{{opacity:1,duration:.3}},{line_start("Your apps can't"):.2f});
// command typing
const cmd="anyr relay start"; const typed={{n:0}};
tl.to(typed,{{n:cmd.length,duration:1.0,ease:"none",onUpdate:()=>{{document.getElementById("typed").textContent=cmd.slice(0,Math.round(typed.n))}}}},{t_cmd - 0.35:.2f});
tl.to("#ok1",{{opacity:1,duration:.3}},{t_cmd + 0.9:.2f});
// flow: pills + readout
const steps=[[{t_app:.2f},0,"step 1 of 5 · your app"],[{t_app + 1.1:.2f},1,"step 2 of 5 · your key"],[{t_edge:.2f},2,"step 3 of 5 · edge"],[{t_tunnel - 0.3:.2f},3,"step 4 of 5 · secure tunnel"],[{t_eng[0] - 0.4:.2f},4,"step 5 of 5 · your Mac"]];
steps.forEach(([t,i,txt])=>{{ tl.to("#pill"+i,{{opacity:1,duration:.25}},t); tl.call(()=>{{document.getElementById("readout").textContent=txt}},null,t); }});
tl.call(()=>{{document.getElementById("readout").textContent="step 1 of 5 · your app"}},null,{tb - 0.2:.2f});
const OUT={json.dumps([[round(x, 1), round(y, 1)] for x, y in PATH_OUT])};
function along(sel, pts, t0, dur){{
  tl.set(sel,{{attr:{{cx:pts[0][0],cy:pts[0][1]}},opacity:1}},t0);
  const seg=dur/(pts.length-1);
  for(let i=1;i<pts.length;i++) tl.to(sel,{{attr:{{cx:pts[i][0],cy:pts[i][1]}},duration:seg,ease:"none"}},t0+seg*(i-1));
  tl.set(sel,{{opacity:0}},t0+dur);
}}
along("#pk0", OUT.slice(0,3), {t_app + 0.3:.2f}, 2.6);
along("#pk1", OUT.slice(2,6), {t_tunnel - 0.4:.2f}, 2.4);
along("#pk2", OUT.slice(0,6), {t_back - 1.6:.2f}, 2.0);
const ENGS={json.dumps([round(t, 2) for t in t_eng])};
ENGS.forEach((t,i)=>{{ tl.fromTo("#eng"+i,{{y:0}},{{y:-6,duration:.25,yoyo:true,repeat:1,ease:"power1.out"}},t); }});
const BACK=OUT.slice(0,6).reverse();
for(let k=0;k<6;k++) along("#bk"+k, BACK, {t_back:.2f}+k*.28, 2.0);
// only you: ghost requests bounce off at the edge
tl.to("#flowtitle",{{opacity:0,duration:.2}},{t_only - 0.2:.2f});
tl.call(()=>{{document.getElementById("flowtitle").innerHTML='Only <span class="acc">you.</span><span class="sub">Your Mac answers your requests. Nobody else\\'s.</span>'}},null,{t_only:.2f});
tl.to("#flowtitle",{{opacity:1,duration:.3}},{t_only:.2f});
tl.call(()=>{{document.getElementById("readout").textContent="own device only · sharing needs --pool"}},null,{t_only:.2f});
for(let g=0;g<2;g++){{
  const t0={t_only + 0.4:.2f}+g*1.4;
  tl.set("#gh"+g,{{x:OUT[1][0],y:OUT[1][1]-30,opacity:1}},t0);
  tl.to("#gh"+g,{{x:OUT[2][0]-12,y:OUT[2][1]-10,duration:.7,ease:"power1.in"}},t0);
  tl.to("#gh"+g,{{x:OUT[1][0]+10,y:OUT[1][1]-40,opacity:0,duration:.6,ease:"power2.out"}},t0+.7);
}}
along("#pk0", OUT.slice(0,6), {t_only + 1.0:.2f}, 2.2);
// compare
const TIMES={json.dumps([c["ms"] for c in CMP])};
[0,1].forEach(i=>{{
  tl.fromTo("#col"+i,{{opacity:0,y:20}},{{opacity:1,y:0,duration:.35}},{t_cmp + 0.3:.2f}+i*.5);
  for(let j=0;j<3;j++){{ const el=document.getElementById("b"+i+j); tl.to(el,{{width:el.dataset.w+"%",duration:.6,ease:"power2.out"}},{t_cmp + 1.4:.2f}+i*.5+j*.1); }}
}});
tl.to("#t0",{{width:"38%",duration:.6}},{t_see:.2f});
tl.to("#t1",{{width:"72%",duration:.6}},{t_see + 0.2:.2f});
tl.call(()=>{{document.getElementById("tl0").textContent="sample";document.getElementById("tl1").textContent="sample"}},null,{t_see:.2f});
tl.call(()=>{{document.getElementById("tl0").textContent="";document.getElementById("tl1").textContent=""}},null,{t_see - 0.5:.2f});
tl.to("#agree",{{opacity:1,duration:.3}},{t_see + 1.0:.2f});
tl.to({{}},{{duration:DUR}},0);
window.__timelines["main"] = tl;
"""

print(f"""<!doctype html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width={W}, height={H}">
<script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
<style>{css}</style></head><body>
<div id="root" data-composition-id="main" data-start="0" data-duration="{DUR}" data-width="{W}" data-height="{H}">
<div class="grid"></div>
{html_scenes}
<div class="caps">{cap_html}</div>
<audio id="vo" class="clip" src="assets/narration.wav" data-start="0" data-duration="{AUDIO}" data-track-index="1" data-volume="1"></audio>
</div>
<script>{script}</script></body></html>""")
