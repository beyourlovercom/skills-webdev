#!/usr/bin/env node
/** Static Owner/QA catalog review index for in-scope Local page-one routes. */
import fs from 'node:fs';import path from 'node:path';
const a=n=>{const i=process.argv.indexOf('--'+n);return i<0?null:process.argv[i+1]};
const main=a('main'),nested=a('nested'),out=a('out');
if(!main||!nested||!out||![main,nested,out].every(path.isAbsolute))throw Error('Requires --main --nested --out absolute');
const m=JSON.parse(fs.readFileSync(path.join(main,'category-page1-local-report.json'),'utf8'));
const n=JSON.parse(fs.readFileSync(path.join(nested,'nested-local-report.json'),'utf8'));
const i=JSON.parse(fs.readFileSync(path.join(nested,'nested-listing-index.json'),'utf8'));
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const map=new Map(n.pages.map(x=>[x.path,x]));
const mainRoutes=m.routes.map(x=>({path:'/stock/'+x.category,kind:'MAIN',local:'/source-mirror/stock/'+x.category+'/',status:x.status}));
const nestedRoutes=i.all_source_paths.map(p=>{
 const stored=i.records.find(x=>x.source_path===p),local=map.get(p);
 return {path:p,kind:'SUBCATEGORY',local:local?.local_url||null,
  status:local?.status||(stored?.status==='FAILED'?'SOURCE_HTTP_'+stored.http_status:stored?.status||'NOT_ATTEMPTED')};
});
const all=[...mainRoutes,...nestedRoutes];
const ok=all.filter(x=>x.local&&/LOCAL|READY|PASS|UNCHANGED|FROZEN/i.test(x.status));
const fail=all.filter(x=>/SOURCE_HTTP_|FAILED|BLOCKED/.test(x.status));
const groups=new Map();
for(const x of all){
 const group=x.path.split('/')[2]||'other';if(!groups.has(group))groups.set(group,[]);groups.get(group).push(x);
}
const rows=[...groups.entries()].map(([group,items])=>'<section><h2>'+esc(group)+' <small>'+items.length+' routes</small></h2><div class="links">'+items.map(x=>{
 const target=x.local?'<a href="'+esc(x.local)+'">'+esc(x.path)+'</a>':'<span>'+esc(x.path)+'</span>';
 return '<div class="route '+(x.local?'ready':'missing')+'">'+target+'<small>'+esc(x.status)+'</small></div>';
}).join('')+'</div></section>').join('');
const css='body{font:14px/1.5 -apple-system,BlinkMacSystemFont,"Segoe UI",Arial,sans-serif;color:#1f3038;background:#f6f8f8;margin:0}header{background:#192e29;color:#fff;padding:24px max(3vw,14px)}header h1{margin:0 0 8px;font-size:26px}header p{margin:0;color:#c7d5d0}main{max-width:1270px;margin:auto;padding:25px 14px}section{background:white;padding:18px;margin:20px 0;border:1px solid #dbe4e6;border-radius:8px}h2{font-size:19px;margin:0 0 13px}small{font-size:11px;font-weight:500;color:#73838b}h2 small{margin-left:12px}.stats{display:flex;flex-wrap:wrap;gap:12px}.stats p{padding:12px 16px;background:white;border:1px solid #dbe4e6;border-radius:8px}.stats strong{color:#117a51;font-size:20px}.links{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:7px}.route{display:flex;gap:10px;justify-content:space-between;align-items:center;border:1px solid #e1e6e7;border-radius:5px;padding:10px;min-width:0}.route a,.route span{overflow-wrap:anywhere}.route a{color:#116747;text-decoration:none}.route.missing{background:#fff8f2}.route.missing span{color:#9b542d}footer{max-width:1270px;margin:20px auto 50px;color:#647880;padding:0 14px}';
const html='<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><meta http-equiv="Content-Security-Policy" content="default-src &#39;self&#39;; script-src &#39;none&#39;; style-src &#39;unsafe-inline&#39;; connect-src &#39;none&#39;"><title>BASWORLDY 分类第一页离线备份进度</title><style>'+css+'</style></head><body><header><h1>BASWORLDY 分类第一页本地归档</h1><p>仅批准范围内的第一页，不含 Blog、不抓所有商品详情。红色源站失败项不计作已完成。</p></header><main><div class="stats"><p><strong>'+all.length+'</strong> / 应检查入口</p><p><strong>'+ok.length+'</strong> / 已生成可访问的 Local 路由</p><p><strong>'+fail.length+'</strong> / 源站失败</p><p><strong>Owner PASS</strong> / 模板已确认，整站终验未确认</p></div>'+rows+'</main><footer>本地只读审核清单；源站服务受限和未覆盖页面均须如实保留。</footer></body></html>';
fs.writeFileSync(path.join(out,'catalog-page1-review.html'),html);
console.log(JSON.stringify({status:'LOCAL_REVIEW_INDEX_READY',routes:all.length,local_routes:ok.length,source_failures:fail.length,output:path.join(out,'catalog-page1-review.html')}));
