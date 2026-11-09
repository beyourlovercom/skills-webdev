# V2.0 Execution Contract

## Required task envelope
Every task execution should identify:
- project_id, repository, branch, exact commit_sha
- target_environment: research | local | dev | production
- primary_skill and supporting Skill IDs, each with version/ref/status
- authorized_scope: allowed read/write operations and explicit exclusions
- acceptance_criteria: observable outcomes and test method
- rollback_plan: artifact, restore command/owner, and verification
- roadmap_id, current stage, remaining effort

Missing critical identity, authorization or target information is BLOCKED; do not guess.

## Execution sequence
DISCOVER → LOAD_SKILLS → READ_PROJECT_RULES → INSPECT_RUNTIME → DELTA_PLAN → APPROVAL_CHECK → EXECUTE → VERIFY → RECORD → HANDOFF

- Discover before changing files; read target repo AGENTS.md and current PR/branch.
- Use accepted results only when exact scope, environment and SHA match.
- Prefer minimal, reversible diffs; batch independent read-only checks.
- Do not repeat accepted tests unless inputs changed or evidence is stale.
- Direct tool writes must be read back. Tool invocation alone is not proof of success.

## Device / remote execution
- Use only the user's explicitly connected and authorized device/link.
- Preserve READY devices and existing browser sessions; do not restart Chrome or a device unless separately authorized.
- Never bypass OAuth, consent, safety checks, rate limits, anti-bot controls or tool policy.
- A remote call timeout or access denial means UNKNOWN/OPEN, not successful execution.
- Never claim a command ran unless its output and resulting state were observed.

## Environment gates
| Stage | Minimum evidence | Write permission |
|---|---|---|
| Research | Source, timestamp, provenance | Read-only |
| Local | Exact diff, tests, browser UAT, backup | Within approved Local scope |
| Dev | Exact SHA, host readback, isolation, UAT, rollback | Explicit Dev scope |
| WWW | Dev PASS, backup, exact SHA/scope, independent Owner pass | Separate explicit production approval |
| Post-release | HTTP/browser/business smoke, logs, rollback readiness | Only approved release scope |

## Stop conditions
Stop and report BLOCKED on scope drift, unexpected destructive effects, production data risk, missing backup, mismatch between intended and actual SHA, unapproved spend, authentication barriers, or failing critical tests.

## Handoff minimum
State exact commit, files, environment, commands actually run, test counts, PASS/FAIL/OPEN, side effects, PR state, rollback evidence, blockers, next bounded action, estimated effort, and one final roadmap progress line.
