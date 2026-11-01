import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const base=new URL('../skills/gsc-site-intelligence/',import.meta.url);
test('browser mode reads an already-running Chrome property and never starts or navigates browser',()=>{
 const s=fs.readFileSync(new URL('scripts/gsc-browser-ui.applescript',base),'utf8');
 assert.match(s,/Google Chrome" is not running/);
 assert.match(s,/tabs of w/);
 assert.match(s,/resource_id=sc-domain%3A/);
 assert.match(s,/u.searchParams.get\('resource_id'\)!==want/);
 assert.match(s,/execute t javascript js/);
 assert.doesNotMatch(s,/\bactivate\b\s*(?:application|Google Chrome)|set URL of t|open location|make new tab|do shell script/);
 assert.match(s,/GSC_EXISTING_CHROME_UI_READONLY/);
});
test('browser mode contract distinguishes UI from API and CSV, and limits historical coverage',()=>{
 const s=fs.readFileSync(new URL('SKILL.md',base),'utf8');
 const g=fs.readFileSync(new URL('references/browser-ui-read.md',base),'utf8');
 assert.match(s,/browser-ui-read\.md/);
 assert.match(g,/GSC_EXISTING_CHROME_UI_READONLY/);
 assert.match(g,/12 个月/);
 assert.match(g,/Sitemap/);
 assert.match(g,/Owner/);
 const registry=JSON.parse(fs.readFileSync(new URL('../../registry/skills.json',base),'utf8'));
 const item=registry.skills.find(s=>s.id==='gsc-site-intelligence');
 assert.match(item.summary_zh,/Chrome/);
 assert.equal(item.status,'IN_MAIN');
 assert.equal(item.source_ref,'main');
 assert.equal(item.pr,null);
});

test('browser script accepts mixed-case bare domain and compares canonical lowercase property',()=>{
 const script=fs.readFileSync(new URL('scripts/gsc-browser-ui.applescript',base),'utf8');
 assert.match(script,/ABCDEFGHIJKLMNOPQRSTUVWXYZ/);
 assert.match(script,/\.toLowerCase\(\)/);
});
