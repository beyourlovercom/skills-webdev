"""Read-only Whole-Site Integration for Duplicate Site Skills V2."""
from collections import Counter,defaultdict
from datetime import datetime,timezone
from html import escape
from http.server import BaseHTTPRequestHandler,ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs,quote,unquote,urlsplit
import json,mimetypes,re,xml.etree.ElementTree as ET

BASE=Path(r"C:\ai\site-mirror\rapiddirect-v2")
STAGE=BASE/"uat"/"r15-fast-lane"/"offline-staged"
R14=BASE/"uat"/"r14-nine-approved"/"offline-staged"
MIRROR=BASE/"mirror"
NEW=BASE/"uat"/"full-site-content"
REPORT=BASE/"uat"/"full-site-integration"
PORT=8787
ORIGIN=f"http://127.0.0.1:{PORT}"
REPORT.mkdir(parents=True,exist_ok=True); NEW.mkdir(parents=True,exist_ok=True)
SOURCE=BASE/"uat"/"r13-site-inventory"
inventory=json.loads((SOURCE/"nonblog-route-inventory.json").read_text(encoding="utf-8"))
source_paths={r["path"]:r for r in inventory["routes"]}
R15=json.loads((BASE/"uat"/"r15-fast-lane"/"r15-exact-99-candidates-PENDING-OWNER.json").read_text(encoding="utf-8"))
approved={r["path"] for r in R15["routes"]}
assert len(source_paths)==834 and len(approved)==99
assert R15["sha256_exact_url_list"]=="76871d3322e11751727aeff405d1a4bfc1e8e1dcb4ad7016ee63888253f75b4a"
SITEMAP_FILES=[
 "ems-sitemap.xml","wp-author-sitemap.xml","wp-cases_studies-sitemap.xml",
 "wp-industries-sitemap.xml","wp-job-sitemap.xml","wp-news-sitemap.xml",
 "wp-page-sitemap.xml","wp-post-sitemap.xml","wp-surface-finish-sitemap.xml"]
assert all((SOURCE/f).is_file() for f in SITEMAP_FILES)
TITLES={"services":"Services / 服务","industries":"Industries / 行业","materials":"Materials / 材料",
 "surface_finish":"Surface Finishes / 表面处理","npi":"NPI / 产品开发",
 "case_studies":"Case Studies / 案例","blog":"Blog / 博客文章","news":"News / 新闻",
 "careers":"Careers / 招聘","company":"Pages / 公司及其他","ems":"EMS / 电子制造","other":"Other / 其他"}
CATEGORY=list(TITLES)
def route_norm(path):
    if path.endswith("/index.html"):path=path[:-10]
    if not path.endswith("/") and "." not in path.rsplit("/",1)[-1]:path+="/"
    return path
def group(path,meta=None):
    meta=meta or {}
    seg=path.strip("/").split("/")[0]
    groups={"services":"services","industry":"industries","materials":"materials",
     "surface-finish":"surface_finish","surface-finishes":"surface_finish",
     "npi-solutions":"npi","case-studies":"case_studies",
     "blog":"blog","news":"news","careers":"careers","ems":"ems"}
    if seg in groups:return groups[seg]
    if path=="/" or seg in ("contact","help-center","about-rapiddirect","privacy-policy",
       "terms-conditions","quality-assurance","testimonials","sponsorship"):return "company"
    typ=meta.get("template_group","")
    if typ in ("blog","news","case_studies","services","materials","ems","careers","npi","surface_finish"):return typ
    if typ=="industry":return "industries"
    return "company" if typ in ("other_core","ebooks","ai_creator") else "other"
def current():
    pages={}
    for root,kind in ((MIRROR,"LEGACY"),(R14,"R14"),(STAGE,"R15"),(NEW,"FUTURE")):
        for f in root.rglob("index.html"):
            rel=f.relative_to(root)
            if any(x.startswith("__") or x.startswith(".") for x in rel.parts):continue
            path=("/"+"/".join(rel.parts[:-1])+"/") if len(rel.parts)>1 else "/"
            if f.stat().st_size<100:continue
            pages[path]={"path":path,"file":f,"kind":kind,"group":group(path,source_paths.get(path)),
                         "approved99":path in approved}
    assert approved.issubset(pages) and "/" in pages
    pending={p:r for p,r in source_paths.items() if p not in pages}
    ready=defaultdict(list);queue=defaultdict(list)
    for x in pages.values():ready[x["group"]].append(x)
    for x in pending.values():queue[group(x["path"],x)].append(x)
    return pages,pending,ready,queue
