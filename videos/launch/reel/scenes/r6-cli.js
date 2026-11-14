// The terminal at 41 columns: long lines wrap as a terminal that wide would wrap them.
// Output lines are verbatim from capture/cli/ (install.typescript, claude-dry-run.txt); "…" marks lines left out.
const INSTALL_OUT = ['  ✓ Installed   ~/.local/bin/anyr'];
const DRY_OUT = ['command: claude', '…', 'ANTHROPIC_BASE_URL=https://anyrouter.dev/api', '…', 'ANTHROPIC_MODEL=anyrouter/free'];
const COLS = 41, LH = 50, CH = 20.4;
const $ = s => root.querySelector(s);
const panel = $('.panel'), box = $('.lines');
const chipW = 13 * 24 + 40, chipC = [Rail.G.tall.mcp.agentRight[0] - 176, Rail.G.tall.mcp.hub[1]];
const pb = { left: 0, top: 200, width: 1080, height: 1020 };
const chipClip = `inset(${chipC[1] - 32 - pb.top}px ${pb.width - (chipC[0] + chipW / 2)}px ${pb.top + pb.height - (chipC[1] + 32)}px ${chipC[0] - chipW / 2}px round 10px)`;
tl.set(panel, { clipPath: chipClip, opacity: 0 }, 0);
tl.to(panel, { opacity: 1, duration: 0.12 }, 0.1);
tl.to(panel, { clipPath: 'inset(0px 0px 0px 0px round 0px)', duration: 0.9, ease: 'power3.inOut' }, 0.1);

const wrap = s => { const out = []; for (let i = 0; i < s.length; i += COLS) out.push(s.slice(i, i + COLS)); return out.length ? out : ['']; };
let n = 0;
const caret = document.createElement('span');
caret.className = 'caret';
const row = cls => { const d = document.createElement('div'); d.className = `ln ${cls}`; box.appendChild(d); gsap.set(d, { opacity: 0 }); n++; return d; };
const type = (cmd, at) => {
  const parts = wrap(`$ ${cmd}`);
  let t = at;
  parts.forEach((part, k) => {
    const d = row('');
    const p = document.createElement('span'); p.className = 'p';
    const body = document.createElement('span');
    const shown = k === 0 ? part.slice(2) : part;
    if (k === 0) { p.textContent = '$ '; d.append(p, body); } else d.append(body);
    tl.set(d, { opacity: 1 }, t);
    const s = { c: 0 };
    const dur = shown.length / 22;
    tl.fromTo(s, { c: 0 }, { c: shown.length, duration: dur, ease: 'none', immediateRender: false,
      onUpdate: () => { body.textContent = shown.slice(0, Math.round(s.c)); d.appendChild(caret); } }, t);
    t += dur;
  });
  return t;
};
const print = (lines, at) => lines.forEach((l, k) => wrap(l).forEach(part => {
  const d = row(l === '…' ? 'gap' : 'out');
  d.textContent = part;
  tl.set(d, { opacity: 1 }, at + k * 0.08);
}));
const iEnd = type('curl -fsSL https://anyrouter.dev/cli.sh | bash', w('install') - 0.1);
print(INSTALL_OUT, iEnd + 0.4);
const dEnd = type('anyr claude --dry-run --model anyrouter/free', w('then') - 0.2);
const baseRow = n + 2;
print(DRY_OUT, dEnd + 0.25);
const ul = $('.uline');
gsap.set(ul, { left: 19 * CH, top: baseRow * LH + 44, width: (COLS - 19) * CH, scaleX: 0 });
tl.to(ul, { scaleX: 1, duration: 0.45, ease: 'power3.out' }, w('through'));
