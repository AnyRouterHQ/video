# Voice-over script (ElevenLabs Liam, eleven_multilingual_v2)

Draft 5. The title says "AnyRouter turns 3 months" (owner, 2026-11-06: 3 months, not 4). The age is said once, on the title and line 1. No later line or screen repeats a month count. The body covers Aug 5 to Nov 4. Main cut is about 75 s at 16:9. The short (TikTok, about 66 s) uses the lines marked S. The `grid` beat has no voice: the music comes up under the summary grid. The text spells anybot "Any-bot" so the voice says "any-bot". ElevenLabs speech-to-text heard "Anybot" on both lines. Captions print "anybot".

1. S   AnyRouter turns three months. Here they are, in numbers.
2. S   Since August, we went from under two thousand users to over fifteen thousand.  (#5, #6a)
3. S   Nearly six thousand people used it in the last thirty days. The busiest day had over two thousand.  (#7, #8)
4.     One API key reaches every model.
5. S   Three hundred and twenty-three models are live right now.  (#1)
6. S   We added two hundred and twenty of them since August. That is more than two a day.  (#3, #4)
7. S   Our catalog pipeline found at least fifty-six of them on its own.  (#26)
8. S   In the last thirty days, AnyRouter served one point three million requests and sixty-five billion tokens.  (#9, #10)
9.     When an upstream fails, AnyRouter retries the request on the next one.
10. S  Who builds all of this? Any-bot.
11. S  Any-bot landed four thousand five hundred and six commits and merged three thousand four hundred and thirty-five pull requests.  (#12, #14; anybot attribution is the owner's, facts.md)
12. S  More than two thousand of those commits name an A.I. co-author.  (#16)
13. S  Any-bot shipped seven hundred and fifty-three deploys. The busiest day had fifty-nine.  (#22, #23)
--  S  (summary grid, 6 s, no voice; the music lifts here)
14. S  Forty-one models are free on the Go plan. Start at AnyRouter dot dev.  (#2)

## Changed in draft 5 (owner: 3 months, said once)

- Line 1: "AnyRouter turns four months. Here are the last three, in numbers." -> "AnyRouter turns three months. Here they are, in numbers."
- Lines 2 and 6: "In three months" / "in the last three months" -> "Since August" / "since August".
- Lines 11 and 13: the trailing or leading "in three months" is cut.
- Screen: title kicker "the last 3 months · Aug 5 to Nov 4, 2026" -> "Aug 5 to Nov 4, 2026"; second open scene "The last 3 months, in numbers." -> "Here they are, in numbers."; labels "... in 3 months" -> "... since Aug 5"; grid header "Last 3 months" -> "In numbers".
- The five changed lines were re-voiced with the same voice and settings; ElevenLabs speech-to-text of each take is in `out/d5-stt.txt`.

## Changed in the unslop pass (before, then after)

| # | Before | After | Why |
|---|---|---|---|
| 1 | Three months since launch. Let's run the numbers. | AnyRouter turns four months. Here are the last three, in numbers. | owner's "turns 4 months" framing |
| 3 | Nearly six thousand were active in the last thirty days. Over two thousand on the busiest day. | Nearly six thousand people used it in the last thirty days. The busiest day had over two thousand. | verbless fragment |
| 4 | One API key. Every model. Routed for you. | One API key reaches every model. | forced group of three, fragments |
| 5 | Three hundred and twenty-three models. Live right now. | Three hundred and twenty-three models are live right now. | fragment |
| 6 | Two hundred and twenty of them, added in three months. That's more than two a day. | We added two hundred and twenty of them in the last three months. That is more than two a day. | passive, active subject |
| 7 | At least fifty-six of them were found by the catalog pipeline on its own. | Our catalog pipeline found at least fifty-six of them on its own. | passive |
| 8 | One point three million requests. Sixty-five billion tokens. In thirty days. | In the last thirty days, AnyRouter served one point three million requests and sixty-five billion tokens. | three fragments |
| 9 | And when an upstream fails, AnyRouter routes around it. Your app never notices. | When an upstream fails, AnyRouter retries the request on the next one. | "never notices" is a feeling, not a mechanism |
| 10 | So who builds all of this? Agents. | Who builds all of this? Any-bot. | owner: the builder is anybot |
| 11 | Four thousand five hundred and six commits. Three thousand four hundred and thirty-five pull requests merged. | In three months, Any-bot landed four thousand five hundred and six commits and merged three thousand four hundred and thirty-five pull requests. | fragments; owner: the commits and PRs are anybot's |
| 12 | More than two thousand of those commits were co-written by A.I. agents. | More than two thousand of those commits name an A.I. co-author. | passive; says what the count measures (co-author trailers) |
| 13 | Seven hundred and fifty-three deploys in three months. Up to fifty-nine in a single day. | Any-bot shipped seven hundred and fifty-three deploys in three months. The busiest day had fifty-nine. | fragments; owner: the deploys are anybot's |
| 14 | And we're just getting started. AnyRouter dot dev. | Forty-one models are free on the Go plan. Start at AnyRouter dot dev. | generic conclusion, replaced with a real fact |

Line 2 did not change. Cut since draft 2: the fleet line (18 scheduled jobs) and the tickets line (863 monitor tickets). Older content: `content/productions.d2.json`, `productions.d1.json`.

## On-screen copy changed in the same pass

- Title: "3 months. / of AnyRouter" -> "AnyRouter turns / 4 months. / the last 3 months · Aug 5 to Nov 4, 2026"
- "Let's run the numbers." -> "The last 3 months, in numbers."
- "Every model." (fan) -> terminal scene, heading "One key reaches every model."
- "Fallback, automatic." -> "Automatic fallback."; AnyRouter node "routes the request" -> "picks a route"; Upstream B "fallback" -> "next in line"
- Type wall "Agents" -> "anybot"; "commits co-written by AI agents" -> "commits with an AI co-author"; git terminal "commits by anybot", "pull requests merged by anybot"; deploy terminal "deploys by anybot in 3 months"
- Deploys: "59 on Oct 31 alone" -> "busiest day: 59 deploys on Oct 31"
- Close: "One API for every model. Built with agents." -> "One API for every model. Built with anybot." plus "41 models are free on the Go plan"
- Summary grid header: "Last 3 months" with "Aug 5 to Nov 4, 2026". Nine tiles; each names its own window ("all time", "today", "last 30 days", "in 3 months"), so totals read as totals. The grid never says "4 months".

Every number maps to a row in facts.md.
