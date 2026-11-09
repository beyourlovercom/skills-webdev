# Duplicate-Site Skills V2 — R12 Windows recovery and honest two-viewport UAT

**2026-11-04 · restricted to two previously completed R11 local mirrors.** No new page cloning, no Blog, no live form writes, no restart/kill of Chrome, no main/Production deployment.

## Environment recovery

Windows previously had ~0.38 GiB free RAM with Playwright JS heap OOM. On the current R12 read-only check it recovered to **7.22 GiB free physical** and **17.88 GiB free virtual memory**, allowing real source and local Chromium tests to resume. Previously generated HTML/media mirrors at ports 8783/8784 remained intact; no recrawl needed.

## 5-Axis CNC Machining: complete AUTO VISUAL PASS

Actual R12 source-vs-local full-page screenshots (same controlled network/reduced-motion state; zero masks):

| Evidence | Actual result |
|---|---|
| Source and local HTTP | 200/200 in both viewports |
| Desktop 1440px PWC SSIM | **0.99596830409088 — PASS** |
| Mobile CSS viewport 375px PWC SSIM | **0.9883587296638296 — PASS** |
| Image elements / broken-image counts | 123/123; desktop 68/68, mobile 69/69 |
| Full-page screenshots | Desktop 1440×14502 both; mobile captured 1280×22923 both |
| Local runtime HTTP 4xx/5xx | 0 on desktop and mobile |
| CSP, form-submit blocking and disallowed-link navigation | **2/2 PASS**; mobile menu toggles correctly |
| Owner-authorized automation gate | Real `evaluateAutomatedVisualPass` returned **`AUTO_VISUAL_PASS`** |
| Authorization granted | **Exact page visual acceptance only**; not shared generalized template, PR15 batch permission, main merge, or production deploy |

**Notable parity limitation:** The Chromium mobile viewport is CSS width 375px but both source/local complete screenshots expand to 1280px because the source itself exhibits horizontal overflow. This is faithful mirror parity, **not** proof that original mobile responsive design is bug-free. Source and local also share unresolved lazy-image placeholders under the controlled comparator; source visual state must be disclosed.

Private proof: `uat/r11-small-batch/5-axis-cnc-machining/r12-visual-scores.json`, `r12-browser-uat.json`, `r12-interaction-uat.json`, `r12-5axis-auto-pass.json`, source/local full-page PNGs. All original source reads were GET/HEAD only.

## Precision Machining: honest OPEN on desktop

This existing R11 page previously had mobile local height **20159** vs source **13833**, plus local HTTP 404 for a GTranslate flag and Cloudflare injected scripts. On R12:

1. Investigated source vs local individual section computed styles: **four specific Elementor top-level service sections** are `display:none` on source mobile but erroneously visible in the local mirror. Applied a scoped `max-width:767px` rule to those exact four section IDs **only in Precision local HTML**, with original backup and SHA receipt.
2. Restored the exact language flag from the previously validated local cache, fetched the public Cloudflare email-decode JavaScript (source HTTP 200, 1239 bytes), and removed one nonfunctional origin-only Cloudflare anti-bot challenge injection from **the offline HTML only**, with auditable backup. No source-site security behavior or remote customer operation was changed.
3. Re-captured authentic full-page desktop/mobile source and local Chromium screenshots. Dimensions and image element/placeholder counts now match: desktop **1440×12819** both, mobile **375×13834** both; 45 images each; broken counts desktop 11/11, mobile 9/9. **Local HTTP errors 0**.
4. Safe local browser menu/CSP/form-submit/out-of-scope navigation UAT **2/2 PASS**, real customer form writes 0.
5. Actual PWC comparison after the scoped fix: **desktop 0.9148091576101802 — FAIL**, mobile **0.9720036298551006 — PASS**. **Therefore overall Precision AUTO VISUAL PASS remains OPEN**. Do not normalize this into a PASS just because geometry or mobile passes.

Desktop pixel-diff was concentrated in image bands at y≈8400–9600 and y≈10200–11400, while most other bands were effectively identical. Browser DOM inspection showed **Breeze lazy-image plugin timing differences**: source still displayed SVG placeholders in some media regions while offline already rendered local photos. A controlled trial to eagerly load the same Breeze image URLs on source/local changed the live source DOM/image count and geometry, making that alternate trial **not a valid equal-state pass proof**. It was not used for acceptance. A further slower-scroll source capture encountered `net::ERR_CONNECTION_CLOSED`; it must not be silently substituted for real source evidence.

Private Precision proofs: `uat/r11-small-batch/precision-machining/r12-precision-targeted-fix.json`, `r12post-browser-uat.json`, `r12post-visual-scores.json`, `r12-interaction-uat.json`, `r12post-desktop-pixel-diff.json`, and screenshots. Local original HTML backup is preserved under `pre-r12-precision-parity/`. The image-specific diff is a real targeted defect/UAT-state issue, not a reason to redevelop the whole Elementor template.

## R12 gate disposition

| Existing R11 page | Static mirror | Real dual-view screenshots | Safe interactive QA | Exact-page AUTO visual |
|---|---|---|---|---|
| 5-Axis CNC | PASS | 0.99597 / 0.98836 | 2/2 PASS | **PASS** |
| Precision Machining | PASS | 0.91481 / 0.97200 | 2/2 PASS | **OPEN** |

R12 is **partially complete**: 1 of 2 formerly open pages has now been fully accepted. Precision desktop should receive only a *Breeze-image readiness / source-vs-local comparable-state* targeted repair or recheck when source read access is stable. No threshold relaxation, screenshot masking, fake image files, repeated wholesale page build, source-site mutation, or unlimited crawler retries.

**Current policy:** desktop AND mobile SSIM >=0.97 plus true source/local full screenshots and relevant runtime/interaction gate -> automatically page-level PASS with no Owner per-URL intervention. No auto pass can bypass PR #15 batch scope and PR #16 Draft/main merge gates.

## Related actual route inventory

R13 independently inventoried 834 sitemap URLs: **549 Blog excluded, 285 non-Blog candidates**, including 115 core candidates and 170 scoped-review pages. See [R13 audit](duplicate-site-v2-r13-sitemap-inventory-20261104.md). Do not claim full-site completion fraction until a concrete approved target denominator exists.

**PR #15 and PR #16 remain Draft, no main/Dev/WWW/Production changes.**
