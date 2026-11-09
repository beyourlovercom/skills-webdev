import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {seed} from '../scripts/skills-v31-seed.mjs';
import {audit} from '../scripts/skills-v31-gate.mjs';

const bin=fileURLToPath(new URL('../scripts/skills-v31-seed.mjs',import.meta.url));
function setup(t){
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'skills-v31-seed-'));
 t.after(()=>fs.rmSync(root,{force:true,recursive:true}));
 const inventory={routes:[{path:'/',template_group:'home'},
  {path:'/services/one/',template_group:'detail'},
  {path:'/services/two/',template_group:'detail'}]};
 const p=path.join(root,'inventory.json');
 fs.writeFileSync(p,JSON.stringify(inventory));
 const dir=path.join(root,'mirror','services','one');
 fs.mkdirSync(dir,{recursive:true});
 fs.writeFileSync(path.join(dir,'index.html'),'<h1>Existing unchanged</h1>');
 const options={root,inventory:p,project_id:'sample-local-site',
  authorization_ref:'local-evidence-abc123',approved:true,site_mode:'MIRROR',
  input_roots:['mirror'],asset_roots:['mirror']};
 return {root,p,inventory,options};
}
test('seed discovers all routes without manufacturing template/browser PASS',t=>{
 const {root,inventory,options}=setup(t);
 const {manifest,summary}=seed(inventory,options);
 assert.equal(summary.discovered,3);
 assert.equal(summary.files_found,1);
 assert.equal(summary.files_pending,2);
 assert.equal(summary.templates,2);
 assert.equal(summary.owner_visual_pass,0);
 assert.equal(manifest.routes[1].path,'/services/one/');
 assert.equal(manifest.routes[1].evidence.method,'NOT_VERIFIED');
 assert.equal(manifest.templates.detail.owner_approval.status,'OPEN');
 assert.equal(manifest.authorized_scope.expected_route_count,3);
 const r=audit(manifest,root);
 assert.equal(r.counters.BLOCKED,1);
 assert.equal(r.counters.OPEN,2);
 assert.equal(r.final_build_gate,'BLOCKED_FINAL_BATCH');
});
test('source inventory cannot bypass authorization or duplicated route checks',t=>{
 const {inventory,options}=setup(t);
 assert.throws(()=>seed(inventory,{...options,approved:false}),/EXPLICIT_SCOPE_APPROVAL_REQUIRED/);
 assert.throws(()=>seed(inventory,{...options,authorization_ref:''}),/AUTHORIZATION_REFERENCE_REQUIRED/);
 inventory.routes.push({...inventory.routes[0]});
 assert.throws(()=>seed(inventory,options),/DUPLICATE_SOURCE_ROUTE/);
});
test('CLI requires approval, writes only private UAT and never overwrites',t=>{
 const {root,p}=setup(t);
 const output=path.join(root,'uat','v31-site-manifest.json');
 const args=['--root='+root,'--inventory='+p,'--out='+output,
  '--project=sample-local-site','--authorization-ref=local-evidence-abc123'];
 const run=more=>spawnSync(process.execPath,[bin,...args,...more],{encoding:'utf8'});
 let r=run([]);
 assert.equal(r.status,2);
 assert.equal(fs.existsSync(output),false);
 r=run(['--scope-approved']);
 assert.equal(r.status,0,r.stderr);
 const manifest=JSON.parse(fs.readFileSync(output,'utf8'));
 assert.equal(manifest.routes.length,3);
 r=run(['--scope-approved']);
 assert.equal(r.status,2);
 assert.match(r.stderr,/NO_OVERWRITE_EXISTING_MANIFEST/);
});
test('dotted version slug resolves an index.html route rather than a fake extension',t=>{
 const {root,options}=setup(t);
 const inventory={routes:[{path:'/news/platform-version-3.0',template_group:'news'}]};
 const rel=path.join(root,'mirror','news','platform-version-3.0');
 fs.mkdirSync(rel,{recursive:true});fs.writeFileSync(path.join(rel,'index.html'),'<h1>News</h1>');
 const {manifest,summary}=seed(inventory,options);
 assert.equal(summary.files_found,1);
 assert.equal(manifest.routes[0].path,'/news/platform-version-3.0/');
 assert.match(manifest.routes[0].local_file,/version-3\.0\/index\.html$/);
});
test('CLI protects against writes outside private UAT',t=>{
 const {root,p}=setup(t);
 const r=spawnSync(process.execPath,[bin,'--root='+root,'--inventory='+p,
  '--out='+path.join(root,'manifest.json'),'--project=sample-local-site',
  '--authorization-ref=local-evidence-abc123','--scope-approved'],{encoding:'utf8'});
 assert.equal(r.status,2);
 assert.match(r.stderr,/PRIVATE_UAT_OUTPUT_ONLY/);
});
