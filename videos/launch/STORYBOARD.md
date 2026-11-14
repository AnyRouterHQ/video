---
format: 1920x1080
duration: 93.6s
message: "One API in front of every model: it falls back when an upstream is limited, a shared Pool of free-tier keys, one MCP URL, and a CLI for coding agents."
arc: One key stops → AnyRouter routes → One key, every model → The Pool → MCP gateway → anyr CLI → Close
audience: developers who juggle LLM keys, and people who want free models in their coding agent
mode: autonomous
music: none
---

## Video direction

The design source is the designer's plan (2026-11-13), copied into `frame.md` and `BRIEF.md`. In short:

- **Ground.** The landing figure's grey plate on every figure scene. No cards. The terminal is the white window on the ember grain, as on the home hero; the ember backdrop is the one gradient in the film.
- **Line language.** The home page's Rail figure only (`compositions/rail.js`): elbow wires, single stroke, tick marks at 0.82 of a wire, square terminals, 72px boxed logo nodes, dashed hairline rails, a dashed ring around the hub. Idle wires grey, the winning path ink at 3px, the refused hop red and dashed, ember only on moving dots, `200` and `ok`.
- **Continuity spine.** The hub never leaves. S1's red stop match-cuts into S2's NVIDIA node; S2's callout chip opens into S3's terminal; S2's fan of upstreams folds into S4's Pool merge; the Pool retracts into the hub, which slides to the MCP position; the agent chip opens into S6's terminal; the hub ends centred on the end card.
- **Motion meaning.** A dot is one request (ease none). A train of three dots is a streamed answer. A wire turning red and dashed in one frame is a refusal. A chip growing into a window means "this label is a real thing". A camera push means "look here". Nothing moves without a meaning.
- **Captions.** Ink pill, Geist 500, one line, bottom band. The bottom 200px holds nothing else.
- **Negative list.** No gradients except the ember backdrop, no glow, no blur, no particles, no stock icons, no bounce, no count-up, no invented output.

## Frame 1 — One key stops
- src: compositions/frames/01-one-key.html

- scene: The lone key from /pool's figure sends requests until a 429 stops them
- duration: 4.800s
- transition_in: cut
- type: problem
- beat: tension
- voiceover: "One API key. One provider. Sooner or later, it stops."
- focal: the red stop and `429 rate limited`
- status: built

## Frame 2 — AnyRouter routes
- src: compositions/frames/02-routing.html

- scene: The home routing figure: one request, NVIDIA answers 429, Kilo Code answers 200, one bill
- duration: 15.600s
- transition_in: cut
- type: product_intro
- beat: relief
- voiceover: "AnyRouter is one API in front of every model. Your agent sends one request. AnyRouter picks an upstream. If it is rate limited or down, AnyRouter tries the next one. One answer, one bill."
- focal: the hub, then the NVIDIA and Kilo Code nodes
- status: built

## Frame 3 — One key, every model
- src: compositions/frames/03-every-model.html

- scene: The request chip opens into the real home terminal (three endpoints), then the models chip opens into the real /models list
- duration: 11.000s
- transition_in: cut
- type: key_feature
- beat: understanding
- voiceover: "It speaks the OpenAI and Anthropic formats. Change the base URL, and keep your code. One key reaches more than four hundred models."
- focal: the terminal, then the models list
- status: built

## Frame 4 — The shared Pool
- src: compositions/frames/04-pool.html

- scene: The fan folds into the /pool figure: one key alone stops, the Pool spreads requests and skips a limited key, Go plan
- duration: 22.400s
- transition_in: cut
- type: key_feature
- beat: discovery
- voiceover: "A free tier is small. One key, alone, hits the limit and stops. So people add free-tier keys to one shared Pool. AnyRouter spreads requests across the keys, and skips any key that is rate limited. Add one valid free-tier key, and you get the Go plan, with zero dollars on requests the Pool serves."
- focal: the Pool merge and the skipped key
- status: built

## Frame 5 — The MCP gateway
- src: compositions/frames/05-mcp.html

- scene: The MCP figure: one endpoint, a tool call to Exa returns ok, the named servers light, then the real /mcp list
- duration: 15.000s
- transition_in: cut
- type: key_feature
- beat: understanding
- voiceover: "Tools work the same way. The AnyRouter MCP gateway gives your agent one URL and one key, for every MCP server you connect. Exa, Firecrawl, Keenable, GitHub, and more."
- focal: the endpoint chip, then the server boxes
- status: built

## Frame 6 — The anyr CLI
- src: compositions/frames/06-cli.html

- scene: The agent chip opens into the terminal: the real installer output, sign-in, the real dry run, codex and opencode, the real Cursor snippet
- duration: 16.800s
- transition_in: cut
- type: key_feature
- beat: doing
- voiceover: "For coding, install the any R command line tool with one line. Sign in once. Then any R claude starts Claude Code through AnyRouter. Codex and opencode work the same way. For Cursor, any R MCP add cursor connects the gateway."
- focal: the terminal
- status: built

## Frame 7 — Close
- src: compositions/frames/07-close.html

- scene: The hub, the home H1, and three ways in
- duration: 8.000s
- transition_in: cut
- type: cta
- beat: resolve
- voiceover: "One key. Every model. A shared Pool for free models. Start at any router dot dev."
- focal: the H1
- status: built
