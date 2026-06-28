# Image Background Remover MVP 需求文档

## 1. 产品概述

### 1.1 产品名称

Image Background Remover

### 1.2 产品定位

一个快速、轻量、无需注册的在线图片背景移除工具。用户上传图片后，可以自动去除背景，并导出透明 PNG 或干净背景图片。

MVP 的核心承诺是：

> 上传图片，自动去背景，预览结果，下载透明 PNG。

### 1.3 核心关键词

主 SEO 关键词：

- image background remover

辅助关键词：

- free image background remover
- remove image background online
- transparent PNG background remover
- remove background from product photo
- change image background to white

## 2. 产品目标

### 2.1 商业目标

- 基于 Cloudflare 快速上线一个可用 MVP。
- 验证搜索流量、用户需求和转化路径。
- 采集基础产品指标，例如上传率、处理成功率、下载率。
- 为后续高清下载、批量处理、API 服务、付费订阅等功能打基础。

### 2.2 用户目标

- 快速去除图片背景。
- 不注册账号即可下载透明 PNG。
- 可以把去背景后的图片放到白底或纯色背景上。
- 整个流程简单直接，不需要学习复杂编辑器。

### 2.3 技术目标

- 部署在 Cloudflare Pages 和 Cloudflare Workers / Pages Functions。
- 不存储用户图片。
- 图片只在浏览器内存和 Worker 请求内存中短暂存在。
- 使用 Remove.bg API 完成背景移除。
- Remove.bg API Key 只保存在服务端环境变量中，不能暴露给前端。

## 3. 目标用户

### 3.1 主要用户

- 需要处理商品图的电商卖家。
- 需要快速制作社媒素材的内容创作者。
- 需要制作广告图、目录图的小商家。
- 只想快速去除图片背景的普通用户。

### 3.2 MVP 用户场景

1. Shopify 卖家上传商品照片，下载透明 PNG。
2. Etsy 卖家移除背景，并导出白底商品图。
3. 创作者上传头像或人物照，下载用于封面图的透明抠图。
4. 用户搜索 `image background remover`，进入网站后无需注册即可完成任务。

## 4. MVP 范围

### 4.1 本期包含

- 单张图片上传。
- 拖拽上传。
- 支持 JPG、PNG、WebP。
- 前端文件类型和大小校验。
- 通过 Remove.bg API 去除背景。
- 结果预览。
- 原图和结果图对比。
- 下载透明 PNG。
- 在浏览器中添加白色背景。
- 在浏览器中添加自定义纯色背景。
- 从浏览器导出最终图片。
- 基础错误提示。
- 基础数据埋点。
- 移动端适配。
- 展示隐私说明：图片不会被本站存储。

### 4.2 本期不包含

- 用户账号。
- 图片历史记录。
- 云端图片存储。
- 批量上传。
- 手动橡皮擦或修边工具。
- AI 背景生成。
- 团队空间。
- 对外开放 API。
- 支付和订阅。
- 原生移动 App。

## 5. 功能需求

### 5.1 图片上传

用户可以在首页上传一张图片。

需求：

- 支持拖拽上传。
- 支持本地文件选择器。
- 支持 JPG、PNG、WebP。
- 不支持的格式需要在提交 API 前拦截，并显示清晰提示。
- 限制最大文件大小。
- MVP 推荐限制：10 MB。
- 上传后显示文件名和原图预览。

验收标准：

- 用户可以选择并预览有效图片。
- 无效文件类型会在前端被阻止。
- 超过大小限制的文件会在前端被阻止。

### 5.2 背景移除

用户点击主操作按钮后，系统自动移除图片背景。

需求：

- 前端把图片发送到 `/api/remove-background`。
- 后端把图片转发到 Remove.bg API。
- 后端把处理后的图片二进制数据直接返回给浏览器。
- 图片不得写入磁盘、R2、KV、D1 或任何外部存储。
- 默认返回透明 PNG。

验收标准：

- 上传有效图片后，可以获得透明背景结果图。
- Remove.bg API Key 不会出现在浏览器代码或网络请求中。
- 网络错误和 Remove.bg API 错误会被展示给用户。

### 5.3 结果预览

用户可以对比原图和处理后的图片。

需求：

- 显示原图预览。
- 显示处理后的结果图预览。
- 提供简单的前后对比视图。
- 透明区域使用棋盘格背景显示。

验收标准：

- 用户下载前可以确认处理效果。
- 用户可以清楚看到透明区域。

### 5.4 背景选项

用户可以选择不同背景样式导出图片。

MVP 背景选项：

- 透明背景。
- 白色背景。
- 自定义纯色背景。

实现说明：

- 背景合成在浏览器中用 Canvas 完成。
- 服务端只负责调用 Remove.bg 去背景，不做图片编辑。

验收标准：

- 用户可以下载透明 PNG。
- 用户可以下载白底图片。
- 用户可以下载自定义纯色背景图片。

### 5.5 下载

用户可以下载处理结果。

需求：

