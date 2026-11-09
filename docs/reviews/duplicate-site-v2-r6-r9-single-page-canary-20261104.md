# Duplicate Site Skills V2 — R6 → R7 → R8 → R9 Windows Canary

**Date:** 2026-11-04. **Status:** R6 synthetic queue-to-render execution and safety PASS; R7 asset/card QA PASS with one source-side 404; R8/R9 **one genuine additional page** full-page visual + interaction automated PASS. **Owner review of new page still pending**. PR #15 and PR #16 both remain Draft, no main merge or Dev/WWW write.

## Scope and frozen rule

Owner approved exactly one additional source page under RapidDirect: `https://www.rapiddirect.com/services/cnc-milling/` for R8 single-page Canary. The SiteOne command used `--single-page`, `--workers=2`, `--max-reqs-per-sec=2` and an isolated Windows path. It never followed other page links. The frozen rule is **one representative template developed once; reuse same-type pages automatically; reopen development only for real new visual/interaction problems**.

Windows Local project: `C:\ai\site-mirror\rapiddirect-v2`; real new-page export and all screenshots/reports: `uat\r8-cnc-milling\`. Existing three-page mirror unchanged.

## R6 — real PR #15 function ↔ V2 data renderer

- Added `skills/duplicate-site-skills/v2/scripts/pr15-queue-to-v2-data.mjs`: calls the **actual** PR #15 `prepare-module-batch.mjs` dynamically (no copied queue implementation). Requires PR #15 `QUEUE_READY`, exact Owner-approved URL allowlist, approved frozen reference SHA, data mapping, generalized template authorization, actual cached asset SHA bytes and private UAT output. Fails closed on route/mapping/asset drift and never operates on main/WWW.
- Real Windows cross-PR **sandbox fixture**: PR #15 queue produced 1 `QUEUE_READY` item; V2 renderer created **1** HTML under `uat\r6-queue-preview\shared-shell\` using already approved home HTML and simulated field changes; `source_requests=0`, `site_writes=0`. Important: this fixture explicitly **simulated** generalized-template approval, does not alter the real Owner ledger or PR #15 gate.
- The real three-template batch status **remains BLOCKED** because generalized page-template field mappings and additional scope data have not been approved or proven. Do not claim live same-type bulk execution.
- The latest Windows test suite for R6/R7: **8/8 PASS**, including fail-closed missing generalized template, unexpected URL scope and corrupted local asset digest.

## R7 — variable-content DOM preservation, cached media and failed-only retries

- Reused existing `complete-offline-media.mjs` for resource census/recovery; added minimal `audit-single-page-canary.mjs` for exact one-page audit, variable card/section/image counts and missing-only retry receipts. No duplicated generic crawling engine.
- R8 SiteOne single page initially exported **151** local files (~7.96 MiB); of **270** referenced static resource URLs, **143** were initially missing. Reused **92** existing cache files, downloaded **48** new assets; repaired two SiteOne query-hash CSS aliases from their **verified source HTTP 200** unversioned URLs (with explicit provenance), fetched the original 8,433,108-byte MP4 and a runtime language flag. Rewrote **193** first-party absolute `/wp-content/` references to local paths. Originals/earlier stages are backed up.
- **Final resource audit: 269/270 referenced assets locally present; 1 `particles.min.js` returns actual source HTTP 404**. No retryable missing asset remains (`failed_only_retry_urls=[]`). The final controlled browser run observed **zero** local HTTP errors and zero attempted external requests; the known source 404 was not requested at runtime.
- Source page has 7 `section` tags, 106 static `<img>` tags, 15 `swiper-slide` class occurrences, 95 assorted `card` class occurrences. These are **structural/content observations**, not a promise that a single fixed-card template can represent every route. SiteOne preserves variable original DOM/card counts.

## R8 — genuine CNC Milling single-page Canary

- Source GET returned **HTTP 200**. One-page SiteOne isolated export + cache/media/postprocessing returned HTTP 200 locally at `http://127.0.0.1:8767/services/cnc-milling/` (Windows loopback only). No new Blog, product pages or other linked routes crawled.
- Compared with previously Owner-approved `/services/cnc-machining/` on the same current site, **Header/Footers normalized structure 1.0000** but main body only **0.14038**: CNC Milling is a new content-body subtype, **not** the identical full template. The correct V2 behavior is **shared shell reuse + preserve actual page DOM**, not forcibly replacing CNC Milling with CNC Machining sections or rebuilding React.
- Initially the R8 offline page had a regression after media loading (desktop scrollWidth 3643 and overlong mobile page). Root cause was unresolved same-origin absolute media references. Localizing 193 URLs restored layout without any generic template redevelopment.

