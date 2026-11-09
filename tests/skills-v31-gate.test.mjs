import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {audit,routePath,VERSION} from '../scripts/skills-v31-gate.mjs';

const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
function fixture(t){
  const root=fs.mkdtempSync(path.join(os.tmpdir(),'skills-v31-'));
  t.after(()=>fs.rmSync(root,{recursive:true,force:true}));
  const store=(rel,content)=>{
    const file=path.join(root,rel);
    fs.mkdirSync(path.dirname(file),{recursive:true});
    fs.writeFileSync(file,content);
    return hash(Buffer.from(content));
  };
  const templateHash=hash('approved-template');
  const evidence=()=>({method:'real-browser',
    visual:{desktop:{score:0.99,masks:0,viewport_verified:true},
      mobile:{score:0.99,masks:0,viewport_verified:true}},
    interaction:{status:'PASS'},assets:{status:'PASS'},content:{status:'PASS'},security:{status:'PASS'}});
  const routes=['/','/service/','/contact/'].map((p,i)=>{
    const local_file='pages/page-'+i+'.html';
    return {path:p,template:'base',local_file,artifact_sha256:store(local_file,'<!doctype html><title>'+p+'</title>'),
      evidence:evidence(),resources:[],links:[]};
  });
  const navigation_sources=['sitemap','category'].map(x=>{
    const local_file='uat/navigation-'+x+'.html';
    return {path:'/site/'+x+'/',local_file,artifact_sha256:store(local_file,'<html>'+x+'</html>'),
      evidence:{status:'PASS',method:'real-browser',artifact_ref:'uat/browser-'+x+'.json'},
      links:routes.map(r=>r.path)};
  });
  const m={schema_version:'3.1',project_id:'site-fixture',environment:'local',
    site_mode:'MIRROR',authorized_scope:{source_approved:true,routes_frozen:true,source_snapshot_sha256:hash('inventory'),expected_route_count:routes.length,
      route_list_sha256:hash(JSON.stringify(routes.map(r=>r.path).sort()))},
    visual_threshold:0.97,templates:{base:{sha256:templateHash,
      owner_approval:{status:'PASS',template_sha256:templateHash,evidence_ref:'uat/owner-approval.json'}}},
    routes,navigation_sources};
  return {root,m,store};
}

