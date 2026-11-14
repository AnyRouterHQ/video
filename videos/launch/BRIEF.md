---
workflow: product-launch-video
flow: automation
storyboard: no
message: "One API in front of every model: it falls back when an upstream is limited, a shared Pool of free-tier keys, one MCP URL, and a CLI for coding agents."
destination: youtube, x, tiktok
aspect: 1920x1080 (rendered at 3840x2160)
language: en
audience: "developers who juggle LLM keys, and people who want free models inside Claude Code, Codex or opencode"
length: 93s
angle: launch-explainer
---

## Intent

The owner's brief (2026-11-13): an introduction film for the AnyRouter LLM routing gateway in
the style of the landing page's diagram. Explain AnyRouter, the Pool and how it works, the
AnyRouter MCP gateway, and coding with the `anyr` CLI. ElevenLabs English voice. 4K, for YouTube,
X and TikTok. Real browser captures, motion design drawn in the site's own Rail language, no AI slop.

The creative plan (scenes, copy, camera, sound, anti-slop list, review gate) is the designer's
document of 2026-11-13; `STORYBOARD.md` and `frame.md` carry what the build uses from it.

## What is real and what is drawn

- **Drawn** (inline SVG, `compositions/rail.js`): the routing figure (S2), the lone key (S1), the
  Pool figure (S4), the MCP figure (S5), the end card hub (S7). Geometry from the landing page's
  `routing-figure/layouts.ts` and `pool-explainer.tsx`, mapped with `film = (160 + 1.6x, 108 + 1.6y)`.
- **Captured** (`tools/capture.mjs`, headless Chromium, public pages, no sign-in; `capture/manifest.json`):
  the home hero terminal in its three endpoint states (S3, 4x density), the `/models` list (S3),
  the `/mcp` connector list (S5). The S6 ember backdrop is the hero capture's own backdrop.
- **Recorded** (PTY under `script(1)`, `capture/cli/`): the installer run in a throwaway HOME, an
  excerpt of `anyr claude --dry-run` (key lines dropped before it was written), and
  `anyr mcp add cursor --print`. The terminal in S6 replays those lines verbatim; `…` marks lines
  left out. `anyr login` is typed with no output: a real sign-in needs a browser approval.
  `kind.test.mjs` fails if a replayed line is in no recording.

## Claims ledger (live on 2026-11-14, `facts.json`)

- "more than four hundred models", chip `400+ models`: llms.txt "Catalog: 400+ models". The live
  counts disagree (API 443, home 402, /models "All 449"), so the film says the stable claim.
- Failover, "one answer, one bill": the home figure caption and llms.txt's failover line.
- "OpenAI and Anthropic formats", "keep your code": the home H1 subline.
- The Pool lines and "Go plan, with $0 on requests the Pool serves": /pool, verbatim.
- MCP: "One URL for AnyRouter's tools and every MCP server you connect", the endpoint, and the
  connector list (Exa, Firecrawl, Keenable, GitHub) from /mcp.
- `anyr cursor` is not a launch target in the shipped CLI ("not a launch target yet"), so the film
  never shows it; Cursor is reached with `anyr mcp add cursor`.
- No free-model count on screen: home says 50 with Go, /free lists 15.

## Notes

- Voice: `tools/tts.mjs` (ElevenLabs `/with-timestamps`, Eric, the explainer's settings). Word
  times come from the TTS alignment, so the Whisper steps of the chain are not needed.
  `tools/pace.mjs` replaces `pad-voices.mjs`: a 0.3s lead and a fixed slot per scene.
- Music: the explainer's bed (`assets/bgm/track.mp3`), for series continuity, carved under the voice.
- The 9:16 reel is a separate 74s cut in the designer's plan and is not built from this project.
