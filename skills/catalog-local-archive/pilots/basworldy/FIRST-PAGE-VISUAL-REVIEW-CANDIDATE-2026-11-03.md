# BASWORLDY — First-page visual review candidate, 2026-11-03

**Status: READY FOR OWNER VISUAL REVIEW — NOT OWNER PASS / NOT 100% SOURCE PIXEL PARITY CLAIM.**

## Authorized scope
Home page, Truck listing **page 1 only**, one authentic Volvo FM 370 detail SKU `70320127`. Historical premature bulk data remains frozen. No subsequent source pagination, full source inventory, Dev or WWW writes.

## Open the Windows Local review board
- `http://localdev.basworldy.com/source-mirror/review/` — three local preview links and six Chrome screenshots.
- Home: `http://localdev.basworldy.com/source-mirror/`
- Truck page 1: `http://localdev.basworldy.com/source-mirror/stock/truck/`
- Volvo authentic detail: `http://localdev.basworldy.com/source-mirror/vehicles/used/truck-volvo-fm-2012-euro5-70320127/`

The board images exist **only in LocalWP** under `D:\ai\basworldy-local\app\public\source-mirror\review\screenshots\`; these are visual QA captures, not original source screenshots.

## Exact defects discovered and changes made
1. Legacy safe static replay removed **35 original Next.js scripts**; SSR Slick initialization elements had `width:0` and three uninitialized tracks. One track alone inflated the source-derived Local homepage to **102,078px**. Local-only `bwy-first-page-ui.js/css` restores actual source slider cards and next/previous controls with zero source API calls; homepage desktop became **6,296px**.
2. Source React animations left **10 visible components at `opacity:0`** without hydrated runtime. Local CSS explicitly reveals the real Hero title, two black CTAs, split banners and several content cards. Repeated Chrome geometry verified **0** remaining hidden primary components.
3. Earlier asset walker missed Trustpilot original SVGs, source CSS nested font/icon URLs and background images. The first-page resource graph found **265** direct homepage/CSS assets; **263** persisted, and two suffix-.svg endpoints actually returned JavaScript modules and were safely rejected. Original first-page IMG references are localized; BigContent stars and Titillium fonts now render locally.
4. Listing **mobile** incorrectly displayed desktop filter sidebar on initial viewport. `bwy-listing-ui.js/css` now hides it by default and opens/closes a local drawer on the actual source All filters button. No full-catalog server filter simulation.
5. Product snapshot had broken original skeleton, seller and parameter images; first-page listing/detail graph replays actual images/icons. YouTube poster CDN could not be reached; **5 original video poster occurrences** are visibly substituted with an authentic photo of the *same* Volvo, and the difference is recorded in `source-mirror-report.json`. No live YouTube player.
6. The original sample PDP contained empty SSR header/price/features. `bwy-detail-ui.js/css` replaces these with **true JSON-LD** values: Volvo FM 370 Hooklift truck, SKU 70320127, 2012, 6X2, Automatic, **EUR 46,500**. The remaining four source skeleton components (inspection, buying workflow, transport quote, related products) become **clearly labeled offline informational modules** rather than pretending the live data exists. Original gallery left/right controls now work locally.
7. Source CSS and HTML retain original assets. Any local UI adapters execute under `script-src 'self'; connect-src 'none'; form-action 'none'`, keeping source services/payment/tracking isolated.

## Actual Windows Chrome UAT
Evidence: `D:\ai\basworldy-source-archive\review-evidence\browser-report.json`.

Six views completed on the original LocalWP host:
- Desktop 1440×900: home, Truck listing first page, Volvo detail.
- Mobile 375×812: home, Truck listing first page, Volvo detail.
- **6/6 no broken visible IMG** and **0 JavaScript exceptions**.
- **0 external resource attempts; 0 external responses**.
- Home 3 Slick source-backed sliders initialized; source slide counts **30 / 6 / 250**, desktop 3 visible and mobile 1 visible. Next arrow advanced and was technically tested.
- Mobile sidebar hidden by default, All filters opens, Close filters shuts: **3/3**.
- Product detail displays verified title and price; gallery next advances, previous restores, **0 visible SSR skeletons**.
- Mobile horizontal overflow: browser scroll width **375px**, matching viewport width; home page height **6,853px**, Volvo detail **3,475px**. Truck listing mobile **20,395px** because 36 source page-one cards stack in a single column.
- Fonts loaded on all six checks; 8 homepage source CSS stylesheets and 10 listing/detail stylesheets were local.

## Cross-machine access
On `windows` and `007windows` private domain mapping, eight tested paths (review, all three pages, three UI JS assets and screenshot) returned HTTP **200**. This is HTTP verification; does not claim 007windows Chrome visual approval.

## Real constraints — keep OPEN
- **No up-to-date authentic browser screenshot baseline** obtained for trustworthy source↔Local pixel-diff. The original remote headless browser probe hung; the isolated process was stopped, normal Chrome sessions untouched. Thus an automated 100% pixel similarity number is unavailable.
- Source Next.js full hydration, complete live inspection record, purchase workflow, real transport quoting, original YouTube video thumbnail/player and related vehicle API are not restored. The four replaced modules are deliberately identified as local-only visual placeholders, not source-equivalent functionality.
- The page-one data and visuals can be reviewed by Owner, but **Owner visual approval is still OPEN**. No pagination or full product import until explicit Owner `pass`.
- Local screen captures are evidence of Local visual appearance, *not* direct images of the live source. User compares original site manually.
- Project remains on feature branch `feat/catalog-local-archive-pilot-20261102`; generic policy Draft PR #15 remains unmerged, main/Dev/WWW remain unchanged.

## Files
Local render script: `scripts/render-source-mirror.mjs`, source assets read-only; UI adapters `bwy-first-page-ui.js/css`, `bwy-listing-ui.js/css`, `bwy-detail-ui.js/css`. QA runner `scripts/verify-source-mirror.mjs`. Review page is generated/copied to the local-only preview path, not a production deployment.

**Next gate:** receive visual feedback / explicit Owner visual `pass` for these three page types before any second-page source requests or full inventory operations.
