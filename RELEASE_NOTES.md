# WorldQuant Scope 1.3.0

> [!IMPORTANT]
> 重要数据登记说明：安装 V1.3.0 或后续版本后，插件会使用当前 WorldQuant 登录态读取并上传原始 WQ ID、国家/地区、插件版本、随机安装 ID、安装/升级/重试原因及升级前版本，用于版本覆盖、用户分布、升级路径和重装次数统计。本版本不提供客户端关闭开关；如果不同意，请不要下载安装 V1.3.0 或后续版本，并继续使用 V1.2.2 或更早版本。

不会上传 Cookie 内容、密码、Session Token、API Key、Alpha、论坛内容、页面 URL、浏览历史、AI 提示词或本地缓存。插件只用 WorldQuant Cookie 请求官方 summary 接口，发往统计 Worker 的请求固定使用 `credentials: "omit"`，不会携带 WorldQuant Cookie。

每个“安装 ID + WQ 账号 + 插件版本”只登记一次；切换账号、升级和卸载后重装会分别登记。不采集功能使用事件，不能据此计算 DAU、WAU 或具体使用频率。

WQ ID 在 Worker 内生成 HMAC 稳定索引，并使用随机 IV 的 AES-256-GCM 加密；D1 不保存明文。登记数据长期保存、不自动删除。如需删除，请通过 [WebDataScope 仓库](https://github.com/AlphaQuantKit/WebDataScope) 联系维护者，但不要在公开 Issue 粘贴 WQ ID，先确认私密提供方式。

插件目前没有扩展商店自动更新或热更新，只有用户自行下载并加载代码时才会升级。如果未来引入自动更新，将重新提供明确授权或关闭入口。

本版本同时加入重试与幂等状态、Cloudflare Worker + D1 加密后端、私有统计管理页、按 WQ ID 删除、staging/production 部署和自动化验收。
