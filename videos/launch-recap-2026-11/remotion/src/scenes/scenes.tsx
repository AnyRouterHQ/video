import React from "react";
import { AbsoluteFill, Sequence, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { KineticCenterBuild } from "../lib/remocn/kinetic-center-build";
import { RollingNumber } from "../lib/remocn/rolling-number";
import { AnimatedLineChart } from "../lib/remocn/animated-line-chart";
import { InfiniteMarquee } from "../lib/remocn/infinite-marquee";
import { TypeWall } from "../lib/remocn/type-wall";
import { GravityPile } from "../lib/remocn/gravity-pile";
import { SpringScaleIn } from "../lib/remocn/spring-scale-in";
import { StaggeredFadeUp } from "../lib/remocn/staggered-fade-up";
import { TrimBurst } from "../lib/remocn/trim-burst";
import { CHAPS, FPS, type Aspect, type SceneT } from "../theme";
import { clamp, EXPO, useSpr, settle, fmt, Chip, Logo, ProviderLogo, SANS, MONO } from "../ui";
import { GridScene, Orbit, RouteRunScene, SkylineScene, TermDeployScene, TermGitScene, TermKeyScene } from "./d3";

export interface SP { scene: SceneT; aspect: Aspect }
const frames = (s: SceneT) => Math.round((s.end - s.start) * FPS);
const isV = (a: Aspect) => a === "9x16";
const isSq = (a: Aspect) => a === "1x1";

// Display type per DESIGN.md: Geist regular, tight tracking, line-height ~1.05.
const display = (size: number, color: string): React.CSSProperties => ({ fontFamily: SANS, fontSize: size, fontWeight: 400, letterSpacing: "-0.035em", lineHeight: 1.04, color });

// ---------- title: kicker, kinetic "3 months.", logo lockup ----------
export const TitleScene: React.FC<SP> = ({ scene, aspect }) => {
  const p = CHAPS[scene.chap]; const V = isV(aspect); const f = useCurrentFrame();
  const k = useSpr(2, settle); const sub = useSpr(22);
  const fs = V ? 210 : isSq(aspect) ? 200 : 260;
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <div style={{ position: "absolute", top: V ? "31%" : "20%", width: "100%", display: "flex", justifyContent: "center", alignItems: "center", gap: 20, opacity: Math.min(1, k * 2), transform: `translateY(${(1 - k) * 30}px)` }}>
        <Logo size={V ? 68 : 62} color={p.ink} />
        <span style={{ ...display(V ? 68 : 62, p.ink), fontWeight: 500 }}>AnyRouter</span>
        <span style={{ ...display(V ? 68 : 62, p.muted) }}>turns</span>
      </div>
      <div style={{ position: "absolute", inset: 0 }}><KineticCenterBuild text={scene.text} fontSize={fs} fontWeight={400} color={p.ink} entryOffset={fs * 0.6} /></div>
      <div style={{ position: "absolute", top: V ? "61%" : "67%", width: "100%", textAlign: "center", fontFamily: MONO, fontSize: V ? 36 : 34, color: p.muted, opacity: Math.min(1, sub * 2), transform: `translateY(${(1 - sub) * 30}px)` }}>{scene.kicker}</div>
      <div style={{ position: "absolute", left: "50%", top: V ? "57.5%" : "61%", height: 6, width: interpolate(f, [16, 34], [0, V ? 360 : 420], { ...clamp, easing: EXPO }), transform: "translateX(-50%)", background: p.accent, borderRadius: 9 }} />
    </AbsoluteFill>
  );
};

// ---------- words: springy headline, em words underlined in accent ----------
export const WordsScene: React.FC<SP> = ({ scene, aspect }) => {
  const p = CHAPS[scene.chap]; const V = isV(aspect);
  const words: string[] = scene.text.split(" "); const em = new Set((scene.em || "").split(" ").filter(Boolean));
  const fs = V ? (scene.text.length > 18 ? 128 : 150) : scene.text.length > 18 ? 168 : 200;
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", padding: V ? 70 : 160 }}>
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", columnGap: fs * 0.24, maxWidth: V ? 940 : isSq(aspect) ? 960 : 1600, textAlign: "center", ...display(fs, p.ink) }}>
        {words.map((w, i) => <Word key={i} i={i} em={em.has(w)} accent={p.accent}>{w}</Word>)}
      </div>
    </AbsoluteFill>
  );
};
const Word: React.FC<{ i: number; em: boolean; accent: string; children: React.ReactNode }> = ({ i, em, accent, children }) => {
  const s = useSpr(1 + i * 3); const f = useCurrentFrame();
  const u = interpolate(f, [10 + i * 3, 22 + i * 3], [0, 1], { ...clamp, easing: EXPO });
  return (
    <span style={{ position: "relative", display: "inline-block", opacity: Math.min(1, s * 3), transform: `translateY(${(1 - s) * 0.5}em) rotate(${(1 - s) * -5}deg) scale(${0.85 + 0.15 * s})` }}>
      {children}
      {em ? <span style={{ position: "absolute", left: 0, bottom: "-0.02em", height: "0.06em", width: `${u * 100}%`, background: accent, borderRadius: 99 }} /> : null}
    </span>
  );
};

