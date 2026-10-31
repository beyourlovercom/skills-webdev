import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {validateManifest} from '../skills/duplicate-site-skills/scripts/validate-manifest.mjs';
const root=path.dirname(fileURLToPath(import.meta.url));
const example=JSON.parse(fs.readFileSync(path.resolve(root,'../skills/duplicate-site-skills/templates/site-manifest.example.json'),'utf8'));
const clone=()=>structuredClone(example);

test('the public example is schema-valid, but rights and release remain blocked',()=>{
 const r=validateManifest(example);
 assert.equal(r.schema_status,'PASS');
 assert.equal(r.rights_gate,'BLOCKED');
 assert.equal(r.www_gate,'BLOCKED');
 assert.equal(r.index_gate,'HOLD');
 assert.equal(r.route_count,2);
});
test('mere owner pass without verified source rights cannot deploy',()=>{
 const d=clone();d.release.owner_pass=true;d.release.approved_sha='a'.repeat(40);
 d.release.backup_verified=true;d.evidence.local_qa='PASS';d.evidence.dev_qa='PASS';
 assert.equal(validateManifest(d).www_gate,'BLOCKED');
});
test('verified rights, passes, backup and full SHA produce review gate, not an auto-release',()=>{
 const d=clone();d.demo_only=false;d.source.rights_status='verified';
 d.source.rights_evidence_ref='PRIVATE_PROJECT/rights-approval.md';
 d.release.owner_pass=true;d.release.approved_sha='a'.repeat(40);
 d.release.backup_verified=true;d.evidence.local_qa='PASS';d.evidence.dev_qa='PASS';
 const r=validateManifest(d);
 assert.equal(r.schema_status,'PASS');
 assert.equal(r.rights_gate,'CHECK_EVIDENCE');
 assert.equal(r.www_gate,'READY_FOR_MANUAL_REVIEW');
 assert.equal(r.index_gate,'HOLD');
 d.target.indexing='allow-index';
 assert.equal(validateManifest(d).index_gate,'READY_FOR_SEPARATE_SEO_APPROVAL');
});
test('route duplicates and arbitrary path traversal are rejected',()=>{
 const d=clone();d.routes.push({source_path:'/',target_path:'/hijack/',status:'planned'});
 d.routes.push({source_path:'/../secret/',target_path:'/x/',status:'planned'});
 const r=validateManifest(d);
 assert.equal(r.schema_status,'FAIL');
 assert.ok(r.errors.some(x=>x.includes('duplicate source')));
 assert.ok(r.errors.some(x=>x.includes('invalid route')));
});
test('credential-bearing origins, diverged WWW origin and token keys are rejected',()=>{
 const d=clone();d.source.origin='https://user:pass@source.example/';
 d.environments.www='https://unknown.example';
 d.api_token='ghp_12345678901234567890123';
 const r=validateManifest(d);
 assert.equal(r.schema_status,'FAIL');
 assert.ok(r.errors.some(x=>x.includes('source.origin')));
 assert.ok(r.errors.some(x=>x.includes('sensitive key forbidden')));
 assert.ok(r.errors.some(x=>x.includes('environments.www must match')));
});
test('invalid email addresses and missing/invalid QA status are rejected',()=>{
 const d=clone();d.inquiry.internal_recipient='not an address';d.evidence.dev_qa='CLAIMED_PASS';
 const r=validateManifest(d);assert.equal(r.schema_status,'FAIL');
 assert.ok(r.errors.some(x=>x.includes('internal_recipient')));
 assert.ok(r.errors.some(x=>x.includes('dev_qa')));
});
test('Dev same as WWW is warned on, not silently assumed safe',()=>{
 const d=clone();d.environments.dev=d.environments.www;
 const r=validateManifest(d);assert.equal(r.schema_status,'PASS');
 assert.ok(r.warnings.some(x=>x.includes('Dev shares WWW origin')));
});
test('rights verified but wrong full SHA prevents WWW readiness',()=>{
 const d=clone();d.demo_only=false;d.source.rights_status='verified';d.source.rights_evidence_ref='PROJECT_PRIVATE/rights.md';
 d.release.owner_pass=true;d.release.approved_sha='short';d.release.backup_verified=true;
 d.evidence.local_qa='PASS';d.evidence.dev_qa='PASS';
 const r=validateManifest(d);assert.equal(r.schema_status,'FAIL');assert.equal(r.www_gate,'BLOCKED');
});

test('all internal SKILL.md reference and template links resolve on this branch',()=>{
 const skillDir=path.resolve(root,'../skills/duplicate-site-skills');
 const body=fs.readFileSync(path.join(skillDir,'SKILL.md'),'utf8');
 const refs=[...body.matchAll(/\]\(((?:references|scripts|templates)\/[^)#]+)\)/g)].map(m=>m[1]);
 assert.equal(refs.length,9);
 for(const rel of refs)assert.ok(fs.existsSync(path.join(skillDir,rel)),'Missing relative Skill file: '+rel);
});
