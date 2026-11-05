// Draft 3 scenes: the landing-page terminal on the ember grain backdrop, and hand-built SVG art
// (users skyline, model orbit, marble-run route, summary grid). Token values are copied from the
// anyrouter repo (packages/ui/src/styles/globals.css: --backdrop-ember-*, --hero-code-*, hero-grain).
import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { CHAPS, FPS, type Aspect, type Chap, type SceneT } from "../theme";
import { clamp, EXPO, useSpr, settle, fmt, Chip, Logo, ProviderLogo, SANS, MONO } from "../ui";

interface SP { scene: SceneT; aspect: Aspect }
const frames = (s: SceneT) => Math.round((s.end - s.start) * FPS);
const isV = (a: Aspect) => a === "9x16";
const display = (size: number, color: string): React.CSSProperties => ({ fontFamily: SANS, fontSize: size, fontWeight: 400, letterSpacing: "-0.035em", lineHeight: 1.04, color });

// ---------- terminal chrome ----------
const GRAIN = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 1.1 -.25'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`;
const EMBER = {
  light: ["oklch(0.955 0.018 60)", "oklch(0.5 0.155 32)", "oklch(0.7 0.16 45)"],
  dark: ["oklch(0.3 0.04 45)", "oklch(0.34 0.11 30)", "oklch(0.5 0.14 42)"],
};
export const TERM = {
  light: { bg: "oklch(1 0 0)", border: "oklch(0.922 0 0)", text: "oklch(0.32 0.09 262)", url: "oklch(0.42 0.13 262)", flag: "oklch(0.5 0.19 262)", kw: "oklch(0.48 0.2 300)", num: "oklch(0.5 0.16 32)", muted: "oklch(0.5 0 0)", prompt: "oklch(0.5 0.16 32)" },
  dark: { bg: "oklch(0.145 0 0)", border: "rgba(255,255,255,0.12)", text: "rgba(250,250,250,0.88)", url: "#ee8a4a", flag: "#a3a3a3", kw: "#f87171", num: "#ee8a4a", muted: "#a3a3a3", prompt: "#ee8a4a" },
};
const DOTS = ["oklch(0.577 0.245 27.325)", "oklch(0.79 0.184 86)", "oklch(0.52 0.12 163.2)"];
type Th = keyof typeof TERM;
const th = (chap: Chap): Th => (chap === "dark" ? "dark" : "light");

export const Backdrop: React.FC<{ chap: Chap; style: React.CSSProperties; pad: number; children: React.ReactNode }> = ({ chap, style, pad, children }) => {
  const [c1, c2, c3] = EMBER[th(chap)]; const page = CHAPS[chap].bg; const n = Math.round(pad * 0.36);
  return (
    <div style={{ position: "absolute", padding: pad, display: "flex", backgroundColor: c2, backgroundImage: `${GRAIN}, radial-gradient(70% 65% at 0% 0%, ${c1} 30%, transparent 72%), radial-gradient(75% 85% at 100% 100%, ${c3} 25%, transparent 75%), linear-gradient(110deg, ${c2} 35%, ${c3} 95%)`, backgroundBlendMode: "overlay, normal, normal, normal", ...style }}>
      {children}
      {[{ left: 0, top: 0 }, { right: 0, top: 0 }, { left: 0, bottom: 0 }, { right: 0, bottom: 0 }].map((p, i) => <span key={i} style={{ position: "absolute", width: n, height: n, background: page, ...p }} />)}
    </div>
  );
};

export const Window: React.FC<{ chap: Chap; title: string; fs: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ chap, title, fs, children, style }) => {
  const t = TERM[th(chap)];
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", background: t.bg, border: `1.5px solid ${t.border}`, borderRadius: fs * 0.7, overflow: "hidden", boxShadow: "0 30px 60px -30px rgba(0,0,0,0.35)", ...style }}>
      <div style={{ height: fs * 2.3, flex: "none", display: "flex", alignItems: "center", gap: fs * 0.45, padding: `0 ${fs * 0.8}px`, borderBottom: `1.5px solid ${t.border}` }}>
        {DOTS.map((c) => <span key={c} style={{ width: fs * 0.5, height: fs * 0.5, borderRadius: 99, background: c }} />)}
        <span style={{ marginLeft: fs * 0.6, fontFamily: MONO, fontSize: fs * 0.8, color: t.muted }}>{title}</span>
      </div>
      <div style={{ flex: 1, padding: `${fs * 1.0}px ${fs * 1.1}px`, fontFamily: MONO, fontSize: fs, lineHeight: 1.55, color: t.text, whiteSpace: "pre" }}>{children}</div>
    </div>
  );
};