- 提供明确的下载按钮。
- 默认文件名：`image-background-removed.png`。
- 下载不需要注册账号。

验收标准：

- 下载的透明图片保留透明通道。
- 下载的白底或自定义背景图片包含所选背景。

### 5.6 重置和重新上传

用户处理完一张图片后，可以重新开始。

需求：

- 提供“上传新图片”或重置操作。
- 清空当前本地预览状态。
- 不要求刷新页面。

验收标准：

- 用户完成一次处理后，可以继续处理下一张图片。

## 6. 非功能需求

### 6.1 性能

- 首页需要在移动端和桌面端快速加载。
- 初始 JavaScript 体积应尽量轻。
- 图片处理过程中必须有明确加载状态。
- 下载前的 Canvas 合成不能导致浏览器明显卡死。

推荐目标：

- 常规网络环境下，LCP 控制在 2.5 秒以内。
- 背景移除耗时取决于 Remove.bg，但界面必须立即进入处理中状态。

### 6.2 隐私

- 本应用不存储用户图片。
- 图片只在浏览器内存和 Worker 请求内存中短暂存在。
- 处理后的图片直接返回浏览器。
- 上传区域附近需要展示隐私说明。

建议文案：

> Your images are processed instantly and are not stored by us.

可选中文文案：

> 图片会被即时处理，我们不会存储你的图片。

### 6.3 安全

- Remove.bg API Key 必须配置为 Cloudflare Secret。
- API Key 不能暴露在前端代码中。
- 客户端和服务端都需要校验文件类型和文件大小。
- 需要添加限流，避免 API 额度被滥用。
- 未预期的服务端错误应返回通用错误信息。

### 6.4 稳定性

- Remove.bg API 失败时，需要展示友好错误提示。
- 触发限流时，提示用户稍后再试。
- 文件过大时，提示用户上传更小的图片。

### 6.5 可访问性

- 上传控件需要支持键盘操作。
- 按钮需要有清晰文本标签。
- 加载状态需要有可见文本。
- 颜色选择不能是识别当前背景选项的唯一方式。

## 7. 页面需求

### 7.1 首页

首页就是产品工具本身，不做纯营销落地页。

主要模块：

- 顶部 Logo 和极简导航。
- 第一屏核心上传工具。
- 上传后的处理和编辑状态。
- 用例说明：商品图、人像、Logo、社媒图片。
- FAQ。
- 页脚：隐私政策、服务条款、联系方式。

首屏要求：

- 用户进入页面后必须立即看到上传入口。
- H1 需要包含主关键词。

推荐 H1：

> Image Background Remover

推荐辅助文案：

> Remove backgrounds from product photos, portraits, and graphics in seconds. Download a transparent PNG or add a clean white background.

中文理解：

> 快速移除商品图、人像和图片素材的背景，下载透明 PNG，或一键生成干净白底图。

### 7.2 结果编辑区

结果编辑区可以作为首页上传后的状态展示。

控件：

- 透明背景。
- 白色背景。
- 自定义颜色。
- 下载。
- 上传新图片。

页面状态：

- 空上传状态。
- 已选择图片状态。
- 处理中状态。
- 成功状态。
- 错误状态。

## 8. API 需求

### 8.1 接口定义

`POST /api/remove-background`

请求：

- `multipart/form-data`
- 字段：`image_file`
- 可选字段：`size`
- 可选字段：`format`

推荐默认值：

- `size=auto`
- `format=png`

成功响应：

- `200 OK`
- `Content-Type: image/png`
- Body：处理后的图片二进制数据

错误响应：

- `400`：文件无效或缺少文件
- `413`：文件过大
- `429`：触发限流
- `502`：Remove.bg API 错误
- `500`：未知服务端错误

### 8.2 Worker 行为

Worker 需要做：

- 解析 multipart form data。
- 校验文件。
- 创建新的 `FormData` 请求给 Remove.bg。
- 从环境变量读取 `X-Api-Key`。
- 把图片转发给 Remove.bg。
- 把 Remove.bg 返回的结果返回给浏览器。
- 设置 `Cache-Control: no-store`。

Worker 不应该做：

- 存储原图。
- 存储处理后的图片。
- 记录原始图片数据日志。
- 向前端暴露不必要的 Remove.bg 内部错误信息。

### 8.3 环境变量

必需 Secret：

- `REMOVEBG_API_KEY`

可选配置：

- `MAX_UPLOAD_MB=10`
- `RATE_LIMIT_PER_IP=10`

## 9. 数据埋点需求

只追踪产品使用事件，不追踪或存储图片内容。

推荐事件：

- `upload_started`
- `upload_rejected_file_type`
- `upload_rejected_file_size`
- `remove_background_started`
- `remove_background_success`
- `remove_background_failed`
- `download_transparent_png`
- `download_white_background`
- `download_custom_background`

推荐属性：

- 文件类型
- 文件大小区间
- 处理耗时
- 错误类型
- 用户选择的导出背景

## 10. SEO 需求

