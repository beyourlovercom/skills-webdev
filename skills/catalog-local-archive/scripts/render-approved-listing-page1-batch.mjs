#!/usr/bin/env node
/** Restore approved catalog listing FIRST-PAGE only using frozen Local visual shell.
 * NO NETWORK. Never changes approved homepage, truck template, product detail.
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {enforceVisualFirst} from './visual-first-gate.mjs';
const a=n=>{const i=process.argv.indexOf('--'+n);return i<0?null:process.argv[i+1]};
const root=a('root'),out=a('out'),assets=a('assets'),approval=a('visual-approval');
if(!root||!out||!assets)throw Error('Requires --root --out --assets');
if(!path.isAbsolute(root)||!path.isAbsolute(out)||!path.isAbsolute(assets)||!path.resolve(out).toLowerCase().endsWith('source-mirror'))
 throw Error('Source and destination must be dedicated absolute paths');
const gate=enforceVisualFirst({phase:'EXPANSION_AFTER_OWNER_PASS',approvalFile:approval,moduleId:'catalog-listings',mode:'inventory',from:1,limit:1});
if(gate.scope_mode!=='FIRST_PAGE_CATALOG')throw Error('Wrong source scope');
const m=JSON.parse(fs.readFileSync(path.join(root,'category-page1-media.json'),'utf8'));
if(m.pilot_scope!=='FIRST_PAGE'||m.source_page_numbers.some(x=>x!==1))throw Error('Source beyond first-page scope');
const routes=m.first_page_source_routes,sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const expectedHome='16b5652ae8687051c79b55f1f878ed121960215403c9adc52d7a725ef0518e0b';
const expectedTruck='11706047aff57dbef25a610d9ca57d6c519e2dd957efe2491d0823972972bad6';
const expectedVolvo='af260fac391cf0e2288d427b1d345adc2adf43d7d80e635a4689b31c0acb2902';
for(const [p,digest] of [['index.html',expectedHome],['stock/truck/index.html',expectedTruck],
 ['vehicles/used/truck-volvo-fm-2012-euro5-70320127/index.html',expectedVolvo]]){
 const f=path.join(out,p);
 if(!fs.existsSync(f)||sha(fs.readFileSync(f))!==digest)throw Error('Approved visual baseline drift '+p);
}
const srcManifest=JSON.parse(fs.readFileSync('D:/ai/basworldy-source-archive/manifest/source-manifest.json','utf8'));
const extraGraph=JSON.parse(fs.readFileSync('D:/ai/basworldy-source-archive/first-page-pilot/homepage-resource-graph.json','utf8'));
const extras=[...(srcManifest.media_assets||[]),...(srcManifest.css_dependencies||[]).map(url=>({url,role:'css'})),...(extraGraph.media_assets||[]),...m.media_assets];
const mapping=new Map(),miss=[],copied=[];
for(const entry of extras){
 let url;try{url=new URL(entry.url)}catch{continue}
 if(mapping.has(url.href))continue;
 let ext=path.extname(url.pathname).toLowerCase();
 if(!['.jpg','.jpeg','.png','.svg','.webp','.css','.gif','.ico','.avif','.woff','.woff2','.ttf','.otf','.eot'].includes(ext)&&
    ['cms.media.basworld.com','media.basworld.com'].includes(url.hostname))ext=url.searchParams.get('fmt')==='webp'?'.webp':'.jpg';
 else if(!ext&&url.hostname==='basgroup.a.bigcontent.io')ext='.png';
 if(!ext)continue;
 const id=sha(url.href).slice(0,20);
 let rel='assets/'+entry.role+'/'+id+ext;
 let src=path.join(assets,rel);
 // The source sometimes serves genuine WebP bytes behind a misleading .png URL.
 // Only accept a .webp recovery file after separately verifying its RIFF/WEBP magic.
 if(!fs.existsSync(src)&&ext==='.png'){
   const alternative=path.join(assets,'assets',entry.role,id+'.webp');
   if(fs.existsSync(alternative)){
     const b=fs.readFileSync(alternative);
     if(b.length>12&&b.toString('ascii',0,4)==='RIFF'&&b.toString('ascii',8,12)==='WEBP'){
       rel='assets/'+entry.role+'/'+id+'.webp';src=alternative;
     }
   }
 }
 const dest=path.join(out,rel);
 if(!fs.existsSync(src)||fs.statSync(src).size===0){miss.push(url.href);continue}
 fs.mkdirSync(path.dirname(dest),{recursive:true});
 if(!fs.existsSync(dest)) {fs.copyFileSync(src,dest);copied.push(rel)}
 mapping.set(url.href,'/source-mirror/'+rel);
}
const covered=new Set(routes.map(x=>new URL(x.source_url).pathname));
const approvedProduct='/vehicles/used/truck-volvo-fm-2012-euro5-70320127';
const excludedPath='/source-mirror/not-archived-product.html';
function rewriteHTML(raw,category){
 let html=raw.replace(/<script\b[^>]*>[\s\S]*?<\/script\s*>/gi,'')
  .replace(/\s+on(?:click|submit|load|error|change|input)=("[^"]*"|'[^']*')/gi,'')
  .replace(/\s+srcset=("[^"]*"|'[^']*')/gi,'')
  .replace(/<form\b[^>]*>/gi,'<form action="#" method="get" data-disabled="true">');
 for(const [orig,local] of mapping){
   html=html.split(orig.replaceAll('&','&amp;')).join(local).split(orig).join(local);
   const src=new URL(orig);
   if(src.hostname==='www.basworld.com')html=html.split(src.pathname+src.search).join(local);
 }
 const sourceOrigin='https://www.basworld.com';
 let excludedCardLinks=0;
 html=html.replace(/\bhref=(["'])([^"']+)\1/gi,(all,q,value)=>{
   if(value.startsWith('/source-mirror/'))return all;
   let url;try{url=new URL(value.replaceAll('&amp;','&'),sourceOrigin)}catch{return all}
   if(url.origin!==sourceOrigin)return all;
   if(/^\/(?:blog|insights|news|articles)\//i.test(url.pathname))return 'href="'+excludedPath+'"';
   if(/^\/vehicles\/(?:new|used)\//.test(url.pathname)){
     if(url.pathname.replace(/\/$/,'')===approvedProduct)return 'href="/source-mirror'+approvedProduct+'/"';
     excludedCardLinks++;
     return 'href="'+excludedPath+'"';
   }
   if(url.pathname.startsWith('/stock/')){
     if(covered.has(url.pathname))return 'href="/source-mirror'+url.pathname.replace(/\/$/,'')+'/"';
     return 'href="/source-mirror/outside-first-page-scope.html"';
   }
   if(url.pathname==='/')return 'href="/source-mirror/"';
   return all;
 });
 html=html.replace(/<link\b[^>]*rel=["'](?:preload|preconnect|dns-prefetch)["'][^>]*href=["']https?:\/\/[^"']+["'][^>]*>/gi,'');
 const csp='<meta http-equiv="Content-Security-Policy" content="default-src &#39;self&#39; data:; script-src &#39;self&#39;; img-src &#39;self&#39; data:; style-src &#39;self&#39; &#39;unsafe-inline&#39;; font-src &#39;self&#39; data:; connect-src &#39;none&#39;; form-action &#39;none&#39;; frame-src &#39;none&#39;; object-src &#39;none&#39;">';
 html=html.replace(/<head>/i,'<head>'+csp+'<meta name="robots" content="noindex,nofollow"><link rel="stylesheet" href="/source-mirror/bwy-listing-ui.css">');
 html=html.replace(/<\/body>/i,'<script defer src="/source-mirror/bwy-listing-ui.js"></script></body>');
 return {html,excludedCardLinks};
}
const written=[],errors=[];
for(const row of routes){
 if(row.category==='truck'){written.push({category:'truck',status:'APPROVED_FROZEN_UNCHANGED',local_path:row.local_path});continue}
 const db=JSON.parse(fs.readFileSync(path.join(root,row.category,'catalog-index.json'),'utf8'));
 if(db.pages.some(p=>p.page>1))throw Error('Page2 present in sanctioned new first-page batch '+row.category);
 const original=fs.readFileSync(row.source_file,'utf8');
 if(sha(Buffer.from(original))!==row.source_sha256)throw Error('Original HTML SHA mismatch '+row.category);
 const rendered=rewriteHTML(original,row.category);
 const dest=path.join(out,'stock',row.category,'index.html');
 fs.mkdirSync(path.dirname(dest),{recursive:true});fs.writeFileSync(dest,rendered.html,'utf8');
 const externalImgRefs=(rendered.html.match(/<img\b[^>]*\bsrc=["']https?:\/\//gi)||[]).length;
 const cardCount=db.listing_urls.length;
 const rec={category:row.category,status:externalImgRefs>0?'EXTERNAL_IMAGES_PENDING':'LOCAL_HTML_READY',
  local_path:row.local_path,source_sha256:row.source_sha256,local_sha256:sha(Buffer.from(rendered.html)),
  source_card_links:cardCount,unarchived_product_links:rendered.excludedCardLinks,
  remaining_external_img_refs:externalImgRefs,local_bytes:Buffer.byteLength(rendered.html)};
 written.push(rec);
 if(externalImgRefs)errors.push(rec.category+': '+externalImgRefs+' remote image refs');
}
for(const [name,title,note] of [
 ['not-archived-product.html','Product detail not in this scoped local backup','Only approved representative product pages were included. Other products are intentionally not copied, rather than replaced by invented content.'],
 ['outside-first-page-scope.html','Catalog page outside approved first-page backup','This route is not yet part of the verified Local first-page archive. No additional source page has been crawled.']
]){
 const html='<!doctype html><html lang="en"><meta charset="utf-8"><meta name="robots" content="noindex"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+title+'</title><style>body{font:17px Arial;max-width:720px;margin:12vh auto;padding:24px;color:#27363e}a{color:#13744d}</style><h1>'+title+'</h1><p>'+note+'</p><p><a href="/source-mirror/stock/truck/">Back to local catalog</a></p></html>';
 const dest=path.join(out,name);if(!fs.existsSync(dest))fs.writeFileSync(dest,html);
}
const report={status:errors.length?'BATCH_LOCAL_PARTIAL':'BATCH_LOCAL_HTML_READY',
 source_scope:'9 main categories page1 only',approved_baseline_sha:gate.template_sha256,
 routes:written,images_mapped:mapping.size,assets_copied:copied.length,
 firstpage_candidate_assets:m.media_assets.length,source_assets_not_saved:[...new Set(miss)],
 errors,full_scope_completed:false,next:'All 9 categories require browser per-route UAT; 176 subcategories remain separate.'};
fs.writeFileSync(path.join(root,'category-page1-local-report.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({status:report.status,pages:written.length,
 images_mapped:report.images_mapped,new_asset_copies:report.assets_copied,
 first_page_missing_asset_urls:report.source_assets_not_saved.length,
 issues:errors},null,2));
