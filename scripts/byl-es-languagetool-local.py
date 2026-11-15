#!/usr/bin/env python3
"""Optional LanguageTool self-hosted adapter. Never contacts the public service.

Requires a separately configured LanguageTool server at localhost / 127.0.0.1.
This file neither installs Java/Docker nor launches a server.
"""
import argparse
import ipaddress
import json
from pathlib import Path
import sys
import urllib.parse
import urllib.request


class RejectRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        raise ValueError("Redirects are disabled; LanguageTool may not leave loopback")

def safe_endpoint(raw):
    try:
        url = urllib.parse.urlsplit(raw)
        if url.scheme != "http" or url.username or url.password or url.query or url.fragment:
            raise ValueError("Only plain local HTTP endpoint supported")
        if url.hostname not in {"localhost", "127.0.0.1", "::1"}:
            # Accept loopback IPs only, reject proxy/public providers, all IPv6 except ::1.
            if not url.hostname or not ipaddress.ip_address(url.hostname).is_loopback:
                raise ValueError("LanguageTool URL must use loopback host")
        if url.path.rstrip("/") != "/v2/check":
            raise ValueError("LanguageTool path must be /v2/check")
        if url.port is None:
            raise ValueError("Explicit local server port required")
        return raw
    except (ValueError, TypeError) as exc:
        raise ValueError(f"Unsafe LanguageTool endpoint: {exc}") from exc


def inspect(text, endpoint, timeout=12):
    endpoint = safe_endpoint(endpoint)
    if len(text) > 18000:
        raise ValueError("Text exceeds local batch cap")
    request = urllib.request.Request(
        endpoint,
        data=urllib.parse.urlencode({"text": text, "language": "es", "level": "picky"}).encode(),
        headers={"Content-Type": "application/x-www-form-urlencoded"},
        method="POST",
    )
    # Bypass inherited HTTP_PROXY variables: forced localhost request.
    with urllib.request.build_opener(urllib.request.ProxyHandler({}), RejectRedirect()).open(
        request, timeout=timeout
    ) as response:
        result = json.load(response)
    return [{
        "message": m.get("message", ""),
        "offset": m.get("offset"),
        "length": m.get("length"),
        "rule_id": m.get("rule", {}).get("id"),
        "category": m.get("rule", {}).get("category", {}).get("id"),
        "suggestions": [x.get("value") for x in m.get("replacements", [])[:3]],
        "severity": "P1_PROPOSAL",
    } for m in result.get("matches", [])]


def main(argv=None):
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("--endpoint", default="http://127.0.0.1:8010/v2/check")
    p.add_argument("--text-file", required=True, help="Local Spanish plaintext only")
    p.add_argument("--output", required=True, help="Local output only")
    args = p.parse_args(argv)
    try:
        safe_endpoint(args.endpoint)
        text = Path(args.text_file).read_text(encoding="utf-8")
        issues = inspect(text, args.endpoint)
        Path(args.output).write_text(
            json.dumps({"mode": "LOCAL_SELF_HOSTED", "language": "es",
                        "suggestions_not_auto_applied": True,
                        "matches": issues}, ensure_ascii=False, indent=2) + "\n",
            encoding="utf-8",
        )
        print(f"LT_LOCAL_CHECK_DONE matches={len(issues)}")
        return 0
    except Exception as exc:
        print(f"LT_UNAVAILABLE_OR_FAILED: {exc}", file=sys.stderr)
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
