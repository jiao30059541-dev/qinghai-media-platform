#!/usr/bin/env bash
# =============================================================================
# fnOS 影视+音乐 全自动部署脚本 (一键一条龙)
# 版本: 1.0.0 | 日期: 2026-08-01
# 功能: 目录创建 -> 网络打通 -> 容器部署 -> API 自动配置 -> 全链路验收
# 用法: sudo ./install.sh
# =============================================================================
set -euo pipefail

# ---------------- 配置加载 ----------------
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONFIG_FILE="${SCRIPT_DIR}/config/config.yml"
COMPOSE_DIR="${SCRIPT_DIR}/docker-compose"
LOG_FILE="${SCRIPT_DIR}/install.log"

# 颜色
GREEN='\033[0;32m'; RED='\033[0;31m'; YELLOW='\033[1;33m'; CYAN='\033[0;36m'; NC='\033[0m'
ok()   { echo -e "${GREEN}✅ $1${NC}"; }
info() { echo -e "${CYAN}ℹ️  $1${NC}"; }
warn() { echo -e "${YELLOW}⚠️  $1${NC}"; }
fail() { echo -e "${RED}❌ $1${NC}"; exit 1; }

# ---------------- 工具函数 ----------------
parse_yml() { # parse_yml key -> value (简单解析，支持 key: value 与嵌套 key: value)
  local key="$1" cur="" val=""
  while IFS= read -r line; do
    line="${line%%#*}" # 去注释
    [[ -z "${line// /}" ]] && continue
    local indent=$(( $(echo "$line" | grep -oP '^\s*' | wc -c) - 1 ))
    local trimmed="${line#"${line%%[![:space:]]*}"}"
    if [[ "$trimmed" != *":"* ]]; then continue; fi
    local k="${trimmed%%:*}" v="${trimmed#*: }"
    if [[ -z "$v" ]]; then cur="${indent}:${k}"; else
      [[ "$cur" == "2:${key}" ]] && { echo "$v"; return; }
    fi
  done < "$CONFIG_FILE"
  echo ""
}

get_val() { # 支持 config.yml 中 "2:key" 层级的取值
  local section="$1" key="$2"
  local in_section=0
  while IFS= read -r line; do
    line="${line%%#*}"
    [[ -z "${line// /}" ]] && continue
    local indent=$(( $(echo "$line" | grep -oP '^\s*' | wc -c) - 1 ))
    local trimmed="${line#"${line%%[![:space:]]*}"}"
    if [[ "$trimmed" != *":"* ]]; then continue; fi
    local k="${trimmed%%:*}" v="${trimmed#*: }"
    if [[ $indent -eq 0 ]]; then
      in_section=0
      [[ "$k" == "$section" ]] && in_section=1
      continue
    fi
    if [[ $in_section -eq 1 && "$k" == "$key" ]]; then echo "$v"; return; fi
  done < "$CONFIG_FILE"
}

# ---------------- 阶段 0: 环境检测 ----------------
banner() {
  echo "============================================================"
  echo "  fnOS 影视+音乐 全自动部署脚本 v1.0.0"
  echo "============================================================"
}
banner

# 检查 root
[[ $EUID -ne 0 ]] && { warn "建议以 root 运行 (sudo ./install.sh)"; }

# 检查 docker
command -v docker >/dev/null 2>&1 || fail "未检测到 Docker，请先在飞牛应用中心安装 Docker"
docker info >/dev/null 2>&1 || fail "Docker 未运行"
ok "Docker 就绪: $(docker version --format '{{.Server.Version}}')"

# 检查配置文件
[[ -f "$CONFIG_FILE" ]] || fail "配置文件不存在: $CONFIG_FILE (请先复制 config/config.example.yml 并填写)"
info "配置文件: $CONFIG_FILE"

# ---------------- 阶段 1: 目录创建 ----------------
phase_dirs() {
  info "阶段 1/5: 创建目录结构"
  local base="/vol1/1000"
  # 支持配置覆盖
  local cfg_base=$(get_val paths base_dir)
  [[ -n "$cfg_base" ]] && base="$cfg_base"

  mkdir -p "${base}"/docker/{moviepilot-v2,qbittorrent,jellyfin,lidarr,chinesesubfinder,iyuu}
  mkdir -p "${base}"/media/{downloads,link}
  mkdir -p "${base}"/media/downloads/{华语电影,外语电影,国产剧,欧美剧,音乐}
  mkdir -p "${base}"/media/link/{电影,电视剧,音乐}
  mkdir -p "${base}"/music/{下载中,音乐库}
  chmod -R 777 "${base}"/media "${base}"/music 2>/dev/null || true
  ok "目录结构创建完成: ${base}"
}

