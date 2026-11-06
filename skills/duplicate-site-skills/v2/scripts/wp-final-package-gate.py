#!/usr/bin/env python3
"""Post-completion CSS/JS ONE-BATCH promotion gate for authorized local clones.

Engineering preview builds are allowed in private scratch earlier, but a
final release/build promotion is BLOCKED until ALL in-scope pages are done,
Owner-approved source fidelity and full local browser/canary checks pass.
This gate never packages/publishes files and cannot confer Owner approval.
"""
import argparse, hashlib, json, pathlib, sys
from urllib.parse import urlparse

def safe_path(p):
 if not isinstance(p,str) or not p.startswith("/") or p.startswith("//") or "\\" in p or ".." in p or "?" in p or "#" in p:return False
 return True
def has_ref(v):
 return isinstance(v,str) and len(v.strip())>=16 and v.strip().lower() not in ("pass","approved","continue")
def evaluate(site,contract,browser,canary,reference=None):
 reasons=[]
 if site.get("schema")!="wp-site-completion/v1":reasons.append("INVALID_COMPLETION_LEDGER")
 if site.get("build_policy")!="ONE_FINAL_CSS_JS_BATCH_AFTER_ALL_PAGES":reasons.append("FINAL_BATCH_POLICY_MISSING")
 if site.get("site_complete") is not True:reasons.append("SITE_NOT_COMPLETE")
 if site.get("scope_inventory_complete") is not True:reasons.append("SCOPE_INVENTORY_NOT_COMPLETE")
 if site.get("owner_acceptance",{}).get("status")!="PASS" or not has_ref(site.get("owner_acceptance",{}).get("evidence_ref")):
  reasons.append("OWNER_FINAL_ACCEPTANCE_MISSING")
 if contract.get("schema")!="wordpress-template-data-contract/v1" or contract.get("allow_batch") is not False:
  reasons.append("R2_CONTRACT_INVALID_OR_PREAUTHORIZED")
 inventory=site.get("routes",[])
 if not isinstance(inventory,list) or not inventory or not all(isinstance(x,dict) for x in inventory):
  reasons.append("INVENTORY_INVALID")
  inventory=[]
 paths=[x.get("path") for x in inventory]
 if any(not safe_path(p) for p in paths) or len(set(paths))!=len(paths):
  reasons.append("INVENTORY_ROUTE_DUPLICATE_OR_UNSAFE")
 if site.get("expected_route_count")!=len(inventory):reasons.append("INVENTORY_DENOMINATOR_MISMATCH")
 if any(x.get("state")!="OWNER_VISUAL_PASS" or not has_ref(x.get("owner_evidence_ref")) or
        not isinstance(x.get("visual_similarity"),(int,float)) or x.get("visual_similarity")<0.97
        for x in inventory):reasons.append("INVENTORY_NOT_ALL_VISUAL_PASS")
 samples=[x.get("path") for x in contract.get("routes",[])]
 if not samples or any(p not in paths for p in samples):reasons.append("SAMPLE_OUTSIDE_FINAL_SCOPE")
 if browser.get("passed")!=browser.get("total") or browser.get("total")!=len(samples)*2 or browser.get("site_writes")!=0:
  reasons.append("LOCAL_BROWSER_UAT_NOT_COMPLETE")
 if browser.get("owner_visual_pass") is not False:reasons.append("BROWSER_ARTIFACT_AUTHORITY_INVALID")
 if canary.get("passed")!=canary.get("total") or canary.get("total")!=len(samples)*2 or canary.get("site_writes")!=0 or canary.get("published") is not False:
  reasons.append("STAGED_BUILD_CANARY_NOT_COMPLETE")
 if not canary.get("manifest_entries"):reasons.append("STAGED_ASSET_MANIFEST_EMPTY")
 if not isinstance(reference,dict):
  reasons.append("SOURCE_VISUAL_EVIDENCE_MISSING")
 else:
  checked=[x for x in reference.get("pairs",[]) if x.get("comparable")]
  if not checked or not all(x.get("diff",{}).get("rgb_similarity",0)>=0.97 for x in checked):
   reasons.append("REFERENCE_VISUAL_BELOW_THRESHOLD_OR_UNAVAILABLE")
  if reference.get("owner_approved") is not True:reasons.append("SOURCE_REFERENCE_OWNER_APPROVAL_MISSING")
  if site.get("expected_reference_views")!=len(reference.get("pairs",[])):
   reasons.append("REFERENCE_SCOPE_DENOMINATOR_MISMATCH")
 if any(x.get("h1_count",0)<1 or x.get("main_text_chars",0)<75 or x.get("result")!="PASS" for x in browser.get("views",[])):
  reasons.append("CONTENT_SEMANTIC_OR_PAGE_INTEGRITY_OPEN")
 reasons=sorted(set(reasons))
 return {
  "schema":"wp-final-batch-gate/v1",
  "status":"FINAL_CSS_JS_BATCH_RELEASE_ALLOWED_BY_EVIDENCE_ONLY" if not reasons else "BLOCKED_FINAL_BATCH",
  "reasons":reasons,
  "release_site_writes":0,
  "final_bundle_count_allowed":1 if not reasons else 0,
  "notes":"This gate alone never changes website/owner approvals; publication still requires separate authorization."
 }
def main():
 p=argparse.ArgumentParser()
 for n in ("completion","contract","browser","canary","reference","out"):p.add_argument("--"+n,required=True)
 a=p.parse_args()
 out=pathlib.Path(a.out).resolve()
 if "_research" not in out.parts or out.exists():raise ValueError("PRIVATE_NEW_REPORT_ONLY")
 vals=[json.loads(pathlib.Path(getattr(a,n)).read_text(encoding="utf-8-sig")) for n in ("completion","contract","browser","canary","reference")]
 res=evaluate(*vals)
 out.parent.mkdir(parents=True,exist_ok=True)
 out.write_text(json.dumps(res,indent=2,ensure_ascii=False),encoding="utf-8")
 print(json.dumps({"status":res["status"],"reasons":res["reasons"],"report":str(out),"site_writes":0}))
 return 2 if res["reasons"] else 0
if __name__=="__main__":
 try:raise SystemExit(main())
 except (ValueError,OSError,KeyError,json.JSONDecodeError) as ex:raise SystemExit("FINAL_BATCH_BLOCKED:"+str(ex))