# 06 — Visual-first Owner approval gate (all source duplication projects)

**Normative order:** `SOURCE PAGE1 → LOCAL FIRST-PAGE ASSET COMPLETE → LOCAL 100% VISUAL TARGET → OWNER VISUAL PASS → PAGINATION / ALL PRODUCTS`.

This gate is **mandatory, default-deny and independent of Dev/production release approval**. Do not override it because a user says "continue", asks for a roadmap, gives a high fidelity target, or because earlier bulk crawl already exists.

## Phase 1: FIRST_PAGE_ONLY (hard-frozen)
- Select a limited page-template matrix: homepage; one first catalog/listing page per core category/template; one real representative detail drawn from page 1; essential informational pages; first blog index and representative article only if in scope.
- In every paginated source or endpoint, allow only `page=1` (or no page query), `offset=0`, first cursor state; no loading more / infinite scrolling / `nextToken` or URL page 2+. A link to page 2 can appear in HTML but must **not** be followed. URL discovery is not permission to fetch.
- Harvest all content and visible/static media required to render these selected **first pages from top to footer**: original Logo (Desktop/Mobile variants), font files, CSS (including backgrounds), first-page listing thumbnail images, video poster images if present, responsive/lazy-loaded images, original page hero, icon resources, and the selected representative product's full gallery plus small thumbnails and order.
- Keep original bytes and per-file SHA256/private source URLs. No demo product, reconstructed Logo or placeholder photos substitute for genuine source files. Do not copy passwords, cookies, payment, tracking, private customer or shipping data.
- Rebuild selected templates in isolated Windows Local; perform real Source↔Local screenshot comparisons at desktop/mobile plus interaction tests. 100% visual identity is the **quality target**, not an assistant-proclaimed automated result.
- All missing images, fonts, assets, misalignment, external dependencies and source dynamic API limitations remain a visible OPEN discrepancy. Do not request Owner signoff when a known major gap is outstanding.

## Phase 2: OWNER_VISUAL_REVIEW (required human gate)
- Show Owner practical links/screenshots for exactly the selected first pages. Include source and Local per-template screenshot references, checksums and outstanding discrepancies.
- Owner must explicitly reply visual `pass` (ideally with the approved pages), not merely `continue` or permit Local development. Record exact approval message reference, timestamp, approved template URLs, baseline commit/content SHA and any excluded issues in private evidence.
- Approval templates default to `AWAITING_OWNER_REVIEW`. Neither scripts nor a synthetic fixture can approve on the user's behalf.
- Any changes affecting previously approved visual components require a new review or a scope-limited verified diff.

## Phase 3: FULL_EXPANSION (only after Owner PASS)
- Freeze template/visual baseline. Then and only then: enumerate all pages/categories, deduplicate all source URLs, collect each genuine product detail and complete galleries, restore pagination/search/filters, and compute denominators for full archive coverage.
- Treat category inventories and `/stock/all` separately until their URL union is reconciled.
- Continue source-security/rights checks. Owner visual PASS never authorizes publishing Dev/WWW or merging main.
- Any bulk files downloaded before this policy are historical/frozen to avoid waste; they do **not** retroactively grant Owner visual approval.

## Executable script expectations
- Source reader rejects `page > 1`, `/page/2`, `/page-2`, `offset > 0`, cursor and unapproved representative details while `PILOT_FIRST_PAGE`.
- Page readers default to `--from 1 --limit 1`. Any `--from 2`, `--limit > 1`, bulk details and bulk media manifest fail before network when no recorded Owner visual approval is supplied.
- Use source-page scoped manifests and asset integrity reports. Never use historic bulk manifests to pass a first-page gate.
- Unit tests explicitly prove page-2 and missing-approval rejection. Code test PASS proves *guard implementation*, not visual PASS.

## Concrete reproduction architecture and automatic NO-PASS conditions
The page sample must be a **fully rendered website**, not a raw HTML string with every `<script>` removed. Static SSR HTML alone is insufficient for React/Next.js sites when sliders, menus, filters, client-rendered hero and review widgets depend on JavaScript. Separate **unsafe live backend effects** from **necessary visual/UI runtime**; run the frontend against a private local asset graph and inert/local mock APIs, or capture a browser-hydrated DOM snapshot and implement minimal local UI adapters. Do not blindly enable live payments, user login, real forms, analytics or production callbacks.

**A mandatory first-page resource graph** is derived from the real rendered page + the original HTML + CSS:
- original Logo/sizes, CSS, all `@font-face` font URLs, icon font files, star/rating/SVG icons, inline and CSS `background-image`, hero/carousel frames, all first-page product card thumbnails and category pictures;
- `img/src`, `picture/source/srcset`, JS-inserted images, lazy assets and video posters; preserve original bytes/hash, actual `Content-Type` and association with the first-page URL;
- source page can be **scrolled top-to-footer** to trigger its own lazy images, but do not activate infinite-scroll next batches, a page 2 link, a pagination API cursor or "Load more";
- browser HAR/Network events must show exactly which required assets are loaded, blocked, failed, or still external; all first-page essential assets must be localized and not merely present as strings in the HTML. Capture fonts and CSS nested `url(...)`, not just downloaded .css files.

**Mandatory pre-Owner technical gates:** no broken image icon, empty critical hero/banner, uninitialized carousel, missing font/icon glyph, clipped header, giant unexpected blank section or unlocalized required asset. Ensure source vs Local desktop/mobile at the *same* viewport, scroll positions, and asset-loaded state. Compare full-page images and key component bounding boxes; record visual diffs and source-image evidence. A screenshot of the Local site **alone**, an HTTP 200, and a dozen CSS files downloaded are not sufficient. If source browser reference is unavailable, maintain `VISUAL_REFERENCE_OPEN` and do not request Owner pass. 

**BASWORLDY regression case (2026-11-02):** first-source homepage HTML included 35 scripts and 422 IMG elements, but the original static Local mirror deleted all 35 scripts; 358 image URLs remained remote, CSS contained 24 nested asset references, and BigContent-hosted Trustpilot SVGs were missing. The owner reported a blank hero and broken Trustpilot icons. This must be considered a *visual failure* even if HTML 200, isolated CSP, or source image SHA checks pass. First-page resource graph and `audit-first-page-visual-readiness.mjs` are the fail-closed remedy in the pilot branch. A safe static screenshot is not a proof of working frontend interactions.
