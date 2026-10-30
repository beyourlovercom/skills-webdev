---
name: rapid-webdev
description: Use when developing, testing, debugging, or staging an existing WordPress/WooCommerce website using authorized local computers, a GitHub repository, and controlled Dev environments. Suitable for continued implementation, browser QA, catalog/variation validation, and minimal patches. Not a production deployment authorization.
---

# Andy Rapid WebDev — GitHub-first workflow

**Purpose:** complete website development tasks with minimal repeated work, preserving prior accepted results, user approvals, security controls, and independent projects. This is an instruction document, **not** an MCP connection, remote-execution program, installed ChatGPT Skill, or license to act beyond authorized tools.

## Start here

1. Check the project repository, current branch and HEAD, relevant `AGENTS.md`, existing Draft PRs, accepted UAT evidence, and the actual running environment. The project's own rules take priority. Do not trust this generic document to override them.
2. Define the **remaining delta** with concrete acceptance criteria. Do not reimplement previously verified modules. Differentiate source-only tests, local browser testing, Hostinger/Dev testing, and Production approval.
3. Use available **authorized and connected** tools. The user's existing BYL DC MCP controls the selected Windows/Mac only when its device is online and permissions allow it; GitHub connector/CLI handles source changes. Never invent tool calls or claim an operation completed without readback.
4. Prefer the shortest safe route: inspect → minimal patch → local unit tests → local WordPress and browser UAT → GitHub CI → controlled Dev validation. Batch independent read-only checks and minimize repeated logins or deployments.
5. Continue approved scope without unnecessary approval requests. Stop before unrelated writes, destructive data operations, Production changes, public publication, unexpected costs, or security-restricted operations that require separate consent.

## Local WordPress / WooCommerce

- Isolate each project under its own Local site, ports, database and test data. Never disrupt another existing site, service or READY device.
- Inspect PHP, database, WordPress, WooCommerce, active theme, required plugins and permalink settings; record mismatches with Dev instead of silently changing an unrelated environment.
- WooCommerce owns product IDs/SKUs, variations, prices, taxes, stock, attributes and routes. Avoid duplicate data models. Resolve fixtures by stable SKU + batch marker rather than assuming numeric product IDs match across environments.
- Use synthetic QA-only products with Draft/Hidden status. No unauthorized source images, real customer/order/payment data or competitor code/assets.
- Preserve Coming Soon/noindex on protected Dev sites unless an exact approved UAT plan authorizes a temporary change and restoration.

## Browser QA

- Use an available approved browser automation runner (e.g. Playwright) when it is already installed and authorized on the selected device. Do not claim that this Skill bundles Playwright or can bypass login restrictions.
- Exercise desktop and mobile widths, shop/category links, material filters, invalid values, product detail/variant prices, pagination when actual fixtures support it, anonymous Draft access, and basic accessibility.
- Record exact test commands, environment, screenshot path, expected/actual outcomes, and failures. Keep screenshots locally unless explicitly approved for publication.
- Distinguish DOM tests, actual browser-rendered screenshots, human visual signoff, and live Dev results. One kind of PASS does not prove the others.
- When authentication is absent, request legitimate sign-in in the selected browser; never extract passwords, cookies, OAuth tokens or secrets.

## GitHub / Dev gate

- GitHub/runtime are the source of truth. Use minimal diffs, relevant unit tests, `git diff --check`, and GitHub CI before attempting Dev deployment.
- Confirm exact target host, branch/commit, file hashes, scope, protected settings and rollback feasibility. Dev deployment requires applicable project authorization. Validate the actual Dev result by independent readback.
- Preserve Draft PRs until explicitly approved for merge. Do not publish products, alter DNS, change payment gateways, issue refunds, or update Production unless separately authorized.
- Never bypass any tool safety checker, consent requirement, rate limit, authentication, or third-party anti-bot protection.

## Handoff / acceptance record

Report: project; host/device; exact commit; changed files and operations; fixtures; tests actually run with counts; PASS/FAIL; browser/screenshots if genuine; database/production effects; remaining blockers; PR Draft/merge status; and next bounded action. Mark untested items **OPEN**, not PASS.

## Invocation from ChatGPT web

This repository is **ordinary GitHub source**, not a native installed Skill. At the beginning of the task, ask ChatGPT:

> Read `beyourlovercom/andy-webdev-skills/skills/rapid-webdev/SKILL.md` from GitHub. Then inspect this project's `AGENTS.md` and latest Draft PR. Use the already-connected BYL DC to work on China Windows Local WordPress, run authorized tests and report exact results. Do not merge or modify Production without separate approval.

Keep this file generic. Project-specific domain names, device selections, release gates, and overrides belong in each project's repository.
