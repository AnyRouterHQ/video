import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Stage } from "../lib/remocn/stage";
import { ImpactShake } from "../lib/remocn/impact-shake";
import { ExplodedView } from "../lib/remocn/exploded-view";
import { MaskRevealUp } from "../lib/remocn/mask-reveal-up";
import { THEMES, SANS, MONO, FPS, type SceneT, type Take, type Aspect } from "../theme";
import { clamp, EXPO, useSpring, Chip } from "../ui";

export interface SP { scene: SceneT; take: Take; aspect: Aspect }
const dur = (s: SceneT) => Math.round((s.end - s.start) * FPS);

// ---- type: words spring in; the em words take the accent ----
export const TypeScene: React.FC<SP> = ({ scene, take, aspect }) => {
  const t = THEMES[take]; const V = aspect === "9x16"; const f = useCurrentFrame(); const d = dur(scene);
  const words: string[] = scene.text.split(" "); const em: string[] = (scene.em || "").split(" ").filter(Boolean);
  const len = scene.text.length;
  const fs = V ? (len > 24 ? 124 : 150) : (len > 24 ? 150 : 190);
  const exit = take === "B" ? interpolate(f, [d - 7, d], [1, 0], clamp) : 1;
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", padding: V ? 80 : 160, opacity: exit }}>
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", columnGap: fs * 0.26, rowGap: fs * 0.02, fontFamily: SANS, fontSize: fs, fontWeight: 500, letterSpacing: "-0.035em", lineHeight: 1.04, color: t.ink, maxWidth: V ? 920 : 1560, textAlign: "center" }}>
        {words.map((w, i) => <Word key={i} take={take} i={i} color={em.includes(w) ? t.accent : t.ink}>{w}</Word>)}
      </div>
    </AbsoluteFill>
  );
};
const Word: React.FC<{ take: Take; i: number; color: string; children: React.ReactNode }> = ({ take, i, color, children }) => {
  const f = useCurrentFrame(); const s = useSpring(take, 1 + i * (take === "A" ? 3 : 6));
  const style: React.CSSProperties = take === "A"
    ? { display: "inline-block", color, opacity: Math.min(1, s * 3), transform: `translateY(${(1 - s) * 0.5}em) rotate(${(1 - s) * -5}deg) scale(${0.85 + 0.15 * s})` }
    : { display: "inline-block", color, opacity: Math.min(1, s * 1.6), filter: `blur(${(1 - s) * 14}px)`, transform: `translateY(${(1 - s) * 0.18}em)` };
  return <span style={style}>{children}</span>;
};

// ---- strike: three rejected options, each crossed out ----
export const StrikeScene: React.FC<SP> = ({ scene, take, aspect }) => {
  const t = THEMES[take]; const V = aspect === "9x16"; const f = useCurrentFrame(); const d = dur(scene);
  const items: string[] = scene.items; const seg = d / items.length; const fs = V ? 112 : 150;
  return (
    <AbsoluteFill style={{ alignItems: V ? "center" : "flex-start", justifyContent: "center", padding: V ? 80 : "0 200px", gap: fs * 0.18, flexDirection: "column" }}>
      {items.map((it, i) => <StrikeItem key={i} take={take} text={it} at={Math.round(i * seg)} seg={seg} fs={fs} color={t.ink} accent={t.accent} />)}
    </AbsoluteFill>
  );
};
const StrikeItem: React.FC<{ take: Take; text: string; at: number; seg: number; fs: number; color: string; accent: string }> = ({ take, text, at, seg, fs, color, accent }) => {
  const f = useCurrentFrame(); const s = useSpring(take, at);
  const line = interpolate(f, [at + seg * 0.5, at + seg * 0.5 + 6], [0, 1], { ...clamp, easing: EXPO });
  const dim = interpolate(f, [at + seg * 0.5, at + seg * 0.5 + 8], [1, 0.32], clamp);
  return (
    <div style={{ position: "relative", fontFamily: SANS, fontSize: fs, fontWeight: 500, letterSpacing: "-0.035em", lineHeight: 1.08, color, opacity: Math.min(1, s * 2.5) * dim, transform: `translateX(${(1 - s) * -80}px)` }}>
      {text}
      <div style={{ position: "absolute", left: 0, top: "56%", height: fs * 0.07, width: `${line * 100}%`, background: accent, borderRadius: 99 }} />
    </div>
  );
};

