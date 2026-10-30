---
name: analytics-live
description: Production analytics and qualified conversion. S3 for evidence-driven multi-site web development; project-specific Skills and AGENTS.md take priority.
---

# S3 — Production analytics and qualified conversion

**Scope:** Shared, public workflow. Verify live project facts first; generated site-specific `skills/analytics-live/SKILL.md` in the destination project's repo takes priority. No credential, real customer data or private commercial report belongs here.

## Input
Approved live site, actual GTM/GA4/GSC/Ads access, consent/legal state, event dictionary, Woo orders or qualified lead facts.

## Procedure
1. Assess existing tags and event duplicates on WWW without writing; separate GA4/GTM/GSC property identities for this site, not old brand aliases.
2. Define ecommerce purchase/order ID/currency/amount/refund events for commerce; define validated qualified_lead and spam exclusion for B2B. Ensure idempotency and Ads conversion attribution rules.
3. Install or alter tags on production only with the relevant explicit approval; if code/theme/plugin edits needed, return to S2 Local→Dev→WWW.
4. Verify real WWW collection and reconcile to permitted aggregated business evidence; Dev tests must not count as real sales/leads.

## Gate
A documented event contract, duplicates checked, conversions cross-validated. No false claim of available data or live events.

## Acceptance record
Always report host/device, evidence references, exact Git SHA, executed tests and PASS/FAIL/OPEN, approval state, no-production effects and next bounded action. Never confuse this Markdown document with an executable integration.
