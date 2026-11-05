import React from "react";
import { AbsoluteFill, Easing, Img, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { CHAPS, SANS, MONO, type Aspect, type Chap } from "./theme";

export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const EXPO = Easing.bezier(0.16, 1, 0.3, 1);
export const kinetic = { damping: 11, stiffness: 190, mass: 0.7 };
export const settle = { damping: 22, stiffness: 120, mass: 0.8 };

export function useSpr(delay = 0, config = kinetic) {
  const f = useCurrentFrame(); const { fps } = useVideoConfig();
  return spring({ frame: f - delay, fps, config });
}
export const fmt = (n: number) => Math.round(n).toLocaleString("en-US");

// Each scene paints its own ground so transitions can fade or slide it as one layer.
export const Ground: React.FC<{ chap: Chap; aspect: Aspect }> = ({ chap, aspect }) => {
  const p = CHAPS[chap]; const step = aspect === "9x16" ? 90 : 120;
  if (chap === "ember") return (
    <AbsoluteFill>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(60% 55% at 8% 0%, #fbe3cf 0%, rgba(251,227,207,0) 70%), radial-gradient(70% 60% at 100% 100%, #e8782f 0%, rgba(232,120,47,0.55) 35%, rgba(166,63,38,0) 75%), radial-gradient(60% 50% at 0% 100%, rgba(166,63,38,0.55) 0%, rgba(166,63,38,0) 70%), #f6ede4" }} />
      <div style={{ position: "absolute", inset: 0, backgroundImage: `url(${staticFile("grain.png")})`, backgroundSize: "256px 256px", opacity: 0.22, mixBlendMode: "multiply" }} />
    </AbsoluteFill>
  );
  const line = chap === "dark" ? "rgba(255,255,255,0.045)" : "rgba(10,10,10,0.05)";
  return (
    <AbsoluteFill style={{ background: p.bg }}>
      <div style={{ position: "absolute", inset: 0, backgroundImage: `linear-gradient(${line} 1px, transparent 1px), linear-gradient(90deg, ${line} 1px, transparent 1px)`, backgroundSize: `${step}px ${step}px`, backgroundPosition: "center", maskImage: "radial-gradient(75% 70% at 50% 50%, #000 30%, transparent 100%)" }} />
    </AbsoluteFill>
  );
};

export const Logo: React.FC<{ size: number; color: string }> = ({ size, color }) => (
  <div style={{ width: size, height: size, backgroundColor: color, WebkitMaskImage: `url(${staticFile("logo.svg")})`, WebkitMaskSize: "contain", WebkitMaskRepeat: "no-repeat", WebkitMaskPosition: "center" }} />
);

export const ProviderLogo: React.FC<{ slug: string; size: number; color: string }> = ({ slug, size, color }) => (
  <div style={{ width: size, height: size, flex: "none", backgroundColor: color, WebkitMaskImage: `url(${staticFile(`logos/${slug}.svg`)})`, WebkitMaskSize: "contain", WebkitMaskRepeat: "no-repeat", WebkitMaskPosition: "center" }} />
);

export const Chip: React.FC<{ chap: Chap; size: number; children: React.ReactNode; accent?: boolean; mono?: boolean; style?: React.CSSProperties }> = ({ chap, size, children, accent, mono, style }) => {
  const p = CHAPS[chap];
  return <div style={{ display: "inline-flex", alignItems: "center", gap: size * 0.45, padding: `${size * 0.34}px ${size * 0.8}px`, borderRadius: size * 2, background: p.plate, color: p.ink, border: `1.5px solid ${accent ? p.accent : p.hair}`, fontFamily: mono ? MONO : SANS, fontSize: size, fontWeight: 500, letterSpacing: "-0.01em", whiteSpace: "nowrap", ...style }}>{accent ? <span style={{ width: size * 0.42, height: size * 0.42, borderRadius: 99, background: p.accent }} /> : null}{children}</div>;
};

export { SANS, MONO };
