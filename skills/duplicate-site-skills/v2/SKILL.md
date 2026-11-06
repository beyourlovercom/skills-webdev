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

## R4-A / R4-D complete-route inventory and source-drift rules

1. R4-D route denominator means **unique browser-resolvable URLs**, not WordPress database page-row count. Dedupe historical duplicate slugs by read-only canonical URL / browser body evidence; preserve shadow/legacy records for Owner disposition. For commerce replicas in first-page-only mode, the denominator includes in-scope non-Blog pages, first listing/category pages, and only the explicitly approved representative product detail routes. Record empty public categories separately.
2. **HTTP 200 is a transport check, not content or visual PASS.** Before moving a template class to batch, use browser DOM to verify main content, visible H1, safe essential interactions, PC/mobile rendering and asset dependencies. Do not treat raw HTML-parser H1 counts as authoritative: template/noscript content can cause false-positive multiple H1. If a page has valid stored content but renders blank, fix the Local runtime minimally and repeat fail-only UAT. No SiteGround writes without separate authorization.
3. Treat dynamic campaigns, carousel states and source-vs-local timestamps as evidence: distinguish **published replica-versus-Local restoration parity** from **current original reference-versus-Local visual fidelity**. A high restoration score cannot substitute for original source >=0.97; changing promotional banners or claiming discounts must not be automatic without merchant/Owner approval.
4. Dynamic cart, checkout and account pages require their own **safe functional states**; GET empty cart or a visible login form does not prove non-empty checkout/payment/login work. Never submit real orders or payments as a side effect of a visual gate. A default Sample Page and empty categories need explicit Owner inclusion/exclusion decisions, not silent deletion.
5. The genuine PR #15 Owner source/representative approval and template SHA gate remains mandatory. Keep final CSS/JS bundling **blocked** until the complete accepted route inventory, semantic checks, source fidelity/approved exceptions, and all-site PC/mobile UAT close. The full one-batch final packaging happens only afterward.

Sanitized WordPress Local findings: [R4-A/D scope and visual audit](../../../../docs/reviews/duplicate-site-v2-wordpress-r4a-r4d-scope-audit-20261106.md). Private route data/screenshots remain on the authorized Windows computer.

## Mandatory final-only CSS/JS packaging — all Local sites

**Owner-frozen rule (2026-11-06): do not repeatedly compress/merge CSS or JS while building each page.** Keep editable source modules and complete the in-scope website, template data, content, links, PC/mobile interactions and Owner representative visual approvals first. Scratch builds for QA are allowed but never count as final packaging.

Only after the **entire approved non-Blog route inventory** is reconciled and the final site is accepted, run **one coordinated site-level CSS/JS build**, freeze source SHA, minify, hash outputs, generate a manifest and receipt, and perform a rollbackable browser Canary. Avoid blindly concatenating independent modules: preserve dependencies and page-specific lazy loading. Bug fixes after the final build require rebuilding all affected assets in a new release, not editing compressed files.

If completion, original reference fidelity (target 0.97 unless an explicit Owner exception), page semantic/content QA, resource checks, or final Owner approval is missing, stop with **BLOCKED_FINAL_BATCH**; never infer Owner PASS from HTTP 200 or a 10/10 smoke test. Do not swap final assets into a running Local site, Dev, WWW or Production without a separate deployment approval.

See [final-only CSS/JS lifecycle](references/final-asset-lifecycle.md) and the read-only WordPress implementation [wp-final-package-gate.py](scripts/wp-final-package-gate.py). This gate is platform-agnostic as a policy, even when the implementation uses another bundler.

## Optional WordPress Local R2–R4 adapter (Draft PR #17)

For an existing **authorized, isolated WordPress Local** copy, after the basic V2 representative inspection, use the optional tools below rather than creating another per-URL renderer:

- **R2** `scripts/wp-template-data-contract.py`: read-only local GET / PHP-template SHA / per-route data contract; explicitly `owner_visual_pass=false` and `allow_batch=false`.
- **R3** `scripts/wp-final-build.py`: installed offline esbuild only; final-stage CSS/JS scratch compilation, font URL rebasing, content-hashed dist manifest and repeatable source/dist SHA verification. Never writes to a running theme.
- **R4** `scripts/wp-r4-browser-uat.py`: real PC/mobile local browser smoke, safe toggle interactions and requests blocked outside the approved .local host; `scripts/wp-r4-pr15-handoff.mjs` imports the **actual PR #15** `prepare-module-batch.mjs` gate. Missing source rights, per-module Owner visual PASS, frozen template SHA or validated asset manifest means **BLOCKED_BATCH**, even if synthetic fixture checks PASS.

Follow [WordPress Local R2–R4](references/wordpress-local-r2-r4.md). This adapter is optional; existing SiteOne / PWC RapidDirect workflows and current R15–R16 work remain unchanged. `HTTP 200`, syntax tests and screenshots of a restored local site do **not** establish source-fidelity `>=0.97`, complete interactions, rights, or publication approval. No main / Dev / WWW changes are authorized by this Draft.

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

