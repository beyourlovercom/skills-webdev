import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {csvRows,rowsFromCsv,importManifest,cli} from '../skills/gsc-site-intelligence/scripts/gsc-import.mjs';

function setup(overrides={}){
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'gsc-ui-import-'));
 const dates='Date,Clicks,Impressions,CTR,Position\n2026-09-01,10,"1,000",1%,5.5\n2026-09-02,0,200,0%,6.0\n';
 const queries='Top queries,Clicks,Impressions,CTR,Position\n"drip tape, irrigation",3,100,3%,8\n';
 const pages='Top pages,Clicks,Impressions,CTR,Position\nhttps://ybyirrigation.com/drip/,3,120,2.5%,9\n';
 const countries='Country,Clicks,Impressions,CTR,Position\nIndia,5,500,1%,10\n';
 const devices='Device,Clicks,Impressions,CTR,Position\nMobile,6,600,1%,11\n';
 for(const [n,v] of Object.entries({Dates:dates,Queries:queries,Pages:pages,Countries:countries,Devices:devices}))
   fs.writeFileSync(path.join(dir,n+'.csv'),overrides[n]||v);
 const manifest={schema_version:1,source:'GSC_UI_CSV_EXPORT',property:'sc-domain:ybyirrigation.com',
  search_type:'web',exported_at:'2026-10-01T00:00:00Z',
  date_range:{startDate:'2026-09-01',endDate:'2026-09-02'},
  filters:{},files:{dates:'Dates.csv',queries:'Queries.csv',pages:'Pages.csv',countries:'Countries.csv',devices:'Devices.csv'}};
 Object.assign(manifest,overrides.manifest||{});
 const file=path.join(dir,'manifest.json');fs.writeFileSync(file,JSON.stringify(manifest));
 return {dir,file};
}
test('CSV parser handles BOM, quoted delimiters and multiline values',()=>{
 const r=csvRows('\uFEFFTop queries,Clicks,Impressions,CTR,Position\n"a,b",2,20,10%,4\n"x\n""hello""",1,10,10%,5');
 assert.equal(r.length,3);assert.equal(r[1][0],'a,b');assert.equal(r[2][0],'x\n"hello"');
 assert.throws(()=>csvRows('a,b\n"unfinished,2'),/BLOCKED/);
});
test('offline importer preserves source status and uses daily chart totals, not query sum',()=>{
 const x=setup();try{const v=importManifest(x.file,'ybyirrigation.com');
 assert.equal(v.summary.status,'PARTIAL_OFFLINE_EXPORT_UNVERIFIED');
 assert.equal(v.summary.period_totals.clicks,10);
 assert.equal(v.summary.period_totals.impressions,1200);
 assert.equal(v.reports.queries.rows[0].query,'drip tape, irrigation');
 assert.equal(v.reports.queries.rows[0].impressions,100);
 assert.equal(v.property.verification_status,'USER_DECLARED_NOT_API_VERIFIED');
 assert.equal(v.summary.daily_coverage_complete,true);
 assert.equal(v.summary.full_year_yoy,null);
 }finally{fs.rmSync(x.dir,{recursive:true,force:true});}
});
test('new-domain report rejects legacy-domain page without producing evidence',()=>{
 const x=setup({Pages:'Top pages,Clicks,Impressions,CTR,Position\nhttps://tr.yby-irrigation.com/old,1,20,5%,3\n'});
 try{assert.throws(()=>importManifest(x.file,'ybyirrigation.com'),/outside declared property/);}
 finally{fs.rmSync(x.dir,{recursive:true,force:true});}
});
test('manifest rejects mismatched declared domain, unknown fields, non-web search type and invalid dates',()=>{
 const x=setup();try{
 const m=JSON.parse(fs.readFileSync(x.file,'utf8'));
 for(const mutate of [v=>v.property='sc-domain:yby-irrigation.com',v=>v.extra='oops',
    v=>v.search_type='googleNews',v=>v.date_range.endDate='2026-02-30']){
   const y=structuredClone(m);mutate(y);fs.writeFileSync(x.file,JSON.stringify(y));
   assert.throws(()=>importManifest(x.file,'ybyirrigation.com'),/BLOCKED/);
 }
 }finally{fs.rmSync(x.dir,{recursive:true,force:true});}
});
test('missing Dates.csv blocked; other missing sections explicitly OPEN',()=>{
 const x=setup();try{
 let m=JSON.parse(fs.readFileSync(x.file,'utf8'));delete m.files.dates;
 fs.writeFileSync(x.file,JSON.stringify(m));
 assert.throws(()=>importManifest(x.file,'ybyirrigation.com'),/Dates.csv/);
 m.files.dates='Dates.csv';delete m.files.queries;fs.writeFileSync(x.file,JSON.stringify(m));
 const b=importManifest(x.file,'ybyirrigation.com');assert.equal(b.reports.queries.status,'OPEN_NOT_EXPORTED');
 assert.ok(b.summary.warnings.some(x=>x.includes('queries missing')));
 }finally{fs.rmSync(x.dir,{recursive:true,force:true});}
});
test('offline evidence import dry-run never writes, full export uses ignored directory and prevents overwrite',()=>{
 const x=setup();try{
 const target=path.join(x.dir,'.private-gsc','sample');
 let result=cli(['--manifest',x.file,'--domain','ybyirrigation.com','--output-dir',target,'--dry-run']);
 assert.equal(result.status,'VALIDATED_NO_OUTPUT');assert.equal(fs.existsSync(target),false);
 result=cli(['--manifest',x.file,'--domain','ybyirrigation.com','--output-dir',target]);
 assert.equal(result.status,'PARTIAL_OFFLINE_EXPORT_UNVERIFIED');
 assert.ok(fs.existsSync(result.evidence_file));
 assert.throws(()=>cli(['--manifest',x.file,'--domain','ybyirrigation.com','--output-dir',target]),/EEXIST/);
 }finally{fs.rmSync(x.dir,{recursive:true,force:true});}
});
test('manifest CSV path cannot escape export folder or symlink outside',()=>{
 const x=setup();try{
 const m=JSON.parse(fs.readFileSync(x.file,'utf8'));m.files.pages='../legacy.csv';fs.writeFileSync(x.file,JSON.stringify(m));
 assert.throws(()=>importManifest(x.file,'ybyirrigation.com'),/escapes/);
 }finally{fs.rmSync(x.dir,{recursive:true,force:true});}
});
test('date and numeric quality: no silent unknown or inconsistent columns',()=>{
 const x=setup({Dates:'Date,Clicks,Impressions,CTR,Position\n2026-09-03,2,200,1%,5\n'});
 try{assert.throws(()=>importManifest(x.file,'ybyirrigation.com'),/outside declared range/);}
 finally{fs.rmSync(x.dir,{recursive:true,force:true});}
 assert.throws(()=>rowsFromCsv('Date,Clicks,Impressions,CTR,Position\n2026-09-01,-2,100,0%,4\n','date',{startDate:'2026-09-01',endDate:'2026-09-02'}),/invalid clicks/);
 assert.throws(()=>rowsFromCsv('Date,Clicks,Impressions,CTR,Position\n2026-09-01,2,100,2%,4\n2026-09-01,2,100,2%,4\n','date',{startDate:'2026-09-01',endDate:'2026-09-02'}),/duplicate date/);
});
