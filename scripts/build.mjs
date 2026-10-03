import {build} from 'esbuild';
import {chmodSync,mkdirSync,writeFileSync,existsSync,readFileSync,readdirSync} from 'node:fs';
import {join} from 'node:path';
const packages=new Set();
for(const name of ['server','worker']){
 const result=await build({entryPoints:['src/'+name+'.mjs'],bundle:true,platform:'node',format:'esm',target:'node20',outfile:'dist/'+name+'.mjs',metafile:true,banner:{js:'#!/usr/bin/env node\nimport { createRequire as __createRequire } from "node:module"; const require = __createRequire(import.meta.url);'},legalComments:'eof'});
 chmodSync('dist/'+name+'.mjs',0o755);
 for(const path of Object.keys(result.metafile.inputs)) {const match=path.match(/node_modules\/(?:(@[^/]+\/[^/]+)|([^/]+))/);if(match)packages.add(match[1]||match[2]);}
}
mkdirSync('licenses',{recursive:true});
for(const name of packages){const root=join('node_modules',name);const files=readdirSync(root).filter(f=>/^(licen[cs]e|copying)(\.|$)/i.test(f));if(!files.length)throw new Error('缺少依赖许可 '+name);let text='Package: '+name+'\n';for(const file of files)text+='\n'+file+'\n'+readFileSync(join(root,file),'utf8')+'\n';writeFileSync(join('licenses',name.replaceAll('/','-')+'.txt'),text);}
console.log('已保留 '+packages.size+' 个打包组件的完整许可');
