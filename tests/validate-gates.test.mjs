import test from 'node:test';
import assert from 'node:assert/strict';
import {validateGate} from '../src/validate-gates.mjs';
const base=(stage,env,checks)=>({
  stage,site:'example.org',environment:env,checked_at_utc:'2026-10-30T10:00:00Z',
  head_sha:'a'.repeat(40),source_references:['synthetic data source (no live assertion)'],
  tests:checks.map(id=>({id,result:'PASS',evidence:'synthetic fixture: '+id})),approvals:[]
});
test('S1 traceability and quality validated only with evidence',()=>{
  const d=base('S1','Research',['source_traceability','conversion_quality','keyword_url_map']);
  assert.equal(validateGate(d).status,'PASS');
  d.source_references=[];assert.equal(validateGate(d).status,'BLOCKED');
});
test('Dev gate blocks missing isolation even if other checks pass',()=>{
  const d=base('S2-B','Dev',['dev_browser','business_flow','rollback_ready']);
  assert.equal(validateGate(d).status,'BLOCKED');
  d.tests.push({id:'index_isolation',result:'PASS',evidence:'noindex Dev fixture'});
  assert.equal(validateGate(d).status,'PASS');
});
test('WWW release requires separate referenced Owner approval',()=>{
  const d=base('S2-C','WWW',['approved_delta','www_readback','rollback_ready','live_data_preserved']);
  assert.equal(validateGate(d).status,'BLOCKED');
  d.approvals=[{scope:'WWW release',state:'APPROVED',reference:'Owner dated pass in issue #123'}];
  assert.equal(validateGate(d).status,'PASS');
});
test('S6 publishing blocked without policy, draft can pass quality gate',()=>{
  const d=base('S6','WWW',['fact_check','asset_rights','editorial_review']);
  d.publish_mode='draft';assert.equal(validateGate(d).status,'PASS');
  d.publish_mode='auto_publish';assert.equal(validateGate(d).status,'BLOCKED');
});
test('Code routed away from S4, bulk write requires distinct S5 approval',()=>{
  const a=base('S4','WWW',['keyword_url_map','change_scope','rollback_ready']);
  a.change_type='code';assert.equal(validateGate(a).status,'BLOCKED');
  const b=base('S5','WWW',['content_rights','brand_uniqueness','editorial_review']);
  b.bulk_replace=true;assert.equal(validateGate(b).status,'BLOCKED');
});
test('No unproven PASS or duplicate IDs',()=>{
  const d=base('S1','Research',['source_traceability','conversion_quality','keyword_url_map']);
  d.tests[0].evidence='UNKNOWN';assert.equal(validateGate(d).status,'BLOCKED');
  d.tests[0].evidence='sufficient fixture';d.tests.push({...d.tests[0]});
  assert.equal(validateGate(d).status,'BLOCKED');
});
