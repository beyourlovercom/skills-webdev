# Andy Skills V3.1 — Windows Local 实机 Canary（2026-11-09）

**Candidate:** 3.1.0-rc.1 / PR #19 Draft / no main merge, no Dev or WWW deployment.

## Verified environment and scope

- BYL DC official OAuth connected to the authorized Windows device. READY devices and existing Chrome sessions were not restarted.
- Candidate branch was cloned by existing GitHub SSH into independent C:/ai/skills-v31-canary. An initial HTTPS clone failed due to connection reset.
- A separate existing local project reported 834 recognized routes, 834 local HTML files, zero missing route files via localhost:8787. This is HTML coverage only, NOT 834 visual/function PASS.
- Three sample R15 Owner-approved page HTML files were independently SHA256-read-back verified 3/3. Source HTML bytes were not modified or published into GitHub.
- Isolated read-only preview only on 127.0.0.1:8791, results stored in private local workspace.

## Actual technical findings

| Check | Verified result | State |
|---|---|---|
| Windows V3.1 Node regression tests | 25/25 PASS | PASS |
| PR #19 exact-head GitHub workflows before this documentation | 4/4 SUCCESS | PASS |
| Windows PowerShell 5.1 UTF-8 BOM Manifest | Failed initially; fixed in both V3.1 CLI inputs and tested | PASS |
| Frozen R15 HTML checksums | 3/3 match private Owner signoff | PASS |
| Real browser desktop 1440x900 + mobile 375x812 | 3 sample URLs x 2 = 6/6 HTTP 200, H1 present, no horizontal overflow | SMOKE PASS |
| Clickable Local hub + Local sitemap | 2 unique real ingress sources x 3 sample routes = 6/6 actual clicks successful | PASS for sample |
| Side effects during read-only browser UAT | Zero observed attempts at non-local or non-GET network requests | PASS for tested flows |
| WordPress HTTP resource errors | 37–38 404/view before scoped local asset root fix, then 3 font 404/view, then 0/6 views after TrueType MIME fix | PASS for HTTP resources |
| GTranslate lazy flag images | 9 per viewport have data-gt-lazy-src but no src; several original flag files missing locally | OPEN |
| Page runtime JavaScript | JS pageerrors still observed on all 6 views; require interaction impact classification | OPEN |
| New source-vs-Local dual view SSIM | Not rerun in this Canary; existing Owner page visual signoff does not substitute for new automatic score | OPEN |
| PR #15 reusable template batch | Page-level Owner PASS is not a blanket generalized template SHA authorization | BLOCKED |
| PR #17 final whole-site CSS/JS packaging | Site-level source visuals, all user interactions, and Owner final approval incomplete | BLOCKED_FINAL_BATCH |

## Reusable V3.1 fixes delivered

1. Both Local CLI scripts accept PowerShell UTF-8 BOM JSON files.
2. Generic Local preview now accepts explicitly scoped offline-staged/static content directories, while preventing arbitrary private UAT file serving, disallowed extensions, traversal and off-local access.
3. Font TrueType MIME correction reuses existing assets without downloading them again.
4. Generic Local hub/Sitemap can be clicked with real Chrome for multiple pages; no per-site server redevelopment is needed.

## Unfinished gates

This pilot does not prove 834/834 browser fidelity, final packaging, payment/form submission, or public website functionality. The existing page SHA and Owner-approved visuals remain frozen. Known lazy-language flag exceptions and original JS runtime defects are not silently passed. Final PR #17 build, Windows full-site acceptance, Owner version freeze and any main/WWW release remain independent gates.

## Windows private receipts (not in public GitHub)

- C:/ai/skills-v31-canary/private/rapiddirect-approved-3-canary.json
- C:/ai/skills-v31-canary/private/v31-local-browser-canary.json
- C:/ai/skills-v31-canary/private/v31-navigation-canary.json
- C:/ai/skills-v31-canary/private/screenshots/
- Original Owner R15 visual approval ledger under C:/ai/site-mirror/rapiddirect-v2/uat/r15-fast-lane/

No source HTML, private screenshots, customer data, or licensed site media are committed.
