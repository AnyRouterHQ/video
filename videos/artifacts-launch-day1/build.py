"""Generate index.html for one aspect: python3 build.py 9x16|16x9 > index.html"""
import sys

V = sys.argv[1] == "9x16"
W, H = (1080, 1920) if V else (1920, 1080)
DUR = 38
CAP = 104 if V else 92        # caption size
SUB = 52 if V else 44
TERM = 46 if V else 40
SHOT = "a-mobile.png" if V else "a-desktop.png"
LAND = "artifact-mobile.png" if V else "artifact-desktop.png"
# window that holds a screenshot
if V:
    win = dict(left=90, top=560, width=900, height=1220)
    cap_top = 200
else:
    win = dict(left=760, top=150, width=1080, height=780)
    cap_top = 380

css_win = ";".join(f"{k}:{v}px" for k, v in win.items())
cap_box = (f"left:90px;right:90px;top:{cap_top}px;text-align:center" if V
           else f"left:110px;width:600px;top:{cap_top}px;text-align:left")
cap_box_full = (f"left:90px;right:90px;top:{cap_top}px;text-align:center" if V
                else "left:160px;right:160px;top:170px;text-align:center")

print(f"""<!doctype html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width={W}, height={H}">
<script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
<style>
@font-face{{font-family:"Geist";font-weight:100 900;font-display:block;src:url("assets/geist.woff2") format("woff2-variations")}}
@font-face{{font-family:"Geist Mono";font-weight:100 900;font-display:block;src:url("assets/geist-mono.woff2") format("woff2-variations")}}
*{{margin:0;padding:0;box-sizing:border-box}}
html,body{{width:{W}px;height:{H}px;overflow:hidden;background:#fafaf9}}
#root{{position:relative;width:{W}px;height:{H}px;overflow:hidden;background:#fafaf9;color:#0a0a0a;font-family:"Geist",sans-serif}}
.s{{position:absolute;inset:0;opacity:0}}
.cap{{position:absolute;font-weight:700;font-size:{CAP}px;line-height:1.05;letter-spacing:-0.03em}}
.sub{{font-weight:500;font-size:{SUB}px;line-height:1.25;letter-spacing:-0.01em;color:#3f3f46;margin-top:28px}}
.acc{{color:#c2410c}}
.win{{position:absolute;{css_win};border-radius:28px;overflow:hidden;background:#fff;border:2px solid #e4e4e7;box-shadow:0 30px 80px rgba(0,0,0,.14)}}
.bar{{position:relative;z-index:2;height:64px;background:#f4f4f5;border-bottom:2px solid #e4e4e7;display:flex;align-items:center;padding:0 24px;gap:12px}}
.dot{{width:16px;height:16px;border-radius:50%;background:#d4d4d8}}
.url{{flex:1;margin-left:16px;height:40px;border-radius:20px;background:#fff;border:2px solid #e4e4e7;font:500 24px/36px "Geist Mono",monospace;color:#27272a;padding:0 18px;white-space:nowrap;overflow:hidden}}
.shot{{position:absolute;left:0;top:64px;width:100%;transform-origin:0 0}}
.term{{position:absolute;{css_win};{"top:700px;height:600px;" if V else "top:360px;height:360px;"}border-radius:28px;background:#111113;box-shadow:0 30px 80px rgba(0,0,0,.25);padding:{'56px 48px' if V else '60px 56px'};font:500 {TERM}px/1.6 "Geist Mono",monospace;color:#e4e4e7}}
.chip{{display:inline-block;font-weight:600;font-size:{56 if V else 50}px;padding:22px 40px;border-radius:999px;border:3px solid #d4d4d8;background:#fff;color:#18181b;margin:14px}}
.mess{{display:inline-block;font:600 {50 if V else 44}px/1 "Geist",sans-serif;padding:24px 34px;border-radius:20px;background:#fff;border:2px solid #e4e4e7;color:#52525b;margin:16px;position:relative}}
.strike{{position:absolute;left:-6%;top:50%;height:6px;width:0;background:#dc2626;border-radius:3px}}
</style></head><body>
<div id="root" data-composition-id="main" data-start="0" data-duration="{DUR}" data-width="{W}" data-height="{H}">

<div class="s" id="s1">
  <div class="cap" style="{cap_box_full}">Your AI built a page.<br><span class="acc">Now share it?</span></div>
  <div style="position:absolute;left:60px;right:60px;top:{900 if V else 560}px;text-align:center">
    <span class="mess">zip it<i class="strike"></i></span>
    <span class="mess">screenshot it<i class="strike"></i></span>
    <span class="mess">set up hosting<i class="strike"></i></span>
    <span class="mess">paste in chat<i class="strike"></i></span>
  </div>
</div>

<div class="s" id="s2">
  <div class="cap" style="{cap_box}">One command.<div class="sub">From the anyr CLI, curl or MCP.</div></div>
  <div class="term">
    <div><span style="color:#a1a1aa">$</span> <span id="typed"></span><span id="caret" style="background:#e4e4e7;color:#111113">&nbsp;</span></div>
    <div id="out1" style="opacity:0;margin-top:28px;color:#fdba74;word-break:break-all">https://anyrouter.dev/a/gSjJvjQHLzecdtCz</div>
    <div id="out2" style="opacity:0;color:#86efac">&#10003; published version 1</div>
  </div>
</div>

<div class="s" id="s3">
  <div class="cap" style="{cap_box}">Get a link.<div class="sub">It opens anywhere. Publish again, same link.</div></div>
  <div class="win" id="w3"><div class="bar"><i class="dot"></i><i class="dot"></i><i class="dot"></i><div class="url">anyrouter.dev/a/gSjJvjQHLzecdtCz</div></div>
    <img class="shot" data-layout-allow-overflow id="shot3" src="assets/{SHOT}"></div>
</div>

<div class="s" id="s4">
  <div class="cap" style="{cap_box}">Live data.<div class="sub">Pages can save and share small data. Content runs in a sandbox.</div></div>
  <div class="win"><div class="bar"><i class="dot"></i><i class="dot"></i><i class="dot"></i><div class="url">anyrouter.dev/a/gSjJvjQHLzecdtCz</div></div>
    <img class="shot" data-layout-allow-overflow id="shot4" src="assets/{SHOT}"></div>
</div>

<div class="s" id="s5">
  <div class="cap" style="{cap_box_full}">You pick who sees it.</div>
  <div style="position:absolute;left:40px;right:40px;top:{760 if V else 470}px;text-align:center">
    <span class="chip" id="c1">Private</span><span class="chip" id="c2">Anyone with the link</span><span class="chip" id="c3">Public</span>
  </div>
  <div class="sub" style="position:absolute;left:90px;right:90px;top:{1180 if V else 760}px;text-align:center">Private by default.</div>
</div>

<div class="s" id="s6" style="text-align:center">
  <img src="assets/logo.svg" style="position:absolute;left:50%;top:{560 if V else 220}px;width:{200 if V else 160}px;transform:translateX(-50%)">
  <div class="cap" style="left:60px;right:60px;top:{860 if V else 450}px;font-size:{140 if V else 130}px">Artifacts</div>
  <div style="position:absolute;left:0;right:0;top:{1040 if V else 620}px"><span style="display:inline-block;font:700 {48 if V else 44}px/1 Geist;padding:16px 34px;border-radius:999px;background:#c2410c;color:#fff">Beta</span></div>
  <div style="position:absolute;left:0;right:0;top:{1190 if V else 740}px;font:600 {64 if V else 60}px/1.2 'Geist Mono',monospace">anyrouter.dev/artifact</div>
  <div class="sub" style="position:absolute;left:0;right:0;top:{1300 if V else 830}px">Try it today.</div>
</div>
</div>
<script>
const tl = gsap.timeline({{paused:true}});
const S = [["#s1",0,6],["#s2",6,13],["#s3",13,21],["#s4",21,28],["#s5",28,33],["#s6",33,{DUR}]];
for (const [id,a,b] of S) {{
  tl.fromTo(id,{{opacity:0,y:40}},{{opacity:1,y:0,duration:.5,ease:"power2.out"}},a);
  if (b < {DUR}) tl.to(id,{{opacity:0,duration:.4,ease:"power1.in"}},b-.4);
}}
document.querySelectorAll("#s1 .mess").forEach((m,i)=>{{
  tl.fromTo(m,{{opacity:0,scale:.9}},{{opacity:1,scale:1,duration:.35}},.6+i*.35);
  tl.to(m.querySelector(".strike"),{{width:"112%",duration:.3,ease:"power2.in"}},3.2+i*.3);
  tl.to(m,{{opacity:.35,duration:.3}},3.4+i*.3);
}});
const cmd="anyr artifact publish ./page.html"; const typed={{n:0}};
tl.to(typed,{{n:cmd.length,duration:2.2,ease:"none",onUpdate:()=>{{document.getElementById("typed").textContent=cmd.slice(0,Math.round(typed.n))}}}},7);
tl.set("#caret",{{opacity:0}},9.6);
tl.to("#out1",{{opacity:1,duration:.3}},9.9); tl.to("#out2",{{opacity:1,duration:.3}},10.4);
tl.fromTo("#w3",{{scale:.92}},{{scale:1,duration:1,ease:"power3.out"}},13);
tl.fromTo("#shot3",{{y:0}},{{y:{-260 if V else -120},duration:6,ease:"power1.inOut"}},14.2);
tl.fromTo("#shot4",{{scale:{1.0},x:0,y:0}},{{scale:{1.5 if V else 1.9},x:{-60 if V else -40},y:{-640 if V else -400},duration:2.2,ease:"power2.inOut"}},21.6);
["#c1","#c2","#c3"].forEach((c,i)=>tl.fromTo(c,{{opacity:0,y:30}},{{opacity:1,y:0,duration:.4}},28.5+i*.4));
tl.to("#c1",{{borderColor:"#c2410c",background:"#fff7ed",duration:.3}},30.2);
tl.to({{}},{{duration:{DUR}}},0);
window.__timelines["main"] = tl;
</script></body></html>""")
