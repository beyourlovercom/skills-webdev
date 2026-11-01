---
name: s1-cross-source
description: S1-D–F 网站 GSC、GA4、Google Ads、Semrush 的证据收集、口径隔离、SEO 规划和审查交接。
---

# S1 Cross-source Site Intelligence (S1-D–F)

## 实际顺序
1. 读取本仓库 Registry、各 S1 子 Skill 及目标站 `AGENTS.md`。GA4 功能已由 Owner 验收时不要重复测试；不得视旧 GA4 缓存为新数据。GSC 优先 Owner 中国 Mac 现有已登录 Chrome，Google Ads 通过合法 Windsor 连接，Semrush 优先已有离线导出；每份来源保留时间、域名、币种、时区、筛选和真实性。
2. 四源分别生成**私有证据**，不混同来源。GA4 sessions、GSC organic clicks、Ads paid clicks、Semrush 估算流量并不是同一个指标，不能相加。
3. 用 `scripts/s1-fuse.mjs` 对用户提供的 manifest 作来源、域名、Ads 账户映射、日期可比性和缺失项审计。**用户显式提供的 Ads 账户→域名映射也不是最终客户归因证据**。无真实 CRM lead Case ID 和闭环订单金额时，统一 `qualified_leads=OPEN`、`revenue_and_roi=OPEN`。
4. 报告分成“事实与原始来源”“范围/口径/缺失”“交叉证据与冲突”“机会与风险假设”“P0/P1/P2 优先级”“页面/URL/内容建设规划”“30/60/90 天监测”“Codex Local→Dev→WWW 工作包”。每个建议必须标明直接证据或假设，真实业务写操作另需 Owner pass。
5. 多站点模板应根据目标市场/站点具体定制；不得把 YBY、BYL、idollmate 的真实数据或账户硬编码为通用模板。可另行生成受控 Word、XLSX 和 Codex 提示词，但本 Skill 代码只处理证据与安全门禁。

## Gate
`PASS` 是对应**工程和已验证来源读取**，而非整套营销业务完成。缺少 Semrush 实测数据、GA4 全新 API 或 CRM 的情况下，只能 `PARTIAL_MISSING_SOURCES` 或 `PARTIAL_UNVERIFIED_CROSS_SOURCE`，不可伪装 full UAT PASS。真实 UAT 首选 ybyirrigation.com 已合法授权来源；公开仓库仅保存非敏感汇总门禁与合成测试数据。
