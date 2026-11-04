#!/usr/bin/env node
// Read-only V2 → PR15 template handoff audit; never creates a queue or runs a crawl.
import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL, fileURLToPath} from 'node:url';
import crypto from 'node:crypto';

const TYPES=['shared-shell','catalog-listings','product-details','content-services','interactions','offline-acceptance'];
const APPROVED={ 'shared-shell':'/', 'catalog-listings':'/services/', 'content-services':'/services/cnc-machining/' };
const sha=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
export function inspectCandidate(doc,{filesystem=fs}={}){
  if(!doc||doc.schema_version!==1||doc.project_id!=='rapiddirect-v2-pilot'||
     doc.scope!=='PILOT_SAMPLES'||doc.bulk_enabled!==false||doc.production_writes!==false)
    throw Error('PILOT_SCOPE_OR_BATCH_GATE');
  if(!Array.isArray(doc.templates)||doc.templates.length!==3)throw Error('EXACT_THREE_TEMPLATE_GATE');
  const seen=new Set(),out=[];
  for(const row of doc.templates){
    if(!APPROVED[row.template_id]||seen.has(row.template_id)||
       APPROVED[row.template_id]!==row.representative_route)throw Error('TEMPLATE_SCOPE_MISMATCH');
    seen.add(row.template_id);
    if(row.owner_visual_pass!==true||row.visual_state!=='OWNER_VISUAL_PASS'||
       row.reference_freeze_state!=='FROZEN_REFERENCE'||row.owner_approval_text!=='pass')
      throw Error('OWNER_VISUAL_EVIDENCE_NOT_RECORDED_'+row.template_id);
    const file=path.resolve(row.frozen_reference_local_file||'');
    if(!filesystem.existsSync(file))throw Error('FROZEN_REFERENCE_MISSING_'+row.template_id);
    const h=sha(filesystem.readFileSync(file));
    if(h!==row.frozen_reference_sha256)throw Error('FROZEN_REFERENCE_SHA_MISMATCH_'+row.template_id);
    // A frozen representative HTML page does not prove that a reusable
    // parameterized template and its data injection mapping exist.
    if(row.template_sha256!==null||row.generalized_template_implementation!=='NOT_YET_PROVEN')
      throw Error('UNVERIFIED_GENERAL_TEMPLATE_GATE_'+row.template_id);
    out.push({module_id:row.template_id,representative_route:row.representative_route,
      visual_pass:true,reference_sha256:h,
      template_implementation_ready:false,data_mapping_ready:false,
      approved_at:row.owner_approval_recorded_at});
  }
  return out;
}
export function makeConservativePr15Ledger(doc,refs){
  const local='http://127.0.0.1:8765';
  return {
    schema_version:1,project_id:doc.project_id,source_origin:doc.source_origin,
    local_origin:local,rights_verified:doc.rights?.owner_attested===true,
    demo_only:false,
    scope:{mode:'FIRST_PAGE_CATALOG',blog_excluded:true,listing_max_page:1,
      product_details:'representative',exclude_routes:['/blog/','/articles/','/insights/'],
      approved_representative_detail_urls:[],
      included_route_count:null,measured_route_count:3,source_inventory_complete:false},
    execution:{active_hours_spent:0,owner_wait_hours:0,target_active_hours:48,
      wallclock_elapsed_hours:0,measured_pages_per_hour:null,
      measured_assets_per_hour:null,remaining_routes:null,remaining_assets:null,
      remaining_template_hours:null,remaining_qa_hours:null,buffer_hours:4},
    modules:TYPES.map(id=>{
      const row=refs.find(x=>x.module_id===id);
      return {id,state:row?'OWNER_REVIEW':'NOT_STARTED',
        sample:row?{source_url:doc.source_origin.replace(/\/$/,'')+row.representative_route,
          local_url:local+row.representative_route,analysis_ref:'PRIVATE/authorized-representative-analysis',
          desktop_ref:'PRIVATE/desktop-evidence',mobile_ref:'PRIVATE/mobile-evidence',auto_uat:'OPEN'}:null,
        approval:{status:'OPEN',owner_message_ref:null,
          owner_visual_pass:row?.visual_pass===true,
          approved_at:row?.approved_at||null,template_sha256:null},
        batch:{expected:row?1:null,archived:row?1:0,verified:0,failed:0,offline_qa:'OPEN'}};
    }),
    final_owner_acceptance:{status:'OPEN',owner_message_ref:null},
    final_offline_report:null
  };
}
export async function auditHandoff(doc,factoryRoot){
  const refs=inspectCandidate(doc);
  const gatePath=path.resolve(factoryRoot,'skills','duplicate-site-skills','scripts','backup-48h-gate.mjs');
  if(!fs.existsSync(gatePath))throw Error('PR15_FACTORY_GATE_NOT_FOUND');
  const {evaluateGate}=await import(pathToFileURL(gatePath).href);
  if(typeof evaluateGate!=='function')throw Error('PR15_FACTORY_API_NOT_FOUND');
  const conservative=makeConservativePr15Ledger(doc,refs);
  const gated=refs.map(row=>({template_id:row.module_id,
    visual_pass:true,reference_frozen:true,
    data_mapping:'OPEN',generalized_template_sha:'OPEN',
    pr15_gate:evaluateGate(conservative,'batch',row.module_id)}));
  if(gated.some(row=>row.pr15_gate.status!=='BLOCKED'))
    throw Error('FAIL_CLOSED_VIOLATION__UNEXPECTED_BATCH_GATE');
  return {status:'OWNER_REFERENCE_PASS__BATCH_STILL_BLOCKED',
    reference_visual_pass:refs.length,reference_sha_verified:refs.length,
    generalized_templates_ready:0,owner_batch_approval:false,
    factory_integrated:true,source_requests:0,site_writes:0,
    gates:gated,next:'Add verified data mappings + full scoped route/asset manifest, then obtain a separately authorized batch execution gate'};
}

