---
name: catalog-local-archive
description: Source-exact, owner-authorized offline website backup into isolated Windows Local. Preserve original logo, all source products, product galleries, images and URL paths; ingest owner's offline archive first instead of rebuilding mock templates.
---

# catalog-local-archive V0.6 — 原站离线备份恢复

## 🔒 最高级执行门禁 V0.6：FIRST PAGE → OWNER VISUAL PASS → FULL INVENTORY
**本节具有最高优先级，覆盖本 Skill 旧版 B0–B6、V0.3–V0.5 和任何要求在第一轮遍历全部分页/所有商品的文字或脚本示例。违背本节的旧步骤视为已废止。**

### 第一轮必须只做页面与视觉，不做全量数据
1. **FIRST_PAGE_ONLY（硬编码）**：任何带分页的区域——产品列表、所有分类、博客文章列表、搜索结果、筛选结果、评论、品牌、图库分页及 API cursor——初次读取和复刻都**只准第一页**：`page=1` 或没有分页参数的首屏/首页。禁止抓取 `page=2`、`page>1`、`offset>0`、`cursor`/nextToken、无限滚动下一屏，禁止自动跟踪页面中的 `next` 链接。可读取/记录其存在，但**不能访问或下载后续页**。
2. **每个页面类型选一个真实样本**：仅抓主页、分类/列表第一页、选中的首屏商品详情（必要时各类型一条）、About/Contact/Shipping 等标准页和博客索引第一页/一篇文章（如属于本期范围）。不能为了“商品总数”读取下一页或多条详情；同类多个分类可以分别取**自己的第 1 页**用于视觉模板，但不翻页。
3. **FIRST_PAGE_ASSETS_EXACT**：把第一轮所选页面上**全部实际需要的** Logo 原文件/变体、字体、CSS、JS（只读离线安全版本）、首屏到页尾 Banner、分类图、第一页各商品卡片图、背景图、`srcset`/lazyload 资源保存到 Windows 私有本地；所选真实详情要把实际图库与缩略图按顺序完整保存。缺项要列出，不得拿原图 placeholder、模板、热链替代。
4. **FIRST_PAGE_VISUAL_100_TARGET**：先在 Windows Local 将这几种核心页面**尽可能做到逐像素/布局高保真 100% 目标**：原始 Logo、Header/Footer、字体、间距、颜色、导航、商品卡片、图库、PC 和移动端。对照源站真实截图和 Local Chrome 截图，出逐页面缺陷报告；视觉上不符就修复或如实列为 OPEN，不能自称“100% PASS”。
5. **OWNER_VISUAL_REVIEW（唯一阶段转换）**：将首页、列表第 1 页、单个详情、基础页面审核链接交给 Owner 直接看。即使程序 51/51 测试通过、图片 100%、HTML 200，也**不能**代替 Owner 明确回复 `pass` 或更具体的视觉审批。只有在私有审批记录内引用具体 Owner 消息、审核基线/页面/日期后才允许转下一阶段。普通“继续”**不等于**视觉 PASS。
6. **AFTER_OWNER_VISUAL_PASS 才解锁**：先冻住已确认的页面视觉与 CSS，然后有序遍历所有分类分页 → 产品清单/详情 → 每件原图 → 完整率核验。以后遇到其他新模板/页面类型，仍先第一页+Owner 视觉签字。所有生产发布和 GitHub main 合并仍需**独立审批**。
7. **已有越界数据只存档、不算视觉 PASS**：BASWORLDY 之前因流程偏差预抓了 3 类、2,115 URL、195 详情等；保留原始哈希以免损失、不重复抓取，但标为 `LEGACY_PREMATURE_BULK_FROZEN`，**不能据此允许再抓页 2+，也不能把 R6 数据 PASS 当成 Owner 视觉 PASS**。

