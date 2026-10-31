---
name: gsc-site-intelligence
description: S1 Google Search Console read-only property verification, search performance and SEO/URL mapping; follow original Owner GSC prompt and generate Chinese Word/Codex handoff only from proven data.
---

# GSC Site Intelligence · S1

## Must-read references

1. [`references/analysis-prompt.txt`](references/analysis-prompt.txt) — Owner-approved Chinese GSC analytical specification; keep byte-for-byte and read FIRST.
2. [`references/data-contract.md`](references/data-contract.md) — Search Console OAuth/API semantics, missing data, anonymity, pagination, index coverage limits.
3. [`references/report-contract.md`](references/report-contract.md) — document, evidence, spreadsheet and Codex handoff requirements.
4. [`references/ui-csv-import.md`](references/ui-csv-import.md) — existing official CSV offline import and source limits.

Target site `AGENTS.md`, Owner permissions, current GitHub SHA and any site-specific S0 profile outrank shared procedure. This document is not OAuth authorization or a ChatGPT-native installed Skill.

## Read-only acquisition and identity gate

1. Prefer an **already authorized** GSC connector or mature Skill, and verify its *actual property ID/siteUrl* from live response; never infer from website tags, screenshots, GSC link, or another site's credentials.
2. If using local, authorized Google OAuth with scope `https://www.googleapis.com/auth/webmasters.readonly`, supply it through protected environment variable `GSC_READONLY_ACCESS_TOKEN` (never in the chat or CLI arguments). On Node 20+ use:

   ```shell
   node skills/gsc-site-intelligence/scripts/gsc-read.mjs --domain example.com --dry-run
   node skills/gsc-site-intelligence/scripts/gsc-read.mjs --domain example.com --property sc-domain:example.com
   ```

   API adapter lists authorized properties (`sites.list`), requires an exact matching Domain Property (`sc-domain:example.com`) or matching URL-prefix, rejects unverified/wrong domain, and requires explicit `--property` if multiple match. **Also fail closed when a returned page URL belongs to a different host/domain than the verified property; a previously imported ERP site label does not prove URL ownership.** `--dry-run` performs **no network call**, and is not UAT PASS. By default it only reads `web` search type. For image/video/news, run separate invocations and do not merge into Web totals.
3. **Without a new OAuth connection:** use an existing official GSC Search Results Web CSV export with `gsc-import.mjs` and the [manifest template](examples/ui-csv-manifest.example.json), following `references/ui-csv-import.md`. This source remains `PARTIAL_OFFLINE_EXPORT_UNVERIFIED` and must never be described as a Google API property-verification PASS. Never import `yby-irrigation.com` as `ybyirrigation.com`.
4. Fetch latest 12 *complete* GSC Pacific-time calendar months and preceding 12 months separately. GSC history is typically ~16 months, so prior 12-month coverage is typically incomplete — **never claim unsupported YoY**.
5. Read `date`, `query`, `page`, `country`, `device`, `query × page` dimensions with explicit pagination (25,000 limit per call, bounded extraction); read Sitemaps if authorized. **Search Analytics returns top rows and anonymizes queries**; even complete pagination is not the total query universe. Property-level daily totals are the comparison baseline; do not sum `query` or `query × page` rows as traffic totals.
6. Search Analytics API does **not** provide a complete site-wide indexed/not-indexed page inventory, full CWV report, HTTPS or enhancement reports; request approved UI exports/screenshots, other authorized APIs, or mark `OPEN`. Do not misrepresent one URL Inspection result as full-site index coverage.
7. No GA4/Ads/CRM join unless each independent source and matching period are truly accessible; GSC organic clicks are not qualified leads or orders. Capture country/market, canonical ownership, intended old/new relationship, dataState and limitations.

## Evidence files and analysis

- Both API and offline import paths write `gsc-evidence.json` to private, git-ignored `.private-gsc/<domain>/`, preserving property, permissions, date periods, filters, raw returned top rows, source, API limitations, and status. It never writes credentials; no live reports or customer/search exports are committed to the Public Skills repository. A second output at the same path fails closed rather than overwriting existing evidence.
- Compare impressions, clicks, weighted CTR and average position using eligible, comparable data; flag missing days/months, low-volume privacy filtering, top-N bounds and canonical/URL-prefix coverage. Do not interpret average position as a fixed rank or search correlation as cause.
- Produce country/language/page/intent-specific keyword clusters and an evidence-linked keyword → URL map, possible cannibalization hypotheses, site migration vs coexist recommendations, P0/P1/P2 page priority, title/H1/internal link/structured data/CWV review plan, and 30/60/90-day monitoring. Treat hypotheses as hypotheses.

## Output and acceptance

Produce a professional **Chinese Word** 《旧站 GSC 搜索表现分析与新站建设指导报告》, brief chat summary and final *copyable Codex prompt*, following every requested section in original TXT. When real source rows exist, provide keyword/page/URL mapping and SEO opportunity CSV/XLSX; do not fabricate blank metrics. Use separate authorized document authoring tooling; raw API script only creates evidence JSON, not DOCX. If unavailable, mark Word `OPEN`.

Mark `PASS` only for actual property-verified read, relevant full evidence and outputs; offline CSV imports are always partial and unverified by Google API; `PARTIAL` if read works but historical comparison, missing reports or qualified business outcomes remain unverified; `BLOCKED` if no token/connector, property mismatch, missing data, incomplete bounded pages or unauthorized access. Never use source-only tests to claim live UAT PASS.

No change to Google properties, ads, robots, sitemap, WordPress, GitHub main or WWW without separately approved scope. Any implementation change follows target site's Local → Dev → WWW requirements and production Owner `pass` gate.