STYLES="""body{margin:0;background:#f5f6fb;color:#273049;font:15px/1.6 -apple-system,BlinkMacSystemFont,"Segoe UI",Arial,sans-serif}
main{max-width:1240px;margin:0 auto;padding:35px 24px 90px}h1{font-size:28px;margin:5px 0 12px}
h2{font-size:20px;margin-top:35px}p{color:#63708a}a{color:#5f47b9;text-decoration:none}a:hover{text-decoration:underline}
nav{display:flex;flex-wrap:wrap;gap:9px;background:#fff;border:1px solid #dfe3ed;padding:13px;border-radius:12px}
nav a{padding:7px 11px;background:#f1eefc;border-radius:8px;font-weight:650}
.cards{display:grid;grid-template-columns:repeat(auto-fill,minmax(225px,1fr));gap:13px;margin-top:18px}
.card{display:block;background:#fff;border:1px solid #e2e5ee;border-radius:12px;padding:17px}
.card strong{font-size:17px}.card small{display:block;color:#7c8599}
.number{font-size:32px;font-weight:800;color:#6049bd}.links{columns:3;column-gap:26px;background:white;padding:18px 30px;border-radius:12px}
.links li{break-inside:avoid;padding:2px 0 7px}.links small{display:block;color:#7d889c;font-size:11px;overflow-wrap:anywhere}
.note{background:#fff8e9;border:1px solid #e7d59e;padding:14px;border-radius:11px;color:#856a26}
@media(max-width:760px){.links{columns:1}main{padding:21px 14px}}
"""
def shell(title,body):
    links=[("/","真实首页"),("/site/","站点管理"),("/site/sitemap/","本地 Sitemap"),
      ("/site/queue/","待制作页面"),("/site/source-sitemaps/","来源 Sitemap"),("/site/guide/","使用说明")]
    nav="<nav>"+"".join(f'<a href="{p}">{t}</a>' for p,t in links)+"</nav>"
    return (f'<!doctype html><html lang="zh-CN"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">'+
     f'<meta name="robots" content="noindex,nofollow"><title>{escape(title)}</title><style>{STYLES}</style></head><body><main>'+
     nav+body+"</main></body></html>").encode("utf-8")
def listed(items):
    return '<ul class="links">'+"".join(f'<li><a href="{escape(x["path"])}">{escape("Home / 首页" if x["path"]=="/" else x["path"].strip("/").split("/")[-1].replace("-"," ").title())}</a>'+
      f'<small>{escape(x["path"])} · {("R15 Owner PASS" if x["approved99"] else "旧版 / 新增待审")}</small></li>' for x in sorted(items,key=lambda a:a["path"]))+"</ul>"
def category_cards(ready,queue):
    return '<div class="cards">'+"".join(f'<a class="card" href="/site/sections/{name}/"><strong>{escape(TITLES[name])}</strong>'+
        f'<div class="number">{len(ready[name])}</div><small>本地可浏览 · {len(queue[name])} 待制作</small></a>' for name in CATEGORY if ready[name] or queue[name])+"</div>"
def page_hub(pages,pending,ready,queue):
    b=f'<h1>RapidDirect 整站集成 / Local Site</h1><p>所有现有页面在一个本地站点浏览。真实首页、原 99 页、历史页面、后续新增页面共用导航；尚未制作内容只进入待制作清单。</p>'
    b+='<div class="cards"><div class="card"><div class="number">'+str(len(pages))+'</div>本地已有页面</div><div class="card"><div class="number">'+str(len(pending))+'</div>等待生成页面</div><div class="card"><div class="number">834</div>源站 Sitemap 快照 URL</div></div>'
    b+='<h2>站点分类入口</h2>'+category_cards(ready,queue)
    b+='<p class="note">仅供本地审核。外部接口和表单写入关闭。已批准的 99 页文件不在磁盘上修改；导航由独立预览服务动态提供。</p>'
    return shell("Local Site Hub",b)
def sitemap_hub(pages,ready):
    b='<h1>全站 Sitemap · 已生成页面</h1><p>每个本地页面至少有来自「本页」和「对应分类页」的两个不同有效链接入口。未生成页面不进入本地已发布 Sitemap。</p>'
    b+='<p><a href="/sitemap.xml">统一 XML</a> · <a href="/sitemap_index.xml">分组 XML Index</a> · <a href="/site/inventory.json">全部 834 URL 状态表</a></p>'
    for name in CATEGORY:
        if ready[name]:b+=f'<h2><a href="/site/sections/{name}/">{escape(TITLES[name])}</a> ({len(ready[name])})</h2>'+listed(ready[name])
    return shell("Whole Site Sitemap",b)
