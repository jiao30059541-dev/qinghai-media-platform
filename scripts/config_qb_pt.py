#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
fnOS 一键部署 - qBittorrent PT 合规配置
按织梦(zmpt.cc)站点规则配置，防封号:
- 关闭 DHT / LSD / PEX (PT 站禁止 P2P 泄露)
- 关闭做种时间/分享率限制 (满足 H&R 14天做种72小时要求)
- 启用队列限制 (控制并发，避免异常)
- 加密传输 prefer

用法: python3 config_qb_pt.py --host 10.0.0.8 --user admin --pass xxx
"""
import argparse
import requests

session = requests.Session()
session.trust_env = False

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--host', default='10.0.0.8')
    ap.add_argument('--port', default='8080')
    ap.add_argument('--user', default='admin')
    ap.add_argument('--pass', dest='pwd', default='adminadmin')
    args = ap.parse_args()

    base = f"http://{args.host}:{args.port}/api/v2"
    # 登录
    r = session.post(f"{base}/auth/login",
                     data=f"username={args.user}&password={args.pwd}", timeout=15)
    if r.text != "Ok.":
        print(f"❌ qBittorrent 登录失败: {r.text}")
        return

    prefs = {
        "dht": "false",                    # 关闭 DHT
        "lsd": "false",                    # 关闭 LSD
        "pex": "false",                    # 关闭 PEX
        "max_ratio_enabled": "false",      # 关闭分享率限制(做种72h优先)
        "max_seeding_time_enabled": "false", # 关闭做种时间限制
        "queueing_enabled": "true",        # 启用队列
        "max_active_downloads": "2",       # 最大同时下载
        "max_active_torrents": "6",        # 最大活跃种子
        "max_active_uploads": "4",         # 最大同时上传
        "encryption": "1",                 # 加密 prefer
        "anonymous_mode": "false",
        "enable_upload_speed_limit": "false",
        "enable_download_speed_limit": "false",
    }
    # 使用 qBittorrent v5 的 /preferences/set
    r = session.post(f"{base}/app/setPreferences", data=prefs, timeout=15)
    print(f"✅ 设置应用: HTTP {r.status_code}")

    # 验证
    r = session.get(f"{base}/app/preferences", timeout=15)
    if r.status_code == 200:
        p = r.json()
        checks = {
            "DHT 关闭": p.get("dht") is False,
            "LSD 关闭": p.get("lsd") is False,
            "PEX 关闭": p.get("pex") is False,
            "做种时间限制关闭": p.get("max_seeding_time_enabled") is False,
            "分享率限制关闭": p.get("max_ratio_enabled") is False,
            "队列启用": p.get("queueing_enabled") is True,
        }
        for name, ok in checks.items():
            print(f"  {'✅' if ok else '❌'} {name}")
    print("✅ PT 合规配置完成")

if __name__ == '__main__':
    main()
