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
