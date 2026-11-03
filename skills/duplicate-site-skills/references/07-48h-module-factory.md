# 07 — 48h module factory for exact Local website backup (no Blog)

> Normative playbook for owned/licensed source websites. **48 hours is a measured active-work target, not a promise or permission to skip owner UAT, source rights, or quality gates.** The visible delivery clock must also show time waiting on Owner approval, inaccessible source, rate limits, and any external dependency.

## Goal and scope modes
The user chooses **one** explicit scope before copying anything. The default general capability is `FULL_NONBLOG`: every in-scope public, rights-cleared non-Blog URL, product detail, media and internal navigation (within explicitly allowed source classes) preserved offline. No Blogs, blog categories, posts, comments or RSS; do not collect customer/checkout/login/payment/API secrets. Source site authenticated export is preferred over scraping if offered.

An individual project may instead specify `FIRST_PAGE_CATALOG` (all agreed category/filter entry pages only at page 1, and only approved representative product details); that is a **scoped snapshot**, never an entire source website. The BASWORLDY project already has a narrower Owner-selected scope: no blogs, listing page 1 only, not all product details. Do not silently broaden it to `FULL_NONBLOG` merely because this generic skill supports both.

## Hard workflow (per page-template module, sequential)
`READ_ONE_SAMPLE → ANALYZE → LOCAL_TEMPLATE → AUTO_UAT → OWNER_VISUAL_PASS → BATCH_SAME_TYPE → BATCH_AUDIT_PASS → NEXT_MODULE`.

1. **SHARED_SHELL** — source homepage + real Logo, Header, Footer, navigation, typography, global assets/menus, desktop/mobile. Owner approves this shell; freeze its route-independent CSS and visual snapshots.
2. **CATALOG_LISTINGS** — sample ONE category/list page 1, including all media and filters; independently UAT and get Owner visual PASS. Then generate every included category/filter/list page from one locked template plus original source data. In `FIRST_PAGE_CATALOG` mode **never** fetch page 2, a cursor or infinite-scroll next batch for any listing.
3. **PRODUCT_DETAILS** — sample ONE actual product detail, its entire gallery, specs and interactive controls; Owner visual PASS. Then batch-copy detail data, media order and authentic SKU→URL→gallery mapping **only for the explicitly included product scope**; do not create fake details for excluded products.
4. **CONTENT_SERVICES** — sample typical About/How to Buy/Transport/FAQ/Contact and group genuinely different page families separately when they require different templates; Owner PASS for each materially distinct template; batch remaining non-Blog content pages.
5. **INTERACTIONS** — local search, menu/dropdowns, forms as inert/local preview, gallery, category filters and other customer-facing widgets. May reuse previously approved component behavior; Owner UAT for materially different shared interaction. No real payment/order/login/mail/third-party side effects.
6. **OFFLINE_ACCEPTANCE** — route graph including 404 detection, original byte SHA256 assets, responsive screenshots, offline network-zero on all in-scope required assets, full-page visual spot checks, links and all missing/out-of-scope records. Owner final Local acceptance is separate from any public deployment approval.

An optional class `MISC_TEMPLATE` may be inserted if a genuinely different page structure is discovered. **Do not force unlike pages onto an existing template to meet a deadline.** A newly found template returns to its own ONE representative sample; previously approved shell and other templates remain frozen.

## What is frozen after Owner PASS
- Freeze `template_hash`, source & local desktop/mobile screenshot references, approved representative URL, component tokens/spacing/font/Logo, and the exact Owner approval message reference and timestamp. An automated test or "continue" is not this approval.
- Data and page-specific images may be substituted into the locked template by machine batch; batch ingestion does not re-open visual design. Shared header/footer changes after shell PASS require a **regression diff** on approved pages, not a blanket restart. Material visual changes require reapproval **only for affected templates**.
- Batch output must retain real URL, title, main text, SKU and original image order, media hashes, route completeness and per-item failure details. No placeholders passed off as real content. Do not conflate `HTTP 200` with visual fidelity.
- Each batch's completion gate is route count reconciled against the *in-scope denominator*, checksum/asset and offline QA PASS, and zero unresolved critical pages. Otherwise remain `BATCH_IN_PROGRESS` or `BLOCKED`, never auto-start next module.
- Previous work and files already PASS are reused. On interruption resume from URL/asset manifests, hashes, status ledgers and failed-only retry queues. No reset/re-download unless source changed.

## A practical 48h active-work budget (targets, not evidence)
| Window | Milestone | Budget |
|---|---|---:|
| 0–2h | Rights, scoped URL classes, export availability, first sample, template discovery & throughput probe | 2h |
| 2–7h | SHARED_SHELL prototype / Chrome QA / Owner gate | 5h |
| 7–15h | CATALOG_LISTINGS sample / Owner gate / same-type batch | 8h |
| 15–27h | PRODUCT_DETAILS sample / Owner gate / same-type batch | 12h |
| 27–34h | CONTENT_SERVICES + other approved unique template classes | 7h |
| 34–41h | INTERACTIONS, nested asset/route completion and offline mock APIs | 7h |
| 41–48h | OFFLINE_ACCEPTANCE, regression, hashes, packaged backup, buffer | 7h |

**Scheduling principles:** the clock records both *active hours* and *Owner wait hours*. It cannot silently stop the actual wall clock; the two columns must both be reported. Each new module estimates the remaining actual routes, unique assets, measured source fetch/verification throughput and missing template work. When measured estimate exceeds the remaining active-work budget, raise `AT_RISK_48H` early and offer the Owner an explicit choice: obtain direct CMS/source export, authorize more computing throughput, reduce scope transparently, or extend deadline. **Never claim complete while missing material.** No circumventing WAF/403/captcha/rate limits or access controls to force the SLA.

## Automation contracts
- `templates/backup-48h-ledger.example.json` describes ordered modules, actual sample and screenshot evidence, explicit scoped URLs, Owner PASS refs, template hashes, batch denominators, offline checks, and measured active-work forecasts.
- `scripts/backup-48h-gate.mjs` is an **offline/read-only** gate. It checks `sample`, `batch`, `next`, `complete` actions and returns `ALLOWED`/`BLOCKED`. It also estimates hours from measured throughput and gives risk flags. The script **does not forge approvals or change page data**, and cannot cryptographically verify the Owner's private message; runtime operator must verify refs against the conversation before writing a private approval file. Sample template remains `OPEN`.
- Human Owner PASS must be recorded per module, not inherited by a different module. `SHARED_SHELL` PASS freezes global design; the next listing family still needs its own sample approval.
- No Blog fetching (including blog categories/search results), no unapproved page-2 fetch in a `FIRST_PAGE_CATALOG` project, no reading customer/checkout data. No Dev/WWW/main merge without independent explicit authorization.

## Final report definition
Report **template family count, Owner-pass count, pages discovered/in scope/archived/verified, unique asset count/saved/missing, gallery completeness, internal routes, redirects, broken images, external network attempts/responses, browser PC/mobile failures, active hours and Owner waiting hours**, and excluded blog/non-scope routes. `FULL_NONBLOG_COMPLETE` requires an evidenced source inventory denominator, no excluded non-Blog material, verified offline function/rendering and final Owner Local signoff; anything else is `SCOPED_LOCAL_ARCHIVE` or `INCOMPLETE`.
