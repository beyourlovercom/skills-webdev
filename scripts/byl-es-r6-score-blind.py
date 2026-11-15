#!/usr/bin/env python3
"""R6 blind es-ES A/B review: generate an EMPTY response template and score a completed one.

External human ratings are REQUIRED for an actual score. Never guess ratings,
fill a form automatically, or reveal private X/Y mapping before complete review.
All full text, answer keys and completed reviews stay in the private Windows
runtime directory. Only aggregate, attributed (not anonymous reviewer data)
results may be versioned, and only when explicitly approved.
"""
from __future__ import annotations
import argparse
from collections import Counter
import csv
import json
from pathlib import Path
from statistics import mean,median
import sys

FIELDS=[
    "case_id","X_naturalness","Y_naturalness",
    "X_terms","Y_terms","X_facts","Y_facts",
    "preferred","source_p0","evidence_comment"
]
DIMENSIONS=("naturalness","terms","facts")
VALID_PREFERENCE={"X","Y","TIE"}
VALID_SOURCE_P0={"YES","NO","UNSURE"}
VALID_VARIANTS={"COMMON_FIRST_PASS","V2_SECOND_PASS"}

def guard_packet(packet):
    cases=packet.get("cases")
    if (packet.get("schema_version")!="byl-es-v2-r6-blind-editor-packet-v1"
            or packet.get("post_id")!=37413
            or packet.get("blind_key_in_packet") is not False
            or packet.get("independent_reviewer_completed") is not False
            or not isinstance(cases,list) or len(cases)!=14
            or len({x["case_id"] for x in cases})!=14):
        raise ValueError("blind packet identity or key guard failure")
    return {c["case_id"] for c in cases}

def template(packet):
    ids=guard_packet(packet)
    rows=[{k:"" for k in FIELDS}|{"case_id":c["case_id"]} for c in packet["cases"]]
    return rows

def parse_score(value,field):
    s=str(value).strip()
    if field.endswith("_terms") and s.upper()=="NA":
        return None
    if s not in {"1","2","3","4","5"}:
        raise ValueError(f"score missing/outside 1..5 for {field}")
    return int(s)

def validate_review(packet,review_rows,metadata):
    case_ids=guard_packet(packet)
    if (metadata.get("schema_version")!="byl-es-v2-r6-independent-review-v1"
            or metadata.get("post_id")!=37413
            or metadata.get("reviewer_is_independent") is not True
            or not str(metadata.get("reviewer_label","")).strip()
            or not str(metadata.get("reviewer_language_qualification","")).strip()):
        raise ValueError("independent reviewer identity/qualification must be self-declared")
    # Human reviewer self-report cannot be independently verified by this script.
    if metadata.get("reviewer_saw_answer_key") is not False:
        raise ValueError("blind reviewer must not have seen answer key")
    elapsed=metadata.get("net_review_minutes")
    if not isinstance(elapsed,(int,float)) or not 0<elapsed<=1440:
        raise ValueError("net human review duration must be provided in minutes")
    if len(review_rows)!=len(case_ids) or {v["case_id"] for v in review_rows}!=case_ids:
        raise ValueError("incomplete, duplicated, or unexpected review cases")
    cleaned=[]
    for row in review_rows:
        if row.get("preferred","").strip().upper() not in VALID_PREFERENCE:
            raise ValueError("preferred must be X, Y or TIE")
        if row.get("source_p0","").strip().upper() not in VALID_SOURCE_P0:
            raise ValueError("source P0 judgment cannot be empty")
        if len((row.get("evidence_comment") or "").strip())<5:
            raise ValueError("independent reviewer evidence_comment is required for every row")
        vals={"case_id":row["case_id"],
              "preferred":row["preferred"].strip().upper(),
              "source_p0":row["source_p0"].strip().upper(),
              "comment":row["evidence_comment"].strip()}
        for side in "XY":
            for dim in DIMENSIONS:
                field=f"{side}_{dim}"
                vals[field]=parse_score(row.get(field,""),field)
        if (vals["X_terms"] is None) ^ (vals["Y_terms"] is None):
            raise ValueError("terms NA must be paired across X and Y")
        cleaned.append(vals)
    return cleaned

