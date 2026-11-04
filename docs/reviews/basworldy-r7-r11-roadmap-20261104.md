# BASWORLDY Local Clone — Roadmap & Labor Baseline (2026-11-04)

## Scope and release constraints

- Target: BASWORLDY Windows Local, based on public basworld.com source. Only first page of each valid product-list/category route. No Blog/news; no bulk product details; no Production, Dev, WWW write or main merge.
- Template rule: develop once, verify real desktop/mobile appearance and interactions, Owner PASS (or valid unmasked source-vs-local SSIM >=0.97 automatic check), then reuse. Pause after every batch and offer 5–8 working local pages for review.
- The 48-hour completion target is an aspiration, not a verified elapsed-time achievement. No fake source screenshots or lowering the 0.97 gate.
- Do not push source HTML, photos, fonts, screenshots, customer data or browser profiles to GitHub. Evidence stays on private Windows Local.

## Completed and Owner-approved

| Gate | Verified output | Status |
| --- | --- | --- |
| R0–R3 templates | Home, Truck/listing, Volvo/detail frozen, 3 SHA baselines | Owner PASS |
| R4 / R5 list batches | 9 main first-pages + 149 additional nested first-pages | Owner PASS |
| R6 five media exceptions | 5 further nested first-pages; MAN original exact-source image, Volvo/Maxus actual upstream BAS World official placeholder | Owner PASS 2026-11-04 |
| R6 navigation follow-up | 149 previously approved HTMLs changed in href only to restore 596 links to now-local valid categories, exact-stage inverse and full SHA ledger | Applied |
| R8 list-scope offline regression | 172/172 real local HTTP HEAD 200, zero missing local IMG and stylesheet refs, zero external IMG/CSS refs, 3 frozen templates unchanged | Technical PASS |
| R6 source exceptions | 13 routes had prior real-source HTTP 404. Exclude from 163 valid archived nested pages, no fabricated content. | Evidence recorded; navigation classification open |
| Nested first-page denominator | 163/163 archived non-404 nested routes on disk. 9 main + 163 = 172 valid listing pages. | Complete for archived valid routes |

Offline R8 audit also found 4 uncaptured third-level backhoe-loader brand links (caterpillar/new_holland/case/jcb); these are **not** part of the original 176-route discovery list. Treat as source-validation candidates, not verified valid pages.

R6 navigation rollback originals: private Windows archive 'page1-batch/uat/r5-149-release-candidate-20261104/source-mirror'. The R6 href-only update is additionally indexed by 'r6-navigation-links-restore-readback-20261104.json'. Prior R5 receipts remain immutable.

## Source access blocker (R7)

- Seven ordinary Windows Node GET requests to the public content routes, including /en/content/about-bas-world, returned HTTP 403.
- One ordinary Chrome headless, separately profiled, read-only public visit returned HTTP 403: "Attention Required! | Cloudflare" / "Sorry, you have been blocked". No bypass or challenge solving attempted. Receipt in 'r7-content-browser-one-20261104/receipt.json'.
- Public search indexing can display article text but does not supply genuine complete source layout, media and interaction evidence. It does not qualify for a 0.97 visual clone.
- A legitimately accessible complete HTML+resources snapshot or authorized browser view is an external prerequisite for R7 source-template acceptance. Do not start a guessed high-fidelity content batch while this gate is open.

## Actual current route inventory — do not undercount

A read-only extraction from saved Home + 9 main-category navigation pages yielded **409** unique nonstock candidate links, NOT an official complete sitemap.
- 261 '/content/' or '/en/content/' candidate paths; 256 after collapsing exact '/en/content/' aliases.
- Of these 256, **14** are identifiable service/sales/legal pages (About, Contact, Store, Logistics, Privacy, Cookies, Ethics, Sitemap, Sell Truck/Van/Trailer/etc.).
- **242** remain content/guidance candidates (product advice, trade laws, comparisons, buying guides). Some may be Blog-like editorial, but have NOT been excluded as Blog without an explicit content taxonomy decision.
- A further /how-to-buy service route and /advisor/en interactive route were found, plus language/country links. Multilingual clones are NOT confirmed to be required in the current 48-hour plan.
- Audit files: 'r6-nonblog-content-link-inventory-20261104.json', 'r7-nonblog-route-taxonomy-20261104.json', 'r7-core-vs-guidance-content-scope-20261104.json'.

## Remaining engineering roadmap (effective hands-on labor after legitimate source access)

| Priority | Phase | Deliverable / stop condition | Estimated hours |
| --- | --- | --- | --- |
| P1 | R6-N close exceptions | 13 known upstream 404 + 4 deeper brand links categorized, no fabricated pages or silent link expansion | 0.5–1.0 |
| P2 | R7-S source gate | Obtain/read one authorized About full-page source snapshot with real desktop/mobile reference and resources | 0.5–1.5 *after access* |
| P3 | R7-T template once | Build one reusable content/services page template from the real reference, preserve shell; responsive interaction and real-source visual 0.97 / Owner checkpoint | 2.5–4.5 |
| P4 | R8 core business batch | Reuse PASS template for ~14 core service/sales/legal candidate URLs and How-to-Buy as source-verified, excluding unsupported/duplicate paths; stop for Owner visual review | 2.0–3.5 |
| P5 | R9 limited interactions | Local-only contact/sell/CTA links and safe form states, no real submissions; test all distinct interaction types | 1.5–2.5 |
| P6 | R10 full offline UAT | Full in-scope navigation, images, CSS, broken-link exceptions, 172 list pages + authorized content pages; mobile/desktop representative visual checks | 1.5–3.0 |
| P7 | R11 acceptance & archive | Owner review, final SHA freeze, report, final handoff and publish boundaries | 0.5–1.0 |
| | **Core remaining effective labor** | **Excludes waiting for source access; includes one content template only** | **9–17 h** |

