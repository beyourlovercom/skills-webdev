# Semrush UI 导出数据契约与费用保护

`manifest.json` 示例（均需替换为真实值，不是 API 命令）：

`{"source":"SEMRUSH_UI_CSV_EXPORT","domain":"example.com","database":"us","exported_at":"2026-10-31T00:00:00Z","report_type":"domain_organic","delimiter":";","columns":{"keyword":"Ph","position":"Po","search_volume":"Nq","url":"Ur"}}`

允许的报告：`domain_organic`、`backlinks_refdomains`（字段映射用 `referring_domain` / `backlinks`）。CSV 可包含 BOM、引号、嵌入逗号与换行。表头须不重复，域名必须与实际 SEO URL 归属一致。不同国家和日期的结果不可合并成同一搜索量。导出数据可能被 Top-N 截断，来源质量为 `SEMRUSH_UI_CSV_EXPORT_UNVERIFIED`；没有账户登录/API 权限读回证据就不能宣称完整 Semrush UAT。无秘钥、无 OAuth、无自动消费 API units。

国家、SERP 功能、排名难度等不在输入映射内的列，报告明确 `OPEN`，不凭一般经验补造。真实账户是否已订阅 Semrush Business、是否有 API units 均未验证。
