#!/usr/bin/env node
/** R4/R5: render *captured original* HTML into isolated LocalWP archive, preserving
 * original source copies and all confirmed media bytes. Adds separate local-only
 * inventory and source-photo gallery utilities. No original third-party JS executes.
 */
import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';
const a=n=>{const i=process.argv.indexOf('--'+n);return i<0?null:process.argv[i+1];};
const indexFile=a('index'),out=a('out'),assets=a('assets');
if(!indexFile||!out||!assets||!a('home')||!a('page1')||!a('page2')||!a('seed-manifest')||!a('page-assets'))throw Error('Require --index --out --assets --home --page1 --page2 --seed-manifest --page-assets');
if(!path.isAbsolute(out)||!path.resolve(out).toLowerCase().endsWith('source-mirror-r2'))throw Error('Output must be isolated absolute source-mirror-r2 directory');
const origin='https://www.basworld.com',local='/source-mirror-r2/';
const db=JSON.parse(fs.readFileSync(indexFile,'utf8'));
const globalIndexPath=a('all-index');const allDb=globalIndexPath&&fs.existsSync(globalIndexPath)?JSON.parse(fs.readFileSync(globalIndexPath,'utf8')):null;
if(allDb&&allDb.catalog_scope_category!=='all')throw Error('Expected all-category source index');
if(db.source_origin!==origin)throw Error('Unexpected source');
const seeds=JSON.parse(fs.readFileSync(a('seed-manifest'),'utf8')),pageMedia=JSON.parse(fs.readFileSync(a('page-assets'),'utf8'));
const mediaManifest=a('media-queue')?JSON.parse(fs.readFileSync(a('media-queue'),'utf8')):{media_assets:[]};
const media=[...seeds.media_assets,...pageMedia.media_assets,...mediaManifest.media_assets,...seeds.css_dependencies.map(url=>({url,role:'css'}))];
const sha=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
const destPaths=new Map(),assetStatuses=[],seen=new Set();
fs.mkdirSync(out,{recursive:true});
for(const item of media){
 if(seen.has(item.url))continue;seen.add(item.url);
 let u;try{u=new URL(item.url)}catch{continue;}
 let ext=path.extname(u.pathname).toLowerCase();
 if(!['.png','.jpg','.jpeg','.webp','.svg','.css'].includes(ext)&&['cms.media.basworld.com','media.basworld.com'].includes(u.hostname))ext=u.searchParams.get('fmt')==='webp'?'.webp':'.jpg';
 const id=sha(Buffer.from(u.href)).slice(0,20);
 const rel=path.join('assets',item.role,id+ext),src=path.join(assets,rel),dest=path.join(out,rel);
 if(!fs.existsSync(src)||!fs.statSync(src).size){assetStatuses.push({source:item.url,role:item.role,state:'MISSING'});continue;}
 fs.mkdirSync(path.dirname(dest),{recursive:true});
 if(!fs.existsSync(dest)||fs.statSync(dest).size!==fs.statSync(src).size)fs.copyFileSync(src,dest);
 const localUrl=local+rel.replaceAll('\\','/');
 destPaths.set(item.url,localUrl);
 if(u.hostname==='www.basworld.com')destPaths.set(u.pathname+u.search,localUrl);
 assetStatuses.push({source:item.url,role:item.role,state:'SAVED',bytes:fs.statSync(src).size,sha256:sha(fs.readFileSync(src))});
}
const sourcePages=[];
function add(url,file){if(!file||!fs.existsSync(file))return;let u=new URL(url);if(u.hostname!=='www.basworld.com')throw Error('URL outside original domain');sourcePages.push({source_url:url,file});}
add(origin+'/',a('home'));
add(origin+'/stock/truck',a('page1'));
add(origin+'/stock/truck?page=2',a('page2'));
for(const p of db.pages||[])if(p.valid&&fs.existsSync(path.join(path.dirname(indexFile),p.path)))add(p.url,path.join(path.dirname(indexFile),p.path));
if(allDb)for(const p of allDb.pages||[])if(p.valid&&fs.existsSync(path.join(path.dirname(globalIndexPath),p.path)))add(p.url,path.join(path.dirname(globalIndexPath),p.path));
for(const p of db.product_details||[])if(p.source_record?.valid&&fs.existsSync(path.join(path.dirname(indexFile),p.source_record.path)))add(p.canonical_url||p.source_url,path.join(path.dirname(indexFile),p.source_record.path));
const pageRoute=url=>{
 const u=new URL(url,origin);
 if(u.pathname==='/'&&!u.search)return local;
 if(u.pathname==='/stock/all'){const n=Number(u.searchParams.get('page')||1);return local+'stock/all/'+(n===1?'':'page-'+n+'/');}
 if(u.pathname==='/stock/truck'){
  const n=Number(u.searchParams.get('page')||1);
  return local+'stock/truck/'+(n===1?'':'page-'+n+'/');
 }
 if(/^\/vehicles\/(new|used)\//.test(u.pathname))return local+u.pathname.replace(/^\//,'').replace(/\/?$/,'/');
 return local+'unarchived.html?path='+encodeURIComponent(u.pathname+u.search);
};
const captured=new Set(sourcePages.map(p=>pageRoute(p.source_url)));
const aliases=new Map();
for(const p of db.product_details||[]){
 aliases.set(p.source_url,pageRoute(p.canonical_url||p.source_url));
 if(p.canonical_url)aliases.set(p.canonical_url,pageRoute(p.canonical_url));
}
const csp="<meta http-equiv=\"Content-Security-Policy\" content=\"default-src 'self' data:; script-src 'self'; img-src 'self' data: blob:; style-src 'self' 'unsafe-inline'; font-src 'self' data:; connect-src 'none'; frame-src 'none'; form-action 'none'; object-src 'none';\">";
const noindex='<meta name="robots" content="noindex,nofollow"><meta name="bwy-archive" content="AUTHENTIC_SOURCE_PARTIAL_READ_ONLY">';
function linksRewrite(html){
 return html.replace(/\bhref=(["'])([^"']+)\1/gi,(full,quote,raw)=>{
  const link=raw.replaceAll('&amp;','&');if(link.startsWith(local)||link.startsWith('#')||link.startsWith('mailto:')||link.startsWith('tel:'))return full;
  let u;try{u=new URL(link,origin)}catch{return full;}
  if(!['http:','https:'].includes(u.protocol))return full;
  if(u.hostname!=='www.basworld.com')return 'href='+quote+local+'unarchived.html?external=1'+quote;
  const routed=aliases.get(u.href)||pageRoute(u.href);
  if(routed.startsWith(local+'assets/'))return full;
  if(u.pathname.startsWith('/_next/'))return full;
  return 'href='+quote+(captured.has(routed)?routed:local+'unarchived.html?path='+encodeURIComponent(u.pathname+u.search))+quote;
 });
}
function patch(raw){
 let s=raw
 .replace(/<script\b[^>]*>[\s\S]*?<\/script\s*>/gi,'')
 .replace(/<iframe\b[^>]*>[\s\S]*?<\/iframe\s*>/gi,'')
 .replace(/\s+on(?:click|submit|load|error|change|input)=("[^"]*"|'[^']*')/gi,'')
 .replace(/\s+srcset=("[^"]*"|'[^']*')/gi,'')
 .replace(/<form\b[^>]*>/gi,'<form action="#" method="get" data-disabled="true">')
 .replace(/<link\b[^>]*(?:rel=["'](?:preconnect|dns-prefetch|preload)["'])[^>]*>/gi,'');
 for(const [url,dest] of [...destPaths].sort((a,b)=>b[0].length-a[0].length)){
  s=s.split(url.replaceAll('&','&amp;')).join(dest).split(url).join(dest);
 }
 s=linksRewrite(s).replace(/<head>/i,'<head>'+csp+noindex);
 return s;
}
const reports=[];
for(const p of sourcePages){
 const route=pageRoute(p.source_url);if(!captured.has(route))continue;
 const folder=path.join(out,route.slice(local.length));
 const file=path.join(folder,'index.html');fs.mkdirSync(folder,{recursive:true});
 const raw=fs.readFileSync(p.file,'utf8');const html=patch(raw);
 fs.writeFileSync(file,html,'utf8');
 reports.push({source_url:p.source_url,route,bytes:Buffer.byteLength(html),original_sha256:sha(fs.readFileSync(p.file)),local_file:file});
}
const inventory=JSON.stringify((db.product_details||[]).map(p=>({sku:p.sku,name:p.name,brand:p.brand,year:p.year,price:p.price,currency:p.currency,route:aliases.get(p.canonical_url)||pageRoute(p.canonical_url||p.source_url),gallery_urls:p.images?.length||0,images_persisted:(p.images||[]).filter(u=>destPaths.has(u)).length})));
const style='body{font-family:system-ui,Arial,sans-serif;margin:0;color:#152b3b;background:#f4f6f7}header{background:#12344b;color:white;padding:28px}main{max-width:1200px;margin:auto;padding:25px}input,select{padding:12px;border:1px solid #cbd4db;border-radius:6px}.cards{display:grid;grid-template-columns:repeat(auto-fill,minmax(290px,1fr));gap:14px;margin-top:18px}.card{background:white;border:1px solid #e1e5e8;padding:18px;border-radius:8px}.card b{display:block;font-size:16px}.card small{display:block;margin:7px 0;color:#657483}.card a{color:#14517d;font-weight:bold}.warning{padding:12px;background:#fff2d5;color:#6a4812}';
const indexHTML='<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'+csp+noindex+'<title>Local Source Archive — Captured Vehicles Only</title><style>'+style+'</style></head><body><header><h1>Source archive / captured products</h1><p>Local, original data only. A partial archive; not the full BAS World inventory.</p></header><main><div class="warning">Only captured real product details are listed here. Missing products remain unarchived.</div><p><input id="q" type="search" placeholder="Search model, brand or SKU"> <select id="brand"><option value="">All captured brands</option></select> <span id="count"></span></p><div class="cards" id="cards"></div></main><script src="'+local+'inventory.js"></script></body></html>';
fs.writeFileSync(path.join(out,'inventory.html'),indexHTML);
fs.writeFileSync(path.join(out,'inventory-data.json'),inventory);
const navJs="const raw="+inventory+";const list=document.querySelector('#cards'),q=document.querySelector('#q'),brand=document.querySelector('#brand'),count=document.querySelector('#count');const brands=[...new Set(raw.map(x=>x.brand).filter(Boolean))].sort();for(const b of brands){const o=document.createElement('option');o.value=b;o.textContent=b;brand.append(o)}function render(){list.replaceChildren();const term=q.value.toLowerCase();const rows=raw.filter(p=>(!brand.value||p.brand===brand.value)&&[p.sku,p.name,p.brand].join(' ').toLowerCase().includes(term));count.textContent=rows.length+' captured records';for(const p of rows){const d=document.createElement('div');d.className='card';const b=document.createElement('b');b.textContent=p.name;d.append(b);const t=document.createElement('small');t.textContent='SKU '+p.sku+' | '+(p.year||'?')+' | '+p.images_persisted+'/'+p.gallery_urls+' gallery URLs stored';d.append(t);const a=document.createElement('a');a.href=p.route;a.textContent='Open authentic source snapshot';d.append(a);list.append(d)}}q.addEventListener('input',render);brand.addEventListener('change',render);render();";
fs.writeFileSync(path.join(out,'inventory.js'),navJs);
const miss='<!doctype html><html><head><meta charset="utf-8">'+csp+noindex+'<title>Not archived yet</title><style>'+style+'</style></head><body><header><h1>Not archived yet</h1></header><main><div class="warning">This exact source URL has not been saved. No placeholder item will be invented.</div><p><a href="'+local+'inventory.html">Browse captured products</a></p></main></body></html>';
fs.writeFileSync(path.join(out,'unarchived.html'),miss);
const report={status:'SOURCE_HTML_LOCAL_REPLAY_PARTIAL',started:new Date().toISOString(),pages_saved:reports.length,sku_count:(db.product_details||[]).length,list_urls:db.listing_urls.length,all_category_listed_urls:allDb?.listing_urls.length??null,assets_saved:assetStatuses.filter(x=>x.state==='SAVED').length,assets_missing:assetStatuses.filter(x=>x.state==='MISSING').length,route_reports:reports,root_out:out,source_files_immutable:true,external_scripts_disabled:true,external_forms_disabled:true,all_products_archived:false};
fs.writeFileSync(path.join(out,'replay-report.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({status:report.status,pages:report.pages_saved,products:report.sku_count,urls:report.list_urls,assets:report.assets_saved,missing:report.assets_missing,entry:local+'inventory.html'}));
