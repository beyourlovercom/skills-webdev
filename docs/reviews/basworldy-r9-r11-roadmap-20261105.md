# BASWORLDY Windows Local — Roadmap V5 (2026-11-05)

Baseline: one approved template per family; every batch requires real desktop/mobile UAT and Owner visual review before the next content batch. Local-only, no Blog, no product-detail bulk, only first category pages.

## Completed
- Home, Truck-list, and Volvo product detail representative templates: Owner PASS and frozen SHA.
- 9 main first-page categories + 163 authentic nested category first-pages = 172 listing pages: Owner PASS. All 5 image-exception pages included.
- 596 repaired category hrefs; 121 missing-source category hrefs lead to explicit not-archived notice. Original-source 13 HTTP404 routes and 4 unarchived deeper backhoe-filter routes remain exceptions, not invented pages.
- About: 42 archived source and local resources, Owner fully PASS, hashes frozen. Original two MP4s are absent from saved MHTML.
- R9-A: via self-hosted BYL DC, the user's existing Windows Chrome successfully saved four authentic MHTMLs: Contact, How to Buy, BAS World Store, Privacy Policy (31,475,316 bytes combined). Source URL, HTML, media parts and SHA verified. No Cloudflare-bypass or production writes.
- R9-B: four Windows Local content pages + 213 files of local assets. Exactly 217/217 published-file SHA matches and 4/4 localdev HTTP HEAD 200.
- R9-B real-local browser QA: 8/8 desktop/mobile views, interactive carousels & offline-safe form states PASS, 0 loaded broken images, 0 horizontal overflow, 0 external requests and 0 JavaScript errors.
- Total currently published locally: 177 pages, of which 173 are Owner visually PASS, the latest 4 have technical PASS but Owner review PENDING.

## R9 Owner visual review links
- Contact: http://localdev.basworldy.com/source-mirror/content/contact-us/
- How to Buy: http://localdev.basworldy.com/source-mirror/how-to-buy/
- Store: http://localdev.basworldy.com/source-mirror/content/bas-world-store/
- Privacy: http://localdev.basworldy.com/source-mirror/content/privacy-disclaimer/

## Known exceptions and scope boundaries
- Source MHTML itself sometimes fails to load Titillium Web in file mode. The local font loads correctly, causing some headline-wrap differences. The screenshot mean-pixel metric is NOT SSIM 0.97 and no visual autopass is claimed for the four new pages.
- Store original MP4 not contained in MHTML; archived poster used. Some third-party map/captcha iframes and live forms are disabled offline. About has two missing MP4 files.
- 13 historical real-source 404s + 4 unarchived deeper category links remain explicitly excluded from the valid source denominator. A separate inventory includes 242 candidate editorial/guidance content routes; their non-Blog status is not yet resolved. They are not included in the core 15-page estimate.
- Business/legal core candidate denominator: 14 candidate content pages plus How-to-Buy = 15 total. About and four R9 samples done, leaving ~10 source candidates (subject to source validity and actual template classification).
- No WWW, Dev, ERP, Production, existing Chrome restarts, READY device restarts or Github main merges.

## Remaining roadmap (effective engineering labor; not actual timesheets or guaranteed calendar time)
| Phase | Gate / work | Estimated hours | Status |
| --- | --- | ---: | --- |
| R9-A and R9-B | Four MHTML source files, sample output and eight local browser UAT cases | 0 remaining | Technical PASS |
| R9-U | Owner inspect four real local pages, fix only verified visual / interactive template gaps | 0.5–2 | Owner visual PENDING |
| R9-C | Remaining ~10 core business/legal candidate source snapshots, template reuse, batch UAT and staged Owner approval | 4–8 | After R9-U |
| R10-I | Offline-safe contact / sell forms, CTA behavior and cross-page links | 1.5–3 | To do |
| R10-Q | Final in-scope static resources, link and desktop/mobile browser regression | 1.5–3 | To do |
| R11 | Final Owner review, SHA freeze, exceptions and handoff | 0.5–1 | To do |
| TOTAL | Core remaining effective engineering labor only; excludes waiting and unknown editorial scope | 8–17 | Estimate |

## Windows audit evidence
- D:/ai/basworldy-source-archive/page1-batch/uat/r9-owner-chrome-source-20261104/ — four verified MHTMLs and receipts
- D:/ai/basworldy-source-archive/page1-batch/uat/r9-four-local-promotion-readback-20261104.json — 217 files hashed
- D:/ai/basworldy-source-archive/page1-batch/uat/r9-four-real-local-evidence-20261105/browser-report-page1.json — 8 actual localdev browser tests
- D:/ai/basworldy-source-archive/page1-batch/uat/r9-four-visual-compare-20261104/ — real MHTML vs local screenshots; diagnostics only
- D:/ai/basworldy-source-archive/page1-batch/uat/r7-about-owner-visual-pass-freeze-20261104.json
- D:/ai/basworldy-source-archive/page1-batch/uat/r8-final-173-after-owner-pass-20261104.json

Owner checkpoint: Deliver the above FOUR working local pages; pause new business content batch until Owner PASS. Any reported shared visual defect must be fixed once in its shared template, then all same-template pages regression-tested.