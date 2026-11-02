#!/usr/bin/env node
/** Discover actual image elements and preloads from three immutable source snapshots.
 * Distinguish page media from product-gallery 1280/250 duplicates. Do not fetch.
 */
import fs from 'node:fs';import path from 'node:path';
const a=n=>{const i=process.argv.indexOf('--'+n);return i<0?null:process.argv[i+1];};
const entries=[['home',a('home')],['listing',a('listing')],['detail',a('detail')]];
if(entries.some(x=>!x[1])||!a('out'))throw Error('Required --home --listing --detail --out');
const origin='https://www.basworld.com';
const hostAllow=['www.basworld.com','static.basworld.com','media.basworld.com','cms.media.basworld.com'];
const records=[],external=[],seen=new Set(),counts={};
const decode=s=>s.replace(/&amp;/g,'&').replace(/&#x([0-9a-f]+);/gi,(_,n)=>String.fromCodePoint(parseInt(n,16)));
for(const [type,filename] of entries){
 const html=fs.readFileSync(filename,'utf8');
 const paths=[...html.matchAll(/<img\b[^>]*?\bsrc=["']([^"']+)["']/gi)].map(m=>decode(m[1]));
 const preloads=[...html.matchAll(/<link\b[^>]*as=["']image["'][^>]*href=["']([^"']+)["']/gi)].map(m=>decode(m[1]));
 counts[type]={unique_img_src:new Set(paths).size,image_preload_count:preloads.length};
 for(const src of [...preloads,...paths]){
  let url;try{url=new URL(src,origin)}catch{continue;}
  if(!['https:'].includes(url.protocol))continue;
  if(!hostAllow.includes(url.hostname)){external.push({source_page:type,url:url.href});continue;}
  if(seen.has(url.href))continue;seen.add(url.href);
  records.push({url:url.href,role:'page_image',source_page:type,item_sku:null});
 }
}
const summary={schema_version:1,origin,allowed_hosts:hostAllow,source_type:'ORIGINAL_HTML_IMG_AND_PRELOAD',
 per_page:counts,unique_allowed_assets:records.length,excluded_external_domain_images:external.length,
 external_sample:external.slice(0,10),media_assets:records,css_dependencies:[],
 status:'SOURCE_ASSET_DISCOVERY_ONLY'};
const dest=a('out');fs.mkdirSync(path.dirname(dest),{recursive:true});fs.writeFileSync(dest,JSON.stringify(summary,null,2)+'\n');
console.log(JSON.stringify({status:summary.status,per_page:counts,unique_allowed_assets:records.length,external_domain_images:external.length,output:dest},null,2));
