/** Shared local runtime. Never pass user content through a shell. */
import {spawnSync} from 'node:child_process';
import {existsSync, readdirSync} from 'node:fs';
import {dirname, resolve, join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {homedir} from 'node:os';

export const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
export function run(command, args = [], options = {}) {
  const {capture = false, timeout = 600000, env = {}, ...rest} = options;
  const result = spawnSync(command, args, {
    cwd: projectRoot, encoding: 'utf8', windowsHide: true, shell: false,
    stdio: capture ? 'pipe' : 'inherit', timeout,
    env: {...process.env, PYTHONUTF8: '1', ...(process.platform === 'darwin' && /[\\/](ffmpeg|ffprobe)$/.test(command) ? {DYLD_LIBRARY_PATH: dirname(command)} : {}), ...env}, ...rest,
  });
  if (result.error || result.status !== 0) {
    const error = new Error(`子程序失败（${result.error?.code || result.status}）${capture ? ': ' + (result.stderr || '').slice(-2000) : ''}`);
    error.status = result.status;
    throw error;
  }
  return result.stdout || '';
}
export function pythonAt(root) {
  return process.platform === 'win32' ? join(root, 'Scripts', 'python.exe') : join(root, 'bin', 'python');
}
export function findPython() {
  const candidates = [process.env.CARD_PYTHON, pythonAt(join(projectRoot, '.runtime', 'python'))].filter(Boolean);
  for (const path of candidates) if (existsSync(path)) return path;
  throw new Error('独立 Python 环境尚未准备好，请先运行 scripts/bootstrap.py setup。');
}
export function findBasePython() {
  const candidates = [process.env.CARD_BASE_PYTHON, 'python3', 'python'];
  const versions = join(homedir(), '.workbuddy', 'binaries', 'python', 'versions');
  if (existsSync(versions)) {
    for (const v of readdirSync(versions).filter(x => !x.startsWith('.')).sort().reverse()) {
      const root = join(versions, v);
      candidates.push(join(root, 'bin', 'python3'), join(root, 'python.exe'), join(root, 'python', 'python.exe'));
    }
  }
  for (const candidate of candidates.filter(Boolean)) {
    const r = spawnSync(candidate, ['-c', 'import sys; assert sys.version_info >= (3,10); print(sys.executable)'], {encoding:'utf8', windowsHide:true, shell:false});
    if (!r.error && r.status === 0) return r.stdout.trim();
  }
  throw new Error('未发现 Python 3.10+。请在 WorkBuddy 的运行环境检测中安装 Python，再重试。');
}
export function compositorName(platform = process.platform, arch = process.arch) {
  if (platform === 'darwin' && ['arm64','x64'].includes(arch)) return `compositor-darwin-${arch}`;
  if (platform === 'win32' && arch === 'x64') return 'compositor-win32-x64-msvc';
  if (platform === 'linux' && ['arm64','x64'].includes(arch)) return `compositor-linux-${arch}-gnu`;
  throw new Error(`本版渲染工具未验证此平台：${platform}/${arch}。Windows ARM 暂不发布。`);
}
export function findMediaBinary(name) {
  const file = join(projectRoot, 'node_modules', '@remotion', compositorName(), name + (process.platform === 'win32' ? '.exe' : ''));
  if (!existsSync(file)) throw new Error(`${name} 缺失，请重跑初始化。`);
  return file;
}
export const findFFprobe = () => findMediaBinary('ffprobe');
export const findFFmpeg = () => findMediaBinary('ffmpeg');
export function npmCli() {
  const nodeDir = dirname(process.execPath);
  const candidates = [join(nodeDir,'node_modules','npm','bin','npm-cli.js'), join(nodeDir,'..','lib','node_modules','npm','bin','npm-cli.js')];
  for (const p of candidates) if (existsSync(p)) return p;
  throw new Error('当前 Node 未附带 npm，请用 scripts/bootstrap.py setup --managed-node 准备完整环境。');
}
export function remotionCli() {
  return join(projectRoot,'node_modules','@remotion','cli','remotion-cli.js');
}
