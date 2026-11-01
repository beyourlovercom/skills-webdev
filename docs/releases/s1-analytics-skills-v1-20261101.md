# S1-A–F Analytics Skills V1 · Owner-approved release record

- Date: 2026-11-01
- Authorized: Owner explicitly approved PR #10 merge **and** companion Registry switch, main readback, post-release CI.
- [PR #10](https://github.com/beyourlovercom/skills-webdev/pull/10) squash merge: `43de0a55fe5a10e576841030ab1a49905585a0ae`
- Exact premerge candidate: `4f89f5496537e05dded59726b8fc616ce79d9155`
- Registry release status for `ga4-site-intelligence`, `google-ads-site-intelligence`, `semrush-site-intelligence`, `s1-cross-source`: `IN_MAIN`, `source_ref=main`, `pr=null`.
- Previously released `rapid-webdev`, `duplicate-site-skills`, `gsc-site-intelligence` remain `IN_MAIN`. S0 and other unrelated Skills remain `DRAFT_PR`; older GA4 PR #4/#9 not merged.

## Evidence and limits
- Skills are read-only analysis code + validation, no live Ads/ERP/WWW/GSC writes. Google Ads connector existing real read returned YBY aggregate observations; platform conversions are not proven valid CRM leads.
- GA4 functional UAT previously acknowledged by Owner; live full-year source re-read in this release is not claimed.
- Semrush offline parser/CI are engineered; no paid API, no real authorized Semrush export UAT.
- Four-source CRM/ROI join remains OPEN, not promoted to PASS due to unit tests.
- Exact PR candidate had 81/81 local tests PASS, Registry 16/16 PASS and 4 GitHub CI checks all SUCCESS; independent Codex read-only review reported no definite newly introduced defects.

## Release verification
The companion Registry PR should be merged only after exact-head regression and CI checks. Re-run full tests and Registry resolver from the **final main commit**, verify all four Skill entries and README links point to main, and check post-release main CI status at that exact commit. Do not treat pre-merge CI as release CI.

## Rollback
Prefer reviewed, approved **revert PRs** targeting the exact PR #10 merge and companion Registry commit, accounting for any intervening main changes. Do not force-push `main`, delete private evidence, or affect unrelated published Skills.

## Out of scope
No GSC Sitemap submission, Search Console settings, Semrush API unit purchase, Google Ads adjustments, OAuth extension, website/ERP change, or historical attribution repair is authorized here.
