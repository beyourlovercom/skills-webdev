#!/usr/bin/env python3
"""Read-only LOCAL sampled A/B evaluator for a frozen new Dev article.

Old-style proxy = exact bilingual sample char coverage + structural check,
NOT an execution of the old QA95 production publisher. V2 = R1/R3 plus
independent local LanguageTool suggestions. Never makes publishing decisions.
"""
import argparse
from bisect import bisect_right
from collections import Counter
from importlib.machinery import SourceFileLoader
import hashlib
import json
from pathlib import Path
from statistics import median
from time import perf_counter
import re
import sys

ROOT=Path(__file__).resolve().parent
r1=SourceFileLoader("byl_es_r6_r1",str(ROOT/"byl-es-render-qa.py")).load_module()
r3=SourceFileLoader("byl_es_r6_r3",str(ROOT/"byl-es-fidelity-qa.py")).load_module()
r2=SourceFileLoader("byl_es_r6_r2",str(ROOT/"byl-es-linguistic-qa.py")).load_module()

SAMPLE_SHA="2a81ca1cab9a8c28dc475a5901d0b1217b318f6facd4eb3bc3882c880a1185d6"

def basic_guard(x):
    if (x.get("post_id")!=37413 or x.get("source_hash")!=SAMPLE_SHA
            or x.get("snapshot_type")!="OFFLINE_SAMPLED_DRAFT"
            or x.get("www_writes")!=0 or x.get("website_writes")!=0):
        raise ValueError("unapproved offline sample or source hash drift")
    if x.get("sampled_block_count")!=23 or x.get("completeness")!="SAMPLED_NOT_FULL_ARTICLE":
        raise ValueError("sample size drift")

def machine_report(x,terms,lt=True):
    basic_guard(x)
    blocks=r1.blocks_from_html(x["en_html"])
    target=r1.blocks_from_html(x["es_html"])
    if len(blocks)!=23 or len(target)!=23:
        raise ValueError("body block mismatch")
    baseline_chars=sum(len(b["whole"]) for b in blocks)
    # Every paragraph has non-empty Spanish; this is a PROXY only, not the
    # actual QA95 weighted dictionary matcher, nor a P0 pass.
    proxy_chars=sum(len(b["whole"]) for b,t in zip(blocks,target) if len(t["whole"])>=10)
    r1_t=[];r3_t=[]
    for _ in range(3):
        start=perf_counter();f1=r1.check(x);r1_t.append((perf_counter()-start)*1000)
        start=perf_counter();f3=r3.findings_for(x,terms);r3_t.append((perf_counter()-start)*1000)
    suggestions=[]
    lt_ms=None
    if lt:
        start=perf_counter()
        parts=r2.rendered_block_texts(x["es_html"])
        for group in r2.batches(parts,8500):
            starts=[];total=0;lines=[]
            for idx,txt in group:
                starts.append((total,idx))
                lines.append(txt)
                total+=len(txt)+2
            combined="\n\n".join(lines)
            raw=r2.lt.inspect(combined,"http://127.0.0.1:8010/v2/check",timeout=45)
            for m in raw:
                off=m.get("offset")
                if not isinstance(off,int):continue
                k=max(0,bisect_right([a for a,b in starts],off)-1)
                suggestions.append({"block_in_sample":starts[k][1],"rule_id":m["rule_id"],
                                    "message":m["message"][:190],"offset":off})
        lt_ms=round((perf_counter()-start)*1000,2)
    eswords=sum(len(re.findall(r"\b\w+\b",p["whole"],re.U)) for p in target)
    return {
        "post_id":37413,"source_sha256":SAMPLE_SHA,
        "blocks_sampled":len(blocks),"source_blocks_total":x["source_block_total"],
        "coverage_proxy_percent":round(100*proxy_chars/max(1,baseline_chars),2),
        "legacy_r9_executed":False,"legacy_p0_gate":"SOURCE_P0_REVIEW_REQUIRED",
        "r1_ms_median":round(median(r1_t),2),
        "r3_ms_median":round(median(r3_t),2),
        "lt_local_ms":lt_ms,
        "r1_findings":f1["findings_by_kind"],
        "r3_findings":f3["findings_by_kind"],
        "lt_rule_counts":dict(Counter(i["rule_id"] for i in suggestions)),
        "lt_suggestions":suggestions,
        "spanish_words_sampled":eswords,
        "linguistic_quality_native_human_score":None,
        "wording_fidelity_native_human_score":None,
        "manual_editor_minutes":None,
        "www_writes":0,"paid_google_calls":0,
    }

def main():
    ap=argparse.ArgumentParser()
    ap.add_argument("--sample",required=True)
    ap.add_argument("--termbank",required=True)
    ap.add_argument("--output",required=True)
    ap.add_argument("--no-local-lt",action="store_true")
    a=ap.parse_args()
    try:
        s=json.loads(Path(a.sample).read_text(encoding="utf-8"))
        terms=json.loads(Path(a.termbank).read_text(encoding="utf-8"))
        result=machine_report(s,terms,not a.no_local_lt)
        Path(a.output).write_text(json.dumps(result,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
        print("R6_OFFLINE_SAMPLE_CHECK_PASS blocks="+str(result["blocks_sampled"])
              +" LANG_WARNINGS="+str(sum(result["lt_rule_counts"].values()))
              +" WORDS="+str(result["spanish_words_sampled"]))
    except (OSError,ValueError,KeyError,TypeError) as e:
        print("R6_EVALUATION_REJECTED: "+str(e),file=sys.stderr)
        raise SystemExit(2)
if __name__=="__main__":
    main()
