# relay video claim ledger (2026-10-23)

| Claim | Status | Source |
|---|---|---|
| `anyr relay start` serves local models; bare `anyr relay` prints help | Shipped | cli src/relay.rs dispatch (start, pair); help.rs RELAY |
| Auto-detects fm serve and Ollama | Shipped | help.rs RELAY |
| CLI dials out, no ports open (outbound WebSocket) | Shipped | help.rs; kb local-relay-mac-bridge |
| Same sk-ar key connects the relay | Shipped | cli #97, anyrouter #2531 |
| Offline Mac falls back to cloud hops | Shipped | kb local-relay-mac-bridge (503 retry) |
| Apple FM served in-process | Open CLI PR | anyrouter-dev/cli#90 |
| LM Studio + Perplexity Decider (:8080) detection | Open CLI PR | anyrouter-dev/cli#117 |
| Decider via /decisions, own device only (pool: false) | Local branch, no PR | feat/relay-decisions-decider 566889c30 |
| Pool sharing is opt-in (`--pool`) | Shipped | help.rs `--pool` |
| "Your Mac" models in playground Compare strip | Design only | not in apps/playground |
| Latency numbers | Sample, not measured | no Mac on this box |
| Hosted decision model `typesafe/jev` | Shipped | config/models/typesafe/jev.yaml |
| `anyr upgrade` | Shipped | cli src/upgrade.rs |
