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

## Real execution addendum — 2026-11-03 Windows Local

All numbers below come from BYL DC on the authorized Windows device; they are not sample/illustrative.

- Isolated project root: C:\\ai\\site-mirror\\rapiddirect-v2. No Dev, WWW, GitHub main, customer, quote backend, or live payment changes.
- Installed: SiteOne Crawler v2.5.1.20260627 from official Windows release (ZIP SHA256 `6B6758DAA866DF99D9BD7A020B51EAECA2D5F52F3172EC5270F9F96B964C16DB`); PWC v3.0.0 isolated Python venv; pinned official Playwright 1.61.0 with existing Chromium 1228 (browser version 149.0.7827.55). Chrome was not restarted.
- All 3 source URLs returned HTTP 200: /, /services/, /services/cnc-machining/.
- SiteOne command from V2 adapter completed with exit=0. Initial mirror had 286 files, 90 images, 17.88 MiB, 5 HTML files representing 3 distinct routes (redirect/index aliases). HTML report and JSON report stored privately under project root. The SiteOne log includes 33 404 lines, requiring a residual review.
- A true localhost preview served all 3 routes with HTTP 200 on 127.0.0.1:8765. Playwright exercised desktop 1440 and mobile 375 widths with external network requests blocked. Screenshots and a machine-readable UAT log were saved under `uat/`; the source originals remain private (not in this public repository).
- **Pre-media-completion PWC SSIM scores** (required 0.97) all failed: home desktop 0.6057, mobile 0.2911; services desktop 0.4916, mobile 0.2549; CNC desktop 0.5006, mobile 0.5999. There were missing images and material viewport height differences, especially mobile. A successful SiteOne export alone is NOT VISUAL PASS.
- Offline absolute-asset fix: 417 same-origin /wp-content/ references rewritten in 3 HTML files, with original backups. This reduced CNC desktop local height from 19,193px to 14,566px vs source 14,759px, but still left missing local assets.
- Media gap detector discovered 278 missing URL-referenced same-origin /wp-content/ assets from 469 unique candidates. Bounded downloader stage is separate; its result must be read from private `media-completion-report.json` before declaring final coverage.
- Initial PWC extraction hit `AssetInfo.url=None` in inline scripts. A backed-up, exact-source local fix filtered only missing download URLs; no whole-site claim followed.
- All three PWC initial live extracts then reported `capture_integrity_failed` due duplicate Elementor/heading semantic fingerprints. Inspection of captured raw and normalized structures proved the original last-wins dictionary mismatched duplicate regions. A backed-up local matching patch now pairs same-fingerprint occurrences in DOM order **without changing thresholds**. Reassessment of the saved real homepage capture returned `passed`, zero issues. This is a structural-gate regression result, NOT a new successful live extract.
- An attempted fresh PWC live extract later encountered `net::ERR_CONNECTION_CLOSED`. No bot-block bypass or concurrency escalation was authorized. Actual complete PWC Agent author/build/visual acceptance remains **OPEN**.
- V2 scripted unit test baseline expanded to 13/13 PASS for asset plan/localizer/PWC null compatibility and existing pilot safety gates; new duplicate-fingerprint patch also has its own tests. These are **unit tests only**, not browser PASS.

### Owner gate at this point

| Gate | Evidence status |
|---|---|
| Tool installation and isolated CLI | PASS |
| 3-route SiteOne export | PASS, with missing assets |
| 3-route localhost HTTP and browser screenshots | PASS for routing/screenshots only |
| Full offline asset integrity | FAIL/OPEN |
| PWC live extraction integrity | FAIL/OPEN (offline structural recheck now passes) |
| PWC AI authored React clone / interactions | NOT RUN |
| Desktop/mobile visual threshold 0.97 | FAIL (0/6) |
| Owner per-module visual PASS | PENDING |
| Full site/non-Blog batch | BLOCKED |
| GitHub main, Dev, WWW | BLOCKED |

**No recommendation to merge PR #16 or PR #15 yet.** First close the real offline image/style asset failures, then obtain honest PWC capture/build evidence and submit real screenshot pairs for Owner visual review.

## Final media-completion + offline visual readback (same Canary, no expanded scope)

- Missing-asset plan: 278 absent candidates / 469 unique referenced assets. Bounded same-origin completion finished with **277 downloads, 1 HTTP 404**, no remaining work under the 300-request cap. The single unavailable asset was `/wp-content/plugins/ultimate-elementor/assets/lib/particles/particles.min.js`; no bypass attempted.
- Final Windows mirror: **563 files, 38.03 MiB**, including SiteOne's original 286 files, plus 277 explicitly downloaded missing files; source assets are stored only in the private Windows project.
- After network-blocked local Playwright rerun, all 3 routes still HTTP 200 at desktop 1440 and mobile 375. Final local heights closely match source: home 10526/10526 (desktop) and 16347 vs 16294 (mobile); services 4108/4108 and 9682 vs 9602; CNC 14761 vs 14759 and 17453 vs 17451.
- Broken image comparisons (source → local, browser inspector includes original lazy images): home desktop 12→13, home mobile 13→14; services desktop/mobile 9→10; CNC desktop 15→16, mobile 13→14. This is much improved, but **not zero** and one source-side resource remains unavailable.
- **Final PWC screenshot SSIM** (threshold 0.97): home desktop **0.9068 FAIL**, mobile **0.5689 FAIL**; services desktop **0.9502 FAIL**, mobile **0.6659 FAIL**; CNC desktop **0.9750 automated PASS**, mobile **0.8670 FAIL**. **Visual gate overall: 1/6 automated PASS, Owner visual acceptance 0/3 modules.**
- PWC's duplicated-fingerprint algorithm was corrected locally with the original file preserved and a pinned-SHA reversible script in the V2 branch. Strict offline re-evaluation of **all 3 saved real source attempts** produced **3/3 structural capture integrity PASS, zero issues**. This does *not* assert successful new live PWC capture or completion of React authoring.
- A fresh PWC live capture encountered `net::ERR_CONNECTION_CLOSED` and was not retried aggressively. Static localhost mirror UAT and offline PWC source integrity tests are separate from live PWC capture/plan/assemble/build.
- Owner can inspect private screenshot pairs under `C:\\ai\\site-mirror\\rapiddirect-v2\\uat`, `visual-uat.json`, and `pwc-scores-after-media.json`. SiteOne reports and media SHA receipts stay under the same local root.
- Result: **LOCAL_MIRROR_3_ROUTES_READY_FOR_VISUAL_REPAIR**; PWC complete agent clone **OPEN**; Mobile visual fidelity **FAIL**; Owner template acceptance **PENDING**; same-template batch and full non-Blog mode **BLOCKED**.

Do not confuse a pixel score threshold crossing for one desktop page with owner approval or full 3-page visual fidelity. The next bounded repairs must target mobile styles/widgets and the one missing resource, then rerun desktop/mobile comparison without altering accepted frozen sections.
