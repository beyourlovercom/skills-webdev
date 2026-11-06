# Duplicate-Site Skills V2 — R13 sitemap inventory and non-Blog target taxonomy

**2026-11-04 · read-only source inventory · no page batch authorized or run.**

## Source and measured URL denominator

- Official source `https://www.rapiddirect.com/robots.txt` returned 200 and advertised `/sitemap_index.xml` plus a separate `/ems/sitemap.xml`. The Yoast index listed 8 child sitemaps. **All 9 published sitemap XML payloads were read and parsed as XML** on authorized Windows Local.
- Published sitemap records: **834 / 834 unique canonical paths**; no duplicate routes across the 9 XML files.
- By sitemap: main WordPress page **208**, Blog posts **536**, Blog author **7**, Blog industry archives **5**, surface-finish posts **18**, independent `/ems/` section **20**, case studies **12**, careers/jobs **7**, news **21**.
- The main WordPress page sitemap contains exactly one `/blog/` landing page. Therefore **Blog excluded 549** (=536+7+5+1) and **non-Blog candidates 285**.
- **These are published sitemap URLs, not a proven census of every reachable/noindex/JS-created page.** Do not claim full-site completion percentage from 7 Canary pages divided by this number.

## 285 non-Blog URLs, template/category freeze

| Group | URL count | Handling |
|---|---:|---|
| **CORE_NONBLOG_CANDIDATE** | **115** | Core commercial/marketing routes, services, industry, manufacturing processes, catalog hubs, relevant surface finishes |
| **REVIEW_MATERIAL_DETAIL_SCOPE** | **82** | Material detail URLs; respect Owner's *do not copy all products* and use one audited representative per genuine template family before deciding to include all material pages |
| **REVIEW_NONBLOG_OPTIONAL** | **86** | EMS (20), case-studies including hub (13), jobs/careers including hub (8), news including hub (22), ebooks (19), AI creator (4); content/interactive submodules require separate scope or safe local substitutes |
| **REVIEW_NONPUBLIC_OR_UTILITY** | **2** | Elementor internal path and `/llm-instructions/`; not assumed to be public marketing pages |
| **EXCLUDED_BLOG** | **549** | Blog posts, Blog author/industry archives and Blog landing |
| **Total** | **834** | All sitemap records accounted for |

Additional main-page breakdown: `/materials/` has **83** pages including its hub (82 held detail pages); `/services/` has **49**, `/industry/` has **15**, `/npi-solutions/` has **6**, `/ebooks/` has **19**. Standalone surface-finish sitemap adds 18. The 115 core denominator is a **candidate execution minimum**, not an authorization to start 115-page crawling/batch.

**First page only:** do not chase deeper list pagination and do not import every material/product detail by default. Sitemap currently has no explicit `/page/2/` URLs; navigation and JS routes require subsequent per-module checks.

## Independent navigation crosscheck using only seven existing local HTML pages

Read existing local HTML for home, services, CNC Machining, CNC Milling, CNC Turning, 5-Axis and Precision (no new source page requests for extracting links).

- 177 distinct internal HTML link paths discovered, 165 already in sitemap.
- 12 initially looked absent. **Five** are SiteOne's synthetic `/_rapiddirect.com/` aliases and resolve to already-indexed routes; **five** are source redirects to indexed canonical routes (including an old knowledge-base URL redirecting into Blog), leaving **two real source 404s**: `/services/insert-molding.html` and `/services/overmolding.html`.
- **Zero new live non-Blog routes** were found in this seven-page comparison that need adding to the 285 published candidates. This does not eliminate the need to compare navigation for other page families later.

Actual HTTP checks and final resolved destinations are saved on Windows Local as `uat/r13-site-inventory/navigation-gap-status-verified.json`.

## Private machine-readable evidence

- `C:\ai\site-mirror\rapiddirect-v2\uat\r13-site-inventory\nonblog-route-inventory.json`: all 834 routes with original sitemap, group, scope flag, URL path and known Canary states.
- `...\inventory-summary.json`: published counts and exact family breakdown.
- `...\navigation-url-gap-audit.json`: raw seven-page HTML crosscheck.
- `...\navigation-gap-status-verified.json`: normalized aliases, canonical redirects and actual 404 checks.
- Nine raw sitemap XML files plus `robots.txt` kept read-only for audit.
- No proprietary page HTML, screenshots, images, session files or private data uploaded to GitHub.

## Handoff toward R14 without rebuilding the framework

1. **R13 data collection DONE:** all advertised sitemap sources were inventoried; 115 core pages, 170 additional scope-review candidates, 549 excluded Blog pages are grounded.
2. **R13 content scope not silently expanded:** to honor the no-all-product rule, material details and optional content remain **REVIEW**, not bulk-ready.
3. Existing PR #15 module queue and PR #16 SiteOne/CSS/media/visual tools must be reused; no new foundational engine.
4. R12 must first pass the two previously unfinished pages' dual-viewport PWC SSIM threshold 0.97 and safe interaction gate. 5-Axis has achieved 0.995968 desktop/0.988359 mobile + 2/2 safe interactions and auto PASS. Precision is in targeted live-image/desktop visual correction and must remain OPEN unless a fresh two-viewport pass is proven.
5. **Even when R12 passes, full non-Blog URL list and representative mapping must be approved via PR #15's own scope/module gates before a large batch.** This report does not authorize GitHub main merge or Dev/WWW/Production writes.

**GitHub PR #15/#16 both remain Draft.** The 48-hour complete-site goal remains an unverified performance objective until a true representative multi-family batch and full visual QA run has measured throughput.
