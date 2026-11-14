/**
 * launch — the narrated AnyRouter launch film: the routing gateway, fallback, the
 * shared Pool, the MCP gateway, and coding with the `anyr` CLI.
 *
 * AUTHORED, not generated, in the same series look as `explainer`: BRIEF.md →
 * SCRIPT.md + STORYBOARD.md → compositions/frames/. index.html is rendered as it is.
 * Every number on screen comes from facts.json (tools/facts.mjs, live public endpoints);
 * the page captures and their manifest are in assets/capture/ (tools/capture.mjs).
 *
 * Rendered on demand (`node lib/cli.mjs run launch`), never by the nightly run.
 */
import { collectAuthored } from '../../lib/authored.mjs';

const INPUTS = ['index.html', 'assets', 'compositions'];

export default {
  id: 'launch',
  title: 'AnyRouter launch',
  scheduled: false,
  // The 9:16 reel is its own 74s cut with its own takes and tall layouts (the designer's plan),
  // not a portrait copy of this 16:9 master, so the master ships landscape only.
  renditions: ['landscape'],

  collect: ({ dir }) => collectAuthored(dir, INPUTS),

  headline: () => 'AnyRouter: one key for every model, with fallback, a shared Pool, MCP and a coding CLI',

  notes: data => [
    `A ${Math.round(data.seconds)}-second narrated launch film for AnyRouter.`,
    'It shows how a request routes and falls back, how the shared Pool works, the MCP gateway, and coding with `anyr claude`.',
    `Film version v${data.version}.`,
  ],

  /** The closing lockup, once it has settled. */
  coverAt: film => +(film.duration - 1.2).toFixed(2),
};
