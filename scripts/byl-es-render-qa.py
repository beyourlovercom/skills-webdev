#!/usr/bin/env python3
"""BYL ES V2 read-only pre-render QA: actual WordPress HTML text nodes vs TranslatePress keys.

No WordPress APIs, credentials, network calls, or mutation paths. Stdlib only.
Input: JSON with post_id, en_html, es_html, dictionary, and optional packet/seo.
Output: JSON findings; NEVER a publish decision.
"""
from __future__ import annotations

import argparse
import hashlib
import html
from html.parser import HTMLParser
import json
from pathlib import Path
import urllib.parse
import re
import sys
import unicodedata

BLOCK_RE = re.compile(r"<(p|li|h[1-6]|blockquote)\b[^>]*>(.*?)</\1\s*>", re.I | re.S)
TAG_RE = re.compile(r"<[^>]+>", re.S)
HREF_RE = re.compile(r'\bhref\s*=\s*["\x27]([^"\x27]+)["\x27]', re.I)
SHORTCODE_RE = re.compile(r"^\[\s*(?:product_card|products?|gallery)\b", re.I)
WHITESPACE_RE = re.compile(r"\s+")
SMART_TRANSLATION = str.maketrans({
    "\u2018": "'", "\u2019": "'", "\u201c": '"', "\u201d": '"',
    "\u2013": "-", "\u2014": "-", "\u00a0": " ",
})
DEFAULT_PRESERVE = frozenset({"BeYourLover", "WooCommerce", "TranslatePress", "SKU"})


def normalized(s: str) -> str:
    return WHITESPACE_RE.sub(" ", unicodedata.normalize("NFKC", html.unescape(s))
                             .translate(SMART_TRANSLATION)).strip().casefold()


class Chunks(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=False)
        self.parts: list[str] = []
        self.current = ""
        self.muted = 0

    def _flush(self):
        if self.current.strip():
            self.parts.append(self.current.strip())
        self.current = ""

    def handle_starttag(self, tag, attrs):
        self._flush()
        if tag in {"script", "style"}:
            self.muted += 1

    def handle_endtag(self, tag):
        self._flush()
        if tag in {"script", "style"} and self.muted:
            self.muted -= 1

    def handle_startendtag(self, tag, attrs):
        self._flush()

    def handle_data(self, data):
        if not self.muted:
            self.current += data

    def handle_entityref(self, name):
        if not self.muted:
            self.current += "&" + name + ";"

    def handle_charref(self, name):
        if not self.muted:
            self.current += "&#" + name + ";"

    def output(self):
        self._flush()
        return [s for s in self.parts if html.unescape(s).strip()]


def blocks_from_html(text):
    if not isinstance(text, str):
        raise ValueError("en_html and es_html must be HTML strings")
    blocks = []
    for m in BLOCK_RE.finditer(text):
        chunks = Chunks()
        chunks.feed(m.group(2))
        parts = chunks.output()
        if not parts:
            continue
        whole = " ".join(html.unescape(s) for s in parts).strip()
        if SHORTCODE_RE.match(whole):
            continue
        blocks.append({
            "tag": m.group(1).lower(),
            "chunks": parts,
            "whole": whole,
            "href": HREF_RE.findall(m.group(2)),
        })
    return blocks


def url_normalized(url):
    p = urllib.parse.urlsplit(html.unescape(url))
    # Equivalent trailing slash is a URL-formatting change, not link loss.
    return (p.scheme.lower(), p.netloc.lower(), p.path.rstrip("/") or "/", p.query, p.fragment)

def finding(kind, severity, block, detail, **extra):
    return {
        "kind": kind,
        "severity": severity,
        "block": block,
        "detail": detail,
        **extra,
    }


