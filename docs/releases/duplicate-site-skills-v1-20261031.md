# duplicate-site-skills V1 — 正式归档

发布日期：2026-10-31
仓库：`beyourlovercom/skills-webdev`
技能入口：`skills/duplicate-site-skills/SKILL.md`
状态：**IN_MAIN**（已由 Owner 在会话中明确批准 `pass，合并 PR #7`）

## 合并记录
- PR：[ #7 — duplicate-site-skills V1 ](https://github.com/beyourlovercom/skills-webdev/pull/7)
- 合并形式：Squash Merge；GitHub 回报 `merged=true`。
- 合并提交：`1a88344f52ef0d8f2fd539ae821866c20d0c6185`
- PR 已通过 GitHub Actions Public Skill Registry Check，Run #23 SUCCESS（合并前 HEAD：`51b4d5b47e04ca56ac4887df624c15a9e6815339`）。
- 合并前自建 DC Windows Local 回归：**21/21 PASS**。
- 本次归档完成后，`registry/skills.json` 中 `duplicate-site-skills` 为 `status=IN_MAIN`, `source_ref=main`, `pr=null`；README 和 Registry tests 与其同步。

## 正式交付内容
- `SKILL.md`：D0–D8 原站授权、源站只读审计、合法素材与 URL 清单、Windows Local、PC/M14、Dev、Owner WWW 单独批准、可审计生产读回、索引与询盘持续改进。
- `references/`：6 份分阶段执行细则及 CentralXI 案例经验（仅工程教训，没有原站客户数据或素材）。
- `templates/`：非真实站点的 Manifest 示例和验收报告模板。
- `scripts/validate-manifest.mjs`：无外部依赖的 Node.js **离线静态校验器**，不连接或操作网站。
- `tests/duplicate-site-skills.test.mjs` 和已有 Registry 测试、GitHub Actions 工作流：检查授权/公开发布/SEO 独立许可、URL 安全、环境门禁与文档链接。

## 独立许可和审批边界
- 模板中源素材复制授权、公众发布许可、搜索索引许可分别核对；授权证明只记录私有项目位置，不放入本 Public 仓库。
- 源素材即便已有操作许可，也不代表获准发布到目标 WWW 或开放搜索。
- 目标站生产写入、SEO 收录各自需要 Owner 独立明确批准；Dev/WWW 同域还需明确例外。
- Schema 校验 PASS 并不代表真实版权许可已确认，最多形成 `READY_FOR_MANUAL_REVIEW` 等待实际证据核验。
- 此仓库中的 Skill 不是已经安装到 ChatGPT 的原生工具；GitHub/DC/WordPress/GSC/GA4/邮件能力都需分别合法授权。
- **本 PR 和归档不部署任何中央网站、CentralXI 或第三方网站**，没有更改真实询盘、付费广告、密钥或生产配置。

## 调用方法
在 ChatGPT 中要求：
```text
通过已连接 GitHub 读取 beyourlovercom/skills-webdev/main 的
registry/skills.json，定位 duplicate-site-skills，
读取 skills/duplicate-site-skills/SKILL.md 与 references，
再检查目标站 AGENTS.md、授权资料和现有验收记录。
经授权使用 BYL DC 在 Windows Local 研发，严格遵守
D0–D8；需要 Owner 独立 pass 才能修改目标 WWW 或开放收录。
```

## 后续维护
对新网站创建站点专属 Manifest/AGENTS.md，按真实证据生成单独 PR；不为了重复网站数量牺牲品牌真实性或原创搜索价值。
