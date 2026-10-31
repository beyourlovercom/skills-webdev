# D1–D2 — 原站盘点、源快照与路由映射

## 最少清点内容
- 原站 URL 分类：主页、服务、分类、产品、博客、Contact、关于、隐私与法律；深度、分页、语言路径、旧的 301/404。
- DOM 与视觉：Header/菜单层级、Footer、面包屑、Hero、卡片、交互、移动布局、图像加载。
- 真实技术栈：WordPress/主题、插件、静态页、表单、外部 API、缓存/CDN、响应头、robots、canonical、sitemap。
- 每类素材的**授权状态**：HTML、文本、图片、视频、字体、图标、品牌元素；缺权限则排除，并用原创替代。
- 目标站已有内容/已通过 UAT 的可复用部分，不覆盖已冻结的 Header 和 Footer。

## 清点方法
1. 从合法允许的 URL 清单和 sitemap 导出路径；只访问明确许可的公开或凭正式登录授权页面，不绕过访问控制、付费墙、反爬或 robots 限制；限制请求速率和体积。
2. 路由表以标准化 path 为键，去重：`source_path → target_path → local_file → allowed_asset_refs → status`。主页必须存在；记录非 200/301/404 和错误原因。
3. 对授权归档素材计算 SHA256，记录源、目标、时间、总文件数、大小、变更摘要。源文件只读，缓存/转换后的 HTML 与原版快照分离。不能用“802 页”作为固定门槛——每个站按自己的清单统计。
4. 关联资源引用、背景图、CSS 字体、懒加载图与可见媒体；报告外链泄漏和失效图片。不能将第三方登录和支付脚本镜像到目标站。
5. 建立页类代表性测试集合，覆盖首页、二三级服务、Contact、博客、一个高复杂页面与有错页面。随后按 Manifest 全量静态检查 + 抽样浏览器复核。

## 证据格式
```text
source_site: https://authorized-source.example
target_site: https://target.example
route_count_expected: <from approved inventory>
source_snapshot_count: <measured>
rendered_page_count: <measured>
asset_count: <measured>
source_hash_manifest: <non-sensitive local project path>
route_errors: <array of exact paths and status>
changed_original_files: 0
```

**不得**写“所有 802 页面像素完全一致”，除非真的逐页验证。仅少数真实 HTTP 200 和 4 个 PC/M14 截图只能支撑相应样本 PASS。

## 执行停止条件
授权范围不清、源站包含隐私或付费内容、镜像数据超出空间/预算、请求触发站点限制、不能保留可审计源快照、原目标站导航无意中被覆盖 → STOP, 标记具体风险和修复方案。