## R9 — final browser/visual/safety proof

| Check | Real final result |
|---|---|
| Source↔local desktop PWC SSIM, full page, 1440px | **0.9979463222 PASS** (threshold 0.97) |
| Source↔local mobile PWC SSIM, full page, 375px | **0.9999282726 PASS** (threshold 0.97) |
| Screenshot masks | **0.0** for both |
| Image dimensions | Desktop 1440×11388 both, mobile 375×19919 both |
| Image elements / controlled missing-image counts | 115 each; desktop 78/78, mobile 81/81 source-vs-local baseline |
| Final local HTTP errors | 0 both desktop/mobile |
| Real local browser safety/interaction | **2/2 PASS**: mobile hamburger, CSP, form-submit prevented, out-of-scope link stopped, 0 real writes |
| Owner visual review of *new* page | **PENDING**, not claimed from automatic score alone |

Controlled source browser allowed same-domain GET/HEAD and blocked third-party requests; local browser only allowed 127.0.0.1 GET/HEAD. Thus third-party widgets and lazy images may be unavailable **on both comparison sides**. Equal image-placeholder counts under controlled UAT are not evidence that every source image or external widget has been individually rendered. SiteOne automated browser visuals are high fidelity under the stated comparison conditions, **not a blanket 100% live production functional equivalence guarantee**.

Final private evidence: `uat\r8-cnc-milling\r6-r9-final-audit.json`, `r9-final-ssim.json`, `r9-interaction-uat.json`, `qa-audit-final.json`, `cached-asset-reuse.json`, `css-alias-repair.json`, `single-page-browser-uat-final.json`. No proprietary screenshots, HTML, videos or assets were committed to GitHub.

### Windows Local Owner review

- **Side-by-side full-page visual review:** `http://127.0.0.1:8767/_uat/owner-r8-r9-review.html` (verified HTTP 200 for dashboard and screenshot).
- **Safe offline page:** `http://127.0.0.1:8767/services/cnc-milling/` (local-only read-only CSP and click/form protections; originals backed up).

## Current delivery gate and remaining work

- R6: **sandbox integration/guard PASS**, real same-template batch **not enabled**.
- R7: **PASS with one known source 404**.
- R8: **real second page automated visual PASS**, different main body subtype.
- R9: **2/2 browser interaction PASS; 2/2 full-page SSIM PASS**.
- **Owner visual PASS for new CNC Milling reference: pending.** Do not freeze an additional template SHA or start batch on that basis without explicit Owner PASS.
- To demonstrate PR #15 **real same-template bulk data injection** rather than mirror-first single-page export, a second genuinely same-body-structure route with validated data mapping and explicit page scope is still necessary. The current pair deliberately does not meet that condition.
- No merge, release, runtime code deployment or bulk source crawling authorized. PR #15/#16 remain Draft.

### Measured effort vs future forecasts

Single SiteOne isolated export completed in roughly **25 seconds of observed tool wall time**, but first-time asset recovery (92 cache reuses + 48 new downloads) and browser comparisons added substantial work. These are this Canary's observations, **not a measured average minutes per page for 100s of URLs**. The 48-hour non-Blog full-site target is still unproven; report aggregate throughput only after a separately approved scoped batch and measured route/asset totals.
