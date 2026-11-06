# V2.0 RC1 — integration matrix (2026-11-06, refreshed)

This matrix records live GitHub metadata and exact-head CI evidence for PRs #15–#18. It is an integration/release planning artifact, not an approval to merge, deploy, or run local/remote operations.

## Verified pull request snapshot

| PR | Head branch | Exact head SHA | Base | Draft | Changed files | Exact-head CI |
|---|---|---|---|---:|---:|---|
| #15 — V1.2 48h module factory | `policy/visual-first-page-before-pagination-20261102` | `a5a149e5089a4615ecaa47f211566862a823cfff` | `main` | yes | 10 | Public Skill Registry Check SUCCESS; S2 Local Dev WWW Skills CI SUCCESS |
| #16 — Duplicate Site Skills V2 | `feat/duplicate-site-v2-siteone-pwc-20261103` | `76f8a1bb1567d125d77ae4b1c0958f706a06abb3` | `main` | yes | 61 | Public Skill Registry Check SUCCESS; S2 Local Dev WWW Skills CI SUCCESS |
| #17 — WordPress R4 + final-only CSS/JS gate | `feat/v2-wordpress-local-adapter-20261105` | `982746830dd48981edff3bd91d831623e8db628c` | `feat/duplicate-site-v2-siteone-pwc-20261103` | yes | 17 | Public Skill Registry Check SUCCESS; S2 Local Dev WWW Skills CI SUCCESS |
| #18 — Andy Skills V2.0 RC1 | `feat/andy-skills-v2-systemization-20261106` | `cf6f6695947729a03824015f8fc6c90f2a73dacc` | `main` | yes | 7 | Public Skill Registry Check, GSC Site Intelligence CI, S1 Multi-Source Intelligence CI, S2 Local Dev WWW Skills CI — all SUCCESS |

All four PRs remain open Draft PRs. GitHub reports them mergeable, but `mergeable=true` is not an Owner release decision.

## Scope ownership and branch relationship

- **#15 owns the generic V1.2 module factory**: representative-page visual gate, 48h ledger/gate, resumable same-template queue, and tests. It changes legacy `skills/duplicate-site-skills/**` and `skills/site-builder-local/SKILL.md` paths.
- **#16 owns Duplicate Site V2 core**: SiteOne/PWC adapters, direct-mirror and asset guards, preview/canary scripts, queue-to-V2 adapter, V2 integration contract, and V2 tests.
- **#17 owns the WordPress-specific V2 extension**: WordPress Local R2–R4 evidence, final asset lifecycle, and final-only CSS/JS release gate.
- **#18 owns cross-Skill governance**: architecture, execution/evidence/release contracts, roadmap, registry version metadata and README navigation. Its paths do not overlap #15–#17.
- #15 and #16 are independent Draft PRs targeting main; #16 consumes #15's queue contract through an adapter. If separately approved for merge, the planned order remains **#15 before #16**, followed by regression against the resulting main.
- #17 is now synchronized to the exact current #16 head. Its synchronization commit is `982746830dd48981edff3bd91d831623e8db628c`, with parents consisting of the prior #17 head and current #16 head. Current compare: #17 is **27 commits ahead / 0 behind** #16, with 17 changed files. The shared V2 skill file retains #16's current baseline plus #17's WordPress R4 and packaging additions. The three latest #16 review/canary/reference files were preserved.
- #18 remains independent at the file-path level. Its RC1 registry labels are candidate metadata, not proof that every Skill's functionality has independently shipped.

## What is verified — and what is not

### Automated code / registry gates

- #15 exact-head CI: 2/2 workflows SUCCESS.
- #16 exact-head CI: 2/2 workflows SUCCESS. The S2 job ran `node --test tests/*.test.mjs`, Python `test_duplicate_site_v2_*.py` discovery, registry validation, and the WWW negative handoff gate; all steps succeeded. Registry workflow also validated Skill resolution and the example manifest.
- #17 exact-head CI after synchronization: 2/2 workflows SUCCESS. The S2 job ran the Node suite, Python Duplicate Site V2 tests, registry validation, and WWW negative handoff gate; all steps succeeded.
- #18 exact-head CI: 4/4 workflows SUCCESS.

### Site / Owner acceptance gates still open

1. **#15:** CI is green, but the generic module-factory's actual batch/source approval and evidence gates are not automatically satisfied by CI. Do not infer that all future modules or site batches are approved.
2. **#16:** R15 Owner visual review is recorded as 99/99 PASS for its frozen exact route set. R16 offline functional/security/release-candidate acceptance remains OPEN. The wider S0–S3 full-site canary currently records 118 live local HTML pages and 716 pending from 834 known source routes; 834/834 pages are not built or accepted. The known local canary still has disclosed legacy JS / visual exceptions.
3. **#17:** R4 and packaging tests pass, but the final site-level CSS/JS batch remains `BLOCKED_FINAL_BATCH` until actual route/source and final acceptance gates are closed. CI PASS is not final package promotion.
4. **#18:** RC1 documentation and CI are green; S7-G publication remains pending explicit Owner approval.

## Safe next sequence

1. Keep all four PRs Draft; no merge, release, or deployment is implied.
2. Close #16's R16-A through R16-D local offline acceptance using the already frozen 99-route allowlist and evidence; do not rework the 99 Owner-approved visuals.
3. Treat the 834-route full-site effort as a separate staged project: finish S2 robustness, then non-blog S3 and blog S4 batches, with actual HTML/resource evidence and Owner review. Do not label pending routes complete.
4. Close #17 final-only CSS/JS gate only after the corresponding site-level route/source gates and final package evidence pass.
5. Reconcile #15's genuine module-factory approval/evidence gates; then revalidate #16's adapter against the approved queue contract.
6. Review #18 RC1 against the final accepted integration state; request explicit Owner approval before any merge/tag/release.

## Safety boundary

No PR merge, main update, Windows Local execution, BYL DC operation, Dev/WWW deployment, source-site write, or final CSS/JS promotion was performed by this matrix refresh.
