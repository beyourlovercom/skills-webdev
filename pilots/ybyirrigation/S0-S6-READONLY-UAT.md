# YBY Irrigation｜2026-10-31 S0–S6 real-source acceptance (public-safe)

## Scope and immutable evidence
- This is an **actual owned site** test of the S0 generator against current connected GitHub, Windows DC directory observations, public YBY WWW, and authorized Google Ads data-source status.
- The site uses shared plugin repo `beyourlovercom/YBY-Core` at `d5d54ad162c0834cc6335fffcaabcddbf362d30e` (2026-10-31 audit). The full WordPress/Bricks child theme and live WP lead database are NOT in this repo.
- Owner and `AGENTS.md` require Windows Local → Dev → WWW and separate approval for Production/PR merges. The production site is not touched in this review.
- Local checkout currently `24e7415558f3ba705d17539e740f92f28acfa063`, `behind 542` compared with origin/main (observed 2026-10-31 via authorized Windows DC). Local installed Irrigation Core header was `1.6.0`. Full live Prod 2.3.3 readback is **OPEN**, though code incident and release docs record approved version.
- Live ads connector returned real, read-only time-bounded campaign/conversion aggregates. It is **not** proof of valid inquiries. Raw Ads rows, spend, account ID and customer data must not be committed to this public repository.

## S0–S6 evidence matrix
| Stage | Evidence-backed result | Next gate |
|---|---|---|
| S0 | PASS at source/profile generation and deterministic CI level (see exact GitHub Actions run); website-specific business rules applied | Independently inspect actual generated Skills; do not infer authorized WP runtime |
| S1 | PARTIAL: Google Ads authorized; GA4, GSC, Semrush and qualified WP lead records NOT_CONNECTED | Connect/read GA4+GSC and reconcile Ads against Case ID + qualified customers |
| S2-A | OPEN/BLOCKED: current Windows Irrigation Local exists but Core 1.6.0; checkout behind 542 commits | Isolated source/child-theme exact-version 2.3.3 baseline, Local browser tests; no restart existing READY device |
| S2-B | OPEN/BLOCKED: Dev URL documented but current exact release browser and compatibility UAT not rerun | Local PASS first, target Dev readback/noindex and rollback evidence |
| S2-C | BLOCKED: no owner pass to release or merge, no verified current Dev PASS | exact SHA/backup/approved diff + Owner pass |
| S3 | PARTIAL: approved event contract in GitHub; real WWW analytics tags/events & lead reconciliation not verified | read-only GA4/GTM/GSC access and real events; no new tag writes |
| S4 | FINDING: current public homepage contains unrelated drilling/reamers/Ranking Bit copy | logged URL/element locations, approved editorial fix, post-change WWW verification |
| S5 | OPEN: both legacy and new sites publicly reachable, but URL and historical article evidence/rights not fully audited | canonical, duplicate, migration/parallel decision and legacy URL mapping |
| S6 | OPEN: documentation contract only, no authorized production article-scheduling run | editorial source/licensing QA, publication approval and rollback |

## Business-specific risk gates
1. Bricks theme-owned `yby-page-inquiry` vs Core element requires runtime class-ownership check before Core upgrade; repeat dbDelta migration + uncached Home/REST/admin tests. Source incident 2026-10-30.
2. Qualified lead means distinct Case ID plus positive CRM/business evidence; clicks, WhatsApp messages, internal test entries and diagnostics are not valid customer counts.
3. Country landing-page popup field ownership and attribution must be checked per-country rather than inferred from one master page.
4. `yby-irrigation.com` and `ybyirrigation.com` coexist now; no automatic redirect, robots/canonical or bulk content copying.

## Evidence links
- https://github.com/beyourlovercom/YBY-Core/blob/main/AGENTS.md
- https://github.com/beyourlovercom/YBY-Core/blob/main/docs/configuration/YBY_IRRIGATION_RUNTIME_PROFILE.md
- https://github.com/beyourlovercom/YBY-Core/blob/main/docs/incidents/2026-10-30-yby-andy-core-v232-p0.md
- https://ybyirrigation.com/
- https://www.yby-irrigation.com/

**This report must not be read as full S0–S6 PASS**. Live cross-source business data and Local/Dev exact-version tests remain BLOCKED. All writes to Production and all PR merges are excluded.
