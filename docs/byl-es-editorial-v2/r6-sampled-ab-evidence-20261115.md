# BYL Spanish Editorial V2 — R6 prospective sampled A/B, 2026-11-15

**Decision: HOLD for independent es-ES reviewer.** This is a sampled study from a previously unreviewed article, NOT full article translation, a historical QA95 production run, or evidence V2 is faster. No live Dev article/dictionary or WWW modifications.

## Source and eligibility

- Candidate #39836 excluded: authoritative Notion records show prior Dev QA95 R9 PASS on 2026-11-13 despite no R2-batch2 release filename.
- New source: Dev post #37413, Plug and Play: Your Beginner-Friendly Guide to Butt Plugs. Notion status is 后续待排期 / 未排期/待核验; the Dev Spanish post-review gate returned false.
- Frozen English source SHA256: 2a81ca1cab9a8c28dc475a5901d0b1217b318f6facd4eb3bc3882c880a1185d6. The English article has 2,287 words and 99 nonempty text blocks.
- Initial TranslatePress matched source dictionary fragments account for 53 / 13,097 eligible characters (0.4%) in a limited read-only matching check, NOT a complete official QA95 character-weighted publication score.
- Exactly 23 source blocks were sampled (4,585 original English characters); 76 other source blocks were NOT translated.

## Common first pass (A) and V2 second pass (B)

- A is a new Spanish first-pass draft written by the same assistant from real frozen English article paragraphs. It is NOT a Google or GPT run through the old QA95 production pipeline.
- B starts from the SAME draft and changes 9 of the 23 paragraphs via the same assistant's second-pass V2 editorial recommendations. The HTML and original hrefs are preserved; all artifacts reside only in 007windows private runtime, outside Git.
- The first-pass A includes 728 Spanish words, B 687. All 23 sampled blocks contain Spanish, yielding 100% **SAMPLE-ONLY NONEMPTY PARAGRAPH PROXY**. This is not full-article QA95 coverage.
- Both have 20/20 predeclared factual and safety marker matches. These are narrowly specified text markers, NOT independent semantic fidelity or medical correctness.

## R1/R3/LanguageTool local evaluation

| Measured measure | A | B |
| --- | ---: | ---: |
| Local LanguageTool 6.6 raw warnings | 12 | 13 |
| Domain-specific false positives after contextual labelling | 12 | 12 |
| Nonblocking editorial/style suggestion | 0 | 1 |
| R1 median after warm-up, 4 alternating ABBA runs | 5.741 ms | 6.226 ms |
| R3 median same schedule | 5.364 ms | 5.083 ms |
| Local LanguageTool median same schedule | 228.613 ms | 206.113 ms |

The raw LT errors on the correct anatomical term ano, established retail term plug, and proper name Maze Men's Health are not automatically applied. These timings are CHECKER EXECUTION LATENCY ONLY. There are no real person-hour measurements for translation, reviewing, source corrections, article edits, approvals or publishing.

## Independent human reviewer packet — PREPARED, NOT SCORED

- Reviewer URL: https://app.notion.com/p/4195f5efdf94819093b7f4abd3280cdf?pvs=204
- 14 blinded X/Y comparisons: 9 changed source blocks and 5 identical controls; X/Y randomly assigned, cases shuffled.
- Source/proposals/answer key are private, NEVER in the reviewer Notion page or Git.
- Reviewer attachments: empty CSV score template and empty reviewer declaration JSON. No human responses or judgments have been received.
- Dimensions: es-ES naturalness, brands/intimate-health technical terminology, source fact/negation/safety retention (1–5 or NA terms only). A separate source P0 check is mandatory.
- The CLI scripts/byl-es-r6-score-blind.py rejects incomplete, unsigned, unqualified or unblinded responses before reading the private answer key. It measures paired source-aligned differences, preferences and identical-control disagreement ONLY after an actual submitted review. A blank CSV and blank metadata were intentionally tested and rejected; no result file was produced.
- Reviewer packet SHA256: C2B4E2862647EFE9B6F5AA7739BE808492B8D82D0457BDA1C88A51E5E76DA4A9. Private answer-key SHA256: 98483EC8BB5F476DD00BB6671C688C3B30BE8F85E707F0E6A4251739C0727999. The answer-key file must never leave the private Windows runtime.

## Critical English source P0 risk

Original English source block 13 contains the literal sentence: “You want it slipping too far inside the anus.” The following original sentence explains that a flared base helps prevent exactly that. The likely missing negative “don't” must be verified by an English editor before Dev release. Example candidate source wording, NOT APPLIED:

> You don't want the plug to slip too far inside the anus. A properly flared base helps prevent this.

This is SOURCE_P0_REVIEW_REQUIRED. If approved, the existing Dev source, immutable source hash, QA packet and translated matching must all be refreshed through the normal QA95 workflow before any Dev R9 publication. No live English source correction has been made by R6.

## Explicit remaining gates

- Real independent es-ES human editorial scoring: NOT DONE.
- Full 99-block translation and historical old QA95 production versus V2 actual editor hours: NOT DONE.
- External evidence that V2 is more accurate/faster: NOT DEMONSTRATED.
- The selected article's sample does not include branded BeYourLover model names in the target body. Product name retention requires a separate product-focused sample; do not report brand-score superiority from this article.
- Existing Owner QA95 rule remains: >=95% weighted coverage and P0 CLEAR allows Dev R9 publication; P1/P2 logged without blocking. This R6 branch is Draft and not merged.
- WWW writes 0; Dev post or TranslatePress writes 0; paid Google calls 0; no runtime installation.

## Reproducible R6 code

- scripts/byl-es-r6-sampled-corpus.py — exact-source SHA guard, 23-block bilingual sample builder.
- scripts/byl-es-r6-review-edits.py — 9 offline protected Spanish copy edits, no WordPress integration.
- scripts/byl-es-r6-fact-markers.py — 20 source-derived marker preservation checks.
- scripts/byl-es-r6-evaluate-sample.py — R1/R3/LanguageTool sample diagnostics.
- scripts/byl-es-r6-lt-domain-review.py — context-aware advisory false-positive classification.
- scripts/byl-es-r6-paired-timing.py — warm alternating ABBA checker latency, NOT editor hours.
- scripts/byl-es-r6-blind-packet.py — randomized blinded packet and SEPARATE PRIVATE answer key.
- scripts/byl-es-r6-score-blind.py — offline completed human review validation and scoring.
- tests/test_byl_es_r6_prospective.py and tests/test_byl_es_r6_scoring.py — reproducible guard tests with synthetic test fixtures. Synthetic scores are never actual reviewer scores.
