import {Client} from '@modelcontextprotocol/sdk/client/index.js';
import {StdioClientTransport} from '@modelcontextprotocol/sdk/client/stdio.js';
import {join,resolve} from 'node:path';import {mkdirSync,writeFileSync,unlinkSync,readFileSync,existsSync} from 'node:fs';
const home=resolve('qa-data');mkdirSync(home,{recursive:true});const entry=resolve('artifacts/packed/package/dist/server.mjs');
const env={...process.env,QINGHUA_SKILLS_HOME:home,QINGHUA_FORCE_MANAGED_PYTHON:'1'};let client;
async function connect(){client=new Client({name:'release-qa',version:'1.0.0'});await client.connect(new StdioClientTransport({command:process.execPath,args:[entry],env,stderr:'pipe'}));}
const call=async(name,args={})=>{const r=await client.callTool({name,arguments:args});if(r.isError)throw new Error(JSON.stringify(r));return r.structuredContent;};
const results=[];
async function wait(id){let phase='';for(let i=0;i<1200;i++){const job=await call('get_task_status',{jobId:id});if(job.phase!==phase){console.log(job.action+': '+job.phase);phase=job.phase;}if(job.state==='completed'){results.push(job);return job;}if(!['queued','running'].includes(job.state))throw new Error(JSON.stringify(job));await new Promise(r=>setTimeout(r,2000));}throw new Error('等待任务超时');}
try{
 await connect();console.log('正式npm打包入口MCP连接成功');const t=Date.now();const initial=await call('initialize_skill');console.log('初始化返回耗时',Date.now()-t,'ms',initial.jobId);const busy=await call('initialize_skill');if(!busy.busy)throw new Error('并行安装未被阻止');await client.close();await connect();console.log('重连后继续查询既有任务');await wait(initial.jobId);const doctor=await call('check_environment');if(!doctor.ok)throw new Error(JSON.stringify(doctor));console.log('环境检查',doctor.checks.length,'项全绿，独立Python',doctor.basePython.path);
 const smoke=await wait((await call('create_test_video')).jobId);console.log('测试片',JSON.stringify(smoke.result));
 const guide=await call('get_skill_guide');const render=await wait((await call('render_card_video',{script:guide.scriptExample,landscape:false})).jobId);console.log('免费配音片',render.result.path);
 writeFileSync(join(doctor.skillDir,'.env'),'LOCAL_PLACEHOLDER=not-a-credential');unlinkSync(join(doctor.skillDir,'package.json'));const broken=await call('check_environment');if(broken.ok)throw new Error('未发现损坏文件');await wait((await call('repair_skill')).jobId);const repaired=await call('check_environment');if(!repaired.ok)throw new Error('修复未通过');if(readFileSync(join(doctor.skillDir,'.env'),'utf8')!=='LOCAL_PLACEHOLDER=not-a-credential')throw new Error('修复覆盖了配置');console.log('损坏文件修复通过，保留配置');
 const final={ok:true,platform:process.platform,arch:process.arch,entry,doctor:repaired,jobs:results,completedAt:new Date().toISOString()};writeFileSync('artifacts/qa-result.json',JSON.stringify(final,null,2));console.log('实际发布包验收完成');
}catch(e){console.error(e.stack);writeFileSync('artifacts/qa-failure.txt',e.stack);process.exitCode=1;}finally{await client?.close();}
