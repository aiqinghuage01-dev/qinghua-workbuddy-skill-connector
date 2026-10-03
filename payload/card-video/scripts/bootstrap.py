#!/usr/bin/env python3
"""WorkBuddy bootstrap; Python standard library only, no global installs."""
from __future__ import annotations
import argparse
import hashlib
import json
import os
import platform
from pathlib import Path
import shutil
import subprocess
import sys
import tarfile
import urllib.request
import zipfile

ROOT = Path(__file__).resolve().parent.parent
LOCK = json.loads((ROOT / 'runtime-lock.json').read_text(encoding='utf-8'))

def run(args, **kwargs):
    return subprocess.run([str(x) for x in args], check=True, shell=False, **kwargs)

def platform_key():
    system = {'Darwin':'darwin','Windows':'win','Linux':'linux'}.get(platform.system())
    arch = {'arm64':'arm64','aarch64':'arm64','AMD64':'x64','x86_64':'x64'}.get(platform.machine())
    key = f'{system}-{arch}'
    if key not in LOCK['nodeArchives']:
        raise RuntimeError(f'本版暂未支持此系统/芯片：{platform.system()} / {platform.machine()}')
    return key

def managed_node():
    key = platform_key()
    folder = ROOT / '.runtime' / 'node' / f"node-{LOCK['nodeVersion']}-{key}"
    return folder / ('node.exe' if key.startswith('win-') else 'bin/node')

def find_node(managed_only=False):
    candidate = managed_node()
    candidates = [candidate]
    if not managed_only:
        versions = Path.home()/'.workbuddy/binaries/node/versions'
        for folder in sorted(versions.glob('*'), reverse=True):
            if not folder.name.startswith('.'):
                candidates.extend([folder/'bin/node', folder/'node.exe'])
        candidates += [shutil.which('node')]
    for item in candidates:
        if not item or not Path(item).is_file():
            continue
        try:
            r = run([item, '-p', 'process.versions.node'], capture_output=True, text=True, timeout=10)
            node_dir = Path(item).parent
            npm_paths = [node_dir/'node_modules/npm/bin/npm-cli.js', node_dir.parent/'lib/node_modules/npm/bin/npm-cli.js']
            if int(r.stdout.strip().split('.')[0]) in (20,22,24) and any(p.is_file() for p in npm_paths):
                return Path(item)
        except (OSError, ValueError, subprocess.SubprocessError):
            continue
    return None

def download_node():
    key = platform_key()
    meta = LOCK['nodeArchives'][key]
    filename = f"node-{LOCK['nodeVersion']}-{key}.{meta['extension']}"
    cache = ROOT/'.runtime/downloads'
    cache.mkdir(parents=True, exist_ok=True)
    archive = cache/filename
    def valid():
        return archive.exists() and hashlib.sha256(archive.read_bytes()).hexdigest() == meta['sha256']
    if not valid():
        url = f"https://nodejs.org/dist/{LOCK['nodeVersion']}/{filename}"
        print(f'下载固定版本 Node {LOCK["nodeVersion"]}（{key}）', flush=True)
        partial = archive.with_suffix(archive.suffix + '.part')
        with urllib.request.urlopen(url, timeout=90) as response, partial.open('wb') as out:
            shutil.copyfileobj(response, out)
        partial.replace(archive)
    if not valid():
        raise RuntimeError('Node 安装包校验失败，未执行安装；请检查下载网络后重试。')
    destination = ROOT/'.runtime/node'
    destination.mkdir(parents=True, exist_ok=True)
    def contained(name):
        target = (destination/name).resolve()
        if not target.is_relative_to(destination.resolve()):
            raise RuntimeError('安装包包含越界路径')
    if meta['extension'] == 'zip':
        with zipfile.ZipFile(archive) as z:
            for name in z.namelist(): contained(name)
            z.extractall(destination)
    else:
        with tarfile.open(archive) as t:
            for member in t.getmembers():
                contained(member.name)
                if member.issym(): contained(str(Path(member.name).parent/member.linkname))
                elif member.islnk(): contained(member.linkname)
                elif not (member.isfile() or member.isdir()): raise RuntimeError('不支持的归档成员类型')
            if hasattr(tarfile, 'data_filter'): t.extractall(destination, filter='data')
            else: t.extractall(destination)
    return managed_node()

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('action', choices=['setup','doctor','smoke','run'])
    parser.add_argument('--managed-node', action='store_true')
    args, rest = parser.parse_known_args()
    node = find_node(args.managed_node)
    if not node:
        if args.action != 'setup':
            raise RuntimeError('尚未安装 Node，请先运行同一脚本 setup。')
        node = download_node()
    env = dict(os.environ, CARD_BASE_PYTHON=sys.executable, PYTHONUTF8='1')
    env['PATH'] = str(node.parent) + os.pathsep + env.get('PATH','')
    script = 'setup.mjs' if args.action in ('setup','doctor') else 'workbuddy.mjs'
    forwarded = (['--check'] if args.action == 'doctor' else []) if script == 'setup.mjs' else [args.action]
    run([node, ROOT/'scripts'/script, *forwarded, *rest], cwd=ROOT, env=env)

if __name__ == '__main__':
    try:
        main()
    except (RuntimeError, OSError, ValueError, subprocess.SubprocessError) as exc:
        print(f'环境初始化失败：{exc}', file=sys.stderr)
        sys.exit(1)
