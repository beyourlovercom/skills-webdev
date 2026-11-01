# Report & Codex handoff contract — supplementary to Owner TXT

The original `analysis-prompt.txt` is authoritative for sections, goals, Chinese language and final `.docx` deliverable. This summary is for implementation checks only.

Deliver a Chinese Word titled 《旧站 GA4 数据分析与新站建设指导报告》, with brief chat summary. Sections: executive summary and top-3 actions; GA4 property/stream/date/timezone/currency/source integrity; monthly and YoY trends; acquisition channels; SEO landing pages; content, countries/devices and conversion quality; source-backed success factors; major problems and impact; new-site IA / content and P0/P1/P2; event trigger/parameters/key-event/status/verification; launch checklist; 30/60/90-day metrics and cadence; ranked opportunity/actions with evidence/effort/verification; definitions and limitations; Codex handoff.

Conclude with a **copy-paste Codex instruction**: compare the new site URL and exact Git SHA with the Word report, project `AGENTS.md` and source evidence, prepare a scoped code/content diff plus Local→Dev test plan and rollback; only implement following Owner approval, separately authorize WWW release. Do not fabricate metric values, customer quality, rank or expected ROI.

Use available Word document creation capability in the executing runtime; the GA4 API reader itself writes **protected JSON evidence**, not `.docx`. If no Word authoring tool is available, the document delivery remains `OPEN`.
