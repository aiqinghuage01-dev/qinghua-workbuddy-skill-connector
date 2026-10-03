import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync, mkdirSync, readFileSync, writeFileSync, cpSync, rmSync, existsSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';

const scripts = join(dirname(fileURLToPath(import.meta.url)), '..');
function fixture(t) {
  const root = mkdtempSync(join(tmpdir(), '卡片测试 space-'));
  t.after(() => rmSync(root, {recursive: true, force: true}));
  mkdirSync(join(root, 'scripts')); mkdirSync(join(root, 'src'));
  for (const name of ['project.mjs', 'generate-tts.mjs', 'render-card.mjs', 'generate_tts_minimax.py']) cpSync(join(scripts, name), join(root, 'scripts', name));
  writeFileSync(join(root, 'package.json'), '{}');
  mkdirSync(join(root, 'node_modules/@remotion/cli'), {recursive: true});
  writeFileSync(join(root, 'node_modules/@remotion/cli/package.json'), '{"name":"@remotion/cli","version":"0.0.0"}');
  writeFileSync(join(root, 'scripts/runtime.mjs'), `
import {writeFileSync, appendFileSync} from 'node:fs';
import {join} from 'node:path';
export const projectRoot = ${JSON.stringify(root)};
export const findPython = () => 'mock-python';
export const findFFprobe = () => 'mock-ffprobe';
export function run(cmd, args, options) {
 appendFileSync(join(projectRoot,'calls.jsonl'),JSON.stringify({cmd,args,options})+'\\n');
 if(cmd === 'mock-python') {
   if(process.env.CARD_TEST_FAIL) throw new Error('private error must not leak');
   writeFileSync(args[args.indexOf('--write-media')+1], 'audio'); return '';
 }
 if(cmd === 'mock-ffprobe') return '2.375\\n';
 if(args[1] === 'render') { writeFileSync(args[4], 'mock mp4'); return ''; }
 throw new Error('Unexpected executable');
}`);
  const script = join(root, '文案 name.json');
  const narration = '文字 "quoted" $(touch SHOULD_NOT_EXIST) `whoami` & echo %PATH%\n第二行';
  writeFileSync(script, JSON.stringify({slides: [{lines: [{text: '卡片测试', style: 'title'}], narration, duration: 1}]}));
  const project = join(root, '项目 with space');
  return {root, script, project, narration};
}
function execute(f, file, args, env = {}) {
  return spawnSync(process.execPath, [join(f.root, 'scripts', file), ...args], {encoding: 'utf8', env: {...process.env, ...env}});
}
function manifest(f) { return JSON.parse(readFileSync(join(f.project, 'public/audio/manifest.json'), 'utf8')); }

test('TTS preserves text as a single argument and writes a project-bound manifest', t => {
  const f = fixture(t);
  const result = execute(f, 'generate-tts.mjs', [f.script, '--project', f.project]);
  assert.equal(result.status, 0, result.stderr);
  const calls = readFileSync(join(f.root, 'calls.jsonl'), 'utf8').trim().split('\n').map(JSON.parse);
  assert.equal(calls[0].args[calls[0].args.indexOf('--text') + 1], f.narration);
  assert.equal(calls[0].options.capture, true);
  assert.deepEqual(manifest(f).slideDurations, [2.875]);
  assert.equal(manifest(f).scriptHash, createHash('sha256').update(readFileSync(f.script)).digest('hex'));
  assert.equal(manifest(f).silent, false);
});

test('different script contents map to different default project directories', t => {
  const f = fixture(t);
  const args = [f.script];
  const first = execute(f, 'generate-tts.mjs', args);
  const hash1 = createHash('sha256').update(readFileSync(f.script)).digest('hex').slice(0, 8);
  const original = JSON.parse(readFileSync(f.script)); original.slides[0].narration = '另一条内容';
  writeFileSync(f.script, JSON.stringify(original));
  const hash2 = createHash('sha256').update(readFileSync(f.script)).digest('hex').slice(0, 8);
  const second = execute(f, 'generate-tts.mjs', args);
  assert.equal(first.status, 0, first.stderr); assert.equal(second.status, 0, second.stderr);
  assert.notEqual(hash1, hash2);
  assert.ok(existsSync(join(f.root, 'work', `name-${hash1}`, 'public/audio/manifest.json')));
  assert.ok(existsSync(join(f.root, 'work', `name-${hash2}`, 'public/audio/manifest.json')));
});

