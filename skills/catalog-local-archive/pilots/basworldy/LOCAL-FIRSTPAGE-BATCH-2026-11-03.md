# BASWORLDY — Approved catalog module, first-page-only batch evidence
Date: 2026-11-03

## Locked scope
Owner visually approved Home, Truck/category list and one real Volvo detail sample. These are three independent visual PASS records. Blog excluded, source pagination beyond page 1 excluded, all-product-detail crawling excluded. GitHub main, Dev and WWW stay untouched. Never enable a second page because of a generic V2 plugin.

## Source catalog
Source homepage navigation links are the discovery basis. There are 9 root categories:
`all`, `combination`, `construction_equipment`, `light_commercial_vehicle`, `semi_trailer`, `tractorhead`, `trailer`, `truck`, `various`.
There are 176 distinct subcategory/filter entry URLs linked from that homepage. An approved, bounded first-page-only capture checked these: **164 valid HTTP 200 HTML snapshots; 12 source HTTP 404 failures**. No page-2, infinite-scroll continuation, Blog or all-SKU detail crawl was performed in this batch. **173 actual first-page HTML snapshots** are held in private Windows archive: 9 roots (three historic page-1 snapshots reused, six first-page pages newly captured) and 164 fine categories. The 12 source 404s are separately recorded, never invented as complete.

Source archive:
- `D:\ai\basworldy-source-archive\first-page-pilot\categories\*`
- `D:\ai\basworldy-source-archive\first-page-pilot\firstpage-entrypoints-index.json`
- `D:\ai\basworldy-source-archive\first-page-pilot\root-categories-status.json`

## Actual Local rendering and asset status
- The approved Truck listing HTML SHA256 is frozen: `11706047aff57dbef25a610d9ca57d6c519e2dd957efe2491d0823972972bad6`.
- Eight other root-category Local pages were generated from real source HTML + already approved local CSS/JS and images, without overwriting the frozen Truck, Home or Volvo pages.
- The first root asset inventory identified 266 distinct required resource URLs (834 references). Two `.png` URLs genuinely returned image/webp; originals were verified and preserved with the correct WebP extension, and local URL mapping was repaired.
- After root media restoration, the root-page renderer recorded **0 unresolved media references** across 9 main categories.
- Real isolated Windows Chrome UAT of `/stock/combination/` and `/stock/all/` at 1440px and 375px: **4 view tests, 0 broken images, 0 oversized SVGs, 0 external requests, 0 JavaScript exceptions**.
- Across all 173 in-scope source pages, the expanded resource graph lists **2,180 distinct media URLs and 9,461 media occurrences**.
- The scope-safe renderer accepts `--verified-only`, so a page with missing genuine photos does **not** enter the Local browser tree. At an interim check (before the second media batch completed), **17 of 173** in-scope entries had local pages with no known missing media, while **156** waited for more genuine source media. These are interim, not final figures. Subcategory media downloads are ongoing/require verified status; do not infer completion from an initiated process.

Windows read-only audit files:
- `D:\ai\basworldy-source-archive\first-page-pilot\all-listing-assets.json`
- `D:\ai\basworldy-source-archive\first-page-pilot\all-listing-graph-report.json`
- `D:\ai\basworldy-source-archive\first-page-pilot\render-listings-report.json`
- `D:\ai\basworldy-source-archive\first-page-pilot\listing-media-resume.jsonl`
- `D:\ai\basworldy-source-archive\review-evidence\batch-browser-report.json`

## Remainder / next order
1. Check the still-running bounded (maximum 300-source-URL) asset downloader outcome; do **not** claim it has finished until `read_process_output` or the journal confirms it. Only its first ~220 successful saves were observed, not the final result.
2. Complete the remaining first-page unique images with verified MIME/magic, URL→SHA mapping and checkpointed retries. Stop on source 403/429 and do not circumvent controls.
3. Rerun the verified-only listing renderer and PC/mobile Chrome check for all genuinely completed categories; preserve failed source URL exceptions separately.
4. Repair original homepage navigation to point at actual Local category routes without changing frozen visual layout; 184 catalog anchor URLs were observed still pointing at `/stock/...` rather than the `/source-mirror/stock/...` Local namespace. Re-run home visual regression if behavior changes.
5. Mark catalog module PASS only when all **173 valid source first-page routes** are localized with required real resources and all 12 original 404 exceptions are documented. Then proceed to CONTENT_SERVICES sample → Local/UAT → Owner visual PASS → same-type batch. The Volvo sample is Owner-approved; do not silently expand to every SKU.

## Engineering/governance note
The Windows Local scripts are project-local at `C:\Users\Administrator\Documents\catalog-local-archive-pilot-20261102\scripts\`:
`batch-nine-root-firstpages.mjs`, `capture-firstpage-subcategories.mjs`, `build-listing-resource-ledger.mjs`, `download-firstpage-media-bounded.mjs`, `recover-mislabeled-firstpage-media.mjs`, `render-listings-firstpage.mjs`, `verify-category-firstpage.mjs`.
They use module-level Owner evidence under private `D:\ai\basworldy-source-archive\approvals\`. Generic V2 is deliberately not used for this pilot and may be tested on a different website once separately approved. **Do not delete or restart any READY device, normal Chrome session or previous approved source archive.**
