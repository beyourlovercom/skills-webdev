#!/usr/bin/env python3
"""R4 local challenge: hold-out English/Spanish Dev snapshots + seeded fault detection.

Never writes WordPress, never sends content online, never changes input files.
Compare against recorded old R9 state; do NOT claim an end-to-end blinded human A/B.
"""
from __future__ import annotations
import argparse
import copy
from importlib.machinery import SourceFileLoader
import json
from pathlib import Path
import re
import sys

S=Path(__file__).resolve().parent
r1=SourceFileLoader("byl_es_render_r4",str(S/"byl-es-render-qa.py")).load_module()
r3=SourceFileLoader("byl_es_fidelity_r4",str(S/"byl-es-fidelity-qa.py")).load_module()

def summary(input_obj,terms):
    d1=r1.check(input_obj)
    d3=r3.findings_for(input_obj,terms)
    return {"render":d1,"fidelity":d3}

def count_kind(out,kind):
    return (out["render"]["findings_by_kind"].get(kind,0)
            +out["fidelity"]["findings_by_kind"].get(kind,0))

def change_first_block(payload):
    p=copy.deepcopy(payload)
    s=r1.BLOCK_RE.search(p["en_html"])
    t=r1.BLOCK_RE.search(p["es_html"])
    if not s or not t:
        return None
    p["es_html"]=p["es_html"][:t.start()]+s.group(0)+p["es_html"][t.end():]
    return p

def change_link(payload):
    p=copy.deepcopy(payload)
    m=re.search(r'href="[^"]+"',p["es_html"])
    if not m:
        return None
    old=m.group(0)
    new='href="/byl-es-r4-synthetic-link-target"'
    p["es_html"]=p["es_html"][:m.start()]+new+p["es_html"][m.end():]
    if old==new:
        return None
    return p

def add_unfounded_promise(payload):
    p=copy.deepcopy(payload)
    m=r1.BLOCK_RE.search(p["es_html"])
    if not m:
        return None
    # Source does not contain this new guarantee; synthetic error.
    inner=m.group(2)+" Este producto garantiza resultados perfectos."
    p["es_html"]=p["es_html"][:m.start(2)]+inner+p["es_html"][m.end(2):]
    return p

def remove_number(payload):
    p=copy.deepcopy(payload)
    src=r1.blocks_from_html(p["en_html"])
    es=r1.blocks_from_html(p["es_html"])
    candidates=[]
    for i,(a,b) in enumerate(zip(src,es)):
        nums=r3.numbers(a["whole"]) & r3.numbers(b["whole"])
        if nums:
            candidates.append((i,list(nums.keys())[0]))
    for wanted_i,num in candidates:
        block_raw=[]
        for m in r1.BLOCK_RE.finditer(p["es_html"]):
            plain=re.sub(r"<[^>]+>","",m.group(2)).strip()
            if plain and not r1.SHORTCODE_RE.match(plain):
                block_raw.append(m)
        if wanted_i>=len(block_raw):
            continue
        m=block_raw[wanted_i]
        if "<a " in m.group(2):
            continue
        pattern=r"(?<!\d)"+re.escape(num).replace(r"\.",r"[.,]")+r"(?!\d)"
        found=re.search(pattern,m.group(2))
        if not found:
            continue
        part=m.group(2)
        changed=part[:found.start()]+"[omitted]"+part[found.end():]
        p["es_html"]=p["es_html"][:m.start(2)]+changed+p["es_html"][m.end(2):]
        return p
    return None

