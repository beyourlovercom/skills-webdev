# BASWORLDY R10 technical closeout / R11 Roadmap V7
Date: 2026-11-05. Environment: Windows Local only. No Production writes or GitHub main merge.

## Scope and owner approval
- The approved core mirror has 187 pages: 172 valid first-page catalog routes and 15 business/content routes. All have Owner visual PASS from R9.
- Home, Truck-list and Volvo PDP reference templates are separately protected.
- R10 changes only the destination links and CTA href values. Visual content, stylesheets, product data and imagery were not rewritten.
- R9 original SHA receipts remain intact; the new R10 final SHA manifest supersedes old HTML hashes only for R10-controlled link edits.

## Verified R10 execution
- First static scan across 187 pages detected 2,604 unmapped local hrefs.
- R10 updated 2,725 hrefs across 186 pages, plus four isolated residual hrefs: total 2,729. This included 97 links reconstructed from genuine saved-source MHTML, 2,142 confirmed direct local route corrections, and 486 truthful out-of-scope notice destinations (before the extra four).
- All six Sell pages now have six functioning original-image-identified Start selling card CTAs: 36 link repairs. The missing distinct semi-trailer destination goes to an explicit not-archived notice, not a misleading trailer page.
- Final local page SHA: 187/187 PASS; previous unchanged image/CSS/JS resources: 634/634 SHA PASS.
- Final actual Windows local HEAD: 187/187 HTTP 200, including five accented Unicode URLs.
- Final HTML audit: 0 broken in-scope local hrefs; 0 invalid page fragments.
- Real Chrome desktop + mobile native navigation: 14/14 visible link clicks PASS. Offline Contact and Sell form submissions: 4/4 prevented correctly. Zero external network requests and JavaScript exceptions during this UAT.
- All modified HTML and their original backups have exact pre/post SHA receipts, including the card CTA changes. No CSS or visible body text was changed.

## Important exceptions, not to be claimed as complete
- Nine original MP4 video files absent in authentic MHTML (2 About, 1 Store, 6 Sell). One YouTube embed points off-site.
- 1,852 outbound social/auction/account/other-service href references are outside local-only transaction scope.
- Residual obsolete source asset references: 163 Next.js JS preloads, 8 CSS link refs and 9 favicon refs from older page templates. Nine CSS-internal old media URL refs also remain. They have not been silently rewritten because approved visuals are stable. They are part of strict zero-404 archival cleanup, not a claim of zero missing original source resources.
- 13 real upstream category 404s and four unarchived deep-filter routes have truthful fallbacks; do not invent pages.
- 242 editorial/guidance candidate routes still need classification to determine what is not Blog. Thus 187 approved core pages do NOT mean the entire non-Blog original site is fully copied.
- No assertion of every-page real source-vs-local SSIM >=0.97; Owner reviewed approved representative templates.

## Roadmap after R10
- R9: all core HTML templates and 187 content/listing pages completed and Owner visual PASS.
- R10-I: links, visible CTA destinations, offline form safety completed.
- R10-Q: all 187 local HTTP routes, internal navigation, immutable assets and representative real-browser UAT completed with documented source resource exceptions.
- R11: final handoff, exception acceptance and core-scope closeout; estimate 0.5-1.5 effective engineering hours, excluding any Owner approval waiting.
- Optional separate scope: strict cleanup of stale source-static refs, acquisition of missing videos, external service integrations, and classification/possible mirroring of 242 candidate editorial pages. Estimate these only after verifying the intended non-Blog scope.

## Windows private evidence
Root: D:/ai/basworldy-source-archive/page1-batch/uat/
- r9-ten-owner-pass-freeze-20261105.json
- r10-link-only-published-readback-20261105.json and r10-link-only-backups-20261105/
- r10-residual-four-links-readback-20261105.json
- r10-sell-card-cta-readback-20261105.json
- r10-187-live-local-head-encoded-20261105.json
- r10-site-audit-after-cta-20261105.json
- r10-real-browser-navigation-v3-20261105.json
- r10-qualified-assets-audit-20261105.json
- r10-final-core-baseline-freeze-20261105.json

Keep all original MHTML, screenshot and media bytes private on Windows. GitHub documentation stays on feature branch feat/catalog-local-archive-pilot-20261102, not main.
