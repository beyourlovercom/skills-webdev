# BYL Spanish Editorial V2 — R2/R3/R4 evidence (2026-11-15)

Draft PR #24 — no merge, no WordPress runtime integration, no WWW writes. Existing BYL_ES_QA_95_PASS_V1 remains unchanged.

## R2: self-hosted Spanish grammar QA — real execution PASS

- On 007windows only: portable Azul Zulu OpenJDK JRE 17.0.21 and LanguageTool 6.6.
- Both live in an isolated non-Git local runtime directory; no system-wide Java PATH changes.
- HTTP server only bound to 127.0.0.1:8010; Spanish test produced the real AGREEMENT_DET_NOUN rule.
- Download SHA256: LanguageTool ZIP 53600506B399BB5FFE1E4C8DEC794FD378212F14AAF38CCEF9B6F89314D11631; Zulu JRE ZIP 124EBC6C81DBB2B4C4C65BDF99C75300D0EE0354118F7E856705FF421055335F.
- Spanish article #38305: 92 paragraphs checked in two local requests; 20 grammar/style candidates.
- LanguageTool detected suggestions only; it never applies edits. Public free LanguageTool API and paid Google translation never called.
- False positives were observed, particularly commercial brand names and anatomical word ano incorrectly suggested as año; these require editorial judgment.

## R3: source-fact and terminology checks — local implementation PASS

- Check preservation of BeYourLover/product names, SKU, source numbers, percentages, measurement units, meaning-changing negation, unsupported new promises, and inline HTML word joins.
- es-ES terminology reference file is versioned. Flexible patterns distinguish 14% from 14 %, 6.29 inches from 16 cm, and a denial such as ningún producto garantiza from a false marketing promise.
- All results are review proposals. The scanner explicitly says fidelity_certified=false and does not replace independent human/AI editorial review.

High-confidence issues from read-only Dev:
- #38427: BeYourLover Skull Man partially appears as a translated generic name, while the product name should remain verbatim; other inline link fragments may join words.
- #38547: source 10–15-minute grooming timeframe is absent from Spanish; time detail may have been lost.
- #38607: two BeYourLover name occurrences are missing from matching Spanish blocks.
- #38628: source 360-degree specification not present as a number in Spanish; named testimonials and lost-negation flags need contextual inspection.
- #38587: source says a generic lubricant lasts 1–3 years, while Spanish removes the unverified blanket duration in favor of package instructions. This is source-target factual drift needing editorial reconciliation, not an automatic P0.
- #38587 link changed to its known Spanish translated post path and is a legitimate localization change, not a broken link. Existing localdev links need a separate targeted check.

## R4: frozen old-vs-new, read-only holdout + synthetic fault challenge

All six samples have verified old R9 ledgers with weighted coverage above 95%, P0 CLEAR, no WWW writes, and live Dev Spanish article body readback. Raw article HTML and private R2/R3/R4 reports never enter Git.

First held-out group A (frozen checker before reading):
| Post | Old QA95 | Initial R1 | Initial R3 | LT proposals |
| --- | ---: | ---: | ---: | ---: |
| #38395 | 99.44% | 1 | 5 | 5 |
| #38427 | 97.60% | 2 | 11 | 36 |
| #38547 | 99.54% | 2 | 2 | 5 |

First group A synthetic challenge: 12 of 12 applicable injected errors detected; 3 cases not applicable, excluded from denominator. Initial code hashes: R1 1BD56ECCE9B72E28AB2E6E5008C8B37B4336412A154C8422BDB10226A7BD7DC3; R2 E7224F41744E801761BB66098A2FA59F6B1E25015D3599D7F41840E92B45F102; R3 B69BCE79ED345BBF0FB844E4340E52B57F6BEC819E08CC44C409E4028318896C.

Group A exposed false positives: already translated quote fragments, percent spacing, inch-to-cm conversions, adverbs inserted between glossary words, and an explicit negative guarantee. Code revisions based on A are disclosed; A is no longer an unseen sample for the revised code.

Second fresh holdout group B (code frozen before reading):
| Post | Old QA95 | R1 | R3 | LT proposals | Seeded detected |
| --- | ---: | ---: | ---: | ---: | ---: |
| #38587 | 99.02% | 1 | 4 | 9 | 3 / 3 |
| #38607 | 97.90% | 0 | 2 | 16 | 5 / 5 |
| #38628 | 99.14% | 2 | 3 | 31 | 5 / 5 |

Second group B synthetic challenge: 13 of 13 applicable errors detected; 2 not applicable. Frozen checker hashes: R1 FB99208845E3C2F77C5B39B365FAE795B46AE24AEA9DAAAE3705BF179F35C366; R2 E7224F41744E801761BB66098A2FA59F6B1E25015D3599D7F41840E92B45F102; R3 0B9DF5A1B6F861EF7133505676B4602992B93094725F6954A7F6BE971E637226.

Total controlled synthetic: 25/25 applicable targeted fault detections; 5 not applicable, excluded. Fault classes: unmodified English body, broken link, unsupported strong guarantee, altered numeric data, and changed protected brand. The tests mutated local JSON copies ONLY; no Dev site data changed.

**Limitations:** These 25 tests are targeted synthetic fault recall, not general translation accuracy, speed improvement, or a true full-system head-to-head. The historical old QA95 gate was read from actual R9 evidence; we did not re-run old R9 against mutated live web pages. A blinded independent human judge and timed prospective editing comparison have NOT been performed. V2 cannot yet claim superiority on semantic fidelity or productivity.

## Tests, scope, and disposition

- Python unit tests: 34 PASS. Original registry Node tests: 10 PASS. Python compile succeeds; Dev read-only snapshot PHP syntax verified.
- Public LanguageTool automated API calls 0; paid Google translation calls 0; WWW writes 0; WordPress article/database/plugin changes 0.
- QA95 owner rule remains 95% weighted plus P0 CLEAR; P1/P2 go to Notion without blocking.
- Draft Skill not in main registry, and PR stays draft. No automatic merge or release.
- Outstanding: human/editor validation for flagged post-release P1 issues, secure long-lived LanguageTool service lifecycle, and prospective old-vs-V2 time/quality benchmark.