### 可执行门禁
- 读取模块 `scripts/source-http-read.mjs` 只准第一轮页面；`scripts/capture-real-catalog.mjs`、`scripts/capture-category-pages.mjs` 默认 `--from 1 --limit 1`，其他分页/批量详情需要 `--stage EXPANSION_AFTER_OWNER_PASS --visual-approval <private-approval-json>`，且校验该文件中明确 Owner 视觉通过的可追溯凭据。样例见 `templates/owner-visual-pass.example.json`，默认 `AWAITING_OWNER_REVIEW`，**不是授权文件**。
- 默认阶段永远为 `PILOT_FIRST_PAGE`；首轮使用独立 `first-page-pilot` 清单，不准将已采集多页的旧目录作为首轮索引继续抓取。
- 单元测试必须覆盖：首轮翻页拒绝、首轮批量拒绝、历史多页清单拒绝、缺审批拒绝、篡造/不完整的 PASS 拒绝。自测仅证明门禁代码有效，不替代 Owner 审批。
- 以下所有关于“全量清点”的旧描述仅适用于**Owner 视觉 PASS 之后**。

## 最高优先级：BACKUP，不是重新设计
Owner 要求把自有源站整个备份到 Windows Local，以真实来源内容为准，达到尽可能 100% 的网站一致性。**不能**把四条模拟产品、原创 SVG、重做的 Logo 或原创主题当作原站备份、商品同步或视觉一致性 PASS。之前的 `basworldy-local` V0.2.1 仅是测试用本地主题，状态 `FIXTURE_ONLY`。

## 输入优先顺序（新增：OFFLINE ARCHIVE FIRST）
1. **Owner 保存的整站离线备份**：可由其拥有的浏览器/备份工具取得，置于 Windows 上的独立私有目录，例如 `D:\ai\basworldy-source-archive\`。通过正式自建 DC **直接读取本地目录**，不要求把大型图片/源码上传 GPT 或提交到 GitHub。
2. **源站官方授权导出/主机原始备份**：站点数据库、代码、媒体、产品数据导出、CMS/API 导出、服务器 backup。针对动态库存与全相册，这通常比网页抓取更全面；可结合离线网页快照补齐真实外观。
3. **获准的限定页面读取**：仅用于差量对账，不绕过 WAF、登录、支付或反爬限制。Cloudflare 403 就记录 `BLOCKED_SOURCE_ACCESS`，不强行破解。

## 原始归档不可修改
- 输入目录只读，另建 `source-manifest`、`assets`、`restore-worktree`；不得直接在原始备份上全局替换链接。
- 第一轮只记录**首选核心页面及各列表第一页**的实际 HTML/资源、所选样本详情和对应原始媒体；只对这批页面做 Logo/图像 SHA256 与视觉验收。全量商品清单/分页仅在 Owner 视觉 PASS 后盘点。
- 原始 `index.html` 不代表全站完整；每类网页需检查分页、延迟加载、JS 路由、移动版本、商品变体、源站 API 和隐藏图库。动态查询和站内搜索不能因为网页下载成功就宣称可离线使用。
- 原始网页及资源/私有凭据**不得提交 Public GitHub**。GitHub 分支只保留技能、恢复脚本和去敏化报告；不得包含真实交易/客户/账号/会话 Cookie。

## “一模一样”的三大硬门
**LOGO_EXACT**：直接保留源站实际 Logo 图像字节，包括 Desktop/Mobile/浅深色变体、尺寸和 URL，逐资源 SHA256；不得重新绘制、文字替代或改颜色。

**PRODUCTS_EXACT**：逐条保留源站真实产品 ID、原始 URL、名称、品牌、型号、SKU、价格、币种、分类、技术参数、年份、里程、售卖状态及排序；对照从原站导出的商品总数。不得造假数据填缺口。

**IMAGES_EXACT**：每个产品封面、全部详情相册图片、原图尺寸、展示顺序及商品关联关系与源站一致；下载的原始图像不经无授权压缩/变形，源 URL、hash、bytes 和 missing 状态一一可追溯；不得使用 placeholder 冒充原图。

## 执行顺序
- **B0 读取目录**：Owner 明确提供的 Windows 本地目录，通过正式 DC 执行；只读列出根目录、结构、文件数量、实际大小、可打开入口。
- **B1 第一页清点**：仅首页、各核心类型列表第一页、一条有代表性的真实商品详情与基础页；完整归档这些选定页面的 Logo / CSS / 字体 / 图片 / 该样本图库。不翻下一页、不列出全部商品。
- **B2 原样本地预览**：先用备份的 HTML/静态资源建一个原版只读预览，不改写视觉、不先套 WordPress 主题；独立于现有测试网站。
- **B3 Local 还原**：在 `http://localdev.basworldy.com` 本地隔离站恢复原始站点路由与前台组件；仅在确有必要时使用 WordPress adapter，优先原样资源+HTML。离线禁用所有线上支付、表单提交、真实用户账号、分析脚本及外部回调。
- **B4 首轮一致性对账**：只对**第一轮选定页面**的 Logo、页面结构、第一页每张资源、样本商品图库和展示顺序审计；全站商品总数和全站图片对账不得提前做。
- **B5 Windows Chrome 真实验收**：首轮仅首页、类目**第一页**、样本产品详情/图库及基础页，PC 1440px 与 375px 原站↔Local 对照，提交 Owner 视觉确认。**在 Owner 明确 pass 前禁止进入后续分页。****必须使用实际系统代理例外配置**，不能只靠 `--no-proxy-server` 的 Headless 测试。
- **B6 视觉 PASS 后的离线与全量**：仅 Owner 视觉审核已 pass 后才启动其余分页、所有商品/图库及全站离线覆盖率的审计。不可凭 `HTTP 200` 或测试 fixture 宣称 `FULL_ARCHIVE_PASS`。

