# V3.1 Windows Local 新站目录规范（Owner approved 2026-11-10）

## 唯一推荐根目录（新项目）

**所有今后新建的 V3.1 授权网站项目：** `D:\ai\sites\<domain>\`

`<domain>` 应使用小写、合法的站点域名（如 `lelo.com`），每个项目完全隔离。不得将 `<domain>` 输入解析为任意文件系统路径，不允许 `..`、斜杠、UNC、驱动器切换或符号链接越界。

例如 LELO：

```text
D:\ai\sites\lelo.com\
├── source\         已获准复制的原始 HTML/CSS/JS/媒体；记录原件和授权范围
├── mirror\         尽量不修改的源站本地化静态镜像
├── local\          完整可浏览、内链贯通的 Windows Local 网站
├── uat\            私有 Manifest/截图/哈希/视觉评分/交互报告/异常队列
├── release\        全站验收后才允许写入的最终 CSS/JS/发布封装
├── site-project.json   本地私有目录契约和阶段状态
└── README.md
```

## 强制执行规则

1. **新站默认 D 盘**：新站在首次 R0 初始化时使用 `D:\ai\sites\<domain>\`，并将其作为 V3.1 seed/local-site/gate 的 `--root`。遇到既有项目路径或磁盘不足应报告，不得静默回退到 C 盘/默认用户目录。
2. **旧站保持不动**：现有 Local WordPress 站（如 `D:\ai\basworldy-local`、`D:\ai\svakomstore`）及原有镜像（如 `C:\ai\site-mirror\rapiddirect-v2`）一律原地保留。不得自动搬迁、复制真实数据库、更换 Local 应用配置或创建 junction/symlink。
3. **LELO Blog 隔离**：现存 `C:\ai\lelo-blog-local` 是另一个 Local Blog 项目；LELO 新整站工作区 `D:\ai\sites\lelo.com` 仅作为全新、独立工程，不合并旧 Blog，不覆盖旧证据。
4. **先原件，后本地化**：`source` 保留授权原始证据，`mirror` 保存源站对应资源，`local` 承载导航整合及高保真预览；`uat` 和 `release` 不得直接暴露给公共服务器。
5. **独立 WordPress 需单独建立**：`local` 目录不等于已创建 Local WordPress、MySQL 或网站。若项目日后选用 WordPress，必须显式建立独立运行实例、域名、数据库、端口和可回滚备份，不使用已有旧站数据库。
6. **不可假定权限已具备**：目录建立只代表准备就绪；R0 需记录授权范围、地区语言、URL 分母，之后才允许读取或镜像源内容。Owner 的复制授权不自动等于 SEO、真实登录、支付、邮件或正式生产发布授权。
7. **隔离已运行服务**：不重启 READY 设备或 Chrome，不改现有 Local WordPress、已有端口及已有浏览器配置。服务端口先只读检查并选择可用端口。
8. **版本和审批**：本文件是 **V3.1 `main` 目录政策更新**，不修改原不可变 `v3.1.0` Release/tag。Site UAT、最终 CSS/JS 和 Dev/WWW 都仍是独立门禁。

## 未来每站的最小 R0 验收

- D 盘空间和目录存在；只有新站创建，旧站的路径和 Local 注册表保持不变。
- `source` / `mirror` / `local` / `uat` / `release` 均建立并且独立。
- `site-project.json` 记录域名、根路径、源站权限状态和未完成门禁；未经真实浏览器验证，不能写 PASS。
- 仅在 Owner 明确允许并存在可信原素材时进入网站复制，严禁将原 LELO Blog 的当前目录直接挪走。

该规范对应 Owner 2026-11-10 指令：今后新增 V3.1 网站统一使用 D 盘固定根目录；从 LELO 开始，旧站绝不移动或重装。
