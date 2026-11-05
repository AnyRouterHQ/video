export type Take = "A" | "B";
export type Aspect = "16x9" | "9x16";
// DESIGN.md tokens: white page, ink text, hairline, one orange accent; ember = cream / rust / orange backdrop.
export const THEMES = {
  A: { bg: "#ffffff", ink: "#171717", muted: "#737373", hair: "#e5e5e5", plate: "#f5f5f5", accent: "#c2570c", accentSoft: "#fdebd9", dark: "#171717" },
  B: { bg: "#f6ede4", ink: "#171717", muted: "#6b5d52", hair: "rgba(23,23,23,0.14)", plate: "rgba(255,255,255,0.55)", accent: "#a63f26", accentSoft: "#f3d9c6", dark: "#171717" },
} as const;
export type ThemeT = (typeof THEMES)[Take];
export const SANS = '"Geist", system-ui, sans-serif';
export const MONO = '"Geist Mono", ui-monospace, monospace';
export const FPS = 30;
export const SIZES = { "16x9": { width: 1920, height: 1080 }, "9x16": { width: 1080, height: 1920 } } as const;
export interface SceneT { t: string; start: number; end: number; [k: string]: any }
export interface LineT { say: string; start: number; dur: number; end: number; scenes: SceneT[] }
export interface TimelineT { id: string; total: number; voEnd: number; lines: LineT[] }
export interface ProdProps { timeline: TimelineT | null; take: Take; aspect: Aspect; [k: string]: unknown }
