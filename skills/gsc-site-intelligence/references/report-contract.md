# GSC report and Codex handoff

Original [`analysis-prompt.txt`](analysis-prompt.txt) is the definitive specification. This contract is a delivery checklist, not a replacement.

The executing ChatGPT must create a real Chinese **.docx** report titled 《旧站 GSC 搜索表现分析与新站建设指导报告》 using an available document creation tool, only when a verified property and data support its conclusions. It includes: executive summary/top 3 actions; property/siteUrl/permissions/search type/time/date/quality; click/impression/CTR/weighted position; brand/nonbrand and search intent; query/page, country/device analyses; indexing/canonical/Sitemap/CWV/HTTPS limitations; site architecture; old/new domain migration or coexistence; keyword-to-URL and old-to-new-URL mapping; P0/P1/P2 backlog with evidence/effort/risks; 30/60/90 monitoring and source appendix; a copyable Codex prompt to verify exact project SHA and act only after Owner approval, Local→Dev→WWW.

For actual rows, supply CSV/XLSX for query→URL, important pages, URL redirects *as proposals only*, and evidence-linked tasks. Do not create a false metric table or invent conversions. Specify query dates, filters and which totals cannot be reconstructed from anonymized/limited GSC query rows. Use GA4/Ads/qualified CRM leads only when independently authorized and linked by defensible aggregation, never pretend GSC query→individual user/order join exists.

`gsc-read.mjs` produces protected JSON evidence. Word/CSV creation is a separate analysis/artifact step. Mark Word `OPEN` rather than marking an unbuilt Word report PASS. No automatic GSC publishing, sitemap submission, 301, indexing request or other write.

## Offline UI CSV scope

Offline GSC CSV permits a clearly labeled **interim/partial** analysis using actual imported rows. Include `GSC_UI_CSV_EXPORT_OFFLINE`, the declared property, `USER_DECLARED_NOT_API_VERIFIED`, date filters, dimension export limits and unmatched data. The date/chart CSV is the totals basis; query/page Top-N cannot be used as site totals. Do not claim a full Google-authenticated UAT, verified Query×Page pairs or complete annual coverage on this evidence alone. Report only substantiated observations and OPEN gates.

### Existing Chrome GSC partial UI report

For data actually read from an Owner-approved existing Chrome session, an interim **authenticated UI observation report** is valid when provenance is explicit: `GSC_EXISTING_CHROME_UI_READONLY`, exact property resource_id, captured UI title, visible date range and search type. This is not a Google API export, does not itself prove all report dimensions or complete 12-month coverage, and cannot be promoted into a full annual Word report without all required source evidence. Indexing/Sitemaps/CWV are separate modules with their own update dates and URL limitations. Keep raw report captures out of Public GitHub and never publish user account email, cookies, tokens or private search terms.