## BASWORLDY 已知项目事实（2026-11-02）
- Source: `https://www.basworld.com/`；Owner 声明该站属于自己，目标是私人本地备份。此声明记为 `OWNER_ATTESTED`；素材/后台源导出权限以实际接入核对，不能伪造。
- Windows Local: `http://localdev.basworldy.com/`，LocalWP 独立目录 `D:\ai\basworldy-local`；旧 synthetic 主题不是备份。真实备份应以新私有目录输入，不混到旧 fixture。
- Windows curl 当前访问部分源站页面得到 Cloudflare 403；**Owner 离线备份输入优先**。不绕过 Cloudflare 安全限制。
- 尚未取得真实源站归档包：`SOURCE_FILES=AWAIT_OWNER_OFFLINE_ARCHIVE`、`LOGO_EXACT=OPEN`、`PRODUCTS_EXACT=OPEN`、`IMAGES_EXACT=OPEN`、`FULL_ARCHIVE_PASS=OPEN`。
- Blog 按项目要求可分阶段恢复，商品和图片优先；未恢复页面必须列入差异，不得默默忽视。

## 操作边界
- 只在 Owner 授权的 Windows Local 操作；不重启 READY 设备、别人的 Chrome 或 LocalWP 共用代理；现有其他站不受影响。
- 本地恢复不等于对 `dev.basworldy.com` 或 `basworldy.com` 发布授权；不修改公共 DNS、不开放索引、不合并 main。
- 若缺少源站完整备份、动态接口或图库，明确输出 `PARTIAL`/缺项，不造内容；获得合规源站管理导出后再补齐。

