# BASWORLDY · Catalog Local Archive Pilot — Windows Local UAT

Date: 2026-11-02. Scope: **synthetic offline catalog pilot**. This is not BAS World website/source backup.

## Scope and source boundaries
- Public research source: `basworld.com` (actual source canonical URL not yet verified; no third-party HTML, photos, description, logo or vehicle data copied).
- New site target `basworldy.com` is **not** deployed; online Dev `dev.basworldy.com` is unverified and untouched.
- Windows Local host `http://localdev.basworldy.com`, actual pilot URL `http://localdev.basworldy.com/catalog-pilot/index.html`.
- Owner-authenticated LocalWP used to create one isolated site: `basworldy-local`, site ID `BgNoFMOb5`, job `x1dJkWZfo` completed `successful`. Site root: `D:\ai\basworldy-local\app\public`. Existing six LocalWP sites remain registered; no pre-existing site was replaced.
- No user data, payment, live email, analytics, customer orders, source cookies, external tracking scripts, or paid services.

## Evidence matrix

| Test | Observed | Verdict |
|---|---|---|
| Distinct site registration and domain mapping | 1 domain match among 7 LocalWP sites, status running | PASS |
| Content deployment | Exactly 7 self-authored files copied; 7/7 SHA256 identical | PASS |
| HTTP root/catalog/detail/SVG/JS | All five direct no-proxy requests returned 200 | PASS |
| Fixture unit and integrity | 37 assertions, 4 fictitious vehicles, 1 self-authored SVG | PASS |
| Previous offline file:// Chrome UAT | 17 assertions, no network calls | PASS |
| Exact-host Chrome UAT | 18 assertions with isolated temp profile | PASS |
| Details and local image | Full detail text and image naturalWidth > 0 | PASS |
| Interactive filters and sorting | Brand, minimum year, reset, price low-first | PASS |
| Desktop/mobile | Screenshots at 1440px and 375px; mobile overflow 0px | PASS |
| External-domain requests | 0; audited Chrome requests by hostname; local HTTP(S) allowed | PASS |
| Real BAS World content and photo archive | No licensed source capture performed | BLOCKED_RIGHTS |
| Online Dev deployment | Not authorized, no changes | BLOCKED |
| Public WWW deployment/indexing | Not authorized, no changes | BLOCKED/HOLD |

## Windows evidence
- App files: `D:\ai\basworldy-local\app\public\catalog-pilot`
- Isolated fixture source: `C:\Users\Administrator\Documents\catalog-local-archive-pilot-20261102\demo`
- Test commands: `node scripts/verify-demo.mjs` and `node scripts/browser-host-uat.mjs` (from isolated source folder).
- Actual Chrome captures: `C:\Users\Administrator\Documents\catalog-local-archive-pilot-20261102\browser-evidence-host\list-desktop.png`, `filtered-list-desktop.png`, `detail-desktop.png`, `list-mobile.png`.
- LocalWP admin credential was randomly generated and saved privately on Windows; no password is committed to GitHub.
- No reboot, Chrome profile disruption, or manual modification of shared router config. Only LocalWP's own create-site machinery registered site and host.

## Findings and limitations
- A default proxy-influenced HTTP request once returned 502; no-proxy direct HTTP and actual Chrome host requests succeeded. LocalWP's `devybyworld` site is in halted status, so its 502 response is not evidence of interference.
- The generated image represents an original fictitious truck, not any actual BAS World product photo.
- Live-source accuracy, variable stock, image capture completeness, real category pagination/filter mapping and visual likeness are **not** tested. No claim of 99% fidelity.

## Expansion criteria
Before any real source import: verify explicit content/photo/domain permissions and approved small URL allowlist; implement bounded asset intake with hashes and no unauthorized recursive crawling; run a fresh source-vs-local comparison on approved pages. Before any Dev deploy: separate exact-host/commit/scope Owner approval, non-indexing, rollback and real readback. Full catalog expansion remains blocked.

## Overall status
`DESIGN_READY` + `FIXTURE_UNIT_PASS` + `OFFLINE_BROWSER_PASS` + `LOCAL_HOST_BROWSER_PASS`.
`SOURCE_ARCHIVE=BLOCKED_RIGHTS` · `DEV_NOT_DEPLOYED` · `WWW_NOT_DEPLOYED` · `INDEXING_HOLD`.


## Addendum — bare-domain homepage and Dev preflight

- Created one local-only WordPress MU adapter at `wp-content/mu-plugins/basworldy-local-home.php`, scoped by an exact host check. `php -l` passed.
- Bare `http://localdev.basworldy.com/` returns HTTP `302` to `/catalog-pilot/index.html`; following redirect returns HTTP `200`.
- LocalWP admin password is held only in Windows in a private file. ACL now permits only the Windows Administrator account, SYSTEM and Administrators; secrets were never committed or displayed.
- Windows read-only external preflight: `dev.basworldy.com` DNS lookup was unresolved from that device and curl returned 000. This is not proof that DNS is globally absent. No online changes.
- Root redirect is reversible by removing **only** the BASWORLDY local MU file; do not touch shared LocalWP routes or other sites. No migration or deployment to Dev/WWW.
