# WebDev Skills architecture (2026-10-30)
Shared public repository: executable S0 Node generator, reusable S0–S6 Skill instructions, safety contracts, synthetic tests, CI. Existing `rapid-webdev` remains compatible.

Per-site project repository: `AGENTS.md` highest governance; `skills/site-profile.yaml` sanitized model; eight independent Skills; `skills/approval-gates.md`, `skills/site-roadmap.md`, `skills/evidence-manifest.json`; private evidence remains outside any public repo.

```text
Real project HEAD + AGENTS + read-only runtime + authorized source metadata
                     |
                 S0 factory
                     |
          project-specific Skills
                     |
       S1 strategy and prelaunch IA
                     |
S2-A China Windows Local → S2-B Dev UAT → S2-C WWW Owner gate
                     |
             S3 analytics-live
                     |
        S4 SEO → S5 content → S6 cadence
```

S3 onward WWW daily content operations happen on the **real site**, subject to authorization. All source/plugin/theme/template/database/routing changes loop back through S2. For brand coexistence, never auto-redirect nor clone licensed media without rights.

MVP: a deterministic, secret-resistant, evidence-driven generator with a documented input schema, stage-specific rules, unit tests and CI. It is **not** a fully connected discovery agent or end-to-end automated site deployment. Future R2: authorized GitHub runtime/connector evidence adapters, localized privacy-safe evidence stores, richer per-stage structured machine validators, China Windows Local integration and true browser UAT.
