#!/usr/bin/env node
/** R4: strict handoff to real PR15 module gate; no new queue engine.
 * Reads private R2/R3/R4 local evidence, NEVER grants Owner approval.
 * Does not enqueue or render website pages; supports isolated synthetic
 * queue test to verify the actual factory API without forging approval.
 */
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import {pathToFileURL} from "node:url";
const sha=b=>crypto.createHash("sha256").update(b).digest("hex");
const required=["shared-shell","catalog-listings","product-details","content-services","interactions","offline-acceptance"];
const mapClass={"home":"shared-shell","listing":"catalog-listings","product":"product-details","content":"content-services"};
function parseArgs(){
 const out={};
 for(const arg of process.argv.slice(2)){
  const m=arg.match(/^--(contract|receipt|browser|factory-root|source-origin|out)=(.+)$/);
  if(!m)throw Error("UNKNOWN_OR_MISSING_OPTION:"+arg);out[m[1]]=m[2];
 }
 for(const x of ["contract","receipt","browser","factory-root","source-origin","out"])if(!out[x])throw Error("MISSING_"+x);
 return out;
}
function readJSON(p){return JSON.parse(fs.readFileSync(p,"utf8").replace(/^\uFEFF/,""));}
function ensureResearchPath(p){
 const v=path.resolve(p);
 if(!v.split(path.sep).includes("_research"))throw Error("PRIVATE_RESEARCH_ONLY");
 return v;
}
function verifyReceipt(r){
 if(r.schema!=="wp-isolated-final-build/v1"||r.production_ready!==false||r.visual_pass!==false||r.site_writes!==0)
  throw Error("INVALID_R3_RECEIPT");
 if(!Array.isArray(r.files)||!r.files.length)throw Error("R3_BUILD_EMPTY");
 for(const row of r.files){
  if(!/^[a-f0-9]{64}$/.test(row.source_sha256)||!/^[a-f0-9]{64}$/.test(row.dist_sha256))throw Error("R3_HASH_MISSING");
 }
}
function makeActualLedger(contract, browser, origin){
 const source=new URL(origin);
 if(!["https:","http:"].includes(source.protocol)||source.username||source.password||source.pathname!=="/")throw Error("VALID_SOURCE_ORIGIN_REQUIRED");
 origin=source.origin;
 const modules=required.map(id=>{
  const rows=contract.groups.filter(g=>mapClass[g.template_class]===id);
  const representative=contract.routes.find(r=>mapClass[r.template_class]===id);
  return {id,state:rows.length?"OWNER_REVIEW":"NOT_STARTED",
   sample:{source_url:origin+(representative?.path||"/"),local_url:contract.local_origin+(representative?.path||"/"),
     analysis_ref:"Private Windows Local R2 template data contract",
     desktop_ref:"Private Windows Local R4 PC screenshot",
     mobile_ref:"Private Windows Local R4 mobile screenshot",auto_uat:"ENGINEERING_SMOKE_ONLY"},
   approval:{status:"PENDING",owner_message_ref:null,approved_at:null,template_sha256:null},
   batch:{expected:0,archived:0,verified:0,failed:0,offline_qa:"NOT_RUN"}};
 });
 return {schema_version:1,project_id:"local-wordpress-template-audit",
  source_origin:origin,local_origin:contract.local_origin,rights_verified:false,demo_only:true,
  scope:{mode:"FIRST_PAGE_CATALOG",blog_excluded:true,listing_max_page:1,product_details:"representative"},
  execution:{target_active_hours:48,active_hours_spent:0,owner_wait_hours:0},
  modules};
}
function syntheticQueue(factory){
 const modules=required.map((id,i)=>({
  id,state:i===0?"OWNER_PASS":"NOT_STARTED",
  sample:{source_url:"https://example-owned.test/",local_url:"http://fixture.local/",
    analysis_ref:"SYNTHETIC_TEST_ANALYSIS_REF",
    desktop_ref:"SYNTHETIC_TEST_DESKTOP_REF",
    mobile_ref:"SYNTHETIC_TEST_MOBILE_REF",auto_uat:i===0?"PASS":"NOT_RUN"},
  approval:{status:i===0?"PASS":"PENDING",
    owner_message_ref:i===0?"SYNTHETIC_OWNER_REFERENCE_DOES_NOT_GRANT_REAL_RIGHTS":null,
    approved_at:i===0?"2026-11-05T00:00:00Z":null,
    template_sha256:i===0?"b".repeat(64):null},
  batch:{expected:0,archived:0,verified:0,failed:0,offline_qa:"NOT_RUN"}
 }));
 const ledger={schema_version:1,project_id:"SYNTHETIC_FIXTURE_ONLY_DO_NOT_PUBLISH",
   source_origin:"https://example-owned.test",local_origin:"http://fixture.local",
   rights_verified:true,demo_only:false,
   scope:{mode:"FIRST_PAGE_CATALOG",blog_excluded:true,listing_max_page:1,product_details:"none"},
   execution:{target_active_hours:48,active_hours_spent:0,owner_wait_hours:0},modules};
 const routes=[{source_url:"https://example-owned.test/",local_path:"/",content_type:"home",status:"PENDING",
   source_sha256:"c".repeat(64),assets:[{source_url:"https://example-owned.test/img.png",local_path:"/img.png",sha256:"d".repeat(64)}]}];
 const p=factory(ledger,routes,"shared-shell");
 if(p.status!=="QUEUE_READY"||p.jobs.length!==1)throw Error("PR15_SYNTHETIC_FACTORY_REGRESSION");
 return {status:"SYNTHETIC_QUEUE_READY_ONLY",jobs:1,authorization:"NOT_REAL"};
}
async function main(){
 const o=parseArgs();
 for(const k of ["contract","receipt","browser"])ensureResearchPath(o[k]);
 const dest=ensureResearchPath(o.out);
 if(fs.existsSync(dest))throw Error("NEVER_OVERWRITE_RESEARCH_REPORT");
 const contract=readJSON(o.contract),receipt=readJSON(o.receipt),browser=readJSON(o.browser);
 if(contract.status!=="R2_DATA_CONTRACT_READY_NOT_FROZEN"||contract.allow_batch!==false||contract.owner_visual_pass!==false)
  throw Error("R2_AUTHORIZATION_BOUNDARY_FAILED");
 verifyReceipt(receipt);
 if(browser.total!==contract.routes.length*2||browser.passed!==browser.total||browser.site_writes!==0||browser.owner_visual_pass!==false)
  throw Error("R4_LOCAL_BROWSER_UAT_INCOMPLETE");
 const repo=path.resolve(o["factory-root"]);
 const factoryFile=path.join(repo,"skills","duplicate-site-skills","scripts","prepare-module-batch.mjs");
 if(!fs.existsSync(factoryFile))throw Error("REAL_PR15_FACTORY_MISSING");
 const {prepareModuleQueue}=await import(pathToFileURL(factoryFile).href);
 if(typeof prepareModuleQueue!=="function")throw Error("REAL_PR15_API_NOT_FOUND");
 const ledger=makeActualLedger(contract,browser,o["source-origin"]);
 const gates=[];
 for(const id of required){
  const result=prepareModuleQueue(ledger,[],id);
  if(result.status!=="BLOCKED")throw Error("REAL_OWNER_GATE_FAIL_OPEN:"+id);
  gates.push({module:id,status:result.status,reasons:result.reasons});
 }
 const proof=syntheticQueue(prepareModuleQueue);
 const report={schema:"svakom-r4-pr15-handoff/v1",
  status:"ENGINEERING_UAT_PASS__REAL_BATCH_BLOCKED_BY_PR15",
  site_writes:0,owner_visual_pass:false,real_batch_jobs:0,
  local_browser_pass:browser.passed,local_browser_total:browser.total,
  r2_route_count:contract.routes.length,r2_class_count:contract.groups.length,
  r3_built_files:receipt.files.length,pr15_factory_verified:true,
  synthetic_factory_test:proof,real_gates:gates,
  next_steps:["Owner template visual review PC/mobile","document approved rights and module SHA",
     "Use existing PR15 gate with real evidence before actual batch"]};
 fs.mkdirSync(path.dirname(dest),{recursive:true});
 fs.writeFileSync(dest,JSON.stringify(report,null,2)+"\n",{flag:"wx"});
 console.log(JSON.stringify({status:report.status,real_gates:gates.length,synthetic:proof.status,
   browser:report.local_browser_pass+"/"+report.local_browser_total,
   output:dest,site_writes:0}));
}
main().catch(e=>{console.error("R4_BLOCKED:"+e.message);process.exitCode=2;});