import test from 'node:test';
import assert from 'node:assert/strict';
import {readRegistry,validateRegistry} from '../scripts/skill-registry.mjs';
import {VERSION} from '../scripts/skills-v31-gate.mjs';

test('V3.1 release registry, executable CLIs and documentation remain coherent',()=>{
 const registry=readRegistry();
 const chk=validateRegistry(registry);
 assert.equal(chk.status,'PASS',chk.errors.join(','));
 assert.equal(VERSION,'3.1.0');
 assert.equal(registry.system_release.name,'Andy Skills');
 assert.equal(registry.system_release.version,VERSION);
 assert.equal(registry.system_release.status,'IN_MAIN');
 assert.equal(registry.system_release.release_branch,'main');
 assert.equal(registry.system_release.release_note_path,'docs/skills-v3.1/release-notes.md');
 assert.equal(registry.v31_integration.status,'RELEASED_TO_MAIN');
 assert.equal(registry.v31_integration.site_level_uat,'OPEN_PER_SITE');
 assert.equal(registry.v31_integration.prod_release,'NOT_AUTHORIZED');
 for(const id of ['duplicate-site-skills','site-builder-local']){
  const entry=registry.skills.find(s=>s.id===id);
  assert.equal(entry?.version,VERSION);
  assert.equal(entry?.status,'IN_MAIN');
 }
});
test('V3.1 release does not retroactively publish unrelated Draft Skills',()=>{
 const r=readRegistry();
 assert.ok(r.skills.some(s=>s.status==='DRAFT_PR'));
 assert.ok(r.skills.every(s=>s.status!=='DRAFT_PR'||s.source_ref!=='main'));
});
