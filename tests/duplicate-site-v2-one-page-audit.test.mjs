import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {auditSingleExport} from "../skills/duplicate-site-skills/v2/scripts/audit-single-page-canary.mjs";

function fixture(assetPresent){
 const root=fs.mkdtempSync(path.join(os.tmpdir(),"v2-r8-audit-"));
 const exp=path.join(root,"uat","r8-cnc-milling");
 const mirror=path.join(exp,"mirror");
 const htmlFile=path.join(mirror,"services","cnc-milling","index.html");
 fs.mkdirSync(path.dirname(htmlFile),{recursive:true});
 fs.writeFileSync(htmlFile,'<html><body><section class="swiper-slide"><img src="/wp-content/uploads/one.webp" alt="x"></section></body></html>');
 const mf=path.join(exp,"manifest.json");
 fs.writeFileSync(mf,JSON.stringify({schema_version:2,source:{origin:"https://www.rapiddirect.com/",samples:[{id:"cnc-milling",path:"/services/cnc-milling/"}]},
  rights:{owner_attested:true},execution:{scope:"PILOT_SAMPLES",enable_bulk:false,allow_production_write:false}}));
 if(assetPresent){
  const asset=path.join(mirror,"wp-content","uploads","one.webp");
  fs.mkdirSync(path.dirname(asset),{recursive:true});fs.writeFileSync(asset,"not-a-real-image");
 }
 const opts={workspace:root,exportRoot:exp,manifest:mf,relativeHtml:"services/cnc-milling/index.html",sourceRoute:"/services/cnc-milling/"};
 return {root,opts,exp};
}
test("R7 source-preserving audit detects variable cards and exactly present assets",()=>{
 const x=fixture(true);
 try{
  const v=auditSingleExport(x.opts);
  assert.equal(v.status,"SINGLE_PAGE_AUDITED");
  assert.equal(v.route_count,1);
  assert.equal(v.resources.unique_referenced,1);
  assert.equal(v.resources.missing,0);
  assert.equal(v.html.swiper_slide_class_occurrences,1);
  assert.equal(v.site_writes,0);
  assert.equal(v.generalized_template_ready,false);
 }finally{fs.rmSync(x.root,{recursive:true,force:true})}
});
test("R7 missing assets become failed-only retry list and do not trigger source requests",()=>{
 const x=fixture(false);
 try{
  const v=auditSingleExport(x.opts);
  assert.equal(v.resources.missing,1);
  assert.deepEqual(v.resources.failed_only_retry_urls,["/wp-content/uploads/one.webp"]);
  assert.equal(v.source_requests,0);
 }finally{fs.rmSync(x.root,{recursive:true,force:true})}
});
test("R7 fails closed on non-authorized page and export outside private UAT",()=>{
 const x=fixture(true);
 try{
  assert.throws(()=>auditSingleExport({...x.opts,sourceRoute:"/services/cnc-turning/"}),/EXACT_ONE_SOURCE_PAGE_ONLY/);
  assert.throws(()=>auditSingleExport({...x.opts,relativeHtml:"index.html"}),/EXACT_CANARY_HTML_REQUIRED/);
  assert.throws(()=>auditSingleExport({...x.opts,exportRoot:path.join(x.root,"mirror")}),/ENOENT|OUTSIDE_PRIVATE_UAT/);
 }finally{fs.rmSync(x.root,{recursive:true,force:true})}
});
