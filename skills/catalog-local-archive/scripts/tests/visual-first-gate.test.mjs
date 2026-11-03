import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';import os from 'node:os';import path from 'node:path';
import {enforceVisualFirst} from '../visual-first-gate.mjs';
const inv={mode:'inventory',from:1,limit:1,category:'truck'};
test('first page only allowed',()=>assert.equal(enforceVisualFirst(inv).page_limit,1));
test('page 2 blocked in first round',()=>assert.throws(()=>enforceVisualFirst({...inv,from:2}),/OWNER_VISUAL_GATE_BLOCKED/));
test('extra pages blocked in first round',()=>assert.throws(()=>enforceVisualFirst({...inv,limit:20}),/ONLY page=1/));
test('historical bulk index cannot be reused as pilot',()=>assert.throws(()=>enforceVisualFirst({...inv,indexUrlCount:988}),/historic bulk index/));
test('bulk seed manifests cannot be mixed into pilot',()=>assert.throws(()=>enforceVisualFirst({...inv,seedManifestCount:1}),/bulk seed/));
test('detail requires explicit first-page product URL',()=>assert.throws(()=>enforceVisualFirst({mode:'details',limit:1,knownFirstPageUrls:['https://www.basworld.com/vehicles/used/a']}),/representative/));
test('detail from page 1 allowed',()=>{const u='https://www.basworld.com/vehicles/used/a';assert.equal(enforceVisualFirst({mode:'details',limit:1,pilotUrl:u,knownFirstPageUrls:[u]}).stage,'PILOT_FIRST_PAGE');});
test('media bulk blocked first round',()=>assert.throws(()=>enforceVisualFirst({mode:'media'}),/bulk media/));
test('expansion requires recorded approval',()=>assert.throws(()=>enforceVisualFirst({mode:'inventory',phase:'EXPANSION_AFTER_OWNER_PASS',approvalFile:null}),/Owner visual PASS/));
test('fabricated incomplete approval rejected',()=>{const dir=fs.mkdtempSync(path.join(os.tmpdir(),'visual-gate-'));try{const p=path.join(dir,'pass.json');fs.writeFileSync(p,JSON.stringify({status:'PASS'}));assert.throws(()=>enforceVisualFirst({mode:'inventory',phase:'EXPANSION_AFTER_OWNER_PASS',moduleId:'catalog-listings',approvalFile:p}),/requires module-specific/);}finally{fs.rmSync(dir,{recursive:true,force:true})}});

const exampleApproval=(moduleId='catalog-listings',scope_mode='FULL_NONBLOG')=>({
 schema_version:2,project_id:'basworldy',source_origin:'https://www.basworld.com',
 module_id:moduleId,gate:'OWNER_MODULE_VISUAL_PASS',status:'PASS',owner_explicit_pass:true,
 approval_recorded_at:'2026-11-03T10:36:00+08:00',
 owner_message_reference:'USER_CONVERSATION_MODULE_VISUAL_PASS_MSG',
 scope_mode,template_sha256:'a'.repeat(64),
 approved_template_urls:['https://www.basworld.com/stock/truck'],
 approved_representative_detail_urls:['https://www.basworld.com/vehicles/used/truck-volvo-123']
});
const approvalFile=(value,fn)=>{
 const d=fs.mkdtempSync(path.join(os.tmpdir(),'visual-gate-'));
 try{const file=path.join(d,'approval.json');fs.writeFileSync(file,JSON.stringify(value));fn(file)}
 finally{fs.rmSync(d,{recursive:true,force:true})}
};
test('module-specific listing PASS permits expansion in FULL_NONBLOG mode',()=>{
 approvalFile(exampleApproval(),file=>
 assert.equal(enforceVisualFirst({mode:'inventory',from:4,limit:30,moduleId:'catalog-listings',phase:'EXPANSION_AFTER_OWNER_PASS',approvalFile:file}).approved,true));
});
test('homeowner homepage PASS does not unlock listing template',()=>{
 approvalFile(exampleApproval('shared-shell'),file=>
 assert.throws(()=>enforceVisualFirst({mode:'inventory',from:1,limit:1,moduleId:'catalog-listings',phase:'EXPANSION_AFTER_OWNER_PASS',approvalFile:file}),/module-specific|requires/));
});
test('catalog listing PASS cannot unlock product detail batch',()=>{
 approvalFile(exampleApproval(),file=>
 assert.throws(()=>enforceVisualFirst({mode:'details',from:1,limit:1,moduleId:'product-details',phase:'EXPANSION_AFTER_OWNER_PASS',approvalFile:file,pilotUrl:'https://www.basworld.com/vehicles/used/truck-volvo-123'}),/module-specific|requires/));
});
test('FIRST_PAGE_CATALOG listing PASS still blocks page two',()=>{
 approvalFile(exampleApproval('catalog-listings','FIRST_PAGE_CATALOG'),file=>
 assert.throws(()=>enforceVisualFirst({mode:'inventory',from:2,limit:1,moduleId:'catalog-listings',phase:'EXPANSION_AFTER_OWNER_PASS',approvalFile:file}),/never permits list page 2/));
});
test('FIRST_PAGE_CATALOG product detail PASS only allows listed representative URL',()=>{
 approvalFile(exampleApproval('product-details','FIRST_PAGE_CATALOG'),file=>{
  assert.equal(enforceVisualFirst({mode:'details',from:1,limit:1,moduleId:'product-details',phase:'EXPANSION_AFTER_OWNER_PASS',approvalFile:file,pilotUrl:'https://www.basworld.com/vehicles/used/truck-volvo-123'}).approved,true);
  assert.throws(()=>enforceVisualFirst({mode:'details',from:1,limit:2,moduleId:'product-details',phase:'EXPANSION_AFTER_OWNER_PASS',approvalFile:file,pilotUrl:'https://www.basworld.com/vehicles/used/truck-volvo-123'}),/representative URL/);
 });
});
test('incomplete pass, generic continue and missing module id never unlock',()=>{
 approvalFile({...exampleApproval(),owner_message_reference:'continue'},file=>
 assert.throws(()=>enforceVisualFirst({mode:'inventory',from:2,limit:2,moduleId:'catalog-listings',phase:'EXPANSION_AFTER_OWNER_PASS',approvalFile:file}),/module-specific|requires/));
 approvalFile(exampleApproval(),file=>
 assert.throws(()=>enforceVisualFirst({mode:'inventory',from:2,limit:2,phase:'EXPANSION_AFTER_OWNER_PASS',approvalFile:file}),/moduleId/));
});
