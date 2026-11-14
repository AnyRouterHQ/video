#!/usr/bin/env node
/**
 * reel-shell — wraps a reel scene's script in the composition boilerplate every frame needs
 * (fonts, the 1080x1920 root, the bg and stage clips, rail.js and the reel's word table).
 *
 *   node tools/reel-shell.mjs      (run from videos/launch/)
 *
 * Reads reel/scenes/<id>.js (+ optional <id>.css and <id>.html for extra markup) and writes
 * compositions/reel/<id>.html. The scene script gets `root`, `tl`, `svg`, `L`, `cam`, `w(word)`.
 */
import fs from 'node:fs';
import path from 'node:path';

const SRC = 'reel/scenes';
const meta = JSON.parse(fs.readFileSync('reel/audio_meta.json', 'utf8'));
for (const f of fs.readdirSync(SRC).filter(f => f.endsWith('.js')).sort()) {
  const id = f.replace(/\.js$/, '');
  const frame = +/^r(\d)/.exec(id)[1];
  const dur = meta.voices.find(v => v.frame === frame).duration_s;
  const read = ext => (fs.existsSync(path.join(SRC, `${id}.${ext}`)) ? fs.readFileSync(path.join(SRC, `${id}.${ext}`), 'utf8') : '');
  const sel = `[data-composition-id="${id}"]`;
  const css = read('css').replaceAll('&', sel);
  const html = `<template>
  <script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
  <script src="compositions/rail.js"></script>
  <script src="compositions/words-reel.js"></script>
  <style>
    @font-face { font-family: "Geist"; src: url("assets/fonts/geist.woff2") format("woff2"); font-weight: 100 900; font-display: block; }
    @font-face { font-family: "Geist Mono"; src: url("assets/fonts/geist-mono.woff2") format("woff2"); font-weight: 100 900; font-display: block; }
    ${sel} { position: absolute; inset: 0; width: 1080px; height: 1920px; overflow: hidden; -webkit-font-smoothing: antialiased; text-rendering: geometricPrecision; }
    ${sel} .k-bg { position: absolute; inset: 0; background: oklch(0.97 0 0); }
    ${sel} .k-stage { position: absolute; inset: 0; }
    ${sel} .cam { position: absolute; left: 0; top: 0; width: 1080px; height: 1920px; }
    ${sel} svg.fig { position: absolute; left: 0; top: 0; overflow: visible; }
${css}
  </style>

  <div id="root" data-composition-id="${id}" data-width="1080" data-height="1920" data-duration="${dur}">
    <div id="${id}-bg" class="k-bg clip" data-start="0" data-duration="${dur}" data-track-index="0"></div>
    <div id="${id}-stage" class="k-stage clip" data-start="0" data-duration="${dur}" data-track-index="1">
      <div class="cam"><svg class="fig" width="1080" height="1920" viewBox="0 0 1080 1920"></svg>${read('html')}</div>
    </div>
  </div>

  <script>
    (() => {
      const ID = '${id}';
      const root = document.querySelector('${sel}');
      const w = (word, nth, edge) => WR(${frame}, word, nth, edge);
      document.fonts.ready.then(() => {
        const svg = root.querySelector('svg.fig');
        const L = { rails: Rail.el(svg, 'g'), wires: Rail.el(svg, 'g'), dots: Rail.el(svg, 'g'), top: Rail.el(svg, 'g') };
        const tl = gsap.timeline({ paused: true });
        const cam = Rail.camera(root.querySelector('.cam'), root);
        cam.set(tl, { s: 1, cx: 540, cy: 960 }, 0);
${fs.readFileSync(path.join(SRC, f), 'utf8').replace(/^/gm, '        ')}
        window.__timelines = window.__timelines || {};
        window.__timelines[ID] = tl;
      });
    })();
  </script>
</template>
`;
  fs.writeFileSync(`compositions/reel/${id}.html`, html);
  console.log(`compositions/reel/${id}.html  ${dur}s`);
}