def drop_preserved_brand(payload):
    p=copy.deepcopy(payload)
    src=r1.blocks_from_html(p["en_html"])
    target=r1.blocks_from_html(p["es_html"])
    names=["BeYourLover","Skull Man","MINAKA","WooCommerce"]
    for i,(a,b) in enumerate(zip(src,target)):
        for name in names:
            if name.casefold() in a["whole"].casefold() and name.casefold() in b["whole"].casefold():
                matches=[]
                for m in r1.BLOCK_RE.finditer(p["es_html"]):
                    plain=re.sub(r"<[^>]+>","",m.group(2)).strip()
                    if plain and not r1.SHORTCODE_RE.match(plain):
                        matches.append(m)
                if i>=len(matches):
                    continue
                m=matches[i]
                if name not in m.group(2):
                    continue
                inner=m.group(2).replace(name,"Producto Genérico",1)
                p["es_html"]=p["es_html"][:m.start(2)]+inner+p["es_html"][m.end(2):]
                p.setdefault("preserve_terms",[]).append(name)
                return p
    return None

CHALLENGES=[
    ("english_visible","VISIBLE_ENGLISH",change_first_block),
    ("link_changed","LINK_CHANGED",change_link),
    ("new_guarantee","NEW_STRONG_PROMISE",add_unfounded_promise),
    ("numeric_omission","NUMBER_MISSING",remove_number),
    ("brand_corruption","PROTECTED_NAME_MISSING",drop_preserved_brand),
]

def evaluate(snapshot,old,terms):
    if old.get("post_id") != snapshot.get("post_id"):
        raise ValueError("legacy release post mismatch")
    if old.get("source_sha256") != snapshot.get("source_hash"):
        raise ValueError("legacy release source hash mismatch")
    if not old.get("dev_only") or old.get("www_writes") != 0:
        raise ValueError("not DEV-only release")
    if not old.get("coverage_pct",0) >= 95 or old.get("p0_state")!="CLEAR":
        raise ValueError("legacy QA95 gate does not pass")
    plain=summary(snapshot,terms)
    results=[]
    for label,expected,func in CHALLENGES:
        mutated=func(snapshot)
        if mutated is None:
            results.append({"case":label,"expected_kind":expected,
                            "result":"NOT_APPLICABLE"})
            continue
        out=summary(mutated,terms)
        before=count_kind(plain,expected)
        after=count_kind(out,expected)
        results.append({"case":label,"expected_kind":expected,
                        "baseline_count":before,"mutated_count":after,
                        "result":"DETECTED" if after>before else "MISSED"})
    return {
      "post_id":snapshot["post_id"],"source_hash":snapshot["source_hash"],
      "legacy_qa95":{"coverage_pct":old["coverage_pct"],
                     "p0_state":old["p0_state"],"dev_only":old["dev_only"]},
      "new_readonly":{"r1_findings":plain["render"]["findings_by_kind"],
                      "r3_findings":plain["fidelity"]["findings_by_kind"]},
      "cases":results,
      "scope":"LOCAL_ONLY_SYNTHETIC_MUTATIONS",
      "full_old_qa95_end_to_end_tested":False,
      "independent_human_blind_review":False,
      "semantic_fidelity_certified":False,
      "www_writes":0,
      "paid_google_calls":0,
    }

def main():
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument("snapshot")
    p.add_argument("legacy_report")
    p.add_argument("--termbank",required=True)
    p.add_argument("--output",required=True)
    a=p.parse_args()
    try:
        snap=json.loads(Path(a.snapshot).read_text(encoding="utf-8-sig"))
        old=json.loads(Path(a.legacy_report).read_text(encoding="utf-8-sig"))
        terms=json.loads(Path(a.termbank).read_text(encoding="utf-8-sig"))
        out=evaluate(snap,old,terms)
        Path(a.output).write_text(json.dumps(out,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
        detected=sum(c["result"]=="DETECTED" for c in out["cases"])
        applicable=sum(c["result"]!="NOT_APPLICABLE" for c in out["cases"])
        print(f"R4_LOCAL_ONLY post={out['post_id']} DETECTED={detected}/{applicable}")
        return 0
    except (OSError, ValueError, KeyError, TypeError, json.JSONDecodeError) as exc:
        print("R4_LOCAL_ONLY_FAILED: "+str(exc),file=sys.stderr)
        return 2

if __name__=="__main__":
    raise SystemExit(main())
