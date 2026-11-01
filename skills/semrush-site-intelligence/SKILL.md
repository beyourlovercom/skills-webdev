---
name: semrush-site-intelligence
description: S1 Semrush 竞品关键词、排名、外链和 SEO 机会，优先已有 CSV 离线数据，禁止未经审批消费付费 API units。
---

# Semrush Site Intelligence (S1-C)

## Zero-cost-first
先检查是否已合法取得 **Semrush 官方 UI 导出文件**，优先在 Windows Local 私有目录只读导入。Semrush 数据是第三方**估算**，不是 GSC 的真实点击或 GA4 sessions。需要采集目标/竞品域名、国家 database、导出时间、筛选条件、Top-N 限制、报告类型和来源；不能假装具备 Semrush 登录或 API 权限。

**收费门禁：OFF。** 官方 Standard API 需要 Business / 附加许可与独立购买 API units；不得未获 Owner 许可调用任何会消耗 units 的 API。背链 v3 部分接口已弃用，适用时以官方 v4 文档为准。API 研发和真实收费接口 UAT 保持 `OPEN_PAID_API_NOT_AUTHORIZED`，不阻止免费 CSV 导入能力验收。

## 执行
1. 本站与竞品目标域名必须单独明确；旧站与新站不能凭相似名称合并。记录关键词国家数据库（`us`、`de` 等）、报告日期、Rank/Volume/URL 口径。
2. 使用 `domain_organic` CSV：关键词、SERP 排名、估算月搜索量、落地 URL；或独立 `backlinks_refdomains`：来源域名、背链数。二者需不同 manifest，不得相加。
3. 依据 `references/data-contract.md` 配置本地 manifest，执行 `node skills/semrush-site-intelligence/scripts/semrush-import.mjs --manifest <manifest.json> --csv <export.csv> --dry-run`；保存使用 `--output .private-s1/<site>/semrush-<report>.json`。代码绝不联网。
4. 生成竞争对手及自身关键词差距、搜索意图分组、排名页面、链接机会、站点栏目和选题候选，附来源/估算标签。自然搜索流量、难度、排名等指标只在导出真实有该列时引用，否则 OPEN。
5. 最终 Word 和 Codex 交接必须把“估算/观察/假设/已证实”分开，优先结合 GSC 页面点击数据而非替代。用户没提供导出时保留 `BLOCKED_NO_SEMRUSH_EVIDENCE`。

官方文档：https://developer.semrush.com/api/v3/get-started/api-access/ 与 https://developer.semrush.com/api/v4/seo/backlinks/