// ---- slam: remocn ImpactShake ----
export const SlamScene: React.FC<SP> = ({ scene, take, aspect }) => {
  const t = THEMES[take]; const V = aspect === "9x16";
  const mono = scene.text === "---";
  return (
    <ImpactShake backgroundColor="transparent" foregroundColor={t.ink} colors={{ splitA: t.accent, splitB: t.ink, dust: t.muted }} impact={6} intensity={take === "A" ? 1.2 : 0.6}>
      <div style={{ fontFamily: mono ? MONO : SANS, fontSize: V ? 230 : 300, fontWeight: 500, letterSpacing: "-0.04em", color: t.ink, whiteSpace: "nowrap" }}>{scene.text.replace(/\.$/, "")}<span style={{ color: t.accent }}>{/\.$/.test(scene.text) ? "." : ""}</span></div>
    </ImpactShake>
  );
};

// ---- term: real command and real output, typed on the audio map ----
export const TermScene: React.FC<SP> = ({ scene, take, aspect }) => {
  const t = THEMES[take]; const V = aspect === "9x16"; const f = useCurrentFrame(); const d = dur(scene);
  const s = useSpring(take, 0, false);
  const cmd: string = scene.cmd; const out: string[] = scene.out;
  const typed = Math.floor(interpolate(f, [d * 0.08, d * 0.5], [0, cmd.length], clamp));
  const showOut = (k: number) => f >= d * (0.6 + k * 0.12);
  const fs = V ? 32 : 42; const w = V ? 980 : 1500;
  const caretOn = Math.floor(f / 8) % 2 === 0 || typed < cmd.length;
  const ring = interpolate(f, [d * 0.72, d * 0.72 + 14], [0, 1], clamp);
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: Math.min(1, s * 3) }}>
      <div style={{ width: w, transform: `translateY(${(1 - s) * 40}px) scale(${0.96 + 0.04 * s})`, borderRadius: 24, background: "#171717", boxShadow: "0 40px 100px rgba(0,0,0,0.22)", overflow: "hidden", border: "1.5px solid rgba(255,255,255,0.08)" }}>
        <div style={{ height: 64, display: "flex", alignItems: "center", gap: 12, padding: "0 26px", borderBottom: "1.5px solid rgba(255,255,255,0.08)" }}>
          {[0, 1, 2].map((i) => <div key={i} style={{ width: 16, height: 16, borderRadius: 99, background: "rgba(255,255,255,0.22)" }} />)}
          <div style={{ marginLeft: 16, fontFamily: MONO, fontSize: 24, color: "rgba(255,255,255,0.45)" }}>terminal</div>
        </div>
        <div style={{ padding: V ? "40px 36px 48px" : "52px 56px 64px", fontFamily: MONO, fontSize: fs, lineHeight: 1.45, color: "#fafafa", minHeight: V ? 380 : 380, overflowWrap: "anywhere" }}>
          <div><span style={{ color: take === "A" ? "#f08a3e" : "#e8782f" }}>$ </span>{cmd.slice(0, typed)}<span style={{ display: "inline-block", width: fs * 0.55, height: fs * 1.05, background: caretOn && f < d * 0.55 ? "#fafafa" : "transparent", verticalAlign: "text-bottom", marginLeft: 2 }} /></div>
          {out.map((o, k) => showOut(k) ? <div key={k} style={{ marginTop: k === 0 ? 28 : 6, color: o.startsWith("✓") ? "#7ee2a8" : "#fafafa", textDecoration: o.startsWith("http") ? "underline" : undefined, textUnderlineOffset: 8, opacity: interpolate(f, [d * (0.6 + k * 0.12), d * (0.6 + k * 0.12) + 4], [0, 1], clamp) }}>{o}</div> : null)}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ---- shot: a real capture of a real published page on a remocn Stage ----
