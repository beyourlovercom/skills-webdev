# R15 visual 99% / exception checkpoint

Owner authorizes noncritical visual-error exceptions, without claiming they passed original automation. A 0.99 SSIM threshold is stricter than the prior 0.97; original PASS and new 99% visual compliance are separate facts.

Windows Local audit: original exact-page AUTO PASS 62/99; new strict dual-view SSIM at least 0.99 currently 50/99. Twelve original-passed pages remain in 0.97-0.99 band; 23 routes need visual/dynamic or geometry exception review; 14 routes are hard or unverified OPEN. Do not close R16 on these totals.

The 13 formerly passed routes below 0.99 are undergoing real source/local recapture and 2/2 safety UAT via `r15-owner99-revalidation13.py`; one (Nylon Injection Molding) gained a verified 99% proof. Two genuine source GIF assets were downloaded to Windows Local and SHA checked, but their exact pages remain OPEN due to subsequent dynamic image/geometry differences.

Private Windows evidence: `C:\ai\site-mirror\rapiddirect-v2\uat\r15-fast-lane\r15-owner-99-visual-exceptions-ledger.json`, `r15-owner99-revalidation13-progress.json`. Keep PR #16 Draft. No source writes, no main merge, no Dev/WWW/Production changes.
