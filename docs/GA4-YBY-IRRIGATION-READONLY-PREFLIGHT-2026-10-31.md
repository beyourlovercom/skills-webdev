# GA4 YBY Irrigation · 2026-10-31 read-only UAT preflight

**State: BLOCKED at external data authorization.** No real GA4 report was retrieved; this is not a live-data UAT PASS.

- Canonical GA4 Skill: `beyourlovercom/skills-webdev` Draft PR #4, source `3d22b19a6bd9a82cb97c55ac0dacbcce4a86cf8f`; earlier exact GitHub CI 23/23 PASS (mocked/contract checks only).
- Authorized self-hosted DC Windows device READY; Windows Node command available.
- On the selected Windows process environment `GA4_READONLY_ACCESS_TOKEN` and `GOOGLE_APPLICATION_CREDENTIALS` are **not present**; `gcloud` was not found. No credentials or account secrets were read or printed.
- Existing Mac/Windows GA4/GSC directories were inspected by file names only; no evidence their tokens/property belong to `ybyirrigation.com`. Reuse of another business domain's secrets was prohibited.
- Actual target GA4 Property ID and matching Web stream not verified, no live Admin GET/Data runReport, no Chinese Word report from live data.

## Next read-only authorization gate

Provide an authorized GA4 connection with verified `analytics.readonly` access to the specific YBY Irrigation property (or an export containing property ID, Web stream and metadata with matching site). Re-run exact property/domain check and Data API 12 complete months plus comparable period; keep output protected off Public GitHub. A browser login on a different Google service does not automatically confer GA4 API access.

**No Production, Ads, WordPress, GA4 settings or GitHub `main` write performed.**
