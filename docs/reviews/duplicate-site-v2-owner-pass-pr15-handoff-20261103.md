# RapidDirect V2 — Owner 三类代表模板视觉 PASS 后的冻结与 PR #15 接线

日期：2026-11-03。用户在看到三类代表模板（首页、服务列表、CNC 详情）的视觉审核入口，并收到“下一道门禁是三类代表模板分别获得你的视觉 PASS”之后，直接回复 **`pass`**。本记录将该明确回复归属为**三个已展示的代表页视觉审核通过**，不扩展为所有桌面/手机自动 SSIM 指标达标，也不扩展为任何新 URL 的抓取/批量执行批准。

## 已完成且核实

| 样本 | PR15 模块 | Owner 视觉 | 本地只读 HTML 参考冻结 | 当前可通用的数据模板 |
|---|---|---|---|---|
| `/` | `shared-shell` | PASS | SHA-256 校验成功 | OPEN：尚未提取稳定参数映射 |
| `/services/` | `catalog-listings` | PASS | SHA-256 校验成功 | OPEN：尚未验证第二条同类型路由 |
| `/services/cnc-machining/` | `content-services` | PASS | SHA-256 校验成功 | OPEN：尚未验证第二条同类型路由 |

本地私有证据位于 `C:\ai\site-mirror\rapiddirect-v2\uat\template-candidates.json`，三个参考文件位于 `uat\frozen-reference-artifacts\<module>.reference.html`。在记录前逐一核对当前 mirror 文件的 SHA 与候选账本一致，复制参考 HTML 后再次计算校验值；保留预先添加的只读 CSP/表单拦截和原始未修改 HTML 备份。

**重要定义：** `frozen_reference_sha256` 指**实际已验收的代表 HTML 参考文件**，可以防止重复研发和意外改动；不能把它冒充已经支持字段注入的通用模板。账本仍保存 `template_sha256=null` 与 `generalized_template_implementation=NOT_YET_PROVEN`，两者必须由后续真实数据映射/复用验证产生。

## 跨 PR 的真实只读接线

- 在 PR #16 新增 `skills/duplicate-site-skills/v2/scripts/audit-pr15-handoff.mjs`，通过独立的 `--factory-root` 载入 PR #15 **现有** `backup-48h-gate.mjs`，不重新写一份批量门禁，也不请求源站。
- Windows Local 实际调用验证：`reference_visual_pass=3`，`reference_sha_verified=3`，`factory_integrated=true`，`source_requests=0`，`site_writes=0`。
- PR #15 返回三个模块 **`BLOCKED`**。对于 shared-shell，缺少可证明的通用模板 SHA、明确的统一自动 UAT 和可执行阶段；catalog-listings / content-services 还受到此前模块未完整离线 QA 关闭及严格执行顺序约束。
- PR #15 原有模块工厂之前在 Windows 27/27 测试 PASS；本轮在 PR #16 又新增 `tests/duplicate-site-v2-pr15-handoff.test.mjs`，检验 SHA 漂移、未知模板、批准状态和门禁阻断。

### 可重复运行的 Dry-run

```powershell
node <PR16-root>/skills/duplicate-site-skills/v2/scripts/audit-pr15-handoff.mjs `
  --candidate=C:/ai/site-mirror/rapiddirect-v2/uat/template-candidates.json `
  --factory-root=C:/ai/site-mirror/rapiddirect-v2/tools/pr15-integration-test/skills-webdev-policy-visual-first-page-before-pagination-20261102
```

该命令读取现有三类样本，核验冻结参考文件与 SHA，加载 PR #15 真实门禁，输出明确 blocker；不会产生新页面、批量任务、生产写操作或合并。

## 下一阶段只允许的工作

1. **依据已有三个样本**准备通用数据字段映射的最小规范，先不接触新页面、不自动扩展样本数量。
2. **分清唯一模板和页面数据**：页面内容/图片变动只更新字段；视频/轮播属于需要确定状态的共享交互组件，若发现新可重复的视觉或交互 Bug 才重新打开模板开发。
3. 审核 PR #15 现有执行模块与 PR #16 的适配接口，补齐必要的状态转换与失败项恢复接口；不能使用虚假 SHA、空素材分母或占位页面掩盖缺失。
4. **新路由实际批量执行**需要另外的真实 URL/素材清单、明确的范围授权、运行时防护和逐模块门禁；当前用户的 `pass` 仅对三个展示的代表样本成立。

## 路线与工时（模板级投入目标）

| 任务 | 估算工程工时 |
|---|---:|
| 三类样本 Owner PASS 登记、参考快照哈希、PR #15 Dry-run 接线 | 本轮完成 |
| 从现有样本抽取数据字段映射/通用模板最小合同 | 1–2h |
| PR #15 和 PR #16 adapter 接口、失败只重试机制和清晰的门禁回读 | 1–2h |
| 在已批准范围内做最终安全、导航和视觉验收及 Owner 报告 | 0.5–1h |
| **剩余** | **2.5–5h** |

批量队列可能包含大量 URL，但同类型页面不再按 URL 重算研发工时。由于目前没有授权的新同类型页面清单与渲染吞吐实测，本记录**不提供每页实际时长保证**，也不宣称 48h 整站目标已通过。

## 硬门禁

当前三个代表的 `owner_visual_pass=true`；批量 `bulk_enabled=false`。PR #15 和 PR #16 都仍是 Draft，`main`、Dev、WWW 不变。屏幕截图、镜像 HTML、图片与字体仅保留授权 Windows Local，不推送 GitHub。
