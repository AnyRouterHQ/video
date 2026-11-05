# Self-review log

## Round 1 (stills, main 16x9 with captions, half scale)
- Thousands rendered as a gap ("15 015"): patched remocn RollingNumber spacer to a real comma.
- RollingNumber ignored left/right alignment (AbsoluteFill is a column flex): patched to align on the cross axis, so 323 / 5,878 / 367 / 735 now sit on their side with the label and rule.
- "Every model." heading collided with the first model row: moved above the key chip.
- Model-id marquee ran through the "models live today" label: moved down; second row kept only in 9:16.
- 15,015 overlapped its signup chart: number capped smaller when a chart shares the frame; chart moved down and narrowed.
- Ticket pile covered "1,017": fewer bodies (32), dimmed to 55%, dropped lower.
- Kinetic title gap between "4" and "months." too wide: word gap 0.24em -> 0.16em, and its measuring font switched to Geist.

## Round 2 (stills, 16x9 + 9x16 short, half scale)
- Captions glued the spoken word to the one before ("thenumbers"): the pop scale ate the space. Space is now a margin per word, pop 1.10 -> 1.06.
- 9:16 route: "Upstream B" wrapped at the frame edge, provider-chain header ran off screen: nowrap nodes, smaller mono header in 9:16.
- 16:9 second marquee row overlapped the first: removed in 16:9.

## Round 3 (draft 2 stills, 16x9 + 9x16 short, half scale; frames rebuilt from the new timelines at 65% of each scene, `review/frames.txt`, old list in `frames.d1.txt`)
- New `growth` scene (220 curve, then the pipeline's 56 filled under the muted 220 line): no overlaps in 16:9. Uses its own shared-scale SVG because remocn's AnimatedLineChart normalizes each series to its own min/max.
- 9:16 growth chart's x-axis labels sat right on top of the caption box: moved the chart up (top 900 -> 800, height 500 -> 460). Rechecked in r4v.
- Tickets bar reads "828 / 863" at 65%: it is still counting; it lands on 851.
- Checked every hardcoded value: deploy bars Nov 1-4 123 -> 141; CTA recap wall now 15,060 / 4,506 / 3,435 / 753.

## Round 4 (draft 3 stills, 16x9 + 9x16 short, half scale; `review/frames.txt` rebuilt from the new timelines at 65% of each scene, draft-2 list in `frames.d2.txt`; sheets `r5-sheet.png`, `r5v-sheet.png`)
- New order: open, users, activity, key (main only), models, added, pipeline, traffic, route (main only), who, commits, ai, deploys, cta. Fleet and tickets scenes cut.
- GrowthScene now takes its axis from the scene (`n`, `yMax`, `grid`, `ticks`, `peak`), so users (0-15k) and daily active users (30 points, 0-2k) use the same shared-scale SVG. remocn's AnimatedLineChart would have drawn 1,695 at the floor. Grid labels shortened to 5k/10k/15k; the headline shrinks with digit count so 15,034 clears the chart in 16:9.
- Peak marker "2,288 on Oct 26" fades in when the draw reaches it, so "over two thousand on the busiest day" has its number on screen. No overlaps in 16:9 or 9:16; the 9:16 charts end above the caption box.
- Hardcoded values checked: CTA wall 15,034 / 5,966 / 323 / 4,506 / 3,435 / 753; traffic duo 1.3M / 65B with the foot "Oct 6 to Nov 4".
- Final 1080p contact sheets (`out/*-d3.contact.png`) checked: no new issues.

## Round 5 (draft 4 stills, half scale, frames at 75% of each scene so the terminals have finished typing; sheets `r6*`, then `r7-sheet.png`, `r7v-sheet.png`, plus `r7/main-16x9c-2045.png` (grid) and `-2265.png` (close))
- New scenes: terminal-on-grain key beat, users skyline, model orbit, marble-run route with a headers terminal, anybot git and deploy terminals, 9-tile summary grid.
- r6 fixes: the route's headers terminal ran into the 16:9 caption box (moved up, return rail raised); the key and git terminals had empty space under the text (windows shortened); the key terminal's stray "7 of 10 shown" line removed; the grid's "each tile names its window" line removed; 9:16 git text enlarged (23 -> 26 px).
- An empty caption pill showed on the grid and the close (also in d2). Captions now render only while a line is spoken.
- The first r7 run crashed at the grid (`k is not defined`: a tile label used the per-tile counter outside its loop). Fixed, and the remaining stills re-rendered.
- r7: no overlaps in 16:9 or 9:16. The 9:16 grid stacks into 2 columns and 6 rows with three full-width tiles; 16:9 uses 4 columns and 3 rows.
- Audio: music under the VO sits 19.3 to 23.7 dB below it (title line -17.1 by design); the grid beat lifts to about 7.6 dB below the average voice level (`audio/duck_check.py`).

## Round 6 (draft 5: AnyRouter turns 3 months, said once; stills `r8-sheet.png`, `r8v-sheet.png` at 75% of each scene, frame list `review/frames.txt`, draft-4 list in `frames.d4.txt`; contact sheets `out/*-d5.contact.png`)
- Title reads "AnyRouter turns / 3 months." with the kicker "Aug 5 to Nov 4, 2026". The second open scene reads "Here they are, in numbers."
- No later still or contact frame shows a month count: labels say "since Aug 5", the grid header says "In numbers". Both timelines grep clean for "month" outside the open line.
- Speech-to-text of the five new takes matches the script ("Any router turns three months. Here they are in numbers", "Since August, ...").
- Loudness: main 1080p -14.4 LUFS / -2.3 dBFS, short -14.5 / -2.8 (no-music -14.3 / -2.2 and -2.8).
