#!/usr/bin/env python3
"""R4-A public reference vs authorized local screenshots; GET only, never edits.
Only a locally supplied route mapping; stores source screenshots in private
research output. Visual score is simple per-pixel RGB comparison, not SSIM.
"""
import argparse,json,pathlib,sys
from urllib.parse import urlparse
from PIL import Image, ImageChops,ImageStat
from playwright.sync_api import sync_playwright
def inspect(page, url, shot):
  errors=[];bad=[];non_get=[0]
  page.on("pageerror",lambda e:errors.append(str(e)[:180]))
  page.on("response",lambda r:bad.append({"status":r.status,"url":r.url[-95:]}) if r.status>=400 and r.request.resource_type in ("stylesheet","script","image","font") else None)
  def gate(route):
    if route.request.method not in ("GET","HEAD"):
      non_get[0]+=1;route.abort()
    else:route.continue_()
  page.route("**/*",gate)
  out={"url":url,"screenshot":str(shot),"http":None,"page_errors":[],"bad_assets":[],"non_get_blocked":0}
  try:
    response=page.goto(url,wait_until="domcontentloaded",timeout=32000)
    out["http"]=response.status if response else None
    page.wait_for_timeout(1500)
    page.add_style_tag(content="*,*::before,*::after{transition:none!important;animation:none!important;caret-color:transparent!important}")
    page.screenshot(path=str(shot),animations="disabled",full_page=False,timeout=14000)
    out["screenshot_bytes"]=shot.stat().st_size
    out["h1_count"]=page.locator("h1").count()
    out["body_height"]=page.evaluate("document.documentElement.scrollHeight")
    out["document_title"]=page.title()[:160]
  except Exception as e:out["error"]=str(e)[:280]
  out["page_errors"]=errors[:8];out["bad_assets"]=bad[:12];out["non_get_blocked"]=non_get[0]
  return out
def score(a,b):
  a=Image.open(a).convert("RGB");b=Image.open(b).convert("RGB")
  if a.size!=b.size:raise ValueError("DIFFERENT_VIEWPORT_DIMENSIONS")
  diff=ImageChops.difference(a,b)
  mean=sum(ImageStat.Stat(diff).mean)/3
  return {"rgb_similarity":round(1-mean/255,6),"mean_absolute_rgb_error":round(mean,3)}
def main():
 p=argparse.ArgumentParser()
 p.add_argument("--mapping",required=True);p.add_argument("--out",required=True);p.add_argument("--screens",required=True)
 args=p.parse_args()
 rows=json.loads(pathlib.Path(args.mapping).read_text(encoding="utf-8-sig"))
 if not isinstance(rows,list) or not 1<=len(rows)<=8:raise ValueError("UNSAFE_MAPPING_COUNT")
 out=pathlib.Path(args.out).resolve();screens=pathlib.Path(args.screens).resolve()
 if "_research" not in out.parts or "_research" not in screens.parts or out.exists():raise ValueError("PRIVATE_NEW_OUTPUT_ONLY")
 screens.mkdir(parents=True,exist_ok=True)
 report={"schema":"reference-to-local-visual/v1","mode":"GET_ONLY_PUBLIC_REFERENCE","methods_blocked":0,
         "pairs":[],"owner_approved":False,"source_fidelity_pass":False,"site_writes":0}
 with sync_playwright() as p:
  browser=p.chromium.launch(headless=True,args=["--no-proxy-server","--disable-extensions","--no-first-run"])
  try:
    for i,item in enumerate(rows):
      url1,url2=item["reference"],item["local"]
      u=urlparse(url1);v=urlparse(url2)
      if u.scheme!="https" or u.username or u.password or not u.hostname:
        raise ValueError("PUBLIC_REFERENCE_HTTPS_REQUIRED")
      if v.hostname not in ("localhost","127.0.0.1") and not (v.hostname and v.hostname.endswith(".local")):
        raise ValueError("LOCAL_TARGET_ONLY")
      for label,w,h in (("pc",1440,900),("mobile",375,812)):
        records=[]
        for role,url in [("reference",url1),("local",url2)]:
          context=browser.new_context(viewport={"width":w,"height":h},reduced_motion="reduce",color_scheme="light")
          page=context.new_page()
          name=f"pair{i+1}-{label}-{role}.png"
          val=inspect(page,url,screens/name)
          context.close()
          records.append(val)
        r={"name":item.get("name",f"pair{i+1}"),"viewport":label,"reference":records[0],"local":records[1]}
        for v in records:report["methods_blocked"]+=v["non_get_blocked"]
        if all(x.get("http")==200 and pathlib.Path(x["screenshot"]).is_file() for x in records):
          r["diff"]=score(records[0]["screenshot"],records[1]["screenshot"])
          r["comparable"]=True
        else:r["comparable"]=False
        report["pairs"].append(r)
        print(json.dumps({"name":r["name"],"view":label,"reference_http":records[0].get("http"),
         "local_http":records[1].get("http"),"visual":r.get("diff",{}).get("rgb_similarity"),
         "reference_error":records[0].get("error"),"comparable":r["comparable"]}),flush=True)
  finally:browser.close()
 report["comparables"]=sum(x["comparable"] for x in report["pairs"])
 report["status"]="R4_REFERENCE_MEASURED_NOT_OWNER_PASS"
 out.write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding="utf-8")
 print(json.dumps({"status":report["status"],"comparables":report["comparables"],"total":len(report["pairs"]),"report":str(out),"site_writes":0}),flush=True)
if __name__=="__main__":
 try:main()
 except (OSError,KeyError,ValueError) as e:raise SystemExit("R4_A_BLOCKED:"+str(e))