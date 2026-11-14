// The home hero's own base URL field and subline, verbatim; then the model count chip.
const { T, G, hub, chip } = Rail;
const R = G.tall.routing, PT = G.tall.pool;
const h = hub(L.top, R.hub, R.ring, null);
const top = [505, 400];
Rail.place(tl, h.el, { x: 0, y: 0, s: 1 }, Rail.poseAt(R.hub, top, 1), 0.1, 0.8);
const $ = s => root.querySelector(s);
tl.fromTo($('.plate'), { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }, w('change') - 0.2);
tl.fromTo($('.plate .ul'), { scaleX: 0 }, { scaleX: 1, duration: 0.45, ease: 'power3.out' }, w('url'));
tl.fromTo($('.note'), { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' }, w('keep'));
const models = chip(L.top, [505, 1050], '400+ models', { size: 48, stroke: T.ink, fill: T.page, color: T.ink });
tl.fromTo(models.el, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' }, w('more') - 0.1);
// hand-off: the hub slides to where the Pool's hub sits
const out = 5.2;
tl.to([$('.plate'), $('.note'), models.el], { opacity: 0, duration: 0.4 }, out);
Rail.place(tl, h.el, Rail.poseAt(R.hub, top, 1), Rail.poseAt(R.hub, PT.hub, PT.ring / R.ring), out + 0.1, 0.7);
