#!/usr/bin/env python3
"""Paired A/B technical latency ONLY, on identical 23-block source.

Warm-up and alternating AB/BA reduce cache-order artifacts. This does not
measure translation, editing, human review, or R9 publishing time. No WP writes.
"""
import argparse
from collections import defaultdict
from importlib.machinery import SourceFileLoader
import json
from pathlib import Path
from statistics import median
from time import perf_counter
import sys

R=Path(__file__).resolve().parent
a=SourceFileLoader("byl_r6_pair_eval",str(R/"byl-es-r6-evaluate-sample.py")).load_module()
r1=SourceFileLoader("byl_r6_pair_r1",str(R/"byl-es-render-qa.py")).load_module()
r3=SourceFileLoader("byl_r6_pair_r3",str(R/"byl-es-fidelity-qa.py")).load_module()
lt=SourceFileLoader("byl_r6_pair_r2",str(R/"byl-es-linguistic-qa.py")).load_module()

def one(s,terms,with_lt=True):
    a.basic_guard(s)
    t=perf_counter()
    x=r1.check(s)
    s1=(perf_counter()-t)*1000
    t=perf_counter()
    y=r3.findings_for(s,terms)
    s3=(perf_counter()-t)*1000
    s2=None
    if with_lt:
        t=perf_counter()
        for group in lt.batches(lt.rendered_block_texts(s["es_html"]),8500):
            text="\n\n".join(v for _,v in group)
            lt.lt.inspect(text,"http://127.0.0.1:8010/v2/check",timeout=30)
        s2=(perf_counter()-t)*1000
    return {"r1_ms":round(s1,3),"r3_ms":round(s3,3),
            "local_lt_ms":round(s2,3) if s2 is not None else None,
            "findings_count":x["findings_count"]+y["findings_count"]}

def paired(A,B,terms,with_lt=True):
    a.basic_guard(A);a.basic_guard(B)
    if A["en_html"]!=B["en_html"] or A["source_hash"]!=B["source_hash"]:
        raise ValueError("Not the exact same source English and SHA")
    # warm both to reduce LT Java class-loading and memory/cache effects
    one(A,terms,with_lt)
    one(B,terms,with_lt)
    rows=[]
    for arm in ("A","B","B","A","A","B","B","A"):
        s=A if arm=="A" else B
        rows.append({"arm":arm,**one(s,terms,with_lt)})
    median_by={}
    for name in ("A","B"):
        subset=[r for r in rows if r["arm"]==name]
        median_by[name]={k:round(median(row[k] for row in subset),3)
                         for k in ("r1_ms","r3_ms","local_lt_ms") if subset[0][k] is not None}
    return {"schema_version":"byl-es-v2-r6-paired-local-latency-v1",
            "sample_blocks":23,"source_hash":A["source_hash"],
            "same_original_english":True,
            "timed_invocations":len(rows),"warmup_both":True,
            "execution_order":"ABBAABBA","median_by_variant":median_by,
            "human_translation_minutes":None,"human_review_minutes":None,
            "old_qa95_execution_minutes":None,
            "not_production_productivity_benchmark":True,
            "independent_human_review":False,
            "www_writes":0,"rows":rows}

def main():
    p=argparse.ArgumentParser()
    p.add_argument("--a",required=True);p.add_argument("--b",required=True)
    p.add_argument("--termbank",required=True);p.add_argument("--output",required=True)
    p.add_argument("--no-lt",action="store_true")
    args=p.parse_args()
    try:
        A=json.loads(Path(args.a).read_text(encoding="utf-8"))
        B=json.loads(Path(args.b).read_text(encoding="utf-8"))
        terms=json.loads(Path(args.termbank).read_text(encoding="utf-8"))
        res=paired(A,B,terms,not args.no_lt)
        Path(args.output).write_text(json.dumps(res,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
        print("R6_PAIRED_LOCAL_TIMING_PASS ABBAABBA LT="+str(not args.no_lt)+" "+json.dumps(res["median_by_variant"]))
        return 0
    except (OSError,ValueError,KeyError,TypeError) as e:
        print("R6_PAIRED_LATENCY_FAILED: "+str(e),file=sys.stderr);return 2
if __name__=="__main__":
    sys.exit(main())
