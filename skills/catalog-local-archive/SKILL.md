---
name: catalog-local-archive
description: Source-exact, owner-authorized offline website backup into isolated Windows Local. Preserve original logo, all source products, product galleries, images and URL paths; ingest owner's offline archive first instead of rebuilding mock templates.
---

# catalog-local-archive V0.3 — 原站离线备份恢复

## 最高优先级：BACKUP，不是重新设计
Owner 要求把自有源站整个备份到 Windows Local，以真实来源内容为准，达到尽可能 100% 的网站一致性。**不能**把四条模拟产品、原创 SVG、重做的 Logo 或原创主题当作原站备份、商品同步或视觉一致性 PASS。之前的 `basworldy-local` V0.2.1 仅是测试用本地主题，状态 `FIXTURE_ONLY`。

## 输入优先顺序（新增：OFFLINE ARCHIVE FIRST）
1. **Owner 保存的整站离线备份**：可由其拥有的浏览器/备份工具取得，置于 Windows 上的独立私有目录，例如 `D:\ai\basworldy-source-archive\`。通过正式自建 DC **直接读取本地目录**，不要求把大型图片/源码上传 GPT 或提交到 GitHub。
2. **源站官方授权导出/主机原始备份**：站点数据库、代码、媒体、产品数据导出、CMS/API 导出、服务器 backup。针对动态库存与全相册，这通常比网页抓取更全面；可结合离线网页快照补齐真实外观。
3. **获准的限定页面读取**：仅用于差量对账，不绕过 WAF、登录、支付或反爬限制。Cloudflare 403 就记录 `BLOCKED_SOURCE_ACCESS`，不强行破解。

## 原始归档不可修改
- 输入目录只读，另建 `source-manifest`、`assets`、`restore-worktree`；不得直接在原始备份上全局替换链接。
- 第一轮盘点记录真实文件数/总字节、主页及分类路由、所有产品详情链接、产品唯一 ID、源图 URL→本地文件、媒体顺序、Logo 原始版本与每个资源 SHA256。
- 原始 `index.html` 不代表全站完整；每类网页需检查分页、延迟加载、JS 路由、移动版本、商品变体、源站 API 和隐藏图库。动态查询和站内搜索不能因为网页下载成功就宣称可离线使用。
- 原始网页及资源/私有凭据**不得提交 Public GitHub**。GitHub 分支只保留技能、恢复脚本和去敏化报告；不得包含真实交易/客户/账号/会话 Cookie。

## “一模一样”的三大硬门
**LOGO_EXACT**：直接保留源站实际 Logo 图像字节，包括 Desktop/Mobile/浅深色变体、尺寸和 URL，逐资源 SHA256；不得重新绘制、文字替代或改颜色。

**PRODUCTS_EXACT**：逐条保留源站真实产品 ID、原始 URL、名称、品牌、型号、SKU、价格、币种、分类、技术参数、年份、里程、售卖状态及排序；对照从原站导出的商品总数。不得造假数据填缺口。

**IMAGES_EXACT**：每个产品封面、全部详情相册图片、原图尺寸、展示顺序及商品关联关系与源站一致；下载的原始图像不经无授权压缩/变形，源 URL、hash、bytes 和 missing 状态一一可追溯；不得使用 placeholder 冒充原图。

## 执行顺序
- **B0 读取目录**：Owner 明确提供的 Windows 本地目录，通过正式 DC 执行；只读列出根目录、结构、文件数量、实际大小、可打开入口。
- **B1 基线清点**：Logo / CSS / JS / 首页 / 类目 / 产品链接 / 所有图库，找出缺图、丢失路由、无来源链接及动态依赖。
- **B2 原样本地预览**：先用备份的 HTML/静态资源建一个原版只读预览，不改写视觉、不先套 WordPress 主题；独立于现有测试网站。
- **B3 Local 还原**：在 `http://localdev.basworldy.com` 本地隔离站恢复原始站点路由与前台组件；仅在确有必要时使用 WordPress adapter，优先原样资源+HTML。离线禁用所有线上支付、表单提交、真实用户账号、分析脚本及外部回调。
- **B4 一致性对账**：来源商品数=已恢复+明确排除+失败项；Logo SHA256、全部产品图 URL/顺序/Hash、页面路径和所需资源均列表审计；丢失内容不可悄悄替代。
- **B5 Windows Chrome 真实验收**：先首页、类目列表、产品详情，再分页/筛选/搜索/图片 Gallery；PC 1440px 与 375px 截图对比。**必须使用实际系统代理例外配置**，不能只靠 `--no-proxy-server` 的 Headless 测试。
- **B6 离线与全量**：断开远程资源依赖后可浏览所有已承诺归档页面、图片以及必要交互，输出准确覆盖率、缺口、SHA 和独立回滚。不可凭 `HTTP 200` 或测试 fixture 宣称 `FULL_ARCHIVE_PASS`。

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
