# R4-A / R4-D: WordPress Local representative + full-route audit (2026-11-06)

Status: **LOCAL ENG AUDIT CONTINUED / OWNER SOURCE-VISUAL PASS PENDING / FINAL PACKAGE BLOCKED**.

## Scope: actual route denominator, not imported WP row count

- 45 published page records map to **42 unique page URLs** because three historical slugs have duplicate records. Read-only browser body class confirms the newer records are actually served; do not delete the legacy records or count them as independent pages.
- 50 product-category routes, **first page only**, including four categories whose current local inventory is empty. Keep empty-category inclusion as an Owner decision.
- Two representative product detail routes. Other 124 individual product pages and 25 Blog posts remain outside the Owner-frozen study scope.
- **94 unique in-scope local routes**, 94/94 HTTP 200 in one read-only audit. HTTP status is not visual/content completion.
- Initial raw HTML semantic scan found 21 warnings; a scoped, reversible **Local-only** Elementor body recovery restored original stored page content on 14 routes; desktop/mobile focused Playwright QA across 18 representative/fixed routes gave **36/36 local smoke PASS**. Three apparent multiple-H1 warnings were parser false positives; Chromium DOM confirms one actual visible H1.
- Remaining cases include the cart empty state, checkout with empty cart, account login form (not a logged-in flow), default published WordPress Sample Page, and four empty product categories. Checkout, order and real payments were **not** tested or approved.
- Local recovery code, page lists, commercial data, screenshots, route audit, and Owner notes remain on authorized Windows, **not** in this public repository.

## R4-A: distinct reference objectives

1. Current **svakom.com** homepage versus restored Local first-screen RGB: PC **0.796068**, mobile **0.709832** (below 0.97). Current reference site is displaying a different time-bound promotional banner. This is **not** a template PASS; do not automatically copy dynamic discount claims or approve them as current merchant terms.
2. Current **svakomstore.com** SiteGround copy versus Windows Local (browser via existing Windows proxy): five representative routes × PC/mobile checked. Among 8 successful paired captures, homepage, catalog and two product-detail examples reached about 0.999857–1.0 RGB parity. Two online-site captures failed with intermittent connection closure and have **no score**. About Us screenshot parity is deliberately lower (PC **0.829677**, mobile **0.896224**) because the online SiteGround copy itself lacks its stored main body while the Local-only repair restored that content. Do not undo a valid content restoration for the sake of pixel identity.
3. A current-source snapshot / promoted Banner interpretation and verified rights remain an **Owner source-reference choice**, not an automatically waived fidelity gate.

## Existing R4-D batch gate and final-only packaging

- Real PR #15 module factory remains in effect. Its true module gates stay **BLOCKED** for missing Owner/source/representative visual approvals; synthetic fixture acceptance does not authorize copying real pages.
- The existing PR #17 WordPress R2/R3/R4 tools were reused; no new scraping, template factory or bundler was created during this continuation.
- Final-only asset policy remains **unchanged**: editable individual CSS/JS during page production; after full site and Owner acceptance, one coordinated final CSS/JS minification and source→dist manifest build, then a separately approved rollbackable Local Canary.
- The existing final-packaging gate remains **BLOCKED_FINAL_BATCH**, correctly refusing the current incomplete original-reference/Owner evidence. **No final site-wide CSS/JS publication, GitHub main merge, or SiteGround/Dev/WWW deployment occurred.**

## Private Owner review

Windows local path:
`C:\Users\Administrator\Downloads\SVAKOMSTORE-R4-A-D-Owner-Review-20261106.zip`.

Contains a 94-route CSV acceptance checklist with clickable Local URLs, desktop/mobile source-reference screenshots and explicitly OPEN decisions. Private work directory: `D:\ai\svakomstore\_research\wordpress-adapter`.

## Remaining approval hinges

1. Decide how to freeze the time-dependent original banner/reference for the source-visual 0.97 gate; **no implicit exemption**.
2. Owner PC/mobile accept/reject the real route inventory and representative/fixed templates (no invented PASS).
3. Decide whether the WordPress Sample Page and empty commercial categories belong in published scope; independently test non-empty cart/checkout/account flows before commercial functional acceptance.
4. Only after genuine all-site PASS, start the final CSS/JS one-batch packaging and controlled Local runtime takeover with rollback.
