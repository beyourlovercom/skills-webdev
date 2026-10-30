---
name: site-dev-uat
description: Hosted Dev full-fidelity UAT. S2-B for evidence-driven multi-site web development; project-specific Skills and AGENTS.md take priority.
---

# S2-B — Hosted Dev full-fidelity UAT

**Scope:** Shared, public workflow. Verify live project facts first; generated site-specific `skills/site-dev-uat/SKILL.md` in the destination project's repo takes priority. No credential, real customer data or private commercial report belongs here.

## Input
Exact Local PASS commit, complete list of deltas, authorized Dev site and rollback method.

## Procedure
1. Verify Dev credentials/access and isolated data; use approved deployment steps; capture before-state and hash.
2. Real Dev browser tests across desktop/mobile, performance, SEO title/schema/canonical, noindex/Coming Soon isolation, plugins and currency, forms or Woo variations/cart/checkout and payment test mode where authorized.
3. Validate hooks, indexes, environment differences, callback/webhook side effects and QA fixture cleanup. Do not change real customer data or assume a Dev pass guarantees production behavior.
4. Record per-test PASS/FAIL/OPEN, screenshot/log paths, exact tested SHA, deploy delta, rollback artifacts and blockers.

## Gate
Critical Dev UAT PASS and protected index state preserved; unresolved FAIL blocks Production proposal. Dev is never a place to silently enable live Ads or payment activity.

## Acceptance record
Always report host/device, evidence references, exact Git SHA, executed tests and PASS/FAIL/OPEN, approval state, no-production effects and next bounded action. Never confuse this Markdown document with an executable integration.
