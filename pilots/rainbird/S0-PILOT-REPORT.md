# Rain Bird｜S0 Public Website Pilot (2026-10-30)

**Scope**: Third-party website **public-read-only benchmarking**, not an owned project. No access to Rain Bird backend, accounts, source repository, GA4/GSC, customer data or deployment privileges. Neither Rain Bird nor the separately hosted store will be modified. This pilot exists to validate the generic S0 factory on diverse real public business evidence.

## Source-backed facts
| Field | Assessment | Evidence |
| --- | --- | --- |
| Brand | Rain Bird | https://www.rainbird.com/ |
| Business model | Mixed B2B+B2C: homeowners, professionals, golf and agriculture | https://www.rainbird.com/ |
| Principal flows | Professional distributor locator, contractor referral, product research, learning | https://www.rainbird.com/landscape/find-rain-bird-distributor |
| Separate retail flow | US online store at store.rainbird.com | https://store.rainbird.com/about-rain-bird-store |
| Product breadth | Controllers, sprinklers, valves, drip and golf/agricultural hardware | https://www.rainbird.com/agriculture ; https://www.rainbird.com/golf |
| Geography | Global corporate presence; US online store shipping stated by company | https://store.rainbird.com/about-rain-bird-store |
| Languages | Public English pages, Spanish and zh-hans routes; translation completeness UNKNOWN | https://www.rainbird.com/zh-hans ; https://www.rainbird.com/es/controller-connectivity |
| CMS/stack | UNKNOWN. Third-party detection hypotheses require original HTML/source/runtime verification; do not assume WordPress | Unverified |
| GA4/GSC/Ads/Semrush/CRM | NOT_CONNECTED. No property or account verified | Access not authorized |
| Old/new website relation | UNKNOWN. Main site and official online store coexist, but this does **not** imply an old→new migration | No migration information obtained |
| Local/Dev/AGENTS | UNKNOWN / absent from authorized materials; no usable site repo | No authorization |

## Business-specific Skill decisions
- S1: no numeric traffic or sales analysis. Propose separate research by Homeowners / Professionals / Golf / Agriculture and by product families. Any hypothetical keyword cluster is a **research hypothesis**, not real GSC performance.
- S2-A/B/C: **BLOCKED for real implementation** until a legitimate owned project repository and authorized Local/Dev exist. Do not copy Rain Bird visual assets or code as a default.
- S3: split distributor-search actions, contractor referrals, training/resource consumption and store orders. Outbound store clicks are **not** purchase conversions. Cross-domain tracking/CRM reconciliation requires actual authorization.
- S4: segment technical catalog, installation/how-to, product and industry solution intent; don't infer Rain Bird SEO performance from navigation alone.
- S5: benchmark content information architecture only, no automatic copying or 301 without ownership and legal rights.
- S6: topic plan may be researched; publication, account access and automation are disallowed.

## S0 execution
Evidence: `pilots/rainbird/public-evidence.json`, built from public URLs above.
CLI:
```bash
node --test tests/*.test.mjs
node src/site-skill-factory.mjs --domain rainbird.com --project-root . --evidence pilots/rainbird/public-evidence.json --output-root /tmp/rainbird-s0-output --write
node src/site-skill-factory.mjs --domain rainbird.com --project-root . --evidence pilots/rainbird/public-evidence.json --output-root /tmp/rainbird-s0-output
```
Expected: 12 generated files (8 distinct Skills + profile + approvals + roadmap + evidence index), then an idempotent dry-run all `UNCHANGED`. The PR workflow creates a downloadable **temporary Actions artifact**; never commits a third party's site-specific material as a real owned project.

## Acceptance
- Public fact source tracing: PASS when links inspected; no assumption of analytics validity.
- S0 generated document and protective rules: TESTED in CI, record only exact run result.
- S1 live data / S2 Windows Local / Dev / WWW / S3 events: OPEN and BLOCKED, no fake PASS.
- Production writes / PR merge: no authorization given.
- MVP limitation: human-assisted public-source evidence intake, **not autonomous external site crawling or authenticated account discovery**.

## Next R&D target
Factory should support automatic read-only evidence adapters with source-confidence levels, separate corporate vs store domains and explainable per-market conversion models. An owned example project remains necessary to test genuine AGENTS.md precedence and live Local/Dev UAT.
