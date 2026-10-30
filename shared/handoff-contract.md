# Cross-stage handoff contract
Every stage creates a portable evidence manifest:
```json
{
  "stage": "S2-B",
  "site": "example.org",
  "project_repo": "owner/project",
  "head_sha": "UNKNOWN",
  "environment": "Dev",
  "checked_at_utc": "UNKNOWN",
  "source_references": [],
  "inputs": [],
  "outputs": [],
  "tests": [{"id":"checkout", "result":"OPEN","evidence":"UNKNOWN"}],
  "approvals": [{"scope":"WWW release","state":"NOT_APPROVED"}],
  "open_blockers": [],
  "rollback": "UNKNOWN"
}
```
Result enums: PASS, FAIL, OPEN, NOT_APPLICABLE (with reason). Tests without credible readback are OPEN. A later stage must validate the previous artifact's SHA and applicable gate. No stage can set `Owner pass` from a generated file.
