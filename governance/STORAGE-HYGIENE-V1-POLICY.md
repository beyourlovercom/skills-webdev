# Storage Hygiene V1 — Cross-Project Read-Only Governance
**Status:** DRAFT, no production or deletion authorization. Independent Owner `pass` required to merge into `main`, enable schedules, or activate destructive operations.

## S0 — Why this exists
At formally approved workstream closure, create a storage inventory and a reversible, approval-gated cleanup proposal. Do not infer cleanup consent from GitHub merge, timestamps, low space, or this policy.

## S1 — Trigger and inventory
1. Owner confirms PR/Issue/runtime closure.
2. After 7 days, perform **read-only** inventory scoped to known project paths: device, mount, exact absolute path, allocated-byte accounting, project owner, branch/HEAD and git common-dir, registered worktrees, untracked/ignored, process handles, independent backups, restore tests and app dependencies.
3. Report unknowns as OPEN. Never claim a speculative estimate is disk space actually recovered.

## S2 — Three classifications
- **A:** Confirmed regenerable *and* covered by a separately approved exact-scope execution policy. Dry-run first; independent executor required.
- **B:** Needs explicit Owner approval naming each exact path and rollback. Includes active-project Git worktrees, Chrome cache, historical ZIPs, Dev rollback bundles, downloaded website backups.
- **C:** Never automatically cleaned. Includes all production orders, payments, customer/legal databases, unverified backups, main repositories, active worktrees, Chrome Profile/Cookies/Tokens, individual personal files, shared volumes and host system folders. Unknown is C.

## S3 — Safety gates
- Exact absolute path only; no wildcard or recursive blind deletion; reject symlinks and aliases.
- Verify repository identity, `git worktree list --porcelain`, precise HEAD/PR/Issue, dirty plus untracked plus ignored, local-only artifacts, active processes, backup recoverability.
- Worktrees require a reviewed `git worktree remove <exact path>`, not direct folder deletion. Independent clones are different.
- Generate only `DRY_RUN` and `OWNER_APPROVAL_PENDING` outputs by default. Do not add a destructive command to the inventory auditor.
- Do not restart READY devices, Chrome, or active sessions; do not scan personal photos/videos or credential stores.

## S4 — Hostinger and production
Audit each **real** hPanel account/plan/site independently: used/free GB, inode, web-root and large directory shares, manual backup plugin and hPanel automatic backups, staging references, newest actually recoverable backup and offsite copy. A backup listing does not prove it can be restored. Hostinger/WWW deletions, site backup policy changes, DNS, SEO, Cron and webhook changes always require independent exact Owner pass.

## S5 — Retention proposals (not authorization)
Closed isolated developer worktrees after 7 days become **audit candidates**; regenerable UAT/build artifacts after 7–14 days become **audit candidates**. Dev rollback packages retain at least the most recent two approved versions. Production backups follow approved business RPO/RTO and applicable retention policy, never generic age-based deletion.

## S6 — Verification and reports
- Below 15% free: warning; below 10%: priority alert, **not deletion authority**.
- Read-only inspection may be scheduled only after explicit scope/cadence approval. Destructive recurring automation is OFF by default.
- Preserve: pre/post `df` free bytes, every exact path, file count and byte method, Git registry readback, actor, timestamp, Owner approval reference, restoration/rollback status and detected side effects.
- Public repositories must contain generic policy and synthetic fixtures only. Never publish private device paths, screenshots, customer exports, credentials, database dumps or site backups.

## S7 — Release gate
Draft branch and PR may be reviewed. No merge to `main`, policy activation, scheduled deletion, deployment or Hostinger change without explicit Owner `pass`.