## 403 / Cloudflare Attention Required — 备份中断处理门禁
当 wget、HTTrack、网页离线备份器或 Windows curl 返回 Cloudflare branded `403 / Attention Required!` 时：
1. **立即停止重复网页下载**，记录 UTC 时间、目标 URL、HTTP 状态、Cloudflare Ray ID 和原站 Security Events 对应的 blocking feature；不要通过代理池、UA 轮换、验证码破解或跳过 challenge 继续获取。
2. **优先原始服务器/后台导出**：网站源码、数据库、上传媒体/图片、商品表/Feed、真实 Logo 和样式资源分别取得，权限与账号不保存在公开仓库。云服务器/托管备份比只复制 HTML 更可能完整恢复动态站。
3. 只有在 Owner 具有原站 Cloudflare Zone 的管理权限、查看到 Security Events 中确切拦截规则，且另行批准本次真实生产安全修改时，才允许提出 **限源公网 IP + 限域名/路径 + 限时间的最小 Skip/WAF 例外**；保留原规则快照、实时监控并在备份结束后撤销。不可放宽整个站的安全设置，也不可将 Tailscale 100.x 私网 IP 误当公网访问 IP。不同 Cloudflare 产品（尤其 Free Bot Fight Mode）可能不能由 Skip 规则豁免。
4. **绝不以本地 fixture 成功代替备份完成**。未取得真实 HTML/媒体/商品数据，保持 `SOURCE_ACQUISITION=BLOCKED_403`，`LOGO_EXACT=OPEN`，`PRODUCTS_EXACT=OPEN`，`IMAGES_EXACT=OPEN`。Owner 给出本地导出或备份后，通过 DC 重新进入 B0 只读盘点。
5. 如浏览器能人工打开但下载器 403，可以先使用官方管理后台导出；单页浏览器保存仅作缺口修补，不等于全站备份。

## 真实源站读取 V0.3 — 已有实际可执行模块
Skills Markdown 是流程规范，不等于真实联网抓取程序。新增 `scripts/source-http-read.mjs`，单次仅读取一条获得授权、精确列在 allowlist 的 HTTPS URL；可配置单一 User-Agent，限制体积/耗时、保留原始 HTML、HTTP 响应头、真实标题、SHA256、Cloudflare Ray、状态码和 JSON 报告。没有递归、重试、代理轮换、破解挑战、图库下载、后台登录或真实商品同步。

项目配置：`pilots/basworldy/source-access-policy.example.json`，将 Owner 提供的 `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36` 作为**该源站本次测试的显式请求头**，不固定为所有站点的长期默认 UA。

Windows Local 运行：
```bash
node skills/catalog-local-archive/scripts/source-http-read.mjs skills/catalog-local-archive/pilots/basworldy/source-access-policy.example.json
```

### 2026-11-02 源站实际测试
同机同源站首页 A/B：默认 curl 请求 HTTP 403（4572 字节）；指定 Chrome/120 UA 后 HTTP 200（788730 字节）。页面标题 BAS World: trucks, vans, construction equipment & trailers，无 Cloudflare challenge。新增脚本 Windows 实测 `SOURCE_HTML_READ_PASS`，归档 SHA256 `38b068a22d5a60e80b7dd07b50aec740699fb499d19d9987bcf83a5f0343ca91`。该证据**只说明首页 HTML 读取成功**；不代表全站、所有真实商品、Logo 和图片都已备份。

### 仍必须完成的能力
1. SOURCE INVENTORY：基于获准真实目录页、源站导出清单、分页与产品 ID，审计真实总 SKU/车辆量，保持源路径。
2. ASSET INTAKE：发现并保存实际 Logo、全部商品图片/图库、lazyload/srcset/CSS 图，保留源 URL、SHA、bytes 与商品关联；不热链不填假图。
3. LOCAL REPLAY：用原始 HTML/CSS/JS/图片构成私有只读本地镜像；动态筛选、API 依赖与分页需单独实现或留缺口。
4. FULL AUDIT：按真实源商品清单逐项核验数量、字段、价格、图片顺序、链接以及 Chrome 视觉对照；不使用模拟页面冒充备份成功。

### 403 诊断边界
Cloudflare Browser Integrity Check 等安全服务可能检查 UA 和其他请求头；目前 A/B 只能说明 UA 与 403 有关，**不能确定具体安全规则**。需要 Cloudflare Security Events + Ray ID 才能归因。不得批量轮换 User-Agent/代理或绕过明确挑战；源站管理员优先采用后台数据/原始服务器导出。原站源码、真实图片、认证信息仅留 Windows 私有路径，不上传 Public GitHub。


## V0.4 可运行的真实源站备份管线（2026-11-02）

