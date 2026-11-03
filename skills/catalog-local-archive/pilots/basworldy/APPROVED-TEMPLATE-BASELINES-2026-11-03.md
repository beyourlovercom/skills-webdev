# BASWORLDY | Approved visual baselines and next batch, 2026-11-03

## Confirmed by Owner (in this conversation)
| Module | Approved source template | Local HTML SHA256 | State |
|---|---|---|---|
| SHARED_SHELL | https://www.basworld.com/ | `16b5652ae8687051c79b55f1f878ed121960215403c9adc52d7a725ef0518e0b` | Visual PASS / frozen |
| CATALOG_LISTINGS | https://www.basworld.com/stock/truck | `11706047aff57dbef25a610d9ca57d6c519e2dd957efe2491d0823972972bad6` | Visual PASS / frozen |
| PRODUCT_DETAILS | https://www.basworld.com/vehicles/used/truck-volvo-fm-2012-euro5-70320127 | `af260fac391cf0e2288d427b1d345adc2adf43d7d80e635a4689b31c0acb2902` | Visual PASS / frozen |

These SHA256 values were read directly from the current Windows Local HTML. Owner's exact messages were "首页视觉 pass", "Truck/分类列表模板 pass" and "产品详情页面，pass".

## Agreed BASWORLDY scope, unchanged
- No Blog.
- Every approved product/category/filter **listing first page only**; never page 2+, offset, cursor, or infinite-scroll continuation.
- Representative genuine product details only; no bulk details of all SKUs.
- Restore applicable non-Blog standard content pages and source image/font/icon files.
- No publication, GitHub main merge, checkout, payment or customer-data copying.

## Next executable sequence
1. Store locally traceable Owner module records according to `visual-first-gate.mjs` V0.7 (one per module). Do not synthesize unrelated approvals.
2. Freeze shared Home/Header/Footer and Listing/Product template HTML/CSS against the SHA baselines above.
3. CATALOG_LISTINGS: deduplicate the source homepage's previously observed 9 main and 176 finer category/filter entry URLs; classify them; for **each** permitted entry capture only its first page and required original assets; render with the frozen listing template; resume from verified-only hashes; audit count and route integrity.
4. PRODUCT_DETAILS: confirm the approved representative Volvo detail and complete gallery mapping, then mark this scoped module complete without fetching every other product.
5. CONTENT_SERVICES: read one representative page per genuinely distinct non-Blog template; Local UAT and Owner review, then batch the approved page class.
6. INTERACTIONS and OFFLINE_ACCEPTANCE: local-only navigation, gallery, filters, no live backend effects; final route/media SHA report and Owner final approval.

Do not claim that the catalog batch ran unless there are real page-one saved records and an audited denominator. Current state: Owner template passes recorded; **batch execution not yet verified**.
