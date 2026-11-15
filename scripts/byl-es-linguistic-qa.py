#!/usr/bin/env python3
"""BYL ES V2 independent grammar proposal stage on local LanguageTool.

Read-only. Only the already running 127.0.0.1 Java LanguageTool server is used;
never auto-edits WordPress or calls any paid/public grammar API.
"""
from __future__ import annotations
import argparse
from bisect import bisect_right
from collections import Counter
import html
from importlib.machinery import SourceFileLoader
import json
import re
from pathlib import Path
import sys

ROOT=Path(__file__).resolve().parent
render=SourceFileLoader("byl_es_render_qa_ling",str(ROOT/"byl-es-render-qa.py")).load_module()
lt=SourceFileLoader("byl_es_languagetool_local",str(ROOT/"byl-es-languagetool-local.py")).load_module()

def rendered_block_texts(article_html):
    """Use real DOM inline spacing; joins with spaces invent punctuation errors."""
    chunks=[]
    for match in render.BLOCK_RE.finditer(article_html):
        inner=re.sub(r"<br\s*/?>", "\n", match.group(2), flags=re.I)
        clean=html.unescape(render.TAG_RE.sub("", inner)).strip()
        if not clean or render.SHORTCODE_RE.match(clean):
            continue
        chunks.append(clean)
    return chunks

def batches(blocks,max_chars=9500):
    if max_chars < 200 or max_chars > 15000:
        raise ValueError("unsafe batch size")
    current=[]
    count=0
    for i,b in enumerate(blocks):
        text=(b if isinstance(b,str) else html.unescape(b["whole"])).strip()
        if len(text)<18:
            continue
        if len(text) > max_chars:
            raise ValueError("single paragraph exceeds maximum; manual review required")
        extra=len(text)+2
        if current and count+extra>max_chars:
            yield current
            current=[]
            count=0
        current.append((i,text))
        count+=extra
    if current:
        yield current

def review(payload,endpoint="http://127.0.0.1:8010/v2/check",max_chars=9500):
    if payload.get("snapshot_type")!="DEV_READ_ONLY_RENDER":
        raise ValueError("Only verified Dev read-only snapshots accepted")
    if payload.get("www_writes")!=0 or payload.get("google_calls")!=0:
        raise ValueError("Invalid snapshot side-effect assertions")
    blocks=rendered_block_texts(payload["es_html"])
    issues=[]
    batch_sizes=[]
    for group in batches(blocks,max_chars):
        offsets=[]
        accumulated=[]
        start=0
        for idx,text in group:
            offsets.append((start,idx))
            accumulated.append(text)
            start+=len(text)+2
        combined="\n\n".join(accumulated)
        batch_sizes.append(len(combined))
        for item in lt.inspect(combined,endpoint,timeout=45):
            offset=item.get("offset")
            if not isinstance(offset,int):
                continue
            ordinals=[x[0] for x in offsets]
            k=max(0,bisect_right(ordinals,offset)-1)
            block_index=offsets[k][1]
            record={**item,"block":block_index,
                    "category":item.get("category"),"offset_in_batch":offset,
                    "source_language":"es-ES","severity":"P1_PROPOSAL"}
            issues.append(record)
    return {"schema_version":"byl-es-v2-r2","post_id":payload["post_id"],
            "mode":"LOCAL_SELF_HOSTED_LANGUAGE_TOOL","site_scope":"DEV_ONLY",
            "target_language":"es-ES",
            "independent_editor_review":"REQUIRED",
            "suggestions_auto_applied":False,
            "qa95_release":"NOT_EVALUATED",
            "www_writes":0,"paid_google_calls":0,
            "paragraphs_scanned":len(blocks),
            "http_batches":len(batch_sizes),
            "batch_lengths":batch_sizes,
            "matches":len(issues),
            "match_rules":dict(Counter(x.get("rule_id") for x in issues)),
            "findings":issues}

def main():
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument("snapshot")
    p.add_argument("--endpoint",default="http://127.0.0.1:8010/v2/check")
    p.add_argument("--output",required=True)
    p.add_argument("--max-chars",type=int,default=9500)
    a=p.parse_args()
    try:
        src=json.loads(Path(a.snapshot).read_text(encoding="utf-8-sig"))
        report=review(src,a.endpoint,a.max_chars)
        Path(a.output).write_text(json.dumps(report,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
        print(f"SPANISH_LINGUISTIC_READONLY_PASS post={report['post_id']} "
              f"batches={report['http_batches']} proposals={report['matches']}")
        return 0
    except (OSError, ValueError, KeyError, json.JSONDecodeError) as exc:
        print("SPANISH_LINGUISTIC_LOCAL_FAILURE: "+str(exc),file=sys.stderr)
        return 2

if __name__=="__main__":
    raise SystemExit(main())
