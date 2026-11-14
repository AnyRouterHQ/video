// routingTall from the landing figure: the agent on top, the hub, upstreams in two rows below.
const { T, G, el, wire, ticks, node, hub, chip, txt, dot, travel, draw } = Rail;
const R = G.tall.routing;
for (const [a, b] of R.rails) {
  el(L.rails, 'line', { x1: a[0], x2: b[0], y1: a[1], y2: b[1], stroke: T.idle, 'stroke-width': 1.5, 'stroke-dasharray': '6 6' });
  for (const p of [a, b]) el(L.rails, 'rect', { x: p[0] - 7, y: p[1] - 7, width: 14, height: 14, fill: T.plate, stroke: T.muted, 'stroke-width': 1.5 });
}
const trunk = wire(L.wires, R.trunk);
const up = R.ups.map(u => ({ ...u, w: wire(L.wires, u.draw), path: Rail.path(u.pts), t: ticks(L.wires, u.tick, { vertical: true }), n: node(L.top, u.c, u.mark) }));
const agentC = R.agent;
const src = wire(L.wires, [[agentC[0], agentC[1] + 36], [R.hub[0], R.hub[1] - R.ring]], { stroke: T.ink, dash: '8 8' });
const factsC = [760, R.facts[1]];
const lead = wire(L.wires, [[R.hub[0] + R.ring, R.hub[1]], [factsC[0], R.hub[1]], [factsC[0], factsC[1] - 32]]);
const h = hub(L.top, R.hub, R.ring, null);
const label = txt(L.top, [R.hub[0], R.hub[1] + R.ring + 48], 'AnyRouter', { size: 34, anchor: 'middle', color: T.ink });
const agent = chip(L.top, agentC, '$ anyr claude', { size: 40, stroke: T.ink, fill: T.page, color: T.ink });
const facts = chip(L.top, factsC, '400+ models');
const nv = up[7], ki = up[6];
const c429 = txt(L.top, [nv.c[0], nv.c[1] + 80], '429', { size: 34, color: T.red, anchor: 'middle' });
const c200 = txt(L.top, [ki.c[0], ki.c[1] + 80], '200', { size: 34, color: T.ember, anchor: 'middle' });
const billed = chip(L.top, [505, 1186], 'billed once');

const a0 = w('anyrouter');
tl.fromTo([h.el, label], { opacity: 0 }, { opacity: 1, duration: 0.5, ease: 'power3.out' }, a0);
tl.fromTo(L.rails, { opacity: 0 }, { opacity: 1, duration: 0.5 }, a0 + 0.2);
draw(tl, trunk, a0 + 0.3, 0.3);
up.forEach((u, i) => {
  const at = a0 + 0.5 + i * 0.05;
  draw(tl, u.w, at, 0.5);
  tl.fromTo(u.t, { opacity: 0 }, { opacity: 1, duration: 0.2 }, at + 0.4);
  tl.fromTo(u.n.el, { opacity: 0 }, { opacity: 1, duration: 0.3 }, at + 0.45);
});
tl.fromTo([agent.el, src.el], { opacity: 0, y: -16 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' }, a0 + 0.6);
tl.fromTo([facts.el, lead.el], { opacity: 0 }, { opacity: 1, duration: 0.4 }, w('model'));

const d1 = dot(L.dots, 11);
const pk = w('picks');
travel(tl, d1, src, pk - 0.6, 0.6);
travel(tl, d1, nv.path, pk, 0.8);
const lim = w('limited');
tl.set(nv.w.el, { attr: { stroke: T.red, 'stroke-dasharray': '8 8', 'stroke-dashoffset': 0 } }, lim);
tl.set(nv.t, { attr: { stroke: T.red } }, lim);
tl.set(nv.n.box, { attr: { stroke: T.red, 'stroke-dasharray': '8 8' } }, lim);
tl.set(nv.n.img, { attr: { style: '' } }, lim);
tl.fromTo(c429, { opacity: 0 }, { opacity: 1, duration: 0.01 }, lim);
const tr = w('tries');
travel(tl, dot(L.dots, 11), ki.path, tr, 0.7);
tl.set([ki.w.el, trunk.el], { attr: { stroke: T.ink, 'stroke-width': 3 } }, tr + 0.7);
tl.set(ki.t, { attr: { stroke: T.ink } }, tr + 0.7);
tl.set(ki.n.box, { attr: { stroke: T.ink } }, tr + 0.7);
tl.fromTo(c200, { opacity: 0 }, { opacity: 1, duration: 0.2 }, tr + 0.7);
const back = Rail.path([...ki.pts].reverse().concat([[agentC[0], agentC[1] + 36]]));
const ans = w('answer') - 0.25;
for (let i = 0; i < 3; i++) travel(tl, dot(L.dots, 11), back, ans + i * 0.18, 1.3);
tl.fromTo(billed.el, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.4, ease: 'power3.out' }, w('bill'));
