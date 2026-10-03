import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,readFileSync,writeFileSync,cpSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,dirname} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {spawnSync} from 'node:child_process';
const scripts=join(dirname(fileURLToPath(import.meta.url)),'..');
function fixture(t){
  const root=mkdtempSync(join(tmpdir(),'卡片 runtime-'));t.after(()=>rmSync(root,{recursive:true,force:true}));
  mkdirSync(join(root,'scripts'));mkdirSync(join(root,'node_modules/@remotion/cli'),{recursive:true});
  writeFileSync(join(root,'package.json'),'{"dependencies":{}}');
  writeFileSync(join(root,'runtime-lock.json'),'{"edgeTts":"7.2.8"}');
  writeFileSync(join(root,'node_modules/@remotion/cli/package.json'),'{"name":"@remotion/cli"}');
  for(const name of ['workbuddy.mjs','setup.mjs','project.mjs','render-card.mjs'])cpSync(join(scripts,name),join(root,'scripts',name));
  writeFileSync(join(root,'scripts/runtime.mjs'),`
import {readFileSync,writeFileSync} from 'node:fs';
import {join} from 'node:path';
export const projectRoot=${JSON.stringify(root)};
export const findPython=()=> 'mock-python';
export const findBasePython=findPython;
export const findFFprobe=()=> 'mock-probe';
export const findFFmpeg=()=> 'mock-ffmpeg';
export const npmCli=()=> 'mock-npm';
export const pythonAt=()=> 'mock-python';
export const compositorName=()=> 'mock-platform';
export function run(command,args){
 if(command==='mock-python')return process.env.MOCK_PYTHON_REPORT||'{}';
 if(args[1]==='render'){
  writeFileSync(join(projectRoot,'render-args.json'),JSON.stringify(args));
  const props=args.find(a=>a.startsWith('--props=')).slice(8);
  writeFileSync(join(projectRoot,'rendered-props.json'),readFileSync(props));
  writeFileSync(args[4],'mock mp4');return '';
 }
 throw new Error('Unexpected executable');
}`);
  return root;
}
function code(root,text,env={}){
  return spawnSync(process.execPath,['--input-type=module','-e',text],{encoding:'utf8',env:{...process.env,...env},cwd:root});
}
const moduleUrl=(root,name)=>JSON.stringify(pathToFileURL(join(root,'scripts',name)).href);

test('empty quoted MiniMax credentials and partial configuration select fallback',t=>{
  const root=fixture(t);
  writeFileSync(join(root,'.env'), 'MINIMAX_API_KEY=""\nMINIMAX_GROUP_ID=group\nMINIMAX_VOICE_ID=voice\n');
  let result=code(root,`import {hasMiniMaxConfiguration} from ${moduleUrl(root,'workbuddy.mjs')}; console.log(hasMiniMaxConfiguration({env:{}}));`);
  assert.equal(result.status,0,result.stderr);assert.equal(result.stdout.trim(),'false');
  writeFileSync(join(root,'.env'),'MINIMAX_API_KEY="test-key"\nMINIMAX_GROUP_ID="group"\nMINIMAX_VOICE_ID=voice\n');
  result=code(root,`import {hasMiniMaxConfiguration} from ${moduleUrl(root,'workbuddy.mjs')}; console.log(hasMiniMaxConfiguration({env:{}})); console.log(hasMiniMaxConfiguration({env:{MINIMAX_API_KEY:' '}}));`);
  assert.equal(result.status,0,result.stderr);assert.equal(result.stdout.trim(),'true\nfalse');
});

test('explicit silent mode replaces stale audio manifest and suppresses audioTrack',t=>{
  const root=fixture(t),project=join(root,'project'),input=join(root,'script.json');
  writeFileSync(input,JSON.stringify({audioTrack:'audio/old.mp3',slides:[{lines:[{text:'测试',style:'title'}],narration:'有旁白',duration:3}]}));
  const result=code(root,`
import {readProject,writeManifest} from ${moduleUrl(root,'project.mjs')};
import {prepareSilentManifest} from ${moduleUrl(root,'workbuddy.mjs')};
import {renderCard} from ${moduleUrl(root,'render-card.mjs')};
const project=readProject(${JSON.stringify(input)},${JSON.stringify(project)});
writeManifest(project,{audioFiles:['audio/old.mp3'],slideDurations:[10],provider:'edge-tts',silent:false});
prepareSilentManifest(project);
renderCard([${JSON.stringify(input)},'--project',${JSON.stringify(project)},'--allow-silent']);`);
  assert.equal(result.status,0,result.stderr);
  const manifest=JSON.parse(readFileSync(join(project,'public/audio/manifest.json'),'utf8'));
  assert.equal(manifest.provider,'none');assert.equal(manifest.silent,true);
  assert.deepEqual(manifest.audioFiles,['']);assert.deepEqual(manifest.slideDurations,[3]);
  const props=JSON.parse(readFileSync(join(root,'rendered-props.json'),'utf8'));
  assert.ok(!Object.hasOwn(props.script,'audioTrack'));assert.deepEqual(props.audioFiles,['']);
});

test('Python runtime checker rejects wrong edge-tts versions and Python below 3.10',t=>{
  const root=fixture(t);
  const js=`import {checkPythonRuntime} from ${moduleUrl(root,'setup.mjs')}; console.log(checkPythonRuntime());`;
  for(const report of [{python:[3,12,0],edgeTts:'7.0.0'},{python:[3,9,1],edgeTts:'7.2.8'}]){
    const result=code(root,js,{MOCK_PYTHON_REPORT:JSON.stringify(report)});
    assert.notEqual(result.status,0);
  }
  const success=code(root,js,{MOCK_PYTHON_REPORT:'{"python":[3,12,0],"edgeTts":"7.2.8"}'});
  assert.equal(success.status,0,success.stderr);assert.match(success.stdout,/3\.12\.0 \/ edge-tts 7\.2\.8/);
});
