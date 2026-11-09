# R15 owner-approved visual exceptions — exact evidence

Date: 2026-11-05. Scope: 99 exact Owner-approved CORE routes, Windows Local only. The original AUTO_PASS gate and new 99% visual acceptance are separate.

Following 13 strict-99 recaptures, **52/99** original gate-passed pages also have real desktop and mobile SSIM at least **0.99**; **10/99** earlier-original-PASS pages have a minimum below 0.99. No old PASS was overwritten or falsely upgraded.

Three other pages meet desktop/mobile SSIM at least 0.99 and both safe interaction tests (2/2), with no unexpected local resource errors, but are **not original AUTO PASS** because dynamic image DOM counts differ. Under the Owner's explicit permission to allow minor error pages, their statuses are **OWNER_ACCEPTED_WITH_DECLARED_VISUAL_EXCEPTION**, NOT AUTO_PASS:

- `/automation-industry-solutions/`: desktop 0.9999772891, mobile 0.9999705858, safety 2/2.
- `/surface-finish/alodine-finish-services/`: desktop 0.9959382872, mobile 0.9999918114, safety 2/2.
- `/surface-finish/painting-finish-services/`: desktop 0.9999911065, mobile 0.9999985587, safety 2/2.

**Combined non-duplicated state: 52 VISUAL_99_VERIFIED + 3 owner-declared visual exceptions + 10 original 97%-99% passes + 20 visual/dynamic issues needing review + 14 hard/unverified OPEN = 99. R16 remains OPEN.** No source/site writes, production changes or main merge.

Windows private evidence: `C:\ai\site-mirror\rapiddirect-v2\uat\r15-fast-lane\r15-owner99-consolidated-acceptance.json`, `r15-owner-accepted-visual99-dynamic-exceptions.json`, three `r15eNNN-interaction-uat.json` and genuine source/local PWC screenshots. Keep Draft PR #16.
