# BASWORLDY · R12 Handoff.md — 2026-11-06

## 0. 接手指令
本支线继续 R12“非 Blog 整站本地镜像／242 内容候选分类＋5 业务页面增量补齐”。严禁重做 R0–R11，已有的 Home、Truck、Volvo PDP 模板和 187 页均 Owner 视觉 PASS。一个模板研发一次，同类批量复用。默认用正式自建 BYL DC 的 Windows 设备，不重启 READY 设备或用户 Chrome。仅操作 Windows Local，不改 WWW/Dev/Production、原站或 GitHub main。全部动作必须有真实 SHA、实际浏览器 UAT，不虚报 SSIM ≥0.97。

## 1. 路径和仓库
- local URL: http://localdev.basworldy.com/source-mirror/
- Local content: D:\ai\basworldy-local\app\public\source-mirror
- Original source: D:\ai\basworldy-source-archive\page1-batch
- Evidence: D:\ai\basworldy-source-archive\page1-batch\uat
- GitHub repo: beyourlovercom/skills-webdev
- Feature branch: feat/catalog-local-archive-pilot-20261102 (NO main merge)

## 2. 真实进度与通过证据
- R9–R11: 172 有效分类第一页＋15 核心业务内容页＝187 页，Owner 视觉 PASS，R11 结案。R11 验证 187/187 页面 SHA、634/634 未改资源 SHA、196/196 回滚文件、14/14 原 MHTML。
- R12: 新增 Trucks、Semi-trailers、Tractor Units、Vans、Machinery 5 个真实来源页，全部获得真实 Windows Chrome MHTML（约90.2MB），来源正文、URL、SHA 通过。之前 Chrome 报错页已隔离，不能混入。
- 五页已发布到 Windows Local，5 个 HTML＋386 个资源＝391 文件、67.6MB，391/391 SHA PASS。原 187 页 SHA 保持一致。
- 192/192 页面 HTTP 200；51,304 处本地站内链接、0 死链；13,412 处本地运行资源引用，0 个新的缺失；已有 8 处旧 CSS 引用例外另计。
- 新五页在实际 localdev 运行 Chrome 10/10 桌面1440px／手机375px浏览器 UAT PASS：0 已加载破图、0 横向溢出、0 外部网络请求、0 JS 错误。
- 首页 466＋61＝527 处 href-only 修复；未改视觉、字体、正文、CSS，原文件备份已保存。
- 当前真实状态 **187 页 Owner PASS＋新增 5 页技术 PASS、Owner 视觉待确认**。绝不能提前宣布 192 页 Owner PASS。

## 3. 本批五页，下一步 Owner 视觉审核
- Trucks: http://localdev.basworldy.com/source-mirror/content/trucks/ （源 https://www.basworld.com/en/content/trucks）
- Semi-trailers: http://localdev.basworldy.com/source-mirror/content/semi-trailers/ （源 https://www.basworld.com/en/content/semi-trailers）
- Tractor Units: http://localdev.basworldy.com/source-mirror/content/tractor-units/ （源 https://www.basworld.com/en/content/tractor-units）
- Vans: http://localdev.basworldy.com/source-mirror/content/vans/ （源 https://www.basworld.com/content/vans）
- Machinery: http://localdev.basworldy.com/source-mirror/content/machinery/ （源 https://www.basworld.com/en/content/machinery）

审核 PC＋手机 Hero 高度、字体、商品／服务 CTA、图片、轮播和页脚。只修真实 FAIL 的共性问题；通过后写本批 Owner 视觉 SHA 冻结清单，并重新测 192 页。用户明确 PASS 才能记录视觉通过。

## 4. 242 内容候选的分类
原首页和 9 个根分类来源导航快照：261 原始 /content/ 路由，正规化 256，原有14核心业务类，剩 242。来源不是官方 Sitemap 全站普查。
242 中有 5 个实际“More about…”业务入口，上述五页已来源核实并本地化；另237个在存档导航中是“Read more／Mehr lesen”的文章式内容卡片。
237 的 URL 主题：购买对比114；法规运营32；技术教程37；新闻更新19；其他编辑35。建议按用户“不需要 Blog”排除，但**未逐页核实237页的 CMS 模板**，不能宣称已逐页确定均为 Blog。需要 Owner 最终确认是否将指南、对比、新闻内容排除；保留全部 URL、原站导航和分类清单。

