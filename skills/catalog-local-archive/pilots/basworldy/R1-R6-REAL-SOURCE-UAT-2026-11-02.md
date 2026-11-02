# BASWORLDY — R1–R6 real source archive UAT / handoff

Date: 2026-11-02. Owner-authorized source reading; Windows Local only. GitHub main, public Dev and WWW unchanged.

## Final verifiable status
- R1 Truck: 28/28 discovered pagination pages (pages 1–2 original preflight + pages 3–28 bounded source scanner), 988 unique listing detail URLs; last page no next.
- R1 All: 28 pages, 929 unique URLs; last page no next.
- R1 Tractorhead: 20 pages, 698 unique URLs; last page no next.
- These three categories have a **union of 2,115 distinct source listing URLs**. Site total still UNKNOWN: construction equipment, semi-trailers, other commercials, trailers and other categories remain OPEN. All was NOT a comprehensive substitute for Truck (only 332 common URLs).
- R2: 195 genuine Truck detail HTML source snapshots with SKU/price/brand/gallery and original HTML SHA. Of these, 123 have source JSON-LD price zero and no gallery in the captured HTML; these need independent verification, and no missing values were fabricated.
- R3: 5,506 source photo-variant URLs across captured details; 220 saved and verified. Volvo 70320127 = 41 full + 41 thumbnail (82/82); Renault 70323007 = 44 full + 44 thumbnail (88/88). Original captured logos 2/2; source CSS 12/12.
- R4: 272 actual source HTML snapshots under an isolated LocalWP source-mirror-r2, covering local source homepage, Truck / All / Tractorhead category pages, and 195 genuine detail snapshots. 300 real assets copied in the last replay. Prior fixture theme and root homepage remain untouched.
- R5: Windows isolated Chrome with normal system proxy and target-document readiness check. Native source pages render with original HTML/CSS and partial captured images; local searchable real-product index tested PASS. 901 offsite resource attempts remained, but zero offsite HTTP responses were received. No source form/checkout/third-party scripts enabled.
- R6: machine audit executed: `R6_AUDITED_FULL_SITE_FAIL` with 15 blockers. The failure is deliberate and truthful: multiple unverified categories, incomplete product detail and photo coverage, zero-gallery/zero-price source records, offline dependencies, missing full live visual parity and unavailable authoritative site total. No claim of 99%/100% parity is permitted.

## Local review URLs (accessible via Windows LocalWP/Tailscale mapping)
- http://localdev.basworldy.com/source-mirror-r2/ — original source homepage snapshot (partial images)
- http://localdev.basworldy.com/source-mirror-r2/inventory.html — searchable original product details captured so far
- http://localdev.basworldy.com/source-mirror-r2/stock/truck/ — original Truck category snapshot
- http://localdev.basworldy.com/source-mirror-r2/stock/all/ — original All category snapshot
- http://localdev.basworldy.com/source-mirror-r2/stock/tractorhead/ — original Tractorhead category snapshot
- http://localdev.basworldy.com/source-mirror-r2/R6-review.html — R6 gate dashboard

## Source-of-truth, privacy and reproducibility
- Private real-source archive: `D:\ai\basworldy-source-archive\`.
- Truck index: `catalog-v04\catalog-index.json`; All: `catalog-all\catalog-index.json`; Tractorhead: `catalog-tractorhead\catalog-index.json`.
- R3 media: `media\`, URL-SHA/bytes, magic/MIME verified; latest queue: `catalog-v04\source-media-queue.json`.
- Replay evidence: `D:\ai\basworldy-local\app\public\source-mirror-r2\replay-report.json`.
- Full R6 machine report: `D:\ai\basworldy-local\app\public\source-mirror-r2\R6-completeness.json`.
- Chrome evidence: `D:\ai\basworldy-source-archive\review-evidence-r6\browser-report.json` and screenshots.
- All code under `skills/catalog-local-archive/scripts/`, on `feat/catalog-local-archive-pilot-20261102`. Do not upload private HTML/photos, session tokens or credentials to GitHub.
- No remote READY devices restarted, no system Chrome profile restarted, no main merge, no Dev or WWW deployment.

## Remaining work before an actual full backup PASS
1. Close remaining source category pagination individually; construct URL union with source-export canonical SKU/ID reconciliation, not just URL counts.
2. Resume bounded detail archiving for missing URLs (Truck 793 not captured at freeze time) plus other category unique items; preserve original missing-data states.
3. Resume real image download queue (captured detail photo-variant gap 5,286 at freeze time) and discover additional source page media, fonts and galleries; SHA verify every original.
4. Restore source-native user-facing functionality without external network dependencies: filters, sorting, search, pagination, photo galleries, and meaningful route preservation. Keep forms/payments/login isolated.
5. Repeat Chrome source/local screenshot comparison and full network-offline test with zero external attempts and no missing original assets.
6. R6 approval only after all supported category/site totals are reconciled, every advertised source detail/photo is present or explicitly in an approved exclusion ledger, and Owner gives visual PASS.

**End state:** R1 selected category coverage PASS; R2/R3/R4/R5 partial; R6 executed but BLOCKED. Do not treat prior V0.2 synthetic template tests as backup evidence.
