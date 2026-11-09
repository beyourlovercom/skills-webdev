#!/usr/bin/env node
/**
 * V3.1 inventory -> private Local manifest seed.
 * Discovery only: never grants Owner visual, browser, publication or template approval.
 * No HTTP, SiteOne, PWC or browser access.
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {pathToFileURL} from 'node:url';
import {routePath} from './skills-v31-gate.mjs';
const digest=b=>crypto.createHash('sha256').update(b).digest('hex');
const safe=(root,p)=>{
 if(typeof p!=='string'||!p||path.isAbsolute(p)||p.includes('\\')||
    p.split('/').some(x=>!x||x==='.'||x==='..'))throw Error('UNSAFE_LOCAL_RELATIVE_PATH');
 const file=path.resolve(root,p);
 if(!file.startsWith(root+path.sep))throw Error('OUTSIDE_LOCAL_ROOT');
 let current=file;
 while(current!==root){
  if(fs.existsSync(current)){
   const actual=fs.realpathSync(current);
   if(actual!==root&&!actual.startsWith(root+path.sep))throw Error('SYMLINK_ESCAPE');
  }
  current=path.dirname(current);
 }
 return file;
};
function routeFile(p){return p==='/'?'index.html':p.endsWith('/')?p.slice(1)+'index.html':p.slice(1);}
export function seed(inventory,options){
 const root=fs.realpathSync(path.resolve(options.root));
 const inventoryFile=fs.realpathSync(path.resolve(options.inventory));
 if(!options.project_id||!(/^[A-Za-z0-9_-]{3,60}$/).test(options.project_id))throw Error('INVALID_PROJECT_ID');
 if(!options.authorization_ref||options.authorization_ref.trim().length<12)throw Error('AUTHORIZATION_REFERENCE_REQUIRED');
 if(options.approved!==true)throw Error('EXPLICIT_SCOPE_APPROVAL_REQUIRED');
 if(!['MIRROR','WORDPRESS'].includes(options.site_mode))throw Error('INVALID_SITE_MODE');
 if(!Array.isArray(inventory.routes)||!inventory.routes.length)throw Error('MISSING_ROUTES');
 const inputRoots=options.input_roots||['mirror'];
 if(!inputRoots.length)throw Error('MISSING_INPUT_ROOTS');
 inputRoots.forEach(x=>safe(root,x+'/index-placeholder'));
 const routes=new Map(),templates={};
 for(const row of inventory.routes){
  const p=routePath(row.path);
  if(routes.has(p))throw Error('DUPLICATE_SOURCE_ROUTE '+p);
  const t=String(row.template||row.template_group||'unclassified');
  if(!/^[a-zA-Z0-9_-]{2,80}$/.test(t))throw Error('INVALID_TEMPLATE '+p);
  const candidates=inputRoots.map(prefix=>prefix+'/'+routeFile(p));
  let file=null,rel=null;
  for(const candidate of candidates){
   const fn=safe(root,candidate);
   if(fs.existsSync(fn)&&fs.statSync(fn).isFile()){file=fn;rel=candidate;}
  }
  const route={
   path:p,template:t,local_file:rel||candidates[candidates.length-1],
   artifact_sha256:file?digest(fs.readFileSync(file)):null,
   evidence:{method:'NOT_VERIFIED'},resources:[],links:[],dependencies:[]
  };
  routes.set(p,route);
  if(!templates[t])templates[t]={sha256:null,
   owner_approval:{status:'OPEN',evidence_ref:null,template_sha256:null}};
 }
 const paths=[...routes.keys()].sort();
 const manifest={
  schema_version:'3.1',project_id:options.project_id,environment:'local',
  site_mode:options.site_mode,
  authorized_scope:{source_approved:true,routes_frozen:true,
   authorization_ref:options.authorization_ref,
   source_snapshot_sha256:digest(fs.readFileSync(inventoryFile)),
   expected_route_count:routes.size,
   route_list_sha256:digest(JSON.stringify(paths)),
   source_hosts:options.source_hosts||[]},
  visual_threshold:0.97,templates,routes:paths.map(p=>routes.get(p)),
  navigation_sources:[],asset_roots:options.asset_roots||['mirror'],
  seed_note:'DISCOVERY_ONLY: All template approvals, browser scores, interactions and links are OPEN. Do not use HTTP/HTML counts as PASS.'
 };
 return {manifest,summary:{discovered:routes.size,files_found:manifest.routes.filter(x=>x.artifact_sha256).length,
  files_pending:manifest.routes.filter(x=>!x.artifact_sha256).length,
  templates:Object.keys(templates).length,preview_only:true,owner_visual_pass:0}};
}
function main(args){
 const flags=Object.fromEntries(args.filter(a=>a.startsWith('--')&&a.includes('=')).map(a=>{
  const n=a.indexOf('=');return [a.slice(2,n),a.slice(n+1)];
 }));
 if(!flags.root||!flags.inventory||!flags.out||!flags.project||!flags['authorization-ref'])throw Error('REQUIRED_ROOT_INVENTORY_OUTPUT_PROJECT_AUTHORIZATION');
 const root=fs.realpathSync(path.resolve(flags.root));
 const output=path.resolve(flags.out);
 if(!output.startsWith(root+path.sep+'uat'+path.sep)&&output!==path.join(root,'uat','v31-site-manifest.json'))
  throw Error('PRIVATE_UAT_OUTPUT_ONLY');
 safe(root,path.relative(root,output).replaceAll(path.sep,'/'));
 if(!args.includes('--scope-approved'))throw Error('EXPLICIT_SCOPE_APPROVAL_REQUIRED');
 if(fs.existsSync(output))throw Error('NO_OVERWRITE_EXISTING_MANIFEST');
 const raw=JSON.parse(fs.readFileSync(flags.inventory,'utf8').replace(/^\uFEFF/,''));
 const options={root,inventory:flags.inventory,project_id:flags.project,
  authorization_ref:flags['authorization-ref'],approved:true,
  site_mode:flags['mode']||'MIRROR',
  input_roots:flags.roots?.split(';'),asset_roots:flags.assets?.split(';'),
  source_hosts:flags.hosts?.split(';')||[]};
 const {manifest,summary}=seed(raw,options);
 fs.mkdirSync(path.dirname(output),{recursive:true});
 fs.writeFileSync(output,JSON.stringify(manifest,null,2)+'\n',{flag:'wx'});
 console.log(JSON.stringify({...summary,manifest:output},null,2));
}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href){
 try{main(process.argv.slice(2));}catch(e){console.error(e.message);process.exitCode=2;}
}
