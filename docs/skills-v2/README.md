# Andy Skills V2.0 — Systemization Layer

**Historical status (2026-11-13): RC1 superseded by the V3.1 integration merged in [PR #19](https://github.com/beyourlovercom/skills-webdev/pull/19).** The original governance PR #18 is closed as superseded, not merged a second time. Public Skill contracts are already in `main`; this does not claim every module or target website is accepted, or that connected accounts/devices are authorized. The frozen 99-page offline R16 archive is recorded [with declared exceptions](../reviews/duplicate-site-v2-r16-99-local-closeout-20261113.md).

## Integration tracking

- [Live PR integration matrix for #15–#18](integration-matrix.md) — exact heads, file overlap, branch dependency, CI evidence and remaining release blockers.

## Goals
1. One registry and version policy for every Skill.
2. One task-routing contract: classify → load → inspect project rules → execute approved delta → verify → hand off.
3. One evidence vocabulary: PASS / FAIL / OPEN / BLOCKED, with environment and provenance.
4. One device execution contract for BYL DC and local tools.
5. One release contract: Local → Dev → explicit Owner approval → WWW, with rollback.
6. Reuse accepted modules and evidence; do not re-develop or re-test unchanged scope.

## Layer model

| Layer | Responsibility | Existing source of truth |
|---|---|---|
| S0 | Site profile, skill plan, project gates | site-skill-factory (Draft until merged) |
| S1 | Research and evidence ingestion | GA4, GSC, Ads, Semrush, cross-source Skills in main |
| S2 | Build, Dev UAT, controlled WWW release | site-builder-local, site-dev-uat, site-www-release in main |
| SPECIAL | Authorized site duplication/migration | duplicate-site-skills V1 in main; V2 enhancements remain Draft until merged |
| S3–S6 | Analytics, SEO, migration, content operations | Draft modules; do not imply production readiness |
| GENERAL | Existing-site minimal-delta engineering | rapid-webdev V1 in main |

## Task routing contract
1. Resolve the request to one primary Skill and optional supporting Skills.
2. Read the exact Skill file from its declared ref; read referenced docs and target project's `AGENTS.md`.
3. Read GitHub branch/PR and runtime state. GitHub/runtime wins over old chat summaries.
4. Build a remaining-delta list. Reuse accepted artifacts only when commit/hash, environment and scope match.
5. Execute only within the user's granted scope and connected tool permissions.
6. Record evidence using the shared evidence schema.
7. Stop at the first unmet gate. Never convert missing evidence into PASS.
8. Handoff exact next action, owner, estimated effort and roadmap progress.

## Version policy
- Semantic versions apply to individual Skills and the system integration layer independently.
- MAJOR: incompatible contract or required workflow changes.
- MINOR: backward-compatible capabilities, references, tests or adapters.
- PATCH: corrections that do not change the contract.
- Registry status is separate from version: IN_MAIN, DRAFT_PR, PLANNED.
- A version on a Draft branch is a candidate, not a released version.
- V2.0.0 was not separately tagged; its public systemization work was carried into the V3.1 main integration via PR #19. An RC1 document is not a standalone release tag.
- Do not infer native ChatGPT installation from a GitHub file or registry entry.

## Release boundary
This historical RC1 scope is documentation/contracts/registry integration only. It does not merge PR #15/#16/#17, change any site, publish WWW, connect accounts, alter ads, or authorize production writes.
