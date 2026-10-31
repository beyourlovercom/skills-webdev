---
name: ga4-site-intelligence
description: S1 GA4 real property/stream verification, read-only last 12 full months with YoY, attribution and conversion-quality assessment, Chinese Word report and Codex new-site handoff. Use for owned sites needing historical GA4 analysis.
---

# GA4 Site Intelligence (S1)

**Owner source of truth:** [`references/analysis-prompt.txt`](references/analysis-prompt.txt) is the Owner-uploaded original GA4 TXT, preserved verbatim; read it FIRST. Do not silently alter its requested sections, requirements, Chinese Word report, or Codex handoff. Then read [`references/data-contract.md`](references/data-contract.md) and [`references/report-contract.md`](references/report-contract.md).

## Trigger and inputs

Use for GA4 historical analytics, site rebuilding, traffic attribution, landing-page/market analysis, and S1 research. Input the old website domain, new site or `待定`, business goals, markets and available authorized data. Honor project `AGENTS.md`, actual repo SHA, S0 project profile, and Owner instructions. Missing noncritical preferences must not stall read-only analysis.

## Authorization-first acquisition

1. Prefer already authorized GA4 Skills or plugins/tools, if available: verify **exact GA4 property ID, matching Web stream hostname, timezone, currency and declared key events**. A Skill document or Chrome login alone does not establish GA4 read permissions.
2. For a local/approved runner with a legitimate Google OAuth `analytics.readonly` token in protected environment variable `GA4_READONLY_ACCESS_TOKEN`, use this **real Node 20+ executable adapter** (zero npm dependencies):

   ```sh
   node skills/ga4-site-intelligence/scripts/ga4-read.mjs --property 123456789 --domain example.com --dry-run
   node skills/ga4-site-intelligence/scripts/ga4-read.mjs --property 123456789 --domain example.com
   ```

   Only authenticated GA4 Admin **GET** and Data API **runReport** reads are made, after verifying Web stream domain. Output goes to git-ignored `.private-ga4/<domain>/`; `--dry-run` makes NO network call and is NOT analytics PASS. Never print/store access tokens, ask users to paste passwords, expand OAuth privileges, or change a production GA4 property without Owner authorization.
3. If a connected tool or mature private Skill supplies real GA4 results, use those instead and normalize the same evidence fields. If neither connected tool nor token exists, ask for authorized access or real exports (property metadata, timezone/currency, streams/key-event definitions, monthly/channel/landing-page/geo-device/event/acquisition reports, current + preceding period, extraction/filter metadata). Mark `NOT_CONNECTED` or `NO_ACCESS`; do NOT invent numbers.

## Evidence and diagnostics

- Compute recent **12 complete calendar months** using the *verified property timezone*, compare the prior equivalent 12 months; if fewer historical months, explain data completeness and limit comparisons. Never sum monthly `activeUsers` as unique annual users.
- Evaluate tracking gaps, thresholding, `(other)` grouping, internal/bot traffic, duplicate tags, consent, self-referrals/cross-domain, attribution and key-event definition changes. Only call an issue confirmed if actual evidence supports it.
- Cover monthly users/sessions/engagement/key-events, channels, organic landing pages, high/low performing content, country and device differences, user journeys where tracked, qualified-lead limitations and seasonality. GA4 `form_submit`, `click_whatsapp`, `purchase` etc. are event observations, not automatic proof of CRM-qualified leads or settled payments.
- Cross-check GSC/Google Ads/CRM/WP/commerce ONLY if each additional connection is authorized, clearly label its source, period and matching key; otherwise list OPEN. Source-specific data must stay in protected storage, never the public Skill repo.
- Create P0/P1/P2 page/information-architecture recommendations, tracking/event tables, before-launch SEO/mobile/conversion checklist, 30/60/90-day plan, and a ranked action list with actual source evidence, estimated work, verification and risks.

## Deliverables / acceptance

- Produce the **professional Chinese Word** titled 《旧站 GA4 数据分析与新站建设指导报告》 and brief chat summary, with the sections in Owner TXT and a final *copyable Codex prompt* to check a new site's delta and implement **only after Owner approval** under Local→Dev→WWW release gates. Use available Word authoring tooling; `ga4-evidence.json` is source input, **not** a completed Word report. If no Word authoring tool, report Word artifact `OPEN`.
- Per-data claim record: actual property, Web stream matching outcome, time range, filters, date collected, metric semantics and source; separate fact / inference / hypothesis. Never fabricate analytics access, event-to-lead joins or YoY. Severe tracking problems require constrained claims.
- Return stage `PASS` only for fully tested authorized work; `PARTIAL` for verified but incomplete data; `BLOCKED` for no authorization, wrong property/host, polluted multi-domain data or incomplete API pages. The API reader intentionally returns `PARTIAL_REQUIRES_BUSINESS_VALIDATION` even when raw GA4 reports load, because GA4 alone cannot prove lead quality and Word delivery.
- Record site/host, tool, source, exact code SHA when applicable, output evidence location, actual test status, impact and next gate. No production/site/Ads/GA4 settings writes, PR merges, forced Chrome/browser restart or device restart in this Skill.