## 5. 当前真实性例外
- 8处旧分类CSS `/_next/static/css/5093726fc9691c0c.css`；不要修改已 PASS 模板以掩饰它。
- 原始国旗 WebP https://cms.media.basworld.com/i/basgroup/SV?qlt=100&fmt=webp 返回404；另外10个原来源图片已真实恢复。不要替换为假国旗。
- 9个原始视频 MP4 未随 MHTML 保存（About2、Store1、Sell6）。
- R10旧 Next.js preload/favicon/CSS font/media 与第三方社交、账户、拍卖服务外链仍不代表已完全离线。
- 13源站404分类＋4未归档深层筛选保持说明页，不能伪造页面。
- 不承诺“整个非 Blog 原站100%完成”；需认可文章范围边界和原始素材例外。
- 离线表单阻止真实提交，不等于外部商业流程克隆。

## 6. 审计文件（位于 Evidence 目录）
- r12-final-192-qualified-audit-20261105.json（当前核心技术 PASS、8个已知CSS例外）
- r12-five-business-local-promotion-readback-20261105.json（391文件 SHA）
- r12-five-real-local-evidence-20261105/browser-report-page1.json（10次真实浏览器双端测试＋截图）
- r12-five-business-mhtml-20261105/（五份原始存档＋逐页回执）
- r12-five-genuine-origin-images-20261105/manifest.json（10成功＋1失败）
- r12-content-scope-5-plus-237-classification-20261105.json
- r12-editorial-242-final-classification-inventory-20261105.json
- r12-home-scope-inbound-link-readback-20261105.json（首页前466处）
- r12-home-61-residual-links-readback-20261105.json（首页后61处／现行 SHA）
- r12-home-before-inbound-links-20261105.html、r12-home-before-61-residual-links-20261105.html（各次备份）
- r10-final-core-baseline-freeze-20261105.json（原187页 SHA）
- r11-final-integrity-readback-20261105.json、r11-core-closeout-readback-20261105.json、BASWORLDY-R11-FINAL-HANDOFF-20261105.md

## 7. 下一步 Roadmap
| Phase | Action | 估计有效工程量 |
|---|---|---|
| R12-U1 | Owner 审五页 PC＋手机；反馈 PASS／具体缺陷 | 0.3–0.8h，不含等候 |
| R12-U2 | 若发现真实新Bug，仅修五页的共用模板、做全组回归；全 PASS 则跳过 | 0–2h |
| R12-U3 | 五页 Owner PASS 后冻结 SHA；检查首页、192页 HTTP | 0.5–1h |
| R12-U4 | 由 Owner 确认237文章式候选最终是否排除，生成范围和例外清单 | 0.5–1.5h |
| R12-U5 | 同步新 R12 终验文档到 GitHub 功能分支，不合并 main | 0.3–0.7h |

无新视觉缺陷、不逐页验证237条CMS模板时，后续有效工程量约 **1.6–4h**，不是历史投入或保证完成时刻。

## 8. 回滚和安全规则
新五页COPYFILE_EXCL安全发布：仅核对 R12 新增清单 SHA 后才允许移除本次新增文件，不触碰原187页和公共资源。首页修改是两层：若用户单独批准回滚，先恢复 r12-home-before-61-residual-links-20261105.html，再恢复 r12-home-before-inbound-links-20261105.html，每层前后均需校验 SHA。不得自动回滚、删除源 MHTML、覆盖 Owner-PASS 文件或重新开发模板。

## 9. 进入下一个对话后的优先工作
直接列出并打开五张真实 localdev 页面，请 Owner 逐页审核；收取明确 PASS 后冻结五页。再完成237候选范围决策与增量交接关闭。现阶段不要求用户再提供源MHTML，不要重问已回答过的问题。严格以 GitHub/runtime 收据和实际浏览器证据为准。
