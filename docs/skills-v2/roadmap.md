# Andy Skills V2.0 Roadmap

**Current state: RC1 integration Draft.** All PRs #15–#18 remain Draft; no merge to main or production release has been performed.

| ID | Workstream | Deliverable | Exit condition | Status |
|---|---|---|---|---|
| S7-A | Registry/version policy | system version, per-Skill version, status/ref/provenance | schema validation + README consistency | Implemented in RC1; exact-head registry CI PASS |
| S7-B | Routing protocol | task envelope and load/inspect/execute flow | route examples cover GENERAL/SPECIAL/S0–S6 | Implemented in RC1 |
| S7-C | Evidence contract | shared PASS/FAIL/OPEN/BLOCKED schema | schema and propagation rules documented | Implemented in RC1 |
| S7-D | Device execution contract | BYL DC, READY device, readback, no bypass | safety/stop conditions documented | Implemented in RC1 |
| S7-E | Release/rollback contract | Local → Dev → Owner approval → WWW | no implied production authorization | Implemented in RC1 |
| S7-F | Regression/integration | registry tests, skill tests, PR #15/#16/#17 compatibility review | exact-head CI + branch/dependency review + Owner site acceptance | PR #15–#18 exact-head CI all PASS (2/2, 2/2, 2/2, 4/4); #17 synchronized to #16; integration matrix refreshed; site/runtime acceptance OPEN |
| S7-G | Publish V2.0 | merge integration PR and tag/release | explicit Owner merge approval | Pending; no merge authorized |

## Reconciled implementation PRs

- **#15** remains a separate Draft PR for the generic V1.2 module factory. Its CI is green; actual module/source approval and evidence gates remain separate.
- **#16** remains the Duplicate Site V2 core Draft PR. Its exact-head CI is green. R15 visual signoff is 99/99 for the frozen allowlist; R16 offline functional/security/release acceptance remains open.
- **#17** is now synchronized to the current #16 head (27 ahead / 0 behind, 17 changed files). Its exact-head CI is green. The final site-level CSS/JS batch remains blocked pending route/source and final package acceptance.
- **#18** remains the cross-Skill governance Draft PR. Its exact-head four-workflow CI is green. RC1 candidate metadata is not a release or a claim that all Skills independently shipped.

## Reuse / consolidation policy

- Keep existing main Skills as stable foundations; do not rename or rewrite them merely to signal V2.
- Keep all implementation and governance PRs Draft until exact heads, changed files, tests, dependencies, and site evidence are reconciled.
- Treat #17 as a synchronized child extension of #16, not as an independent base-targeting-main PR.
- Resolve overlap by mapping each feature to one owning Skill; avoid duplicate instructions.
- Update Registry only after verifying actual branch/PR status and file path.
- V2.0 is an integration release, not a claim that all S0–S6 Draft modules or all 834 source routes have shipped.

## Remaining work estimate

- #16 R16-A through R16-D offline functional/security/archive closeout: **2.5–5.5 engineering hours**, based on the current signed 99-route scope; actual defects may extend this.
- Wider 834-route site integration (S2 robustness, S3 non-blog, S4 blog, S5 integration) is a separate staged effort currently estimated at **50–110 engineering hours**. This is not a prerequisite to claim the frozen 99-route R15 visual signoff, and it must not be represented as complete until actual pages/resources and review evidence exist.
- #15 approval/evidence reconciliation and #17 final package acceptance: estimate after their exact remaining blockers are inspected; no invented fixed completion time.
- S7-G release effort begins only after Owner review and explicit merge approval.

