---
name: duplicate-site-skills-v2-review
description: Owner-review candidate: local website mirror and visual-fidelity workflow using SiteOne Crawler and Perfect Web Clone. Not installed or merged.
---

# Duplicate Site Skills V2 — Owner Review (2026-11-03)

**State: DRAFT / NOT OWNER ACCEPTED.** Existing V1 and PR #15 V1.2 remain unchanged.

## Tool integration
- SiteOne Crawler (MIT): https://github.com/janreges/siteone-crawler — authoritative capture and offline export with URL list, single-page mode, export directory, URL rewriting, bounded rate and workers.
- Perfect Web Clone (MIT): https://github.com/ericshang98/Perfect-Web-Clone and its Agent Skill https://github.com/ericshang98/perfect-web-clone-skill — capture, structure planning, section-by-section AI coding, build, screenshots, scoring, targeted repair. Its pwc CLI is NOT a standalone website-to-source generator; the agent must author and repair the page.
- V1 D0–D8 still owns source rights, controlled Local→Dev→WWW release, SEO and leads.
- Existing draft PR #15 owns the 48-hour sample → Owner Visual PASS → same-type batch → next-module gates. Do not reimplement or silently merge it.

## Gates and handoff

| Stage | Work | Evidence | Gate |
|---|---|---|---|
| V2-0 | Rights/source class | Owner attestation / isolated project | NO source capture if absent |
| V2-1 | Route taxonomy | Sitemap, normalized URL inventory | Unique denominator required |
| V2-2 | Static capture | SiteOne files, report and asset hashes | CAPTURE_PASS |
| V2-3 | Representative mirror-first replica | SiteOne offline HTML/CSS/JS is authoritative; invoke PWC Agent repair only for confirmed visual/interaction bugs | Offline structure and interactions; no forced React rewrite |
| V2-4 | Visual fidelity | Playwright desktop 1440 / mobile 375; pwc scoring | Owner visual PASS separately |
| V2-5 | Same-template batch | PR #15 flow after approval | Frozen SHA + Owner module PASS |
| V2-6 | Other modules and offline | Routes/asset integrity, no network dependencies | Local-only PASS |
| V2-7 | Dev / WWW | Existing V1 process | Not authorized by this PR |

## Non-negotiable safeguards

1. Only dry-run by default. Explicit --execute is required for local capture/extract/score. Never auto-run on GitHub CI.
2. This V2 script supports **PILOT_SAMPLES only**. Full-site non-Blog mirror is a future gate, NOT implemented or already completed. The approved V1.2 scope definitions must be reused after PR #15 is reviewed.
3. No credentials, personal/customer data, original site assets, HTML snapshots, browser sessions or private rights paperwork in this public repository.
4. No copying remote checkout, upload/CAD, payment, login or actual quote backend interactions into the local mirror. These need separately tested local substitutes and never point to production side effects.
5. Respect robots rules and site capacity. The prototype pilot uses at most 2 workers and 3 requests/second; excludes Blog, post, docs, admin, search, checkout and cart.
6. SiteOne offline page presence is not pixel-perfect. pwc extract is not a finished React site. Score is not human approval. Browser tests require real evidence.
7. Windows Local through authorized BYL DC. Do not restart READY devices or existing browser sessions. Different source/target domains stay distinct.
8. No main merge, Dev publish, WWW, search indexing or real customer operations before their separate Owner approval.

## Pilot: RapidDirect

Source: https://www.rapiddirect.com/ — Owner attested rights in conversation on 2026-11-03. Target: isolated Windows Local only (not a public website). Bounded pilot pages: home, services index, one CNC service detail. Injection molding and other pages remain blocked pending module Owner visual PASS. No Blog.

The actual commands below require Windows Node 20+:

    node skills/duplicate-site-skills/v2/scripts/clone-v2.mjs doctor
    node skills/duplicate-site-skills/v2/scripts/clone-v2.mjs plan --manifest=skills/duplicate-site-skills/v2/templates/rapiddirect.pilot.example.json --workspace=C:/ai/site-mirror/rapiddirect-v2

To start a real source pilot **after Owner review** and official SiteOne/pwc installation:

    node skills/duplicate-site-skills/v2/scripts/clone-v2.mjs capture --manifest=skills/duplicate-site-skills/v2/templates/rapiddirect.pilot.example.json --workspace=C:/ai/site-mirror/rapiddirect-v2 --execute
    node skills/duplicate-site-skills/v2/scripts/clone-v2.mjs extract --manifest=skills/duplicate-site-skills/v2/templates/rapiddirect.pilot.example.json --workspace=C:/ai/site-mirror/rapiddirect-v2 --id=home --execute

