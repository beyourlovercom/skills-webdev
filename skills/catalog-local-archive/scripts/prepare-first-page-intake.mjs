#!/usr/bin/env node
/**
 * Prepare the FIRST PAGE ONLY source media queue from previously captured source HTML.
 * Never reads page 2+, never discovers links, never performs network requests.
 * Exact Logo, CSS and selected first-page product sample gallery retained.
 */
import fs from 'node:fs';
import path from 'node:path';
const arg=n=>{const i=process.argv.indexOf('--'+n);return i===-1?null:process.argv[i+1];};
const source=arg('manifest'),resources=arg('page-assets'),out=arg('out');
if(!source||!resources||!out||!path.isAbsolute(out))throw Error('Required --manifest --page-assets --out absolute');
const m=JSON.parse(fs.readFileSync(source,'utf8'));
const p=JSON.parse(fs.readFileSync(resources,'utf8'));
if(m.origin!=='https://www.basworld.com'||p.origin!=='https://www.basworld.com')throw Error('Source origin mismatch');
if(m.listing_type!=='truck'||!m.source_detail_products||m.source_detail_products.length!==1)throw Error('Pilot must identify a single representative product');
const sku=m.source_detail_products[0].sku;
if(!m.listed_vehicle_urls.some(u=>u.includes(String(sku))))throw Error('Representative product not in listing page 1');
const allowedPages=new Set(['home','listing','detail']);
if(!p.media_assets.every(x=>allowedPages.has(x.source_page)))throw Error('Page media includes unknown/later pages');
const records=[
 ...m.authentic_logos.map(url=>({url,role:'logo',source_page:'home'})),
 ...m.css_dependencies.map(url=>({url,role:'css',source_page:'shared'})),
 ...p.media_assets.map(x=>({...x,role:'page_image'})),
 ...m.source_detail_products[0].gallery.map((url,index)=>({url,role:'vehicle_gallery',item_sku:sku,order:index+1,source_page:'detail'}))
];
const seen=new Set();const unique=records.filter(x=>{const k=x.role+':'+x.url;if(seen.has(k))return false;seen.add(k);return true;});
const manifest={
 schema_version:1,origin:m.origin,
 pilot_scope:'FIRST_PAGE',verified_first_page_assets:true,source_page_numbers:[1],
 approved_for_owner_visual_review:false,review_gate:'OWNER_VISUAL_PASS_PENDING',
 captured_template_classes:['homepage','catalog_listing_page1','representative_product_detail'],
 representative_product_sku:sku,
 first_listing_html_sha256:m.listing_html_sha256,
 first_detail_html_sha256:m.source_detail_products[0].source_html_sha256,
 media_assets:unique.filter(x=>x.role!=='css'),
 css_dependencies:unique.filter(x=>x.role==='css').map(x=>x.url),
 count_by_role:Object.fromEntries(['logo','css','page_image','vehicle_gallery'].map(role=>[role,unique.filter(x=>x.role===role).length])),
 missing_media_dependencies_outside_current_discovery:'OPEN - inspect srcset, fonts, backgrounds, all lazy-load and external host resources before visual signoff',
 next_page_links_policy:'DO_NOT_FOLLOW',full_site_catalog_capture:'FORBIDDEN_UNTIL_OWNER_VISUAL_PASS'
};
fs.mkdirSync(path.dirname(out),{recursive:true});
fs.writeFileSync(out,JSON.stringify(manifest,null,2)+'\n');
console.log(JSON.stringify({status:'FIRST_PAGE_ONLY_MEDIA_MANIFEST_READY',scope:manifest.pilot_scope,roles:manifest.count_by_role,
 product_sku:sku,owner_visual_pass:false,output:out}));
