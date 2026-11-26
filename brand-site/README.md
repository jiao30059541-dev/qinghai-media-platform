# 名扬天下品牌官网

西宁名扬天下文化传媒有限公司官网，服务国贸大厦 LED 屏与恒润大厦 LED 屏的业务展示、档期查询、询盘收集和内容管理。

## 技术栈

- Next.js 15 App Router，前台 SSR/SSG，后台管理端
- TypeScript + Tailwind CSS
- Prisma + SQLite，可平滑迁移至 MySQL
- 百度统计、百度地图、百度搜索友好的 sitemap / robots / JSON-LD
- 企业微信机器人或 Resend 邮件询盘提醒

## 本地启动

```powershell
cd E:\大模型\codex\qinghai-media-platform\brand-site
npm install
Copy-Item .env.example .env
npm run db:migrate
npm run db:seed
npm run dev
```

访问 `http://localhost:3006`。后台入口为 `http://localhost:3006/admin/login`。

首次部署前需要把 `.env` 中的 `JWT_SECRET`、`ADMIN_PASSWORD_HASH`、`NEXT_PUBLIC_SITE_URL` 换成正式值。生成密码哈希：

```powershell
node -e "const bcrypt=require('bcryptjs'); console.log(bcrypt.hashSync('替换成新密码',12))"
```

bcrypt 哈希中的 `$` 需要写成 `\$`，否则 Next.js 会把它当成环境变量展开，导致密码始终验证失败。例如：

```dotenv
ADMIN_PASSWORD_HASH="\$2a\$12\$完整哈希"
```

## 环境变量

| 变量 | 用途 |
| --- | --- |
| `DATABASE_URL` | SQLite 数据库路径；生产环境建议使用绝对路径 |
| `JWT_SECRET` | 后台登录令牌签名密钥，至少 32 位随机字符串 |
| `ADMIN_EMAIL` | 后台登录邮箱 |
| `ADMIN_PASSWORD_HASH` | bcrypt 密码哈希 |
| `NEXT_PUBLIC_SITE_URL` | 对外正式域名，例如 `https://www.xnmytx.com` |
| `NEXT_PUBLIC_PHONE` | 默认招商电话 |
| `NEXT_PUBLIC_BAIDU_ANALYTICS_ID` | 百度统计站点 ID |
| `LEAD_NOTIFICATION_WEBHOOK_URL` | 企业微信机器人 Webhook |
| `RESEND_API_KEY` | Resend 邮件 API Key |
| `LEAD_NOTIFICATION_EMAIL` | 接收询盘提醒的邮箱 |
| `LEAD_NOTIFICATION_FROM` | Resend 已验证发件地址 |

企业微信机器人和 Resend 至少配置一组，客户提交表单后才会主动通知。没有配置时询盘仍会进入后台，并标记为“未配置通知”。

## 后台

后台支持：

- 询盘查看与跟进状态
- 国贸、恒润两块屏的档期维护
- 屏幕资料及图片路径
- 报价档位与展示状态
- 案例、文章、合作伙伴
- 页面 SEO 信息
- 电话、地址、百度统计、微信二维码等基础设置

图片上传接口为 `/api/admin/upload`，支持 JPG、PNG、WebP，单张不超过 3 MB。上传文件保存在 `public/uploads`，该目录不会提交到 Git，生产部署时需要持久化并单独备份。

## 数据库

正式 migration 位于 `prisma/migrations`。

```powershell
npm run db:migrate
npm run db:seed
```

需要查看数据时运行：

```powershell
npm run db:studio
```

SQLite 的 `prisma/data` 目录与 `*.db` 已排除在 Git 之外。生产环境、上传文件和 `.env` 均需要单独备份。

## 询盘通知

优先推荐企业微信机器人：

1. 在企业微信群中添加群机器人并复制 Webhook。
2. 写入 `LEAD_NOTIFICATION_WEBHOOK_URL`。
3. 重启进程后提交一条测试询盘。
4. 在 `/admin/leads` 检查记录及 `notificationStatus`。

如使用 Resend，需要配置已验证域名下的发件地址和接收邮箱。

## 百度统计与地图

在百度统计创建站点后，把站点 ID 填入后台“网站设置”或 `NEXT_PUBLIC_BAIDU_ANALYTICS_ID`。没有 ID 时页面不会加载统计脚本。

地图使用百度地图地址检索嵌入。上线后需要分别检查国贸大厦屏与恒润大厦屏地址的定位是否准确，必要时在后台修改屏幕地址。

## 生产部署

建议独立 PM2 进程，不覆盖现有 `qhqmt.cn` 与 `qinghai-media` 服务：

```bash
cd /var/www/xnmytx-brand
npm ci
npx prisma generate
npm run db:migrate
npm run db:seed
npm run build
pm2 start npm --name xnmytx-brand -- run start
pm2 save
```

Nginx 将 `www.xnmytx.com` 与裸域名代理到 `127.0.0.1:3006`，保留 `/var/www/xnmytx-site` 旧站文件用于回滚。

## 上线检查

- 确认 `NEXT_PUBLIC_SITE_URL` 已是 `https://www.xnmytx.com`
- 用正式账号登录后台并修改初始密码
- 配置询盘通知并提交测试询盘
- 填入百度统计 ID，确认实时访客可见
- 检查两块屏的百度地图定位
- 上传真实微信二维码
- 检查 `/sitemap.xml`、`/robots.txt` 与页面 canonical
- 在百度搜索资源平台提交 sitemap
- 检查 404、旧路径 301、手机端导航和表单
- 备份 `.env`、SQLite 数据库和 `public/uploads`
