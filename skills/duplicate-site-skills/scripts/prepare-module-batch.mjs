#!/usr/bin/env node
/**
 * Build a resumable, SHA-referenced same-module queue from an Owner-supplied
 * private route inventory. NEVER scrapes. Requires corresponding Owner visual PASS.
 * No network, no credentials; only writes the explicitly requested private queue.
 */
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {evaluateGate} from './backup-48h-gate.mjs';

const validPath=v=>typeof v==='string'&&v.startsWith('/')&&
 !v.includes('..')&&!v.includes('//')&&!v.includes('\\')&&!/[#?]/.test(v);
const pageNum=url=>{
 const u=new URL(url),page=Number(u.searchParams.get('page')||u.searchParams.get('paged')||1);
 const fromPath=u.pathname.match(/\/(?:page\/|page-)(\d+)\/?$/i);
 const next=fromPath?Number(fromPath[1]):page;
 return {page:next,offset:Number(u.searchParams.get('offset')||0),
 cursor:[...u.searchParams.keys()].some(x=>/cursor|nexttoken|after/i.test(x))};
};
const blacklisted=(u,scope)=>{
 const p=new URL(u).pathname.toLowerCase();
 return (scope.exclude_routes||[]).some(x=>{
  const prefix=x.toLowerCase();return p===prefix.slice(0,-1)||p.startsWith(prefix);
 });
};
export function prepareModuleQueue(ledger,routeList,moduleId) {
 const gate=evaluateGate(ledger,'batch',moduleId);
 if(gate.status!=='ALLOWED')return {status:'BLOCKED',reasons:[...gate.errors,...gate.blockers],jobs:[],skipped:[],project:ledger?.project_id};
 if(!Array.isArray(routeList))return {status:'BLOCKED',reasons:['ROUTES_MUST_BE_ARRAY'],jobs:[],skipped:[]};
 const out=[],skipped=[],seen=new Set();
 const typeFor={'shared-shell':['home'],'catalog-listings':['listing'],'product-details':['product'],
 'content-services':['content'],'interactions':['interaction'],'offline-acceptance':['offline']};
 const allowed=typeFor[moduleId]||[];
 const origins=new URL(ledger.source_origin).origin;
 for(const [i,row] of routeList.entries()){
  if(!row||typeof row!=='object'||typeof row.source_url!=='string')return {status:'BLOCKED',reasons:['BAD_ROUTE_INDEX_'+i],jobs:[],skipped};
  let url;try{url=new URL(row.source_url);}catch{return {status:'BLOCKED',reasons:['MALFORMED_URL_'+i],jobs:[],skipped};}
  if(url.origin!==origins||url.username||url.password)return {status:'BLOCKED',reasons:['UNAUTHORIZED_ORIGIN_'+i],jobs:[],skipped};
  if(blacklisted(url.href,ledger.scope)||row.content_type==='blog'){
   skipped.push({url:url.href,why:'BLOG_EXCLUDED'});continue;
  }
  if(!allowed.includes(row.content_type))continue; // other modules not sampled here
  if(!validPath(row.local_path)||!['PENDING','FAILED','VERIFIED'].includes(row.status))
    return {status:'BLOCKED',reasons:['MISSING_LOCAL_ROUTE_OR_STATUS_'+i],jobs:[],skipped};
  if(moduleId==='catalog-listings'&&ledger.scope.mode==='FIRST_PAGE_CATALOG'){
    const n=pageNum(url.href);
    if(n.page>1||n.offset>0||n.cursor)return {status:'BLOCKED',reasons:['POST_FIRST_PAGE_NOT_IN_SCOPE_'+i],jobs:[],skipped};
  }
  if(moduleId==='product-details'&&ledger.scope.mode==='FIRST_PAGE_CATALOG'){
    if(ledger.scope.product_details==='none')return {status:'BLOCKED',reasons:['PRODUCT_DETAIL_EXCLUDED_'+i],jobs:[],skipped};
    if(ledger.scope.product_details==='representative'&&!(ledger.scope.approved_representative_detail_urls||[]).includes(url.href))
       return {status:'BLOCKED',reasons:['UNAPPROVED_REPRESENTATIVE_PRODUCT_'+i],jobs:[],skipped};
  }
  if(seen.has(url.href)){skipped.push({url:url.href,why:'DUPLICATE_SOURCE_URL'});continue;}
  seen.add(url.href);
  if(row.status==='VERIFIED'&&row.source_sha256_verified===true){
   skipped.push({url:url.href,why:'ALREADY_HASH_VERIFIED'});continue;
  }
  if(typeof row.source_sha256!=='string'||!/^[a-f0-9]{64}$/i.test(row.source_sha256))
     return {status:'BLOCKED',reasons:['SOURCE_SHA_MISSING_'+i],jobs:[],skipped};
  if(!Array.isArray(row.assets)||row.assets.some(a=>!a.source_url||!a.local_path||!a.sha256||!/^[a-f0-9]{64}$/i.test(a.sha256)))
     return {status:'BLOCKED',reasons:['ASSET_MANIFEST_INCOMPLETE_'+i],jobs:[],skipped};
  out.push({source_url:url.href,local_path:row.local_path,content_type:row.content_type,
   original_html_sha256:row.source_sha256,assets:row.assets,
   action:row.status==='FAILED'?'RETRY_MISSING_ONLY':'LOCALIZE_WITH_FROZEN_TEMPLATE',
   template_sha256:ledger.modules.find(m=>m.id===moduleId).approval.template_sha256});
 }
 const distinctAssets=new Set(out.flatMap(x=>x.assets.map(a=>a.source_url)));
 return {status:'QUEUE_READY',module:moduleId,project:ledger.project_id,
   page_jobs:out.length,asset_urls_deduplicated:distinctAssets.size,skipped_count:skipped.length,
   frozen_template_sha256:ledger.modules.find(m=>m.id===moduleId).approval.template_sha256,
   jobs:out,skipped,scope:ledger.scope.mode,
   next_step:'Execute jobs with an authorized offline/source-export adapter, then verify each route and SHA. This does not fetch URLs.'};
}
async function main(){
 const arg=name=>{const i=process.argv.indexOf('--'+name);return i===-1?null:process.argv[i+1]};
 const ledgerPath=arg('ledger'),routesPath=arg('routes'),out=arg('out'),moduleId=arg('module');
 if(!ledgerPath||!routesPath||!out||!moduleId)throw Error('--ledger <private.json> --routes <private.json> --module <id> --out <private.json> required');
 if(!path.isAbsolute(out))throw Error('queue output must be an absolute private path');
 const ledger=JSON.parse(fs.readFileSync(ledgerPath,'utf8'));
 const routes=JSON.parse(fs.readFileSync(routesPath,'utf8'));
 const result=prepareModuleQueue(ledger,routes,moduleId);
 if(result.status!=='QUEUE_READY'){process.stdout.write(JSON.stringify(result,null,2)+'\n');process.exitCode=2;return;}
 fs.mkdirSync(path.dirname(out),{recursive:true});
 fs.writeFileSync(out,JSON.stringify(result,null,2)+'\n');
 process.stdout.write(JSON.stringify({status:result.status,module:moduleId,page_jobs:result.page_jobs,
   asset_urls_deduplicated:result.asset_urls_deduplicated,skipped_count:result.skipped_count,output:out},null,2)+'\n');
}
if(process.argv[1]&&fileURLToPath(import.meta.url)===process.argv[1])main().catch(e=>{process.stderr.write(String(e)+'\n');process.exitCode=3});
