#!/usr/bin/env node
import {readFileSync, writeFileSync, existsSync, unlinkSync} from 'node:fs';
import {resolve, join, basename, isAbsolute, dirname} from 'node:path';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import {realpathSync} from 'node:fs';
import {projectRoot, run} from './runtime.mjs';
import {parseArgs, readProject} from './project.mjs';

export function renderCard(args = process.argv.slice(2)) {
  const opts = parseArgs(args);
  const project = readProject(opts.positional[0], opts.project);
  let manifest;
  if (existsSync(project.manifestPath)) {
    manifest = JSON.parse(readFileSync(project.manifestPath, 'utf8'));
    if (manifest.scriptHash !== project.scriptHash) throw new Error('配音清单与当前文案不匹配，请重新配音');
    if (!Array.isArray(manifest.audioFiles) || !Array.isArray(manifest.slideDurations) || manifest.audioFiles.length !== project.script.slides.length || manifest.slideDurations.length !== project.script.slides.length) throw new Error('配音清单页数不匹配，请重新配音');
    if (manifest.slideDurations.some(v => !Number.isFinite(v) || v <= 0)) throw new Error('配音清单时长无效');
    for (const file of manifest.audioFiles) {
      if (typeof file !== 'string' || (file && (!file.startsWith('audio/') || file.split(/[\\/]/).includes('..') || !existsSync(join(project.publicDir, file))))) throw new Error('配音清单引用了缺失或无效的音频文件');
    }
  }
  const renderScript = manifest?.provider === 'none' ? {...project.script, audioTrack: undefined} : project.script;
  const missingNarration = project.script.slides.some((slide, i) => (slide.narration || '').trim() && !manifest?.audioFiles?.[i]);
  const noAudio = !manifest?.audioFiles?.some(Boolean) && !renderScript.audioTrack;
  if ((missingNarration || manifest?.silent || noAudio) && !opts.allowSilent) throw new Error('缺少完整配音。请先生成配音；仅演示时可明确使用 --allow-silent');
  const audioFiles = manifest?.audioFiles || project.script.slides.map(() => '');
  const durations = manifest?.slideDurations || project.script.slides.map(slide => slide.duration || 3);
  let output = opts.output || 'output.mp4';
  if (isAbsolute(output) || basename(output) !== output || /[\\/:]/.test(output) || output === '.' || output === '..') throw new Error('--output 只接受文件名，目录请使用 --project');
  if (!output.toLowerCase().endsWith('.mp4')) output += '.mp4';
  const outputPath = join(project.dir, output);
  const propsPath = join(project.dir, `.props-${process.pid}.json`);
  const layout = opts.landscape ? 'landscape' : 'portrait';
  writeFileSync(propsPath, JSON.stringify({script: renderScript, audioFiles, slideDurations: durations, layout}));
  const require = createRequire(join(projectRoot, 'package.json'));
  const cli = join(dirname(require.resolve('@remotion/cli/package.json')), 'remotion-cli.js');
  try {
    run(process.execPath, [cli, 'render', resolve(projectRoot, 'src/index.ts'), opts.landscape ? 'CardVideo' : 'CardVideoVertical', outputPath, `--props=${propsPath}`, `--public-dir=${project.publicDir}`, '--concurrency=2', ...(manifest?.provider === 'none' ? ['--muted'] : [])], {cwd: projectRoot, timeout: 1800000});
    if (!existsSync(outputPath)) throw new Error('渲染未生成文件');
    console.log(`成片：${outputPath}${opts.allowSilent && (missingNarration || manifest?.silent || noAudio) ? '（静音演示）' : ''}`);
    return outputPath;
  } finally { if (existsSync(propsPath)) unlinkSync(propsPath); }
}
if (process.argv[1] && realpathSync(fileURLToPath(import.meta.url)) === realpathSync(process.argv[1])) {
  try { renderCard(); } catch (error) { console.error(error.message); process.exitCode = 1; }
}