def score(packet,review_rows,metadata,key):
    valid=validate_review(packet,review_rows,metadata)
    mapping=key.get("key")
    if (key.get("schema_version")!="byl-es-v2-r6-private-answer-key-v1"
            or key.get("private_only") is not True or len(mapping)!=14):
        raise ValueError("invalid private answer key")
    ref={k["case_id"]:k for k in mapping}
    if set(ref)!={r["case_id"] for r in valid}:
        raise ValueError("answer key and reviewer cases do not match")
    data={d:{"COMMON_FIRST_PASS":[],"V2_SECOND_PASS":[],"paired_delta":[]} for d in DIMENSIONS}
    prefs=Counter()
    controls=[]
    source_p0=[]
    for r in valid:
        k=ref[r["case_id"]]
        if k["X_is"] not in VALID_VARIANTS or k["Y_is"] not in VALID_VARIANTS or k["X_is"]==k["Y_is"]:
            raise ValueError("answer key variants invalid")
        is_control=k["control_identical"]
        if r["source_p0"]!="NO":
            source_p0.append({"case_id":r["case_id"],"judgment":r["source_p0"],
                              "comment":r["comment"][:300]})
        diffs=[]
        for d in DIMENSIONS:
            x=r["X_"+d];y=r["Y_"+d]
            if x is not None:
                data[d][k["X_is"]].append(x)
                data[d][k["Y_is"]].append(y)
                vals={k["X_is"]:x,k["Y_is"]:y}
                delta=vals["V2_SECOND_PASS"]-vals["COMMON_FIRST_PASS"]
                data[d]["paired_delta"].append(delta)
                if is_control:diffs.append(abs(x-y))
        if is_control:
            controls.append({"case_id":r["case_id"],"max_absolute_score_difference":max(diffs or [0]),
                             "preferred":r["preferred"]})
            continue
        preferred=k["X_is"] if r["preferred"]=="X" else (k["Y_is"] if r["preferred"]=="Y" else "TIE")
        prefs[preferred]+=1
    scores={}
    for d,v in data.items():
        scores[d]={
            "old_mean":round(mean(v["COMMON_FIRST_PASS"]),3) if v["COMMON_FIRST_PASS"] else None,
            "v2_mean":round(mean(v["V2_SECOND_PASS"]),3) if v["V2_SECOND_PASS"] else None,
            "paired_delta_v2_minus_old_mean":round(mean(v["paired_delta"]),3) if v["paired_delta"] else None,
            "paired_n":len(v["paired_delta"]),
        }
    large_control_disagreement=sum(x["max_absolute_score_difference"]>1 or x["preferred"]!="TIE" for x in controls)
    return {
        "schema_version":"byl-es-v2-r6-blind-scoring-result-v1",
        "post_id":37413,
        "source_sha256":packet["source_sha256"],
        "self_reported_independent_human_not_verified_by_script":True,
        "reviewer_label":metadata["reviewer_label"],
        "reviewer_language_qualification":metadata["reviewer_language_qualification"],
        "net_review_minutes":metadata["net_review_minutes"],
        "scored_pairs":len(valid),
        "paired_changed_cases":9,
        "unchanged_identical_control_cases":len(controls),
        "control_score_disagreements":large_control_disagreement,
        "human_score_reliability_warning":large_control_disagreement>0,
        "preference_nonidentical_cases":dict(prefs),
        "dimension_scores":scores,
        "source_p0_review":source_p0,
        "release_gate":"NO_RELEASE_AUTHORITY",
        "not_full_article_benchmark":True,
        "translation_and_revision_time_not_measured":True,
        "www_writes":0,
    }

def main():
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument("--packet",required=True)
    p.add_argument("--blank-csv",help="create empty blinded review CSV then stop")
    p.add_argument("--review-csv",help="completed independently rated CSV")
    p.add_argument("--reviewer-metadata",help="completed reviewer declaration JSON")
    p.add_argument("--private-key",help="private answer key; only passed once review complete")
    p.add_argument("--result",help="private result file")
    a=p.parse_args()
    try:
        packet=json.loads(Path(a.packet).read_text(encoding="utf-8"))
        if a.blank_csv:
            with Path(a.blank_csv).open("w",newline="",encoding="utf-8-sig") as f:
                w=csv.DictWriter(f,fieldnames=FIELDS);w.writeheader();w.writerows(template(packet))
            print("R6_BLIND_EMPTY_TEMPLATE_CREATED records=14; no scoring performed")
            return 0
        if not all([a.review_csv,a.reviewer_metadata,a.private_key,a.result]):
            raise ValueError("incomplete scoring command")
        rows=list(csv.DictReader(Path(a.review_csv).open(encoding="utf-8-sig",newline="")))
        meta=json.loads(Path(a.reviewer_metadata).read_text(encoding="utf-8"))
        # Fail-closed review first; mapping must not be read until all inputs validated.
        valid=validate_review(packet,rows,meta)
        key=json.loads(Path(a.private_key).read_text(encoding="utf-8"))
        result=score(packet,rows,meta,key)
        Path(a.result).write_text(json.dumps(result,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
        print("R6_BLIND_RESULTS_VALIDATED pairs="+str(len(valid)))
        return 0
    except (OSError,ValueError,KeyError,TypeError,json.JSONDecodeError,csv.Error) as exc:
        print("R6_BLIND_REVIEW_REJECTED: "+str(exc),file=sys.stderr)
        return 2

if __name__=="__main__":
    sys.exit(main())
