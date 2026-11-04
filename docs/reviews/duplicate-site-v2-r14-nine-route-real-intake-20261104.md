# Duplicate Site Skills V2 — R14 owner-approved nine-route real intake and revised roadmap

**Date:** 2026-11-04. **Owner authorization:** the exact **nine previously proposed new representative URLs** for source read-only GET/HEAD and isolated Windows Local template/capture/UAT only. No approval to crawl the other 99 core URLs or execute PR #15 batch, and no main/Dev/WWW/Production changes.

## Evidence-based R14 progress

The official R13 baseline remains **834 published sitemap URLs → 549 Blog excluded → 285 non-Blog candidates**: 115 CORE + 82 material detail held + 86 optional held + 2 utility held. Seven prior verified samples are unchanged at 7/7 PASS. The nine additional owner-approved samples are **not** new auto-visual PASS results.

The exact nine page paths (all HTTP 200 source HTML captured with immutable SHA256 in isolated Windows private UAT):

| Approved path | Source HTML size | Elementor top sections | Images in saved HTML | HTML-only DOM signature |
|---|---:|---:|---:|---|
| `/industry/industrial-equipment/` | 647251 B | 11 | 40 | `0c6376dbe659872651d2` |
| `/npi-solutions/` | 942818 B | 16 | 71 | `f4190dc424904bed8e33` |
| `/npi-solutions/packaging-stage/` | 675078 B | 14 | 27 | `6d7da3a8618c17cfc6ec` |
| `/surface-finishes/` | 585517 B | 6 | 40 | `1c89ced782e7d0951c5c` |
| `/surface-finish/as-machined-finish-services/` | 597290 B | 10 | 26 | `500700e9d2f997622c94` |
| `/materials/` | 615073 B | 3 | 56 | `ac555afee9f917b45965` |
| `/7075-aluminum-cnc-machining/` | 601579 B | 13 | 22 | `2ec79e1f67f49161a02f` |
| `/privacy-policy/` | 529656 B | 6 | 15 | `531553f2490839c41fe2` |
| `/about-rapiddirect/` | 2494831 B | 14 | 37 | `1d3afc6d4f747b637004` |

Five original Python GETs succeeded. Four first attempts returned TLS EOF and then succeeded via **one exact-path `curl.exe` GET each**; no unauthorized pages were requested. All nine signatures differ; this **does not prove nine fully independent templates**, because only root Elementor section/widget structure was compared and shared Header/Footer/subsections can still be reused. Real DOM equivalence and generalized field mappings are not frozen.

The existing R11 read-only CSP/form/route guard was reused and applied to **nine local-only staged HTMLs**, retaining source SHA and guard SHA in receipts. No local server/Chrome restart, no user browser windows opened. Static first-party `wp-content` HTML references totaled **948 across nine pages before deduplication**; **699 references** were already in earlier isolated source caches (~**73.7%** hit ratio), so caching materially reduces asset work. The initial page-specific staging report lists **181 unresolved asset references in total before deduplication** (may include duplicates across pages). Nine HTML pages staged and secured; **none newly certified for 0.97 auto visual PASS**.

## True engineering blocker; no fake score

- The existing SiteOne 2.5.1 single-page CLI was attempted on the approved Industry URL, restricted to `--single-page --workers=2 --max-reqs-per-sec=2 --max-visited-urls=150`, and returned `-1:CON` on the requested document (process exit 1), although the exact document had already succeeded under `curl.exe`. Do not report a successful SiteOne export for the new sample.
- A privacy-page source/live vs offline-staged headless-browser test found HTTP 200 both sides on desktop but **desktop source geometry 1440×3886 versus local 1440×3862**, and multiple local runtime 404s. Source mobile browser navigation returned `ERR_CONNECTION_CLOSED`. Therefore its strict dual-view visual gate remains **OPEN**, without a valid SSIM PASS. In this controlled run source images 25 with 9 unresolved, local 25 with 10 unresolved; no masked screenshot.
- Local shared asset recovery found **18/20 distinct referenced 404 paths** in prior verified caches and copied these into the shared isolated staging root with SHA receipts. One first-party image `Group-215-1-optimized.jpg` was fetched at HTTP 200 (46332 B, SHA recorded locally). The nonfunctional origin-only Cloudflare challenge and any current mobile source failure remain explicit OPEN defects; no 404s were masked or declared passed. No live customer form write.
- Protected private Windows evidence:
  - `uat/r14-nine-approved/r14-source-dom-audit-final.json`;
  - `uat/r14-nine-approved/r14-cache-analysis.json`;
  - `uat/r14-nine-approved/r14-local-staging-receipt.json`;
  - `uat/r14-nine-approved/r14-shared-runtime-cache-repairs.json`;
  - `uat/r14-nine-approved/r14privacy-browser-uat.json`, source/offline desktop/mobile PNGs where complete;
  - `uat/r13-site-inventory/r14-core-route-groups-draft.json`.
- The nine source HTML files, images, runtime caches and screenshots remain **Windows-private only**, never committed to GitHub.

## Re-estimated roadmap: effective engineering hours, not delivery commitment

| Phase | Remaining engineering hours (conditional) | Exit requirement |
|---|---:|---|
| **R14-B — scoped asset/runtime parity** | **3–6h** | Fix missing shared fonts/JS/Cloudflare-offline-only scripts with rollback and no masking; source browser available |
| **R14-C — nine representative two-viewport UAT and structural verification** | **5–10h** | Every sample source/local geometry, assets, safe interactions, both **PWC SSIM ≥0.97**; identify real subtemplate families and freeze SHA/map only if demonstrated |
| **R14 remaining subtotal** | **8–16h** | No false merge of category labels into DOM templates |
| **R15 — approved CORE scope only** | **14–30h if generalized mappings work; 30–50h if fallback/repair dominates** | Explicit Owner allowlist for remaining exact pages, PR #15 real batch runner gate, same-type reuse, cache dedupe and fail-only retries |
| **R16 — full bounded-scope dual-viewport UAT** | **10–22h** | Every actually approved route has unmasked full-page PC/mobile score ≥0.97, resource and safe interaction receipts |
| **R14–R16 cumulative optimistic/conditional** | **32–68 engineer-hours** | Depends on site stability, true template reuse and exact approved denominator |
| **Fallback-heavy risk case** | **48–88 engineer-hours** | Stop at `AT_RISK_48H` if actual throughput cannot meet the original 48h goal |

The former R14 6–12h / R15 8–16h / R16 6–14h estimates were pre-evidence and are **not reliable commitments** for the whole 115-route candidate scope. These revised ranges are transparent planning scenarios, not yet measured full-batch throughput. Keep 82 material details, 86 optional and 2 utility URLs **outside** the denominator; 115 is a candidate denominator, not an executed authorized allowlist.

**Next within current authorization:** repair existing shared asset aliases only; obtain reliable desktop/mobile source capture for the nine, rerun UAT and lock truly identical DOM/template families. **R15 cannot start** until the Owner separately approves an explicit remaining URL allowlist and real per-template SHA/data mapping and queue gates pass. No additional foundational crawler or React rewrite.

**Governance:** PR #15 and #16 stay Draft; only this evidence/roadmap text is committed on PR #16's branch. No main merge, no source-site posts, no Dev/WWW/Production release, no restart of READY devices or the adjacent BASWORLDY service/port.
