---
name: site-builder-local
description: S2-A — 在已授权 Windows Local 进行网站最小差异研发、独立浏览器 UAT 和精准 Dev 交接；不代表任何 Dev/WWW 发布授权。
---

# S2-A · Windows Local 研发 Skill V1

**目标：** 把已经发布的 S1 分析结果转为经过真实 Local 浏览器验证、可单独发布且可回滚的代码/页面变更。公开仓库提供共享流程；目标项目最新 GitHub、运行时和最高级 `AGENTS.md` 优先。

## 必须加载
- 目标项目的最高级 `AGENTS.md`、适用的子级规则、现有代码 HEAD / 未合并 PR、已通过的 UAT、环境清单。
- S1 的来源明确的报告、关键词→URL / 内容计划、真实需求优先级。缺少真实证据时把方案标注为假设，不虚构 GA4/GSC/Ads/Semrush 数据。
- [S2 环境、审批和验收契约](../site-dev-uat/references/s2-runtime-gates.md)。
- [S2 离线交接模板](templates/s2-handoff.example.json)、[门禁验证器](scripts/s2-handoff-validate.mjs)。模板都是虚构示例，绝不能当已验收站点。

## 开发执行 S2-A
1. **只读预检：** 通过正式自建 DC 选中 Owner 授权的 Windows Local（必要时可用 007windows，但绝不推断默认账号）。核对 Local 实例、GitHub HEAD、PHP/Node/WP/Woo/DB、目录隔离、端口、浏览器已登录状态和项目最新 UAT。READY 设备不重启，不反复打开 Chrome 窗口、不影响其他 Local 项目。
2. **现状优先：** 现有网站缺什么只补什么，功能已经 PASS 不重做。新站可按 S1 页面/栏目、合法素材及品牌资料设计；有授权的复制专线，先执行 `duplicate-site-skills` D0 权属门。未经许可不抓取/复刻第三方网站资产；不得混用两站的内容、GA/GTM、邮箱、支付和 CRM。
3. **隔离工作树：** 为每个站点建立单独目录/分支/数据库/端口；针对单一工作包列明文件、插件、数据迁移、SEO 路由和预期改动。代码变更先在 Local，尽量最小差异。不得直接把 WWW DB 或真实客户资料复制到测试库，使用匿名或合成订单/表单。
4. **UI 特别规则：** Andy 系列插件**后台管理界面**仅需 Desktop-only（不做手机后台 UAT）；但顾客可见的网站、Cart、Checkout、弹窗/表单和产品页面仍需桌面与手机端真实验证，不能用后台豁免前台移动端。
5. **实际 Local UAT：** PHP/JS lint、单测和集成测试不足以宣称 Local PASS。按项目测试矩阵实际用浏览器核查页面、Header/Footer、目录、关键 CTA、SEO URL、表单；如是 Woo/电商，增加变体/SKU、库存、币种、购物车、Checkout 测试模式和回调隔离（不发真实邮件、支付或仓库订单）。
6. 对每条通过的测试记 **实际 Local host、SHA、执行时间、截图/日志私有证据引用**；已有失败/缺失均为 FAIL/OPEN。页面视觉签字不能替代流程验收，源代码通过不能替代 Dev 浏览器验收。
7. 准备完整变更清单、数据库保留策略、回滚与备份引用、Dev 目标及 Dev 的独立授权；执行 `node skills/site-builder-local/scripts/s2-handoff-validate.mjs --manifest <private-json> --gate dev` 进行**纯离线**结构预检。即使返回 `READY_FOR_DEV_REVIEW` 也不是部署许可。

**交付门：** 提供 Git SHA、真实 Local 浏览器/业务测试结果、待 Dev 的差异和影响范围、回滚引用、失败项、Dev 授权证据。只读预检可以连续执行；有更高风险或跨环境写入时仍按 Owner/项目审批。

**不执行：** 不重启 READY 设备、不修改 WWW、不开生产支付/邮件/仓库 Hook、不推送生产订单、不直接合并需要审批的 PR。

## GPT 网页版启动指令
```text
从 GitHub 主仓 registry/skills.json 找到 site-builder-local 的实际 source_ref；
读取 SKILL.md、项目最高级 AGENTS.md 和已发布 S1 证据。
通过正式自建 DC 只读核对 Windows Local 与仓库 HEAD，
先完成代码差异和真实 Local UAT；只交付可复核的 Dev 发布候选，
绝不把本地测试 PASS 当成 Dev/WWW 的独立 pass。
```
