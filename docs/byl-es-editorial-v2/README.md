# BYL Spanish Editorial Skills V2.0 — R0–R4 Local Proof (2026-11-15)

## Status
- Isolated Git worktree: C:\ai\byl-es-editorial-v2
- Git branch: feat/byl-es-editorial-v2-20261115 (based on origin/main cb7b6ade599bfff32f6b1b5faff83fe2fce2637f)
- The existing Spanish QA95 Dev-only article publishing pipeline remains authoritative and running independently.
- R0 open-source audit: completed (architecture and licensing; not dependency installation).
- R1 rendered-HTML match diagnostic: local proof implemented and real Dev read-only pilot completed.
- R2 LanguageTool: real isolated LT 6.6 + Zulu Java 17.0.21 on 007windows loopback 127.0.0.1:8010; real Spanish grammar suggestions verified, not auto-applied.
- R3 source-fact and es-ES termbank advisory checks implemented; independent human/editorial sign-off and SEO efficacy evaluation still open.
- R4 read-only retrospective completed on six previously released Dev articles across two frozen-code groups; 25/25 applicable seeded errors detected, but independent human blind and timing comparison remain open.
- No Git main merge, no TranslatePress plugin replacement, no WordPress runtime deployment, WWW writes 0, paid Google translation 0.

## Why R1 exists
Existing QA95 releases hit >=95% weighted dictionary coverage while the public Spanish page sometimes retained English due to WordPress wptexturize entities, rich-text <em>/<strong>/<a> fragments and duplicated brand dictionary keys. Re-running the translation model did not fix the rendering-key mismatch.

V2 compares **real public Dev English and Spanish article-body HTML** plus exact dictionary rows from the Dev TranslatePress table. It reports suggestions without touching the database and never asserts QA95 release approval.

## Real DEV read-only pilot

| Dev post ID | EN blocks | ES blocks | Final R1 findings | Action |
| --- | ---: | ---: | --- | --- |
| 38305 | 92 | 92 | 1 SEO_LENGTH P2 | Record; no article changes |
| 38348 | 93 | 93 | 1 SEO_LENGTH P2 | Record; no article changes |

The initial draft raised unnecessary entity-alias and trailing-slash link warnings on already translated text. The V2.0 R1 code was then updated to check whether the **Spanish rendered node still contains the English text** and to normalize harmless trailing slashes. After retesting, neither pilot article showed those false positives. The single remaining P2 warning per article concerns the page's current rendered Meta description exceeding an editorial guideline; it does not block QA95.

Private snapshots and reports are on the authorized 007windows, **outside Git**:
- C:\Users\Public\Documents\BYL_ES_V2_R1_snapshot_38305_20261115.json
- C:\Users\Public\Documents\BYL_ES_V2_R1_snapshot_38348_20261115.json
- C:\Users\Public\Documents\BYL_ES_V2_R1_report_38305_20261115.json
- C:\Users\Public\Documents\BYL_ES_V2_R1_report_38348_20261115.json

The exporter script in scripts/byl-es-dev-snapshot-pilot.php accepts only listed Dev post IDs and writes only a permission-restricted private report file. It never modifies posts, translations, settings or WWW.

## Verification commands (on authorized 007windows)

    python -m unittest discover -s tests -p "test_byl_es_*.py" -v
    python -m py_compile scripts/byl-es-render-qa.py scripts/byl-es-languagetool-local.py
    python scripts/byl-es-render-qa.py DevSnapshot.json --output local-report.json

LanguageTool 6.6 with portable Zulu JRE 17.0.21 is installed only in the isolated, non-Git Windows runtime. The service is bound to 127.0.0.1:8010; public LanguageTool API and paid Google translation were not used. No global Java PATH or application service was installed.

## Upstream research / licensing (no code vendored)
- Localize Anything — xueyang-dev/localize-anything; workflow inspiration: glossary and project memory, deterministic structural checks, independent review, four severity categories. GitHub connector did not return this repo during R0 even though previously indexed web documentation described its MIT license. No upstream source was cloned or incorporated.
- LanguageTool — languagetool-org/languagetool; official repo core LGPL-2.1-or-later. Can self-host with separate Java/server provisioning. Public API documentation disallows automated requests.
- SEO Translator — Skillproofdev/seo-translator, MIT LICENSE verified. Used guidance for field lengths, preservation and market register; no code imported.
- TrueProfit Blog Localization — khanhvo2172-dotcom/seo-skills, MIT LICENSE verified. Not directly compatible with WordPress/TranslatePress. Structure-preservation guidance only.

## Acceptance / next work
- R1 pre-render matching on unreleased held-out article, with English residue/HTML entity/inline-markup regressions as false-positive and true-positive fixtures.
- R2: connect an isolated LanguageTool service only when Java/container support is approved; route suggestions to independent human/agent linguistic review, not automatic edits.
- R3: document Spanish termbank and item-level source-fact retention, SEO field intent; preserve product identifiers.
- R4: old-vs-V2 comparison on three unseen articles (coverage, false positives, important fact loss, time, P0). Do not claim improvement before controlled results.
- The Owner QA95 policy stays: >=95% weighted coverage, P0 CLEAR, P1/P2 non-blocking, Dev only, no WWW writes.

## R2/R3/R4 verification evidence

See docs/byl-es-editorial-v2/r2-r4-verification-20261115.md for real Java/LanguageTool API probe, terminology and factual fidelity probes, the two frozen three-article heldout groups, seeded local faults, false positive analysis and explicit limitations. It is not approval to change live Dev posts or merge to GitHub main.

## R5 structured editorial review and technical timing (2026-11-15)

The real Dev English/Spanish evidence anchors are recorded in docs/byl-es-editorial-v2/editorial-adjudication-20261115.json: 19 reviewed, 7 confirmed P1 candidates, 6 requiring editorial verification, 6 nonissues. Seven precise HTML-preserving rendered-copy edits passed private offline dry-run but have NOT been deployed or approved as a WordPress patch. Exact Link localization and proper-quote attribution false positives were reduced without disabling unapproved link-change detection. Local scan timing was measured on six Dev articles; old QA95 human editorial time and full workflow comparison remain UNMEASURED. See docs/byl-es-editorial-v2/r5-editorial-and-timing-20261115.md. Draft PR remains unmerged and DEV/WWW content unchanged.
