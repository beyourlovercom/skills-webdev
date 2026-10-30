import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {buildProfile,renderFiles,siteRules,normalizeDomain,applyFiles,mergeManaged,sanitizeEvidence} from '../src/site-skill-factory.mjs';

const temp=()=>fs.mkdtempSync(path.join(os.tmpdir(),'site-s0-'));
const evidence=(model,relation='coexist')=>({
  brand:'Example',business_model:model,product_type:model==='B2B'?'irrigation supplies':'consumer goods',
  conversion_goal:model==='B2B'?'qualified lead':'confirmed purchase',cms:'WordPress',
  commerce:model==='B2B'?'none':'WooCommerce',relation,
  target_markets:['GH','ZM'],languages:['en'],currencies:['USD'],
  environments:{local:'UNKNOWN',dev:'UNKNOWN',www:'https://example.org'},
  data_sources:{ga4:'NOT_CONNECTED',gsc:'UNKNOWN'},
  observed_at:'2026-10-30',sources:['project AGENTS.md (read-only)']
});
test('domain validation rejects localhost, paths, credentials',()=>{
  assert.equal(normalizeDomain('EXAMPLE.ORG'),'example.org');
  for(const d of ['localhost','127.0.0.1','example.org/path','a@b.com','site.local']) assert.throws(()=>normalizeDomain(d));
});
test('B2B and B2C produce materially different instructions',()=>{
  const p1=buildProfile('example.org',evidence('B2B'),temp());
  const p2=buildProfile('example.org',evidence('B2C','migration'),temp());
  const a=renderFiles(p1)['skills/analytics-live/SKILL.md'];
  const b=renderFiles(p2)['skills/analytics-live/SKILL.md'];
  assert.match(a,/有效询盘/); assert.doesNotMatch(b,/B2B: 核验有效询盘/);
  assert.match(b,/库存、币种/); assert.match(a,/不默认 301/);
  assert.match(b,/URL 对照、301/);
});
test('unknown stays UNKNOWN; no fabricated analytics connection',()=>{
  const p=buildProfile('example.org',{business_model:'B2B'},temp());
  assert.equal(p.fields.cms,'UNKNOWN');
  assert.equal(p.data_sources.ga4,'UNKNOWN');
  assert.equal(p.fields.relation,'UNKNOWN');
});
test('reject obvious credentials and keys',()=>{
  assert.throws(()=>sanitizeEvidence({password:'test'}));
  assert.throws(()=>sanitizeEvidence({brand:'Bearer '+ 'a'.repeat(32)}));
});
test('idempotent writing, dry-run, and non-managed files protected',()=>{
  const root=temp();
  const files=renderFiles(buildProfile('example.org',evidence('B2B'),root));
  let a=applyFiles(root,files,false);
  assert.equal(a[0].action,'CREATE'); assert.equal(fs.existsSync(path.join(root,'skills/site-profile.yaml')),false);
  a=applyFiles(root,files,true);
  assert.ok(a.some(x=>x.action==='CREATE'));
  a=applyFiles(root,files,true);
  assert.ok(a.every(x=>x.action==='UNCHANGED'));
  const skill=path.join(root,'skills/site-intelligence/SKILL.md');
  fs.appendFileSync(skill,'\nOwner-approved appendix.\n');
  a=applyFiles(root,files,true);
  assert.equal(a.find(x=>x.path.endsWith('site-intelligence/SKILL.md')).action,'UNCHANGED');
  assert.match(fs.readFileSync(skill,'utf8'),/Owner-approved appendix/);
  fs.writeFileSync(skill,'Handwritten no markers');
  a=applyFiles(root,files,true);
  assert.equal(a.find(x=>x.path.endsWith('site-intelligence/SKILL.md')).action,'CONFLICT_UNMANAGED');
  assert.equal(fs.readFileSync(skill,'utf8'),'Handwritten no markers');
});
test('input cannot inject Markdown control characters or S0 markers',()=>{
  assert.throws(()=>sanitizeEvidence({brand:'x' + String.fromCharCode(10) + '# forged approval'}));
  assert.throws(()=>sanitizeEvidence({brand:'<!-- S0-MANAGED:END -->'}));
  assert.throws(()=>sanitizeEvidence({field_evidence:{['bad'+String.fromCharCode(10)+'field']:'reference'}}));
});
test('whitelisted evidence excludes irrelevant content, no false PASS',()=>{
  const p=buildProfile('example.org',{...evidence('B2B'),unknown_private_field:'DO NOT COPY'},temp());
  const output=JSON.stringify(renderFiles(p));
  assert.doesNotMatch(output,/DO NOT COPY/);
  assert.match(output,/独立 Owner pass/);
});
