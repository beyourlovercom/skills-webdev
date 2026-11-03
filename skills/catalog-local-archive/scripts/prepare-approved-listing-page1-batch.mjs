#!/usr/bin/env node
/** Prepare audited category page-1 local asset manifest; no source requests. */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {enforceVisualFirst} from './visual-first-gate.mjs';
const a=x=>{const i=process.argv.indexOf('--'+x);return i<0?null:process.argv[i+1]};
const root=a('root'),out=a('out'),approvalFile=a('visual-approval');
if(!root||!out||!path.isAbsolute(root)||!path.isAbsolute(out))throw Error('Require --root and --out absolute');
const gate=enforceVisualFirst({phase:'EXPANSION_AFTER_OWNER_PASS',approvalFile,moduleId:'catalog-listings',mode:'inventory',from:1,limit:1});
if(gate.scope_mode!=='FIRST_PAGE_CATALOG')throw Error('BASWORLDY must remain FIRST_PAGE_CATALOG');
const origin='https://www.basworld.com',hosts=new Set(['www.basworld.com','static.basworld.com','cms.media.basworld.com','media.basworld.com','basgroup.a.bigcontent.io']);
const categories=['all','combination','construction_equipment','light_commercial_vehicle','semi_trailer','tractorhead','trailer','truck','various'];
const assets=new Map(),routes=[],denied=[],sha=b=>crypto.createHash('sha256').update(b).digest('hex');
function add(text,category,kind){
 const raw=String(text).trim().replaceAll('&amp;','&').replace(/^["']|["']$/g,'');
 if(!raw||/^(?:data:|blob:|javascript:|#)/.test(raw))return;
 let url;try{url=new URL(raw,origin)}catch{denied.push({category,raw,reason:'INVALID_URL'});return}
 if(url.protocol!=='https:'||!hosts.has(url.hostname)){
   denied.push({category,raw,reason:'OFFSITE'});return;
 }
 const ext=path.extname(url.pathname).toLowerCase();
 if(!['.png','.jpg','.jpeg','.webp','.svg','.gif','.ico','.avif','.woff','.woff2','.ttf','.eot','.otf'].includes(ext)&&
   !['cms.media.basworld.com','media.basworld.com','basgroup.a.bigcontent.io'].includes(url.hostname)){
   denied.push({category,raw,reason:'NOT_STATIC_MEDIA'});return;
 }
 if(!assets.has(url.href))assets.set(url.href,{url:url.href,role:'page_image',source_page:'listing',kind,first_page_categories:[category]});
 else if(!assets.get(url.href).first_page_categories.includes(category))assets.get(url.href).first_page_categories.push(category);
}
for(const cat of categories){
 const dir=path.join(root,cat),db=JSON.parse(fs.readFileSync(path.join(dir,'catalog-index.json'),'utf8'));
 const record=db.pages.find(x=>x.valid&&x.page===1);
 if(!record||db.pages.some(x=>x.page>1))throw Error('Only audited first-page source snapshots allowed '+cat);
 const content=fs.readFileSync(path.join(dir,record.path),'utf8');
 if(sha(Buffer.from(content))!==record.sha256)throw Error('Source page hash mismatch: '+cat);
 if(!content.includes('<html')||content.length<1000)throw Error('Invalid source html '+cat);
 const tags=content.match(/<(?:img|source|video|link)\b[^>]*>/gi)||[];
 for(const tag of tags){
  if(tag.startsWith('<link')&&!/(rel=["'](?:icon|shortcut icon|apple-touch-icon|preload)["'])/.test(tag))continue;
  for(const m of tag.matchAll(/\b(?:src|data-src|poster|href)=["']([^"']+)["']/gi))add(m[1],cat,'html-'+m[0].split('=')[0]);
  for(const m of tag.matchAll(/\b(?:srcset|data-srcset)=["']([^"']+)["']/gi)){
    for(const value of m[1].split(','))add(value.trim().split(/\s+/)[0],cat,'responsive-srcset');
  }
 }
 for(const m of content.matchAll(/(?:background-image|background)\s*:\s*url\(([^)]+)\)/gi))add(m[1],cat,'inline-background');
 routes.push({category:cat,source_url:record.url,source_sha256:record.sha256,source_file:path.join(dir,record.path),
   local_path:'/source-mirror/stock/'+cat+'/',original_card_urls:db.listing_urls.length,
   source_card_urls:db.listing_urls,first_page:true});
}
const items=[...assets.values()];
const manifest={schema_version:1,origin,pilot_scope:'FIRST_PAGE',verified_first_page_assets:true,
  source_page_numbers:[1],page_kind:'listing',media_assets:items,css_dependencies:[],
  first_page_source_routes:routes,denied_static_candidates:denied,
  source_page_count:routes.length,unique_assets:items.length,
  scope:'FIRST_PAGE_CATALOG / 9 MAIN CATEGORY PAGE1 ONLY',module_gate_approval_ref:gate.approval_ref};
fs.mkdirSync(out,{recursive:true});
fs.writeFileSync(path.join(out,'category-page1-media.json'),JSON.stringify(manifest,null,2)+'\n');
fs.writeFileSync(path.join(out,'category-page1-routes.json'),JSON.stringify({source_origin:origin,routes},null,2)+'\n');
console.log(JSON.stringify({status:'APPROVED_FIRST_PAGE_BATCH_PREPARED',routes:routes.length,
  unique_media:items.length,excluded_candidates:denied.length,
  page_one_cards_sum:routes.reduce((n,r)=>n+r.original_card_urls,0)},null,2));
