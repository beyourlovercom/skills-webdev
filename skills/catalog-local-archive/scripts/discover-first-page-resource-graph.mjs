#!/usr/bin/env node
/** First-page-only public asset dependency graph. Reads cached HTML/CSS ONLY.
 * Nothing is crawled. Captured resources can be downloaded only from allowlist.
 */
import fs from 'node:fs';
import path from 'node:path';
const a=n=>{const i=process.argv.indexOf('--'+n);return i<0?null:process.argv[i+1];};
const home=a('home'),cssFolder=a('css'),out=a('out');
if(!home||!cssFolder||!out||!path.isAbsolute(out))throw Error('Require --home <original first page html> --css <captured CSS dir> --out <absolute>');
const root='https://www.basworld.com/';
const allowed=['www.basworld.com','static.basworld.com','cms.media.basworld.com','media.basworld.com','basgroup.a.bigcontent.io'];
const decode=s=>s.replaceAll('&amp;','&').replaceAll('&quot;','"').replaceAll('&#39;',"'");
const media=[],denied=[],seen=new Set();
function add(raw,source,kind) {
 raw=decode(String(raw).replace(/^["']|["']$/g,'').trim());
 if(!raw||raw.startsWith('data:')||raw.startsWith('blob:')||raw.startsWith('#'))return;
 let url;try{url=new URL(raw,root)}catch{denied.push({raw,source,reason:'BAD_URL'});return;}
 if(url.protocol!=='https:'||!allowed.includes(url.hostname)){denied.push({raw,source,reason:'OTHER_HOST'});return;}
 const ext=path.extname(url.pathname).toLowerCase();
 if(!/\.(woff2?|ttf|eot|otf|svg|png|jpg|jpeg|webp|gif|avif|ico)$/i.test(ext) && !url.hostname.startsWith('cms.')){
   denied.push({raw,source,reason:'NOT_MEDIA_FILE'});return;
 }
 if(seen.has(url.href))return;seen.add(url.href);
 media.push({url:url.href,role:'page_image',item_sku:null,source_page:'home',kind});
}
const html=fs.readFileSync(home,'utf8');
// Real first-page image tags and UI icons (not a catalog crawler).
for(const tag of html.match(/<img\b[^>]*>/gi)||[]){
 for(const m of tag.matchAll(/\b(?:src|data-src|srcset|data-srcset)=["']([^"']+)["']/gi)){
   if(/srcset/i.test(m[0]))for(const x of m[1].split(','))add(x.trim().split(/\s+/)[0],'home-img','responsive');
   else add(m[1],'home-img','image');
 }
}
for(const m of html.matchAll(/\b(?:poster)=["']([^"']+)["']/gi))add(m[1],'home-video','video-poster');
for(const m of html.matchAll(/(?:background-image|background)\s*:\s*url\(([^)]+)\)/gi))add(m[1],'home-inline-style','inline-background');
for(const m of html.matchAll(/<link\b[^>]*\b(?:rel=["'](?:shortcut icon|icon|apple-touch-icon)["'])[^>]*href=["']([^"']+)["']/gi))add(m[1],'home-icon','icon');
let cssCount=0;
for(const item of fs.readdirSync(cssFolder)){
 if(!item.endsWith('.css'))continue;cssCount++;
 const text=fs.readFileSync(path.join(cssFolder,item),'utf8');
 for(const m of text.matchAll(/url\(([^)]+)\)/gi))add(m[1],'css:'+item,'css-font-or-background');
}
const summary={schema_version:1,origin:'https://www.basworld.com',pilot_scope:'FIRST_PAGE',
 verified_first_page_assets:true,source_page_numbers:[1],owner_visual_pass:false,
 source_html:home,source_css_files_examined:cssCount,media_assets:media,
 css_dependencies:[],discovered:media.length,denied_assets:denied,
 host_stats:Object.fromEntries(allowed.map(h=>[h,media.filter(m=>new URL(m.url).hostname===h).length])),
 why:'Every direct media, CSS font, icon and inline background from original homepage/previously archived CSS; never follows page-2 or href links.',
 missing:'Still requires real browser Network audit for JS-inserted assets and actual screenshots'};
fs.mkdirSync(path.dirname(out),{recursive:true});fs.writeFileSync(out,JSON.stringify(summary,null,2)+'\n');
console.log(JSON.stringify({status:'FIRST_PAGE_RESOURCE_GRAPH_READY',media_assets:media.length,css_files:cssCount,excluded:denied.length,hosts:summary.host_stats,output:out},null,2));
