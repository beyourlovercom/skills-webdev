# S0 evidence input contract (v1)
A minimal sanitized JSON file is used alongside automatic **local project file marker detection**. External account data must be gathered only through an authenticated connector or authorized manual export, and then represented as source metadata. This CLI does not log into or claim to pull GA4/GSC/Ads/Semrush, doesn't remotely inspect Windows, and does not deploy.
```json
{
  "brand": "Example",
  "business_model": "B2B",
  "product_type": "irrigation",
  "conversion_goal": "qualified lead",
  "cms": "WordPress",
  "commerce": "none",
  "relation": "coexist",
  "target_markets": ["GH", "ZM"],
  "languages": ["en"],
  "currencies": ["USD"],
  "environments": {"local": "UNKNOWN", "dev": "UNKNOWN", "www": "https://example.org"},
  "data_sources": {"ga4":"NOT_CONNECTED","gsc":"UNKNOWN","ads":"UNKNOWN","semrush":"UNKNOWN"},
  "sources": ["verified GitHub path and SHA, date"],
  "field_evidence": {"cms":"code marker at SHA or runtime checked time"},
  "observed_at": "2026-10-30"
}
```
Required command arguments: `--domain`, `--project-root`, `--evidence`, `--output-root`. By default outputs a **dry-run only**; add `--write` to change the chosen local checkout. Choose the destination **project** repository, not this public foundation repository, for generated site-specific artifacts. All unprovided facts are UNKNOWN.
Relation is one of `migration`, `coexist`, `new`, `UNKNOWN`. Business model one of `B2B`, `B2C`, `B2B+B2C`, `CONTENT`, `UNKNOWN`. Data source statuses one of AUTHORIZED/NOT_CONNECTED/NO_ACCESS/UNKNOWN.
`AGENTS.md` is read at workflow level for governance and is not rewritten by the generator. The code only checks for its presence and file hints; it does **not** parse arbitrary AGENTS content as permissions.
An existing SKILL file without S0-managed markers causes `CONFLICT_UNMANAGED`, a nonzero return and no overwrite. Human notes **outside** the managed block stay intact. Re-running with new evidence only updates the managed block and S0-owned site profile/roadmap/evidence index.
**MVP limitation:** a field in sanitized evidence is a stated input, not independent corroboration. Every relevant field must have a real evidence pointer verified at workflow review. The next enhancement is read-only authorized connector intake and runtime inspection.
