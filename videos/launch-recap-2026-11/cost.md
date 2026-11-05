# Spend log
| Step | Service | Cost |
|---|---|---|
| Voice-over | ElevenLabs Starter, 1,091 characters (16 clips incl. 2 audition clips), cached in `audio/vo-cache/` | inside the monthly plan quota (25,460 chars were left before this job) |
| Voice-over, draft 2 | ElevenLabs Starter, 495 characters (6 changed lines; 10 lines reused from cache) | inside the monthly plan quota |
| Music + SFX | synthesized locally | $0 |
| Video | Remotion + remocn, local render | $0 |
| D1 reads | 6 read-only queries (largest 131,945 rows read) | $0 (inside plan) |
| D1 reads, draft 2 | 2 read-only queries (users by month 31,378 rows; window signups 13,529 rows) | $0 (inside plan) |
| Voice-over, draft 3 | ElevenLabs Starter, 250 characters (3 new lines; 11 reused from cache) | inside the monthly plan quota |
| Voice-over, draft 3 final pass | ElevenLabs Starter, 967 characters (13 lines re-voiced after the unslop pass, the 4-month framing and the anybot rename) | inside the monthly plan quota |
| Speech-to-text checks, draft 3 | ElevenLabs `scribe_v1`: 2 VO clips (anybot pronunciation), 2 music tracks (vocal check), 3 spots of the final mix (VO clarity) | inside the plan |
| Voice-over, draft 4 | ElevenLabs Starter, 309 characters (3 lines re-voiced for the anybot attribution) plus 2 speech-to-text checks | inside the monthly plan quota |
| Music, draft 3 trial (not used in d4) | ElevenLabs Music API, 2 instrumental tracks (main 76 s, short 66 s), `audio/music/unused-elevenlabs/*.json` | inside the plan's credits. After all draft-3 calls the account counter read 57,485 of 80,000 credits used for this cycle (Starter). The per-call cost is not reported separately. |
| D1 reads, draft 3 | 3 read-only queries (users by day 31,408 rows; MAU 136,698; DAU by day 273,395) | $0 (inside plan) |
| Voice-over, draft 5 | ElevenLabs Starter, 432 characters (5 lines re-voiced: "turns three months", and no month count after the title) plus 5 speech-to-text checks (`out/d5-stt.txt`) | inside the monthly plan quota |
