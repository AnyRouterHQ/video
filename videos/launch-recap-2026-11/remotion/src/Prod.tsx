import React, { useEffect, useMemo, useState } from "react";
import { AbsoluteFill, Sequence, continueRender, delayRender, interpolate, staticFile, useCurrentFrame } from "remotion";
import type { Caption } from "@remotion/captions";
import type { TransitionPresentation } from "@remotion/transitions";
import { whipPan } from "./lib/remocn/whip-pan";
import { zoomBlur } from "./lib/remocn/zoom-blur";
import { hyperspace } from "./lib/remocn/hyperspace";
import { CaptionActivePop } from "./lib/remocn/caption-active-pop";
import { CHAPS, FPS, SANS, type ProdProps, type SceneT } from "./theme";
import { Ground, Logo, clamp } from "./ui";
import { SCENES } from "./scenes/scenes";

const useFonts = () => {
  const [h] = useState(() => delayRender("fonts"));
  useEffect(() => {
    Promise.all([new FontFace("Geist", `url(${staticFile("geist.woff2")})`, { weight: "100 900" }).load(), new FontFace("Geist Mono", `url(${staticFile("geist-mono.woff2")})`, { weight: "100 900" }).load()])
      .then((fs) => { fs.forEach((f) => document.fonts.add(f)); continueRender(h); }).catch((e) => { console.error(e); continueRender(h); });
  }, [h]);
};

type Tr = { p: TransitionPresentation<any>; len: number };
// Chapter changes get the hyperspace jump; the rest alternate whip-pan directions and zoom-blur.
function pickTransition(prev: SceneT, next: SceneT, i: number): Tr {
  if (prev.chap !== next.chap) return next.chap === "dark"
    ? { p: hyperspace({ streakColor: "#0a0a0a", accentColor: CHAPS.light.accent, flashColor: "#0a0a0a", stars: 220 }), len: 36 }
    : { p: zoomBlur({ blur: 22 }), len: 20 };
  const cycle: Tr[] = [{ p: whipPan({ direction: "left" }), len: 16 }, { p: zoomBlur({ blur: 18 }), len: 14 }, { p: whipPan({ direction: "up" }), len: 16 }];
  return cycle[i % cycle.length];
}

const Present: React.FC<{ tr: Tr; dir: "entering" | "exiting"; progress: number; children: React.ReactNode }> = ({ tr, dir, progress, children }) => {
  const C = tr.p.component as React.FC<any>;
  return <C presentationProgress={progress} presentationDirection={dir} passedProps={tr.p.props ?? {}} presentationDurationInFrames={tr.len} bothEnteringAndExiting={false} onElementImage={() => {}} onUnmount={() => {}}>{children}</C>;
};

const SceneSlot: React.FC<{ scene: SceneT; aspect: ProdProps["aspect"]; enter?: Tr; exit?: Tr; dur: number }> = ({ scene, aspect, enter, exit, dur }) => {
  const f = useCurrentFrame(); const C = SCENES[scene.t];
  let body = <AbsoluteFill><Ground chap={scene.chap} aspect={aspect} /><C scene={scene} aspect={aspect} /></AbsoluteFill>;
  if (exit && f >= dur - exit.len) body = <Present tr={exit} dir="exiting" progress={(f - (dur - exit.len)) / exit.len}>{body}</Present>;
  if (enter && f < enter.len) body = <Present tr={enter} dir="entering" progress={f / enter.len}>{body}</Present>;
  return body;
};

