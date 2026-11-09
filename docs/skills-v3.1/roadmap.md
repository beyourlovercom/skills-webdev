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