// Types the given segments out over [from, from + chars / cps] frames; segments keep their colour.
type Seg = [string, string?];
const typed = (segs: Seg[], n: number) => {
  const out: React.ReactNode[] = []; let left = n;
  segs.forEach(([s, c], i) => { if (left <= 0) return; out.push(<span key={i} style={{ color: c }}>{s.slice(0, left)}</span>); left -= s.length; });
  return out;
};
const segLen = (segs: Seg[]) => segs.reduce((a, [s]) => a + s.length, 0);
const Caret: React.FC<{ color: string }> = ({ color }) => { const f = useCurrentFrame(); return <span style={{ color, opacity: Math.floor(f / 8) % 2 ? 0 : 1 }}>▍</span>; };

// ---------- key: one curl, the model id cycles through providers ----------
export const TermKeyScene: React.FC<SP> = ({ scene, aspect }) => {
  const p = CHAPS[scene.chap]; const t = TERM.light; const V = isV(aspect); const f = useCurrentFrame(); const d = frames(scene);
  const models: [string, string][] = scene.models; const fs = V ? 25 : 30;
  const nl = "\n    ";
  const cmd: Seg[] = [["$ ", t.prompt], ["curl ", t.kw], ["https://anyrouter.dev/api/v1/chat/completions", t.url], [" \\" + nl], ["-H ", t.flag], ['"Authorization: Bearer ', t.text], [scene.key, t.num], ['"', t.text], [" \\" + nl], ["-d ", t.flag], ["'{\"model\": \"", t.text]];
  const n = Math.floor(interpolate(f, [4, 40], [0, segLen(cmd)], clamp)); const done = n >= segLen(cmd);
  const cyc = Math.max(0, f - 42); const per = Math.max(5, Math.floor((d - 50) / models.length)); const mi = Math.min(models.length - 1, Math.floor(cyc / per));
  const [mid, slug] = models[mi]; const sw = interpolate(cyc % per, [0, 4], [0, 1], clamp);
  const head = useSpr(0, settle);
  const W = V ? 990 : 1560; const H = V ? 560 : 470;
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 0, right: 0, top: V ? 300 : 150, textAlign: "center", ...display(V ? 84 : 76, p.ink), opacity: head, transform: `translateY(${(1 - head) * 24}px)` }}>One key reaches every model.</div>
      <Backdrop chap={scene.chap} pad={V ? 34 : 48} style={{ left: (1920 - W) / 2 - (V ? 420 : 0), top: V ? 500 : 320, width: W, height: H }}>
        <Window chap={scene.chap} title="POST /api/v1/chat/completions" fs={fs}>
          {typed(cmd, n)}
          {done ? <>
            <span style={{ display: "inline-flex", alignItems: "center", gap: fs * 0.4, color: t.num, opacity: sw, transform: `translateY(${(1 - sw) * 8}px)`, verticalAlign: "bottom" }}><ProviderLogo slug={slug} size={fs * 1.1} color={t.text} />{mid}</span>
            <span>{'", "messages": [...]}\''}</span>
            {"\n\n"}<span style={{ color: DOTS[2] }}>{"HTTP/2 200"}</span>
          </> : <Caret color={t.prompt} />}
        </Window>
      </Backdrop>
    </AbsoluteFill>
  );
};

