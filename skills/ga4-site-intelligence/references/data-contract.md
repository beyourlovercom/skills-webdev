# GA4 data-contract: authoritative API behavior and quality

Only authenticated Google Analytics Admin GET and Data API `runReport` read. Official: https://developers.google.com/analytics/devguides/config/admin/v1/rest and https://developers.google.com/analytics/devguides/reporting/data/v1/rest/v1beta/properties/runReport . The OAuth scope is `https://www.googleapis.com/auth/analytics.readonly`.

- `GET /v1beta/properties/{id}` verifies name, timezone and currency.
- `GET /v1beta/properties/{id}/dataStreams` pages through Web streams and matches the requested domain. Mixing unrelated Web domains blocks data because aggregate results cannot be attributed safely.
- `GET /v1beta/properties/{id}/keyEvents` lists CURRENT key event names, not proof that the same settings were used throughout history.
- `POST /v1beta/properties/{id}:runReport` reads reports, with rowCount pagination and `metadata.subjectToThresholding` / `metadata.dataLossFromOtherRow` surfaced.

| report | dimensions | metrics |
|---|---|---|
| monthly | yearMonth | sessions, activeUsers, engagedSessions, keyEvents |
| channels | sessionDefaultChannelGroup | sessions, engagedSessions, keyEvents |
| landing_pages | landingPage | sessions, engagedSessions, keyEvents |
| countries_devices | country, deviceCategory | sessions, keyEvents |
| events | eventName | eventCount, keyEvents |
| acquisition_sources | sessionSourceMedium | sessions, keyEvents |

The code reads each report for the **latest 12 full property-local months** and the 12 months immediately preceding. Session totals may be aggregated over months; monthly `activeUsers` totals must NOT be summed to claim de-duplicated annual users. GA4 keyEvents depend on event configuration/attribution and may not be comparable after configuration changes. GA4 reports are not GA4-GSC keyword rankings unless actual GSC data is separately connected.

**Lead quality**: `click_whatsapp`/`click_email`/`form_start` are interactions; form submit may reflect technical tracking or spam; unique real form submissions need WP/CRM Case IDs; qualified enquiries, orders, revenue/refunds require actual business-source validation. A GA4 event is not a qualified business lead.

States: `AUTHORIZED` only when real account/GA4 property access confirmed; `NOT_CONNECTED`/`NO_ACCESS`/`UNKNOWN` preserve distinct gaps. `PARTIAL` means some verified data but no complete analytic/Word/qualified-lead acceptance; `BLOCKED` means wrong host, absent permission, truncated pages or untrustworthy mixing. Data exports are commercial/private: use `.private-ga4/` or an approved off-repo location and **never commit**. Store only sanitized status/metadata in public GitHub.
