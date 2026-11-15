# BYL Spanish Editorial V2 — R5 editorial quality / technical timing, 2026-11-15

Scope: Draft PR #24 only. No Dev article changes, no WordPress dictionary edits, no WWW writes, no paid Google translation calls. BYL_ES_QA_95_PASS_V1 remains authoritative.

## R5-A: 19 source-verified editorial examples

The machine-readable file is docs/byl-es-editorial-v2/editorial-adjudication-20261115.json, validated by scripts/byl-es-editorial-evidence.py against private real Dev English and Spanish article-body snapshots. The checker verifies exact source and target text anchors and block indices.

| Verdict | Count | Meaning |
| --- | ---: | --- |
| CONFIRMED_EDIT | 7 | Correctable P1 issue supported by source and Spanish evidence |
| EDITORIAL_VERIFY | 6 | Source/target discrepancy requiring brand facts, sourcing or an editorial decision |
| NON_ISSUE | 6 | No correction justified; localization or translation is already appropriate |
| Total | 19 | Each source + target anchor confirmed on the live Dev-derived snapshot |

Confirmed examples: #38427 Ugly Tongue / Skull Man and linked-text whitespace, #38607 BeYourLover brand/Angela/Wavey, #38628 BeYourLover HEART, #38547 missing 10–15 minute grooming planning detail.

Editorial decisions: #38587 source 1–3 year lubricant-expiry generalization versus safer Spanish package-based advice (do not restore unsupported facts), #38628 360-degree feature requiring product verification before reintroducing, other qualified term/marketing edits.

Nonissues: #38427 6.29 inches = approximately 16 cm, #38587 correct translated internal link, #38628 named reviewers Jessica S. / Stephanie I. preserved beside translated quotes.

This review was a SECOND-PASS AI editorial comparison with actual source documents. It is NOT a genuinely independent or blinded human study, and these 19 deliberately selected examples cannot establish general translation precision or recall.

## R5-B: 7 validated but unapplied P1 draft replacements

- Proposals: docs/byl-es-editorial-v2/p1-rendered-copy-proposals-20261115.json
- Dry-run checker: scripts/byl-es-p1-proposal-validate.py
- 7 of 7 proposals uniquely matched the exact original source SHA and visible Spanish paragraph.
- HTML structure and href lists unchanged; edits 0, release approvals 0.
- These proposals describe rendered-copy changes only; do NOT deploy them as raw WordPress or TranslatePress changes. A subsequent approved DEV transactional workflow must reconcile actual dictionary keys, English source and rollback before changing the site.

Per post: #38427 3, #38547 1, #38607 2, #38628 1. All are P1; past R9 QA95 PASS is retained.

## R5-C: verified R1 false-positive reduction

- Approved English-to-Spanish article links can be explicitly supplied from the Dev snapshot exporter after checking the known target R9 published post. Arbitrary or unapproved destination edits still trigger LINK_CHANGED as P0_REVIEW.
- Proper-noun attributions attached to already translated quoted passages no longer count as untranslated English.
- Current read-only Dev R1 scan findings: #38547 = 0; #38587 = 0; #38628 = 0.
- These checks are post-hoc precision improvements, not evidence that the earlier frozen R4 held-out results retroactively improved.

## R5-D: measured LOCAL scanner execution only

Six Dev articles measured with three deterministic runs (median) and one real self-hosted LanguageTool 6.6 call per article on 007windows at loopback 127.0.0.1:8010.

| Post | R1 median ms | R3 median ms | LT wall ms | LT warnings |
| --- | ---: | ---: | ---: | ---: |
| #38395 | 9.12 | 17.49 | 1548.72 | 5 |
| #38427 | 12.46 | 22.89 | 1352.96 | 36 |
| #38547 | 7.48 | 13.87 | 490.12 | 5 |
| #38587 | 11.14 | 19.89 | 721.59 | 9 |
| #38607 | 15.86 | 25.81 | 996.18 | 16 |
| #38628 | 14.82 | 31.82 | 1176.40 | 31 |

Command: python scripts/byl-es-local-profile.py --private-snapshots PRIVATE_DIR --termbank skills/byl-es-editorial-v2/references/termbank-es-ES.v1.json --with-local-lt --output PRIVATE_REPORT.json

These numbers EXCLUDE collecting HTML, translation, editor decisions, approval, publishing, Notion logging, and any human workflow. Old QA95 editorial baseline timing is NOT MEASURED; no claim of overall productivity speed-up can be made.

## Verification, limitations and next gate

- 45 Python unit tests PASS. Existing 10 Node Registry tests require recheck on final HEAD.
- R2 LanguageTool is self-hosted and loopback-only, not an external public API. Its spelling/grammar alerts may be false positives for proper names and the Spanish anatomical term ano.
- R3 source fidelity warnings are proposals, not human-confirmed facts. The seven confirmed P1 candidates and six uncertain cases are recorded for editorial handling without blocking the current QA95 article queue.
- Raw snapshots, rendered HTML, private reports, downloaded Java/LanguageTool binary files and secrets are not committed to Git.
- The Draft PR must remain unmerged. No production plugin installation, Dev site content modifications, or WWW changes are authorized by this report.
- For a genuine end-to-end old-vs-new productivity test, instrument the next fresh article from first translation to QA95 acceptance, with a separately blinded Spanish editor rating quality. Until this is done, performance superiority remains unproven.
