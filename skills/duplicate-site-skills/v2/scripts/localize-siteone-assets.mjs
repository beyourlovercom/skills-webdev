#!/usr/bin/env node
// Offline mirror same-origin asset rewrite; dry-run by default, isolated Pilot-only.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const dirwalk=(dir)=>fs.readdirSync(dir,{withFileTypes:true}).flatMap(v=>{
 const full=path.join(dir,v.name);
 return v.isDirectory()?dirwalk(full):(v.isFile()&&/\.(html|css)$/i.test(v.name)?[full]:[]);
});
export function rewriteAssets(text, origin){
 const host=new URL(origin).hostname;
 const base=['http://'+host+'/wp-content/','https://'+host+'/wp-content/'];
 let result=text, replaced=0;
 for(const prefix of base){
  const n=result.split(prefix).length-1;
  if(n){result=result.replaceAll(prefix,'/wp-content/');replaced+=n;}
 }
 return {text:result,replaced};
}
export function localize({workspace,manifest,apply=false}){
 const root=path.resolve(workspace);
 const m=JSON.parse(fs.readFileSync(manifest,'utf8'));
 if(m.schema_version!==2||m.execution?.scope!=='PILOT_SAMPLES'||
    !m.rights?.owner_attested||m.execution.enable_bulk!==false)throw Error('pilot rights/scope gate failed');
 const origin=new URL(m.source.origin);
 if(origin.protocol!=='https:')throw Error('source origin HTTPS required');
 const mirror=path.join(root,'mirror');
 if(!fs.statSync(mirror).isDirectory())throw Error('mirror not present');
 let changed=0,refs=0;
 const files=dirwalk(mirror);
 if(files.length>2000)throw Error('unexpected mirror size: abort');
 for(const f of files){
  const data=fs.readFileSync(f,'utf8');
  const out=rewriteAssets(data,origin.origin);
  refs+=out.replaced;
  if(!out.replaced)continue;
  changed++;
  if(apply){
   const rel=path.relative(mirror,f);
   const backup=path.join(root,'pre-localize',rel);
   fs.mkdirSync(path.dirname(backup),{recursive:true});
   fs.copyFileSync(f,backup,fs.constants.COPYFILE_EXCL);
   fs.writeFileSync(f,out.text,'utf8');
  }
 }
 return {status:apply?'APPLIED':'DRY_RUN',changed_files:changed,rewritten_asset_refs:refs,
   workspace:root,origin:origin.origin,production_write:false};
}
if(process.argv[1]&&fileURLToPath(import.meta.url)===path.resolve(process.argv[1])){
 try{
  const o={};
  for(const a of process.argv.slice(2)){
   if(a==='--apply')o.apply=true;
   else {const m=a.match(/^--(workspace|manifest)=(.+)$/);if(!m)throw Error('invalid argument '+a);o[m[1]]=m[2];}
  }
  if(!o.workspace||!o.manifest)throw Error('--workspace and --manifest required');
  console.log(JSON.stringify(localize(o),null,2));
 }catch(e){console.error(e.message);process.exitCode=2;}
}
