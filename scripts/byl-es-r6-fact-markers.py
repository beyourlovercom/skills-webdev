#!/usr/bin/env python3
"""Non-model factual marker retention audit for a frozen 23-block Spanish SAMPLE.

Markers are predeclared from real English source blocks. Passing them is not
semantic equivalence, factual accuracy, QA95 P0 clearance, or full-article QA.
"""
from collections import Counter
from html import unescape
from importlib.machinery import SourceFileLoader
import argparse
import json
from pathlib import Path
import re
import sys
import unicodedata

P=Path(__file__).resolve().parent
r1=SourceFileLoader("byl_es_r6_fact_render",str(P/"byl-es-render-qa.py")).load_module()
CASES=[
 (8,"anal_juego",r"\banal\b"),
 (9,"plugs_sensacion_presion",r"presion"),
 (12,"base_ensanchada",r"base\s+ensanchada"),
 (13,"prevenir_retencion",r"\b(?:no|nunca)\b.*\b(?:desliz|debe|queremos)\b|\b(?:no\s+debe)\b.*\bdesliz"),
 (19,"historical_claims_qualified",r"(?:afirmaciones|supuestos)\b"),
 (24,"nerve_endings",r"terminaciones\s+nerviosas"),
 (33,"beginner_small",r"\b(?:pequeno|reducido)\b"),
 (39,"lubricant_and_toy",r"lubricante.*juguete"),
 (40,"water_based_and_silicone",r"base\s+acuosa.*silicona"),
 (44,"stop_when_pain",r"(?:dolor.*detente|detente.*dolor)"),
 (51,"remove_gently",r"retira.*(?:despacio|suavidad)"),
 (58,"importance_lube",r"lubricante"),
 (60,"flared_base_required",r"base\s+ensanchada"),
 (66,"silicone_nonporous",r"silicona.*no\s+porosa"),
 (69,"flared_base_repeated",r"base.*ensanchada"),
 (71,"slow_progress_small",r"pequenos.*(?:forzar|apresurar|prisa)"),
 (79,"clean_before_after",r"antes\s+y\s+despues"),
 (81,"dry_before_storage",r"(?:secalo|seco).*guard"),
 (91,"doctor_proper_name",r"dr[.]\s+michael\s+a[.]\s+werner,\s+md"),
 (91,"maze_mens_health",r"maze\s+men.s\s+health")
]
def fold(t):
    t=unicodedata.normalize("NFKD",unescape(t)).casefold()
    return "".join(x for x in t if not unicodedata.combining(x))
def check(s):
    if s.get("post_id")!=37413 or s.get("snapshot_type")!="OFFLINE_SAMPLED_DRAFT" or s.get("source_hash")!="2a81ca1cab9a8c28dc475a5901d0b1217b318f6facd4eb3bc3882c880a1185d6":
        raise ValueError("not an immutable benchmark sample")
    ids={v:i for i,v in enumerate(s["indices"])}
    tgt=r1.blocks_from_html(s["es_html"])
    src=r1.blocks_from_html(s["en_html"])
    if len(tgt)!=23 or len(src)!=23:
        raise ValueError("source block count drift")
    rows=[]
    for idx,name,pattern in CASES:
        if idx not in ids:raise ValueError("sample missing required fact")
        i=ids[idx]
        present=bool(re.search(pattern,fold(tgt[i]["whole"])))
        rows.append({"source_index":idx,"fact_marker":name,"present_in_spanish":present})
    good=sum(x["present_in_spanish"] for x in rows)
    return {"post_id":37413,"source_sha256":s["source_hash"],
            "sample_only":True,"marker_count":len(rows),
            "marker_retention_count":good,
            "marker_retention_pct":round(100*good/len(rows),2),
            "semantic_fidelity_certified":False,
            "source_p0_contradiction_block13":"PENDING_SOURCE_EDITOR_CORRECTION",
            "independent_human_review":"PENDING",
            "www_writes":0,
            "markers":rows}
def main():
    p=argparse.ArgumentParser()
    p.add_argument("sample");p.add_argument("--output",required=True)
    a=p.parse_args()
    try:
        s=json.loads(Path(a.sample).read_text(encoding="utf-8"))
        r=check(s)
        Path(a.output).write_text(json.dumps(r,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
        print(f"R6_FACT_MARKERS {r['marker_retention_count']}/{r['marker_count']}")
    except (OSError,ValueError,KeyError) as e:
        print("R6_FACT_REJECTED "+str(e),file=sys.stderr);raise SystemExit(2)
if __name__=="__main__":
    main()
