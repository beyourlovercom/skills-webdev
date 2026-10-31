# GSC 官方 CSV 离线导入：使用说明

用途：拥有 Google Search Console「搜索结果表现」的官方 CSV 导出，却不需要重新配置 OAuth 时，离线核对数据并生成明确来源的私有 JSON。它不验证 Google 账号权限。

## 1. 导出并确认来源

在 GSC 中选择正确的 Domain Property 或 URL-prefix Property、搜索类型 Web、日期范围和所有查询/页面/国家/设备过滤条件。导出 CSV：图表文件常称 Chart.csv 或 Dates.csv；维度文件常称 Queries.csv、Pages.csv、Countries.csv、Devices.csv。实际名称以下载文件为准。

**不要混合两个站点、不同搜索类型或不同筛选条件。** 尤其 ybyirrigation.com 与旧域 yby-irrigation.com 是不同属性，不得凭 ERP site_key 重新归属。

Google 官方说明：UI 的维度导出常限于约 1,000 条代表性记录，日期图表总量与查询/页面表合计可能不同，下载中的 ~ 或 - 也可能被处理为 0。因此不能把查询列表当全部搜索词或精确零流量。

- https://support.google.com/webmasters/answer/12919797
- https://support.google.com/webmasters/answer/7576553

## 2. 填写 manifest.json

复制本 Skill 中 examples/ui-csv-manifest.example.json 到私有导出目录，并替换示例属性、导出时间、真实日期和 CSV 文件名。

source 必须为 GSC_UI_CSV_EXPORT，schema_version=1，search_type=web。exported_at 必须带时区，日期需 ISO YYYY-MM-DD；filters 用于声明当时界面的过滤条件。files.dates 必须指向图表 CSV；其他表没有就移除字段，程序会标记 OPEN_NOT_EXPORTED。

CSV 支持英文与常用中文表头、带引号的逗号、UTF-8 BOM、百分比 CTR。不能自动辨别歧义的月份日期格式；遇到非 YYYY-MM-DD 时应在隔离副本明确转换，不能猜测。

## 3. Windows Local / 自建 DC 执行

先检查数据，不写 JSON：

    node skills/gsc-site-intelligence/scripts/gsc-import.mjs --manifest D:\private-gsc\manifest.json --domain ybyirrigation.com --dry-run

再在明确的私有目录保存证据：

    node skills/gsc-site-intelligence/scripts/gsc-import.mjs --manifest D:\private-gsc\manifest.json --domain ybyirrigation.com --output-dir .private-gsc\ybyirrigation.com\ui-csv

dry-run 本地读取 CSV、验证完整性；不调用 Google API、不改 GSC/ERP/WWW。正式导入仅写 gsc-evidence.json，拒绝覆盖已存在文件。不要把原始报表或 Token 提交到 Public GitHub。

## 4. 解释报告边界

- source=GSC_UI_CSV_EXPORT_OFFLINE；property.verification_status=USER_DECLARED_NOT_API_VERIFIED。
- status=PARTIAL_OFFLINE_EXPORT_UNVERIFIED：有真实 CSV，但没有 Google sites.list 对属性所有权的独立核验。
- 图表 CSV 的日期行用于整个期间的点击/展示汇总；不能把 Queries、Pages、Countries、Devices 求和替代图表总量。
- Query×Page 对应、索引覆盖、CWV、Sitemap、有效客户及 12 个月同比，未独立提供证据时保持 OPEN。
- 跨域页面立即 BLOCKED；特别不能把旧站 yby-irrigation.com 的页面算给 ybyirrigation.com。

## 5. GPT 网页版启动提示

读取 skills-webdev 的 registry/skills.json，再加载 gsc-site-intelligence/SKILL.md、references/analysis-prompt.txt 和本说明；通过自建 DC 在 Windows Local 使用已有 CSV 的 manifest 进行只读导入，输出证据来源和局限。只根据已导出的数据撰写明确标注的中文中期分析，不将离线导入当作实时 Google API 验收，也不修改网站或 ERP 历史数据。

## 6. 筛选口径保护

manifest `filters` 必须是对象：无额外过滤使用 `{}`；存在过滤时逐项填非空文本，例如 `"country":"India"`、`"query":"contains:drip"`。程序会把 `totals_scope` 标记为 `FILTERED_VIEW_USER_DECLARED`，图表合计**只能代表该筛选视图**，不能解释为整个网站的搜索表现。无筛选时是 `UNFILTERED_VIEW_USER_DECLARED`，仍需来源核实。脚本不能验证 manifest 填写是否与 GSC 当时的真实界面一致。
