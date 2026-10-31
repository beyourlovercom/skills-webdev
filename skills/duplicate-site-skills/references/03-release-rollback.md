# D6–D7 — Dev → WWW 的独立审批、精确发布和回滚

## 发布前冻结
- 获取目标站 Owner 对确切环境、变更内容、SHA、权限和 SEO 开关的**独立明确 pass**。源站许可不等于目标生产发布同意。
- 固定 \`GitHub branch + commit SHA\`、部署包 SHA256、数据库/文件影响面、业务链路、备份位置、负责人、预期 Canary 页面与回滚条件。
- 对含源站镜像、主题/插件与渲染适配的改动，必须列出**每个受影响文件/Hook**；不能用“部署所有”替代精准发布范围。
- 在 Owner 自身管理的目标环境操作；不通过旧云端会话推断设备在线，不反复打开浏览器或重启 READY 设备。
- 若存在合法风险、主体冒充、丢失可验证备份、目标与预期站不匹配、重要依赖不匹配 → STOP。

## 最小发布顺序
1. 只读 Preflight：PHP/Node/WP 版本、启用插件（尤其 MU vs 普通）、SQL/DNS/SSL、缓存和当前网页基线。
2. 准备可恢复备份；若 Owner 明确说某 Dev 可以省略备份，应在文档标注范围与不可逆后果；不能迁移该例外到其他 Production。
3. 在隔离环境 lint、单元、PC/M14 和业务组件复核；批准后**仅**提交最小补丁，不扩大到无关站点。
4. 生产发布以文件/hash核对，逐项写入，先受控 Canary 再扩量；清理**这个站点**的缓存。
5. 独立读回 HTTPS 状态、Header/菜单、静态素材、Footer、实际插件版本、JS 错误、询盘入口、SEO index 门禁、Sitemap/robots、真实数据库计数；报告局限。
6. 任何 FAIL 当场止损，回滚相同范围（适配器、插件、开关），验证旧版恢复。不要声称“已自动回滚”而实际未执行。

## 两种交付模式
**运行时适配（推荐维护源快照）**：保持源 HTML 原封不动，在独立目标站插件/模板上按许可范围注入本地主体内容、业务链接、robots 元信息。停用后效果消失，所以要长期启用并纳入版本清单。

**一次性永久迁移**：明确 Owner 批准后修改目标站内容/数据库，再做实际备份/回滚演练；迁移完成后是否可删除工具/插件必须以真实读回和源站权利范围证明。**不能**默认“一次启用就永久有效”。

## 版本合并与正式发布是两回事
- \`main\` 合并状态与 WWW 已安装状态独立；Draft PR 可以在特定授权下先部署，但这不代表 PR 自动通过，反之亦然。
- 代码位于特性分支仍需在交付里标注 \`DRAFT\`; 不可因为用户同意上线就强行合并跨项目历史大 PR。
- 生产发布前如果发现回退资料仅在同账号/同盘，标注**同故障域备份**，不要称为异地备份。
- 跨网站共享 Core 改动必须先隔离测试，否则只做项目专用小补丁。

## 生产最终报告
\`\`\`text
Site: <target>
Source rights: VERIFIED | BLOCKED
Environment: Windows Local / Dev / WWW (exact hostname)
GitHub: <repo/branch/full SHA> PR: <id + state>
Change set: <files, versions, filters, DB migrations>
Preflight: <PASS/FAIL>
Backup: <exact location, restore tested?>
Canary: <route/fixture, actual HTTP/browser evidence>
SEO: <index gate/robots/sitemap, separate approval?>
Leads: <public address, actual internal recipient, tested notifications?>
Rollback: <method, commands, observed outcome>
Status: CODE_READY / DEV_PASS / WWW_PASS / FAIL / BLOCKED
Open: <explicit gaps, including authorization and email deliverability>
\`\`\`
