# D7–D8 — 搜索收录、表单/邮箱与真实转化

## SEO 三种不等价的状态
1. **INDEX_HOLD**：Dev/未获授权公开发布的镜像默认 `noindex`，如需禁止抓取应遵守项目授权和合法约束。只设置 Sitemap 不能解除 noindex。
2. **INDEX_ELIGIBLE**：Owner 明确批准 public index；目标站 WordPress 的 `blog_public`、HTTP `X-Robots-Tag`、页面 `robots/googlebot`、Cloudflare `robots.txt`、canonical、Sitemap 全部经过外部实际读回核对。
3. **INDEXED**：必须通过目标站**已授权**的 Google Search Console 索引覆盖报告 / URL 检查证实；site: 搜索与 Sitemap HTTP 200 不能代替 GSC。即使 self-canonical 正确，Google 可能选择另一条更具原创性的 URL。

**近重复内容**：同一内容多站发布通常不会带来多个独立排名入口；外观和文本与第三方高度相同可能发生归一化/质量问题。无需假设“发布 802 页＝收录 802 页”；对身份、版权、原创和独立价值重新评审，不能将索引开关视为搜索增长保证。

## 实际四级检查
- WordPress setting: `blog_public`; 此值与页面插件另外输出的 `noindex` 可能冲突。
- Server HTTP: 200 / 301 / 404；`X-Robots-Tag`；缓存前后响应。
- HTML head: exactly one intended canonical, robots, googlebot；真实 target hostname，无 source-domain 污染。
- Sitemap/robots: URL 清单的唯一性、源域泄漏、路由 200、robots 是否允许搜索爬虫、Cloudflare cache 是否生效、Sitemap 是否有 `Sitemap:` 发现行。
- 权限：不因开放 Google Search 而自动开放 AI 训练、私人图片和原站客户数据；应依原授权和配置。
- 发布后的 GSC：核对已提交 Sitemap、已发现与已收录、被选 Canonical、抓取异常、搜索展示/点击/URL 级趋势；没有真实连通就保持 OPEN。

## 询盘三个不能混为一谈的路径
- 网站公开的联系邮箱（例如 `info@site.example`）供访客手工发信；要验证 MX/收信和跳转/混淆解码。
- 弹窗表单的入库（例如 WordPress `*_leads`）需要真实创建、状态及来源，并筛除测试、内部 UAT、机器人。
- 后台的通知收件人可能与公开邮箱不同；核查实际 WordPress option/邮件传输队列，而不是根据 Footer 推断。

**测试数据**：尽量使用表单 UI 只读打开、字段验证和禁用提交测试；需要真实提交时必须有额外独立授权和显著诊断标记并与真实客户隔离。只读 SQL 聚合不读取姓名/邮箱/消息内容，必要时审批后才访问个人数据。

## 数据验证四联表
| 维度 | 需要的真实证据 | 常见误判 |
|---|---|---|
| 流量 | 获授权 GA4/GSC/Search 或服务端匿名日志 | 访问量=询盘数 |
| UI | PC/M14 Chrome + 页面不同加载时点 | 15秒后有弹窗=迅速可用 |
| 入库 | 按天/status/source_group 聚合的数据库 | received=有效新客户 |
| 邮件 | 获授权的通知配置/投递记录及邮箱收件 | 设置了地址=邮件送达 |

报告中区分 0 流量、0 提交、收到但无通知、测试线索与有效线索。除非能实际验证，否则不能指责邮件配置造成“没有询盘”；先区分有没有访客和能否提交。

## 持续复盘建议
按周记录 GSC 有效索引数、曝光、点击、站内匿名会话、弹窗可见率、实际提交成功、去重有效询盘、回复时间，并将每项标记数据源与确认日期。对应其他 Skill 可调度 `ga4-site-intelligence`、`seo-live` 和 `analytics-live`，但它们在不同 PR/分支时必须先按 Registry 解析。
