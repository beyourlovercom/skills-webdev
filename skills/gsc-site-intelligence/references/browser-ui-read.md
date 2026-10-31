# 现有 Chrome GSC 会话｜浏览器真实只读 UAT

## 适用条件
Owner 已在获授权的中国 Mac 或其他 macOS 设备的 Google Chrome 中打开目标 Search Console 属性。例如：`https://search.google.com/search-console?resource_id=sc-domain%3Aexample.com`。优先复用现有会话，不要求重新登录、OAuth、CSV；脚本只读取 **已有标签页**，不打开新窗口、启动 Chrome、刷新、导航或写入任何 Google 设置。

## 使用
通过已授权的 DC，在对应 Mac 的本地 Skill 目录执行：

    osascript skills/gsc-site-intelligence/scripts/gsc-browser-ui.applescript example.com

示例脚本仅支持 `sc-domain:<bare-domain>`，不支持 URL-prefix 属性；该场景须使用有来源验证的其它读取步骤。脚本按浏览器 tab URL 精确核对 `resource_id`，且在页面内部通过 `URLSearchParams` 再核对同一属性，返回 JSON 中的 `title/url/observed_at/ui_text`。不是登录授权工具；用户的已登录浏览器已经提供可读的 UI 会话。

如页面没有内容、属性不匹配、Chrome 不在运行或无现成标签页，返回 BLOCKED。不要自动启动 Chrome、另开窗口或重试登录。

## 多页报告怎么读

在同一已打开的标签页，依次通过只读浏览导航核对 **Performance（范围、Web 类型、筛选、点击、展示、CTR、平均排名、查询/页面/国家/设备）**、**Page indexing（独立更新日期、已收录/未收录原因）**、**Sitemaps（实际提交 URL、提交日期、最后读取、状态）**、**HTTPS** 和 **Core Web Vitals（设备、CrUX 数据覆盖）**。每换一页应重新调用脚本、读取当前页面实际 title 和文字；不要用静态缓存代替。

如果执行提供的是单纯 read-only 引导，脚本本身不会自动换页；由 GPT/已授权 DC 在允许的 UI 导航边界处理现有标签页（不新增窗口）。无法访问的报表保留 OPEN。要主动提交 Sitemap、Validate Fix、修改属性或站点，需要另行 Owner 审批。

## 证据强度

- `source=GSC_EXISTING_CHROME_UI_READONLY` 只表示“真实、已登录的 GSC UI 页面被读取”，不同于 Google Search Console API 的逐行数据抓取。
- 每份证据必须附带真实属性、采集时间、报表标题、页面日期范围和搜索类型；浏览器只有 3 个月图表时不得冒称 12 个月。
- 浏览器查询词/页面表可能因为隐私与 Top-N 而不显示全量。以 Performance 顶部卡片为该界面筛选范围的指标，不以可见查询词表的合计代替总量。
- 收录报告、HTTPS、Sitemap 的统计范围和更新日期不同，不应混为一个时间窗口；Sitemap 显示历史 `Couldn't fetch` 时要单独核验当前公开 URL 的真实状态。
- 只读脚本不会读取 OAuth Token、Cookie、LocalStorage、密码或个人身份。输出中的查询词等可能是网站业务数据，只能保存在受保护目录，不得提交 Public Skills 仓库。
- Browser UI 读取验收 PASS 不代表年度完整数据分析 PASS；完整 Word/关键词 URL 映射必须基于真实覆盖足够的数据，不补造空白。

## 回到 ChatGPT 网页版的提示

请读取 `registry/skills.json` 中的 `gsc-site-intelligence` 和 `references/browser-ui-read.md`，通过已授权自建 DC 读取中国 Mac **现有** Chrome 中已登录的目标 GSC 属性，按报表记录浏览器只读 UAT，不重启、不打开重复页面、不要求重新 OAuth 或 CSV。Google/网站任何写操作仍须独立批准。