// The VO text spells "Any-bot" so ElevenLabs says "any-bot"; on screen it is always "anybot".
const fixWord = (w: string) => w.replace(/^A\.I\.$/, "AI").replace(/^A\.I\./, "AI").replace(/^Any-bot/, "anybot");
function toCaptions(timeline: NonNullable<ProdProps["timeline"]>): Caption[] {
  const out: Caption[] = [];
  for (const l of timeline.lines) {
    const ws = l.words.map((x) => ({ ...x }));
    for (let i = 0; i < ws.length; i++) {
      if (ws[i].w === "dot" && ws[i + 1] && /^dev/.test(ws[i + 1].w) && ws[i - 1]) {
        out[out.length - 1].text = " anyrouter.dev"; out[out.length - 1].endMs = ws[i + 1].e * 1000; i++; continue;
      }
      out.push({ text: (out.length ? " " : "") + fixWord(ws[i].w), startMs: ws[i].s * 1000, endMs: ws[i].e * 1000, timestampMs: null, confidence: 1, pageBreakAfter: i === ws.length - 1 });
    }
  }
  return out;
}

const Captions: React.FC<{ caps: Caption[]; V: boolean }> = ({ caps, V }) => (
  <div style={{ position: "absolute", left: V ? 60 : 260, right: V ? 60 : 260, ...(V ? { top: 1450 } : { bottom: 34 }), display: "flex", justifyContent: "center", fontFamily: SANS, letterSpacing: "-0.02em" }}>
    <div style={{ background: "rgba(10,10,10,0.82)", borderRadius: V ? 26 : 18, padding: V ? "14px 30px 18px" : "8px 22px 12px" }}>
      <CaptionActivePop captions={caps} fontSize={V ? 64 : 42} fontWeight={600} color="#fafafa" activeColor="#ee8a4a" popScale={1.06} shadow={false} combineTokensWithinMilliseconds={V ? 900 : 1400} />
    </div>
  </div>
);

export const Prod: React.FC<ProdProps> = ({ timeline, aspect, captions }) => {
  useFonts();
  const f = useCurrentFrame();
  const caps = useMemo(() => (timeline ? toCaptions(timeline) : []), [timeline]);
  if (!timeline) return <AbsoluteFill style={{ background: "#fff" }} />;
  const V = aspect === "9x16"; const total = Math.round(timeline.total * FPS);
  const flat = timeline.lines.flatMap((line) => line.scenes);
  const trs: (Tr | undefined)[] = flat.map((s, i) => (i === 0 ? undefined : pickTransition(flat[i - 1], s, i)));
  const cur = flat.find((s) => f / FPS >= s.start && f / FPS < s.end) ?? flat[flat.length - 1];
  const P = CHAPS[cur.chap];
  return (
    <AbsoluteFill style={{ background: "#fff", fontFamily: SANS }}>
      {flat.map((scene, i) => {
        const a = Math.round(scene.start * FPS); const b = i === flat.length - 1 ? total : Math.round(scene.end * FPS);
        const enter = trs[i]; const exit = trs[i + 1];
        const from = Math.max(0, a - (enter ? Math.round(enter.len / 2) : 0)); const to = Math.min(total, b + (exit ? exit.len - Math.round(exit.len / 2) : 0));
        return (
          <Sequence key={i} from={from} durationInFrames={Math.max(1, to - from)}>
            <SceneSlot scene={{ ...scene, start: from / FPS, end: to / FPS }} aspect={aspect} enter={enter} exit={exit} dur={to - from} />
          </Sequence>
        );
      })}
      {!V && cur.t !== "title" && cur.t !== "cta" && cur.t !== "wall" && cur.t !== "grid" ? (
        <div style={{ position: "absolute", left: 56, top: 44, display: "flex", alignItems: "center", gap: 12, opacity: 0.85 }}>
          <Logo size={30} color={P.ink} /><span style={{ fontFamily: SANS, fontSize: 26, fontWeight: 500, color: P.ink, letterSpacing: "-0.01em" }}>AnyRouter</span>
        </div>
      ) : null}
      <div style={{ position: "absolute", left: 0, bottom: 0, height: V ? 8 : 6, width: `${interpolate(f, [0, total - 1], [0, 100], clamp)}%`, background: P.accent }} />
      {captions && timeline.lines.some((l) => l.words.length && f / FPS >= l.start - 0.1 && f / FPS <= l.start + l.dur + 0.4) ? <Captions caps={caps} V={V} /> : null}
    </AbsoluteFill>
  );
};