Then inspect the SiteOne local page directly. Use PWC planning/authoring/build/scoring/repair only if real visual/interaction issues remain; no forced per-page React conversion. Freeze the representative template only after Owner visual PASS, and use PR #15's existing queue/gates for same-type batch rather than writing another batch engine. All untested gates remain OPEN.

See references/integration-contract.md, templates/rapiddirect.pilot.example.json, and tests/duplicate-site-v2.test.mjs.

## V2 Canary-informed compatibility layers (all isolated and reversible)

Actual Windows RapidDirect 3-page canary found two upstream PWC v3.0.0 defects and SiteOne offline asset gaps. The following executable helpers are provided **only for audited local copies**, not as a claim of full site fidelity:

- scripts/pwc-null-assets-compat.mjs — pinned-SHA source patch for PWC's null script URL AssetInfo error; only fixes a real empty resource URL, with original backup.
- scripts/pwc-duplicate-fingerprint-compat.mjs — pinned-SHA source patch: pairs duplicate semantic fingerprints in DOM order rather than last-wins; does not change critical collapse threshold. Saved real homepage pre/post structure was rechecked and returned PASS (0 issues).
- scripts/localize-siteone-assets.mjs — rewrites same-origin /wp-content/ absolute references in *already captured* HTML/CSS to local paths. Default dry-run; --apply saves original files to pre-localize outside the mirror.
- scripts/complete-offline-media.mjs — discovers locally missing, actually referenced same-origin /wp-content/ resources, with a bounded no-bulk trial and max 2 requests/second; default dry-run. --execute downloads missing files and writes SHA receipts.

All compatibility files are standalone and must be invoked explicitly with the project's pilot manifest and isolated workspace. Do not auto-apply a PWC patch to unknown upstream SHA or relax capture integrity to force a PASS. Report any HTTP 404, non-working offline link, missing image, or screen-score failure as FAIL/OPEN.

**UAT evidence:** docs/reviews/duplicate-site-v2-rapiddirect-20261103.md. Pilot SiteOne capture ran successfully for 3 routes; actual PC/mobile visual scores were below the upstream 0.97 gate, and the initial PWC live extracts failed before a complete React author/build could occur. Retest after repairs before claiming usable clone.

## V2-R1–R5 controlled review path (2026-11-03)

On the **existing** Windows Local 3-page PWC React/Vite sandbox, use the reusable bridge template and preview guard. These operations do not create or copy new source-site routes:

    node skills/duplicate-site-skills/v2/scripts/prepare-owner-preview.mjs --workspace=C:/ai/site-mirror/rapiddirect-v2 --manifest=skills/duplicate-site-skills/v2/templates/rapiddirect.pilot.example.json

Only after inspecting the dry-run, apply bounded **local** files with `--execute`, then run `npm.cmd run build` in `pwc-build/review-app`. A failed build is a hard stop. The template uses an iframe sandbox without `allow-top-navigation`, `allow-forms` or `allow-popups`; do not weaken these permissions.

Run actual Playwright verification with the isolated Python venv:

    python skills/duplicate-site-skills/v2/scripts/interaction-canary.py --workspace C:/ai/site-mirror/rapiddirect-v2
    python skills/duplicate-site-skills/v2/scripts/visual-canary.py --workspace C:/ai/site-mirror/rapiddirect-v2

Visual replay is local-only by default; it reads the public source only with explicit `--allow-live-read` and blocks non-GET or off-domain requests. The interaction gate checks three routes, menu/FAQ, content link navigation, quote/form blocking, actual snapshot CSP read-back and **true inner iframe viewport size**.

**Visual UAT modes:** the review navigation now offers `真实视口模式` (1:1, inner iframe `100dvh`; independent scroll) and `整页模式` (expanded height for overview). The latter can alter `window.innerHeight` and create artificial `vh`/lazy-load differences, so always include the true viewport evidence before judging fidelity. Do not fabricate a high score by cropping or hiding content.

**Actual last checked state:** Windows local Node 21/21, Python original 4/4, registry 16, Vite build PASS, latest browser interactions 12/12, true viewport 6/6, screenshot capture 6/6. Matched mirror↔PWC SSIM passed 3/6; homepage desktop/mobile and CNC desktop remain OPEN. Assets 563 files, 38.03 MiB with one known source 404. The React layer is a **static-mirror bridge**, NOT an independently authored full site.

See [the detailed final Canary roadmap](../../../docs/reviews/duplicate-site-v2-rapiddirect-final-roadmap-20261103.md) (repository-root location `docs/reviews/duplicate-site-v2-rapiddirect-final-roadmap-20261103.md`). Owner must approve outstanding visual differences before same-template batch. PR #15 and PR #16 remain Draft; no main merge or Dev/WWW release from these steps.

## Owner 冻结原则：模板只开发一次

**2026-11-03 已由 Owner 明确冻结：一个模板研发一次，同类页面全部自动复用。只有发现新的视觉或交互问题，才重新进入模板研发。**

