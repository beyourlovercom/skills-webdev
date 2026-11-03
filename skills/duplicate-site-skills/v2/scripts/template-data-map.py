#!/usr/bin/env python3
"""V2 mirror-first data-slot mapping (stdlib only).

Reads approved offline HTML; records verifiable text/asset/link slots without
normalizing/rebuilding the markup. Optional render operates ONLY in an isolated
scratch directory, with source digest + structure-preservation checks.
No network, browser, production writes, crawling, or direct mirror replacement.
"""
from __future__ import annotations

import argparse
import hashlib
from html import escape
from html.parser import HTMLParser
import json
from pathlib import Path
import re

MODULES = {"home": ("/", "shared-shell"),
           "services": ("/services/", "catalog-listings"),
           "cnc": ("/services/cnc-machining/", "content-services")}
TEXT_TAGS = {"title", "h1", "h2", "h3", "h4", "p"}
VOID_TAGS = {"area", "base", "br", "col", "embed", "hr", "img", "input",
             "link", "meta", "param", "source", "track", "wbr"}
STRUCTURAL_ATTRS = {"class", "role", "type", "aria-expanded", "data-element_type"}
ATTR_RE = re.compile(r"""(?i)(?<![\w:-])([-\w:]+)\s*=\s*(["'])(.*?)\2""", re.S)
SHA_RE = re.compile(r"^[a-f0-9]{64}$")

