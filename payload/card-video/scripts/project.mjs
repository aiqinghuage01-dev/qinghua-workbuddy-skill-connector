import {createHash} from 'node:crypto';
import {readFileSync, mkdirSync, renameSync, writeFileSync, existsSync, statSync, copyFileSync} from 'node:fs';
import {resolve, basename, isAbsolute, join} from 'node:path';
import {projectRoot} from './runtime.mjs';

export function parseArgs(args) {
  const result = {positional: [], allowSilent: false, landscape: false};
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--allow-silent') result.allowSilent = true;
    else if (arg === '--landscape') result.landscape = true;
    else if (['--project', '--output', '--voice'].includes(arg)) {
      if (!args[i + 1] || args[i + 1].startsWith('--')) throw new Error(`${arg} 缺少值`);
      result[arg.slice(2)] = args[++i];
    } else if (arg.startsWith('--')) throw new Error(`未知参数：${arg}`);
    else result.positional.push(arg);
  }
  if (result.positional.length !== 1) throw new Error('请提供一个 script.json 文件');
  if (result.project && !isAbsolute(result.project)) throw new Error('--project 必须是绝对目录');
  return result;
}

export function readProject(scriptPath, explicitProject) {
  const raw = readFileSync(resolve(scriptPath));
  const scriptHash = createHash('sha256').update(raw).digest('hex');
  const script = JSON.parse(raw.toString('utf8').replace(/^\uFEFF/, ''));
  if (!Array.isArray(script.slides) || !script.slides.length) throw new Error('slides 必须是非空数组');
  for (const [i, slide] of script.slides.entries()) {
    if (!Array.isArray(slide.lines) || slide.lines.some(l => !l || typeof l.text !== 'string' || !['title','emphasis','body','badge','gradient'].includes(l.style))) throw new Error(`第 ${i + 1} 页 lines 格式无效`);
    if (slide.narration !== undefined && typeof slide.narration !== 'string') throw new Error(`第 ${i + 1} 页 narration 必须是文字`);
    if (slide.duration !== undefined && (!Number.isFinite(slide.duration) || slide.duration <= 0)) throw new Error(`第 ${i + 1} 页 duration 必须大于 0`);
  }
  const stem = basename(scriptPath).replace(/\.json$/i, '').replace(/[^A-Za-z0-9_-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60) || 'video';
  const dir = explicitProject || join(projectRoot, 'work', `${stem}-${scriptHash.slice(0, 8)}`);
  const publicDir = join(dir, 'public');
  const audioDir = join(publicDir, 'audio');
  mkdirSync(audioDir, {recursive: true});
  const fontSource = join(projectRoot, 'src/assets/NotoSansSC.ttf');
  const fontDestination = join(publicDir, 'fonts/NotoSansSC.ttf');
  if (existsSync(fontSource) && (!existsSync(fontDestination) || statSync(fontSource).size !== statSync(fontDestination).size)) {
    mkdirSync(join(publicDir, 'fonts'), {recursive: true});
    copyFileSync(fontSource, fontDestination);
  }
  return {script, scriptHash, dir, publicDir, audioDir, manifestPath: join(audioDir, 'manifest.json')};
}

export function writeManifest(project, data) {
  const destination = project.manifestPath;
  const temporary = `${destination}.${process.pid}.tmp`;
  writeFileSync(temporary, JSON.stringify({schemaVersion: 1, scriptHash: project.scriptHash, ...data}, null, 2));
  renameSync(temporary, destination);
}