def section_hub(name,ready,queue):
    if name not in TITLES:return None
    b=f'<h1>{escape(TITLES[name])}</h1><p>现有 {len(ready[name])} 页；待生成 {len(queue[name])} 页。尚未生成的 URL 不是可点击死链。</p>'
    b+='<p><a href="/">首页</a> · <a href="/site/">分类总目录</a> · <a href="/site/sitemap/">完整 Sitemap</a></p>'
    b+='<h2>本地已生成</h2>'+listed(ready[name])
    if queue[name]:b+='<h2>待生成预览（前 30 条）</h2><ul class="links">'+''.join(f'<li>{escape(v["path"])}</li>' for v in queue[name][:30])+'</ul>'
    return shell(TITLES[name],b)
def queue_hub(pending,queue):
    b=f'<h1>待生成清单 · {len(pending)} URL</h1><p>来源 2026-11-04 Sitemap 快照。已有 URL 注册但还未生成本地 HTML，因此不显示为网站已发布页面。</p>'
    for name in CATEGORY:
        if queue[name]:b+='<h2>'+escape(TITLES[name])+' ('+str(len(queue[name]))+')</h2><ul class="links">'+''.join(f'<li>{escape(v["path"])}</li>' for v in queue[name])+'</ul>'
    return shell("Pending Site Pages",b)
def xml_urls(paths):
    root=ET.Element("urlset",xmlns="http://www.sitemaps.org/schemas/sitemap/0.9")
    for path in sorted(set(paths)):ET.SubElement(ET.SubElement(root,"url"),"loc").text=ORIGIN+path
    return b'<?xml version="1.0" encoding="UTF-8"?>\n'+ET.tostring(root,encoding="utf-8")
def xml_index(groups):
    root=ET.Element("sitemapindex",xmlns="http://www.sitemaps.org/schemas/sitemap/0.9")
    for group in groups:ET.SubElement(ET.SubElement(root,"sitemap"),"loc").text=ORIGIN+"/site/maps/"+group+".xml"
    return b'<?xml version="1.0" encoding="UTF-8"?>\n'+ET.tostring(root,encoding="utf-8")
SCRIPT=r"""(function(){
"use strict";
const live=new Set(__LIVE__);
const originHosts=new Set(["www.rapiddirect.com","rapiddirect.com"]);
function norm(p){try{p=decodeURIComponent(p||"/")}catch{}if(p.endsWith("/index.html"))p=p.slice(0,-10);else if(!p.endsWith("/")&&!/\.[^/]+$/.test(p))p+="/";return p}
function warn(t){let el=document.getElementById("site-local-warning");if(!el){el=document.createElement("div");el.id="site-local-warning";el.style.cssText="position:fixed;bottom:60px;left:12px;z-index:2147483647;background:#fff6e8;border:1px solid #d6bc86;color:#654d2d;padding:12px;border-radius:8px;font:13px Arial,sans-serif";document.body.appendChild(el)}el.textContent=t}
function translate(raw){
 if(!raw||raw.startsWith("#")||/^(mailto:|tel:|javascript:|data:)/i.test(raw))return null;
 let u;try{u=new URL(raw,location.href)}catch{return null}
 if(u.protocol!=="http:"&&u.protocol!=="https:")return null;
 if(u.origin!==location.origin&&!originHosts.has(u.hostname))return null;
 let path=norm(u.pathname);
 if(live.has(path)||path==="/"||path.startsWith("/site/"))return path+u.search+u.hash;
 return "/site/pending/?path="+encodeURIComponent(path);
}
document.addEventListener("submit",e=>{e.preventDefault();e.stopImmediatePropagation();warn("离线只读站点：提交、登录、报价和写入操作已禁用。")},true);
document.addEventListener("click",e=>{
 const a=e.target&&e.target.closest&&e.target.closest("a[href]");if(!a)return;
 const h=a.getAttribute("href")||"";
 if(h.startsWith("#"))return;
 if(/^(mailto:|tel:|javascript:|data:|file:|blob:)/i.test(h)){
  e.preventDefault();e.stopImmediatePropagation();warn("离线预览中外部动作与脚本链接已禁用。");return;
 }
 const t=translate(h);
 if(t){a.setAttribute("href",t);return}
 let u;try{u=new URL(h,location.href)}catch{}
 if(!u||u.origin!==location.origin||u.protocol!=="http:"){
  e.preventDefault();e.stopImmediatePropagation();warn("外部网站跳转已关闭；请使用本地站点导航。");
 }
},true);
function apply(root){if(!root.querySelectorAll)return;for(const a of root.querySelectorAll("a[href]")){const t=translate(a.getAttribute("href"));if(t)a.href=t}}
document.addEventListener("DOMContentLoaded",()=>{
 apply(document);
 const el=document.createElement("nav");el.setAttribute("aria-label","本地完整网站导航");
 el.style.cssText="position:fixed;right:12px;bottom:10px;z-index:2147483646;background:#30285a;padding:9px 12px;border-radius:8px;box-shadow:0 5px 25px #2225;display:flex;gap:12px;font:12px Arial,sans-serif";
 el.innerHTML='<a style="color:white;text-decoration:none" href="/">首页</a><a style="color:white;text-decoration:none" href="/site/">目录</a><a style="color:white;text-decoration:none" href="/site/sitemap/">Sitemap</a>';document.body.appendChild(el);
 new MutationObserver(ms=>{for(const m of ms)for(const n of m.addedNodes)if(n.nodeType===1)apply(n)}).observe(document.body,{childList:true,subtree:true})
});
})();"""
def integrate_html(contents,live):
    text=contents.decode("utf-8",errors="replace")
    for attr in ("data-r11-local-only","data-v2-local-mirror-readonly"):
        text=re.sub(r'<script\b[^>]*\b'+re.escape(attr)+r'\b[^>]*>.*?</script\s*>','',text,count=1,flags=re.I|re.S)
    js=SCRIPT.replace("__LIVE__",json.dumps(sorted(live),ensure_ascii=False))
    insert='<meta name="robots" content="noindex,nofollow"><script data-site-integration>'+js+'</script>'
    if re.search(r"</head\s*>",text,re.I):text=re.sub(r"</head\s*>",lambda m:insert+m.group(0),text,count=1,flags=re.I)
    else:text=insert+text
    return text.encode("utf-8")
