# BASWORLDY R15 — Canonical root-relative correction (Windows Local)

Date: 2026-11-06. Scope: approved offline Windows Local at /source-mirror/. No main merge or production deployment.

Exactly 32 HTML documents had a canonical URL pointing to https://www.basworld.com. All 32 were changed to their own current local root-relative route, for example /source-mirror/ or /source-mirror/content/about-bas-world/. 138 already-correct local canonicals were left unchanged, as were 26 originally missing canonical tags and 3 auxiliary HTML pages.

Result: 0 original BAS World canonical links remain, 170 valid local-relative canonical links, 26 previously missing unchanged. All 32 changed routes returned local HTTP 200 and live HTML canonical readbacks matched expected paths. No CSS/JS, body text, navigation, robots or visual edits.

Rollback: C:\Users\Administrator\Downloads\BASWORLDY-R15-CANONICAL-ROLLBACK-20261106.zip; SHA-256 9db0867545b1290677a94c5e185670c17790b561f1a8c1259d8649372ebc5c96.

Updated full local-site snapshot: C:\Users\Administrator\Downloads\BASWORLDY-R15-CANONICAL-RELATIVE-LOCAL-20261106.zip; 3809 entries; 502806263 bytes; SHA-256 4b7a3714189dff2bf3816bc3fe5e153597efb0a027160bd2711476df789bfdbc.

Patch-only ZIP: C:\Users\Administrator\Downloads\BASWORLDY-R15-CANONICAL-32-PAGES-PATCH-20261106.zip; 694927 bytes; SHA-256 83658160705b8cf27abb9494d590e4e18d5255403331bed2293806789.

Evidence: D:\ai\basworldy-source-archive\page1-batch\uat\r15-canonical-relative-fix-20261106.json, r15-canonical-32-browser-readback-20261106.json, r15-canonical-new-package-readback-20261106.json.

Critical deployment limitation: this release deliberately retains /source-mirror/ for the currently approved local site. Before publishing to the public domain root, rebase canonicals and all internal asset/navigation paths to root, then revalidate. Do NOT directly deploy this local ZIP to a public-domain root.