# SiteOne + Perfect Web Clone integration contract (V2 draft)

## Evidence boundary

SiteOne mirrors the accessible static surface and creates a local asset/HTML basis. It does not copy databases, WordPress admin, applications, user accounts, orders or payment workflows. The PWC tool can extract and score a single page, but a coding agent must plan and author a functioning build. Do not report a PWC capture as a completed site.

## Source policy

- Pilot manifest contains only three verified RapidDirect URLs; SiteOne receives --url-list and --single-page. It must not expand crawl depth from a homepage, read Blog or follow authenticated paths in the pilot.
- Keep workers <= 2 and max requests/second <= 3; no bypass of robots, security or login gates.
- Rights recorded as Owner's project-level statement, not an independently verified copyright certificate. Target remains local only.
- Native external quotation/CAD upload, personal/customer data, third-party embedded widgets and remote writes are excluded.
- Never commit any captured bytes, browser screenshots of private data, saved source assets or proprietary content to this public code repository.

## Local requirements

Windows isolated workspace outside existing Local WP sites; Windows Node >=20, Python >=3.10, Git, official SiteOne Crawler Windows release, official pip-installed PWC, Playwright Chromium. Check versions and binary command flags at installation time. Script resolves binaries from PATH; does not install, update or restart anything.

Official references:
https://crawler.siteone.io/configuration/command-line-options/
https://github.com/janreges/siteone-crawler
https://github.com/ericshang98/Perfect-Web-Clone
https://github.com/ericshang98/perfect-web-clone-skill

## Pipeline

1. Invoke doctor (best-effort PATH probe only). Inspect prerequisite versions and Playwright separately.
2. Invoke plan (read-only JSON), review sample URLs, output paths, SiteOne CLI arguments and PWC sample jobs.
3. Execute capture on approved Windows Local; check exit code; verify SiteOne JSON/HTML report and offline asset/link audit. Preserve a read-only source snapshot with hash manifest in project-private storage.
4. **Mirror-first:** Open the SiteOne direct local page for the representative URL and run real desktop/mobile interaction and source-vs-mirror UAT. Invoke PWC extraction/planning/Agent authoring/React build **only when a confirmed visual or interaction defect cannot be solved by targeted mirror/asset repair**. Do not convert each template or URL to React by default. Record evidence and repair only the failing component.
5. Compare desktop 1440 and mobile 375 with actual source screenshots. Verify header/navigation/footer, layout, assets/lazy-load, interactive menu/tabs/accordion, local routes, no unintended production actions.
6. Present visual evidence to Owner. Only an explicit human module PASS allows the next same-type batch. PR #15 remains the source of truth for this gating flow until independently accepted.
7. After each module, verify actual route denominator, SHA-locked template and media integrity. Continue next page class. Final offline browsing must work with external network blocked for expected static pages.
8. Do not deploy Dev or WWW from this tool or PR.

## Fail-closed controls

| Condition | Status |
|---|---|
| Missing source rights / unknown origin | BLOCKED_RIGHTS |
| Missing SiteOne binary | BLOCKED_DEPENDENCY |
| SiteOne exit nonzero / missing assets | FAIL_CAPTURE |
| PWC extract output invalid | FAIL_EXTRACT |
| Agent build missing / screenshots missing | OPEN_BUILD_UAT |
| Interactive control unimplemented | FAIL_INTERACTION |
| Owner has not passed representative sample | BLOCKED_BATCH |
| Site image/URL file total unclear | OPEN_INVENTORY |
| Full non-Blog run requested via the pilot script | UNSUPPORTED_SCOPE |
| Dev/WWW release attempt | BLOCKED_RELEASE |

## Acceptance pilot matrix

| Page | PC 1440 | Mobile 375 | Source assets | Navigation/interaction | Owner |
|---|---|---|---|---|---|
| Home | OPEN | OPEN | OPEN | OPEN | PENDING |
| Services index | OPEN | OPEN | OPEN | OPEN | PENDING |
| CNC machining | OPEN | OPEN | OPEN | OPEN | PENDING |

Do not invent percentage similarity or a 48-hour delivery guarantee. Declare coverage as measured numerator/denominator for routes, assets, and visible sections. Highlight missing functionality even when screenshot scores look high.

## Owner-frozen template reuse contract (2026-11-03)

**Mandatory:** develop/fix **one representative per template**; after explicit Owner desktop/mobile visual PASS, freeze immutable template SHA and field mapping. Every other URL of the same type uses **automatic data/asset injection with this frozen template**. Do not re-author each URL as React or restart analysis per URL.

**When to reopen template development:** only a newly evidenced visual or interactive difference requiring a template fix. Missing data, broken image paths, one-off 404 or a single source field error are local data/asset QA exceptions; repair these without redesigning the template. Template SHA drift blocks propagation until reviewed. Safety, rights and production release gates always remain separate and blocking.

Required sequence: `TEMPLATE_CLASSIFIED` → `REPRESENTATIVE_UAT` → `OWNER_VISUAL_PASS` → `TEMPLATE_FROZEN` → `SAME_TYPE_BATCH` → `BATCH_QA_COMPLETE`. Without the explicit representative page PASS, keep `BLOCKED_BATCH`. A new visual/interaction issue transitions only that affected class to `TEMPLATE_REOPEN_FOR_VISUAL_OR_INTERACTION`, after which it must receive a new PASS and frozen SHA before further propagation.

**Current implementation caveat:** this contract is approved, but the full same-type batch/resume engine belongs to separately reviewed PR #15; the current PR #16 three-page pilot still does not authorize executing bulk work. Do not mark automated batching as already operational solely because this contract exists.

Full frozen rule: [template-reuse-frozen-policy.md](template-reuse-frozen-policy.md).

### Provenance and template-factory handoff

RapidDirect Windows 2026-11-03: 3 SiteOne representatives (home, services index, CNC detail) and 563 local files, 38.03 MiB. PR #15's existing Owner gate/queue code independently passed 27/27 Windows tests and MUST be reused for same-type pages; PR #16 only supplies capture and repair adapters, not a second batch-engine implementation.

Current pilot's isolated, private template candidate ledger: C:/ai/site-mirror/rapiddirect-v2/uat/template-candidates.json. It records three classes with the HTML snapshot checksum only (not frozen template code hash); Owner module-specific visual PASS=false for each. Never mislabel these candidates as frozen or auto-run the PR #15 queue. Any later scope and batch action must be independently approved.

Recent source-vs-direct-local tests, not iframe PWC scores: home mobile 0.8997, CNC desktop 0.6824, both below 0.97. Manual diff shows moving homepage article content and CNC carousel/video state differences. No broad template rebuild is justified until an actual persistent layout/interaction defect is isolated. Excluded Blog pages remain excluded even if the homepage displays a content feed.
