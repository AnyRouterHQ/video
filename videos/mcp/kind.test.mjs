import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import kind from './kind.mjs';

const dir = path.dirname(fileURLToPath(import.meta.url));
const read = f => fs.readFileSync(path.join(dir, f), 'utf8');

test('collect is deterministic', async () => {
  const a = await kind.collect({ dir });
  const b = await kind.collect({ dir });
  assert.deepEqual(a.parts, b.parts);
  assert.ok(a.parts.some(p => p.startsWith('compositions/frames/04-close.html:')));
});

test('the cover is taken from the settled end card', () => {
  const seconds = parseFloat(/data-duration="([\d.]+)"/.exec(read('index.html'))[1]);
  const at = kind.coverAt({ duration: seconds });
  assert.ok(at > seconds - 2.5 && at < seconds - 0.6);
});

test('the film states only the live counts', () => {
  const frames = fs.readdirSync(path.join(dir, 'compositions/frames')).map(f => read(`compositions/frames/${f}`)).join('\n');
  assert.match(frames, /35/);
  assert.match(frames, /24 connect today/);
  assert.match(frames, /anyrouter\.dev\/api\/v1\/mcp/);
  assert.doesNotMatch(frames, /platform billing/i);
});