// ---------- fan: one key, lines out to every model ----------
export const FanScene: React.FC<SP> = ({ scene, aspect }) => {
  const p = CHAPS[scene.chap]; const V = isV(aspect); const f = useCurrentFrame(); const { width, height } = useVideoConfig();
  const models: [string, string][] = scene.models; const typed = Math.floor(interpolate(f, [4, 22], [0, scene.key.length], clamp));
  const keyS = useSpr(0, settle);
  const kx = V ? width / 2 : width * 0.26; const ky = V ? height * 0.26 : height / 2;
  const n = models.length; const fs = V ? 30 : 30; const rowH = V ? 64 : 88;
  const mx = V ? width / 2 : width * 0.66; const my0 = V ? height * 0.42 : height / 2 - ((n - 1) * rowH) / 2;
  const head = useSpr(n * 3 + 26);
  return (
    <AbsoluteFill>
      <svg width={width} height={height} style={{ position: "absolute", inset: 0 }}>
        {models.map((_, i) => {
          const t = interpolate(f, [22 + i * 3, 40 + i * 3], [0, 1], { ...clamp, easing: EXPO });
          const ty = my0 + i * rowH; const tx = V ? mx : mx - 250;
          const x2 = kx + (tx - kx) * t; const y2 = ky + (ty - ky) * t;
          const path = V ? `M ${kx} ${ky + 50} C ${kx} ${ky + 200}, ${tx - 330} ${ty}, ${kx + (tx - 330 - kx) * t} ${ky + 50 + (ty - ky - 50) * t}` : `M ${kx + 230} ${ky} C ${kx + 420} ${ky}, ${tx - 200} ${ty}, ${x2} ${y2}`;
          return <path key={i} d={path} fill="none" stroke={i === 0 ? p.accent : p.hair} strokeWidth={i === 0 ? 3 : 2} opacity={t} />;
        })}
      </svg>
      <div style={{ position: "absolute", left: kx, top: ky, transform: `translate(-50%, -50%) scale(${0.8 + 0.2 * keyS})`, opacity: keyS }}>
        <div style={{ fontFamily: MONO, fontSize: V ? 44 : 38, color: p.ink, background: p.plate, border: `1.5px solid ${p.hair}`, borderRadius: 18, padding: V ? "26px 36px" : "22px 30px", whiteSpace: "nowrap" }}>
          {scene.key.slice(0, typed)}<span style={{ opacity: Math.floor(f / 8) % 2 ? 0 : 1, color: p.accent }}>▍</span>
        </div>
        <div style={{ textAlign: "center", marginTop: 18, fontFamily: SANS, fontSize: V ? 34 : 28, color: p.muted }}>one API key</div>
      </div>
      {models.map(([id, slug], i) => {
        const s = useSpr(26 + i * 3);
        const ty = my0 + i * rowH;
        return (
          <div key={id} style={{ position: "absolute", left: V ? mx - 330 : mx - 250, top: ty, transform: `translate(0, -50%) translateX(${(1 - s) * 60}px)`, opacity: Math.min(1, s * 2), display: "flex", alignItems: "center", gap: 18, fontFamily: MONO, fontSize: fs, color: p.ink, whiteSpace: "nowrap" }}>
            <ProviderLogo slug={slug} size={fs * 1.2} color={p.ink} />{id}
          </div>
        );
      })}
      <div style={{ position: "absolute", ...(V ? { left: 0, right: 0, top: height * 0.08, textAlign: "center" } : { left: kx - 300, width: 600, top: ky - 230, textAlign: "center" }), ...display(V ? 92 : 76, p.ink), opacity: head, transform: `translateY(${(1 - head) * 30}px)` }}>Every model.</div>
    </AbsoluteFill>
  );
};

