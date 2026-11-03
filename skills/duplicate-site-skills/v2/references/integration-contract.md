# SiteOne + Perfect Web Clone integration contract (V2 draft)

## Evidence boundary

SiteOne mirrors the accessible static surface and creates a local asset/HTML basis. It does not copy databases, WordPress admin, applications, user accounts, orders or payment workflows. The PWC tool can extract and score a single page, but a coding agent must plan and author a functioning build. Do not report a PWC capture as a completed site.

## Source policy

- Pilot manifest contains only four verified RapidDirect URLs; SiteOne receives --url-list and --single-page. It must not expand crawl depth from a homepage, read Blog or follow authenticated paths in the pilot.
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
4. Execute extract for one representative page. Read PWC JSON, run its plan phase and author all sections using Agent coding. Assemble and build into local Vite/React output. Record screenshot/score/fingerprint/weight results and fix the worst failing component.
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
| Injection molding | OPEN | OPEN | OPEN | OPEN | PENDING |

Do not invent percentage similarity or a 48-hour delivery guarantee. Declare coverage as measured numerator/denominator for routes, assets, and visible sections. Highlight missing functionality even when screenshot scores look high.
