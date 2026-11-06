# Duplicate Site Skills V2 — Fast Lane R14 CLOSED; R15 99-page source intake complete, 2 pages auto-PASS

Date: 2026-11-04. The user explicitly approved the exact R15 99-URL list and Fast Lane V1 without foundational re-development. Windows Local ONLY. Do not commit RapidDirect source HTML, media, screenshots, or other private runtime assets.

## R14: all 16 exact representative pages verified
- Original seven previously PASS untouched; nine later Owner-approved pages all now AUTO_VISUAL_PASS, including NPI Solutions and About Us closed in this execution.
- NPI Solutions: source vs local Swiper both 8 slides / 2 duplicate slides; fixed exact two-page Elementor assets-root config and NPI-specific existing Swiper script load race; desktop PWC **0.9999940880**, mobile **0.9999684750**, safe interaction 2/2, local HTTP errors 0, actual `evaluateAutomatedVisualPass` returned PASS.
- About Us: source and local Swiper initialized (two 7-slide carousels), DOM 51 mobile images, 14194px. Playwright full-page screenshot had a reproducible blank offscreen image despite the element image being real, loaded and visible; used identical real 18-viewport mobile screenshots stitched for both source/local (not masked, cropped, hidden, substituted or artificially scored). Desktop full-page PWC **0.9735614028**, mobile real tile PWC **0.9999759946**, safe interactions 2/2, actual gate returned AUTO_VISUAL_PASS. Existing genuine runtime and page HTML preserved, rollback receipts retained.
- Protected private Windows evidence: `uat/r14-nine-approved/r14-authorized-nine-ledger.json` (now **16/16**, all nine new exact AUTO PASS); `r14-npi-index-auto-pass.json`; `r14-about-auto-pass.json`; fail-only screen and handler proofs. **These are exact-page PASS receipts, not a blanket 99-page template SHA claim.**

## R15: 99 exact URL Owner allowlist / source intake
- Owner approval of URL list SHA256 `76871d3322e11751727aeff405d1a4bfc1e8e1dcb4ad7016ee63888253f75b4a`. Original full list remains `docs/reviews/duplicate-site-v2-r15-exact-99-PENDING-OWNER-20261104.txt` as a historical snapshot; authorization is recorded here and Windows-private `r15-exact99-owner-approval.json`.
- The first 7 URLs and the remaining 92 source URLs were fetched by exact first-party GETs, 0 redirects, all returned true HTML and were staged locally with R11 CSP/read-only form + scope-link guard and SHA256. The remaining 92 task took 451.78 seconds and reported 92/92 SAFE_LOCAL_STAGE, 0 source writes.
- All 99 guarded page HTMLs now also exist in one unified Windows directory: `uat/r15-fast-lane/offline-staged/`, served read-only on **127.0.0.1:8786**. A real local GET smoke check returned **99/99 HTTP200** and **99/99 CSP/read-only guard**. No Production, Dev, WWW or origin writes.
- Real asset dedup audit across the 99 HTMLs: **2978 unique first-party paths** (including URLs referenced by page HTML). Initial cache recovered 469; subsequent recovery from earlier verified runtime cache copied 236 other assets (not all part of same missing-path denominator). Of 2509 initially uncached paths, **127** were newly downloaded from approved origin assets; **2382** original paths remain missing. 132 priority paths attempted (5 failures include directory-style references or unavailable origin resource), exact SHA receipts retained. First-batch new download 14,810,689 bytes.
- Observed structural reality: seven new diverse pages were compared using largest Elementor body skeleton, and all seven full-body DOM fingerprints differ. Industry Automotive and Aerospace shared a TOP structure signature, but full DOM was not identical. Do **not** claim generalized template field/SHA mappings exist just from category.

## R15 first two exact-page real auto visual PASSES
| URL path | Desktop PWC SSIM | Mobile PWC SSIM | Real gate |
|---|---:|---:|---|
| `/industry/aerospace/` | 1.000000 | 0.9935711197 | `AUTO_VISUAL_PASS`, safe interactions 2/2, 0 local HTTP failures |
| `/industry/automotive/` | 1.000000 | 1.000000 | `AUTO_VISUAL_PASS`, safe interactions 2/2, 0 local HTTP failures |

- Aerospace desktop initially 0.95867368995 using generic `full_page=True`; subsequent identical real viewport-tiles on BOTH source and local attained 1.000000. Mobile standard source/local 0.9935711197, unmasked. Original PWC scorer and `evaluateAutomatedVisualPass` called, exact tested page only.
- Automotive standard screenshot worked immediately after shared runtime and origin-only challenge cleanup, both scores 1.000000; original safe interaction 2/2 and gate called. Do not rerun these two pages absent a relevant change.
- Private evidence: `uat/r15-fast-lane/uat/r15-industryaero-auto-pass.json`, `r15-industryauto-auto-pass.json`, `r15-all99-local-http-smoke.json`, `r15-all99-unified-asset-receipt.json`, `r15-firstbatch-critical-asset-receipt.json`, `r15-shared-runtime-reuse-receipt.json`, `r15-batch01/r15-batch01-intake-receipt.json`, `r15-batch02-remaining92/r15-batch02-intake-progress.json`.

## Remaining work and gates
- R14 **CLOSED 16/16**. R15: **99/99 guarded HTML staged**, **99/99 local HTTP+guard PASS**, **2/99 dual-viewport visual AUTO PASS**, **97/99 need real PWC and safety UAT**; **2382** first-party asset paths still uncached in original dedup denominator. A real PR15 queue factory still requires per-template verified mappings and real SHA/asset manifests; prior test fixture `PASS` may not be used as actual authorization. Fast Lane uses exact-source structure preservation (not invented generalized templates), asset SHA dedupe and fail-only validations. No mask/score reduction and no false full-site PASS.
- User-approved R15 exact URL list is no longer the authorization blocker; remaining blockers are actual resource completion and per-page high-fidelity UAT, and data/template SHA if using PR15 factory renderer.
- Keep two concurrent Windows asset/source tasks maximum, no READY-device restart, no Chrome window thrashing, no reuse of port 8769 (BASWORLDY), no main/Production changes. PR #15 and #16 remain Draft; GitHub contains only the audit document, not third-party HTML.
- After each small set of truly AUTO-PASS pages, provide Owner a reviewed batch and failure list. Reuse verified exact same-type renderer only if field/structure SHA is demonstrated; otherwise retain exact original HTML and continue offline fidelity QA.

**No claim of R15 completion** beyond the precise milestones above. Original target of finishing core scope within 48 active hours remains aspirational, not an assertion of a future completion.
