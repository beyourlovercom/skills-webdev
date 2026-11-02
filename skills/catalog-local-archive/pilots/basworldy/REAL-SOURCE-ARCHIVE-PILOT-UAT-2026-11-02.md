# BASWORLDY real-source archive V0.4 — Windows Local UAT and handoff

Date: 2026-11-02. This report refers to actual, owner-provided source access and **private LocalWP only**. No production deployment or main merge.

## Source capture verified
- Source origin: `https://www.basworld.com`. Default Windows curl UA reproduced `Cloudflare 403`; explicit recorded Chrome 120 UA obtained real `200` for the tested URLs. This does not imply unrestricted access to every product.
- Authentic snapshots (private Windows `D:\ai\basworldy-source-archive\preflight\`): source homepage; truck catalog page 1; truck catalog `?page=2`; Volvo FM 370; Renault C 480.
- First truck catalog page: **36** unique real detail links. Page 2: **34** new unique URLs. **70 total sample URLs**, not the full source inventory.
- Real Volvo: SKU **70320127**, title **Volvo FM 370 Hooklift truck**, original price **EUR 46,500**, canonical `/vehicles/used/truck-volvo-fm-2012-euro5-70320127`.
- Real Renault: SKU **70323007**, title **Renault C 480 Hooklift truck**, original price **EUR 209,900**, canonical `/vehicles/new/truck-renault-c-2026-euro6-70323007`.

## Actual asset capture in dedicated private directory
- Source Logos: **2/2 saved**, retaining original bytes and SHA256. Main original logo is source SVG `/resources/icons/logos/logo-desktop.svg`.
- Source CSS discovered for captured pages: **12/12 saved**.
- Volvo gallery: **41/41** 1280px photos, **41/41** 250px thumbnail URLs, with per-file receipts and checksums. Important: 82 URLs represent 41 unique photos in two resolutions.
- Renault gallery: **4/44** 1080px full photos and **4/44** 250px thumbnails. The remaining 40+40 are OPEN.
- Additional page-media discovery from original homepage, truck page 1 and Volvo detail: **337 unique allowed-host resources**. **68/337** saved (includes 46/46 first-list-page assets and 22 leading homepage assets); **269** remain. This denominator only covers the first three source pages. Another 164 image references on excluded external domains were recorded separately. This number is not a complete global image count.
- A JPEG media provider returned `201 Created` with valid JPEG body; another reported `image/jpg` instead of `image/jpeg`. The archiver now checks MIME aliases and **binary signature**, recovers valid previously-downloaded files, and avoids redundant requests.
- Some CMS image URLs have no extension but do include `?fmt=webp`; download and renderer path derivation must agree.

## LocalWP read-only source mirror
On `windows`, isolated original-HTML snapshots are now served at:
- `http://localdev.basworldy.com/source-mirror/` — real source homepage
- `http://localdev.basworldy.com/source-mirror/stock/truck/` — real catalog page 1
- `http://localdev.basworldy.com/source-mirror/stock/truck/page-2/` — real catalog page 2
- `http://localdev.basworldy.com/source-mirror/vehicles/used/truck-volvo-fm-2012-euro5-70320127/`
- `http://localdev.basworldy.com/source-mirror/vehicles/new/truck-renault-c-2026-euro6-70323007/`

Local replay: **5 real-source HTML snapshots**; **170** currently mapped local asset files (some source references remain missing). The earlier four synthetic vehicles and custom WordPress theme remain separate fixture tests and are **not** counted as source backup.

Local source HTML remains immutable in private source archive. Replay strips original scripts, disables form submission and uses restrictive CSP for read-only QA. It does not clone dynamic Next.js filtering, inquiry, login, payment, customer records or tracking.

## Actual Chrome source mirror QA
Isolated Windows Chrome used with **normal system proxy configuration**, no `--no-proxy-server`. Screenshot evidence: `D:\ai\basworldy-source-archive\review-evidence\`.

- Real homepage original H1: `BUY VEHICLES AND MACHINERY WORLDWIDE`, original CSS loaded, 14 images loaded on tested viewport.
- Real truck catalog page 1: original H1 `New And Used Trucks For Sale`, 44 images loaded on tested viewport after final CSP placement and HTML replay.
- Real truck catalog page 2: original H1, 50 images loaded on tested viewport after final CSP placement and HTML replay.
- Real Volvo detail: original title and styles loaded, 14 images loaded on tested desktop viewport, 21 on 375px mobile.
- Real Renault detail: original title and styles loaded, 14 images on tested viewport.
- JavaScript runtime exception count: 0 (source JavaScript is intentionally disabled).
- **External attempts: 1,061 across six page-view checks, with 0 actual external responses received**. These must be resolved/isolated; do **not** claim offline self-contained / high fidelity PASS. Nonlocal scripts & forms are blocked by replay policy, but source media and third-party subresources remain unresolved.

## Honest gates
| Gate | Result |
|---|---|
| `SOURCE_HTML_READ` tested selected pages | PASS |
| `REAL_LISTING_URLS` two pages, 70 links | SAMPLE PASS |
| `SOURCE_PRODUCT_DETAILS` | 2 REAL, full inventory OPEN |
| `LOGO_EXACT` captured variants | 2/2 |
| `CSS_CAPTURE` discovered styles | 12/12 |
| `VOLVO_GALLERY_CAPTURE` | 41+41 / 41+41 |
| `RENAULT_GALLERY_CAPTURE` | 4+4 / 44+44 |
| `PAGE_MEDIA_CAPTURE` three-page inventory | 68/337 |
| `LOCAL_SOURCE_REPLAY` | PARTIAL, 5 snapshots |
| `OFFLINE_NETWORK_ZERO` | FAIL/OPEN |
| `FULL_ARCHIVE` | **NOT READY** |
| `DEV`, `WWW`, `GITHUB_MAIN_MERGE` | NOT AUTHORIZED / NOT DONE |

## Code and reproducibility
All tool implementations are in the `skills/catalog-local-archive/scripts/` directory on branch `feat/catalog-local-archive-pilot-20261102`: `source-http-read.mjs`, `extract-source-manifest.mjs`, `discover-page-assets.mjs`, `fetch-source-assets.mjs`, `render-source-mirror.mjs`, `verify-source-mirror.mjs`, `audit-source-completeness.mjs`.
- Windows `node --check` syntax: **7/7 PASS**.
- Source-request safety unit tests: **5/5 PASS**.
- Private snapshot manifest: `D:\ai\basworldy-source-archive\manifest\source-manifest.json` and `manifest\page2-renault\source-manifest.json`.
- Real media/headers/SHA: `D:\ai\basworldy-source-archive\media\`.
- Completeness machine report: `D:\ai\basworldy-local\app\public\source-mirror\source-completeness-audit.json`.

## Next development, no blanket completion claim
1. Continue bounded real product listing pagination and capture full source item-count denominator. Keep crawl queue and per-URL success status; obey site controls.
2. Batch source detail snapshots for discovered **70** URLs, then discover remaining categories/pages. Per SKU, map actual photo IDs across available dimensions and status.
3. Download unresolved first-three-page media (**269**) and Renault second-product variants (**80**) with legal source access, proper URL host allowlist, pacing, MIME/signature and resume. Expand discovery scope for page 2/Renault; recompute denominator after each expansion.
4. Recover stylesheet subresources (fonts/backgrounds), route map, filters, pagination and galleries for offline use; block external trackers and real requests.
5. Run fully offline Chrome checks with network attempts zero and compare source/local screenshots. Only then progress towards source-exact fidelity qualification.

Owner visual signoff OPEN. No switches to local homepage, no Dev or Production.

## Final transport/safety readback
- Replayed HTML puts CSP at the **start** of `<head>` and removes unresolved remote preload hints, scripts and form submission.
- Final Windows Chrome CDP checked six desktop/mobile views: `external_attempts=1061`, `external_success_responses=0`; this is **not** an offline-complete result because 1,061 references still need elimination or local adaptation.
- Second machine `007windows` (Tailscale hostname mapping from prior Local repair) independently returned **HTTP 200 on all 5 real source-mirror paths**, using private address `100.87.29.56`. This is HTTP readback, not a second Chrome visual UAT.
- The source-mirror is a **local partial snapshot**, not the root homepage; `dev.basworldy.com`, `basworldy.com`, GitHub main and production remain unchanged.
