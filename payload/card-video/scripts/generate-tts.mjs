#!/usr/bin/env node
import {existsSync, unlinkSync, renameSync} from 'node:fs';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {realpathSync} from 'node:fs';
import {run, findPython, findFFprobe} from './runtime.mjs';
import {parseArgs, readProject, writeManifest} from './project.mjs';

export function generateTts(args = process.argv.slice(2)) {
  const opts = parseArgs(args);
  const project = readProject(opts.positional[0], opts.project);
  // A failed run must never leave a previous success manifest available for rendering.
  if (existsSync(project.manifestPath)) unlinkSync(project.manifestPath);
  const audioFiles = [], slideDurations = [], failedSlides = [];
  let python, ffprobe;
  for (const [i, slide] of project.script.slides.entries()) {
    const narration = (slide.narration || '').trim();
    if (!narration) { audioFiles.push(''); slideDurations.push(slide.duration || 3); continue; }
    const relative = `audio/slide-${String(i).padStart(3, '0')}.mp3`;
    const finalPath = join(project.publicDir, relative);
    const pending = `${finalPath}.${process.pid}.pending.mp3`;
    try {
      python ||= findPython(); ffprobe ||= findFFprobe();
      run(python, ['-m', 'edge_tts', '--voice', opts.voice || 'zh-CN-YunxiNeural', '--text', narration, '--write-media', pending], {capture: true, timeout: 120000});
      const seconds = Number(run(ffprobe, ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', pending], {capture: true, timeout: 30000}).trim());
      if (!Number.isFinite(seconds) || seconds <= 0) throw new Error('音频时长检测失败');
      renameSync(pending, finalPath);
      audioFiles.push(relative); slideDurations.push(Math.max(seconds + 0.5, slide.duration || 0));
      console.log(`第 ${i + 1} 页配音完成`);
    } catch {
      if (existsSync(pending)) unlinkSync(pending);
      if (!opts.allowSilent) throw new Error(`第 ${i + 1} 页配音失败。请检查网络及配音环境后重试；未生成可交付清单。`);
      audioFiles.push(''); slideDurations.push(slide.duration || 5); failedSlides.push(i);
    }
  }
  const silent = failedSlides.length > 0 || !audioFiles.some(Boolean);
  writeManifest(project, {provider: 'edge-tts', audioFiles, slideDurations, silent, silentAllowed: opts.allowSilent, failedSlides});
  console.log(`配音清单：${project.manifestPath}${silent ? '（含静音，非完整配音成片）' : ''}`);
  return project;
}
if (process.argv[1] && realpathSync(fileURLToPath(import.meta.url)) === realpathSync(process.argv[1])) {
  try { generateTts(); } catch (error) { console.error(error.message); process.exitCode = 1; }
}
