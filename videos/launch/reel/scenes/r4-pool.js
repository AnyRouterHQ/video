// poolTall from the landing figure: the caller, the hub, six keys on both sides of one trunk.
const { T, G, el, wire, node, hub, chip, txt, dot, travel, draw } = Rail;
const P = G.tall.pool;
for (const [a, b] of P.rails) {
  el(L.rails, 'line', { x1: a[0], x2: b[0], y1: a[1], y2: b[1], stroke: T.idle, 'stroke-width': 1.5, 'stroke-dasharray': '6 6' });
  for (const p of [a, b]) el(L.rails, 'rect', { x: p[0] - 7, y: p[1] - 7, width: 14, height: 14, fill: T.plate, stroke: T.muted, 'stroke-width': 1.5 });
}
const keys = P.keys.map(k => ({ ...k, w: wire(L.wires, k.pts), n: node(L.top, k.c, k.mark, { size: 60, r: 0, mono: false }) }));
const src = wire(L.wires, [[P.caller[0], P.caller[1] + 36], [P.hub[0], P.hub[1] - P.ring]], { stroke: T.ink, dash: '8 8' });
const H = hub(L.top, P.hub, P.ring, null);
const caller = chip(L.top, P.caller, '$ anyr claude', { size: 40, stroke: T.ink, fill: T.page, color: T.ink });
const k0 = keys[0];
const c429 = txt(L.top, [k0.c[0] - 48, k0.c[1] + 12], '429', { size: 34, color: T.red, anchor: 'end' });
const skipped = chip(L.top, [k0.c[0], (k0.c[1] + keys[2].c[1]) / 2], 'limited, skipped', { dash: '6 6' });
const go = chip(L.top, P.caller, 'Go plan · $0 on Pool requests', { color: T.ink });

tl.fromTo([L.rails, src.el, caller.el], { opacity: 0 }, { opacity: 1, duration: 0.5 }, 0.2);
keys.forEach((k, i) => {
  draw(tl, k.w, 0.4 + i * 0.06, 0.5);
  tl.fromTo(k.n.el, { opacity: 0 }, { opacity: 1, duration: 0.3 }, 0.7 + i * 0.06);
});
// "One key, alone, hits the limit and stops": only the first key carries requests, then 429.
const route = k => Rail.path([[P.caller[0], P.caller[1] + 36], ...k.pts]);
const alone = w('alone');
tl.set([k0.w.el, k0.n.box], { attr: { stroke: T.ink } }, alone - 0.6);
[alone - 0.6, alone, alone + 0.6].forEach(at => travel(tl, dot(L.dots, 11), route(k0), at, 1.0));
const stops = w('stops');
travel(tl, dot(L.dots, 11), route(k0), stops - 1.0, 1.0);
tl.set([k0.w.el, k0.n.box], { attr: { stroke: T.red, 'stroke-dasharray': '8 8' } }, stops);
tl.fromTo(c429, { opacity: 0 }, { opacity: 1, duration: 0.01 }, stops);
// "So people add free-tier keys": the others light one by one.
const add = w('add');
keys.slice(1).forEach((k, i) => tl.set([k.w.el, k.n.box], { attr: { stroke: T.ink } }, add + i * 0.25));
// "spreads requests across the keys": requests rotate over the five working keys.
let at = w('spreads') - 0.2;
for (let i = 0; at < 20.6; i++, at += 0.6) travel(tl, dot(L.dots, 11), route(keys[1 + (i % 5)]), at, 1.2);
// "skips any key that is rate limited": the limited key is dashed and faded, and named.
const sk = w('skips');
tl.set([k0.w.el, k0.n.box], { attr: { stroke: T.idle, 'stroke-dasharray': '6 6' } }, sk);
tl.to([k0.n.el, k0.w.el], { opacity: 0.6, duration: 0.3 }, sk);
tl.to(c429, { opacity: 0, duration: 0.3 }, sk);
tl.fromTo(skipped.el, { opacity: 0, y: -8 }, { opacity: 1, y: 0, duration: 0.4, ease: 'power3.out' }, sk + 0.1);
// "Go plan": the caller chip gives its place to the Go chip.
const g = w('go');
tl.to(caller.el, { opacity: 0, duration: 0.25 }, g - 0.2);
tl.fromTo(go.el, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.45, ease: 'power3.out' }, g);
// hand-off: everything but the hub fades, and the hub slides to the MCP spot
const out = 21.4;
tl.to([L.rails, L.wires, L.dots, ...[...L.top.children].filter(n => n !== H.el)], { opacity: 0, duration: 0.4 }, out);
const M = G.tall.mcp;
Rail.place(tl, H.el, { x: 0, y: 0, s: 1 }, Rail.poseAt(P.hub, M.hub, M.ring / P.ring), out + 0.1, 0.8);
