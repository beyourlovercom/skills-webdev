#!/usr/bin/env node
// S2 evidence preflight: purely OFFLINE, no deployment and no authority to write.
import fs from 'node:fs';import path from 'node:path';import {pathToFileURL} from 'node:url';
const SHA=/^[a-f0-9]{40}$/;
const NAME=/^[a-z0-9][a-z0-9._-]{1,80}$/;
const STAGES=['local','dev','www'];
const KINDS=new Set(['BROWSER','FUNCTIONAL','SECURITY','SEO','ROLLBACK','ADMIN_DESKTOP','STOREFRONT_DESKTOP','STOREFRONT_MOBILE','PAYMENT_TEST','FORM_TEST','INVENTORY_TEST','PERFORMANCE','HTTP_READBACK']);
const SAFE_REF=/^(?:private|github):\/\/[a-zA-Z0-9_./:@#-]{3,500}$/;
const isObject=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
const safeRef=x=>typeof x==='string'&&SAFE_REF.test(x)&&!x.includes('..');
const isSha=x=>typeof x==='string'&&SHA.test(x);
const iso=x=>typeof x==='string'&&Number.isFinite(Date.parse(x))&&/^\d{4}-\d{2}-\d{2}T/.test(x);
const host=x=>{try{const u=new URL(x);return ['http:','https:'].includes(u.protocol)&&!u.username&&!u.password&&!u.search&&!u.hash&&u.pathname==='/'&&u.hostname.includes('.')}catch{return false}};
const arrStrings=x=>Array.isArray(x)&&x.length>0&&x.every(v=>typeof v==='string'&&/^[a-zA-Z0-9_][a-zA-Z0-9_./-]{1,240}$/.test(v)&&!v.includes('..')&&!v.split('/').includes('.')&&!v.endsWith('/'))&&new Set(x).size===x.length;
export function evaluateS2(m,requestedGate='www'){
 const blockers=[],warnings=[],put=s=>{if(!blockers.includes(s))blockers.push(s)};
 if(!STAGES.includes(requestedGate))return{status:'BLOCKED',gate:requestedGate,blockers:['UNKNOWN_GATE'],warnings,attestation:'DECLARED_EVIDENCE_ONLY_NOT_AUTHORIZATION'};
 if(!isObject(m)||m.schema_version!==1){put('INVALID_SCHEMA');return{status:'BLOCKED',gate:requestedGate,blockers,warnings,attestation:'DECLARED_EVIDENCE_ONLY_NOT_AUTHORIZATION'};}
 const p=m.project,e=m.environments,s=m.stages,a=m.approvals,r=m.release,policy=m.policy;
 if(!isObject(p)||typeof p.id!=='string'||!NAME.test(p.id)||typeof p.repository!=='string'||!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(p.repository)||!safeRef(p.agents_ref)||!safeRef(p.s1_handoff_ref))put('INVALID_PROJECT_CONTEXT');
 if(!isObject(p)||typeof p.customer_facing!=='boolean'||typeof p.admin_backend!=='boolean'||(!p.customer_facing&&!p.admin_backend)||!['STANDARD','DEV_FINAL_EXCEPTION'].includes(p.deployment_model))put('INVALID_SURFACE_PROFILE');
 if(p?.deployment_model==='DEV_FINAL_EXCEPTION')put('DEV_FINAL_REQUIRES_SEPARATE_SITE_SPECIFIC_WORKFLOW');
 if(!isObject(e)||STAGES.some(k=>!isObject(e[k])||!host(e[k].url)||typeof e[k].device!=='string'||!e[k].device.trim()))put('INVALID_ENVIRONMENT_TARGETS');
 if(isObject(e)&&STAGES.every(k=>isObject(e[k])&&host(e[k].url))){
  const urls=STAGES.map(k=>new URL(e[k].url).host.toLowerCase());
  if(new Set(urls).size!==3)put('ENVIRONMENT_TARGETS_NOT_ISOLATED');
  if(new URL(e.www.url).protocol!=='https:')put('WWW_REQUIRES_HTTPS');
 }
 if(!isObject(policy)||policy.dev_indexing!=='BLOCKED'||policy.dev_external_effects!=='DISABLED_OR_SANDBOX'||policy.production_data!=='PRESERVE'||policy.production_business_tests!=='NON_DESTRUCTIVE')put('ENVIRONMENT_SAFETY_POLICY_NOT_VERIFIED');
 if(!isObject(s)||STAGES.some(k=>!isObject(s[k])||!['PASS','FAIL','OPEN','NOT_RUN'].includes(s[k].status)||!Array.isArray(s[k].checks)))put('INVALID_STAGE_STRUCTURE');
 const stageVerified={};
 if(isObject(s))for(const k of STAGES){
  const st=s[k];if(!isObject(st)||!Array.isArray(st.checks))continue;
  if(st.sha!==null&&!isSha(st.sha))put('INVALID_SHA_'+k.toUpperCase());
  const actualHost=isObject(e)&&isObject(e[k])&&host(e[k].url)?new URL(e[k].url).host.toLowerCase():null;
  const found=new Set(),passed=new Set();
  for(const t of st.checks){
   if(!isObject(t)||typeof t.id!=='string'||!NAME.test(t.id)||found.has(t.id)||!KINDS.has(t.kind)||!['PASS','FAIL','OPEN','NOT_RUN'].includes(t.status)){put('INVALID_CHECK_'+k.toUpperCase());continue;}
   found.add(t.id);
   if(t.status==='PASS'){
    if(!isSha(t.sha)||t.sha!==st.sha||!safeRef(t.evidence_ref)||!iso(t.observed_at)||typeof t.host!=='string'||t.host.toLowerCase()!==actualHost)put('UNPROVEN_CHECK_'+k.toUpperCase());
    else passed.add(t.kind);
   }
  }
  const required=(k==='local'?['BROWSER','FUNCTIONAL','SECURITY']:k==='dev'?['BROWSER','FUNCTIONAL','SECURITY','SEO','ROLLBACK']:['HTTP_READBACK']);
  if(p?.customer_facing&&k!=='www')required.push('STOREFRONT_DESKTOP','STOREFRONT_MOBILE');
  if(p?.admin_backend&&k!=='www')required.push('ADMIN_DESKTOP');
  stageVerified[k]=st.status==='PASS'&&isSha(st.sha)&&required.every(req=>passed.has(req))&&st.checks.every(c=>c.status==='PASS');
  if(st.status==='PASS'&&!stageVerified[k])put('STAGE_PASS_UNPROVEN_'+k.toUpperCase());
 }
 if(!isObject(a)||!isObject(a.dev)||!isObject(a.www))put('INVALID_APPROVAL_STRUCTURE');
 if(!isObject(r)||!isSha(r.candidate_sha)||!arrStrings(r.changed_paths)||!safeRef(r.diff_ref)||!safeRef(r.rollback_ref)||!safeRef(r.backup_ref)||r.data_policy!=='PRESERVE_LIVE_DATA')put('INCOMPLETE_RELEASE_PACKAGE');
 if(isObject(r)&&isObject(s)&&isObject(s.local)&&isSha(r.candidate_sha)&&isSha(s.local.sha)&&r.candidate_sha!==s.local.sha)put('RELEASE_SHA_LOCAL_MISMATCH');
 if(isObject(s)&&isObject(s.dev)&&isSha(s.dev.sha)&&isObject(r)&&isSha(r.candidate_sha)&&s.dev.sha!==r.candidate_sha)put('LOCAL_DEV_SHA_MISMATCH');
 function approvalOk(k,sha,env){
  const q=a?.[k];return isObject(q)&&q.decision==='pass'&&q.sha===sha&&q.target===env&&safeRef(q.owner_message_ref)&&iso(q.approved_at)&&q.scope_ref===r?.diff_ref;
 }
 if(!stageVerified.local)put('LOCAL_BROWSER_UAT_NOT_PASS');
 if(requestedGate==='dev'||requestedGate==='www'){
  if(!approvalOk('dev',r?.candidate_sha,e?.dev?.url))put('DEV_DEPLOY_APPROVAL_REQUIRED');
 }
 if(requestedGate==='www'){
  if(stageVerified.dev!==true)put('DEV_FULL_UAT_NOT_PASS');
  if(!approvalOk('www',r?.candidate_sha,e?.www?.url))put('OWNER_WWW_PASS_REQUIRED');
  if(!isObject(r)||!safeRef(r.production_before_ref)||!safeRef(r.production_rollback_test_ref))put('PRODUCTION_SNAPSHOT_OR_ROLLBACK_MISSING');
 }
 if(requestedGate==='local'&&s?.local?.status==='PASS')warnings.push('Local evidence is user-declared; independently verify browser and runtime before any write.');
 if(requestedGate==='www')warnings.push('READY_FOR_WWW_REVIEW is NOT a write token; re-verify Owner pass, target, exact SHA and runtime immediately before deployment.');
 return {schema_version:1,status:blockers.length?'BLOCKED':'READY_FOR_'+requestedGate.toUpperCase()+'_REVIEW',gate:requestedGate,blockers,warnings,
  current:{local:stageVerified.local||false,dev:stageVerified.dev||false,www:stageVerified.www||false},attestation:'DECLARED_EVIDENCE_ONLY_NOT_AUTHORIZATION',
  requires_real_runtime_readback:true,automatic_deployment:false};
}
export function cli(argv){
 let manifest,gate='www';for(let i=0;i<argv.length;i++){const a=argv[i];if(a==='--manifest'&&argv[i+1]){manifest=argv[++i];continue;}if(a==='--gate'&&argv[i+1]){gate=argv[++i];continue;}throw Error('Usage: --manifest <JSON> --gate local|dev|www');}
 if(!manifest)throw Error('manifest required');
 const file=path.resolve(manifest),st=fs.lstatSync(file);
 if(!st.isFile()||st.isSymbolicLink()||st.size>300000)throw Error('BLOCKED_INVALID_MANIFEST_FILE');
 return evaluateS2(JSON.parse(fs.readFileSync(file,'utf8')),gate);
}
if(process.argv[1]&&fs.existsSync(process.argv[1])&&import.meta.url===pathToFileURL(fs.realpathSync(process.argv[1])).href){
 try{const r=cli(process.argv.slice(2));console.log(JSON.stringify(r,null,2));process.exitCode=r.status==='BLOCKED'?2:0;}
 catch(e){console.error(e.message);process.exitCode=2;}
}
