#!/usr/bin/env python3
"""Read-only, reusable WordPress theme source/asset auditor.

The tool reads an authorized local theme, never uploads content and never
looks at wp-config.php, uploads, databases or account credentials.
"""
import argparse
import hashlib
import json
from pathlib import Path
import re
import subprocess
import sys
from urllib.parse import urlparse
from urllib.request import build_opener, ProxyHandler, Request, HTTPRedirectHandler

def resolve_theme_child(root, relative):
    if not isinstance(relative, str) or not relative or "\x00" in relative:
        raise ValueError("Invalid manifest path")
    rel=relative.replace("\\","/")
    if rel.startswith("/") or re.match(r"^[A-Za-z]:",rel):
        raise ValueError("Absolute manifest path rejected")
    p=(root/rel).resolve()
    if not p.is_relative_to(root.resolve()):
        raise ValueError("Manifest path traversal rejected")
    return p

def syntax_check(files, binary, args=None):
    if not binary:return {"pass":0,"fail":[],"skipped":True}
    passed=0;fail=[]
    for p in files:
        try:
            cmd=[binary]+(args or [])+[str(p)]
            result=subprocess.run(cmd,capture_output=True,text=True,timeout=15)
            if result.returncode==0:passed+=1
            else:fail.append({"file":p.name,"error":(result.stderr+result.stdout)[-200:]})
        except (OSError, subprocess.TimeoutExpired) as exc:
            fail.append({"file":p.name,"error":str(exc)[:200]})
    return {"pass":passed,"fail":fail,"skipped":False}

class LocalRedirectGuard(HTTPRedirectHandler):
    def redirect_request(self, request, fp, code, msg, headers, newurl):
        uri=urlparse(newurl)
        if uri.hostname not in ("localhost","127.0.0.1","::1") and not (uri.hostname and uri.hostname.endswith(".local")):
            raise ValueError("External redirect blocked from local-only audit")
        return super().redirect_request(request, fp, code, msg, headers, newurl)
def scan(theme, base_url="", routes=(), php="", node=""):
    theme=Path(theme).resolve()
    if not theme.is_dir():
        raise ValueError("Theme directory not found")
    manifest_path=theme/"assets"/"manifest.json"
    if not manifest_path.is_file():
        raise ValueError("Build manifest missing")
    manifest=json.loads(manifest_path.read_text(encoding="utf-8"))
    if not isinstance(manifest,dict):
        raise ValueError("Manifest must be a JSON object")
    pairs=[]
    for key,dest in manifest.items():
        original=resolve_theme_child(theme,key)
        generated=resolve_theme_child(theme,dest)
        ok=original.is_file() and generated.is_file()
        pairs.append({
            "source":key,"target":dest,"exists":ok,
            "source_sha256":hashlib.sha256(original.read_bytes()).hexdigest() if original.is_file() else None,
            "target_sha256":hashlib.sha256(generated.read_bytes()).hexdigest() if generated.is_file() else None,
            "source_bytes":original.stat().st_size if original.is_file() else None,
            "target_bytes":generated.stat().st_size if generated.is_file() else None
        })
    top_files=list(theme.iterdir())
    php_files=sorted(p for p in top_files if p.suffix==".php" and p.is_file())
    js_files=sorted(p for p in top_files if p.suffix==".js" and p.is_file())
    css_files=sorted(p for p in top_files if p.suffix==".css" and p.is_file())
    json_checks={}
    for p in top_files:
        if p.suffix!=".json" or not p.is_file():continue
        try:json.loads(p.read_text(encoding="utf-8-sig"));json_checks[p.name]="PASS"
        except (json.JSONDecodeError,UnicodeError) as exc:json_checks[p.name]="FAIL: "+str(exc)[:120]
    php_result=syntax_check(php_files,php,["-l"])
    js_result=syntax_check(js_files,node,["--check"])
    route_probes=[]
    if base_url and routes:
        uri=urlparse(base_url)
        if uri.scheme not in ("http","https") or uri.hostname not in ("localhost","127.0.0.1","::1") and not uri.hostname.endswith(".local"):
            raise ValueError("Only explicit localhost/.local read-only routes are allowed")
        opener=build_opener(ProxyHandler({}),LocalRedirectGuard())
        for route in routes:
            if not isinstance(route,str) or not route.startswith("/") or route.startswith("//") or "?" in route or "#" in route:
                raise ValueError("Only plain local route paths are allowed")
            url=base_url.rstrip("/")+route
            try:
                with opener.open(Request(url,headers={"User-Agent":"AuthorizedLocalThemeAudit/1"}),timeout=15) as response:
                    body=response.read(2*1024*1024)
                    route_probes.append({"route":route,"status":response.status,"bytes_read":len(body),
                        "html_title_present":bool(re.search(br"<title\b",body,re.I))})
            except Exception as exc:route_probes.append({"route":route,"error":str(exc)[:180]})
    risk_files=[]
    for p in php_files:
        text=p.read_text(encoding="utf-8",errors="replace")
        if re.search(r"wc_get_products\(\s*\[\s*['\"]limit['\"]\s*=>\s*-1",text):
            risk_files.append(p.name)
    findings=[]
    if len(pairs)!=sum(x["exists"] for x in pairs):findings.append("FAIL_MANIFEST_MISSING_PAIR")
    if any(v.startswith("FAIL") for v in json_checks.values()):findings.append("FAIL_JSON")
    if php_result["fail"]:findings.append("FAIL_PHP_SYNTAX")
    if js_result["fail"]:findings.append("FAIL_JS_SYNTAX")
    if any(x.get("status")!=200 for x in route_probes):findings.append("OPEN_ROUTE_HTTP")
    if risk_files:findings.append("REVIEW_UNBOUNDED_PRODUCT_QUERY")
    return {
        "schema":"wordpress-local-theme-audit/v1",
        "root_files":{"php":len(php_files),"js":len(js_files),"css":len(css_files)},
        "manifest":{"pairs":len(pairs),"existing":sum(x["exists"] for x in pairs),"items":pairs},
        "json":json_checks,
        "lint":{"php":php_result,"js":js_result},
        "local_routes":route_probes,
        "unbounded_product_query_files":risk_files,
        "findings":findings,
        "status":"FAIL" if any(x.startswith("FAIL_") for x in findings) else ("OPEN" if findings else "STATIC_PASS")
    }

def main():
    a=argparse.ArgumentParser()
    a.add_argument("--theme",required=True)
    a.add_argument("--output",required=True)
    a.add_argument("--base-url",default="")
    a.add_argument("--route",action="append",default=[])
    a.add_argument("--php",default="")
    a.add_argument("--node",default="")
    opts=a.parse_args()
    try:
        report=scan(opts.theme,opts.base_url,opts.route,opts.php,opts.node)
        out=Path(opts.output);out.parent.mkdir(parents=True,exist_ok=True)
        out.write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding="utf-8")
        print(json.dumps({"status":report["status"],"manifest":str(report["manifest"]["existing"])+"/"+str(report["manifest"]["pairs"]),
          "php_lint":report["lint"]["php"]["pass"],"js_lint":report["lint"]["js"]["pass"],
          "routes":report["local_routes"],"findings":report["findings"],"report":str(out)},ensure_ascii=False))
        return 1 if report["status"]=="FAIL" else 0
    except (ValueError,KeyError,OSError,json.JSONDecodeError) as exc:
        print("AUDIT_ERROR:"+str(exc),file=sys.stderr);return 2
if __name__=="__main__":raise SystemExit(main())