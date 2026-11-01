---
name: google-ads-site-intelligence
description: S1 Google Ads 真实只读广告表现、搜索词、渠道成本和转化归因审计；优先复用 Windsor 已连接账号，不修改广告。
---

# Google Ads Site Intelligence (S1-B)

## 优先数据源
优先使用**当前合法连接**的 Windsor Google Ads 只读插件（先 get_connectors → get_fields → get_data）或经 Owner 指定的已登录账户 Chrome。不得索取 OAuth Token 或密码，不自动修改广告设置，不使用付费 API 调用。账号 ID、币种、时区必须来自账户真实读回，不能从站点域名猜测。账户需要 Owner 证明对应项目，且此证据不等于 GA4/GSC 的同一用户。

## 执行步骤
1. 按目标网站 AGENTS.md 和 Owner 指令确定目标 Google Ads Account ID、账户时区、币种、窗口，以及是否允许的来源。读取该账号真实关联。Windows 是运营广告执行的默认设备，**只读数据可通过已有获准插件**；任何实际调整另行申请 Owner pass。
2. 首先读 campaign × date：account_id, account_currency_code, account_time_zone, date, campaign_id, campaign, impressions, clicks, spend, conversions, conversions_value。严格按照连接器的已发现字段 ID 读取（不可猜字段），用已完成日与账户时区过滤。保留全部返回日期与提供方的 cached/pending 状态。**不要因为本工具返回了 0 conversion 就推断真实询盘为零。**
3. 查询词视图是**不同层级**的 Search Term 数据，不可与 campaign×date 汇总相加。数据可能因隐私阈值隐藏查询；提供方未返回搜索词时标注 OPEN。不把 Ads 点击等同 GSC 自然点击，更不能与 GA4 sessions 合并。
4. 将合法读回内容写至私有目录（不要放 Public GitHub），运行 `node skills/google-ads-site-intelligence/scripts/ads-audit.mjs --input <private-ads.json> --dry-run`。若需保存摘要，指定 `--output .private-s1/<site>/google-ads-evidence.json`，同名文件拒绝覆盖。输入 JSON 格式参阅 `references/data-contract.md`。
5. 核对转化事件名称、Google Ads 转化纳入设置、归因口径、有效客户询盘的 CRM/WordPress Case ID；没得到独立业务记录时只能报 `platform_conversions`，`qualified_leads=NOT_VERIFIED_BY_GOOGLE_ADS`。营收、ROI、ROAS 不得由转化次数推断。
6. 产出中文报告：账户/时段/币种、各 Campaign 消耗和展示、搜索词漏斗、成本波动、归因质量、P0/P1/P2、30/60/90天计划。通过独立 Word 工具产生文档；本脚本只给 JSON 证据，不代表 Word 已完成。

## 验收
Node source + mock tests是工程 PASS；Windsor 实际有返回行时仅 `PARTIAL_LIVE_CONNECTOR_ROWS`，因为是否覆盖整个账户、最终转化、有效询盘尚需业务独立验收。不得把本阶段 UAT 当成广告投放策略的授权。
