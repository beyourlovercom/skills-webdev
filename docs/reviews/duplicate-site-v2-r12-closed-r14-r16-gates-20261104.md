# Duplicate Site Skills V2 — R12 Precision closed; R14/R15/R16 bounded continuation

Date: **2026-11-04**. Scope: `RapidDirect` on **Windows Local only**. Audit text and receipt paths only; no source HTML, screenshots, media, or other licensed assets are committed.

## R12: Precision AUTO_VISUAL_PASS (current real execution)

- Existing local page: `/services/precision-machining/`, port `127.0.0.1:8784`.
- No page recrawl, template rewrite, new foundation, altered source site, PR merge, or production change.
- Existing screenshot harness scoped deterministic image-readiness only to three specific genuine Breeze image elements (`wp-image-86136`, `wp-image-73978`, `wp-image-82671`) **on both the live source page and local mirror**. No masks, image substitutions, screenshot crops, source writes, or threshold reductions.
- Original historical score reproduced with **PWC CLI**: desktop `0.9148091576101802` FAIL; mobile `0.9720036298551006` PASS.
- Final authentic same-state **PWC CLI score**: desktop **`0.9981609682938561` PASS**; mobile **`0.9999979761548394` PASS**. Both used the unchanged `0.97` threshold and `masked_fraction=0`.
- Full-page source/offline screenshots match per viewport: desktop `1440×12819` both, mobile `375×13834` both. Each page shows 45 image elements; missing/lazy counts remain matched: desktop `11/11`, mobile `9/9`. HTTP `200` for source and local; local 4xx/5xx count `0`. Identical source-side lazy placeholders are **not** misrepresented as all assets loaded.
- Existing safe interaction proof reused (no local HTML modifications during final capture): desktop/mobile `2/2 PASS`, form submissions `0`, Production writes `0`.
- **Real execution of existing** `evaluateAutomatedVisualPass` from `v2/scripts/audit-pr15-handoff.mjs` returned `AUTO_VISUAL_PASS`, scope `EXACT_TESTED_PAGE_VISUAL_ONLY`.
- Private Windows receipts: `uat/r11-small-batch/precision-machining/r12three-browser-uat.json`, `r12three.{desktop,mobile}.{source,offline}.png`, `r12-interaction-uat.json`, `r12-precision-auto-pass.json`. Source visuals remain off GitHub.
- **5-Axis remains prior AUTO_VISUAL_PASS without retesting.** Existing seven sample pages are 7/7 accepted after Precision closure; this is not a 115-route completion claim.

## R13: retained bounded source inventory, no re-crawl

Previously parsed 9 XML sitemaps: **834 published URLs**, **549 Blog excluded**, **285 non-Blog** candidates. Scope policies: **115 CORE_NONBLOG_CANDIDATE**, **82 material details held**, **86 optional held**, **2 utility/nonpublic held**. Prior seven-page navigation audit resolved 12 apparent gaps (5 SiteOne aliases, 5 canonical redirects, 2 source-side `.html` 404s), **no new valid non-Blog canonical routes** in those seven sample navs. No claim that sitemap covers dynamic/noindex content.

## R14: URL-only candidate groups — NOT yet proven DOM templates

Derived **from the saved 115-core R13 JSON, with no new source requests**, with these 12 *candidate* groups:

| Candidate family | Routes |
|---|---:|
| Home | 1 |
| Services listing (first page) | 1 |
| Services detail | 48 |
| Industry/industries | 16 |
| NPI listing | 1 |
| NPI stage details | 5 |
| Surface finishes listing | 1 |
| Surface-finish details | 18 |
| Materials listing (first page) | 1 |
| Specialized material services | 7 |
| Legal static | 2 |
| Other commercial/company routes needing DOM review | 14 |
| **CORE total** | **115** |

This is **route taxonomy, not 12 verified reusable DOM templates**. Only seven previously approved routes have local page evidence; per-family DOM/field mapping and generalized template SHA remain unproven. Do not automatically treat category labels as identical DOM. Private draft: `uat/r13-site-inventory/r14-core-route-groups-draft.json`.

## R15/R16: status and next authorization gate

- **R15 batch remains BLOCKED** until Owner approves the exact extended URL allowlist and the existing PR #15 factory proves real same-template data mapping, asset/HTML SHA and safe queue integration. No 115-URL or 285-URL crawl started. No batch attempt claimed.
- **R16 current acceptance limited to seven existing actual sample pages (7/7)**. Historical acceptance of the first six remains unchanged and was not repeated; current new Precision score and gate are separately proven. Remaining 108 CORE candidates are **not** considered completed, and 170 held URLs are outside scope.
- Private machine status files: `uat/r13-site-inventory/r15-r16-gate-status.json` and `r16-existing-seven-page-acceptance.json`.
- Freeze rule: **one representative genuine DOM template once → dual-viewport PWC SSIM ≥0.97, assets and safe interactions → freeze real template/data mapping → same-type batch only after exact allowlist authorization → R16 fail-only QA.**
- **PR #15 / PR #16 stay Draft.** No GitHub main, Dev, WWW, Production, Chrome restart, READY-device restart, or adjacent BASWORLDY port `8769` modification. This is a documentation-only PR #16 branch update.

