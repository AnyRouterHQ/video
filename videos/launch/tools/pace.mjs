#!/usr/bin/env node
/**
 * pace — gives each narration take the room its scene needs, in place of pad-voices.mjs.
 *
 *   node tools/pace.mjs        (run from videos/launch/, after tools/tts.mjs)
 *
 * Each scene's picture runs LEAD seconds before its first word, and the take is padded
 * with silence to the scene's length in SLOT (the figure needs time to move after the
 * voice stops; the voice is never sped up). Word times shift by LEAD. Idempotent: a take
 * already paced (v.paced) is left alone.
 */
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';

const LEAD = 0.3;
// The master's slots; a cut with its own takes (reel/) brings a slots.json.
const SLOT = fs.existsSync('slots.json') ? JSON.parse(fs.readFileSync('slots.json', 'utf8'))
  : { 1: 4.8, 2: 15.6, 3: 11.0, 4: 22.4, 5: 15.0, 6: 16.8, 7: 8.0 };

const meta = JSON.parse(fs.readFileSync('audio_meta.json', 'utf8'));
for (const v of meta.voices) {
  if (v.paced) continue;
  const slot = SLOT[v.frame];
  const spoken = LEAD + v.duration_s;
  if (spoken > slot - 0.4) throw new Error(`frame ${v.frame}: take ${v.duration_s}s does not fit its ${slot}s slot; lengthen SLOT`);
  const tmp = `${v.path}.tmp.wav`;
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', v.path,
    '-af', `adelay=${LEAD * 1000}:all=1,apad=whole_dur=${slot}`, '-t', String(slot), tmp]);
  fs.renameSync(tmp, v.path);
  v.duration_s = +parseFloat(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', v.path], { encoding: 'utf8' })).toFixed(3);
  v.words = v.words.map(w => ({ ...w, start: +(w.start + LEAD).toFixed(3), end: +(w.end + LEAD).toFixed(3) }));
  v.paced = { lead_s: LEAD, slot_s: slot };
  console.log(`frame ${v.frame}: ${v.duration_s}s`);
}
fs.writeFileSync('audio_meta.json', `${JSON.stringify(meta, null, 2)}\n`);
