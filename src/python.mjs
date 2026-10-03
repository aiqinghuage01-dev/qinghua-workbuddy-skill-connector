import {createWriteStream,existsSync,mkdirSync,renameSync,readFileSync} from 'node:fs';
import {join,resolve,dirname,relative,isAbsolute} from 'node:path';
import {createHash} from 'node:crypto';
import {Readable,Transform} from 'node:stream';
import {pipeline} from 'node:stream/promises';
import * as tar from 'tar';
import {HOME,ROOT,platformKey,findPython} from './runtime.mjs';
export function archiveName(key){return {'darwin-arm64':'aarch64-apple-darwin','darwin-x64':'x86_64-apple-darwin','win32-x64':'x86_64-pc-windows-msvc','linux-x64':'x86_64-unknown-linux-gnu','linux-arm64':'aarch64-unknown-linux-gnu'}[key];}
export function safeEntry(destination,name,entry){const within=(p)=>{const r=relative(destination,resolve(destination,p));return r!== '..'&&!r.startsWith('..'+(process.platform==='win32'?'\\':'/'))&&!isAbsolute(r);};if(isAbsolute(name)||!within(name))throw new Error('归档包含越界路径');if(['SymbolicLink','Link'].includes(entry.type)){const target=entry.type==='SymbolicLink'?join(dirname(name),entry.linkpath):entry.linkpath;if(isAbsolute(entry.linkpath)||!within(target))throw new Error('归档包含越界链接');}else if(!['File','Directory','OldFile','ContiguousFile'].includes(entry.type))throw new Error('不支持的归档成员类型：'+entry.type);return true;}
export async function downloadArchive(meta,file,{fetcher=fetch,phase=()=>{},retryDelay=2000}={}){
 for(let attempt=1;attempt<=3;attempt++){
  try{
   const r=await fetcher(meta.url,{signal:AbortSignal.timeout(600000),headers:{'Accept-Encoding':'identity'}});
   if(!r.ok){const e=new Error('HTTP '+r.status);e.permanent=r.status>=400&&r.status<500&&r.status!==429;throw e;}
   if(!r.body)throw new Error('下载无响应');let bytes=0;
   const limit=new Transform({transform(chunk,encoding,next){bytes+=chunk.length;if(bytes>256*1024*1024)next(new Error('安装包超过大小限制'));else next(null,chunk);}});
   await pipeline(Readable.fromWeb(r.body),limit,createWriteStream(file+'.part',{mode:0o600}));
   const hash=createHash('sha256').update(readFileSync(file+'.part')).digest('hex');
   if(hash!==meta.sha256){const e=new Error('Python SHA256 不匹配，已停止安装');e.permanent=true;throw e;}
   renameSync(file+'.part',file);return;
  }catch(e){
   const reason=e.message+(e.cause?.code?' / '+e.cause.code:'');
   if(e.permanent||attempt===3)throw new Error('Python 下载失败：'+reason+'。请检查 GitHub 下载网络后重试；未执行未经校验的文件。');
   phase('Python 下载中断，正在重试（'+attempt+'/3）：'+reason);
   await new Promise(r=>setTimeout(r,retryDelay*attempt));
  }
 }
}
export async function ensurePython(phase){const found=await findPython();if(found)return found.path;const key=platformKey();const lock=JSON.parse(readFileSync(join(ROOT,'python-lock.json'),'utf8'));const meta=lock.archives.find(x=>x.name.includes('-'+archiveName(key)+'-'));if(!meta||!/^[a-f0-9]{64}$/.test(meta.sha256))throw new Error('缺少此平台的受校验 Python 包');phase('下载受校验的独立 Python '+lock.version);const cache=join(HOME,'runtime','downloads');mkdirSync(cache,{recursive:true});const file=join(cache,meta.name);if(!existsSync(file)||createHash('sha256').update(readFileSync(file)).digest('hex')!==meta.sha256)await downloadArchive(meta,file,{phase});phase('解压独立 Python');const destination=join(HOME,'runtime','python',key);mkdirSync(destination,{recursive:true});await tar.x({file,cwd:destination,strict:true,filter:(name,entry)=>safeEntry(destination,name,entry)});const python=await findPython();if(!python)throw new Error('Python 解压后无法运行 venv/ensurepip，请查看系统限制');return python.path;}
