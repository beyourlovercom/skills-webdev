# Ads 真实读取 JSON 契约

文件须保存在受保护目录，不能提交 Public GitHub。输入最外层：
`{"source":"WINDSOR_GOOGLE_ADS_READONLY","account_id":"123-456-7890","currency":"CNY","account_time_zone":"Asia/Shanghai","date_from":"2026-10-25","date_to":"2026-10-31","rows":[{"date":"2026-10-25","account_id":"123-456-7890","account_currency_code":"CNY","account_time_zone":"Asia/Shanghai","campaign":"Sample","campaign_id":"123456789","impressions":12,"clicks":2,"spend":1.5,"conversions":0,"conversions_value":0}]}`

数值原样来自已发现字段，金额遵守账户币种 **不是 USD**。Google Ads API 原始 `cost_micros` = 货币单位 × 1e6，但 Windsor 已转换的 `spend` 是普通金额；**不能再除 1e6**。不可重复计算同一 date+campaign_id，缺失日期和全账户归属应标示 OPEN。平台上的 conversions 与实际 CRM 询盘可能有归因、窗口、重复和内部 UAT 偏差；明细查询词与 Campaign 统计不应交叉相加。

官方参考：https://developers.google.com/google-ads/api/fields/v26/metrics
