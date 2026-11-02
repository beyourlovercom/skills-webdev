#!/usr/bin/env node
// Source-exact completeness audit. Never guesses missing inventory totals.
import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';
const a=n=>{const i=process.argv.indexOf('--'+n);return i===-1?null:process.argv[i+1];};
const manifestPath=a('manifest'),pagePath=a('resources'),assetsPath=a('assets'),mirrorPath=a('mirror');
if(!manifestPath||!pagePath||!assetsPath||!mirrorPath)throw Error('Missing --manifest --resources --assets --mirror');
const m=JSON.parse(fs.readFileSync(manifestPath,'utf8')),extra=JSON.parse(fs.readFileSync(pagePath,'utf8'));
const file=(role,url)=>{const u=new URL(url);let ext=path.extname(u.pathname).toLowerCase();
 if(!['.jpg','.jpeg','.webp','.png','.svg','.css'].includes(ext)&&['cms.media.basworld.com','media.basworld.com'].includes(u.hostname))ext=u.searchParams.get('fmt')==='webp'?'.webp':'.jpg';
 const id=crypto.createHash('sha256').update(u.href).digest('hex').slice(0,20);
 return path.join(assetsPath,'assets',role,id+ext);};
const group=(role,items)=>{const total=items.length,saved=items.filter(x=>fs.existsSync(file(role,x))).length;return {expected:total,saved,missing:total-saved,rate:total?saved/total:null}};
const v=m.source_detail_products[0],hires=v.gallery.filter(u=>u.includes('/world/1280/')),thumbs=v.gallery.filter(u=>u.includes('/world/250/'));
const logos=group('logo',m.authentic_logos),css=group('css',m.css_dependencies),gallery_1280=group('vehicle_gallery',hires),gallery_250=group('vehicle_gallery',thumbs);
const page=group('page_image',extra.media_assets.map(x=>x.url));
const pageNames=['index.html','stock/truck/index.html',new URL(v.canonical_url).pathname.replace(/^\//,'')+'/index.html'];
const localPages=pageNames.map(p=>({page:p,status:fs.existsSync(path.join(mirrorPath,p))?'PRESENT':'MISSING'}));
const blockers=[];
if(m.unique_listed_vehicles_in_this_page!==m.listed_vehicle_urls.length)blockers.push('LISTING_COUNT_MISMATCH');
if(!localPages.every(p=>p.status==='PRESENT'))blockers.push('LOCAL_MIRROR_PAGES_MISSING');
if(gallery_1280.missing)blockers.push('PRODUCT_1280_GALLERY_MISSING');
if(gallery_250.missing)blockers.push('PRODUCT_250_THUMBNAILS_MISSING');
if(logos.missing)blockers.push('SOURCE_LOGOS_MISSING');
if(css.missing)blockers.push('SOURCE_CSS_MISSING');
if(page.missing)blockers.push('PAGE_ASSETS_MISSING');
blockers.push('SITE_PRODUCT_TOTAL_NOT_ESTABLISHED');
blockers.push('ONLY_ONE_VEHICLE_DETAIL_CAPTURED');
blockers.push('DYNAMIC_INTERACTIONS_NOT_RESTORED');
const report={status:'FULL_ARCHIVE_NOT_READY',snapshot_at:new Date().toISOString(),source:'REAL_SOURCE_HTML',
 product_listing_sample_unique:m.listed_vehicle_urls.length,product_details_captured:m.source_detail_products.length,
 source_site_total_products:null,vehicle_sku:v.sku,vehicle_name:v.name,currency:v.currency,price:v.price,
 source_gallery_unique_photos:hires.length,source_gallery_variant_urls:v.gallery.length,
 logos,css,gallery_1280,gallery_250,page_assets:page,
 additional_domains_excluded:extra.excluded_external_domain_images,
 localPages,blockers,claim_100_percent_allowed:false};
const out=path.join(mirrorPath,'source-completeness-audit.json');fs.writeFileSync(out,JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({status:report.status,listing:report.product_listing_sample_unique,products:report.product_details_captured,
 logos,css,gallery_1280,gallery_250,page_assets:page,blockers,output:out},null,2));
