---
name: site-www-release
description: S2-C — 仅在 Owner 对精确 WWW 目标、SHA、变更清单与回滚方案独立 pass 后，执行最小生产差异发布及真实读回。
---

# S2-C · WWW 独立审批与可回滚发布 Skill V1

## 不可绕过的审批门
**Dev PASS ≠ WWW 发布授权；GitHub PR 合并 pass ≠ WWW 发布 pass。** 每一次独立正式站写入必须核对 Owner 对**具体站点、精确代码 SHA、变更面、发布窗口**的明确 pass。没有明确授权就停在 RELEASE_READY；这份 Skill、静态 JSON、GitHub CI 与任何自动化脚本均不能制造或代替 Owner 的授权。

读取目标项目最高级 `AGENTS.md`、现行 WWW runtime、最新 main 和并发 PR、S2-A/S2-B 真实 PASS、受控 Dev 部署记录、回滚备份、准确目录/hash/schema 差异、合法授权和客户数据保护政策。

## 执行门
1. **发布前只读对比：** Dev / WWW 当前 SHA、WP 插件与主题、目标环境变量、URL、数据库迁移、支付与 webhook、Woo 订单/客户/库存、GSC/GA4/广告事件。任何漂移/并行更改要重新核对最小发布补丁，不能覆盖已上线的新更改。
2. 制作不可变的 `release manifest`：目标 WWW、准确 SHA、文件/插件/配置/内容与数据库变更列明；禁复制完整 Dev DB 至 WWW；保留正式订单、产品、库存、客户、支付、有效询盘、法律主体、邮箱与 SEO。正式站的自动索引、301、邮件、广告、支付通道和仓库/API 发送都视为独立高风险操作。
3. **Owner 分项授权：** PR 代码合并、WWW 实际发布、正式数据迁移、开放收录/Ads/支付/发货等应按实际风险分别获得 pass；不因“继续”“测试通过”而推断。按 `--gate www` 运行离线预检只用于发现证据漏洞，不是自动操作许可。
4. **备份+回滚：** 验证正式运行前快照、原文件与 DB 回滚策略、缓存与配置还原、停止阈值及责任人。不能以“这站无需备份”的泛化描述自动取消具有客户/交易数据的生产保护；Owner 对特定 Dev 测试站作的备份豁免也不自动适用于 WWW。
5. **获批后最小发布：** 仅批准的差异、冻结精确 SHA，不更新其他插件/主题，不执行顺手 SEO、数据清洗或 Ads 设置。发布时保留执行者、开始结束、实际更改、状态与失败阈值。
6. **生产真实读回：** HTTP/PC/Mobile、SEO canonical/robots/sitemap、已授权网站表单的安全 Canary、后台/前台关键功能、支付/物流/订单 **非破坏性**核查。没得到独立许可不提交真支付/真仓库单/真客户通知，不进行本应只读的索引/广告更改。
7. 每项生产证据标记 `WWW_PASS / FAIL / OPEN`。失败立即按批准回滚方案处理，不得靠重复点击或大量生产订单“修到好”。

## 站点专属分流
- 常规站：Windows Local → Dev（受控）→ WWW（独立 pass）。
- Owner 明确 Dev 充当最终站点：必须在项目自身 `AGENTS.md` 记录目标及特殊发布门，通用三环境验证器返回 BLOCKED，不能默许绕过。
- 旧站迁移与并行新站：是否 301 / canonical / Sitemap / noindex 需单独决定，绝不默认把两个域合并。

## 输出
Owner 的精确授权引用、release manifest、已发布文件列表、前后 SHA 与 host、备份/回滚引用、真实 WWW Canary/日志、后续监控（如索引与有效询盘）、任何 OPEN/回退事实。

```text
读取 site-www-release/SKILL.md、目标项目 AGENTS.md、S2-A Local 与 S2-B Dev
独立 PASS、精确发布候选 SHA、生产备份与差异。
先做只读 preflight；只有明确 Owner WWW pass 且范围相符才执行最小发布。
之后检查真实 WWW，并按 PASS/FAIL/OPEN 记录；不得自动修改 Ads/ERP/支付等超范围系统。
```

## WWW 后置读回与独立验收

`--gate www` 只能产生 `READY_FOR_WWW_DEPLOYMENT_REVIEW`，**不代表发布完成**；实际生产部署完成后，另运行 `--gate www-post`，保留 WWW 同 SHA 的真实 HTTP/浏览器与非破坏性业务读回，才能产生 `READY_FOR_WWW_POSTDEPLOY_REVIEW`。两者不能相互替代，离线工具本身不会部署、调用 WWW 或核实 Owner 身份。