// ---------- stat: rolling number, label, accent rule, extras ----------
export const StatScene: React.FC<SP> = ({ scene, aspect }) => {
  const p = CHAPS[scene.chap]; const V = isV(aspect); const Sq = isSq(aspect); const f = useCurrentFrame(); const d = frames(scene);
  const n: number = scene.n; const digits = fmt(n).length;
  const right = scene.align === "right" && !V && !Sq;
  const W = V ? 1080 : Sq ? 1080 : 1920;
  const fs0 = scene.small ? (V ? 300 : 340) : V ? 330 : Sq ? 300 : 400;
  const fs = Math.min(fs0, ((V || Sq ? 0.86 : scene.chart ? 0.5 : 0.62) * W) / (digits * 0.6));
  const countF = Math.min(36, Math.max(24, d * 0.32));
  const lab = useSpr(Math.round(countF * 0.55)); const land = Math.round(countF);
  const rule = interpolate(f, [land - 2, land + 10], [0, 1], { ...clamp, easing: EXPO });
  const chip = useSpr(land + 8);
  const pad = V ? 80 : 150; const hasChart = !!scene.chart && !V && !Sq;
  const just = V || Sq ? "center" : right ? "flex-end" : "flex-start";
  const block: React.CSSProperties = V || Sq
    ? { position: "absolute", left: 0, right: 0, top: scene.chart ? (V ? "11%" : "12%") : scene.bars ? (V ? "13%" : "8%") : scene.orbit ? (V ? "9%" : "12%") : V ? "30%" : "20%", display: "flex", flexDirection: "column", alignItems: "center" }
    : { position: "absolute", top: hasChart ? "18%" : "25%", [right ? "right" : "left"]: pad, width: hasChart ? 1000 : 1500, display: "flex", flexDirection: "column", alignItems: right ? "flex-end" : "flex-start" };
  const pop = interpolate(f, [land - 2, land + 3, land + 10], [1, 1.04, 1], clamp);
  return (
    <AbsoluteFill>
      {scene.marquee ? <MarqueeBand chap={scene.chap} aspect={aspect} /> : null}
      {scene.orbit && !Sq ? <Orbit chap={scene.chap} aspect={aspect} models={scene.orbit} /> : null}
      <div style={block}>
        <div style={{ position: "relative", width: "100%", height: fs * 1.12, transform: `scale(${pop})`, transformOrigin: right ? "right center" : V || Sq ? "center" : "left center" }}>
          <RollingNumber to={n} fontSize={fs} color={p.ink} countFrames={countF} fontWeight={400} justify={just as any} fontFamily={SANS} />
        </div>
        <div style={{ height: 8, width: 160 * rule, background: p.accent, borderRadius: 9, margin: `${V ? 22 : 14}px 0 ${V ? 30 : 26}px` }} />
        <div style={{ ...display(V ? 64 : Sq ? 58 : 66, p.ink), opacity: Math.min(1, lab * 2), transform: `translateY(${(1 - lab) * 26}px)`, textAlign: V || Sq ? "center" : right ? "right" : "left", maxWidth: V ? 900 : 1300 }}>{scene.label}</div>
        {scene.chip ? <div style={{ marginTop: V ? 40 : 34, opacity: Math.min(1, chip * 2), transform: `scale(${0.85 + 0.15 * chip})` }}><Chip chap={scene.chap} size={V ? 38 : 32} accent>{scene.chip}</Chip></div> : null}
      </div>
      <div style={{ position: "absolute", left: `${V || Sq ? 50 : right ? 85 : 15}%`, top: V || Sq ? "30%" : "30%", width: 1, height: 1 }}>
        <TrimBurst x={0} y={0} delay={land} color={p.accent} count={10} reach={V ? 140 : 160} innerRadius={40} strokeLength={60} weight={5} />
      </div>
      {scene.chart ? <Chart scene={scene} aspect={aspect} start={land + 4} /> : null}
      {scene.bars ? <DeployBars chap={scene.chap} aspect={aspect} start={land} /> : null}
    </AbsoluteFill>
  );
};

const MarqueeBand: React.FC<{ chap: SceneT["chap"]; aspect: Aspect }> = ({ chap, aspect }) => {
  const p = CHAPS[chap]; const V = isV(aspect);
  const ids = "deepseek/deepseek-v4-pro · anthropic/claude-opus-5 · openai/gpt-6.1-sol · google/gemma-4-31b · x-ai/grok-4.7 · moonshotai/kimi-k3 · z-ai/glm-5.3 · mistralai/mistral-large-4 · qwen/qwen-plus · minimax/m3 · ";
  return (
    <>
      <div style={{ position: "absolute", left: 0, right: 0, ...(V ? { top: 150 } : { bottom: 130 }), height: 90, opacity: 0.55, fontFamily: MONO }}><InfiniteMarquee text={ids} fontSize={V ? 40 : 40} color={p.muted} fontWeight={400} pixelsPerFrame={5} /></div>
      {V ? <div style={{ position: "absolute", left: 0, right: 0, top: 240, height: 90, opacity: 0.3, fontFamily: MONO, transform: "scaleX(-1)" }}><div style={{ transform: "scaleX(-1)", position: "absolute", inset: 0 }}><InfiniteMarquee text={ids.split(" · ").reverse().join(" · ")} fontSize={40} color={p.muted} fontWeight={400} pixelsPerFrame={3} /></div></div> : null}
    </>
  );
};

const Chart: React.FC<{ scene: SceneT; aspect: Aspect; start: number }> = ({ scene, aspect, start }) => {
  const p = CHAPS[scene.chap]; const V = isV(aspect); const Sq = isSq(aspect); const f = useCurrentFrame();
  const data: number[] = scene.chart; const labels: string[] = scene.chartLabels;
  const w = V ? 940 : Sq ? 900 : 700; const h = V ? 440 : Sq ? 360 : 480;
  const o = interpolate(f, [start, start + 8], [0, 1], clamp);
  const box: React.CSSProperties = V ? { left: 70, top: 860 } : Sq ? { left: 90, top: 640 } : { right: 110, top: 300 };
  return (
    <div style={{ position: "absolute", ...box, width: w, height: h + 70, opacity: o }}>
      <div style={{ fontFamily: SANS, fontSize: V ? 34 : 28, color: p.muted, marginBottom: 6 }}>{scene.chartNote}</div>
      <div style={{ position: "relative", width: w, height: h }}>
        <SeqFrom from={start}><AnimatedLineChart data={data} width={w} height={h} strokeColor={p.accent} strokeWidth={6} gridColor={p.hair} showDot /></SeqFrom>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", padding: "0 60px", fontFamily: MONO, fontSize: V ? 28 : 22, color: p.muted }}>{labels.map((l) => <span key={l}>{l}</span>)}</div>
    </div>
  );
};

