---
name: catalog-local-archive
description: Licensed, bounded product-catalog local archival pilot and offline verification. Reuse duplicate-site-skills D0-D4, never infer a third-party license or perform a site-wide scrape.
---

# catalog-local-archive V0.1 — Windows Local catalog archive

## Scope
A narrowly scoped extension of `duplicate-site-skills` for large vehicle/product catalogs. This branch contains an **offline synthetic fixture pilot**, NOT BAS World vehicle content, images, HTML or a working remote scraper. Blog content, payments, customer records, cookies, authenticated routes and live inquiry submissions are excluded.

## Required inputs
1. D0 rights record: source identity; explicit permission for HTML, descriptions, photos and any logos separately; allowed seed URLs; permitted private backup/publication/indexing; rate limits and termination condition. Public browsing is not a license.
2. Target Windows device and isolated local directory; exact project AGENTS.md, repo SHA and existing PASS.
3. Small URL allowlist and asset allowlist for an authorized real-page trial (not included in this branch).

## Workflow and gates
- **C0 / RIGHTS**: Record rights references privately; until verified, allow only public page STRUCTURE research plus self-authored fixture tests. No site scraping or imported third-party assets.
- **C1 / INVENTORY**: Normalize approved seed URL paths, categories, variant/product IDs, pagination and canonical rules. Reject external origins, duplicate IDs and blog paths.
- **C2 / ASSETS**: For authorized assets only, record source URL, attribution/license, local relative path, SHA256, media type, byte size and missing-image status. No hotlinks in offline builds.
- **C3 / MODEL**: Preserve immutable source snapshot; map fields into product ID, type, brand, model, price/currency, year, mileage, axle, emission standard, transmission, image paths and source URL.
- **C4 / OFFLINE**: Build self-contained static catalog index and product details (or a local database and renderer for larger inventories), with local search/filter/sort and asset paths. Disable every external call.
- **C5 / QA**: Run structural tests and a real Windows Chromium browser at file:// URL with network access disabled; verify full render, image loaded, details, filtered count, navigation and missing resources; retain real logs/screenshots.
- **C6 / EXPANSION**: No full-catalog crawling until rights evidence, approved coverage targets, sampled fidelity and storage/performance checks are independently PASS.

## Pilot commands (from repository root)
`node skills/catalog-local-archive/scripts/verify-demo.mjs`
Open `skills/catalog-local-archive/demo/index.html` or `detail.html?id=DEMO-001` using Windows Chrome file://. No installation, local server or internet required.

## Success labels
`DESIGN_READY`: architecture and manifest specified. `FIXTURE_UNIT_PASS`: synthetic parser/filter/asset checks. `LOCAL_BROWSER_PASS`: actual Windows browser rendered index/detail/images and exercised filtering. `SOURCE_ARCHIVE_PASS`: only with validated rights + actual authorized source URLs and bytes. Do not collapse these labels.

## Safety
Source website read-only. No bypassing anti-bot, rate limits, login, copyright or access controls. Do not publish source assets or test fixture to WWW. No GitHub main merge without Owner pass. Do not restart READY computers or disturb existing Chrome profiles. Keep private rights records and any source bytes outside the public repo.
