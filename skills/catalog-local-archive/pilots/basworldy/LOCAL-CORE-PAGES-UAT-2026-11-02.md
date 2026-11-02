# BASWORLDY — Windows Local Core Pages / WordPress Theme V0.2.1

Date: 2026-11-02. Runtime wins; all observations are **local only**.

## Environment and source-of-truth
- Local: `http://localdev.basworldy.com` (Windows LocalWP site ID `BgNoFMOb5`; dedicated directory `D:\ai\basworldy-local\app\public`).
- Theme: `wp-content/themes/basworldy-local` (original WordPress PHP templates and CSS, custom post type for vehicles; GitHub source archived under this folder's `theme/` subdirectory on feature branch).
- Local admin credentials remain private on the Windows device; no client/order/customer data copied.
- `blog_public=0`, noindex meta, no online Dev/WWW publication. Existing LocalWP sites untouched.
- Source `basworld.com` used only for broad structural research; **no source images, articles, product data, HTML, names or copy** were imported.

## Page coverage

| Page class | URL path | Implementation / local evidence |
|---|---|---|
| Homepage | `/` | WordPress `front-page.php`; hero, category tiles, featured vehicles, editorial, footer |
| Vehicle catalog | `/vehicles/` | `archive-vehicle.php`, genuine WP vehicle CPT; client-side filter by brand/type/year/search |
| Vehicle detail | `/vehicles/atlas-hx-520/` | `single-vehicle.php`, specs, price box, synthetic image, contact template link |
| Information page | `/about-us/` | `page.php` |
| Buying steps page | `/how-to-buy/` | `page.php`; 3-step module |
| Export content page | `/transport-export/` | `page.php`; 3-step module |
| Contact page | `/contact/` | `page.php`; disabled form, no customer data or mail |
| Blog list | `/insights/` | `home.php`, 3 local demo WordPress Posts |
| Article | `/understanding-axle-configurations/` | `single.php`, article layout/TOC links |

## Test fixtures
- 4 **fictional** vehicle entries using original names and generic illustrations, with synthetic ID, price, year, mileage, axle, emission and transmission.
- 3 synthetic blog posts for the article templates. Default Hello World and Sample Page were changed to Draft, not deleted.
- 5 ordinary Pages (About Us, How to Buy, Transport & Export, Contact, Insights) plus Home page, all editable in the dedicated WP site.
- Source photo capture, fleet stock, checkout, logistics API, sales inquiries, email and analytics are **NOT** enabled.

## Actual local UAT
- Local PHP CLI `php -n -l` of 11 theme PHP files: 11/11 syntax PASS.
- HTTP direct (without host proxy): main home, inventory, individual vehicle, pages, blog list and blog article: HTTP 200.
- Actual Windows Chrome via CDP in **separate temporary profile**:
  - 51 checks PASS after correcting two real issues: (1) mobile product-detail overflow due to image thumbnail min-content; (2) duplicate parent/child product selection in filter engine.
  - Desktop 1440px; mobile 375px; homepage, catalog, detail, Page, Blog list, Blog article verified; filtered Atlas -> 2, Atlas year >= 2022 -> 1 **visible card**.
  - Category links, local synthetic images, 10 specs, 3 steps, contact input disabled, WordPress posts and nav present.
  - 0 nonlocal-domain HTTP(S) requests recorded; 0 JS exceptions.
- Evidence screenshots (11 images): `C:\Users\Administrator\Documents\catalog-local-archive-pilot-20261102\core-pages-review-20261102`.
- Test harness: `C:\Users\Administrator\Documents\catalog-local-archive-pilot-20261102\scripts\basworldy-core-uat.mjs`.
- The previously installed MU homepage redirect was **moved out of wp-content** into an isolated Windows archive to allow the real WordPress frontend to own `/`.

## Review gate
- `SOURCE_ARCHIVE=BLOCKED_RIGHTS`; no BAS World bulk catalog.
- `CODE_READY=PASS`; `LOCAL_BROWSER_CORE=PASS` with synthetic content.
- **OWNER_VISUAL_SIGNOFF=OPEN**: Owner must visually approve the actual look and page hierarchy.
- **DEV=NOT_DEPLOYED / DNS_UNVERIFIED**; `WWW=NOT_DEPLOYED`; `INDEXING=HOLD`.
- No GitHub main merge or production release approved.

## Next step
Owner reviews the local URLs and reports page-level changes; apply small isolated CSS/template edits and rerun the 51-check suite. Only after visual approval, consider small authorized real product fixtures and independently approved Dev UAT.
