#!/usr/bin/env node
/** Generic read-only Windows Local preview for V3.1 source-mirror projects. */
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import crypto from 'node:crypto';
import {pathToFileURL} from 'node:url';
import {routePath} from './skills-v31-gate.mjs';

const htmlEscape=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const CSP="default-src 'self' data: blob:; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; media-src 'self' data: blob:; connect-src 'self'; form-action 'none'; object-src 'none'; base-uri 'self'";
const mime={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8',
'.json':'application/json; charset=utf-8','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg',
'.webp':'image/webp','.gif':'image/gif','.svg':'image/svg+xml','.woff':'font/woff','.woff2':'font/woff2',
'.ico':'image/x-icon','.mp4':'video/mp4','.webm':'video/webm','.pdf':'application/pdf'};
function safePath(root,rel){
  if(typeof rel!=='string'||!rel||path.isAbsolute(rel)||rel.includes('\\')||
     rel.split('/').some(x=>!x||x==='.'||x==='..'))throw Error('UNSAFE_PATH');
  const dest=path.resolve(root,rel);
  if(!dest.startsWith(root+path.sep))throw Error('OUTSIDE_ROOT');
  let cur=dest;
  while(cur!==root){
    if(fs.existsSync(cur)){
      const real=fs.realpathSync(cur);
      if(real!==root&&!real.startsWith(root+path.sep))throw Error('SYMLINK_ESCAPE');
    }
    cur=path.dirname(cur);
  }
  return dest;
}
function shell(title,body){
 return '<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="robots" content="noindex,nofollow">'+
 '<meta name="viewport" content="width=device-width,initial-scale=1"><title>'+htmlEscape(title)+'</title>'+
 '<style>body{font:15px/1.55 system-ui,Arial,sans-serif;margin:0;padding:28px;color:#242b36;background:#f6f7fa}main{max-width:1100px;margin:auto}a{color:#5345b4}nav a{margin-right:18px}li{padding:4px}small{color:#666}</style></head><body><main>'+
 '<nav><a href="/">首页</a><a href="/site/">站点总览</a><a href="/site/sitemap/">已生成页面</a><a href="/site/queue/">待生成页面</a></nav>'+
 body+'</main></body></html>';
}
function guardScript(routeList,hosts){
 const json=x=>JSON.stringify(x).replace(/</g,'\\u003c');
 const body='(function(){const known=new Set('+json(routeList)+');const hosts=new Set('+json(hosts)+');'+
 'function norm(p){if(p.endsWith("/index.html"))p=p.slice(0,-10);if(!p.endsWith("/")&&!/\\.[^/]+$/.test(p))p+="/";return p;}'+
 'function warn(){alert("仅供本地只读审核：写入、外站及未生成页面已禁用");}'+
 'document.addEventListener("submit",function(e){e.preventDefault();e.stopImmediatePropagation();warn();},true);'+
 'document.addEventListener("click",function(e){const a=e.target.closest&&e.target.closest("a[href]");if(!a)return;const raw=a.getAttribute("href");'+
 'if(!raw||raw.startsWith("#"))return;let u;try{u=new URL(raw,location.href);}catch(e){return;}'+
 'const same=u.origin===location.origin;const source=hosts.has(u.hostname);const p=norm(u.pathname);'+
 'if((same||source)&&known.has(p)){a.href=p+u.search+u.hash;return;}'+
 'e.preventDefault();e.stopImmediatePropagation();warn();},true);'+
 '})();';
 return '<script data-v31-local-guard>'+body+'</script>';
}
function inject(source,script){
 let s=source.toString('utf8');
 const nav='<nav aria-label="V3.1 Local" style="position:fixed;right:10px;bottom:10px;z-index:2147483000;padding:9px;background:#26214f;color:#fff"><a href="/site/" style="color:#fff">Local 导航</a> · <a href="/site/sitemap/" style="color:#fff">Sitemap</a></nav>';
 const piece='<meta name="robots" content="noindex,nofollow">'+script+nav;
 if(/<\/body\s*>/i.test(s))return s.replace(/<\/body\s*>/i,piece+'</body>');
 return s+piece;
}
export function buildServer(manifest,rootInput){
 if(manifest.schema_version!=='3.1'||manifest.environment!=='local'||!manifest.authorized_scope?.source_approved||
   !manifest.authorized_scope?.routes_frozen)throw Error('LOCAL_AUTHORIZED_SCOPE_REQUIRED');
 const root=fs.realpathSync(path.resolve(rootInput));
 const routes=new Map();
 for(const item of manifest.routes||[]){
   const p=routePath(item.path);if(routes.has(p))throw Error('DUPLICATE_ROUTE');
   safePath(root,item.local_file);
   routes.set(p,item);
 }
 const sourceHash=hash(JSON.stringify([...routes.keys()].sort()));
 if(routes.size!==manifest.authorized_scope.expected_route_count||sourceHash!==manifest.authorized_scope.route_list_sha256)
   throw Error('INVENTORY_DENOMINATOR_MISMATCH');
 const assetRoots=manifest.asset_roots||['mirror'];
 for(const a of assetRoots){
   if(a==='uat'||a.startsWith('.')||a.includes('private')||
      (a.startsWith('uat/')&&!/(?:^|\/)(?:offline-staged|full-site-content|public-assets)$/.test(a)))
      throw Error('PRIVATE_ASSET_ROOT');
 }
 assetRoots.forEach(a=>safePath(root,a+'/index-placeholder'));
 const hosts=manifest.authorized_scope.source_hosts||[];
 const valid=new Map();
 const validate=(p,item)=>{
   const file=safePath(root,item.local_file);
   if(!fs.existsSync(file)||!fs.statSync(file).isFile())return false;
   const st=fs.statSync(file),cached=valid.get(p);
   if(cached&&cached.size===st.size&&cached.mtime===st.mtimeMs)return cached.ok;
   const ok=hash(fs.readFileSync(file))===item.artifact_sha256;
   valid.set(p,{size:st.size,mtime:st.mtimeMs,ok});
   return ok;
 };
 const snapshot=()=>{
   const ready=[],pending=[];
   for(const [p,item] of routes){(validate(p,item)?ready:pending).push({path:p,template:item.template});}
   return {ready:ready.sort((a,b)=>a.path.localeCompare(b.path)),
     pending:pending.sort((a,b)=>a.path.localeCompare(b.path))};
 };
 const send=(res,code,body,type='text/html; charset=utf-8',method='GET')=>{
   const bytes=Buffer.isBuffer(body)?body:Buffer.from(body);
   res.writeHead(code,{'Content-Type':type,'Content-Length':bytes.length,
     'Cache-Control':'no-store','X-Content-Type-Options':'nosniff',
     'X-Robots-Tag':'noindex,nofollow','Content-Security-Policy':CSP});
   res.end(method==='HEAD'?undefined:bytes);
 };
 const server=http.createServer((req,res)=>{
   try{
     const method=req.method||'GET';
     if(method!=='GET'&&method!=='HEAD')return send(res,405,'Read-only: method disabled','text/plain',method);
     const raw=(req.url||'/').split('?')[0];
     if(/%2e|%2f|%5c/i.test(raw))return send(res,400,'Unsafe path','text/plain',method);
     const url=new URL(req.url||'/', 'http://127.0.0.1');
     const p=url.pathname;
     const {ready,pending}=snapshot();
     const set=new Set(ready.map(x=>x.path));
     const li=entries=>'<ul>'+entries.map(x=>'<li><a href="'+htmlEscape(x.path)+'">'+htmlEscape(x.path)+'</a> <small>'+htmlEscape(x.template)+'</small></li>').join('')+'</ul>';
     if(p==='/site/'||p==='/site/sitemap/'||p==='/site/queue/'){
       const body=p==='/site/queue/'?'<h1>待生成 '+pending.length+' 页</h1><p>待处理 URL 不进入 XML Sitemap。</p><pre>'+htmlEscape(pending.map(x=>x.path).join('\n'))+'</pre>':
         p==='/site/sitemap/'?'<h1>已生成 '+ready.length+' 页</h1>'+li(ready):
         '<h1>整站 Windows Local</h1><p>实存 '+ready.length+' / '+routes.size+'；待处理 '+pending.length+'。</p>'+
         '<p>原站写入和外部跳转均不属于本地只读验收。</p>'+li(ready);
       return send(res,200,shell('V3.1 Local Site',body),'text/html; charset=utf-8',method);
     }
     if(p==='/site/inventory.json')return send(res,200,JSON.stringify({expected:routes.size,ready,pending},null,2),'application/json; charset=utf-8',method);
     if(p==='/sitemap.xml'){
       const xml='<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+
         ready.map(x=>'<url><loc>http://127.0.0.1:'+server.address().port+htmlEscape(x.path)+'</loc></url>').join('')+'</urlset>';
       return send(res,200,xml,'application/xml; charset=utf-8',method);
     }
     if(p==='/robots.txt')return send(res,200,'User-agent: *\nDisallow: /\n','text/plain; charset=utf-8',method);
     const route=routes.get(routePath(p));
     if(route&&set.has(routePath(p))){
       const file=safePath(root,route.local_file);
       const contents=inject(fs.readFileSync(file),guardScript([...set],hosts));
       return send(res,200,contents,'text/html; charset=utf-8',method);
     }
     if(route)return send(res,404,shell('页面待生成','<h1>尚未生成</h1><p>'+htmlEscape(p)+'</p>'),'text/html; charset=utf-8',method);
     const allowedStatic=/^\/(?:wp-content|wp-includes|assets|_next|images|fonts|cdn-cgi)\//.test(p)||
       p==='/favicon.ico';
     const staticType=mime[path.extname(p).toLowerCase()];
     if(!allowedStatic||!staticType||staticType.startsWith('text/html')||
        staticType.startsWith('application/json'))
       return send(res,404,'Unknown Local route','text/plain; charset=utf-8',method);
     for(const a of assetRoots){
       const rel=a+'/'+p.replace(/^\/+/,'');
       const file=safePath(root,rel);
       if(fs.existsSync(file)&&fs.statSync(file).isFile())
         return send(res,200,fs.readFileSync(file),staticType,method);
     }
     return send(res,404,'Unknown Local route','text/plain; charset=utf-8',method);
   }catch(e){return send(res,400,'Bad local request','text/plain; charset=utf-8',req.method);}
 });
 return {server,snapshot};
}
export function main(argv){
 const args=Object.fromEntries(argv.filter(x=>x.startsWith('--')&&x.includes('='))
   .map(x=>{const i=x.indexOf('=');return [x.slice(2,i),x.slice(i+1)];}));
 if(!args.manifest||!args.root)throw Error('MANIFEST_AND_ROOT_REQUIRED');
 const m=JSON.parse(fs.readFileSync(args.manifest,'utf8').replace(/^\uFEFF/,''));
 const port=args.port===undefined?8787:Number(args.port);
 if(!Number.isInteger(port)||port<1024||port>65535)throw Error('INVALID_LOCAL_PORT');
 const x=buildServer(m,args.root);
 x.server.listen(port,'127.0.0.1',()=>console.log('V3.1 read-only Local: http://127.0.0.1:'+port+'/site/'));
 return x.server;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href){
 try{main(process.argv.slice(2));}catch(e){console.error(e.message);process.exitCode=2;}
}
