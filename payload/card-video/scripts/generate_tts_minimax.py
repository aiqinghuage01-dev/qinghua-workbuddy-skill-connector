#!/usr/bin/env python3
"""MiniMax TTS using only Python's standard library; no credentials are printed.
Legacy usage: <script.json> [audio_dir]; preferred: <script.json> --project <absolute-dir>.
"""
from __future__ import annotations
import argparse
import hashlib
import json
import math
import os
from pathlib import Path
import re
import shutil
import subprocess
import sys
import urllib.request
import urllib.parse

PROJECT_ROOT = Path(__file__).resolve().parent.parent


def project_for(script_path: Path, explicit: str | None) -> tuple[Path, str, dict]:
    raw = script_path.read_bytes()
    fingerprint = hashlib.sha256(raw).hexdigest()
    script = json.loads(raw.decode('utf-8-sig'))
    if not isinstance(script.get('slides'), list) or not script['slides']:
        raise ValueError('slides 必须是非空数组')
    stem = re.sub(r'[^A-Za-z0-9_-]+', '-', re.sub(r'\.json$', '', script_path.name, flags=re.I)).strip('-')[:60] or 'video'
    directory = Path(explicit) if explicit else PROJECT_ROOT / 'work' / f'{stem}-{fingerprint[:8]}'
    if explicit and not directory.is_absolute():
        raise ValueError('--project 必须是绝对目录')
    return directory, fingerprint, script


def settings() -> dict[str, str]:
    values = {}
    env_file = PROJECT_ROOT / '.env'
    if env_file.exists():
        for line in env_file.read_text(encoding='utf-8-sig').splitlines():
            line = line.strip()
            if not line or line.startswith('#') or '=' not in line:
                continue
            key, value = line.split('=', 1)
            values[key.strip()] = value.strip().strip('\"\'')
    values.update(os.environ)
    required = ('MINIMAX_API_KEY', 'MINIMAX_GROUP_ID', 'MINIMAX_VOICE_ID')
    if any(not values.get(key, '').strip() for key in required):
        raise ValueError('请先配置 MiniMax API Key、Group ID 和声音 ID')
    base = values.get('MINIMAX_BASE_URL', 'https://api.minimax.chat').rstrip('/')
    if urllib.parse.urlparse(base).scheme != 'https':
        raise ValueError('MiniMax 地址必须使用 HTTPS')
    values['MINIMAX_BASE_URL'] = base
    return values


def find_ffprobe() -> str:
    if os.environ.get('CARD_FFPROBE'):
        return os.environ['CARD_FFPROBE']
    candidates = sorted((PROJECT_ROOT / 'node_modules' / '@remotion').glob('compositor-*/ffprobe*'))
    for candidate in candidates:
        if candidate.is_file() and candidate.name in ('ffprobe', 'ffprobe.exe'):
            return str(candidate)
    found = shutil.which('ffprobe')
    if not found:
        raise ValueError('缺少 ffprobe，请运行环境初始化')
    return found


