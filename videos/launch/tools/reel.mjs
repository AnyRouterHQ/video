#!/usr/bin/env node
/**
 * reel — builds the 9:16 reel as its own HyperFrames project in ../../.build/launch-reel/.
 *
 *   HF_SKILLS=… node tools/reel.mjs        (run from videos/launch/)
 *
 * The reel shares the master's assets, fonts, marks, footage, rail.js and caption skin, and
 * brings its own takes (reel/assets/voice), storyboard, sound cues and scenes
 * (reel/scenes → compositions/reel via tools/reel-shell.mjs). The project is scratch; the
 * sources above are what is committed. Then the same finish chain as the master runs in it.
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const out = path.resolve('../../.build/launch-reel');
const run = (script, args = [], cwd = out) => execFileSync(process.execPath, [script, ...args], { cwd, stdio: 'inherit' });

run(path.resolve('tools/words.mjs'), ['reel/audio_meta.json', 'compositions/words-reel.js', 'WR'], process.cwd());
run(path.resolve('tools/reel-shell.mjs'), [], process.cwd());

fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });
fs.cpSync('assets', path.join(out, 'assets'), { recursive: true, filter: s => !s.includes(`${path.sep}voice`) });
fs.cpSync('reel/assets/voice', path.join(out, 'assets/voice'), { recursive: true });
fs.cpSync('compositions', path.join(out, 'compositions'), { recursive: true, filter: s => !/frames|captions\.html/.test(path.relative('compositions', s)) });
for (const f of ['hyperframes.json', 'caption-skin.html', 'caption-overrides.json']) fs.copyFileSync(f, path.join(out, f));
for (const f of ['STORYBOARD.md', 'audio_meta.json', 'sfx-cues.json']) fs.copyFileSync(path.join('reel', f), path.join(out, f));

run(path.resolve('../../shared/authoring/finish.mjs'));
// The assembler writes a landscape page shell; the reel's stage is 1080x1920.
const index = path.join(out, 'index.html');
const html = fs.readFileSync(index, 'utf8')
  .replace(/width=1920, height=1080/g, 'width=1080, height=1920')
  .replace(/width: 1920px/g, 'width: 1080px').replace(/height: 1080px/g, 'height: 1920px')
  .replace(/data-width="1920"/g, 'data-width="1080"').replace(/data-height="1080"/g, 'data-height="1920"');
fs.writeFileSync(index, html);
// captions.mjs puts the portrait band at 1600; the platforms' buttons cover the bottom 20 percent,
// so the reel's captions sit in 1240-1480 (the designer's safe area).
const capFile = path.join(out, 'compositions/captions.html');
fs.writeFileSync(capFile, fs.readFileSync(capFile, 'utf8')
  .replace(/--cap-band-top: \d+px/g, '--cap-band-top: 1240px').replace(/--cap-band-height: \d+px/g, '--cap-band-height: 240px'));
console.log(`reel project: ${path.relative(process.cwd(), out)}`);
