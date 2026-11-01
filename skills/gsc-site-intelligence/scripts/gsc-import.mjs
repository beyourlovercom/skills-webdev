#!/usr/bin/env node
// Import a user-provided GSC Search Results CSV export WITHOUT Google OAuth or network.
import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {domainHost,validateProperty,pageBelongsToProperty,saveBundle} from './gsc-read.mjs';

const DIMS = Object.freeze({dates:'date',queries:'query',pages:'page',countries:'country',devices:'device'});
const ALIASES = Object.freeze({
  date:['date','日期'],query:['query','top queries','queries','查询','热门查询'],
  page:['page','top pages','pages','网页','页面','热门网页'],
  country:['country','countries','国家/地区','国家或地区','国家'],
  device:['device','devices','设备'],
  clicks:['clicks','点击次数','点击量','点击'],
  impressions:['impressions','展示次数','展示量','展示'],
  ctr:['ctr','点击率'],
  position:['position','average position','平均排名','平均位置']
});
const fail = msg=>{throw Error('BLOCKED: '+msg);};
const isoDay = value=>typeof value==='string' && /^\d{4}-\d{2}-\d{2}$/.test(value) &&
  !Number.isNaN(Date.parse(value+'T00:00:00Z')) && new Date(value+'T00:00:00Z').toISOString().slice(0,10)===value;
