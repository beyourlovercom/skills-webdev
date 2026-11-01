#!/usr/bin/env node
// S1 Semrush: normalize a user-authorized export; zero API purchases, zero network.
import fs from 'node:fs';import path from 'node:path';import {pathToFileURL} from 'node:url';
const fail=s=>{throw Error('BLOCKED: '+s)};
const domain=d=>{if(typeof d!=='string'||!/^(?:[a-z0-9-]+\.)+[a-z]{2,63}$/i.test(d)||d.length>253)fail('invalid bare domain');return d.toLowerCase()};
export function csv(input,delimiter){
 const rows=[];let row=[],v='',quote=false;
 for(let i=0;i<input.length;i++){const c=input[i];if(quote){if(c==='"'&&input[i+1]==='"'){v+='"';i++}else if(c==='"')quote=false;else v+=c;continue}
 if(c==='"'&&!v){quote=true;continue}if(c==='"')fail('CSV quote outside field');
 if(c===delimiter){row.push(v);v='';continue}
 if(c==='\n'||c==='\r'){row.push(v);if(row.some(x=>x.trim()))rows.push(row);row=[];v='';if(c==='\r'&&input[i+1]==='\n')i++;continue}
 v+=c}if(quote)fail('unclosed CSV quote');if(v||row.length){row.push(v);if(row.some(x=>x.trim()))rows.push(row)}
 if(rows.length<2||rows.some(r=>r.length!==rows[0].length))fail('CSV missing rows or inconsistent columns');
 return rows;
}
const numeric=(s,k)=>{if(typeof s!=='string'||!s.trim()||! /^\d+(?:\.\d+)?$/.test(s.trim()))fail('invalid '+k);const v=Number(s);if(!Number.isFinite(v)||v<0)fail('invalid '+k);return v};
export function auditSemrush(m,raw){
 if(!m||m.source!=='SEMRUSH_UI_CSV_EXPORT'||!['domain_organic','backlinks_refdomains'].includes(m.report_type))fail('unsupported source/report');
 const d=domain(m.domain);if(typeof m.database!=='string'||!/^[a-z]{2}$/i.test(m.database))fail('database required');
 if(typeof m.exported_at!=='string'||!Number.isFinite(Date.parse(m.exported_at)))fail('missing export timestamp');
 if(m.api_requested||m.api_units_authorized)fail('Paid API execution not available in offline mode');
 if(!m.columns||typeof m.columns!=='object'||Array.isArray(m.columns))fail('column map required');
 const sep=m.delimiter===';'?';':m.delimiter===','?',':null;if(!sep)fail('delimiter must be explicit');
 const rows=csv(raw.replace(/^\uFEFF/,''),sep),header=rows.shift(),ids=new Set(header);
 if(ids.size!==header.length)fail('duplicate CSV headers');
 const required=m.report_type==='domain_organic'?['keyword','position','search_volume','url']:['referring_domain','backlinks'];
 for(const key of required)if(typeof m.columns[key]!=='string'||!ids.has(m.columns[key]))fail('missing mapped column '+key);
 const entries=rows.map((row,i)=>{const at=key=>row[header.indexOf(m.columns[key])]?.trim();
  if(m.report_type==='domain_organic'){const keyword=at('keyword'),url=at('url'),position=numeric(at('position'),'position'),volume=numeric(at('search_volume'),'search volume');
   if(!keyword||keyword.length>300||position>100||(!/^https?:\/\//.test(url)))fail('invalid keyword/url');
   let host;try{host=new URL(url).hostname.toLowerCase()}catch{fail('malformed URL')}
   if(host!==d&&!host.endsWith('.'+d))fail('organic result URL belongs to a different domain');
   return {keyword,position,estimated_monthly_search_volume:volume,url};
  }
  const referring_domain=domain(at('referring_domain'));return {referring_domain,backlinks:numeric(at('backlinks'),'backlinks')};
 });
 if(entries.length>30000)fail('row cap');if(entries.some(x=>Object.values(x).some(v=>v===null)))fail('missing values');
 return {schema_version:1,source:'SEMRUSH_UI_CSV_EXPORT_UNVERIFIED',domain:d,database:m.database.toLowerCase(),exported_at:m.exported_at,report_type:m.report_type,row_count:entries.length,top_rows:entries.slice(0,2000),coverage:'UNKNOWN_EXPORT_FILTERS_AND_TOP_ROWS',account_entitlement:'NOT_VERIFIED',api_units_consumed:0,estimated_traffic_not_measured:'YES',status:'PARTIAL_OFFLINE_MARKET_ESTIMATES',warnings:['Semrush SEO/traffic metrics are third-party estimates, not GSC measured clicks','Semrush CSV scope, country database, timestamp and filters are user-declared','API units are never purchased or spent by this importer; API v4 is preferred where available, see official docs','Do not infer leads, ROAS, sales or 12-month YoY from this export']};
}
export function main(argv){const o={};for(let i=0;i<argv.length;i++){if(argv[i]==='--dry-run'){o.dry=true;continue}if(!['--manifest','--csv','--output'].includes(argv[i])||!argv[i+1])fail('bad CLI argument');o[argv[i].slice(2)]=argv[++i]}
 if(!o.manifest||!o.csv)fail('requires --manifest and --csv');const m=JSON.parse(fs.readFileSync(o.manifest,'utf8'));const s=fs.readFileSync(o.csv,'utf8');if(s.length>5000000)fail('CSV too large');const result=auditSemrush(m,s);if(o.dry)return {status:result.status,count:result.row_count,write:false};
 if(!o.output||!path.resolve(o.output).split(path.sep).includes('.private-s1'))fail('private output required');const file=path.resolve(o.output);fs.mkdirSync(path.dirname(file),{recursive:true,mode:0o700});fs.writeFileSync(file,JSON.stringify(result,null,2),{flag:'wx',mode:0o600});return {file,status:result.status};}
if(process.argv[1]&&fs.existsSync(process.argv[1])&&import.meta.url===pathToFileURL(fs.realpathSync(process.argv[1])).href){try{console.log(JSON.stringify(main(process.argv.slice(2)),null,2))}catch(e){console.error(e.message);process.exitCode=2}}
