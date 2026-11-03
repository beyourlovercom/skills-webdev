import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {prepareModuleQueue} from '../skills/duplicate-site-skills/scripts/prepare-module-batch.mjs';

const dir=path.dirname(fileURLToPath(import.meta.url));
const example=JSON.parse(fs.readFileSync(path.resolve(dir,'../skills/duplicate-site-skills/templates/backup-48h-ledger.example.json'),'utf8'));
const sha='b'.repeat(64);
const sample={source_url:'https://owned.example/stock/truck',local_url:'http://local.owned.test/stock/truck/',analysis_ref:'PRIVATE/sample-analysis.md',desktop_ref:'PRIVATE/desktop.png',mobile_ref:'PRIVATE/mobile.png',auto_uat:'PASS'};
const pass={status:'PASS',owner_message_ref:'USER_VISUAL_PASS_MODULE_20261103',approved_at:'2026-11-03T11:00:00+08:00',template_sha256:sha};
const done=m=>{m.state='MODULE_PASS';m.sample=structuredClone(sample);m.approval=structuredClone(pass);m.batch={expected:1,archived:1,verified:1,failed:0,offline_qa:'PASS'};};
const setup=()=>{const d=structuredClone(example);d.demo_only=false;d.rights_verified=true;done(d.modules[0]);let m=d.modules[1];m.state='OWNER_PASS';m.sample=structuredClone(sample);m.approval=structuredClone(pass);return d;};
const row=(url,p='/stock/truck/',type='listing')=>({source_url:url,local_path:p,content_type:type,status:'PENDING',source_sha256:sha,assets:[{source_url:'https://owned.example/assets/logo.svg',local_path:'/assets/logo.svg',sha256:sha}]});
test('no visual Owner PASS means no catalog batch queue',()=>{
 const d=setup();d.modules[1].approval.status='OPEN';
 assert.equal(prepareModuleQueue(d,[row('https://owned.example/stock/truck')],'catalog-listings').status,'BLOCKED');
});
test('batch queue uses one frozen template for multiple first-page categories',()=>{
 const d=setup();const routes=[row('https://owned.example/stock/truck'),row('https://owned.example/stock/tractorhead','/stock/tractorhead/')];
 const x=prepareModuleQueue(d,routes,'catalog-listings');
 assert.equal(x.status,'QUEUE_READY');assert.equal(x.page_jobs,2);assert.equal(x.asset_urls_deduplicated,1);
 assert.ok(x.jobs.every(z=>z.template_sha256===sha));
});
test('blog excluded even if source route appears',()=>{
 const d=setup();const x=prepareModuleQueue(d,[row('https://owned.example/blog/a/','/blog/a/','blog'),row('https://owned.example/stock/truck')],'catalog-listings');
 assert.equal(x.page_jobs,1);assert.equal(x.skipped_count,1);
});
test('second-page disallowed in a first-page-only scope',()=>{
 const d=setup();for(const x of ['https://owned.example/stock/truck?page=2','https://owned.example/stock/truck/page-2/','https://owned.example/stock/truck?cursor=abc']){
  const result=prepareModuleQueue(d,[row(x)],'catalog-listings');
  assert.equal(result.status,'BLOCKED',x);
  assert.ok(result.reasons.some(y=>y.startsWith('POST_FIRST_PAGE_NOT_IN_SCOPE')));
 }
});
test('previous verified pages are skipped instead of duplicated',()=>{
 const d=setup(),r=row('https://owned.example/stock/truck');r.status='VERIFIED';r.source_sha256_verified=true;
 const result=prepareModuleQueue(d,[r,r],'catalog-listings');
 assert.equal(result.page_jobs,0);assert.equal(result.skipped_count,2);
});
test('missing asset SHA fails before work begins',()=>{
 const d=setup(),r=row('https://owned.example/stock/truck');r.assets[0].sha256=null;
 const result=prepareModuleQueue(d,[r],'catalog-listings');
 assert.equal(result.status,'BLOCKED');
});
test('a different source origin is forbidden',()=>{
 const d=setup(),r=row('https://other.example/stock/truck');
 assert.equal(prepareModuleQueue(d,[r],'catalog-listings').status,'BLOCKED');
});
test('representative product subset may not silently add all product details',()=>{
 const d=setup();done(d.modules[1]);d.modules[2].state='OWNER_PASS';d.modules[2].sample=structuredClone(sample);d.modules[2].approval=structuredClone(pass);
 const product=row('https://owned.example/vehicles/used/test','/vehicles/used/test/','product');
 assert.ok(prepareModuleQueue(d,[product],'product-details').reasons.includes('UNAPPROVED_REPRESENTATIVE_PRODUCT_0'));
 d.scope.approved_representative_detail_urls=[product.source_url];
 assert.equal(prepareModuleQueue(d,[product],'product-details').status,'QUEUE_READY');
});
test('all product details may be included only when FULL_NONBLOG is explicitly in scope',()=>{
 const d=setup();done(d.modules[1]);d.modules[2].state='OWNER_PASS';d.modules[2].sample=structuredClone(sample);d.modules[2].approval=structuredClone(pass);
 d.scope.mode='FULL_NONBLOG';d.scope.product_details='all';
 const product=row('https://owned.example/vehicles/used/test','/vehicles/used/test/','product');
 assert.equal(prepareModuleQueue(d,[product],'product-details').status,'QUEUE_READY');
});