## R10 second CNC service single-page performance and reusable blocks (2026-11-04)

Continued **only the frozen template-once rule**. Windows Local SiteOne `--single-page` copied one more scoped source page `/services/cnc-turning/` in a **16.66 s SiteOne export** (151 files), reused 136 cached assets in 0.939 s, downloaded 17 missing assets and the exact runtime MP4, and localized 194 same-origin paths. Final static resource census 279/280 with the sole missing file a confirmed source HTTP 404; no retryable missing resource remains.

Versus prior `/services/cnc-milling/`: normalized **Header 100%, Footer 100%, Main 90.047%**. Hero and Why Choose sections match **100% structural shape**, but other Main sections diverge markedly (0.05/0.735/0.0), so **reuse shared blocks/data, preserve page-specific DOM/variable sections**. Do not forcibly collapse the whole pair into one React or one data-only complete-page template.

Controlled real source-vs-mirror full-page PWC SSIM after local-only read-only guard: desktop **0.991916**, mobile **0.999096** (threshold 0.97; no masks); desktop/mobile local-browser safe interaction **2/2 PASS**; live writes 0. Final source refresh encountered `ERR_CONNECTION_CLOSED`, so final score uses an earlier successful source screenshot from the same Canary as the baseline. Captured source and local broken-image/placeholder counts match under third-party blocking, not proof that every lazy image is loaded.

**Owner visual review is still PENDING** for this additional route. Windows-only review `http://127.0.0.1:8768/_uat/owner-r10-review.html` and source evidence under `uat/r10-cnc-turning-candidate/`; private ledger retains `owner_visual_pass=false`, generalized `template_sha256=null`, `batch_enabled=false`. PR #15/#16 Draft; no main/Dev/WWW merge or whole-site batch.

Full scope/provenance/limits: [`docs/reviews/duplicate-site-v2-r10-cnc-turning-20261104.md`](../../../docs/reviews/duplicate-site-v2-r10-cnc-turning-20261104.md).

## Owner-frozen automatic page visual PASS (2026-11-04)

Owner explicitly authorized: **for each real page, when the source-vs-local complete desktop and mobile screenshot automated visual SSIM scores are both >=0.97, the page may be recorded as visual PASS without additional Owner manual review.** This supersedes earlier per-URL Owner visual approval holds for future page-level canaries, while retaining the earlier three manually approved samples and all source, security and publication gates.

Automatic page visual acceptance must use **both viewports** of authentic source capture and local mirror under matching viewports, controlled static/dynamic state, no screenshot masks or crops, matching page sizes and image/load evidence, no local runtime 404 or outside network dependency, and successful relevant safe interactions (menus, forms, local navigation). If any evidence is missing, stale/invalid, or either SSIM is below **0.97**, the page is OPEN/FAILED and routes to only the relevant component repair; do not lower the threshold or silently normalize score.

Implementation: existing `scripts/audit-pr15-handoff.mjs` now exports `evaluateAutomatedVisualPass` as a read-only policy gate. It checks dual viewport SSIM >=0.97 with zero masks, real screenshot files, original vs local geometry/media parity, local HTTP success and 2/2 isolated safe interaction PASS. The gate returns `AUTO_VISUAL_PASS` only for the **exact tested page**, not a generalized template SHA, all same-type pages, PR #15 batch queue permission, main merge, source-site form submission, Dev/WWW deployment, or unrestricted crawling.

Owner's immediate **`pass`** for the prior CNC Turning Canary also explicitly accepts that previously presented sample. Its measured post-guard SSIM: 0.991916 desktop / 0.999096 mobile; safe interaction 2/2 PASS. When a later live source navigation temporarily returns `ERR_CONNECTION_CLOSED`, the evidence must identify the already captured source screenshot as an earlier valid baseline from the same UAT; no misleading claim of a simultaneous live refresh.

Repeated page visits still use the frozen model: SiteOne single-page export → reuse shared assets/template modules → localize existing media references → source-vs-local desktop/mobile automated visual + safe interaction → auto PASS only after evidence is complete → failed-only fixes. No new foundational framework development.

## R11 two-page bounded batch baseline (2026-11-04)

Two CNC service URLs sourced from the previously authorized service navigation were processed locally **without new foundational modules**: `/services/5-axis-cnc-machining/` (SiteOne `--single-page` succeeded after exactly one failed-only retry) and `/services/precision-machining/` (SiteOne failed twice due connection reset, exact real source HTML safely preserved with cURL fallback; do not falsely label as successful SiteOne export).

