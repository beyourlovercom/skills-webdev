# V2.0 Shared Evidence Schema

Every acceptance item uses these fields (JSON or equivalent structured record):

```json
{
  "evidence_version": "1.0",
  "project_id": "example-site",
  "skill_id": "site-builder-local",
  "skill_version": "1.0.0",
  "environment": "local",
  "target": "desktop-homepage",
  "check_id": "browser.home.desktop",
  "status": "PASS",
  "method": "playwright",
  "expected": "Header, hero and primary CTA render without overflow",
  "actual": "Observed result and measured viewport",
  "artifact_refs": ["relative/path/to/screenshot.png"],
  "commit_sha": "full-commit-sha",
  "timestamp_utc": "2026-11-06T00:00:00Z",
  "reviewer": "automation-or-owner",
  "notes": []
}
```

## Status definitions
- PASS: the check ran in the stated environment and its expected result was observed.
- FAIL: the check ran and the observed result violated the expected result.
- OPEN: not run, evidence missing/stale, or result cannot be determined.
- BLOCKED: cannot proceed because authorization, dependency, environment or prerequisite is missing.

## Evidence rules
1. HTTP 200 is not browser, visual, conversion or business PASS.
2. DOM assertion, screenshot similarity and human visual signoff are separate checks.
3. Build artifact hash equality proves artifact identity, not source fidelity or user acceptance.
4. Synthetic tests do not prove production behavior; test fixtures must be identified.
5. Every screenshot/report identifies viewport, URL, environment, timestamp and code SHA.
6. Summary PASS requires all mandatory child checks to PASS; any FAIL/OPEN/BLOCKED propagates.
7. Owner approval is a separate event with exact scope and SHA; it cannot be inferred from test evidence.
8. Evidence may be reused only while artifact, environment, scope and acceptance criteria remain unchanged.
