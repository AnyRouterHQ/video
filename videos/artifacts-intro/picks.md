# remocn picks

Framework: remocn (shadcn registry of Remotion components) on Remotion 4.0.539. Sources read: `remocn.dev/llms.txt`, `/llms-components.txt`, `/docs/craft/anti-patterns.md`, and the registry JSON of every component used (`remocn.dev/r/<name>.json`). The registry entries are plain files with a `dependencies` list and no install scripts, so each file was read and copied into `remotion/src/lib/remocn/` by hand instead of running `shadcn add`. Components were not edited, except one import path (`@/lib/remocn/scene-motion` to `./scene-motion`).

Render stack: Remotion headless Chrome, one frame at a time (`--concurrency 1`), designed at 1920x1080 and 1080x1920, rendered at scale 1 for previews and scale 2 for the 4K masters.

## Picked

| Component | Scene it serves | Why |
|---|---|---|
| `stage` (+ `scene-motion` easings) | "Five kinds" shots: real captures of real published pages on a tilted studio plane | Its use signal is exactly a screenshot read as a photographed object; the camera moves give each 1.2 s shot life |
| `impact-shake` | "Publish it." and "One link." slams | The word lands with weight on the downbeat; impact frame is pinned to the pop SFX |
| `exploded-view` | Versions: an isometric stack of v1 to v4 that springs apart and clicks together | Isometric object (anatomy brief). The click-together is the "same link" idea; its close frame is retimed to 60% of the scene so the sound lands on it |
| `mask-reveal-up` | Read and kept as an option for the calm take (type reveal) | Not used in the final cut: custom word springs were needed so the accent word could change colour |
| remocn motion principles | Everything | Springs with overshoot for take A (kinetic), soft settle with blur for take B; one idea per beat; no component fights another |
| remocn craft rules (anti-patterns, design defaults) | Budgeting | Each scene is sized to its natural length, no transition is mounted as a component, text is one idea and under two seconds of reading |

Own scenes built in the remocn spirit (no component fit): kinetic word-spring type, strike-through list, typed terminal, visibility cards, end card, ember backdrop (CSS radial glows plus a noise tile, mirroring `hero-grain` in DESIGN.md).

## Rejected, with the reason

| Component | Reason |
|---|---|
| `claude-code`, `claude-chat`, `chat-gpt`, `v0`, `opencode` | Branded replicas of real products. Brief: no fake UI |
| `terminal-simulator`, `terminal-cursor-zoom` | Read. Internal typing clock cannot be pinned to the audio map, and the SFX (keys, enter, ding) must land on the exact frames. Replaced by a small terminal that types the real command and shows the real CLI output from `captures/pub-*.txt` |
| `agent-run`, `chat-to-preview-layout` | Depict an invented agent UI |
| `confetti`, `gravity-pile`, `crumple-toss` | Playful, breaks the professional tone |
| `shader-*` backdrops, `canvas-presentation` filters/transitions | WebGL in headless Chrome at 4K is slow and heavy on memory (the last session died of memory pressure). Ember is done with CSS |
| `launch-anything`, `release-teaser`, `workflow-console` templates | 16 to 47 s fixed stories with their own copy; the VO map here is ours |
| `caption-*` family | Needs word timestamps; Kokoro gives line timings only. Captions are our own proportional highlight |
| `whip-pan`, `zoom-blur`, `slide-swap` (transitions) | `@remotion/transitions` overlap would eat into the 1.2 s shots; replaced by an ink wipe (take A) and a soft fade (take B) |
