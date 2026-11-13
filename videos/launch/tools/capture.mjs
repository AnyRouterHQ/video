#!/usr/bin/env node
/**
 * capture — real footage of the public anyrouter.dev pages, at native 4K.
 *
 *   node tools/capture.mjs [--only=name,name]          (run from videos/launch/)
 *
 * A 1920x1080 viewport at device scale factor 2, light theme, no sign-in, no
 * cookies kept. Stills land in assets/footage/<name>.png (not under a dir named
 * capture: portrait.mjs skips those); frame sequences (the
 * models table scrolling, the routing figure looping) in capture/raw/,
 * which is gitignored. capture/manifest.json records URL and time.
 */
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import puppeteer from 'puppeteer-core';

const CHROME = path.join(os.homedir(), '.cache/ms-playwright/chromium-1194/chrome-linux/chrome');
const OUT = path.resolve('assets/footage');
const RAW = path.resolve('capture/raw');
const SITE = 'https://anyrouter.dev';

/** Each shot: a page, then a viewport still, an element still, or a frame sequence. */
const SHOTS = [
  { name: 'home-hero', url: '/', still: 'viewport' },
  { name: 'home-terminal', url: '/', still: '.hero-grain' },
  { name: 'home-models-table', url: '/', still: 'section.scroll-mt-20' },
  { name: 'home-routing', url: '/', still: 'figure', tab: 'Routing', wait: 9000 },
  { name: 'home-routing-pool', url: '/', still: 'figure', tab: 'Pool', wait: 9000 },
  { name: 'home-routing-mcp', url: '/', still: 'figure', tab: 'MCP', wait: 9000 },
  { name: 'home-terminal-loop', url: '/', sequence: '.hero-grain', seconds: 8, fps: 10 },
  { name: 'models', url: '/models', still: 'viewport' },
  { name: 'models-scroll', url: '/models', scroll: { px: 2400, frames: 90 } },
  { name: 'mcp', url: '/mcp', still: 'viewport' },
  { name: 'mcp-servers', url: '/mcp', still: 'viewport', scrollY: 700 },
  { name: 'pool', url: '/pool', still: 'viewport' },
  { name: 'pool-figure', url: '/pool', still: 'section', wait: 9000 },
  { name: 'pool-table', url: '/pool', still: 'viewport', scrollY: 740 },
  { name: 'free', url: '/free', still: 'viewport' },
  { name: 'pricing', url: '/pricing', still: 'viewport' },
  { name: 'docs-quickstart', url: '/docs/getting-started/quickstart', still: 'viewport' },
  { name: 'docs-mcp-gateway', url: '/docs/mcp/gateway', still: 'viewport' },
];

const only = process.argv.find(a => a.startsWith('--only='))?.slice(7).split(',');
fs.mkdirSync(RAW, { recursive: true });
const manifestFile = path.resolve('capture/manifest.json');
const manifest = fs.existsSync(manifestFile) ? JSON.parse(fs.readFileSync(manifestFile, 'utf8')) : {};

const browser = await puppeteer.launch({ executablePath: CHROME, args: ['--no-sandbox', '--hide-scrollbars'] });
console.log(`chrome pid ${browser.process().pid}`);
try {
  for (const shot of SHOTS) {
    if (only && !only.includes(shot.name)) continue;
    const page = await (await browser.createBrowserContext()).newPage();
    await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 2 });
    await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: 'light' }, { name: 'prefers-reduced-motion', value: shot.wait ? 'reduce' : 'no-preference' }]);
    await page.goto(SITE + shot.url, { waitUntil: 'networkidle2', timeout: 90000 });
    await page.evaluate(() => document.fonts.ready);
    if (shot.scrollY) await page.evaluate(y => window.scrollTo(0, y), shot.scrollY);
    if (shot.tab) {
      await page.evaluate(t => {
        const b = [...document.querySelectorAll('button, [role=tab]')].find(e => e.textContent.trim() === t);
        b?.scrollIntoView({ block: 'center' });
        b?.click();
      }, shot.tab);
    }
    const sel = shot.still && shot.still !== 'viewport' ? shot.still : shot.sequence;
    if (sel) await page.evaluate(s => document.querySelector(s)?.scrollIntoView({ block: 'center' }), sel);
    await new Promise(r => setTimeout(r, shot.wait ?? 2500));
    const files = [];
    if (shot.still === 'viewport') {
      files.push(`${shot.name}.png`);
      await page.screenshot({ path: path.join(OUT, files[0]) });
    } else if (shot.still) {
      files.push(`${shot.name}.png`);
      await (await page.$(shot.still)).screenshot({ path: path.join(OUT, files[0]) });
    } else if (shot.sequence) {
      const el = await page.$(shot.sequence);
      const dir = path.join(RAW, shot.name);
      fs.mkdirSync(dir, { recursive: true });
      const n = shot.seconds * shot.fps;
      const start = Date.now();
      for (let i = 0; i < n; i++) {
        const t0 = Date.now();
        await el.screenshot({ path: path.join(dir, `${String(i).padStart(4, '0')}.png`) });
        await new Promise(r => setTimeout(r, Math.max(0, 1000 / shot.fps - (Date.now() - t0))));
      }
      files.push(`capture/raw/${shot.name}/ (${n} frames over ${((Date.now() - start) / 1000).toFixed(1)}s wall clock)`);
    } else if (shot.scroll) {
      const dir = path.join(RAW, shot.name);
      fs.mkdirSync(dir, { recursive: true });
      for (let i = 0; i < shot.scroll.frames; i++) {
        const t = i / (shot.scroll.frames - 1);
        const ease = t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2;
        await page.evaluate(y => window.scrollTo(0, y), Math.round(ease * shot.scroll.px));
        await new Promise(r => setTimeout(r, 60));
        await page.screenshot({ path: path.join(dir, `${String(i).padStart(4, '0')}.png`) });
      }
      files.push(`capture/raw/${shot.name}/ (${shot.scroll.frames} frames, ${shot.scroll.px}px eased scroll)`);
    }
    manifest[shot.name] = { url: SITE + shot.url, capturedAt: new Date().toISOString(), viewport: '1920x1080@2x', files, ...(shot.tab && { tab: shot.tab }) };
    console.log(`${shot.name}  ${files.join(', ')}`);
    await page.browserContext().close();
  }
} finally {
  await browser.close();
  fs.writeFileSync(manifestFile, `${JSON.stringify(manifest, null, 2)}\n`);
}