CSP="default-src 'self' data: blob:; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; connect-src 'self'; img-src 'self' data: blob:; media-src 'self' data: blob:; font-src 'self' data:; form-action 'none'; object-src 'none'; base-uri 'self'"
class Server(BaseHTTPRequestHandler):
    server_version="BYL-Full-Site-Local/1.0"
    def log_message(self,*args):pass
    def respond(self,data,ctype="text/html; charset=utf-8",code=200):
        self.send_response(code);self.send_header("Content-Type",ctype)
        self.send_header("Content-Length",str(len(data)));self.send_header("Cache-Control","no-store")
        self.send_header("X-Content-Type-Options","nosniff");self.send_header("X-Frame-Options","DENY")
        self.send_header("Content-Security-Policy",CSP);self.end_headers()
        if self.command!="HEAD":self.wfile.write(data)
    def do_POST(self):self.respond(b"Read-only site: write methods disabled","text/plain; charset=utf-8",405)
    do_PUT=do_POST
    do_PATCH=do_POST
    do_DELETE=do_POST
    def do_HEAD(self):self.do_GET()
    def do_GET(self):
        req=urlsplit(self.path);path=unquote(req.path)
        if not path.startswith("/") or "\\" in path or any(x==".." for x in path.split("/")):
            return self.respond(b"Invalid path","text/plain",400)
        pages,pending,ready,queue=current()
        if path=="/site/":return self.respond(page_hub(pages,pending,ready,queue))
        if path=="/site/sitemap/":return self.respond(sitemap_hub(pages,ready))
        if path=="/site/queue/":return self.respond(queue_hub(pending,queue))
        if path=="/site/guide/":
            text='<h1>使用说明</h1><p>页面必须真实生成本地 HTML 才纳入正式 Sitemap；每页同时在分类目录和全站地图有两个入口。</p>'
            text+='<p>新页面放入 <code>uat/full-site-content/&lt;route&gt;/index.html</code>，自动成为可浏览页面；现有 99 页冻结不改。表单和外部访问被禁用。</p>'
            return self.respond(shell("Guide",text))
        if path=="/site/source-sitemaps/":
            text='<h1>9 份源站 Sitemap 快照</h1><p>2026-11-04 归档，仅作为全站发现清单，不表示全部页面已生成。</p><ul class="links">'
            for name in SITEMAP_FILES:text+=f'<li><a href="/site/source-sitemaps/{name}">{name}</a></li>'
            return self.respond(shell("Source Sitemaps",text+"</ul>"))
        if path.startswith("/site/source-sitemaps/"):
            name=path.rsplit("/",1)[-1]
            if name in SITEMAP_FILES:return self.respond((SOURCE/name).read_bytes(),"application/xml; charset=utf-8")
        if path.startswith("/site/sections/") and path.endswith("/"):
            part=path.strip("/").split("/")
            if len(part)==3 and part[2] in TITLES:return self.respond(section_hub(part[2],ready,queue))
        if path=="/site/pending/":
            target=parse_qs(req.query).get("path",[""])[0]
            return self.respond(shell("待生成页面",'<h1>尚未生成本地页面</h1><p>'+escape(target)+'</p><p>此 URL 仅位于待生成队列，不计入已生成 Sitemap。</p><p><a href="/site/queue/">查看待生成队列</a></p>'))
        if path=="/sitemap.xml":
            extras=["/site/","/site/sitemap/","/site/guide/","/site/source-sitemaps/","/site/queue/"]
            sections=["/site/sections/"+name+"/" for name in CATEGORY if ready[name]]
            return self.respond(xml_urls(list(pages)+extras+sections),"application/xml; charset=utf-8")
        if path in ("/sitemap_index.xml","/sitemap-index.xml"):
            return self.respond(xml_index([name for name in CATEGORY if ready[name]]),"application/xml; charset=utf-8")
        if path.startswith("/site/maps/") and path.endswith(".xml"):
            name=path.rsplit("/",1)[-1][:-4]
            if name in TITLES:return self.respond(xml_urls([x["path"] for x in ready[name]]),"application/xml; charset=utf-8")
        if path=="/robots.txt":
            return self.respond(b"User-agent: *\nDisallow: /\nSitemap: "+(ORIGIN+"/sitemap_index.xml\n").encode("utf-8"),"text/plain; charset=utf-8")
        if path=="/site/inventory.json":
            rows=[]
            for p in sorted(set(source_paths)|set(pages)):
                source=source_paths.get(p,{})
                row={"path":p,"status":"LOCAL_READY" if p in pages else "PENDING",
                     "group":pages[p]["group"] if p in pages else group(p,source),
                     "original_sitemap":source.get("origin_sitemap")}
                if p in pages:row["local_version"]=pages[p]["kind"];row["owner_pass"]=pages[p]["approved99"]
                rows.append(row)
            obj={"source_snapshot_utc":"2026-11-04","sitemap_count":9,"source_urls":834,
                 "local_html_count":len(pages),"pending_count":len(pending),"routes":rows}
            return self.respond(json.dumps(obj,ensure_ascii=False,indent=2).encode("utf-8"),"application/json; charset=utf-8")
        if path=="/site/health.json":
            obj={"actual_local_pages":len(pages),"source_sitemap_urls":834,"pending_pages":len(pending),
                 "frozen_r15_html_modified":False,"read_only":True,
                 "two_distinct_inbound_sources":["/site/sitemap/","/site/sections/<group>/"]}
            return self.respond(json.dumps(obj).encode("utf-8"),"application/json")
        canonical=route_norm(path)
        if canonical in pages:
            return self.respond(integrate_html(pages[canonical]["file"].read_bytes(),pages))
        # Existing static resources are served only from local roots; no origin proxy or writes.
        if path.startswith(("/wp-content/","/wp-includes/","/assets/","/cdn-cgi/")) or path in ("/favicon.ico","/favicon.png"):
            for root in (STAGE,R14,MIRROR,NEW):
                f=root/path.lstrip("/")
                if f.is_file() and root.resolve() in f.resolve().parents:
                    return self.respond(f.read_bytes(),mimetypes.guess_type(f.name)[0] or "application/octet-stream")
        return self.respond(shell("Not yet local",'<h1>本地页面尚未生成</h1><p>'+escape(path)+'</p><p><a href="/site/queue/">回到待生成队列</a></p>'),code=404)
if __name__=="__main__":
    pages,pending,_,_=current()
    assert len(pages)>=111 and len(pending)>=700
    print("FULL_SITE_STARTED",json.dumps({"url":ORIGIN,"local_html":len(pages),
     "source_snapshot_urls":834,"pending":len(pending),"owner_approved_99":len(approved)},ensure_ascii=True),flush=True)
    ThreadingHTTPServer(("127.0.0.1",PORT),Server).serve_forever(poll_interval=.5)