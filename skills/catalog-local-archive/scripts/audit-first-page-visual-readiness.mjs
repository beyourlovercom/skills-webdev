#!/usr/bin/env node
/** Mandatory visual-readiness gate: fail closed before requesting Owner signoff.
 * First-page-only source asset completeness, dynamic dependencies and Chrome checks.
 */
import { enforceVisualFirst } from './visual-first-gate.mjs';
import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';
const a=n=>{const i=process.argv.indexOf('--'+n);return i<0?null:process.argv[i+1];};
const graphFile=a('graph'),mediaDir=a('media'),localDir=a('local'),browserFile=a('browser');
if(!graphFile||!mediaDir||!localDir||!browserFile)throw Error('Require --graph --media --local --browser');
const graph=JSON.parse(fs.readFileSync(graphFile,'utf8')),browser=JSON.parse(fs.readFileSync(browserFile,'utf8'));
if(graph.pilot_scope!=='FIRST_PAGE'||graph.source_page_numbers.some(n=>n!==1))throw Error('Scope must be page 1 only');
const hash=u=>crypto.createHash('sha256').update(u).digest('hex').slice(0,20);
function filename(rec){
 const url=new URL(rec.url),ext=path.extname(url.pathname).toLowerCase();
 let final=ext;
 if(!['.jpg','.jpeg','.png','.svg','.webp','.css','.gif','.ico','.avif','.woff','.woff2','.ttf','.otf','.eot'].includes(ext)&&url.hostname==='cms.media.basworld.com')final=url.searchParams.get('fmt')==='webp'?'.webp':'.jpg';
 return path.join(mediaDir,'assets',rec.role,hash(rec.url)+final);
}
const missing=[],found=[];
for(const item of graph.media_assets){
 const p=filename(item);
 if(fs.existsSync(p)&&fs.statSync(p).size>0)found.push(item);else missing.push(item);
}
const home=browser.pages?.find(p=>p.route==='/source-mirror/');
const blockers=[];
if(!home)blockers.push('REAL_CHROME_HOME_PAGE_NOT_TESTED');
if(missing.length)blockers.push('FIRST_PAGE_DEPENDENCY_GRAPH_ASSETS_MISSING');
if(browser.external_attempts>0)blockers.push('UNLOCALIZED_EXTERNAL_RESOURCE_REQUESTS');
if(browser.external_success_responses>0)blockers.push('LIVE_EXTERNAL_RESOURCES_USED');
const localHome=path.join(localDir,'index.html');
if(!fs.existsSync(localHome))blockers.push('LOCAL_HOME_HTML_NOT_FOUND');
const localHTML=fs.existsSync(localHome)?fs.readFileSync(localHome,'utf8'):'';
if(!localHTML.includes('BUY VEHICLES AND MACHINERY WORLDWIDE'))blockers.push('HOMEPAGE_HERO_CONTENT_NOT_FOUND');
if((home?.broken_images?.length??0)>0)blockers.push('HOMEPAGE_BROKEN_IMAGES_DETECTED');
if(!home?.scrolled?.steps)blockers.push('HOMEPAGE_SCROLL_COVERAGE_MISSING');
if(!browser.full_page_lazyload_scrolled)blockers.push('FULL_PAGE_SCROLL_AND_LAZYLOAD_TEST_NOT_DONE');
if(!browser.source_comparison_screenshot_verified)blockers.push('SOURCE_VS_LOCAL_PIXEL_DIFF_NOT_MEASURED');
if(!browser.dynamic_components_pass)blockers.push('DYNAMIC_COMPONENTS_NOT_RECOVERED');
let ownerApproval='OPEN';
try {
 if(!a('approval'))throw Error('approval not provided');
 const result=enforceVisualFirst({phase:'EXPANSION_AFTER_OWNER_PASS',
  approvalFile:a('approval'),source:'https://www.basworld.com',project:'basworldy',mode:'inventory',from:2,limit:2});
 ownerApproval=result.approval_ref;
} catch {blockers.push('OWNER_VISUAL_PASS_NOT_RECEIVED');}
const report={status:blockers.length?'FIRST_PAGE_VISUAL_GATE_FAIL':'OWNER_VISUAL_PASS_VERIFIED',scope:'FIRST_PAGE_ONLY',generated_at:new Date().toISOString(),
 graph_total:graph.media_assets.length,graph_saved:found.length,graph_missing:missing.length,
 missing_examples:missing.slice(0,12).map(x=>x.url),
 verified_original_logo:'SEPARATE_SOURCE_MANIFEST',local_home_title:home?.title??null,
 home_image_elements:home?.image_count??null,home_images_loaded_initial:home?.loaded_images??null,
 browser_external_attempts:browser.external_attempts??null,browser_external_responses:browser.external_success_responses??null,
 blockers,owner_visual_approval:ownerApproval,source_full_site_scrape:blockers.length?'BLOCKED':'REQUIRES_SEPARATE_EXPANSION_COMMAND'};
const dest=path.join(localDir,'first-page-visual-readiness.json');
fs.writeFileSync(dest,JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({status:report.status,assets_saved:found.length,assets_total:graph.media_assets.length,
 defects:blockers,report:dest},null,2));
process.exit(blockers.length?4:0);
