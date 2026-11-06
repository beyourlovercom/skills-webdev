#!/usr/bin/env node
// Safe bounded media completion for only source-referenced, same-origin /wp-content/ assets.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
const MEDIA_RE=/\/wp-content\/(?:uploads|themes|plugins)\/[a-z0-9_/.~+@%-]+?\.(?:webp|png|jpe?g|svg|avif|gif|woff2?|ttf|css|js)(?:\?[^\s"'<>),;]*)?/gi;
const MIME=/^(image\/|text\/css|text\/javascript|application\/javascript|font\/|application\/font|application\/octet-stream)/i;
const digest=b=>crypto.createHash('sha256').update(b).digest('hex');
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const sources=(folder)=>fs.readdirSync(folder,{withFileTypes:true}).flatMap(ent=>{
 const f=path.join(folder,ent.name);
 return ent.isDirectory()?sources(f):(ent.isFile()&&/\.(html|css)$/i.test(f)?[f]:[]);
});
export function planMissing({workspace,manifest}){
 const root=path.resolve(workspace);
 const m=JSON.parse(fs.readFileSync(manifest,'utf8'));
 if(m.schema_version!==2||m.execution?.scope!=='PILOT_SAMPLES'||m.execution?.enable_bulk!==false||
    m.rights?.owner_attested!==true)throw Error('pilot gate denied');
 const origin=new URL(m.source.origin);
 if(origin.protocol!=='https:' || origin.username||origin.password)throw Error('source URL gate denied');
 const mirror=path.join(root,'mirror');
 if(!fs.statSync(mirror).isDirectory())throw Error('missing mirror');
 const set=new Map();let paths=0;
 const eligible=sources(mirror);
 if(eligible.length>1000)throw Error('too many pages/assets in pilot');
 for(const f of eligible){
  const body=fs.readFileSync(f,'utf8');
  for(const a of body.matchAll(MEDIA_RE)){
   const raw=a[0];
   let u;
   try{u=new URL(raw,origin.origin);}catch{continue;}
   if(u.hostname!==origin.hostname)continue;
   let decoded;
   try{decoded=decodeURIComponent(u.pathname);}catch{continue;}
   const local=path.resolve(mirror,'.'+decoded);
   if(!local.startsWith(path.resolve(mirror)+path.sep))continue;
   if(!set.has(decoded))set.set(decoded,{path:decoded,url:u.href,local});
   paths++;
  }
 }
 const missing=[...set.values()].filter(x=>!fs.existsSync(x.local)).sort((a,b)=>a.path.localeCompare(b.path));
 return {origin:origin.origin,mirror,scanned_files:eligible.length,reference_count:paths,unique_assets:set.size,missing};
}
export async function complete({workspace,manifest,execute=false,max=150}){
 const p=planMissing({workspace,manifest});
 if(!execute)return {status:'DRY_RUN',missing:p.missing.length,unique:p.unique_assets,examples:p.missing.slice(0,12).map(x=>x.path)};
 if(!Number.isInteger(max)||max<1||max>300)throw Error('max must be 1..300');
 let done=0,failed=0;const outcomes=[];
 for(const item of p.missing.slice(0,max)){
  await wait(550); // no more than 2 requests per second
  let result={path:item.path,status:'FAIL'};
  try{
   const resp=await fetch(item.url,{signal:AbortSignal.timeout(25000),redirect:'manual',
     headers:{'User-Agent':'SiteMirrorV2/1.0 authorized local archive','Accept':'image/*,text/css,application/javascript,*/*;q=0.5'}});
   const mime=resp.headers.get('content-type')||'';
   const length=Number(resp.headers.get('content-length')||0);
   if(resp.status!==200)throw Error('HTTP_'+resp.status);
   if(!MIME.test(mime))throw Error('MIME_BLOCKED_'+mime);
   if(length>15000000)throw Error('ASSET_TOO_LARGE');
   const buffer=Buffer.from(await resp.arrayBuffer());
   if(buffer.length>15000000)throw Error('ASSET_TOO_LARGE');
   fs.mkdirSync(path.dirname(item.local),{recursive:true});
   fs.writeFileSync(item.local,buffer,{flag:'wx'});
   result={path:item.path,status:'DOWNLOADED',size:buffer.length,sha256:digest(buffer)};
   done++;
  }catch(e){failed++;result.error=String(e?.message||e).slice(0,160);}
  outcomes.push(result);
 }
 const report={status:'COMPLETED_WITH_RESIDUALS',fetched:done,failed,remaining_after_cap:Math.max(0,p.missing.length-max),
  missing_before:p.missing.length,unique_assets:p.unique_assets,request_cap:max,outcomes};
 fs.writeFileSync(path.join(path.resolve(workspace),'media-completion-report.json'),JSON.stringify(report,null,2));
 return {...report,outcomes:undefined,report:path.join(path.resolve(workspace),'media-completion-report.json')};
}
if(process.argv[1]&&fileURLToPath(import.meta.url)===path.resolve(process.argv[1])){
 const o={};
 try{
  for(const a of process.argv.slice(2)){if(a==='--execute')o.execute=true;else{
   const m=a.match(/^--(workspace|manifest|max)=(.+)$/);if(!m)throw Error('unknown arg '+a);o[m[1]]=m[1]==='max'?Number(m[2]):m[2];}}
  complete(o).then(x=>console.log(JSON.stringify(x,null,2))).catch(e=>{console.error(e.message);process.exitCode=2});
 }catch(e){console.error(e.message);process.exitCode=2;}
}
