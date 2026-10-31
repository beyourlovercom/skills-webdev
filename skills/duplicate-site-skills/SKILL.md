---
name: duplicate-site-skills
description: Use for rights-cleared, auditable recreation or migration of an existing website into an independently owned target using GitHub and authorized Windows Local/Dev/WWW environments. Covers source inventories, local asset mapping, browser fidelity, WordPress MU adapters, forms, SEO, publication gates and rollback. Never assumes permission to copy third-party content or to publish a mirror.
---

# duplicate-site-skills — 可审计的网站复刻/迁移 Skill (V1)

## 目的与调用边界
从 CentralXI 项目提炼可复用**流程与测试方法**，不是复制 CentralXI 的 802 页 HTML、品牌、代码资产或账号。采用先清点现状、只补差异、隔离开发、可观测验收、受控发布。这个 Skill 是 GitHub 中的操作规范；读取文件不等于原生安装、拥有 GitHub/DC/WordPress 登录态或得到生产授权。

**触发**：Owner 提出已有网站迁移、同主体站点复制、取得许可的演示镜像、视觉结构重建、旧站改版、已有镜像的修复与生产收录。
**不适用**：不明授权第三方站点的大规模镜像、伪装主体身份/地址/证言、复制支付及客户数据、突破反爬/登录/版权控制、为刷搜索权重批量制造重复站。

## 立即加载的参考文件
- [00-intake-rights.md](references/00-intake-rights.md)：权属、目标、项目配置与 BLOCKED 门。
- [01-source-manifest.md](references/01-source-manifest.md)：URL/素材清单、源站快照、存储与差异。
- [02-local-dev-uat.md](references/02-local-dev-uat.md)：Windows Local、页面保真、插件和浏览器 UAT。
- [03-release-rollback.md](references/03-release-rollback.md)：Dev → WWW、发布审批、监测、回滚。
- [04-seo-analytics-leads.md](references/04-seo-analytics-leads.md)：搜索收录、邮箱、弹窗和真实询盘。
- [05-centralxi-lessons.md](references/05-centralxi-lessons.md)：可复现的故障模式与证据边界。
- [templates/site-manifest.example.json](templates/site-manifest.example.json)：参数示例；不是生产站配置。
- [templates/acceptance-report.md](templates/acceptance-report.md)：每阶段 UAT、责任与证据记录。
- [scripts/validate-manifest.mjs](scripts/validate-manifest.mjs)：纯离线的 Manifest 静态门禁，不能代替真实权属审查和线上验收。

## 执行 0–8 关
| Gate | 目标 | 可验证交付 | 不通过时 |
|---|---|---|---|
| D0 | 查目标项目 GitHub、AGENTS.md、现有 PASS/FAIL 和**复制授权** | Rights / Scope / Source-of-truth 记录 | `BLOCKED_RIGHTS` |
| D1 | 只读审计源站 / 目标站 / 技术栈 / 相互关系 | URL、版权、路由、素材、交互清单 | `OPEN_SOURCE` |
| D2 | 原始素材/快照清单 + 哈希 + 目标路由策略 | 可追踪 Manifest 与差异清单 | `FAIL_INVENTORY` |
| D3 | Windows Local 独立实现，改动可逆 | 最小代码差异、单元/功能测试 | `FAIL_LOCAL` |
| D4 | 视觉、交互、邮箱、表单和非破坏性 UAT | PC/M14 截图和测试计数 | `FAIL_UAT` |
| D5 | 授权 Dev 环境隔离验证 | 真实 HTTP/Chrome/日志和回滚演练 | `FAIL_DEV` |
| D6 | Owner 对目标 WWW、SHA 和变更面**单独 pass** | 明确授权 + 前备份 + 发布清单 | `BLOCKED_RELEASE` |
| D7 | 生产真实读回：路由、品牌、内容、表单、SEO | 证据化 Canary + 差异和回滚状态 | `FAIL_PRODUCTION` |
| D8 | GSC / GA4 / 有效询盘持续监测及迭代 | 收录、真实线索、问题台账 | `OPEN_ANALYTICS` |

