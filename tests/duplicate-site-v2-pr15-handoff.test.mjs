import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import {inspectCandidate,makeConservativePr15Ledger,auditHandoff,evaluateAutomatedVisualPass} from '../skills/duplicate-site-skills/v2/scripts/audit-pr15-handoff.mjs';

const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
function fixture(){
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'v2-pr15-handoff-'));
 const routes={'shared-shell':'/','catalog-listings':'/services/','content-services':'/services/cnc-machining/'};
 const templates=[];
 for(const [id,representative_route] of Object.entries(routes)){
  const file=path.join(root,id+'.html');
  fs.writeFileSync(file,'<html><head></head><body>Approved '+id+'</body></html>');
  templates.push({
   template_id:id,representative_route,
   frozen_reference_local_file:file,
   frozen_reference_sha256:hash(fs.readFileSync(file)),
   template_sha256:null,
   owner_visual_pass:true,visual_state:'OWNER_VISUAL_PASS',
   reference_freeze_state:'FROZEN_REFERENCE',
   generalized_template_implementation:'NOT_YET_PROVEN',
   owner_approval_text:'pass',
   owner_approval_recorded_at:'2026-11-03T18:00:00+08:00'
  });
 }
 const doc={schema_version:1,project_id:'rapiddirect-v2-pilot',
  scope:'PILOT_SAMPLES',source_origin:'https://www.rapiddirect.com',
  rights:{owner_attested:true},bulk_enabled:false,production_writes:false,templates};
 const gateDir=path.join(root,'factory','skills','duplicate-site-skills','scripts');
 fs.mkdirSync(gateDir,{recursive:true});
 fs.writeFileSync(path.join(gateDir,'backup-48h-gate.mjs'),
 "export const evaluateGate=(doc,action,module)=>({status:'BLOCKED',action,module,blockers:['GENERAL_TEMPLATE_NOT_READY']});\n");
 return {root,doc};
}
test('approved reference hashes are verified and generalized template hashes stay null',()=>{
 const x=fixture();try{
  const refs=inspectCandidate(x.doc);
  assert.equal(refs.length,3);
  assert.ok(refs.every(x=>x.visual_pass&&!x.template_implementation_ready));
  const doc=makeConservativePr15Ledger(x.doc,refs);
  assert.deepEqual(doc.modules.map(x=>x.id),[
   'shared-shell','catalog-listings','product-details','content-services','interactions','offline-acceptance'
  ]);
  assert.ok(doc.modules.every(x=>x.approval.status==='OPEN'&&x.approval.template_sha256===null));
  assert.equal(doc.scope.mode,'FIRST_PAGE_CATALOG');
 }finally{fs.rmSync(x.root,{recursive:true,force:true})}
});
test('PR15 factory integration is actually invoked but remains read-only BLOCKED',async()=>{
 const x=fixture();try{
  const result=await auditHandoff(x.doc,path.join(x.root,'factory'));
  assert.equal(result.status,'OWNER_REFERENCE_PASS__BATCH_STILL_BLOCKED');
  assert.equal(result.factory_integrated,true);
  assert.equal(result.gates.length,3);
  assert.ok(result.gates.every(x=>x.pr15_gate.status==='BLOCKED'));
  assert.equal(result.source_requests,0);
  assert.equal(result.site_writes,0);
 }finally{fs.rmSync(x.root,{recursive:true,force:true})}
});
test('silently edited reference fails closed',()=>{
 const x=fixture();try{
  fs.appendFileSync(x.doc.templates[0].frozen_reference_local_file,'<!-- drift -->');
  assert.throws(()=>inspectCandidate(x.doc),/FROZEN_REFERENCE_SHA_MISMATCH/);
 }finally{fs.rmSync(x.root,{recursive:true,force:true})}
});
test('duplicate, unknown or unapproved representative fails closed',()=>{
 const x=fixture();try{
  x.doc.templates[2].template_id='shared-shell';
  assert.throws(()=>inspectCandidate(x.doc),/TEMPLATE_SCOPE_MISMATCH/);
  x.doc.templates[2].template_id='content-services';
  x.doc.templates[2].owner_visual_pass=false;
  assert.throws(()=>inspectCandidate(x.doc),/OWNER_VISUAL_EVIDENCE_NOT_RECORDED/);
  x.doc.templates[2].owner_visual_pass=true;
  x.doc.bulk_enabled=true;
  assert.throws(()=>inspectCandidate(x.doc),/PILOT_SCOPE_OR_BATCH_GATE/);
 }finally{fs.rmSync(x.root,{recursive:true,force:true})}
});

function autoFixture(){
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'v2-auto-visual-'));
 const views=['desktop','mobile'];
 const proofFiles={};
 for(const view of views){
  proofFiles[view]={};
  for(const side of ['source','offline']){
   const p=path.join(root,view+'.'+side+'.png');
   fs.writeFileSync(p,Buffer.alloc(14000,0xa5));
   proofFiles[view][side]=p;
  }
 }
 return {root,evidence:{
  scores:views.map(view=>({view,ssim:view==='desktop'?0.991916:0.999096,pass:true,masked:0,threshold:0.97})),
  sourceRuns:views.map(view=>({viewport:view,mode:'source',http:200,image_size:view==='desktop'?[1440,11948]:[375,15112],image_count:117,broken_images:view==='desktop'?78:86})),
  localRuns:views.map(view=>({viewport:view,mode:'offline',http:200,image_size:view==='desktop'?[1440,11948]:[375,15112],image_count:117,broken_images:view==='desktop'?78:86,http_failures:[],blocked_count:0})),
  interaction:{pass_count:2,failed_count:0,real_form_submissions:0,production_writes:0},
  proofFiles
 }};
}
test('Owner automatic SSIM policy grants exact-page visual PASS after both full-page views and safe interactions',()=>{
 const x=autoFixture();
 try{
  const v=evaluateAutomatedVisualPass(x.evidence);
  assert.equal(v.status,'AUTO_VISUAL_PASS');
  assert.equal(v.pass,true);
  assert.equal(v.owner_review_required,false);
  assert.equal(v.batch_execution_approved,false);
  assert.equal(v.generalized_template_approved,false);
 }finally{fs.rmSync(x.root,{recursive:true,force:true})}
});
test('auto visual pass refuses one low view, masks, bad interactions, missing images and absent screenshot',()=>{
 const x=autoFixture();
 try{
  const clone=()=>structuredClone(x.evidence);
  let bad=clone();bad.scores[1].ssim=0.9699;
  assert.equal(evaluateAutomatedVisualPass(bad).pass,false);
  bad=clone();bad.scores[0].masked=0.1;
  assert.equal(evaluateAutomatedVisualPass(bad).pass,false);
  bad=clone();bad.interaction.failed_count=1;
  assert.equal(evaluateAutomatedVisualPass(bad).pass,false);
  bad=clone();bad.localRuns[1].broken_images=87;
  assert.equal(evaluateAutomatedVisualPass(bad).pass,false);
  bad=clone();fs.unlinkSync(bad.proofFiles.desktop.offline);
  assert.equal(evaluateAutomatedVisualPass(bad).pass,false);
 }finally{fs.rmSync(x.root,{recursive:true,force:true})}
});
