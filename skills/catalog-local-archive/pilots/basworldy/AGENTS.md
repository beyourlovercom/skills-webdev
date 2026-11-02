# BASWORLDY — Project scope and environments

Scope: this file governs the BASWORLDY pilot within `skills-webdev` only. It does not override unrelated projects. The current feature branch is `feat/catalog-local-archive-pilot-20261102`. This pilot is not merged to `main`.

## Frozen domain map (Owner, 2026-11-02)
| Role | Domain | Gate |
|---|---|---|
| Third-party research source | `https://basworld.com` | Read-only structural research; no licensed asset copy established |
| Windows Local | `localdev.basworldy.com` | Desired hostname; confirm local routing before declaring host UAT |
| Online Dev / UAT | `https://dev.basworldy.com` | No deployment until separate project-scoped authorization |
| Future main website | `https://basworldy.com` | Reserved public domain; do not infer that it is deployed or approved for indexing |

## Rules
1. Local source and non-public evidence stay in an isolated Windows project directory; do not modify or restart shared LocalWP Nginx or other READY services automatically.
2. Existing `file://` synthetic pilot passes are preserved. The exact `http://localdev.basworldy.com/catalog-pilot/` host now independently passed HTTP and Windows Chrome UAT using synthetic records; this does **not** establish any real-source BAS World archive or Dev/WWW release.
3. New local site `basworldy-local` was registered through LocalWP's own authenticated manager after collision checks, without manually overwriting other virtual hosts. Do not edit shared router configs outside LocalWP management.
4. Clone only Owner-approved content types under actual rights evidence. No unlicensed real catalog bulk downloads, protected content, or brand/asset reproduction.
5. Do not copy live checkout, customer data, cookies, tokens, tracking pixels, external SMTP or third-party API credentials.
6. Online `dev.basworldy.com` is distinct from the eventual `basworldy.com` main site. Use noindex for all staging environments until approval; do not infer deployed status from a domain name.
7. Owner must separately approve the exact target environment, scope and commit for Dev and WWW writes. GitHub branch/main changes also require their own approval.
8. Only actual HTTP/browser/asset readback counts as a runtime PASS; all unverified fields remain OPEN.

## Verified local host (2026-11-02)

- LocalWP site ID `BgNoFMOb5`; `D:\ai\basworldy-local\app\public`.
- Self-authored fixture served at `http://localdev.basworldy.com/catalog-pilot/index.html`; 18 browser checks PASS and 0 nonlocal requests.
- 4 vehicle records are synthetic. Real-source intake remains `BLOCKED_RIGHTS`; online Dev and WWW remain unauthorized and untouched.


## Native WordPress local theme — current (2026-11-02)

The previous synthetic static catalog remains under `/catalog-pilot/` for historical test isolation, but it is **not** the current homepage. WordPress now serves the root using `basworldy-local` theme v0.2.1; the old MU redirect has been moved out of the active plugin folder and retained in the private Windows archive.

- Reusable native templates: `front-page.php`, `archive-vehicle.php`, `single-vehicle.php`, `page.php`, `home.php`, `single.php`, with shared header/footer, CSS and JS.
- Four synthetic Vehicle posts, six native Pages (including Home and Insights), three synthetic Blog posts. Original WP sample content was moved to Draft.
- Exact local review: `http://localdev.basworldy.com/review-local/`. Actual Windows Chrome 51 browser checks PASS and 11 screenshots; Owner visual approval remains OPEN.
- WordPress manages content and permalinks; source content/data harvesting permission is **not** inferred. No Dev or WWW writes or main merge.
- Keep review screenshots only in local evidence; do not add local passwords, account tokens or screenshots with browser session state to public GitHub.


## 2026-11-02 V0.4 superseding instruction — BACKUP WINS

The previous `basworldy-local` WordPress theme and 4 synthetic vehicles were **only development fixtures**. They must **not** be treated as a real basworld.com backup or counted in real source completeness.

New source-of-truth for the backup lane is the **private raw HTML/asset archive** `D:\ai\basworldy-source-archive\` plus manifest/actual asset hashes and real Chrome evidence. The local read-only 5-page preview is `http://localdev.basworldy.com/source-mirror/`, **not** the current WordPress homepage. No automatic switch of the homepage.

Source exactness rules:
- Real Logo byte/hash, product SKU/title/price/currency, and every gallery photo variant come only from actual source snapshots. Never substitute own SVG, stock image or sample inventory.
- Catalog list coverage and product-detail coverage are independently measured. As of this report: 70 unique links on the first 2 pages, 2 detail pages, Volvo photo variants 82/82, Renault photo variants 8/88, and first three pages' media 68/337. Site-wide denominator unknown, so `FULL_ARCHIVE_NOT_READY`.
- Source and local screenshots must be compared after all dependencies are localized. Current 5-page static mirror contains still-missing assets and externally referenced resources; dynamic interactions are OFF. This is *not* 99% visual parity.
- Preserve existing system proxy exceptions for LocalWP, run real Chrome with normal proxy, do not reboot other machines or touch public DNS. Do not submit private HTML/image bytes to Public GitHub.
- For source access and CDN, log 403/200, JPEG 201 and image/jpg aliases. Use only explicitly authorized source URLs and allowed hostnames; no challenge evasion, uncontrolled recursion or credential harvesting.
- No automatic public Dev / WWW deployment or merge to main.
