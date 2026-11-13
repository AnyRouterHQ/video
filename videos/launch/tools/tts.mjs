#!/usr/bin/env node
/**
 * tts — the launch film's narration, one ElevenLabs call per SCRIPT.md line.
 *
 *   node tools/tts.mjs [--only=N,N] [--text="…" --out=FILE]   (run from videos/launch/)
 *
 * Uses /with-timestamps so each line comes back with its own character timing:
 * word times are exact, no Whisper pass. Writes assets/voice/NN.wav and the
 * `voices` rows of audio_meta.json in the shape shared/authoring/*.mjs reads.
 * The key is read from ELEVENLABS_API_KEY and never written or printed.
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const VOICE = 'cjVigY5qzO86Huf0OWal';
const MODEL = 'eleven_multilingual_v2';
const SETTINGS = { stability: 0.5, similarity_boost: 0.8, style: 0.15, use_speaker_boost: true };

const args = Object.fromEntries(process.argv.slice(2).map(a => a.replace(/^--/, '').split(/=(.*)/s).slice(0, 2)));
const key = process.env.ELEVENLABS_API_KEY;
if (!key) throw new Error('ELEVENLABS_API_KEY is not set');

/** SCRIPT.md → [{ frame, text }]: `## … (Frame N)` opens a line, the 4-space block is spoken. */
function parseScript(md) {
  const out = [];
  let cur = null;
  for (const line of md.split(/\r?\n/)) {
    const h = line.match(/^#{2,3}\s+.*?\(frame\s+(\d+)\)/i);
    if (h) { cur = { frame: +h[1], text: '' }; out.push(cur); continue; }
    const m = cur && line.match(/^(?: {4,}|\t)(.+)$/);
    if (m) cur.text += (cur.text ? ' ' : '') + m[1].trim();
  }
  return out.filter(l => l.text);
}

/** Character alignment → words with start/end, split on whitespace. */
function words(al) {
  const out = [];
  let w = null;
  al.characters.forEach((ch, i) => {
    if (/\s/.test(ch)) { w = null; return; }
    if (!w) { w = { text: '', start: al.character_start_times_seconds[i], end: 0 }; out.push(w); }
    w.text += ch;
    w.end = al.character_end_times_seconds[i];
  });
  return out.map((x, i) => ({ id: `w${i}`, text: x.text, start: +x.start.toFixed(3), end: +x.end.toFixed(3) }));
}

async function speak(text, wav) {
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE}/with-timestamps?output_format=mp3_44100_128`, {
    method: 'POST',
    headers: { 'xi-api-key': key, 'content-type': 'application/json' },
    body: JSON.stringify({ text, model_id: MODEL, voice_settings: SETTINGS }),
  });
  if (!res.ok) throw new Error(`ElevenLabs ${res.status}: ${(await res.text()).slice(0, 300)}`);
  const j = await res.json();
  fs.mkdirSync(path.dirname(wav), { recursive: true });
  const mp3 = `${wav}.mp3`;
  fs.writeFileSync(mp3, Buffer.from(j.audio_base64, 'base64'));
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', mp3, '-ar', '44100', '-ac', '1', wav]);
  fs.rmSync(mp3);
  const dur = +execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', wav], { encoding: 'utf8' });
  return { duration_s: +dur.toFixed(3), words: words(j.alignment) };
}

if (args.text) {
  const r = await speak(args.text, path.resolve(args.out));
  console.log(`${args.out}  ${r.duration_s}s  ${r.words.length} words  first=${JSON.stringify(r.words[0])}`);
  process.exit(0);
}

const only = args.only ? new Set(args.only.split(',').map(Number)) : null;
const metaFile = 'audio_meta.json';
const meta = fs.existsSync(metaFile) ? JSON.parse(fs.readFileSync(metaFile, 'utf8')) : { voices: [] };
const byFrame = new Map(meta.voices.map(v => [v.frame, v]));
for (const { frame, text } of parseScript(fs.readFileSync('SCRIPT.md', 'utf8'))) {
  if (only && !only.has(frame)) continue;
  const rel = `assets/voice/${String(frame).padStart(2, '0')}.wav`;
  const r = await speak(text, path.resolve(rel));
  byFrame.set(frame, { frame, path: rel, duration_s: r.duration_s, words: r.words });
  console.log(`frame ${frame}  ${r.duration_s}s  ${r.words.length} words`);
}
meta.voices = [...byFrame.values()].sort((a, b) => a.frame - b.frame);
fs.writeFileSync(metaFile, `${JSON.stringify(meta, null, 2)}\n`);
