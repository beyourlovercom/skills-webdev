# Duplicate Site Skills V2 — Data Mapping Canary / Three Approved Templates

Date: 2026-11-03. Scope: existing authorized Windows Local RapidDirect three-page Canary. PR #16 remains Draft; PR #15 remains the separate, existing batch factory. No page crawling, no Dev/WWW changes, no main merge.

## Owner-approved representative references

Owner visual PASS is recorded for `/`, `/services/`, `/services/cnc-machining/`. Private Windows ledger `C:/ai/site-mirror/rapiddirect-v2/uat/template-candidates.json` retains 3 frozen **representative HTML** SHA-256 receipts. It does **not** pretend to store approved generalized template implementation hashes.

## New implementation in PR #16

- `skills/duplicate-site-skills/v2/scripts/template-data-map.py`: pure Python standard library. Reads only an already-approved local sample identified in the private ledger; checks page path, Owner visual PASS and source SHA-256; inventories text node slots and selected metadata, image and link attributes using exact source offsets without altering HTML layout.
- `inspect` writes a private field inventory **only with explicit `--execute`**, under a caller-designated project-private `uat/` scratch directory. The default action is a no-write dry run.
- `render` accepts explicit field-ID → new-value changes. It preserves original tags/attributes outside exact allowed data spans; escapes HTML, checks source SHA and structural fingerprint, and writes a new private scratch output without touching the existing mirror. Unknown fields, drift, unauthorized source, output outside scratch, external media URLs, unapproved links and unparsed `srcset` replacement fail closed.
- This is **data substitution**, not a second batch queue. Real same-template URL batches must go through **PR #15** and its Owner approval, site scope and QA gates.

## Actual Windows sample measurements

| Approved sample | Candidate data slots | Examples | Synthetic data variants | Structural hash retained |
|---|---:|---|---:|---|
| Home / shared-shell | **522** | links 216; image attributes 120; paragraph segments 129; headings + meta | 2 | PASS both |
| Services / catalog-listings | **329** | links 196; image attributes 56; paragraph segments 55 | 2 | PASS both |
| CNC / content-services | **1,084** | links 429; image attributes 418; paragraph segments 132 | 2 | PASS both |
| **Total** | **1,935** | data candidates, NOT all guaranteed freely editable in future sites | **6** | **6/6 PASS** |

Each synthetic variant replaced exactly 4 audited fields: title, selected heading text, paragraph segment, and image alt. Therefore **24 targeted substitutions** across six simulated HTML outputs. The exact source HTML bytes and frozen reference SHA remained unchanged (0 original writes). A second CLI-mode render for each sample produced byte-identical output to the in-memory simulation (**3/3 CLI readback PASS**).

These six variants are synthetic datasets **using the same three approved source HTML structures**. This proves safe substitution on approved layouts, **not** that a different real product/service page will necessarily have identical DOM, repeatable card counts, CSS or interactions.

## Cross-real-page shared components

The three existing real samples all use the same Elementor `elementor-102986` header and `elementor-313` footer classes. On the observed DOM:

- Header: 433 descendant tag nodes per page; normalized tag/class structure similarity **1.00000** across home, services, CNC. Dynamic active states and link text are page data.
- Footer: home 338 nodes vs services 340, CNC 344; normalized structural similarity home/services **0.99705**, home/CNC **0.99120**. More data/dynamic differences exist than in header. Neither is a claim that raw HTML bytes match exactly.

This is evidence to reuse common shell templates rather than re-developing header/footer per URL.

## Actual tests and independent batch gate

- On Windows Local, `python -m unittest discover -s tests -p 'test_duplicate_site_v2_*.py' -v`: **13/13 PASS** after adding six data-map cases. The cases cover safe rendering, same structural fingerprint, HTML escaping, frozen SHA drift, restricted three-route links and rejecting unverified `srcset` conversion.
- Private proof: `C:/ai/site-mirror/rapiddirect-v2/uat/data-mapping-smoke/final-mapping-summary.json` and `synthetic-render-proof.json`. Sample field inventories and output HTML remain local only. **No proprietary source HTML, images, fonts or extracted page content committed to GitHub.**
- Re-ran `audit-pr15-handoff.mjs` against the existing PR #15 real `backup-48h-gate.mjs`: frozen reference SHA **3/3**, actual gate called, and all **3/3 remain BLOCKED**. `generalized_templates_ready=0`, `source_requests=0`, `site_writes=0`.

## Explicitly open (do not overclaim)

1. A reusable data/asset mapping to a **second genuine same-template URL** has NOT been validated; the three approved URLs belong to three different page families. A separately authorized additional real sample is needed before measuring template reuse throughput.
2. The current script replaces audited text/attribute slots only. Repeated cards, varying list cardinalities, interactive galleries, script-driven state and `srcset` require dedicated semantic adapters and browser QA; do not rewrite each page by hand or reimplement the entire template to compensate.
3. PR #15 is an approval/queue planning engine; it does not itself render a real full website from `template-data-map.py`. A small approved queue-item → data mapping → local output bridge remains OPEN.
4. All new route crawling, batch generation, main merging and Dev/WWW deployment remain unapproved. Keep PR #15 and PR #16 Draft.

## Recommended next gated sequence

Reuse PR #15 queue and frozen-template evidence; build a minimal queue-item adapter that **only** writes private scratch outputs and fail-closes absent data mappings. Then validate with one further authorized same-template page and its complete assets/PC/mobile interaction evidence. Only after the second genuine-page UAT can we report measured per-page copy time and activate a specific batch scope.

CLI pattern (private Windows Local paths, not an authorized new route):

```powershell
python skills/duplicate-site-skills/v2/scripts/template-data-map.py inspect --sample home --source C:/ai/site-mirror/rapiddirect-v2/mirror/index.html --ledger C:/ai/site-mirror/rapiddirect-v2/uat/template-candidates.json --scratch-root C:/ai/site-mirror/rapiddirect-v2/uat/data-mapping-smoke --output C:/ai/site-mirror/rapiddirect-v2/uat/data-mapping-smoke/home.mapping.json
```

The command above is dry-run. `--execute` can write the private scratch inventory on first creation; it deliberately refuses overwrites. Render requires `--mapping`, `--changes`, a new isolated `--output`, and an approved source; it never writes into the mirrored website itself.

## Final fail-closed regression

The latest real Windows run verified **13/13 Python unit tests PASS**. An explicit negative CLI call used `--scratch-root=<project>/mirror` and `--output=<project>/mirror/unauthorized-render.html`: the command returned nonzero with `scratch root must be inside the project's private UAT directory`; the mirror output file did not exist. This protects the previously approved direct SiteOne mirror from accidental local proof writes.