**本节替代早期“仅有模拟样本”的能力说明。** 已在 Windows 开发机使用真实 BAS World 首页、卡车列表第 1/2 页和两条商品详情进行验证，**但全站仍远未完整**。真实源素材保存在 Windows 私有目录；Public GitHub 只保存代码、Skill、非敏感审计结果，不上传网页 HTML、商品图库或私有凭据。

| 顺序 | 工具 | 真实工程用途 | 验收证据 |
|---|---|---|---|
| 0 | `scripts/source-http-read.mjs` | 精确 allowlist URL 的单页 HTTP 快照；可配置合法 UA、原始 HTTP headers/HTML、SHA256 | 单请求 `SOURCE_HTML_READ_PASS` |
| 1 | `scripts/extract-source-manifest.mjs` | 从真实列表的 href 和商品详情 JSON-LD 取得真实 SKU/名称/价格/币种/分类路径；扫描 **DOM 全图库**（JSON-LD 可能仅含 2 张） | 明确 unique link 数及图片尺寸变体 |
| 2 | `scripts/discover-page-assets.mjs` | 从首页/列表/详情的 IMG 与 image preload 提取 Banner、类目图、Logo 等来源 URL | `page-assets.json`、外域排除清单 |
| 3 | `scripts/fetch-source-assets.mjs` | 分角色下载 Logo、图片、CSS；支持 --start/--limit、源 URL hash 路径、断点已有文件复用、HTTP 200/201 + 文件签名验证 | JSON 逐资产 SHA256 和媒体成功/失败 |
| 4 | `scripts/render-source-mirror.mjs` | 原站**实际 HTML + 原站 CSS/图片**恢复到 `/source-mirror/`，支持两个分页和两条商品详情；不覆盖 WordPress 主站 | 静态文件实读、报告区分缺失 |
| 5 | `scripts/verify-source-mirror.mjs` | Windows Chrome 默认系统代理、单独临时 profile，对源站快照做真实截图/资源加载统计 | 原始标题、图片加载数、外域请求数 |
| 6 | `scripts/audit-source-completeness.mjs` | 真实产品列表 URL 去重、Logo/CSS、各 SKU 原图及 thumbnail 两套尺寸、页面资源完整率独立统计 | 必须输出 `FULL_ARCHIVE_NOT_READY` 或可靠关闭全部缺口 |

### 必须保留的真实故障回归
- Cloudflare：默认 curl UA → 403；Owner 指定 Chrome 120 UA → 首页真实 HTML 200。UA 是单站访问诊断参数，不允许未经授权轮换身份/IP或绕过挑战；出现 WAF/验证码应停并通过源站管理员核实。
- 图片规格：首个 SKU `70320127` 实际 41 张 × (1280/250)，第二个 SKU `70323007` 实际 44 张 × (1080/250)。尺寸**不得固定写死**，按真实详情建立文件与 SKU 的关联、图库顺序。
- 图片 URL 可能没有文件扩展名，只靠 `fmt=webp` 指示；下载与 Local replay 必须使用**相同**归档路径规则，否则产生假缺图。
- 静态图像 CDN 可合法返回 `201 Created`；其他媒体服务器可能发送 `image/jpg`。验收用实际 MIME、JPEG/PNG/WebP/SVG 文件签名及非零字节组合判断，拒绝伪装成图片的 HTML；误判的有效文件仅校验后恢复，不重复批量下载。
- 本地浏览器的外域请求尝试不能被忽略；虽然 CSP 禁止远端脚本/表单并在静态快照中去除原站 JS，尚存在未改写的源站素材 URL。只有外域依赖清零并做完整离线 Chrome 复验，才可能关闭 `OFFLINE_COMPLETE`。
- 主站上的 4 个模拟商品属于历史 fixture，**一律不计入**真实备份的 SKU/图库/视觉覆盖率。
- 不采集支付、账号、客户、Cookie、任何原站实时询盘。不开外部索引，不向 Dev/WWW 部署，主站切换需 Owner 单独审批。

