# V2.0 RC1 — integration matrix (2026-11-06)

This matrix records live GitHub metadata for PRs #15–#18. It is an integration/release planning artifact, not an approval to merge, rebase, deploy, or run local/remote operations.

## Verified pull request snapshot

| PR | Head branch | Exact head SHA | Base | Draft | Changed files | Verified CI at exact head |
|---|---|---|---|---:|---:|---|
| #15 — V1.2 48h module factory | `policy/visual-first-page-before-pagination-20261102` | `a5a149e5089a4615ecaa47f211566862a823cfff` | `main` | yes | 10 | Public Skill Registry Check SUCCESS; S2 Local Dev WWW Skills CI SUCCESS |
| #16 — Duplicate Site Skills V2 | `feat/duplicate-site-v2-siteone-pwc-20261103` | `76f8a1bb1567d125d77ae4b1c0958f706a6abb3` | `main` | yes | 61 | No PR-triggered workflow runs returned for this exact head SHA; do not infer pass from older branch runs |
| #17 — WordPress R4 + final-only CSS/JS gate | `feat/v2-wordpress-local-adapter-20261105` | `e195a4dbd10d2563a19c1b5b8c224fd793e3b3c2` | `feat/duplicate-site-v2-siteone-pwc-20261103` | yes | 17 | S2 Local Dev WWW Skills CI SUCCESS; Public Skill Registry Check SUCCESS |
| #18 — Andy Skills V2.0 RC1 | `feat/andy-skills-v2-systemization-20261106` | `18b6355bced8ae96db1b7d644f72011fba0d088d` | `main` | yes | 6 | Public Skill Registry Check, GSC Site Intelligence CI, S1 Multi-Source Intelligence CI, S2 Local Dev WWW Skills CI — all SUCCESS |

## Scope ownership and overlap

- **#15 owns the generic V1.2 module factory**: representative-page visual gate, 48h ledger/gate, resumable same-template queue, and its tests. It changes the legacy `skills/duplicate-site-skills/**` and `skills/site-builder-local/SKILL.md` paths.
- **#16 owns the Duplicate Site V2 core**: SiteOne/PWC adapters, direct-mirror and asset guards, preview/canary scripts, queue-to-V2 adapter, V2 integration contract, and V2 tests. It reuses #15's queue through an adapter; it does not modify #15's exact changed-file paths.
- **#17 owns the WordPress-specific V2 extension**: WordPress Local R2–R4 evidence, final asset lifecycle and final-only CSS/JS release gate. It extends #16's V2 skill and therefore has one exact changed-file overlap with #16: `skills/duplicate-site-skills/v2/SKILL.md`.
- **#18 owns cross-Skill governance**: system architecture, execution/evidence/release contracts, roadmap, registry version metadata and README navigation. Its six changed paths do not overlap the changed-file lists of #15, #16 or #17.

## Branch relationship and required integration order

- #15 and #16 are independent Draft PRs targeting `main`. Their changed-file lists are disjoint; #16 has an explicit adapter dependency on #15's queue contract. Merge order, if separately approved, should therefore be **#15 before #16**, followed by regression against the new main.
- #17 is based on #16, not main. Live compare reports the #17 branch as **diverged** from the current #16 branch: #17 is 26 commits ahead and 4 commits behind. The #17 base SHA recorded by GitHub is `029e9ef0b23c7877620864acd5d6541a2456aa5f`, while current #16 head is `76f8a1bb1567d125d77ae4b1c0958f706a6abb3`. This requires a controlled branch synchronization/revalidation before #17 can be treated as an up-to-date child of #16. No rebase/merge was performed.
- #18 is independent of #15–#17 at the file-path level and targets main. It can remain a governance-only Draft while implementation PRs complete their own gates. Its registry version labels are candidate metadata, not proof that every Skill's functionality has independently shipped.

## Release blockers that remain real

1. #15: its own PR body says actual module batches remain blocked pending Owner source/representative approvals. Generic queue tests and CI do not approve a site batch.
2. #16: Windows/local and source fidelity gates described in its PR body remain open; its exact current head has no PR-triggered workflow runs returned by the CI lookup. Run full CI on the exact head before review.
3. #17: final site-level CSS/JS batch is explicitly `BLOCKED_FINAL_BATCH`; full route/source visual decisions and final acceptance remain open. It also needs synchronization with #16 and regression rerun.
4. #18: RC1 remains Draft. S7-G publication is not authorized. No PR has been merged by this matrix update.

## Safe next sequence

1. Keep all four PRs Draft; do not infer merge readiness from GitHub's `mergeable=true`.
2. Run exact-head CI for #16; synchronize #17 to the current #16 base only after a separate scoped approval, then rerun its full tests and CI.
3. Resolve #15's genuine Owner/module evidence gates; then validate the #16 queue adapter against the merged #15 contract.
4. Revalidate #17 WordPress final-package gate only after #16 synchronization and all route/source gates are genuinely closed.
5. Review #18 RC1 against the resulting main/PR architecture; only then request explicit Owner release approval.

## Safety boundary

No PR merge, branch rebase, Windows Local execution, BYL DC operation, Dev/WWW deployment, source-site write, or final CSS/JS promotion was performed by this matrix update.
