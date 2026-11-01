# GSC data contract: actual Search Console API, not simulated SEO

Official source references (verify current status when executing):
- https://developers.google.com/webmaster-tools/v1/sites/list
- https://developers.google.com/webmaster-tools/v1/searchanalytics/query
- https://developers.google.com/webmaster-tools/v1/sitemaps/list
- https://developers.google.com/webmaster-tools/v1/urlInspection.index/inspect

Read-only OAuth scope: `https://www.googleapis.com/auth/webmasters.readonly`; never upgrade to a write scope just to read. `sites.list` returns `siteUrl` and `permissionLevel`. Domain property is `sc-domain:example.com`, URL-prefix is e.g. `https://example.com/`. Reject unchecked tenant, ambiguous matches, and accidental combination of www/non-www or domain properties.

Search Analytics `POST /webmasters/v3/sites/{siteUrl}/searchAnalytics/query` supports `dimensions`, `type`, `startDate`, `endDate`, `rowLimit` max 25,000, `startRow` and `dataState=final`. Request Web / Image / Video / News *separately*. `aggregationType=byPage` for page group/filter vs `byProperty` for property totals. Search Analytics is internally *top-row limited*, uses privacy/anonymized query processing, and is not an exhaustive keyword export even if pagination drains. Missing query/page row **does not prove zero**. Dates use GSC's report convention America/Los_Angeles rather than the browser's Taiwan date.

Default dimensions/period: Web, 12 complete PT calendar months and previous 12 separately. Reports: `date`, `query`, `page`, `country`, `device`, `query,page`. Sitemaps GET is optional and has its own `OPEN` status if unauthorized. Page indexing coverage, CWV, HTTPS reports and rich-result enhancements are **not established by this Search Analytics adapter**. Do not claim they are tested without separate appropriate sources/UI exports. `urlInspection.index.inspect` has per-URL scope and quota; one inspected URL cannot prove site-wide index state.

Metrics: clicks, impressions, CTR and position. Annual CTR = total clicks / total impressions using **property-level daily rows**. Aggregate average position must be impression-weighted; do not average daily positions equally. Query-based / page-based rows may use different aggregation rules and should not be naively summed to property totals. Never equate CTR improvements with customer conversion improvements.

Historical coverage: Google Search Console performance typically makes about 16 months accessible. The previous annual window in 24-month comparison can be partially missing. All missing months are UNKNOWN, not zero. Do not compute a complete 12m-vs-12m YoY without both windows sufficiently covered. Prefer actual comparable subsets or MoM with dates and caveats.

Full UAT needs authorized property, correct Domain/URL-prefix identity, actual API response, zero known pagination errors, quality inspection, Chinese report, and applicable business cross-source evidence. Keep live rows under protected `.private-gsc` (gitignored). This public repository contains only rule/code/tests and the Owner's generic prompt, no real SEO queries/metrics or OAuth credentials.

## Domain-ownership gate (2026-10-31)
The YBY ERP Local historical snapshot exposed mislabeled legacy-domain page URLs under a new-domain site key. After Search Analytics returns page/query-page rows, reject every URL outside the verified Domain Property (exact domain or dotted subdomain) or URL-prefix property (scheme, host and path prefix). Do not merge legacy `yby-irrigation.com` and new `ybyirrigation.com` data without separately authenticated properties and a documented comparison. This reader fails closed; repair historical ERP imports only through a separately approved, reversible workflow. No raw private records belong in this public repo.

## Offline GSC Search Results CSV mode

Existing official Web Search Results CSV can be imported offline without OAuth using `gsc-import.mjs`, an explicit source manifest, and the documented CSV header format. A user-declared property is NOT verified by Google sites.list. Dates/Chart CSV is required as the totals source; Queries/Pages/Countries/Devices are optional but their absence stays OPEN. UI dimensional exports are often restricted to 1,000 representative rows; missing rows do not mean zero. The importer refuses old/new cross-domain page mixing, malformed or non-ISO date rows, unsafe file paths, partial/ambiguous headers and invalid numeric metrics. It does not manufacture Query×Page mappings, YoY history, sitemap, indexing, CWV or business conversions. Read `references/ui-csv-import.md` for required source provenance and limitations.

### Filter-scope provenance gate

When `filters` is nonempty, the CSV chart total describes only the **declared filtered view**, never all-site performance. Evidence includes `totals_scope=FILTERED_VIEW_USER_DECLARED`; no-filter manifest uses `UNFILTERED_VIEW_USER_DECLARED`, still not independently authenticated. Each declared filter value must be a non-empty string and only the known filter keys are permitted. These are user declarations, not proof of actual Google UI filter settings.

## Existing authenticated Chrome UI browser read

When the Owner has already opened GSC in their authorized Chrome profile, a read-only `execute javascript` of *visible DOM text* from that existing property tab can establish current **UI** report evidence without requesting another OAuth token or CSV export. The optional AppleScript `scripts/gsc-browser-ui.applescript <bare-domain>` checks exact `resource_id` decoded as `sc-domain:<domain>` and returns a private JSON snapshot; it never opens/navigates Chrome or accesses browser storage/cookies, Google OAuth APIs, DevTools tokens or passwords. This specific script supports **Domain Properties only**; use explicitly verified alternative workflows for URL-prefix properties.

Do not conflate `GSC_EXISTING_CHROME_UI_READONLY` with API `GOOGLE_SEARCH_CONSOLE_API_READONLY` or offline `GSC_UI_CSV_EXPORT_OFFLINE`. Capture report title, property, date window, Web/Image/Video/News type, filters, visible metrics and any missing tabs; a default three-month chart cannot meet 12-month historical coverage. UI queries/pages may omit anonymized/low-volume queries, so only the main Performance card totals represent that displayed report scope. GSC Indexing/HTTPS/CWV views have independent refresh dates and sources, and Sitemap submissions/read dates must be preserved. Never interpret a historical GSC 'Couldn't fetch' as a current website outage without separately checking the live sitemap URL. Do not make GSC configuration changes, submit a sitemap, click Validate Fix, alter WordPress or reassign historical ERP data without separate Owner approval.