D0–D4 可以在获准的隔离环境持续开发；**禁止**把「可以开发」解读为「可向 WWW 写入」或「可以对外开放索引」。S3/S4/S5/S6 其他网站技能可复用此流程，但此技能不替代它们。允许来源包括自有站、获得明确可追溯授权的站、公开许可资产；商标/字体/图片/文案/API/第三方跟踪均须按授权范围分别处理。只有视觉**参考**而无复制许可时应重新设计，不复制源码和素材。

## D0 先问的问题（已有答案不重复询问）
- 源站、目标站、站点所有者，是否同主体，授权证明/许可范围是否存在？
- 是否允许复制代码/图片/文案/用户内容，各类权限的用途和期限？
- 项目的 `AGENTS.md`、GitHub、实际 Local/Dev/WWW、当前 HEAD 和已验收结果？
- 希望保持原版外观还是独立品牌？是否允许被搜索引擎索引？
- 表单入库、运营通知、公开邮箱和客服主体怎样对应？

若授权不能确认，交付只读差异分析和可原创重建的设计规范，**不开展大规模抓取或上线镜像**。书面/许可证据只记录非敏感的路径/审批编号；不将合同附件或私密授权证据放本 Public 仓库。

## 工作约定
1. GitHub/runtime wins；在代码、实时网站和旧对话冲突时以读回结果为准；差异标记 OPEN。
2. 尽量复用已经 PASS 的页面、组件与工具，不把一次 CSS/JS 变更升级为全站主题替换。Header/Footer/CTA 的像素基线先冻结。
3. Windows Local 开发，Dev 是托管回归，WWW 在新门禁后发布。Dev=正式站的项目需在 site-profile 显式说明，禁止自行推断。
4. Source HTML 存只读快照、SHA256 和路由映射；目标站的品牌/联系方式/SEO/营销跟踪优先用**站点专属小适配层**，不重写原始库。注意运行时插件停用会回滚覆盖效果；若要一次性迁移，须单独授权永久写入。
5. 一个功能仅一套所有者：MU 插件自动加载，普通插件可能重复声明函数产生 Fatal Error；查状态再安装。PHP 文件 lint PASS ≠ 实际运行 PASS。
6. 不复制源站的 GA/GTM、支付、客服、Cookie、授权密钥。目标站需要自己的分析与询盘链路；不可假冒源站身份。
7. 所有报告严格区分 CODE_READY、LOCAL_PASS、DEV_PASS、WWW_PASS、INDEX_ELIGIBLE、INDEXED、LEAD_RECEIVED、LEAD_VALIDATED；不将 `HTTP 200` 或 `received` 冒充业务成功。
8. BYL DC 只调用获准设备，READY 设备不重启，避免重复开 Chrome 标签；第三方权限、反爬、付费限额和平台安全检查不绕过。
9. 商用发布时必须核查版权、主体信息、真实联系方法、隐私政策；不传播虚构工厂/合作关系。
10. 必须有清晰的 SHA、回退路径、数据保留范围和 Owner 放行事实。**不因用户说“继续”自动批准新网站的正式发布。**

## 标准离线运行（仅在有本仓库工作副本和 Node.js 时）
```bash
node skills/duplicate-site-skills/scripts/validate-manifest.mjs skills/duplicate-site-skills/templates/site-manifest.example.json
node --test tests/duplicate-site-skills.test.mjs
node scripts/skill-registry.mjs --validate
node scripts/skill-registry.mjs --resolve duplicate-site-skills
```
示例 Manifest 属于 `demo`，静态校验通过**不意味着**获得来源许可或可以发布生产。

## 一句话调用（ChatGPT 网页版 + GitHub + DC）
```text
通过已连接 GitHub 读取 beyourlovercom/skills-webdev 的 registry/skills.json，
定位 duplicate-site-skills 的 source_ref/PR，读取完整 SKILL.md、
references、template 和目标项目 AGENTS.md；先核对授权与既有 PASS，
从 D0 开始仅推进证据支持的差异。通过获准的自建 DC 在 Windows Local 操作，
走 Local→Dev→Owner pass→WWW，未批准不得发布、开放收录或迁移客户数据。
目标源站：[填]；目标域名：[填]；本次阶段：[填]。
```

## 完成定义
交付 manifest、源/目标页面清单、资产许可/哈希、路由映射、视觉差异、交互和询盘证据、SEO 门禁、精确发布/回滚记录和未关闭问题；任何未实测项为 OPEN。不要宣称该 Skill 已安装到 GPT 或已对任何新站执行。
