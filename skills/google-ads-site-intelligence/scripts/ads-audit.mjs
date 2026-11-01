#!/usr/bin/env node
// S1 Google Ads: inspect previously retrieved, read-only connector rows.
// Zero API/OAuth calls, zero ad edits, never mistake platform conversions for leads.
import fs from 'node:fs';import path from 'node:path';import {pathToFileURL} from 'node:url';
const fail=s=>{throw Error('BLOCKED: '+s)};
const iso=s=>typeof s==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(s)&&!Number.isNaN(Date.parse(s))&&new Date(s+'T00:00:00Z').toISOString().slice(0,10)===s;
const num=(v,k,integer=false)=>{if(typeof v!=='number'||!Number.isFinite(v)||v<0||(integer&&!Number.isSafeInteger(v)))fail('invalid '+k);return v;};
const account=id=>{if(typeof id!=='string'||!/^(\d{3}-\d{3}-\d{4}|\d{10})$/.test(id))fail('invalid Google Ads account');return id.replaceAll('-','')};
export function auditAds(x){
 if(!x||x.source!=='WINDSOR_GOOGLE_ADS_READONLY'||!account(x.account_id)||!(typeof x.currency==='string'&&/^[A-Z]{3}$/.test(x.currency)))fail('invalid Ads source/account/currency');
 if(!iso(x.date_from)||!iso(x.date_to)||x.date_from>x.date_to||!Array.isArray(x.rows)||x.rows.length>10000)fail('invalid dates/rows cap');
 if(typeof x.account_time_zone!=='string'||!/^[A-Za-z_]+\/[A-Za-z_]+/.test(x.account_time_zone))fail('account time zone absent');
 const seen=new Set(),campaigns=new Map();let clicks=0,impressions=0,spend=0,conversions=0,conversion_value=0;
 for(const r of x.rows){
  if(!r||account(String(r.account_id||''))!==account(x.account_id)||r.date<x.date_from||r.date>x.date_to||!iso(r.date))fail('mixed account/date row');
  if(typeof r.campaign_id!=='string'||!/^\d+$/.test(r.campaign_id)||typeof r.campaign!=='string'||!r.campaign.trim())fail('campaign id/name required');
  const id=r.date+'|'+r.campaign_id;if(seen.has(id))fail('duplicate campaign/date metric row');seen.add(id);
  for(const k of ['clicks','impressions','spend','conversions','conversions_value'])num(r[k],k,['clicks','impressions'].includes(k));
  if(r.clicks>r.impressions)fail('clicks exceed impressions');
  if(r.account_currency_code!==x.currency||r.account_time_zone!==x.account_time_zone)fail('row currency/timezone mismatch');
  clicks+=r.clicks;impressions+=r.impressions;spend+=r.spend;conversions+=r.conversions;conversion_value+=r.conversions_value;
  const c=campaigns.get(r.campaign_id)||{campaign_id:r.campaign_id,name:r.campaign,clicks:0,impressions:0,spend:0,platform_conversions:0};
  if(c.name!==r.campaign)fail('campaign id/name drift');c.clicks+=r.clicks;c.impressions+=r.impressions;c.spend+=r.spend;c.platform_conversions+=r.conversions;campaigns.set(r.campaign_id,c);
 }
 const totals={impressions,clicks,spend:Number(spend.toFixed(6)),platform_conversions:conversions,platform_conversion_value:conversion_value,currency:x.currency,ctr:impressions?clicks/impressions:null,cpc:clicks?spend/clicks:null,cpa:conversions?spend/conversions:null};
 return {schema_version:1,source:x.source,account_id:account(x.account_id),account_time_zone:x.account_time_zone,period:{from:x.date_from,to:x.date_to},record_count:x.rows.length,campaigns:[...campaigns.values()].sort((a,b)=>b.spend-a.spend),observed_totals:totals,
  completeness:'INPUT_ROWS_ONLY_ACCOUNT_COMPLETENESS_UNVERIFIED',qualified_leads:'NOT_VERIFIED_BY_GOOGLE_ADS',roi:'NOT_PROVEN_WITHOUT_ACTUAL_REVENUE_AND_COST_SCOPE',search_term_report:'SEPARATE_DATASET_NOT_MERGED',conversion_action_definition:'NOT_VERIFIED',status:x.rows.length?'PARTIAL_LIVE_CONNECTOR_ROWS':'BLOCKED_NO_ROWS',
  warnings:['Google Ads platform conversions are NOT independently qualified customer inquiries','Do not compare Ads clicks with GSC organic clicks as the same users or add both to GA4 sessions','No conversion-action or deduplication proof is present; campaign rows may omit hidden or paused campaigns']};
}
export function main(argv){
 const opt={};for(let i=0;i<argv.length;i++){if(argv[i]==='--dry-run'){opt.dryRun=true;continue}if(!['--input','--output'].includes(argv[i])||!argv[i+1])fail('bad CLI option');opt[argv[i].slice(2)]=argv[++i]}
 if(!opt.input)fail('--input required');
 const file=path.resolve(opt.input);if(fs.statSync(file).size>3000000)fail('input exceeds size cap');
 const result=auditAds(JSON.parse(fs.readFileSync(file,'utf8')));
 if(opt.dryRun)return {status:result.status,observed_totals:result.observed_totals,scope:result.completeness,write:false};
 if(!opt.output||!path.resolve(opt.output).split(path.sep).includes('.private-s1'))fail('output must be in .private-s1 folder');
 const dest=path.resolve(opt.output);fs.mkdirSync(path.dirname(dest),{recursive:true,mode:0o700});fs.writeFileSync(dest,JSON.stringify(result,null,2),{flag:'wx',mode:0o600});return {status:result.status,path:dest};
}
if(process.argv[1]&&fs.existsSync(process.argv[1])&&import.meta.url===pathToFileURL(fs.realpathSync(process.argv[1])).href){try{console.log(JSON.stringify(main(process.argv.slice(2)),null,2))}catch(e){console.error(e.message);process.exitCode=2}}
