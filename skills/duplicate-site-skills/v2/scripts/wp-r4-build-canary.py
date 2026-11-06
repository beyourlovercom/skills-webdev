#!/usr/bin/env python3
"""R4-B safe CSS/JS final-batch canary; browser routes to scratch build without
writing to WordPress or editing any live theme. 10 viewport views by default.
"""
import argparse,json,pathlib,hashlib,re,sys
from urllib.parse import urlparse
from PIL import Image, ImageChops, ImageStat
from playwright.sync_api import sync_playwright

def sha(f):return hashlib.sha256(pathlib.Path(f).read_bytes()).hexdigest()
def read_json(f):return json.loads(pathlib.Path(f).read_text(encoding="utf-8-sig"))
def plan(theme,stage,base,routes):
 theme=pathlib.Path(theme).resolve(strict=True);stage=pathlib.Path(stage).resolve(strict=True)
 old=read_json(theme/"assets"/"manifest.json");new=read_json(stage/"assets"/"manifest.json")
 receipt=read_json(stage/"build-receipt.json")
 if set(old)!=set(new) or len(old)!=len(receipt["files"]):raise ValueError("SOURCE_TARGET_MANIFEST_KEYS_CHANGED")
 if receipt["production_ready"] is not False or receipt["site_writes"]!=0:raise ValueError("UNSAFE_BUILD_RECEIPT")
 url_map={}
 for source in old:
  dest=stage/new[source]
  row=next((r for r in receipt["files"] if r["source"]==source),None)
  if row is None or not dest.is_file() or sha(dest)!=row["dist_sha256"]:raise ValueError("DIST_INTEGRITY_FAIL:"+source)
  public_path="/wp-content/themes/"+theme.name+"/"+old[source].replace("\\","/")
  url_map[public_path]=dest
 if not base.startswith(("http://","https://")) or (not urlparse(base).hostname or (urlparse(base).hostname not in ("localhost","127.0.0.1") and not urlparse(base).hostname.endswith(".local"))):raise ValueError("LOCAL_ONLY_ORIGIN")
 if len(routes)>30 or not routes:raise ValueError("ROUTE_COUNT_INVALID")
 for row in routes:
  p=row.get("path")
  if not isinstance(p,str) or not p.startswith("/") or p.startswith("//") or ".." in p or "#" in p or "?" in p:raise ValueError("ROUTE_UNSAFE")
 return url_map,receipt
def visual(left,right):
 a=Image.open(left).convert("RGB");b=Image.open(right).convert("RGB")
 if a.size!=b.size:raise ValueError("DIMENSIONS_CHANGED")
 d=ImageChops.difference(a,b)
 m=ImageStat.Stat(d).mean
 n=sum(m)/3/255
 return {"similarity":round(1-n,6),"mean_abs_error":round(sum(m)/3,3),
         "pixel_diff_fraction":round(sum(d.convert("L").histogram()[17:])/(a.width*a.height),6)}
