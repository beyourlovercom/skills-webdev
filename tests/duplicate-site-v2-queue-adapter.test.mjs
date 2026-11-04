import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import crypto from "node:crypto";
import {planWithPr15,runScratchJobs} from "../skills/duplicate-site-skills/v2/scripts/pr15-queue-to-v2-data.mjs";

const sha=x=>crypto.createHash("sha256").update(x).digest("hex");
const fake=()=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),"v2-pr15-adapter-"));
 fs.mkdirSync(path.join(root,"uat"));
 const source=path.join(root,"uat","frozen.html");
 fs.writeFileSync(source,"<html><body><h1>Home</h1></body></html>");
 const digest=sha(fs.readFileSync(source));
 const sha2=sha("approved-test-template-only");
 const ledger={schema_version:1,project_id:"rapiddirect-v2-pilot",source_origin:"https://www.rapiddirect.com",local_origin:"http://127.0.0.1:8765",
  rights_verified:true,demo_only:false,
  scope:{mode:"FIRST_PAGE_CATALOG",blog_excluded:true,listing_max_page:1,product_details:"representative",exclude_routes:["/blog/"],approved_representative_detail_urls:[]},
  execution:{target_active_hours:48,active_hours_spent:0,owner_wait_hours:0},
  modules:["shared-shell","catalog-listings","product-details","content-services","interactions","offline-acceptance"].map((id,i)=>({
   id,state:i===0?"OWNER_PASS":"NOT_STARTED",
   sample:i===0?{source_url:"https://www.rapiddirect.com/",local_url:"http://127.0.0.1:8765/",
     analysis_ref:"private-sample-analysis-ref",desktop_ref:"private-desktop-evidence",mobile_ref:"private-mobile-evidence",auto_uat:"PASS"}:null,
   approval:{status:i===0?"PASS":"OPEN",owner_message_ref:i===0?"User approved owner visual template in November 2026":null,
     approved_at:i===0?"2026-11-04T08:00:00+08:00":null,template_sha256:i===0?sha2:null},
   batch:{expected:i===0?1:0,archived:0,verified:0,failed:0,offline_qa:"OPEN"}
  }))
 };
 const owner={bulk_enabled:false,production_writes:false,templates:[{template_id:"shared-shell",
  owner_visual_pass:true,reference_freeze_state:"FROZEN_REFERENCE",
  frozen_reference_local_file:source,frozen_reference_sha256:digest}]};
 const urls=["https://www.rapiddirect.com/"];
 const rows=[{source_url:urls[0],local_path:"/sample.html",content_type:"home",
   status:"PENDING",source_sha256:digest,assets:[{source_url:"https://www.rapiddirect.com/wp-content/a.webp",
     local_path:"/wp-content/a.webp",sha256:sha("one-asset")}]}
 ];
 const mapping={is_generalized_template:true,batch_authorized:true,template_sha256:sha2,
  source_sha256:digest,source_file:source};
 return {root,ledger,owner,rows,mapping,urls,changesByUrl:{[urls[0]]:{"h1:0:text:0":"Safe Home"}}};
};
const scoped=x=>({factoryRoot:path.join(x.root,"factory"),
  pr15Ledger:x.ledger,routeList:x.rows,moduleId:"shared-shell",
  ownerCandidate:x.owner,mapping:x.mapping,changesByUrl:x.changesByUrl,
  approvedUrls:x.urls,workspace:x.root});
function stub(x,allowed=true){
 const dir=path.join(x.root,"factory","skills","duplicate-site-skills","scripts");
 fs.mkdirSync(dir,{recursive:true});
 const result=allowed?{
   status:"QUEUE_READY",module:"shared-shell",jobs:[{source_url:"https://www.rapiddirect.com/",local_path:"/sample.html",
   content_type:"home",original_html_sha256:sha("sample"),assets:[{source_url:"https://www.rapiddirect.com/wp-content/a.webp",local_path:"/wp-content/a.webp",sha256:sha("a")}],
   action:"LOCALIZE_WITH_FROZEN_TEMPLATE"}],asset_urls_deduplicated:1,skipped_count:0
  }:{status:"BLOCKED",reasons:["PREVIOUS_MODULE_NOT_PASS"],jobs:[]};
 fs.writeFileSync(path.join(dir,"prepare-module-batch.mjs"),
   "export function prepareModuleQueue(ledger,routeList,moduleId){return "+JSON.stringify(result)+";}\n");
}
test("real factory integration is mandatory and pilot blocked result never creates pages",async()=>{
 const x=fake();
 try{
  stub(x,false);
  const result=await planWithPr15(scoped(x));
  assert.equal(result.status,"BLOCKED_BY_PR15");
  assert.equal(result.site_writes,0);
  assert.equal(result.jobs,0);
 }finally{fs.rmSync(x.root,{recursive:true,force:true})}
});
test("an approved queue requires a separate generalized template proof",async()=>{
 const x=fake();
 try{
  stub(x);
  x.mapping.is_generalized_template=false;
  const result=await planWithPr15(scoped(x));
  assert.equal(result.status,"BLOCKED_MISSING_VALIDATED_GENERALIZED_TEMPLATE");
  assert.equal(result.site_writes,0);
 }finally{fs.rmSync(x.root,{recursive:true,force:true})}
});
test("a validated one-route fixture maps to isolated private scratch and never runs without execute",async()=>{
 const x=fake();
 try{
  stub(x);
  const plan=await planWithPr15(scoped(x));
  assert.equal(plan.status,"QUEUE_MAPPED_DRY_RUN");
  assert.equal(plan.totals.jobs,1);
  assert.ok(plan.jobs[0].output.startsWith(path.join(x.root,"uat")+path.sep));
  const result=runScratchJobs({plan,ownerLedgerPath:path.join(x.root,"uat","ledger.json"),execute:false});
  assert.equal(result.status,"PASS");
  assert.equal(result.local_outputs,0);
  assert.equal(result.results[0].status,"WOULD_RENDER_SCRATCH_ONLY");
 }finally{fs.rmSync(x.root,{recursive:true,force:true})}
});
test("wrong template SHA or new route outside explicit scope rejects early",async()=>{
 const x=fake();
 try{
  stub(x);
  x.mapping.template_sha256=sha("other");
  await assert.rejects(()=>planWithPr15(scoped(x)),/FROZEN_TEMPLATE_SHA_MISMATCH/);
  x.mapping.template_sha256=x.ledger.modules[0].approval.template_sha256;
  x.urls=[];
  await assert.rejects(()=>planWithPr15(scoped(x)),/EXPLICIT_SCOPE_ALLOWLIST_REQUIRED/);
  x.urls=["https://www.rapiddirect.com/services/random/"];
  await assert.rejects(()=>planWithPr15(scoped(x)),/OUT_OF_APPROVED_URL_SCOPE/);
 }finally{fs.rmSync(x.root,{recursive:true,force:true})}
});
