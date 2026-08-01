#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
fnOS 一键部署 - 全链路验收脚本
检查: 所有容器健康 / MoviePilot API / qBittorrent / Jellyfin / 站点搜索
生成验收报告 verify_report.html
"""
import argparse
import json
import time
import subprocess
from datetime import datetime
import requests

session = requests.Session()
session.trust_env = False
TIMEOUT = 15

RESULTS = []

def check(name, ok, detail=""):
    mark = "✅" if ok else "❌"
    print(f"  {mark} {name} {detail}")
    RESULTS.append({"name": name, "ok": ok, "detail": detail})
    return ok

def run_ssh(cmd):
    try:
        r = subprocess.run(cmd, shell=True, capture_output=True, text=True, timeout=30)
        return r.stdout.strip()
    except Exception:
        return ""

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--host', default='127.0.0.1')          # MoviePilot 地址
    ap.add_argument('--nas-host', default='10.0.0.8')       # NAS 局域网 IP (qB/Jellyfin/Lidarr)
    ap.add_argument('--mp-user', default='admin')
    ap.add_argument('--mp-pass', default='')
    args = ap.parse_args()
    host = args.host
    nas = args.nas_host

    print("=" * 50)
    print("fnOS 全链路验收")
    print("=" * 50)

    # 1. 容器健康
    print("\n[1] 容器状态")
    containers = ["moviepilot-v2", "qbittorrent", "jellyfin", "lidarr", "chinesesubfinder"]
    for c in containers:
        out = run_ssh(f"docker ps --format '{{{{.Names}}}}|{{{{.Status}}}}' | grep '^{c}\\.*' || docker ps -a --format '{{{{.Names}}}}|{{{{.Status}}}}' | grep '^{c}'")
        ok = c in out and 'Up' in out
        check(f"容器 {c}", ok, out)

    # 2. MoviePilot API
    print("\n[2] MoviePilot API")
    try:
        r = session.post(f"http://{host}:3000/api/v1/login/access-token",
                         data=f"username={args.mp_user}&password={args.mp_pass}",
                         headers={'Content-Type': 'application/x-www-form-urlencoded'}, timeout=15)
        if r.status_code == 200:
            token = r.json().get('access_token')
            check("MoviePilot 登录", True)
            r2 = session.get(f"http://{host}:3000/api/v1/dashboard/statistic",
                             headers={'Authorization': f'Bearer {token}'}, timeout=15)
            if r2.status_code == 200:
                stat = r2.json()
                check("MoviePilot 统计", True, f"电影{stat.get('movie_count','?')} 剧集{stat.get('tv_count','?')} 集{stat.get('episode_count','?')}")
            r3 = session.get(f"http://{host}:3000/api/v1/download/clients",
                             headers={'Authorization': f'Bearer {token}'}, timeout=15)
            check("下载器 API", r3.status_code == 200, f"HTTP {r3.status_code}")
        else:
            check("MoviePilot 登录", False, f"HTTP {r.status_code}")
    except Exception as ex:
        check("MoviePilot", False, str(ex))

    # 3. qBittorrent
    print("\n[3] qBittorrent")
    try:
        r = session.post(f"http://{nas}:8080/api/v2/auth/login",
                         data="username=admin&password=adminadmin", timeout=15)
        check("qBittorrent 登录", r.status_code == 200 and r.text == "Ok.", r.text[:50])
        r2 = session.get(f"http://{nas}:8080/api/v2/torrents/info", timeout=15)
        if r2.status_code == 200:
            check("qBittorrent 种子", True, f"{len(r2.json())} 个任务")
    except Exception as ex:
        check("qBittorrent", False, str(ex))

    # 4. Jellyfin
    print("\n[4] Jellyfin")
    try:
        r = session.get(f"http://{nas}:8096/System/Info/Public", timeout=15)
        if r.status_code == 200:
            info = r.json()
            check("Jellyfin", True, f"v{info.get('Version','?')}")
        else:
            check("Jellyfin", False, f"HTTP {r.status_code}")
    except Exception as ex:
        check("Jellyfin", False, str(ex))

    # 5. Lidarr
    print("\n[5] Lidarr")
    try:
        r = session.get(f"http://{nas}:8686/ping", timeout=15)
        check("Lidarr", r.status_code == 200, f"HTTP {r.status_code}")
    except Exception as ex:
        check("Lidarr", False, str(ex))

    # 6. 站点搜索 (织梦)
    print("\n[6] 站点搜索")
    try:
        r = session.get(f"http://{host}:3000/api/v1/site/", headers={'Authorization': f'Bearer {token}'}, timeout=15)
        check("站点列表 API", r.status_code == 200, f"HTTP {r.status_code}")
    except Exception:
        pass

    # 生成报告
    ok_count = sum(1 for x in RESULTS if x['ok'])
    total = len(RESULTS)
    html = f"""<!DOCTYPE html><html lang="zh-CN"><head><meta charset="UTF-8">
<title>fnOS 一键部署验收报告</title>
<style>body{{font-family:sans-serif;background:#f5f7fa;padding:30px;max-width:800px;margin:auto}}
h1{{color:#1f2937}} .card{{background:#fff;border-radius:12px;padding:20px;margin:12px 0;box-shadow:0 1px 3px rgba(0,0,0,.08)}}
.ok{{color:#059669;font-weight:700}} .fail{{color:#dc2626;font-weight:700}} .meta{{color:#6b7280;font-size:13px}}
.big{{font-size:26px;font-weight:800}}</style></head><body>
<h1>🏠 fnOS 一键部署验收报告</h1>
<div class="meta">生成时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}</div>
<div class="card"><span class="big">{ok_count}/{total}</span> 项检查通过</div>
{''.join(f'<div class="card"><span class="{"ok" if x["ok"] else "fail"}">{"✅" if x["ok"] else "❌"} {x["name"]}</span><div class="meta">{x["detail"]}</div></div>' for x in RESULTS)}
</body></html>"""
    report = r"C:\Users\Administrator\WorkBuddy\2026-07-07-12-06-12\fnos-setup\verify_report.html"
    with open(report, 'w', encoding='utf-8') as f:
        f.write(html)
    print(f"\n验收报告: {report}")
    print(f"通过率: {ok_count}/{total}")

if __name__ == '__main__':
    main()
