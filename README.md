# Andy WebDev Skills — S0 Site Skill Factory + S1–S6

Public, lightweight workflow toolkit for evidence-based, **site-specific** WordPress/WooCommerce, Shopify or custom websites. [Rapid WebDev](skills/rapid-webdev/SKILL.md) is retained for continued site development.

## Core concept
**No one-size-fits-all site prompts.** S0 [Site Skill Factory](skills/site-skill-factory/SKILL.md) takes a site domain, checked project code markers, sanctioned non-secret facts and evidence references. It creates separate project-owned Skills for S1, S2-A, S2-B, S2-C and S3–S6. B2B leads, commerce transactions, CMS differences and migration vs coexistence produce meaningfully different QA criteria.

## Phase map
| Phase | Skill | Primary output |
|---|---|---|
| S0 | [site-skill-factory](skills/site-skill-factory/SKILL.md) | Per-site profile, Skills, roadmap/gates |
| S1 | [site-intelligence](skills/site-intelligence/SKILL.md) | Multi-source strategy + keyword → URL IA |
| S2-A | [site-builder-local](skills/site-builder-local/SKILL.md) | Isolated Windows Local website/UAT |
| S2-B | [site-dev-uat](skills/site-dev-uat/SKILL.md) | Real hosted Dev QA |
| S2-C | [site-www-release](skills/site-www-release/SKILL.md) | Owner-approved WWW delta only |
| S3 | [analytics-live](skills/analytics-live/SKILL.md) | Live tracking/verified conversions |
| S4 | [seo-live](skills/seo-live/SKILL.md) | Evidence-backed WWW SEO |
| S5 | [content-migration](skills/content-migration/SKILL.md) | Content audit, rights and rewriting |
| S6 | [content-automation](skills/content-automation/SKILL.md) | Quality-gated editorial drafts/scheduling |

## MVP usage (Node 20+, no external packages)
```bash
node --test tests/*.test.mjs
node src/site-skill-factory.mjs --domain example.org --project-root ./your-site-project --evidence ./verified-evidence.json --output-root ./your-site-project
node src/site-skill-factory.mjs --domain example.org --project-root ./your-site-project --evidence ./verified-evidence.json --output-root ./your-site-project --write
```
First invocation is read-only **dry-run**. `--write` generates files in a local **destination project repo checkout**, not remote Production. Example [synthetic fixture](fixtures/sample-b2b.json) and [evidence schema](shared/evidence-schema.md).

## Governance and capability boundaries
[Approval gates](shared/approval-gates.md) · [Handoff contract](shared/handoff-contract.md) · [Source standards](shared/data-source-standards.md) · [UAT matrix](shared/uat-matrix.md) · [Architecture](docs/architecture.md)

- S0 is an actual file generator, but it **does not automatically log into GA4/GSC/Semrush, discover a private runtime, control BYL DC or deploy sites**. Read-only discovery beyond local project markers uses separately authorized connections and verified evidence intake. Report missing information as `UNKNOWN`.
- Owner instructions and target project `AGENTS.md` outrank generated instructions. Production writes, merges, bulk updates, redirects and publishing need independent approval. S2 chain: **China Windows Local → Dev UAT → WWW**; S3 onward normal editorial/analytics work is on WWW, with engineering changes returning to S2.
- Keep this repository Public and small. Never commit OAuth credentials, passwords, production data, customer or order exports, commercial metrics, private device addresses or screenshot archives. Never restart READY devices.
- ChatGPT web Plus may **read and follow** GitHub `SKILL.md`; this is not an installed native Skill or an MCP connection.