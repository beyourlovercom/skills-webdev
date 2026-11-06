# Duplicate Site Skills V2 — Whole-site integration S0–S3 Canary (2026-11-06)

Owner approved expansion beyond the 99-route R15 batch: **homepage + pages + blogs + existing 99 + all future new pages**, all in one local Windows website. Objective is a reusable site-wide navigation/inventory/Sitemap capability, not merely rewiring links among 99 pages.

## Verified source and boundary

- Frozen R13 snapshot from 2026-11-04: **834 distinct source Sitemap URLs** in **9 saved XML files**. Breakdown previously identified as 285 non-blog and 549 blog-related. This is an indexed URL snapshot, NOT a guarantee of every source noindex/JS-only route. Attempts to reread current source sitemap URLs did not return XML, so do not claim a newer inventory.
- Existing review-approved R15: **99/99 Owner visual PASS**, exact allowlist SHA256 `76871d3322e11751727aeff405d1a4bfc1e8e1dcb4ad7016ee63888253f75b4a`. Do not rerun original PWC or change these 99 HTML files.
- Actual initial local HTML availability: 99 R15 + 9 old R14 + 3 mirror including homepage = **111**. Separate 8786 R15 server left untouched.
- Link graph audit on the frozen 99 before integration: 18 pages had zero distinct inbound sources, 7 had one, 74 had >=2; existing R11 one-route click guard blocked navigation between other pages. No full-site local root or sitemap existed in that R15 stage.

## S0–S2 actually built and running

- Independent read-only server at **http://127.0.0.1:8787/**, management **/site/**, human Sitemap **/site/sitemap/**, XML **/sitemap.xml**, group XML **/sitemap_index.xml**, original nine archived XML snapshots **/site/source-sitemaps/**, pending URL inventory **/site/queue/**, machine registry **/site/inventory.json**.
- Resolves local HTML in source precedence: early mirror, old R14, frozen R15, future-content folder. Response-time only navigation guard replacement unblocks *registered* local routes while retaining restrictive CSP, blocked form writes, blocked external/script links. Never rewrites frozen HTML on disk.
- Every available page has **two distinct real inbound sources**: human full Sitemap and matching category listing. Pages not physically generated are listed as PENDING and **excluded from published local XML Sitemap**; source XML snapshots are discoverable separately.
- New pages placed as `uat/full-site-content/<route>/index.html` auto-register into actual local routes, category list and XML Sitemap. No restart of 8786, READY devices or Chrome; no Dev/WWW/Production changes.
- Original S2 end-to-end UAT: **111/111 HTTP200/CSP**, all pages two distinct sources, XML includes only actual pages, all 9 archived source maps listed, POST 405, desktop/mobile real Chrome internal navigation, external/script links and form writes blocked, future-page auto-registration tested and removed. Existing source HTML triggered many legacy JS errors; full third-party widget behavior is not claimed PASS. Private evidence `uat/full-site-integration/uat-fullsite-result.json`.

## S3 actual content canaries (unreviewed)

- Source-read-only HTML snapshots locally created for **/blog/**, **/blog/precision-vs-accuracy/**, **/blog/what-is-precision-machining/**, and **/services/cnc-milling/**. Source SHA256 preserved in Windows private archive; no third-party HTML or images committed to GitHub.
- Four canaries referenced 177 unique first-party local resources. 51 initially missing literal references were recovered as original first-party bytes, SHA documented; six additional runtime assets recovered (incl Elementor eicons, blog background, responsive image, CNC milling MP4). One malformed CTA PNG request remains a known exception.
- Reused 3 old Windows legacy clone pages: **/services/cnc-turning/**, **/services/5-axis-cnc-machining/**, **/services/precision-machining/**. Exact originals preserved; not mistaken for Owner PASS.
- Current integrated site now **118 live local HTML pages + 716 pending = 834 known source routes**. 99 Owner-passed pages remain frozen; 19 other pages are legacy or S3 unreviewed.
- New canary browsing works desktop and mobile, but several source-derived empty/lazy image nodes and legacy JS errors are still present; these are not claimed final visual PASS. Private evidence `uat/full-site-integration/intake-canary-four-result.json`, `canary-assets-recovery.json`, `canary-runtime-assets-receipt.json`, and `uat-s3-canary.json`.

## Remaining Roadmap / active engineering estimate (conditional)

| Stage | Remaining work | Estimated hours |
|---|---|---:|
| S2 robustness | Preserve registry format, audit abnormal source links and legacy JS blockers, add repeatable safety regression | 2–4h |
| S3 non-blog | Up to ~170 remaining non-blog URLs (pages, materials, case studies, services); reuse frozen templates and batch assets, Owner reviews batches | 14–32h |
| S4 blog | Up to ~546 remaining blog-related URLs: one article template, one list/archive template, mass content/asset import, grouped Owner review | 24–52h |
| S5 integration | All actual published routes two inbound sources, XML/source inventory reconciliation, link actions, resource safety and offline recovery/backup | 8–18h |
| R16 final closeout | Evidence, GitHub Draft PR/CI, archive/handoff, declared exceptions, Owner decision | 2–4h |
| **Estimated remaining** | **Not guaranteed due source availability/asset variability** | **50–110h** |

Do not use old 2.5–5.5h R16 closeout estimate for a 834-route full-site scope. Do not claim 834/834 created until actual HTML and resources exist. Keep GitHub PR #16 Draft and main untouched. Reference server code tracked at `skills/duplicate-site-skills/v2/scripts/local-full-site-integration-reference-20261106.py`; source HTML/media remain private on Windows.