def digest(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()

def path_within(root: Path, candidate: Path) -> bool:
    root = root.resolve()
    candidate = candidate.resolve()
    return candidate != root and root in candidate.parents

class SlotScanner(HTMLParser):
    def __init__(self, source: str):
        super().__init__(convert_charrefs=False)
        self.source = source
        self.line_starts = [0]
        self.line_starts.extend(m.end() for m in re.finditer(r"\n", source))
        self.counts = {}
        self.stack = []
        self.slots = []
        self.shape = []

    def absolute_pos(self):
        line, col = self.getpos()
        return self.line_starts[line - 1] + col

    def handle_starttag(self, tag, attrs):
        idx = self.counts.get(tag, 0)
        self.counts[tag] = idx + 1
        attrs_dict = dict(attrs)
        structure = {key: attrs_dict.get(key) for key in sorted(STRUCTURAL_ATTRS)
                     if key in attrs_dict}
        self.shape.append(["open", tag, sorted(attrs_dict), structure])
        raw = self.get_starttag_text() or ""
        start = self.absolute_pos()
        attr_targets = {}
        if tag == "img":
            attr_targets = {"src", "alt", "data-src", "srcset"}
        elif tag == "a":
            attr_targets = {"href"}
        elif tag == "meta" and (attrs_dict.get("name", "").lower() == "description"
                                 or attrs_dict.get("property", "").lower()
                                 in {"og:title", "og:description", "og:image"}):
            attr_targets = {"content"}
        elif tag == "link" and "canonical" in (attrs_dict.get("rel") or ""):
            attr_targets = {"href"}
        if attr_targets:
            found = {}
            for match in ATTR_RE.finditer(raw):
                key = match.group(1).lower()
                if key not in attr_targets or key in found:
                    continue
                begin, end = start + match.start(3), start + match.end(3)
                if self.source[begin:end] != match.group(3):
                    raise ValueError("attribute source offset mismatch")
                found[key] = {
                    "id": f"{tag}:{idx}:attr:{key}",
                    "kind": "attribute", "tag": tag, "index": idx, "attr": key,
                    "value": match.group(3), "start": begin, "end": end
                }
            self.slots.extend(found.values())
        if tag not in VOID_TAGS:
            self.stack.append({"tag": tag, "idx": idx, "text_idx": 0})

    def handle_startendtag(self, tag, attrs):
        self.handle_starttag(tag, attrs)
        if tag not in VOID_TAGS:
            self.handle_endtag(tag)

    def handle_endtag(self, tag):
        self.shape.append(["close", tag])
        for i in range(len(self.stack) - 1, -1, -1):
            if self.stack[i]["tag"] == tag:
                del self.stack[i:]
                break

    def handle_data(self, text):
        if not text.strip():
            return
        parent = next((item for item in reversed(self.stack)
                       if item["tag"] in TEXT_TAGS), None)
        if not parent:
            return
        start = self.absolute_pos()
        end = start + len(text)
        if self.source[start:end] != text:
            # A parser-normalized or entity-expanded fragment is not safely
            # editable by exact offsets. Fail closed, rather than guessing.
            raise ValueError(f"text source offset mismatch at {start}")
        n = parent["text_idx"]
        parent["text_idx"] += 1
        self.slots.append({
            "id": f"{parent['tag']}:{parent['idx']}:text:{n}",
            "kind": "text", "tag": parent["tag"], "index": parent["idx"],
            "value": text, "start": start, "end": end
        })

    def shape_digest(self):
        return digest(json.dumps(self.shape, ensure_ascii=False,
                                 separators=(",", ":")).encode("utf-8"))

def extract_slots(raw: str):
    parser = SlotScanner(raw)
    parser.feed(raw)
    parser.close()
    slots = sorted(parser.slots, key=lambda item: (item["start"], item["end"]))
    seen = set()
    end = 0
    for item in slots:
        if item["id"] in seen or item["start"] < end:
            raise ValueError("duplicate/overlapping slots")
        seen.add(item["id"])
        end = item["end"]
    return slots, parser.shape_digest()

def approved_sample(ledger: dict, sample: str, html: Path) -> dict:
    if sample not in MODULES:
        raise ValueError("unsupported sample")
    route, module = MODULES[sample]
    if ledger.get("project_id") != "rapiddirect-v2-pilot" or \
       ledger.get("bulk_enabled") is not False or \
       ledger.get("production_writes") is not False:
        raise ValueError("pilot rights and no-batch gate denied")
    matched = [t for t in ledger.get("templates", [])
               if t.get("sample_id") == sample
               and t.get("template_id") == module
               and t.get("representative_route") == route]
    if len(matched) != 1 or matched[0].get("owner_visual_pass") is not True:
        raise ValueError("Owner sample visual approval missing")
    row = matched[0]
    if html.resolve() != Path(row["representative_local_file"]).resolve():
        raise ValueError("source is not the approved representative mirror file")
    if digest(html.read_bytes()) != row["representative_html_sha256"]:
        raise ValueError("approved representative HTML digest changed")
    return row

def inspect(html: Path, sample: str, ledger: dict) -> dict:
    approved_sample(ledger, sample, html)
    raw = html.read_text(encoding="utf-8")
    slots, structural_sha = extract_slots(raw)
    counts = {}
    for slot in slots:
        key = f"{slot['kind']}:{slot['tag']}"
        counts[key] = counts.get(key, 0) + 1
    return {
        "schema_version": 1, "sample": sample, "template_family": MODULES[sample][1],
        "source_file": str(html.resolve()),
        "source_sha256": digest(html.read_bytes()),
        "structure_sha256": structural_sha,
        "slot_count": len(slots), "field_counts": counts,
        "slots": slots,
        "is_generalized_template": False,
        "owner_visual_pass": True,
        "batch_authorized": False
    }

def require_private_scratch(ledger_file: Path, scratch_root: Path):
    # The only allowed local output area is the pre-existing project /uat/.
    # Merely allowing a caller-chosen --scratch-root would otherwise permit
    # writing NEW pages inside /mirror/ while pretending to be a smoke test.
    evidence_root = ledger_file.resolve(strict=True).parent
    if evidence_root.name.lower() != "uat" or not (
        scratch_root.resolve() == evidence_root
        or path_within(evidence_root, scratch_root)
    ):
        raise ValueError("scratch root must be inside the project's private UAT directory")

def assert_scratch_output(out: Path, scratch_root: Path, sources=()):
    base = scratch_root.resolve()
    dest = out.resolve()
    if not path_within(base, dest):
        raise ValueError("output is outside designated private scratch directory")
    if any(dest == p.resolve() for p in sources):
        raise ValueError("refusing to overwrite mirror source or mapping input")

def render(source: Path, mapping: dict, changes: dict) -> str:
    original = source.read_bytes()
    if digest(original) != mapping.get("source_sha256"):
        raise ValueError("SOURCE_SHA_DRIFT")
    html = original.decode("utf-8")
    slots, shape = extract_slots(html)
    if shape != mapping.get("structure_sha256"):
        raise ValueError("STRUCTURE_SHA_DRIFT")
    by_id = {slot["id"]: slot for slot in slots}
    if set(by_id) != {slot["id"] for slot in mapping.get("slots", [])}:
        raise ValueError("MAPPING_SLOT_DRIFT")
    if not isinstance(changes, dict):
        raise ValueError("changes must be a dictionary")
    if len(changes) > 1000:
        raise ValueError("too many slot substitutions")
    edits = []
    for slot_id, next_value in changes.items():
        if slot_id not in by_id:
            raise ValueError("unknown slot " + slot_id)
        if not isinstance(next_value, str) or len(next_value) > 8000:
            raise ValueError("unsafe slot value")
        slot = by_id[slot_id]
        if slot["kind"] == "attribute":
            key = slot["attr"]
            if key in {"href", "src", "srcset", "data-src"}:
                # srcset needs a separate source-by-source density/width parser.
                # A string starting with a local URL can otherwise smuggle a
                # second remote URL after a comma.
                if key == "srcset":
                    raise ValueError("srcset editing requires an audited media parser")
                if not next_value.startswith("/") or next_value.startswith("//") or \
                   "\\" in next_value or ".." in next_value or "%2e" in next_value.lower():
                    raise ValueError("external/unsafe replacement URL prohibited")
                if key in {"src", "data-src"} and \
                   not next_value.startswith(("/wp-content/", "/assets/")):
                    raise ValueError("media path outside isolated asset scope")
                if key == "href" and next_value.split("#", 1)[0] not in \
                   {"", "/", "/services/", "/services/cnc-machining/"}:
                    raise ValueError("pilot hyperlink outside approved three routes")
            replacement = escape(next_value, quote=True)
        else:
            replacement = escape(next_value, quote=False)
        edits.append((slot["start"], slot["end"], slot["value"], replacement))
    for start, end, previous, after in sorted(edits, key=lambda x: x[0], reverse=True):
        if html[start:end] != previous:
            raise ValueError("source slot changed during rendering")
        html = html[:start] + after + html[end:]
    _, new_shape = extract_slots(html)
    if new_shape != shape:
        raise ValueError("renderer unexpectedly changed markup structure")
    return html

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("action", choices=["inspect", "render"])
    parser.add_argument("--source", required=True)
    parser.add_argument("--sample", choices=sorted(MODULES), required=True)
    parser.add_argument("--ledger", required=True)
    parser.add_argument("--scratch-root", required=True)
    parser.add_argument("--output", required=True)
    parser.add_argument("--mapping")
    parser.add_argument("--changes")
    parser.add_argument("--execute", action="store_true")
    args = parser.parse_args()
    source = Path(args.source).resolve(strict=True)
    ledger = json.loads(Path(args.ledger).read_text(encoding="utf-8"))
    approved_sample(ledger, args.sample, source)
    dest = Path(args.output)
    scratch = Path(args.scratch_root).resolve(strict=True)
    require_private_scratch(Path(args.ledger), scratch)
    inputs = [source, Path(args.ledger)]
    if args.action == "inspect":
        result = inspect(source, args.sample, ledger)
        rendered = json.dumps(result, ensure_ascii=False, indent=2) + "\n"
    else:
        if not args.mapping or not args.changes:
            raise ValueError("render requires --mapping and --changes")
        mapping = json.loads(Path(args.mapping).read_text(encoding="utf-8"))
        updates = json.loads(Path(args.changes).read_text(encoding="utf-8"))
        if mapping.get("sample") != args.sample:
            raise ValueError("sample / mapping mismatch")
        inputs += [Path(args.mapping), Path(args.changes)]
        rendered = render(source, mapping, updates)
        result = {"sample": args.sample, "updated_slots": len(updates),
                  "rendered_sha256": digest(rendered.encode("utf-8")),
                  "structure_preserved": True, "source_write": False}
    assert_scratch_output(dest, scratch, inputs)
    if args.execute:
        dest.parent.mkdir(parents=True, exist_ok=True)
        if dest.exists():
            raise ValueError("scratch output exists; use a new version, no overwrite")
        dest.write_text(rendered, encoding="utf-8")
    print(json.dumps({
        "status": "LOCAL_SCRATCH_CREATED" if args.execute else "DRY_RUN",
        "action": args.action, "sample": args.sample,
        "slot_count": result.get("slot_count"),
        "updated_slots": result.get("updated_slots"),
        "out": str(dest), "source_write": False, "batch": False
    }, ensure_ascii=False))

if __name__ == "__main__":
    try:
        main()
    except (OSError, ValueError, KeyError, UnicodeError) as exc:
        raise SystemExit(str(exc)) from exc
