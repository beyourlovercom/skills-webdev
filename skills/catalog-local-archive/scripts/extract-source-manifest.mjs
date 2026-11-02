#!/usr/bin/env node
/**
 * Read only existing, owner-authorized HTML snapshots, never network.
 * node extract-source-manifest.mjs --listing path --detail path --out private-folder
 * Keeps original HTML files immutable. Does not invent vehicles/images.
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
function arg(name){const i=process.argv.indexOf('--'+name);return i<0?null:process.argv[i+1];}
const listingPath=arg('listing'),detailPath=arg('detail'),out=arg('out');
if(!listingPath||!detailPath||!out||!path.isAbsolute(out)){console.error('Usage: --listing <html> --detail <html> --out <absolute private dir>');process.exit(2);}
const read=p=>fs.readFileSync(p,'utf8');
const hash=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const root='https://www.basworld.com';
const decode=s=>s.replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#39;|&apos;/g,"'").replace(/&#x([0-9a-f]+);/gi,(_,v)=>String.fromCodePoint(parseInt(v,16)));
const unique=a=>[...new Set(a)];
function links(html){return unique([...html.matchAll(/\bhref\s*=\s*["']([^"']+)["']/gi)].map(m=>decode(m[1])));}
function sourceUrl(url){try{return new URL(url,root)}catch{return null;}}
const listing=read(listingPath),detail=read(detailPath);
const itemLinks=unique(links(listing).map(sourceUrl).filter(u=>u?.hostname==='www.basworld.com' && /^\/vehicles\/(new|used)\/[A-Za-z0-9%-]+\/?$/.test(u.pathname)).map(u=>u.origin+u.pathname));
const pages=unique(links(listing).map(sourceUrl).filter(u=>u?.hostname==='www.basworld.com' && u.pathname==='/stock/truck' && (u.searchParams.has('page')||!u.search)).map(u=>u.href));
const scripts=[...detail.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)].map(m=>{try{return JSON.parse(m[1])}catch{return null}}).filter(Boolean);
const v=scripts.find(x=>x['@type']==='Vehicle');
if(!v || !v.sku || !v.name){console.error('DETAIL_NO_VEHICLE_STRUCTURED_DATA');process.exit(3);}
const canonical=detail.match(/<link\b[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)/i)?.[1] || v.offers?.url || null;
const gallery=unique([...detail.matchAll(/https:\/\/static\.basworld\.com\/photos\/vehicle\/[A-Za-z0-9_./%-]+\.(?:jpg|jpeg|png|webp)/gi)].map(m=>m[0]));
const allLdImages=Array.isArray(v.image)?v.image:v.image?[v.image]:[];
const missingLd=allLdImages.filter(x=>!gallery.includes(x));
const logos=unique([...[...listing,...detail].join('').matchAll(/(?:src|href)=["']([^"']*\/resources\/icons\/logos\/(?:logo-desktop\.svg|bw-full-logo-white\.png))["']/gi)].map(m=>new URL(decode(m[1]),root).href));
const css=unique([...[...listing,...detail].join('').matchAll(/href=["'](\/_next\/static\/css\/[^"']+\.css)["']/gi)].map(m=>new URL(m[1],root).href));
const media=[
 ...logos.map(url=>({url,role:'logo',item_sku:null})),
 ...gallery.map((url,i)=>({url,role:'vehicle_gallery',item_sku:String(v.sku),order:i+1}))
];
const product={sku:String(v.sku),name:v.name,description:v.description??null,brand:v.brand?.name??null,
 year:v.vehicleModelDate?.slice(0,4)??null,date:v.vehicleModelDate??null,axle:v.vehicleConfiguration??null,transmission:v.vehicleTransmission??null,
 price:v.offers?.price??null,currency:v.offers?.priceCurrency??null,availability:v.offers?.availability??null,
 canonical_url:canonical,primary_images:allLdImages,gallery,extracted_gallery_count:gallery.length,structured_data_gallery_count:allLdImages.length,
 gallery_discrepancy:gallery.length!==allLdImages.length,missing_structured_images:missingLd,
 authenticity:'REAL_SOURCE_HTML', source_html_sha256:hash(detailPath)};
const manifest={schema_version:1,archive_role:'PRIVATE_OWNER_SOURCE_ARCHIVE',origin:root,
 acquired_at:new Date().toISOString(),listing_html_sha256:hash(listingPath),
 listing_type:'truck',listing_pages_discovered:pages,listed_vehicle_urls:itemLinks,
 unique_listed_vehicles_in_this_page:itemLinks.length,unverified_full_site_inventory:true,
 source_detail_products:[product],authentic_logos:logos,css_dependencies:css,media_assets:media,
 status:'MANIFEST_FROM_REAL_SOURCE_SNAPSHOTS_PARTIAL',completeness:{site_products_total:null,products_captured:1,logos_captured:0,gallery_assets_saved:0,local_replay_status:'OPEN'}};
fs.mkdirSync(out,{recursive:true});
const file=path.join(out,'source-manifest.json');fs.writeFileSync(file,JSON.stringify(manifest,null,2)+'\n');
const report={status:'REAL_MANIFEST_EXTRACTED',real_listing_items:itemLinks.length,detail_sku:product.sku,
 detail_name:product.name,detail_price:product.price,currency:product.currency,real_gallery_urls:gallery.length,
 ld_image_count:allLdImages.length,logos:logos.length,css_dependencies:css.length,
 output:file,full_site:'NOT_VERIFIED',source_synthetic_items:0};
console.log(JSON.stringify(report,null,2));
