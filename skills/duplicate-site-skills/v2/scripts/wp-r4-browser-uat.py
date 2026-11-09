#!/usr/bin/env python3
"""R4: local-only read-only browser UAT for selected, already-restored routes.
No form submission, checkout, login, external network, or production operations.
"""
import argparse,json,pathlib,re,sys
from urllib.parse import urlparse
from playwright.sync_api import sync_playwright, TimeoutError as PwTimeout
ALLOWED_KINDS={"home","listing","product","content"}
def main():
 a=argparse.ArgumentParser()
 a.add_argument("--origin",required=True)
 a.add_argument("--out",required=True)
 a.add_argument("--shots",required=True)
 a.add_argument("--routes",required=True)
 args=a.parse_args()
 base=args.origin.rstrip("/")
 host=urlparse(base).hostname
 if urlparse(base).scheme not in ("http","https") or not host or not (host in ("localhost","127.0.0.1") or host.endswith(".local")):
  raise ValueError("LOCAL_ORIGIN_NOT_ALLOWLISTED")
 routes=json.loads(pathlib.Path(args.routes).read_text(encoding="utf-8-sig"))
 if not isinstance(routes,list) or not (1<=len(routes)<=30):raise ValueError("ROUTES_OUT_OF_SCOPE")
 seen=set()
 for entry in routes:
  if not isinstance(entry,dict) or entry.get("kind") not in ALLOWED_KINDS:raise ValueError("INVALID_ROUTE_KIND")
  path=entry.get("path")
  if not isinstance(path,str) or not path.startswith("/") or path.startswith("//") or "?" in path or "#" in path or ".." in path or "\\" in path:
   raise ValueError("UNSAFE_LOCAL_ROUTE")
  if path in seen:raise ValueError("DUPLICATE_LOCAL_ROUTE")
  seen.add(path)
 output=pathlib.Path(args.out).resolve();shotdir=pathlib.Path(args.shots).resolve()
 if "_research" not in output.parts or "_research" not in shotdir.parts or output.exists():raise ValueError("PRIVATE_NEW_OUTPUT_ONLY")
 shotdir.mkdir(parents=True,exist_ok=True)
 report={"status":"UAT_IN_PROGRESS","origin":base,"browser":"Playwright Chromium headless",
  "read_only":True,"external_requests_blocked":0,"non_get_blocked":0,
  "views":[],"site_writes":0,"owner_visual_pass":False}
 with sync_playwright() as p:
  browser=p.chromium.launch(headless=True,args=["--no-proxy-server","--disable-extensions","--no-first-run"])
  try:
   for entry in routes:
    path,kind=entry["path"],entry["kind"]
    for width,height,label in ((1440,900,"pc"),(375,812,"mobile")):
     context=browser.new_context(viewport={"width":width,"height":height},ignore_https_errors=False)
     page=context.new_page()
     runtime_errors=[];bad_local=[];blocked_ext=[];blocked_methods=[]
     page.on("pageerror",lambda e: runtime_errors.append(str(e)[:240]))
     def guard(route):
      request=route.request
      u=urlparse(request.url)
      if request.method!="GET":
       blocked_methods.append(request.method+" "+request.url[:120]);return route.abort()
      if u.scheme in ("data","blob","about"):return route.continue_()
      if u.hostname!=urlparse(base).hostname:
       blocked_ext.append(request.url[:140]);return route.abort()
      return route.continue_()
     page.route("**/*",guard)
     page.on("response",lambda r:bad_local.append({"status":r.status,"url":r.url[-150:]}) if r.status>=400 and urlparse(r.url).hostname==urlparse(base).hostname else None)
     u=base+path
     case={"route":path,"kind":kind,"viewport":label,"width":width,"height":height,"url":u,
        "interaction":"NOT_TESTED","pageerrors":[],"local_http_failures":[],"external_requests_blocked":0,
        "non_get_blocked":0}
     try:
      response=page.goto(u,wait_until="domcontentloaded",timeout=30000)
      case["http_status"]=response.status if response else None
      page.wait_for_timeout(950)
      case["h1_count"]=page.locator("h1").count()
      case["main_text_chars"]=len(page.locator("main").first.inner_text().strip()) if page.locator("main").count() else 0
      case["rendered_title"]=page.title()[:130]
      case["body_scroll_width"]=page.evaluate("document.documentElement.scrollWidth")
      case["overflow_px"]=max(0,case["body_scroll_width"]-width)
      interaction=entry.get("interaction")
      if interaction is not None:
       if not isinstance(interaction,dict) or not all(isinstance(interaction.get(k),str) for k in ("open","close","open_assert")):
        raise ValueError("UNSAFE_INTERACTION_CONFIG")
       opener=page.locator(interaction["open"])
       closer=page.locator(interaction["close"])
       if not opener.count() or not closer.count():
        case["interaction"]="OPEN_TOGGLE_CONTROL_ABSENT"
       elif not opener.first.evaluate("(el) => el.tagName==='BUTTON' && el.type==='button'"):
        case["interaction"]="OPEN_UNSAFE_CONTROL_REFUSED"
       elif not closer.first.evaluate("(el) => el.tagName==='BUTTON' && el.type==='button'"):
        case["interaction"]="OPEN_UNSAFE_CLOSE_REFUSED"
       else:
        opener.first.click(timeout=4000)
        case["interaction"]="PASS_TOGGLE_OPEN" if page.locator(interaction["open_assert"]).count() else "FAIL_TOGGLE_OPEN"
        closer.first.click(timeout=4000)
        case["interaction"]+="_CLOSE" if not page.locator(interaction["open_assert"]).count() else "_FAIL_TOGGLE_CLOSE"
      file=shotdir/(kind+"-"+path.strip("/").split("/")[-1].replace("-","_")+"-"+label+".png")
      page.screenshot(path=str(file),animations="disabled",timeout=18000,full_page=False)
      case["screenshot_file"]=str(file)
      case["screenshot_bytes"]=file.stat().st_size
     except Exception as ex:
      case["error"]=str(ex)[:270]
     case["pageerrors"]=runtime_errors[:8]
     case["local_http_failures"]=bad_local[:12]
     case["external_requests_blocked"]=len(blocked_ext)
     case["non_get_blocked"]=len(blocked_methods)
     report["external_requests_blocked"]+=len(blocked_ext)
     report["non_get_blocked"]+=len(blocked_methods)
     case["result"]="PASS" if case.get("http_status")==200 and case.get("screenshot_bytes",0)>3000 and not runtime_errors and not bad_local and not case.get("error") and not case["interaction"].startswith(("FAIL","OPEN")) and case["non_get_blocked"]==0 and case["h1_count"]>=1 and case["main_text_chars"]>=75 and case["overflow_px"]<10 else "OPEN"
     report["views"].append(case)
     print(json.dumps({"route":path,"view":label,"status":case["result"],"http":case.get("http_status"),"interaction":case["interaction"],"pageerrors":len(runtime_errors),"local_failures":len(bad_local),"overflow":case.get("overflow_px"),"screenshot_bytes":case.get("screenshot_bytes")}),flush=True)
     context.close()
  finally:browser.close()
 report["passed"]=sum(x["result"]=="PASS" for x in report["views"])
 report["total"]=len(report["views"])
 report["status"]="R4_BROWSER_STATIC_UAT_COMPLETE_WITH_OPEN" if report["passed"]!=report["total"] else "R4_BROWSER_STATIC_UAT_PASS_INTERACTIONS_PARTIAL"
 output.parent.mkdir(parents=True,exist_ok=True);output.write_text(json.dumps(report,indent=2,ensure_ascii=False),encoding="utf-8")
 print(json.dumps({"status":report["status"],"passed":report["passed"],"total":report["total"],"external_blocked":report["external_requests_blocked"],"output":str(output)}))
if __name__=="__main__":
 try:main()
 except Exception as ex:raise SystemExit("R4_BROWSER_FAILED:"+str(ex))