# BASWORLDY R13-S1 Route Scope Handoff (2026-11-06)

Scope: Windows Local only. Existing R12 192 pages remain frozen; no site changes.

| Source route | Decision |
|---|---|
| /sell-your-vehicle | Alias points to /en/content/sell-your-vehicle; full selling landing page missing locally. Requires authentic source MHTML before visual cloning. |
| /contact-us | Alias points to /content/contact-us; existing approved local page reused without changes. |
| /service-desk/faq | Distinct customer service FAQ; no local page. Compare also /content/faq before deciding whether one or two local templates are needed. |
| /advisor/en | AI advisor with live interaction. Separate static-vs-dynamic scope decision needed; do not simulate working AI without backend. |

Read-only checks: old 192-page files unchanged; Windows Chrome public requests encountered Cloudflare block, so source MHTML was not acquired. Existing homepage Try AI Search points externally. The 237 article-style exclusions do not include these routes.

Next: obtain genuine MHTML for Sell and FAQ using an authorized browser; inspect FAQ alternate path; run isolated PC/mobile UAT, then add two inbound internal links and sitemap entries for any approved new page. No GitHub main merge or production deployment.