# ---------------- 阶段 2: 网络 ----------------
phase_network() {
  info "阶段 2/5: 创建共享网络 media-network"
  if ! docker network inspect media-network >/dev/null 2>&1; then
    docker network create media-network 2>/dev/null && ok "media-network 已创建" || warn "网络创建失败(可能已存在)"
  else
    ok "media-network 已存在"
  fi
}

# ---------------- 阶段 3: 容器部署 ----------------
phase_containers() {
  info "阶段 3/5: 部署 Docker 容器"
  local SUPERUSER=$(get_val moviepilot username)
  local SUPERPWD=$(get_val moviepilot password)
  [[ -z "$SUPERUSER" ]] && SUPERUSER="admin"
  [[ -z "$SUPERPWD" ]] && SUPERPWD="$(openssl rand -base64 12 2>/dev/null || echo 'MoviePilot123!')"

  # 3.1 qBittorrent
  if ! docker ps -a --format '{{.Names}}' | grep -q '^qbittorrent$'; then
    info "  - 部署 qBittorrent"
    docker run -d --name qbittorrent --restart=always --network=host \
      -e PUID=0 -e PGID=0 -e TZ=Asia/Shanghai \
      -e WEBUI_PORT=8080 -e BT_PORT=6881 \
      -v "${BASE_VOL}/docker/qbittorrent:/config" \
      -v "${BASE_VOL}/media/downloads:/downloads" \
      lscr.io/linuxserver/qbittorrent:latest
  else
    ok "  qBittorrent 已存在"
  fi

  # 3.2 Jellyfin
  if ! docker ps -a --format '{{.Names}}' | grep -q '^jellyfin$'; then
    info "  - 部署 Jellyfin"
    docker run -d --name jellyfin --restart=always --network=media-network \
      -p 8096:8096 \
      -e PUID=0 -e PGID=0 -e TZ=Asia/Shanghai \
      -v "${BASE_VOL}/docker/jellyfin:/config" \
      -v "${BASE_VOL}/media/link:/media" \
      -v "${BASE_VOL}/music:/music" \
      nyanmisaka/jellyfin:latest
  else
    ok "  Jellyfin 已存在"
  fi

  # 3.3 MoviePilot v2
  if ! docker ps -a --format '{{.Names}}' | grep -q '^moviepilot-v2$'; then
    info "  - 部署 MoviePilot v2"
    docker run -d --name moviepilot-v2 --hostname moviepilot-v2 \
      --restart=always --network=bridge \
      -p 3000:3000 -p 3001:3001 \
      --add-host=qbittorrent:host-gateway \
      --add-host=host.docker.internal:host-gateway \
      -v "${BASE_VOL}/docker/moviepilot-v2:/config" \
      -v "${BASE_VOL}/media:/media" \
      -v /var/run/docker.sock:/var/run/docker.sock:ro \
      -e NGINX_PORT=3000 -e PORT=3001 -e PUID=0 -e PGID=0 -e UMASK=000 \
      -e TZ=Asia/Shanghai \
      -e SUPERUSER="${SUPERUSER}" -e SUPERUSER_PASSWORD="${SUPERPWD}" \
      -e MOVIEPILOT_AUTO_UPDATE=none \
      -e TMDB_API_DOMAIN=api.tmdb.org \
      -e COOKIECLOUD_HOST= -e COOKIECLOUD_KEY= -e COOKIECLOUD_PASSWORD= \
      jxxghp/moviepilot-v2:latest
    echo "⚠️  MoviePilot 初始账号: ${SUPERUSER} / ${SUPERPWD} (请登录后修改)" | tee -a "$LOG_FILE"
  else
    ok "  MoviePilot v2 已存在"
  fi

  # 3.4 ChineseSubFinder
  if ! docker ps -a --format '{{.Names}}' | grep -q '^chinesesubfinder$'; then
    info "  - 部署 ChineseSubFinder"
    docker run -d --name chinesesubfinder --restart=always --network=media-network \
      -p 19035:19035 \
      -e PUID=0 -e PGID=0 -e TZ=Asia/Shanghai \
      -v "${BASE_VOL}/docker/chinesesubfinder:/config" \
      -v "${BASE_VOL}/media:/media" \
      allanpk716/chinesesubfinder:latest
  else
    ok "  ChineseSubFinder 已存在"
  fi

  # 3.5 Lidarr (音乐自动化)
  if ! docker ps -a --format '{{.Names}}' | grep -q '^lidarr$'; then
    info "  - 部署 Lidarr (音乐)"
    docker run -d --name lidarr --restart=always --network=media-network \
      -p 8686:8686 \
      -e PUID=0 -e PGID=0 -e TZ=Asia/Shanghai \
      -v "${BASE_VOL}/docker/lidarr:/config" \
      -v "${BASE_VOL}/music/下载中:/downloads" \
      -v "${BASE_VOL}/music/音乐库:/music" \
      lscr.io/linuxserver/lidarr:latest
  else
    ok "  Lidarr 已存在"
  fi

  ok "容器部署完成，等待启动..."
  sleep 20
}

