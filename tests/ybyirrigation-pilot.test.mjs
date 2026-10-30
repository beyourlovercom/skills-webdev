import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {buildProfile,renderFiles,siteRules} from '../src/site-skill-factory.mjs';
const e=JSON.parse(fs.readFileSync(new URL('../pilots/ybyirrigation/public-evidence.json',import.meta.url),'utf8'));
const p=buildProfile('ybyirrigation.com',e,process.cwd());
test('YBY S0 uses real B2B WordPress/Bricks/Case ID not retail purchase',()=>{
 const rules=siteRules(p).join('\\n');
 assert.equal(p.fields.business_model,'B2B');
 assert.equal(p.fields.cms,'WordPress');
 for(const word of ['Bricks:','询盘 Case ID','多国家落地页','追踪归因','旧新站并行'])assert.ok(rules.includes(word),word);
 assert.doesNotMatch(rules,/电商: 验证 SKU、变体/);
});
test('auth and runtime mismatch remain blocked by declared evidence',()=>{
 assert.equal(p.data_sources.ads,'AUTHORIZED');
 assert.equal(p.data_sources.ga4,'NOT_CONNECTED');
 assert.equal(p.data_sources.gsc,'NOT_CONNECTED');
 assert.equal(p.owner_approval,'REQUIRED_FOR_PRODUCTION');
 assert.equal(p.fields.relation,'coexist');
 assert.ok(p.open_items.some(x=>x.includes('542 commits')));
});
test('generate stage Skills with evidence and no project secrets',()=>{
 const files=renderFiles(p);
 assert.equal(Object.keys(files).length,12);
 for(const name of ['site-intelligence','site-builder-local','site-dev-uat','site-www-release','analytics-live','seo-live','content-migration','content-automation'])assert.match(files['skills/'+name+'/SKILL.md'],/Case ID/);
 assert.match(files['skills/approval-gates.md'],/Owner 尚未通过此文件批准任何生产写入/);
 assert.doesNotMatch(JSON.stringify(files),/502-024-8458/);
});
