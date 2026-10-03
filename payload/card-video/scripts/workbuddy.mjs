#!/usr/bin/env node
import {existsSync,readFileSync,writeFileSync,mkdirSync,openSync,closeSync,unlinkSync,realpathSync} from 'node:fs';
import {join,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {projectRoot,run,findPython,findFFprobe} from './runtime.mjs';
import {doctor,setup} from './setup.mjs';
import {readProject,writeManifest} from './project.mjs';

export function hasMiniMaxConfiguration({env=process.env,envFile=join(projectRoot,'.env')}={}) {
  const values={};
  if(existsSync(envFile))for(const line of readFileSync(envFile,'utf8').split(/\r?\n/)){
    const clean=line.trim();if(!clean||clean.startsWith('#')||!clean.includes('='))continue;
    const at=clean.indexOf('=');let value=clean.slice(at+1).trim();
    if((value.startsWith('"')&&value.endsWith('"'))||(value.startsWith("'")&&value.endsWith("'")))value=value.slice(1,-1);
    values[clean.slice(0,at).trim()]=value.trim();
  }
  Object.assign(values,env);
  return ['MINIMAX_API_KEY','MINIMAX_GROUP_ID','MINIMAX_VOICE_ID'].every(key=>typeof values[key]==='string'&&values[key].trim().length>0);
}
export function prepareSilentManifest(project) {
  writeManifest(project,{provider:'none',audioFiles:project.script.slides.map(()=>''),slideDurations:project.script.slides.map(slide=>slide.duration||3),silent:true,silentAllowed:true,failedSlides:[]});
}

function ensureReady(){const report=doctor();if(!report.ok)throw new Error('环境未就绪：'+report.checks.filter(x=>!x.ok).map(x=>x.name).join('、')+'。请先运行 bootstrap.py setup。');}
function option(args,name,fallback){const i=args.indexOf(name);return i<0?fallback:args[i+1];}
function tone(path,seconds,frequency){
  const rate=24000,count=Math.round(rate*seconds),buffer=Buffer.alloc(44+count*2);
  buffer.write('RIFF');buffer.writeUInt32LE(36+count*2,4);buffer.write('WAVEfmt ',8);buffer.writeUInt32LE(16,16);buffer.writeUInt16LE(1,20);buffer.writeUInt16LE(1,22);buffer.writeUInt32LE(rate,24);buffer.writeUInt32LE(rate*2,28);buffer.writeUInt16LE(2,32);buffer.writeUInt16LE(16,34);buffer.write('data',36);buffer.writeUInt32LE(count*2,40);
  for(let i=0;i<count;i++)buffer.writeInt16LE(Math.round(Math.sin(i*2*Math.PI*frequency/rate)*1800*Math.min(1,i/1200,(count-i)/1200)),44+i*2);
  writeFileSync(path,buffer);
}
export function verifyVideo(path,{duration,width=1080,height=1920,audio=true}={}){
  const probe=JSON.parse(run(findFFprobe(),['-v','error','-show_streams','-show_format','-of','json',path],{capture:true}));
  const video=probe.streams.find(s=>s.codec_type==='video');
  if(!video||video.width!==width||video.height!==height)throw new Error('成片尺寸验收失败');
  if(audio&&!probe.streams.some(s=>s.codec_type==='audio'))throw new Error('成片没有音轨');
  if(audio===false&&probe.streams.some(s=>s.codec_type==='audio'))throw new Error('静音方案仍有音轨，验收失败');
  if(duration!==undefined&&Math.abs(Number(probe.format.duration)-duration)>0.15)throw new Error('成片时长验收失败');
  return {path,width:video.width,height:video.height,duration:Number(probe.format.duration),audio:probe.streams.some(s=>s.codec_type==='audio'),bytes:Number(probe.format.size)};
}
async function main(){
  const [action,...args]=process.argv.slice(2);
  if(action==='doctor'){const r=doctor();console.log(JSON.stringify(r,null,2));process.exitCode=r.ok?0:1;return;}
  if(action==='setup'){const r=await setup({repair:args.includes('--repair')});console.log(JSON.stringify(r,null,2));process.exitCode=r.ok?0:1;return;}
  if(!['smoke','run'].includes(action))throw new Error('用法：bootstrap.py setup | doctor | smoke [--project 绝对目录] | run <script.json> [--project 绝对目录] [--tts edge|minimax|auto|none]');
  ensureReady();
  if(action==='smoke'){
    const dir=resolve(option(args,'--project',join(projectRoot,'work','安装验收')));mkdirSync(dir,{recursive:true});
    const input=join(dir,'smoke-script.json');
    writeFileSync(input,JSON.stringify({slides:[{lines:[{text:'环境安装验收',style:'title'},{text:'中文字体 · 卡片动画',style:'body'}],narration:'',duration:5},{lines:[{text:'视频与音轨正常',style:'title'},{text:'十秒测试片，不调用付费服务',style:'body'}],narration:'',duration:5}]},null,2));
    const project=readProject(input,dir);
    tone(join(project.audioDir,'smoke-0.wav'),5,440);tone(join(project.audioDir,'smoke-1.wav'),5,554.37);
    writeManifest(project,{audioFiles:['audio/smoke-0.wav','audio/smoke-1.wav'],slideDurations:[5,5],provider:'test-tone',silent:false,failedSlides:[]});
    run(process.execPath,[join(projectRoot,'scripts/render-card.mjs'),input,'--project',dir]);
    const result=verifyVideo(join(dir,'output.mp4'),{duration:10});
    writeFileSync(join(dir,'验收结果.json'),JSON.stringify({ok:true,kind:'local-render-smoke',ttsNetworkTested:false,...result},null,2));
    console.log(JSON.stringify({ok:true,...result},null,2));return;
  }
  const input=args[0];if(!input||input.startsWith('--'))throw new Error('请提供文案 JSON 文件');
  const project=readProject(resolve(input),option(args,'--project',undefined));
  const projectArgs=['--project',project.dir];
  let fd;const lock=join(project.dir,'.job.lock');
  try{
    fd=openSync(lock,'wx');
    let provider=option(args,'--tts','auto');
    if(!['auto','edge','minimax','none'].includes(provider))throw new Error('未知配音方案');
    if(provider==='auto')provider=hasMiniMaxConfiguration()?'minimax':'edge';
    if(provider==='minimax')run(findPython(),[join(projectRoot,'scripts/generate_tts_minimax.py'),resolve(input),...projectArgs],{env:{CARD_FFPROBE:findFFprobe()},timeout:900000});
    else if(provider==='edge')run(process.execPath,[join(projectRoot,'scripts/generate-tts.mjs'),resolve(input),...projectArgs],{timeout:900000});
    else {
      if(!args.includes('--allow-silent'))throw new Error('静音方案需要显式 --allow-silent');
      prepareSilentManifest(project);
    }
    const renderArgs=[join(projectRoot,'scripts/render-card.mjs'),resolve(input),...projectArgs];
    for(const flag of ['--landscape','--allow-silent'])if(args.includes(flag))renderArgs.push(flag);
    run(process.execPath,renderArgs,{timeout:1800000});
    const landscape=args.includes('--landscape');
    const result=verifyVideo(join(project.dir,'output.mp4'),{width:landscape?1280:1080,height:landscape?720:1920,audio:provider!=='none'});
    console.log(JSON.stringify({ok:true,provider,...result},null,2));
  }finally{if(fd!==undefined){closeSync(fd);unlinkSync(lock);}}
}
if(process.argv[1]&&realpathSync(process.argv[1])===realpathSync(fileURLToPath(import.meta.url)))main().catch(e=>{console.error(`执行失败：${e.message}`);process.exitCode=1;});
