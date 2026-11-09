import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import {validatePilot,buildCommands} from '../skills/duplicate-site-skills/v2/scripts/clone-v2.mjs';

const dir=path.dirname(fileURLToPath(import.meta.url));
const manifest=path.resolve(dir,'../skills/duplicate-site-skills/v2/templates/rapiddirect.pilot.example.json');
const runner=path.resolve(dir,'../skills/duplicate-site-skills/v2/scripts/clone-v2.mjs');
const example=JSON.parse(fs.readFileSync(manifest,'utf8'));
const copy=()=>structuredClone(example);

test('bounded local pilot manifest is valid without authorizing bulk or production',()=>{
 const r=validatePilot(example);
 assert.equal(r.status,'PASS',JSON.stringify(r.errors));
 assert.equal(r.sample_count,3);
 assert.equal(example.execution.enable_bulk,false);
 assert.equal(example.execution.allow_production_write,false);
 assert.equal(example.approvals.owner_visual_pass,false);
});
test('source attestation is required and release flags cannot override source safety',()=>{
 const p=copy();p.rights.owner_attested=false;
 assert.equal(validatePilot(p).status,'FAIL');
 p.rights.owner_attested=true;p.execution.allow_production_write=true;
 assert.equal(validatePilot(p).status,'FAIL');
 p.execution.allow_production_write=false;p.execution.enable_bulk=true;
 assert.equal(validatePilot(p).status,'FAIL');
});
test('forbids unsafe paths, Blog and duplicated route keys',()=>{
 const bad=['/blog/2026/', '/post/story/', '/docs/private/', '/checkout/', '/%2e%2e/private/','/../x/','/a//b/'];
 for(const v of bad){
  const p=copy();p.source.samples[1].path=v;
  assert.equal(validatePilot(p).status,'FAIL','Expected rejected path: '+v);
 }
 const p=copy();p.source.samples[1].path='/';
 assert.equal(validatePilot(p).status,'FAIL');
});
test('URL credentials and non-HTTPS origin fail',()=>{
 for(const url of ['http://www.rapiddirect.com/','https://name:pass@www.rapiddirect.com/','https://www.rapiddirect.com/other/']){
  const p=copy();p.source.origin=url;
  assert.equal(validatePilot(p).status,'FAIL');
 }
});
test('limits sample size, workers and request rate',()=>{
 const p=copy();p.source.samples=[];
 assert.equal(validatePilot(p).status,'FAIL');
 p.source.samples=example.source.samples;p.execution.workers=9;
 assert.equal(validatePilot(p).status,'FAIL');
 p.execution.workers=2;p.execution.max_requests_per_second=10;
 assert.equal(validatePilot(p).status,'FAIL');
});
test('plan produces bounded SiteOne offline and PWC sample commands',()=>{
 const r=buildCommands(example,path.join(dir,'../tmp/clone-v2-test'));
 assert.ok(r.siteone.args.some(x=>x.startsWith('--offline-export-dir=')));
 assert.ok(r.siteone.args.includes('--single-page'));
 assert.ok(r.siteone.args.includes('--workers=2'));
 assert.ok(r.siteone.args.includes('--max-reqs-per-sec=2'));
 assert.equal(r.pwc_extract.length,3);
 assert.deepEqual(r.pwc_extract[0].args,['extract','https://www.rapiddirect.com/']);
 assert.equal(r.production_write,'BLOCKED');
});
test('dry-run plan works in Node and capture refuses execution by default',()=>{
 const workspace=path.join(dir,'../tmp/clone-v2-test');
 const flags=['--manifest='+manifest,'--workspace='+workspace];
 const plan=spawnSync(process.execPath,[runner,'plan',...flags],{encoding:'utf8'});
 assert.equal(plan.status,0,plan.stderr);
 assert.equal(JSON.parse(plan.stdout).mode,'DRY_RUN_ONLY');
 const capture=spawnSync(process.execPath,[runner,'capture',...flags],{encoding:'utf8'});
 assert.equal(capture.status,2);
 assert.match(capture.stderr,/--execute/);
});
