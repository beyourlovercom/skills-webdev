# GSC report and Codex handoff

Original [`analysis-prompt.txt`](analysis-prompt.txt) is the definitive specification. This contract is a delivery checklist, not a replacement.

The executing ChatGPT must create a real Chinese **.docx** report titled 《旧站 GSC 搜索表现分析与新站建设指导报告》 using an available document creation tool, only when a verified property and data support its conclusions. It includes: executive summary/top 3 actions; property/siteUrl/permissions/search type/time/date/quality; click/impression/CTR/weighted position; brand/nonbrand and search intent; query/page, country/device analyses; indexing/canonical/Sitemap/CWV/HTTPS limitations; site architecture; old/new domain migration or coexistence; keyword-to-URL and old-to-new-URL mapping; P0/P1/P2 backlog with evidence/effort/risks; 30/60/90 monitoring and source appendix; a copyable Codex prompt to verify exact project SHA and act only after Owner approval, Local→Dev→WWW.

For actual rows, supply CSV/XLSX for query→URL, important pages, URL redirects *as proposals only*, and evidence-linked tasks. Do not create a false metric table or invent conversions. Specify query dates, filters and which totals cannot be reconstructed from anonymized/limited GSC query rows. Use GA4/Ads/qualified CRM leads only when independently authorized and linked by defensible aggregation, never pretend GSC query→individual user/order join exists.

`gsc-read.mjs` produces protected JSON evidence. Word/CSV creation is a separate analysis/artifact step. Mark Word `OPEN` rather than marking an unbuilt Word report PASS. No automatic GSC publishing, sitemap submission, 301, indexing request or other write.
