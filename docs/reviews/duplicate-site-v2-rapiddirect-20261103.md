# Duplicate Site Skills V2 — RapidDirect Owner Review

Date: 2026-11-03
Repository: beyourlovercom/skills-webdev
Branch: feat/duplicate-site-v2-siteone-pwc-20261103
Type: Draft PR, isolated feature branch; V1 main and PR #15 unchanged.

## Owner-approved factual scope

Owner states they created rapiddirect.com and hold all necessary content and asset use rights for this pilot. This is a recorded project attestation (not independent legal verification). Current request is **first review the Skill V2**, not run a public clone or replace rapiddirectly.com. The test source is https://www.rapiddirect.com/ and the local destination is an isolated Windows Local directory.

## Architecture for review

1. SiteOne = bounded URL/page/asset local offline capture, reports; no backend clone.
2. Perfect Web Clone = deterministic per-page evidence and scoring through pwc, paired with an AI coding agent to build and repair a full-page Vite/React implementation.
3. Existing PR #15 = visual-first module gating, Owner PASS then same-template batch, full non-Blog scope/48-hour throughput accounting; keep Draft until separately approved. The V2 branch DOES NOT claim PR #15 is merged.
4. Existing V1 = Dev/WWW/SEO release and rollback control.

## Controlled pilot (sample-only, not whole-site)

| Class | Source | Scope |
|---|---|---|
| Shell | https://www.rapiddirect.com/ | Home/Header/Footer |
| Category | https://www.rapiddirect.com/services/ | Services index / first page |
| Service detail | https://www.rapiddirect.com/services/cnc-machining/ | One representative |
| Same-template subsequent | https://www.rapiddirect.com/services/injection-molding/ | **BLOCKED until representative service detail Owner visual PASS** |

Blog/news, account, instant quoting, CAD uploads, checkout, orders, third-party tracking are excluded.

## What is implemented in this PR

- A real dependency-free Node CLI adapter: doctor, plan, capture, extract, score. Only doctor/plan are automatically read-only; capture/extract/score require explicit --execute.
- A safe sample manifest, bounded rate/workers and strictly local output paths, SiteOne offline export and PWC extraction command generation.
- Tests for permission, duplicate and unsafe routes, sample scope, CLI generation, no automatic capture or production writes.
- A written contract for per-section PC/mobile visual verification, Owner module PASS and future batch integration with PR #15.

## Observed evidence (do not inflate status)

- GitHub V1 existing in main: VERIFIED.
- Draft PR #15 existing separately: VERIFIED (open/draft, not merged).
- Windows device: READY. Node v24.18.0, Python 3.12.10 and Git 2.55 installed.
- Three public source page paths verified via website and search; read-only robots and sitemap index also retrieved.
- SiteOne executable on Windows PATH: MISSING; official binary not yet installed by this review PR.
- pwc executable on Windows PATH: MISSING; official Python package/Playwright not yet installed by this review PR.
- Actual SiteOne local capture: OPEN.
- Actual PWC full-page build, image/interaction fidelity, desktop/mobile screenshots: OPEN.
- Full-site non-Blog throughput/copy: OPEN.
- GitHub main, Dev, WWW, indexing and real source data modifications: NONE.

## Pilot acceptance required before full rollout

- Capture representative pages and exact authorized assets; verify filenames/link rewrites and source hashes.
- PWC build representative page modules, no missing page sections or inert critical interactions; verify browser at desktop 1440px/mobile 375px.
- Human Owner explicitly approves each module's visual comparison before batch.
- Only then implement/execute full non-Blog URL census, measured throughput, same-template batching (using PR #15 once approved) and local offline QA.
- Actual public quote/payment/account functionality remains outside static clone scope, needing separate backend project.

## Review decision

**Pending Owner visual/architecture review**. This PR may be approved to install the two official upstream tools and run the three-page Windows Local canary; it must not be interpreted as approval to merge main or deploy any website.

Suggested review response: “pass V2 architecture, authorize Windows Local three-page canary only. No main merge, Dev or WWW.”
