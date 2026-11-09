import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {guardHtml,guardMirror} from '../skills/duplicate-site-skills/v2/scripts/guard-direct-mirror.mjs';

function fixture(){
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'mirror-guard-v2-'));
 const files={home:'index.html',services:'services/index.html',cnc:'services/cnc-machining/index.html'};
 for(const rel of Object.values(files)){
  const target=path.join(root,'mirror',rel);
  fs.mkdirSync(path.dirname(target),{recursive:true});
  fs.writeFileSync(target,'<html><head><title>Sample</title></head><body><a href="https://www.rapiddirect.com/services/cnc-machining/">Link</a><form action="https://www.rapiddirect.com/api/quote"></form></body></html>');
 }
 const manifest=path.join(root,'manifest.json');
 fs.writeFileSync(manifest,JSON.stringify({
  schema_version:2,rights:{owner_attested:true},
  execution:{scope:'PILOT_SAMPLES',enable_bulk:false,allow_production_write:false},
  approvals:{main_merge:false,owner_visual_pass:false},
  source:{samples:[{id:'home',path:'/'},{id:'services',path:'/services/'},{id:'cnc',path:'/services/cnc-machining/'}]}
 }));
 return {root,files,manifest};
}
test('CSP blocks external network/form and JavaScript guards local navigation',()=>{
 const s=guardHtml('<html><head></head><body><form></form></body></html>');
 assert.match(s,/form-action 'none'/);
 assert.match(s,/connect-src 'self'/);
 assert.match(s,/data-v2-local-mirror-readonly/);
 assert.match(s,/e\.preventDefault\(\)/);
 assert.match(s,/location\.assign/);
 assert.doesNotMatch(s,/<base href=/);
 assert.equal(guardHtml(s),s);
 assert.ok(s.indexOf('Content-Security-Policy')<s.indexOf('data-v2-local-mirror-readonly'));
});
test('dry-run does not rewrite the direct mirror',()=>{
 const x=fixture();try{
  const file=path.join(x.root,'mirror','index.html');
  const before=fs.readFileSync(file,'utf8');
  const v=guardMirror({workspace:x.root,manifest:x.manifest});
  assert.equal(v.changed_files,3);
  assert.equal(v.status,'DRY_RUN');
  assert.equal(fs.readFileSync(file,'utf8'),before);
 }finally{fs.rmSync(x.root,{recursive:true,force:true})}
});
test('explicit local apply is reversible, idempotent, three routes only',()=>{
 const x=fixture();try{
  const first=path.join(x.root,'mirror','index.html');
  const original=fs.readFileSync(first,'utf8');
  const v=guardMirror({workspace:x.root,manifest:x.manifest,execute:true});
  assert.equal(v.changed_files,3);
  assert.equal(v.source_write,false);
  const saved=path.join(x.root,'uat','pre-direct-mirror-guard','index.html');
  assert.equal(fs.readFileSync(saved,'utf8'),original);
  assert.equal(guardMirror({workspace:x.root,manifest:x.manifest,execute:true}).changed_files,0);
 }finally{fs.rmSync(x.root,{recursive:true,force:true})}
});
test('missing third route preflight blocks without any partial writes',()=>{
 const x=fixture();try{
  const f=path.join(x.root,'mirror','index.html');
  const before=fs.readFileSync(f,'utf8');
  fs.unlinkSync(path.join(x.root,'mirror','services','cnc-machining','index.html'));
  assert.throws(()=>guardMirror({workspace:x.root,manifest:x.manifest,execute:true}),/MISSING_OR_ESCAPE_cnc/);
  assert.equal(fs.readFileSync(f,'utf8'),before);
 }finally{fs.rmSync(x.root,{recursive:true,force:true})}
});
test('no Owner pass or scope broadening is accepted as pilot',()=>{
 const x=fixture();try{
  const bad=JSON.parse(fs.readFileSync(x.manifest,'utf8'));
  bad.approvals.owner_visual_pass=true;fs.writeFileSync(x.manifest,JSON.stringify(bad));
  assert.throws(()=>guardMirror({workspace:x.root,manifest:x.manifest,execute:true}),/PILOT_SCOPE_GATE/);
  bad.approvals.owner_visual_pass=false;
  bad.source.samples.push({id:'other',path:'/more/'});
  fs.writeFileSync(x.manifest,JSON.stringify(bad));
  assert.throws(()=>guardMirror({workspace:x.root,manifest:x.manifest,execute:true}),/THREE_EXACT_SAMPLE_GATE/);
 }finally{fs.rmSync(x.root,{recursive:true,force:true})}
});
