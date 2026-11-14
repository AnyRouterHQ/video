---
format: 1080x1920
duration: 71.0s
message: "The launch film, cut for Reels, Shorts and TikTok."
arc: Hook → Routes → Code → Pool → MCP → CLI → Close
audience: phone viewers, sound often off
mode: autonomous
music: none
---

## Video direction

The reel cut of `../STORYBOARD.md`, in the landing figure's tall layouts (`G.tall` in `compositions/rail.js`). Content sits in x 60-950, y 200-1220; captions own 1240-1480; nothing readable below 1536 or right of 950.

## Frame 1 — Hook
- src: compositions/reel/r1-hook.html

- scene: A lone key runs into 429 rate limited; frame 0 already reads without sound
- duration: 4.200s
- transition_in: cut
- voiceover: "One API key. Sooner or later, it stops."
- status: built

## Frame 2 — AnyRouter routes
- src: compositions/reel/r2-routing.html

- scene: routingTall: NVIDIA answers 429, Kilo Code answers 200, billed once
- duration: 13.000s
- transition_in: cut
- voiceover: "AnyRouter is one API in front of every model. It picks an upstream. If it is rate limited or down, AnyRouter tries the next one. One answer, one bill."
- status: built

## Frame 3 — Keep your code
- src: compositions/reel/r3-code.html

- scene: The home base URL field and subline, then 400+ models
- duration: 6.000s
- transition_in: cut
- voiceover: "Change the base URL, and keep your code. One key, more than four hundred models."
- status: built

## Frame 4 — The shared Pool
- src: compositions/reel/r4-pool.html

- scene: poolTall: one key stops, the Pool spreads requests and skips the limited key, Go plan
- duration: 22.400s
- transition_in: cut
- voiceover: "A free tier is small. One key, alone, hits the limit and stops. So people add free-tier keys to one shared Pool. AnyRouter spreads requests across the keys, and skips any key that is rate limited. Add one valid free-tier key, and you get the Go plan, with $0 on requests the Pool serves."
- status: built

## Frame 5 — The MCP gateway
- src: compositions/reel/r5-mcp.html

- scene: mcpTall: one endpoint, a tool call to Exa returns ok
- duration: 6.800s
- transition_in: cut
- voiceover: "Tools too. One MCP URL and one key, for every server you connect."
- status: built

## Frame 6 — The anyr CLI
- src: compositions/reel/r6-cli.html

- scene: The real installer output and dry run in a 41-column terminal
- duration: 10.600s
- transition_in: cut
- voiceover: "For coding, install the anyr command line tool with one line. Then anyr claude starts Claude Code through AnyRouter."
- status: built

## Frame 7 — Close
- src: compositions/reel/r7-close.html

- scene: The hub, the home H1, three ways in
- duration: 8.000s
- transition_in: cut
- voiceover: "One key. Every model. A shared Pool for free models. Start at anyrouter.dev."
- status: built
