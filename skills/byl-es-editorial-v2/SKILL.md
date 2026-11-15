---
name: byl-es-editorial-v2
description: DEV-only Spanish blog editorial QA for BeYourLover WordPress/TranslatePress; rendered DOM checks, terminology, language, SEO, risk-ranked review. Preserve existing QA95 release flow.
---

# BYL Spanish Editorial Skills V2.0 — isolated draft

## Scope and invariants

- Only dev.beyourlover.com; never write or deploy WWW/Production via this workflow. Read articles only through the authorized Dev channel. No paid Google translation.
- Source locale en-US, target es-ES. Preserve current Spanish register, brand/product names, SKUs, links, code, shortcodes, quotes and factual claims unless documented P0 review approves bilingual changes.
- **BYL_ES_QA_95_PASS_V1 stays unchanged**: weighted >=95% coverage AND P0 CLEAR => existing Dev R9 may pass; P1/P2 are recorded in Notion and do not stall publication. V2 never substitutes for R9.
- Use exact post ID, source SHA, queue SHA, WordPress rendered HTML, TranslatePress dictionary readback. Runtime wins over stale notes.
- R0/R1 only reads existing content. No plugin, theme, article, database, SEO, index, payment, cron, or login changes. No browser restarts. No automatic publication.

## Upstream inspiration (not a blind fork)

1. **Localize Anything** review architecture: surface discovery, glossary/translation memory, independent reviewer, deterministic check, risk-ranked findings and evidence report. Not an automatic WordPress translation plugin.
2. **SEO Translator** (MIT) guidelines: never translate brand names, URLs, HTML, SKUs or code; preserve search intent and review Spanish naturalness. Title <=60 and meta <=155 characters are editorial warnings, never arbitrary P0 blocks.
3. **LanguageTool** (LGPL-2.1+) optional *self-hosted* grammar proposal engine. Public free API explicitly prohibits automated bulk access. 007windows lacks Java/Docker at R0; nothing gets installed automatically and no public API calls are permitted.
4. Existing Dev TranslatePress QA95 scripts remain authoritative for controlled, audited releases.

## R0–R5 workflow

**R0 Inventory:** Source and target rendered *article body* HTML, exact R1/R2 packet, queue SHA, original/translated/status dictionary rows, glossary, links, shortcodes, SEO metadata. Unsupported/dynamic/non-text surfaces are reported, never silently ignored.

**R1 DOM-aware QA:** Run scripts/byl-es-render-qa.py on the read-only Dev snapshot. Detect WordPress wptexturize HTML-entity aliases, curly quotes, split inline <em>/<strong>/<a> text nodes, visible old-English, changed links, structural mismatches and SEO field concerns. Report findings only: no auto-writing, no Dev/WWW release authority.

**R2 Spanish editor:** Independent natural-language review: fidelity, terminology, grammar, regional register, voice, SEO intent, no unnecessary repetition or patronizing phrasing. Protect source factual claims. LanguageTool findings are reviewed by an editor; suggestions never self-apply.

**R3 Fidelity + P0:** Substantive factual/safety/privacy mistakes require documented English-original→English-revision→Spanish-revision, reviewer reasoning and SHA. Do not silently replace a source editor's narrative. Record P1/P2 without delaying the queue.

**R4 Existing Dev R9:** Retain existing 95% threshold, P0 CLEAR, source/queue/hash/whitelist readbacks, rollback evidence, Dev noindex, anonymous HTTP 200, es-ES self canonical, en-US/es-ES hreflang. Post-release Notion audit of remaining P1/P2.

**R5 Blind A/B:** Hold out three representative articles for old vs V2 read-only runs. Compare true/false positive fragment detection, source fact loss, old-English residue, P0 regressions, editor interventions and actual engineering time. No rollout before evidence; QA95 queue continues independently.

## Invocation and schema

Python 3.11+ required; no external libraries.

    python scripts/byl-es-render-qa.py DevSnapshot.json --output local-qa.json
    python -m unittest discover -s tests -p "test_byl_es_*.py" -v

JSON input: post_id integer, en_html and es_html containing actual article-body HTML (not global nav/footer), dictionary array of {original,translated,status}, optional packet.blocks, seo.title_es/meta_es/primary_keyword_es, source_hash and preserve_terms.

Output findings use P0_REVIEW/P1/P2 as review priorities, **never the actual R9 status**. Output explicitly contains qa95_release=NOT_EVALUATED and independent_semantic_review=REQUIRED. The CLI has no WordPress network or write capability.

Optional local self-hosted LanguageTool only:

    python scripts/byl-es-languagetool-local.py --endpoint http://127.0.0.1:8010/v2/check --text-file spanish.txt --output lt-proposals.json

This fails closed without a local LT server and rejects public/external URLs. Do not auto-apply suggestions.

## Governance

Draft Git Skill is not yet installed, registered as IN_MAIN, merged, or live in WordPress. Separate Owner approval required before Git main merge, installation, runtime writing or any site release. WWW remains absolutely forbidden in this Spanish QA branch.