const SeqFrom: React.FC<{ from: number; children: React.ReactNode }> = ({ from, children }) => <Sequence from={from} layout="none">{children}</Sequence>;

const DeployBars: React.FC<{ chap: SceneT["chap"]; aspect: Aspect; start: number }> = ({ chap, aspect, start }) => {
  // Successful deploy runs per month from .git/anyr-deploy-metrics/log.jsonl (Aug from the 5th; facts.md #22).
  const p = CHAPS[chap]; const V = isV(aspect); const Sq = isSq(aspect); const f = useCurrentFrame();
  const rows: [string, number][] = [["Aug", 212], ["Sep", 117], ["Oct", 283], ["Nov 1-4", 141]];
  const max = 283; const H = V ? 300 : Sq ? 220 : 460; const bw = V ? 150 : Sq ? 120 : 130;
  const box: React.CSSProperties = V ? { left: 0, right: 0, bottom: 520, justifyContent: "center" } : Sq ? { left: 0, right: 0, bottom: 130, justifyContent: "center" } : { left: 150, bottom: 170 };
  return (
    <div style={{ position: "absolute", ...box, display: "flex", alignItems: "flex-end", gap: V ? 40 : 34 }}>
      {rows.map(([m, v], i) => {
        const g = interpolate(f, [start + i * 4, start + 18 + i * 4], [0, 1], { ...clamp, easing: EXPO });
        return (
          <div key={m} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
            <div style={{ fontFamily: MONO, fontSize: V ? 32 : 26, color: p.ink, opacity: g }}>{Math.round(v * g)}</div>
            <div style={{ width: bw, height: (H * v * g) / max, background: m === "Oct" ? p.accent : p.plate, border: `1.5px solid ${m === "Oct" ? p.accent : p.hair}`, borderRadius: 10 }} />
            <div style={{ fontFamily: MONO, fontSize: V ? 28 : 22, color: p.muted }}>{m}</div>
          </div>
        );
      })}
    </div>
  );
};

// ---------- duo: two big values, slammed or rolled ----------
export const DuoScene: React.FC<SP> = ({ scene, aspect }) => {
  const p = CHAPS[scene.chap]; const V = isV(aspect); const Sq = isSq(aspect); const d = frames(scene); const f = useCurrentFrame();
  const items = [scene.a, scene.b]; const at = [4, Math.round(d * 0.36)];
  const stacked = V || Sq;
  const foot = useSpr(at[1] + 18, settle);
  return (
    <AbsoluteFill style={{ display: "flex", flexDirection: stacked ? "column" : "row", alignItems: "center", justifyContent: "center", gap: stacked ? (V ? 110 : 40) : 160 }}>
      {items.map((it: any, i: number) => {
        const s = useSpr(at[i]);
        const fs = it.n ? (V ? 230 : Sq ? 190 : 250) : V ? 300 : Sq ? 240 : 330;
        return (
          <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", opacity: f >= at[i] ? 1 : 0 }}>
            <div style={{ position: "relative", height: fs * 1.12, width: stacked ? 1000 : 820 }}>
              {it.n ? <Sequence from={at[i]} layout="none"><RollingNumber to={it.n} fontSize={fs} color={p.ink} countFrames={30} fontWeight={400} fontFamily={SANS} /></Sequence>
                : <Sequence from={at[i]} layout="none"><AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}><SpringScaleIn text={it.v} fontSize={fs} color={p.ink} fontWeight={400} staggerDelay={2} scaleFrom={0.4} /></AbsoluteFill></Sequence>}
            </div>
            <div style={{ height: 7, width: 120 * Math.min(1, s), background: p.accent, borderRadius: 9, margin: "8px 0 22px" }} />
            <div style={{ ...display(V ? 60 : Sq ? 50 : 60, p.ink), opacity: Math.min(1, s * 2) }}>{it.l}</div>
          </div>
        );
      })}
      <div style={{ position: "absolute", ...(V ? { top: 200 } : { bottom: Sq ? 130 : 140 }), left: 0, right: 0, textAlign: "center", fontFamily: MONO, fontSize: V ? 36 : 30, color: p.muted, opacity: foot }}>{scene.foot}</div>
    </AbsoluteFill>
  );
};

