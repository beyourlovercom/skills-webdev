/**
 * First-page visual-first checkpoint. Import into source fetchers before ANY network access.
 * The stage is not self-elevating: an external Owner visual PASS must be recorded in a
 * PRIVATE approval file; this module only validates its required evidence shape.
 */
import fs from 'node:fs';
import path from 'node:path';

export class VisualGateError extends Error {
  constructor(message) { super('OWNER_VISUAL_GATE_BLOCKED: '+message); this.name='VisualGateError'; }
}
const err=(message)=>{throw new VisualGateError(message);};
function approvalRead(file, source, project) {
  if (!file) return null;
  if (!path.isAbsolute(file)) err('approval path must be absolute and private');
  let data;try{data=JSON.parse(fs.readFileSync(file,'utf8'));}catch{err('approval evidence missing or invalid');}
  if(data.schema_version!==1 || data.project_id!==project || data.source_origin!==source ||
     data.gate!=='OWNER_VISUAL_PASS' || data.status!=='PASS' ||
     data.owner_explicit_pass!==true || !data.approval_recorded_at ||
     !data.owner_message_reference || !data.review_baseline_id ||
     !Array.isArray(data.approved_template_urls) || data.approved_template_urls.length===0)
    err('requires verified Owner visual PASS, approved template URLs and review baseline');
  if(typeof data.owner_message_reference!=='string' || data.owner_message_reference.trim().length<8 ||
     typeof data.review_baseline_id!=='string' || data.review_baseline_id.trim().length<8)
    err('visual approval evidence/reference is incomplete');
  return data;
}
export function enforceVisualFirst({
 phase='PILOT_FIRST_PAGE',approvalFile=null,source='https://www.basworld.com',
 project='basworldy',mode,category='truck',from=1,limit=1,
 seedManifestCount=0,pilotUrl=null,knownFirstPageUrls=[],indexUrlCount=0,
 scope='network'
}={}) {
 if(phase!=='PILOT_FIRST_PAGE'&&phase!=='EXPANSION_AFTER_OWNER_PASS')err('unknown stage');
 if(!Number.isInteger(from)||from<1||!Number.isInteger(limit)||limit<1)err('invalid page/capture limit');
 if(phase==='EXPANSION_AFTER_OWNER_PASS'){
   const approved=approvalRead(approvalFile,source,project);
   if(!approved)err('Owner visual PASS evidence required before expansion');
   return {stage:'AFTER_OWNER_VISUAL_PASS',approved:true,approval_ref:approved.owner_message_reference};
 }
 if(approvalFile)err('Pilot stage cannot silently accept an approval; use explicit expansion stage');
 if(mode==='inventory'){
   if(from!==1||limit!==1)err('first-round listing may read ONLY page=1 (from=1 limit=1)');
   if(seedManifestCount)err('first-round inventory cannot import bulk seed manifests');
   if(indexUrlCount>0)err('pilot must use a NEW first-page-only index, not a historic bulk index');
 } else if(mode==='details'){
   if(limit!==1 || from!==1)err('first round can read only ONE approved representative detail per invocation');
   if(seedManifestCount)err('first-round detail cannot import multi-page seeds');
   if(indexUrlCount>50)err('historic multi-page index not accepted in pilot');
   if(!pilotUrl || !knownFirstPageUrls.includes(pilotUrl))err('representative detail must be an explicit URL from page ONE');
 } else if(mode==='media'){
   if(scope!=='pilot_first_page_media')err('bulk media queue prohibited until Owner visual PASS');
 } else {
   err('unrecognized capture operation');
 }
 return {stage:'PILOT_FIRST_PAGE',approved:false,page_limit:1,bulk_allowed:false};
}
