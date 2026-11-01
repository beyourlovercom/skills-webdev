#!/usr/bin/env node
// S1 cross-source evidence registry: NO summing unrelated measurements.
import fs from 'node:fs';import path from 'node:path';import {pathToFileURL} from 'node:url';
const fail=s=>{throw Error('BLOCKED: '+s)};
const bare=s=>{if(typeof s!=='string'||!/^(?:[a-z0-9-]+\.)+[a-z]{2,63}$/i.test(s))fail('invalid domain');return s.toLowerCase()};
export function fuse(m,sources){
 const domain=bare(m.domain);if(!m||!Array.isArray(m.expected_sources)||new Set(m.expected_sources).size!==m.expected_sources.length)fail('source plan missing/duplicate');
 const allowed=new Set(['gsc','ga4','google_ads','semrush']);if(m.expected_sources.some(x=>!allowed.has(x)))fail('unsupported source');
 const seen=new Set(),verified={},open=[],warnings=[];
 for(const [name,src] of Object.entries(sources)){
  if(!allowed.has(name)||seen.has(name)||!m.expected_sources.includes(name))fail('unexpected/duplicate source');seen.add(name);
  if(!src||typeof src!=='object'||!src.source)fail('untrusted source '+name);
  if(name==='google_ads'){
   if(src.source!=='WINDSOR_GOOGLE_ADS_READONLY'||!src.account_id)fail('Ads source mismatch');
   if(!m.ads_account_binding||m.ads_account_binding.account_id.replaceAll('-','')!==src.account_id.replaceAll('-')||m.ads_account_binding.domain!==domain)fail('Ads account is NOT verified to belong to requested site');
   verified[name]={source:src.source,account:src.account_id,period:src.period,totals:src.observed_totals,completeness:src.completeness};
   warnings.push('Ads platform conversions are not qualified leads; currency remains '+src.observed_totals.currency);continue;
  }
  if(bare(src.domain)!==domain)fail(name+' domain mismatch');
  if(name==='semrush'){if(src.source!=='SEMRUSH_UI_CSV_EXPORT_UNVERIFIED')fail('Semrush source mismatch');verified[name]={source:src.source,report_type:src.report_type,top_rows:src.row_count,estimate_only:true};continue;}
  if(name==='gsc'){if(!['GSC_EXISTING_CHROME_UI_READONLY','GOOGLE_SEARCH_CONSOLE_API_READONLY','GSC_UI_CSV_EXPORT_OFFLINE'].includes(src.source))fail('GSC source invalid');
   verified[name]={source:src.source,property:src.property,scope:src.complete_annual_analysis||src.summary?.status||'OPEN'};continue;}
  if(name==='ga4'){if(src.source!=='GOOGLE_ANALYTICS_DATA_API_READONLY')fail('GA4 source mismatch');verified[name]={source:src.source,property:src.property?.id,range:src.ranges,current_months_present:src.summary?.current_months_present};}
 }
 for(const name of m.expected_sources)if(!seen.has(name))open.push(name);
 const exactPeriods=verified.google_ads?.period&&verified.ga4?.range?.current&&verified.google_ads.period.from===verified.ga4.range.current.startDate&&verified.google_ads.period.to===verified.ga4.range.current.endDate;
 return {schema_version:1,source:'S1_CROSS_SOURCE_EVIDENCE_INDEX',domain,evidence_inventory:verified,missing_sources:open,period_comparability:exactPeriods?'ADS_AND_GA4_DATES_EXACT':'NOT_PROVEN_NO_CROSS_METRIC_JOIN',
  qualified_leads:'OPEN_NO_CRM_ORDER_ID_JOIN',revenue_and_roi:'OPEN_NO_ACTUAL_SETTLED_REVENUE',keyword_to_url:'OPEN_UNLESS_GSC_QUERY_PAGE_EVIDENCE',competitive_opportunities:'HYPOTHESIS_UNTIL_VERIFIED',
  status:open.length?'PARTIAL_MISSING_SOURCES':'PARTIAL_UNVERIFIED_CROSS_SOURCE',warnings:[...warnings,'NEVER add GSC organic clicks to Ads clicks to infer GA4 sessions','Semrush estimates must not be added to measured Google Analytics or Ads traffic','Causal attribution and ROI need deduped real lead/revenue identifiers and matching windows','No website/ads/GSC writes are authorized by this document']};
}
export function main(argv){const o={};for(let i=0;i<argv.length;i++){if(argv[i]==='--dry-run'){o.dry=true;continue}if(!['--manifest','--output'].includes(argv[i])||!argv[i+1])fail('bad option');o[argv[i].slice(2)]=argv[++i]}
 if(!o.manifest)fail('manifest required');const m=JSON.parse(fs.readFileSync(o.manifest,'utf8'));const src={};for(const[n,f]of Object.entries(m.files||{})){if(typeof f!=='string'||!fs.existsSync(f)||fs.statSync(f).size>4000000)fail('evidence file invalid');src[n]=JSON.parse(fs.readFileSync(f,'utf8'))}
 const v=fuse(m,src);if(o.dry)return {status:v.status,missing:v.missing_sources,write:false};
 if(!o.output||!path.resolve(o.output).split(path.sep).includes('.private-s1'))fail('private output required');const file=path.resolve(o.output);fs.mkdirSync(path.dirname(file),{recursive:true,mode:0o700});fs.writeFileSync(file,JSON.stringify(v,null,2),{flag:'wx',mode:0o600});return {file,status:v.status};
}
if(process.argv[1]&&fs.existsSync(process.argv[1])&&import.meta.url===pathToFileURL(fs.realpathSync(process.argv[1])).href){try{console.log(JSON.stringify(main(process.argv.slice(2)),null,2))}catch(e){console.error(e.message);process.exitCode=2}}
