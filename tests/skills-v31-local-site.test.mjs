import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import {buildServer} from '../scripts/skills-v31-local-site.mjs';

const hash=s=>crypto.createHash('sha256').update(s).digest('hex');
function site(t){
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'skills-v31-local-preview-'));
 const write=(rel,contents)=>{
  const p=path.join(root,rel);fs.mkdirSync(path.dirname(p),{recursive:true});fs.writeFileSync(p,contents);
  return hash(contents);
 };
 const routes=[
  {path:'/',template:'home',local_file:'mirror/index.html',artifact_sha256:write('mirror/index.html','<html><body><a href="https://source.example.com/service/">Service</a><form action="https://source.example.com/api"><button>Submit</button></form></body></html>')},
  {path:'/service/',template:'service',local_file:'mirror/service/index.html',artifact_sha256:write('mirror/service/index.html','<html><body>Service text</body></html>')}
 ];
 const css=write('mirror/wp-content/theme.css','body { color: black; }');
 const manifest={schema_version:'3.1',environment:'local',project_id:'preview-fixture',site_mode:'MIRROR',
  authorized_scope:{source_approved:true,routes_frozen:true,
   source_snapshot_sha256:hash('snapshot'),expected_route_count:routes.length,
   route_list_sha256:hash(JSON.stringify(routes.map(x=>x.path).sort())),
   source_hosts:['source.example.com']},
  routes,asset_roots:['mirror']};
 const {server,snapshot}=buildServer(manifest,root);
 t.after(()=>fs.rmSync(root,{recursive:true,force:true}));
 t.after(()=>new Promise(resolve=>server.close(resolve)));
 return {root,routes,manifest,server,snapshot,css,write};
}
async function listen(server){
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 return 'http://127.0.0.1:'+server.address().port;
}
test('generic local preview serves actual mirrored HTML with injected navigation and safe header',async t=>{
 const {server}=site(t);const origin=await listen(server);
 const res=await fetch(origin+'/');const html=await res.text();
 assert.equal(res.status,200);assert.match(html,/V3.1 Local/);
 assert.match(html,/data-v31-local-guard/);
 assert.match(res.headers.get('content-security-policy'),/form-action 'none'/);
 assert.equal(res.headers.get('x-robots-tag'),'noindex,nofollow');
 const service=await fetch(origin+'/service/');
 assert.equal(service.status,200);assert.match(await service.text(),/Service text/);
});
test('site hub and XML sitemap include only real local HTML',async t=>{
 const {server,root,routes,snapshot}=site(t);const origin=await listen(server);
 assert.equal(snapshot().ready.length,2);
 fs.rmSync(path.join(root,routes[1].local_file));
 const r=await fetch(origin+'/sitemap.xml');const xml=await r.text();
 assert.match(xml,/http:\/\/127\.0\.0\.1:\d+\/<\/loc>/);
 assert.doesNotMatch(xml,/service/);
 const inv=await (await fetch(origin+'/site/inventory.json')).json();
 assert.equal(inv.ready.length,1);assert.equal(inv.pending.length,1);
 assert.equal((await fetch(origin+'/service/')).status,404);
});
test('modified HTML is excluded from published local sitemap',async t=>{
 const {server,root,routes,snapshot}=site(t);const origin=await listen(server);
 fs.appendFileSync(path.join(root,routes[0].local_file),'tampered');
 assert.equal(snapshot().pending.length,1);
 const xml=await (await fetch(origin+'/sitemap.xml')).text();
 assert.doesNotMatch(xml,/<loc>http:\/\/127\.0\.0\.1:\d+\/<\/loc>/);
});
test('POST is denied; assets work but private UAT files cannot be served',async t=>{
 const {server,root}=site(t);const origin=await listen(server);
 let r=await fetch(origin+'/service/',{method:'POST'});
 assert.equal(r.status,405);
 r=await fetch(origin+'/wp-content/theme.css');
 assert.equal(r.status,200);assert.match(await r.text(),/color: black/);
 fs.mkdirSync(path.join(root,'uat'),{recursive:true});
 fs.writeFileSync(path.join(root,'uat/private.json'),'{"secret":"must-not-serve"}');
 r=await fetch(origin+'/uat/private.json');
 assert.equal(r.status,404);
});
test('mismatched URL denominator or private asset root rejects server start',t=>{
 const {root,manifest}=site(t);
 manifest.authorized_scope.expected_route_count=3;
 assert.throws(()=>buildServer(manifest,root),/INVENTORY_DENOMINATOR_MISMATCH/);
 manifest.authorized_scope.expected_route_count=2;
 manifest.asset_roots=['uat'];
 assert.throws(()=>buildServer(manifest,root),/PRIVATE_ASSET_ROOT/);
});
test('generic server rejects production scope',t=>{
 const {root,manifest}=site(t);
 manifest.environment='production';
 assert.throws(()=>buildServer(manifest,root),/LOCAL_AUTHORIZED_SCOPE_REQUIRED/);
});

test('approved staged WordPress assets are served but private and JSON files stay blocked',async t=>{
  const {server,root,manifest,write}=site(t);
  write('uat/r15-fast-lane/offline-staged/wp-includes/js/jquery/jquery.min.js','window.jQuery = true;');
  write('uat/r15-fast-lane/offline-staged/wp-content/local-dump.json','{\"password\":\"private\"}');
  write('uat/r15-fast-lane/offline-staged/wp-content/uploads/font.ttf','real-font-bytes');
  const stage={...manifest,asset_roots:['mirror','uat/r15-fast-lane/offline-staged']};
  const good=buildServer(stage,root);t.after(()=>new Promise(resolve=>good.server.close(resolve)));
  const origin=await listen(good.server);
  let res=await fetch(origin+'/wp-includes/js/jquery/jquery.min.js');
  assert.equal(res.status,200);assert.match(await res.text(),/window.jQuery/);
  res=await fetch(origin+'/wp-content/uploads/font.ttf');
  assert.equal(res.status,200);
  assert.equal(res.headers.get('content-type'),'font/ttf');
  res=await fetch(origin+'/wp-content/local-dump.json');
  assert.equal(res.status,404);
  res=await fetch(origin+'/uat/r15-fast-lane/offline-staged/wp-content/local-dump.json');
  assert.equal(res.status,404);
});

test('preview navigation wins over legacy R11 single-route guard without changing HTML on disk',async t=>{
 const {server,routes,write}=site(t);
 const frozen='<html><head><script data-r11-local-only>document.addEventListener("click",e=>e.preventDefault(),true)</script></head><body><a href="/site/sitemap/">Sitemap</a></body></html>';
 routes[0].artifact_sha256=write('mirror/index.html',frozen);
 const origin=await listen(server);
 const res=await fetch(origin+'/');
 const html=await res.text();
 assert.equal(res.status,200);
 assert.ok(html.indexOf('data-v31-local-guard')>=0);
 assert.ok(html.indexOf('data-v31-local-guard')<html.indexOf('data-r11-local-only'));
 assert.match(html,/known\.has\(p\)\)\{a\.href=p\+u\.search\+u\.hash;e\.stopImmediatePropagation\(\)/);
 assert.match(html,/\/site\/sitemap\//);
 assert.equal((await fetch(origin+'/site/sitemap/')).status,200);
});
