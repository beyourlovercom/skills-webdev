# Duplicate-Site Skills V2 · R11 两页受控连续镜像 + 自动视觉 PASS 规则

**日期：2026-11-04。目标：在不增加基础研发模块的前提下，连续复用 SiteOne 和现有媒体缓存，对两个真实 CNC 服务 URL 测试单页复制吞吐与质量。** 采用 Windows Local 正式自建 BYL DC，不碰生产站。

## Owner 最新冻结验收规则

用户明确表示 **“pass；以后，通过你的真实页面自动视觉验收的，而且0.97以上的，就可以直接认定pass；然后继续执行”**。

- **页面级自动视觉 PASS：** 同一真实页面的桌面、手机两组完整无遮挡源站 vs 本地截图 SSIM **均 ≥ 0.97**，截图和图片/布局证据存在，关键菜单、表单阻断和离线运行时检查通过，则**无需再等 Owner 逐页人工视觉确认**。
- 对每个页面分别做严格检查；任一条件缺失/不达标均标记 **OPEN/FAILED**，只修失败项、不调低阈值、不伪造分数。
- V2 现有 `scripts/audit-pr15-handoff.mjs` 增加只读的 `evaluateAutomatedVisualPass`；Windows 单元测试 **6/6 PASS**（含低分、遮罩、资源差异、缺失截图、交互失败的拒绝）。
- 已使用真实本地 R10 证据核验 **CNC Turning**：桌面 0.991916、手机 0.999096，交互 2/2，得到 `AUTO_VISUAL_PASS`；用户本次还明确回复了 `pass`。Windows 私有记录 `uat/r10-cnc-turning-candidate/r10-accepted-by-owner-visual-policy.json`，适用范围仅 CNC Turning 本页。
- **自动视觉 PASS 不批准 GitHub PR 合并、Production 部署或无上限批量抓取**；不能将已验收的一页冒充已批准的通用主体模板 SHA。

## 本轮严格范围

仅 2 个由先前真实 CNC Turning 导航提供的服务路径（无博客详情）：

| 页面 | 精确 URL | 与 CNC Turning 页面结构 |
|---|---|---|
| 5-Axis CNC Machining | `https://www.rapiddirect.com/services/5-axis-cnc-machining/` | Header/Footer **100%**，Main **77.23%** |
| Precision Machining | `https://www.rapiddirect.com/services/precision-machining/` | Header/Footer **100%**，Main **11.17%** |

**均不需要强行套用完整 CNC Turning 正文模板。** 保留各自源站 HTML/CSS/JS，复用共享外壳与已下载静态资源；只有真实新视觉或交互 Bug 才改相应模块。

## 实际 Windows 两页执行结果

| 指标 | 5-Axis CNC Machining | Precision Machining |
|---|---:|---:|
| SiteOne 单页抓取 | 首次连接中断，失败后只重试 1 次；**成功** | 首次与重试都因连接中断失败 |
| HTML 来源 | 官方 SiteOne 单页导出 | 真实源站 cURL GET HTML 快照回退，**不冒充 SiteOne 成功** |
| SiteOne 成功导出耗时 | **24.793 秒**，151 初始文件 | 未成功；源站原 HTML GET 约 **3.03 秒** |
| 已有静态素材直接复用 | **130** 项 | **92** 项 |
| 缓存匹配复制耗时 | **2.148 秒** | **0.881 秒** |
| 本次缺失素材成功新增下载 | **25** 项 | **81** 项 |
| 新素材下载阶段耗时 | **54.691 秒** | **109.686 秒** |
| 本域静态资源 URL 本地化 | **179** 处 | **353** 处 |
| 本地化耗时 | **0.648 秒** | **0.201 秒** |
| 静态 HTML/CSS 引用资源 | **285/286** | **193/194** |
| 剩余缺失 | 源站 `particles.min.js` 404 | 同一个源站 `particles.min.js` 404 |
| 当前镜像文件/体积 | **312 文件 / 28.30 MiB** | **194 文件 / 11.83 MiB** |
| HTML/CSS 静态资源审计 | **PASS（记录源站 404）** | **PASS（记录源站 404）** |
| 源站 vs 离线桌面/手机真实 SSIM | **OPEN** | **OPEN** |
| 本地安全浏览器交互 | **OPEN** | **OPEN** |
| 自动视觉 PASS | **不得认定** | **不得认定** |