### 10.1 首页元信息

Title：

> Image Background Remover - Remove Background Online

Meta description：

> Remove image backgrounds online and download a transparent PNG in seconds. Fast, simple, and no account required.

### 10.2 页面内容结构

首页需要包含：

- 带目标关键词的 H1。
- 简短的使用场景说明。
- FAQ。
- 隐私说明。
- 支持的图片格式。

### 10.3 初始 FAQ

建议问题：

- Is this image background remover free?
- Do I need to create an account?
- Are my images stored?
- What file formats are supported?
- Can I download a transparent PNG?
- Can I make the background white?

## 11. 限流和防滥用

MVP 要求：

- 为 `/api/remove-background` 添加 Cloudflare WAF 或 Rate Limiting 规则。
- 服务端校验文件大小。
- 如果出现明显滥用，再加入 Turnstile。

推荐初始限制：

- 匿名用户每 IP 每小时 10 次。
- 单张图片最大 10 MB。
- 每次请求只处理一张图片。

## 12. 界面需求

### 12.1 视觉风格

界面应当实用、清爽、工具感强。

设计原则：

- 优先突出上传和处理流程。
- 避免过重的营销页面结构。
- 按钮和控件清晰紧凑。
- 透明图预览使用棋盘格背景。
- 移动端流程要简单。

### 12.2 主按钮文案

空状态：

> Upload Image

已选择图片状态：

> Remove Background

成功状态：

> Download PNG

## 13. 技术栈

推荐 MVP 技术栈：

- 托管：Cloudflare Pages
- API：Cloudflare Pages Functions 或 Cloudflare Workers
- 前端：React + Vite，或更轻量的 HTML/CSS/JavaScript
- 背景移除：Remove.bg API
- 图片合成：浏览器 Canvas
- Secret 管理：Cloudflare Secrets
- 数据分析：Cloudflare Web Analytics、Plausible 或其他隐私友好的分析工具

## 14. 部署需求

Cloudflare 配置：

- 前端部署到 Cloudflare Pages。
- 添加 `/api/remove-background` Function。
- 配置 `REMOVEBG_API_KEY` Secret。
- 配置生产自定义域名。
- 启用 HTTPS。
- 设置安全响应头。
- 为 API 路由添加限流规则。

不需要的存储服务：

- 不需要 R2。
- 不需要 KV。
- 不需要 D1。
- MVP 不需要 Durable Objects。

## 15. 风险和应对

### 15.1 Remove.bg API 成本

风险：

- 匿名用户可能消耗大量付费 API 额度。

应对：

- 按 IP 限流。
- 限制文件大小。
- 出现滥用后加入 Turnstile。
- 追踪 API 成功率和失败率。

### 15.2 API 延迟

风险：

- 处理耗时依赖 Remove.bg 响应速度。

应对：

- 展示明确的处理中状态。
- 设置超时处理。
- 允许用户重试。

### 15.3 大图内存压力

风险：

- 大文件可能给浏览器或 Worker 内存带来压力。

应对：

- 上传限制为 10 MB。
- 客户端和服务端都做校验。
- 避免服务端图片转换。

### 15.4 SEO 竞争激烈

风险：

- 主关键词竞争非常高。

应对：

- 让工具体验足够快、足够直接。
- MVP 后增加长尾页面。
- 优先切电商商品图和白底图场景。

## 16. MVP 成功指标

上线成功：

- 网站成功部署到 Cloudflare。
- 用户可以上传图片并下载透明 PNG。
- 应用没有使用任何图片存储。
- API Key 已被安全保护。

产品成功：

- 上传到开始处理转化率超过 50%。
- 处理成功率超过 90%。
- 处理完成到下载转化率超过 60%。
- 4 到 8 周内获得目标关键词相关的自然搜索曝光。

## 17. 后续迭代

MVP 后可扩展功能：

- 批量去背景。
- 高清导出控制。
- 电商背景预设。
- Amazon、Shopify、Etsy 图片尺寸预设。
- 手动修边笔刷。
- 背景模糊。
- AI 背景生成。
- 用户账号和付费计划。
- 面向开发者的公开 API。
- 自托管背景移除模型，降低长期 API 成本。

## 18. MVP 验收清单

- [ ] 首页可在桌面和移动端正常加载。
- [ ] 用户可以上传 JPG、PNG、WebP 图片。
- [ ] 无效文件会被拒绝。
- [ ] 超大文件会被拒绝。
- [ ] Worker 可以把有效图片发送给 Remove.bg。
- [ ] 系统可以返回透明 PNG。
- [ ] 用户可以预览原图和结果图。
- [ ] 用户可以下载透明 PNG。
- [ ] 用户可以导出白底图片。
- [ ] 用户可以导出自定义纯色背景图片。
- [ ] 图片不会被本站存储。
- [ ] Remove.bg API Key 已配置为 Secret。
- [ ] API 路由已配置限流。
- [ ] 基础数据埋点已接入。
- [ ] FAQ 和隐私说明已展示。

