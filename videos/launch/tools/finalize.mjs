#!/usr/bin/env node
/**
 * finalize — a rendered film → the file that ships: loudness to -16 LUFS / -1.5 dBTP
 * (two-pass loudnorm, video stream copied), a cover PNG from the settled end card, and an
 * .srt of the captions for YouTube.
 *
 *   node tools/finalize.mjs <raw.mp4> <out.mp4> <captions_groups.json>   (run from videos/launch/)
 *
 * Prints the measured loudness before and after; the numbers go in the release notes.
 */
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';

const [raw, out, groupsFile] = process.argv.slice(2);
/** loudnorm's analysis of a file; ffmpeg prints its JSON on stderr. */
const measure = file => {
  const text = execFileSync('sh', ['-c', 'ffmpeg -hide_banner -nostats -i "$1" -af loudnorm=I=-16:TP=-1.5:LRA=11:print_format=json -f null - 2>&1', 'sh', file], { encoding: 'utf8' });
  return JSON.parse(text.slice(text.lastIndexOf('{'), text.lastIndexOf('}') + 1));
};

const m = measure(raw);
const filter = `loudnorm=I=-16:TP=-1.5:LRA=11:measured_I=${m.input_i}:measured_TP=${m.input_tp}:measured_LRA=${m.input_lra}:measured_thresh=${m.input_thresh}:offset=${m.target_offset}:linear=true`;
execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', raw, '-c:v', 'copy', '-af', filter, '-ar', '48000', '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', out]);
const after = measure(out);
console.log(`loudness ${raw}: ${m.input_i} LUFS, ${m.input_tp} dBTP → ${out}: ${after.input_i} LUFS, ${after.input_tp} dBTP`);

const dur = +execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', out], { encoding: 'utf8' });
const cover = out.replace(/\.mp4$/, '-cover.png');
execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-ss', String(+(dur - 1.2).toFixed(2)), '-i', out, '-frames:v', '1', cover]);
console.log(`cover ${cover}`);

if (groupsFile) {
  const ts = s => { const ms = Math.round(s * 1000); const h = Math.floor(ms / 3600000), mi = Math.floor(ms / 60000) % 60, se = Math.floor(ms / 1000) % 60; return `${String(h).padStart(2, '0')}:${String(mi).padStart(2, '0')}:${String(se).padStart(2, '0')},${String(ms % 1000).padStart(3, '0')}`; };
  const { groups } = JSON.parse(fs.readFileSync(groupsFile, 'utf8'));
  const srt = groups.map((g, i) => `${i + 1}\n${ts(g.start)} --> ${ts(Math.min(g.end + 0.3, groups[i + 1]?.start ?? Infinity))}\n${g.text}\n`).join('\n');
  const srtFile = out.replace(/\.mp4$/, '.srt');
  fs.writeFileSync(srtFile, srt);
  console.log(`captions ${srtFile}: ${groups.length} cues`);
}
