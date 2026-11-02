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