export const ShotScene: React.FC<SP> = ({ scene, take, aspect }) => {
  const t = THEMES[take]; const V = aspect === "9x16"; const d = dur(scene); const f = useCurrentFrame();
  const mobile = V && scene.key !== "flow" && scene.key.indexOf("slides") !== 0;
  const k = scene.key as string;
  const file = mobile ? `c-${k}-mobile.png` : `c-${k}-desktop.png`;
  const size = mobile ? { width: 390, height: 844 } : k === "flow" ? { width: 1440, height: 520 } : { width: 1440, height: 900 };
  const imgH = mobile ? 844 : 900;
  const A = take === "A";
  const moves = A ? [{ at: 0, zoom: 1, x: 0.5, y: 0.5 }, { at: d, zoom: 1.1, x: 0.5, y: mobile ? 0.4 : 0.45 }] : [{ at: 0, zoom: 1, x: 0.5, y: 0.5 }, { at: d, zoom: 1.04, x: 0.5, y: 0.5 }];
  const chip = useSpring(take, 6);
  const pop = useSpring(take, 0);
  const drift = interpolate(f, [0, d], [0, 1], clamp);
  const cw = mobile ? 680 : 980; const ch = (cw * size.height) / size.width;
  return (
    <AbsoluteFill style={{ background: A ? "#f0efed" : "transparent" }}>
      {V ? (
        <div style={{ position: "absolute", left: (1080 - cw) / 2, top: 920 - ch / 2 - 40 + (1 - pop) * 120 - drift * 30, width: cw, height: ch, borderRadius: 28, overflow: "hidden", background: "#fff", boxShadow: "0 40px 90px rgba(23,23,23,0.2)", border: "1.5px solid rgba(23,23,23,0.08)", opacity: Math.min(1, pop * 2), transform: `rotate(${(1 - pop) * (A ? -4 : -1.5) - drift * 0.6}deg) scale(${(0.94 + 0.06 * pop) * (1 + drift * 0.03)})` }}>
          <Img src={staticFile(file)} style={{ width: cw, height: (cw * imgH) / size.width, display: "block", objectFit: "cover", objectPosition: "top" }} />
        </div>
      ) : (
      <div style={{ position: "absolute", inset: 0 }}>
      <Stage contentSize={size} moves={moves} backdrop="transparent" rotateX={A ? 6 : 3} rotateY={A ? (V ? -10 : -12) : -5} scale={V ? (mobile ? 1.15 : 1.0) : 0.84} shadow={0.04} reflection={0} perspective={1200}>
        <div style={{ width: size.width, height: size.height, overflow: "hidden", background: "#fff" }}>
          <Img src={staticFile(file)} style={{ width: size.width, height: imgH, display: "block", objectFit: "cover", objectPosition: "top" }} />
        </div>
      </Stage>
      </div>
      )}
      <div style={{ position: "absolute", left: V ? 80 : 120, bottom: V ? 360 : 90, display: "flex", gap: 14, alignItems: "center", opacity: Math.min(1, chip * 2), transform: `translateY(${(1 - chip) * 30}px)` }}>
        <Chip take={take} size={V ? 40 : 38} accent>{scene.label}</Chip>
        <Chip take={take} size={V ? 36 : 34} mono>{scene.ext}</Chip>
      </div>
    </AbsoluteFill>
  );
};

// ---- stack: versions as an exploded isometric stack, one URL ----
export const StackScene: React.FC<SP> = ({ scene, take, aspect }) => {
  const t = THEMES[take]; const V = aspect === "9x16"; const f = useCurrentFrame(); const d = dur(scene);
  const s = useSpring(take, 14, false);
  const colors = { background: "transparent", top: "#ffffff", left: "#e7e5e4", right: "#d6d3d1", highlightTop: "#f08a3e", highlightLeft: "#c2570c", highlightRight: "#9a4509", line: "#171717", label: t.ink };
  return (
    <AbsoluteFill>
      <div style={V ? { position: "absolute", inset: 0, transform: "translate(30px,-100px) scale(0.62)", transformOrigin: "50% 50%" } : { position: "absolute", inset: 0, transform: "translateY(-60px) scale(0.92)", transformOrigin: "50% 50%" }}>
        <ExplodedView layers={scene.labels.length} labels={scene.labels} highlight={0} colors={colors} backgroundColor="transparent" labelColor={t.ink} speed={38 / (d * 0.6)} />
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, bottom: V ? 400 : 70, display: "flex", justifyContent: "center", opacity: Math.min(1, s * 2), transform: `translateY(${(1 - s) * 30}px)` }}>
        <Chip take={take} size={V ? 38 : 40} mono>{scene.url}</Chip>
      </div>
    </AbsoluteFill>
  );
};

