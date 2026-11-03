import React, { useEffect, useRef, useState } from "react";

const SRC = { home: "/snapshots/home.html", services: "/snapshots/services.html", cnc: "/snapshots/cnc.html" };
function getPage(pathname) {
  if (pathname.startsWith("/services/cnc-machining")) return "cnc";
  if (pathname.startsWith("/services")) return "services";
  return "home";
}
export default function Section12Section() {
  const [page, setPage] = useState(() => getPage(window.location.pathname));
  const [notice, setNotice] = useState("");
  const [height, setHeight] = useState("100vh");
  const frameRef = useRef(null);
  const cleanupRef = useRef(null);
  useEffect(() => {
    const pop = () => setPage(getPage(window.location.pathname));
    window.addEventListener("popstate", pop);
    return () => {
      window.removeEventListener("popstate", pop);
      cleanupRef.current?.();
    };
  }, []);
  function go(path) {
    window.history.pushState({}, "", path);
    setPage(getPage(path)); setHeight("100vh");
    window.scrollTo({top: 0});
    setNotice("");
  }
  function attach() {
    cleanupRef.current?.();
    cleanupRef.current = null;
    const frame = frameRef.current;
    if (!frame) return;
    let doc;
    try { doc = frame.contentDocument; } catch { setNotice("无法读取快照内容"); return; }
    if (!doc) return;
    const resize = () => {
      const h = Math.max(doc.documentElement.scrollHeight, doc.body?.scrollHeight || 0);
      if (h > 500) setHeight(h + "px");
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(doc.documentElement);
    function handleClick(e) {
      const anchor = e.target?.closest?.("a[href]");
      if (!anchor) return;
      const raw = anchor.getAttribute("href") || "";
      if (raw.startsWith("#")) return;
      let u;
      try { u = new URL(anchor.href, document.location.origin); } catch { return; }
      // SiteOne produces both clean routes and exported .html/index.html aliases.
      // Only the three approved Canary routes are allowed, regardless of alias.
      const path = u.pathname.replace(/\/index\.html$/i, "/");
      const allowed = u.hostname === "www.rapiddirect.com" || u.hostname === "rapiddirect.com" || u.hostname === "127.0.0.1";
      if (allowed && (path === "/" || path === "/index.html")) { e.preventDefault(); go("/"); return; }
      if (allowed && ["/services/", "/services", "/services.html"].includes(path)) {
        e.preventDefault(); go("/services/"); return;
      }
      if (allowed && ["/services/cnc-machining/", "/services/cnc-machining", "/services/cnc-machining.html"].includes(path)) {
        e.preventDefault(); go("/services/cnc-machining/"); return;
      }
      if (/^mailto:/i.test(raw)) { e.preventDefault(); setNotice("离线预览不发送邮件"); return; }
      e.preventDefault(); e.stopPropagation();
      setNotice("离线 Canary 只包含三页；外部报价、登录、其它路由均不执行。");
    }
    function stopSubmit(e) {
      e.preventDefault(); e.stopPropagation();
      setNotice("离线预览不提交任何表单或真实报价。");
    }
    doc.addEventListener("click", handleClick, true);
    doc.addEventListener("submit", stopSubmit, true);
    const refresh = setInterval(resize, 1500);
    cleanupRef.current = () => {
      clearInterval(refresh); observer.disconnect();
      doc.removeEventListener("click", handleClick, true);
      doc.removeEventListener("submit", stopSubmit, true);
    };
  }
  return <main style={{margin:0,padding:0,width:"100%"}}>
    <nav data-v2-review-bar style={{display:"flex",flexWrap:"wrap",gap:8,padding:10,background:"#111827",color:"white",font:"14px Arial"}}>
      <strong>V2 Windows Local · PWC 骨架 + SiteOne 静态快照</strong>
      <button onClick={() => go("/")} aria-label="首页">首页</button>
      <button onClick={() => go("/services/")} aria-label="服务列表">服务列表</button>
      <button onClick={() => go("/services/cnc-machining/")} aria-label="CNC">CNC</button>
      <span style={{marginLeft:"auto"}}>测试模式：禁止真实报价及外部写入</span>
    </nav>
    {notice && <div role="alert" style={{padding:12,background:"#fff3cd",color:"#673c00"}}>{notice} <button onClick={() => setNotice("")}>关闭</button></div>}
    <iframe key={page} ref={frameRef} src={SRC[page]}
      title={"RapidDirect "+page+" authorized local snapshot"} sandbox="allow-same-origin allow-scripts"
      onLoad={attach} style={{display:"block",width:"100%",height,border:0}} />
  </main>;
}
