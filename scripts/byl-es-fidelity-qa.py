#!/usr/bin/env python3
"""BYL Spanish V2: high-precision SOURCE-FACT and protected-term cross-check.

Read-only advisory checks. No API/network/WordPress writes. A clean result never
certifies translation fidelity; an independent Spanish reviewer must sign off.
"""
from __future__ import annotations

import argparse
from collections import Counter
import html
import json
from pathlib import Path
import re
import sys
import unicodedata

from importlib.machinery import SourceFileLoader

render = SourceFileLoader("byl_es_render_qa", str(Path(__file__).with_name("byl-es-render-qa.py"))).load_module()

NUMBER = re.compile(r"(?<![\w])\d+(?:[,.]\d+)?%?(?![\w])")
SKU = re.compile(r"(?<![a-zA-Z0-9])(?:[A-Z]{2,5}[-_]?\d{3,6}[A-Za-z-]*)(?!\w)")
GUARANTEE_ES = re.compile(r"\b(?:garantiza|garantizamos|cura|curan|elimina por completo|siempre mejora)\b", re.I)
GUARANTEE_EN = re.compile(r"\b(?:guarantees?|cures?|always improves|eliminates?)\b", re.I)
NEGATION_EN = re.compile(r"\b(?:do(?:es)? not|don't|doesn't|cannot|can't|never|not guaranteed|no evidence|not established)\b", re.I)
NUMBER_WORDS_ES = {"30": "treinta", "20": "veinte", "14": "catorce", "10": "diez", "5": "cinco", "2": "dos", "1": "uno"}
NEGATION_ES = re.compile(r"\b(?:no|nunca|sin|tampoco|ni|insuficiente|carece|imposible|evita|rechaza)\b", re.I)

DEFAULT_TERMS = [
    {"source": "consent", "es": ["consentim", "acept", "autoriz"], "importance": "P1"},
    {"source": "lubricant", "es": ["lubricant", "lubricac"], "importance": "P1"},
    {"source": "flared base", "es": ["base ensanchada", "base amplia", "base acampanada"], "importance": "P1"},
    {"source": "condom", "es": ["preservativo", "condón"], "importance": "P1"},
    {"source": "privacy", "es": ["privacidad", "datos personales", "confidencial"], "importance": "P1"},
    {"source": "hygiene", "es": ["higiene", "limpieza"], "importance": "P1"},
    {"source": "pain", "es": ["dolor", "molestia"], "importance": "P1"},
    {"source": "water-based", "es": ["base acuosa", "agua"], "importance": "P1"},
    {"source": "prostate", "es": ["próstata", "prostátic"], "importance": "P1"},
]

def fold(s: str) -> str:
    s = unicodedata.normalize("NFKD", str(s)).casefold()
    return "".join(c for c in s if not unicodedata.combining(c))

def numbers(s: str) -> Counter:
    # 5.5 and 5,5 are valid decimal-localization equivalents.
    # Treat "14%" and Spanish "14 %" as the same value.
    s=re.sub(r"(\d)\s+(?=%)", r"\1", s)
    return Counter(t.replace(",", ".") for t in NUMBER.findall(s))


def equivalent_unit_conversion(source, target, original):
    """Allow accurate inch-to-centimetre conversion, not silent loss."""
    try:
        value=float(original.replace(",", ".").rstrip("%"))
    except ValueError:
        return False
    if original.endswith("%"):
        return False
    if not re.search(r"(?<!\d)"+re.escape(original)+r"\s*[- ]?\s*(?:inch|inches|in\b)",source,re.I):
        return False
    for candidate in re.finditer(r"\b(\d+(?:[.,]\d+)?)\s*cm\b",target,re.I):
        centimeters=float(candidate.group(1).replace(",","."))
        if abs(centimeters-value*2.54)<=max(0.5,value*2.54*0.03):
            return True
    return False