这是 V2 后续开发的强制设计约束。默认以 SiteOne 的静态镜像为主、PWC 按需修复；**不得强制每个同类 URL 重新规划、编码或转换成 React**。

操作顺序：**按页面结构分组 → 每类 1 个代表页 → Owner PC/移动视觉 PASS → 冻结模板哈希与数据映射 → 同类页面仅批量替换数据/资源 → 自动 QA 与断点续跑 → 只有新视觉/交互 Bug 才重新打开对应模板研发**。资源缺失、404 和数据错误先局部纠正，不重开全部模板。

模板冻结不跳过安全、内容授权、交易操作或正式发布审批；缺少 Owner 模板 PASS 时一律 `BLOCKED_BATCH`。对应完整状态、异常类型和效率验收合同：[`references/template-reuse-frozen-policy.md`](references/template-reuse-frozen-policy.md)。

**特别注意：** 这是已确认的架构与研发原则，**不是**批量复制执行引擎已经完成，也不是 RapidDirect 三页已有最终 Owner 视觉 PASS。当前 PR #15/#16 Draft 状态不变。


## Mirror-first execution priority (Owner-frozen 2026-11-03)

**Rule:** Source → SiteOne local mirror → PC/mobile/interaction UAT → Owner representative template PASS → frozen template SHA and data mapping → reuse PR #15 batch queue → failed-only corrections. Do **not** force SiteOne → PWC React rewrite for every route. V2 React/Vite bridge is a supplemental reviewer, not necessarily the production backup runtime.

Real canary: home mobile latest source-vs-direct-mirror SSIM **0.8997**, moving homepage article cards and source-side 10px overflow; CNC desktop **0.6824**, carousel/video dynamic capture state. The local PWC bridge itself has artificial iframe viewport effects. Neither low score alone confirms underlying template redevelopment is needed. Reopen only for confirmed new visual/interactive template defects, not content churn or unstable screenshots.

**Existing factory:** reuse PR #15 backup-48h-gate.mjs and prepare-module-batch.mjs. PR #15 factory unit tests passed **27/27** on isolated Windows Local; this validates policy and queue planning only, NOT actual bulk page generation. Do not implement a duplicate factory inside PR #16. Private 3-class candidate inventory is at C:/ai/site-mirror/rapiddirect-v2/uat/template-candidates.json, with every class pending module-specific Owner visual PASS and bulk disabled. No new source routes were crawled.


### Mirror-first local read-only safeguard

When SiteOne static HTML is the primary local preview, apply the dedicated three-route guard before anyone clicks source-site links or quote forms. This is defense in depth, distinct from Playwright request interception:

    node skills/duplicate-site-skills/v2/scripts/guard-direct-mirror.mjs --workspace=C:/ai/site-mirror/rapiddirect-v2 --manifest=skills/duplicate-site-skills/v2/templates/rapiddirect.pilot.example.json

Only with existing rights/scope and after reviewing the dry-run, add `--execute`. The command preflights all three existing mirror HTML files, saves originals under `uat/pre-direct-mirror-guard/`, adds local CSP `connect-src 'self'; form-action 'none'`, traps out-of-scope links and form submissions, and does not touch the source or any new URL. Keep browser-level request blocking enabled in automated UAT. The original and post-guard mirror HTML SHA receipts live only in the private candidate ledger.

Verified on Windows Local: 6/6 browser runs (3 sample routes × desktop/mobile) had CSP/form blocking, menu and homepage FAQ checks PASS; zero external requests were attempted under the isolated network guard. Script default is read-only and idempotent. This is not an Owner visual PASS or batch authorization.

## Accepted 3-page visual reference and actual PR #15 handoff (2026-11-03)

Owner replied `pass` immediately after the three representative template visual review request. Treat it as **visual PASS for exactly the displayed home, services index and CNC sample references**. Windows Local privately stores the approved references and SHA256 checksums in `uat/template-candidates.json` / `uat/frozen-reference-artifacts/`. Do **not** automatically upgrade an immutable representative HTML reference to a reusable parameterized template.

Before generating any same-type queue, audit the real PR #15 gate through:

    node skills/duplicate-site-skills/v2/scripts/audit-pr15-handoff.mjs --candidate=C:/ai/site-mirror/rapiddirect-v2/uat/template-candidates.json --factory-root=<absolute-PR15-checkout>

The CLI verifies three approved route-to-template mappings, the immutable on-disk reference SHA for each, and imports **PR #15's existing `backup-48h-gate.mjs`**. It never clones/crawls, writes new pages, or creates a queue. It must currently return `OWNER_REFERENCE_PASS__BATCH_STILL_BLOCKED`, because reusable template data mappings, measured route/media manifests, automatic QA and module-sequencing gates are not fully complete. No fake `template_sha256`, fabricated asset count or auto-trigger of full-site batches is permitted.

