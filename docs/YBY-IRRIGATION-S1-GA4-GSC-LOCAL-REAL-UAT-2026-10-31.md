# YBY Irrigation · S1 GA4/GSC authenticated read UAT · 2026-10-31

**Result: BLOCKED — exact runtime blockers established.** This is a read-only Local preflight, not a real Google Analytics/Search Console dataset, a GA4/GSC authorization proof or a Word report.

## Source and scopes
- GA4 Skill: Draft PR #4, head `3d22b19a6bd9a82cb97c55ac0dacbcce4a86cf8f`, mock/contract CI previously PASS.
- GSC Skill: Draft PR #6, initial head `e2dac98d4ba908ad9db7620a2a70f38a446d9197`, mock/contract CI previously PASS.
- Independently identified pre-existing YBY ERP Traffic OS Laravel GA4/GSC **read clients and dry-run console commands**. This is a reuse *candidate*, not proof its accounts are authenticated.
- Read-only review confirmed GA4/GSC `dry_run` branches return **before** DB writes; normal `apply` branches were NOT invoked.
- The GSC property value `sc-domain:ybyirrigation.com` was found as the client code's **default configuration**. This does NOT verify `sites.list` ownership or API permission.
- An existing GA4 measurement tag default in code is NOT a GA4 numeric property ID or API permission.

## Real Windows Local process results
1. Windows PHP CLI 8.3 loaded **no php.ini** and `PDO` but not `pdo_mysql`.
2. Initial GSC dry-run for YBY project, the configured GSC domain and a 2026-10-01 through 2026-10-03 date window returned `blocked=["unexpected_error"]`.
3. Independent read-only database migration-status probe returned `could not find driver` for MySQL; the failure happened before an authenticated Google API read.
4. The *already installed* `php_pdo_mysql.dll` was verified in the system's PHP extension directory. For **one process only**, `php -c <existing-local-ini> -d extension=php_pdo_mysql.dll` made `pdo_mysql` available. No global configuration/file edit or restart.
5. Repeating the same **GSC --dry-run** returned `blocked=["credentials_missing"]`, with `query_rows_seen=0` and `daily_rows_applied=0`. Therefore Google data was not retrieved.
6. **GA4 --dry-run** without a verified numeric GA4 Property ID returned `blocked=["missing_required_option"]`. No GA4 API read was attempted.
7. In the selected Windows process environment, `GA4_READONLY_ACCESS_TOKEN` and `GOOGLE_APPLICATION_CREDENTIALS` had not been set; direct secure GA4/GSC credentials were not found in the specific examined local app environment. This does not establish the user's full Google-account authorization status.

## Honest acceptance table
| Gate | Outcome | Evidence |
|---|---|---|
| Public Skill source and mocked automated tests | PASS (prior runs only) | PR #4 / #6 CI |
| Local PHP isolated MySQL PDO enablement | PASS | `php -m` readback for one-process override |
| Existing GSC local client dry-run | BLOCKED | `credentials_missing` |
| Existing GA4 local client dry-run | BLOCKED | `missing_required_option` |
| Google Web stream / property ownership validation | OPEN | No live Admin API / sites.list response |
| Actual performance data extraction / business validation | OPEN | No successful authorized read |
| Chinese Word reports and Codex handoffs based on live data | OPEN | No authenticated data |
| Production, ERP database, Google settings or PR merge write | NONE | Dry-run and read-only inspection only |

## Smallest next authorized action
1. Identify the user's approved **GA4 numeric Property ID** and matching Web stream for `ybyirrigation.com`. An existing Measurement ID does not replace Property ID.
2. Establish a **permitted, private, read-only** Google auth path for that GA4 property and `sc-domain:ybyirrigation.com` GSC site. Reuse existing credential management if valid, otherwise connect via a supported authorized connector. Do not put tokens, client secrets or customer exports in this Public repository or chat.
3. With the existing isolated PDO override, re-run GSC `--dry-run` and GA4 `--dry-run` with the confirmed property ID, then verify account identity/periods and complete source-backed analytics. Only after actual reads generate Chinese reports and Codex handoffs.
4. No `--apply`, global PHP edits, device restart, OAuth expansion, PR merge, production write or browser restart is authorized by this record.

This document is an audit trail. **`credentials_missing` and `missing_required_option` are blockers, not successful Google API results.**