**总计：2/2 静态镜像已建立；480 项引用资源中 478 项可本地解析；共享已有缓存 222 项，新下载成功 106 项。** 两项缺失是每页各一次的同一源站 HTTP404。包含站内 HTML/CSS 中引用的静态资源，不代表所有延迟加载的第三方服务、支付、询价后台或嵌入工具已正常离线运行。

5-Axis 后补了经验证的原版 CSS/JS 与其 SiteOne 导出查询哈希别名（3 项）；另从已验收缓存复用了 WordPress jQuery UI 和语言图标文件。所有修改只发生于本地 Canary 镜像，并留下哈希和备份证据。Precision 的中文图片引用通过 URL 百分号解码对应到本地实际中文文件名，文件清单复核后才计入落地。

## 为什么本轮不能自动 PASS

1. 5-Axis 的真实源站 Playwright 导航持续返回 `net::ERR_CONNECTION_CLOSED`。没有产生有效的源站双视口完整截图；不能拿本地截图冒充源站对比。Precision 同样缺少真实双视口源站截图。
2. Windows 浏览器 UAT 后续发生 **Node/Playwright JavaScript heap out of memory**。只读机器状态：总 RAM 约 15.66 GB、空闲物理 RAM 约 **0.38 GB**、空闲虚拟内存约 **0.28 GB**，存在 42 个 Chrome 进程，Chrome private memory 约 9.996 GB；另有其他业务进程。**没有关闭任何 Chrome、重启设备或杀掉其他业务进程。**
3. 后续启动本地汇总页面的 PowerShell 进程也因系统资源不足返回 `0x800705AF`。已停止尝试再启动 Windows 进程，避免破坏其他项目。
4. 单页镜像已插入可回滚的本地 CSP 和表单/越界链接防护，且保存原 HTML 哈希与备份；因浏览器环境不足，**不能将仅有防护标记误报为 2/2 安全交互 PASS**。
5. 本轮未触及 PR #15 的通用数据注入真实批量门禁；该门禁继续 **BLOCKED**。两页为小范围源站原 HTML 镜像，而非“整站同一正文模板数据注入 PASS”。

## Windows 私有证据与直接预览

本地凭证 `C:\ai\site-mirror\rapiddirect-v2\uat\r11-small-batch\r11-static-audit.json`，另有精确单页抓取日志、素材补齐、URL 转换、素材别名修复、本地只读防护原稿与失败报告。

- 5-Axis: `http://127.0.0.1:8783/services/5-axis-cnc-machining/`
- Precision: `http://127.0.0.1:8784/services/precision-machining/`

两个局域环回地址曾分别 HTTP 200；后续因 Windows 极低内存，**不保证当前会话内服务始终在线**。私有网页截图和原站 HTML/视频/字体没有上传 GitHub。

## 后续仅需完成的现有验收，不新增基础研发

在 Windows 自然恢复足够内存、且真实源站可被 Playwright 读取后，仅对这两个已有静态镜像**恢复桌面与手机截图**、验证文件/图片和关键交互，计算无遮挡 SSIM。**两端都 ≥0.97 且其余检查 PASS 后，由新自动门禁直接记录视觉 PASS，无需用户逐页再批复**。任意失败仅处理该 URL 的具体 Bug；无需重新运行成功的单页静态导出或资源复制。

两份 URL 的成功阶段秒数是样本观测，**不等于整页从开始到视觉最终 PASS 的端到端吞吐**。48 小时无 Blog 整站复制仍未压测，不虚构 SLA。

**当前 PR #15/#16 均为 Draft；main、WWW、Dev、Production 不变；没有博客抓取或真实询价提交。**
