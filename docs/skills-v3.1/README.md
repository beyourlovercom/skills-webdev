# Andy Skills V3.1 — 整站复制工程集成候选

**版本：3.1.0-rc.1 | 状态：Draft / 尚未发布 main | 更新时间：2026-11-09**

## R1–R4 复用职责

- **R1 / PR #15**：代表页真实 Owner PASS → 冻结 SHA → 原有批量队列。不得重新实现队列、不得自行推断审批。
- **R2 / PR #16**：SiteOne 镜像原始 HTML/CSS/JS/素材优先；PWC 仅修复真实差异；URL/资源哈希、断点续跑、导航、只读 Canary。
- **R3 / PR #17**：WordPress Local 适配，全部目标页面验收后仅执行一次最终 CSS/JS 封装；现有 wp-final-package-gate 和浏览器 Canary 不能跳过。
- **R4 / PR #18**：统一任务证据、GitHub SHA、BYL DC 的 READY/Chrome 安全约束、Local→Dev→WWW 独立授权；V3.1 增加整站 Local Gate。

此分支以 PR #17 为基线，集成了 PR #15 和 PR #18 的 17 个现有文件；PR #16 已包含在 PR #17 祖先。原四个 PR 仍是 Draft，不代表 main 已升级。

## V3.1 统一 Local Audit Gate

可运行文件：scripts/skills-v31-gate.mjs，仅用 Node.js 内置模块。示例：

    node scripts/skills-v31-gate.mjs --manifest=C:/ai/site-mirror/site-x/uat/v31-site-manifest.json --root=C:/ai/site-mirror/site-x

默认只读，输出结构化摘要与失败页队列。不自动抓取、不补写网页、不提交表单、不调用外部源、不部署。保存完整报告需显式：

    node scripts/skills-v31-gate.mjs --manifest=C:/ai/site-mirror/site-x/uat/v31-site-manifest.json --root=C:/ai/site-mirror/site-x --out=C:/ai/site-mirror/site-x/uat/v31-report.json --execute

只允许写入 Local 私有项目根目录下的 uat/；禁止路径穿越与指向外部的 symlink。

## Manifest 3.1 最低契约

- schema_version 为字符串 3.1，project_id、environment 为 local，site_mode 为 MIRROR 或 WORDPRESS。
- authorized_scope：source_approved=true、routes_frozen=true、source_snapshot_sha256、expected_route_count、route_list_sha256。最后一项是规范化后的路径排序 JSON 数组的 SHA256；数量和 SHA 同时匹配才允许判定整站。
- templates：每个模板 SHA256、对应 Owner 代表页真实 PASS 状态、template_sha256、evidence_ref。自动视觉过关不能伪造原 PR #15 Owner Gate。
- routes：每页 path、template、local_file、artifact_sha256、resources（真实本地文件和 SHA256）、links（已确认的站内目标）与 evidence。
- evidence.method 必须是 real-browser，desktop/mobile 两端 score 至少 0.97，masks=0、viewport_verified=true；interaction/assets/content/security.status 都为 PASS。更高项目阈值优先。
- navigation_sources：本地 Sitemap、分类目录等必须存在真实本地 HTML，匹配 SHA，并有 real-browser PASS + artifact_ref。只有两个不同、已验证的来源才算入链。
- dependencies：REQUIRED/OPTIONAL/DEFERRED/NOT_APPLICABLE；OPTIONAL 失败必须提供 exception_ref；REQUIRED 失败始终拦截。

## 输出状态

- PASS：完整原文件+模板+双端+交互安全+资源+导航都通过。
- FAIL：哈希错误、资源缺失、链接断裂或少于两个真实入链。
- OPEN：页面不存在、浏览器证据不足、源站不可访问等。
- BLOCKED：代表模板 Owner 审批等强制前置条件缺失。

输出 queue 只列出非 PASS 页；template_batches 按模板给出待处理页。PR #15 的真实队列创建与批准规则仍是唯一权威。

只有全部页面通过，才能输出 READY_FOR_PR17_FINAL_BUILD_CANARY。它不是正式构建完成，更不等于 WWW 发布。真正的最终封装需另外运行 PR #17 工具和全站构建 Canary，且正式发布须 Owner 独立批准。

## 下一站流程

1. 验证权利和许可，冻结 URL 分母、范围与站型。
2. SiteOne 镜像、资产恢复；只为确认的视觉/交互差异调用 PWC。
3. 各模板单代表页 Owner 双端视觉 PASS，冻结模板 SHA，复用 PR #15 现有队列批量处理。
4. 汇总所有已生成页到一个 Windows Local；人类 Sitemap、分类导航、XML Sitemap 同步；未生成页只记 PENDING。
5. V3.1 Local Gate 按失败页独立复测。整个目标范围无 FAIL/OPEN/BLOCKED 后再进入 PR #17 最终封装。
6. 如需 Dev/WWW，继续走原有独立审批、验证和回滚，保护客户、支付和订单。

## 完成边界

没有声称下一网站已完成真实 SiteOne/PWC 复制，也没有替代真正的 Windows Local Canary。RapidDirect 冻结 99 页视觉 PASS 不代表其 834 个已知 URL 全部完成。V3.1 必须经过 PR #15–#18 回归、真实 Local Canary、Owner 版本审批，才能从 3.1.0-rc.1 Draft 升级为正式 V3.1。严禁将纯单测、HTTP 200 或脚本退出 0 解释为真实整站上线。
