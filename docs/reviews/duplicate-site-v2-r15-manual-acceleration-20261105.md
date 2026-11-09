# R15 manual Fast Lane acceleration — 2026-11-05

**Status: R16 OPEN; R15 still needs exact-page proof for all 99 routes.** Owner explicitly requested manual acceleration, not visual approval without tests. Windows Local only; no WWW/Dev/Production, no GitHub main merge, and do not upload third-party HTML/images/screenshots.

## Measured progress
- Prior R15 proof ledger: 38/99. The previous 61-open-page round completed **61/61 attempted with 14 exact AUTO_PASS**, bringing total to 52/99.
- Manual targeted same-day tests recovered additional exact passes: `/services/3d-printing/mjf/` desktop **0.9841647034**, mobile **0.9999674124**; `/services/cnc-rapid-prototyping/` desktop **0.9999746415**, mobile **0.9999895169**; `/services/on-demand-manufacturing/` both **1.0**; `/services/rapid-prototyping/` desktop **0.9999983968**, mobile **0.9999994950**. Original safety + PWC + AUTO gate required. This gave **56/99 confirmed on refreshed ledger**, 43 OPEN.
- The next **43-item** real fail-only run was started manually on Windows: `C:\ai\site-mirror\rapiddirect-v2\uat\r15-fast-lane\uat\r15-open43-manual-fastlane.py`. Checkpoint: `r15-open43-manual-fastlane-progress.json`. It prioritizes PWC-only issues, capture integrity, geometry and dynamic images, local resource issues, then unavailable origin requests; **two browser workers maximum**. At the first observed checkpoint, `/services/3d-printing/fdm/` earned real `AUTO_VISUAL_PASS` (desktop **0.9831548387**, mobile **0.9999596980**), while other pages remained OPEN. Query the progress file and rerun `r16-acceptance-ledger.py` for true latest totals; do not treat this static report as live state.

## Actual shared fixes, not template redevelopment
- MJF source-original 150x150 PNG successfully recovered and SHA-verified. Two requested first-party animated GIFs (Custom Enclosure and Waterjet) recovered and SHA-verified, though the exact source page may still refuse live browser loading; do not auto-pass an unavailable source.
- Found that curl.exe completed exit 0 but silently failed to create temporary files whose Windows filename included zero-width U+200B. Solved by downloading using a plain ASCII temp filename, validating WEBP RIFF magic and SHA256, then moving bytes to their exact original Unicode filename via Python. **Six** original first-party WebP assets recovered (manual/molding/mechanical/adhesive assembly and 2 rapid-prototyping images); no content substitutions. Exact page URLs unchanged and local GET verifies asset availability.
- Investigated viewport-tile failures. Browser scroll anchoring automatically shifted `scrollY` by 151px on a late-loading local image. Setting `overflowAnchor='none'` on root/body ONLY during symmetric, real screenshot acquisition fixes that capture-integrity failure without hiding content or changing visual design. This correction was reused on the exact failed pages, earning a true PASS for CNC Rapid Prototyping. Other exact routes still have genuine visual/geometry mismatches, remain OPEN.
- Genuine source unavailability is not a local bug; preserve `SOURCE_UNAVAILABLE` as OPEN and retry only in a controlled way. Confirmed certain broken original asset URL strings return origin HTTP 404 even with browser User-Agent; do not fake images or bypass gate.

## Open43 classification at manual runner start
| Class | Open routes |
|---|---:|
| PWC_VISUAL_BELOW_097 | 6 |
| CAPTURE_INCOMPLETE | 2 |
| GEOMETRY_MISMATCH | 5 |
| DYNAMIC_IMAGE_MISMATCH | 6 |
| LOCAL_PAGE_HTTP (often screenshot-tile integrity, not true HTTP) | 2 |
| LOCAL_RESOURCE_HTTP | 5 |
| SOURCE_UNAVAILABLE | 17 |
| **Total** | **43** |

Existing hourly `Duplicate Site R16 收尾` automation remains enabled and has been updated to check the active Open43 process, avoid duplicate runs, perform fail-only corrections and communicate only important milestones. The periodic service did not expose a verified next run timestamp. No automatic future completion date is asserted.

**R16 closure gate** remains: exact Owner-approved 99 URL list (SHA256 `76871d3322e11751727aeff405d1a4bfc1e8e1dcb4ad7016ee63888253f75b4a`), source/local desktop+mobile PWC SSIM>=0.97 each, no masking, coherent image/DOM geometry and resources, 2/2 local safe interaction, original per-route `evaluateAutomatedVisualPass`. Then run R16 full offline navigation/security acceptance; only then mark CLOSED. PR #16 stays Draft.
