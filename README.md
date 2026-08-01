# fnOS 影视+音乐 一键部署脚本

> 飞牛 NAS 全自动部署：MoviePilot v2 + qBittorrent + Jellyfin + Lidarr + ChineseSubFinder + 豆瓣点播 + PT 合规，一条龙完成。

## 特性

- ✅ 自动创建目录结构（下载/媒体库/音乐）
- ✅ 自动创建共享网络 media-network 并打通容器互联
- ✅ 一键部署 5+ 容器（含国内可达镜像与 TMDB 域名）
- ✅ MoviePilot API 全自动配置（下载器/媒体服务器/目录规则/刮削/站点/豆瓣点播）
- ✅ qBittorrent PT 合规配置（关 DHT/做种 72h/队列限并发，防封号）
- ✅ 全链路自动验收 + HTML 报告
- ✅ 配置加密存储（Fernet），可安全提交 Git

## 快速开始

```bash
# 1. 复制配置模板并填写
cp config/config.example.yml config/config.yml
vim config/config.yml   # 填写密码/Cookie等

# 2. 加密敏感配置（可选但推荐）
python3 scripts/encrypt_config.py gen-key
python3 scripts/encrypt_config.py encrypt -i config/config.yml -o config/config.yml.enc

# 3. 一键部署（需 root）
sudo ./install.sh
```

## 目录结构

```
fnos-setup/
├── install.sh                  # 主安装脚本（5 阶段）
├── config/
│   ├── config.example.yml      # 配置模板（__ENCRYPTED__ 占位）
│   ├── config.yml              # 实际配置（勿提交 Git）
│   └── .secret.key             # 加密密钥（权限600，勿提交）
├── docker-compose/             # 各容器 compose 参考
├── scripts/
│   ├── config_mp_api.py        # MoviePilot API 自动配置
│   ├── config_qb_pt.py         # qBittorrent PT 合规
│   ├── encrypt_config.py       # 配置加解密工具
│   └── verify_all.py           # 全链路验收
└── docs/
    └── deploy-guide.md         # 部署指南
```

## 备份策略

- 脚本本体：GitHub 私有仓库 + NAS 本地 `/vol1/1000/docker/fnos-setup` 双备份
- 配置：`config.yml.enc` 加密后提交 Git；`config.yml` 明文仅存 NAS 本地
- 密钥：`.secret.key` 仅存 NAS 本地，**务必离线备份密钥**（丢失将无法解密）

## 服务地址

| 服务 | 地址 | 说明 |
|------|------|------|
| MoviePilot | http://NAS_IP:3000 | 影视自动化管理 |
| qBittorrent | http://NAS_IP:8080 | 下载器 |
| Jellyfin | http://NAS_IP:8096 | 媒体服务器 |
| Lidarr | http://NAS_IP:8686 | 音乐自动化 |
| ChineseSubFinder | http://NAS_IP:19035 | 字幕下载 |
| Navidrome | http://NAS_IP:4533 | 音乐流媒体（飞牛应用中心） |