// ---- vis: private / unlisted / public ----
const Icon: React.FC<{ k: number; c: string; s: number }> = ({ k, c, s }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
    {k === 0 && <><rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></>}
    {k === 1 && <><path d="M10 13a5 5 0 0 0 7.1 0l3-3a5 5 0 0 0-7.1-7.1l-1.7 1.7" /><path d="M14 11a5 5 0 0 0-7.1 0l-3 3a5 5 0 0 0 7.1 7.1l1.7-1.7" /></>}
    {k === 2 && <><circle cx="12" cy="12" r="9" /><path d="M3 12h18" /><path d="M12 3a14 14 0 0 1 0 18 14 14 0 0 1 0-18z" /></>}
  </svg>
);
const VIS = [
  { name: "Private", code: "private", desc: "Only you" },
  { name: "Unlisted", code: "unlisted", desc: "Anyone with the link" },
  { name: "Public", code: "public", desc: "Listed in the gallery" },
];
export const VisScene: React.FC<SP> = ({ scene, take, aspect }) => {
  const t = THEMES[take]; const V = aspect === "9x16"; const f = useCurrentFrame(); const d = dur(scene);
  const active = scene.cycle ? Math.min(2, Math.floor((f / d) * 3)) : scene.at;
  const fs = V ? 1 : 1;
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", padding: V ? 70 : 140 }}>
      <div style={{ display: "flex", flexDirection: V ? "column" : "row", gap: V ? 36 : 44, width: "100%" }}>
        {VIS.map((v, i) => <VisCard key={i} take={take} v={v} i={i} on={i === active} V={V} showAll={!!scene.cycle} />)}
      </div>
    </AbsoluteFill>
  );
};
const VisCard: React.FC<{ take: Take; v: (typeof VIS)[number]; i: number; on: boolean; V: boolean; showAll: boolean }> = ({ take, v, i, on, V, showAll }) => {
  const t = THEMES[take]; const f = useCurrentFrame(); const s = useSpring(take, 2 + i * 4);
  const act = useSpring(take, 0, true);
  const lit = on ? 1 : 0;
  return (
    <div style={{ flex: 1, borderRadius: 28, padding: V ? "44px 50px" : "56px 56px 60px", background: on ? t.ink : t.plate, color: on ? "#fff" : t.ink, border: `1.5px solid ${on ? t.ink : t.hair}`, opacity: Math.min(1, s * 2) * (on || showAll ? 1 : 0.45), transform: `translateY(${(1 - s) * 50}px) scale(${on ? 1.04 : 1})`, transition: "none", display: "flex", flexDirection: V ? "row" : "column", alignItems: V ? "center" : "flex-start", gap: V ? 40 : 36, backdropFilter: take === "B" ? "blur(8px)" : undefined }}>
      <Icon k={i} c={on ? "#fff" : t.ink} s={V ? 96 : 110} />
      <div>
        <div style={{ fontFamily: SANS, fontSize: V ? 76 : 80, fontWeight: 500, letterSpacing: "-0.03em", lineHeight: 1 }}>{v.name}</div>
        <div style={{ fontFamily: SANS, fontSize: V ? 38 : 40, marginTop: 14, color: on ? "rgba(255,255,255,0.72)" : t.muted }}>{v.desc}</div>
        <div style={{ fontFamily: MONO, fontSize: V ? 30 : 32, marginTop: 24, color: on ? "#f4a261" : t.accent }}>{v.code}</div>
      </div>
    </div>
  );
};

// ---- cta ----
export const CtaScene: React.FC<SP> = ({ scene, take, aspect }) => {
  const t = THEMES[take]; const V = aspect === "9x16"; const f = useCurrentFrame();
  const s = useSpring(take, 2); const s2 = useSpring(take, 12);
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column", gap: V ? 34 : 30 }}>
      <Img src={staticFile("logo.svg")} style={{ width: V ? 150 : 130, height: V ? 150 : 130, opacity: Math.min(1, s * 2), transform: `scale(${0.6 + 0.4 * s}) rotate(${(1 - s) * -20}deg)` }} />
      <div style={{ fontFamily: SANS, fontSize: V ? 150 : 190, fontWeight: 500, letterSpacing: "-0.04em", lineHeight: 1, color: t.ink, opacity: Math.min(1, s * 2), transform: `translateY(${(1 - s) * 40}px)` }}>Artifacts</div>
      <div style={{ fontFamily: SANS, fontSize: V ? 48 : 50, color: t.muted, textAlign: "center", maxWidth: V ? 860 : 1300, opacity: Math.min(1, s2 * 2), transform: `translateY(${(1 - s2) * 30}px)` }}>Publish anything your agent makes.</div>
      <div style={{ marginTop: 12, opacity: Math.min(1, s2 * 2), transform: `translateY(${(1 - s2) * 30}px)` }}><Chip take={take} size={V ? 54 : 56} accent mono>anyrouter.dev</Chip></div>
    </AbsoluteFill>
  );
};
export const SCENES: Record<string, React.FC<SP>> = { type: TypeScene, strike: StrikeScene, slam: SlamScene, term: TermScene, shot: ShotScene, stack: StackScene, vis: VisScene, cta: CtaScene };
