#!/usr/bin/env python3
"""Build a *sampled*, real-source bilingual prospective benchmark corpus.

IMPORTANT: This is NOT a full-article translation or a WordPress-ready patch.
Only reads frozen DEV original and offline assistant draft; all outputs are local
outside Git. Never calls WP, API, external services, or applies translations.
"""
import argparse
from html import escape,unescape
from html.parser import HTMLParser
import hashlib
import json
from pathlib import Path
import re
import sys

SHA="2a81ca1cab9a8c28dc475a5901d0b1217b318f6facd4eb3bc3882c880a1185d6"
BLOCK=re.compile(r"<(p|li|h[1-6]|blockquote)\b[^>]*>(.*?)</\1\s*>",re.I|re.S)
TAG=re.compile(r"<[^>]+>",re.S)

class Struct(HTMLParser):
    def __init__(self):
        super().__init__()
        self.tags=[];self.hrefs=[]
    def handle_starttag(self,tag,attrs):
        self.tags.append(("+",tag))
        if tag=="a":
            self.hrefs.extend(v for k,v in attrs if k=="href")
    def handle_endtag(self,tag):self.tags.append(("-",tag))

def source_blocks(raw):
    blocks=[]
    for m in BLOCK.finditer(raw):
        clean=unescape(TAG.sub("",m.group(2))).strip()
        if not clean or re.match(r"^\[\s*product_card",clean,re.I): continue
        blocks.append(m)
    return blocks

def assemble(source,first,overrides):
    if source.get("post_id")!=37413 or first.get("post_id")!=37413:
        raise ValueError("post_id drift")
    if source.get("source_sha256")!=SHA or first.get("source_sha256")!=SHA:
        raise ValueError("immutable source SHA drift")
    if source.get("site_scope")!="DEV_ONLY" or not source.get("readonly"):
        raise ValueError("not verified DEV-only source")
    if source.get("www_writes")!=0 or source.get("paid_google_calls")!=0:
        raise ValueError("side-effect guard")
    translated={int(i):v for i,v in first["translation_es_by_index"].items()}
    indices=sorted(translated.keys())
    blocks=source_blocks(source["raw_html"])
    if len(blocks)!=99 or len(indices)!=23:
        raise ValueError("unexpected source or sample count")
    en=[];es=[];lengths=[]
    for i in indices:
        m=blocks[i]
        enblock=m.group(0)
        word=translated[i]
        if not isinstance(word,str) or len(word)<15:
            raise ValueError(f"empty translation {i}")
        inside=overrides.get(str(i),escape(word,quote=False))
        esblock=m.group(0)[:m.start(2)-m.start(0)]+inside+m.group(0)[m.end(2)-m.start(0):]
        e=Struct();e.feed(enblock)
        s=Struct();s.feed(esblock)
        if e.tags!=s.tags or e.hrefs!=s.hrefs:
            raise ValueError(f"markup or link changed: {i}")
        en.append(enblock);es.append(esblock)
        lengths.append(len(unescape(TAG.sub("",m.group(2))).strip()))
    return {"schema_version":"byl-es-v2-r6-prospective-sample-v1",
            "snapshot_type":"OFFLINE_SAMPLED_DRAFT", "site_scope":"DEV_ONLY",
            "post_id":37413, "source_hash":SHA, "source_english_title":source["title"],
            "seo":{"title_es":first["title_es"],"meta_es":""},
            "original_article_words":source["word_count"],
            "source_block_total":len(blocks), "sampled_block_count":len(indices),
            "sampled_source_chars":sum(lengths),
            "indices":indices,
            "first_pass_provenance":first["origin"],
            "en_html":"\n".join(en),"es_html":"\n".join(es),
            "dictionary":[],
            "completeness":"SAMPLED_NOT_FULL_ARTICLE",
            "unsafe_original_english_needs_review":True,
            "author_editor_independence":"NOT_INDEPENDENT",
            "manual_translation_time":"NOT_MEASURED",
            "no_legacy_r9":True,
            "website_writes":0,"www_writes":0,"google_paid_calls":0}

def main():
    p=argparse.ArgumentParser()
    p.add_argument("--source",required=True)
    p.add_argument("--first-pass",required=True)
    p.add_argument("--overrides",required=True)
    p.add_argument("--output",required=True)
    a=p.parse_args()
    try:
        inp=[json.loads(Path(n).read_text(encoding="utf-8")) for n in (a.source,a.first_pass,a.overrides)]
        report=assemble(*inp)
        Path(a.output).write_text(json.dumps(report,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
        print(f"R6_SAMPLED_BASELINE_READY blocks={report['sampled_block_count']}/{report['source_block_total']} source_chars={report['sampled_source_chars']} WWW=0")
    except (KeyError,OSError,TypeError,ValueError) as exc:
        print("R6_SAMPLE_REJECTED "+str(exc),file=sys.stderr)
        raise SystemExit(2)
if __name__=="__main__":
    main()
