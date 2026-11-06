# Duplicate Site Skills — Final-only CSS / JS packaging policy

Applies to all authorized Local website builds: WordPress, HTML, React/PWC, and other local copies.

## Mandatory: ONE FINAL BATCH AFTER SITE COMPLETE

1. During page research, representative layout work, Owner review, same-template batch, and bug fixes, retain **editable, independent original CSS and JavaScript modules**. Do not compile/minify/package after each page.
2. Optional temporary scratch builds for QA are allowed during development. They are not final packaging, never replace running-site files, and carry production_ready=false.
3. Final packaging starts **only after all in-scope non-Blog routes** are reconciled, full site content and essential interactions have passed PC/mobile UAT, source visual/Owner approvals are recorded, and outstanding resource or semantic issues are closed or explicitly excepted.
4. Freeze source hashes and perform **one coordinated site-wide batch build**, including all required CSS and JS. Record engine/version, input/output SHA-256, asset-dependency order, source-to-hashed-dist manifest, and rollback receipt.
5. Collective packaging means *one final build event*, NOT necessarily one single JS file and one single CSS file. Preserve independent module files when order, conditional lazy loading, or WooCommerce/Elementor compatibility requires it. A single bundle is allowed only after dependency validation.
6. Load the whole candidate build within an isolated Local browser Canary; compare against the last approved Local baseline at desktop/mobile; check missing images/fonts, runtime errors, overflow, relevant interactive controls, and output asset signatures. Build-versus-Local parity is **not** source-site visual fidelity.
7. Publishing built assets requires a **separate, explicit approval**. If a bug appears after final packaging, revert to editable source, increment version, rebuild the entire batch and run fail-only QA. Never patch compressed outputs directly.
8. Any missing inventory, page/content check, Owner approval, original-reference visual proof or build-canary check returns BLOCKED_FINAL_BATCH. Neither HTTP 200 nor synthetic queue tests are approval.

## WordPress R2–R4 implementation (Draft PR #17)

- wp-template-data-contract.py: private per-site PHP map and per-route data SHA.
- wp-final-build.py: one scratch preview build of all manifest CSS/JS and font rebasing; --execute is **scratch staging only**, not site publication.
- wp-r4-build-canary.py: browser response interception uses staged CSS/JS without overwriting the Local theme.
- wp-r4-browser-uat.py: local PC/mobile, H1/main-content, assets, and safe read-only toggle verification.
- wp-r4-reference-visual.py: current public reference versus Local capture, read-only GET.
- wp-final-package-gate.py: read-only all-site completion gate; no deploy or Owner authorization is implied.

The existing V2 mirror flow and PR #15 factory remain the single source of truth for batch approval. This policy is **also mandatory for non-WordPress sites** with their own existing bundlers.

## Scope / safety

Never copy site-specific source, licensed images, private screenshots, customer/order data, credentials or commercial claims into public Skills. No SiteGround/Dev/WWW edits from this work. Keep PR #15/#16/#17 Draft pending separate review.

## Local study evidence (2026-11-06)

An authorized Windows Local sample passed 19-file repeatable scratch compilation and 10/10 baseline-vs-staged browser Canary views. The reference site's current homepage did not meet 0.97 PC/mobile visual similarity, and the full site route denominator / Owner final approval are not recorded. **Final package promotion remains BLOCKED** even when engineering staging passes.