test('TTS failures return nonzero and invalidate stale success manifests', t => {
  const f = fixture(t);
  assert.equal(execute(f, 'generate-tts.mjs', [f.script, '--project', f.project]).status, 0);
  const result = execute(f, 'generate-tts.mjs', [f.script, '--project', f.project], {CARD_TEST_FAIL: '1'});
  assert.equal(result.status, 1);
  assert.ok(!existsSync(join(f.project, 'public/audio/manifest.json')));
  assert.ok(!result.stderr.includes('private error'));
});

test('silent fallback requires an explicit flag for generation and rendering', t => {
  const f = fixture(t);
  const generated = execute(f, 'generate-tts.mjs', [f.script, '--project', f.project, '--allow-silent'], {CARD_TEST_FAIL: '1'});
  assert.equal(generated.status, 0, generated.stderr);
  assert.equal(manifest(f).silent, true);
  assert.deepEqual(manifest(f).failedSlides, [0]);
  assert.equal(execute(f, 'render-card.mjs', [f.script, '--project', f.project]).status, 1);
  const rendered = execute(f, 'render-card.mjs', [f.script, '--project', f.project, '--allow-silent']);
  assert.equal(rendered.status, 0, rendered.stderr);
});

test('render defaults to portrait, isolates public-dir and rejects stale narration', t => {
  const f = fixture(t);
  assert.equal(execute(f, 'generate-tts.mjs', [f.script, '--project', f.project]).status, 0);
  const result = execute(f, 'render-card.mjs', [f.script, '--project', f.project, '--output', '成片 name']);
  assert.equal(result.status, 0, result.stderr);
  const calls = readFileSync(join(f.root, 'calls.jsonl'), 'utf8').trim().split('\n').map(JSON.parse);
  const render = calls.at(-1);
  assert.equal(render.args[3], 'CardVideoVertical');
  assert.equal(render.args[4], join(f.project, '成片 name.mp4'));
  assert.ok(render.args.includes(`--public-dir=${join(f.project, 'public')}`));
  writeFileSync(f.script, readFileSync(f.script, 'utf8').replace('第二行', '已经变了'));
  assert.equal(execute(f, 'render-card.mjs', [f.script, '--project', f.project]).status, 1);
});

test('render rejects missing audio, unsafe output paths and malformed scripts', t => {
  const f = fixture(t);
  assert.equal(execute(f, 'render-card.mjs', [f.script, '--project', f.project]).status, 1);
  assert.equal(execute(f, 'render-card.mjs', [f.script, '--project', f.project, '--allow-silent', '--output', '../escape']).status, 1);
  writeFileSync(f.script, '{"slides":[]}');
  assert.equal(execute(f, 'generate-tts.mjs', [f.script, '--project', f.project]).status, 1);
});

const python = ['python3', 'python'].find(command => spawnSync(command, ['--version'], {encoding: 'utf8'}).status === 0);
test('MiniMax uses no third-party modules and fails without credentials before a network call', {skip: !python}, t => {
  const f = fixture(t);
  const result = spawnSync(python, ['-S', join(f.root, 'scripts/generate_tts_minimax.py'), f.script, '--project', f.project], {encoding: 'utf8', env: {...process.env, MINIMAX_API_KEY: '', MINIMAX_GROUP_ID: '', MINIMAX_VOICE_ID: ''}});
  assert.equal(result.status, 1);
  assert.ok(!existsSync(join(f.project, 'public/audio/manifest.json')));
  assert.ok(!result.stderr.includes('ModuleNotFoundError'));
});

test('Python and JavaScript compute identical default project identities', {skip: !python}, t => {
  const f = fixture(t);
  const generated = execute(f, 'generate-tts.mjs', [f.script]);
  assert.equal(generated.status, 0, generated.stderr);
  const code = "import runpy,sys; from pathlib import Path; ns=runpy.run_path(sys.argv[1]); print(ns['project_for'](Path(sys.argv[2]),None)[0])";
  const result = spawnSync(python, ['-S', '-c', code, join(f.root, 'scripts/generate_tts_minimax.py'), f.script], {encoding: 'utf8'});
  assert.equal(result.status, 0, result.stderr);
  assert.ok(existsSync(join(result.stdout.trim(), 'public/audio/manifest.json')));
});
