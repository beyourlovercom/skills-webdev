# Catalog Local Archive — Design / Pilot Contract

## Architecture
```
private rights scope + approved URL allowlist
  → scoped inventory (never discover unrestricted domains)
  → optional licensed HTML / asset intake (NOT IMPLEMENTED)
  → immutable originals + SHA256 + provenance manifest
  → normalized product.json/SQLite
  → local image paths + detail routes + filter/search/sort
  → Windows browser tests + coverage/diff report
```

## Pilot in this branch
The pilot intentionally implements only the normalized model + static renderer + offline verification using four self-authored records and one original SVG illustration. Real BAS World crawling, downloading and rendering are **NOT** implemented. This allows testing whether the Windows toolchain, file:// links, local image loading and client filters work before requesting third-party content rights.

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
