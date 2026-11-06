# Duplicate Site V2 WordPress R4 — 2026-11-06

Status: LOCAL R4 engineering QA verified; original reference fidelity and final packaging not approved.

## Verified

- Repeated 19-file CSS/JS scratch builds produced identical hashes; 2 font assets handled.
- Browser-response interception loaded the new staged assets without rewriting any running theme files. Five Local routes at 1440px and 375px produced 10/10 Canary pass, lowest new-versus-current Local screenshot score 0.999986.
- Original reference homepage versus Local: RGB first-screen score 0.796068 desktop, 0.709832 mobile. These are not source visual PASS; current marketing graphics may have changed.
- SiteGround copy had HTTP 200 via curl but Chromium connection closed. No visual score is claimed.
- Local About page was effectively blank after Elementor rendering, despite source post_content containing a heading and brand content. An isolated, rollbackable Local-only MU plugin restored the original stored content, including H1 and 14 main-content images. Never publish that local-specific patch to production.
- After the fix, full browser page QA passed 10/10 again with H1 >= 1 and main text >= 75 characters. The staged CSS/JS Canary was also rerun and passed all 10 views.
- Actual PR #15 module gates remain BLOCKED for absent Owner representative/source approval. One synthetic queue only tested the real factory API.
- New final-package gate explicitly rejects an incomplete route inventory, missing Owner final approval, or below-0.97 current reference comparison; actual site status BLOCKED_FINAL_BATCH.

## Required to finish

Complete and approve the full in-scope route denominator, select/freeze source visual reference content, obtain Owner PC/mobile acceptance, then perform ONE final site-wide CSS/JS build and an explicitly approved rollbackable Local runtime Canary. Keep existing PR #15/#16/#17 Draft and SiteGround unchanged.

Documentation: see final-asset-lifecycle.md. Private report, screenshots and local-only repair stay on Windows under D:\ai\svakomstore\_research\wordpress-adapter.