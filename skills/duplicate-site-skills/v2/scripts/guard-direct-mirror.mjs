#!/usr/bin/env node
// Local-only three-page SiteOne mirror guard. Default dry-run; only existing files.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const ROUTES={home:['/','index.html'],services:['/services/','services/index.html'],cnc:['/services/cnc-machining/','services/cnc-machining/index.html']};
const CSP="default-src 'self' data: blob:; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; connect-src 'self'; img-src 'self' data: blob:; media-src 'self' data: blob:; font-src 'self' data:; form-action 'none'; frame-src 'self'";
const META='<meta http-equiv="Content-Security-Policy" content="'+CSP+'">';
const SCRIPT=`<script data-v2-local-mirror-readonly>(function(){
'use strict';
const allowed=new Set(['/','/services/','/services/cnc-machining/']);
function normalize(p){
 if(p.endsWith('/index.html'))p=p.slice(0,-10);
 else if(p.endsWith('.html'))p=p.slice(0,-5)+'/';
 return p.endsWith('/')?p:p+'/';
}
function warn(){
 if(document.getElementById('v2-readonly-warning'))return;
 const div=document.createElement('div');
 div.id='v2-readonly-warning';
 div.textContent='本地只读 Canary：仅开放三个样本。真实报价、登录和其他页面已禁用。';
 div.style.cssText='position:fixed;bottom:12px;left:12px;right:12px;z-index:2147483647;background:#fff6e9;color:#603f10;border:1px solid #ddad6b;padding:12px;border-radius:8px;box-shadow:0 2px 10px #0002;font:14px sans-serif';
 document.body.appendChild(div);
}
document.addEventListener('click',function(e){
 const a=e.target?.closest?.('a[href]');if(!a)return;
 const raw=a.getAttribute('href')||'';if(raw.startsWith('#'))return;
 let u;try{u=new URL(raw,location.href);}catch{return;}
 const next=normalize(u.pathname);
 const fromSource=['www.rapiddirect.com','rapiddirect.com'].includes(u.hostname);
 const fromLocal=u.origin===location.origin;
 if((!fromSource&&!fromLocal)||!allowed.has(next)){
   e.preventDefault();e.stopImmediatePropagation();warn();return;
 }
 if(fromSource){e.preventDefault();e.stopImmediatePropagation();location.assign(location.origin+next+u.hash);}
},true);
document.addEventListener('submit',function(e){e.preventDefault();e.stopImmediatePropagation();warn();},true);
})();</script>`;
export function guardHtml(html){
 if(typeof html!=='string'||!/<head\b[^>]*>/i.test(html))throw Error('HTML head missing');
 let result=html;
 if(!/<meta\s+http-equiv=["']Content-Security-Policy["']/i.test(result))
  result=result.replace(/<head\b[^>]*>/i,m=>m+'\n'+META);
 if(!result.includes('data-v2-local-mirror-readonly'))
  result=result.replace(/<head\b[^>]*>/i,m=>m+'\n'+SCRIPT);
 return result;
}
function inside(root,f){const x=path.relative(root,f);return !!x&&!x.startsWith('..'+path.sep)&&x!=='..'&&!path.isAbsolute(x)}
export function guardMirror({workspace,manifest,execute=false}){
 if(!workspace||!manifest)throw Error('workspace/manifest required');
 const root=fs.realpathSync(path.resolve(workspace));
 const mf=JSON.parse(fs.readFileSync(path.resolve(manifest),'utf8'));
 if(mf.schema_version!==2||mf.rights?.owner_attested!==true||
    mf.execution?.scope!=='PILOT_SAMPLES'||mf.execution?.enable_bulk!==false||
    mf.execution?.allow_production_write!==false||mf.approvals?.main_merge!==false||
    mf.approvals?.owner_visual_pass!==false)throw Error('PILOT_SCOPE_GATE');
 const samples=mf.source?.samples||[];
 if(samples.length!==3||new Set(samples.map(s=>s.id)).size!==3||
    samples.some(s=>!ROUTES[s.id]||ROUTES[s.id][0]!==s.path))throw Error('THREE_EXACT_SAMPLE_GATE');
 const mirror=path.join(root,'mirror');const backup=path.join(root,'uat','pre-direct-mirror-guard');
 if(!fs.statSync(mirror).isDirectory())throw Error('MIRROR_MISSING');
 const files=samples.map(s=>({id:s.id,file:path.join(mirror,ROUTES[s.id][1])}));
 // Preflight all three before any local write.
 for(const x of files)if(!fs.existsSync(x.file)||!inside(root,fs.realpathSync(x.file)))
   throw Error('MISSING_OR_ESCAPE_'+x.id);
 const patches=files.map(x=>({...x,content:guardHtml(fs.readFileSync(x.file,'utf8'))}));
 let changed=0;
 for(const p of patches){
  const old=fs.readFileSync(p.file,'utf8');
  if(old===p.content)continue;
  changed++;
  if(execute){
   const save=path.join(backup,path.relative(mirror,p.file));
   fs.mkdirSync(path.dirname(save),{recursive:true});
   if(!fs.existsSync(save))fs.copyFileSync(p.file,save,fs.constants.COPYFILE_EXCL);
   fs.writeFileSync(p.file,p.content,'utf8');
  }
 }
 return {status:execute?'LOCAL_GUARDED':'DRY_RUN',workspace:root,changed_files:changed,
   source_write:false,bulk:false,warning:'CSP/link/form protection is defense in depth; browser network isolation remains required for UAT'};
}
if(process.argv[1]&&fileURLToPath(import.meta.url)===path.resolve(process.argv[1])){
 try{
  const a={};
  for(const x of process.argv.slice(2)){
   if(x==='--execute')a.execute=true;
   else{const m=x.match(/^--(workspace|manifest)=(.+)$/);if(!m)throw Error('unknown arg '+x);a[m[1]]=m[2];}
  }
  console.log(JSON.stringify(guardMirror(a),null,2));
 }catch(e){console.error(e.message);process.exitCode=2;}
}
