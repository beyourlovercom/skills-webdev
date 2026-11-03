/**
 * Source-exact first-page / module approval gate.
 * A human Owner PASS applies ONLY to that page-template module and scoped URLs.
 * The approval file is PRIVATE evidence, independently cross-checked against chat.
 */
import fs from 'node:fs';
import path from 'node:path';
export class VisualGateError extends Error {
 constructor(message){super('OWNER_VISUAL_GATE_BLOCKED: '+message);this.name='VisualGateError';}
}
const err=s=>{throw new VisualGateError(s)};
const MODULES=new Set(['shared-shell','catalog-listings','product-details','content-services','interactions']);
function approvalRead(file,source,project,moduleId) {
 if(!file)err('Owner visual PASS evidence required before expansion');
 if(!moduleId||!MODULES.has(moduleId))err('explicit moduleId is required for expansion');
 if(!path.isAbsolute(file))err('approval path must be absolute and private');
 let data;try{data=JSON.parse(fs.readFileSync(file,'utf8'));}catch{err('approval evidence missing or invalid');}
 if(data.schema_version!==2||data.project_id!==project||data.source_origin!==source||
    data.module_id!==moduleId||data.gate!=='OWNER_MODULE_VISUAL_PASS'||
    data.status!=='PASS'||data.owner_explicit_pass!==true||
    !['FULL_NONBLOG','FIRST_PAGE_CATALOG'].includes(data.scope_mode)||
    !/^[a-f0-9]{64}$/i.test(data.template_sha256||'')||
    !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(data.approval_recorded_at||'')||
    !Number.isFinite(Date.parse(data.approval_recorded_at||''))||
    typeof data.owner_message_reference!=='string'||data.owner_message_reference.trim().length<16||
    /^(?:continue|pass|approved|ok|done|继续|通过)$/i.test(data.owner_message_reference.trim())||
    !Array.isArray(data.approved_template_urls)||!data.approved_template_urls.length)
       err('requires module-specific traceable Owner PASS, template SHA and scoped URL evidence');
 return data;
}
export function enforceVisualFirst({
 phase='PILOT_FIRST_PAGE',approvalFile=null,source='https://www.basworld.com',project='basworldy',
 moduleId=null,mode,category='truck',from=1,limit=1,seedManifestCount=0,
 pilotUrl=null,knownFirstPageUrls=[],indexUrlCount=0,scope='network'
}={}){
 if(phase!=='PILOT_FIRST_PAGE'&&phase!=='EXPANSION_AFTER_OWNER_PASS')err('unknown stage');
 if(!Number.isInteger(from)||from<1||!Number.isInteger(limit)||limit<1)err('invalid page/capture limit');
 if(phase==='EXPANSION_AFTER_OWNER_PASS'){
  const approved=approvalRead(approvalFile,source,project,moduleId);
  if(mode==='inventory'&&moduleId!=='catalog-listings')err('listing batch requires catalog-listings PASS');
  if(mode==='details'&&moduleId!=='product-details')err('detail batch requires product-details PASS');
  if(mode==='media'&&!['catalog-listings','product-details','shared-shell','content-services'].includes(moduleId))
    err('asset batch requires owning template module PASS');
  if(approved.scope_mode==='FIRST_PAGE_CATALOG'){
   if(mode==='inventory'&&(from!==1||limit!==1))
     err('first-page project never permits list page 2+, even after listing visual PASS');
   if(mode==='details'){
    const list=approved.approved_representative_detail_urls||[];
    if(!pilotUrl||!list.includes(pilotUrl)||limit!==1||seedManifestCount>0)
      err('first-page project detail expansion limited to approved representative URL, not full SKU inventory');
   }
  }
  return {stage:'AFTER_OWNER_MODULE_PASS',approved:true,module_id:moduleId,
   scope_mode:approved.scope_mode,template_sha256:approved.template_sha256,
   approval_ref:approved.owner_message_reference};
 }
 if(approvalFile)err('pilot cannot silently accept approval; use explicit expansion stage');
 if(mode==='inventory'){
  if(from!==1||limit!==1)err('first-round listing may read ONLY page=1 (from=1 limit=1)');
  if(seedManifestCount)err('first-round inventory cannot import bulk seed manifests');
  if(indexUrlCount>0)err('pilot must use a NEW first-page-only index, not historic bulk index');
 }else if(mode==='details'){
  if(limit!==1||from!==1)err('first round can read only ONE approved representative detail');
  if(seedManifestCount)err('first-round detail cannot import multi-page seeds');
  if(indexUrlCount>50)err('historic multi-page index not accepted in pilot');
  if(!pilotUrl||!knownFirstPageUrls.includes(pilotUrl))err('representative detail must be an explicit URL from page ONE');
 }else if(mode==='media'){
  if(scope!=='pilot_first_page_media')err('bulk media queue prohibited until Owner module PASS');
 }else err('unrecognized capture operation');
 return {stage:'PILOT_FIRST_PAGE',approved:false,page_limit:1,bulk_allowed:false};
}
