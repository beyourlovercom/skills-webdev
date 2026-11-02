# BASWORLDY — Visual-first correction and hard gate, 2026-11-02

## Owner-authorized execution order
**FIRST PAGE ONLY → SAVE ALL FIRST-PAGE ASSETS → SOURCE-VISUAL REPLAY ON WINDOWS LOCAL → OWNER VISUAL PASS → FURTHER PAGINATION / FULL PRODUCT INVENTORY.**

This supersedes earlier R1–R6 execution ordering, which had improperly collected several pages and hundreds of product details before the Owner had approved any core-template visuals. Earlier premature bulk files are **frozen retained evidence**, not active deliverables and not authorization to continue.

## Hard constraints now implemented
- `catalog-local-archive/SKILL.md` V0.6, `duplicate-site-skills/SKILL.md`, `site-builder-local/SKILL.md`, pilot `AGENTS.md`: first-page policy takes precedence.
- `scripts/visual-first-gate.mjs` executable stage check with explicit Owner approval evidence requirement before `EXPANSION_AFTER_OWNER_PASS`.
- `capture-real-catalog.mjs` / `capture-category-pages.mjs` now default `--from 1 --limit 1`; reject page > 1, >1 pages, bulk seeds, and non-first-page representative details without Owner visual PASS.
- `source-http-read.mjs`: reject `?page=2`, `/page-2`, cursor, offset and unselected product detail in pilot.
- `fetch-source-assets.mjs`: reject non-FIRST_PAGE manifests during the pilot; `build-product-media-queue.mjs` cannot build bulk media without recorded pass.
- `verify-source-mirror.mjs`: Chrome QA now navigates **only homepage, Truck page 1, representative Volvo detail** (desktop+mobile). No later page read.
- Windows tests: **20/20 PASS**, including no pagination and no valid Owner visual PASS evidence.

## First-page pilot data / status, not yet Owner PASS
Isolated actual-source page snapshots, *not synthetic WordPress theme*:
- `http://localdev.basworldy.com/source-mirror/` real homepage
- `http://localdev.basworldy.com/source-mirror/stock/truck/` first Truck listing
- `http://localdev.basworldy.com/source-mirror/vehicles/used/truck-volvo-fm-2012-euro5-70320127/` selected first-page real product detail

Private first-page source asset manifest:
`D:\ai\basworldy-source-archive\first-page-pilot\pilot-media-manifest.json`
- Original Logo **2/2**, CSS **12/12**.
- Sample Volvo full gallery **41/41 large + 41/41 thumbnail**.
- First-round page media currently **98/337 saved, 239 missing** (only the currently recognized allowed-host set; external image/fonts/background dependencies still require inspection).
- New first-page media slice `page_image --start 22 --limit 30` completed **30/30 PASS** without any pagination.
- First-page Local snapshot replay **3 pages** and mapped **192** existing local asset files; rendered using actual source HTML. No original source files were overwritten.
- Windows Chrome first-page-only UAT inspected homepage, listing first page, representative Volvo detail desktop/mobile; **0 external responses**, **739 attempted external URL references**. Real first-page visual 100% is NOT yet established.
- Owner visual approval **OPEN**; do not ask for `pass` while major media/font/layout dependencies are missing.

## Next authorized scope (no full scraping)
1. Finish missing *first-page* image, icon, original Logo variants, CSS background, fonts and responsive/lazyload resources (do not follow page 2+).
2. Refine Source↔Windows Local visual comparison on same desktop/mobile viewport, top-to-footer, sample gallery usability and class-based page layout.
3. Provide precise per-page screenshot pairs and a short defect list to Owner; only Owner's explicit visual `pass` advances the stage.
4. After pass, resume historical source archive cleanly, avoiding duplicate downloads. Production/Dev/main approval is independent.

## GitHub governance
A separate **draft** policy-only PR #15 was opened from main with generic visual-first rules, not yet merged. BASWORLDY V0.6 executable code remains on `feat/catalog-local-archive-pilot-20261102`. No main merge and no Dev/WWW writes occurred.

## Owner screenshot FAIL — real technical root causes and remediation (2026-11-02 late afternoon)
Owner inspected Local homepage and rejected the visual: blank regions, Trustpilot broken stars, incomplete component/layout. **No visual PASS**, no pagination.

**Before:** original source homepage 35 script tags, 422 IMG tags; initial Local renderer deleted all 35 scripts; 358 external IMG URLs remained; CSS downloaded but missed 24 nested font/icon/background references; critical Trustpilot icons came from `basgroup.a.bigcontent.io`, an excluded host. Original page depended on Next.js/React runtime. Local read-only CSP and HTTP 200 cannot replace working UI hydration.

**Remediation already executed on first-page-only scope:**
- `discover-first-page-resource-graph.mjs`: 265 direct resource URL references from original homepage HTML and already captured CSS, including img/src, first-page lazy images, inline background, CSS font/icon URLs, and BigContent review SVG.
- `fetch-source-assets.mjs` recognizes safe image/font content signatures and the verified BigContent SVG host; first-page resource download batches (0–100, 100–200, 200–265) executed. Final **263/265 physically saved**; two endpoints ending .svg actually returned JavaScript modules, correctly rejected (do not count them as valid SVG).
- `render-source-mirror.mjs` now rewrites CSS url(...) font/background references and references original captured assets locally. Homepage source IMG tags: **422/422 local paths, zero external src**; 403 mapped local resources across selected first-page templates and previous source scoped assets. No production/Dev changes.
- Chrome full scroll (within page 1 only; no next-page trigger): homepage **95 images loaded**, zero broken `<img>` in loaded-viewport assessment, fonts status `loaded`, reported document height **102,078px**, with 32 scroll steps to first 24,000px only (not entire 102,078px). Truck first page **98/99 images loaded**, no reported broken; selected Volvo detail still has broken skeleton and external YouTube/static images. The homepage absurd page height requires a real source reference comparison, not an assumption.
- Local browser still has unlocalized resource attempts and **the original Next.js runtime/UI interaction is not recreated**. An isolated headless source live Chrome probe did not complete and its isolated processes were stopped; no original live rendered screenshot PASS can be claimed. Existing user Chrome sessions were untouched.
- `audit-first-page-visual-readiness.mjs` produced `FIRST_PAGE_VISUAL_GATE_FAIL`: remaining raw graph media mismatch (2 JS modules disguised as .svg), external asset attempts, no source↔Local pixel comparison, no dynamic component PASS and no Owner visual approval.

**Correct next actions:** do not expand to page 2; obtain authentic rendered browser DOM/Network/screenshot reference for *first page* using authorized normal Chrome or source frontend build. Recover banner/carousel/header/review layout either as safe, locally replayed runtime + mock API or as actual hydrated DOM + small local UI adapters. Then compare viewport and full-page screenshots against source; resolve page-height overgrowth and remaining external/skeleton resources before requesting Owner visual PASS.

Feature branch: `feat/catalog-local-archive-pilot-20261102`; global reusable policy draft PR #15. Nothing merged or deployed.
