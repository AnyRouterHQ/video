// node stills.mjs <compId> <out dir> <frame,frame,...> [scale]
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import path from "node:path";
import fs from "node:fs";
const [id, out, frames, scale = "1"] = process.argv.slice(2);
const CH = process.env.CHROME;
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts"), webpackOverride: (c) => ({ ...c, resolve: { ...c.resolve, alias: { ...(c.resolve?.alias || {}), "@": path.resolve("src") } } }) });
const comp = await selectComposition({ serveUrl, id, browserExecutable: CH, chromiumOptions: { disableWebSecurity: false } });
fs.mkdirSync(out, { recursive: true });
for (const f of frames.split(",")) await renderStill({ composition: comp, serveUrl, frame: Number(f), output: path.join(out, `${id}-${f}.png`), browserExecutable: CH, scale: Number(scale) });
console.log("done", comp.durationInFrames, comp.width, comp.height);
