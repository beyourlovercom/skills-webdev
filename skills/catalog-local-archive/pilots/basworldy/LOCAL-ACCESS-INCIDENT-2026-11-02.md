# BASWORLDY Windows Local browser-access diagnosis — 2026-11-02

## Reported symptom
Owner's browser displayed: "localdev.basworldy.com currently unable to handle this request".

## Runtime evidence
- Windows development machine `windows` (hostname `YST-241030SSD`): exact local domain resolves to `::1` and `127.0.0.1` through its LocalWP-created hosts mappings. Local HTTP root and vehicle catalog: `200`. HTTPS root (curl -k): `200`. WordPress admin `302` to login, visual QA `200`.
- BASWORLDY local PHP log contains WP-CLI PHP extension warnings related to earlier misselected 32-bit PHP. No contemporaneous web-request Fatal Error established.
- Second authorized machine `007windows` (hostname `007`): **initially unable to resolve** `localdev.basworldy.com`. However a direct Tailscale-host-header probe with `curl --resolve localdev.basworldy.com:80:100.87.29.56` returned `200`. Therefore local networking/site functionality worked; the specific obstacle on this device was hostname mapping.
- China Mac (Tailscale IP `100.102.15.40`) initially could not resolve the hostname. Explicit Tailscale/IP/Host-header HTTP probe reached development Windows machine and returned `200`. Its `/etc/hosts` is not edited because noninteractive sudo/admin privileges were not available.
- The site is LocalWP and the domain is **not public DNS**. Users on devices without private hosts mapping or private DNS cannot expect the hostname to resolve.

## Narrow repair, 007windows only
1. Preserved original hosts file backup: `C:\Windows\System32\drivers\etc\hosts.basworldy-20261102.bak`.
2. Appended exactly: `100.87.29.56 localdev.basworldy.com # BASWORLDY Local over Tailscale`.
3. Verified hostname now resolves to `100.87.29.56`.
4. Via default curl and no-proxy curl (real domain, no forced DNS), confirmed:
   - `http://localdev.basworldy.com/` -> `200`;
   - `/vehicles/` -> `200`;
   - `/vehicles/atlas-hx-520/` -> `200`;
   - `/review-local/` -> `200`;
   - HTTPS endpoint -> `200` using `curl -k` (certificate trust not verified).
5. No changes to public DNS, LocalWP router, primary Windows hosts file, system firewall, site theme, service process, or other site records. No restart of any READY device or existing interactive Chrome.

## Browser caveat
An **isolated test-only** Chrome instance on 007windows was invoked in headless DOM mode, but did not generate its dump and remained running; it was stopped by verifying and terminating **only** that test process (PID 35928). Therefore an actual 007windows Chrome browser visual-render PASS is not claimed. Earlier 51/51 native Windows Chrome template tests remain true only for the `windows` development host.

## Remaining gate and rollback
- The 007windows CLI HTTP access problem is fixed; Owner should re-open `http://localdev.basworldy.com/` in the 007windows Chrome and verify with the existing browser.
- If Owner uses China Mac instead, its hosts mapping still needs a device-specific administrator-authorized change; do not infer this is repaired.
- If Chrome still errors after DNS fix, investigate its current profile proxy extension, HTTPS certificate trust, and DNS cache separately; do not restart Chrome preemptively.
- Rollback on 007windows: delete only the exact BASWORLDY hosts line, leaving other hosts entries unchanged; backup available at the above path.
- Scope remains Windows Local. `dev.basworldy.com` and `basworldy.com` are untouched; product content source copying remains blocked until rights confirmed.


## Final diagnosis and verified remediation (supersedes earlier DNS-only diagnosis)

The earlier investigation incorrectly inferred that repairing `007windows` hosts mapping was sufficient. The core reproducible Chrome failure affecting **both** Windows machines was the **system proxy path**:

| Client | Active WinINET proxy | Explicitly proxied HTTP | Direct HTTP |
|---|---|---|---|
| Dev Windows | `127.0.0.1:7890` | **502** | **200** |
| `007windows` | `127.0.0.1:7897` | **timeout at 12s** | **200** |

Both clients' existing `HKCU\Software\Microsoft\Windows\CurrentVersion\Internet Settings\ProxyOverride` entries lacked `localdev.basworldy.com`. The earlier tests had forced `--no-proxy-server`, masking precisely this browser-path fault. Neither the theme nor WordPress was the root of these reported page-load errors.

**Minimal completed fix:** Appended **only** `localdev.basworldy.com` to the end of each Windows user's existing `ProxyOverride` semicolon-delimited list, without changing `ProxyEnable`, `ProxyServer`, other patterns, browser processes, or site services. Each prior full string was saved locally before editing:
- Dev Windows: `%TEMP%\basworldy-proxyoverride-before-20261102.txt`.
- `007windows`: `%TEMP%\basworldy-proxyoverride-before-20261102.txt`.
The `007windows` private hosts mapping to `100.87.29.56` remains required and was already applied in the previous repair.

**Real Chrome validation:** Ran isolated Chrome headless CDP browser scripts **without** `--no-proxy-server` on both machines after modifying the WinINET bypass rules.
- Dev Windows: `LOCAL_CORE_BROWSER_PASS`, `51/51`; captures `C:\Users\Administrator\Documents\catalog-local-archive-pilot-20261102\core-pages-system-proxy-review-20261102`.
- `007windows`: `LOCAL_CORE_BROWSER_PASS`, `51/51`; captures `D:\Users\ADMINI~1\TEMP\basworldy-007-qa`.
Both checked real local WordPress pages, vehicle filtering, details, mobile layouts, 0 JS exceptions and 0 external requests. Existing interactive Chrome profiles were **not restarted or modified**. A custom Chrome proxy-management extension in a pre-existing profile can still supersede system settings; only the isolated default-system-proxy browser path is proven.

**Rollback:** On each device restore the exact prior `ProxyOverride` value from that device's local backup (or remove only the appended exact `localdev.basworldy.com` segment if unchanged since). Preserve the earlier 007 hosts backup separately. No changes to GitHub main, Dev/WWW, public DNS, or Production.
