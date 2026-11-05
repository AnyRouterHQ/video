import React, { useEffect, useState } from "react";
import { AbsoluteFill, Sequence, continueRender, delayRender, interpolate, staticFile, useCurrentFrame } from "remotion";
import { THEMES, SANS, FPS, type ProdProps, type SceneT } from "./theme";
import { Ember, Grid, clamp, EXPO } from "./ui";
import { SCENES } from "./scenes/scenes";

const useFonts = () => {
  const [h] = useState(() => delayRender("fonts"));
  useEffect(() => {
    Promise.all([new FontFace("Geist", `url(${staticFile("geist.woff2")})`, { weight: "100 900" }).load(), new FontFace("Geist Mono", `url(${staticFile("geist-mono.woff2")})`, { weight: "100 900" }).load()])
      .then((fs) => { fs.forEach((f) => document.fonts.add(f)); continueRender(h); }).catch((e) => { console.error(e); continueRender(h); });
  }, [h]);
};

// scene transition: A = hard cut with a fast ink wipe, B = soft fade
const Transition: React.FC<{ take: "A" | "B"; ink: string; accent: string }> = ({ take, ink, accent }) => {
  const f = useCurrentFrame();
  if (take === "B") return <AbsoluteFill style={{ background: "#f6ede4", opacity: interpolate(f, [0, 7], [0.9, 0], clamp), pointerEvents: "none" }} />;
  const p = interpolate(f, [0, 7], [0, 1], { ...clamp, easing: EXPO });
  return <AbsoluteFill style={{ pointerEvents: "none" }}><div style={{ position: "absolute", top: 0, bottom: 0, left: `${p * 100}%`, right: 0, background: ink, opacity: f < 7 ? 1 : 0 }} /><div style={{ position: "absolute", top: 0, bottom: 0, left: `${p * 100}%`, width: 10, background: accent, opacity: f < 7 ? 1 : 0 }} /></AbsoluteFill>;
};
// slides and wipes expose the new scene right-to-left, so cover only the part not yet revealed

const CAP_SCENES = new Set(["term", "shot", "stack", "vis"]);
const Caption: React.FC<{ say: string; start: number; dur: number; take: "A" | "B"; V: boolean }> = ({ say, start, dur, take, V }) => {
  const t = THEMES[take]; const f = useCurrentFrame();
  const words = say.split(" "); const total = words.reduce((a, w) => a + w.length + 1, 0);
  const p = (f / FPS - start) / dur; let acc = 0;
  return (
    <div style={{ position: "absolute", left: V ? 70 : 220, right: V ? 70 : 220, bottom: V ? 520 : 44, display: "flex", flexWrap: "wrap", justifyContent: "center", columnGap: V ? 14 : 12, fontFamily: SANS, fontSize: V ? 52 : 40, fontWeight: 500, letterSpacing: "-0.02em", lineHeight: 1.18 }}>
      {words.map((w, i) => { const a = acc / total; acc += w.length + 1; return <span key={i} style={{ color: p >= a - 0.01 ? t.ink : "rgba(23,23,23,0.32)" }}>{w}</span>; })}
    </div>
  );
};

export const Prod: React.FC<ProdProps> = ({ timeline, take, aspect }) => {
  useFonts();
  const t = THEMES[take]; const V = aspect === "9x16";
  if (!timeline) return <AbsoluteFill style={{ background: t.bg }} />;
  const flat: { scene: SceneT; line: (typeof timeline.lines)[number] }[] = timeline.lines.flatMap((line) => line.scenes.map((scene) => ({ scene, line })));
  const caps = process.env.NODE_ENV !== undefined && (timeline.id !== "hero");
  return (
    <AbsoluteFill style={{ background: t.bg, color: t.ink, fontFamily: SANS }}>
      {take === "B" ? <Ember file={staticFile("grain.png")} /> : null}
      <Grid take={take} aspect={aspect} />
      {flat.map(({ scene, line }, i) => {
        const from = Math.round(scene.start * FPS) - (i === 0 ? 0 : 2); const to = Math.round(scene.end * FPS) - 2;
        const C = SCENES[scene.t];
        return (
          <Sequence key={i} from={Math.max(0, from)} durationInFrames={Math.max(1, (i === flat.length - 1 ? Math.round(timeline.total * FPS) : to) - Math.max(0, from))}>
            <C scene={{ ...scene, start: Math.max(0, from) / FPS, end: (i === flat.length - 1 ? Math.round(timeline.total * FPS) : to) / FPS }} take={take} aspect={aspect} />
            {i > 0 && scene.t !== "cta" ? <Transition take={take} ink={t.ink} accent={t.accent} /> : null}
            {caps && CAP_SCENES.has(scene.t) ? <Caption say={line.say.replace(/\bAny are\b/, "Anyr").replace(/\bAny Router\b/, "AnyRouter").replace(/\bAny router dot dev\b/, "anyrouter.dev").replace(/ dot doc dot md/, " .doc.md").replace(/dot m m d/, ".mmd").replace(/U R L/g, "URL").replace(/d three/, "D3")} start={line.start - from / FPS} dur={line.dur} take={take} V={V} /> : null}
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
