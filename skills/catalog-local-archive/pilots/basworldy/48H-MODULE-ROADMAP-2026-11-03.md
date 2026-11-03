# BASWORLDY | 48h module factory scope and handoff — 2026-11-03

This is a **project-specific working plan**, not proof of website completion or a promise. The reusable generic policy is in `skills/duplicate-site-skills/references/07-48h-module-factory.md` on Draft PR #15. Private source HTML, images, runtime snapshots, Owner evidence files and credentials stay on Windows.

## Owner scope (unchanged unless separately revised)
- Site source `https://www.basworld.com`; Windows Local `http://localdev.basworldy.com/source-mirror/`.
- **No Blog**: no blog index, blog articles, RSS, categories/comments or blog-only assets.
- All agreed product/category/filter listing entry URLs **page 1 only**. No page2/cursor/infinite-scroll batch. Representative real product detail only, **not all products**, per latest prior Owner scope.
- Full restoration of all agreed non-Blog standard pages, original Logo, photos, visual typography, Header, Footer, navigation and local preview interactions; do not invent source data or real order/payment functionality.
- The 185 category/filter entry URLs from 2026-11-03 homepage inventory are a **discovery sample**, not yet an authoritative validated in-scope denominator. Original 2,115 prematurely downloaded URLs and 195 detail snapshots remain frozen/deduplicated; do not re-crawl, do not count them as visual PASS or permission to expand.

## Current immutable gates
| Order | Module | Evidence today | Owner gate | Next action |
|---|---|---|---|---|
| 1 | SHARED_SHELL | Homepage genuine source replay, Chrome/visual QA, Owner explicitly said `首页视觉 pass` | **OWNER VISUAL PASS** | Freeze source exact Logo/Header/Footer, snapshots and theme; no redesign |
| 2 | CATALOG_LISTINGS | Truck page 1 template implemented and browser UAT passed; desktop/mobile full-page preview exists | **OWNER VISUAL PASS OPEN** | Owner review 1 representative Truck page 1; after explicit module PASS batch all approved category/filter listing first pages |
| 3 | PRODUCT_DETAILS | Genuine Volvo SKU 70320127 detail/gallery, verified PC+mobile local browser | **OWNER VISUAL PASS OPEN** | Owner approves one sample; batch only explicitly approved representative SKUs |
| 4 | CONTENT_SERVICES | Core About / How to Buy / Transport / Contact / FAQ / legal routes need template grouping | **NOT STARTED** | One representative per distinct template, Owner PASS, then same-template bulk |
| 5 | INTERACTIONS | Local menus, filter drawer, Slick gallery adaptors exist; not yet complete independent module | **OPEN** | Finalize safe local-only interactions and UAT; no live payment/mail/backend |
| 6 | OFFLINE_ACCEPTANCE | In-scope route denominator, media integrity and offline regression not final | **OPEN** | Verify 100% of agreed scope; Owner final Local acceptance, immutable backup + manifest |

## Budget and stop rules
Generic 48 active-hour budget is 2h intake, 5h shell, 8h listings, 12h products, 7h informational pages, 7h interactions, 7h final QA. Already passed modules do not consume new development hours. BASWORLDY's actual remaining time must be recalculated from **measured throughput**, verified scope and available authorized source/export; mark `UNMEASURED` until benchmarked, `AT_RISK_48H` when prediction exceeds target. Track elapsed wall clock and Owner wait separately. Do not treat owner wait as silently disappearing from real calendar time.

Per-module fixed process: read one source first-page template → capture all required media/HTML → analyze → build isolated Local page → auto Chrome UAT 1440/375 → **Owner explicit visual PASS** with module name, approval message & hash → generate hash-deduped same-type queue → retry failed only → verify in-scope total, images, offline link integrity → move to next module.

## Correct handoff and governance
- Owner already signed off homepage design **only**; never extrapolate that to product/category pages.
- Current review center `http://localdev.basworldy.com/source-mirror/review/` includes six initial and six whole-page screenshots. Only this project's agreed templates are eligible for review.
- Module-specific source gate is `scripts/visual-first-gate.mjs` V0.7; sample `templates/owner-visual-pass.example.json` is deliberately `AWAITING_OWNER_REVIEW`. Do not fabricate human evidence.
- Generic queue gating `skills/duplicate-site-skills/scripts/backup-48h-gate.mjs` and `prepare-module-batch.mjs` is on separate **Draft PR #15**, not yet GitHub main. Keep PR state clear to any future worker.
- No Dev/WWW deployment, no public DNS, no GitHub main merge without independent Owner authorization.
