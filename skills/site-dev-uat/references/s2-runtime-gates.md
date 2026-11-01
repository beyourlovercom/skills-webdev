# S2 三环境 UAT 与审批门禁｜Local → Dev → WWW

此文件是共享规范，不是运行凭据或远程执行工具。优先级：**实际 GitHub 与运行时、目标仓库最高级 AGENTS.md、Owner 精确审批、项目特殊约束** > 此公共说明 > 模板和过往对话示例。

## 1. S2 进入条件
S1 已发布并有与目标项目对应的数据分析；可以缺少 Semrush 或归因完整性，但缺失必须是 `OPEN`，不能用预测当事实。S2 工作包要写目标项目、所在 GitHub 仓库、网站真实 Local/Dev/WWW 地址、改动边界、验收人、文件/数据库变更和排除范围。

## 2. 功能验收矩阵（按站点适用性）
| 项目 | Local | Dev | WWW |
|---|---|---|---|
| 精确代码 SHA / 仓库和当前运行时 | 必须 | 必须独立读回 | 发布前/发布后独立读回 |
| 浏览器真实渲染与关键跳转 | 必须 | 必须 | 非破坏性核查 |
| 顾客前台 PC + Mobile | 若有前台，必须 | 若有前台，必须 | 适用 |
| Andy 插件后台管理界面 | Desktop-only | Desktop-only | Desktop-only |
| 表单、询盘、邮件通知 | 测试数据 / sandbox | 合法测试收件箱 / 无正式副作用 | 受控 Canary，不能伪造有效客户 |
| Woo 产品、SKU、变体、购物车、结算 | 若项目有电商才适用 | 测试支付与隔离回调 | 非破坏性检查或独立获批真实测试 |
| SEO：路由/canonical/robots/sitemap | 校验 | Dev 隐藏收录 | WWW 保留/变更须独立审批 |
| 备份/差异/回滚与失败处理 | 方案 | Dev 演练 | 备份已可恢复 / 停止阈值 |
| Cron、外部仓库/API/支付/Ads/SMTP | 清单与隔离 | 受控沙盒/OFF | 不可因发布 Skill 自动打开 |

## 3. 禁止的捷径
- 只通过 `node --test`、PHP lint、HTTP 200 就宣布完整 Local/Dev/WWW PASS。
- 将 Dev 全站数据库同步覆盖 WWW；更改正式订单、客户、库存、付款记录和询盘。
- 删旧站或自动 301 / 放开索引来“通过 SEO”，或复制未授权第三方代码/图片/品牌。
- 自动安装未验收插件、重启 READY 电脑/Chrome、重复打开页面、跳过最新运行时核对。
- 把一次 Owner 对 Dev 的 pass 扩大成 WWW 的 pass；把某个网站的例外改成全站通用默认。
- 在公开仓库存放真实账号、Token、客户订单、商业分析报表或未经脱敏截图。

## 4. 可机器检查的证据契约
`../site-builder-local/scripts/s2-handoff-validate.mjs` 以 `--manifest <private-json> --gate local|dev|www` 运行。它**只检查声明的证据结构**：项目/环境/安全策略、40 字符 SHA、每项证据 URL 与实际 host、stage PASS、Dev/WWW Owner pass 引用和备份/回滚引用；不运行站点，不提交部署，不核验 Owner 身份。返回 `READY_FOR_*_REVIEW` 的含义是“可由人和当前工具再次核查”，**不是部署 token**。模板默认 `BLOCKED`，不含真实审批。

`--gate dev` 需要真实 Local browser UAT 已通过，以及对具体 Dev、SHA、变更范围的独立授权。 `--gate www` 还需要真实 Dev PASS、WWW 独立 pass、正式站读回快照及回滚验证记录。所有生产动作执行前再次人工/工具核实审批的合法性和环境最新状态。

对于某站 Dev 就是最终正式站点（例外），不适用自动三环境门禁；项目 AGENTS.md 必须明确最终域和另行 Owner 放行。

## 5. S2 报告最小结构
`项目 & Git HEAD → Local 变更/测试 → Dev 发布/回归 → WWW 候选差异 → Owner pass → WWW 实际读回 → 回滚状态`。每个状态必须注明精确 SHA、host、时间、证据来源、PASS/FAIL/OPEN。任何未实测项均是 OPEN。一个站的项目专属 Skills 应根据这个站的 PHP/WP/Shopify 技术栈、真实支付、表单、GSC、SEO、访问权限独立生成，不可硬编码别的站点账号。

## 6. 严格区分 WWW 发布前与发布后

- `--gate www` 是**发布前** Owner 许可、Dev PASS、备份、回滚与精确 SHA 的静态预检，仅返回 `READY_FOR_WWW_DEPLOYMENT_REVIEW`。**不得标记 WWW PASS**，因为真实生产读回此时不可能存在。
- `--gate www-post` 是实际获批发布后的**独立生产读回**门禁。必须有 `stages.www.status=PASS`、同候选 SHA 的 `HTTP_READBACK` 实际证据与 Owner WWW pass，才可返回 `READY_FOR_WWW_POSTDEPLOY_REVIEW`。
- 两种 READY 都仅表示所提交证据的**静态结构检查**，不是本工具验证了审批消息或运行时本身，更不是部署命令。
