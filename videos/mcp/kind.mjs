/**
 * mcp — a short launch film for the AnyRouter MCP gateway.
 * Authored. Facts on screen are the live /mcp page on 2026-11-22.
 * On demand only.
 */
import { collectAuthored } from '../../lib/authored.mjs';

const INPUTS = ['index.html', 'assets', 'compositions'];

export default {
  id: 'mcp',
  title: 'MCP',
  scheduled: false,
  renditions: ['landscape'],

  collect: ({ dir }) => collectAuthored(dir, INPUTS),

  headline: () => 'AnyRouter MCP. One URL. 35 connectors.',

  notes: data => [
    `This ${Math.round(data.seconds)}-second film shows the AnyRouter MCP gateway.`,
    '35 connectors are on the list. 24 connect today. The gateway URL is https://anyrouter.dev/api/v1/mcp.',
    `This is version ${data.version} of the film.`,
  ],

  link: () => 'https://anyrouter.dev/mcp',

  coverAt: film => +(film.duration - 1.2).toFixed(2),
};