Detailed evidence: [`docs/reviews/duplicate-site-v2-owner-pass-pr15-handoff-20261103.md`](../../../docs/reviews/duplicate-site-v2-owner-pass-pr15-handoff-20261103.md). PR #15 and PR #16 remain Draft pending separate exact-head merge authorization.


## Data-only same-template reuse (2026-11-03; existing approved samples)

After Owner approved the three existing RapidDirect representative pages, the V2 mirror-first pilot gained a **read-only field inventory** and scratch-only renderer, without writing to the frozen pages:

- `scripts/template-data-map.py inspect`: requires the exact already-approved local representative path, Owner visual PASS in private ledger, unchanged source SHA-256 and `--scratch-root` under project `uat/`. It inventories text slots and selected meta/image/link attributes by exact offsets, saving mapping only when `--execute` is explicit.
- `scripts/template-data-map.py render`: requires that same SHA and the private mapping + explicit slot updates; escapes new content, rejects unknown fields, rejects external/new routes or unaudited `srcset`, and verifies structural fingerprint before saving **a separate non-overwriting file under project private `uat/` only**. Default dry-run. It cannot edit the source mirror or live site.
- Windows evidence: three representatives yielded **1,935 candidate slots** (522 home / 329 services / 1,084 CNC). **Two synthetic data variations per template, 6/6 structure-preserving outputs, 24 data-field edits, 0 source writes**; three CLI render outputs were byte-identical to corresponding in-memory proofs. Python V2 tests **13/13 PASS**, including rejection of an attempted output under `mirror/`.
- Cross-sample shell audit: same 433-header-node normalized shape across all three real page types (1.00000); footer normalized structural ratio 0.9912–0.99705, not raw HTML identity.

**Do not claim real same-template batch readiness:** those are synthetic inputs on each original page's structure. Cards with different counts, galleries, script-driven content, or another genuine same-template URL still need a tested semantic data adapter, route/asset inventory, browser UAT, and the existing PR #15 Owner/module sequencing gate. PR #15 read-only handoff still returns **BLOCKED 3/3**; the V2 script must never invent a generalized template SHA or bypass this result. Neither source HTML nor private data maps belong in GitHub.

Audit: [`docs/reviews/duplicate-site-v2-data-mapping-smoke-20261103.md`](../../../docs/reviews/duplicate-site-v2-data-mapping-smoke-20261103.md).


## R6 → R9 field reuse and one-real-page validation (2026-11-04)

**Do not expand the framework.** Reuse PR #15's existing queue gate and V2's SiteOne/asset/mapping helpers. The Owner-frozen template-once rule remains authoritative.

- **R6:** `scripts/pr15-queue-to-v2-data.mjs` imports PR #15's **real** `prepare-module-batch.mjs`, checks the existing Owner/frozen-SHA gate, requires an explicit URL allowlist, proven generalized template mapping and local asset SHA read-back, and outputs only into private `uat/` scratch. A synthetic fixture drove a real PR #15 QUEUE_READY item through V2 rendering on Windows with 0 source/production writes. **This is a synthetic integration test, not activation of real batch mode**; current real PR #15 queue remains BLOCKED.
- **R7:** preserve actual SiteOne HTML/variable card cardinalities instead of rewriting them; reuse `complete-offline-media.mjs` to recover missing assets and `scripts/audit-single-page-canary.mjs` for one-page asset/card census, source 404 categorization and failed-only retries. Missing assets must not be silently replaced with fake images or CSS.
- **R8:** one expressly scoped CNC Milling source route was exported with SiteOne `--single-page` at 2 workers/2 requests per second. Header/footer structure is 100% reusable; compared to CNC Machining, body structure is only 14.038% similar, so treat as a **distinct body variant**. Source-preserving single-page mirror succeeds without compulsory React re-authoring.
- **R9:** after rewriting 193 same-origin media references, using previously approved cache, resolving two renamed CSS references and fetching the exact video asset, the genuine source-vs-local full-page PWC SSIM is desktop **0.997946** and mobile **0.999928** (both pass 0.97; masks 0). Controlled browser safe-interaction UAT 2/2 PASS. One unrequested source `particles.min.js` remains HTTP 404; 269/270 referenced static resources locally present. Owner manual visual PASS for this new page remains pending.

Windows-only dashboard: `http://127.0.0.1:8767/_uat/owner-r8-r9-review.html`. Exact audit and boundary conditions: [`docs/reviews/duplicate-site-v2-r6-r9-single-page-canary-20261104.md`](../../../docs/reviews/duplicate-site-v2-r6-r9-single-page-canary-20261104.md). Do not share underlying licensed HTML, screenshots, video or fonts in GitHub. PR #15/#16 Draft; no main merge, WWW/Dev write, Blog crawl or new URL batch.
