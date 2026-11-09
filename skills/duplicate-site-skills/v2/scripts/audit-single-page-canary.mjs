#!/usr/bin/env node
/**
 * R7 single-page media and variable-content evidence, reusing existing V2
 * media planner. It audits one previously authorized SiteOne page offline;
 * it never fetches URLs, renders a new page, or changes the source mirror.
 */
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import {fileURLToPath} from "node:url";
import {planMissing} from "./complete-offline-media.mjs";

const sha=b=>crypto.createHash("sha256").update(b).digest("hex");
const under=(root,x)=>{
 const r=fs.realpathSync(root),t=fs.realpathSync(x);
 if(t===r||!t.startsWith(r+path.sep))throw Error("OUTSIDE_PRIVATE_UAT");
 return t;
};
const count=(s,re)=>[...s.matchAll(re)].length;
export function auditSingleExport({workspace,exportRoot,manifest,relativeHtml,
    sourceRoute,sourceBaseline=null}){
 const project=fs.realpathSync(path.resolve(workspace));
 const uat=path.join(project,"uat");
 if(!fs.existsSync(uat))throw Error("PROJECT_UAT_MISSING");
 const r=under(uat,exportRoot);
 const m=JSON.parse(fs.readFileSync(manifest,"utf8"));
 if(m.schema_version!==2||m.execution?.scope!=="PILOT_SAMPLES"||
    m.execution?.enable_bulk!==false||m.rights?.owner_attested!==true)
   throw Error("APPROVED_SINGLE_PAGE_SCOPE_INVALID");
 if(m.source?.samples?.length!==1||m.source.samples[0]?.path!==sourceRoute)
   throw Error("EXACT_ONE_SOURCE_PAGE_ONLY");
 const url=new URL(sourceRoute,"https://www.rapiddirect.com");
 if(url.href!=="https://www.rapiddirect.com/services/cnc-milling/")
   throw Error("OTHER_PAGE_SCOPE_REQUIRES_NEW_APPROVAL");
 if(relativeHtml!=="services/cnc-milling/index.html")
   throw Error("EXACT_CANARY_HTML_REQUIRED");
 const htmlFile=path.join(r,"mirror",...relativeHtml.split("/"));
 if(!fs.existsSync(htmlFile))throw Error("CANARY_HTML_MISSING");
 const bytes=fs.readFileSync(htmlFile);
 const html=bytes.toString("utf8");
 const result=planMissing({workspace:r,manifest});
 const previous=path.join(r,"media-completion-report.json");
 const statuses=new Map();
 if(fs.existsSync(previous)){
   const data=JSON.parse(fs.readFileSync(previous,"utf8"));
   for(const row of data.outcomes||[])statuses.set(row.path,row);
 }
 const missing=result.missing.map(x=>({
   path:x.path,original_status:statuses.get(x.path)?.error||"NOT_ATTEMPTED",
   category:(statuses.get(x.path)?.error==="HTTP_404"?"SOURCE_404":"RETRYABLE_MISSING")
 }));
 const source404=missing.filter(x=>x.category==="SOURCE_404");
 const retry=missing.filter(x=>x.category!=="SOURCE_404");
 const browserProof=sourceBaseline&&fs.existsSync(sourceBaseline)?
    JSON.parse(fs.readFileSync(sourceBaseline,"utf8")):null;
 return {
   status:"SINGLE_PAGE_AUDITED",
   authorized_source_url:url.href,
   route_count:1,bulk_enabled:false,site_writes:0,source_requests:0,
   html_sha256:sha(bytes),html_bytes:bytes.length,
   html:{
     section_tags:count(html,/<section\b/gi),
     img_tags:count(html,/<img\b/gi),
     swiper_slide_class_occurrences:count(html,/\bswiper-slide\b/gi),
     forms:count(html,/<form\b/gi),
     card_class_occurrences:count(html,/\b(?:card|product-card|feature-card|elementor-loop-item)\b/gi),
     note:"card counts are source-content observations; no fixed cardinality or rewriting"
   },
   resources:{
    unique_referenced:result.unique_assets,
    present:result.unique_assets-missing.length,
    missing:missing.length,nonretryable_source_404:source404.length,
    retryable_missing:retry.length,
    failed_only_retry_urls:retry.map(x=>x.path),
    nonretryable_paths:source404.map(x=>x.path),
    extra_runtime_asset_inventory_required:true
   },
   captured_browser_runs:browserProof?.length??null,
   module_match:"SHARED_HEADER_FOOTER_BUT_DIFFERENT_BODY",
   generalized_template_ready:false,
   next:"Owner visual + interaction UAT; do not force CNC Machining body shape onto CNC Milling"
 };
}
async function main(){
 const opts={};
 for(const arg of process.argv.slice(2)){
  if(arg==="--execute")opts.execute=true;
  else {const m=arg.match(/^--(workspace|export-root|manifest|out|browser-proof)=(.+)$/);
    if(!m)throw Error("Unknown argument "+arg);opts[m[1]]=m[2];}
 }
 if(!opts.workspace||!opts["export-root"]||!opts.manifest)throw Error("Missing workspace/export-root/manifest");
 const result=auditSingleExport({
  workspace:opts.workspace,exportRoot:opts["export-root"],manifest:opts.manifest,
  relativeHtml:"services/cnc-milling/index.html",
  sourceRoute:"/services/cnc-milling/",sourceBaseline:opts["browser-proof"]
 });
 if(opts.execute){
  if(!opts.out)throw Error("--out required for --execute");
  const root=path.resolve(opts.workspace,"uat");
  const dest=path.resolve(opts.out);
  if(!dest.startsWith(root+path.sep)||fs.existsSync(dest))
    throw Error("UNSAFE_OR_EXISTING_PRIVATE_REPORT");
  fs.mkdirSync(path.dirname(dest),{recursive:true});
  fs.writeFileSync(dest,JSON.stringify(result,null,2)+"\n",{flag:"wx"});
 }
 console.log(JSON.stringify(result,null,2));
}
if(process.argv[1]&&fileURLToPath(import.meta.url)===path.resolve(process.argv[1]))
 main().catch(e=>{console.error(e.message);process.exitCode=2});
