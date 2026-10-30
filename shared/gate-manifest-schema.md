# Stage gate manifest (S1–S6)
This validator reads a JSON object matching `shared/handoff-contract.md`. Fields: `stage`, `site`, `environment` (`Research`, `Local`, `Dev`, `WWW`), `checked_at_utc`, `source_references`, `head_sha` (mandatory for S2), `tests` (array of `{id,result,evidence}`), and `approvals` (array of `{scope,state,reference}`). Synthetic fixture: `fixtures/sample-s1-manifest.json`.

**Required test IDs**
- S1: `source_traceability`, `conversion_quality`, `keyword_url_map`
- S2-A: `local_browser`, `business_flow`, `isolated_local`
- S2-B: `dev_browser`, `business_flow`, `index_isolation`, `rollback_ready`
- S2-C: `approved_delta`, `www_readback`, `rollback_ready`, `live_data_preserved` plus Owner approval `scope: WWW release`
- S3: `live_event_readback`, `conversion_reconciliation`, `deduplication`
- S4: `keyword_url_map`, `change_scope`, `rollback_ready`; any `change_type: code` is BLOCKED and returns to S2
- S5: `content_rights`, `brand_uniqueness`, `editorial_review`; `bulk_replace: true` requires `scope: Bulk content update` approved
- S6: `fact_check`, `asset_rights`, `editorial_review`; `publish_mode: schedule|publish|auto_publish` requires `publish_policy` PASS and `scope: Content publishing policy` approved

A PASS check needs non-UNKNOWN evidence. A policy PASS is **manifest structure validation**, not proof that Owner actually granted approval, or that screenshots/transactions/GA4 connections are genuine. A human or separately authorized runtime audit must verify references. Use this tool for automatic BLOCKED detection, not self-issued authorization.