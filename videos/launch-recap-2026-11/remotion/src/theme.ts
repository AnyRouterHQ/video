export type Aspect = "16x9" | "9x16" | "1x1";
export type Chap = "light" | "dark" | "ember";
// DESIGN.md tokens: ink on white, white on ink, one orange accent; ember = cream / rust / orange grain backdrop.
export const CHAPS = {
  light: { bg: "#ffffff", ink: "#0a0a0a", muted: "#737373", hair: "#e5e5e5", plate: "#f5f5f5", accent: "#c2570c", ok: "#15803d", bad: "#b91c1c" },
  dark: { bg: "#0a0a0a", ink: "#fafafa", muted: "#a3a3a3", hair: "rgba(255,255,255,0.12)", plate: "#1c1c1c", accent: "#ee8a4a", ok: "#4ade80", bad: "#f87171" },
  ember: { bg: "#f6ede4", ink: "#171717", muted: "#6b5d52", hair: "rgba(23,23,23,0.14)", plate: "rgba(255,255,255,0.62)", accent: "#a63f26", ok: "#15803d", bad: "#b91c1c" },
} as const;
export type Pal = (typeof CHAPS)[Chap];
export const SANS = '"Geist", system-ui, sans-serif';
export const MONO = '"Geist Mono", ui-monospace, monospace';
export const FPS = 30;
export const SIZES = { "16x9": { width: 1920, height: 1080 }, "9x16": { width: 1080, height: 1920 }, "1x1": { width: 1080, height: 1080 } } as const;
export interface Word { w: string; s: number; e: number }
export interface SceneT { t: string; chap: Chap; start: number; end: number; [k: string]: any }
export interface LineT { id: string; say: string; start: number; dur: number; end: number; scenes: SceneT[]; words: Word[] }
export interface TimelineT { id: string; total: number; voEnd: number; lines: LineT[] }
export interface ProdProps { timeline: TimelineT | null; aspect: Aspect; captions: boolean; [k: string]: unknown }
