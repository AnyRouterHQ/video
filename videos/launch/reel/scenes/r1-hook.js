// /pool's "One key, alone" row, turned to run top to bottom. Frame 0 already shows the 429.
const { T, el, wire, node, chip, dot, travel } = Rail;
const X = 505, KEY = 470, STOP = 930;
wire(L.wires, [[X, KEY + 30], [X, STOP]], { stroke: T.ink });
for (let y = KEY + 90; y < STOP; y += 70) el(L.wires, 'line', { x1: X - 10, x2: X + 10, y1: y, y2: y, stroke: T.ink, 'stroke-width': 2 });
el(L.wires, 'line', { x1: X - 64, x2: X + 64, y1: STOP, y2: STOP, stroke: T.red, 'stroke-width': 2, 'stroke-dasharray': '6 6' });
el(L.wires, 'line', { x1: X, x2: X, y1: STOP + 120, y2: 1200, stroke: T.idle, 'stroke-width': 2, 'stroke-dasharray': '3 10' });
node(L.top, [X, KEY], 'openrouter', { size: 60, r: 0, stroke: T.ink, mono: false });
const stop = chip(L.top, [X, STOP + 64], '429 rate limited', { size: 48, stroke: T.red, fill: T.page, color: T.red });
const toStop = Rail.path([[X, KEY + 30], [X, STOP - 10]]);
[0.3, 0.75].forEach(at => {
  const d = dot(L.dots, 11);
  travel(tl, d, toStop, at, 0.9, { hide: false });
  tl.to(d, { attr: { opacity: 0 }, duration: 0.25 }, at + 0.9);
});
const halt = w('stops');
travel(tl, dot(L.dots, 11), toStop, halt - 0.9, 0.9, { hide: false });
tl.fromTo(stop.box, { attr: { 'stroke-width': 2 } }, { attr: { 'stroke-width': 4 }, duration: 0.1 }, halt);
tl.to(stop.box, { attr: { 'stroke-width': 2 }, duration: 0.3 }, halt + 0.1);