/**
 * Owner-approved automatic visual PASS: both complete, unmasked desktop/mobile
 * SSIM >= 0.97 against real captured source + offline, with safe interaction
 * and no runtime asset/network errors. This grants only a per-page visual PASS,
 * not generalized template SHA, PR15 batch launch, GitHub merge or deployment.
 */
export function evaluateAutomatedVisualPass({scores,sourceRuns,localRuns,interaction,proofFiles}){
  const deny=reason=>({status:'AUTO_VISUAL_BLOCKED',pass:false,reason,threshold:0.97});
  const views=['desktop','mobile'];
  if(!Array.isArray(scores)||scores.length!==2||!Array.isArray(sourceRuns)||
    !Array.isArray(localRuns)||!interaction||!proofFiles)
    return deny('EVIDENCE_INCOMPLETE');
  if(interaction.pass_count!==2||interaction.failed_count!==0||
     interaction.real_form_submissions!==0||interaction.production_writes!==0)
    return deny('SAFE_INTERACTION_NOT_VERIFIED');
  const per=[];
  for(const view of views){
    const a=scores.filter(s=>s.view===view);
    const src=sourceRuns.filter(x=>x.viewport===view&&x.mode==='source');
    const dst=localRuns.filter(x=>x.viewport===view&&x.mode==='offline');
    if(a.length!==1||src.length!==1||dst.length!==1)
      return deny('MISSING_OR_DUPLICATED_VIEW_'+view);
    const s=a[0],x=src[0],y=dst[0];
    if(typeof s.ssim!=='number'||!Number.isFinite(s.ssim)||
      s.ssim<0.97||s.ssim>1||s.pass!==true||
      s.masked!==0||s.threshold!==0.97)
      return deny('SSIM_UNMASKED_THRESHOLD_FAIL_'+view);
    if(x.http!==200||y.http!==200||!Array.isArray(x.image_size)||
      JSON.stringify(x.image_size)!==JSON.stringify(y.image_size)||
      x.image_size.length!==2||x.image_size[0]<300||x.image_size[1]<300||
      x.image_count!==y.image_count||x.broken_images!==y.broken_images)
      return deny('PAGE_GEOMETRY_OR_MEDIA_DIFFER_'+view);
    if((y.http_failures||[]).length!==0||y.blocked_count!==0)
      return deny('LOCAL_RUNTIME_FAILED_'+view);
    for(const side of ['source','offline']){
      const file=proofFiles[view]?.[side];
      if(typeof file!=='string'||!file.endsWith('.png')||!fs.existsSync(file)||
         fs.statSync(file).size<10000)
        return deny('FULL_PAGE_SCREENSHOT_MISSING_'+view+'_'+side);
    }
    per.push({view,ssim:s.ssim,masked_fraction:0});
  }
  return {status:'AUTO_VISUAL_PASS',pass:true,threshold:0.97,per,
    granted_scope:'EXACT_TESTED_PAGE_VISUAL_ONLY',
    generalized_template_approved:false,
    batch_execution_approved:false,main_merge_approved:false,
    owner_review_required:false};
}

async function main(){
  const opts={};
  for(const arg of process.argv.slice(2)){
    const m=arg.match(/^--(candidate|factory-root)=(.+)$/);
    if(!m)throw Error('Unknown argument '+arg);
    opts[m[1]]=m[2];
  }
  if(!opts.candidate||!opts['factory-root'])throw Error('Require --candidate and --factory-root');
  const doc=JSON.parse(fs.readFileSync(path.resolve(opts.candidate),'utf8'));
  console.log(JSON.stringify(await auditHandoff(doc,opts['factory-root']),null,2));
}
if(process.argv[1]&&fileURLToPath(import.meta.url)===path.resolve(process.argv[1]))
  main().catch(err=>{console.error(err.message);process.exitCode=2});
