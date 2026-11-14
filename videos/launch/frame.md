---
version: 1
name: AnyRouter Rail — Frame (launch film)
description: >
  The landing page's "How a request routes" figure, as a film. Thin 1px line art (2 film px)
  on the warm light-grey plate, elbow wires with tick marks, square terminals, boxed logo nodes,
  dashed hairline rails, a dashed ring around the hub. Ember only on what moves and what
  answered; red only on the refused hop. The terminal is the home hero's white window on the
  ember grain. Same fonts and captions as the explainer, so the films sit side by side.
unit: the frame — 1920×1080, rendered at 3840×2160 (device scale factor 2)

colors:
  plate: "oklch(0.97 0 0)"            # every figure scene's ground
  page: "#FFFFFF"                      # node boxes, hub disc, command chips, the terminal window
  ink: "#0A0A0A"                       # active wires (3px on the served path), hub ring, commands
  idle: "#B0B0B0"                      # idle wires, idle node borders, rails
  muted: "#636363"                     # callouts, labels, readout
  ember: "oklch(0.555 0.163 49)"       # moving dots, 200, ok, the cursor block, the URL underline
  red: "oklch(0.577 0.245 27.3)"       # the refused wire and node, 429. Nothing else.

lines:
  wire: "2px idle; served path 3px ink; refused 2px red, dash 8 8; source 2px ink, dash 8 8"
  ticks: "three 16px strokes, 8px apart, near each wire's node end"
  node: "72px square, radius 14, 2px border, mark 36px, black (colour marks only on Pool keys and the refused NVIDIA node)"
  hub: "dashed ring r 93 (dash 7 7), white disc with a 2.5px ink edge, the AnyRouter mark"
  rails: "1.5px idle, dash 6 6, a 14px open square at each end"
  dot: "ember circle r 9"

type:
  command: "Geist Mono 40px"
  terminal: "Geist Mono 36px, line height 52px"
  callout: "Geist Mono 34px"
  readout: "Geist Mono 32px"
  label: "Geist 36px"
  h1: "Geist 400 120px, tracking -0.03em (the home H1, never bold)"
  captions: "the series caption skin (caption-skin.html), bottom band"
---

## Rules

- One figure language: `compositions/rail.js`. Every scene draws with it, so a hub or node that
  carries across a cut lands on the same pixels.
- Motion has a meaning or it is cut: a dot is a request (ease none), a three-dot train is a
  streamed answer, a wire turning red in one frame is a refusal, a chip opening is "here is the
  real thing", a camera push is "look here".
- The only gradient and the only grain: the ember backdrop behind a terminal, taken from the
  home hero capture. This is the one exception to the explainer's no-grain rule.
- No glow, blur, particles, stock icons, bounce, count-ups, or invented output.
- The bottom 200px hold only the caption.
