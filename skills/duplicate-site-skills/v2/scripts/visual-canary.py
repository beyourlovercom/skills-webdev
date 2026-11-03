#!/usr/bin/env python3
"""Three-page RapidDirect V2 visual replay (Windows Local). No source writes.

Install: existing isolated PWC venv with playwright. Run from approved Windows
Local with the two localhost servers already running, for example:
python visual-canary.py --workspace C:\ai\site-mirror\rapiddirect-v2
No full-site crawl, no downloads to the skills repository, no live form writes.
"""
from __future__ import annotations

import argparse
import json
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urlsplit

SAMPLES = {"home": "/", "services": "/services/", "cnc": "/services/cnc-machining/"}
SIZES = {"desktop": (1440, 900), "mobile": (375, 812)}
SOURCE = "https://www.rapiddirect.com"
LOCAL = "http://127.0.0.1:8766"

def secure_source_request(url: str, method: str) -> bool:
    target = urlsplit(url)
    host = (target.hostname or "").lower()
    return (target.scheme == "https" and method in ("GET", "HEAD")
            and (host == "rapiddirect.com" or host.endswith(".rapiddirect.com")))

def secure_local_request(url: str, method: str) -> bool:
    target = urlsplit(url)
    return (
        target.scheme == "http" and target.netloc == "127.0.0.1:8766"
        and method in ("GET", "HEAD")
    )

def stabilize_page(page, clock, scroll_host, scroll=True):
    page.evaluate("document.fonts.ready")
    if scroll:
        height = min(21000, scroll_host.evaluate("Math.max(document.body.scrollHeight,document.documentElement.scrollHeight)"))
        for y in range(0, height, 500):
            scroll_host.evaluate("(y) => window.scrollTo(0, y)", y)
            clock.wait_for_timeout(130)
    page.evaluate("""() => {
      document.querySelectorAll('video,audio').forEach(el => {
        try { el.pause(); } catch {}
      });
      document.querySelectorAll('.swiper').forEach(el => {
        try { el.swiper?.autoplay?.stop(); el.swiper?.slideTo(0, 0, 0); } catch {}
      });
      let tag = document.getElementById('v2-screenshot-stabilizer');
      if (!tag) {
        tag = document.createElement('style');
        tag.id='v2-screenshot-stabilizer';
        tag.textContent='*,*::before,*::after{animation-duration:0s!important;transition-duration:0s!important;scroll-behavior:auto!important}';
        document.head.appendChild(tag);
      }
      window.scrollTo(0,0);
    }""")
    scroll_host.evaluate("window.scrollTo(0,0)")
    clock.wait_for_timeout(750)

def screenshot_browser(browser, page_id, url_path, kind, mode, out_dir, allow_live):
    width, height = SIZES[kind]
    context = browser.new_context(
        viewport={"width": width, "height": height},
        device_scale_factor=1, reduced_motion="reduce",
    )
    external = []
    def guard(route):
        req = route.request
        if secure_local_request(req.url, req.method):
            route.continue_()
        else:
            external.append({"url": req.url, "method": req.method})
            route.abort()
    if mode == "local":
        context.route("**/*", guard)
    elif not allow_live:
        raise RuntimeError("Live source capture requires explicit --allow-live-read")
    else:
        def source_guard(route):
            req = route.request
            if secure_source_request(req.url, req.method):
                route.continue_()
            else:
                external.append({"url": req.url, "method": req.method})
                route.abort()
        context.route("**/*", source_guard)
    page = context.new_page()
    rec = {"id":page_id,"viewport":kind,"mode":mode,"url":None}
    try:
        if mode == "source":
            dest = SOURCE + url_path
            response = page.goto(dest, wait_until="domcontentloaded", timeout=45000)
            rec["url"] = dest
            doc_page = page
        else:
            dest = LOCAL + url_path
            response = page.goto(dest, wait_until="domcontentloaded", timeout=45000)
            rec["url"] = dest
            page.wait_for_timeout(700)
            frame = page.locator("iframe")
            if frame.count()!=1:raise RuntimeError("Expected one local snapshot frame")
            doc_page = frame.element_handle().content_frame()
        if response is None or response.status!=200:
            raise RuntimeError("Page HTTP status not 200")
        stabilize_page(doc_page, page, page)
        if mode == "local":
            page.wait_for_timeout(700)
            file=out_dir / f"{page_id}.{kind}.built.png"
            # Use iframe screenshot to exclude intentional admin review toolbar.
            page.locator("iframe").screenshot(path=str(file), animations="disabled", timeout=60000)
            size = page.locator("iframe").evaluate("(e)=>({width:e.clientWidth,height:e.clientHeight})")
        else:
            file=out_dir / f"{page_id}.{kind}.source.png"
            doc_page.screenshot(path=str(file), full_page=True, animations="disabled", timeout=60000)
            size = page.evaluate("({width:document.documentElement.scrollWidth,height:document.documentElement.scrollHeight})")
        rec.update({
            "status":"CAPTURED",
            "http": response.status,
            "title":doc_page.title(),
            "image_count":doc_page.locator("img").count(),
            "broken_images":doc_page.locator("img").evaluate_all(
                "(xs)=>xs.filter(x=>!x.complete||x.naturalWidth===0).length"),
            "geometry":size,
            "blocked_external_count":len(external),
            "screenshot":str(file)
        })
    except Exception as exc:
        rec.update({"status":"FAIL", "error":str(exc)[:480]})
    finally:
        context.close()
    return rec

def main():
    parser=argparse.ArgumentParser()
    parser.add_argument("--workspace",required=True)
    parser.add_argument("--allow-live-read",action="store_true")
    args=parser.parse_args()
    root=Path(args.workspace).resolve()
    if not (root/"mirror"/"index.html").is_file():raise SystemExit("Pilot mirror not found")
    if not (root/"pwc-build"/"review-app"/"dist"/"index.html").is_file():raise SystemExit("Built local preview missing")
    output=root/"uat"/"v2-visual-replay"
    output.mkdir(parents=True,exist_ok=True)
    from playwright.sync_api import sync_playwright
    rows=[]
    with sync_playwright() as p:
        browser=p.chromium.launch(headless=True)
        try:
            for kind in SIZES:
                for name,route in SAMPLES.items():
                    if args.allow_live_read:
                        rows.append(screenshot_browser(browser,name,route,kind,"source",output,True))
                    rows.append(screenshot_browser(browser,name,route,kind,"local",output,False))
        finally:browser.close()
    evidence={"as_of_utc":datetime.now(timezone.utc).isoformat(),
             "fixed_scope":"RAPIDDIRECT_THREE_PAGE_ONLY",
             "preview_origin":LOCAL,
             "no_source_writes":True,
             "no_live_accounts_or_quotes":True,
             "rows":rows}
    file=output/"replay-evidence.json"
    file.write_text(json.dumps(evidence,ensure_ascii=False,indent=2),encoding="utf-8")
    print(json.dumps({"report":str(file),"rows":len(rows),"captured":sum(x["status"]=="CAPTURED" for x in rows),
                      "failed":[x for x in rows if x["status"]!="CAPTURED"]},ensure_ascii=False,indent=2))
if __name__=="__main__":
    main()