// ---------- route: request, 429 on upstream A, fallback to B, answer home ----------
export const RouteScene: React.FC<SP> = ({ scene, aspect }) => {
  const p = CHAPS[scene.chap]; const V = isV(aspect); const Sq = isSq(aspect); const f = useCurrentFrame(); const d = frames(scene); const { width, height } = useVideoConfig();
  // node positions
  const N = V
    ? { app: [540, 520], gw: [540, 880], a: [280, 1240], b: [800, 1240] }
    : Sq ? { app: [170, 560], gw: [520, 560], a: [880, 360], b: [880, 760] }
    : { app: [260, 540], gw: [860, 540], a: [1540, 320], b: [1540, 740] };
  const T = (a: number, b: number) => interpolate(f, [d * a, d * b], [0, 1], { ...clamp, easing: EXPO });
  const leg1 = T(0.04, 0.16), leg2 = T(0.18, 0.3), fail = T(0.3, 0.34), leg3 = T(0.38, 0.5), ok = T(0.5, 0.54), leg4 = T(0.56, 0.72);
  const lerp = (A: number[], B: number[], t: number) => [A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t];
  let ball: number[]; let ballC: string = p.accent;
  if (f < d * 0.18) ball = lerp(N.app, N.gw, leg1);
  else if (f < d * 0.36) { ball = lerp(N.gw, N.a, leg2); if (fail > 0) ballC = p.bad; }
  else if (f < d * 0.56) ball = lerp(N.gw, N.b, leg3);
  else ball = lerp(N.b, N.app, leg4);
  const shake = f > d * 0.3 && f < d * 0.36 ? Math.sin(f * 2.4) * 10 * (1 - fail * 0.5) : 0;
  const head = useSpr(2, settle); const hdr = useSpr(Math.round(d * 0.62), settle);
  const node = (pos: number[], label: string, sub: string, state: "idle" | "bad" | "ok", big = false, dx = 0) => {
    const bc = state === "bad" ? p.bad : state === "ok" ? p.ok : p.hair;
    return (
      <div style={{ position: "absolute", left: pos[0] + dx, top: pos[1], transform: "translate(-50%,-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
        <div style={{ minWidth: big ? (V ? 380 : 340) : V ? 300 : 280, padding: V ? "30px 34px" : "26px 30px", borderRadius: 22, background: big ? p.ink : p.plate, color: big ? p.bg : p.ink, border: `2px solid ${big ? p.ink : bc}`, display: "flex", alignItems: "center", justifyContent: "center", gap: 16, fontFamily: SANS, fontSize: V ? 42 : 38, fontWeight: 500, whiteSpace: "nowrap" }}>
          {big ? <Logo size={V ? 46 : 42} color={p.bg} /> : null}{label}
        </div>
        <div style={{ fontFamily: MONO, fontSize: V ? 30 : 26, color: state === "bad" ? p.bad : state === "ok" ? p.ok : p.muted, fontWeight: state === "idle" ? 400 : 600 }}>{sub}</div>
      </div>
    );
  };
  const aState = fail > 0 ? "bad" : "idle"; const bState = ok > 0 ? "ok" : "idle";
  const edge = (A: number[], B: number[], c: string, w = 3, dash = false) => <line x1={A[0]} y1={A[1]} x2={B[0]} y2={B[1]} stroke={c} strokeWidth={w} strokeDasharray={dash ? "10 10" : undefined} />;
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 0, right: 0, top: V ? 170 : Sq ? 60 : 70, textAlign: "center", ...display(V ? 88 : Sq ? 64 : 72, p.ink), opacity: head, transform: `translateY(${(1 - head) * 24}px)` }}>Fallback, automatic.</div>
      <svg width={width} height={height} style={{ position: "absolute", inset: 0 }}>
        {edge(N.app, N.gw, p.hair)}{edge(N.gw, N.a, fail > 0 ? p.bad : p.hair, 3, fail > 0)}{edge(N.gw, N.b, ok > 0 ? p.ok : p.hair)}
      </svg>
      {node(N.app, "Your app", "POST /v1/chat/completions", "idle")}
      {node(N.gw, "AnyRouter", "routes the request", "idle", true)}
      {node(N.a, "Upstream A", fail > 0 ? "429 rate limited" : "first choice", aState, false, shake)}
      {node(N.b, "Upstream B", ok > 0 ? "200 OK" : "fallback", bState)}
      <div style={{ position: "absolute", left: ball[0], top: ball[1], width: 34, height: 34, borderRadius: 99, background: ballC, transform: "translate(-50%,-50%)", boxShadow: `0 0 0 10px ${ballC}22` }} />
      <div style={{ position: "absolute", left: 0, right: 0, bottom: V ? 480 : Sq ? 130 : 140, display: "flex", justifyContent: "center", opacity: hdr, transform: `translateY(${(1 - hdr) * 20}px)` }}>
        <div style={{ fontFamily: MONO, fontSize: V ? 23 : 28, color: p.ink, background: p.plate, border: `1.5px solid ${p.hair}`, borderRadius: 14, padding: V ? "14px 18px" : "16px 24px", whiteSpace: "nowrap" }}>
          <span style={{ color: p.muted }}>x-anyrouter-provider-chain:</span> upstream-a <span style={{ color: p.bad }}>429</span> → upstream-b <span style={{ color: p.ok }}>200</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ---------- wall: remocn TypeWall ----------
export const WallScene: React.FC<SP> = ({ scene, aspect }) => {
  const p = CHAPS[scene.chap]; const V = isV(aspect);
  return (
    <AbsoluteFill>
      <TypeWall text={scene.word} fontSize={V ? 70 : 92} color={p.ink} accent={p.accent} accentText="#0a0a0a" separator="·" speed={1.2} />
    </AbsoluteFill>
  );
};

// ---------- fleet: 18 scheduled jobs light up ----------
export const FleetScene: React.FC<SP> = ({ scene, aspect }) => {
  const p = CHAPS[scene.chap]; const V = isV(aspect); const Sq = isSq(aspect); const f = useCurrentFrame(); const d = frames(scene);
  const jobs: string[] = scene.jobs; const cols = V ? 2 : Sq ? 3 : 3; const head = useSpr(0, settle);
  const cw = V ? 470 : Sq ? 320 : 520; const fs = V ? 32 : Sq ? 24 : 30;
  const sweep = (f * 0.6) % jobs.length;
  return (
    <AbsoluteFill style={{ alignItems: "center" }}>
      <div style={{ marginTop: V ? 170 : Sq ? 50 : 70, display: "flex", alignItems: "baseline", gap: 24, opacity: head, transform: `translateY(${(1 - head) * 24}px)` }}>
        <span style={{ ...display(V ? 150 : Sq ? 110 : 130, p.ink) }}>{Math.min(18, Math.max(0, Math.floor(interpolate(f, [4, 4 + jobs.length * 2.2], [0, 18], clamp))))}</span>
        <span style={{ ...display(V ? 52 : Sq ? 40 : 52, p.muted) }}>scheduled agent jobs</span>
      </div>
      <div style={{ marginTop: V ? 60 : Sq ? 30 : 46, display: "grid", gridTemplateColumns: `repeat(${cols}, ${cw}px)`, gap: V ? 18 : Sq ? 12 : 16 }}>
        {jobs.map((j, i) => {
          const s = useSpr(4 + i * 2.2); const hot = Math.abs(sweep - i) < 1.2;
          const done = f > d * 0.55 && i % 4 === 1;
          return (
            <div key={j} style={{ display: "flex", alignItems: "center", gap: 16, padding: V ? "18px 24px" : Sq ? "11px 16px" : "16px 22px", borderRadius: 16, background: p.plate, border: `1.5px solid ${hot ? p.accent : p.hair}`, fontFamily: MONO, fontSize: fs, color: p.ink, opacity: Math.min(1, s * 2), transform: `translateY(${(1 - s) * 30}px) scale(${0.9 + 0.1 * s})` }}>
              <span style={{ width: fs * 0.42, height: fs * 0.42, borderRadius: 99, flex: "none", background: hot ? p.accent : p.ok, opacity: 0.6 + 0.4 * Math.abs(Math.sin((f + i * 7) / 9)) }} />
              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{j}</span>
              {done ? <span style={{ marginLeft: "auto", color: p.muted, fontSize: fs * 0.8 }}>✓</span> : null}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ---------- pile: tickets fall, count rolls, closed bar fills ----------
export const PileScene: React.FC<SP> = ({ scene, aspect }) => {
  const p = CHAPS[scene.chap]; const V = isV(aspect); const Sq = isSq(aspect); const f = useCurrentFrame(); const d = frames(scene);
  const n: number = scene.n; const closed: number = scene.closed;
  const fs = V ? 300 : Sq ? 240 : 330;
  const lab = useSpr(20); const barT = interpolate(f, [d * 0.48, d * 0.78], [0, 1], { ...clamp, easing: EXPO }); const bar = useSpr(Math.round(d * 0.46), settle);
  const bw = V ? 860 : Sq ? 860 : 1100;
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ opacity: 0.55, transform: `translateY(${V ? 120 : 160}px)` }}>
        <GravityPile count={32} seed={11} backgroundColor={p.bg} colors={{ shapes: ["#3a3a3a", "#2a2a2a", "#525252"], floor: "#fafafa", accent: p.accent }} accentColor={p.accent} />
      </AbsoluteFill>
      <div style={{ position: "absolute", left: 0, right: 0, top: V ? "16%" : "10%", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ position: "relative", width: "100%", height: fs * 1.12 }}><RollingNumber to={n} fontSize={fs} color={p.ink} countFrames={30} fontWeight={400} fontFamily={SANS} /></div>
        <div style={{ ...display(V ? 62 : Sq ? 52 : 64, p.ink), opacity: Math.min(1, lab * 2), transform: `translateY(${(1 - lab) * 24}px)`, textAlign: "center", padding: "0 40px" }}>{scene.label}</div>
        <div style={{ marginTop: V ? 70 : 46, width: bw, opacity: bar }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontFamily: MONO, fontSize: V ? 34 : 30, color: p.ink, marginBottom: 14 }}>
            <span>closed</span><span>{fmt(closed * barT)} / {fmt(n)}</span>
          </div>
          <div style={{ height: 22, borderRadius: 99, background: p.plate, border: `1.5px solid ${p.hair}`, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${(closed / n) * 100 * barT}%`, background: p.accent, borderRadius: 99 }} />
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ---------- cta: recap wall, then lockup ----------
export const CtaScene: React.FC<SP> = ({ scene, aspect }) => {
  const p = CHAPS[scene.chap]; const V = isV(aspect); const Sq = isSq(aspect); const f = useCurrentFrame(); const d = frames(scene);
  // Draft 3: the summary grid scene carries the numbers, so the close is the lockup plus one concrete fact (facts #2).
  const lock = useSpr(2, settle); const url = useSpr(Math.round(d * 0.18)); const go = useSpr(Math.round(d * 0.3));
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: V ? 40 : 30, opacity: lock, transform: `scale(${0.9 + 0.1 * lock})`, marginTop: V ? -160 : -40 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 30 }}>
          <Logo size={V ? 140 : 130} color={p.ink} />
          <span style={{ ...display(V ? 130 : 140, p.ink), fontWeight: 500 }}>AnyRouter</span>
        </div>
        <div style={{ ...display(V ? 46 : 50, p.muted), textAlign: "center", maxWidth: V ? 900 : 1400 }}>One API for every model. Built with anybot.</div>
        <div style={{ opacity: url, transform: `translateY(${(1 - url) * 20}px)` }}><Chip chap={scene.chap} size={V ? 50 : 44} mono accent>anyrouter.dev</Chip></div>
        <div style={{ opacity: Math.min(1, go * 2), transform: `translateY(${(1 - go) * 20}px)`, fontFamily: SANS, fontSize: V ? 40 : 36, color: p.ink }}>41 models are free on the Go plan</div>
      </div>
    </AbsoluteFill>
  );
};

// ---------- growth: models added per week, cumulative (facts.md #25, #26) ----------
// phase "total": the all-added line draws in. phase "pipe": that line sits muted, the pipeline share fills in under it.
export const GrowthScene: React.FC<SP> = ({ scene, aspect }) => {
  const p = CHAPS[scene.chap]; const V = isV(aspect); const Sq = isSq(aspect); const stack = V || Sq; const f = useCurrentFrame(); const d = frames(scene);
  const total: number[] = scene.total; const pipe: number[] = scene.pipe; const pipePhase = scene.phase === "pipe";
  // Optional per-scene axis: n (headline, defaults to the series end), yMax, grid, ticks, peak [index, label].
  const n: number = scene.n ?? (pipePhase ? pipe[pipe.length - 1] : total[total.length - 1]);
  const last = total.length - 1;
  const countF = Math.min(36, Math.max(24, d * 0.32)); const land = Math.round(countF);
  const lab = useSpr(Math.round(countF * 0.55)); const chip = useSpr(land + 8);
  const rule = interpolate(f, [land - 2, land + 10], [0, 1], { ...clamp, easing: EXPO });
  const fs = Math.min(300, (stack ? 940 : 760) / (fmt(n).length * 0.6));
  const W = V ? 940 : Sq ? 900 : 880; const H = V ? 460 : Sq ? 360 : 560;
  const yMax: number = scene.yMax ?? 240; const grid: number[] = scene.grid ?? [0, 100, 200];
  const gl = (g: number) => (g >= 1000 ? `${g / 1000}k` : String(g));
  const padL = grid.some((g) => g >= 1000) ? 80 : 70, padR = 110, padT = 30, padB = 50; const iw = W - padL - padR; const ih = H - padT - padB;
  const X = (i: number) => padL + (i / (total.length - 1)) * iw; const Y = (v: number) => padT + ih - (v / yMax) * ih;
  const line = (s: number[]) => s.map((v, i) => `${i ? "L" : "M"}${X(i).toFixed(1)},${Y(v).toFixed(1)}`).join(" ");
  const area = (s: number[]) => `${line(s)} L${X(s.length - 1)},${Y(0)} L${X(0)},${Y(0)} Z`;
  const draw = interpolate(f, [6, 6 + Math.max(30, d * 0.55)], [0, 1], { ...clamp, easing: EXPO });
  const at = (s: number[], t: number) => { const x = t * (s.length - 1); const i = Math.min(s.length - 2, Math.floor(x)); return s[i] + (s[i + 1] - s[i]) * (x - i); };
  const live = pipePhase ? pipe : total; const tip = { x: padL + draw * iw, y: Y(at(live, draw)) };
  const ticks: [number, string][] = scene.ticks ?? [[0, "Aug 5"], [4, "Sep"], [8, "Oct"], [13, "Nov 4"]];
  const peak: [number, string] | undefined = scene.peak;
  const peakO = peak ? interpolate(draw, [peak[0] / last, peak[0] / last + 0.06], [0, 1], clamp) : 0;
  const chartO = interpolate(f, [2, 10], [0, 1], clamp); const endO = interpolate(draw, [0.92, 1], [0, 1], clamp);
  const block: React.CSSProperties = stack
    ? { position: "absolute", left: 0, right: 0, top: V ? "10%" : "6%", display: "flex", flexDirection: "column", alignItems: "center" }
    : { position: "absolute", left: 150, top: "20%", width: 760, display: "flex", flexDirection: "column", alignItems: "flex-start" };
  const box: React.CSSProperties = V ? { left: 70, top: 800 } : Sq ? { left: 90, top: 600 } : { right: 90, top: 250 };
  const clipId = `gclip-${scene.phase}-${aspect}`;
  return (
    <AbsoluteFill>
      <div style={block}>
        <div style={{ position: "relative", width: "100%", height: fs * 1.12 }}>
          <RollingNumber to={n} fontSize={fs} color={pipePhase ? p.accent : p.ink} countFrames={countF} fontWeight={400} justify={(stack ? "center" : "flex-start") as any} fontFamily={SANS} />
        </div>
        <div style={{ height: 8, width: 160 * rule, background: p.accent, borderRadius: 9, margin: `${V ? 22 : 14}px 0 ${V ? 30 : 26}px` }} />
        <div style={{ ...display(V ? 62 : Sq ? 56 : 62, p.ink), opacity: Math.min(1, lab * 2), transform: `translateY(${(1 - lab) * 26}px)`, textAlign: stack ? "center" : "left", maxWidth: V ? 940 : 760 }}>{scene.label}</div>
        {scene.chip ? <div style={{ marginTop: V ? 36 : 30, opacity: Math.min(1, chip * 2), transform: `scale(${0.85 + 0.15 * chip})` }}><Chip chap={scene.chap} size={V ? 34 : 28} accent>{scene.chip}</Chip></div> : null}
      </div>
      <div style={{ position: "absolute", ...box, width: W, opacity: chartO }}>
        <div style={{ display: "flex", gap: 28, alignItems: "center", fontFamily: SANS, fontSize: V ? 32 : 26, color: p.muted, marginBottom: 8, paddingLeft: padL }}>
          {pipePhase
            ? <><span style={{ display: "flex", alignItems: "center", gap: 10 }}><span style={{ width: 28, height: 4, background: p.muted, borderRadius: 2 }} />all added</span><span style={{ display: "flex", alignItems: "center", gap: 10 }}><span style={{ width: 22, height: 22, background: p.accent, borderRadius: 5 }} />found by the pipeline</span></>
            : <span>{scene.chartNote}</span>}
        </div>
        <svg width={W} height={H} style={{ overflow: "visible" }}>
          <defs><clipPath id={clipId}><rect x={0} y={0} width={padL + draw * iw} height={H} /></clipPath></defs>
          {grid.map((g) => (
            <g key={g}>
              <line x1={padL} x2={padL + iw} y1={Y(g)} y2={Y(g)} stroke={p.hair} strokeWidth={1.5} />
              <text x={padL - 16} y={Y(g) + 8} textAnchor="end" fontFamily={MONO} fontSize={V ? 26 : 22} fill={p.muted}>{gl(g)}</text>
            </g>
          ))}
          {ticks.map(([i, t]) => <text key={t} x={X(i)} y={H - 10} textAnchor={i === 0 ? "start" : i === last ? "end" : "middle"} fontFamily={MONO} fontSize={V ? 26 : 22} fill={p.muted}>{t}</text>)}
          {pipePhase ? (
            <>
              <path d={line(total)} fill="none" stroke={p.muted} strokeWidth={4} strokeLinejoin="round" opacity={0.7} />
              <text x={X(total.length - 1) + 14} y={Y(total[total.length - 1]) + 9} fontFamily={MONO} fontSize={V ? 30 : 26} fill={p.muted}>{fmt(total[total.length - 1])}</text>
              <g clipPath={`url(#${clipId})`}>
                <path d={area(pipe)} fill={p.accent} opacity={0.9} />
                <path d={line(pipe)} fill="none" stroke={p.accent} strokeWidth={5} strokeLinejoin="round" />
              </g>
            </>
          ) : (
            <g clipPath={`url(#${clipId})`}>
              <path d={area(total)} fill={p.accent} opacity={0.1} />
              <path d={line(total)} fill="none" stroke={p.accent} strokeWidth={6} strokeLinejoin="round" strokeLinecap="round" />
            </g>
          )}
          {peak ? (
            <g opacity={peakO}>
              <circle cx={X(peak[0])} cy={Y(total[peak[0]])} r={11} fill={p.bg} stroke={p.accent} strokeWidth={4} />
              <text x={X(peak[0]) + 22} y={Y(total[peak[0]]) + 10} fontFamily={MONO} fontSize={V ? 30 : 26} fill={p.ink}>{peak[1]}</text>
            </g>
          ) : null}
          <circle cx={tip.x} cy={tip.y} r={9} fill={p.accent} stroke={p.bg} strokeWidth={3} />
          <text x={X(live.length - 1) + 14} y={Y(live[live.length - 1]) + 9} fontFamily={MONO} fontSize={V ? 30 : 26} fill={p.accent} opacity={endO}>{fmt(live[live.length - 1])}</text>
        </svg>
      </div>
    </AbsoluteFill>
  );
};

export const SCENES: Record<string, React.FC<SP>> = { title: TitleScene, words: WordsScene, fan: FanScene, stat: StatScene, duo: DuoScene, route: RouteRunScene, route_d2: RouteScene, wall: WallScene, fleet: FleetScene, pile: PileScene, cta: CtaScene, growth: GrowthScene, skyline: SkylineScene, term_key: TermKeyScene, term_git: TermGitScene, term_deploy: TermDeployScene, grid: GridScene };
