#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
fnOS 一键部署 - 配置加密/解密工具 (整文件加密)
使用 Fernet 对称加密整个配置文件，简单可靠。
密钥文件: config/.secret.key (自动生成, 权限600, 备份至 NAS 本地)

用法:
  python3 encrypt_config.py gen-key                                    # 生成密钥
  python3 encrypt_config.py encrypt -i config.yml -o config.yml.enc    # 加密整个配置
  python3 encrypt_config.py decrypt -i config.yml.enc -o config.yml    # 解密还原
  python3 encrypt_config.py show -i config.yml.enc                     # 脱敏显示
"""
import os
import sys
import argparse
from pathlib import Path
from cryptography.fernet import Fernet

SCRIPT_DIR = Path(__file__).resolve().parent.parent
KEY_FILE = SCRIPT_DIR / "config" / ".secret.key"

def load_key() -> bytes:
    if not KEY_FILE.exists():
        print(f"[!] 密钥文件不存在: {KEY_FILE}，请先执行 gen-key", file=sys.stderr)
        sys.exit(1)
    return KEY_FILE.read_text().strip().encode()

def gen_key():
    key = Fernet.generate_key()
    KEY_FILE.parent.mkdir(parents=True, exist_ok=True)
    KEY_FILE.write_text(key.decode())
    try:
        os.chmod(KEY_FILE, 0o600)
    except Exception:
        pass
    print(f"[+] 密钥已生成: {KEY_FILE}")
    print(f"[+] 密钥内容(请离线备份!丢失将无法解密): {key.decode()}")

def encrypt_file(in_path: Path, out_path: Path):
    f = Fernet(load_key())
    data = in_path.read_bytes()
    token = f.encrypt(data).decode()
    out_path.write_text(token, encoding='utf-8')
    print(f"[+] 加密完成: {in_path.name} -> {out_path.name} ({len(data)} bytes -> {len(token)} chars)")
    print(f"[!] {out_path.name} 可安全提交至 Git；密钥 .secret.key 严禁提交")

def decrypt_file(in_path: Path, out_path: Path):
    f = Fernet(load_key())
    token = in_path.read_text(encoding='utf-8').strip()
    try:
        data = f.decrypt(token.encode())
    except Exception as ex:
        print(f"[!] 解密失败: {ex} (密钥不匹配或文件损坏)", file=sys.stderr)
        sys.exit(1)
    out_path.write_bytes(data)
    print(f"[+] 解密完成: {in_path.name} -> {out_path.name} ({len(data)} bytes)")

def show_config(in_path: Path):
    f = Fernet(load_key())
    token = in_path.read_text(encoding='utf-8').strip()
    try:
        data = f.decrypt(token.encode()).decode('utf-8')
    except Exception as ex:
        print(f"[!] 解密失败: {ex}", file=sys.stderr)
        return
    for line in data.splitlines():
        s = line.strip()
        low = line.lower()
        if any(k in low for k in ['password', 'apikey', 'api_key', 'cookie', 'token', 'secret', 'pass']):
            key = line.split(':')[0].strip() if ':' in line else '?'
            print(f"  {key}: [已脱敏 ****]")
        else:
            print(f"  {line}")

def main():
    ap = argparse.ArgumentParser(description='fnOS 配置加解密工具 (整文件 Fernet 加密)')
    sub = ap.add_subparsers(dest='cmd')
    sub.add_parser('gen-key', help='生成密钥')
    p_enc = sub.add_parser('encrypt', help='加密整个配置')
    p_enc.add_argument('-i', required=True, help='明文配置输入')
    p_enc.add_argument('-o', required=True, help='加密输出')
    p_dec = sub.add_parser('decrypt', help='解密配置')
    p_dec.add_argument('-i', required=True, help='加密文件输入')
    p_dec.add_argument('-o', required=True, help='明文输出')
    p_show = sub.add_parser('show', help='脱敏显示加密配置')
    p_show.add_argument('-i', required=True)
    args = ap.parse_args()

    if not args.cmd:
        ap.print_help()
        return
    if args.cmd == 'gen-key':
        gen_key()
    elif args.cmd == 'encrypt':
        encrypt_file(Path(args.i), Path(args.o))
    elif args.cmd == 'decrypt':
        decrypt_file(Path(args.i), Path(args.o))
    elif args.cmd == 'show':
        show_config(Path(args.i))

if __name__ == '__main__':
    main()
