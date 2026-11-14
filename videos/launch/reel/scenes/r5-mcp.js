// mcpTall from the landing figure: agent and hub on top, servers on alternating rows off one trunk.
const { T, G, el, wire, node, hub, chip, txt, dot, travel, draw } = Rail;
const M = G.tall.mcp;
for (const [a, b] of M.rails) {
  el(L.rails, 'line', { x1: a[0], x2: b[0], y1: a[1], y2: b[1], stroke: T.idle, 'stroke-width': 1.5, 'stroke-dasharray': '6 6' });
  for (const p of [a, b]) el(L.rails, 'rect', { x: p[0] - 7, y: p[1] - 7, width: 14, height: 14, fill: T.plate, stroke: T.muted, 'stroke-width': 1.5 });
}
const sv = M.servers.map(s => ({ ...s, w: wire(L.wires, s.pts.slice(3)), path: Rail.path(s.pts), n: node(L.top, s.c, s.mark) }));
const trunk = wire(L.wires, [M.hub, M.servers[0].pts[1], M.servers[0].pts[2], [M.servers[0].pts[2][0], Math.max(...M.servers.map(s => s.c[1]))]]);
const agentRight = M.agentRight[0];
const src = wire(L.wires, [[agentRight, M.hub[1]], [M.hub[0] - M.ring, M.hub[1]]], { stroke: T.ink, dash: '8 8' });
const H = hub(L.top, M.hub, M.ring, null);
const label = txt(L.top, [M.hub[0], M.hub[1] - M.ring - 16], 'AnyRouter MCP', { size: 34, anchor: 'middle', color: T.ink });
const agent = chip(L.top, [agentRight - 176, M.hub[1]], '$ anyr claude', { size: 40, stroke: T.ink, fill: T.page, color: T.ink });
const endpoint = chip(L.top, [505, M.rails[2][0][1]], 'https://anyrouter.dev/api/v1/mcp', { stroke: T.ink, fill: T.page, color: T.ink });
const ok = txt(L.top, [sv[0].c[0], sv[0].c[1] + 78], 'ok', { size: 34, color: T.ember, anchor: 'middle' });

tl.fromTo([L.rails, label], { opacity: 0 }, { opacity: 1, duration: 0.4 }, 0.2);
draw(tl, trunk, 0.3, 0.35);
sv.forEach((s, i) => {
  draw(tl, s.w, 0.55 + i * 0.04, 0.4);
  tl.fromTo(s.n.el, { opacity: 0 }, { opacity: 1, duration: 0.3 }, 0.8 + i * 0.04);
});
tl.fromTo([agent.el, src.el], { opacity: 0, x: -16 }, { opacity: 1, x: 0, duration: 0.45, ease: 'power3.out' }, 0.6);
tl.fromTo(endpoint.el, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.4, ease: 'power3.out' }, w('url') - 0.1);
const k = w('key');
travel(tl, dot(L.dots, 11), Rail.path([[agentRight, M.hub[1]], ...sv[0].pts]), k - 0.3, 1.1);
tl.set([sv[0].w.el, trunk.el], { attr: { stroke: T.ink, 'stroke-width': 3 } }, k + 0.8);
tl.set(sv[0].n.box, { attr: { stroke: T.ink } }, k + 0.8);
tl.fromTo(ok, { opacity: 0 }, { opacity: 1, duration: 0.2 }, k + 0.8);
const back = Rail.path([...sv[0].pts].reverse().concat([[agentRight, M.hub[1]]]));
for (let i = 0; i < 3; i++) travel(tl, dot(L.dots, 11), back, k + 1.0 + i * 0.18, 1.1);
const ev = w('every');
sv.slice(1).forEach((s, i) => tl.set(s.n.box, { attr: { stroke: T.ink } }, ev + i * 0.08));
