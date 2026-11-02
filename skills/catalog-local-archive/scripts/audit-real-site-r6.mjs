#!/usr/bin/env node
/** R6 source-exact completeness verification, zero false 100% claims.
 * Audits only original source facts, local files, media and Chrome evidence.
 */
import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';
const a=n=>{const i=process.argv.indexOf('--'+n);return i<0?null:process.argv[i+1];};
const index=a('index'),media=a('media'),mirror=a('mirror'),seed=a('seed'),resources=a('resources');
if(!index||!media||!mirror||!seed||!resources)throw Error('--index --media --mirror --seed --resources required');
const db=JSON.parse(fs.readFileSync(index,'utf8')),s=JSON.parse(fs.readFileSync(seed,'utf8')),r=JSON.parse(fs.readFileSync(resources,'utf8'));
if(db.source_origin!=='https://www.basworld.com')throw Error('Wrong source');
const localDir=path.resolve(mirror),mediaDir=path.resolve(media);
const hash=val=>crypto.createHash('sha256').update(val).digest('hex');
const fileFor=(url,role)=>{const u=new URL(url);let ext=path.extname(u.pathname).toLowerCase();
 if(!['.jpg','.jpeg','.png','.svg','.webp','.css'].includes(ext)&&['cms.media.basworld.com','media.basworld.com'].includes(u.hostname))ext=u.searchParams.get('fmt')==='webp'?'.webp':'.jpg';
 return path.join(mediaDir,'assets',role,hash(u.href).slice(0,20)+ext)};