def main():
 p=argparse.ArgumentParser()
 for v in ["theme","stage","origin","routes","out","screens"]:p.add_argument("--"+v,required=True)
 a=p.parse_args()
 theme=pathlib.Path(a.theme);stage=pathlib.Path(a.stage)
 entries=read_json(a.routes);mapping,receipt=plan(theme,stage,a.origin,entries)
 out=pathlib.Path(a.out).resolve();screen=pathlib.Path(a.screens).resolve()
 if "_research" not in out.parts or "_research" not in screen.parts or out.exists():raise ValueError("PRIVATE_UNIQUE_OUTPUT_REQUIRED")
 screen.mkdir(parents=True,exist_ok=True)
 result={"schema":"wp-final-batch-canary/v1","source":"authorized Windows Local only","baseline_theme":str(theme),
         "staging_build":str(stage),"checks":[],"published":False,"site_writes":0,
         "owner_visual_pass":False,"source_visual_score":None,"manifest_entries":len(mapping)}
 with sync_playwright() as p:
  browser=p.chromium.launch(headless=True,args=["--no-proxy-server","--disable-extensions","--no-first-run"])
  try:
   for row in entries:
    for label,width,height in [("pc",1440,900),("mobile",375,812)]:
     images=[]
     states=[]
     for mode in ("live","canary"):
      context=browser.new_context(viewport={"width":width,"height":height},reduced_motion="reduce",color_scheme="light")
      page=context.new_page();replaced=set();errors=[];http_bad=[];external=0;non_get=0
      page.on("pageerror",lambda err:errors.append(str(err)[:240]))
      page.on("response",lambda resp:http_bad.append({"status":resp.status,"url":resp.url[-100:]}) if resp.status>=400 and urlparse(resp.url).hostname==urlparse(a.origin).hostname else None)
      def intercept(route):
       nonlocal external,non_get
       req=route.request
       uri=urlparse(req.url)
       if req.method!="GET":
        non_get+=1;return route.abort()
       if uri.scheme in ("data","blob","about"):return route.continue_()
       if uri.hostname!=urlparse(a.origin).hostname:
        external+=1;return route.abort()
       lookup=uri.path
       if mode=="canary" and lookup in mapping:
        file=mapping[lookup];replaced.add(lookup)
        return route.fulfill(status=200,path=str(file),content_type=("text/css" if file.suffix==".css" else "application/javascript"))
       return route.continue_()
      page.route("**/*",intercept)
      filename=row["kind"]+"-"+row["path"].strip("/").split("/")[-1].replace("-","_")+"-"+label+"-"+mode+".png"
      pic=screen/filename
      record={"mode":mode,"http":None,"screenshot":str(pic),"replaced_asset_count":0,
              "runtime_errors":[],"local_http_failures":[],"external_blocked":0,"non_get_blocked":0}
      try:
       response=page.goto(a.origin.rstrip("/")+row["path"],wait_until="domcontentloaded",timeout=35000)
       record["http"]=response.status if response else 0
       page.wait_for_timeout(1100)
       try:page.evaluate("() => document.fonts.ready")
       except Exception:pass
       page.add_style_tag(content="*,*::before,*::after{transition:none!important;animation:none!important;caret-color:transparent!important}")
       page.screenshot(path=str(pic),animations="disabled",timeout=18000,full_page=False)
       record["screenshot_bytes"]=pic.stat().st_size
       record["h1_count"]=page.locator("h1").count()
       record["scroll_width"]=page.evaluate("document.documentElement.scrollWidth")
      except Exception as exc:record["failure"]=str(exc)[:220]
      record.update({"replaced_asset_count":len(replaced),"runtime_errors":errors,"local_http_failures":http_bad,
                     "external_blocked":external,"non_get_blocked":non_get})
      states.append(record)
      context.close()
     entry={"route":row["path"],"viewport":label,"baseline":states[0],"canary":states[1]}
     if all(pathlib.Path(x["screenshot"]).is_file() for x in states):
      entry["visual"]=visual(states[0]["screenshot"],states[1]["screenshot"])
     entry["gate"]="PASS" if (entry.get("visual",{}).get("similarity",0)>=0.97 and
         states[0]["http"]==200 and states[1]["http"]==200 and
         states[1]["replaced_asset_count"]>0 and not any(s["runtime_errors"] or s["local_http_failures"] or
         s["non_get_blocked"] or s.get("failure") for s in states)) else "OPEN"
     result["checks"].append(entry)
     print(json.dumps({"path":row["path"],"view":label,"status":entry["gate"],
       "similarity":entry.get("visual",{}).get("similarity"),"mapped":states[1]["replaced_asset_count"],
       "errors":len(states[1]["runtime_errors"]),"local_http_failures":len(states[1]["local_http_failures"])}),flush=True)
  finally:browser.close()
 result["passed"]=sum(x["gate"]=="PASS" for x in result["checks"])
 result["total"]=len(result["checks"])
 result["status"]="R4_BUILD_CANARY_PASS_UNPUBLISHED" if result["passed"]==result["total"] else "R4_BUILD_CANARY_OPEN"
 out.parent.mkdir(parents=True,exist_ok=True);out.write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding="utf-8")
 print(json.dumps({"status":result["status"],"passed":result["passed"],"total":result["total"],
   "output":str(out),"site_writes":0}),flush=True)
if __name__=="__main__":
 try:main()
 except (OSError,ValueError,KeyError) as exc:raise SystemExit("R4_CANARY_BLOCKED:"+str(exc))