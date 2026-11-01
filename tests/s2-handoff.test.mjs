import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {evaluateS2,cli} from '../skills/site-builder-local/scripts/s2-handoff-validate.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const template=JSON.parse(fs.readFileSync(path.join(root,'skills/site-builder-local/templates/s2-handoff.example.json'),'utf8'));
const SHA='a'.repeat(40);
const make=()=>structuredClone(template);
const check=(kind,host)=>({id:kind.toLowerCase().replaceAll('_','-'),kind,status:'PASS',sha:SHA,host,evidence_ref:'private://uat/'+kind.toLowerCase()+'.json',observed_at:'2026-10-31T09:00:00Z'});
function localPass(m){
 m.release.candidate_sha=SHA;m.release.diff_ref='private://release/diff.json';
 m.release.rollback_ref='private://release/rollback.md';m.release.backup_ref='private://release/backup.txt';
 m.stages.local.sha=SHA;m.stages.local.status='PASS';
 const kinds=['BROWSER','FUNCTIONAL','SECURITY'];
 if(m.project.customer_facing)kinds.push('STOREFRONT_DESKTOP','STOREFRONT_MOBILE');
 if(m.project.admin_backend)kinds.push('ADMIN_DESKTOP');
 m.stages.local.checks=kinds.map(k=>check(k,new URL(m.environments.local.url).host));
 return m;
}
function devApproval(m){
 m.approvals.dev={decision:'pass',sha:SHA,target:m.environments.dev.url,
  scope_ref:m.release.diff_ref,owner_message_ref:'private://owner/dev-pass',approved_at:'2026-10-31T10:00:00Z'};
 return m;
}
function devPass(m){
 m.stages.dev.sha=SHA;m.stages.dev.status='PASS';
 const kinds=['BROWSER','FUNCTIONAL','SECURITY','SEO','ROLLBACK'];
 if(m.project.customer_facing)kinds.push('STOREFRONT_DESKTOP','STOREFRONT_MOBILE');
 if(m.project.admin_backend)kinds.push('ADMIN_DESKTOP');
 m.stages.dev.checks=kinds.map(k=>check(k,new URL(m.environments.dev.url).host));
 return m;
}
function wwwApproval(m){
 m.approvals.www={decision:'pass',sha:SHA,target:m.environments.www.url,
  scope_ref:m.release.diff_ref,owner_message_ref:'private://owner/www-pass',approved_at:'2026-10-31T12:00:00Z'};
 m.release.production_before_ref='private://release/www-before.json';
 m.release.production_rollback_test_ref='private://release/rollback-readback.json';
 return m;
}
test('sample manifest is deliberately BLOCKED; demo is NOT a deployment pass',()=>{
 for(const stage of ['local','dev','www']){
  const a=evaluateS2(make(),stage);
  assert.equal(a.status,'BLOCKED');
  assert.equal(a.automatic_deployment,false);
  assert.equal(a.attestation,'DECLARED_EVIDENCE_ONLY_NOT_AUTHORIZATION');
 }
});
test('Local PASS requires real SHA-scoped browser, business, desktop-admin and storefront mobile evidence',()=>{
 const m=localPass(make());
 assert.equal(evaluateS2(m,'local').status,'READY_FOR_LOCAL_REVIEW');
 m.stages.local.checks=m.stages.local.checks.filter(x=>x.kind!=='STOREFRONT_MOBILE');
 assert.ok(evaluateS2(m,'local').blockers.includes('STAGE_PASS_UNPROVEN_LOCAL'));
});
test('Andy admin-backend Desktop-only does not waive storefront mobile tests',()=>{
 const m=localPass(make());
 m.stages.local.checks=m.stages.local.checks.filter(x=>x.kind!=='ADMIN_DESKTOP');
 assert.equal(evaluateS2(m,'local').status,'BLOCKED');
 const n=localPass(make());n.project.customer_facing=false;
 n.stages.local.checks=n.stages.local.checks.filter(x=>!x.kind.startsWith('STOREFRONT_'));
 assert.equal(evaluateS2(n,'local').status,'READY_FOR_LOCAL_REVIEW');
});
test('Dev release requires separate scoped Dev approval, not just Local PASS',()=>{
 const m=localPass(make());const r=evaluateS2(m,'dev');
 assert.equal(r.status,'BLOCKED');assert.ok(r.blockers.includes('DEV_DEPLOY_APPROVAL_REQUIRED'));
 devApproval(m);assert.equal(evaluateS2(m,'dev').status,'READY_FOR_DEV_REVIEW');
 m.approvals.dev.sha='b'.repeat(40);assert.equal(evaluateS2(m,'dev').status,'BLOCKED');
});
test('WWW blocks even after Local and Dev PASS without owner WWW pass and backup',()=>{
 const m=devPass(devApproval(localPass(make()))),r=evaluateS2(m,'www');
 assert.ok(r.blockers.includes('OWNER_WWW_PASS_REQUIRED'));
 assert.ok(r.blockers.includes('PRODUCTION_SNAPSHOT_OR_ROLLBACK_MISSING'));
 assert.equal(r.status,'BLOCKED');
 wwwApproval(m);const ok=evaluateS2(m,'www');
 assert.equal(ok.status,'READY_FOR_WWW_REVIEW');
 assert.equal(ok.automatic_deployment,false);
});
test('Owner pass binds exact SHA, target and change-scope ref',()=>{
 const m=wwwApproval(devPass(devApproval(localPass(make()))));
 for(const q of [{sha:'b'.repeat(40)},{target:'https://other.example.com/'},{scope_ref:'private://release/different.json'},{owner_message_ref:null}]){
  const n=structuredClone(m);Object.assign(n.approvals.www,q);
  assert.ok(evaluateS2(n,'www').blockers.includes('OWNER_WWW_PASS_REQUIRED'));
 }
});
test('changed Local/Dev SHA or invalid check evidence cannot be hidden',()=>{
 const m=wwwApproval(devPass(devApproval(localPass(make()))));m.stages.dev.sha='b'.repeat(40);
 assert.ok(evaluateS2(m,'www').blockers.includes('LOCAL_DEV_SHA_MISMATCH'));
 const n=localPass(make());n.stages.local.checks[0].sha='b'.repeat(40);
 assert.ok(evaluateS2(n,'local').blockers.includes('UNPROVEN_CHECK_LOCAL'));
});
test('Dev indexing, outbound side effects and production-preservation are hard gates',()=>{
 const m=localPass(make());
 for(const [k,v] of [['dev_indexing','INDEXABLE'],['dev_external_effects','LIVE'],['production_data','OVERWRITE'],['production_business_tests','REAL_PAYMENT']]){
  const n=structuredClone(m);n.policy[k]=v;
  assert.ok(evaluateS2(n,'local').blockers.includes('ENVIRONMENT_SAFETY_POLICY_NOT_VERIFIED'));
 }
});
test('same Local/Dev/WWW host, HTTP WWW, Dev-final exception all fail safely',()=>{
 const m=localPass(make());
 const n=structuredClone(m);n.environments.dev.url=n.environments.www.url;
 assert.ok(evaluateS2(n,'local').blockers.includes('ENVIRONMENT_TARGETS_NOT_ISOLATED'));
 const w=structuredClone(m);w.environments.www.url='http://www.example.com/';
 assert.ok(evaluateS2(w,'local').blockers.includes('WWW_REQUIRES_HTTPS'));
 const e=structuredClone(m);e.project.deployment_model='DEV_FINAL_EXCEPTION';
 assert.ok(evaluateS2(e,'local').blockers.includes('DEV_FINAL_REQUIRES_SEPARATE_SITE_SPECIFIC_WORKFLOW'));
});
test('failed Dev browser QA prevents WWW promotion even with owner pass',()=>{
 const m=wwwApproval(devPass(devApproval(localPass(make()))));
 m.stages.dev.checks[0].status='FAIL';
 assert.ok(evaluateS2(m,'www').blockers.includes('DEV_FULL_UAT_NOT_PASS'));
});
test('offline CLI reads manifest but performs no site/network/write operations',()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'s2-manifest-'));
 try{
  const f=path.join(dir,'handoff.json');
  fs.writeFileSync(f,JSON.stringify(localPass(make())));
  const result=cli(['--manifest',f,'--gate','dev']);
  assert.equal(result.status,'BLOCKED');
  assert.equal(fs.readdirSync(dir).length,1);
  assert.equal(cli(['--manifest',f,'--gate','unknown']).status,'BLOCKED');
 }finally{fs.rmSync(dir,{recursive:true,force:true});}
});
