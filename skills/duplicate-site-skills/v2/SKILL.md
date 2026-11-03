---
name: duplicate-site-skills-v2-review
description: Owner-review candidate: local website mirror and visual-fidelity workflow using SiteOne Crawler and Perfect Web Clone. Not installed or merged.
---

# Duplicate Site Skills V2 — Owner Review (2026-11-03)

**State: DRAFT / NOT OWNER ACCEPTED.** Existing V1 and PR #15 V1.2 remain unchanged.

## Tool integration
- SiteOne Crawler (MIT): https://github.com/janreges/siteone-crawler — authoritative capture and offline export with URL list, single-page mode, export directory, URL rewriting, bounded rate and workers.
- Perfect Web Clone (MIT): https://github.com/ericshang98/Perfect-Web-Clone and its Agent Skill https://github.com/ericshang98/perfect-web-clone-skill — capture, structure planning, section-by-section AI coding, build, screenshots, scoring, targeted repair. Its pwc CLI is NOT a standalone website-to-source generator; the agent must author and repair the page.
- V1 D0–D8 still owns source rights, controlled Local→Dev→WWW release, SEO and leads.
- Existing draft PR #15 owns the 48-hour sample → Owner Visual PASS → same-type batch → next-module gates. Do not reimplement or silently merge it.

## Gates and handoff

| Stage | Work | Evidence | Gate |
|---|---|---|---|
| V2-0 | Rights/source class | Owner attestation / isolated project | NO source capture if absent |
| V2-1 | Route taxonomy | Sitemap, normalized URL inventory | Unique denominator required |
| V2-2 | Static capture | SiteOne files, report and asset hashes | CAPTURE_PASS |
| V2-3 | Representative replica | pwc extract + Agent build/repair | Structure and interactions |
| V2-4 | Visual fidelity | Playwright desktop 1440 / mobile 375; pwc scoring | Owner visual PASS separately |
| V2-5 | Same-template batch | PR #15 flow after approval | Frozen SHA + Owner module PASS |
| V2-6 | Other modules and offline | Routes/asset integrity, no network dependencies | Local-only PASS |
| V2-7 | Dev / WWW | Existing V1 process | Not authorized by this PR |

## Non-negotiable safeguards

1. Only dry-run by default. Explicit --execute is required for local capture/extract/score. Never auto-run on GitHub CI.
2. This V2 script supports **PILOT_SAMPLES only**. Full-site non-Blog mirror is a future gate, NOT implemented or already completed. The approved V1.2 scope definitions must be reused after PR #15 is reviewed.
3. No credentials, personal/customer data, original site assets, HTML snapshots, browser sessions or private rights paperwork in this public repository.
4. No copying remote checkout, upload/CAD, payment, login or actual quote backend interactions into the local mirror. These need separately tested local substitutes and never point to production side effects.
5. Respect robots rules and site capacity. The prototype pilot uses at most 2 workers and 3 requests/second; excludes Blog, post, docs, admin, search, checkout and cart.
6. SiteOne offline page presence is not pixel-perfect. pwc extract is not a finished React site. Score is not human approval. Browser tests require real evidence.
7. Windows Local through authorized BYL DC. Do not restart READY devices or existing browser sessions. Different source/target domains stay distinct.
8. No main merge, Dev publish, WWW, search indexing or real customer operations before their separate Owner approval.

## Pilot: RapidDirect

Source: https://www.rapiddirect.com/ — Owner attested rights in conversation on 2026-11-03. Target: isolated Windows Local only (not a public website). Bounded pilot pages: home, services index, CNC machining, injection molding. No Blog.

The actual commands below require Windows Node 20+:

    node skills/duplicate-site-skills/v2/scripts/clone-v2.mjs doctor
    node skills/duplicate-site-skills/v2/scripts/clone-v2.mjs plan --manifest=skills/duplicate-site-skills/v2/templates/rapiddirect.pilot.example.json --workspace=C:/ai/site-mirror/rapiddirect-v2

To start a real source pilot **after Owner review** and official SiteOne/pwc installation:

    node skills/duplicate-site-skills/v2/scripts/clone-v2.mjs capture --manifest=skills/duplicate-site-skills/v2/templates/rapiddirect.pilot.example.json --workspace=C:/ai/site-mirror/rapiddirect-v2 --execute
    node skills/duplicate-site-skills/v2/scripts/clone-v2.mjs extract --manifest=skills/duplicate-site-skills/v2/templates/rapiddirect.pilot.example.json --workspace=C:/ai/site-mirror/rapiddirect-v2 --id=home --execute

Then the Agent carries out upstream pwc planning/authoring/build/scoring/repair, per sample, freezes approved components and records PC/mobile comparison. All untested gates remain OPEN.

See references/integration-contract.md, templates/rapiddirect.pilot.example.json, and tests/duplicate-site-v2.test.mjs.
