# Duplicate Site Skills V2 — R15-C narrower workload & R16 NO-GO (2026-11-05)

Scope remains precisely the Owner-authorized 99 RapidDirect CORE routes, Windows Local only. This is a read-only audit note; no origin HTML/screenshots/assets are committed. PR15/PR16 remain Draft, no main merge or production deployment.

## Verified live-state denominators
- R14 representative samples: **16/16 exact-page AUTO PASS**, frozen.
- R15 local original HTML, GET HTTP200 and CSP/read-only gate: **99/99**.
- R15 exact page PWC desktop + mobile and safe interaction `evaluateAutomatedVisualPass`: **8/99 PASS**, **91/99 still OPEN**. New proofed exact pages since prior R16 note: `/services/injection-mold-tooling/` desktop 0.9999972665 mobile 0.9999995813; `/services/plasma-cutting/` desktop 1.000000 mobile 0.9999947896; `/sponsorship/` desktop 0.9999864031 mobile 0.9911050610. Each is 2/2 safe interaction and passed the original automatic gate. Do not count visual candidates as auto PASS.
- Asset pass: **2500/2500 processed, 2484 success, 16 failures** (9 curl exit 22 HTTP failure; 7 curl exit 28 timeout). Do not claim all sixteen are origin 404.
- Exact per-page missing static references after assets: **80 routes have 1, 15 routes have 2, 2 routes have 3, 2 routes have 5**. Most routes reference the same missing origin particles JS. Missing paths are not equal to unique site defects.

## Concrete narrowing of R15-C
Re-ran eight previously failed sample pages after asset restoration: one became a dual-view visual candidate and subsequently exact AUTO PASS (Injection Mold Tooling); three had source availability failures (Insert Molding, Laser Cutting, Rapid Prototyping); three had local runtime 404 (Overmolding, Plasma Cutting, Sponsorship); one had a real 121px desktop height difference (On-Demand Manufacturing). Of those runtime 404s, exact sourced first-party resources were recovered (imagesloaded, encoded Chinese filename image, Alodine asset variants); Plasma and Sponsorship subsequently became actual AUTO PASS. On-Demand still has two bad first-party image paths with no valid acquired asset; preserve OPEN.

Found a **shared root cause** in Elementor `urls.assets`: all 99 local pages contained a saved SOURCE-ORIGIN JS chunk path. Identical proven R14 local-only repair was applied to only **91 still-OPEN** pages. Each of 91 original HTML versions has a SHA/rollback backup, 8 previously PASS pages are untouched. `Overmolding` mobile dynamically now reproduces genuine Swiper 4 slides, 2 clones, 88 images, 15339px instead of the earlier 2 slides, 0 clones, 86 images. The newest mobile source browser retry returned ERR_CONNECTION_CLOSED, so the exact-page gate remains OPEN, not artificially passed. A further exact JS video chunk GET (HTTP200, SHA) was restored.

## Conditional remaining work estimates, actively constrained by evidence
| Work | Remaining active engineer hours | Qualification |
|---|---:|---|
| **R15-C shared fixes and true exceptions** | **3–7h** | Reduced from the prior 4–10h after 91-route shared patch, 2484/2500 asset recovery, and observed repeatable runtime errors; this is still conditional on the 91-route real PWC sample rate |
| R15-B fail-only source/local PWC 91 pages | 1–3h | Reuse scripts and checkpoints, source network retries may increase calendar time; do not confuse source unavailability with local visual defects |
| R16 actual offline navigation, safety, final 99 route reconciliation | 1–3h | Trigger only after 99/99 true exact AUTO PASS |
| **Conditional core remaining** | **5–13h** | Active work estimate, not guaranteed finish; fallback grows if many genuinely new DOM/component defects appear |

**R16 closure decision: NO-GO.** Current exact verified PASS is 8/99, not 99/99. The next evidence gate is a full fail-only dual-viewport pass after the common Elementor repair (don't rerun the eight frozen passes), with source-availability results separate from actual visual failures. All 91 routes remain OPEN until the original automatic gate proves PASS. Keep 0.97 both views, real image states, and 2/2 safe interaction. All files are private on Windows:
`C:\ai\site-mirror\rapiddirect-v2\uat\r15-fast-lane\r15-c-narrowed-estimate-r16-no-go-20261105.json`, `r15-open91-elementor-assets-root-repair.json`, `r15-elementor-config-audit.json`, `uat/r15-fail-only-rescore-progress.json`, `uat/r15-fixed-runtime3-rescore-progress.json`, `r15-runtime-404-exact-repair.json`, and `r16-acceptance-ledger.json`.

Owner authorization: exact 99 URLs already approved; do not request reapproval to inspect/fix within that scope. No new foundations, no blog scope, no READY reboots, no Chrome restart, no BASWORLDY 8769 changes, no PR merge/main/Dev/WWW/Production writes.
