# D3–D5 — Windows Local / Dev 与浏览器保真 UAT

## 原则
按当前网站 GitHub HEAD 和项目 AGENTS.md 工作。仅最小可逆差异：优先站点专属适配器，非全局主题和全局 Andy Core 改造。需求没有涉及的 Header、菜单、原 Footer、产品工艺参数、已批准模块必须冻结。

## Windows Local 工作包
1. 建立项目独立 Local、Git branch、隔离 DB/端口/浏览器 profile；不得重启 READY 设备或影响别的 Local。
2. 获取合法许可的只读源基线，记录 SHA256。改动只落到 render adapter、站点 plugin 或受控模板；对原始存档保持不可写。
3. 素材定位：有权素材完整性、缺图和跨域资源；资源相对路径与 CDN 映射必须明确；外域资源可用不等于具备再发布许可。
4. 多页类 UAT：PC 1440px、移动 375px（及项目批准的更多尺寸），对比 Header/Nav/Footer/Hero、滚动、懒加载、布局溢出、点击入口、表单字段/错误状态。截图放在授权的项目证据位置。
5. HTML / PHP / JS 静态校验 + 浏览器交互。保存每项实际输入、期望输出和截图路径。一个 \`curl 200\` 不能证明浏览器和询盘有效。

## 已验证的工程模式与陷阱
- **不要同时运行同名 MU 和普通插件**：WordPress MU 自动加载，不需要在后台启用。同名函数/Hook 可能产生 \`Cannot redeclare ...\` Fatal Error。先列出 active / must-use、源码 hashes，再决定清理。
- **运行时适配**：改变渲染的电话号码、Footer 链接、JSON-LD 或 public mail，不代表归档文件已永久改好。卸载适配器可能恢复旧内容。与一次性迁移要分开设计与验收。
- **加密邮箱**：Cloudflare \`data-cfemail\` 需要解码读回核对，否则旧公开邮箱可能藏在 \`<span class="__cf_email__">\` 或 \`<a class="__cf_email__">\` 中。避免用泛化正则删除技术尺寸；用限定作用域的 DOM / 节点 ID 和测试。
- **Head/SEO**：重复 meta robots/canonical、复制原站 GTM/GA、旧主体地址的 JSON-LD 都是独立 FAIL；目标域名需要单独配置。
- **弹窗性能**：测试首屏 3 秒与稍后 15 秒的组件存在和可交互性；必须记录启动时延，不把“15 秒后存在”误写为“快速可用”。
- **表单测试**：只测表单打开、字段、客户端校验，不产生真实客户记录；如需要入库/发送 Canary，明确标记 \`DIAGNOSTIC DO NOT FOLLOW UP\`，单独授权，完成后清理测试数据。

## Dev 关口
- 确认 Dev 主机与 WWW 严格区分，甚至 Dev 是实际首发站时应显式冻结其角色。
- 代码 HEAD、插件版本、必要依赖、路由清单、缓存状态、错误日志、核心交互/移动端真实读回。
- 真实 UAT 在目标托管环境而不只是本地 PHP lint。失败时回滚仅该站适配器并清该站缓存。
- 强制保留 FAIL/OPEN，不用“看起来正常”“用户说 pass”代替可计数证据。

## UAT 最小矩阵
| 维度 | PC | Mobile | 判断 |
|---|---|---|---|
| Header/Nav | 原结构无意外变更 | 菜单完整 | 结构与截图 |
| Hero/图片 | 无失效 | 无溢出 | HTTP + 浏览器 |
| Footer | 原版本完整 | 模块不挤压 | 节点数和 DOM 顺序 |
| CTA/询盘 | 可打开/校验 | 可打开/校验 | 多时点检查 |
| 正文与参数 | 数字不被改 | 保持可读 | 原文/DOM 差异 |
| SEO | 不重复 | 不重复 | robots/canonical 读回 |
| 缓存 | 最新版本生效 | 同版本 | 线上 CDN+本地读回 |