The two local mirrors were prepared with 312/194 files, **222 cached existing assets reused**, **106 additional media assets fetched**, and **478/480** referenced local HTML/CSS resources present; each page's only remaining missing reference was the same upstream `particles.min.js` HTTP404. Source site, PR #15, main, Dev, WWW and production were untouched. Shared Header/Footer structural shape 100%; main-body shapes differ significantly (5-Axis vs CNC Turning 77.23%, Precision vs CNC Turning 11.17%); source DOM must remain intact.

**Hard OPEN, no false auto PASS:** real source Playwright screenshot attempts returned `ERR_CONNECTION_CLOSED`, followed by Windows Playwright/Node JS heap out-of-memory. Read-only Windows OS observed ~0.38 GB free RAM / ~0.28 GB available virtual memory; no Chrome or machine restart/cleanup was performed. Static mirrors received reversible local-only CSP and submit/out-of-scope link protection but those particular two guarded pages have **not** been browser-tested. Thus R11 is `STATIC_MIRROR_READY_2_OF_2`, `AUTO_VISUAL_PASS_0_OF_2`, **not a finished visual QA**.

Owner's previously frozen auto-visual rule still applies: once both full unmasked real-source-vs-local desktop/mobile PWC SSIM scores are >=0.97 and safe runtime UAT meets the strict gate, each exact URL automatically becomes visual PASS with no additional Owner manual approval. Do not claim this has happened until screenshots actually exist and pass. Preserve success-stage cache and do failed-only UAT retries when environment allows; never redownload/redevelop successful modules. No broader batch or merge permission implied.

Audit and exact limitations: [`docs/reviews/duplicate-site-v2-r11-two-page-batch-20261104.md`](../../../docs/reviews/duplicate-site-v2-r11-two-page-batch-20261104.md). Windows-only receipt: `uat/r11-small-batch/r11-static-audit.json`.

## R12–R13 latest handoff (2026-11-04)

**R12 is PARTIAL, not falsely completed.** After Windows memory returned to ~7.22 GiB free, both previously static-ready CNC pages were source-and-local live Chromium tested:

- `/services/5-axis-cnc-machining/`: actual desktop PWC SSIM **0.995968**, mobile **0.988359**, no masks, source/local screenshot sizes and image readiness parity, local HTTP errors 0, isolated safe interaction **2/2 PASS**. Existing `evaluateAutomatedVisualPass` was invoked on the real R12 file evidence and returned `AUTO_VISUAL_PASS`; private receipt `uat/r11-small-batch/5-axis-cnc-machining/r12-5axis-auto-pass.json`. Mobile CSS viewport was 375px, but both original and local full-page screenshots widened to 1280px due source-side horizontal overflow: identical rendering, not a claim of ideal responsive UX.
- `/services/precision-machining/`: targeted-only local responsive bug fix hid the four Elementor service sections that the authentic source hides at mobile; restored source email decoder/flag and omitted the offline-irrelevant origin Cloudflare anti-bot injection, all with original HTML backups and hashes. Corrected desktop/mobile dimensions and image load errors; safe interactions **2/2 PASS**. Authentic full-page SSIM **desktop 0.914809 FAIL**, **mobile 0.972004 PASS**; overall automatic page visual **OPEN**. Desktop difference localized to y≈8.4–9.6k and 10.2–11.4k where origin Breeze lazy-loaded image placeholders vs local loaded photos differ. Do not manipulate masks or artificially hide valid local pictures to obtain PASS. A shared eager-load experiment changed origin dynamic DOM/image count and was discarded as an unequal comparison; another slow-scroll attempt hit `ERR_CONNECTION_CLOSED`. The precise local repair is recorded, no full template rebuild allowed.
- Full R12 audit: [`docs/reviews/duplicate-site-v2-r12-recovery-20261104.md`](../../../docs/reviews/duplicate-site-v2-r12-recovery-20261104.md).

**R13 sitemap inventory DONE; scoped bulk still BLOCKED.** Parsed official robots.txt, Yoast sitemap index and 9 XML sitemaps on the exact source. Counted **834** unique published routes: **549 Blog-excluded**, **285 non-Blog candidates**. Of the non-Blog candidates, **115 core**, **82 material-detail pages held for representative-only no-all-products policy**, **86 optional content/interactive pages**, **2 utility/nonpublic pages for review**. Seven existing local pages revealed 12 navigation links absent from sitemap only superficially: 5 SiteOne aliases, 5 canonical redirects to indexed pages and **2 actual upstream 404 links**, zero additional live non-Blog route URLs. Complete original URL inventory and receipts only on Windows Local under `uat/r13-site-inventory/` (not a proven sitemap of unpublished/JS-generated pages).
- Full R13 audit: [`docs/reviews/duplicate-site-v2-r13-sitemap-inventory-20261104.md`](../../../docs/reviews/duplicate-site-v2-r13-sitemap-inventory-20261104.md). Do not start 115-core or 285-full-non-Blog batch without Owner-approved scope via PR #15; no full-site 48-hour guarantee based only on Sitemap. PR #15/#16 Draft, main and Dev/WWW untouched.
