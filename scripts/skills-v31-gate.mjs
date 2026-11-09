#!/usr/bin/env node
/**
 * Andy Skills V3.1 read-only Local acceptance coordinator.
 * Reuses PR15 (batch gate), PR16 (mirror/browser canaries), PR17 (final build).
 * It does NOT capture pages, synthesize evidence, publish, or bypass approvals.
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {pathToFileURL} from 'node:url';

export const VERSION='3.1.0-rc.1';
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const REQUIRED=['visual','interaction','assets','content','security'];
const PASS='PASS';
export function routePath(raw){
  if(typeof raw!=='string'||!raw.startsWith('/')||raw.startsWith('//')||raw.includes('\\')||
     raw.includes('?')||raw.includes('#')||raw.includes('//')||/%2f|%5c|%2e/i.test(raw)||
     raw.split('/').some(x=>x==='..'||x==='.'))throw Error('UNSAFE_ROUTE');
  let p=raw.replace(/\/index\.html$/,'/');
  if(!/\.[^/]+$/.test(p)&&!p.endsWith('/'))p+='/';
  return p;
}
function safeFile(root,rel){
  if(typeof rel!=='string'||!rel||path.isAbsolute(rel)||rel.includes('\\')||
     rel.split('/').some(x=>x===''||x==='.'||x==='..'))throw Error('UNSAFE_FILE_PATH');
  const dest=path.resolve(root,rel);
  if(!dest.startsWith(root+path.sep))throw Error('OUTSIDE_LOCAL_ROOT');
  let current=dest;
  while(current!==root){
    if(fs.existsSync(current)){
      const actual=fs.realpathSync(current);
      if(actual!==root&&!actual.startsWith(root+path.sep))throw Error('SYMLINK_ESCAPE');
    }
    current=path.dirname(current);
  }
  return dest;
}
function fileEvidence(root,rel,expected){
  const name=safeFile(root,rel);
  if(!fs.existsSync(name))return {present:false,reason:'MISSING_FILE'};
  if(!fs.statSync(name).isFile())return {present:false,reason:'NOT_FILE'};
  const actual=sha(fs.readFileSync(name));
  return {present:true,sha256:actual,hash_ok:typeof expected==='string'&&expected===actual};
}
function checkedBrowser(e,threshold){
  const v=e?.visual||{};
  const good=side=>Number.isFinite(v[side]?.score)&&v[side].score>=threshold&&
      v[side].masks===0&&v[side].viewport_verified===true;
  return e?.method==='real-browser'&&good('desktop')&&good('mobile')&&
    ['interaction','assets','content','security'].every(k=>e[k]?.status===PASS);
}
export function audit(manifest,rootInput){
  if(!manifest||manifest.schema_version!=='3.1'||typeof manifest.project_id!=='string'||
    !/^[a-zA-Z0-9_-]{3,60}$/.test(manifest.project_id))throw Error('INVALID_MANIFEST');
  if(manifest.environment!=='local'||!['MIRROR','WORDPRESS'].includes(manifest.site_mode))throw Error('LOCAL_ONLY');
  if(!manifest.authorized_scope?.source_approved||!manifest.authorized_scope?.routes_frozen||
     typeof manifest.authorized_scope?.source_snapshot_sha256!=='string')throw Error('SCOPE_NOT_APPROVED');
  if(!Array.isArray(manifest.routes)||!manifest.routes.length||
     !manifest.templates||typeof manifest.templates!=='object')throw Error('MISSING_INVENTORY');
  const root=fs.realpathSync(path.resolve(rootInput));
  const threshold=Math.max(0.97,Number(manifest.visual_threshold)||0.97);
  const routes=new Map();
  for(const item of manifest.routes){
    const p=routePath(item.path);
    if(routes.has(p))throw Error('DUPLICATE_ROUTE '+p);
    if(typeof item.template!=='string'||!manifest.templates[item.template])throw Error('UNKNOWN_TEMPLATE '+p);
    routes.set(p,item);
  }
  const source_paths=[...routes.keys()].sort();
  const source_route_hash=sha(JSON.stringify(source_paths));
  if(manifest.authorized_scope.expected_route_count!==routes.size||
     manifest.authorized_scope.route_list_sha256!==source_route_hash)
    throw Error('INVENTORY_DENOMINATOR_MISMATCH');
  const scope_hash=sha(JSON.stringify({snapshot:manifest.authorized_scope.source_snapshot_sha256,
    paths:[...routes].map(([p,r])=>[p,r.template]).sort((a,b)=>a[0].localeCompare(b[0]))}));
  const templates={};
  for(const [name,t] of Object.entries(manifest.templates)){
    const a=t.owner_approval;
    templates[name]={status:(
      typeof t.sha256==='string'&&/^[a-f0-9]{64}$/.test(t.sha256)&&
      a?.status===PASS&&a?.template_sha256===t.sha256&&
      typeof a.evidence_ref==='string'&&a.evidence_ref.length>0
    )?PASS:'BLOCKED',reason:'PR15 representative-owner/template gate'};
  }
  const records=new Map(),warnings=[];
  for(const [p,r] of routes){
    const file=fileEvidence(root,r.local_file,r.artifact_sha256);
    const resourceIssues=[];
    for(const a of r.resources||[]){
      const evidence=fileEvidence(root,a.file,a.sha256);
      if(!evidence.present||!evidence.hash_ok)resourceIssues.push(a.file);
    }
    for(const dep of r.dependencies||[]){
      if(!['REQUIRED','OPTIONAL','DEFERRED','NOT_APPLICABLE'].includes(dep.classification))
        throw Error('INVALID_DEPENDENCY_CLASS');
      if(dep.classification==='REQUIRED'&&dep.status!==PASS)resourceIssues.push('required:'+dep.id);
      else if(dep.classification==='OPTIONAL'&&dep.status!==PASS){
        if(!dep.exception_ref)resourceIssues.push('undeclared-optional:'+dep.id);
        else warnings.push({path:p,dependency:dep.id,classification:'OPTIONAL'});
      }
    }
    let status='OPEN',reasons=[];
    if(!file.present){status='OPEN';reasons.push(file.reason);}
    else if(!file.hash_ok){status='FAIL';reasons.push('ARTIFACT_HASH_MISMATCH');}
    else if(resourceIssues.length){status='FAIL';reasons.push('ASSET_OR_DEPENDENCY_MISSING');}
    else if(templates[r.template].status!==PASS){status='BLOCKED';reasons.push('PR15_TEMPLATE_APPROVAL_MISSING');}
    else if(!checkedBrowser(r.evidence,threshold)){status='OPEN';reasons.push('BROWSER_VISUAL_OR_FUNCTIONAL_PROOF_MISSING');}
    else status=PASS;
    records.set(p,{path:p,template:r.template,status,reasons,resource_issues:resourceIssues,
      file_sha256:file.sha256||null,inbound_sources:[],unresolved_links:[]});
  }
  const sources=[];
  for(const [p,r] of routes){
    if(records.get(p).status===PASS)sources.push({path:p,links:r.links||[]});
  }
  for(const n of manifest.navigation_sources||[]){
    const file=fileEvidence(root,n.local_file,n.artifact_sha256);
    if(file.present&&file.hash_ok&&n.evidence?.status===PASS&&
       n.evidence?.method==='real-browser'&&n.evidence?.artifact_ref){
      sources.push({path:routePath(n.path),links:n.links||[]});
    }else warnings.push({path:n.path,reason:'UNVERIFIED_NAVIGATION_SOURCE'});
  }
  const inbound=new Map([...routes.keys()].map(p=>[p,new Set()]));
  for(const s of sources){
    const source=routePath(s.path);
    for(const link of s.links){
      const dest=routePath(link);
      if(inbound.has(dest)){
        if(records.get(dest).status!==PASS){
          if(records.has(source))records.get(source).unresolved_links.push(dest);
        }else if(source!==dest)inbound.get(dest).add(source);
      }else if(records.has(source))records.get(source).unresolved_links.push(dest);
    }
  }
  for(const [p,r] of records){
    r.inbound_sources=[...inbound.get(p)].sort();
    if(r.status===PASS){
      if(r.inbound_sources.length<2){r.status='FAIL';r.reasons.push('LESS_THAN_TWO_VERIFIED_INBOUND_SOURCES');}
      if(r.unresolved_links.length){r.status='FAIL';r.reasons.push('BROKEN_OR_PENDING_INTERNAL_LINK');}
    }
  }
  const counters={PASS:0,FAIL:0,OPEN:0,BLOCKED:0};
  for(const r of records.values())counters[r.status]++;
  const pages=[...records.values()].sort((a,b)=>a.path.localeCompare(b.path));
  const queue=pages.filter(r=>r.status!==PASS).map(r=>({path:r.path,status:r.status,reasons:r.reasons}));
  const template_batches=Object.entries(templates).map(([name,v])=>({
    template:name,owner_gate:v.status,route_count:pages.filter(p=>p.template===name).length,
    outstanding:pages.filter(p=>p.template===name&&p.status!==PASS).map(p=>p.path),
    next_step:v.status===PASS?'RUN_EXISTING_PR15_FACTORY_GATE':'REVIEW_REPRESENTATIVE_TEMPLATE'
  }));
  const final_build_gate=queue.length===0?'READY_FOR_PR17_FINAL_BUILD_CANARY':'BLOCKED_FINAL_BATCH';
  return {version:VERSION,project_id:manifest.project_id,environment:'local',
    scope_hash,visual_threshold:threshold,site_mode:manifest.site_mode,templates,
    counters,coverage:{total:pages.length,passed:counters.PASS},
    source_route_hash,template_batches,pr15_batch_gate:'SEPARATE_EXISTING_FACTORY_REQUIRED',
    final_build_gate,production_release:'NOT_AUTHORIZED',queue,warnings,pages};
}
export function main(argv){
  const args=Object.fromEntries(argv.filter(x=>x.startsWith('--')&&x.includes('='))
    .map(x=>{const i=x.indexOf('=');return [x.slice(2,i),x.slice(i+1)];}));
  if(argv.includes('--help')){console.log('node scripts/skills-v31-gate.mjs --manifest=/private/site.json --root=/private/local [--out=/private/local/uat/v31-report.json --execute]');return 0;}
  if(!args.manifest||!args.root)throw Error('MANIFEST_AND_LOCAL_ROOT_REQUIRED');
  const result=audit(JSON.parse(fs.readFileSync(args.manifest,'utf8')),args.root);
  if(args.out){
    if(!argv.includes('--execute'))throw Error('OUTPUT_WRITE_REQUIRES_EXECUTE');
    const root=fs.realpathSync(path.resolve(args.root));
    const dest=safeFile(root,path.relative(root,path.resolve(args.out)).split(path.sep).join('/'));
    if(!dest.startsWith(path.join(root,'uat')+path.sep))throw Error('OUTPUT_MUST_BE_PRIVATE_UAT');
    fs.mkdirSync(path.dirname(dest),{recursive:true});
    fs.writeFileSync(dest,JSON.stringify(result,null,2)+'\n',{flag:'w'});
  }
  console.log(JSON.stringify({version:result.version,coverage:result.coverage,
    final_build_gate:result.final_build_gate,counters:result.counters,queue:result.queue},null,2));
  return result.final_build_gate==='READY_FOR_PR17_FINAL_BUILD_CANARY'?0:2;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href){
  try{process.exitCode=main(process.argv.slice(2));}catch(e){console.error(e.message);process.exitCode=2;}
}
