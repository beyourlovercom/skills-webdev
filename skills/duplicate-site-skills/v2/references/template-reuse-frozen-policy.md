# Duplicate Site Skills V2 — 模板一次开发、同类自动复用（冻结规则）

**决策日期：2026-11-03**
**状态：Owner 已批准冻结此设计与执行原则。此批准不等同于任何页面的视觉 PASS、批量执行授权、PR 合并或 Production 发布。**

## 唯一核心原则

> 一个模板研发一次，同类页面全部自动复用。只有发现新的视觉或交互问题，才重新进入模板研发。

默认优先保留 SiteOne 的原 HTML、CSS、JS 与已授权资源；PWC 只用于必要的视觉、结构或交互修复。**不得把每个页面强制重写成 React**。React 只在原技术栈无法可靠离线运行且有明确必要性时，作为经批准的局部替代。

## 模板级流程（不按 URL 重复研发）

1. **分类**：完整页面清单以可复用的布局/交互契约归类，而非每个 URL 分配一个开发任务。记录 `template_id`、源路由、页面类型、数据字段和模板哈希。不同数据不意味着不同模板。
2. **代表页**：每类仅选 1 个有代表性的页面，完成读取 → 镜像 → 必要修复 → PC/移动/交互 UAT。不得在代表页尚有未确认的关键缺陷时假称已冻结。
3. **Owner PASS 冻结模板**：保存 `template_sha256`、两种视口的截图/误差、交互验收证据、可复用字段映射、Owner 明确 PASS 和时间。状态标记为 `TEMPLATE_FROZEN`。没有真实 Owner PASS 就是 `PENDING`。
4. **同类自动复用**：只有满足源数据/资源授权和范围门禁，才以已冻结模板批量注入文案、图片、链接、参数等**数据**；不重新规划、重新编码、重新设计同类页面。
5. **批量 QA**：检查总路由数、资源数、坏链/404、字段漏填、模板漂移、桌面/手机抽样、关键交互与离线网络依赖。按真实分子/分母报告覆盖率。把异常排队、允许断点续跑，不重复处理已 PASS URL。
6. **异常处理**：数据缺失、404、图片路径问题先走自动重试/局部数据修复，不重开模板研发；只有发现**新视觉问题或新交互问题**才将对应模板移入 `TEMPLATE_REOPEN_FOR_VISUAL_OR_INTERACTION`，定位最小修复、回归代表页、取得新的 Owner PASS、重新冻结 SHA，再传播到受影响的同类页面。

## 不可绕过的门禁

| 条件 | 动作 |
|---|---|
| 没有代表页 Owner 视觉 PASS | `BLOCKED_BATCH`，不得批量生成该模板的页面 |
| 页面类型 / 模板 ID 无法匹配 | 标记 `NEW_TEMPLATE_REVIEW`，选代表页；不得把它强塞进旧模板 |
| 只有文案、参数、图片不同 | `DATA_ONLY_BATCH`，不重新编码 |
| 图片缺失、404 或源数据异常 | `DATA_OR_ASSET_FIX`，记录失败路由；一般不重新研发模板 |
| 发现新视觉或交互差异 | `TEMPLATE_REOPEN_FOR_VISUAL_OR_INTERACTION`，按最小差异修复，重新经 Owner PASS |
| 模板 SHA 与冻结版本不符 | `BLOCKED_TEMPLATE_DRIFT`，不得在未核实的模板上批量继续 |
| 安全、授权、隐私或真实交易风险 | 立即 `BLOCKED_SAFETY`；优先隔离和修复安全问题，不得因“无需研发”绕过门禁 |
| GitHub main/Dev/WWW 发布 | 继续遵守已有独立 Owner 明确授权；此次原则冻结不授权任何发布 |

## 性能与效率验收

- 核心指标改为 **每个模板的首次开发工时**、**每个同类 URL 的批量处理时长**、**异常率**、**抽检覆盖率**，不再按每个 URL 计算研发工时。
- 用户希望 48 小时内完成标准网站非 Blog 范围的本地高保真复制；这是 V2 目标，不是已验证的保证。后续用真实第二站统计和失败报告判断是否达标。
- 不同模板的复杂性、需要独立后端的交易功能、源站限速/反爬、安全约束不受 48 小时目标豁免。

## 本次 RapidDirect 三页 Canary 的边界

- 当前三个代表页：首页（shell）、服务列表（category）、CNC 详情（service），不因此将首页/CNC 视觉自动判为 PASS。
- 在得到对应模板的**明确视觉验收**前不处理其余同类 URL。
- PR #15 的模板工厂和 PR #16 的 SiteOne/PWC 适配仍然分开 Draft；本文只冻结 V2 原则及后续实现合同，**不是批量引擎已完成**。

## 作为后续实现的最小审核记录

```json
{
  "template_id": "service-detail",
  "representative_route": "/services/cnc-machining/",
  "template_sha256": "<measured-after-freeze>",
  "owner_visual_pass": false,
  "desktop_and_mobile_evidence": [],
  "interaction_evidence": [],
  "state": "PENDING_OWNER_VISUAL_PASS",
  "batch_routes_total": null,
  "batch_routes_completed": 0,
  "exceptions": []
}
```

此 JSON 是契约示例，不是生产数据或已经完成的运行状态。
