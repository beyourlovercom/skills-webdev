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
const htmlSources={'index.html':fs.readFileSync(home,'utf8'),'stock/truck/index.html':fs.readFileSync(listing,'utf8')};
const detailCanonical=new URL(manifest.source_detail_products[0].canonical_url).pathname.replace(/^\//,'');
htmlSources[detailCanonical+'/index.html']=fs.readFileSync(detail,'utf8');
const all=[...manifest.media_assets,...manifest.css_dependencies.map(url=>({url,role:'css'}))];
const mapped=new Map(),unavailable=[];
fs.mkdirSync(out,{recursive:true});
for(const a of all){
 const u=new URL(a.url);
 const ext=path.extname(u.pathname).toLowerCase();
 const id=crypto.createHash('sha256').update(u.href).digest('hex').slice(0,20);
 const rel='assets/'+a.role+'/'+id+ext;
 const src=path.join(assetsPath,rel),dst=path.join(out,rel);
 if(!fs.existsSync(src)){unavailable.push(a.url);continue;}
 fs.mkdirSync(path.dirname(dst),{recursive:true});
 if(!fs.existsSync(dst)||fs.statSync(dst).size!==fs.statSync(src).size)fs.copyFileSync(src,dst);
 mapped.set(a.url,'/source-mirror/'+rel);
}
const canonicalPath='/'+detailCanonical;
const shortUrl=manifest.listed_vehicle_urls.find(u=>u.includes(String(manifest.source_detail_products[0].sku)));
const sourceRoutes=[
 ['/stock/truck','/source-mirror/stock/truck/'],
 [canonicalPath,'/source-mirror/'+detailCanonical+'/']
];
if(shortUrl)sourceRoutes.push([new URL(shortUrl).pathname,'/source-mirror/'+detailCanonical+'/']);
const csp='<meta http-equiv="Content-Security-Policy" content="default-src &#39;self&#39; data:; script-src &#39;none&#39;; img-src &#39;self&#39; data:; style-src &#39;self&#39; &#39;unsafe-inline&#39;; font-src &#39;self&#39; data:; connect-src &#39;none&#39;; form-action &#39;none&#39;; frame-src &#39;none&#39;; object-src &#39;none&#39;">';
const meta='<meta name="robots" content="noindex,nofollow"><meta name="bwy-snapshot" content="PARTIAL_STATIC_READ_ONLY">';
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
 html=html.replace(/<\/head>/i,csp+meta+'</head>');
 const dest=path.join(out,rel);fs.mkdirSync(path.dirname(dest),{recursive:true});fs.writeFileSync(dest,html,'utf8');
 fileReports.push({path:rel,bytes:Buffer.byteLength(html),authentic_html_sha256:crypto.createHash('sha256').update(raw).digest('hex')});
}
const report={status:'PARTIAL_REAL_SOURCE_REPLAY',pages:fileReports,source_listed_vehicle_count:manifest.listed_vehicle_urls.length,
 source_product_sku:manifest.source_detail_products[0].sku,original_gallery_count:manifest.source_detail_products[0].gallery.length,
 locally_saved_asset_count:mapped.size,missing_manifest_assets:unavailable.length,missing_sample:unavailable.slice(0,5),
 scripts_executed:false,forms_enabled:false,remote_network_allowed:false,full_coverage_verified:false};
fs.writeFileSync(path.join(out,'source-mirror-report.json'),JSON.stringify(report,null,2)+'\n','utf8');
console.log(JSON.stringify({status:report.status,pages:fileReports.length,assets:mapped.size,missing:unavailable.length,output:out},null,2));
