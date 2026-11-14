/*
 * rail.js — the landing page's Rail figure language, drawn as SVG for the launch film.
 * Every frame loads it, so a hub, wire or node drawn in one scene sits on exactly the
 * same pixels in the next: the shared-element cuts depend on that.
 *
 * Positioned groups (node, hub, chip) return an outer <g> to animate: GSAP's x/y/scale
 * replace an SVG element's transform attribute, so the position lives on an inner <g>.
 *
 * Geometry is the landing figure's 1000-unit layout mapped to the 1920x1080 stage with
 * P(x, y) = (160 + 1.6x, 108 + 1.6y) (routing-figure/layouts.ts).
 */
(() => {
  if (window.Rail) return;
  const NS = 'http://www.w3.org/2000/svg';
  const T = {
    plate: 'oklch(0.97 0 0)', page: '#FFFFFF', ink: '#0A0A0A', idle: '#B0B0B0', muted: '#636363',
    ember: 'oklch(0.555 0.163 49)', red: 'oklch(0.577 0.245 27.3)',
    mono: '"Geist Mono", ui-monospace, monospace', sans: '"Geist", ui-sans-serif, sans-serif',
  };
  const P = (x, y) => [160 + 1.6 * x, 108 + 1.6 * y];

  function el(parent, tag, attrs = {}) {
    const n = document.createElementNS(NS, tag);
    for (const [k, v] of Object.entries(attrs)) if (v != null) n.setAttribute(k, v);
    if (parent) parent.appendChild(n);
    return n;
  }

  /** Polyline geometry: total length and the point at a share t of it. */
  function path(pts) {
    const seg = [];
    let len = 0;
    for (let i = 1; i < pts.length; i++) {
      const l = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
      seg.push(l);
      len += l;
    }
    const at = t => {
      let d = Math.max(0, Math.min(1, t)) * len;
      for (let i = 0; i < seg.length; i++) {
        if (d <= seg[i] || i === seg.length - 1) {
          const k = seg[i] ? d / seg[i] : 0;
          return [pts[i][0] + (pts[i + 1][0] - pts[i][0]) * k, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * k];
        }
        d -= seg[i];
      }
      return pts.at(-1);
    };
    return { len, at, d: pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ') };
  }

  /** A wire: a single-stroke polyline. dash: '8 8' for source and refused wires. */
  function wire(g, pts, { stroke = T.idle, width = 2, dash = null } = {}) {
    const geo = path(pts);
    const n = el(g, 'path', { d: geo.d, fill: 'none', stroke, 'stroke-width': width, 'stroke-dasharray': dash, 'stroke-linejoin': 'miter' });
    return Object.assign(geo, { el: n });
  }

  /** Three tick strokes across a wire, 16 px tall, 8 px apart, centred on point c. */
  function ticks(g, c, { stroke = T.muted, vertical = false } = {}) {
    const t = el(g, 'g', { stroke, 'stroke-width': 2 });
    for (const d of [-8, 0, 8]) {
      if (vertical) el(t, 'line', { x1: c[0] - 8, x2: c[0] + 8, y1: c[1] + d, y2: c[1] + d });
      else el(t, 'line', { x1: c[0] + d, x2: c[0] + d, y1: c[1] - 8, y2: c[1] + 8 });
    }
    return t;
  }

  /** A boxed logo node. mono: draw the mark black, as the landing figure does. */
  function node(g, c, mark, { size = 72, r = 14, stroke = T.idle, dash = null, mono = true, markSize = null } = {}) {
    const outer = el(g, 'g');
    const n = el(outer, 'g', { transform: `translate(${c[0]} ${c[1]})` });
    const box = el(n, 'rect', { x: -size / 2, y: -size / 2, width: size, height: size, rx: r, fill: T.page, stroke, 'stroke-width': 2, 'stroke-dasharray': dash });
    const m = markSize ?? size / 2;
    const img = el(n, 'image', { href: `assets/marks/${mark}.svg`, x: -m / 2, y: -m / 2, width: m, height: m });
    if (mono) img.setAttribute('style', 'filter: brightness(0)');
    return { el: outer, box, img, c };
  }

  /** The hub: dashed ring, white disc with an ink edge, the AnyRouter mark. */
  function hub(g, c, ring = 93, label = 'AnyRouter') {
    const outer = el(g, 'g');
    const n = el(outer, 'g', { transform: `translate(${c[0]} ${c[1]})` });
    const ringEl = el(n, 'circle', { r: ring, fill: T.plate, stroke: T.ink, 'stroke-width': 2, 'stroke-dasharray': '7 7' });
    const disc = el(n, 'circle', { r: ring * 0.774, fill: T.page, stroke: T.ink, 'stroke-width': 2.5 });
    const m = ring * 0.946;
    const img = el(n, 'image', { href: 'assets/anyrouter-logo-black.svg', x: -m / 2, y: -m / 2, width: m, height: m });
    let text = null;
    if (label) text = txt(n, [0, ring + 48], label, { size: 34, anchor: 'middle', color: T.ink });
    return { el: outer, ring: ringEl, disc, img, label: text, c };
  }

  function txt(g, at, s, { size = 34, color = T.muted, family = T.mono, anchor = 'start', weight = 400 } = {}) {
    const t = el(g, 'text', { x: at[0], y: at[1], 'text-anchor': anchor, 'font-size': size, 'font-family': family, 'font-weight': weight, fill: color });
    t.textContent = s;
    return t;
  }

  /** A mono callout chip. Width follows the text (Geist Mono advance is 0.6 em). */
  function chip(g, c, s, { size = 34, stroke = T.idle, fill = T.plate, color = T.muted, dash = null, anchor = 'middle' } = {}) {
    const w = s.length * size * 0.6 + 40;
    const h = size + 30;
    const x0 = anchor === 'middle' ? -w / 2 : 0;
    const outer = el(g, 'g');
    const n = el(outer, 'g', { transform: `translate(${c[0]} ${c[1]})` });
    const box = el(n, 'rect', { x: x0, y: -h / 2, width: w, height: h, rx: 10, fill, stroke, 'stroke-width': 2, 'stroke-dasharray': dash });
    const text = txt(n, [x0 + 20, size * 0.36], s, { size, color });
    return { el: outer, box, text, w, h, c };
  }

  /** Dashed hairline rails with an open square handle at each end. */
  function rails(g, ys, x0 = P(24, 0)[0], x1 = P(976, 0)[0]) {
    const n = el(g, 'g');
    for (const y of ys) {
      el(n, 'line', { x1: x0, x2: x1, y1: y, y2: y, stroke: T.idle, 'stroke-width': 1.5, 'stroke-dasharray': '6 6' });
      for (const x of [x0, x1]) el(n, 'rect', { x: x - 7, y: y - 7, width: 14, height: 14, fill: T.plate, stroke: T.muted, 'stroke-width': 1.5 });
    }
    return n;
  }

  const dot = (g, r = 9) => el(g, 'circle', { r, cx: -100, cy: -100, fill: T.ember, opacity: 0 });

  /** Tween a dot along a wire from share a to b. Constant speed: ease none. */
  function travel(tl, d, geo, at, dur, { from = 0, to = 1, hide = true } = {}) {
    const s = { t: from };
    tl.set(d, { attr: { opacity: 1 } }, at);
    tl.fromTo(s, { t: from }, {
      t: to, duration: dur, ease: 'none', immediateRender: false,
      onUpdate: () => { const [x, y] = geo.at(s.t); d.setAttribute('cx', x); d.setAttribute('cy', y); },
    }, at);
    if (hide) tl.set(d, { attr: { opacity: 0 } }, at + dur);
  }

  /** Draw a solid wire on: dash = its length, offset length → 0. */
  function draw(tl, geo, at, dur = 0.5, ease = 'power3.out') {
    geo.el.setAttribute('stroke-dasharray', `${geo.len} ${geo.len}`);
    tl.fromTo(geo.el, { attr: { 'stroke-dashoffset': geo.len } }, { attr: { 'stroke-dashoffset': 0 }, duration: dur, ease, immediateRender: true }, at);
  }

  /**
   * The camera: a wrapper scaled about its top-left so that stage point (cx, cy) lands at
   * the stage centre. Stage size is read from the root, so portrait reuses it.
   */
  function camera(cam, root) {
    const W = () => root.offsetWidth, H = () => root.offsetHeight;
    const pose = ({ s, cx, cy }) => ({ scale: s, x: W() / 2 - cx * s, y: H() / 2 - cy * s });
    gsap.set(cam, { transformOrigin: '0 0' });
    return {
      set: (tl, p, at = 0) => tl.set(cam, pose(p), at),
      move: (tl, from, to, at, dur = 0.9, ease = 'power3.inOut') =>
        tl.fromTo(cam, pose(from), { ...pose(to), duration: dur, ease, immediateRender: at === 0 }, at),
      pose,
    };
  }

  /** Tween a wire between two polylines with the same number of points. */
  function morph(tl, geo, from, to, at, dur, ease = 'power3.inOut') {
    const s = { k: 0 };
    tl.fromTo(s, { k: 0 }, {
      k: 1, duration: dur, ease, immediateRender: false,
      onUpdate: () => {
        const pts = from.map((p, i) => [p[0] + (to[i][0] - p[0]) * s.k, p[1] + (to[i][1] - p[1]) * s.k]);
        geo.el.setAttribute('d', path(pts).d);
      },
    }, at);
  }

  /**
   * Move and scale a group by writing its transform attribute (p' = s·p + (x, y)).
   * GSAP's own SVG transforms add origin offsets, so a group that must land on exact
   * stage pixels is placed with this instead.
   */
  function place(tl, g, from, to, at, dur, ease = 'power3.inOut') {
    const v = { ...from };
    const write = () => g.setAttribute('transform', `translate(${v.x} ${v.y}) scale(${v.s})`);
    tl.fromTo(v, { ...from }, { ...to, duration: dur, ease, immediateRender: false, onUpdate: write }, at);
  }
  /** The place() pose that puts a point c0 at c1, scaled by s. */
  const poseAt = (c0, c1, s) => ({ x: c1[0] - c0[0] * s, y: c1[1] - c0[1] * s, s });

  /*
   * The shared layouts. A scene that hands off to the next builds the next scene's
   * opening from these same numbers.
   */
  const RAILS = [P(0, 16)[1], P(0, 444)[1]];
  const routing = (() => {
    const hubC = P(450, 230);
    const marks = ['mistral', 'google', 'anthropic', 'groq', 'openai', 'deepseek', 'kilocode', 'nvidia', 'cerebras', 'together'];
    const slots = [];
    for (let i = 0; i < 5; i++) { slots.push(P(770, 62 + 78 * i)); slots.push(P(890, 101 + 78 * i)); }
    const ups = marks.map((mark, i) => {
      const c = slots[i];
      const pts = [hubC, [P(590, 0)[0], hubC[1]], [P(650, 0)[0], c[1]], [c[0] - 36, c[1]]];
      return { mark, c, pts, draw: pts.slice(1), tick: [c[0] - 96, c[1]] };
    });
    const chipC = P(182, 230);
    return {
      hub: hubC, ring: 93, ups, trunk: [hubC, [P(590, 0)[0], hubC[1]]],
      nvidia: ups[7], kilo: ups[6],
      agent: { c: chipC, text: '$ anyr claude', size: 40 },
      source: [[chipC[0] + 176, hubC[1]], [hubC[0] - 93, hubC[1]]],
      post: { c: P(450, 92), text: 'POST /v1/chat/completions', leader: [[hubC[0], P(450, 92)[1] + 32], [hubC[0], hubC[1] - 93]] },
      models: { c: P(450, 376), leader: [[hubC[0], hubC[1] + 152], [hubC[0], P(450, 376)[1] - 32]] },
      readout: { y: 868, left: 'x-anyrouter-provider-chain: nvidia->kilo', right: 'billed once' },
    };
  })();

  const pool = (() => {
    const keyX = P(130, 0)[0];
    const busX = P(520, 0)[0];
    const outY = P(0, 328)[1];
    const keys = [['openrouter', 250], ['nvidia', 302], ['openrouter', 354], ['opencode', 406]].map(([mark, y]) => {
      const c = [keyX, P(0, y)[1]];
      return { mark, c, pts: [[keyX + 30, c[1]], [busX, c[1]]] };
    });
    const loneY = P(0, 124)[1];
    return {
      hub: P(620, 328), ring: 48,
      lone: { c: [keyX, loneY], pts: [[keyX + 30, loneY], [P(470, 0)[0], loneY]], stopX: P(470, 0)[0],
        ticks: [190, 236, 282, 328, 374, 420, 466].map(x => P(x, 0)[0]), chipX: P(482, 0)[0], rest: [P(700, 0)[0], P(900, 0)[0]] },
      keys, skipped: 2,
      bus: [[busX, keys[0].c[1]], [busX, keys[3].c[1]]],
      out: [[busX, outY], [P(900, 0)[0], outY]],
      outTicks: [700, 746, 792, 838, 884].map(x => P(x, 0)[0]),
      labels: { alone: P(110, 84), pool: P(110, 208) },
      go: { c: [1400, P(0, 262)[1]], text: 'Go plan · $0 on Pool requests' },
    };
  })();

  const mcp = (() => {
    const hubC = P(360, 230);
    const busX = P(620, 0)[0];
    const marks = ['exa', 'firecrawl', 'keenable', 'github', 'linear', 'notion', 'sentry', 'context7', 'vercel', 'cloudflare'];
    const slots = [...[0, 1, 2, 3, 4].map(i => P(740, 62 + 78 * i)), ...[0, 1, 2, 3, 4].map(i => P(880, 101 + 78 * i))];
    const servers = marks.map((mark, i) => ({ mark, c: slots[i], pts: [hubC, [busX, hubC[1]], [busX, slots[i][1]], [slots[i][0] - 36, slots[i][1]]], tick: [slots[i][0] - 96, slots[i][1]] }));
    const chipC = P(150, 230);
    return {
      hub: hubC, ring: 83, servers, busX,
      divider: P(540, 0)[0],
      agent: { c: chipC, text: '$ anyr claude', size: 40 },
      source: [[chipC[0] + 176, hubC[1]], [hubC[0] - 83, hubC[1]]],
      call: { c: P(360, 96), text: 'tools/call', leader: [[hubC[0], P(360, 96)[1] + 32], [hubC[0], hubC[1] - 83]] },
      endpoint: { c: [960, 868], text: 'https://anyrouter.dev/api/v1/mcp' },
    };
  })();

  /*
   * The reel's tall layouts (routingTall, poolTall, mcpTall in layouts.ts, 360 units wide),
   * each scaled to fit the 1080x1920 safe area (x 60-950, y 205-1215) and centred on x 505.
   */
  const fitTall = (w, h) => {
    const k = Math.min(890 / w, 1010 / h);
    const ox = 505 - (w * k) / 2, oy = 205;
    return { k, Q: (x, y) => [ox + k * x, oy + k * y] };
  };
  const tall = (() => {
    const r = fitTall(360, 456);
    const rh = r.Q(180, 150);
    const rMarks = ['mistral', 'google', 'anthropic', 'groq', 'openai', 'deepseek', 'kilocode', 'nvidia', 'cerebras', 'together'];
    const rSlots = [...[0, 1, 2, 3, 4].map(i => [68 + 56 * i, 308]), ...[0, 1, 2, 3, 4].map(i => [40 + 56 * i, 396])];
    const routingT = {
      hub: rh, ring: 42 * r.k, rails: [[r.Q(10, 12), r.Q(10, 444)], [r.Q(350, 12), r.Q(350, 444)]],
      agent: r.Q(180, 60),
      ups: rMarks.map((mark, i) => {
        const [x, y] = rSlots[i];
        const c = r.Q(x, y);
        const pts = [rh, r.Q(180, 228), r.Q(x, 256), [c[0], c[1] - 36]];
        return { mark, c, pts, draw: pts.slice(1), tick: [c[0], c[1] - 58] };
      }),
      trunk: [rh, r.Q(180, 228)],
      facts: r.Q(284, 206), factsLead: [[rh[0] + 42 * r.k, rh[1]], r.Q(284, 206)],
    };
    const p = fitTall(360, 496);
    const ph = p.Q(180, 150);
    const pKeys = [[84, 296], [276, 296], [84, 368], [276, 368], [84, 440], [276, 440]];
    const poolT = {
      hub: ph, ring: 42 * p.k, rails: [[p.Q(10, 12), p.Q(10, 484)], [p.Q(350, 12), p.Q(350, 484)]],
      caller: p.Q(180, 60),
      keys: pKeys.map(([x, y], i) => {
        const c = p.Q(x, y);
        const edge = [c[0] + (x < 180 ? 30 : -30), c[1]];
        return { mark: ['openrouter', 'nvidia', 'opencode', 'openrouter', 'openrouter', 'nvidia'][i], c, pts: [ph, p.Q(180, y - 34), edge] };
      }),
    };
    const m = fitTall(360, 500);
    const mh = m.Q(264, 86);
    const trunkX = m.Q(180, 0)[0];
    const mRows = [232, 284, 336, 388, 440];
    const mSlots = mRows.flatMap((y, i) => (i % 2 === 0 ? [112, 248] : [48, 312]).map(x => [x, y]));
    const mMarks = ['exa', 'firecrawl', 'keenable', 'github', 'linear', 'notion', 'sentry', 'context7', 'vercel', 'cloudflare'];
    const mcpT = {
      hub: mh, ring: 40 * m.k, rails: [[m.Q(10, 12), m.Q(350, 12)], [m.Q(10, 190), m.Q(350, 190)], [m.Q(10, 488), m.Q(350, 488)]],
      agentRight: m.Q(178, 86),
      call: m.Q(78, 164),
      servers: mMarks.map((mark, i) => {
        const [x, y] = mSlots[i];
        const c = m.Q(x, y);
        const edge = [c[0] + (x < 180 ? 36 : -36), c[1]];
        return { mark, c, pts: [mh, m.Q(264, 164), m.Q(180, 164), [trunkX, c[1]], edge] };
      }),
    };
    return { routing: routingT, pool: poolT, mcp: mcpT };
  })();

  /** S2's resting figure (NVIDIA refused, Kilo Code served): S3 and S4 open on it. */
  function routingRest(L) {
    const R = routing;
    const trunk = wire(L.wires, R.trunk, { stroke: T.ink, width: 3 });
    const up = R.ups.map((u, i) => {
      const served = i === 6, refused = i === 7;
      return {
        ...u,
        w: wire(L.wires, u.draw, served ? { stroke: T.ink, width: 3 } : refused ? { stroke: T.red, dash: '8 8' } : {}),
        t: ticks(L.wires, u.tick, { stroke: served ? T.ink : refused ? T.red : T.muted }),
        n: node(L.top, u.c, u.mark, { stroke: served ? T.ink : refused ? T.red : T.idle, dash: refused ? '8 8' : null, mono: !refused }),
      };
    });
    const src = wire(L.wires, R.source, { stroke: T.ink, dash: '8 8' });
    const leads = [wire(L.wires, R.post.leader), wire(L.wires, R.models.leader)];
    const h = hub(L.top, R.hub, R.ring);
    const agent = chip(L.top, R.agent.c, R.agent.text, { size: R.agent.size, stroke: T.ink, fill: T.page, color: T.ink });
    const post = chip(L.top, R.post.c, R.post.text);
    const models = chip(L.top, R.models.c, '400+ models');
    const code429 = txt(L.top, [up[7].c[0] + 56, up[7].c[1] + 12], '429', { size: 34, color: T.red });
    const code200 = txt(L.top, [up[6].c[0] + 56, up[6].c[1] + 12], '200', { size: 34, color: T.ember });
    return { trunk, up, src, leads, hub: h, agent, post, models, code429, code200 };
  }

  /** S5's resting figure (the Exa call served): S6 opens on it. */
  function mcpRest(L) {
    const M = mcp;
    const divider = el(L.rails, 'line', { x1: M.divider, x2: M.divider, y1: RAILS[0], y2: RAILS[1], stroke: T.idle, 'stroke-width': 1.5, 'stroke-dasharray': '6 6' });
    const trunk = wire(L.wires, [M.hub, [M.busX, M.hub[1]]], { stroke: T.ink, width: 3 });
    const ys = M.servers.map(s => s.c[1]);
    const bus = wire(L.wires, [[M.busX, Math.min(...ys)], [M.busX, Math.max(...ys)]]);
    const lit = new Set([0, 1, 2, 3]);
    const sv = M.servers.map((s, i) => ({
      ...s,
      w: wire(L.wires, s.pts.slice(2), i === 0 ? { stroke: T.ink, width: 3 } : {}),
      t: ticks(L.wires, s.tick, { stroke: i === 0 ? T.ink : T.muted }),
      n: node(L.top, s.c, s.mark, { stroke: lit.has(i) ? T.ink : T.idle }),
    }));
    const src = wire(L.wires, M.source, { stroke: T.ink, dash: '8 8' });
    const lead = wire(L.wires, M.call.leader);
    const h = hub(L.top, M.hub, M.ring, 'AnyRouter MCP');
    const agent = chip(L.top, M.agent.c, M.agent.text, { size: M.agent.size, stroke: T.ink, fill: T.page, color: T.ink });
    const call = chip(L.top, M.call.c, M.call.text);
    const endpoint = chip(L.top, [M.endpoint.c[0], RAILS[1]], M.endpoint.text, { stroke: T.ink, fill: T.page, color: T.ink });
    const ok = txt(L.top, [sv[0].c[0] + 56, sv[0].c[1] + 12], 'ok', { size: 34, color: T.ember });
    return { divider, trunk, bus, sv, src, lead, hub: h, agent, call, endpoint, ok };
  }

  window.Rail = { routingRest, mcpRest, place, poseAt, T, P, el, path, wire, ticks, node, hub, txt, chip, rails, dot, travel, draw, camera, morph, G: { RAILS, routing, pool, mcp, tall } };
})();
