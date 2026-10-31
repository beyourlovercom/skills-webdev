import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {domainHost,validateProperty,selectProperty,fullMonthRanges,readReport,collectGsc,summary,parseArgs,main,outputDirectory,saveBundle} from '../skills/gsc-site-intelligence/scripts/gsc-read.mjs';
const sites=[{siteUrl:'sc-domain:ybyirrigation.com',permissionLevel:'siteOwner'},
{siteUrl:'sc-domain:beyourlover.com',permissionLevel:'siteOwner'}];
const response=(data,status=200)=>({ok:status===200,status,json:async()=>data});
function mocked({entries=sites, rows=[{keys:['2026-10-01'],clicks:5,impressions:100,ctr:.05,position:8}],sitemaps=[]}={}) {
 const calls=[];
 const fetchImpl=async(url,opt)=>{calls.push({url,method:opt?.method,body:opt?.body?JSON.parse(opt.body):null,token:opt?.headers?.Authorization});
 if(url.endsWith('/sites'))return response({siteEntry:entries});
 if(url.endsWith('/sitemaps'))return response({sitemap:sitemaps});
 if(url.includes('searchAnalytics/query')){
  const body=JSON.parse(opt.body),keys=body.dimensions.map(x=>x==='date'?'2026-09-01':x==='query'?'drip irrigation':x==='page'?'https://ybyirrigation.com/lp/irrigation-wholesale/':x==='device'?'DESKTOP':'usa');
  return response({rows:body.startRow?[]:[{...rows[0],keys}]});
 }
 throw Error('Mock URL unexpected: '+url);
 };return {fetchImpl,calls};
}
test('exact domain validation rejects paths/credentials and wrong domains',()=>{
 assert.equal(domainHost('YbyIrrigation.com'),'ybyirrigation.com');
 for(const v of ['https://example.com/','localhost','example.com/a','example.com?q=1'])assert.throws(()=>domainHost(v));
 assert.equal(validateProperty('sc-domain:YbyIrrigation.com'),'sc-domain:ybyirrigation.com');
 assert.throws(()=>selectProperty(sites,'ybyirrigation.com','sc-domain:beyourlover.com'),/BLOCKED/);
});
test('same domain with multiple properties requires exact --property',()=>{
 const extra=[...sites,{siteUrl:'https://www.ybyirrigation.com/',permissionLevel:'siteFullUser'}];
 assert.throws(()=>selectProperty(extra,'ybyirrigation.com'),/2 matching/);
 assert.equal(selectProperty(extra,'ybyirrigation.com','https://www.ybyirrigation.com/').property_type,'URL_PREFIX');
});
test('unverified/other brand properties cannot be used',()=>{
 assert.throws(()=>selectProperty([{siteUrl:'sc-domain:ybyirrigation.com',permissionLevel:'siteUnverifiedUser'}],'ybyirrigation.com'),/BLOCKED/);
 assert.throws(()=>selectProperty(sites,'unknownsite.example'),/BLOCKED/);
});
test('12 full Pacific months and preceding years are calculated and missing YoY documented',()=>{
 const r=fullMonthRanges('2026-10-31T09:00:00+08:00');
 assert.deepEqual(r.current,{startDate:'2025-10-01',endDate:'2026-09-30'});
 assert.deepEqual(r.previous,{startDate:'2024-10-01',endDate:'2025-09-30'});
});
test('real API mock performs read-only authenticated site identity and 12 report calls',async()=>{
 const m=mocked();const b=await collectGsc({domain:'ybyirrigation.com',token:'MOCK_TOKEN_NOT_REAL',now:'2026-10-31T00:00:00Z',fetchImpl:m.fetchImpl});
 assert.equal(b.property.site_url,'sc-domain:ybyirrigation.com');assert.equal(b.sitemaps.status,'READ');
 assert.equal(m.calls.filter(x=>x.url.includes('searchAnalytics')).length,12);
 assert.equal(m.calls.filter(x=>x.url.includes('searchAnalytics')).every(x=>x.body.dataState==='final'),true);
 assert.equal(m.calls[0].method,'GET');assert.ok(m.calls.every(x=>x.token==='Bearer MOCK_TOKEN_NOT_REAL'));
 assert.equal(b.summary.qualified_leads,'NOT_VERIFIED_BY_GSC');
 assert.equal(JSON.stringify(b).includes('MOCK_TOKEN_NOT_REAL'),false);
});
test('empty, bad metric, and denied API properly fail closed',async()=>{
 const m=mocked({entries:[{siteUrl:'sc-domain:other.com',permissionLevel:'siteOwner'}]});
 await assert.rejects(()=>collectGsc({domain:'ybyirrigation.com',token:'T',fetchImpl:m.fetchImpl}),/BLOCKED/);
 const bad=async()=>response({rows:[{keys:['query'],clicks:NaN,impressions:1,ctr:0,position:1}]});
 await assert.rejects(()=>readReport({fetchImpl:bad,token:'T',siteUrl:'sc-domain:ybyirrigation.com',period:{startDate:'2026-01-01',endDate:'2026-02-01'},dims:['query']}),/invalid GSC metric/);
 await assert.rejects(()=>collectGsc({domain:'ybyirrigation.com',token:''}),/BLOCKED/);
});
test('bounded pagination uses startRow and blocks a result beyond cap',async()=>{
 const seen=[];const fake=async(url,opt)=>{const b=JSON.parse(opt.body);seen.push(b.startRow);return response({rows:[{keys:['a'],clicks:1,impressions:1,ctr:1,position:1}]});};
 await assert.rejects(()=>readReport({fetchImpl:fake,token:'T',siteUrl:'sc-domain:ybyirrigation.com',period:{startDate:'2026-01-01',endDate:'2026-02-01'},dims:['query'],rowLimit:1,maxRows:2}),/exceeds maxRows/);
 assert.deepEqual(seen,[0,1,2]);
});
test('page and property aggregation never mixed, keyword rows are not traffic total',async()=>{
 const m=mocked();await readReport({fetchImpl:m.fetchImpl,token:'T',siteUrl:'sc-domain:ybyirrigation.com',dims:['page'],period:{startDate:'2026-01-01',endDate:'2026-02-01'}});
 await readReport({fetchImpl:m.fetchImpl,token:'T',siteUrl:'sc-domain:ybyirrigation.com',dims:['date'],period:{startDate:'2026-01-01',endDate:'2026-02-01'}});
 assert.equal(m.calls[0].body.aggregationType,'byPage');assert.equal(m.calls[1].body.aggregationType,'byProperty');
 const b={ranges:{current:{startDate:'2026-01-01',endDate:'2026-12-31'},previous:{startDate:'2025-01-01',endDate:'2025-12-31'}},reports:{daily:{current:{rows:[{date:'2026-01-01',clicks:3,impressions:12,ctr:.25,position:9}]},previous:{rows:[]}}}};
 const s=summary(b);assert.equal(s.period_totals.current.ctr,.25);assert.equal(s.full_year_yoy,null);
});
test('dry run makes no network calls, requires no actual token, and outputs no credentials',async()=>{
 let output='';const previous=process.stdout.write;process.stdout.write=s=>{output+=s;return true;};
 try{const code=await main(['--domain','ybyirrigation.com','--dry-run'],{},async()=>{throw Error('network in dry run');});assert.equal(code,0);}finally{process.stdout.write=previous;}
 assert.match(output,/DRY_RUN_NO_NETWORK/);assert.doesNotMatch(output,/Bearer /);
});
test('private output refuses unsafe in-repo paths and will not overwrite evidence',()=>{
 const temp=fs.mkdtempSync(path.join(os.tmpdir(),'gsc-test-'));fs.mkdirSync(path.join(temp,'.git'));
 try{assert.throws(()=>outputDirectory(path.join(temp,'public')),/BLOCKED/);
 const folder=path.join(temp,'.private-gsc','example.com');const p=saveBundle({summary:{status:'PARTIAL'}},folder);assert.ok(fs.existsSync(p));
 assert.throws(()=>saveBundle({summary:{}},folder),/EEXIST/);
 }finally{fs.rmSync(temp,{recursive:true,force:true});}
});
test('source spec includes Owner requested Word/Codex delivery and privacy caveats',()=>{
 const base=new URL('../skills/gsc-site-intelligence/',import.meta.url);
 const spec=fs.readFileSync(new URL('references/analysis-prompt.txt',base),'utf8');const skill=fs.readFileSync(new URL('SKILL.md',base),'utf8');
 assert.match(spec,/GSC 搜索表现分析与新站建设指导报告/);assert.match(spec,/Codex/);assert.match(skill,/analysis-prompt.txt/);assert.match(skill,/anonymizes queries/);
});
