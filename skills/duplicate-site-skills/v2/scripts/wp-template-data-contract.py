#!/usr/bin/env python3
"""R2: authorized local WordPress template and per-route data contract. GET only.

No WordPress/theme writes; creates ONLY an explicitly requested private JSON
inventory under a research directory. Never asserts Owner visual approval.
"""
import argparse, hashlib, json, re
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlparse
from urllib.request import build_opener, ProxyHandler, Request, HTTPRedirectHandler

TEMPLATES={
 "home":("homepage.php","home.php","header.php","footer.php"),
 "listing":("products-archive.php","header.php","footer.php"),
 "product":("products-single.php","header.php","footer.php"),
 "content":("page-reference.php","page.php","header.php","footer.php")
}
ALLOWED_HOSTS={"localhost","127.0.0.1","::1"}
def is_local(host):
 return bool(host) and (host in ALLOWED_HOSTS or host.endswith(".local"))
def digest(raw):return hashlib.sha256(raw).hexdigest()
class NoRemoteRedirect(HTTPRedirectHandler):
 def __init__(self,expected_host):
  super().__init__();self.expected_host=expected_host
 def redirect_request(self,req,fp,code,msg,headers,newurl):
  if urlparse(newurl).hostname!=self.expected_host:raise ValueError("REMOTE_REDIRECT_BLOCKED")
  return super().redirect_request(req,fp,code,msg,headers,newurl)
class Fields(HTMLParser):
 def __init__(self):
  super().__init__();self.head=False;self.h1=False;self.title=[];self.headings=[];self.images=[];self.anchors=0;self.h1_count=0
 def handle_starttag(self,t,a):
  d=dict(a)
  if t=="title":self.head=True
  if t=="h1":self.h1=True;self.h1_count+=1
  if t=="img" and len(self.images)<8:
   src=d.get("src","")
   if src and not src.startswith("data:"):self.images.append(src)
  if t=="a":self.anchors+=1
 def handle_endtag(self,t):
  if t=="title":self.head=False
  if t=="h1":self.h1=False
 def handle_data(self,v):
  if self.head:self.title.append(v)
  if self.h1:self.headings.append(v)
def route_kind(entry):
 if not isinstance(entry,dict):raise ValueError("ROUTE_OBJECT_REQUIRED")
 p=entry.get("path");kind=entry.get("kind")
 if kind not in TEMPLATES or not isinstance(p,str) or not p.startswith("/") or p.startswith("//") or "\\" in p or "?" in p or "#" in p or ".." in p:
  raise ValueError("ROUTE_SCOPE_INVALID")
 if (kind=="home" and p!="/") or (kind=="listing" and p!="/shop/" and not p.startswith("/collections/")) or (kind=="product" and not p.startswith("/products/")) or (kind=="content" and not p.startswith("/pages/")):
  raise ValueError("ROUTE_KIND_MISMATCH")
 return p,kind
def plan(theme,origin,rows):
 theme=Path(theme).resolve()
 if not theme.is_dir():raise ValueError("THEME_NOT_FOUND")
 u=urlparse(origin)
 if u.scheme not in ("http","https") or not is_local(u.hostname) or u.path not in ("","/") or u.query or u.username or u.password:
  raise ValueError("LOCAL_ORIGIN_REQUIRED")
 opener=build_opener(ProxyHandler({}),NoRemoteRedirect(u.hostname))
 checked=[];seen=set()
 sha_by_kind={}
 for row in rows:
  path,kind=route_kind(row)
  if path in seen:raise ValueError("DUPLICATE_ROUTE")
  seen.add(path)
  template_parts=[]
  for filename in TEMPLATES[kind]:
   f=(theme/filename).resolve()
   if not f.is_relative_to(theme) or not f.is_file():raise ValueError("MISSING_TEMPLATE:"+filename)
   template_parts.append(filename.encode()+b"\0"+f.read_bytes())
  signature=digest(b"\n".join(template_parts))
  sha_by_kind[kind]=signature
  url=origin.rstrip("/")+path
  with opener.open(Request(url,headers={"User-Agent":"LocalWordPressR2Inspector/1.0"},method="GET"),timeout=18) as reply:
   body=reply.read(2500000)
   if reply.status!=200:raise ValueError("LOCAL_ROUTE_NOT_200:"+path)
   if not is_local(urlparse(reply.url).hostname):raise ValueError("REDIRECTED_OFF_LOCAL")
   if b"<html" not in body[:1200].lower():raise ValueError("NOT_HTML:"+path)
  text=body.decode("utf-8","replace");parser=Fields();parser.feed(text)
  field_data={"page_title":" ".join(parser.title).strip()[:250],
    "heading":" ".join(x.strip() for x in parser.headings if x.strip())[:300],
    "image_sources":parser.images[:3],
    "link_count":parser.anchors,
    "image_count_first8":len(parser.images)}
  checked.append({"path":path,"template_class":kind,"template_files":list(TEMPLATES[kind]),
     "template_sha256":signature,"data":field_data,"data_sha256":digest(json.dumps(field_data,sort_keys=True).encode()),
     "html_sha256":digest(body),"html_bytes":len(body),"h1_count":parser.h1_count,"status":"LOCAL_HTML_READ_OK"})
 groups={}
 for row in checked:groups.setdefault(row["template_class"],[]).append(row)
 group_evidence=[]
 for kind,items in groups.items():
  group_evidence.append({"template_class":kind,"routes":len(items),
     "template_sha256":items[0]["template_sha256"],
     "single_template":len({x["template_sha256"] for x in items})==1,
     "distinct_data_variants":len({x["data_sha256"] for x in items}),
     "owner_visual_pass":False,"batch_enabled":False})
 return {"schema":"wordpress-template-data-contract/v1",
   "mode":"LOCAL_READ_ONLY", "source_theme":str(theme),"local_origin":origin.rstrip("/"),
   "routes":checked,"groups":group_evidence,
   "owner_visual_pass":False,"allow_batch":False,
   "status":"R2_DATA_CONTRACT_READY_NOT_FROZEN"}
def main():
 p=argparse.ArgumentParser()
 p.add_argument("--theme",required=True);p.add_argument("--origin",required=True)
 p.add_argument("--routes",required=True);p.add_argument("--out",required=True)
 a=p.parse_args()
 rows=json.loads(Path(a.routes).read_text(encoding="utf-8-sig"))
 if not isinstance(rows,list) or not rows or len(rows)>30:raise ValueError("ROUTES_MAX_30")
 result=plan(a.theme,a.origin,rows)
 out=Path(a.out).resolve()
 if "_research" not in out.parts or out.exists():raise ValueError("PRIVATE_NEW_RESEARCH_OUTPUT_ONLY")
 out.parent.mkdir(parents=True,exist_ok=True);out.write_text(json.dumps(result,indent=2,ensure_ascii=False),encoding="utf-8")
 print(json.dumps({"status":result["status"],"routes":len(result["routes"]),"groups":result["groups"],"output":str(out),"site_writes":0}))
if __name__=="__main__":
 try:main()
 except (ValueError,OSError,KeyError,json.JSONDecodeError) as exc:raise SystemExit("R2_BLOCKED:"+str(exc))