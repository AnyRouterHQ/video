#!/usr/bin/env node
/**
 * preview — snapshots one frame composition alone, without rebuilding the film.
 *
 *   node tools/preview.mjs 02-routing 0,4.5,8.1 [outdir]      (run from videos/launch/)
 *
 * Writes a one-scene project in ../../.build/launch-preview/ (assets and compositions
 * copied) and runs `hyperframes snapshot --at`. Prints the png paths.
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const [id, at, out = path.resolve('../../.build/launch-preview/shots', id)] = process.argv.slice(2);
const src = fs.readFileSync(`compositions/frames/${id}.html`, 'utf8');
const dur = /data-duration="([\d.]+)"/.exec(src)[1];
const dir = path.resolve('../../.build/launch-preview');
fs.mkdirSync(dir, { recursive: true });
// Copies, not symlinks: the HyperFrames bundler reads a symlinked composition as empty.
for (const d of ['assets', 'compositions']) {
  fs.rmSync(path.join(dir, d), { recursive: true, force: true });
  fs.cpSync(path.resolve(d), path.join(dir, d), { recursive: true });
}
fs.writeFileSync(path.join(dir, 'index.html'), `<!doctype html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=1920, height=1080">
<script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
<style>*{margin:0;padding:0;box-sizing:border-box}html,body{width:1920px;height:1080px;overflow:hidden;background:#000}#root{position:relative;width:1920px;height:1080px;overflow:hidden;background:#fff}.scene{position:absolute;inset:0}</style></head>
<body><div id="root" data-composition-id="main" data-start="0" data-duration="${dur}" data-width="1920" data-height="1080">
<div id="el-${id}" class="scene" data-composition-id="${id}" data-composition-src="compositions/frames/${id}.html" data-start="0" data-duration="${dur}" data-track-index="0"></div>
</div><script>window.__timelines = window.__timelines || {};</script></body></html>`);
fs.rmSync(out, { recursive: true, force: true });
const bin = path.resolve('../../node_modules/.bin/hyperframes');
execFileSync(bin, ['snapshot', dir, `--at=${at}`, '--no-end', '--describe=false', '-o', out], { stdio: ['ignore', 'pipe', 'inherit'] });
for (const f of fs.readdirSync(out).filter(f => f.endsWith('.png')).sort()) console.log(path.join(out, f));
