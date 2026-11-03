#!/usr/bin/env node
/**
 * BASWORLDY R1/R2 bounded source archive. Owner-authorized source only.
 * Per-URL single request, allowlisted www.basworld.com, request cap and pacing.
 * Resume via index; stop on 403/429. Private local HTML and product data only.
 *
 * node capture-real-catalog.mjs --mode inventory --root <absolute> --from 3 --limit 10
 * node capture-real-catalog.mjs --mode details --root <absolute> --limit 25
 * --seed-manifest files can be repeated.
 */
import { enforceVisualFirst } from './visual-first-gate.mjs';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {spawnSync} from 'node:child_process';
const a=n=>{const i=process.argv.indexOf('--'+n);return i===-1?null:process.argv[i+1];};
const all=n=>{const o=[];for(let i=0;i<process.argv.length;i++)if(process.argv[i]==='--'+n)o.push(process.argv[i+1]);return o;};
const root=a('root'),mode=a('mode'),limit=Number(a('limit')||1),start=Number(a('from')||1);
const sourceOrigin='https://www.basworld.com';
const category=a('category')||'truck';
if(!/^[a-z][a-z_-]{0,60}$/.test(category))throw Error('Invalid category');
const categoryOrigin=sourceOrigin+'/stock/'+category;
const ua='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
if(!root||!path.isAbsolute(root)||!['inventory','details'].includes(mode)||!Number.isInteger(limit)||limit<1||limit>70||!Number.isInteger(start)||start<1||start>10000)throw Error('Invalid root/mode/limit/from');
const indexPath=path.join(root,'catalog-index.json');
fs.mkdirSync(root,{recursive:true});
const blank={schema_version:1,source_origin:sourceOrigin,started_at:new Date().toISOString(),pages:[],product_details:[],listing_urls:[],blocks:[],ended_at:null};
let db=fs.existsSync(indexPath)?JSON.parse(fs.readFileSync(indexPath,'utf8')):blank;
const stage=a('stage')||'PILOT_FIRST_PAGE';
const pilotUrl=a('pilot-url');
const moduleGate=enforceVisualFirst({
 phase:stage,moduleId:mode==='inventory'?'catalog-listings':'product-details',approvalFile:a('visual-approval'),mode,from:start,limit,
 category:category,
 seedManifestCount:all('seed-manifest').length,
 pilotUrl,
 knownFirstPageUrls:db.listing_urls,
 indexUrlCount:mode==='inventory'?db.listing_urls.length:db.listing_urls.length
});
if(db.catalog_scope_category&&db.catalog_scope_category!==category)throw Error('Cannot mix category in one catalog index');db.catalog_scope_category=category;
const sha=buf=>crypto.createHash('sha256').update(buf).digest('hex');
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const normalize=url=>{try{const u=new URL(url,sourceOrigin);return (u.protocol==='https:'&&u.hostname==='www.basworld.com')?u.href:null;}catch{return null}};
const save=()=>{db.ended_at=new Date().toISOString();fs.writeFileSync(indexPath,JSON.stringify(db,null,2)+'\n')};
function title(html){return html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1].replace(/&amp;/g,'&').replace(/\s+/g,' ').trim()||null}
function links(html){return [...new Set([...html.matchAll(/\bhref=["']([^"']+)["']/gi)].map(m=>m[1].replace(/&amp;/g,'&')).map(normalize).filter(Boolean).filter(u=>/^https:\/\/www\.basworld\.com\/vehicles\/(?:new|used)\/[A-Za-z0-9%_-]+\/?$/.test(u)))];}
function product(html,url,bodyHash,finalUrl){
 const scripts=[...html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
 let v=null;for(const s of scripts){try{const j=JSON.parse(s[1]);if(j['@type']==='Vehicle'){v=j;break;}}catch{}}
 if(!v?.sku||!v?.name)return null;
 const gallery=[...new Set([...html.matchAll(/https:\/\/static\.basworld\.com\/photos\/vehicle\/[A-Za-z0-9_./%-]+\.(?:jpg|jpeg|png|webp)/gi)].map(x=>x[0]))];
 const dims={};for(const u of gallery){const m=u.match(/\/world\/([^/]+)\//);if(m)dims[m[1]]=(dims[m[1]]||0)+1;}
 const structured=Array.isArray(v.image)?v.image:v.image?[v.image]:[];
 return {source_url:url,canonical_url:v.offers?.url||finalUrl,sku:String(v.sku),name:v.name,description:v.description||null,brand:v.brand?.name||null,year:v.vehicleModelDate?.slice(0,4)||null,axle:v.vehicleConfiguration||null,transmission:v.vehicleTransmission||null,price:v.offers?.price||null,currency:v.offers?.priceCurrency||null,condition:v.offers?.itemCondition||null,availability:v.offers?.availability||null,images:gallery,dimensions:dims,jsonld_images:structured,html_sha256:bodyHash};
}
function fetchOne(url,rel){
 if(!normalize(url))throw Error('Non-allowlisted source URL: '+url);
 const dest=path.join(root,rel),hdr=dest+'.headers';fs.mkdirSync(path.dirname(dest),{recursive:true});
 const res=spawnSync('curl.exe',['--silent','--show-error','--location','--max-redirs','2','--connect-timeout','9','--max-time','26','--retry','0','--max-filesize','2500000','--user-agent',ua,'--dump-header',hdr,'--output',dest,'--write-out','%{http_code}\t%{url_effective}\t%{content_type}',url],{encoding:'utf8',timeout:31000,windowsHide:true,maxBuffer:100000});
 const [statusText,effective,mime]=(res.stdout||'').trim().split('\t');const status=Number(statusText||0);
 const bytes=fs.existsSync(dest)?fs.readFileSync(dest):Buffer.alloc(0),html=bytes.toString('utf8'),tt=title(html);
 const final=normalize(effective||''),challenge=/Attention Required! \| Cloudflare|Just a moment\.\.\.|cf-chl|challenge-platform/i.test((tt||'')+' '+html.slice(0,15000));
 const pass=res.status===0&&status===200&&final!==null&&/^text\/html/i.test(mime||'')&&bytes.length>1000&&!challenge;
 const record={url,final_url:final,http_status:status,content_type:mime||null,title:tt,bytes:bytes.length,sha256:sha(bytes),path:rel,challenge,valid:pass,error:(res.stderr||'').trim().slice(0,150)};
 if(!pass){db.blocks.push(record);if(fs.existsSync(dest))fs.renameSync(dest,dest+'.rejected');}
 return {record,html:pass?html:''};
}
async function inventory(){
 const seeds=all('seed-manifest');
 for(const file of seeds){const m=JSON.parse(fs.readFileSync(file,'utf8'));if(m.origin!==sourceOrigin)throw Error('Seed is from wrong source');db.listing_urls.push(...m.listed_vehicle_urls);}
 db.listing_urls=[...new Set(db.listing_urls)];
 let terminal=false;
 for(let n=start;n<start+limit;n++){
  const url=categoryOrigin+(n===1?'':'?page='+n);
  if(db.pages.some(p=>p.url===url&&p.valid)){console.log('SKIP '+url);continue;}
  const r=fetchOne(url,'pages/'+category+'-page-'+n+'.html');
  if(!r.record.valid){console.log('BLOCK '+JSON.stringify(r.record));save();break;}
  const urls=links(r.html);r.record.unique_details=urls.length;r.record.has_next=r.html.includes('/stock/'+category+'?page='+(n+1));
  r.record.page=n;db.pages.push(r.record);db.listing_urls=[...new Set([...db.listing_urls,...urls])];save();
  console.log('PAGE '+JSON.stringify({page:n,items:urls.length,combined:db.listing_urls.length,next:r.record.has_next,sha:r.record.sha256}));
  if(!r.record.has_next||urls.length===0){terminal=true;break;}
  await sleep(750);
 }
 console.log('INVENTORY '+JSON.stringify({status:db.blocks.length?'BLOCKED':'BOUNDED',urls:db.listing_urls.length,pages_checked:db.pages.length,last_page_found:terminal,report:indexPath}));
}
async function details(){
 for(const file of all('seed-manifest')){
  const m=JSON.parse(fs.readFileSync(file,'utf8'));if(m.origin!==sourceOrigin)throw Error('Seed source mismatch');db.listing_urls.push(...m.listed_vehicle_urls);
 }
 db.listing_urls=[...new Set(db.listing_urls)];
 let count=0;
 const done=new Set(db.product_details.map(p=>p.source_url));
 for(const url of db.listing_urls){
  if((stage==='PILOT_FIRST_PAGE'||moduleGate.scope_mode==='FIRST_PAGE_CATALOG')&&url!==pilotUrl)continue;
  if(done.has(url))continue;
  if(count>=limit)break;
  const h=sha(url).slice(0,24);
  const r=fetchOne(url,'details/'+h+'.html');
  if(!r.record.valid){console.log('BLOCK '+JSON.stringify(r.record));save();break;}
  const p=product(r.html,url,r.record.sha256,r.record.final_url);
  if(!p){db.blocks.push({...r.record,error:'NO_VEHICLE_STRUCTURED_DATA'});console.log('DETAIL_SCHEMA_MISSING '+url);save();break;}
  p.source_record=r.record;
  db.product_details.push(p);save();count++;done.add(url);
  console.log('DETAIL '+JSON.stringify({sku:p.sku,title:p.name,price:p.price,images:p.images.length,dimensions:p.dimensions,done:db.product_details.length,expected_urls:db.listing_urls.length}));
  await sleep(750);
 }
 console.log('DETAILS '+JSON.stringify({status:db.blocks.length?'BLOCKED':'BOUNDED',saved:db.product_details.length,listed:db.listing_urls.length,missing:db.listing_urls.length-db.product_details.length,report:indexPath}));
}
if(mode==='inventory')await inventory();else await details();