def duration(path: Path, probe: str) -> float:
    media_env = os.environ.copy()
    if sys.platform == 'darwin':
        media_env['DYLD_LIBRARY_PATH'] = str(Path(probe).resolve().parent)
    result = subprocess.run([probe, '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', str(path)], capture_output=True, text=True, check=True, timeout=30, env=media_env)
    seconds = float(result.stdout.strip())
    if not math.isfinite(seconds) or seconds <= 0:
        raise ValueError('音频时长无效')
    return seconds


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('script')
    parser.add_argument('audio_dir', nargs='?', help='旧用法兼容：输出 audio 目录')
    parser.add_argument('--project')
    parser.add_argument('--allow-silent', action='store_true')
    args = parser.parse_args()
    if args.project and args.audio_dir:
        raise ValueError('--project 与旧 audio_dir 不能同时使用')
    project, fingerprint, script = project_for(Path(args.script).expanduser().resolve(), args.project)
    audio_dir = Path(args.audio_dir).expanduser().resolve() if args.audio_dir else project / 'public' / 'audio'
    audio_dir.mkdir(parents=True, exist_ok=True)
    manifest_path = audio_dir / 'manifest.json'
    manifest_path.unlink(missing_ok=True)
    audio_files, durations, failed = [], [], []
    config = None
    probe = None
    for i, slide in enumerate(script['slides']):
        narration = slide.get('narration', '')
        if not isinstance(narration, str):
            raise ValueError('narration 必须是文字')
        fallback = slide.get('duration', 3)
        if not isinstance(fallback, (int, float)) or not math.isfinite(fallback) or fallback <= 0:
            raise ValueError('duration 必须大于 0')
        if not narration.strip():
            audio_files.append(''); durations.append(fallback); continue
        target = audio_dir / f'slide-{i:03d}.mp3'
        temporary = target.with_name(f'{target.name}.{os.getpid()}.pending.mp3')
        try:
            config = config or settings()
            probe = probe or find_ffprobe()
            payload = {'model': 'speech-02-turbo', 'text': narration, 'stream': False,
                       'voice_setting': {'voice_id': config['MINIMAX_VOICE_ID'], 'speed': 1.0, 'pitch': 0, 'vol': 1.0},
                       'audio_setting': {'sample_rate': 32000, 'bitrate': 128000, 'format': 'mp3'}}
            url = config['MINIMAX_BASE_URL'] + '/v1/t2a_v2?' + urllib.parse.urlencode({'GroupId': config['MINIMAX_GROUP_ID']})
            request = urllib.request.Request(url, data=json.dumps(payload).encode('utf-8'), headers={'Authorization': 'Bearer ' + config['MINIMAX_API_KEY'], 'Content-Type': 'application/json'}, method='POST')
            with urllib.request.urlopen(request, timeout=120) as response:
                result = json.load(response)
            if result.get('base_resp', {}).get('status_code') != 0:
                raise ValueError('配音服务返回失败')
            content = result.get('data', {}).get('audio', '')
            if not isinstance(content, str) or not content:
                raise ValueError('没有音频数据')
            temporary.write_bytes(bytes.fromhex(content))
            seconds = max(duration(temporary, probe) + 0.5, fallback)
            temporary.replace(target)
            audio_files.append(f'audio/{target.name}'); durations.append(seconds)
            print(f'第 {i + 1} 页配音完成')
        except Exception:
            temporary.unlink(missing_ok=True)
            if not args.allow_silent:
                raise ValueError(f'第 {i + 1} 页 MiniMax 配音失败，请检查凭据、余额、网络及环境后重试。未生成可交付清单。') from None
            audio_files.append(''); durations.append(fallback); failed.append(i)
    silent = bool(failed) or not any(audio_files)
    manifest = {'schemaVersion': 1, 'scriptHash': fingerprint, 'provider': 'minimax', 'audioFiles': audio_files,
                'slideDurations': durations, 'silent': silent, 'silentAllowed': args.allow_silent, 'failedSlides': failed}
    temporary_manifest = manifest_path.with_name(f'manifest.{os.getpid()}.tmp')
    temporary_manifest.write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding='utf-8')
    temporary_manifest.replace(manifest_path)
    # Preserve the old <script> <audio_dir> command while making its output usable
    # by the new isolated render command for that same script.
    project_audio = project / 'public' / 'audio'
    if args.audio_dir and audio_dir.resolve() != project_audio.resolve():
        project_audio.mkdir(parents=True, exist_ok=True)
        for name in audio_files:
            if name:
                shutil.copy2(audio_dir / Path(name).name, project_audio / Path(name).name)
        shutil.copy2(manifest_path, project_audio / 'manifest.json')
    print(f'配音清单：{manifest_path}' + ('（含静音，非完整配音成片）' if silent else ''))
    return 0


if __name__ == '__main__':
    try:
        raise SystemExit(main())
    except Exception as error:
        print(str(error), file=sys.stderr)
        raise SystemExit(1)
