#!/usr/bin/env python3
"""Dry-run ONLY: validate P1 rendered-span editorial proposals against verified DEV snapshots.

Does NOT know how to edit WordPress or TranslatePress and does not contain any
network function, SSH credentials, WordPress update query, or deploy capability.
"""
import argparse
from collections import Counter
from html.parser import HTMLParser
from importlib.machinery import SourceFileLoader
import json
from pathlib import Path
import re
import sys

render=SourceFileLoader("byl_es_render_proposals",str(Path(__file__).with_name("byl-es-render-qa.py"))).load_module()


class Tags(HTMLParser):
    def __init__(self):
        super().__init__()
        self.structure=[]
        self.links=[]
    def handle_starttag(self,tag,attrs):
        self.structure.append(("open",tag))
        if tag=="a":
            self.links.extend([v for k,v in attrs if k=="href"])
    def handle_endtag(self,tag):
        self.structure.append(("close",tag))
    def handle_startendtag(self,tag,attrs):
        self.structure.append(("self",tag))


def rendered_blocks(raw_html):
    blocks=[]
    for m in render.BLOCK_RE.finditer(raw_html):
        raw=m.group(0)
        content=m.group(2)
        txt=render.TAG_RE.sub("",content).strip()
        if txt and not render.SHORTCODE_RE.match(txt):
            blocks.append(raw)
    return blocks


def check_proposals(proposals,private_snapshots):
    if proposals.get("mode")!="OFFLINE_PROPOSALS_ONLY" or proposals.get("live_writes_authorized") is not False:
        raise ValueError("not a safe offline proposal file")
    results=[]
    for p in proposals.get("proposals",[]):
        id=int(p["post_id"]);index=int(p["block"])
        file=Path(private_snapshots)/f"BYL_ES_V2_R1_snapshot_{id}_20261115.json"
        snap=json.loads(file.read_text(encoding="utf-8"))
        if snap.get("post_id")!=id or snap.get("source_hash")!=p["source_sha256"]:
            raise ValueError(f"source hash mismatch for {id}")
        if snap.get("snapshot_type")!="DEV_READ_ONLY_RENDER" or snap.get("www_writes")!=0:
            raise ValueError(f"unauthorized snapshot for {id}")
        en=rendered_blocks(snap["en_html"])
        es=rendered_blocks(snap["es_html"])
        if index>=len(es) or index>=len(en):
            raise ValueError(f"block missing {id}:{index}")
        old=es[index]
        edited=old
        for pair in p["replacements"]:
            before,after=pair["find"],pair["replace"]
            if not before or edited.count(before)!=1:
                raise ValueError(f"non-unique P1 fragment {id}:{index}")
            edited=edited.replace(before,after,1)
        oldtags=Tags();oldtags.feed(old)
        newtags=Tags();newtags.feed(edited)
        if oldtags.structure!=newtags.structure or oldtags.links!=newtags.links:
            raise ValueError(f"HTML structure / URLs changed for {id}:{index}")
        if edited==old:
            raise ValueError(f"empty proposal for {id}:{index}")
        results.append({"post_id":id,"block":index,
                        "source_sha256":snap["source_hash"],
                        "replacements":len(p["replacements"]),
                        "html_structure_preserved":True,"hrefs_preserved":True,
                        "status":"DRY_RUN_VALIDATED_ONLY"})
    return {"schema_version":"byl-es-v2-p1-proposal-check-v1",
            "mode":"OFFLINE_DRY_RUN","live_edits_performed":0,
            "www_writes":0,"google_paid_calls":0,
            "proposals_checked":len(results),
            "edits_approved_for_release":False,
            "results":results}


def main():
    p=argparse.ArgumentParser()
    p.add_argument("--proposals",required=True)
    p.add_argument("--private-snapshots",required=True)
    p.add_argument("--output",required=True)
    a=p.parse_args()
    try:
        proposals=json.loads(Path(a.proposals).read_text(encoding="utf-8"))
        report=check_proposals(proposals,a.private_snapshots)
        Path(a.output).write_text(json.dumps(report,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
        print(f"P1_DRY_RUN_PASS {report['proposals_checked']} changes validated; WordPress=0 WWW=0")
        return 0
    except (OSError,ValueError,KeyError,TypeError,json.JSONDecodeError) as e:
        print("P1_DRY_RUN_REJECTED: "+str(e),file=sys.stderr)
        return 2

if __name__=="__main__":
    sys.exit(main())
