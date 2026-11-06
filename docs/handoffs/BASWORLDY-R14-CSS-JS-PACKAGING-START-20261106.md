# BASWORLDY R14 CSS/JS Packaging — Read-only Audit and Isolated Staging (2026-11-06)

**Owner status:** All existing 192 BASWORLDY offline core pages approved. CSS/JS final bundling may begin now. Prior 48-hour local mirror delivery stays accepted.

## Actual Windows preflight

| Measurement | Result |
|---|---:|
| HTML including helper files | 199 |
| CSS files | 269 |
| Total CSS bytes | 22,118,599 |
| Unique CSS SHA fingerprints | 49 |
| Byte-duplicate CSS files | 220 |
| Independent JS files | 5 |
| JS total bytes | 13,746 |
| Distinct CSS load signatures | 29 |
| CSS bundle load signatures staged | 27 |
| HTML files covered by staged CSS | 188 |
| Legacy missing CSS reference pages left unchanged | 8 |
| Helper HTML files without CSS | 3 |

## Evidence and protection

27 group-preserving CSS files were generated in `D:\ai\basworldy-source-archive\page1-batch\uat\r14-css-js-staging-20261106\`, **not** installed into the approved site. @charset UTF-8 declarations were normalized only in the staging artifacts. Eight previously acknowledged old `/_next/static/css/...` reference pages remain excluded from CSS rollout.

Isolated Chrome A/B viewport screenshots compared before (individual stylesheets) and after (single group-preserving CSS text), using homepage, stock listing, Trucks landing page, Contact Us, each on PC 1440px and mobile 375px: 8/8 completed, exact pixel equivalence ratio 98.66%–100%; 7/8 above 99%, Trucks mobile 98.66% with difference confined to Hero text region, still requires browser interaction and full-page review before switching all routes. This exact-pixel ratio is not a full-page SSIM claim.

**No approved HTML, CSS or JS source file changed in this preflight.** No production deployment or GitHub main merge.

## Remaining R14 roadmap (effective engineering hours only)

- A: investigate Trucks mobile A/B text region and lock bundle strategy, 0.5–1h.
- B: controlled CSS reference cutover by group, preserving CSS order and eight historical exceptions, 1.5–2.5h.
- C: JS execution order and representative dynamic/interactive/offline-safety UAT, 1–2h.
- D: 192-route regression, inbound navigation, sitemap and representative PC/mobile visual validation, 1–2h.
- E: new SHA manifest, rollback package and branch-only final handoff, 0.5–1h.

Estimated remaining active engineering effort: **4.5–8.5 hours**. Do not misstate this as a promised asynchronous ETA. The 48-hour site acceptance was already completed and is not rescinded.

Windows Markdown: `C:\Users\Administrator\Downloads\BASWORLDY-R14-CSS-JS-Packaging-Readiness-20261106.md`.