#!/usr/bin/env node
// Search Console V1 real, read-only OAuth adapter. Node 20+, no dependencies.
import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';

export const REPORTS = Object.freeze({
 daily:['date'], queries:['query'], pages:['page'], countries:['country'],
 devices:['device'], query_pages:['query','page']
});
const TYPES = new Set(['web','image','video','news']);
const PERMISSIONS = new Set(['siteOwner','siteFullUser','siteRestrictedUser']);

export function domainHost(s) {
 if(typeof s!=='string' || !/^(?:[a-z0-9-]+\.)+[a-z]{2,}$/i.test(s) || s.length>253) throw Error('Use a bare public domain');
 return s.toLowerCase();
}
export function validateProperty(s) {
 if(typeof s!=='string') throw Error('Property must be an exact GSC siteUrl');
 if(s.startsWith('sc-domain:')) return 'sc-domain:'+domainHost(s.slice(10));
 let u;try{u=new URL(s);}catch{throw Error('Invalid GSC URL-prefix property');}
 if(!['http:','https:'].includes(u.protocol)||u.username||u.password||u.port||u.search||u.hash) throw Error('Invalid GSC URL-prefix property');
 return u.origin+u.pathname;
}
function candidate(siteUrl,domain) {
 let v;try{v=validateProperty(siteUrl);}catch{return false;}
 if(v.startsWith('sc-domain:'))return v===`sc-domain:${domain}`;
 const u=new URL(v);
 return (u.hostname===domain||u.hostname===`www.${domain}`) && u.pathname.startsWith('/');
}
export function selectProperty(entries,domain,requested) {
 domain=domainHost(domain);
 const matches=(entries||[]).filter(s=>candidate(s.siteUrl,domain) && PERMISSIONS.has(s.permissionLevel));
 if(requested){const exact=validateProperty(requested);const found=matches.find(x=>validateProperty(x.siteUrl)===exact);
  if(!found)throw Error('BLOCKED: specified property not verified in authorized sites.list for requested domain');
  return {site_url:exact,permission:found.permissionLevel,property_type:exact.startsWith('sc-domain:')?'DOMAIN':'URL_PREFIX',scope_note:exact.startsWith('sc-domain:')?'Domain property covers subdomains':'URL-prefix property may exclude other protocols/hosts/paths'};
 }
 if(matches.length!==1)throw Error(`BLOCKED: ${matches.length} matching authorized properties; specify the exact --property (never mix)`);
 return selectProperty(entries,domain,matches[0].siteUrl);
}
export function fullMonthRanges(now=new Date()) {
 // GSC Search Analytics reports are conventionally in America/Los_Angeles time.
 const d=new Date(now);
 if(!Number.isFinite(d.getTime()))throw Error('Invalid current date');
 const p=new Intl.DateTimeFormat('en-US',{timeZone:'America/Los_Angeles',year:'numeric',month:'2-digit'}).formatToParts(d);
 const y=Number(p.find(t=>t.type==='year').value),m=Number(p.find(t=>t.type==='month').value);
 const first=offset=>new Date(Date.UTC(y,m-1+offset,1)).toISOString().slice(0,10);
 const end=offset=>new Date(Date.UTC(y,m+offset,0)).toISOString().slice(0,10);
 return {current:{startDate:first(-12),endDate:end(-1)},previous:{startDate:first(-24),endDate:end(-13)},time_zone:'America/Los_Angeles',note:'GSC commonly retains ~16 months; previous 12 months generally incomplete; absence is not zero'};
}
async function jsonRequest(fetchImpl,url,token,body) {
 const r=await fetchImpl(url,{method:body?'POST':'GET',headers:{Authorization:`Bearer ${token}`,...(body?{'Content-Type':'application/json'}:{})},...(body?{body:JSON.stringify(body)}:{})});
 if(!r?.ok)throw Error(`BLOCKED: Google Search Console read request HTTP ${r?.status??'unknown'}; inspect authorized scope webmasters.readonly/quota/property`);
 return await r.json();
}
function parseRows(raw,dims) {
 if(!Array.isArray(raw.rows) && raw.rows!==undefined)throw Error('BLOCKED: malformed GSC response rows');
 return (raw.rows||[]).map(row=>{
  if(!Array.isArray(row.keys)||row.keys.length!==dims.length)throw Error('BLOCKED: dimensions mismatch');
  for(const k of ['clicks','impressions','ctr','position'])if(!Number.isFinite(row[k])||row[k]<0)throw Error('BLOCKED: invalid GSC metric');
  const out={};dims.forEach((dim,i)=>out[dim]=String(row.keys[i]));
  return {...out,clicks:row.clicks,impressions:row.impressions,ctr:row.ctr,position:row.position};
 });
}
export async function readReport({fetchImpl,token,siteUrl,period,dims,type='web',rowLimit=25000,maxRows=50000}) {
 if(!TYPES.has(type)||!Number.isInteger(rowLimit)||rowLimit<1||rowLimit>25000||!Number.isInteger(maxRows)||maxRows<rowLimit||maxRows%rowLimit!==0)throw Error('Invalid bounded report settings');
 const endpoint=`https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`;
 const data=[];
 for(let offset=0;offset<=maxRows;offset+=rowLimit){
  const body={...period,dimensions:dims,type,dataState:'final',aggregationType:dims.includes('page')?'byPage':'byProperty',rowLimit:offset===maxRows?1:rowLimit,startRow:offset};
  const r=await jsonRequest(fetchImpl,endpoint,token,body);
  const part=parseRows(r,dims);
  if(offset===maxRows){if(part.length)throw Error('BLOCKED: GSC result exceeds maxRows; no complete page extraction');break;}
  data.push(...part);
  if(part.length<rowLimit)break;
 }
 return {dimensions:dims,search_type:type,rows:data,row_count:data.length,exhausted_api_pages:true,exhaustive_search_queries:false,
  note:'GSC API returns top rows only and anonymizes queries; complete API pagination is not complete query universe'};
}
function summarizeRows(rows){const clicks=rows.reduce((s,x)=>s+x.clicks,0), impressions=rows.reduce((s,x)=>s+x.impressions,0);
 return {clicks,impressions,ctr:impressions?clicks/impressions:null,average_position:impressions?rows.reduce((s,x)=>s+x.position*x.impressions,0)/impressions:null};
}
export function summary(bundle) {
 const current=bundle.reports.daily.current.rows;
 const previous=bundle.reports.daily.previous.rows;
 const c=summarizeRows(current),p=summarizeRows(previous);
 const countMonths=x=>new Set(x.map(v=>v.date.slice(0,7))).size;
 const presentCurrent=countMonths(current),presentPrevious=countMonths(previous);
 const expectedDays=range=>Math.round((Date.parse(range.endDate+'T00:00:00Z')-Date.parse(range.startDate+'T00:00:00Z'))/86400000)+1;
 const fullCoverage=(rows,range)=>Array.isArray(rows)&&rows.length===expectedDays(range)&&new Set(rows.map(v=>v.date)).size===expectedDays(range);
 const warnings=['GSC top rows/anonymized queries are not a full query universe',
 'GSC historical performance usually ~16 months, so a full 12-month YoY is generally unavailable',
 'Index coverage / CWV / enhancements cannot be established from Search Analytics API alone'];
 if(presentCurrent!==12)warnings.push(`Only ${presentCurrent} of 12 current months observed in daily data; missing month is NOT proven zero`);
 if(presentPrevious!==12)warnings.push(`Only ${presentPrevious} of 12 prior months observed; no full-year YoY`);
 const complete=presentCurrent===12 && presentPrevious===12 && fullCoverage(current,bundle.ranges.current) && fullCoverage(previous,bundle.ranges.previous);
 return {period_totals:{current:c,previous:p},current_months_observed:presentCurrent,previous_months_observed:presentPrevious,
  daily_coverage_complete:{current:fullCoverage(current,bundle.ranges.current),previous:fullCoverage(previous,bundle.ranges.previous)},
  full_year_yoy:complete&&p.clicks>0?{clicks_pct:(c.clicks/p.clicks-1)*100,impressions_pct:p.impressions>0?(c.impressions/p.impressions-1)*100:null}:null,
  qualified_leads:'NOT_VERIFIED_BY_GSC',index_coverage:'NOT_VERIFIED_BY_THIS_API',warnings,
  status:current.length?'PARTIAL_REQUIRES_BUSINESS_AND_INDEX_VALIDATION':'BLOCKED_NO_GSC_REPORT_ROWS'};
}
export async function collectGsc({domain,requestedProperty,token,now=new Date(),fetchImpl=fetch,type='web',maxRows=50000,rowLimit=25000}) {
 domain=domainHost(domain);
 if(!token||typeof token!=='string')throw Error('BLOCKED: GSC_READONLY_ACCESS_TOKEN missing; use authorized connection or export');
 if(!TYPES.has(type))throw Error('Unsupported search type');
 const sites=await jsonRequest(fetchImpl,'https://www.googleapis.com/webmasters/v3/sites',token);
 const property=selectProperty(sites.siteEntry||[],domain,requestedProperty);
 const ranges=fullMonthRanges(now);
 const b={schema_version:1,source:'GOOGLE_SEARCH_CONSOLE_API_READONLY',collected_at:new Date(now).toISOString(),domain,property,search_type:type,ranges,reports:{},sitemaps:{status:'OPEN'}};
 for(const [name,dims] of Object.entries(REPORTS)){
  b.reports[name]={};
  for(const period of ['current','previous'])b.reports[name][period]=await readReport({fetchImpl,token,siteUrl:property.site_url,period:ranges[period],dims,type,maxRows,rowLimit});
 }
 try{
  const base=`https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(property.site_url)}/sitemaps`;
  const sm=await jsonRequest(fetchImpl,base,token);
  b.sitemaps={status:'READ',count:(sm.sitemap||[]).length,sitemaps:(sm.sitemap||[]).map(x=>({path:x.path||'',lastSubmitted:x.lastSubmitted||null,lastDownloaded:x.lastDownloaded||null,isPending:x.isPending===true,errors:x.errors??null,warnings:x.warnings??null}))};
 }catch(e){b.sitemaps={status:'OPEN',reason:'Sitemaps API unavailable or denied; does not imply no sitemap'};}
 b.summary=summary(b);
 return b;
}
export function outputDirectory(dest){const d=path.resolve(dest);if(d.split(path.sep).includes('.git'))throw Error('BLOCKED: cannot write into .git');
 let p=d;while(p!==path.dirname(p)){if(fs.existsSync(path.join(p,'.git'))){if(path.relative(p,d).split(path.sep)[0]!=='.private-gsc')throw Error('BLOCKED: GSC exports in project repo must live in ignored .private-gsc');break;}p=path.dirname(p);}return d;
}
export function saveBundle(bundle,destination){const out=outputDirectory(destination);fs.mkdirSync(out,{recursive:true,mode:0o700});const f=path.join(out,'gsc-evidence.json');fs.writeFileSync(f,JSON.stringify(bundle,null,2)+'\n',{flag:'wx',mode:0o600});return f;}
export function parseArgs(argv){const o={};for(let i=0;i<argv.length;i++){const k=argv[i];if(k==='--dry-run'){o.dryRun=true;continue;}if(!['--domain','--property','--search-type','--output-dir','--now'].includes(k)||!argv[i+1])throw Error('Unknown or incomplete option: '+k);o[k.slice(2).replace(/-([a-z])/g,(_,c)=>c.toUpperCase())]=argv[++i];}if(!o.domain)throw Error('Required --domain <bare domain>');o.domain=domainHost(o.domain);if(o.property)o.property=validateProperty(o.property);o.searchType??='web';if(!TYPES.has(o.searchType))throw Error('Unsupported search type');return o;}
export async function main(argv,env=process.env,fetchImpl=fetch){const o=parseArgs(argv);const target=o.outputDir||path.join(process.cwd(),'.private-gsc',o.domain);if(o.dryRun){process.stdout.write(JSON.stringify({mode:'DRY_RUN_NO_NETWORK',domain:o.domain,property:o.property||'DISCOVER_ONLY_IF_UNAMBIGUOUS',search_type:o.searchType,scope:'webmasters.readonly',token_present:Boolean(env.GSC_READONLY_ACCESS_TOKEN),output_dir:target},null,2)+'\n');return 0;}const data=await collectGsc({domain:o.domain,requestedProperty:o.property,token:env.GSC_READONLY_ACCESS_TOKEN,now:o.now||new Date(),fetchImpl, type:o.searchType});const evidencePath=saveBundle(data,target);process.stdout.write(JSON.stringify({status:data.summary.status,property:data.property.site_url,search_type:o.searchType,evidence_file:evidencePath,rows:Object.fromEntries(Object.entries(data.reports).map(([k,v])=>[k,v.current.row_count+v.previous.row_count])),warnings:data.summary.warnings},null,2)+'\n');return 0;}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href){main(process.argv.slice(2)).catch(e=>{console.error(e.message);process.exitCode=2;});}
