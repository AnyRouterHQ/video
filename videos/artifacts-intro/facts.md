# Artifacts claim ledger (2026-11-02)

Sources: customer docs `src/content/docs/api-reference/artifacts.md` (main @ 2fa8f2838), CLI `anyrouter-dev/cli` tag v0.1.37 (latest stable; v0.1.38-beta.* are pre-releases, ignored; `src/artifact.rs`), and the live account (`anyr artifact ls`).

| Claim | Status | Source |
|---|---|---|
| `anyr artifact publish <file\|dir>` prints the artifact URL | Shipped | cli v0.1.37 src/artifact.rs |
| URL is stable, `https://anyrouter.dev/a/{id}` | Shipped | docs, Artifacts API intro |
| Publishing again makes a new numbered version at the same URL (`--id <id>`) | Shipped | docs "Publish a new version"; cli `--id` |
| Private by default; `unlisted` = anyone with the link, no search; `public` = gallery + search | Shipped | docs visibility table; cli prints the private hint |
| `anyr artifact visibility <id> unlisted` | Shipped | cli v0.1.37 |
| Kinds: html, md, slides.md, doc.md, mmd/mermaid, jsx/tsx, svg, design.json, motion.json, source code | Shipped | docs "Kinds" |
| `.doc.md` shows a title, byline and an outline beside the text | Shipped | docs "Publish a document" |
| `.slides.md`: a `---` line starts a new 16:9 slide; arrows, O (overview), F (fullscreen) | Shipped | docs "Publish slides" |
| `.mmd` is drawn in the viewer's browser | Shipped | docs "Publish a Mermaid diagram" |
| React: one file, default export, Tailwind works; imports limited to react, lucide-react, recharts, d3, lodash, papaparse, mathjs, three, chart.js, xlsx, small shadcn set | Shipped | docs "Publish a React component" |
| Limits per publish: 5 MB per file, 50 files, 20 MB (CLI) | Shipped | cli help text |
| Author name hidden by default (`--show-author` to show) | Shipped | docs "Show your name" |
| Anyone can clone an unlisted/public artifact into their own private copy | Shipped | docs "Clone" |
| Public needs a 24 h old account, max 5 per day | Shipped | docs "Public gallery" |
| Views counted per day, owner-only stats | Shipped | docs "Views" |
| "Make something new" types: docs, slides (new), dashboard (beta); design, motion coming soon | Shipped / Beta | docs "Create from a type" |
| Poll / form capability | NOT in docs. Never claimed. | none |
| Download buttons need a content domain not yet enabled | Do not show | docs |

Never show: any private artifact or any row of the owner's list. Demo pages use made-up data only.
