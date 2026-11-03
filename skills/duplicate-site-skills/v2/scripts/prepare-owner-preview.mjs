#!/usr/bin/env node
// V2: prepare the already-authorized three-page PWC review bridge in Windows Local.
// No crawling, no source-site writes, no npm installation, no server startup.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const SELF_DIR=path.dirname(fileURLToPath(import.meta.url));
const TEMPLATE=path.resolve(SELF_DIR,'../templates/local-review-bridge/Section12Section.jsx');
const CSP="default-src 'self' data: blob:; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; connect-src 'self'; img-src 'self' data: blob:; media-src 'self' data: blob:; font-src 'self' data:; form-action 'none'; frame-src 'self'";
const CSP_TAG='<meta http-equiv="Content-Security-Policy" content="'+CSP+'">';
const BASE_TAG='<base href="/">';

export function addOfflineGuards(source){
  if(typeof source!=='string'||!/<head\b[^>]*>/i.test(source))throw new Error('HTML head missing');
  let result=source;
  const head=/<head\b[^>]*>/i;
  if(!/<base\s+href=["']\/["']\s*\/?>/i.test(result))result=result.replace(head, m=>m+'\n'+BASE_TAG);
  if(!/<meta\s+http-equiv=["']Content-Security-Policy["']/i.test(result))result=result.replace(head,m=>m+'\n'+CSP_TAG);
  return result;
}
function inside(root,target){
  const rel=path.relative(root,target);
  return rel!==''&&!rel.startsWith('..'+path.sep)&&rel!=='..'&&!path.isAbsolute(rel);
}
function putIfChanged(filepath,content,backupRoot,root,apply){
  if(!inside(root,filepath))throw Error('Write outside workspace refused: '+filepath);
  // Reject symlinked files or parents that resolve outside the isolated workspace.
  const existing=fs.existsSync(filepath)?fs.realpathSync(filepath):null;
  let parent=path.dirname(filepath);
  while(!fs.existsSync(parent)){
    const next=path.dirname(parent);
    if(next===parent)throw Error('Unresolvable parent path: '+filepath);
    parent=next;
  }
  const existingParent=fs.realpathSync(parent);
  if((existing&&!inside(root,existing)) || (!inside(root,existingParent)&&existingParent!==root))
    throw Error('Symlink escape outside workspace refused: '+filepath);
  const before=fs.existsSync(filepath)?fs.readFileSync(filepath,'utf8'):null;
  if(before===content)return {changed:false,action:'UNCHANGED'};
  if(apply){
    if(before!==null){
      const target=path.join(backupRoot,path.relative(root,filepath));
      fs.mkdirSync(path.dirname(target),{recursive:true});
      if(!fs.existsSync(target))fs.writeFileSync(target,before,{flag:'wx'});
    }
    fs.mkdirSync(path.dirname(filepath),{recursive:true});
    fs.writeFileSync(filepath,content,'utf8');
  }
  return {changed:true,action:apply?'UPDATED':'WOULD_UPDATE'};
}
export function prepareReview({workspace,manifest,apply=false}){
  if(!workspace||!manifest)throw new Error('workspace and manifest are required');
  const root=fs.realpathSync(path.resolve(workspace));
  const m=JSON.parse(fs.readFileSync(path.resolve(manifest),'utf8'));
  if(m.schema_version!==2||m.execution?.scope!=='PILOT_SAMPLES'||
     m.rights?.owner_attested!==true||m.execution?.allow_production_write!==false||
     m.execution?.enable_bulk!==false||m.approvals?.owner_visual_pass!==false)throw new Error('V2 pilot rights and no-batch gate denied');
  const required=new Set(['home','services','cnc']);
  const names=(m.source?.samples||[]).map(s=>s.id);
  if(names.length!==3||new Set(names).size!==3||names.some(n=>!required.has(n)))throw new Error('Exactly three approved home/services/cnc samples required');
  const app=path.join(root,'pwc-build','review-app');
  const publicDir=path.join(app,'public','snapshots');
  const component=path.join(app,'src','components','sections','section-12','Section12Section.jsx');
  const backup=path.join(root,'uat','pre-v2-guard-originals');
  if(!fs.existsSync(path.join(app,'package.json')))throw new Error('PWC React scaffold not available');
  // Preflight every input before making the first local write. A missing third
  // sample must not leave the first two snapshots partially patched.
  const files=names.map(n=>({id:n,file:path.join(publicDir,n+'.html')}));
  for(const item of files){
    if(!fs.existsSync(item.file))throw new Error('Missing existing authorized snapshot: '+item.id);
    if(!inside(root,fs.realpathSync(item.file)))throw Error('Symlink escape outside workspace refused: '+item.id);
  }
  if(!fs.existsSync(TEMPLATE))throw new Error('Review bridge template missing');
  const jsx=fs.readFileSync(TEMPLATE,'utf8');
  if(!jsx.includes('snapshot')||!jsx.includes('preventDefault')||!jsx.includes('allow-same-origin'))throw Error('Review bridge template fails safety precheck');
  const prepared=files.map(item=>({id:item.id,file:item.file,content:addOfflineGuards(fs.readFileSync(item.file,'utf8'))}));
  const patches=prepared.map(item=>({id:item.id,...putIfChanged(item.file,item.content,backup,root,apply)}));
  const bridge=putIfChanged(component,jsx,backup,root,apply);
  return {status:apply?'LOCAL_GUARDED':'DRY_RUN',workspace:root,snapshots:patches,
    component:bridge,production_write:false,bulk:false,
    next:'Run npm.cmd run build from isolated review-app, then run Playwright UAT; do not treat build as Owner visual PASS'};
}
function readArgv(argv){
  const opts={};
  for(const x of argv){
    if(x==='--execute'){opts.apply=true;continue;}
    const m=x.match(/^--(workspace|manifest)=(.+)$/);
    if(!m)throw new Error('Unknown argument: '+x);
    opts[m[1]]=m[2];
  }
  return opts;
}
if(process.argv[1]&&fileURLToPath(import.meta.url)===path.resolve(process.argv[1])){
  try{console.log(JSON.stringify(prepareReview(readArgv(process.argv.slice(2))),null,2))}
  catch(err){console.error(err.message);process.exitCode=2}
}
