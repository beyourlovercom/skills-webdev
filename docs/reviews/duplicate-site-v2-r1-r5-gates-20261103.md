# Duplicate Site V2 — R1–R5 Review Gate (2026-11-03)

**Owner directive:** Complete R1 → R5 for only RapidDirect home, services index and CNC service detail. PR #16 and PR #15 are both Draft; no merge to main or Dev/WWW. The Owner alone may grant each visual PASS.

Repository branch: `feat/duplicate-site-v2-siteone-pwc-20261103` (PR #16).

## Current audit: code, Windows evidence and remaining blockers

| Stage | Implemented | Verified evidence | Remaining gate |
|---|---|---|---|
| R1 — reusable code in PR #16 | Windows-tested local review bridge `templates/local-review-bridge/Section12Section.jsx`; bounded reversible `prepare-owner-preview.mjs`; CSP/no-form protections; tests | The prior Windows bridge was Vite-build verified. GitHub writes of new packaging and tests confirmed. | **NEW** CSP/packaging test and readback on Windows outstanding if formal BYL DC unavailable |
| R2 — three mobile visuals | Source/rebuilt/local pair captures, per-region diagnostics; deterministic `visual-canary.py` for follow-up runs | Earlier measured stable service-list mobile (source ↔ local) 0.9991; PWC built ↔ local 1.0 services, 0.999999 CNC; first-fold triples align. Home built ↔ local 0.557 (full mobile) | Home middle dynamic sections and source-vs-CNC dynamic areas **OPEN**, cannot declare 3/3 visual PASS |
| R3 — build/interactions | Existing Vite/React bridge app and scoped routes; `interaction-canary.py` reproducible local no-write test | Earlier Windows npm build exited 0; 32 modules; 3 mobile hamburger toggles, home FAQ, 4 content links, form/quote protection PASS in observed browser tests | Standalone `pwc build` CLI fails because upstream sandbox state is process-local. Fully independent React section authoring **OPEN**. NEW replay script not yet run |
| R4 — regression | Existing Windows screenshots/JSON and GitHub automation scripts | Earlier repository tests **38/38 PASS** before new changes; real 3-route browser evidence under `uat/` on Windows | All new R1/R2/R3 tests and screenshots need same-turn Windows rerun and read-back; compare exact image geometry before asserting SSIM |
| R5 — Owner review | Local-only visual dashboard with 21 images, source and refreshed source captures, static and built snapshots | Read-only fallback verified Windows dashboard exists and HTTP 200 at `127.0.0.1:8766/uat/owner-visual-review-v2.html` | **PENDING Owner visual PASS**; no automatic batch, no main merge |

### Why independent React and full visual PASS are not yet reported
PWC v3 `clone` succeeded at extraction and planning but generated a missing section component; a code-authored **React review shell** bridges original licensed SiteOne snapshots. This can be built, tested and previewed, but it is not a newly authored React equivalent of every page. Standalone `pwc build` fails with `RuntimeError: No sandbox exists` in a fresh process; direct `npm.cmd run build` is the actual verified build path. These facts must not be obscured.

### Exact Windows Local layout (private, do not commit source bytes)
- Project: `C:\ai\site-mirror\rapiddirect-v2`
- Vite project: `pwc-build\review-app`
- Source images/evidence: `uat\`
- Owner dashboard: `uat\owner-visual-review-v2.html`
- Local dashboard URL: `http://127.0.0.1:8766/uat/owner-visual-review-v2.html` (Windows **only**, no public exposure)
- PWC isolated venv under `tools\pwc-venv`; upstream SiteOne under `tools\siteone`.

### Reuse the code safely (after Owner allows local run)
Use scripts in PR #16, not main:
```powershell
# from extracted PR #16 repository root; dry-run by default
node skills/duplicate-site-skills/v2/scripts/prepare-owner-preview.mjs --workspace=C:/ai/site-mirror/rapiddirect-v2 --manifest=skills/duplicate-site-skills/v2/templates/rapiddirect.pilot.example.json
# apply only to the three existing local snapshots and isolated React section
node skills/duplicate-site-skills/v2/scripts/prepare-owner-preview.mjs --workspace=C:/ai/site-mirror/rapiddirect-v2 --manifest=skills/duplicate-site-skills/v2/templates/rapiddirect.pilot.example.json --execute

cd C:/ai/site-mirror/rapiddirect-v2/pwc-build/review-app
npm.cmd run build

# external site read is OFF unless --allow-live-read explicitly supplied
C:/ai/site-mirror/rapiddirect-v2/tools/pwc-venv/Scripts/python.exe <PR16-root>/skills/duplicate-site-skills/v2/scripts/visual-canary.py --workspace C:/ai/site-mirror/rapiddirect-v2
C:/ai/site-mirror/rapiddirect-v2/tools/pwc-venv/Scripts/python.exe <PR16-root>/skills/duplicate-site-skills/v2/scripts/interaction-canary.py --workspace C:/ai/site-mirror/rapiddirect-v2
```

**Security:** No real user-data export, cookies, login, CAD upload, quotes, transactions, Dev/WWW or non-GET write calls. CSP `connect-src 'self'; form-action 'none'` applied only to local snapshot copies; helper saves originals separately. The reviewer preview remains a local Windows sandbox. Do not download, upload or commit licensed source HTML, images or fonts to public GitHub.

### Final Owner decision (not yet given)
Three representative page classes require separate desktop and mobile Owner visual inspection and explicit PASS before PR #15's same-type batch becomes eligible. Owner may ask for particular visible fixes; do not generalize a source screenshot mismatch into a promise of 100% replica. Until Owner decides, retain Draft PR #16 and Draft PR #15, with no merge/main or live site deployment.

### Channel status during this edit
Formal BYL DC calls temporarily returned connector errors, so no new on-device R1–R4 execute/verify claim is made after that interruption. Read-only Desktop Commander was used only to confirm the existing dashboard HTTP 200, not to mutate files.

## Post-PASS continuation and revised roadmap (2026-11-03)

Owner replied “pass; continue and review latest roadmap/hours”. Record this as acceptance of the current three-page review/continuation stage, NOT as automatic evidence that every PC/mobile view reached the 0.97 threshold, not permission for full-site batch, and not a PR main merge or any Dev/WWW deployment.

### GitHub updates in this continuation

- Committed reusable review bridge source, without proprietary RapidDirect HTML, images, or fonts.
- Added dry-run preview preparation, all-three-sample preflight, reversible backups, symlink escape prevention and CSP/form controls, plus Node tests.
- Added deterministic three-page desktop/mobile visual replay and local interactive gate tests; no live source write requests permitted.
- Extended existing S2 Skills CI with Python safety tests alongside Node and Registry tests.
- Verified exact commit 7f9c80d944b4b0b343cd22f85ffb6ff1dd30ce8e with two successful GitHub checks: S2 Local Dev WWW Skills CI (Node/Python/Registry all successful) and Public Skill Registry Check. GitHub CI is NOT Windows browser UAT.

### Remaining critical path

| Phase | Work | Estimated engineer-hours | Gate |
|---|---|---:|---|
| R1 | Code packaging, preflight safety and CI | DONE | GitHub tests green |
| R2 | Home mobile carousel, video and lazy-image capture-state fidelity | 2–4h | No hidden/cropped content; deterministic comparison |
| R3 | Apply latest scripts to isolated Windows preview; rebuild and run CSP, routing, menu/FAQ, form protection; clarify standalone PWC build limitation | 2–3h | Windows Vite build exit 0, target interactions green |
| R4 | 3 pages × desktop/mobile browser replay and media integrity census | 2–3h | Exact denominators and residual failure list |
| R5 | Owner visual delta review and module-by-module verdict | 1–2h | Explicit Owner decision, PR remains Draft until separately authorized |

**Remaining three-page Canary work: approximately 7–12 engineer-hours**, excluding remote-access/source-site outages. This is work effort, not a promised background delivery time.

### After Canary (new gate; not yet authorized for execution)

- Integrate PR #15 sample → Owner PASS → template freeze → same-type batch/resume: 4–7h.
- Verify one other authorized site and measure actual asset/route completeness and failure rates: 5–9h.
- Compatibility, cross-platform docs and a separately approved exact-head main merge plan: 1–2h.
- Additional after Canary: 10–18h; combined remaining through reusable V2 hardening: about 17–30h. Not a 48-hour guarantee for arbitrary websites; not a fully independent React reimplementation.

**Holds:** Formal BYL DC connection was blocked during the continuation. No new Windows execution of latest scripts is asserted. PR #15 and #16 remain Draft; no main merge, no Dev/WWW, no new crawl or bulk mode. The only user acceptance claimed is the bounded current review stage.
