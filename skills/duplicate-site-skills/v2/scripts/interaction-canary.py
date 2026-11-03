#!/usr/bin/env python3
"""Repeatable browser interaction gate for exactly three authorized RapidDirect samples.
No live source browsing; only the isolated localhost 8766 preview is allowed.
"""
from __future__ import annotations
import argparse
import json
import re
from datetime import datetime,timezone
from pathlib import Path
from urllib.parse import urlsplit

PREVIEW="http://127.0.0.1:8766"
PAGES={"home":("/", "首页"),"services":("/services/", "服务列表"),"cnc":("/services/cnc-machining/","CNC")}
VIEWS={"desktop":(1440,900),"mobile":(375,812)}

def allowed_request(url, method):
    u=urlsplit(url)
    return u.scheme=="http" and u.netloc=="127.0.0.1:8766" and method in {"GET","HEAD"}

def check_interaction(page,kind):
    rows=[]
    for name,(url,label) in PAGES.items():
        page.get_by_role("button",name=label,exact=True).click(timeout=8000)
        page.wait_for_timeout(600)
        target=page.locator("iframe")
        frame=target.element_handle().content_frame()
        csp=frame.locator('meta[http-equiv="Content-Security-Policy"]')
        csp_content=csp.first.get_attribute("content") if csp.count() else ""
        row={"page":name,"view":kind,
             "route_ok":page.url==PREVIEW+url,
             "iframe_loaded":frame.locator("body").count()==1,
             "csp_offline":("form-action 'none'" in csp_content and "connect-src 'self'" in csp_content),
             "mobile_menu":"N/A","home_faq":"N/A",
             "form_blocked":False,"quote_blocked":False}
        if kind=="mobile":
            toggle=frame.locator(".rd-header__toggle")
            if toggle.count() and toggle.first.is_visible():
                before=toggle.first.get_attribute("aria-expanded")
                toggle.first.click(timeout=10000);page.wait_for_timeout(150)
                after=toggle.first.get_attribute("aria-expanded")
                row["mobile_menu"]=before=="false" and after=="true"
                toggle.first.click(timeout=10000)
            else:row["mobile_menu"]=False
        if name=="home":
            faq=frame.locator(".rd-solution-faq__trigger")
            if faq.count() and faq.first.is_visible():
                before=faq.first.get_attribute("aria-expanded")
                faq.first.click(timeout=10000);page.wait_for_timeout(100)
                after=faq.first.get_attribute("aria-expanded")
                row["home_faq"]=before=="false" and after=="true"
                faq.first.click(timeout=10000)
            else:row["home_faq"]=False
        form=frame.locator("form").first
        if form.count():
            prevented=form.evaluate("""f=>{
              const evt=new Event('submit',{bubbles:true,cancelable:true});
              f.dispatchEvent(evt);
              return evt.defaultPrevented;
            }""")
            row["form_blocked"]=prevented
        else:row["form_blocked"]="N/A"
        a=frame.locator("a").filter(has_text=re.compile("Get Instant Quote",re.I))
        if a.count():
            try:a.first.evaluate("(el)=>el.click()")
            except Exception as exc:
                if "Frame was detached" not in str(exc):raise
            page.wait_for_timeout(180)
            alert=page.get_by_role("alert")
            row["quote_blocked"]=alert.count()>0 and "离线" in alert.first.inner_text()
        else:row["quote_blocked"]="N/A"
        rows.append(row)
    # Test actual exported content links (vs only top-level review toolbar).
    for start in ("home","services"):
        page.get_by_role("button",name=PAGES[start][1],exact=True).click()
        page.wait_for_timeout(600)
        frame=page.locator("iframe").element_handle().content_frame()
        links=frame.locator('a[href*="services/cnc-machining/index.html"]')
        ok=False
        if links.count():
            try:links.first.evaluate("(a)=>a.click()")
            except Exception as exc:
                if "Frame was detached" not in str(exc):raise
            page.wait_for_timeout(280)
            ok=page.url==PREVIEW+PAGES["cnc"][0] and page.locator("iframe").get_attribute("src")=="/snapshots/cnc.html"
        rows.append({"view":kind,"navigation":start+"_to_cnc","pass":ok})
    return rows

def main():
    parser=argparse.ArgumentParser()
    parser.add_argument("--workspace",required=True)
    args=parser.parse_args()
    root=Path(args.workspace).resolve()
    if not (root/"pwc-build"/"review-app"/"dist"/"index.html").exists():
        raise SystemExit("Must build isolated review-app before UAT")
    from playwright.sync_api import sync_playwright
    rows=[];blocked=[]
    with sync_playwright() as p:
        browser=p.chromium.launch(headless=True)
        try:
            for kind,(w,h) in VIEWS.items():
                context=browser.new_context(viewport={"width":w,"height":h},reduced_motion="reduce")
                def route_request(route):
                    req=route.request
                    if allowed_request(req.url,req.method):route.continue_()
                    else:
                        blocked.append({"url":req.url,"method":req.method})
                        route.abort()
                context.route("**/*",route_request)
                page=context.new_page()
                page.goto(PREVIEW,wait_until="domcontentloaded",timeout=30000)
                rows.extend(check_interaction(page,kind))
                context.close()
        finally:browser.close()
    failed=[]
    for row in rows:
        for key in ("route_ok","iframe_loaded","csp_offline","mobile_menu","home_faq","form_blocked","quote_blocked","pass"):
            if key in row and row[key] is False:
                failed.append({"row":row,"gate":key})
    report={"created_at_utc":datetime.now(timezone.utc).isoformat(),"source_routes":"RAPIDDIRECT_3_ONLY",
            "tested":len(rows),"failed":failed,"no_real_write_attempts":all(x["method"] in {"GET","HEAD"} for x in blocked),
            "blocked_external_requests":len(blocked),"rows":rows,
            "owner_visual_pass":False,"main_merge_authorized":False}
    target=root/"uat"/"v2-interaction-final.json"
    target.write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding="utf-8")
    print(json.dumps({"report":str(target),"tests":len(rows),"failures":len(failed),
       "no_real_write_attempts":report["no_real_write_attempts"]},ensure_ascii=False))
    if failed or not report["no_real_write_attempts"]:raise SystemExit(3)
if __name__=="__main__":
    main()
