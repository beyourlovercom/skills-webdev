# R15 Fast Lane — continued 99% exceptions, encoding fix, and real resources (2026-11-05)

Status: **R16 OPEN**. Scope remains exactly 99 approved CORE URLs, SHA256 `76871d3322e11751727aeff405d1a4bfc1e8e1dcb4ad7016ee63888253f75b4a`. Windows Local only, source GETs only, no Production/Dev/WWW or GitHub main changes.

## Verified new evidence

- Original unmodified AUTO gate: **62/99 PASS**.
- Verified authentic dual-viewport PWC SSIM >= **0.99** plus original gate: **52/99**.
- Three previously documented dynamic-image DOM exceptions have both authentic viewport SSIM >= 0.99, safe interaction **2/2**, and disclosed dynamic counts; not original AUTO_PASS.
- Two further pages gained **owner-accepted minor mobile geometry exceptions**, not 99%-verified mobile PWC: `/services/3d-printing/sla/` desktop 0.999699, mobile height 21502 source vs 21530 local (0.130% delta), same mobile 86 images, same 12 broken, body text similarity 0.999939, safety 2/2; `/services/metal-stamping/` desktop 0.9999979, mobile 29752 source vs 29825 local (0.245% delta), same mobile 128 image nodes (18 vs 19 broken), body text identical and safety 2/2.
- **Disjoint classification after evidence:** 52 genuine 99%+original-PASS, 3 accepted dynamic DOM exceptions, 2 accepted minor mobile-geometry exceptions, 10 original 97–99% passes that do *not* satisfy new 99%, 23 remaining visual/geometry review, 9 hard or unverified. **57/99 verified or separately accepted; 42 still unresolved**. This is not R15 99/99 original AUTO_PASS.
- Real SHA-verified first-party resources recovered: Welding `welding-service-bannner.gif` (21,760,773 bytes, SHA256 `68425fe843ab1deb7d13a924887ac6c72acfcfb887549d92920e325e97c3cc91`), SPI Finish JPEG (144,598 bytes, SHA256 `8afd3f79009cbed3fe9f926f5fa08293badf9352fe2e3d98bb65285800403698`). Subsequent actual browser testing: Welding remains geometry mismatch, SPI source browser unavailable. Both are still OPEN.
- A shared R15 capture blocker was found: Python GBK console print of page text containing zero-width U+200B threw `UnicodeEncodeError` and aborted both `CNC Routing` and `Low-volume Injection Molding` UAT, even though pages loaded. Fixed **only** new verification script console logs to JSON `ensure_ascii=True`, reran both. Real source/local HTTP200 and no unexpected HTTP errors; actual geometry mismatch remains. They moved from hard "capture incomplete" to visual/geometry review, not PASS.
- For five originally source-unavailable URL paths, Windows read-only curl GET with browser-like headers reported **HTTP 200** for all five. This indicates initial source availability may be transient; does **not** prove a headless-browser dual-view PASS. Strict source/local browser testing remains required.

## Windows private audit receipts

`C:\ai\site-mirror\rapiddirect-v2\uat\r15-fast-lane\r15-owner99-reconciled-current.json`, `r15-minor-geometry-2-safe.json`, `r15-two-hard-resource-recovery.json`, `r15-recovered-two-hard-pages-progress.json`, `r15-console-safe-retry2-progress.json`, `r15-owner99-open20-screen-audit.json`. Source screenshots and third-party assets are never committed to GitHub.

## Next legitimate work

Continue only OPEN routes; recover first-party assets only when actual origin validates; use real source/local desktop+mobile capture, PWC >=0.99 to claim **99% verified**, original safety 2/2; separately disclose and retain minor Owner-accepted exceptions. Never change original gate's records or call a source unavailable page PASSED. Final R16 requires offline links/navigation/resource safety gate plus an accurate exceptions manifest. Keep PR #16 Draft; no main merge, no Production rollout.
