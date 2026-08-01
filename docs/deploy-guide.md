# fnOS 影视+音乐 一键部署指南

## 一、部署前准备

### 1.1 前置条件
- 飞牛 fnOS 已安装并配置好存储卷（本文以 `/vol1/1000` 为数据卷）
- Docker 已启用（飞牛应用中心 → Docker）
- 已准备好 PT 站点（织梦 zmpt.cc）Cookie
- 已准备好豆瓣账号（想看列表用于点播下载）

### 1.2 配置填写

```bash
cp config/config.example.yml config/config.yml
vim config/config.yml
```

需要填写的关键项：

| 配置项 | 说明 | 获取方式 |
|--------|------|---------|
| `moviepilot.password` | MoviePilot 管理员密码 | 自定义 |
| `downloader.password` | qBittorrent 密码 | 自定义 |
| `mediaserver.apikey` | Jellyfin API Key | Jellyfin → 设置 → API 密钥 |
| `sites[0].cookie` | 织梦站点 Cookie | 浏览器登录 zmpt.cc → F12 → 复制 |
| `douban.user_id` | 豆瓣用户 ID | 豆瓣个人主页 URL 中的数字 |

### 1.3 配置加密（推荐）

```bash
# 生成密钥（务必离线备份密钥！）
python3 scripts/encrypt_config.py gen-key

# 加密配置（生成 config.yml.enc，可提交 Git）
python3 scripts/encrypt_config.py encrypt -i config/config.yml -o config/config.yml.enc

# 部署时解密
python3 scripts/encrypt_config.py decrypt -i config/config.yml.enc -o config/config.yml
```

## 二、执行部署

```bash
sudo ./install.sh
```

脚本自动完成 5 个阶段：
1. **目录创建**：下载/媒体库/音乐目录 + 权限
2. **网络打通**：media-network 共享网络
3. **容器部署**：MoviePilot v2 / qBittorrent / Jellyfin / Lidarr / ChineseSubFinder
4. **API 配置**：下载器/媒体服务器/目录规则/刮削/站点/豆瓣点播
5. **全链路验收**：连通性检查 + HTML 报告

## 三、部署后配置

### 3.1 MoviePilot 首次登录
- 地址：`http://NAS_IP:3000`
- 账号：配置中的 `username` / `password`
- 首次登录后建议立即修改密码

### 3.2 Jellyfin 初始化
- 地址：`http://NAS_IP:8096`
- 首次打开按向导设置管理员
- 在「设置 → API 密钥」生成 Key 填回配置

### 3.3 音乐系统（Navidrome）
- 飞牛应用中心安装 Navidrome（或复用本脚本生成的目录）
- 音乐库路径指向 `/vol2/1000/music/音乐库`
- 手机端配合「音流」App 播放

## 四、备份策略

| 备份对象 | 方式 | 位置 |
|---------|------|------|
| 部署脚本 | Git 私有仓库 + NAS 本地 | GitHub + `/vol1/1000/docker/fnos-setup` |
| 加密配置 | Git（config.yml.enc） | GitHub 私有仓库 |
| 解密密钥 | 离线备份 | USB/密码管理器（⚠️ 丢失无法解密） |
| 明文配置 | NAS 本地 | `/vol1/1000/docker/fnos-setup/config/config.yml` |

## 五、常见问题

### Q: 镜像拉取慢/失败？
- qBittorrent/Jellyfin 等 LinuxServer 镜像使用 lscr.io 直连（NAS 可达）
- 可配置 registry-mirrors：`/etc/docker/daemon.json` 添加国内加速源

### Q: MoviePilot 自动升级卡死？
脚本已内置 `MOVIEPILOT_AUTO_UPDATE=none` 禁用自动升级。
如需升级：手动 `docker pull jxxghp/moviepilot-v2:latest` 后重建容器。

### Q: TMDB 无法连接？
脚本已内置 `TMDB_API_DOMAIN=api.tmdb.org`（国内可达）。

### Q: PT 站点搜索无结果？
- 确认站点 Cookie 有效（Web UI → 站点管理 → 测试）
- Cookie 失效需重新获取并更新

### Q: 如何补充备援 PT 站点？
编辑 `config.yml` → `sites` 列表追加新站点（如 pttime），填写 Cookie 后重跑：
```bash
python3 scripts/config_mp_api.py --zmpt-cookie "..." 
```
或直接在 MoviePilot Web UI 中添加。
