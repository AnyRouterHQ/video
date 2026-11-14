// Stacked end card: the hub, the home H1 on two lines, three ways in. The last 1.5s hold still.
const { el, hub, dot } = Rail;
const C = [505, 420], RING = 93;
const H = hub(L.top, C, RING, null);
const dots = el(L.top, 'g');
tl.fromTo(H.el, { opacity: 0 }, { opacity: 1, duration: 0.4, ease: 'power3.out' }, 0);
const words = [...root.querySelectorAll('h1 span')];
[w('one'), w('key'), w('every'), w('model')].forEach((at, i) =>
  tl.fromTo(words[i], { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.3, ease: 'power3.out' }, at - 0.05));
[['.r1', w('pool')], ['.r2', w('start')], ['.r3', w('anyrouter.dev')]].forEach(([s, at]) =>
  tl.fromTo(root.querySelector(s), { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.35, ease: 'power3.out' }, at));
const d = dot(dots, 11);
const a = { t: 0 };
tl.set(d, { attr: { opacity: 1 } }, 0.4);
tl.fromTo(a, { t: 0 }, { t: 1, duration: 2, ease: 'none', immediateRender: false, onUpdate: () => {
  const th = -Math.PI / 2 + a.t * 2 * Math.PI;
  d.setAttribute('cx', C[0] + RING * Math.cos(th));
  d.setAttribute('cy', C[1] + RING * Math.sin(th));
} }, 0.4);
tl.set(d, { attr: { opacity: 0 } }, 2.4);
