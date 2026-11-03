#!/usr/bin/env node
/** Render verified nested catalog first pages using an already Owner-PASS template.
 * No source requests. Never rewrites approved Home/Truck/Volvo or 9 main roots.
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {enforceVisualFirst} from './visual-first-gate.mjs';
const a=n=>{const i=process.argv.indexOf('--'+n);return i<0?null:process.argv[i+1]};
const nested=a('nested'),media=a('media'),out=a('out'),approval=a('visual-approval');
if(!nested||!media||!out||![nested,media,out].every(path.isAbsolute))throw Error('Absolute --nested --media --out required');
if(!path.resolve(out).toLowerCase().endsWith('source-mirror'))throw Error('Destination must be dedicated source-mirror');
const gate=enforceVisualFirst({phase:'EXPANSION_AFTER_OWNER_PASS',approvalFile:approval,moduleId:'catalog-listings',mode:'inventory',from:1,limit:1});
if(gate.scope_mode!=='FIRST_PAGE_CATALOG')throw Error('No full product/page2 authorization');
const nm=JSON.parse(fs.readFileSync(path.join(nested,'nested-page1-media.json'),'utf8'));
if(nm.pilot_scope!=='FIRST_PAGE'||nm.source_page_numbers.some(n=>n!==1))throw Error('Out-of-scope manifest');
const srcIndex=JSON.parse(fs.readFileSync(path.join(nested,'nested-listing-index.json'),'utf8'));
const first=JSON.parse(fs.readFileSync('D:/ai/basworldy-source-archive/page1-batch/category-page1-media.json','utf8'));
const base=JSON.parse(fs.readFileSync('D:/ai/basworldy-source-archive/manifest/source-manifest.json','utf8'));
const graph=JSON.parse(fs.readFileSync('D:/ai/basworldy-source-archive/first-page-pilot/homepage-resource-graph.json','utf8'));
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const baselines={
 'index.html':'16b5652ae8687051c79b55f1f878ed121960215403c9adc52d7a725ef0518e0b',
 'stock/truck/index.html':'11706047aff57dbef25a610d9ca57d6c519e2dd957efe2491d0823972972bad6',
 'vehicles/used/truck-volvo-fm-2012-euro5-70320127/index.html':'af260fac391cf0e2288d427b1d345adc2adf43d7d80e635a4689b31c0acb2902'
};
for(const [name,digest] of Object.entries(baselines)){
 const f=path.join(out,name);
 if(!fs.existsSync(f)||sha(fs.readFileSync(f))!==digest)throw Error('Frozen Owner-approved baseline drift: '+name);
}
const allRecords=[...(base.media_assets||[]),...(base.css_dependencies||[]).map(url=>({url,role:'css'})),
 ...(graph.media_assets||[]),...(first.media_assets||[]),...(nm.media_assets||[]),...(nm.css_dependencies||[]).map(url=>({url,role:'css'}))];
const mapping=new Map(),missing=[],copied=[];
for(const entry of allRecords){
 let url;try{url=new URL(entry.url)}catch{continue}
 if(mapping.has(url.href))continue;
 let ext=path.extname(url.pathname).toLowerCase();
 if(!['.jpg','.jpeg','.png','.svg','.webp','.css','.gif','.ico','.avif','.woff','.woff2','.ttf','.otf','.eot'].includes(ext)&&
 ['cms.media.basworld.com','media.basworld.com'].includes(url.hostname))ext=url.searchParams.get('fmt')==='webp'?'.webp':'.jpg';
 else if(!ext&&url.hostname==='basgroup.a.bigcontent.io')ext='.png';
 if(!ext)continue;
 const id=sha(url.href).slice(0,20);
 let rel='assets/'+entry.role+'/'+id+ext,src=path.join(media,rel);
 if(!fs.existsSync(src)&&ext==='.png'){
  const alt=path.join(media,'assets',entry.role,id+'.webp');
  if(fs.existsSync(alt)){
   const data=fs.readFileSync(alt);
   if(data.length>12&&data.toString('ascii',0,4)==='RIFF'&&data.toString('ascii',8,12)==='WEBP'){
    rel='assets/'+entry.role+'/'+id+'.webp';src=alt;
   }
  }
 }
 if(!fs.existsSync(src)||fs.statSync(src).size<1){missing.push(url.href);continue}
 const dst=path.join(out,rel);fs.mkdirSync(path.dirname(dst),{recursive:true});
 if(!fs.existsSync(dst)){fs.copyFileSync(src,dst);copied.push(rel)}
 mapping.set(url.href,'/source-mirror/'+rel);
}
const sourceOrigin='https://www.basworld.com';
const main=new Set(first.first_page_source_routes.map(x=>new URL(x.source_url).pathname.replace(/\/$/,'')));
const nestedRoutes=nm.verified_source_routes;
const covered=new Set([...main,...nestedRoutes.map(x=>new URL(x.source_url).pathname.replace(/\/$/,''))]);
let normalized=[];
const localOut=[],issues=[];
function linkRewrite(value,meta){
 if(/^javascript:/i.test(value))return '#';
 if(value.startsWith('#')||value.startsWith('?')||/^(?:mailto:|tel:)/i.test(value))return value;
 if(value.startsWith('/source-mirror/'))return value;
 let u;try{u=new URL(value.replaceAll('&amp;','&'),sourceOrigin)}catch{return value}
 if(u.origin!==sourceOrigin)return value;
 if(/^\/(?:blog|insights|news|articles)\//i.test(u.pathname))return '/source-mirror/outside-first-page-scope.html';
 if(/^\/vehicles\/(?:new|used)\//.test(u.pathname)){
  if(u.pathname.replace(/\/$/,'')==='/vehicles/used/truck-volvo-fm-2012-euro5-70320127')
   return '/source-mirror/vehicles/used/truck-volvo-fm-2012-euro5-70320127/';
  meta.excludedProducts++;
  return '/source-mirror/not-archived-product.html';
 }
 if(u.pathname.startsWith('/stock/')){
  if(covered.has(u.pathname.replace(/\/$/,'')))return '/source-mirror'+u.pathname.replace(/\/$/,'')+'/';
  meta.notArchivedCatalogLinks++;
  return '/source-mirror/outside-first-page-scope.html';
 }
 if(u.pathname==='/')return '/source-mirror/';
 return value;
}
for(const row of nestedRoutes){
 const u=new URL(row.source_url);
 const decodedPath=decodeURI(u.pathname);
 const segments=decodedPath.split('/').filter(Boolean);
 if(segments[0]!=='stock'||segments.length<3||
    segments.some(v=>v==='.'||v==='..'||!/^[-_\p{L}\p{N}]+$/u.test(v)))
   throw Error('Unsafe/unsupported local nested path: '+decodedPath);
 const normalizedRoute=segments.join('/');
 if(!srcIndex.all_source_paths.includes(decodedPath) &&
    !srcIndex.all_source_paths.includes(u.pathname))throw Error('Page was not present in original approved homepage');
 const source=path.join(nested,row.file_path),buff=fs.readFileSync(source);
 if(sha(buff)!==row.sha256)throw Error('Source snapshot hash mismatch '+row.source_url);
 let html=buff.toString('utf8'),meta={excludedProducts:0,notArchivedCatalogLinks:0};
 html=html.replace(/<script\b[^>]*>[\s\S]*?<\/script\s*>/gi,'')
  .replace(/\s+on(?:click|submit|load|error|change|input)=("[^"]*"|'[^']*')/gi,'')
  .replace(/\s+srcset=("[^"]*"|'[^']*')/gi,'')
  .replace(/<form\b[^>]*>/gi,'<form action="#" method="get" data-disabled="true">');
 for(const [original,local] of mapping){
  html=html.split(original.replaceAll('&','&amp;')).join(local).split(original).join(local);
  const o=new URL(original);
  if(o.hostname==='www.basworld.com')html=html.split(o.pathname+o.search).join(local);
 }
 html=html.replace(/\bhref=(["'])([^"']+)\1/gi,(_,q,v)=>'href="'+linkRewrite(v,meta)+'"');
 html=html.replace(/<link\b[^>]*rel=["'](?:preload|preconnect|dns-prefetch)["'][^>]*href=["']https?:\/\/[^"']+["'][^>]*>/gi,'');
 const csp='<meta http-equiv="Content-Security-Policy" content="default-src &#39;self&#39; data:; script-src &#39;self&#39;; img-src &#39;self&#39; data:; style-src &#39;self&#39; &#39;unsafe-inline&#39;; font-src &#39;self&#39; data:; connect-src &#39;none&#39;; form-action &#39;none&#39;; frame-src &#39;none&#39;; object-src &#39;none&#39;">';
 html=html.replace(/<head>/i,'<head>'+csp+'<meta name="robots" content="noindex,nofollow"><link rel="stylesheet" href="/source-mirror/bwy-listing-ui.css">');
 html=html.replace(/<\/body>/i,'<script defer src="/source-mirror/bwy-listing-ui.js"></script></body>');
 const dest=path.join(out,normalizedRoute,'index.html');fs.mkdirSync(path.dirname(dest),{recursive:true});fs.writeFileSync(dest,html);
 const externalImgs=(html.match(/<img\b[^>]*\bsrc=["']https?:\/\//gi)||[]).length;
 const brokenCss=(html.match(/<link\b[^>]*rel=["']stylesheet["'][^>]*href=["']\/_next\//gi)||[]).length;
 const report={path:u.pathname,source_sha256:row.sha256,local_sha256:sha(Buffer.from(html)),
  local_url:'/source-mirror/'+normalizedRoute+'/',byte_count:Buffer.byteLength(html),
  source_cards:row.product_card_urls,remaining_external_img_src:externalImgs,
  unresolved_stylesheets:brokenCss,excluded_product_links:meta.excludedProducts,
  not_archived_listing_links:meta.notArchivedCatalogLinks,
  status:externalImgs||brokenCss?'RESOURCE_AUDIT_OPEN':'HTML_RESOURCE_MAPPING_PASS'};
 localOut.push(report);if(externalImgs||brokenCss)issues.push(report.path);
}
const summary={status:issues.length?'NESTED_BATCH_VISUAL_UAT_REQUIRED':'NESTED_BATCH_HTML_READY',
 source_pages:index.all_source_paths.length,archived_sources:nestedRoutes.length,
 files_rendered:localOut.length,external_img_issues:issues.length,remaining_missing_source_assets:[...new Set(missing)],
 asset_map_entries:mapping.size,new_asset_copies:copied.length,remaining_source_failures:srcIndex.records.filter(x=>x.status!=='SAVED'),
 scope:'First page only; no blogs; no bulk product detail',owner_visual_gate:'CATALOG_LISTINGS_PASS',
 pages:localOut,final_module_acceptance:false};
fs.writeFileSync(path.join(nested,'nested-local-report.json'),JSON.stringify(summary,null,2)+'\n');
console.log(JSON.stringify({status:summary.status,source_saved:nestedRoutes.length,
 out_pages:localOut.length,remote_img_issues:issues.length,unresolved_source_files:summary.remaining_source_failures.length,
 asset_url_mapped:mapping.size,new_asset_copies:copied.length},null,2));
