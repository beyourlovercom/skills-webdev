import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {buildProfile,renderFiles,siteRules} from '../src/site-skill-factory.mjs';
const input=JSON.parse(fs.readFileSync(new URL('../pilots/rainbird/public-evidence.json',import.meta.url),'utf8'));
const p=buildProfile('rainbird.com',input,path.resolve('.'));
const rules=siteRules(p).join('\n');
test('public benchmark stays unprivileged and fail-closed',()=>{
  assert.equal(p.fields.cms,'UNKNOWN');
  assert.equal(p.fields.relation,'UNKNOWN');
  assert.equal(p.fields.project_repo,'UNKNOWN');
  assert.equal(p.data_sources.ga4,'NOT_CONNECTED');
  assert.equal(p.environments.local,'UNKNOWN');
  assert.equal(p.owner_approval,'REQUIRED_FOR_PRODUCTION');
});
test('Rain Bird business-specific multi-channel paths generated',()=>{
  assert.equal(p.fields.business_model,'B2B+B2C');
  assert.match(rules,/跨站归因/);
  assert.match(rules,/经销商定位/);
  assert.match(rules,/承包商推荐/);
  assert.match(rules,/农业、球场、商业景观和家庭/);
  assert.match(rules,/产品资料、培训、目录下载/);
  assert.match(rules,/禁止预设 WordPress\/Shopify/);
});
test('eight independent Skills + profile + gates + roadmap + evidence are generated',()=>{
  const out=renderFiles(p);
  assert.equal(Object.keys(out).length,12);
  const phase=out['skills/analytics-live/SKILL.md'];
  assert.match(phase,/store.rainbird.com/);
  assert.match(phase,/purchase 只能以已授权商城订单证据核验/);
  assert.match(phase,/UNKNOWN/);
  assert.match(out['skills/approval-gates.md'],/Owner 尚未通过此文件批准任何生产写入/);
  assert.match(out['skills/site-profile.yaml'],/https:\/\/www.rainbird.com/);
});

test('separate store URL and annotated UNKNOWN project remain protected',()=>{
  const updated={...input,commerce:'store.rainbird.com',project_repo:'UNKNOWN (third-party external)'};
  const p2=buildProfile('rainbird.com',updated,path.resolve('.'));
  const rules2=siteRules(p2).join('\\n');
  assert.match(rules2,/跨站归因/);
  assert.match(rules2,/外部基准站/);
});