### BASWORLDY 截至 2026-11-02 的实测基线
- 两页真实卡车列表：**70** 条唯一商品链接（只代表两个分页，不是全站总数）。
- 两条真实产品详情：Volvo `70320127`、Renault `70323007`。Volvo 大图 41/41、缩略图 41/41；Renault 1080 大图 4/44、250 缩略图 4/44。
- 两个源 Logo **2/2**，CSS **12/12**；三类页面抽取的可归档媒体 **68/337**，另有外域资源未纳入，完整率此处不能视为全站比例。
- Local `/source-mirror/` 真实源 HTML 页面 **5 个**，已存档资产 **170 个**；Chrome 已真实渲染，仍有未本地化资源和动态交互缺口。
- **最高门禁 `FULL_ARCHIVE_NOT_READY`**：产品站内总数量尚未知，至少两个分页以外的产品未审计，绝不可宣称 99%/100%。

### 本轮实测补充：镜像响应安全和跨设备 UAT
- 静态 HTML 镜像必须在 `<head>` **最前面**注入 CSP，不允许等到 `</head>` 才禁止外部预加载；未保存的第三方 `preload/preconnect` 也必须移除。
- 真实 Chrome 检查同时报告 `external_attempts` 和 `external_success_responses`，两项不能混淆。本轮已取得 `1061` 次外域尝试、`0` 个外域实际响应；**离线完整门禁仍未通过**。
- 支持第二页列表与第二种产品尺寸，URL 去重后只有前两页的 **70** 条真实商品链接；源站页面继续指向 `?page=3`，说明必须继续分页清点，不能把 70 当全站总数。
- 原站测试与本地视觉截图只在私有 Windows 中保存；第二 Windows `007windows` HTTP 5/5 PASS，不等于该设备 Chrome 视觉 PASS。

## V0.5 — Verified real-source R1 through R6 gates (2026-11-02)

**Important: R6 has been executed but its result is `R6_AUDITED_FULL_SITE_FAIL`, not site completion.**

New real code modules under scripts/:
- `capture-real-catalog.mjs`: bounded/resumable source inventory and product detail HTML capture, exact URLs, SHA256 and original SKU/price/gallery; 403/429 stop.
- `capture-category-pages.mjs`: allowed-category pagination, per-category persisted index; a confirmed last page is required per category.
- `build-product-media-queue.mjs`: per-SKU real image URLs, dimensions and hash-keyed media work queue. No fake images or products.
- `render-catalog-archive.mjs`: read-only original-HTML Local mirror, supports Truck / All / Tractorhead pagination; unavailable products get explicit missing-page states, not synthetic listings. Added searchable local index is an auxiliary archive UI, NOT source-native functionality.
- `verify-r5-r6-browser.mjs`: isolated real Chrome, default system proxy, waits for actual target URL, tests index filter and local source image/CSS display, counts external request attempts versus actual external responses.
- `audit-real-site-r6.mjs`: real category URL union, local detail files, per-SKU photo hash coverage, zero-price/zero-gallery issues, actual Chrome evidence and fail-closed R6 review dashboard.

Key evidence: Truck 28 pages / 988 URLs; All 28 pages / 929 URLs; Tractorhead 20 pages / 698 URLs. Their de-duplicated union is 2,115 URLs, not an authoritative all-site product total. Never substitute /stock/all for category union: All and Truck overlapped on only 332 URLs. Remaining menu categories include construction_equipment, semi-trailer, light_commercial_vehicle, trailer, combination and various.

Captured 195 authentic product details. 123 reported zero price and zero gallery in the captured HTML: do not invent either. Captured details referenced 5,506 photo variant URLs; 220 were physically saved at the final audit. Volvo SKU 70320127: 82/82 variants saved; Renault SKU 70323007: 88/88 variants saved. Original captured logo 2/2 and CSS 12/12.

Local source-mirror-r2 currently contains 272 authentic HTML page snapshots plus separate review/utility pages. Chrome index search PASS, 901 external resource attempts blocked, 0 external responses; full offline interaction, all page media and 1:1 visual parity remain OPEN. R6 audit: 15 blockers, NO FULL ARCHIVE PASS.