// ---------- git: anybot's commits and PRs, as the commands that counted them (facts #12, #14) ----------
export const TermGitScene: React.FC<SP> = ({ scene, aspect }) => {
  const p = CHAPS[scene.chap]; const t = TERM.dark; const V = isV(aspect); const f = useCurrentFrame(); const d = frames(scene);
  const fs = V ? 26 : 30; const nl = V ? "\n    " : " ";
  const c1: Seg[] = [["$ ", t.prompt], ["git ", t.kw], ["rev-list --count" + nl, t.text], ["--since=2026-08-05 --until=2026-11-04T23:59:59Z" + nl, t.flag], ["origin/main", t.text]];
  const c2: Seg[] = [["$ ", t.prompt], ["gh ", t.kw], ["pr list --state merged" + nl, t.text], ['--json mergedAt | jq "merged Aug 5 to Nov 4"', t.flag]];
  const a1 = 4, e1 = a1 + segLen(c1) / 3.2; const a2 = Math.max(e1 + 22, d * 0.42), e2 = a2 + segLen(c2) / 3.2;
  const n1 = Math.floor(interpolate(f, [a1, e1], [0, segLen(c1)], clamp)); const n2 = Math.floor(interpolate(f, [a2, e2], [0, segLen(c2)], clamp));
  const out = (at: number, v: number, label: string) => {
    const s = interpolate(f, [at, at + 22], [0, 1], { ...clamp, easing: EXPO });
    return f < at ? null : (
      <div style={{ display: "flex", alignItems: "baseline", gap: fs, margin: `${fs * 0.3}px 0 ${fs * 0.9}px` }}>
        <span style={{ ...display(V ? 108 : 120, p.ink), fontFamily: MONO, letterSpacing: "-0.04em", color: t.num }}>{fmt(v * s)}</span>
        <span style={{ fontFamily: SANS, fontSize: fs * 1.25, color: t.muted, opacity: s }}>{label}</span>
      </div>
    );
  };
  const W = V ? 990 : 1640; const H = V ? 860 : 700;
  return (
    <AbsoluteFill>
      <Backdrop chap={scene.chap} pad={V ? 34 : 48} style={{ left: (1920 - W) / 2 - (V ? 420 : 0), top: V ? 330 : 190, width: W, height: H }}>
        <Window chap={scene.chap} title="anybot@anyrouter: ~/anyrouter" fs={fs}>
          <div style={{ whiteSpace: "pre-wrap" }}>{typed(c1, n1)}{n1 < segLen(c1) ? <Caret color={t.prompt} /> : null}</div>
          {out(e1 + 4, 4506, "commits by anybot")}
          {f >= a2 ? <div style={{ whiteSpace: "pre-wrap" }}>{typed(c2, n2)}{n2 < segLen(c2) ? <Caret color={t.prompt} /> : null}</div> : null}
          {out(e2 + 4, 3435, "pull requests merged by anybot")}
        </Window>
      </Backdrop>
    </AbsoluteFill>
  );
};

// ---------- deploys: the deploy log, as block bars (facts #22, #23) ----------
export const TermDeployScene: React.FC<SP> = ({ scene, aspect }) => {
  const p = CHAPS[scene.chap]; const t = TERM.dark; const V = isV(aspect); const f = useCurrentFrame(); const d = frames(scene);
  const fs = V ? 26 : 30; const nl = V ? "\n    " : " ";
  const cmd: Seg[] = [["$ ", t.prompt], ["jq ", t.kw], ["-r 'select(.result==\"success\") | .ts[0:7]'" + nl, t.text], ["deploy-log.jsonl ", t.flag], ["| uniq -c", t.text]];
  const e = 4 + segLen(cmd) / 3.4; const n = Math.floor(interpolate(f, [4, e], [0, segLen(cmd)], clamp));
  const rows: [string, number][] = [["2026-08", 212], ["2026-09", 117], ["2026-10", 283], ["Nov 1-4", 141]];
  const maxW = V ? 18 : 34;
  const tot = interpolate(f, [e + 40, e + 64], [0, 1], { ...clamp, easing: EXPO });
  const W = V ? 990 : 1640; const H = V ? 860 : 700;
  return (
    <AbsoluteFill>
      <Backdrop chap={scene.chap} pad={V ? 34 : 48} style={{ left: (1920 - W) / 2 - (V ? 420 : 0), top: V ? 330 : 190, width: W, height: H }}>
        <Window chap={scene.chap} title="anybot@anyrouter: ~/anyrouter" fs={fs}>
          <div style={{ whiteSpace: "pre-wrap" }}>{typed(cmd, n)}{n < segLen(cmd) ? <Caret color={t.prompt} /> : null}</div>
          <div style={{ marginTop: fs * 0.6 }}>
            {rows.map(([m, v], i) => {
              const g = interpolate(f, [e + 4 + i * 6, e + 22 + i * 6], [0, 1], { ...clamp, easing: EXPO });
              const blocks = Math.round((v / 283) * maxW * g);
              return f < e + 4 + i * 6 ? null : (
                <div key={m} style={{ display: "flex", gap: fs * 0.8, alignItems: "center", lineHeight: 1.5 }}>
                  <span style={{ color: t.muted, width: fs * 4.6 }}>{m}</span>
                  <span style={{ color: m === "2026-10" ? t.num : t.text, letterSpacing: "-0.08em" }}>{"█".repeat(blocks)}</span>
                  <span style={{ color: t.text }}>{Math.round(v * g)}</span>
                </div>
              );
            })}
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: fs, marginTop: fs * 1.1, opacity: tot }}>
            <span style={{ ...display(V ? 108 : 120, p.ink), fontFamily: MONO, letterSpacing: "-0.04em", color: t.num }}>{fmt(753 * tot)}</span>
            <span style={{ fontFamily: SANS, fontSize: fs * 1.25, color: t.muted }}>deploys by anybot since Aug 5</span>
          </div>
          <div style={{ fontFamily: SANS, fontSize: fs * 1.15, color: t.text, opacity: interpolate(f, [e + 64, e + 80], [0, 1], clamp) }}>busiest day: 59 deploys on Oct 31</div>
        </Window>
      </Backdrop>
    </AbsoluteFill>
  );
};

