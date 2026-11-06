# Duplicate Site Skills V2 — R15 exact 91 fail-only live PWC tranche

2026-11-05, Windows Local only. This is a progress checkpoint (not full R16 closure). Origin source HTML and screenshots remain Windows-private.

## Scope, methodology and live state
- Owner approved exact R15 99 URL allowlist, SHA256 `76871d3322e11751727aeff405d1a4bfc1e8e1dcb4ad7016ee63888253f75b4a`. R14 remains **16/16 AUTO PASS**.
- Before current recheck: **8/99 R15 AUTO PASS**; 91 routes remained OPEN after a SHA-backed local-only Elementor asset-root fix. All 99 guarded HTML pages already pass local HTTP200/CSP and static asset recovery completed 2484/2500 successes, 16 origin unavailable.
- A strict first-run R15 source/local, desktop/mobile, no masks, original PWC/interaction/gate checkpoint tested 31/91 pages: 3 PASS, 6 `SOURCE_UNAVAILABLE`, 13 `PWC_VISUAL_BELOW_097`, 4 `DYNAMIC_IMAGE_MISMATCH`, 2 `GEOMETRY_MISMATCH`, 3 `LOCAL_RESOURCE_HTTP`. These are **first-run** outcomes, not 91-page final pass rate.
- Pixel-difference band audit for numerous PWC-low pages demonstrated near-identical above-fold content but large isolated differences below fold. Symmetric authentic desktop viewport-tile capture (no masks, substitutions or changed source) verified on `/adm-service/`: desktop 0.8175->**0.9999491717**, mobile **0.9999757457**, real original AUTO gate PASS. Baseline first-run process was stopped by exact-owned-process tree only after preserving checkpoint; no READY machine, Chrome or BASWORLDY services were interrupted.
- New resumable two-worker queue is **running** using symmetric source/local desktop viewport screenshots and genuine source/local mobile full-page screenshots, retrying a failed source navigation once. It skips all already AUTO PASS pages. Private runner: `uat/r15-fast-lane/uat/r15-exact91-stitch-resume-orchestrator.py`; exact progress: `uat/r15-fast-lane/r15-exact91-stitch-pass-progress.json`. It was correctly initialized with **87 still-OPEN** routes at new-run start, because existing R15 proof ledger already showed 12/99 AUTO PASS.
- At this checkpoint, new queue **19/87 attempted**, **11/19 exact AUTO PASS** (57.9% attempted; **11/15 = 73.3%** among requests with a reachable authentic source in this small nonrandom, sorted tranche), `SOURCE_UNAVAILABLE` 4, `DYNAMIC_IMAGE_MISMATCH` 1, `GEOMETRY_MISMATCH` 1, `LOCAL_RESOURCE_HTTP` 2; **no new PWC-only failures** yet. These are provisional sample rates, not 91/91 completion rates.
- New genuinely verified cases include `/announcement-pcb-service-launch/` desktop 0.8058->**0.9999066154**, mobile **0.9999667060**, and `/industry/communications/` desktop **0.9999996188**, mobile **0.9999988530**. `evaluateAutomatedVisualPass` and safe interaction 2/2 are invoked for each receipt. An unavailable source remains OPEN; do not use cached HTML to fake a live source check.
- **Live authoritative R16 ledger at checkpoint: R15 23/99 AUTO PASS, 76/99 OPEN; R16 NO-GO.** The new queue is still running, so the progress file—not the numbers in this static note—owns live truth.

## Next fail-only processing
1. Allow current two-worker batch to finish; NEVER start a duplicate while process is alive; checkpoint is resumable.
2. Reconcile `uat/*auto-pass.json` with `r16-acceptance-ledger.py` after meaningful progress. Run bounded retries ONLY for `SOURCE_UNAVAILABLE`, strict original-source checks; separate `GEOMETRY_MISMATCH`, dynamic Swiper image count and `LOCAL_RESOURCE_HTTP` errors into minimal real fixes.
3. No new foundations, no unapproved URL/blog scope, no source-site writes, no masks, no altered PWC 0.97 threshold, no fake images, no more than two concurrent browser workers.
4. Keep PR #15 and #16 DRAFT; no merge main, no Dev/WWW/Production publish, no READY restarts or BASWORLDY port 8769 interference.
5. Existing approved recurring R16 continuation task was UPDATED to read the new progress file, avoid duplicate jobs, and notify only at important milestones or closure.

**R16 can close only after all 99 exact R15 pages and final offline safety/navigation/interaction checks have real PASS receipts.**