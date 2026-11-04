#!/usr/bin/env node
/**
 * PR15 -> V2 data renderer handoff. Never independently creates a batch.
 * Default dry run; an authorized PR15 QUEUE_READY + explicit per-URL data
 * manifest and private UAT output are necessary before any local rendering.
 */
import fs from "node:fs";
import path from "node:path";
import {pathToFileURL, fileURLToPath} from "node:url";
import crypto from "node:crypto";
import {spawnSync} from "node:child_process";

const sha=b=>crypto.createHash("sha256").update(b).digest("hex");
const parse=file=>JSON.parse(fs.readFileSync(file,"utf8"));
const safeRel=(base,p)=>{
 const resolved=path.resolve(base,"."+p);
 if(!p.startsWith("/")||p.startsWith("//")||p.includes("..")||p.includes("\\")||
   !resolved.startsWith(path.resolve(base)+path.sep))throw Error("UNSAFE_OUTPUT_ROUTE");
 return resolved;
};
const checkDir=(base,p)=>{
 const abs=path.resolve(p),root=fs.realpathSync(base);
 if(abs!==root&&!abs.startsWith(root+path.sep))throw Error("OUTSIDE_PRIVATE_UAT");
 return abs;
};

export async function planWithPr15({factoryRoot,pr15Ledger,routeList,moduleId,
  ownerCandidate,mapping,changesByUrl,approvedUrls,workspace}){
 const factoryFile=path.resolve(factoryRoot,"skills/duplicate-site-skills/scripts/prepare-module-batch.mjs");
 if(!fs.existsSync(factoryFile))throw Error("PR15_REAL_FACTORY_MISSING");
 const {prepareModuleQueue}=await import(pathToFileURL(factoryFile).href);
 if(typeof prepareModuleQueue!=="function")throw Error("PR15_API_MISSING");
 const queue=prepareModuleQueue(pr15Ledger,routeList,moduleId);
 if(queue.status!=="QUEUE_READY")
   return {status:"BLOCKED_BY_PR15",module:moduleId,
    reasons:queue.reasons||[],jobs:0,site_writes:0,source_requests:0};
 if(ownerCandidate?.bulk_enabled!==false||ownerCandidate?.production_writes!==false)
   throw Error("V2_OWNER_LEDGER_SCOPE_CHANGED");
 if(!Array.isArray(approvedUrls)||!approvedUrls.length)throw Error("EXPLICIT_SCOPE_ALLOWLIST_REQUIRED");
 if(!mapping||mapping.is_generalized_template!==true||mapping.batch_authorized!==true)
   return {status:"BLOCKED_MISSING_VALIDATED_GENERALIZED_TEMPLATE",
     module:moduleId,jobs:queue.jobs.length,site_writes:0,source_requests:0};
 const module=pr15Ledger.modules.find(x=>x.id===moduleId);
 if(!module||!module.approval||module.approval.template_sha256!==mapping.template_sha256)
   throw Error("FROZEN_TEMPLATE_SHA_MISMATCH");
 const frozen=ownerCandidate.templates.find(x=>x.template_id===moduleId);
 if(!frozen||frozen.owner_visual_pass!==true||frozen.reference_freeze_state!=="FROZEN_REFERENCE")
   throw Error("OWNER_TEMPLATE_REFERENCE_NOT_APPROVED");
 const reference=fs.readFileSync(frozen.frozen_reference_local_file);
 if(sha(reference)!==frozen.frozen_reference_sha256||
    frozen.frozen_reference_sha256!==mapping.source_sha256)
   throw Error("FROZEN_REFERENCE_OR_MAPPING_SHA_DRIFT");
 const localRoot=checkDir(workspace,path.join(workspace,"uat"));
 const scratch=path.join(localRoot,"r6-queue-preview",moduleId);
 const allow=new Set(approvedUrls);
 const jobs=[];
 for(const job of queue.jobs){
   if(!allow.has(job.source_url))throw Error("OUT_OF_APPROVED_URL_SCOPE");
   const changes=changesByUrl?.[job.source_url];
   if(!changes||typeof changes!=="object"||!Object.keys(changes).length)
     throw Error("MISSING_VERIFIED_DATA_FIELDS:"+job.source_url);
   if(job.action==="RETRY_MISSING_ONLY" && !job.assets?.length)
     throw Error("FAILED_JOB_WITHOUT_ASSET_PROOF");
   const dest=safeRel(scratch,job.local_path.endsWith("/")?job.local_path+"index.html":job.local_path);
   if(!dest.endsWith(".html"))throw Error("NON_HTML_OUTPUT_REFUSED");
   const assetCount=job.assets?.length||0;
   if(assetCount===0)throw Error("ASSET_DENOMINATOR_MISSING");
   // PR15 validates manifest syntax, not actual bytes. The adapter must
   // verify every referenced local asset against the recorded digest before
   // rendering. Do not re-download or invent placeholder assets.
   const assetRoot=path.resolve(workspace,"mirror");
   for(const asset of job.assets){
     const local=asset.local_path;
     if(typeof local!=="string"||!local.startsWith("/")||local.startsWith("//")||
         local.includes("..")||local.includes("\"))
       throw Error("UNSAFE_ASSET_PATH");
     const target=path.resolve(assetRoot,"."+local);
     if(!target.startsWith(assetRoot+path.sep)||!fs.existsSync(target)||
         !fs.realpathSync(target).startsWith(fs.realpathSync(assetRoot)+path.sep))
       throw Error("ASSET_NOT_CACHED_OR_ESCAPE:"+local);
     if(sha(fs.readFileSync(target))!==asset.sha256)
       throw Error("ASSET_SHA_DRIFT:"+local);
   }
   jobs.push({source_url:job.source_url,output:dest,
     action:job.action,asset_count:assetCount,
     changes,sha256_original:job.original_html_sha256});
 }
 return {status:"QUEUE_MAPPED_DRY_RUN",module:moduleId,jobs,
   totals:{jobs:jobs.length,assets:queue.asset_urls_deduplicated,already_verified:queue.skipped_count},
   src_map:mapping.source_file,template_sha256:mapping.template_sha256,
   site_writes:0,source_requests:0,private_scratch:scratch};
}
export function runScratchJobs({plan,pythonExe,mapperScript,ownerLedgerPath,mappingPath,execute=false}){
 if(plan.status!=="QUEUE_MAPPED_DRY_RUN")throw Error("QUEUE_NOT_AUTHORIZED");
 const base=path.dirname(path.resolve(ownerLedgerPath));
 if(path.basename(base).toLowerCase()!=="uat")throw Error("OWNER_LEDGER_MUST_BE_PRIVATE_UAT");
 if(!plan.private_scratch.startsWith(base+path.sep))throw Error("SCRATCH_OUTSIDE_PRIVATE_UAT");
 const result=[];
 for(const job of plan.jobs){
   const changeFile=path.join(plan.private_scratch,"_changes",sha(job.source_url)+".json");
   if(execute){
    fs.mkdirSync(path.dirname(changeFile),{recursive:true});
    if(fs.existsSync(job.output)||fs.existsSync(changeFile))
      throw Error("PILOT_OUTPUT_EXISTS_NO_OVERWRITE");
    fs.writeFileSync(changeFile,JSON.stringify(job.changes,null,2),{flag:"wx"});
   }
   const cmd=[mapperScript,"render","--source",plan.src_map,
     "--sample",({ "shared-shell":"home","catalog-listings":"services","content-services":"cnc"})[plan.module],
     "--ledger",ownerLedgerPath,"--scratch-root",plan.private_scratch,
     "--mapping",mappingPath,"--changes",changeFile,"--output",job.output];
   if(execute)cmd.push("--execute");
   if(!execute){result.push({route:job.source_url,status:"WOULD_RENDER_SCRATCH_ONLY"});continue;}
   const run=spawnSync(pythonExe,cmd,{encoding:"utf8",timeout:90000,windowsHide:true});
   if(run.status!==0){
     result.push({route:job.source_url,status:"FAILED",error:(run.stderr||run.stdout||"").slice(0,380)});
     break; // deterministic failed-only retry is recorded below
   }
   result.push({route:job.source_url,status:"RENDERED_SCRATCH_ONLY",output:job.output});
 }
 const failed=result.filter(x=>x.status==="FAILED").map(x=>x.route);
 return {status:failed.length?"PARTIAL_FAILURE":"PASS",
   results:result,failed_only_retry_urls:failed,
   local_outputs:result.filter(x=>x.status==="RENDERED_SCRATCH_ONLY").length,
   site_writes:0,source_requests:0,execute};
}
async function main(){
 const opts={};
 for(const arg of process.argv.slice(2)){
  if(arg==="--execute")opts.execute=true;
  else{const m=arg.match(/^--(factory-root|pr15-ledger|routes|module|owner-ledger|mapping|changes|allowlist|workspace|python|mapper)=(.+)$/);
   if(!m)throw Error("Unknown argument: "+arg);opts[m[1]]=m[2];}
 }
 for(const name of ["factory-root","pr15-ledger","routes","module","owner-ledger","mapping","changes","allowlist","workspace"])
  if(!opts[name])throw Error("Missing --"+name);
 const plan=await planWithPr15({factoryRoot:opts["factory-root"],
   pr15Ledger:parse(opts["pr15-ledger"]),routeList:parse(opts.routes),moduleId:opts.module,
   ownerCandidate:parse(opts["owner-ledger"]),mapping:parse(opts.mapping),
   changesByUrl:parse(opts.changes),approvedUrls:parse(opts.allowlist),workspace:opts.workspace});
 if(plan.status!=="QUEUE_MAPPED_DRY_RUN"||!opts.execute){console.log(JSON.stringify(plan,null,2));return;}
 if(!opts.python||!opts.mapper)throw Error("--python and --mapper required for --execute");
 const result=runScratchJobs({plan,pythonExe:opts.python,mapperScript:opts.mapper,
   ownerLedgerPath:opts["owner-ledger"],mappingPath:opts.mapping,execute:true});
 console.log(JSON.stringify(result,null,2));
 if(result.status!=="PASS")process.exitCode=3;
}
if(process.argv[1]&&fileURLToPath(import.meta.url)===path.resolve(process.argv[1]))
 main().catch(e=>{console.error(e.message);process.exitCode=2});
