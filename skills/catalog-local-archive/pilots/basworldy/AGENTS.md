# BASWORLDY — Project scope and environments

Scope: this file governs the BASWORLDY pilot within `skills-webdev` only. It does not override unrelated projects. The current feature branch is `feat/catalog-local-archive-pilot-20261102`. This pilot is not merged to `main`.

## Frozen domain map (Owner, 2026-11-02)
| Role | Domain | Gate |
|---|---|---|
| Third-party research source | `https://basworld.com` | Read-only structural research; no licensed asset copy established |
| Windows Local | `localdev.basworldy.com` | Desired hostname; confirm local routing before declaring host UAT |
| Online Dev / UAT | `https://dev.basworldy.com` | No deployment until separate project-scoped authorization |
| Future main website | `https://basworldy.com` | Reserved public domain; do not infer that it is deployed or approved for indexing |

## Rules
1. Local source and non-public evidence stay in an isolated Windows project directory; do not modify or restart shared LocalWP Nginx or other READY services automatically.
2. Existing `file://` synthetic pilot passes are preserved; they do **not** establish that `localdev.basworldy.com` already resolves.
3. Any new local vhost / hosts configuration requires a conflict-free inspection and a site-specific reversible change; do not overwrite existing virtual hosts.
4. Clone only Owner-approved content types under actual rights evidence. No unlicensed real catalog bulk downloads, protected content, or brand/asset reproduction.
5. Do not copy live checkout, customer data, cookies, tokens, tracking pixels, external SMTP or third-party API credentials.
6. Online `dev.basworldy.com` is distinct from the eventual `basworldy.com` main site. Use noindex for all staging environments until approval; do not infer deployed status from a domain name.
7. Owner must separately approve the exact target environment, scope and commit for Dev and WWW writes. GitHub branch/main changes also require their own approval.
8. Only actual HTTP/browser/asset readback counts as a runtime PASS; all unverified fields remain OPEN.
