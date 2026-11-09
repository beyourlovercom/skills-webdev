# Duplicate Site Skills V2 — R16 active acceptance ledger (2026-11-04)

**Status: R16 OPEN, not closed.** Owner approved continue to R16 completion under Fast Lane V1, exact 99 URL list, no new foundations. Only exact-page real PWC/interaction success counts. This GitHub file is a status audit, not a third-party-page data dump.

## Frozen achieved baselines

- **R14 CLOSED: 16/16 representative pages** with exact-source dual-viewport PWC and safety evidence. Never rework passed pages.
- **R15 exact 99 Owner-authorized pages** were fetched to Windows Local with SHA, and **99/99 local HTTP 200 / CSP read-only** smoke test passed.
- R15 exact URL allowlist SHA256: `76871d3322e11751727aeff405d1a4bfc1e8e1dcb4ad7016ee63888253f75b4a`.
- Reuse exact source HTML, not unverified generalized template mappings. PR15 fixture PASS cannot prove real queue readiness. No unauthorized page scope expansion, no blog.

## Exact R15 pages meeting strict AUTO_VISUAL_PASS (5/99)

| Page | Desktop PWC | Mobile PWC | Interaction |
|---|---:|---:|---|
| `/industry/aerospace/` | 1.000000 | 0.9935711197 | 2/2 PASS |
| `/industry/automotive/` | 1.000000 | 1.000000 | 2/2 PASS |
| `/help-center/` | 1.000000 | 1.000000 | 2/2 PASS |
| `/terms-conditions/` | 1.000000 | 1.000000 | 2/2 PASS |
| `/17-4ph-stainless-steel-cnc-machining/` | 0.9999875717 | 0.9843161822 | 2/2 PASS |

All five returned **real** `evaluateAutomatedVisualPass` with zero masking. For Terms, original URL was incorrectly shortened in visible paragraph text during localization; only exact visible text was restored using original-source evidence and rollback, preserving all href/security restrictions. Industry Aerospace used equivalent unmasked real viewport tile rendering for the source and local because Playwright full_page had offscreen paint artifacts. No thresholds lowered.

**94/99 pages remain VISUAL_OPEN.** Newly sampled `/services/injection-mold-tooling/` desktop PWC 0.8145 and `/services/die-casting/` mobile 0.3662 are **not** PASS. Several others have source-connect or asset-dependent failures and are held OPEN. Fail-only remediation required.

## R16 resource/data recovery

- Initial R15 asset inventory: 2978 unique referenced first-party paths; 469 came from cached HTML image paths and 236 additional verified prior-runtime files were recovered; 127 priority assets were separately downloaded. Initial uncached unique set was 2509 paths.
- Safe same-origin recovery script `uat/r15-fast-lane/r15-remaining-assets-fastlane.py` filters strictly 2500 file-like assets, bounded at two workers, exact first-party URL GET only, no redirects, 18-sec timeout, SHA and resumable checkpoints. At latest observed checkpoint **1080/2500 processed; 1074 succeeded, 6 origin failures**, remaining work not counted as complete. See latest Windows-private `r15-all-asset-recovery-progress.json` for live truth, not this static number.
- 99-page first browser runtime smoke completed while assets were missing: local HTTP 99/99, 94 had some network request failures and 99 recorded JS exceptions. This was **diagnostic only**; not final UAT. After asset recovery must rerun the source-local visual and runtime gates; do not equate errors with complete pages or auto-fail source-authored scripts without comparison.
- Private Windows proof base: `C:\ai\site-mirror\rapiddirect-v2\uat\r15-fast-lane\`. Main files: `r16-acceptance-ledger.json`, `r15-all99-browser-smoke-progress.json`, `r15-all-asset-recovery-progress.json`, `uat/r15-*-auto-pass.json`, `uat/r15-ready10-auto-progress.json`. No origin HTML, assets or screenshots are committed to GitHub.

## Next Fast Lane gate

1. Read state and **do not duplicate active Windows processes**. Complete bounded asset de-dup recovery; classify true origin 404 vs local missing, retain SHA and source failure evidence.
2. Resume only failed/unverified pages; real matching source/local desktop + mobile screenshots, PWC **>=0.97 each**, full image/DOM geometry, zero unintended local HTTP errors, local safe interaction 2/2, actual `evaluateAutomatedVisualPass`. Use viewport stitch only symmetrically to remedy verified screenshot paint bugs, never mask/hide/replace content.
3. Update per-page PASS/OPEΝ in private R16 ledger; never count 99 HTTP200 as 99 visuals. Freeze passes, work fail-only. After **99/99 exact PASS**, perform R16 end-to-end offline navigation, local routing, resource, safety, archive and owner review gate; only then declare R16 CLOSED.
4. Keep PR #15 and #16 Draft, no main merge, no Dev/WWW/Production writes, no READY device restart, no BASWORLDY port 8769 use. Owner approved R15 scope and local UAT, **not** production deployment.

A scheduled continuation check now supports this project; do not send repetitive notifications for unchanged status. The 48-hour core target is aspirational, not permission to skip real gates.
