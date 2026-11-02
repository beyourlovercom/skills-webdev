#!/usr/bin/env node
/** Build a bounded, source-backed media-download manifest from real captured product details.
 * No network. Reuses fetch-source-assets.mjs resume+SHA integrity layer.
 */
import { enforceVisualFirst } from './visual-first-gate.mjs';
import fs from 'node:fs';import path from 'node:path';
const a=n=>{const i=process.argv.indexOf('--'+n);return i<0?null:process.argv[i+1];};
if(!a('index')||!a('out'))throw Error('--index and --out required');
const db=JSON.parse(fs.readFileSync(a('index'),'utf8'));
if(a('stage')!=='EXPANSION_AFTER_OWNER_PASS')
  throw Error('OWNER_VISUAL_GATE_BLOCKED: bulk gallery queue is only enabled after Owner visual PASS; use single representative detail manifest in the pilot');
enforceVisualFirst({phase:'EXPANSION_AFTER_OWNER_PASS',approvalFile:a('visual-approval'),mode:'media',from:2,limit:2});
if(db.source_origin!=='https://www.basworld.com')throw Error('Unexpected source origin');
const dedup=new Set(),entries=[],skipped=[],stats=[];
for(const p of db.product_details){
 let variants={};
 for(const [i,url] of (p.images||[]).entries()){
  let u;try{u=new URL(url)}catch{skipped.push({sku:p.sku,url,why:'bad_url'});continue;}
  if(u.protocol!=='https:'||u.hostname!=='static.basworld.com'||!/^\/photos\/vehicle\//.test(u.pathname)){skipped.push({sku:p.sku,url,why:'out_of_scope'});continue;}
  const dimension=u.pathname.match(/\/world\/([^/]+)\//)?.[1]||'unknown';
  variants[dimension]=(variants[dimension]||0)+1;
  if(dedup.has(u.href))continue;
  dedup.add(u.href);entries.push({url:u.href,role:'vehicle_gallery',item_sku:p.sku,order:i+1,dimension,canonical_url:p.canonical_url});
 }
 stats.push({sku:p.sku,title:p.name,source_photo_variants:(p.images||[]).length,dimension_groups:variants,media_urls:(p.images||[]).length,status:(p.images||[]).length?'GALLERY_DISCOVERED':'NO_GALLERY_IN_SOURCE_HTML'});
}
const report={schema_version:1,origin:'https://www.basworld.com',created_at:new Date().toISOString(),
 total_listed_urls:db.listing_urls.length,source_details_captured:db.product_details.length,
 media_assets:entries,css_dependencies:[],products:stats,
 excluded_urls:skipped,full_site_total_unknown:true,
 state:'R3_MEDIA_DOWNLOAD_QUEUE_NOT_COMPLETE'};
fs.mkdirSync(path.dirname(a('out')),{recursive:true});fs.writeFileSync(a('out'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({status:'R3_MEDIA_QUEUE_READY',products:stats.length,unique_media_urls:entries.length,no_gallery:stats.filter(x=>!x.media_urls).length,output:a('out')},null,2));
