#!/usr/bin/env node
// Validate saved, authenticated Chrome GSC UI snapshots; NO browser/network access.
import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {domainHost,saveBundle} from './gsc-read.mjs';
const DEFAULT_SECTIONS = Object.freeze({
 performance:'Performance on Search results',index:'Page indexing',noindex:'Page indexing',
 '404':'Page indexing',redirect:'Page indexing',sitemaps:'Sitemaps',https:'HTTPS',cwv:'Core Web Vitals'
});
const err=m=>{throw new Error('BLOCKED: '+m);};
function boundedFile(root,name){
 const f=path.join(root,name+'.json');if(!fs.existsSync(f))return null;
 const st=fs.lstatSync(f);if(!st.isFile()||st.isSymbolicLink()||st.size>1000000)err('invalid snapshot file '+name);
 return f;
}
export function validateSnapshot(s,domain,section){
 const property='sc-domain:'+domain;
 if(!s||typeof s!=='object'||s.source!=='GSC_EXISTING_CHROME_UI_READONLY'||s.property!==property)err('snapshot provenance/property mismatch: '+section);
 if(typeof s.url!=='string'||typeof s.title!=='string'||typeof s.ui_text!=='string'||typeof s.observed_at!=='string')err('incomplete snapshot: '+section);
 let u;try{u=new URL(s.url);}catch{err('invalid snapshot URL');}
 if(u.protocol!=='https:'||u.hostname!=='search.google.com'||u.searchParams.get('resource_id')!==property||!u.pathname.startsWith('/search-console'))err('other property or unexpected origin: '+section);
 if(s.title!==DEFAULT_SECTIONS[section]||s.ui_text.length<60||s.ui_text.length>16000)err('report title/size invalid: '+section);
 const timestamp=Date.parse(s.observed_at);
 if(!Number.isFinite(timestamp)||timestamp>Date.now()+300000)err('snapshot timestamp invalid');
 if(section==='performance'&&!u.pathname.includes('/performance/search-analytics'))err('wrong Performance path');
 if(section==='sitemaps'&&!u.pathname.endsWith('/sitemaps'))err('wrong Sitemaps path');
 if(section==='cwv'&&!u.pathname.endsWith('/core-web-vitals'))err('wrong CWV path');
 if(section==='https'&&!u.pathname.endsWith('/https'))err('wrong HTTPS path');
 if(section==='index'&&!u.pathname.endsWith('/index'))err('wrong Index path');
 if(['noindex','404','redirect'].includes(section)&&!u.pathname.endsWith('/index/drilldown'))err('wrong Index drilldown path');
 return s;
}
const numberAfter=(s,label)=>{const m=s.match(new RegExp(label+'\\s*\\n\\s*([\\d,]+(?:\\.\\d+)?%?)','i'));return m?m[1]:null;};
function extract(s,section){
 const t=s.ui_text;
 const data={title:s.title,url:s.url,observed_at:s.observed_at,loading_visible:/Loading(?:…|\.\.\.)/.test(t)};
 if(section==='performance'){
  data.filter_label=(t.match(/(?:12 months|16 months|6 months|3 months|28 days|7 days|24 hours)/)||[])[0]||null;
  data.search_type=(t.match(/Search type:\s*(Web|Image|Video|News)/)||[])[1]||null;
  data.metrics={clicks:numberAfter(t,'Total clicks'),impressions:numberAfter(t,'Total impressions'),ctr:numberAfter(t,'Average CTR'),position:numberAfter(t,'Average position')};
  data.chart_range=(t.match(/Chart, containing counts[^\n]*?from (.+?) to (.+?)(?:\n|$)/)||[]).slice(1);
  if(Object.values(data.metrics).some(v=>v===null)||!data.search_type)err('Performance metrics or search type not actually visible');
  data.full_12_month_completeness='NOT_PROVEN_BY_UI';
 }else if(section==='index'){
  data.indexed=numberAfter(t,'Indexed');
  data.not_indexed=numberAfter(t,'Not indexed');
  if(!data.indexed||!data.not_indexed)err('Indexing count missing');
 }else if(['noindex','404','redirect'].includes(section)){
  data.affected_pages=numberAfter(t,'Affected pages');
  const cut=t.indexOf('Examples');const sample=cut>=0?t.slice(cut):'';
  const matches=[...sample.matchAll(/https?:\/\/[^\s\n]+/g)].map(m=>m[0]);
  data.example_urls=[...new Set(matches)].filter(u=>{try{const x=new URL(u);return x.hostname===s.property.slice(10)||x.hostname.endsWith('.'+s.property.slice(10));}catch{return false;}});
  data.example_rows_visible=matches.length;
  if(!data.affected_pages)err('Indexing drilldown count not visible: '+section);
  if(Number(data.affected_pages)>0&&!matches.length)data.examples_status='OPEN_LOADING_OR_UNAVAILABLE';
  else data.examples_status='VISIBLE_EXAMPLES_ONLY';
 }else if(section==='sitemaps'){
  data.sitemap_rows=t.includes('Submitted sitemaps')?'VISIBLE':'OPEN';
  data.legacy_sitemap_couldnt_fetch=t.includes("Couldn't fetch");
 }else if(section==='cwv'){
  data.mobile_insufficient=t.includes('Not enough usage data in the last 90 days for this device type.');
  data.cwv_data='CHROME_UX_REPORT_UI_NOT_A_LIGHTHOUSE_SCORE';
 }
 return data;
}
export function auditSnapshots(root,domain){
 domain=domainHost(domain);
 if(!fs.existsSync(root)||!fs.statSync(root).isDirectory())err('missing private snapshots directory');
 const sections={},missing=[];
 for(const name of Object.keys(DEFAULT_SECTIONS)){
  const file=boundedFile(root,name);
  if(!file){missing.push(name);continue;}
  let record;try{record=JSON.parse(fs.readFileSync(file,'utf8'));}catch{err('invalid JSON snapshot '+name);}
  const s=validateSnapshot(record,domain,name);
  sections[name]=extract(s,name);
 }
 const mandatory=['performance','index','noindex','404','redirect','sitemaps'];
 const blockers=mandatory.filter(x=>!sections[x]);
 const warnings=[
  'Authenticated Chrome UI proves read access for the observed reports, not GSC API authorization.',
  'Default/selected date range is not complete 12-month performance evidence or a 12m YoY.',
  'Displayed query/page rows are limited by GSC privacy and Top-N reporting.',
  'Index, Sitemap, HTTPS and CWV each have separate update/coverage dates.',
 ];
 if(blockers.length)warnings.push('Missing mandatory browser evidence: '+blockers.join(','));
 if(sections.performance?.loading_visible)warnings.push('Some Performance UI content was loading when snapshot saved; confirm chart and dimension rows manually.');
 for(const key of ['noindex','404','redirect'])if(sections[key]?.examples_status==='OPEN_LOADING_OR_UNAVAILABLE')warnings.push('Index examples incomplete: '+key);
 return {schema_version:1,source:'GSC_EXISTING_CHROME_UI_READONLY',domain,property:'sc-domain:'+domain,
  browser_read_uat:blockers.length?'PARTIAL_MISSING_REPORTS':'PASS_EXISTING_SESSION_READ',
  complete_annual_analysis:'OPEN_NOT_PROVEN',report_sections:sections,missing_sections:missing,warnings};
}
export function cli(argv){
 const o={};for(let i=0;i<argv.length;i++){
  if(argv[i]==='--dry-run'){o.dryRun=true;continue;}
  if(!['--input-dir','--domain','--output-dir'].includes(argv[i])||!argv[i+1])err('invalid option '+argv[i]);
  o[argv[i].slice(2).replace(/-([a-z])/g,(_,s)=>s.toUpperCase())]=argv[++i];
 }
 if(!o.inputDir||!o.domain)err('requires --input-dir and --domain');
 const evidence=auditSnapshots(o.inputDir,o.domain);
 if(o.dryRun)return {mode:'DRY_RUN_NO_WRITE',status:evidence.browser_read_uat,annual_status:evidence.complete_annual_analysis,sections:Object.keys(evidence.report_sections),warnings:evidence.warnings};
 const dest=o.outputDir||path.join(process.cwd(),'.private-gsc',evidence.domain,'browser-audit');
 return {status:evidence.browser_read_uat,evidence_file:saveBundle(evidence,dest),annual_status:evidence.complete_annual_analysis};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href){
 try{process.stdout.write(JSON.stringify(cli(process.argv.slice(2)),null,2)+'\n');}
 catch(e){console.error(e.message);process.exitCode=2;}
}
