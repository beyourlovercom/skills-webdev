# Andy Skills V2.0 Roadmap

**Current state: RC1 integration Draft.** No merge to main has been performed.

| ID | Workstream | Deliverable | Exit condition | Status |
|---|---|---|---|---|
| S7-A | Registry/version policy | system version, per-Skill version, status/ref/provenance | schema validation + README consistency | In this PR |
| S7-B | Routing protocol | task envelope and load/inspect/execute flow | route examples cover GENERAL/SPECIAL/S0–S6 | In this PR |
| S7-C | Evidence contract | shared PASS/FAIL/OPEN/BLOCKED schema | schema and propagation rules documented | In this PR |
| S7-D | Device execution contract | BYL DC, READY device, readback, no bypass | safety/stop conditions documented | In this PR |
| S7-E | Release/rollback contract | Local → Dev → Owner approval → WWW | no implied production authorization | In this PR |
| S7-F | Regression/integration | registry tests, skill tests, PR #15/#16/#17 compatibility review | CI PASS + Owner review | CI 4/4 PASS; PR compatibility review OPEN |
| S7-G | Publish V2.0 | merge integration PR and tag/release | explicit Owner merge approval | Pending |

## Reuse / consolidation policy
- Keep existing main Skills as stable foundations; do not rename or rewrite them merely to signal V2.
- Treat PR #15, #16 and #17 as independent Draft inputs until exact heads, changed files, tests and dependencies are reconciled.
- Resolve overlap by mapping each feature to one owning Skill; avoid duplicate instructions.
- Update Registry only after verifying actual branch/PR status and file path.
- V2.0 release is an integration release, not a claim that all S0–S6 Draft modules have shipped.

## Estimate
Initial integration docs/registry/tests: 2–4 engineering hours.
Reconcile three existing Draft PRs and resolve conflicts: 2–5 hours.
Run full repository regression and owner review: 1–2 hours.
Total planning estimate: 5–11 engineering hours, subject to CI and PR dependencies.
