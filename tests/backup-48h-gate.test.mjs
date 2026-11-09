import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {evaluateGate,estimateBudget,REQUIRED_MODULES} from '../skills/duplicate-site-skills/scripts/backup-48h-gate.mjs';

const root=path.dirname(fileURLToPath(import.meta.url));
const src=JSON.parse(fs.readFileSync(path.resolve(root,'../skills/duplicate-site-skills/templates/backup-48h-ledger.example.json'),'utf8'));
const fresh=()=>structuredClone(src);
const sample={source_url:'https://owned.example/stock/truck',local_url:'http://local.owned.test/stock/truck/',analysis_ref:'PRIVATE/prototype-analysis.md',desktop_ref:'PRIVATE/desktop.png',mobile_ref:'PRIVATE/mobile.png',auto_uat:'PASS'};
const pass={status:'PASS',owner_message_ref:'USER_CONVERSATION_VISUAL_PASS_TURN',approved_at:'2026-11-03T10:36:00+08:00',template_sha256:'a'.repeat(64)};
function finish(m){m.sample=structuredClone(sample);m.approval=structuredClone(pass);m.batch={expected:3,archived:3,verified:3,failed:0,offline_qa:'PASS'};m.state='MODULE_PASS';}
function authorized(){const d=fresh();d.demo_only=false;d.rights_verified=true;return d;}
test('demo remains rights blocked even with plausible first sample',()=>assert.equal(evaluateGate(fresh(),'sample','shared-shell').status,'BLOCKED'));
test('first owned module can read a sample, not batch before Owner pass',()=>{
 const d=authorized();assert.equal(evaluateGate(d,'sample','shared-shell').status,'ALLOWED');
 assert.ok(evaluateGate(d,'batch','shared-shell').blockers.includes('MODULE_OWNER_VISUAL_PASS_MISSING'));
});
test('prior module must fully close before next sample; homepage PASS alone does not unlock later categories',()=>{
 const d=authorized();d.modules[0].approval=structuredClone(pass);d.modules[0].state='OWNER_PASS';
 assert.ok(evaluateGate(d,'sample','catalog-listings').blockers.includes('PREVIOUS_MODULE_NOT_PASS'));
});
test('previous module with PASS, verified batch and offline QA unlocks next sample',()=>{
 const d=authorized();finish(d.modules[0]);assert.equal(evaluateGate(d,'sample','catalog-listings').status,'ALLOWED');
});
test('simple continue, fake boolean pass or incomplete ref never unlock batch',()=>{
 const d=authorized();const m=d.modules[0];m.sample=structuredClone(sample);m.state='OWNER_PASS';
 m.approval={status:'PASS',owner_message_ref:'continue',approved_at:'2026-11-03',template_sha256:'a'.repeat(64)};
 assert.ok(evaluateGate(d,'batch','shared-shell').blockers.includes('MODULE_OWNER_VISUAL_PASS_MISSING'));
});
test('explicit Owner-approved template permits same-type batch',()=>{
 const d=authorized();const m=d.modules[0];m.sample=structuredClone(sample);m.approval=structuredClone(pass);m.state='OWNER_PASS';
 assert.equal(evaluateGate(d,'batch','shared-shell').status,'ALLOWED');
});
test('module cannot close with missing batch route count or images',()=>{
 const d=authorized();finish(d.modules[0]);d.modules[0].batch.verified=2;
 assert.ok(evaluateGate(d,'next','shared-shell').blockers.includes('MODULE_BATCH_NOT_VERIFIED'));
});
test('offline QA must actually pass for close',()=>{
 const d=authorized();finish(d.modules[0]);d.modules[0].batch.offline_qa='OPEN';
 assert.equal(evaluateGate(d,'next','shared-shell').status,'BLOCKED');
});
test('no NEXT action without all actual source-backed sample evidence',()=>{
 const d=authorized();finish(d.modules[0]);d.modules[0].sample.mobile_ref=null;
 assert.ok(evaluateGate(d,'next','shared-shell').blockers.includes('MODULE_TEMPLATE_NOT_SIGNED'));
});
test('complete blocked without final Owner pass and manifest coverage',()=>{
 const d=authorized();for(const m of d.modules)finish(m);
 const result=evaluateGate(d,'complete');
 assert.equal(result.status,'BLOCKED');assert.ok(result.blockers.includes('FINAL_OWNER_LOCAL_ACCEPTANCE_MISSING'));
 assert.ok(result.blockers.includes('SOURCE_SCOPE_ROUTE_DENOMINATOR_UNRECONCILED'));
});
test('scoped page-one archive completion must never say FULL_NONBLOG',()=>{
 const d=authorized();for(const m of d.modules)finish(m);
 d.scope.included_route_count=18;d.scope.measured_route_count=18;
 d.final_owner_acceptance={status:'PASS',owner_message_ref:'USER_FINAL_LOCAL_PASS_MESSAGE'};
 d.final_offline_report='PRIVATE/final-offline-manifest.json';
 const r=evaluateGate(d,'complete');assert.equal(r.status,'ALLOWED');assert.equal(r.can_claim_full_nonblog,false);
});
test('full nonblog mode requires all details and exhaustive source inventory',()=>{
 const d=authorized();for(const m of d.modules)finish(m);
 d.scope.mode='FULL_NONBLOG';d.scope.listing_max_page=null;d.scope.product_details='all';
 d.scope.included_route_count=100;d.scope.measured_route_count=100;
 d.final_owner_acceptance={status:'PASS',owner_message_ref:'USER_FINAL_LOCAL_PASS_MESSAGE'};
 d.final_offline_report='PRIVATE/final-offline-manifest.json';
 assert.ok(evaluateGate(d,'complete').blockers.includes('NONBLOG_FULL_SOURCE_INVENTORY_NOT_VERIFIED'));
 d.scope.source_inventory_complete=true;
 const r=evaluateGate(d,'complete');assert.equal(r.status,'ALLOWED');assert.equal(r.can_claim_full_nonblog,true);
});
test('full nonblog refuses representative-only product mode',()=>{
 const d=authorized();d.scope.mode='FULL_NONBLOG';
 assert.ok(evaluateGate(d).errors.includes('FULL_SCOPE_REQUIRES_ALL_PRODUCT_DETAILS'));
});
test('the six ordered modules are frozen; cannot secretly skip a page type',()=>{
 const d=authorized();d.modules.splice(2,1);
 assert.ok(evaluateGate(d).errors.includes('MODULE_ORDER_INVALID'));
 assert.equal(REQUIRED_MODULES.length,6);
});
test('budget cannot be claimed before measured source throughput exists',()=>{
 const d=authorized();assert.equal(estimateBudget(d).status,'UNMEASURED');
});
test('measured 48h budget flags at-risk projects instead of silently claiming completion',()=>{
 const d=authorized();Object.assign(d.execution,{active_hours_spent:8,measured_pages_per_hour:10,measured_assets_per_hour:20,remaining_routes:350,remaining_assets:400,remaining_template_hours:12,remaining_qa_hours:6,buffer_hours:4});
 assert.equal(estimateBudget(d).status,'AT_RISK_48H');
});
test('measured smaller job can be on track',()=>{
 const d=authorized();Object.assign(d.execution,{active_hours_spent:8,measured_pages_per_hour:60,measured_assets_per_hour:300,remaining_routes:120,remaining_assets:300,remaining_template_hours:10,remaining_qa_hours:6,buffer_hours:4});
 assert.equal(estimateBudget(d).status,'ON_TRACK');
});
test('excess active hours are explicitly over budget',()=>{
 const d=authorized();Object.assign(d.execution,{active_hours_spent:49,measured_pages_per_hour:60,measured_assets_per_hour:300,remaining_routes:1,remaining_assets:1,remaining_template_hours:0,remaining_qa_hours:0,buffer_hours:4});
 assert.equal(estimateBudget(d).status,'OVER_48H');
});
