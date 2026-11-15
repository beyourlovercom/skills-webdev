#!/usr/bin/env python3
"""Time read-only BYL ES V2 diagnostics. NOT old-vs-new human editing time."""
from __future__ import annotations
import argparse
from importlib.machinery import SourceFileLoader
import json
from pathlib import Path
from statistics import median
import sys
from time import perf_counter

ROOT=Path(__file__).resolve().parent
r1=SourceFileLoader("byl_es_profile_r1",str(ROOT/"byl-es-render-qa.py")).load_module()
r3=SourceFileLoader("byl_es_profile_r3",str(ROOT/"byl-es-fidelity-qa.py")).load_module()
r2=SourceFileLoader("byl_es_profile_r2",str(ROOT/"byl-es-linguistic-qa.py")).load_module()

def measure(fn):
    s=perf_counter()
    result=fn()
    return round((perf_counter()-s)*1000,2),result


def run(article_dir,termbank,ids,lt_enabled,repeat=3):
    if repeat<1 or repeat>5:
        raise ValueError("repeat count must be 1..5")
    terms=json.loads(Path(termbank).read_text(encoding="utf-8"))
    output=[]
    for pid in ids:
        path=Path(article_dir)/f"BYL_ES_V2_R1_snapshot_{pid}_20261115.json"
        snap=json.loads(path.read_text(encoding="utf-8"))
        if snap.get("post_id")!=pid or snap.get("snapshot_type")!="DEV_READ_ONLY_RENDER":
            raise ValueError("Only authenticated Dev snapshots allowed")
        if snap.get("www_writes")!=0 or snap.get("google_calls")!=0:
            raise ValueError("Side effects in snapshot")
        r1_ms=[]
        r3_ms=[]
        for _ in range(repeat):
            a,out1=measure(lambda:r1.check(snap))
            b,out3=measure(lambda:r3.findings_for(snap,terms))
            r1_ms.append(a);r3_ms.append(b)
        lt_ms,lt_count=None,None
        if lt_enabled:
            lt_ms,lt=measure(lambda:r2.review(snap))
            lt_count=lt["matches"]
        output.append({
            "post_id":pid,"source_sha256":snap["source_hash"],
            "r1_median_ms":round(median(r1_ms),2),
            "r3_median_ms":round(median(r3_ms),2),
            "lt_real_local_ms":lt_ms,
            "r1_findings":out1["findings_count"],
            "r3_findings":out3["findings_count"],
            "lt_proposals":lt_count,
            "true_editorial_edit_time_ms":None,
        })
    return {
       "schema_version":"byl-es-v2-local-technical-speed-v1",
       "scope":"DEV_SNAPSHOTS_LOCAL_ONLY",
       "processor":"007windows",
       "runs_per_deterministic_stage":repeat,
       "r2_real_language_tool":lt_enabled,
       "old_qa95_human_baseline":"NOT_MEASURED",
       "new_v2_human_editorial_time":"NOT_MEASURED",
       "relative_production_speed":"NOT_DEMONSTRATED",
       "timings_exclude_snapshot_collection_translation_edit_review_release":True,
       "www_writes":0,"paid_google_calls":0,
       "results":output,
    }

def main():
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument("--private-snapshots",required=True)
    p.add_argument("--termbank",required=True)
    p.add_argument("--posts",default="38395,38427,38547,38587,38607,38628")
    p.add_argument("--repeat",type=int,default=3)
    p.add_argument("--with-local-lt",action="store_true")
    p.add_argument("--output",required=True)
    a=p.parse_args()
    try:
        ids=[int(x) for x in a.posts.split(",")]
        obj=run(a.private_snapshots,a.termbank,ids,a.with_local_lt,a.repeat)
        Path(a.output).write_text(json.dumps(obj,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
        print("LOCAL_PROFILE_DONE posts="+str(len(ids))+" LT="+str(a.with_local_lt))
        return 0
    except (OSError,ValueError,KeyError,TypeError,json.JSONDecodeError) as e:
        print("LOCAL_PROFILE_FAILURE: "+str(e),file=sys.stderr)
        return 2

if __name__=="__main__":
    sys.exit(main())
