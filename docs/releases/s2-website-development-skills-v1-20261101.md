# S2 Website Development Skills V1 · Owner-approved Release Record

**Approved on 2026-11-01**: Owner explicitly approved PR #12 Skill-repository merge, and companion Registry/README main status switch. No target-website deployment was approved.

- Original owner-approved candidate: `a25254090d4ca8619682bb124be58c4c457beb3a`
- S2 code PR: https://github.com/beyourlovercom/skills-webdev/pull/12
- S2 code squash merge SHA: `ef40c3a65a1a0f025c3696d904f5be20de61a9b8`
- Skills: `site-builder-local`, `site-dev-uat`, `site-www-release`.
- Registry published state: `IN_MAIN`, `source_ref=main`, `pr=null` (only these three S2 entries).
- All previously published S1 / rapid-webdev / duplicate-site-skills remain IN_MAIN. S0/S3–S6 and other draft entries remain DRAFT_PR and are not merged.

## Guarantees and limitations
The Skill scripts are OFFLINE JSON evidence validators: no remote site access, deployment, Google or customer data reads; synthetic templates intentionally produce BLOCKED. Local source tests PASS do not prove any real target's Local/Dev/WWW UAT. Separate gate `www` is PRE-deploy review; `www-post` is POST-deploy evidence readback. Neither is a write token or verifies Owner identity. Source Git SHA and actual runtime must be independently checked.

Andy-series plugin **admin** desktop-only does not exempt customer-facing websites from PC/Mobile UAT. Dev index, payment, SMTP, OMS and Cron must be safely isolated. Production backups, rollback and data preservation are mandatory for actual WWW release.

## Pre-release checks
Candidate SHA local full suite **96/96 PASS**; Registry **16/16 PASS**; Windows focused **24/24 PASS**. Exact-head CI:
- S2 https://github.com/beyourlovercom/skills-webdev/actions/runs/41304659699
- Registry https://github.com/beyourlovercom/skills-webdev/actions/runs/41304659706
- GSC regression https://github.com/beyourlovercom/skills-webdev/actions/runs/41304659740
- S1 regression https://github.com/beyourlovercom/skills-webdev/actions/runs/41304659693

## Release companion and post-release gate
Companion Registry PR updates only Registry, README, and regression tests plus this release note; it requires exact SHA full local tests and GitHub CI before merge. After merge, read back **final main SHA**, all ten IN_MAIN entries, and re-run full test suite and GitHub CI at that exact main commit. Don't promote premerge CI results to final main CI.

## Rollback
Use a reviewed, separately approved **revert PR** against the precise original merge and companion release commit, reconciling intervening main changes. Never force push main or revert unrelated approved Skills, and do not interpret a Skill repository rollback as authorization to change any running website.
