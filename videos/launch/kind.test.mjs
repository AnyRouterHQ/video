import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import kind from './kind.mjs';
import { numbersIn, factNumbers } from '../../lib/plan.mjs';

const dir = path.dirname(fileURLToPath(import.meta.url));
const read = f => fs.readFileSync(path.join(dir, f), 'utf8');
const frames = () => fs.readdirSync(path.join(dir, 'compositions/frames')).map(f => [f, read(`compositions/frames/${f}`)]);
const facts = JSON.parse(read('facts.json'));
/** A PTY recording as the plain lines it showed: escapes and carriage returns removed. */
const recording = f => read(`capture/cli/${f}`)
  .replace(/\x1b\][^\x07\x1b]*(\x07|\x1b\\)/g, '').replace(/\x1b\[[0-9;?]*[A-Za-z]/g, '')
  .split(/\r?\n/).map(l => l.replace(/\r/g, ''));

test('collect is deterministic: an unedited film keeps the same identity', async () => {
  const a = await kind.collect({ dir });
  const b = await kind.collect({ dir });
  assert.deepEqual(a.parts, b.parts);
  assert.ok(a.parts.some(p => p.startsWith('assets/voice/01.wav:')), 'the narration is part of the identity');
  assert.ok(a.parts.some(p => p.startsWith('compositions/frames/07-close.html:')), 'the scenes are part of the identity');
  assert.ok(a.parts.some(p => p.startsWith('compositions/rail.js:')), 'the shared figure code is part of the identity');
});

test('the cover is taken from the settled end card', async () => {
  const seconds = parseFloat(/data-duration="([\d.]+)"/.exec(read('index.html'))[1]);
  const at = kind.coverAt({ duration: seconds });
  assert.ok(at > seconds - 2.5 && at < seconds - 0.6, `cover at ${at}s of ${seconds}s`);
});

test('no API key is on screen or in a recording', () => {
  for (const [f, html] of frames()) assert.doesNotMatch(html, /\b(sk-(ar|or)-v1-|nvapi-)[A-Za-z0-9]/, `${f} shows a key`);
  for (const f of fs.readdirSync(path.join(dir, 'capture/cli'))) {
    assert.doesNotMatch(read(`capture/cli/${f}`), /\b(sk-ar-|sk-or-|nvapi-|ak_)[A-Za-z0-9]/, `capture/cli/${f} holds a key`);
  }
});

test('every terminal output line in the CLI scene is a line a command printed', () => {
  const pool = [...recording('install.typescript'), ...read('capture/cli/claude-dry-run.txt').split('\n'), ...recording('mcp-add-cursor.typescript')];
  const scenes = ['compositions/frames/06-cli.html', 'reel/scenes/r6-cli.js'].map(read);
  for (const [html, name] of scenes.flatMap(h => ['INSTALL_OUT', 'DRY_OUT', 'CURSOR_OUT'].filter(n => h.includes(`const ${n} =`)).map(n => [h, n]))) {
    const lines = new Function(`return ${new RegExp(`const ${name} = (\\[.*?\\]);`).exec(html)[1]}`)();
    for (const l of lines) {
      if (l === '' || l === '…') continue;
      assert.ok(pool.some(p => p.trimEnd() === l.trimEnd()), `${name}: "${l}" is in no recording`);
    }
  }
});

test('anyr cursor is never shown as a command: Cursor is reached with anyr mcp add cursor', () => {
  for (const [f, html] of frames()) assert.doesNotMatch(html, /anyr cursor/, f);
});

test('every number the voice or the screen states is in the facts read from the live site', () => {
  const known = factNumbers(facts);
  const spoken = read('SCRIPT.md').split('\n').filter(l => /^ {4}\S/.test(l)).join(' ');
  const onScreen = ['400+ models', 'Go plan · $0 on Pool requests'];
  for (const n of [...numbersIn(spoken), ...onScreen.flatMap(numbersIn)]) {
    assert.ok(known.some(k => Math.abs(k - n.value) <= n.tolerance), `"${n.token}" is not in facts.json`);
  }
  assert.ok(spoken.includes('four hundred') && facts.models.claim.value === 400, 'the spoken model count matches the live 400+ claim');
  assert.match(facts.pool.oneKeyGivesGo.text, /\$0 on requests the Pool serves/, 'the Go plan line is the /pool copy');
});

test('the MCP servers the voice names are on the live /mcp list', () => {
  const names = facts.mcp.servers.list.map(s => s.name);
  for (const n of ['Exa', 'Firecrawl', 'Keenable', 'GitHub']) assert.ok(names.includes(n), `${n} is not on /mcp`);
});
