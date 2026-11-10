---
name: duplicate-site-skills
description: Use for rights-cleared, auditable recreation or migration of an existing website into an independently owned target using GitHub and authorized Windows Local/Dev/WWW environments. Covers source inventories, local asset mapping, browser fidelity, WordPress MU adapters, forms, SEO, publication gates and rollback. Never assumes permission to copy third-party content or to publish a mirror.
---

# duplicate-site-skills — 可审计的网站复刻/迁移 Skill (V3.1)

## V3.1 新站 Windows Local 固定目录（Owner 已批准）

从 2026-11-10 起，**所有新增、已获授权的 V3.1 网站本地化项目**统一使用 `D:\ai\sites\<domain>\`（例如 `D:\ai\sites\lelo.com\`）。在此项目根目录下依次保存 `source/`、`mirror/`、`local/`、`uat/`、`release/`，并以项目根作为 V3.1 CLI 的 `--root`。原已有网站及 Local WordPress 注册记录全部原地保留，严禁自动移动/重装旧站、复用旧站数据库或覆盖已有目录。现有 `C:\ai\lelo-blog-local` 是独立 LELO Blog 项目，新 LELO 整站不得与其混用。

首次 R0 仅建立隔离目录；待站点的授权范围、源 URL 清单和国家语言版本冻结后，再开展采集/镜像。详细规则见 [V3.1 Windows Local Workspace Policy](../../docs/skills-v3.1/windows-local-workspace-policy.md)。目录准备完成不代表来源站点或生产发布审批完成。

## V3.1 统一执行入口（覆盖早期版本的工具接线）

V3.1 的正式版本与运行契约以 [系统发布说明](../../docs/skills-v3.1/release-notes.md) 和 [V3.1 使用说明](../../docs/skills-v3.1/README.md) 为准。R1 代表页模板工厂、R2 SiteOne/PWC 选择性恢复、R3 WordPress/最终一次 CSS+JS 封装、R4 GitHub/Local 证据管理统一复用原工具；不得研发重复的基础构建器。

1. **授权 URL 分母与 HTML 种子：** 用 `scripts/skills-v31-seed.mjs` 从已批准的完整源清单自动生成 Local Manifest，发现原 HTML 并计算 SHA。它绝不自动设置模板 Owner PASS、视觉 PASS 或网站发布 PASS。
2. **真实 Local 预览：** 用 `scripts/skills-v31-local-site.mjs` 搭建 localhost-only、只读的完整导航与 Sitemap；未生成页仅列入待处理队列，不发布假链接。
3. **失败项验收：** 用 `scripts/skills-v31-gate.mjs` 检查 PC+手机、内容/安全/交互、资源 SHA、两处真实站内入链和冻结 URL 分母；技术门禁仍 OPEN/FAIL 时不可宣称全站完成。
4. **模板与单页审批边界：** 每种不同的代表模板仍须取得可追溯的 Owner 视觉 PASS；同模板后续真实页面在双端来源比对均达到项目阈值（默认不低于 0.97）、无素材/交互/内容异常且证据齐全时，**可由技术门禁自动确认页面 PASS**，不重复要求 Owner 逐页审批。缺失真实来源截图、假造评分或不同模板不能自动 PASS。
5. **两个独立发布层级：** Skills 3.1.0 在 GitHub main 可正式发布，但不代表任何具体站点的 Local 最终 CSS/JS、Dev/WWW 已通过。最终封装只能在全站真实门禁通过后运行 PR #17 的专用包工具；网站正式发布另须明确授权。

## 🔒 最高优先级：第一轮绝不翻页，视觉先行（Visual-first）
**本条覆盖本 Skill 旧版 D1–D8 中任何“先完成全站清单、全量产品采集”的解释。**

第一阶段只读取主页、**每个所选列表/分类/博客模板自己的第一页**、一条来自该第一页的真实代表性商品详情以及必要的标准 Pages。任何分页/搜索/筛选/评论/品牌/无限滚动，仅允许 page=1 / offset=0；**禁止访问或自动抓取第 2 页以上、next cursor 和后续详情集合**。对**第一轮所选页面**，应先取得并本地保存实际使用的全部原素材（原 Logo、字体、CSS、背景、Banner、第一屏到 Footer 的所有懒加载/响应式图片、首列表每个真实卡片图、样本商品完整图库与缩略图），不用合成占位资源。

只在 Windows Local 完成所选页面的原站 100% 视觉还原目标，用原站与 Local 的真实浏览器全页截图、PC/移动布局和资源清单逐页核对，发现差异先修复。**每种代表模板的首次视觉冻结须由 Owner 明确审查并回复 `pass`；后续同模板的不同内容页允许按 V3.1 真实双端评分 ≥0.97 和完整功能/资源门禁自动 PASS**。HTTP 200、单测、素材成功或普通“继续”均不能单独替代审批或真实双端证据。只有保存 Owner 对**该模板模块**的明确审批引用、日期、审核页面范围和视觉基线，才允许本模块批量归档；未批准的其他模板继续保持单样本门禁。分页深度和详情数量仍严格按项目 Owner 最新 scope 执行。Dev/WWW 和 GitHub main 仍需独立审批。更详细的门禁见 [06-first-page-visual-gate.md](references/06-first-page-visual-gate.md)。

## V1.2｜48 小时模块工厂（最高优先级，覆盖旧版全站一次性门禁）
**目标：** 有合法来源与实际访问条件时，争取在 **48 个活跃执行小时**内完成约定范围的 Windows Local 原站备份。使用 `FULL_NONBLOG`（真正覆盖全站所有非 Blog 内容，需所有商品详情）或 `FIRST_PAGE_CATALOG`（所有明确指定列表入口只存第一页、商品仅指定样本；属于范围内完整备份，不得自称全站全部产品）。单项目以其最新 Owner 范围为准；不能因为本 Skill 支持全站模式就扩大已批准范围。**Blog 全部排除**时应排除文章、博客目录、标签、评论、相关 RSS 和仅属于博客的图片。

**不可变执行链：** `读取 1 个真实样本 → 分析 DOM/字体/Logo/CSS/图文/交互 → Windows Local 原样还原 → Chrome PC/移动自动 UAT → Owner 明确视觉 pass → 批量执行同类型路由/图片 → SHA/导航/离线完整率门禁 PASS → 下一模块`。按以下**有序模块**执行：①共享外壳（首页/Header/Footer），②商品/分类列表，③真实商品详情/图库，④基础内容/服务/Contact/FAQ，⑤交互（本地无副作用），⑥全站离线验收。确有不同的页面模板时先单独取一页样本、取得对应审批，不能强套既有模板。**每个模块有独立 Owner PASS**，首页 PASS 只冻结共享外壳，不能自动解锁列表或详情的批量采集。

**防止反复研发：** 模板审过后冻结 Logo、Header、Footer、公共 CSS/token、组件结构、截图和 template SHA；批量阶段从同一个模板加载每页真实内容、URL 与图片，不重画设计、不反复打开新的浏览器会话、不从零重建。仅当复测证明共享组件回归失败时做最小差异修复，并只重审受影响模板。断点续跑：按 source URL → local route → 原媒体 SHA256 映射去重，`PASS` 不重复下载；失败项独立重试。

**48h 预测门：** 先读取源站/官方导出、标出内容总数、唯一素材体量、模板数量，并实测页面/小时、资产/小时；每个模块都计算剩余活跃小时和 Owner 等待小时，按 `0–2h 启动 / 2–7h 外壳 / 7–15h 列表 / 15–27h 详情 / 27–34h 内容 / 34–41h 交互 / 41–48h UAT` 预算控进度。首次速度无法测量则 `UNMEASURED`，预测超 48h 就 `AT_RISK_48H`，不得牺牲真实内容与人工门禁冒充完成。若源站体量太大、403、原站后端不可导出或 Owner 审批等待过长，应如实记录瓶颈并提出合法导出、缩小范围或延长期限三种分支。

**新必读：** [07-48h-module-factory.md](references/07-48h-module-factory.md)（详细顺序与预算）、[backup-48h-ledger.example.json](templates/backup-48h-ledger.example.json)（各模块 Owner 审批/进度账本）、[backup-48h-gate.mjs](scripts/backup-48h-gate.mjs)（离线硬门禁）。`node --test tests/backup-48h-gate.test.mjs` 验证禁止跳过人工验收。脚本不自动认证用户批准，也不能代替真实浏览器验收。此契约是 Windows Local 备份，不授权 Dev/WWW/GitHub main 发布。

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
