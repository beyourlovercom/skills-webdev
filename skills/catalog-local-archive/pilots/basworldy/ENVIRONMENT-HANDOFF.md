# BASWORLDY — environment mapping and current status

**Recorded:** 2026-11-02

## Source vs target
Source research site: `basworld.com`. No permission for copying source assets, descriptions, HTML or catalog records has been verified.

New target project: **basworldy.com**.

- **Windows Local site:** `localdev.basworldy.com` — requested LocalWP development address.
- **Online site / Dev UAT:** `https://dev.basworldy.com`.
- **Future main website:** `https://basworldy.com` — not the present deployment target.

Do not misinterpret `dev.basworldy.com` as the public root or automatically redirect/index it. Keep noindex on Dev.

## Windows observations
- BYL DC official link: `windows` device READY; Node v24.18.0 and Git available.
- Existing LocalWP Nginx is listening on ports 80/443; do not replace or restart it.
- Windows hosts file does not currently contain `basworldy`; DNS resolution of `localdev.basworldy.com` failed at time of inspection. **Hostname activation OPEN**.
- Pilot files and original test evidence are isolated under `C:\Users\Administrator\Documents\catalog-local-archive-pilot-20261102`.
- Synthetic fixture: 4 vehicles; Node unit checks 37 PASS, Windows Chrome offline checks 17 PASS, including product details, local SVG, filters, sort and mobile overflow, with 0 remote requests.
- `file://` offline PASS is not a domain-hosted LocalWP PASS.
- Online Dev existence, credentials, platform and deployment status have **not** been independently verified. No production or Dev writes approved.

## Recommended next controlled step
1. Read-only audit LocalWP's existing `localdev.basworldy.com` site registry and site directory, if any. Do not assume a new site or domain exists.
2. If no collision, create an isolated LocalWP site / dedicated local vhost by its supported workflow, with verified hosts mapping, without touching other websites.
3. Replay browser UAT at the exact local hostname, preserve screenshots and local image load evidence.
4. Only after a separately approved Dev scope and real content rights evidence, plan a small licensed-page Canary on `dev.basworldy.com`; **no all-product expansion**.

## Gate summary
`DESIGN_READY=PASS` / `FIXTURE_UNIT_PASS=37` / `OFFLINE_BROWSER_PASS=17` / `LOCAL_HOSTNAME_UAT=OPEN` / `SOURCE_ARCHIVE=BLOCKED_RIGHTS` / `ONLINE_DEV=UNVERIFIED` / `WWW=BLOCKED` / `INDEXING=HOLD`.


## 2026-11-02 — Actual Windows LocalWP host UAT (supersedes earlier OPEN hostname state)

- The isolated `basworldy-local` site was created through LocalWP's authenticated local site manager (job `x1dJkWZfo`: `successful`; LocalWP site ID `BgNoFMOb5`).
- Registered origin: `http://localdev.basworldy.com`; dedicated WordPress path: `D:\ai\basworldy-local\app\public`.
- LocalWP created the domain hosts mapping and its own router configuration. No existing READY device restart and no manual shared router overwrite.
- Copied exactly seven self-authored pilot files into `D:\ai\basworldy-local\app\public\catalog-pilot`; SHA256 source/destination comparisons `7/7` matched. No other WP themes/plugins/databases modified.
- Real no-proxy HTTP: domain root, `catalog-pilot/index.html`, `detail.html?id=DEMO-001`, `assets/vehicle.svg`, `site.js` all `200`.
- Windows Chrome via isolated headless CDP profile at exact host: `LOCAL_HOST_BROWSER_PASS`, `18/18` checks, including 4 cards, local image load, brand + year filtering, reset, sort, detail, mobile 375px (0 overflow); zero HTTP(S) requests to nonlocal domains. All external origins were filtered by exact hostname, allowing this host's own HTTP and HTTPS requests.
- Screenshots: `C:\Users\Administrator\Documents\catalog-local-archive-pilot-20261102\browser-evidence-host\{list-desktop,filtered-list-desktop,detail-desktop,list-mobile}.png`.
- Postflight LocalWP registered **7** sites: BASWORLDY one matching host running; original six preserved in registry. One pre-existing named site is halted, so a 502 response on its URL must not be misattributed to this pilot.
- Unit `FIXTURE_UNIT_PASS`: 37 checks. Full site and content remain synthetic; source catalog archive still `BLOCKED_RIGHTS`.
- `dev.basworldy.com` is unverified and untouched; `basworldy.com` untouched; `INDEXING=HOLD`.

**Current gates:** `DESIGN_READY=PASS`, `FIXTURE_UNIT_PASS=37`, `OFFLINE_BROWSER_PASS=17`, `LOCALWP_HOST=PASS`, `HTTP_HOST=PASS`, `HOST_BROWSER_PASS=18`, `SOURCE_ARCHIVE=BLOCKED_RIGHTS`, `DEV=UNVERIFIED/NO_DEPLOY`, `WWW=BLOCKED`.

**Next**: Obtain a verifiable license and exact minimal URL/photo allowlist before actual BAS World capture. Separately establish the target Dev runtime and authorize a controlled Dev-only release; never infer authorization from the hostname.


### Additional completion: hostname root navigation

The BASWORLDY-local-only MU file `D:\ai\basworldy-local\app\public\wp-content\mu-plugins\basworldy-local-home.php` sends root `/` to `/catalog-pilot/index.html` (HTTP 302 → 200). PHP lint PASS. This adds no WordPress product records or external API integrations. Local admin credential is ACL-restricted and never added to public GitHub. As of the read-only Windows lookup, the online Dev hostname `dev.basworldy.com` did not resolve; further Dev work remains separately gated.
