# Duplicate Site Skills V2 — R14 audit: 7 new PASS, 2 OPEN (2026-11-04)

Scope: exactly nine Owner-approved RapidDirect URLs. Windows Local only. No source-site writes, Blog, wider crawl, merge, Dev/WWW/Production deployment. Private source HTML/screenshots/assets and SHA receipts remain solely on Windows.

## Actual completed R14 work
- Nine approved source HTML pages obtained HTTP 200, SHA receipts; nine guarded local page previews staged.
- Header structural fingerprint 9/9 consistent; footer two shapes covering 6 and 3 routes. These are candidates, not generalized approved template hashes.
- 255 previously uncached static first-party asset paths: 244 downloaded (37,400,866 bytes), 10 recovered from verified cached aliases, one true source-side HTTP 404.
- Reused existing R11 CSP/read-only form/route guard; removed only nonfunctional offline-only origin challenge with reversible backup. Repaired bad visible Privacy URL replacement locally, not a redesign.
- Additional 30 browser-discovered runtime dependencies recovered; NPI exact map image obtained from first-party GET. All restricted to the nine approved pages.
- Existing Perfect Web Clone CLI full-page screenshot scoring and real evaluateAutomatedVisualPass reused, unmasked 0.97 each viewport, safe interactions 2/2, zero local runtime errors for PASS.

## Exact newly verified AUTO_VISUAL_PASS

| Route | Desktop PWC SSIM | Mobile PWC SSIM |
|---|---:|---:|
| /privacy-policy/ | 1.0000000000 | 1.0000000000 |
| /7075-aluminum-cnc-machining/ | 0.9836920747 | 0.9999962730 |
| /surface-finishes/ | 0.9999858042 | 1.0000000000 |
| /surface-finish/as-machined-finish-services/ | 0.9999935584 | 0.9999941681 |
| /materials/ | 0.9999995970 | 0.9977665144 |
| /industry/industrial-equipment/ | 1.0000000000 | 1.0000000000 |
| /npi-solutions/packaging-stage/ | 0.9999890715 | 0.9999758627 |

The preceding seven Owner/auto approved samples remain unchanged. Accepted representative pages now **14/16**. These are EXACT-PAGE passes only; no generalized template SHA/data-map or batch permissions.

## Remaining two exact-page R14-C blockers
1. /npi-solutions/ — desktop PWC 0.9999942548; mobile source occasionally creates 90 image nodes and 18,093px full-page height versus local 88 images and 17,901px (192px), so source/local visual state and geometry do not satisfy real mobile auto gate. Alternate runs temporarily match but are not a reproducible gate.
2. /about-rapiddirect/ — desktop PWC 0.9736336734; mobile 0.9670934542 FAIL. Source mobile dynamic state can show 51 images versus local 47 and 14,194px versus 14,016px (178px). Known corresponding image SHA is identical, so do not fake assets or hide differing content. Fail-only widget/image state repair needed.

Private Windows proof base: C:/ai/site-mirror/rapiddirect-v2/uat/r14-nine-approved. Updated r14-authorized-nine-ledger.json (with pre-final backup) records seven exact new PASS and two OPEN. Relevant real receipts include r14-{privacy,aluminum7075,surface-list,surface-detail,materials,industry,npi-pack}-auto-pass.json, r14-bounded-asset-recovery-receipt.json, r14-all-runtime-recover-receipt.json, r14-dynamic-image-dom-gap.json, r14-approved-visual-gate-status.json, full source/local screenshots and safe interaction UAT.

## Updated conditional roadmap
| Phase | Remaining active engineer hours | Gate |
|---|---:|---|
| R14-C close two dynamic mobile defects; prove actual template mapping SHA | 5-11h | Both unmasked viewports >=0.97 and zero runtime errors; no unwarranted generalized template pass |
| R15 if reusable mapping works | 14-30h | Separately approved exact 99 remaining core URLs and verified existing PR15 factory batch gates |
| R15 fallback-heavy scenario | 30-50h | Do not replace repeated defects with new foundation; raise risk |
| R16 approved-scope dual-viewport/offline UAT | 10-22h | Complete receipts against approved denominator only |
| R14-R16 base conditional | **29-63h** | No guaranteed completion date; 48h original goal AT_RISK_48H |
| R14-R16 fallback-heavy | **45-83h** | Excludes approval wait and time lost to unstable source |

R13 published sitemap baseline: 834 URLs, 549 Blog excluded, 285 non-Blog candidates; 115 CORE candidates. Seven prior and nine new samples consume 16 of 115; **99 other CORE routes not yet authorized**. Material-detail 82, optional 86, utility 2 held/excluded. R15 batch remains BLOCKED, PR15/PR16 Draft, no GitHub main merge, no production or adjacent BASWORLDY edits.
