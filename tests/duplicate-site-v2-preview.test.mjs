import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {addOfflineGuards,prepareReview} from '../skills/duplicate-site-skills/v2/scripts/prepare-owner-preview.mjs';

function fixture(){
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'site-v2-review-'));
 const app=path.join(root,'pwc-build','review-app');
 const snapshots=path.join(app,'public','snapshots');
 fs.mkdirSync(snapshots,{recursive:true});
 fs.writeFileSync(path.join(app,'package.json'),'{"private":true}');
 for(const n of ['home','services','cnc'])fs.writeFileSync(path.join(snapshots,n+'.html'),'<html><head><title>Fixture</title></head><body><button>Menu</button></body></html>');
 const manifest=path.join(root,'pilot.json');
 fs.writeFileSync(manifest,JSON.stringify({schema_version:2,source:{samples:['home','services','cnc'].map(id=>({id}))},
   rights:{owner_attested:true},execution:{scope:'PILOT_SAMPLES',allow_production_write:false,enable_bulk:false},
   approvals:{owner_visual_pass:false}}));
 return {root,manifest,app};
}
test('CSP prevents external asset/network/form writes and base path is rooted',()=>{
 const raw='<html><head><title>Test</title></head><body></body></html>';
 const patched=addOfflineGuards(raw);
 assert.match(patched,/connect-src 'self'/);
 assert.match(patched,/form-action 'none'/);
 assert.match(patched,/script-src 'self' 'unsafe-inline'/);
 assert.match(patched,/<base href="\/">/);
 assert.equal(addOfflineGuards(patched),patched);
});
test('dry-run does not modify local snapshots or create React component',()=>{
 const x=fixture();try{
  const file=path.join(x.app,'public','snapshots','home.html');
  const before=fs.readFileSync(file,'utf8');
  const plan=prepareReview({workspace:x.root,manifest:x.manifest});
  assert.equal(plan.status,'DRY_RUN');
  assert.equal(plan.snapshots.length,3);
  assert.equal(fs.readFileSync(file,'utf8'),before);
  assert.equal(fs.existsSync(path.join(x.app,'src','components','sections','section-12','Section12Section.jsx')),false);
 }finally{fs.rmSync(x.root,{recursive:true,force:true})}
});
test('explicit guarded review writes are reversible and idempotent',()=>{
 const x=fixture();try{
  const file=path.join(x.app,'public','snapshots','home.html');
  const before=fs.readFileSync(file,'utf8');
  const result=prepareReview({workspace:x.root,manifest:x.manifest,apply:true});
  assert.equal(result.status,'LOCAL_GUARDED');
  assert.equal(result.component.changed,true);
  assert.match(fs.readFileSync(file,'utf8'),/Content-Security-Policy/);
  assert.equal(fs.readFileSync(path.join(x.root,'uat','pre-v2-guard-originals','pwc-build','review-app','public','snapshots','home.html'),'utf8'),before);
  const again=prepareReview({workspace:x.root,manifest:x.manifest,apply:true});
  assert.equal(again.snapshots.every(x=>!x.changed),true);
  assert.equal(again.component.changed,false);
 }finally{fs.rmSync(x.root,{recursive:true,force:true})}
});
test('pilot scope/approval fail closed',()=>{
 const x=fixture();try{
  const bad=JSON.parse(fs.readFileSync(x.manifest,'utf8'));
  bad.execution.enable_bulk=true;fs.writeFileSync(x.manifest,JSON.stringify(bad));
  assert.throws(()=>prepareReview({workspace:x.root,manifest:x.manifest,apply:true}),/gate denied/);
  bad.execution.enable_bulk=false;bad.source.samples.push({id:'other'});fs.writeFileSync(x.manifest,JSON.stringify(bad));
  assert.throws(()=>prepareReview({workspace:x.root,manifest:x.manifest,apply:true}),/Exactly three/);
 }finally{fs.rmSync(x.root,{recursive:true,force:true})}
});


test('preflight refuses partial writes when the third sample is missing',()=>{
 const x=fixture();try{
  const snapshot=path.join(x.app,'public','snapshots','home.html');
  const original=fs.readFileSync(snapshot,'utf8');
  fs.unlinkSync(path.join(x.app,'public','snapshots','cnc.html'));
  assert.throws(()=>prepareReview({workspace:x.root,manifest:x.manifest,apply:true}),/Missing existing authorized snapshot: cnc/);
  assert.equal(fs.readFileSync(snapshot,'utf8'),original);
  assert.equal(fs.existsSync(path.join(x.root,'uat','pre-v2-guard-originals')),false);
 }finally{fs.rmSync(x.root,{recursive:true,force:true})}
});
test('symlinked source snapshots cannot point outside isolated workspace',()=>{
 const x=fixture();const outside=fs.mkdtempSync(path.join(os.tmpdir(),'site-v2-outside-'));
 try{
  const content=path.join(outside,'untrusted.html');
  fs.writeFileSync(content,'<html><head></head><body></body></html>');
  const link=path.join(x.app,'public','snapshots','cnc.html');
  fs.unlinkSync(link);
  fs.symlinkSync(content,link);
  const before=fs.readFileSync(content,'utf8');
  assert.throws(()=>prepareReview({workspace:x.root,manifest:x.manifest,apply:true}),/Symlink escape/);
  assert.equal(fs.readFileSync(content,'utf8'),before);
 }finally{
  fs.rmSync(x.root,{recursive:true,force:true});
  fs.rmSync(outside,{recursive:true,force:true});
 }
});


test('review bridge exposes a real iframe viewport without allowing unsandboxed navigation',()=>{
 const tpl=fs.readFileSync(path.resolve(import.meta.dirname,'../skills/duplicate-site-skills/v2/templates/local-review-bridge/Section12Section.jsx'),'utf8');
 assert.match(tpl,/nativeViewport\s*\?\s*"100dvh"\s*:\s*height/);
 assert.match(tpl,/aria-label="切换真实视口模式"/);
 assert.match(tpl,/sandbox="allow-same-origin allow-scripts"/);
 assert.doesNotMatch(tpl,/allow-top-navigation|allow-forms|allow-popups/);
});
