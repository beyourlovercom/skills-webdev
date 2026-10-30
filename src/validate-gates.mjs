#!/usr/bin/env node
// Fail-closed, offline evaluator for S1–S6 evidence records. Not an approval issuer.
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
const REQUIREMENTS = {
 'S1':{env:'Research',checks:['source_traceability','conversion_quality','keyword_url_map'],sources:true},
 'S2-A':{env:'Local',checks:['local_browser','business_flow','isolated_local']},
 'S2-B':{env:'Dev',checks:['dev_browser','business_flow','index_isolation','rollback_ready']},
 'S2-C':{env:'WWW',checks:['approved_delta','www_readback','rollback_ready','live_data_preserved'],approval:'WWW release'},
 'S3':{env:'WWW',checks:['live_event_readback','conversion_reconciliation','deduplication'],sources:true},
 'S4':{env:'WWW',checks:['keyword_url_map','change_scope','rollback_ready'],sources:true},
 'S5':{env:'WWW',checks:['content_rights','brand_uniqueness','editorial_review']},
 'S6':{env:'WWW',checks:['fact_check','asset_rights','editorial_review']}
};
const goodText = x => typeof x==='string' && x.trim().length>=6 && !/^UNKNOWN|NOT_APPROVED$/i.test(x.trim());
const allowedState = s=>['PASS','FAIL','OPEN','NOT_APPLICABLE'].includes(s);
export function validateGate(doc) {
  const errors=[];
  if (!doc || typeof doc!=='object' || Array.isArray(doc)) return {status:'BLOCKED',errors:['Manifest must be object']};
  const spec=REQUIREMENTS[doc.stage];
  if (!spec) return {status:'BLOCKED',errors:['Unknown stage']};
  if (!goodText(doc.site)) errors.push('site required');
  if (doc.environment!==spec.env) errors.push('Wrong environment: expected '+spec.env);
  if (!goodText(doc.checked_at_utc) || !/^\d{4}-\d{2}-\d{2}T/.test(doc.checked_at_utc)) errors.push('checked_at_utc must be an ISO date-time');
  if (!Array.isArray(doc.source_references)) errors.push('source_references array required');
  if (spec.sources && !(Array.isArray(doc.source_references)&&doc.source_references.some(goodText))) errors.push('Source references required');
  if (['S2-A','S2-B','S2-C'].includes(doc.stage) && !/^[a-f0-9]{40}$/.test(doc.head_sha || '')) errors.push('Exact 40-character Git SHA required');
  if (!Array.isArray(doc.tests)) errors.push('tests array required');
  const ids=new Set();
  for (const t of Array.isArray(doc.tests)?doc.tests:[]) {
    if (!t || typeof t!=='object'||typeof t.id!=='string'||ids.has(t.id)) {errors.push('Malformed/duplicate test ID');continue;}
    ids.add(t.id);
    if (!allowedState(t.result)) errors.push('Invalid test result for '+t.id);
    if (t.result==='PASS' && !goodText(t.evidence)) errors.push('PASS missing evidence for '+t.id);
  }
  for(const check of spec.checks) {
    const t=(Array.isArray(doc.tests)?doc.tests:[]).find(x=>x && x.id===check);
    if (!t || t.result!=='PASS'||!goodText(t.evidence)) errors.push('Required check not proven: '+check);
  }
  if (spec.approval) {
    const a=Array.isArray(doc.approvals)?doc.approvals.find(x=>x?.scope===spec.approval):null;
    if (!a || a.state!=='APPROVED' || !goodText(a.reference)) errors.push('Owner approval with source reference required: '+spec.approval);
  }
  if (doc.stage==='S6' && ['schedule','publish','auto_publish'].includes(doc.publish_mode)) {
    const a=Array.isArray(doc.approvals)?doc.approvals.find(x=>x?.scope==='Content publishing policy'):null;
    if (!a || a.state!=='APPROVED' || !goodText(a.reference)) errors.push('Content publishing policy Owner approval required');
    const t=(Array.isArray(doc.tests)?doc.tests:[]).find(x=>x?.id==='publish_policy');
    if (!t || t.result!=='PASS' || !goodText(t.evidence)) errors.push('Publish policy proof required');
  }
  if (doc.stage==='S4' && doc.change_type==='code') errors.push('Code/theme/plugin/template/DB edits must return to S2');
  if (doc.stage==='S5' && doc.bulk_replace===true) {
    const a=Array.isArray(doc.approvals)?doc.approvals.find(x=>x?.scope==='Bulk content update'):null;
    if (!a || a.state!=='APPROVED' || !goodText(a.reference)) errors.push('Bulk content update requires separate approval');
  }
  return {status:errors.length?'BLOCKED':'PASS', stage:doc.stage, site:doc.site, errors};
}
export function run(argv) {
  const i=argv.indexOf('--manifest');
  if (i<0 || !argv[i+1]) throw new Error('Usage: node src/validate-gates.mjs --manifest evidence.json');
  const d=JSON.parse(fs.readFileSync(argv[i+1],'utf8'));
  const r=validateGate(d); process.stdout.write(JSON.stringify(r,null,2)+'\n');
  if (r.status!=='PASS') process.exitCode=2;
  return r;
}
if (process.argv[1] && import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href) {
  try {run(process.argv.slice(2));}catch(e){console.error('GATE ERROR: '+e.message);process.exitCode=1;}
}
