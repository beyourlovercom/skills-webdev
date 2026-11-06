# BASWORLDY · R15 P0-A → P0-D Dev 准备与验收

**日期：2026-11-06｜范围：Windows Local → 独立根目录部署候选 → 本地 HTTP/PC/手机浏览器验收。**

## 总结

**P0-A PASS；P0-B Dev 技术配置 PASS（正式域名/Sitemap 与法律主体待确认）；P0-C 静态安全 PASS；P0-D 本地 UAT PASS，远端 Dev 部署待真实 Dev 主机参数。**

未部署 Production，未写入远端 Dev，未合并 GitHub main。此前批准的 R15 Canonical 修复已对 32 个 HTML 仅修改 Canonical 标签；本轮 P0-A 候选生成没有回写 source-mirror，R14 CSS/JS 资产及页面视觉内容未改。

## P0-A · 根目录部署版本

候选目录：

D:\ai\basworldy-deploy\r15-dev-root-candidate-20261106\

公开根目录包：

C:\Users\Administrator\Downloads\BASWORLDY-R15-DEV-ROOT-CANDIDATE-20261106.zip

- 3,790 个文件；554,150,960 bytes。
- ZIP：482,551,973 bytes；CRC 完整性 PASS。
- SHA-256：a82d724b9565eafa4bd5e864e43063db4da9163b8cc3347ab7fd3aa3b839c190
- 192 个 Owner 已批准核心页面 + 首页，合计 193 条路由。
- 保留两个已有离线兜底页：outside-first-page-scope.html、not-archived-product.html。
- 排除内部 review 截图、旧 localdev Sitemap、未批准的第二页/产品详情路由。
- 重写 65,169 处 /source-mirror/ 路径，308 个文本文件需要适配。
- 将一处指向未批准产品详情页的列表链接指向已有 not-archived stub，避免产生死链。

## P0-B · SEO / Dev 环境配置

- 193 页全部一个 Canonical，均为站内根相对路径。
- Dev 所有 HTML 均为 noindex,nofollow。
- 2,958 个指向原 BAS World 域名的 hreflang 标签已移除；当前归档并没有对应的多语言目标页面。
- 341 个原 robots meta 标签已规范化，清除了 146 页的 index/noindex 冲突。
- 原先缺失的 26 个 Canonical 已补齐。
- 旧 localdev 域名 Sitemap 不带入新包。等真实 Dev hostname 确认后生成正确的 193 URL Sitemap。
- 9 个旧 favicon 引用已切换到已归档的本地图标。
- Dev 的 robots.txt 允许 crawler 读取页面上的 noindex 指令；这不是访问控制，正式 Dev 应由服务器权限/环境隔离保护。

正式 Production 之前仍需 Owner 确认 BAS World 品牌、商标、Logo、照片、文案与法律页面是否获准使用，并确认实际运营主体及隐私/联系资料。技术检查不能替代权利授权。

## P0-C · 外链与表单安全

准确复核后，原先记录的 20 个 form 并不是询盘表单，而是站内搜索 autocomplete 外壳：

- 20 个 aa-Form，role=search。
- 全部 data-disabled=true、action="#"。
- 页面 CSP 有 form-action 'none' 与 connect-src 'none'。
- 没有开启真实询盘、支付、账户或搜索后端；没有伪造提交成功。

保留原页面的外部链接，没有擅自替换销售/拍卖/账户目标。批准页面中的外部链接分布：

| 外部域名 | 链接数 |
|---|---:|
| www.basworld.com | 188 |
| sell.basworld.com | 521 |
| auction.basworld.com | 125 |
| account.basworld.com | 173 |
| bas.careers | 173 |
| Facebook / YouTube / Instagram / LinkedIn | 各 173 |
| www.parkingcoolers.com | 7 |
| www.baslease.com | 1 |

199 个 target=_blank 链接已补齐 noopener noreferrer。外部目标保持原样，避免擅自改变业务行为；正式公开前需确认这些原站销售/账户入口是否仍应保留。