// ---------- skyline: users, cumulative by week, as a row of towers (facts #6a) ----------
export const SkylineScene: React.FC<SP> = ({ scene, aspect }) => {
  const p = CHAPS[scene.chap]; const V = isV(aspect); const f = useCurrentFrame(); const d = frames(scene);
  const vals: number[] = scene.total; const n = vals.length; const yMax = 16000;
  const countF = Math.min(36, Math.max(24, d * 0.32)); const land = Math.round(countF);
  const lab = useSpr(Math.round(countF * 0.55)); const chip = useSpr(land + 8);
  const rule = interpolate(f, [land - 2, land + 10], [0, 1], { ...clamp, easing: EXPO });
  const W = V ? 960 : 900; const H = V ? 520 : 640; const gap = V ? 12 : 14; const bw = (W - gap * (n - 1)) / n;
  const num = Math.round(interpolate(f, [0, countF], [0, scene.n], { ...clamp, easing: EXPO }));
  const block: React.CSSProperties = V ? { left: 0, right: 0, top: 170, alignItems: "center" } : { left: 150, top: 250, width: 760, alignItems: "flex-start" };
  const box: React.CSSProperties = V ? { left: 60, top: 800 } : { right: 110, top: 200 };
  const ticks: [number, string][] = [[0, "Aug 4"], [4, "Sep 1"], [9, "Oct 6"], [13, "Nov 4"]];
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", display: "flex", flexDirection: "column", ...block }}>
        <div style={{ ...display(V ? 260 : 230, p.ink), fontVariantNumeric: "tabular-nums" }}>{fmt(num)}</div>
        <div style={{ height: 8, width: 160 * rule, background: p.accent, borderRadius: 9, margin: `${V ? 22 : 18}px 0 ${V ? 28 : 24}px` }} />
        <div style={{ ...display(V ? 62 : 62, p.ink), opacity: Math.min(1, lab * 2), transform: `translateY(${(1 - lab) * 26}px)` }}>{scene.label}</div>
        <div style={{ marginTop: V ? 34 : 30, opacity: Math.min(1, chip * 2), transform: `scale(${0.85 + 0.15 * chip})` }}><Chip chap={scene.chap} size={V ? 34 : 30} accent>{scene.chip}</Chip></div>
      </div>
      <svg width={W} height={H + 60} style={{ position: "absolute", ...box, overflow: "visible" }}>
        <defs>
          <pattern id={`win-${aspect}`} width={10} height={14} patternUnits="userSpaceOnUse"><rect x={3} y={4} width={4} height={6} rx={1} fill={p.hair} /></pattern>
          <pattern id={`winA-${aspect}`} width={10} height={14} patternUnits="userSpaceOnUse"><rect x={3} y={4} width={4} height={6} rx={1} fill="rgba(255,255,255,0.45)" /></pattern>
        </defs>
        <text x={0} y={-14} fontFamily={SANS} fontSize={V ? 30 : 26} fill={p.muted}>{scene.chartNote}</text>
        {vals.map((v, i) => {
          const g = interpolate(f, [8 + i * 3.2, 30 + i * 3.2], [0, 1], { ...clamp, easing: EXPO });
          const h = Math.max(6, (v / yMax) * H * g); const x = i * (bw + gap); const hot = i >= n - 2;
          return (
            <g key={i}>
              <rect x={x} y={H - h} width={bw} height={h} rx={4} fill={hot ? p.accent : p.plate} stroke={hot ? p.accent : p.hair} strokeWidth={1.5} />
              <rect x={x + 2} y={H - h + 8} width={bw - 4} height={Math.max(0, h - 12)} fill={`url(#${hot ? "winA" : "win"}-${aspect})`} />
            </g>
          );
        })}
        <line x1={-10} x2={W + 10} y1={H} y2={H} stroke={p.ink} strokeWidth={2} />
        {ticks.map(([i, s]) => <text key={s} x={i * (bw + gap) + bw / 2} y={H + 40} textAnchor={i === 0 ? "start" : i === n - 1 ? "end" : "middle"} fontFamily={MONO} fontSize={V ? 26 : 22} fill={p.muted}>{s}</text>)}
        {[[0, vals[0]], [n - 1, vals[n - 1]]].map(([i, v]) => (
          <text key={i} x={i * (bw + gap) + bw / 2} y={H - (v / yMax) * H - 16} textAnchor={i === 0 ? "start" : "end"} fontFamily={MONO} fontSize={V ? 28 : 26} fill={i === 0 ? p.muted : p.accent} opacity={interpolate(f, [30 + i * 3.2, 40 + i * 3.2], [0, 1], clamp)}>{fmt(v)}</text>
        ))}
      </svg>
    </AbsoluteFill>
  );
};

