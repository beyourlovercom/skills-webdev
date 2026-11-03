#!/usr/bin/env node
// Replay captured authentic HTML/asset bytes in /source-mirror on LocalWP.
// Network scripts, forms and third-party requests are blocked: STATIC PARTIAL.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
const arg=n=>{const i=process.argv.indexOf('--'+n);return i===-1?null:process.argv[i+1];};
const home=arg('home'),listing=arg('listing'),detail=arg('detail');
const manifestPath=arg('manifest'),assetsPath=arg('assets'),out=arg('out');
if(!home||!listing||!detail||!manifestPath||!assetsPath||!out)throw Error('Missing required arguments');
if(!path.isAbsolute(out)||!path.resolve(out).toLowerCase().endsWith('source-mirror'))throw Error('Output must be an absolute dedicated source-mirror directory');
const manifest=JSON.parse(fs.readFileSync(manifestPath,'utf8'));
const manifest2=arg('manifest2')?JSON.parse(fs.readFileSync(arg('manifest2'),'utf8')):null;
if(manifest2&&(!arg('listing2')||!arg('detail2')))throw Error('Second manifest requires --listing2 and --detail2');
const htmlSources={'index.html':fs.readFileSync(home,'utf8'),'stock/truck/index.html':fs.readFileSync(listing,'utf8')};
const detailCanonical=new URL(manifest.source_detail_products[0].canonical_url).pathname.replace(/^\//,'');
htmlSources[detailCanonical+'/index.html']=fs.readFileSync(detail,'utf8');
let canonical2=null;
if(manifest2){canonical2=new URL(manifest2.source_detail_products[0].canonical_url).pathname.replace(/^\//,'');
 htmlSources['stock/truck/page-2/index.html']=fs.readFileSync(arg('listing2'),'utf8');
 htmlSources[canonical2+'/index.html']=fs.readFileSync(arg('detail2'),'utf8');
}
const extra=arg('resources')?JSON.parse(fs.readFileSync(arg('resources'),'utf8')).media_assets:[];
const firstPageGraph=arg('first-page-resources')?JSON.parse(fs.readFileSync(arg('first-page-resources'),'utf8')):null;
if(firstPageGraph&&(firstPageGraph.pilot_scope!=='FIRST_PAGE'||firstPageGraph.source_page_numbers?.some(x=>x!==1)))throw Error('First page asset graph must be scoped to page 1');
const all=[...manifest.media_assets,...(manifest2?.media_assets||[]),...extra,...(firstPageGraph?.media_assets||[]),...manifest.css_dependencies.map(url=>({url,role:'css'}))];
const mapped=new Map(),unavailable=[];
fs.mkdirSync(out,{recursive:true});
for(const a of all){
 const u=new URL(a.url);
 let ext=path.extname(u.pathname).toLowerCase();
 if(!['.jpg','.jpeg','.png','.svg','.webp','.css'].includes(ext)&&['cms.media.basworld.com','media.basworld.com'].includes(u.hostname)){ext=u.searchParams.get('fmt')==='webp'?'.webp':'.jpg';}
 const id=crypto.createHash('sha256').update(u.href).digest('hex').slice(0,20);
 const rel='assets/'+a.role+'/'+id+ext;
 const src=path.join(assetsPath,rel),dst=path.join(out,rel);
 if(!fs.existsSync(src)){unavailable.push(a.url);continue;}
 fs.mkdirSync(path.dirname(dst),{recursive:true});
 if(a.role==='css'||!fs.existsSync(dst)||fs.statSync(dst).size!==fs.statSync(src).size)fs.copyFileSync(src,dst);
 mapped.set(a.url,'/source-mirror/'+rel);
}

// CSS font and background URLs must also be localized; HTML-only replacements miss them.
const cssDir=path.join(out,'assets','css');
if(fs.existsSync(cssDir))for(const file of fs.readdirSync(cssDir)){
 if(!file.endsWith('.css'))continue;
 const dest=path.join(cssDir,file);
 const css=fs.readFileSync(dest,'utf8');
 const fixed=css.replace(/url\(\s*(["']?)([^)"']+)\1\s*\)/g,(whole,q,raw)=>{
  if(raw.startsWith('data:')||raw.startsWith('#'))return whole;
  let url;try{url=new URL(raw,'https://www.basworld.com').href}catch{return whole;}
  const target=mapped.get(url);
  return target?'url("'+target+'")':whole;
 });
 if(fixed!==css)fs.writeFileSync(dest,fixed,'utf8');
}

const canonicalPath='/'+detailCanonical;
const shortUrl=manifest.listed_vehicle_urls.find(u=>u.includes(String(manifest.source_detail_products[0].sku)));
const sourceRoutes=[
 ['/stock/truck','/source-mirror/stock/truck/'],
 [canonicalPath,'/source-mirror/'+detailCanonical+'/']
];
if(shortUrl)sourceRoutes.push([new URL(shortUrl).pathname,'/source-mirror/'+detailCanonical+'/']);
if(manifest2){
 sourceRoutes.push(['/stock/truck?page=2','/source-mirror/stock/truck/page-2/']);
 sourceRoutes.push(['/'+canonical2,'/source-mirror/'+canonical2+'/']);
 const short2=manifest2.listed_vehicle_urls.find(u=>u.includes(String(manifest2.source_detail_products[0].sku)));
 if(short2)sourceRoutes.push([new URL(short2).pathname,'/source-mirror/'+canonical2+'/']);
}
const csp='<meta http-equiv="Content-Security-Policy" content="default-src &#39;self&#39; data:; script-src &#39;self&#39;; img-src &#39;self&#39; data:; style-src &#39;self&#39; &#39;unsafe-inline&#39;; font-src &#39;self&#39; data:; connect-src &#39;none&#39;; form-action &#39;none&#39;; frame-src &#39;none&#39;; object-src &#39;none&#39;">';
const meta='<meta name="robots" content="noindex,nofollow"><meta name="bwy-snapshot" content="PARTIAL_STATIC_READ_ONLY">';
const enableUI=arg('ui-adapter')==='true';
if(enableUI){for(const f of ['bwy-first-page-ui.js','bwy-first-page-ui.css'])fs.copyFileSync(path.join(path.dirname(new URL(import.meta.url).pathname.replace(/^\/(?:[A-Za-z]:)/,m=>m.slice(1))),f),path.join(out,f));}
const fileReports=[];
for(const [rel,raw] of Object.entries(htmlSources)){
 let html=raw.replace(/<script\b[^>]*>[\s\S]*?<\/script\s*>/gi,'')
 .replace(/\s+on(?:click|submit|load|error|change|input)=("[^"]*"|'[^']*')/gi,'')
 .replace(/\s+srcset=("[^"]*"|'[^']*')/gi,'')
 .replace(/<form\b[^>]*>/gi,'<form action="#" method="get" data-disabled="true">');
 for(const [url,local] of mapped){
  html=html.split(url.replaceAll('&','&amp;')).join(local).split(url).join(local);
  const u=new URL(url);
  if(u.hostname==='www.basworld.com')html=html.split(u.pathname+u.search).join(local);
 }
 for(const [src,dst] of sourceRoutes){
  html=html.split('href="'+src+'"').join('href="'+dst+'"').split("href='"+src+"'").join("href='"+dst+"'");
 }
 html=html.replace(/<link\b[^>]*rel=["'](?:preload|preconnect|dns-prefetch)["'][^>]*href=["']https?:\/\/[^"']+["'][^>]*>/gi,'');
 html=html.replace(/<head>/i,'<head>'+csp+meta+(enableUI&&rel==='index.html'?'<link rel="stylesheet" href="/source-mirror/bwy-first-page-ui.css">':''));
 if(enableUI&&rel==='index.html')html=html.replace(/<\/body>/i,'<script defer src="/source-mirror/bwy-first-page-ui.js"></script></body>');
 const dest=path.join(out,rel);fs.mkdirSync(path.dirname(dest),{recursive:true});fs.writeFileSync(dest,html,'utf8');
 fileReports.push({path:rel,bytes:Buffer.byteLength(html),authentic_html_sha256:crypto.createHash('sha256').update(raw).digest('hex')});
}
const report={status:'PARTIAL_REAL_SOURCE_REPLAY',pages:fileReports,source_listed_vehicle_count:new Set([...manifest.listed_vehicle_urls,...(manifest2?.listed_vehicle_urls||[])]).size,
 source_product_skus:[manifest.source_detail_products[0].sku,...(manifest2?[manifest2.source_detail_products[0].sku]:[])],original_gallery_count:manifest.source_detail_products[0].gallery.length,
 locally_saved_asset_count:mapped.size,missing_manifest_assets:unavailable.length,missing_sample:unavailable.slice(0,5),
 scripts_executed:false,forms_enabled:false,remote_network_allowed:false,full_coverage_verified:false};
fs.writeFileSync(path.join(out,'source-mirror-report.json'),JSON.stringify(report,null,2)+'\n','utf8');
console.log(JSON.stringify({status:report.status,pages:fileReports.length,assets:mapped.size,missing:unavailable.length,output:out},null,2));
