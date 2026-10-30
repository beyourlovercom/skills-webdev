# Automated acceptance matrix — evidence tiers
| Case | Automated check | Real-world gate |
|---|---|---|
| S0 two-site differentiation | Node unit test B2B vs B2C rules | Human inspection of actual destination repo/AGENTS |
| S0 repeatability | idempotent dry-run/write & no overwrite of unmanaged files | Project PR review |
| S0 security | reject credential-looking keys/values, avoid raw private data | Inspect actual diff for private facts |
| S1 analysis | schema + source/date/metrics validity | Authorized GA4/GSC/Ads exports and business reconciliation |
| S2-A | source lint/unit tests | China Windows Local browser UAT |
| S2-B | build/playwright where installed | Actual Dev screenshots, index, checkout/lead readback |
| S2-C | SHA, delta and rollback manifest | Owner pass, WWW production readback |
| S3 | event dictionary, duplicate-ID assertions | Real WWW conversion evidence |
| S4 | URL/keyword ownership rules | GSC/index and editorial review |
| S5 | content inventory + license fields | Originality, rights and editorial approval |
| S6 | draft/fact/source QA | Explicit scheduling/publishing scope and actual readback |

Automation is not self-authorization. Keep FAIL/OPEN evidence visible. Never mark a test PASS unless actually run.
