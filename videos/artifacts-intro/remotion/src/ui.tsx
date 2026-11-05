import React from "react";
import { Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { THEMES, SANS, MONO, type Take, type Aspect } from "./theme";

export const useV = (aspect: Aspect) => aspect === "9x16";
export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const EXPO = Easing.bezier(0.16, 1, 0.3, 1);

// Springs: A overshoots (kinetic), B settles softly.
export function useSpring(take: Take, delay = 0, over = true) {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  return spring({ frame: f - delay, fps, config: take === "A" && over ? { damping: 11, stiffness: 190, mass: 0.7 } : { damping: 28, stiffness: 80, mass: 1 } });
}

export const Grid: React.FC<{ take: Take; aspect: Aspect }> = ({ take, aspect }) => {
  const t = THEMES[take]; const step = aspect === "9x16" ? 90 : 120;
  const col = take === "A" ? "rgba(23,23,23,0.055)" : "rgba(23,23,23,0.05)";
  return <div style={{ position: "absolute", inset: 0, backgroundImage: `linear-gradient(${col} 1px, transparent 1px), linear-gradient(90deg, ${col} 1px, transparent 1px)`, backgroundSize: `${step}px ${step}px`, backgroundPosition: "center" }} />;
};

// ember = cream, rust, orange glows with grain (CSS-only, mirrors hero-grain in DESIGN.md)
export const Ember: React.FC<{ file: string }> = ({ file }) => (
  <>
    <div style={{ position: "absolute", inset: 0, background: "radial-gradient(60% 55% at 8% 0%, #fbe3cf 0%, rgba(251,227,207,0) 70%), radial-gradient(70% 60% at 100% 100%, #e8782f 0%, rgba(232,120,47,0.55) 35%, rgba(166,63,38,0) 75%), radial-gradient(60% 50% at 0% 100%, rgba(166,63,38,0.55) 0%, rgba(166,63,38,0) 70%), #f6ede4" }} />
    <div style={{ position: "absolute", inset: 0, backgroundImage: `url(${file})`, backgroundSize: "256px 256px", opacity: 0.22, mixBlendMode: "multiply" }} />
  </>
);

export const Chip: React.FC<{ take: Take; children: React.ReactNode; size: number; accent?: boolean; mono?: boolean }> = ({ take, children, size, accent, mono }) => {
  const t = THEMES[take];
  return <div style={{ display: "inline-flex", alignItems: "center", gap: size * 0.4, padding: `${size * 0.32}px ${size * 0.7}px`, borderRadius: size * 2, background: accent ? t.accent : t.plate, color: accent ? "#fff" : t.ink, border: `1.5px solid ${accent ? t.accent : t.hair}`, fontFamily: mono ? MONO : SANS, fontSize: size, fontWeight: 500, letterSpacing: "-0.01em", whiteSpace: "nowrap", backdropFilter: take === "B" ? "blur(8px)" : undefined }}>{children}</div>;
};
export { SANS, MONO };
