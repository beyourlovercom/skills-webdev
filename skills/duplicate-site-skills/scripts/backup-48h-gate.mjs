#!/usr/bin/env node
/**
 * Read-only module approval and 48h active-time feasibility gate for owner-authorized
 * offline site backups. No network, no writes, no inferred human approval.
 */
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';

export const REQUIRED_MODULES=[
 'shared-shell','catalog-listings','product-details',
 'content-services','interactions','offline-acceptance'
];
const STATES=new Set(['NOT_STARTED','READING','ANALYZING','LOCAL_BUILD','AUTO_UAT','OWNER_REVIEW','OWNER_PASS','BATCH_IN_PROGRESS','MODULE_PASS','NOT_APPLICABLE']);
const ACTIONS=new Set(['status','sample','batch','next','complete']);
const sha=v=>typeof v==='string'&&/^[0-9a-f]{64}$/i.test(v);
const goodRef=v=>typeof v==='string'&&v.trim().length>=8;
const ownerEvidenceRef=v=>typeof v==='string'&&v.trim().length>=16&&
 !/^(?:continue|pass|approved|ok|done|继续|通过|首页视觉s*pass)$/i.test(v.trim());
const approvalTimestamp=v=>typeof v==='string'&&/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(v)&&Number.isFinite(Date.parse(v));
const positive=v=>typeof v==='number'&&Number.isFinite(v)&&v>0;
const count=v=>Number.isSafeInteger(v)&&v>=0;
const asObj=v=>v!==null&&typeof v==='object'&&!Array.isArray(v);
const err=(code,...detail)=>({code,detail:detail.join(' ')});
const validSource=v=>{try{let u=new URL(v);return ['http:','https:'].includes(u.protocol)&&!!u.hostname&&!u.username&&!u.password;}catch{return false}};
const hasPass=m=>m?.approval?.status==='PASS' && ownerEvidenceRef(m.approval?.owner_message_ref) &&
 validSource(m?.sample?.source_url) && validSource(m?.sample?.local_url) &&
 approvalTimestamp(m.approval?.approved_at) &&
 sha(m.approval?.template_sha256);
const sampleReady=m=>validSource(m?.sample?.source_url)&&validSource(m?.sample?.local_url)&&
 goodRef(m?.sample?.analysis_ref)&&goodRef(m?.sample?.desktop_ref)&&
 goodRef(m?.sample?.mobile_ref)&&m?.sample?.auto_uat==='PASS';
const batchReady=m=>count(m?.batch?.expected)&&count(m?.batch?.archived)&&
 count(m?.batch?.verified)&&count(m?.batch?.failed)&&
 m.batch.expected===m.batch.archived&&m.batch.expected===m.batch.verified&&
 m.batch.failed===0&&m.batch.offline_qa==='PASS';
