---
name: site-dev-uat
description: S2-B — 对批准的 Local 代码差异在真实 Dev 做隔离部署、浏览器和业务 UAT，冻结 WWW 前置证据；不得自动上线 WWW。
---

# S2-B · Dev 受控真实验收 Skill V1

## 输入/先决条件
读取目标项目最高级 `AGENTS.md`、目标 Dev 域名/账号、S2-A 的 **准确 SHA 和 Local PASS**、Dev 部署授权范围、差异文件、插件和数据迁移说明、备份/回滚路径、已有测试结果。[统一契约](references/s2-runtime-gates.md) 优先于一般示例；项目规则更优先。

## Dev 流程
1. 用正式自建 DC 或已批准部署通道，**只读核对 Dev 实际 runtime、Git SHA、插件状态、数据库和任务队列**。不要假设 Local、Dev、WWW 数据一致，尤其不允许覆盖正式客户/订单。
2. 在已有独立授权的前提下，只向**精确 Dev 目标**部署已验收 SHA 的最小差异，保留变更前文件/hash/恢复方式；不能把“Dev 是测试站”理解为允许破坏数据。对于 `DEV_FINAL_EXCEPTION`（例如 Owner 明示 Dev 即最终站点），停止默认三环境流程，改走站点专属审批。
3. **索引与外部调用隔离：** Dev 保持 noindex、鉴权或等效保护；核对 canonical、robots/sitemap、跳转、开放收录风险。支付仅使用获批准的 TEST 环境；真实 SMTP、库存/OMS、广告转化、AfterShip webhook、外部自动下单等写入必须禁用或明确沙盒。自动 Cron、回调与异步副作用需单独盘点。
4. **浏览器实测：** 桌面与顾客前台手机端，Header/Footer、页面模板、SEO、CTA、询盘/表单通知（测试收件箱）、浏览/搜索/分类、隐私说明；Woo 项目按实际已启用功能核对产品/变体/购物车/币种/Checkout/失败路径。后台 Desktop-only 规则不豁免任何顾客端移动测试。
5. 验证 PHP 报错、插件兼容、DB schema 与无副作用回滚，必要时做受控非破坏性恢复演练。真实浏览器验收日志、截图与请求证据留在受保护环境，公共仓库只放非敏感摘要。
6. 每项记录 `PASS/FAIL/OPEN`、Dev hostname、**同一候选 SHA**、时间及证据引用；另生成与 WWW 之间的差异、预期更改列表及不能同步的敏感数据。运行 [S2 门禁](../site-builder-local/scripts/s2-handoff-validate.mjs) `--gate www` 仅做**候选静态预检**。
7. 提交 WWW **发布候选**，包含精确目标、文件/插件/数据库差异、备份和回滚方案、非破坏性 Canary / 监控 / 停止阈值；**不替 Owner 执行 WWW**。

## Gate
- 没有真实 Local PASS、Dev 授权、Dev 最新 SHA 的浏览器/功能/SEO/安全/回滚测试，不得宣称 Dev PASS。
- Dev UAT FAIL 必须在 Local 修复再进入 Dev；不得直接修改 WWW 规避失败。
- 不得因为 Dev PASS 就打开支付、邮件、库存或索引；不可自证 Owner 正式发布 pass。

输出：Dev 实际 UAT、完整阻断和已复现问题、具体修改影响范围与 Owner WWW 审批 Handoff。

## 使用提示
```text
读取 GitHub site-dev-uat/SKILL.md 和目标项目 AGENTS.md；
以已完成 S2-A 的 Local 实际验收与精确 SHA 为输入，通过获准 Dev 通道
部署最小差异并完成浏览器业务 UAT。检查 Dev 索引、支付、SMTP、OMS、
Cron、tracking 的隔离。生成 WWW 审批包但不得直接生产部署。
```
