#!/usr/bin/env python3
"""Offline-only 9 reviewed Spanish copy changes to same frozen benchmark sample.

Not a WordPress patch. Checks source identity, preserved HTML tags/hrefs.
"""
import argparse
import copy
from html import escape
from html.parser import HTMLParser
import json
from pathlib import Path
import re
import sys
from time import perf_counter

SHA="2a81ca1cab9a8c28dc475a5901d0b1217b318f6facd4eb3bc3882c880a1185d6"
BLOCK=re.compile(r"<(p|li|h[1-6]|blockquote)\b[^>]*>(.*?)</\1\s*>",re.I|re.S)
class Tags(HTMLParser):
    def __init__(self):
        super().__init__();self.tags=[];self.href=[]
    def handle_starttag(self,t,attrs):
        self.tags.append(("open",t))
        if t=="a":self.href.extend([v for k,v in attrs if k=="href"])
    def handle_endtag(self,t):self.tags.append(("close",t))

def apply_changes(base,edit):
    if (base.get("post_id")!=37413 or base.get("source_hash")!=SHA or
        edit.get("post_id")!=37413 or edit.get("source_sha256")!=SHA or
        edit.get("editor")!="same_assistant_not_independent" or
        edit.get("source_scope")!="DEV_ONLY_OFFLINE" or edit.get("website_writes")!=0):
        raise ValueError("source/authorization mismatch")
    originals=list(BLOCK.finditer(base["es_html"]))
    if len(originals)!=23:
        raise ValueError("not a frozen 23-block sample")
    changes={int(k):v for k,v in edit["edited_blocks"].items()}
    if len(changes)!=9:
        raise ValueError("expected exactly 9 second-pass edits")
    sample_lookup={v:i for i,v in enumerate(base["indices"])}
    if not all(x in sample_lookup for x in changes):
        raise ValueError("source paragraph was not sampled")
    newblocks=[];log=[]
    start=perf_counter()
    for i,m in enumerate(originals):
        original=m.group(0)
        src_idx=base["indices"][i]
        if src_idx not in changes:
            newblocks.append(original);continue
        modified_inner=changes[src_idx]
        if "<" not in modified_inner:
            modified_inner=escape(modified_inner,quote=False)
        updated=original[:m.start(2)-m.start(0)]+modified_inner+original[m.end(2)-m.start(0):]
        a=Tags();a.feed(original)
        b=Tags();b.feed(updated)
        if a.tags!=b.tags or a.href!=b.href:
            raise ValueError(f"unsafe HTML/href drift at source index {src_idx}")
        if updated==original:
            raise ValueError(f"no edit at {src_idx}")
        newblocks.append(updated)
        log.append({"source_block_index":src_idx,"status":"SAMPLED_OFFLINE_COPY_EDIT_ONLY",
                    "same_html_structure":True,"same_links":True})
    out=copy.deepcopy(base)
    out["es_html"]="\n".join(newblocks)
    out["seo"]["title_es"]=edit["title_es"]
    out["variant"]="SECOND_PASS_V2_SAMPLE"
    out["changes_count"]=len(log)
    out["editorial_edits"]=log
    out["same_first_pass_source"]=True
    out["independent_human_review"]=False
    out["actual_manual_editor_minutes"]=None
    out["mechanical_edit_apply_ms"]=round((perf_counter()-start)*1000,3)
    out["website_writes"]=0
    out["www_writes"]=0
    return out

def main():
    p=argparse.ArgumentParser()
    p.add_argument("--baseline",required=True)
    p.add_argument("--edits",required=True)
    p.add_argument("--output",required=True)
    a=p.parse_args()
    try:
        base=json.loads(Path(a.baseline).read_text(encoding="utf-8"))
        edits=json.loads(Path(a.edits).read_text(encoding="utf-8"))
        out=apply_changes(base,edits)
        Path(a.output).write_text(json.dumps(out,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
        print(f"R6_V2_SAMPLE_EDITED={out['changes_count']} HTML_URL_INTACT=YES WWW=0")
        return 0
    except (KeyError,ValueError,OSError,TypeError) as e:
        print("R6_REJECTED "+str(e),file=sys.stderr)
        return 2
if __name__=="__main__":
    sys.exit(main())