export function estimateBudget(doc) {
 const x=doc.execution||{},scope=doc.scope||{};
 const active=Number(x.active_hours_spent),wait=Number(x.owner_wait_hours),elapsed=x.wallclock_elapsed_hours;
 const basic={target_active_hours:x.target_active_hours??48,active_hours_spent:active,
 owner_wait_hours:wait,wallclock_elapsed_hours:elapsed??null};
 if(!Number.isFinite(active)||active<0||!Number.isFinite(wait)||wait<0) return {...basic,status:'INVALID_CLOCK'};
 if(!positive(x.measured_pages_per_hour)||!positive(x.measured_assets_per_hour)||
 !count(x.remaining_routes)||!count(x.remaining_assets)||
 !Number.isFinite(x.remaining_template_hours)||x.remaining_template_hours<0||
 !Number.isFinite(x.remaining_qa_hours)||x.remaining_qa_hours<0)
 return {...basic,status:'UNMEASURED',remaining_hours_estimate:null,projected_active_hours:null};
 const predicted=x.remaining_routes/x.measured_pages_per_hour+
 x.remaining_assets/x.measured_assets_per_hour+x.remaining_template_hours+x.remaining_qa_hours+
 (count(x.buffer_hours)?x.buffer_hours:4);
 const total=active+predicted,limit=x.target_active_hours===48?48:Number(x.target_active_hours);
 return {...basic,source_routes_in_scope:scope.included_route_count,
 estimated_remaining_active_hours:Number(predicted.toFixed(2)),
 projected_active_hours:Number(total.toFixed(2)),
 status:active>limit?'OVER_48H':total>limit?'AT_RISK_48H':'ON_TRACK'};
}
export function evaluateGate(doc,action='status',moduleId=null){
 const errors=[],blockers=[];
 if(!asObj(doc))return {status:'BLOCKED',errors:['INVALID_MANIFEST'],blockers:['INVALID_MANIFEST']};
 if(doc.schema_version!==1)errors.push('SCHEMA_VERSION');
 if(!goodRef(doc.project_id)||!validSource(doc.source_origin)||!validSource(doc.local_origin))errors.push('PROJECT_OR_ORIGIN');
 if(!asObj(doc.scope)||!['FULL_NONBLOG','FIRST_PAGE_CATALOG'].includes(doc.scope.mode)||doc.scope.blog_excluded!==true)
   errors.push('SCOPE_INVALID');
 else{
   if(doc.scope.mode==='FIRST_PAGE_CATALOG'&&(doc.scope.listing_max_page!==1||!['representative','none','first_page_cards'].includes(doc.scope.product_details)))
     errors.push('PILOT_SCOPE_MUST_BE_FIRST_PAGE_ONLY');
   if(doc.scope.mode==='FULL_NONBLOG'&&doc.scope.product_details!=='all')errors.push('FULL_SCOPE_REQUIRES_ALL_PRODUCT_DETAILS');
 }
 if(!asObj(doc.execution)||doc.execution.target_active_hours!==48)errors.push('TARGET_48_HOURS_REQUIRED');
 if(!Array.isArray(doc.modules)||!doc.modules.length)errors.push('MODULES_REQUIRED');
 let ordered=doc.modules||[];
 const requiredIDs=REQUIRED_MODULES;
 if(ordered.length!==requiredIDs.length||ordered.some((m,i)=>m?.id!==requiredIDs[i]))errors.push('MODULE_ORDER_INVALID');
 const ids=new Set();
 for(const m of ordered){
   if(!asObj(m)||ids.has(m.id)||!STATES.has(m.state)){errors.push('MODULE_INVALID_OR_DUPLICATE');continue;}
   ids.add(m.id);
   if(!asObj(m.approval)||!asObj(m.batch))errors.push('MODULE_EVIDENCE_MISSING_'+m.id);
   if(m.state==='MODULE_PASS'&&!hasPass(m))errors.push('MISSING_OWNER_APPROVAL_'+m.id);
   if(m.state==='MODULE_PASS'&&!batchReady(m))errors.push('MISSING_BATCH_COMPLETENESS_'+m.id);
 }
 if(doc.rights_verified!==true||doc.demo_only===true)blockers.push('SOURCE_RIGHTS_NOT_VERIFIED_OR_DEMO');
 const pos=ordered.findIndex(m=>m.id===moduleId),selected=ordered[pos],prev=ordered.slice(0,pos);
 const prevComplete=prev.every(m=>m.state==='MODULE_PASS'&&hasPass(m)&&batchReady(m));
 if(!ACTIONS.has(action))errors.push('UNKNOWN_ACTION');
 if(action==='sample'){
  if(!selected)blockers.push('MODULE_NOT_FOUND');
  else if(!prevComplete)blockers.push('PREVIOUS_MODULE_NOT_PASS');
  else if(selected.state==='MODULE_PASS')blockers.push('ALREADY_FROZEN_NO_REDO');
 }else if(action==='batch'){
  if(!selected)blockers.push('MODULE_NOT_FOUND');
  else{
   if(!prevComplete)blockers.push('PREVIOUS_MODULE_NOT_PASS');
   if(!sampleReady(selected))blockers.push('SAMPLE_UAT_MISSING');
   if(!hasPass(selected))blockers.push('MODULE_OWNER_VISUAL_PASS_MISSING');
   if(!['OWNER_PASS','BATCH_IN_PROGRESS','MODULE_PASS'].includes(selected.state))blockers.push('MODULE_NOT_APPROVED_STAGE');
  }
 }else if(action==='next'){
  if(!selected)blockers.push('MODULE_NOT_FOUND');
  else{
   if(!prevComplete)blockers.push('PREVIOUS_MODULE_NOT_PASS');
   if(!hasPass(selected)||!sampleReady(selected))blockers.push('MODULE_TEMPLATE_NOT_SIGNED');
   if(!batchReady(selected)||selected.state!=='MODULE_PASS')blockers.push('MODULE_BATCH_NOT_VERIFIED');
  }
 }else if(action==='complete'){
  if(!ordered.every(m=>m.state==='MODULE_PASS'&&hasPass(m)&&sampleReady(m)&&batchReady(m)))
   blockers.push('SOME_MODULES_ARE_NOT_OWNER_APPROVED_AND_COMPLETE');
  if(doc.final_owner_acceptance?.status!=='PASS'||!ownerEvidenceRef(doc.final_owner_acceptance.owner_message_ref))
   blockers.push('FINAL_OWNER_LOCAL_ACCEPTANCE_MISSING');
  if(!goodRef(doc.final_offline_report))blockers.push('OFFLINE_REPORT_MISSING');
  if(!count(doc.scope?.included_route_count)||!count(doc.scope?.measured_route_count)||
    doc.scope.included_route_count!==doc.scope.measured_route_count)
   blockers.push('SOURCE_SCOPE_ROUTE_DENOMINATOR_UNRECONCILED');
  if(doc.scope?.mode==='FULL_NONBLOG'&&doc.scope.source_inventory_complete!==true)
   blockers.push('NONBLOG_FULL_SOURCE_INVENTORY_NOT_VERIFIED');
 }
 const budget=estimateBudget(doc);
 const allowed=errors.length===0&&blockers.length===0;
 return {status:allowed?'ALLOWED':'BLOCKED',action,module:moduleId??null,errors,blockers,
 budget,scope_status:doc.scope?.mode==='FULL_NONBLOG'?'FULL_NONBLOG_TARGET':'SCOPED_FIRST_PAGE_ONLY',
 can_claim_full_nonblog:allowed&&action==='complete'&&doc.scope?.mode==='FULL_NONBLOG'};
}
async function main(){
 const argv=process.argv;
 const get=name=>{const i=argv.indexOf('--'+name);return i>=0?argv[i+1]:null};
 const file=get('manifest'),action=get('action')||'status',module=get('module');
 if(!file)throw Error('Usage: node backup-48h-gate.mjs --manifest <private.json> --action status|sample|batch|next|complete [--module id]');
 const doc=JSON.parse(fs.readFileSync(file,'utf8'));
 const result=evaluateGate(doc,action,module);
 process.stdout.write(JSON.stringify(result,null,2)+'\n');
 if(result.status!=='ALLOWED')process.exitCode=2;
}
if(process.argv[1]&&fileURLToPath(import.meta.url)===process.argv[1])main().catch(e=>{process.stderr.write(String(e)+'\n');process.exitCode=3});
