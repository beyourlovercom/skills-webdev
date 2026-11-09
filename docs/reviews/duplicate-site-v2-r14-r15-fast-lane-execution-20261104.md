# Duplicate Site Skills V2 — R14 Fast Lane targeted repair + R15 real preflight

Date: 2026-11-04. Windows Local only. This report contains no third-party HTML, images, cached assets or screenshots.

## R14 verified facts
- Before this continuation: seven existing PASS + seven newly verified exact-page AUTO_VISUAL_PASS = 14/16. Two OPEN: `/npi-solutions/`, `/about-rapiddirect/`.
- Exact root cause identified with real source/local Playwright JS inspection: Elementor Swiper image-carousel initializes on source (NPI 8 slides/2 clones; About two carousels 7 slides/2 clones) but had not initialized on local (NPI 6 slides/0 clones; About 5 slides/0 clones).
- Found saved Elementor frontend JS config had `urls.assets` still pointing to the source origin in its escaped JSON; dynamic chunks consequently failed. Fixed `urls.assets` to local same-origin path in ONLY the two OPEN HTML snapshots, using SHA/backup receipts. An earlier exploratory per-page webpack-runtime fork was replaced by restoration of the original shared runtime and a narrower original-config repair. No previously passed page HTML was modified.
- The actual origin widget chunk dependencies were fetched, from allowed first-party asset paths only, with HTTP200 and file SHA: three first-detected chunks, ten additional runtime JS/CSS dependencies, and one nested-title keyboard chunk. Source-site page writes 0; Production writes 0.
- After fix, About Us local Swiper now initializes two 7-slide carousels with two duplicated slides each and correctly reaches 51 image nodes / 14194px mobile height matching stable source dynamic DOM. NPI still has a local JS `Cannot read properties of undefined (reading 'prototype')`; carousel does not initialize even with the missing chunks downloaded; **not PASS**.
- Last real full-page PWC score for About after matching 51 mobile images / 14194px: desktop 0.9729077972 PASS; mobile 0.9675940159 FAIL. No masks, cropping, fake images, hidden sections, or score relaxation. Exact-page AUTO_PASS remains **14/16**; two still OPEN. Earlier seven new pass receipts remain immutable.
- Private Windows evidence: `uat/r14-nine-approved/r14-local-elementor-assets-url-fix.json`, `r14-swiper-chunks-recovery.json`, `r14-dynamic-extra-nodes-delayed.json`, `r14-dynamic-stability-capture.json`, `aboutfreeze-browser-uat.json`, and original `r14-authorized-nine-ledger.json`. The failed screenshots and client source files stay Windows-private.

## R15 Fast Lane preflight (no bulk execution)
- Deterministically enumerated 115 CORE routes from original R13 inventory, excluded prior seven representative passes and nine R14 representative routes, yielding exactly **99 candidate routes**. URL list SHA256 **76871d3322e11751727aeff405d1a4bfc1e8e1dcb4ad7016ee63888253f75b4a**.
- Exact URL list is reviewed as a separate file in this same Draft branch: `docs/reviews/duplicate-site-v2-r15-exact-99-PENDING-OWNER-20261104.txt`. It is explicitly **pending** Owner approval of that exact URL scope; `执行R14-R15` is a general phase go-ahead, not proof of an agreed enumerated list.
- Group candidates: 43 services, 17 surface-finish, 15 industry, 4 NPI, 20 other_core. Route family labels alone do not demonstrate same DOM/template and field mappings.
- Real PR #15 `backup-48h-gate.mjs` tested against local `uat/r6-pr15-sandbox/pr15-ledger.json`: `shared-shell` batch gate ALLOWED **only on a TEST_FIXTURE_ONLY record**, while `catalog-listings` and `content-services` are BLOCKED (`PREVIOUS_MODULE_NOT_PASS`, missing genuine sample Owner UAT and approval). **Never translate a test fixture result into a production batch permit.**
- Verified `pr15-queue-to-v2-data.mjs` requires genuine PR15 QUEUE_READY, frozen template SHA, owner sample reference and per-route verified asset/data mapping. Current real generalized template SHA/field mapping is not proven; therefore `QUEUE_READY` is FALSE and zero of 99 candidate URLs have been newly crawled or rendered.
- Private Windows preflight: `uat/r15-fast-lane/r15-real-gate-preflight-20261104.json`, `r15-exact-99-candidates-PENDING-OWNER.json`, and same-name `.txt`.

## Next bounded actions / governance
1. R14: fix NPI-only local prototype/handler failure, and About mobile targeted image paint discrepancy. Retest only these two and call original PWC/interaction/real auto gate; no more global template rebuild.
2. R15: obtain explicit Owner confirmation of the exact 99 URL list, then actual template/data field mapping and per-template SHA. Only run genuine PR15 queued same-type local batch when every permission gate passes. Limit concurrency to two Windows tasks, cache SHA de-dup, fail-only retries.
3. Keep PR #15 and PR #16 Draft. No merge main, no Dev/WWW/Production deployment, no READY machine restart, no adjacent port changes, no Blog scope extension.

Status: **R14 partially advanced; R15 preflight delivered, actual batch BLOCKED**. The aspirational 48-hour core goal remains conditional and must not override real safety or quality gates.