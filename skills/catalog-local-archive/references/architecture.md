# Catalog Local Archive — Design / Pilot Contract

## Architecture
```
private rights scope + approved URL allowlist
  → scoped inventory (never discover unrestricted domains)
  → owner-approved single HTML preflight (IMPLEMENTED; explicit UA / allowlist)
  → full product/asset ingest (NOT YET IMPLEMENTED)
  → immutable originals + SHA256 + provenance manifest
  → normalized product.json/SQLite
  → local image paths + detail routes + filter/search/sort
  → Windows browser tests + coverage/diff report
```

## Pilot in this branch
The pilot intentionally implements only the normalized model + static renderer + offline verification using four self-authored records and one original SVG illustration. Real BAS World **homepage HTML single-read** is now implemented and Windows-tested in `scripts/source-http-read.mjs`. Bulk catalog discovery, image downloading, full product restore and source-exact rendering remain **NOT implemented**. This allows testing whether the Windows toolchain, file:// links, local image loading and client filters work before requesting third-party content rights.

## Real-source intake schema (future)
- `source_origin`, `rights_reference`, `capture_at`, `source_url`, `canonical_url`
- `item_id`, `category`, `brand`, `model`, `title`, `condition`, `year`, `mileage_km`, `axle`, `euronorm`, `transmission`, `price`, `currency`, `seller`, `location`
- `photos[]`: `original_url`, `local_path`, `sha256`, `bytes`, `license`, `download_status`
- `routes[]`: source path → local index/detail route; preserve redirects and error records.
- Treat missing/undisclosed values as null, not guessed defaults; store data freshness and inventory delist status.

## Offline guarantees / acceptance
1. Every demo image, script and stylesheet uses relative paths only. No remote fonts, hotlinked images, external scripts, API calls, trackers or forms.
2. Opening `demo/index.html` from `file://` renders four products; clicking any details opens `demo/detail.html?id=DEMO-NNN` and loads an SVG stored in `demo/assets`.
3. Brand=Atlas → 2; Category=Tractorhead → 1; brand=Atlas and year>=2022 → 1; axle=6X4 → 2; sort by price-low → first DEMO-004.
4. Run on Windows in a separate headless browser session/profile; do not restart or reuse active interactive Chrome. Test at least desktop and one mobile width when possible.
5. Report each result with actual command, exit status, local paths, count and screenshots. Unit tests alone do not constitute browser PASS.

## BAS World public research (no harvesting)
Public catalog exposes truck/tractorhead categories and filters such as brand, price, registration year, mileage, axle, emissions and transmission. This observation informs field design only. The public site remains the canonical, dynamic source; its own HTML/assets/content are not included in this pilot.

## Expansion gate
Until written licensing scope is verified: `SOURCE_ARCHIVE=BLOCKED_RIGHTS`, `FULL_CATALOG=BLOCKED`, `WWW=BLOCKED`. Once cleared, first batch should be a tiny explicit URL allowlist with capped bytes and request count, observed HTTP status, immutable raw snapshots and asset completeness report. Do not expand recursively, especially across categories, languages or pagination, without a new scope pass.

## Estimated scaling risks
Dynamic inventory churn, duplicate canonical URLs, photos lazy loaded via CDN, variable prices/currencies, dynamic filtering, video, third-party content, protected endpoints, page-layout drift, and huge asset volume. Preserve source URL and timestamp per record; enforce bounded fetch/concurrency/storage; ensure restore and offline operation before scaling.

## Single-source read validation (2026-11-02)
Windows runtime obtained real BAS World homepage with explicit Chrome/120 UA, HTTP 200, 788730 bytes, actual BAS World title, no Cloudflare challenge. `SOURCE_HTML_READ_PASS`, original SHA256 `38b068a22d5a60e80b7dd07b50aec740699fb499d19d9987bcf83a5f0343ca91`. The earlier 403 is reproducible with the default curl UA in an A/B comparison. Real source HTML is stored outside GitHub in the Windows private archive; no products or images have been archived yet. Do not equate a single homepage read with full-site mirroring.

## V0.4 Actual implementation state (2026-11-02)
The live source has proved accessible through an explicitly configured UA on selected authorized URLs. Real HTML list discovery, JSON-LD parsing, 41x2 image-gallery distinction, image preloads, PDF-free private source archive, hash-verified media download, and isolated LocalWP static replay are implemented under `scripts/`. All real source bytes are kept outside this public repo. Source homepage, two list pages and two real product detail pages are local snapshots; product listing total across those two pages is 70 unique links. This **does not** imply site-wide catalog coverage. Do not count HTML 200 alone as an offline-fidelity pass: Chrome still shows many unarchived external-resource attempts. Stop-on-403 and owner-controlled source export remain first-class fallbacks. All source assets must preserve original URL, byte size, SHA, SKU, order and image size variant.
