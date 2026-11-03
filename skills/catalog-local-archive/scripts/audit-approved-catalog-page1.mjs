#!/usr/bin/env node
/** Auditable first-page-only non-Blog catalog completeness for BASWORLDY Local. */
import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';
const a=n=>{const i=process.argv.indexOf('--'+n);return i<0?null:process.argv[i+1]};
const root=a('root'),local=a('local');
if(!root||!local||!path.isAbsolute(root)||!path.isAbsolute(local))throw Error('Require --root --local absolute');
const main=JSON.parse(fs.readFileSync(path.join(root,'category-page1-local-report.json'),'utf8'));
const nestedIdx=JSON.parse(fs.readFileSync(path.join(root,'nested/nested-listing-index.json'),'utf8'));
const nested=JSON.parse(fs.readFileSync(path.join(root,'nested/nested-local-report.json'),'utf8'));
const mediaMain=JSON.parse(fs.readFileSync(path.join(root,'category-page1-media.json'),'utf8'));
const mediaNested=JSON.parse(fs.readFileSync(path.join(root,'nested/nested-page1-media.json'),'utf8'));
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const mainPaths=main.routes.map(x=>({name:'/stock/'+x.category,
 dir:path.join(local,'stock',x.category),status:x.status,expected:x.local_sha256||null}));
const nestPaths=nested.pages.map(x=>({name:x.path,
 dir:path.join(local,decodeURI(x.path).replace(/^\/|\/$/g,'')),status:x.status,expected:x.local_sha256||null}));
const all=[...mainPaths,...nestPaths],pageIssues=[],sources=[];
for(const x of all){
 const p=path.join(x.dir,'index.html');
 if(!fs.existsSync(p)){pageIssues.push({path:x.name,type:'LOCAL_HTML_MISSING'});continue}
 const html=fs.readFileSync(p,'utf8');
 if(x.expected&&hash(Buffer.from(html))!==x.expected){pageIssues.push({path:x.name,type:'LOCAL_HTML_CHANGED'});continue}
 if(!/<html\b/i.test(html)||html.length<5000)pageIssues.push({path:x.name,type:'INVALID_SOURCE_PAGE_HTML'});
 if(/<script\b[^>]*src=["']https?:\/\//i.test(html))pageIssues.push({path:x.name,type:'REMOTE_SCRIPT_PRESENT'});
 for(const m of html.matchAll(/<(?:img|link)\b[^>]*\b(?:src|href)=["'](\/source-mirror\/assets\/[^"']+)["']/gi)){
  const file=path.join(local,m[1].slice('/source-mirror/'.length).split('?')[0]);
  if(!fs.existsSync(file))pageIssues.push({path:x.name,type:'LOCAL_ASSET_MISSING',file:m[1]});
 }
 for(const m of html.matchAll(/<img\b[^>]*\bsrc=["'](https?:\/\/[^"']+)["']/gi))
  pageIssues.push({path:x.name,type:'EXTERNAL_IMG_NOT_LOCALIZED',url:m[1]});
 for(const m of html.matchAll(/<link\b[^>]*rel=["']stylesheet["'][^>]*href=["'](\/_next\/[^"']+)["']/gi))
  pageIssues.push({path:x.name,type:'UNMAPPED_CSS',url:m[1]});
}
const sourceFailures=nestedIdx.records.filter(x=>x.status!=='SAVED').map(x=>({path:x.source_path,http:x.http_status,status:x.status}));
const unique=new Map([...mediaMain.media_assets,...mediaNested.media_assets].map(x=>[x.url,x]));
const assetsMissing=[];
for(const x of unique.values()){
 const u=new URL(x.url);let ext=path.extname(u.pathname).toLowerCase();
 if(!['.jpg','.jpeg','.png','.svg','.webp','.css','.gif','.ico','.avif','.woff','.woff2','.ttf','.otf','.eot'].includes(ext)&&
 ['media.basworld.com','cms.media.basworld.com'].includes(u.hostname))ext=u.searchParams.get('fmt')==='webp'?'.webp':'.jpg';
 else if(!ext&&u.hostname==='basgroup.a.bigcontent.io')ext='.png';
 const id=hash(Buffer.from(u.href)).slice(0,20);
 const old=path.join(local,'assets','page_image',id+ext);
 const correction=path.join(local,'assets','page_image',id+'.webp');
 if(!fs.existsSync(old)&&!(ext==='.png'&&fs.existsSync(correction)))assetsMissing.push(x.url);
}
const q={status:pageIssues.length||assetsMissing.length?'FIRST_PAGE_CATALOG_QA_FAIL':'FIRST_PAGE_CATALOG_QA_READY_WITH_SOURCE_EXCEPTIONS',
 scope:'9 major listing first pages + 176 linked nested first pages. Blog and all-product details excluded.',
 inspected_at:new Date().toISOString(),
 intended_source_routes:mainPaths.length+nestedIdx.all_source_paths.length,
 main_routes:mainPaths.length,nested_expected:nestedIdx.all_source_paths.length,
 nested_captured:nestedIdx.records.filter(x=>x.status==='SAVED').length,
 local_pages:all.length,source_failures:sourceFailures,
 source_failures_count:sourceFailures.length,
 unique_expected_firstpage_media:unique.size,missing_media:assetsMissing.length,
 missing_media_sample:assetsMissing.slice(0,20),local_page_issues:pageIssues,
 local_page_issue_count:pageIssues.length,
 owner_approved_template_baselines:['HOME','CATALOG_LISTINGS','PRODUCT_DETAILS'],
 owner_final_local_acceptance:'OPEN',next_module:'CONTENT_SERVICES_AFTER_CATALOG_UAT'};
fs.writeFileSync(path.join(root,'catalog-page1-completeness.json'),JSON.stringify(q,null,2)+'\n');
console.log(JSON.stringify({status:q.status,source_routes:q.intended_source_routes,local_pages:q.local_pages,
 source_404_or_failed:q.source_failures_count,unique_media:q.unique_expected_firstpage_media,
 missing_media:q.missing_media,local_page_issues:q.local_page_issue_count},null,2));
process.exit(q.status==='FIRST_PAGE_CATALOG_QA_FAIL'?3:0);
