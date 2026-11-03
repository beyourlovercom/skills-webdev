#!/usr/bin/env node
/** Verify & index captured nested catalog FIRST PAGES only, no network. */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {enforceVisualFirst} from './visual-first-gate.mjs';
const a=n=>{let i=process.argv.indexOf('--'+n);return i<0?null:process.argv[i+1]};
const nested=a('nested'),out=a('out'),approval=a('visual-approval');
if(!nested||!out||!path.isAbsolute(nested)||!path.isAbsolute(out))throw Error('Require --nested and --out absolute');
const gate=enforceVisualFirst({phase:'EXPANSION_AFTER_OWNER_PASS',approvalFile:approval,moduleId:'catalog-listings',mode:'inventory',from:1,limit:1});
if(gate.scope_mode!=='FIRST_PAGE_CATALOG')throw Error('Scope mismatch');
const index=JSON.parse(fs.readFileSync(path.join(nested,'nested-listing-index.json'),'utf8'));
if(index.scope!=='NESTED_LISTING_FIRST_PAGE_ONLY')throw Error('Not a first-page nested index');
const origin='https://www.basworld.com',hosts=new Set(['www.basworld.com','static.basworld.com','media.basworld.com','cms.media.basworld.com','basgroup.a.bigcontent.io']);
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const records=[],assets=new Map(),denied=[],invalid=[];
function push(raw,sourcePath,kind){
 const trimmed=raw.trim().replaceAll('&amp;','&').replace(/^["']|["']$/g,'');
 if(!trimmed||/^(?:data:|blob:|javascript:|#)/.test(trimmed))return;
 let url;try{url=new URL(trimmed,origin)}catch{return}
 if(url.protocol!=='https:'||!hosts.has(url.hostname)){denied.push({sourcePath,url:url.href,reason:'OFFSITE'});return}
 const ext=path.extname(url.pathname).toLowerCase();
 if(!['.png','.jpg','.jpeg','.webp','.svg','.gif','.ico','.avif','.woff','.woff2','.ttf','.eot','.otf'].includes(ext)&&
   !['media.basworld.com','cms.media.basworld.com','basgroup.a.bigcontent.io'].includes(url.hostname)){
   denied.push({sourcePath,url:url.href,reason:'NONMEDIA'});return}
 if(!assets.has(url.href))assets.set(url.href,{url:url.href,role:'page_image',source_page:'listing',kind,source_page_example:sourcePath,source_page_numbers:[1]});
}
for(const item of index.records.filter(x=>x.status==='SAVED')){
 if(!index.all_source_paths.includes(item.source_path))throw Error('Source not listed in approved homepage '+item.source_path);
 const p=path.join(nested,item.file_path);
 const buff=fs.readFileSync(p);
 if(hash(buff)!==item.sha256){invalid.push(item.source_path);continue}
 const html=buff.toString('utf8');
 if(!html.includes('<html')){invalid.push(item.source_path);continue}
 for(const tag of html.match(/<(?:img|source|video|link)\b[^>]*>/gi)||[]){
  if(tag.startsWith('<link')&&!/rel=["'](?:icon|shortcut icon|apple-touch-icon|preload)["']/.test(tag))continue;
  for(const m of tag.matchAll(/\b(?:src|data-src|poster|href)=["']([^"']+)["']/gi))push(m[1],item.source_path,'element');
  for(const m of tag.matchAll(/\b(?:srcset|data-srcset)=["']([^"']+)["']/gi))for(const x of m[1].split(','))push(x.trim().split(/\s+/)[0],item.source_path,'srcset');
 }
 for(const m of html.matchAll(/(?:background-image|background)\s*:\s*url\(([^)]+)\)/gi))push(m[1],item.source_path,'inline-background');
 records.push(item);
}
const manifest={schema_version:1,origin,pilot_scope:'FIRST_PAGE',verified_first_page_assets:true,
 source_page_numbers:[1],page_kind:'nested_listings',media_assets:[...assets.values()],css_dependencies:[],
 verified_source_routes:records,source_path_count:index.all_source_paths.length,
 source_saved_pages:records.length,source_invalid_pages:invalid,external_or_nonmedia:denied,
 source_originals_per_scope:'Only already captured first-page routes from source homepage',
 approved_template_sha:gate.template_sha256};
fs.mkdirSync(out,{recursive:true});
fs.writeFileSync(path.join(out,'nested-page1-media.json'),JSON.stringify(manifest,null,2)+'\n');
console.log(JSON.stringify({status:'NESTED_MEDIA_MANIFEST_READY',total_routes:index.all_source_paths.length,
 verified_pages:records.length,unique_assets:assets.size,invalid,excluded:denied.length}));
