import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {validateGate} from '../src/validate-gates.mjs';
const manifest=JSON.parse(fs.readFileSync(new URL('../pilots/ybyirrigation/real-gate-manifest.json',import.meta.url),'utf8'));
test('all eight real YBY S1–S6 gates correctly fail closed before live authorization',()=>{
 assert.equal(manifest.stages.length,8);
 for(const stage of manifest.stages){
   const result=validateGate({site:manifest.site,...stage});
   assert.equal(result.status,'BLOCKED',stage.stage+' incorrectly PASS');
   assert.ok(result.errors.length,stage.stage+' missing explicit blockers');
 }
});
test('real YBY S1 Ads partial evidence never passes missing lead quality',()=>{
 const s=manifest.stages.find(x=>x.stage==='S1');
 assert.equal(s.tests[0].result,'PASS');
 assert.ok(s.tests.some(x=>x.id==='conversion_quality' && x.result==='OPEN'));
 assert.equal(validateGate({site:manifest.site,...s}).status,'BLOCKED');
});
test('production and auto-publishing are not silently authorized',()=>{
 const www=manifest.stages.find(x=>x.stage==='S2-C');
 assert.deepEqual(www.approvals,[]);
 assert.equal(validateGate({site:manifest.site,...www}).status,'BLOCKED');
 const s6=manifest.stages.find(x=>x.stage==='S6');
 const r=validateGate({site:manifest.site,...s6,publish_mode:'auto_publish'});
 assert.equal(r.status,'BLOCKED');
});
