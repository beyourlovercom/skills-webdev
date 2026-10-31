# CentralXI 提炼案例 — 事实、失败模式与提纯规则

> 这里仅记录用户授权项目的工程教训和 GitHub 文档引用；**不是**素材下载包、对第三方内容的许可证明，也不将其 HTML/Logo/截图或客户询盘带到本 Public Skills 仓库。具体权限以各项目自己合法记录为准。

## 可核对的源资料
- CentralXI 项目仓库：[beyourlovercom/centralxi-web](https://github.com/beyourlovercom/centralxi-web)；冻结的旧镜像方向 PR #2 以**不合并**结束。
- 镜像保存和回滚依据：\`docs/CENTRALXI-RAPIDDIRECT-MIRROR-CLOSURE-20261027.md\`（\`feat/centralxi-authorized-mirror-uat-20261026\`）。
- 公开邮箱与 Footer 维护：\`docs/CENTRALXI-CONTACT-ONLY-V1-20261027.md\`（\`feat/centralxi-beyourlover-footer-20261027\`）。
- 收录开关发布：\`docs/CENTRALXI-802-GOOGLE-INDEX-RELEASE-20261029.md\`（\`feat/centralxi-index-all-802-20261029\`）。
- 以上为当时项目侧记录，运行态、源码、GitHub PR 状态应在真正使用时重新读回。

## 这条支线得到的 8 条制度
| 真实教训 | Skill 将其提纯为 |
|---|---|
| 未冻结 Header/Nav，独立品牌改版破坏原菜单，Owner 判 FAIL 并回滚 | D1 冻结网页结构、先跑差异视觉 UAT，不做未经批准的大改 |
| 合法许可的素材规模大，802 源快照和 802 渲染页分别保存 | D2 原始源快照只读+hash，页面与素材分别计数 |
| Footer 新增品牌展示不得覆盖源页面 | 站点独立附加模块、DOM 顺序断言、最小差异 |
| 普通插件与 MU 同时加载引发 \`Cannot redeclare\` | 插件安装 Preflight 检查、函数命名空间、禁止双重启用 |
| Cloudflare \`data-cfemail\` 残留旧邮箱 | 同时检查明文与解码后邮箱，公开邮箱与表单通知分开验 |
| \`blog_public=0\` 且 SEO 插件强加 noindex，导致不可能从 Google 搜索发现 | WordPress/HTML/Header/robots/sitemap 全链路收录门禁 |
| 两条 \`received\` 弹窗记录未证明真实客户，弹窗短时未加载但后来可见 | UI 多时点、入库/通知/有效线索分级，测试记录不计为客户 |
| 生产已部署而 PR 仍 Draft，用户“pass 发布”不等于所有历史功能可合并 | 线上发布与 GitHub 分支/PR 合并状态分开记录与审批 |

## 项目特有事实不转成通用默认值
- 当时的网站发布清单具有 **802** 个唯一 URL、WordPress + MU render adapter；其他网站应从自己的 Manifest 计算，不能写死 802。
- 当时公开邮箱与内部弹窗通知目标不同；其他网站应独立验证，不能写死这些邮箱。
- 当时 Owner 后续明确开放收录，覆盖了较早的 noindex 决定；通用技能依然以默认 INDEX_HOLD + 新站独立授权为准。
- 执行时 Server Hostinger、WordPress 版本、资源空间、GitHub branch、GSC 验证和真实询盘情况都可能已改变，不能从旧验收材料推断现状。
- 近重复站点的索引许可和 Google 实际索引是两件事；不得以技术放开取代权属/真实性审查。

## 不应再重复的做法
不复制未授权内容；不通过同名插件反复安装修复；不把原本仅属于第三方的公司地址/工厂能力/证言/员工冒充为目标站事实；不以复制站点数量来制造外链/排名信号；不在 Public Skill 发布私有素材或真实线索。