Scenario B, if the 242 guidance/content pages are confirmed in scope: **additional rough 10–30 active hours** assuming real source archives and matching templates are reusable; this is unverified until URL taxonomy, media and sample-page tests. Multilingual variants or new page layouts require separate scope/estimation.

### Critical-path implications

- 172 archived-valid category first pages are already finished; no redevelopment.
- R7 is currently **BLOCKED by third-party source 403**, not by implementation complexity. Calendar completion cannot be guaranteed while this persists.
- 13 upstream 404 entries are exceptions, not 13 undiscovered valid pages. Four deeper filters remain unverified.
- Never label raw markup structure or same-local-page pixel similarity as genuine source-vs-local SSIM.
- For every next completed batch, deliver working local links to the Owner and stop for Owner PASS before another module.

## Evidence on Windows Local

' D:/ai/basworldy-source-archive/page1-batch/uat/ ' contains:
- r5-owner-visual-pass-20261104.json
- r6-five-local-promotion-readback-20261104.json
- r6-navigation-links-restore-preflight-20261104.json
- r6-navigation-links-restore-readback-20261104.json
- r8-all-172-page1-offline-audit-20261104.json
- r7-source-route-readonly-20261104/results.json
- r7-content-browser-one-20261104/receipt.json
- r7-core-vs-guidance-content-scope-20261104.json

This roadmap is a status/estimate, not a time-clock record. Actual historical person-hours were not measured, so do not present them as audited spend.


## R7 About page unlocked by Owner-supplied Chrome MHTML — 2026-11-04

**Status:** R7-S source gate PASS for the single About page; R7-T HTML/asset/interaction technical UAT PASS; **Owner visual review PENDING**. No downstream content batch authorization.

- Owner supplied "About BAS World _ BAS World.mhtml", saved from an authorized Chrome page visit after ordinary Windows access returned Cloudflare HTTP 403. Source URL: https://www.basworld.com/content/about-bas-world. The same file was present in the authorized Windows Downloads folder. SHA-256 on both sides: `ffa85375c6efba70922205fc480e74151c395a28f46647084a2906498e23b646` (17,221,601 bytes).
- Original MHTML was opened in isolated local Chrome; H1 = About BAS World. There are 183 image elements. Extraction preserved 11 CSS files and 29 source image/icon resources; 13 embedded CSS font/background refs were resolved to already-localized website assets. Source, files, media and full browser screenshots remain only on private Windows Local, not GitHub.
- New local UAT sample (42 newly added files, ~12.85 MB): **http://localdev.basworldy.com/source-mirror/content/about-bas-world/**, HTTP 200. It was installed additively without overwriting existing files. Three frozen baseline SHA checks and the previously Owner-PASS listing pages were protected.
- Actual local desktop (1440px) and mobile (375px) browser UAT: 2/2 pages rendered, two independent carousels each moved next/back at both widths (4/4 interaction checks PASS), 0 broken completed images, 0 horizontal overflow, 0 external HTTP requests and 0 JS errors. Source forms are explicitly submission-disabled.
- Source-MHTML vs local same-viewport **mean absolute pixel-closeness**: desktop 0.975957, mobile 0.961837. These are **not SSIM** and do not satisfy the Owner's source-vs-local SSIM >=0.97 automatic acceptance rule. Differences include header logo (original archived MHTML has one broken logo, local uses true archived logo), hero-subtitle wrapping and unarchived media. **Owner must inspect and PASS this representative.**
- The MHTML did **not** contain two original MP4 videos. Offline preview preserves their layout using authentic archive photos as posters; do not claim these videos were backed up. If full video playback becomes essential, request files via manual Owner handoff instead of bypassing third-party restrictions.
- Evidence: `D:/ai/basworldy-source-archive/page1-batch/uat/r7-about-mhtml-20261104/`, `r7-about-local-promotion-readback-20261104.json`, `r7-about-real-local-evidence-20261104/browser-report-page1.json`, and `r7-about-visual-compare-20261104/visual-source-local-report.json`.

**Owner-approved 403 escalation workflow:** Make one ordinary read-only public access check. If blocked by Cloudflare/403, do not retry endlessly or bypass. Request Owner to open the public page in Chrome and save a **Single File .mhtml** copy; verify SHA and complete resources; ask separately for actual videos or missing assets only when needed. Keep the archive, images and browser evidence private.

**Roadmap delta:** Earlier core labor estimate 9–17 active hours included acquiring source and building a representative template. After this About representative, practical **remaining active engineering estimate is 6.5–12.5 hours**, conditional on Owner visual PASS, reusable content template and legitimate source snapshots for the ~14 core business pages; excludes any wait for Owner files. Up to 242 further advisory/editorial candidate routes remain a separate unapproved scope (rough incremental 10–30 active hours if ultimately included; validate per source sample). Other pages' 403 source gates remain independent and may require the same manual MHTML workflow.

**Next gate:** User checks the live Windows Local About URL in desktop/mobile and replies PASS or annotated screenshots. Then freeze the approved content template SHA and only then expand the next same-template core page batch. No GitHub main merge and no Dev/WWW/Production write.
