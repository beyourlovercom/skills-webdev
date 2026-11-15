#!/usr/bin/env python3
"""Local-only review-evidence extractor, never writes WordPress or Git source content."""
from collections import Counter
from importlib.machinery import SourceFileLoader
import argparse
import json
from pathlib import Path

render=SourceFileLoader("byl_es_render_qa_r4", str(Path(__file__).with_name("byl-es-render-qa.py"))).load_module()

def main():
    p=argparse.ArgumentParser()
    p.add_argument("snapshot")
    p.add_argument("--render",required=True)
    p.add_argument("--fidelity",required=True)
    p.add_argument("--lt",required=True)
    p.add_argument("--max",type=int,default=35)
    a=p.parse_args()
    snap=json.loads(Path(a.snapshot).read_text(encoding="utf-8"))
    src=render.blocks_from_html(snap["en_html"])
    target=render.blocks_from_html(snap["es_html"])
    reports=[("RENDER",a.render),("FACTS",a.fidelity),("LANG",a.lt)]
    out=[]
    for label,filename in reports:
        d=json.loads(Path(filename).read_text(encoding="utf-8"))
        for issue in (d.get("findings") or [])[:a.max]:
            i=issue.get("block",-1)
            en=src[i]["whole"] if isinstance(i,int) and 0<=i<len(src) else ""
            es=target[i]["whole"] if isinstance(i,int) and 0<=i<len(target) else ""
            out.append({"stage":label,"kind":issue.get("kind") or issue.get("rule_id"),
                        "priority":issue.get("priority") or issue.get("severity"),
                        "block":i,"issue":{k:v for k,v in issue.items() if k in
                            ["source_number","source_name","source_term","source_sku",
                             "message","rule_id","actual_raw"]},
                        "en":en[:225],"es":es[:225]})
    print(json.dumps({"post_id":snap["post_id"],"evidence":out,
                      "source_hash":snap.get("source_hash")},ensure_ascii=True))
if __name__=="__main__":
    main()
