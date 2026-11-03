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
