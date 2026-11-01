import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import {REPORTS,domainHost,propertyId,completeMonthRanges,assertPropertyWebsite,runOneReport,collectGa4,summarize,safeOutputDir,saveBundle,parseArgs,main} from '../skills/ga4-site-intelligence/scripts/ga4-read.mjs';
const goodProperty={name:'properties/1234',timeZone:'Asia/Taipei',currencyCode:'USD',displayName:'example'};
const stream=[{name:'properties/1234/dataStreams/5',type:'WEB_DATA_STREAM',webStreamData:{defaultUri:'https://www.example.com/'}}];
const response=(obj,status=200)=>({ok:status>=200&&status<300,status,json:async()=>obj});
function mockFetch(calls,{badDomain=false,emptyPrevious=false,thresholded=false,apiStatus=200}={}){
  return async(url,opt)=>{
    calls.push({url,method:opt.method,auth:opt.headers.Authorization,body:opt.body});
    if(apiStatus!==200) return response({},apiStatus);
    if(url.includes('/dataStreams'))return response({dataStreams:badDomain?[{...stream[0],webStreamData:{defaultUri:'https://other.com'}}]:stream});
    if(url.includes('/keyEvents'))return response({keyEvents:[{name:'properties/1234/keyEvents/7',eventName:'generate_lead'}]});
    if(url.includes(':runReport')){
      const b=JSON.parse(opt.body),isPrior=b.dateRanges[0].startDate<'2025-01-01';
      const dim=b.dimensions.map(x=>({name:x.name})),met=b.metrics.map(x=>({name:x.name}));
      if(isPrior&&emptyPrevious)return response({dimensionHeaders:dim,metricHeaders:met,rowCount:0,rows:[]});
      return response({dimensionHeaders:dim,metricHeaders:met,rowCount:1,rows:[{dimensionValues:dim.map(x=>({value:x.name==='yearMonth'?'202601':'Sample'})),metricValues:met.map(x=>({value:x.name==='sessions'?'10':'1'}))}],metadata:{subjectToThresholding:thresholded}});
    }
    if(url.endsWith('/properties/1234'))return response(goodProperty);
    throw Error('Unexpected network request: '+url);
  };
}
test('Owner original GA4 TXT preserved exactly and referenced by Skill',()=>{
  const data=fs.readFileSync(new URL('../skills/ga4-site-intelligence/references/analysis-prompt.txt',import.meta.url));
  const skill=fs.readFileSync(new URL('../skills/ga4-site-intelligence/SKILL.md',import.meta.url),'utf8');
  assert.equal(crypto.createHash('sha256').update(data).digest('hex'), '17b14a48c808384a488a62923be88417fdcaadb44716f1e9c32383d0207460c0');
  for(const clause of ['analysis-prompt.txt','--dry-run','GA4_READONLY_ACCESS_TOKEN','Word','Codex','BLOCKED'])assert.ok(skill.includes(clause),clause);
});
test('verifies domains, numeric properties and prevents external mixed property',()=>{
  assert.equal(domainHost('EXAMPLE.COM'),'example.com');
  assert.throws(()=>domainHost('https://example.com'),/bare domain/);
  assert.throws(()=>propertyId('1234?x=bad'),/digits/);
  assert.throws(()=>assertPropertyWebsite(goodProperty,[{...stream[0],webStreamData:{defaultUri:'https://other.com'}}],'example.com','1234'),/no verified web stream/);
  assert.throws(()=>assertPropertyWebsite(goodProperty,[...stream,{...stream[0],name:'properties/1234/dataStreams/6',webStreamData:{defaultUri:'https://example.net'}}],'example.com','1234'),/mixes other website/);
  assert.equal(assertPropertyWebsite(goodProperty,stream,'example.com','1234').matched_streams.length,1);
});
test('uses verified property timezone for complete months and 12-month YoY',()=>{
 const a=completeMonthRanges('2026-10-31T23:30:00Z','Asia/Taipei');
 assert.deepEqual(a.current,{startDate:'2025-11-01',endDate:'2026-10-31'});
 assert.deepEqual(a.previous,{startDate:'2024-11-01',endDate:'2025-10-31'});
 const b=completeMonthRanges('2026-10-31T08:00:00Z','Asia/Taipei');
 assert.deepEqual(b.current,{startDate:'2025-10-01',endDate:'2026-09-30'});
 assert.deepEqual(b.previous,{startDate:'2024-10-01',endDate:'2025-09-30'});
});
test('API adapter reads exactly 6x2 reports plus metadata with only GET/POST runReport, no writes',async()=>{
 const calls=[];const b=await collectGa4({id:'1234',domain:'example.com',token:'PRIVATE_TOKEN',now:'2026-10-31T00:00:00Z',fetchImpl:mockFetch(calls)});
 assert.equal(b.source,'GOOGLE_ANALYTICS_DATA_API_READONLY');
 assert.equal(b.property.time_zone,'Asia/Taipei');
 assert.equal(b.declared_key_events[0].event_name,'generate_lead');
 assert.equal(Object.keys(b.reports).length,6);
 assert.equal(calls.filter(x=>x.url.includes(':runReport')).length,12);
 assert.ok(calls.every(x=>(x.method==='GET'||x.method==='POST')&&x.auth==='Bearer PRIVATE_TOKEN'));
 assert.ok(calls.filter(x=>x.method==='POST').every(x=>x.url.includes(':runReport')));
 assert.equal(b.summary.qualified_leads,'NOT_VERIFIED_BY_GA4');
 assert.doesNotMatch(JSON.stringify(b),/PRIVATE_TOKEN/);
});
test('no token or wrong domain causes BLOCKED before any metric is accepted',async()=>{
 const calls=[];
 await assert.rejects(collectGa4({id:'1234',domain:'example.com',token:'',fetchImpl:mockFetch(calls)}),/BLOCKED/);
 assert.equal(calls.length,0);
 await assert.rejects(collectGa4({id:'1234',domain:'example.com',token:'x',fetchImpl:mockFetch(calls,{badDomain:true})}),/BLOCKED/);
 assert.equal(calls.filter(x=>x.url.includes(':runReport')).length,0);
});
test('unauthorized API errors are sanitized without token or response body',async()=>{
 const calls=[];
 await assert.rejects(collectGa4({id:'1234',domain:'example.com',token:'SECRET',fetchImpl:mockFetch(calls,{apiStatus:403})}),e=>/HTTP 403/.test(e.message)&&!/SECRET/.test(e.message));
});
test('paginated responses require full rowCount and reject cap truncation',async()=>{
 const calls=[];const fetchImpl=async(url,opt)=>{
  calls.push(JSON.parse(opt.body).offset);
  const n=Number(JSON.parse(opt.body).offset),m=3;
  return response({dimensionHeaders:[{name:'yearMonth'}],metricHeaders:[{name:'sessions'}],rowCount:m,rows:Array.from({length:Math.min(2,m-n)},(_,i)=>({dimensionValues:[{value:'202601'}],metricValues:[{value:String(n+i+1)}]}))});
 };
 const report=await runOneReport({fetchImpl,token:'s',id:'1234',dimensions:['yearMonth'],metrics:['sessions'],period:{startDate:'2026-01-01',endDate:'2026-09-30'},limit:2,maxRows:4});
 assert.deepEqual(calls,['0','2']);assert.equal(report.rows.length,3);
 await assert.rejects(runOneReport({fetchImpl,token:'s',id:'1234',dimensions:['yearMonth'],metrics:['sessions'],period:{startDate:'2026-01-01',endDate:'2026-09-30'},limit:2,maxRows:2}),/exceeds bounded page cap/);
});
test('empty comparison and thresholded reports are PARTIAL not invented YoY',async()=>{
 const b=await collectGa4({id:'1234',domain:'example.com',token:'TOKEN',now:'2026-10-31T00:00:00Z',fetchImpl:mockFetch([],{emptyPrevious:true,thresholded:true})});
 assert.equal(b.summary.session_yoy_percentage,null);
 assert.ok(b.summary.warnings.some(x=>x.includes('Prior-period')));
 assert.ok(b.summary.warnings.some(x=>x.includes('thresholding')));
 assert.equal(b.summary.status,'PARTIAL_REQUIRES_BUSINESS_VALIDATION');
});
test('output is permission-limited and cannot write in repository root or overwrite prior evidence',()=>{
 const base=fs.mkdtempSync(path.join(os.tmpdir(),'ga4-write-'));
 try{
  fs.mkdirSync(path.join(base,'.git'));
  assert.throws(()=>safeOutputDir(path.join(base,'reports')),/under ignored/);
  assert.equal(safeOutputDir(path.join(base,'.private-ga4','example.com')),path.join(base,'.private-ga4','example.com'));
  const fake={source:'API',property:{id:'1234'},domain:'example.com',ranges:{},summary:{status:'PARTIAL',warnings:[]}};
  const dir=path.join(base,'.private-ga4','example.com');const files=saveBundle(fake,dir);
  assert.ok(fs.existsSync(files.evidence));assert.throws(()=>saveBundle(fake,dir),/EEXIST/);
 }finally{fs.rmSync(base,{recursive:true,force:true});}
});
test('dry-run is credential-free and does not call Google APIs',async()=>{
 const o=parseArgs(['--property','1234','--domain','example.com','--dry-run']);assert.equal(o.dryRun,true);
 let invoked=false;
 await main(['--property','1234','--domain','example.com','--dry-run'],{},async()=>{invoked=true;throw Error('should not call');});
 assert.equal(invoked,false);
});
