# Andy Skills 3.1.0 — Release Notes

Release scope: reusable Skills source/tools in beyourlovercom/skills-webdev. No target website or Dev/Production deployment.

## Major improvements since 2.0.0-rc.1

- R1 Representative-page Owner/template SHA gate and reusable fail-only batch factory (integrated from PR #15).
- R2 SiteOne-first source mirror, PWC correction when needed, route/media continuity, safe static resource localization and generic localhost-only site preview (PR #16 plus V3.1).
- R3 WordPress Local templates and *single final CSS/JS batch only after site-specific completion* (PR #17).
- R4 Unified evidence contracts, registry discipline, resumption, approvals and version tracking (PR #18 plus V3.1).
- Added V3.1 CLI: scripts/skills-v31-seed.mjs generates a **fail-closed** scope Manifest from a frozen URL inventory and existing Local HTML SHA. It sets all template/visual approvals to OPEN.
- Added V3.1 CLI: scripts/skills-v31-local-site.mjs is a generic 127.0.0.1 read-only local preview, HTML-directory sitemap/hub/queue and scoped static asset gateway.
- Added V3.1 CLI: scripts/skills-v31-gate.mjs validates explicit source scope denominator and SHA, frozen representative template, real desktop/mobile browser evidence, two verified distinct ingress sources, real resource checks and exact fail-only queue. It cannot authorize publication.
- Fixed Windows PowerShell 5.1 UTF-8 BOM JSON input, WordPress staged static assets, TTF/OTF font MIME and dot-delimited version routes such as /news/platform-version-3.0/.

## Release evidence (2026-11-09)

| Gate | Actual observation |
|---|---|
| Windows V3.1 Node focused regression | 29/29 PASS before dotted slug addition; added dotted slug regression subsequently passes |
| GitHub PR #19 CI | S1, GSC, S2 and Public Registry all green for implementation heads; check final release SHA separately |
| Real Local site scope | 834/834 frozen source routes matched to actual local HTML files using V3.1 seed, 14 template groups, 0 pending **file presence** |
| Real Windows browser smoke | 3 Owner-approved frozen pages, 6 PC/mobile views HTTP 200 and H1, no horizontal overflow |
| Real navigation | 2 independent Local navigation entry points x 3 pages = 6/6 successful clicks |
| Static resources in real browser | 37–38 initial HTTP 404/view fixed by scoped staged assets and fonts; final 0 HTTP resource 404/view |
| Safety | Local read-only; test observed zero external/non-GET attempt; user data, payment and source-site writes avoided |

## Deliberately not released as a site-level PASS

- Seeded 834 HTML presence is not 834/834 visual, interaction or package acceptance. All newly seeded template approvals remain OPEN.
- The 3-page sample had source-derived JS runtime issues and 9 deferred GTranslate flag nodes per viewport. They remain site-specific OPEN exceptions.
- SiteOne/PWC source-to-local fresh visual SSIM for all routes, PR #15 template-owner gate, and final PR #17 CSS/JS build remain independently blocked on each project's actual evidence.
- Every Dev/WWW change still requires independent explicit Owner signoff.

## Migration and rollback

- Do not rewrite approved templates or rebuild all pages to adopt V3.1.
- Future sites: freeze rights and URL inventory → V3.1 seed → approved representative templates → PR15 batch queue → PR16 mirror/PWC selective fix → V3.1 local preview/gate → PR17 single final CSS/JS build → separate Dev/WWW approval.
- Version rollback: checkout the previous exact main SHA/tag; stop only an isolated V3.1 local preview if needed; never restart READY devices or Chrome as part of rollback. No automatic production website mutation is included.
- PR #15–#18 are code sources inherited by the integrated release. Their site-specific project ledgers are independent and do not become falsely CLOSED when shared Skills is published.

**Release naming:** Git tag v3.1.0 after GitHub main merge and successful full release readback. Site-level final acceptance remains OPEN.
