#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
fnOS 一键部署 - MoviePilot API 自动配置脚本
固化此前全部实战经验:
- 登录: OAuth2PasswordRequestForm (x-www-form-urlencoded)
- 配置写入: POST body 必须用纯数组(不要嵌套 {"value": [...]})
- 网络: qbittorrent 用 host-gateway 容器名直连; Jellyfin 用 API Key 认证
- TMDB: api.tmdb.org (国内可达)
- 目录: 4 分类 软链接整理
- 豆瓣点播: DoubanSync 插件

用法:
  python3 config_mp_api.py --host 127.0.0.1 --user admin --pass xxx \
      --qb-host http://qbittorrent:8080/ --qb-user admin --qb-pass xxx \
      --jf-host http://jellyfin:8096/ --jf-key xxxx --zmpt-cookie xxxx
"""
import argparse
import json
import sys
import time
import requests

session = requests.Session()
session.trust_env = False  # 关键: 禁用本机代理，避免内网超时
TIMEOUT = 20

def log(msg):
    print(f"[config_mp_api] {msg}", flush=True)

def login(host, user, pwd):
    url = f"http://{host}:3000/api/v1/login/access-token"
    for i in range(12):
        try:
            r = session.post(url, data=f"username={user}&password={pwd}",
                             headers={'Content-Type': 'application/x-www-form-urlencoded'},
                             timeout=TIMEOUT)
            if r.status_code == 200:
                token = r.json().get('access_token')
                log(f"登录成功 (第{i+1}次尝试)")
                return token
            log(f"登录返回 {r.status_code}: {r.text[:120]}")
        except Exception as ex:
            log(f"登录异常(重试{i+1}): {ex}")
        time.sleep(5)
    return None

def api_get(host, token, path, params=None):
    r = session.get(f"http://{host}:3000/api/v1{path}",
                    headers={'Authorization': f'Bearer {token}'},
                    params=params, timeout=TIMEOUT)
    return r

def api_put(host, token, path, body):
    r = session.put(f"http://{host}:3000/api/v1{path}",
                    headers={'Authorization': f'Bearer {token}', 'Content-Type': 'application/json'},
                    json=body, timeout=TIMEOUT)
    return r

def api_post(host, token, path, body):
    r = session.post(f"http://{host}:3000/api/v1{path}",
                     headers={'Authorization': f'Bearer {token}', 'Content-Type': 'application/json'},
                     json=body, timeout=TIMEOUT)
    return r

def configure_downloader(host, token, qb_host, qb_user, qb_pass):
    """配置下载器 - 关键: body 传纯数组"""
    log("配置下载器 qBittorrent...")
    downloaders = [{
        "name": "qBittorrent",
        "type": "qbittorrent",
        "enabled": True,
        "host": qb_host or "http://qbittorrent:8080/",
        "username": qb_user or "admin",
        "password": qb_pass or "",
        "priority": 1,
        "test": False
    }]
    r = api_post(host, token, "/system/setting/Downloaders", downloaders)
    log(f"  Downloaders: {r.status_code} {r.text[:200]}")
    # 测试连接
    r2 = api_get(host, token, "/download/test", params={"host": downloaders[0]['host']})
    log(f"  连接测试: {r2.status_code} {r2.text[:200]}")
    return r.status_code in (200, 201)

def configure_mediaserver(host, token, jf_host, jf_key):
    """配置媒体服务器 - 用 API Key 认证"""
    log("配置媒体服务器 Jellyfin...")
    servers = [{
        "name": "jellyfin",
        "type": "jellyfin",
        "enabled": True,
        "host": jf_host or "http://jellyfin:8096/",
        "api_key": jf_key or "",
        "priority": 1,
        "test": False
    }]
    r = api_post(host, token, "/system/setting/MediaServers", servers)
    log(f"  MediaServers: {r.status_code} {r.text[:200]}")
    return r.status_code in (200, 201)

def configure_directories(host, token):
    """配置目录规则 - 4分类 软链接"""
    log("配置目录规则 (4分类 软链接)...")
    dirs = {
        "movie": [
            {"category": "华语电影", "path": "/media/link/电影/华语电影"},
            {"category": "外语电影", "path": "/media/link/电影/外语电影"},
        ],
        "tv": [
            {"category": "国产剧", "path": "/media/link/电视剧/国产剧"},
            {"category": "欧美剧", "path": "/media/link/电视剧/欧美剧"},
        ],
        "anime": [],
        "music": []
    }
    r = api_put(host, token, "/system/setting/Directories", dirs)
    log(f"  Directories: {r.status_code} {r.text[:200]}")
    return r.status_code in (200, 201)

def configure_scraper(host, token):
    """配置刮削"""
    log("配置刮削 (NFO+海报+背景)...")
    scraper = {
        "nfo": True, "poster": True, "backdrop": True,
        "language": "zh-CN", "tmdb_domain": "api.tmdb.org"
    }
    r = api_put(host, token, "/system/setting/Scraper", scraper)
    log(f"  Scraper: {r.status_code} {r.text[:200]}")
    return r.status_code in (200, 201)

def configure_sites(host, token, zmpt_cookie):
    """配置织梦站点 cookie"""
    log("配置站点 (织梦)...")
    if not zmpt_cookie or zmpt_cookie == "__ENCRYPTED__":
        log("  未提供 cookie，跳过站点配置")
        return True
    site = {
        "name": "zmpt",
        "url": "https://zmpt.cc",
        "cookie": zmpt_cookie,
        "enabled": True
    }
    r = api_post(host, token, "/site/", site)
    log(f"  Site: {r.status_code} {r.text[:200]}")
    return r.status_code in (200, 201)

def configure_douban(host, token, user_id):
    """配置豆瓣点播插件"""
    log("配置豆瓣点播 (DoubanSync)...")
    if not user_id:
        log("  未提供豆瓣用户ID，跳过")
        return True
    plugin_cfg = {
        "onlyonce": False,
        "cron": "30 0 * * *",
        "user_id": user_id,
        "days": 365,
        "search_download": True,
        "enabled": True
    }
    try:
        r = session.put(f"http://{host}:3000/api/v1/plugin/DoubanSync",
                        headers={'Authorization': f'Bearer {token}', 'Content-Type': 'application/json'},
                        json=plugin_cfg, timeout=TIMEOUT)
        log(f"  DoubanSync: {r.status_code} {r.text[:200]}")
    except Exception as ex:
        log(f"  DoubanSync 异常: {ex}")
    return True

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--host', default='127.0.0.1')
    ap.add_argument('--user', default='admin')
    ap.add_argument('--pass', dest='pwd', default='')
    ap.add_argument('--qb-host', default='http://qbittorrent:8080/')
    ap.add_argument('--qb-user', default='admin')
    ap.add_argument('--qb-pass', default='')
    ap.add_argument('--jf-host', default='http://jellyfin:8096/')
    ap.add_argument('--jf-key', default='')
    ap.add_argument('--zmpt-cookie', default='')
    ap.add_argument('--douban-user', default='276778617')
    args = ap.parse_args()

    token = login(args.host, args.user, args.pwd)
    if not token:
        log("❌ 登录失败，无法配置")
        sys.exit(1)

    results = {
        "downloader": configure_downloader(args.host, token, args.qb_host, args.qb_user, args.qb_pass),
        "mediaserver": configure_mediaserver(args.host, token, args.jf_host, args.jf_key),
        "directories": configure_directories(args.host, token),
        "scraper": configure_scraper(args.host, token),
        "sites": configure_sites(args.host, token, args.zmpt_cookie),
        "douban": configure_douban(args.host, token, args.douban_user),
    }
    log("配置结果汇总:")
    for k, v in results.items():
        log(f"  {k}: {'✅' if v else '❌'}")

if __name__ == '__main__':
    main()