function group(urls,role){
 const unique=[...new Set(urls)],existing=[],missing=[];
 for(const url of unique){let p;try{p=fileFor(url,role)}catch{missing.push({url,why:'invalid_url'});continue;}
 if(fs.existsSync(p)&&fs.statSync(p).size>0){existing.push({url,bytes:fs.statSync(p).size,sha256:hash(fs.readFileSync(p))})}else missing.push({url,why:'NOT_CAPTURED'});}
 return {expected:unique.length,saved:existing.length,missing:missing.length,rate:unique.length?existing.length/unique.length:null,missing_examples:missing.slice(0,8)};
}
const sourceProducts=db.product_details||[],listed=new Set(db.listing_urls||[]),skus=new Set(),duplicateSkus=[];
const details=[];
for(const p of sourceProducts){
 if(skus.has(p.sku))duplicateSkus.push(p.sku);skus.add(p.sku);
 const gallery=group(p.images||[],'vehicle_gallery');
 const dimensions={};for(const url of p.images||[]){const g=url.match(/\/world\/([^/]+)\//)?.[1]||'unknown';dimensions[g]=(dimensions[g]||0)+1;}
 const output=new URL(p.canonical_url||p.source_url);
 const html=path.join(localDir,output.pathname.replace(/^\//,''),'index.html');
 details.push({sku:p.sku,title:p.name,price:p.price,currency:p.currency,year:p.year,source_url:p.source_url,
 local_html_present:fs.existsSync(html),source_images:(p.images||[]).length,dimensions,
 gallery_expected:gallery.expected,gallery_saved:gallery.saved,gallery_missing:gallery.missing,
 zero_gallery_in_source:!p.images?.length,source_price_zero:String(p.price)==='0.00',source_sha256:p.html_sha256});
}
const total_gallery=details.reduce((v,x)=>v+x.gallery_expected,0),saved_gallery=details.reduce((v,x)=>v+x.gallery_saved,0);
const logos=group(s.authentic_logos,'logo'),css=group(s.css_dependencies,'css'),pageAssets=group(r.media_assets.map(x=>x.url),'page_image');
const pages=[...db.pages.filter(x=>x.valid)],catalogCaptured=2+pages.length;
const replayPath=path.join(localDir,'replay-report.json');
const replay=fs.existsSync(replayPath)?JSON.parse(fs.readFileSync(replayPath,'utf8')):null;
const browserPath=a('browser');const browser=browserPath&&fs.existsSync(browserPath)?JSON.parse(fs.readFileSync(browserPath,'utf8')):null;
const productCoverage=listed.size?details.length/listed.size:null;
const blockers=[];
if(!db.pages.length||db.pages.at(-1)?.has_next!==false)blockers.push('R1_LISTING_PAGINATION_NOT_EXHAUSTED');
if(listed.size!==details.length)blockers.push('R2_PRODUCT_DETAIL_URLS_MISSING');
if(duplicateSkus.length)blockers.push('DUPLICATE_SKUS_NEED_RECONCILIATION');
if(details.some(x=>!x.local_html_present))blockers.push('R4_DETAIL_HTML_NOT_LOCAL');
if(saved_gallery!==total_gallery)blockers.push('R3_SOURCE_GALLERY_URLS_MISSING');
if(details.some(x=>x.zero_gallery_in_source))blockers.push('SOURCE_PRODUCTS_WITH_NO_GALLERY_NEED_REVIEW');
if(details.some(x=>x.source_price_zero))blockers.push('ZERO_PRICE_SOURCE_ITEMS_NEED_REVIEW');
if(pageAssets.missing)blockers.push('PAGE_IMAGES_MISSING');
if(logos.missing||css.missing)blockers.push('LOGO_OR_CSS_SOURCE_ASSETS_MISSING');
if(!browser)blockers.push('CHROME_R5_R6_EVIDENCE_MISSING');
if(browser?.external_success_responses>0)blockers.push('OFFSITE_RESPONSES_PRESENT');
if(browser?.external_attempts>0)blockers.push('OFFSITE_REFERENCES_NOT_LOCALIZED');
blockers.push('ALL_SOURCE_CATEGORIES_AND_SITE_TOTAL_NOT_VERIFIED');
blockers.push('LIVE_SOURCE_VS_LOCAL_PIXEL_PARITY_NOT_MEASURED');
blockers.push('DYNAMIC_NATIVE_FILTERS_AND_PRODUCT_GALLERIES_NOT_EQUIVALENT');
const report={
 status:'R6_AUDITED_FULL_SITE_FAIL',generated_at:new Date().toISOString(),source:'https://www.basworld.com',
 scope:'CAPTURED_TRUCK_SNAPSHOT_ONLY',full_site_source_inventory_total:null,
 listing_pages_captured:catalogCaptured,listing_last_captured_page:db.pages.at(-1)?.page||2,
 last_captured_page_has_next:db.pages.at(-1)?.has_next??true,
 listing_unique_product_urls:listed.size,product_details_captured:details.length,
 product_detail_coverage_within_discovered_subset:productCoverage,
 gallery_variant_urls_expected_from_captured_details:total_gallery,gallery_variant_urls_saved:saved_gallery,
 gallery_variant_coverage:total_gallery?saved_gallery/total_gallery:null,
 no_gallery_product_count:details.filter(x=>x.zero_gallery_in_source).length,
 zero_price_product_count:details.filter(x=>x.source_price_zero).length,
 source_original_logo_assets:logos,source_css_assets:css,three_page_media_assets:pageAssets,
 source_product_detail_html_present:details.filter(x=>x.local_html_present).length,
 local_replay_pages:replay?.pages_saved??null,local_saved_assets:replay?.assets_saved??null,
 chrome_browser_evidence:browser?{checked_pages:browser.pages?.length,external_attempts:browser.external_attempts,external_success_responses:browser.external_success_responses}:null,
 missing_detail_urls:[...listed].filter(u=>!sourceProducts.some(p=>p.source_url===u)).slice(0,20),
 source_product_details:details,blockers,owner_visual_approval:'OPEN',
 result_100_percent_allowed:false,dev_published:false,production_modified:false,
 evidence_json:'R6-completeness.json'};
fs.writeFileSync(path.join(localDir,'R6-completeness.json'),JSON.stringify(report,null,2)+'\n');
const esc=x=>String(x).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const pct=x=>x===null?'unknown':(100*x).toFixed(1)+'%';
const cssText='body{font-family:system-ui,Arial,sans-serif;margin:0;background:#f3f6f8;color:#183549}header{background:#14334c;color:white;padding:32px}main{max-width:1180px;margin:auto;padding:25px}table{border-collapse:collapse;width:100%;background:white}th,td{padding:12px;border-bottom:1px solid #e1e8eb;text-align:left}th{background:#e8eff3}.block{padding:14px;background:#fff3dc;margin:7px 0;border-left:4px solid #ba841e}.num{font-size:30px;font-weight:800}.gr{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}.tile{background:white;padding:18px;border:1px solid #d9e3e8;border-radius:7px}a{color:#205779}';
const rows=[['Catalog pages captured',catalogCaptured,'Entire source pagination unknown'],['Unique discovered URLs',listed.size,'Only scanned truck category pages'],['Real product detail pages',details.length,pct(productCoverage)+' of current subset'],['Captured SKU gallery variant files',saved_gallery,total_gallery+' expected in captured details'],['Original logo files',logos.saved,logos.expected+' expected'],['CSS files',css.saved,css.expected+' expected'],['Page media files',pageAssets.saved,pageAssets.expected+' expected in first three pages']];
const html='<html><head><meta charset="utf-8"><meta name="robots" content="noindex,nofollow"><title>R6 — Real Source Completeness Audit</title><style>'+cssText+'</style></head><body><header><h1>R6 / Actual Source Archive Audit</h1><p>FULL-SITE PASS: NOT READY. No synthetic products counted. '+esc(report.generated_at)+'</p></header><main><div class="gr"><div class="tile">Discovered products<div class="num">'+listed.size+'</div></div><div class="tile">Details captured<div class="num">'+details.length+'</div></div><div class="tile">Gallery variants saved<div class="num">'+saved_gallery+'</div></div></div><h2>Coverage</h2><table><thead><tr><th>Metric</th><th>Captured</th><th>Limit</th></tr></thead><tbody>'+rows.map(x=>'<tr><td>'+esc(x[0])+'</td><td>'+esc(x[1])+'</td><td>'+esc(x[2])+'</td></tr>').join('')+'</tbody></table><h2>Hard blockers ('+blockers.length+')</h2>'+blockers.map(x=>'<div class="block">'+esc(x)+'</div>').join('')+'<p><a href="/source-mirror-r2/inventory.html">Captured inventory</a> | <a href="/source-mirror-r2/">Original homepage snapshot</a></p><p>Details / file hashes: <code>R6-completeness.json</code>. Original HTML/media stay in private Windows.</p></main></body></html>';
fs.writeFileSync(path.join(localDir,'R6-review.html'),html);
console.log(JSON.stringify({status:report.status,listed:listed.size,products:details.length,gallery_saved:saved_gallery,gallery_expected:total_gallery,
 pages:catalogCaptured,source_total:'UNKNOWN',source_pages_exhausted:false,blockers:blockers.length,review:'/source-mirror-r2/R6-review.html'},null,2));