## P0-D · 本地 HTTP 与 PC/手机浏览器验收

**HTTP：193/193 路由 200。**

关键资源、robots.txt、两个兜底页均 200。Sitemap 暂不部署是预期行为，等 Dev hostname 确认后生成。

**浏览器：16/16 视图完成。**

- 8 个代表页面 × Desktop 1440×900 / Mobile 375×812。
- 0 个 JS exception。
- 0 个资源请求失败。
- 0 个外部网络请求。
- 0 个横向溢出视图。
- 与 R14 相同页面的 12 组 PC/手机截图对比全部通过 0.97 门槛；最低模糊灰度相似度 0.98011，最低逐像素一致率 99.64%。
- Home UI ready，3 个 slider。
- 列表页 Mobile 筛选抽屉打开/关闭均 PASS。
- Contact、Trucks、Machinery、Sitemap 内容模板 PC/手机均 ready。
- 两个兜底页正常展示。

已知例外：
- 8 个旧 listing 页面原有 _next CSS 资源缺失引用已移除；164 个未实际使用的 webpack preload 已移除。
- 6 类旧 CSS 媒体资源仍在 legacy CSS 文件中引用（ajax-loader、Slick 字体/图标、BAS-World-Vehicles SVG）。它们作为历史资源例外记录，不再耗时追抓；本轮代表页面浏览器没有资源失败。
- stock/all 仍保留 R14 已记录的 legacy CSS/JS 结构（10 个样式表、1 个脚本），PC/手机浏览器通过，没有请求失败、JS 错误或横向溢出。

## 为什么尚未上传远端 Dev

Windows 检查结果：
- dev.basworldy.com：DNS 未解析，HTTPS 检查超时。
- basworldy.com：DNS 未解析，HTTPS 检查超时。
- Windows SSH config 中没有 BASWORLDY 对应 alias。

这两个域名此前只是候选名称，不能当作已确认的部署目标；也不能复用其他项目的 Hostinger 连接或目录。为避免覆盖错误网站，远端 Dev 上传尚未执行。

**继续 P0-D 所需的唯一输入：BASWORLDY 实际 Dev URL，以及对应主机 SSH/SFTP 地址和目标部署目录（或已配置的 SSH alias）。** 拿到后只部署 Dev，完成远端 193 路由、资源、PC/手机回归，再申请 Production 审批。

## Windows 审计证据

根目录：

D:\ai\basworldy-source-archive\page1-batch\uat\

- r15-dev-root-candidate-manifest-20261106.json
- r15-dev-root-candidate-final-readback-20261106.json
- r15-dev-root-http-readback-v2-20261106.json
- r15-p0-a-to-d-final-readback-20261106.json
- r15-dev-root-candidate-20261106\browser-uat-v2\browser-regression-readback.json
- r15-dev-root-candidate-20261106\browser-uat-v2\r14-r15-visual-diff.json
- r15-dev-root-package-zip-readback-20261106.json

**本轮 P0-A 候选生成没有回写 source-mirror；此前 R15 Canonical 修复对 32 个 HTML 仅做 Canonical 元数据修改，R14 CSS/JS 资产与页面视觉内容未改、没有修改 GitHub main、没有部署远端 Dev/Production。**

## 当前 Roadmap 与剩余工时

| 阶段 | 状态 | 剩余工作 |
|---|---|---|
| P0-A 根路径与部署包 | PASS | 0h |
| P0-B Dev SEO 配置 | 技术 PASS | 真实域名确认后生成 Sitemap/服务器策略；Production 法律主体待确认 |
| P0-C 静态功能/外链安全 | PASS（只读静态站范围） | 若未来要启用搜索或询盘，另立后端需求，不纳入本轮 |
| P0-D 本地验收 | PASS | 0h |
| P0-D 远端 Dev 上传与 UAT | BLOCKED：缺少目标主机参数 | 预计 1.5–3h，收到真实 Dev URL/SSH/路径后 |

**R15 本地根目录部署候选已准备好；下一步只差真实 Dev 主机参数，不增加任何基础功能。**