# BASWORLDY · R12 Final Closeout / R13 Handoff (2026-11-06)

**Scope:** Windows Local only; `http://localdev.basworldy.com/source-mirror/`  
**GitHub:** `beyourlovercom/skills-webdev` branch `feat/catalog-local-archive-pilot-20261102`.  
**Restriction:** do not merge main; do not modify source-site Production, WWW/Dev or other sites.

## 1. Real verified R12 outcomes

| Scope | Final evidence |
|---|---|
| Original R11 pages | 187/187 Owner PASS, old SHA unchanged |
| New R12 business pages | Trucks, Semi-trailers, Tractor Units, Vans, Machinery |
| Browser technical UAT | 5 pages × PC/mobile = 10/10; dynamic interaction and offline form safety verified |
| Automated visual gate | 10/10 first-viewport Gaussian SSIM ≥0.97, source MHTML font assets restored in isolated Chrome only |
| Frozen new files | 5 HTML + 386 assets = 391/391 SHA match |
| Current local HTTP | 192/192 HTTP HEAD 200 |
| Internal links | 51,304 checked, 0 dead local links |
| Assets | 13,412 checked, 0 new missing, 8 pre-existing CSS exceptions retained |
| Homepage | 527 href-only edits, final R12 SHA still matches |
| Editorial scope | Owner approved excluding 237 article-style candidates; all original URL/title/source card data retained |

## 2. PC / mobile first-viewport visual scores

| Page | PC 1440×900 | Mobile 375×812 |
|---|---:|---:|
| Trucks | 0.992942 | 0.986171 |
| Semi-trailers | 0.989944 | 0.986835 |
| Tractor Units | 0.988527 | 0.986749 |
| Vans | 0.987707 | 0.986857 |
| Machinery | 0.992412 | 0.981770 |

## 3. Why earlier visual scores were falsely low

The authentic archived source MHTML references /resources/fonts/TitilliumWeb-*.woff2. Direct file:// rendering caused those font faces to fail, so the source reference used fallback glyphs while the local mirror's Titillium Web loaded properly.

For the re-test, already-archived genuine Titillium Web font bytes were supplied ONLY to the isolated Chrome source-reference runtime. Source MHTML and local HTML/CSS/JS/assets were never modified. Every H1 title width then matched local.

**Methodological limitation:** The visual numbers above are 11×11 Gaussian SSIM sampled at every 8 px for the first viewport, not full-length exact SSIM and not Owner's personal handwritten approval. Full-page local browser UAT remained previously 10/10 technical PASS.

## 4. Immutable Windows evidence

Audit directory: D:\ai\basworldy-source-archive\page1-batch\uat

- r13-five-visual-sha-freeze-20261106.json — new freeze record with 187 baseline hashes, 391 new hashes, 5 original MHTML receipts and 10 visual scores.
- r13-final-192-qualified-audit-20261106.json — live local route, HTTP, internal-link and asset verification.
- r13-visual-audit-20261106/r13-ten-viewport-datafont-ssim-readback-20261106.json — screenshot checksums and visual comparisons.
- r13-final-visual-md-package-readback-20261106.json — ZIP integrity and file list receipt.
- r12-editorial-242-final-classification-inventory-20261105.json — complete editorial scope evidence.

Windows Downloads Markdown bundle: C:\Users\Administrator\Downloads\BASWORLDY-R12-FINAL-VISUAL-PASS-20261106.zip. It contains the five per-page MD reviews, 10 corrected source/local pairs, local full-page thumbnails, the freeze manifest, and 237 excluded URLs.

## 5. Remaining exceptions and R13 scope

The 8 legacy CSS references, 9 original videos not archived, 13 original 404 categories, 4 unavailable deeper filters and one 404 Swedish flag remain documented exceptions. The 237 editorial exclusions are Owner-approved scope decisions; all 237 CMS page types were NOT individually verified. Do not claim 100% non-Blog original site coverage.

R13: first perform read-only verification whether /sell-your-vehicle, /advisor/en, /service-desk/faq and /contact-us are unique non-Blog business pages, aliases, redirects or external/out-of-scope interactive services. Create or modify nothing without authentic source evidence. The previous 187 approved pages stay frozen, and existing templates are reused.

**R12 status:** Automated visual gate and SHA freeze complete, with no Owner-manual approval claim. GitHub sync is limited to the existing feature branch; do not merge main or deploy Production.