test('V3.1 scope: complete local site is ready for a separate PR17 build canary',t=>{
  const {root,m}=fixture(t);const r=audit(m,root);
  assert.equal(r.version,VERSION);assert.equal(r.counters.PASS,3);
  assert.equal(r.final_build_gate,'READY_FOR_PR17_FINAL_BUILD_CANARY');
  assert.equal(r.production_release,'NOT_AUTHORIZED');
  assert.equal(r.pr15_batch_gate,'SEPARATE_EXISTING_FACTORY_REQUIRED');
  assert.deepEqual(r.queue,[]);
});
test('missing HTML is OPEN, never counted as a published page',t=>{
  const {root,m}=fixture(t);m.routes[1].local_file='pages/does-not-exist.html';
  const r=audit(m,root);assert.equal(r.counters.OPEN,1);assert.equal(r.queue[0].path,'/service/');
  assert.equal(r.final_build_gate,'BLOCKED_FINAL_BATCH');
});
test('Owner template gate blocks batch despite browser evidence',t=>{
  const {root,m}=fixture(t);m.templates.base.owner_approval.status='OPEN';
  const r=audit(m,root);assert.equal(r.counters.BLOCKED,3);
});
test('both viewports must reach >= 0.97 and have unmasked true viewport proof',t=>{
  const {root,m}=fixture(t);m.routes[0].evidence.visual.mobile.score=0.9699;
  assert.equal(audit(m,root).counters.OPEN,1);
  m.routes[0].evidence.visual.mobile.score=0.97;
  assert.equal(audit(m,root).counters.PASS,3);
  m.routes[0].evidence.visual.mobile.masks=1;
  assert.equal(audit(m,root).counters.OPEN,1);
});
test('synthetic visual evidence is not real browser acceptance',t=>{
  const {root,m}=fixture(t);m.routes[0].evidence.method='synthetic';
  assert.equal(audit(m,root).counters.OPEN,1);
});
test('changed HTML hash invalidates cached PASS',t=>{
  const {root,m}=fixture(t);
  fs.appendFileSync(path.join(root,m.routes[0].local_file),'altered');
  assert.equal(audit(m,root).counters.FAIL,1);
});
test('missing required resource or dependency is FAIL',t=>{
  const {root,m}=fixture(t);
  m.routes[0].resources.push({file:'media/missing.png',sha256:hash('missing')});
  m.routes[1].dependencies=[{id:'source-css',classification:'REQUIRED',status:'FAIL'}];
  assert.equal(audit(m,root).counters.FAIL,2);
});
test('optional source 404 requires declared exception but does not block',t=>{
  const {root,m}=fixture(t);
  m.routes[0].dependencies=[{id:'unused-library',classification:'OPTIONAL',status:'OPEN',exception_ref:'uat/exceptions/404.txt'}];
  const r=audit(m,root);assert.equal(r.counters.PASS,3);assert.equal(r.warnings.length,1);
  delete m.routes[0].dependencies[0].exception_ref;
  assert.equal(audit(m,root).counters.FAIL,1);
});
test('unverified navigation cannot fabricate two inbound links',t=>{
  const {root,m}=fixture(t);m.navigation_sources[0].evidence.status='OPEN';
  const r=audit(m,root);assert.equal(r.counters.FAIL,3);
});
test('links to unbuilt or unknown routes are flagged',t=>{
  const {root,m}=fixture(t);m.routes[0].links=['/not-in-inventory/'];
  const r=audit(m,root);assert.equal(r.pages.find(x=>x.path==='/').status,'FAIL');
});
test('duplicate and traversal routes reject the entire manifest',t=>{
  const {root,m}=fixture(t);m.routes.push({...m.routes[0]});
  assert.throws(()=>audit(m,root),/DUPLICATE_ROUTE/);
  m.routes.pop();m.routes[0].path='/../private/';
  assert.throws(()=>audit(m,root),/UNSAFE_ROUTE/);
});
test('local file traversal and symlink escape cannot be used as artifacts',t=>{
  const {root,m}=fixture(t);m.routes[0].local_file='../outside.html';
  assert.throws(()=>audit(m,root),/UNSAFE_FILE_PATH/);
  m.routes[0].local_file='pages/escape';
  fs.symlinkSync(path.join(os.tmpdir(),'v31-outside-missing'),path.join(root,'pages/escape'));
  assert.equal(audit(m,root).counters.OPEN,1);
});
test('remote or unauthorized execution scopes are rejected',t=>{
  const {root,m}=fixture(t);m.environment='production';
  assert.throws(()=>audit(m,root),/LOCAL_ONLY/);
  m.environment='local';m.authorized_scope.source_approved=false;
  assert.throws(()=>audit(m,root),/SCOPE_NOT_APPROVED/);
});
test('a narrowed route inventory cannot masquerade as a whole-site PASS',t=>{
  const {root,m}=fixture(t);
  m.routes.pop();
  assert.throws(()=>audit(m,root),/INVENTORY_DENOMINATOR_MISMATCH/);
});
test('pre-approved URL hash mismatch blocks batch even with matching count',t=>{
  const {root,m}=fixture(t);m.authorized_scope.route_list_sha256=hash('other-routes');
  assert.throws(()=>audit(m,root),/INVENTORY_DENOMINATOR_MISMATCH/);
});
test('symlinked ancestor directory cannot escape private local workspace',t=>{
  const {root,m}=fixture(t);
  const outside=fs.mkdtempSync(path.join(os.tmpdir(),'skills-v31-external-'));
  t.after(()=>fs.rmSync(outside,{recursive:true,force:true}));
  fs.writeFileSync(path.join(outside,'file.html'),'outside');
  fs.symlinkSync(outside,path.join(root,'external'));
  m.routes[0].local_file='external/file.html';
  assert.throws(()=>audit(m,root),/SYMLINK_ESCAPE/);
});
test('route normalization preserves real extensions',()=>{
  assert.equal(routePath('/a/index.html'),'/a/');
  assert.equal(routePath('/foo'),'/foo/');
  assert.equal(routePath('/image.png'),'/image.png');
  assert.equal(routePath('/news/online-platform-version-3.0'),'/news/online-platform-version-3.0/');
  assert.equal(routePath('/product/mf414a.rev2'),'/product/mf414a.rev2/');
});

test('Windows PowerShell 5.1 UTF-8 BOM manifest parses in real CLI',t=>{
  const {root,m}=fixture(t);
  const mf=path.join(root,'v31-bom-manifest.json');
  fs.writeFileSync(mf,'\uFEFF'+JSON.stringify(m));
  const result=spawnSync(process.execPath,[fileURLToPath(new URL('../scripts/skills-v31-gate.mjs',import.meta.url)),
    '--manifest='+mf,'--root='+root],{encoding:'utf8'});
  assert.equal(result.status,0,result.stderr);
  assert.match(result.stdout,/READY_FOR_PR17_FINAL_BUILD_CANARY/);
});