function exactKeys(o,allowed){if(!o || typeof o!=='object'||Array.isArray(o) || Object.keys(o).some(k=>!allowed.includes(k)))fail('invalid manifest fields');}
function sameDomain(property,domain){
 if(property.startsWith('sc-domain:'))return property.slice(10)===domain;
 const host=new URL(property).hostname;
 return host===domain || host==='www.'+domain;
}
export function csvRows(input){
 if(typeof input!=='string')fail('CSV is not text');
 const text=input.replace(/^\uFEFF/,'');const rows=[];let row=[],field='',quoted=false,closed=false;
 const pushField=()=>{row.push(field);field='';closed=false;};
 const pushRow=()=>{pushField();if(row.some(s=>s.trim()!==''))rows.push(row);row=[];};
 for(let i=0;i<text.length;i++){
   const c=text[i];
   if(quoted){if(c==='"'){if(text[i+1]==='"'){field+='"';i++;}else{quoted=false;closed=true;}}else field+=c;continue;}
   if(c===',' ){pushField();continue;}
   if(c==='\r'||c==='\n'){pushRow();if(c==='\r'&&text[i+1]==='\n')i++;continue;}
   if(c==='"'&&!field&&!closed){quoted=true;continue;}
   if(c==='"'||(closed&&c.trim()!==''))fail('malformed CSV quoting');
   if(closed&&c===' ')continue;
   field+=c;
 }
 if(quoted)fail('unclosed CSV quote');
 if(field!==''||row.length||closed)pushRow();
 if(rows.length<2)fail('CSV missing header or data rows');
 const width=rows[0].length;
 if(rows.some(r=>r.length!==width))fail('CSV has inconsistent columns');
 if(rows.length>30001)fail('CSV exceeds bounded rows cap');
 return rows;
}
function normalized(s){return String(s).trim().replace(/\s+/g,' ').toLowerCase();}
function indexOfColumn(headers,key){
 const choices=ALIASES[key];const matches=headers.map((h,i)=>choices.includes(normalized(h))?i:-1).filter(x=>x>=0);
 if(matches.length!==1)fail('CSV missing or ambiguous '+key+' column');
 return matches[0];
}
function metric(s,key){
 const v=String(s).trim().replace(/,/g,''); const pct=v.endsWith('%'); const n=Number(pct?v.slice(0,-1):v);
 if(!v||!Number.isFinite(n)||n<0)fail('invalid '+key+' in CSV');
 if(key==='ctr'){const fraction=pct?n/100:n;if(fraction>1)fail('CTR out of range');return fraction;}
 if(pct)fail('unexpected percentage in '+key);
 if(['clicks','impressions'].includes(key) && !Number.isSafeInteger(n))fail('noninteger '+key);
 return n;
}
export function rowsFromCsv(input,dim,range){
 const csv=csvRows(input);const header=csv.shift();
 const indexes=Object.fromEntries([dim,'clicks','impressions','ctr','position'].map(k=>[k,indexOfColumn(header,k)]));
 const seen=new Set();
 return csv.map((r,i)=>{
   const key=r[indexes[dim]].trim();
   if(!key)fail('empty '+dim+' value on row '+(i+2));
   if(dim==='date'&&(!isoDay(key)||key<range.startDate||key>range.endDate))fail('date row outside declared range or not YYYY-MM-DD');
   if(seen.has(key))fail('duplicate '+dim+' row: '+key);
   seen.add(key);
   const out={[dim]:key};
   for(const m of ['clicks','impressions','ctr','position'])out[m]=metric(r[indexes[m]],m);
   return out;
 });
}
function safeFile(root,relative){
 if(typeof relative!=='string'||!relative.toLowerCase().endsWith('.csv')||path.isAbsolute(relative)||/[\x00-\x1f]/.test(relative))fail('invalid CSV path in manifest');
 const full=path.resolve(root,relative);
 if(!full.startsWith(path.resolve(root)+path.sep))fail('CSV path escapes manifest folder');
 if(!fs.existsSync(full)||!fs.statSync(full).isFile())fail('CSV file not found: '+relative);
 const real=fs.realpathSync(full),base=fs.realpathSync(root);
 if(!real.startsWith(base+path.sep))fail('CSV symlink leaves manifest folder');
 if(fs.statSync(full).size>20000000)fail('CSV exceeds size cap');
 return full;
}
function totals(rows){
 const clicks=rows.reduce((a,b)=>a+b.clicks,0),impressions=rows.reduce((a,b)=>a+b.impressions,0);
 return {clicks,impressions,ctr:impressions?clicks/impressions:null,average_position:impressions?rows.reduce((a,b)=>a+b.position*b.impressions,0)/impressions:null};
}
export function importManifest(filename,domain){
 domain=domainHost(domain);
 const manifestFile=path.resolve(filename),dir=path.dirname(manifestFile);
 if(!fs.existsSync(manifestFile)||fs.statSync(manifestFile).size>200000)fail('manifest missing/too large');
 let m;try{m=JSON.parse(fs.readFileSync(manifestFile,'utf8'));}catch{fail('invalid manifest JSON');}
 exactKeys(m,['schema_version','source','property','search_type','date_range','exported_at','filters','files']);
 if(m.schema_version!==1||m.source!=='GSC_UI_CSV_EXPORT'||m.search_type!=='web')fail('only GSC Search Results Web CSV export v1 is supported');
 const prop=validateProperty(m.property);
 if(!sameDomain(prop,domain))fail('declared GSC property belongs to different domain');
 const date=m.date_range;exactKeys(date,['startDate','endDate']);
 if(!isoDay(date.startDate)||!isoDay(date.endDate)||date.startDate>date.endDate)fail('invalid declared date range');
 if(!m.exported_at||!Number.isFinite(Date.parse(m.exported_at))||!/[Zz]|[+-]\d\d:\d\d$/.test(m.exported_at))fail('exported_at must include time zone');
 exactKeys(m.filters,['query','page','country','device','search_appearance']);
 // A filtered Search Results export must never be represented as whole-property totals.
 for(const [key,value] of Object.entries(m.filters)) {
  if(typeof value!=='string'||value.trim()==='')fail('filter '+key+' requires a non-empty declared string');
 }
 const filterScope=Object.keys(m.filters).length?'FILTERED_VIEW_USER_DECLARED':'UNFILTERED_VIEW_USER_DECLARED';
 exactKeys(m.files,Object.keys(DIMS));
 if(!m.files.dates)fail('Dates.csv (chart totals) is required; query totals are not property totals');
 const reports={};const gaps=[];
 for(const [label,dim] of Object.entries(DIMS)){
   const file=m.files[label];
   if(!file){reports[label]={status:'OPEN_NOT_EXPORTED'};gaps.push(label+' missing');continue;}
   const csv=fs.readFileSync(safeFile(dir,file),'utf8');
   const rows=rowsFromCsv(csv,dim,date);
   if(dim==='page'&&rows.some(r=>!pageBelongsToProperty(prop,r.page)))fail('CSV page URL outside declared property; old and new domains must not be mixed');
   reports[label]={status:'IMPORTED_UNVERIFIED_PROPERTY',dimensions:[dim],rows,row_count:rows.length,top_rows_truncated_possible:dim!=='date'};
 }
 const daily=reports.dates.rows;
 const dateDays=Math.round((Date.parse(date.endDate+'T00:00:00Z')-Date.parse(date.startDate+'T00:00:00Z'))/86400000)+1;
 const fullDays=daily.length===dateDays&&new Set(daily.map(x=>x.date)).size===dateDays;
 const period_totals=totals(daily);
 return {schema_version:1,source:'GSC_UI_CSV_EXPORT_OFFLINE',domain,
   property:{site_url:prop,verification_status:'USER_DECLARED_NOT_API_VERIFIED'},
   search_type:'web',collected_at:new Date().toISOString(),exported_at:m.exported_at,
   date_range:date,filters:m.filters,totals_scope:filterScope,reports,
   sitemaps:{status:'OPEN_NOT_INCLUDED'},index_coverage:'NOT_VERIFIED',
   query_page_mapping:'NOT_EXPORTED',qualified_leads:'NOT_VERIFIED_BY_GSC',
   summary:{status:'PARTIAL_OFFLINE_EXPORT_UNVERIFIED',totals_scope:filterScope,daily_coverage_complete:fullDays,
     days_observed:daily.length,days_in_range:dateDays,period_totals,full_year_yoy:null,
     warnings:['Source property and filtering are user-declared; not verified against Google sites.list or actual GSC UI state',
       filterScope==='FILTERED_VIEW_USER_DECLARED'?'Chart totals apply only to the declared filtered view, NOT the entire site':'Chart totals are for a user-declared unfiltered view, NOT independently Google-verified full-property totals',
       'GSC UI query/page CSV exports may be truncated to representative top rows; do not sum as site totals',
       'Daily chart totals are used for aggregate clicks/impressions; missing dates are not proven zero',
       'No query x page mapping, sitemap, indexing or business lead attribution from this import',...gaps]}};
}
export function cli(argv){
 const opts={};
 for(let i=0;i<argv.length;i++){if(argv[i]==='--dry-run'){opts.dryRun=true;continue;}
   if(!['--manifest','--domain','--output-dir'].includes(argv[i])||!argv[i+1])fail('unknown or missing argument '+argv[i]);
   opts[argv[i].slice(2).replace(/-([a-z])/g,(_,x)=>x.toUpperCase())]=argv[++i];
 }
 if(!opts.manifest||!opts.domain)fail('required --manifest <manifest.json> --domain <site-domain>');
 const bundle=importManifest(opts.manifest,opts.domain);
 if(opts.dryRun)return {status:'VALIDATED_NO_OUTPUT',summary:bundle.summary,property_verification:bundle.property.verification_status};
 const dest=opts.outputDir||path.join(process.cwd(),'.private-gsc',bundle.domain,'ui-csv');
 const file=saveBundle(bundle,dest);
 return {status:bundle.summary.status,evidence_file:file,source:bundle.source,property_verification:bundle.property.verification_status,summary:bundle.summary};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href){
 try{process.stdout.write(JSON.stringify(cli(process.argv.slice(2)),null,2)+'\n');}
 catch(e){console.error(e.message);process.exitCode=2;}
}
