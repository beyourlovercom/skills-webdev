# Andy Skills V3.1 — R1–R4 验收 Roadmap

版本：3.1.0-rc.1（Draft，未合并 main）

| Gate | 已集成的真实代码 | 本轮新增 | 发布前仍需验证 |
|---|---|---|---|
| R1 模板工厂 | PR #15：Owner 代表页、模板 SHA、48h 台账、prepare-module-batch | V3.1 对模板状态、失败页按类分组 | 真实 PR15 批量授权；不得把模板 AUTO 评分当 Owner 审批 |
| R2 离线整站 | PR #16：SiteOne/PWC、media、direct-mirror、导航/sitemap Canary | V3.1 源 URL 总量/哈希、资源及本地真实双入链门禁 | 真实整站 URL/素材/浏览器批量 Canary |
| R3 WordPress & CSS/JS | PR #17：WP 模板数据映射、最终构建/打包门禁、Browser Canary | 统一全站 READY_FOR_PR17_FINAL_BUILD_CANARY 前置条件 | 正式站点级资源依赖、最终 CSS/JS build、可回滚 Readback |
| R4 中控证据 | PR #18：Execution Contract、Evidence Schema、Registry 版本策略 | V3.1 CLI、fail-only 清单、候选版本 3.1.0-rc.1、统一文档 | CI 全绿、真实 Windows Local、Owner 批准后才 main 发布 |

## 版本与门禁

- **CODE_INTEGRATED**：候选分支已保存四条支线代码，仅证明路径/依赖已集成，不代表运行 PASS。
- **CI_PASS**：针对精确 HEAD 的 Node/Python/Registry 工作流成功。
- **LOCAL_CANARY_PASS**：新站真实 URL/媒体/双端浏览器/导航/交互/安全与最终构建已读回。
- **OWNER_RELEASE_PASS**：Owner 对确切分支 SHA 和版本明确批准。
- **V3.1_RELEASED**：通过全部门禁后才准 main merge/tag，且正式站发布仍另行批准。

## 未完成任务

1. 针对候选 PR 检查 CI 输出与原始 PR #15–#18 回归；修复真实 FAIL。
2. Windows Local 用一个已获授权小站完成真实多模板、多 URL、失败恢复、双入链与构建 Canary。
3. 确认 48h 标尺将活跃工程时间、来源站点网络异常、Owner 审批等待分开计算。
4. 测量下一站首次复制的实际模板数、总页数、唯一资源量，形成可追踪的吞吐量，而不是保证任意网站 48h。

**这不是已关闭的整站项目。** 没有跑真实现场和 Owner 版本发布审批时，R1–R4 都只能是代码集成候选，不得宣告最终关闭。

## 2026-11-09 Windows Local Canary 真实验收补记

- R1：PR #15 既有代码及门禁复用；R15 三份已批准页面源 HTML SHA 3/3 原件匹配。模板泛化复用的 Owner SHA 审批**没有**被自动转化，继续 BLOCKED；不得再次要求已批准页面的重复视觉验收。
- R2：本地可复用服务器真实读取 R15 镜像；浏览器 3 页 × PC/手机 6/6 HTTP 200、无横向溢出；Local Hub 与 Sitemap 各通往三页，真实点击 6/6 PASS；副作用请求 0。WordPress 文件资源 HTTP 404 在受控本地映射与 TTF MIME 修复后归零。9 个 GTranslate 懒图片/视口及非零 JS runtime errors 保持 OPEN，不伪造 PASS。
- R3：已复用 PR #17 的最终 CSS/JS 门禁；因全站交互/来源双端比对及最后 Owner 审批尚未完成，BLOCKED_FINAL_BATCH；不运行最终包、不上线。
- R4：V3.1 CLI Windows 25/25 Node 单测 PASS；候选 GitHub CI 已四组全绿；Powershell BOM 问题有真实回归。单站原始 HTML、截图、访问数据均保存在 Windows 私有目录，GitHub 仅存聚合审计。
- Evidence：见 [Windows Local Canary 2026-11-09](windows-local-canary-20261109.md)。

**阶段判定**：V3.1 代码集成与工具级回归 PASS，真实 Local Canary 为 SMOKE_PASS_WITH_OPEN_EXCEPTIONS；不是整站 FULL_PASS 或可正式封装。PR #19 继续 Draft，main 不变。
