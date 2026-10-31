# Andy WebDev Skills — 网站 Skills 使用说明（中文）

> **这是公开可读的技能目录，也是 GPT 网页版使用 GitHub + 自建 DC 的统一入口。** 每一个 Skill 是一套操作规则，不等于已经安装的软件、已经连接 Google 账号，或者已经获得生产变更授权。

## 1. 这套仓库能做什么？

把网站的研究、数据分析、Windows Local 研发、Dev 验收、WWW 发布、SEO 和文章工作拆为可以复用的 Skills。**GPT 负责读取规则、选择已授权的工具和核验证据；GitHub 保存版本；自建 DC 只执行其权限允许的本地操作。**

- **人阅读本页**：了解每项能力、目前做到什么程度、怎么使用。
- **GPT 读取 [`registry/skills.json`](registry/skills.json)**：按 Skill ID 查找 GitHub 分支和 `SKILL.md`，核对当前 PR 状态，再读取具体规则。
- **站点自己的 `AGENTS.md` 优先**：网站专属规则、代码 SHA、Local/Dev/WWW 发布门禁比共享说明更优先。

## 2. 目前有哪些 Skills？

> 状态快照：**2026-10-31**。`IN_MAIN` = 已在主分支；`DRAFT_PR` = 已有代码但仍在待审 PR；`PLANNED` = 规划中。PR 状态可能变化，执行前应重新核对 GitHub。

