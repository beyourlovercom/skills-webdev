# Skill Registry（机器读取目录）

这里的 `skills.json` 是公开的**发现索引**，不是权限清单，不会自动登录网站、安装插件、调用 API 或批准生产发布。

## 数据字段
- `schema_version`：格式版本。
- `repository`：GitHub 仓库全名。
- `snapshot_date`：状态核对时间；执行前再次核对 GitHub PR。
- `skills[]`：已有真实 `SKILL.md` 的技能；`id` 为独立 ID；`source_ref` 为对应分支；`skill_path` 为路径；`pr` 指对应 Draft PR（`main` 内为 null）。
- `planned_skills[]`：尚无实现文件的规划，不得加载为已实现 Skill。
- `pilots[]`：测试案例，**不是**自动安装的 Skill。

## 何时更新
- 新建 Skill：仅在 GitHub 分支真实存在对应 `SKILL.md` 时加入 `skills[]`，先标记 `DRAFT_PR`。
- PR 经过 Owner 审批并实际合并 main 后，才更新 `source_ref=main`、`status=IN_MAIN` 和 `pr=null`。切勿提前标记完成。
- 独立的项目生产 UAT 状态不随 Skill 代码合并自动变为 PASS。
- 复制现有 Skill 给其他网站时，先读取各项目 `AGENTS.md` 和既有 PASS/OPEN 记录。

## 本地使用

```bash
node scripts/skill-registry.mjs --validate
node scripts/skill-registry.mjs --list
node scripts/skill-registry.mjs --resolve ga4-site-intelligence
node --test tests/skill-registry.test.mjs
```

这是离线定位工具；真实 GitHub 文件存在性与 PR 状态由使用者/运行时连接复核。公开目录必须不包含 Token、真实客户数据或商业报表。
