#!/usr/bin/env python3
"""Independently label *candidate* LanguageTool alerts in the frozen R6 sample.

This is a deterministic domain-glossary filter, not a Spanish human reviewer.
It does not remove alerts from the raw LanguageTool report or modify Spanish.
"""
import argparse
from bisect import bisect_right
from collections import Counter
from importlib.machinery import SourceFileLoader
import json
from pathlib import Path
import re
import sys

ROOT=Path(__file__).resolve().parent
r1=SourceFileLoader("byl_es_r6_lt_render",str(ROOT/"byl-es-render-qa.py")).load_module()
r2=SourceFileLoader("byl_es_r6_lt_engine",str(ROOT/"byl-es-linguistic-qa.py")).load_module()

def classify(rule,matched,source_block,spanish_context):
    word=matched.casefold().strip()
    english=source_block.casefold()
    if rule=="ANO" and word=="ano":
        anatomy_source=bool(re.search(r"\b(?:anus|anal|rectal|butthole|orifice)\b",english))
        anatomy_target=bool(re.search(r"\b(?:juguete|lubricacion|estimulacion|rectal)\b",r1.normalized(spanish_context)))
        if anatomy_source or anatomy_target:
            return "DOMAIN_FALSE_POSITIVE","Correct anatomical word ano, not calendar año"
        return "HUMAN_REVIEW","ANO might be a typo for año outside anatomy"
    if rule=="MORFOLOGIK_RULE_ES":
        if word in {"plug","plugs"} and (
                re.search(r"\b(?:butt plug|butt plugs|plug|anal)\b",english)
                or "anal" in r1.normalized(spanish_context)
                or "juguete" in r1.normalized(spanish_context)):
            return "DOMAIN_FALSE_POSITIVE","Recognized es-ES retail terminology plug anal / plugs anales"
        if word=="health" and "maze men" in english and "health" in english:
            return "DOMAIN_FALSE_POSITIVE","Verbatim proper name Maze Men's Health"
    if rule in {"SPANISH_WORD_REPEAT_BEGINNING_RULE","REP_IMPORTANTE","REP_USO"}:
        return "STYLE_NONBLOCKING","Read as style preference; not necessarily incorrect grammar"
    return "HUMAN_REVIEW","No safe glossary exception; keep original LanguageTool suggestion"

def run(sample):
    if (sample.get("post_id")!=37413 or sample.get("snapshot_type")!="OFFLINE_SAMPLED_DRAFT"
            or sample.get("www_writes")!=0 or sample.get("sampled_block_count")!=23):
        raise ValueError("R6 sample not verified")
    src=r1.blocks_from_html(sample["en_html"])
    target=r2.rendered_block_texts(sample["es_html"])
    if len(src)!=23 or len(target)!=23:raise ValueError("alignment drift")
    items=[]
    for group in r2.batches(target,8500):
        offsets=[];texts=[];pos=0
        for k,t in group:
            offsets.append((pos,k));texts.append(t);pos+=len(t)+2
        combined="\n\n".join(texts)
        for issue in r2.lt.inspect(combined,"http://127.0.0.1:8010/v2/check",timeout=45):
            off=issue["offset"];n=issue.get("length") or 0
            i=max(0,bisect_right([a for a,b in offsets],off)-1)
            k=offsets[i][1]
            matched=combined[off:off+n]
            status,reason=classify(issue["rule_id"],matched,src[k]["whole"],
                                   combined[max(0,off-65):off+n+65])
            items.append({"sample_block":k,"source_index":sample["indices"][k],
                          "rule_id":issue["rule_id"],"observed":matched,
                          "status":status,"reason":reason})
    return {"schema_version":"byl-es-v2-r6-lt-context-label-v1",
            "post_id":37413,"scope":"OFFLINE_SAMPLE_ONLY",
            "independent_human_review":False,
            "raw_alerts":len(items),
            "by_status":dict(Counter(x["status"] for x in items)),
            "actions_auto_applied":0,
            "www_writes":0,"items":items}

def main():
    p=argparse.ArgumentParser()
    p.add_argument("sample");p.add_argument("--output",required=True)
    a=p.parse_args()
    try:
        data=json.loads(Path(a.sample).read_text(encoding="utf-8"))
        r=run(data)
        Path(a.output).write_text(json.dumps(r,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
        print("LT_LOCAL_CLASSIFIED "+str(r["raw_alerts"])+" "+json.dumps(r["by_status"]))
    except (OSError,KeyError,ValueError) as e:
        print("LT_LOCAL_FAILED "+str(e),file=sys.stderr);raise SystemExit(2)
if __name__=="__main__":main()