Private Windows source archive: D:\ai\basworldy-source-archive. Local view: http://localdev.basworldy.com/source-mirror-r2/ ; searchable captured inventory: /source-mirror-r2/inventory.html ; R6 review: /source-mirror-r2/R6-review.html.

Do not merge main, change root LocalWP page, publish Dev/WWW, transmit private source HTML/photos to Public GitHub, or enable live order/payment/forms without separate Owner approval.

## V0.6a — 实际浏览器页面还原的工程验收（首页 FAIL 后补充）
**不可再用「原始 HTML 删除全部 JavaScript + 仅下载 IMG 主图」代替原站复刻。** 本项目的原始首页含 35 个 JS 标签和 422 个 IMG；旧本地 HTML 只保留 0 个 JS，仍有 358 个外链 IMG，Trustpilot 图标来自 `basgroup.a.bigcontent.io`；源 CSS 中额外有 24 处 `url(...)`（字体、图标、背景）。这就是 Owner 2026-11-02 截图中大面积空白、破图及框架缺失的已验证主要技术缺口。

**第一轮必经流水线：**
1. 用真实浏览器对同一源 URL（首页/类别第一页/首屏样本详情/基础页）获取渲染态 DOM、完整第一页面 Network 依赖与原版截图；在当前第一页正常滚动以激活本页 lazyload，禁止进入下一页、无限滚动续页或点击 Load more。若源站 Headless 无法正常渲染，不可以拿静态请求冒充实时视觉；改用有授权的实际 Chrome 会话只读 DOM/HAR/截图，或由 Owner 提供源站截图做参考。
2. `scripts/discover-first-page-resource-graph.mjs` 必须扫描 IMG、Picture/srcset、CSS 内嵌 URL、`@font-face`、Banner 内联背景、Logo、Svg/评论星星、轮播图、图标字体和动态媒体来源，保存来源 URL/二进制 SHA/MIME；实测样本依赖图 265 条（仅原始首页及已捕获 CSS 的直接引用，尚不等于动态资源全量）。
3. `scripts/fetch-source-assets.mjs` 下载白名单内真实页面资源，文件签名必须与 MIME/字节一致；遇到同名 .svg 返回 JavaScript 模块须拒绝，不得伪装资源 PASS。媒体下载范围严格限选定第一页和该页样本详情，不扩展到后续产品分页。
4. 恢复 CSS 字体路径/背景 URI、图片/图标、必要 UI 组件运行时。对 React/Next.js，应采用**已渲染 DOM 快照 + 可审计本地轻交互适配**，或从 Owner 有授权的源码构建隔离本地前端 + mock API；不得粗暴开放线上脚本、生产登录、支付、表单、跟踪或私密 API。原站是可交互的，不能把所有交互禁止后声称 100% 功能一样。
5. Windows Chrome 对来源与本地相同视口进行**全页**截图/组件坐标差分，验证可见与页尾懒加载图片、Hero/轮播、Logo、Trustpilot、字体、商品卡片、Header/Footer、移动端。任何破图、主视觉空白、CSS 字体缺失、外链依赖、未完成 source↔Local 截图对比必须 `VISUAL_REVIEW_NOT_READY`，**禁止请求 Owner PASS**。
6. 用 `scripts/audit-first-page-visual-readiness.mjs` 记录资源缺口、Chrome 外域请求、原版视觉基线是否存在、动态组件及 Owner 审批未完成。源站/Local 视觉一致率不能凭主观形容造数，100% 是目标，不是机器已经达到的状态。

BASWORLDY 本轮第一轮样本：Logo 2/2、CSS 12/12、Volvo 图库 82/82 已归档；原先三页范围图片为 98/337。随后识别首页+CSS 的 265 个直接依赖，包括 BigContent SVG、TitilliumWeb/图标字体和 Hero 背景，但它们仍需逐项落盘、检查浏览器及动态运行时；不可把「资源清单已建立」当「页面高保真 PASS」。
