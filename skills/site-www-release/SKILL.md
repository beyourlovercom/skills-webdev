---
name: site-www-release
description: Owner-authorized production delta only. S2-C for evidence-driven multi-site web development; project-specific Skills and AGENTS.md take priority.
---

# S2-C — Owner-authorized production delta only

**Scope:** Shared, public workflow. Verify live project facts first; generated site-specific `skills/site-www-release/SKILL.md` in the destination project's repo takes priority. No credential, real customer data or private commercial report belongs here.

## Input
Dev UAT PASS and exact SHA, precise diff/migration list, rollback package, target WWW runtime readback, Owner's **independent** pass.

## Procedure
1. Prepare immutable before/after delta plan covering templates/plugins/config/content/media, DB schema, URLs, caches, tracking and orders. Do not move whole Dev DB onto WWW.
2. Explicitly request separate Owner approval for PR merge and WWW deploy. Check any concurrent branch updates before executing. Without approval stop at release-ready draft.
3. If approved, apply **only** tested differences; preserve WWW customers, orders, inventory, payments and editorial changes. Keep recoverable backups, rollback command and failure threshold.
4. Verify production UX, index/canonicals, business transactions/lead submission and payment configuration via non-destructive real readback.
5. For migration, audit 301/URL map; for parallel sites no automatic 301 or syndicated duplicate pages.

## Gate
No production write or PR merge without Owner pass. A deployment is not PASS until WWW readback matches the approved delta and rollback is available.

## Acceptance record
Always report host/device, evidence references, exact Git SHA, executed tests and PASS/FAIL/OPEN, approval state, no-production effects and next bounded action. Never confuse this Markdown document with an executable integration.