| 阶段 | Skill（点名称查看原文件） | 可以做什么 | 现在的状态 |
|---|---|---|---|
| GENERAL | [rapid-webdev](https://github.com/beyourlovercom/skills-webdev/blob/main/skills/rapid-webdev/SKILL.md) | 核对现有项目进度，只做剩余差异；从 Local 测试到受控 Dev 验收。 | ✅ main |
| SPECIAL | [duplicate-site-skills](https://github.com/beyourlovercom/skills-webdev/blob/feat/duplicate-site-skills-v1-20261031/skills/duplicate-site-skills/SKILL.md) | 把 CentralXI 复刻经验提纯为**仅限已获授权网站**的源站清单、Windows Local、PC/M14、Dev、WWW、SEO/询盘、回滚 D0–D8 流程；配有离线 Manifest 校验和 8 项测试。 | 📝 [Draft PR #7](https://github.com/beyourlovercom/skills-webdev/pull/7) |
| S0 | [site-skill-factory](https://github.com/beyourlovercom/skills-webdev/blob/feat/s0-site-skill-factory-20261030/skills/site-skill-factory/SKILL.md) | 依据受核查的网站画像生成各阶段网站专属 Skill 和审批门禁。 | 📝 [Draft PR #1](https://github.com/beyourlovercom/skills-webdev/pull/1) |
| S1 | [site-intelligence](https://github.com/beyourlovercom/skills-webdev/blob/feat/s0-site-skill-factory-20261030/skills/site-intelligence/SKILL.md) | 研究站点、市场、关键词、渠道、真实业务转化，为新站提出建设路线。 | 📝 [Draft PR #1](https://github.com/beyourlovercom/skills-webdev/pull/1) |
| S1 | [ga4-site-intelligence](https://github.com/beyourlovercom/skills-webdev/blob/feat/ga4-site-intelligence-20261031/skills/ga4-site-intelligence/SKILL.md) | 保留上传的 GA4 TXT 分析规范，读取已授权的 GA4 属性并输出有证据的分析。 | 📝 [Draft PR #4](https://github.com/beyourlovercom/skills-webdev/pull/4) |
| S2-A | [site-builder-local](https://github.com/beyourlovercom/skills-webdev/blob/feat/s0-site-skill-factory-20261030/skills/site-builder-local/SKILL.md) | 在隔离的 Windows Local 环境按项目规则完成代码与功能研发。 | 📝 [Draft PR #1](https://github.com/beyourlovercom/skills-webdev/pull/1) |
| S2-B | [site-dev-uat](https://github.com/beyourlovercom/skills-webdev/blob/feat/s0-site-skill-factory-20261030/skills/site-dev-uat/SKILL.md) | 在获授权的 Dev 环境复核浏览器、表单、插件、SEO 与回滚。 | 📝 [Draft PR #1](https://github.com/beyourlovercom/skills-webdev/pull/1) |
| S2-C | [site-www-release](https://github.com/beyourlovercom/skills-webdev/blob/feat/s0-site-skill-factory-20261030/skills/site-www-release/SKILL.md) | 仅在 Owner 独立批准后部署已验收差异并核对生产读回。 | 📝 [Draft PR #1](https://github.com/beyourlovercom/skills-webdev/pull/1) |
| S3 | [analytics-live](https://github.com/beyourlovercom/skills-webdev/blob/feat/s0-site-skill-factory-20261030/skills/analytics-live/SKILL.md) | 检查正式站数据埋点与去重，把事件同业务记录对照。 | 📝 [Draft PR #1](https://github.com/beyourlovercom/skills-webdev/pull/1) |
| S4 | [seo-live](https://github.com/beyourlovercom/skills-webdev/blob/feat/s0-site-skill-factory-20261030/skills/seo-live/SKILL.md) | 根据关键词-URL 映射和实时证据优化页面 SEO，记录结果。 | 📝 [Draft PR #1](https://github.com/beyourlovercom/skills-webdev/pull/1) |
| S5 | [content-migration](https://github.com/beyourlovercom/skills-webdev/blob/feat/s0-site-skill-factory-20261030/skills/content-migration/SKILL.md) | 根据版权、URL、搜索价值和新旧站关系决定保留/合并/重写。 | 📝 [Draft PR #1](https://github.com/beyourlovercom/skills-webdev/pull/1) |
| S6 | [content-automation](https://github.com/beyourlovercom/skills-webdev/blob/feat/s0-site-skill-factory-20261030/skills/content-automation/SKILL.md) | 研究选题、编写并审核草稿；审批后才允许排期或发布。 | 📝 [Draft PR #1](https://github.com/beyourlovercom/skills-webdev/pull/1) |

### 还没有开发完成的能力

- **`gsc-site-intelligence`（S1）**：已设计 GSC 分析提示词，但**还不是可执行 Skill**；未出现在上述可用代码列表中。
- Google Ads / Semrush 独立分析器：可由 S1 调度现有合法连接，但**独立 Skills 仍待开发**，不能假装已经安装。

## 3. 完整工作流程是什么？

```text
输入网站域名 + 业务目标
  ↓ S0 site-skill-factory（生成这个站的规则和工作计划）
  ↓ S1 site-intelligence（读取已授权来源，研究 SEO/GA4/广告/业务）
      ↳ ga4-site-intelligence（GA4 子 Skill；可独立使用）
  ↓ S2-A site-builder-local（Windows Local 研发和真实 UAT）
  ↓ S2-B site-dev-uat（托管 Dev 验收）
  ↓ S2-C site-www-release（Owner 独立 pass 才能写 WWW）
  ↓ S3 analytics-live（正式追踪和有效转化核验）
  ↓ S4 seo-live（真实搜索证据驱动的页面优化）
  ↓ S5 content-migration（旧站内容迁移、版权与重写）
  ↓ S6 content-automation（审核后的内容生产和排期）
```

**注意**：S3–S6 的正常运营需要对应的生产业务授权；任何代码/主题/插件/数据库修改仍回到网站自己的 Local → Dev → WWW 流程。不同网站可对执行顺序有明确例外。

### 可选专线：duplicate-site-skills（仅在有复制授权时）

`duplicate-site-skills` 是针对**自有或获得许可的站点复制/迁移**的专题 Skill，不是可以任意复制第三方网站的工具。它将 CentralXI 的成功路径与失败教训写成可操作门禁：D0 权利与品牌真实性 → D1–D2 页面/资源/路由清单 → D3–D5 Windows Local/Dev UAT → D6 Owner WWW pass → D7 生产读回 → D8 GSC、GA4 与有效询盘。发布/开放收录都需要目标项目独立授权，且不会把 802 页等某个项目的固定数字写成通用目标。

实际文件包括 [`SKILL.md`](https://github.com/beyourlovercom/skills-webdev/blob/feat/duplicate-site-skills-v1-20261031/skills/duplicate-site-skills/SKILL.md)、6 份参考规范、[Manifest 范例](https://github.com/beyourlovercom/skills-webdev/blob/feat/duplicate-site-skills-v1-20261031/skills/duplicate-site-skills/templates/site-manifest.example.json)、[UAT 报告模板](https://github.com/beyourlovercom/skills-webdev/blob/feat/duplicate-site-skills-v1-20261031/skills/duplicate-site-skills/templates/acceptance-report.md)、离线校验器和测试。在合并前请从 Draft PR #7 分支读取。

本地可运行：
```bash
node skills/duplicate-site-skills/scripts/validate-manifest.mjs skills/duplicate-site-skills/templates/site-manifest.example.json
node --test tests/duplicate-site-skills.test.mjs
node scripts/skill-registry.mjs --resolve duplicate-site-skills
```

## 4. 在 ChatGPT 网页版怎么使用？

首先保证 GitHub 连接可读目标仓库、自建 DC 已获授权且设备在线。GPT **不能**因为看到 `SKILL.md` 就自动取得 Chrome 登录态、GA4 OAuth 或生产写权限。

**建议复制下面的启动指令：**

```text
请先通过 GitHub 阅读 beyourlovercom/skills-webdev 的
registry/skills.json，并核对指定 Skill 对应的 PR 状态、分支与版本。
再读取这个 Skill 的完整 SKILL.md、所有 references、相关脚本说明，
以及目标项目自己的 AGENTS.md、GitHub 当前 SHA 与既有 PASS 记录。
优先调用已经授权的 GitHub 和自建 BYL DC（Windows 设备），
采用只读检查 → 隔离测试 → 结果核对的顺序；任何账号登录权限、
GA4/GSC/Ads 数据源必须独立验证，不得以 Skill 文件代替授权。
保留 OPEN/FAIL，勿冒充 PASS；不得擅自合并 PR、重启 READY 设备
或修改生产网站、真实客户数据、Ads 预算。
本次目标 Skill：[填写，例如 ga4-site-intelligence]
本次网站：[填写，例如 ybyirrigation.com]
```

### 只跑 GA4 Skill 的例子

```text
读取 registry/skills.json 中的 ga4-site-intelligence（注意它在 Draft PR #4），
加载原始 GA4 TXT 和数据契约，检查 ybyirrigation.com 的合法 GA4 属性访问；
若已授权，通过 Windows 自建 DC 只读获取数据，按规范生成中文报告及 Codex 交接。
未授权就报告 BLOCKED，不编造分析，也不要求我在聊天里粘贴 Token。
```

## 5. Registry 如何被 GPT 使用？

- [机器可读目录：registry/skills.json](registry/skills.json) ：存储 `id`、`stage`、`source_ref`、`skill_path`、`status`、`pr`、中文用途和交付。
- `DRAFT_PR` 的 Skill 必须从它自己的**开发分支**读取，不能以为 `main` 已存在。
- 使用 GitHub 连接的读取工具逐个读取 Skill 及 references；**Registry 本身不能自动运行，也不能自动登录第三方服务**。
- 如在本地拥有源码，可运行 `node scripts/skill-registry.mjs --list` 或 `node scripts/skill-registry.mjs --resolve ga4-site-intelligence` 查看入口（离线，不访问账号）。
- [Registry 设计约定](registry/README.md) 描述了字段、状态维护及验证方式。

## 6. 实际研发和验收案例

| 案例 | 状态 | 查看证据 |
|---|---|---|
| Rain Bird 外部公开网站 S0 样本 | Draft PR #2 | [验收报告](https://github.com/beyourlovercom/skills-webdev/blob/pilot/rainbird-public-s0-20261030/pilots/rainbird/S0-PILOT-REPORT.md) |
| YBY Irrigation 真实网站 S0–S6 门禁样本 | Draft PR #3 | [验收报告](https://github.com/beyourlovercom/skills-webdev/blob/pilot/ybyirrigation-s0-s6-readonly-20261031/pilots/ybyirrigation/S0-S6-READONLY-UAT.md) |

案例说明：Rain Bird 仅有公开来源，并非拥有其 Analytics/后台；YBY Pilot 包含真实 GitHub/Windows 和部分 Google Ads 只读证据，但 GA4/GSC/WordPress 有效询盘跨源核对仍未全部通过。**样本通过不等于 S0–S6 在生产全面 PASS**。

## 7. 安全和仓库边界

- **本仓库 Public**：仅放通用 Skill、公开安全的示例、CLI 与测试；不放私有网站凭据、客户/订单/询盘详情、真实 GA4/Ads 原始报表或设备私密配置。
- **各项目仓库**：保存网站自己的 `AGENTS.md`、代码与已验收项目事实；如涉及秘密和业务数据，应存入获授权的私有位置。
- **ChatGPT 网页版**：可按指令从 GitHub 读取 Skill；这不等于 ChatGPT 原生技能安装，也不等于已有执行连接。
- **合并和生产发布**：任何 PR 合并、WWW 发布、付费广告变更和高风险批量变更需要 Owner 按项目审批。
- **GA4 特别说明**：GA4 API 脚本是只读读取器，`--dry-run` 不联网；真实读取需要合法的 `analytics.readonly` 授权；脚本产生受保护证据 JSON，Word 文档须由文档生成流程完成。

## 8. 开发状态与下一步

**当前 `main` 的已发布 Skill 只有 `rapid-webdev`。** 本公开 README 与 Registry 是使用指南和技能索引，不代表其他 Draft PR 已合并；请使用 `registry/skills.json` 中对应的开发分支读取其他 Skill，并在执行前核对实时 PR 状态；其他 PR 的合并仍需 Owner 单独批准。

当前独立开发分支有 [S0–S6 PR #1](https://github.com/beyourlovercom/skills-webdev/pull/1)、[Rain Bird PR #2](https://github.com/beyourlovercom/skills-webdev/pull/2)、[YBY Pilot PR #3](https://github.com/beyourlovercom/skills-webdev/pull/3)、[GA4 PR #4](https://github.com/beyourlovercom/skills-webdev/pull/4)、[Duplicate Site PR #7](https://github.com/beyourlovercom/skills-webdev/pull/7)。此处的“已开发”仅代表代码及对应测试状态，并不表示第三方数据已授权连接。

