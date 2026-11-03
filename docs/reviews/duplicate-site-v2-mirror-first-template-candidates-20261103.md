# RapidDirect V2 — 镜像优先与模板冻结执行记录

日期：2026-11-03；执行：授权 Windows Local / 正式自建 BYL DC。

## 冻结原则如何应用

Owner 决定：**每个模板只开发一次，得到单独视觉 PASS 后同类页面全部自动复用；只有新视觉或交互问题才重新开发模板。**

本轮把 V2 的主路径明确改为：SiteOne 原站镜像 → 源站对比 → 局部问题归因 → Owner 模板 PASS → 冻结模板 → 复用 PR #15 的同类批量队列。PWC 仅在确认需要时修复，不再强制每页 React 重建。

## Windows 真实执行与差异

| 代表模板 | 实际页面 | 当前证据 | 分类 | 决策 |
|---|---|---|---|---|
| shared-shell（首页） | `/` | 源站 vs 直开 SiteOne 镜像，375px 手机 SSIM **0.8997**，尺寸 385×16383 vs 385×16347；84 张 img，源站坏图 13、本地 14 | 首页新闻/文章卡片已变化，带来下游位置变化；两侧都存在 10px 水平溢出 | **DATA/DYNAMIC_REVIEW**；不因此重新开发首页模板 |
| catalog-listings（服务列表） | `/services/` | 上一轮源站重新滚动 vs 本地镜像手机 SSIM **0.9991**；镜像 vs PWC 构建 PC/手机 1.0000 | 无已确认的新视觉 Bug | **REPRESENTATIVE_OWNER_VISUAL_PENDING** |
| content-services（CNC 详情） | `/services/cnc-machining/` | 源站 vs 直开 SiteOne 镜像，1440px 桌面 SSIM **0.6824**，高度 14640 vs 14761；源站动态轮播/视频内容不同 | 动态轮播状态和视频画面，真实 1440×900 视口的关键标题坐标对齐 | **DYNAMIC_INTERACTION_REVIEW**；未证实需要重新开发 CNC 模板 |

以上 SSIM 为完整截图的自动值，均使用本次有权限的公开源站 GET/HEAD 和本地 GET/HEAD。源站外部第三方请求被拦截；该限制可能影响视频和小部件。没有以局部对齐分数假称完整页面已通过，也没有重开不必要的模板研发。

## 可复用的现有批量工厂（不要重复造轮子）

- PR #15：`skills/duplicate-site-skills/scripts/backup-48h-gate.mjs` 和 `prepare-module-batch.mjs`。在 Windows Local 独立拉取 PR #15 分支、运行 **27/27** 模块工厂单测 PASS，Registry 16/16 PASS。
- PR #15 已具备代码级的 Owner PASS 门禁、模板 SHA、同类 URL 生成确定性队列、失败项重试、已验证项跳过、Blog 排除、列表第 1 页范围保护。该代码仅生成队列，不执行页面下载/渲染/正式发布；下一阶段应开发并验证**队列执行适配器**，不能将队列规划 PASS 冒充批量复制成功。
- PR #16 只持有 SiteOne/PWC 资源捕获和修复适配层；不创建第二套批量引擎。不合并 main，不启动新的页面抓取。

## 私有候选模板账本

本地 `C:\ai\site-mirror\rapiddirect-v2\uat\template-candidates.json` 包含三个代表样本的源码 HTML SHA256、路由与模块映射，状态全部 `PENDING_OWNER_VISUAL_PASS`，模板 SHA 仍 `null`、批量 `BLOCKED`。该文件仅为候选清单，代表页 HTML 的 SHA **不是**已经提取冻结的模板代码哈希。

## Owner 查看（Windows 本机）

- **首选：** `http://127.0.0.1:8766/uat/owner-template-freeze-review.html`（3 类模板源站/直开镜像 6 张截图、差异分类，构建并 HTTP 200）
- **SiteOne 直接预览：** `http://127.0.0.1:8765/`、`/services/`、`/services/cnc-machining/`
- PWC 辅助预览：`http://127.0.0.1:8766/`，只有新的视觉或交互修复确有必要时使用。

## 下一步 Roadmap（按模板研发，不按 URL 计工时）

| 顺序 | 工作 | 估算工程工时 | 门禁 |
|---|---|---:|---|
| T1 | 确认首页动态文章区块是数据更新/快照时点差异，必要时只同步首页数据 | 0.5–1.5h | 不重做模板 |
| T2 | 复测 CNC 轮播和视频的稳定视觉状态；只修可重复的新交互 Bug | 0.5–1.5h | 不降低真实 SSIM 阈值 |
| T3 | Owner 分别审核三个代表模板 PC/手机及关键交互；按需要处理局部反馈 | 0.5–1h | 单独 PASS 冻结 |
| T4 | 将 PR #15 已有模板冻结/同类路由队列与 PR #16 镜像适配连接，只允许**已授权、已 PASS、在范围内**的同类型页面；先 dry-run | 1–2h | 不启动新页面、不合并 |
| T5 | 现有三页回归及最终备份/缺图报告，形成准确工时和复用率基线 | 0.5–1h | Owner 最终确认 |
| **合计** | **当前三页收尾 + 只读模板工厂接线准备** | **3–7h** | 不包含扩展到整站执行及独立 React 重写 |

这只是工程投入估算，而不是实时完成承诺。将来每个新 URL 不得再次收取模板研发工时；只有新结构/交互异常才重开对应模板。批量执行吞吐必须在实际授权后实测，不凭空宣称数分钟/页或 48 小时完成。

## Hard Holds

PR #15 和 PR #16 保持 Draft，main 不变；未获模板逐类视觉 PASS 前批量全部 BLOCKED。未访问博客详情、未修改生产站、无登录/报价/客户数据写入，私有截图和 HTML 不上传 GitHub。
