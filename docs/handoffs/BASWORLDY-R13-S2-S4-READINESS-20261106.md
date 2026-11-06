# BASWORLDY R13-S2–S4 source readiness (2026-11-06)

**Status:** Documentation/readiness completed; actual new page builds blocked by missing authentic source MHTML. No local page, main branch or production writes.

## Rechecked facts

- R12 frozen baseline: 187/187 original HTML hashes and 391/391 R12 new files still match the freeze manifest.
- Three necessary source snapshots currently missing from Windows Downloads: `BAS-R13-sell-your-vehicle.mhtml`, `BAS-R13-faq-content.mhtml`, `BAS-R13-faq-service-desk.mhtml`.
- Generic Sell landing is absent locally. Public BAS World page text confirms category selection, a three-stage selling process, vehicle-category cards, valuation CTA and sales FAQ. Public text is not equivalent to complete original HTML/assets.
- FAQ routes `/content/faq` and `/service-desk/faq` have overlapping Q&A, but group sections differently and contain some different items; **do not mark them aliases or deduplicate until original snapshots are compared**.
- `/content/contact-us` is already part of the earlier Owner-approved site and must be reused without cloning.
- `/advisor/en` is a dynamic AI service; require a separate choice between external service link and a source-backed offline visual preview. Do not fake working AI.
- Direct ordinary Chrome upstream probes on Windows received Cloudflare block; no bypass was attempted.

## One-time intake / audit records on Windows

`D:\ai\basworldy-source-archive\page1-batch\uat\r13-source-intake-once-20261106.py` is an on-demand local MHTML preflight. It reads candidate file names, original Content-Location hints, file sizes and SHA-256; it does not import or edit the site.

`D:\ai\basworldy-source-archive\page1-batch\uat\r13-source-intake-readback-20261106.json` currently shows 0/3 required source snapshots ready.

`C:\Users\Administrator\Downloads\BASWORLDY-R13-S2-S4-MD-READINESS-20261106.zip` includes 6 Markdown working docs plus 3 evidence JSON files. ZIP integrity verified.

## Next gates

1. Collect authentic source MHTML with authorized Chrome (generic Sell landing, both FAQ routes). Do not treat search snippets as exact source snapshots.
2. Confirm FAQ visual/layout overlap and choose one canonical page + alias only if source evidence proves sameness.
3. Build only evidence-backed missing non-Blog pages, reuse approved template modules, keep offline submission disabled.
4. Give each new page two actual inbound local links plus sitemap entry, with minimal-diff permission for frozen navigation changes.
5. PC/mobile full-page browser UAT, first-view visual >=0.97 when suitable source comparison exists, then new SHA freeze.

**No GitHub main merge, no production deployment, no changes to the 192 frozen core pages.**