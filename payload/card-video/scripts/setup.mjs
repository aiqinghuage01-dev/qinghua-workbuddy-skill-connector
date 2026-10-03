#!/usr/bin/env node
import {existsSync,readFileSync,writeFileSync,mkdirSync,openSync,closeSync,unlinkSync,realpathSync} from 'node:fs';
import {join} from 'node:path';
import {createHash} from 'node:crypto';
import {pathToFileURL,fileURLToPath} from 'node:url';
import {projectRoot,run,findBasePython,findPython,findFFmpeg,findFFprobe,npmCli,pythonAt,compositorName} from './runtime.mjs';
const runtime=join(projectRoot,'.runtime');
const stateFile=join(runtime,'installed.json');
const requirementFile=join(projectRoot,'requirements-runtime.txt');
const digest=file=>createHash('sha256').update(readFileSync(file)).digest('hex');
const readState=()=>{try{return JSON.parse(readFileSync(stateFile,'utf8'));}catch{return {};}};
const packageSpec=()=>JSON.parse(readFileSync(join(projectRoot,'package.json'),'utf8'));
export function checkPythonRuntime(python=findPython()){
  const expected=JSON.parse(readFileSync(join(projectRoot,'runtime-lock.json'),'utf8')).edgeTts;
  const code='import edge_tts,sys,json; from importlib.metadata import version; print(json.dumps({"python":list(sys.version_info[:3]),"edgeTts":version("edge-tts")}))';
  const actual=JSON.parse(run(python,['-c',code],{capture:true,timeout:15000}).trim());
  if(!Array.isArray(actual.python)||actual.python[0]<3||(actual.python[0]===3&&actual.python[1]<10))throw new Error('需要 Python 3.10+，请重新建立专用环境');
  if(actual.edgeTts!==expected)throw new Error(`edge-tts 要求 ${expected}，实际 ${actual.edgeTts}，请重新初始化`);
  return `${actual.python.join('.')} / edge-tts ${actual.edgeTts}`;
}
export function doctor(){
  const checks=[];
  const check=(name,fn)=>{try{checks.push({name,ok:true,detail:fn()});}catch(e){checks.push({name,ok:false,error:e.message});}};
  check('平台',()=>compositorName());
  check('Node',()=>{if(![20,22,24].includes(Number(process.versions.node.split('.')[0])))throw new Error('需要 Node 20/22/24');return process.versions.node;});
  check('npm',()=>run(process.execPath,[npmCli(),'--version'],{capture:true,timeout:15000}).trim());
  for(const [name,version] of Object.entries(packageSpec().dependencies))check(name,()=>{
    const actual=JSON.parse(readFileSync(join(projectRoot,'node_modules',name,'package.json'),'utf8')).version;
    if(actual!==version)throw new Error(`要求 ${version}，实际 ${actual}，请重新初始化`);
    return actual;
  });
  check('Python/edge-tts',()=>checkPythonRuntime());
  check('FFmpeg',()=>run(findFFmpeg(),['-version'],{capture:true,timeout:10000}).split('\n')[0]);
  check('ffprobe',()=>run(findFFprobe(),['-version'],{capture:true,timeout:10000}).split('\n')[0]);
  check('中文字体',()=>{if(!existsSync(join(projectRoot,'src/assets/NotoSansSC.ttf')))throw new Error('字体缺失，请重新导入完整包');return '随包 Noto Sans SC';});
  const state=readState();
  check('浏览器',()=>{if(!state.browser||!existsSync(state.browser))throw new Error('浏览器尚未准备，请运行 setup');return run(state.browser,['--version'],{capture:true,timeout:15000}).trim();});
  check('依赖锁定记录',()=>{if(state.npmLock!==digest(join(projectRoot,'package-lock.json'))||state.pythonLock!==digest(requirementFile))throw new Error('尚未按当前锁文件完成初始化');return state.installedAt;});
  return {ok:checks.every(c=>c.ok),platform:process.platform,arch:process.arch,checks};
}
export async function setup({repair=false}={}){
  mkdirSync(runtime,{recursive:true});
  const lockFile=join(runtime,'setup.lock');let fd;
  try{fd=openSync(lockFile,'wx');writeFileSync(fd,String(process.pid));}catch{throw new Error('已有初始化任务运行，稍后重试。异常退出后先确认无安装进程，再移除 .runtime/setup.lock。');}
  try{
    compositorName();
    const old=readState();const npmLock=digest(join(projectRoot,'package-lock.json'));
    const base=findBasePython();const python=pythonAt(join(runtime,'python'));
    if(!existsSync(python)){console.log('创建技能专用 Python 环境');run(base,['-m','venv',join(runtime,'python')]);}
    const pythonLock=digest(requirementFile);let pythonHealthy=false;
    try{checkPythonRuntime(python);pythonHealthy=true;}catch{}
    if(repair||!pythonHealthy||old.pythonLock!==pythonLock){console.log('安装锁定的配音依赖');run(python,['-m','pip','install','--disable-pip-version-check','--require-hashes','-r',requirementFile],{timeout:900000});}
    const dependencyCheck=doctor().checks.filter(c=>Object.keys(packageSpec().dependencies).includes(c.name));
    if(repair||old.npmLock!==npmLock||dependencyCheck.some(c=>!c.ok)){console.log('安装锁定的渲染依赖');run(process.execPath,[npmCli(),'ci','--no-audit','--no-fund'],{timeout:900000});}
    console.log('准备渲染浏览器');
    const renderer=await import(pathToFileURL(join(projectRoot,'node_modules/@remotion/renderer/dist/index.js')).href);
    const browser=await renderer.ensureBrowser({logLevel:'info'});
    if(!browser.path)throw new Error(`浏览器准备失败：${browser.type}`);
    writeFileSync(stateFile,JSON.stringify({schemaVersion:1,node:process.execPath,python,browser:browser.path,npmLock,pythonLock,installedAt:new Date().toISOString()},null,2));
    return doctor();
  }finally{if(fd!==undefined){closeSync(fd);unlinkSync(lockFile);}}
}
if(process.argv[1]&&realpathSync(process.argv[1])===realpathSync(fileURLToPath(import.meta.url))){
  try{
    const report=process.argv.includes('--check')?doctor():await setup({repair:process.argv.includes('--repair')});
    if(process.argv.includes('--json'))console.log(JSON.stringify(report,null,2));
    else for(const c of report.checks)console.log(`${c.ok?'✅':'❌'} ${c.name}：${c.ok?c.detail:c.error}`);
    process.exitCode=report.ok?0:1;
  }catch(e){console.error(`初始化失败：${e.message}`);process.exitCode=1;}
}