def findings_for(payload: dict, termbank=None) -> dict:
    en = render.blocks_from_html(payload["en_html"])
    es = render.blocks_from_html(payload["es_html"])
    target_inner = []
    for m in render.BLOCK_RE.finditer(payload["es_html"]):
        plain=html.unescape(render.TAG_RE.sub("",m.group(2))).strip()
        if plain and not render.SHORTCODE_RE.match(plain):
            target_inner.append(m.group(2))
    rows = []
    protected = list(payload.get("preserve_terms", [])) + ["BeYourLover"]
    terms = termbank if termbank is not None else DEFAULT_TERMS
    for i, source in enumerate(en):
        if i >= len(es):
            rows.append({"block": i, "kind": "MISSING_TARGET_BLOCK",
                         "priority": "P0_REVIEW", "evidence": source["whole"][:130]})
            continue
        target = es[i]
        src, dst = source["whole"], target["whole"]
        src_fold, dst_fold = fold(src), fold(dst)
        for val, count in (numbers(src) - numbers(dst)).items():
            word = NUMBER_WORDS_ES.get(val)
            if word and re.search(r"(?<!\w)"+re.escape(word)+r"(?!\w)", fold(dst)):
                continue
            if equivalent_unit_conversion(src,dst,val):
                continue
            rows.append({"block": i, "kind": "NUMBER_MISSING",
                         "priority": "P0_REVIEW", "source_number": val,
                         "count": count, "source": src[:140], "target": dst[:140]})
        for code in sorted(set(SKU.findall(src))):
            if code.casefold() not in dst.casefold():
                rows.append({"block": i, "kind": "SKU_MISSING",
                             "priority": "P0_REVIEW", "source_sku": code})
        for name in sorted(set(protected)):
            pattern = r"(?<!\w)"+re.escape(fold(name))+r"(?!\w)"
            found=bool(name and re.search(pattern, src_fold))
            if name.isupper() and len(name)<=6:
                # "SELF" is often an English reflexive word; uppercase media
                # source identifiers must match source text case exactly.
                found=bool(re.search(r"(?<!\w)"+re.escape(name)+r"(?!\w)",src))
            if found and not re.search(pattern, dst_fold):
                rows.append({"block": i, "kind": "PROTECTED_NAME_MISSING",
                             "priority": "P1", "source_name": name})
        for term in terms:
            src_term = term["source"]
            has_target=any(fold(x) in dst_fold for x in term["es"])
            if src_term=="flared base" and re.search(r"\bbase\b.{0,26}\bensanchada",dst_fold):
                has_target=True
            if fold(src_term) in src_fold and not has_target:
                rows.append({"block": i, "kind": "TERM_REVIEW",
                             "priority": term.get("importance", "P1"),
                             "source_term": src_term, "target_hint": term["es"]})
        # Detect actual merged words caused by missing whitespace around inline links.
        raw_target = target_inner[i] if i < len(target_inner) else ""
        if re.search(r"</(?:a|em|strong)>(?=[^\W\d_])|(?<=[^\W\d_])<(?:a|em|strong)\b", raw_target, re.I):
            rows.append({"block": i, "kind": "INLINE_TOKEN_JOIN",
                         "priority": "P1", "message": "Adjacent inline text may concatenate words"})
        if NEGATION_EN.search(src) and not NEGATION_ES.search(dst) and len(src)>35:
            rows.append({"block": i, "kind": "NEGATION_MAY_BE_LOST",
                         "priority": "P1", "source": src[:130], "target": dst[:130]})
        if GUARANTEE_ES.search(dst) and not GUARANTEE_EN.search(src):
            # "no garantiza" is a safety qualifier, not an unsupported product claim.
            found = GUARANTEE_ES.search(dst)
            prefix = fold(dst[max(0, found.start()-55):found.start()])
            # "ningún producto garantiza" is an explicit negation; do not
            # elevate responsible safety wording into a false P0 claim.
            if not re.search(r"\b(?:no|ni|nunca|ningun|ninguna|ninguno|ningunos|ningunas)\b(?:\W+\w+){0,3}\W*$", prefix):
                rows.append({"block": i, "kind": "NEW_STRONG_PROMISE",
                             "priority": "P0_REVIEW", "source": src[:150],
                             "target": dst[:150]})
        if 55 < len(src) and len(dst) < max(18, .25 * len(src)):
            rows.append({"block": i, "kind": "SEVERE_SHORTENING",
                         "priority": "P1", "source_chars": len(src),
                         "target_chars": len(dst)})
    counts=Counter(x["kind"] for x in rows)
    return {"schema_version": "byl-es-v2-r3",
            "post_id": payload["post_id"], "source_hash": payload.get("source_hash"),
            "mode": "READ_ONLY", "fidelity_certified": False,
            "reviewer_decision": "INDEPENDENT_REVIEW_REQUIRED",
            "www_writes": 0, "paid_google_calls": 0,
            "source_blocks": len(en), "target_blocks": len(es),
            "findings_count": len(rows), "findings_by_kind": dict(counts),
            "findings": rows}


def main(argv=None):
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument("snapshot")
    p.add_argument("--termbank", help="Optional JSON file with an array of source/es term objects")
    p.add_argument("--output", required=True)
    args=p.parse_args(argv)
    try:
        snap=json.loads(Path(args.snapshot).read_text(encoding="utf-8-sig"))
        termbank=json.loads(Path(args.termbank).read_text(encoding="utf-8-sig")) if args.termbank else None
        out=findings_for(snap, termbank)
        Path(args.output).write_text(json.dumps(out, ensure_ascii=False, indent=2)+"\n",encoding="utf-8")
        print("FIDELITY_ADVISORY_DONE post="+str(out["post_id"])+" findings="+str(out["findings_count"]))
        return 0
    except (ValueError, KeyError, OSError, TypeError, json.JSONDecodeError) as exc:
        print("FIDELITY_ADVISORY_FAILED: "+str(exc), file=sys.stderr)
        return 2


if __name__=="__main__":
    raise SystemExit(main())
