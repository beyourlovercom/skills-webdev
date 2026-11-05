# WordPress Local Adapter — Duplicate Site V2 (Draft)

Status: **isolated Windows LOCAL_PASS (static only) / Draft PR**. This is a narrowly scoped supplement to the existing V2 Mirror-first workflow and PR #15's module-factory gate. It is NOT a crawler, theme builder, site importer, visual PASS, or release authorization.

## Purpose
Audit an authorized, already-restored local WordPress child theme before treating it as a reusable template: PHP template files, editable CSS/JS modules, optional JSON data configuration, and source-to-hashed-dist asset mappings. Reuse the existing V2 Owner visual approval and frozen SHA flow; do not create a parallel batch or mirror engine.

## Safety rules
- Read **only** a supplied local theme directory. Do not inspect wp-config.php, databases, user/order records, uploaded media, account credentials or active browser sessions.
- The optional HTTP probe allows only explicit localhost/127.0.0.1/.local origins, simple paths, GET requests and local redirects. It uses no system proxy. Public URLs and off-domain redirects are rejected.
- Never publish source site HTML, CSS, JS, screenshots, licensed assets, personal data, claims, reviews or credentials from a research instance to this public repository.
- All outputs remain on the authorized local computer. No GitHub main merge, Dev/WWW publishing or search indexing is authorized by passing this tool.
- Existing V2 Template/Class Owner PC/Mobile PASS and PR #15 same-template batch gates remain mandatory. Static syntax or HTTP 200 is insufficient.

## Usage
python skills/duplicate-site-skills/v2/scripts/inspect-local-wp-theme.py --theme C:/work/approved-site/app/public/wp-content/themes/child-theme --output C:/work/approved-site/research/manifest-audit.json

Optional: --base-url http://approved-site.local --route / --route /shop/ --php C:/php/php.exe --node node

Without a base URL and routes the inspector performs **no HTTP**. Without --php/--node, syntax checks are recorded as skipped rather than PASS. Output is JSON. Nonzero status on malformed or missing assets and invalid JSON/syntax; REVIEW_UNBOUNDED_PRODUCT_QUERY stays an OPEN performance warning, not an automatic code rewrite.

## Minimal integration into PR #16
1. After V2 mirror-first representative creation, optionally run WP_ADAPTER_INSPECT **only for a WordPress target**. Skip for plain static/React mirrors.
2. Map existing module classes to stable PHP template identifiers; keep page-specific data outside frozen templates.
3. Lock the content SHA for each editable source and manifest dist target; re-build compiled assets only at the end. If the manifest points to a missing file, block BUILD_PASS.
4. Retain the Owner-representative visual gate, template SHA, PR #15 queue and fail-only regression loop; the adapter provides evidence but cannot mark a new page type PASS.
5. Independently verify all published ratings, testimonials, guarantees, payment claims, brand ownership and rights; performance warnings such as uncapped product queries are investigated under separate local UAT.

## Synthetic regression tests
Run: python -m unittest discover -s tests -p test_duplicate_site_v2_wordpress_local_adapter.py -v

Fixtures cover a valid mapping, missing compiled asset, path traversal, disallowed public URL, blocked redirect, malformed JSON, and uncapped WooCommerce query warning.

## Anonymized validation data (Windows local, 2026-11-05)
- Editable theme: 25 PHP files, 9 JS files, 12 CSS files, 3 top-level JSON files.
- 19/19 manifest source/dist file pairs exist. PHP lint 25/25; JS syntax 9/9; JSON 3/3 valid.
- 3 representative local routes returned HTTP 200 (homepage, catalog, content page).
- One runtime pattern requires REVIEW_UNBOUNDED_PRODUCT_QUERY; no theme code was modified.
- This is STATIC_PASS + OPEN_PERFORMANCE_REVIEW, not mobile visual or e-commerce PASS.

No private source files or screenshots are committed.
## R2–R4 executable extension (2026-11-05)

The generic stage-2/3/4 implementation, private-local commands, real browser evidence and remaining gates are recorded in [WordPress Local R2–R4 implementation](wordpress-local-r2-r4.md). It extends this static inspector without replacing it. The WordPress sample reports 5/5 local route GET, 19/19 repeatable staged builds, and 10/10 PC/mobile local browser renders, but **real PR #15 batch remains blocked for missing Owner template pass and rights evidence**; the staged compiled assets were not applied to the running Local site. Existing PR #15/#16/R15–R16 are unchanged.
