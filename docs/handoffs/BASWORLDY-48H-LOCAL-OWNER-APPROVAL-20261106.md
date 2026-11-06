# BASWORLDY — 48-hour Windows Local scope acceptance (2026-11-06)

**Owner decision:** Approve the current **192 core-page Windows Local offline mirror**, allowing inaccessible/403/502/original-404 pages to be **SKIPPED and logged rather than blocking the agreed 48-hour delivery**. This is **not** an attestation of 100% original-site URL coverage or production readiness.

## Verified final local scope

| Gate | Verified result |
|---|---|
| Core pages HTTP | 192/192 200 |
| Local HTML graph | 0 isolated pages; 0 pages with fewer than 2 independent inbound links among the homepage and 192 core pages |
| Internal links | 51,309 checked, 0 broken |
| Runtime asset links | 13,412 checked, 0 new missing (8 historical CSS exceptions retained) |
| XML sitemap | New /source-mirror/sitemap.xml, 193 URL entries (home + 192 core), HTTP 200 |
| R12 newly frozen files | 391/391 SHA unchanged |
| R11 approved HTML | 186/187 SHA unchanged; one minimal, approved sitemap HTML append of five extra business links, original SHA archived |
| R12 visual | 10/10 first-viewport sampled SSIM >=0.97, not a full-length pixel comparison |

Only existing HTML file modified in this final step: `content/sitemap/index.html`, to give Trucks, Semi-trailers, Tractor Units, Vans and Machinery their second independent inbound local link. A new `sitemap.xml` was added. Other 191 core HTML pages were not modified. An explicit replacement SHA baseline for the sitemap and the old original SHA are recorded.

## Documented exclusions — SKIPPED != PASS

- `https://www.basworld.com/en/content/sell-your-vehicle` — source MHTML unavailable; skip pending optional incremental capture.
- `https://www.basworld.com/content/faq` and `https://www.basworld.com/service-desk/faq` — separate FAQ candidates, no reliable source MHTML; do not deduplicate without source evidence.
- `https://www.basworld.com/advisor/en` — live AI/chat backend outside offline replica scope; external-only functionality recorded.
- `https://www.basworld.com/contact-us` — existing frozen `content/contact-us` reused.
- 237 editorial-style candidates excluded by explicit Owner scope approval while preserving all 237 original URLs, titles and source navigation evidence.
- Legacy exceptions: 13 original source 404 categories, 4 deeper uncaptured filters, 9 genuine MP4 absent, 1 source Swedish flag 404, 8 legacy CSS references.

**Accuracy note:** On Windows, three newly requested upstream pages returned a Cloudflare blocked page; earlier source HEAD results included HTTP 403. We did **not** confirm these three as HTTP 502. Owner's new policy explicitly says future HTTP 502 should be logged and skipped, not retried indefinitely.

## Audit files on Windows

- `D:\ai\basworldy-source-archive\page1-batch\uat\r13-48h-owner-scope-approval-readback-20261106.json`
- `D:\ai\basworldy-source-archive\page1-batch\uat\r13-48h-final-192-routes-audit-20261106.json`
- `D:\ai\basworldy-source-archive\page1-batch\uat\r13-48h-postpatch-linkgraph-20261106.json`
- `D:\ai\basworldy-source-archive\page1-batch\uat\r13-48h-minimal-sitemap-patch-20261106.json`
- `C:\Users\Administrator\Downloads\BASWORLDY-48H-LOCAL-SITE-OWNER-APPROVAL-20261106.zip` — 8 MD/JSON files; ZIP integrity verified, full 237 excluded URL inventory included.

**Release policy:** Windows Local accepted with documented exceptions. No source site or Production changes, no `main` merge. Further source recovery is optional incremental work, not a blocker on this stage.