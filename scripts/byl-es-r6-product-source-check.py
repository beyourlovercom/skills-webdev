#!/usr/bin/env python3
"""Dev-read-only source fact/brand preflight for R6 product-specific holdout #36354.

Flags claims needing product/manual verification BEFORE treating them as factual
translation gold labels. It is not a translation, QA95 verdict, or human review.
Source content and any run output remain off Git, under private 007windows.
"""
import argparse
import hashlib
import json
from pathlib import Path
import re
import sys

SOURCE_SHA="0bfb77c5ddb5a3aa7fb74755bc45496d94fc3e1dd4a78e931f9c7064b2f6b214"
POST_ID=36354
EXPECTED=[
 ("BeYourLover","BRAND_KEEP","(?i)beyourlover","KEEP_CANONICAL_NAME"),
 ("GuiTar","MODEL_KEEP","GuiTar","KEEP_CANONICAL_NAME"),
 ("PLAYME","ALIAS_KEEP","PLAYME","KEEP_PRODUCT_ALIAS"),
 ("2mm suction opening","CLAIM_VERIFY",r"\b2mm\s+suction\s+opening\b","PRODUCT_SPEC_VERIFY"),
 ("10 suction modes","CLAIM_VERIFY",r"\b10\s+suction\s+modes\b","PRODUCT_SPEC_VERIFY"),
 ("10 vibration modes","CLAIM_VERIFY",r"\b10\s+vibration\s+modes\b","PRODUCT_SPEC_VERIFY"),
 ("8000 vibrations per minute","CLAIM_VERIFY",r"\b8,000\s+vibrations\s+per\s+minute\b","PRODUCT_SPEC_VERIFY"),
 ("over 8000 nerves","MEDICAL_CLAIM_REVIEW",r"over\s+8,000\s+pleasure\s+nerves","MEDICAL_CLAIM_SOURCE_NEEDED"),
 ("app long distance","CLAIM_VERIFY",r"compatible\s+with\s+BeYourLover.s\s+app","APP_MODEL_SPEC_VERIFY"),
 ("detachable body cleaning","PRODUCT_SAFETY",r"before\s+cleaning,\s+separate\s+the\s+body\s+and\s+main\s+unit","P0_SAFE_HARDWARE_REVIEW"),
 ("main unit not waterproof","PRODUCT_SAFETY",r"main\s+unit\s+is\s+not\s+waterproof","P0_SAFE_HARDWARE_REVIEW"),
 ("magnetic charging","CLAIM_VERIFY",r"magnetic\s+charge\s+connection","PRODUCT_SPEC_VERIFY"),
]
def check(data):
    if (data.get("post_id")!=POST_ID or data.get("source_sha256")!=SOURCE_SHA
            or data.get("readonly") is not True
            or data.get("www_writes")!=0
            or data.get("paid_google_calls")!=0
            or data.get("review_snapshot") is not False):
        raise ValueError("wrong Dev source identity, scope or review state")
    raw=data["raw_html"]
    observations=[]
    for name,kind,expression,gate in EXPECTED:
        n=len(re.findall(expression,raw))
        if not n:raise ValueError(f"source fact anchor missing: {name}")
        observations.append({"name":name,"type":kind,"matches":n,
                             "gate":gate,"verified_external_fact":False})
    warnings=[]
    if "clitoris.It" in raw:
        warnings.append("English source missing space after clitoris.It")
    if "wraps the around the clitoris" in raw:
        warnings.append("Original English source contains malformed anatomy sentence wraps the around...")
    if "Waterproof &" in raw and "main unit is not waterproof" in raw:
        warnings.append("Heading Waterproof conflicts with explanatory warning that the main unit is not waterproof; component-level clarification required")
    if "GuiTar GuiTar" in raw:
        warnings.append("Repeated model name GuiTar GuiTar may be an editorial typo, not two separate products")
    return {"schema":"byl-es-r6-product-source-anchor-check-v1",
            "post_id":POST_ID,"source_sha256":SOURCE_SHA,
            "scope":"READ_ONLY_DEV_SOURCE","protected_names_found":3,
            "source_claims_requiring_independent_verification":sum("VERIFY" in k or k=="MEDICAL_CLAIM_REVIEW" for _,k,_,_ in EXPECTED),
            "matched_anchor_count":len(observations),
            "anchors":observations,
            "source_quality_warnings":warnings,
            "source_p0_clear":False,
            "translated_body_exists":False,
            "independent_editorial_review":"NOT_COMPLETED",
            "ready_for_blind_brand_comparison":False,
            "www_writes":0,
            "dev_article_writes":0,
            "paid_google_calls":0}
def main():
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument("--source",required=True)
    p.add_argument("--output",required=True)
    a=p.parse_args()
    try:
        obj=json.loads(Path(a.source).read_text(encoding="utf-8"))
        result=check(obj)
        Path(a.output).write_text(json.dumps(result,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
        print("R6_BRAND_SOURCE_ANCHORS="+str(result["matched_anchor_count"])
              +" EXTERNAL_FACTS_VERIFIED=0 DEV_WRITES=0")
    except (ValueError,KeyError,TypeError,OSError,json.JSONDecodeError) as exc:
        print("R6_BRAND_SOURCE_REJECTED: "+str(exc),file=sys.stderr)
        raise SystemExit(2)
if __name__=="__main__":main()