def check(payload):
    if not isinstance(payload, dict) or not isinstance(payload.get("post_id"), int):
        raise ValueError("post_id must be an integer")
    en_blocks = blocks_from_html(payload.get("en_html"))
    es_blocks = blocks_from_html(payload.get("es_html"))
    if not en_blocks or not es_blocks:
        raise ValueError("article body lacks supported text blocks")
    glossary = set(DEFAULT_PRESERVE) | set(payload.get("preserve_terms", []))
    dictionary = payload.get("dictionary", [])
    if not isinstance(dictionary, list):
        raise ValueError("dictionary must be a list")
    exact, normalized_rows = {}, {}
    for row in dictionary:
        if not isinstance(row, dict) or not isinstance(row.get("original"), str):
            continue
        key = row["original"].strip()
        exact.setdefault(key, []).append(row)
        normalized_rows.setdefault(normalized(key), []).append(row)

    packet = payload.get("packet", {})
    packet_wholes = set()
    for b in packet.get("blocks", []) if isinstance(packet, dict) else []:
        if isinstance(b, dict) and isinstance(b.get("en"), str):
            packet_wholes.add(normalized(b["en"]))

    # Only approve known, exact R9-verified English -> Spanish internal paths.
    # The upstream read-only snapshot exporter must source and verify each pair.
    approved_links=set()
    for pair in payload.get("approved_link_localizations",[]):
        if isinstance(pair,dict) and isinstance(pair.get("en"),str) and isinstance(pair.get("es"),str):
            approved_links.add((url_normalized(pair["en"]),url_normalized(pair["es"])))
    findings = []
    if len(en_blocks) != len(es_blocks):
        findings.append(finding(
            "BLOCK_ALIGNMENT", "P0_REVIEW", -1, "Source and localized block counts differ",
            en_blocks=len(en_blocks), es_blocks=len(es_blocks)))
    for i, en in enumerate(en_blocks):
        es = es_blocks[i] if i < len(es_blocks) else None
        if es is not None:
            if en["tag"] != es["tag"]:
                findings.append(finding("TAG_MISMATCH", "P0_REVIEW", i,
                                         "Block tag changed", source=en["tag"], target=es["tag"]))
            src_hrefs=[url_normalized(h) for h in en["href"]]
            dst_hrefs=[url_normalized(h) for h in es["href"]]
            verified=(
                len(src_hrefs)==len(dst_hrefs)
                and all(a==b or (a,b) in approved_links for a,b in zip(src_hrefs,dst_hrefs))
            )
            if not verified:
                findings.append(finding("LINK_CHANGED", "P0_REVIEW", i,
                                         "Href list changed without approved localized mapping",
                                         source=en["href"], target=es["href"]))
            if len(normalized(en["whole"])) >= 18 and normalized(en["whole"]) == normalized(es["whole"]):
                if en["whole"] not in glossary:
                    findings.append(finding("VISIBLE_ENGLISH", "P0_REVIEW", i,
                                             "Target block still equals source English",
                                             preview=en["whole"][:130]))
        for j, raw in enumerate(en["chunks"]):
            word = html.unescape(raw).strip()
            if not word or word in glossary or SHORTCODE_RE.match(word):
                continue
            key = raw.strip()
            original_rows = exact.get(key, [])
            exact_good = [x for x in original_rows
                          if str(x.get("status")) in {"1", "translated"} and x.get("translated")]
            if exact_good:
                continue
            alt = [x for x in normalized_rows.get(normalized(key), [])
                   if str(x.get("status")) in {"1", "translated"} and x.get("translated")]
            # Aliases differ from exact bytes: curly quotes / entities / whitespace.
            if alt:
                # An alias is actionable only if the target still visibly contains the English node.
                # TranslatePress may already have translated a separate rendered-HTML key.
                if es is not None and j < len(es["chunks"]) and normalized(word) != normalized(es["chunks"][j]):
                    continue
                findings.append(finding(
                    "RENDER_KEY_ALIAS", "P1", i,
                    "Actual DOM key differs from translated dictionary key",
                    chunk=j, actual_raw=key[:240],
                    matched_original=alt[0]["original"][:240]))
                continue
            if len(normalized(word)) < 12:
                continue
            # Protected quote attributions are not untranslated prose if they
            # are preserved verbatim beside an already localized quotation.
            if (es is not None and j<len(es["chunks"])
                    and re.fullmatch(r"\s*[-–—]\s*[A-Z][A-Za-z ]{2,45}[.]?\s*",word)
                    and normalized(word)==normalized(es["chunks"][j])):
                continue
            # A dictionary key may be absent because a different rendered key
            # was already translated. Do not claim English is visible unless
            # the matching Spanish text node is still effectively English.
            if (es is not None and j < len(es["chunks"])
                    and normalized(word) != normalized(es["chunks"][j])):
                continue
            is_split = len(en["chunks"]) > 1 and normalized(en["whole"]) in packet_wholes
            findings.append(finding(
                "DOM_SPLIT" if is_split else "MISSING_DOM_TRANSLATION",
                "P1", i,
                "Inline markup split a source block into separate TranslatePress nodes"
                if is_split else "Visible text node has no exact translated dictionary entry",
                chunk=j, actual_raw=key[:240],
                original_block=en["whole"][:170]))

    seo = payload.get("seo", {})
    if isinstance(seo, dict):
        for field, limit in [("title_es", 60), ("meta_es", 155)]:
            value = seo.get(field)
            if isinstance(value, str) and len(value) > limit:
                findings.append(finding(
                    "SEO_LENGTH", "P2", -1, f"{field} exceeds editorial guideline",
                    length=len(value), max_length=limit))
        keyword = seo.get("primary_keyword_es")
        if isinstance(keyword, str) and keyword.strip():
            if not normalized(keyword) in normalized(seo.get("title_es", "")):
                findings.append(finding("SEO_KEYWORD", "P2", -1,
                                         "Primary Spanish keyword absent from SEO title",
                                         keyword=keyword))
    kinds = {}
    for x in findings:
        kinds[x["kind"]] = kinds.get(x["kind"], 0) + 1
    fingerprint = hashlib.sha256(
        (str(payload["post_id"]) + "\n" + payload["en_html"] + "\n" + payload["es_html"])
        .encode("utf-8")).hexdigest()
    return {
        "schema_version": "byl-es-v2-r1",
        "post_id": payload["post_id"],
        "source_hash": payload.get("source_hash"),
        "evidence_sha256": fingerprint,
        "site_scope": "DEV_ONLY",
        "mode": "READ_ONLY",
        "www_writes": 0,
        "paid_google_calls": 0,
        "qa95_release": "NOT_EVALUATED",
        "independent_semantic_review": "REQUIRED",
        "en_blocks": len(en_blocks),
        "es_blocks": len(es_blocks),
        "findings_count": len(findings),
        "findings_by_kind": kinds,
        "findings": findings,
    }


def main(argv=None):
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("snapshot", help="Read-only Dev HTML/TranslatePress JSON snapshot")
    ap.add_argument("--output", help="Save local report JSON (never writes WordPress)")
    args = ap.parse_args(argv)
    inp = Path(args.snapshot)
    try:
        result = check(json.loads(inp.read_text(encoding="utf-8-sig")))
        out = json.dumps(result, ensure_ascii=False, indent=2) + "\n"
        if args.output:
            Path(args.output).write_text(out, encoding="utf-8")
        else:
            print(out, end="")
        return 0
    except (ValueError, OSError, json.JSONDecodeError) as exc:
        print(f"BYL_ES_V2_INPUT_ERROR: {exc}", file=sys.stderr)
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
