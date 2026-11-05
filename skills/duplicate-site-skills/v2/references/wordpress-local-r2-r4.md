# Duplicate Site V2: WordPress Local R2–R4 implementation

Status: **Windows LOCAL ENGINEERING VERIFIED / DRAFT ONLY**. This is additive to PR #17 (parent PR #16); no merges, no production writes, no source capture or parallel batch framework.

## Design principles
- R2 uses existing WordPress template/controller files and route-specific *read-only public GET* data, not a new PHP runtime or per-URL renderer. A single PHP template SHA can serve multiple product data variants. Generic code does not embed any private theme source.
- R3 executes a deterministic **offline, final-stage CSS/JS build** in a separate research scratch tree using an **already installed, explicitly supplied** esbuild executable. No npm install, package fetch, or app/public modifications. Dist filenames hash built content, the manifest maps editable source to dist, and the receipt binds source and output SHA. Relative CSS font paths are rebased and copied to scratch with SHA.
- R4 runs local-only read-only browser acceptance for explicit bounded route manifest, two viewports, inert toggle tests (only button type=button), blocked non-GET and off-origin network requests, screenshots, runtime errors, missing local assets and overflow. It **imports the real PR #15 prepare-module-batch.mjs**, never reimplements the queue engine.

## Commands (on authorized Windows Local)
R2:
python skills/duplicate-site-skills/v2/scripts/wp-template-data-contract.py --theme PATH_TO_LOCAL_CHILD_THEME --origin http://authorized.local --routes PRIVATE_RESEARCH/routes.json --out PRIVATE_RESEARCH/r2-contract.json

R3 dry run, followed by explicit scratch build/verify:
python skills/duplicate-site-skills/v2/scripts/wp-final-build.py --theme PATH_TO_LOCAL_CHILD_THEME --workspace PRIVATE_RESEARCH --build-id first --esbuild PATH_TO_INSTALLED_ESBUILD
python skills/duplicate-site-skills/v2/scripts/wp-final-build.py --theme PATH_TO_LOCAL_CHILD_THEME --workspace PRIVATE_RESEARCH --build-id first --esbuild PATH_TO_INSTALLED_ESBUILD --execute
python skills/duplicate-site-skills/v2/scripts/wp-final-build.py --theme PATH_TO_LOCAL_CHILD_THEME --workspace PRIVATE_RESEARCH --build-id first --verify

R4 real browser check (Playwright must already be installed locally):
python skills/duplicate-site-skills/v2/scripts/wp-r4-browser-uat.py --origin http://authorized.local --routes PRIVATE_RESEARCH/routes.json --shots PRIVATE_RESEARCH/screenshots --out PRIVATE_RESEARCH/browser.json

R4 real PR #15 handoff check (no real queue execution):
node skills/duplicate-site-skills/v2/scripts/wp-r4-pr15-handoff.mjs --contract=PRIVATE_RESEARCH/r2-contract.json --receipt=PRIVATE_RESEARCH/r3-build/first/build-receipt.json --browser=PRIVATE_RESEARCH/browser.json --factory-root=PATH_TO_REAL_PR15_CHECKOUT --source-origin=https://AUTHORIZED_ORIGIN --out=PRIVATE_RESEARCH/r4-gate.json

Private route manifest format (example only):
[
  {"path":"/","kind":"home"},
  {"path":"/shop/","kind":"listing","interaction":{"open":"[data-open]","close":"[data-close]","open_assert":"dialog[open]"}},
  {"path":"/products/sample/","kind":"product"}
]

Routes, source rights, private screenshots and extracted site data stay on Windows. Do NOT add true order/customer data, keys, public source assets or production login data to GitHub.

## Evidence observed on Windows Local (2026-11-05)
- R2: Five actual GET routes; four classes (home, catalog, product, content), two distinct product data hashes for the **same** product PHP template SHA. All five returned HTTP 200. Owner visual approval remains false.
- R3: 19/19 source files minified to hashed CSS/JS in isolated scratch, 2 local fonts rebased/copied; 19/19 SHA verification; second build yielded identical 19/19 compiled SHA hashes. New staging build has NOT been applied to the running site, so it has not passed live browser build-diff testing.
- R4: 5 actual routes × 1440px PC/375px mobile = 10/10 local browser rendering screenshots. Local HTTP failures 0, pageerror 0, horizontal overflow 0. Safe gallery/filters open/close exercised for 4 product views + 2 catalog views; home/content interactions NOT TESTED. Off-origin requests blocked: 8 (expected offline network guard, may affect visual fonts). This is local rendering smoke only, **not** 0.97 source/local visual fidelity.
- Content About page has zero H1 elements in both viewports; mark **OPEN_CONTENT_SEMANTIC_H1** for later separate review.
- PR #15 handoff: actual 6/6 module gates BLOCKED for missing Owner template visual PASS / source rights, as designed; one isolated synthetic queue 1/1 readiness verifies real PR #15 API. No actual real-route batch execution is claimed.
- Regression: previous WP inspector 7/7, new R2/R3 synthetic tests 7/7, plus real Windows execution above. GitHub CI not claimed.

## Release/approval boundaries
- Existing PR #15 module factory and V2 R15/R16 progress remain unchanged, especially frozen PASS routes and exact allowlists.
- Current PR #17 is a nested Draft against PR #16, not independently mergeable into main until PR dependencies are settled.
- For real same-template batch: obtain explicit representative Owner desktop/mobile visual PASS and exact frozen template SHA; verify source/asset license and route inventory; run PR #15 with real ledger. Do not substitute the synthetic test for authorization.
- Before promoting staged build to Local runtime, test rendered diff/visuals against current version using rollbackable scoped canary. Not part of this isolated research implementation.
- No SiteGround/WWW/Dev site, customers, payments, email or Cron touched.