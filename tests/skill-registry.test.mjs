import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {readRegistry,validateRegistry,resolveSkill,main} from '../scripts/skill-registry.mjs';
const dir=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const reg=readRegistry(path.join(dir,'registry/skills.json'));
const readme=fs.readFileSync(path.join(dir,'README.md'),'utf8');

test('registry schema, exact skills and no duplicates',()=>{
 const v=validateRegistry(reg);assert.deepEqual(v.errors,[]);assert.equal(v.status,'PASS');assert.equal(reg.skills.length,16);
 assert.equal(reg.skills.find(x=>x.id==='duplicate-site-skills')?.pr,null);
 const duplicate=resolveSkill(reg,'duplicate-site-skills');
 assert.equal(duplicate.status,'IN_MAIN');assert.equal(duplicate.ref,'main');assert.equal(duplicate.pr_url,null);
});
test('every real Skill has meaningful README entry and a real indexed source',()=>{
 for(const s of reg.skills){
  const result=resolveSkill(reg,s.id);
  assert.ok(readme.includes(s.id),`Missing from README: ${s.id}`);
  assert.ok(result.file_url.endsWith('/'+s.skill_path));
  assert.ok(result.file_url.includes('/blob/'));
  assert.match(s.summary_zh,/\S{5}/);
 }
});
test('main officially contains previous Skills and Owner-approved S1/S2 Skills',()=>{
 assert.deepEqual(reg.skills.filter(x=>x.status==='IN_MAIN').map(x=>x.id),['rapid-webdev','duplicate-site-skills','ga4-site-intelligence','gsc-site-intelligence','google-ads-site-intelligence','semrush-site-intelligence','s1-cross-source','site-builder-local','site-dev-uat','site-www-release']);
 const ga4=resolveSkill(reg,'ga4-site-intelligence');
 assert.equal(ga4.status,'IN_MAIN');assert.equal(ga4.ref,'main');assert.equal(ga4.pr_url,null);
 assert.match(ga4.file_url,/\/blob\/main\/skills\/ga4-site-intelligence\/SKILL\.md$/);
});
test('GSC is officially in main but no claim of live OAuth authorization',()=>{
 const gsc=resolveSkill(reg,'gsc-site-intelligence');assert.equal(gsc.status,'IN_MAIN');assert.equal(gsc.pr_url,null);
 assert.equal(gsc.ref,'main');assert.match(gsc.file_url,/\/blob\/main\/skills\/gsc-site-intelligence\/SKILL\.md$/);
 assert.match(readme,/没有 GSC OAuth/);
});
test('drafts cannot silently appear as main, and path traversal cannot appear',()=>{
 const a=structuredClone(reg);a.skills[3].status='IN_MAIN';assert.equal(validateRegistry(a).status,'FAIL');
 const b=structuredClone(reg);b.skills[3].skill_path='../private/.env';assert.equal(validateRegistry(b).status,'FAIL');
 const c=structuredClone(reg);c.skills[3].source_ref='../../main';assert.equal(validateRegistry(c).status,'FAIL');
});
test('duplicate ids fail closed',()=>{
 const a=structuredClone(reg);a.skills.push({...a.skills[0]});assert.equal(validateRegistry(a).status,'FAIL');
});
test('offline CLI list and resolve produce valid outputs',()=>{
 let out='';assert.equal(main(['--list'],path.join(dir,'registry/skills.json'),s=>{out+=s}),0);assert.match(out,/S2-C\tsite-www-release/);
 out='';assert.equal(main(['--resolve','ga4-site-intelligence'],path.join(dir,'registry/skills.json'),s=>{out+=s}),0);assert.equal(JSON.parse(out).status,'IN_MAIN');
});
test('all examples and piloted reports remain documented, never represented as live runtime authorization',()=>{
 assert.equal(reg.pilots.length,2);assert.ok(readme.includes('本仓库 Public'));
 assert.ok(readme.includes('单独批准'));assert.match(readme,/不等于.*已经连接 Google 账号/);
});

test('Ads, Semrush and cross-source released Skills resolve only to main',()=>{
 for(const id of ['google-ads-site-intelligence','semrush-site-intelligence','s1-cross-source']){
  const s=resolveSkill(reg,id);assert.equal(s.status,'IN_MAIN');
  assert.equal(s.pr_url,null);assert.equal(s.ref,'main');
  assert.match(s.file_url,/\/blob\/main\/skills\//);
 }
});

test('S2-A/B/C are in main while site-specific Owner release gates remain independent',()=>{
 for(const id of ['site-builder-local','site-dev-uat','site-www-release']){
  const s=resolveSkill(reg,id);
  assert.equal(s.status,'IN_MAIN');
  assert.equal(s.pr_url,null);
  assert.equal(s.ref,'main');
  assert.ok(readme.includes(s.file_url));
 }
 assert.ok(readme.includes('Desktop-only'));
 assert.ok(readme.includes('具体域名 + SHA + 变更范围'));
});