# ---------------- 阶段 4: API 自动配置 ----------------
phase_config() {
  info "阶段 4/5: API 自动配置 (MoviePilot)"
  local MP_HOST=$(get_val moviepilot host); [[ -z "$MP_HOST" ]] && MP_HOST="127.0.0.1"
  local SUPERUSER=$(get_val moviepilot username); [[ -z "$SUPERUSER" ]] && SUPERUSER="admin"
  local SUPERPWD=$(get_val moviepilot password)
  local QB_HOST=$(get_val downloader host);   [[ -z "$QB_HOST" ]] && QB_HOST="http://qbittorrent:8080/"
  local QB_USER=$(get_val downloader username); [[ -z "$QB_USER" ]] && QB_USER="admin"
  local QB_PWD=$(get_val downloader password)
  local JF_HOST=$(get_val mediaserver host);  [[ -z "$JF_HOST" ]] && JF_HOST="http://jellyfin:8096/"
  local JF_KEY=$(get_val mediaserver apikey)
  local ZMPT_COOKIE=$(get_val sites zmpt_cookie)

  # 等待 MoviePilot 就绪
  for i in $(seq 1 60); do
    if curl -sf "http://${MP_HOST}:3000/api/v1/system/env" >/dev/null 2>&1; then break; fi
    sleep 5
    [[ $i -eq 60 ]] && warn "MoviePilot 60次尝试后未就绪，跳过 API 配置"
  done

  # 调用 Python 配置脚本
  # 多站点: 从 config.yml 提取所有站点 cookie (sites 列表)
  local EXTRA_SITES=""
  # 简单解析: 收集所有 name/url/cookie 三元组 (每站点一块)
  python3 - "$CONFIG_FILE" << 'PYEOF' > /tmp/extra_sites.json 2>/dev/null || true
import sys, re, json, yaml
try:
    with open(sys.argv[1], encoding='utf-8') as f:
        cfg = yaml.safe_load(f)
    sites = cfg.get('sites', [])
    extras = []
    for s in sites:
        if s.get('name', '') != 'zmpt' and s.get('cookie') and s.get('cookie') != '__ENCRYPTED__':
            extras.append({'name': s['name'], 'url': s.get('url',''), 'cookie': s['cookie']})
    print(json.dumps(extras, ensure_ascii=False))
except Exception:
    print('[]')
PYEOF
  if [[ -s /tmp/extra_sites.json ]] && grep -q '^\[' /tmp/extra_sites.json; then
    EXTRA_SITES=$(cat /tmp/extra_sites.json)
  fi

  python3 "${SCRIPT_DIR}/scripts/config_mp_api.py" \
    --host "${MP_HOST}" --user "${SUPERUSER}" --pass "${SUPERPWD}" \
    --qb-host "${QB_HOST}" --qb-user "${QB_USER}" --qb-pass "${QB_PWD}" \
    --jf-host "${JF_HOST}" --jf-key "${JF_KEY}" \
    --extra-sites "${EXTRA_SITES}" \
    --zmpt-cookie "${ZMPT_COOKIE}" || warn "API 配置脚本执行异常"
}

# ---------------- 阶段 5: 验收 ----------------
phase_verify() {
  info "阶段 5/5: 全链路验收"
  python3 "${SCRIPT_DIR}/scripts/verify_all.py" --host 127.0.0.1 || warn "验收脚本执行异常"
}

# ---------------- 主流程 ----------------
BASE_VOL=$(get_val paths base_dir); [[ -z "$BASE_VOL" ]] && BASE_VOL="/vol1/1000"

phase_dirs
phase_network
phase_containers
phase_config
phase_verify

echo ""
echo "============================================================"
echo "  🎉 部署完成！服务访问地址："
echo "  MoviePilot:   http://NAS_IP:3000"
echo "  qBittorrent:  http://NAS_IP:8080"
echo "  Jellyfin:     http://NAS_IP:8096"
echo "  Lidarr:       http://NAS_IP:8686"
echo "  ChineseSub:   http://NAS_IP:19035"
echo "============================================================"