// ---------- orbit: provider logos circling the AnyRouter mark (catalog art) ----------
export const Orbit: React.FC<{ chap: Chap; aspect: Aspect; models: [string, string][] }> = ({ chap, aspect, models }) => {
  const p = CHAPS[chap]; const V = isV(aspect); const f = useCurrentFrame();
  const cx = V ? 540 : 1400; const cy = V ? 1110 : 560; const R = V ? [130, 215, 300] : [150, 245, 340];
  const o = interpolate(f, [0, 14], [0, 1], clamp);
  const rings = [models.slice(0, 3), models.slice(3, 6), models.slice(6)];
  return (
    <div style={{ position: "absolute", inset: 0, opacity: o }}>
      <svg width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
        {R.map((r, i) => <circle key={r} cx={cx} cy={cy} r={r * Math.min(1, interpolate(f, [i * 4, 20 + i * 4], [0.6, 1], { ...clamp, easing: EXPO }))} fill="none" stroke={p.hair} strokeWidth={1.5} strokeDasharray={i === 1 ? "4 10" : undefined} />)}
        {Array.from({ length: 36 }, (_, k) => { const a = (k / 36) * Math.PI * 2 + f * 0.002; const r = R[2] + 40 + (k % 3) * 14; return <circle key={k} cx={cx + Math.cos(a) * r} cy={cy + Math.sin(a) * r} r={2} fill={p.hair} />; })}
      </svg>
      <div style={{ position: "absolute", left: cx, top: cy, transform: "translate(-50%,-50%)", width: V ? 120 : 132, height: V ? 120 : 132, borderRadius: 99, background: p.ink, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 0 0 14px ${p.accent}18` }}><Logo size={V ? 58 : 64} color={p.bg} /></div>
      {rings.flatMap((ms, ri) => ms.map(([id, slug], j) => {
        const dir = ri % 2 ? -1 : 1; const a = (j / ms.length) * Math.PI * 2 + ri * 0.7 + dir * f * (0.012 - ri * 0.002);
        const s = interpolate(f, [6 + (ri * 3 + j) * 2, 18 + (ri * 3 + j) * 2], [0, 1], { ...clamp, easing: EXPO });
        const x = cx + Math.cos(a) * R[ri] * s; const y = cy + Math.sin(a) * R[ri] * s; const z = V ? 64 : 70;
        return <div key={id} style={{ position: "absolute", left: x, top: y, width: z, height: z, transform: "translate(-50%,-50%)", borderRadius: 99, background: p.bg, border: `1.5px solid ${p.hair}`, display: "flex", alignItems: "center", justifyContent: "center", opacity: s }}><ProviderLogo slug={slug} size={z * 0.5} color={p.ink} /></div>;
      }))}
    </div>
  );
};

// ---------- route: a marble-run track; the ball drops at A (429), the diverter sends it to B (200) ----------
type Pt = [number, number];
const bez = (a: Pt, b: Pt, c: Pt, d: Pt, t: number): Pt => { const u = 1 - t; return [u * u * u * a[0] + 3 * u * u * t * b[0] + 3 * u * t * t * c[0] + t * t * t * d[0], u * u * u * a[1] + 3 * u * u * t * b[1] + 3 * u * t * t * c[1] + t * t * t * d[1]]; };
const bpath = (a: Pt, b: Pt, c: Pt, d: Pt) => `M${a[0]},${a[1]} C${b[0]},${b[1]} ${c[0]},${c[1]} ${d[0]},${d[1]}`;
export const RouteRunScene: React.FC<SP> = ({ scene, aspect }) => {
  const p = CHAPS[scene.chap]; const V = isV(aspect); const f = useCurrentFrame(); const d = frames(scene); const { width, height } = useVideoConfig();
  const N = V ? { app: [540, 470] as Pt, gw: [540, 760] as Pt, a: [270, 1080] as Pt, b: [810, 1080] as Pt } : { app: [250, 470] as Pt, gw: [820, 470] as Pt, a: [1560, 270] as Pt, b: [1560, 680] as Pt };
  const L1: Pt[] = V ? [N.app, [540, 560], [540, 660], N.gw] : [N.app, [430, 470], [640, 470], N.gw];
  const LA: Pt[] = V ? [N.gw, [540, 900], [270, 900], N.a] : [N.gw, [1100, 470], [1250, 270], N.a];
  const LB: Pt[] = V ? [N.gw, [540, 900], [810, 900], N.b] : [N.gw, [1100, 470], [1250, 680], N.b];
  const LR: Pt[] = V ? [N.b, [1000, 1080], [1000, 470], N.app] : [N.b, [1560, 800], [250, 800], N.app];
  const T = (a: number, b: number) => interpolate(f, [d * a, d * b], [0, 1], { ...clamp, easing: Easing2 });
  const s1 = T(0.04, 0.16), sA = T(0.18, 0.3), fail = interpolate(f, [d * 0.3, d * 0.33], [0, 1], clamp), sB = T(0.36, 0.5), ok = interpolate(f, [d * 0.5, d * 0.53], [0, 1], clamp), sR = T(0.55, 0.74);
  let ball: Pt; let bc = p.accent;
  if (f < d * 0.18) ball = bez(L1[0], L1[1], L1[2], L1[3], s1);
  else if (f < d * 0.36) { const back = interpolate(f, [d * 0.3, d * 0.36], [0, 1], clamp); ball = bez(LA[0], LA[1], LA[2], LA[3], sA - back * 0.25); if (fail > 0) bc = p.bad; }
  else if (f < d * 0.55) ball = bez(LB[0], LB[1], LB[2], LB[3], sB);
  else ball = bez(LR[0], LR[1], LR[2], LR[3], sR);
  const head = useSpr(2, settle); const hdr = useSpr(Math.round(d * 0.55), settle);
  const rail = (P: Pt[], c: string, k: string) => (
    <g key={k}>
      <path d={bpath(P[0], P[1], P[2], P[3])} fill="none" stroke={c} strokeWidth={22} strokeLinecap="round" />
      <path d={bpath(P[0], P[1], P[2], P[3])} fill="none" stroke={p.bg} strokeWidth={14} strokeLinecap="round" />
    </g>
  );
  const node = (pos: Pt, label: string, sub: string, state: "idle" | "bad" | "ok", big = false, dx = 0) => {
    const bcol = state === "bad" ? p.bad : state === "ok" ? p.ok : p.hair;
    return (
      <div style={{ position: "absolute", left: pos[0] + dx, top: pos[1], transform: "translate(-50%,-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
        <div style={{ padding: V ? "24px 30px" : "22px 28px", borderRadius: 20, background: big ? p.ink : p.plate, color: big ? p.bg : p.ink, border: `2px solid ${big ? p.ink : bcol}`, display: "flex", alignItems: "center", gap: 14, fontFamily: SANS, fontSize: V ? 38 : 36, fontWeight: 500, whiteSpace: "nowrap" }}>{big ? <Logo size={V ? 40 : 38} color={p.bg} /> : null}{label}</div>
        <div style={{ fontFamily: MONO, fontSize: V ? 27 : 25, color: state === "bad" ? p.bad : state === "ok" ? p.ok : p.muted, fontWeight: state === "idle" ? 400 : 600, whiteSpace: "nowrap" }}>{sub}</div>
      </div>
    );
  };
  const shake = f > d * 0.3 && f < d * 0.36 ? Math.sin(f * 2.4) * 9 : 0;
  const t = TERM.light;
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 0, right: 0, top: V ? 200 : 80, textAlign: "center", ...display(V ? 84 : 72, p.ink), opacity: head, transform: `translateY(${(1 - head) * 24}px)` }}>Automatic fallback.</div>
      <svg width={width} height={height} style={{ position: "absolute", inset: 0 }}>
        {rail(LR, p.hair, "r")}{rail(L1, p.hair, "1")}{rail(LA, fail > 0 ? p.bad : p.hair, "a")}{rail(LB, ok > 0 ? p.ok : p.hair, "b")}
        <circle cx={ball[0] + 3} cy={ball[1] + 5} r={16} fill="rgba(0,0,0,0.12)" />
      </svg>
      {node(N.app, "Your app", "POST /v1/chat/completions", "idle")}
      {node(N.gw, "AnyRouter", "picks a route", "idle", true)}
      {node(N.a, "Upstream A", fail > 0 ? "429 rate limited" : "first choice", fail > 0 ? "bad" : "idle", false, shake)}
      {node(N.b, "Upstream B", ok > 0 ? "200 OK" : "next in line", ok > 0 ? "ok" : "idle")}
      <div style={{ position: "absolute", left: ball[0], top: ball[1], width: 30, height: 30, borderRadius: 99, background: `radial-gradient(circle at 35% 35%, #fff8 0 18%, ${bc} 40%)`, transform: "translate(-50%,-50%)" }} />
      <Backdrop chap={scene.chap} pad={V ? 22 : 20} style={{ left: V ? 50 : 460, width: V ? 980 : 1000, top: V ? 1190 : 790, height: V ? 220 : 172, opacity: hdr, transform: `translateY(${(1 - hdr) * 20}px)` }}>
        <Window chap={scene.chap} title="response headers" fs={V ? 21 : 22}>
          <span style={{ color: t.flag }}>x-anyrouter-provider-chain: </span>
          <span>upstream-a </span><span style={{ color: p.bad }}>429</span><span style={{ color: t.muted }}> → </span><span>upstream-b </span><span style={{ color: p.ok }}>200</span>
        </Window>
      </Backdrop>
    </AbsoluteFill>
  );
};
const Easing2 = (x: number) => (x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2);

// ---------- grid: the end-of-video metrics wall, one tile per headline number ----------
const ICON: Record<string, React.ReactNode> = {
  user: <><circle cx={12} cy={8} r={4} /><path d="M4 21c0-4 3.6-6 8-6s8 2 8 6" /></>,
  pulse: <polyline points="2,12 7,12 10,5 14,19 17,12 22,12" />,
  calendar: <><rect x={3} y={5} width={18} height={16} rx={2} /><path d="M3 10h18M8 3v4M16 3v4" /></>,
  cube: <><path d="M12 2l9 5v10l-9 5-9-5V7z" /><path d="M3 7l9 5 9-5M12 12v10" /></>,
  arrows: <path d="M4 8h15l-4-4M20 16H5l4 4" />,
  spark: <path d="M12 3l1.8 7.2L21 12l-7.2 1.8L12 21l-1.8-7.2L3 12l7.2-1.8z" />,
  commit: <><circle cx={12} cy={12} r={3.5} /><path d="M2 12h6.5M15.5 12H22" /></>,
  plus: <><rect x={3} y={3} width={18} height={18} rx={3} /><path d="M12 8v8M8 12h8" /></>,
  rocket: <><path d="M12 3c3 2 5 6 5 10l-2 3H9l-2-3c0-4 2-8 5-10z" /><circle cx={12} cy={10} r={1.6} /><path d="M9 16l-2 4 3-1M15 16l2 4-3-1" /></>,
};
const Spark: React.FC<{ data: number[]; w: number; h: number; color: string; prog: number; bars?: boolean; hair: string }> = ({ data, w, h, color, prog, bars, hair }) => {
  const max = Math.max(...data); const X = (i: number) => (i / (data.length - 1)) * w; const Y = (v: number) => h - (v / max) * h;
  if (bars) { const bw = w / data.length - 6; return <svg width={w} height={h}>{data.map((v, i) => <rect key={i} x={i * (bw + 6)} y={h - (v / max) * h * prog} width={bw} height={(v / max) * h * prog} rx={2} fill={i === 2 ? color : hair} />)}</svg>; }
  const dd = data.map((v, i) => `${i ? "L" : "M"}${X(i).toFixed(1)},${Y(v).toFixed(1)}`).join(" ");
  return (
    <svg width={w} height={h} style={{ overflow: "visible" }}>
      <defs><clipPath id={`sp-${w}-${data.length}-${data[data.length - 1]}`}><rect x={-4} y={-6} width={(w + 8) * prog} height={h + 12} /></clipPath></defs>
      <g clipPath={`url(#sp-${w}-${data.length}-${data[data.length - 1]})`}>
        <path d={`${dd} L${w},${h} L0,${h} Z`} fill={color} opacity={0.1} />
        <path d={dd} fill="none" stroke={color} strokeWidth={3} strokeLinejoin="round" strokeLinecap="round" />
      </g>
    </svg>
  );
};
export const GridScene: React.FC<SP> = ({ scene, aspect }) => {
  // One tile per headline metric. Every label names its own window (all time, today, last 30 days, since Aug 5).
  const p = CHAPS[scene.chap]; const V = isV(aspect); const f = useCurrentFrame();
  type Tile = { icon: string; v: (k: number) => string; label: string; sub?: string; spark?: number[]; bars?: boolean; wide?: boolean };
  const tiles: Tile[] = [
    { icon: "user", v: (k) => fmt(15034 * k), label: "users, all time", sub: "up from 1,695 on Aug 4", spark: scene.users, wide: true },
    { icon: "calendar", v: (k) => fmt(5966 * k), label: "active users, last 30 days" },
    { icon: "pulse", v: (k) => fmt(2288 * k), label: "daily users at the peak", sub: "Oct 26", spark: scene.dau },
    { icon: "cube", v: (k) => fmt(323 * k), label: "models live today" },
    { icon: "plus", v: (k) => fmt(220 * k), label: "models added since Aug 5", spark: scene.models },
    { icon: "arrows", v: (k) => `${(1.3 * k).toFixed(1)}M`, label: "requests, last 30 days", sub: "Oct 6 to Nov 4", spark: scene.req, wide: true },
    { icon: "spark", v: (k) => `${Math.round(65 * k)}B`, label: "tokens, last 30 days" },
    { icon: "commit", v: (k) => fmt(4506 * k), label: "commits by anybot since Aug 5", sub: "3,435 pull requests merged · 2,278 commits with an AI co-author", wide: true },
    { icon: "rocket", v: (k) => fmt(753 * k), label: "deploys by anybot since Aug 5", sub: "59 on Oct 31", spark: [212, 117, 283, 141], bars: true },
  ];
  const cols = V ? 2 : 4; const gx = V ? 18 : 22; const padX = V ? 56 : 110; const rows = V ? 6 : 3;
  const top = V ? 300 : 205; const bottom = V ? 1830 : 1040;
  const tw = ((V ? 1080 : 1920) - padX * 2 - gx * (cols - 1)) / cols; const thh = (bottom - top - gx * (rows - 1)) / rows;
  const head = useSpr(0, settle);
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: padX, right: padX, top: V ? 150 : 70, display: "flex", alignItems: "baseline", justifyContent: "space-between", flexWrap: "wrap", rowGap: 8, opacity: head, transform: `translateY(${(1 - head) * 20}px)` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}><Logo size={V ? 54 : 52} color={p.ink} /><span style={{ ...display(V ? 70 : 66, p.ink) }}>In numbers</span></div>
        <span style={{ fontFamily: MONO, fontSize: V ? 28 : 28, color: p.muted }}>Aug 5 to Nov 4, 2026</span>
      </div>
      <div style={{ position: "absolute", left: padX, top, display: "grid", gridTemplateColumns: `repeat(${cols}, ${tw}px)`, gridAutoRows: `${thh}px`, gridAutoFlow: "row dense", gap: gx }}>
        {tiles.map((t, i) => {
          const s = useSpr(4 + i * 4); const k = interpolate(f, [8 + i * 4, 40 + i * 4], [0, 1], { ...clamp, easing: EXPO });
          const sw = t.wide ? (V ? 360 : 330) : V ? 150 : 140;
          return (
            <div key={t.label} style={{ gridColumn: t.wide ? "span 2" : undefined, position: "relative", padding: V ? "20px 24px" : "22px 26px", borderRadius: 20, background: p.plate, border: `1.5px solid ${p.hair}`, display: "flex", flexDirection: "column", justifyContent: "flex-end", opacity: Math.min(1, s * 2), transform: `translateY(${(1 - s) * 40}px) scale(${0.96 + 0.04 * s})`, overflow: "hidden" }}>
              <svg style={{ position: "absolute", left: V ? 24 : 26, top: V ? 20 : 22 }} width={V ? 38 : 38} height={V ? 38 : 38} viewBox="0 0 24 24" fill="none" stroke={p.ink} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">{ICON[t.icon]}</svg>
              {t.spark ? <div style={{ position: "absolute", right: V ? 24 : 26, top: V ? 26 : 28 }}><Spark data={t.spark} w={sw} h={V ? 56 : 58} color={p.accent} prog={k} bars={t.bars} hair={p.hair} /></div> : null}
              <div style={{ ...display(V ? 70 : 74, p.ink), fontVariantNumeric: "tabular-nums" }}>{t.v(k)}</div>
              <div style={{ fontFamily: SANS, fontSize: V ? 26 : 24, color: p.ink, marginTop: 8, letterSpacing: "-0.01em" }}>{t.label}</div>
              {t.sub ? <div style={{ fontFamily: SANS, fontSize: V ? 22 : 20, color: p.muted, marginTop: 4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t.sub}</div> : null}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
