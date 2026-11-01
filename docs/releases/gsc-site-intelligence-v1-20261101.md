# gsc-site-intelligence S1 — Owner-approved V1 release

- Release date: 2026-11-01
- Source PR: https://github.com/beyourlovercom/skills-webdev/pull/6
- Owner-approved scope: merge read-only GSC Skill to main and switch public Registry/README status to IN_MAIN.
- PR candidate head: `f2f57a6251c0e7fd599c3df9992564ed7e0e1a8c`
- Skill merge (squash) SHA: `947b99d501d8eb459cc4d2047aeb542cfcf6b8aa`
- Canonical Skill: `skills/gsc-site-intelligence/SKILL.md`
- Registered state: `IN_MAIN`, `source_ref=main`, `pr=null`
- Other published Skills remain `rapid-webdev` and `duplicate-site-skills`; GA4/S0–S6 Draft PR states are unchanged.

## Validated capability
Three distinct, bounded evidence modes: existing Owner-authorized Chrome Search Console UI (no repeated OAuth/login), authorized read-only GSC API, and already-existing GSC Web CSV exports. Provenance, page-domain ownership, filter scope, indexing UI and annual coverage are independently labeled. The YBY example used existing authenticated China Mac UI and separate private snapshots; **no raw GSC evidence, token or personal data has been committed to this public repository**.

## Verification & boundaries
Pre-release code review (Codex) and local full suite; exact PR candidate GSC CI and Registry CI both passed:
- https://github.com/beyourlovercom/skills-webdev/actions/runs/41172837284
- https://github.com/beyourlovercom/skills-webdev/actions/runs/41172837123

A fresh post-release readback and Registry CI check against `main` is required; do not infer successful post-release verification from pre-release CI alone.

This release does **not** authorize GSC Sitemap submissions, search property changes, indexing validation clicks, WordPress/WWW changes, ERP historical GSC repair or PR #132, or Google token changes. Browser UI read UAT can pass while full annual analysis remains `OPEN_NOT_PROVEN`.

## Rollback
If the release has a repository-level regression: preserve the exact merge and release commit SHAs; create a controlled revert PR on current `main` for the Skill merge and registry-release commit, review unrelated main changes before reversion, obtain release-gate approval, and verify restored README/Registry/tests and CI. Never force-push `main`, delete private evidence or revert another approved Skill as collateral.
