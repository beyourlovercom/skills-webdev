#!/usr/bin/env python3
"""Create a blind, independently scorable Spanish editorial sample packet.

No identifiers revealing which candidate is V2 in the reviewer-facing packet.
Keep true answer key separately in the private Windows runtime, never Git/Notion.
"""
import argparse
from html import unescape
from importlib.machinery import SourceFileLoader
import json
from pathlib import Path
import secrets
import sys
from time import perf_counter

P=Path(__file__).resolve().parent
render=SourceFileLoader("byl_es_r6_blind",str(P/"byl-es-render-qa.py")).load_module()
SHA="2a81ca1cab9a8c28dc475a5901d0b1217b318f6facd4eb3bc3882c880a1185d6"
EDITED=[8,13,19,24,58,76,81,89,94]
CONTROLS=[9,39,44,60,91]

def build(a,b):
    if (a["post_id"]!=b["post_id"] or a["post_id"]!=37413
            or a["source_hash"]!=SHA or b["source_hash"]!=SHA
            or a["en_html"]!=b["en_html"] or a["indices"]!=b["indices"]
            or b.get("changes_count")!=9
            or a.get("completeness")!="SAMPLED_NOT_FULL_ARTICLE"):
        raise ValueError("article source drift or untrusted samples")
    originals=render.blocks_from_html(a["en_html"])
    aa=render.blocks_from_html(a["es_html"])
    bb=render.blocks_from_html(b["es_html"])
    lookup={source:i for i,source in enumerate(a["indices"])}
    cases=[];key=[]
    for source_idx in EDITED+CONTROLS:
        idx=lookup[source_idx]
        choices=[aa[idx]["whole"],bb[idx]["whole"]]
        switched=bool(secrets.randbelow(2))
        if switched: choices.reverse()
        label=f"R6-{source_idx:03d}"
        cases.append({
            "case_id":label,"english_original":originals[idx]["whole"],
            "spanish_X":choices[0],"spanish_Y":choices[1],
            "review_dimensions":{
                "X_naturalness_1to5":None,"Y_naturalness_1to5":None,
                "X_terms_and_brands_1to5":None,"Y_terms_and_brands_1to5":None,
                "X_fact_retention_1to5":None,"Y_fact_retention_1to5":None,
                "preferred_X_Y_TIE":None,"evidence_comment":None,
                "unsafe_source_original_flag":None,
            }})
        key.append({"case_id":label,"source_block_index":source_idx,
                    "X_is":"V2_SECOND_PASS" if switched else "COMMON_FIRST_PASS",
                    "Y_is":"COMMON_FIRST_PASS" if switched else "V2_SECOND_PASS",
                    "control_identical":source_idx in CONTROLS})
    secrets.SystemRandom().shuffle(cases)
    packet={
        "schema_version":"byl-es-v2-r6-blind-editor-packet-v1",
        "post_id":37413,"source_sha256":SHA,
        "article_sampled_blocks":23,"review_cases":len(cases),
        "scoring":"1=poor, 3=adequate, 5=publication-grade; blank/unrated allowed",
        "guidance":"Independently rate natural Spanish (es-ES), correct brands & intimate health terminology, important source facts/negations, and whether risky source claims need correction. Do not infer variants. Never publish these drafts.",
        "independent_reviewer_completed":False,
        "reviewer_type":"NOT_ASSIGNED",
        "source_and_spanish_raw_html_in_git":False,
        "blind_key_in_packet":False,
        "qa95_eligibility":"NOT_EVALUATED",
        "site_scope":"DEV_OFFLINE_ONLY",
        "www_writes":0,"paid_google_calls":0,
        "cases":cases,
    }
    answer={"schema_version":"byl-es-v2-r6-private-answer-key-v1",
            "post_id":37413,"private_only":True,"not_for_editor":True,"key":key}
    return packet,answer

def main():
    p=argparse.ArgumentParser()
    p.add_argument("--a",required=True)
    p.add_argument("--b",required=True)
    p.add_argument("--packet",required=True)
    p.add_argument("--private-map",required=True)
    args=p.parse_args()
    try:
        a=json.loads(Path(args.a).read_text(encoding="utf-8"))
        b=json.loads(Path(args.b).read_text(encoding="utf-8"))
        start=perf_counter()
        packet,key=build(a,b)
        packet["generation_ms"]=round((perf_counter()-start)*1000,2)
        for path,content in [(args.packet,packet),(args.private_map,key)]:
            Path(path).write_text(json.dumps(content,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
        print(f"R6_BLIND_PACKET_PREPARED cases={len(packet['cases'])} independent_human=NOT_COMPLETE")
    except (OSError,ValueError,KeyError) as e:
        print("R6_BLIND_FAILED: "+str(e),file=sys.stderr);raise SystemExit(2)
if __name__=="__main__":main()
