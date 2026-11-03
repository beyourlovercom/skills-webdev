# Duplicate Site Skills V2 — RapidDirect 三页 Canary 最新验收与 Roadmap

日期：2026-11-03（Windows Local 实测）  
仓库：`beyourlovercom/skills-webdev`  
分支：`feat/duplicate-site-v2-siteone-pwc-20261103`  
PR：[ #16 ](https://github.com/beyourlovercom/skills-webdev/pull/16)（Draft），关联 [ #15 ](https://github.com/beyourlovercom/skills-webdev/pull/15)（Draft）  
**约束：仅现有三页；不合并 main、不部署 Dev/WWW、不重新抓整站，不上传原站素材至 GitHub。**

## 1. 本轮完成的真实操作

| 核对项 | 实际证据 | 判定 |
|---|---|---|
| 正式自建 BYL DC | Windows READY，已恢复直接访问 | PASS |
| R1 原有 V2 Node 测试 | Windows `node --test tests/duplicate-site-v2*.test.mjs` 21/21 | PASS |
| R1 Python 安全测试 | Windows 4/4；随后在 GitHub 添加新的交互安全单测 | PASS |
| Skill Registry | Windows 16 项校验 | PASS |
| R3 本地安全预览安装 | 三页已应用带回滚副本的 CSP 与页面基准路径；不修改源站 | PASS |
| Vite 正式构建 | `npm.cmd run build`，32 modules，退出码 0；新增视口模式后再次通过 | PASS |
| 安全交互 | 初次新版执行出现 4 项时序性失败；修正等待 iframe 完整加载/元素可见性后重新跑：12/12、0 失败、0 实际写入请求 | PASS（最终执行） |
| 新增真实视口模式 | 三页 × 桌面 900px / 手机 812px = 6/6，保持隔离 iframe sandbox | PASS |
| R4 构建截图 | 三页 × 两种视口，6/6 截图 CAPTURED、0 失败 | PASS（采集） |
| R4 镜像截图 | 同样六组、同样滚动和动画规则，6/6 CAPTURED | PASS（采集） |
| 三页路由 | 镜像、构建版 /、/services/、/services/cnc-machining/ 均 HTTP 200 | PASS |
| 素材完整性 | 563 个文件、38.03 MiB；469 个资源引用候选中剩一个源站 HTTP 404 `particles.min.js` | 1 个已知残留 |
| GitHub CI | 现役 PR #16 的 Public Registry 和 S2 Skills CI 均成功（Node/Python/Registry） | PASS |
| PWC 独立全量 React 重写 | 当前仍使用 PWC React/Vite 骨架与 SiteOne 静态快照桥接 | OPEN |

## 2. 对齐采集后的真实 SSIM

这份分数对比的是 *相同本地滚动/动画规则下的镜像与 PWC 构建快照*，不是与线上源站的完整相似度。PWC 自动阈值为 0.97。

| 页面 | 1440px 桌面 | 375px 手机 | 结论 |
|---|---:|---:|---|
| 首页 | 0.7561 | 0.2211 | FAIL / 动态区块和截屏几何差异待收尾 |
| 服务列表 | 1.0000 | 1.0000 | 自动 PASS |
| CNC 加工详情 | 0.7451 | 0.999999 | 桌面 FAIL，手机自动 PASS |

自动 PASS **3/6**。对于首页，原始镜像在 375px 手机视口下 `document.scrollWidth=385`，存在约 10px 的原站水平溢出；PWC iframe 的截图是 375px。不能通过隐藏真实内容或裁切图片伪造 0.97。

### 新修复：真实视口模式

旧的全页预览把内嵌 iframe 高度伸展到 1.5–1.7 万像素，导致内嵌页面的 `window.innerHeight` 同样异常巨大，破坏了严格视觉等价的前提。

PR #16 增加可切换的**真实视口模式**，iframe 高度设置为 `100dvh`、独立内部滚动，不增加 `allow-top-navigation` 或 `allow-forms`。Windows 6/6 真实浏览器检查已验证内部视口重新回到 900px/812px；原有整页审核模式保留。其意义是提升人工视觉比较和隔离安全性，**不是宣布全页图像误差被修复**。

## 3. Owner 审核入口

- 最新中文审核：`http://127.0.0.1:8766/uat/owner-visual-review-latest.html`（Windows 本机，HTTP 200）
- PWC 三页交互：`http://127.0.0.1:8766/`
- 本地证据：`C:\ai\site-mirror\rapiddirect-v2\uat\v2-visual-replay\matched-scores.json`
- 最新交互报告：`C:\ai\site-mirror\rapiddirect-v2\uat\v2-interaction-final.json`
- 原版镜像/源站截图仍独立保留：`uat\owner-visual-review-v2.html`

用户先前回复 `pass` 作为继续此三页支线开发的授权，不自动代表所有三页六组视觉评分达标，也不是合并 main 或启用批量流程的审批。

## 4. 最新 Roadmap — 从本次真实结果重新估算

| 阶段 | 下一步 | 预计剩余工程工时 | 关闭标准 |
|---|---|---:|---|
| R1 | V2 代码归档 / 安全预览 / CI | **0h — 关闭** | Windows + GitHub PASS |
| R2-A | 首页手机动态组件与相同捕获状态对齐，审查 10px 横向溢出 | **2–4h** | 修复真实差异，不删除内容 |
| R2-B | CNC 桌面轮播 / JS 状态及页面截图差异对齐 | **1–3h** | 静态/动态差异分类且有截图 |
| R3 | Vite 构建 / 真实视口 / 菜单 FAQ 及表单拦截 | **0h — 当前门禁关闭** | 12/12 PASS + 6/6 真实视口 |
| R4 | 修复后再跑六组 SSIM / 路由 / 资源 | **1–2h** | 真正对齐的回归表与残留说明 |
| R5 | Owner 审核修复后截图、冻结模板 | **1–2h** | Owner 明确视觉 PASS/需修项目 |
| **合计** | **当前三页 Canary 剩余** | **5–11h** | 仍需视觉修复和人工验收 |

以上是**工程投入估算**，不是计时任务承诺；R2 动态内容如果受源站变化影响，工时需要再估。

### 三页 Canary 后的独立授权阶段（尚未启动）

- PR #15 模块工厂门禁整合、模板冻结和同类页面恢复/续跑：4–7h。
- 第二个获得授权的网站实测与实际 URL/素材覆盖率验收：5–9h。
- 多平台兼容、文档冻结与精确 main 合并审批包：1–2h。
- **后续合计 10–18h**；从现在到可复用候选版本总剩余估算 **15–29h**，不包含将每个页面独立转换为完整 React 源码的额外开发。

**Hard Hold：** PR #15、#16 都保持 Draft；不能因代码 CI 成功、单页 0.97 或 Owner 的阶段性 pass 而自动合并、部署或批量复制。
