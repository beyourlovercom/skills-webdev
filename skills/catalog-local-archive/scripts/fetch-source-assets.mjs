#!/usr/bin/env node
/**
 * Download only media/CSS listed in a verified private manifest, preserving bytes.
 * Bounded, sequential, no recursive discovery, no cookies. Outputs private JSON report.
 * Usage: node fetch-source-assets.mjs --manifest <file> --out <abs> --limit 12
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {spawnSync} from 'node:child_process';
const arg=n=>{const i=process.argv.indexOf('--'+n);return i>=0?process.argv[i+1]:null};
const file=arg('manifest'),out=arg('out'),max=Number(arg('limit')||6);
if(!file||!out||!path.isAbsolute(out)||!Number.isInteger(max)||max<1||max>120)throw Error('Require --manifest --out absolute --limit 1..120');
const manifest=JSON.parse(fs.readFileSync(file,'utf8'));
if(manifest.origin!=='https://www.basworld.com')throw Error('Unrecognized source origin');
const ua='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
const records=[...manifest.media_assets,...manifest.css_dependencies.map(url=>({url,role:'css',item_sku:null}))];
const allowHosts=['www.basworld.com','static.basworld.com'];
const format={'.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.svg':'image/svg+xml','.css':'text/css'};
const role=arg('role')||'all';
if(!['all','logo','vehicle_gallery','css'].includes(role))throw Error('Invalid --role');
const start=Number(arg('start')||0);
if(!Number.isInteger(start)||start<0||start>100000)throw Error('Invalid --start');
const selected=records.filter(x=>role==='all'||x.role===role).slice(start,start+max),seen=new Set();
const reports=[];
fs.mkdirSync(out,{recursive:true});
for(const entry of selected){
 let url,ext;try{url=new URL(entry.url);ext=path.extname(url.pathname).toLowerCase();}catch{throw Error('Invalid asset URL');}
 if(url.protocol!=='https:'||!allowHosts.includes(url.hostname)||!format[ext]||entry.url.length>2048)throw Error('Asset outside allowlist '+entry.url);
 if(seen.has(url.href))continue;seen.add(url.href);
 const id=crypto.createHash('sha256').update(url.href).digest('hex').slice(0,20);
 const rel=path.join('assets',entry.role,id+ext),dest=path.join(out,rel);
 fs.mkdirSync(path.dirname(dest),{recursive:true});
 const maxSize=8000000;
 if(fs.existsSync(dest)&&fs.statSync(dest).size>0){
  const bytes=fs.statSync(dest).size;
  reports.push({role:entry.role,sku:entry.item_sku??null,order:entry.order??null,source_url:entry.url,
   status:'SAVED',http:200,bytes,local_path:rel.replaceAll('\\','/'),
   sha256:crypto.createHash('sha256').update(fs.readFileSync(dest)).digest('hex'),
   content_type:format[ext],error:null,previously_saved:true});
  console.log(JSON.stringify({role:entry.role,status:'ALREADY_SAVED',bytes,url:entry.url.slice(0,120)}));
  continue;
 }
 const hdr=dest+'.headers';
 const proc=spawnSync(process.platform==='win32'?'curl.exe':'curl',[
  '--silent','--show-error','--location','--max-redirs','1','--connect-timeout','8','--max-time','20','--retry','0',
  '--max-filesize',String(maxSize),'--user-agent',ua,'--dump-header',hdr,'--output',dest,
  '--write-out','%{http_code}\t%{url_effective}\t%{content_type}',url.href
 ],{encoding:'utf8',windowsHide:true,timeout:25000,maxBuffer:100000});
 const [codeText,final,mime]=(proc.stdout||'').trim().split('\t');
 const status=Number(codeText||0),bytes=fs.existsSync(dest)?fs.statSync(dest).size:0;
 let finalOK=false;try{finalOK=allowHosts.includes(new URL(final).hostname)}catch{}
 const valid=proc.status===0&&status===200&&finalOK&&bytes>0&&bytes<=maxSize&&
 (mime||'').toLowerCase().startsWith(format[ext]);
 if(!valid&&fs.existsSync(dest))fs.renameSync(dest,dest+'.invalid');
 const item={role:entry.role,sku:entry.item_sku??null,order:entry.order??null,source_url:entry.url,
 status:valid?'SAVED':'FAILED',http:status,bytes:valid?bytes:0,
 local_path:valid?rel.replaceAll('\\','/'):null,
 sha256:valid?crypto.createHash('sha256').update(fs.readFileSync(dest)).digest('hex'):null,
 content_type:mime??null,error:(proc.stderr||'').trim().slice(0,250)};
 reports.push(item);
 console.log(JSON.stringify({role:item.role,status:item.status,http:status,bytes:item.bytes,order:item.order,url:entry.url.slice(0,120)}));
 await new Promise(r=>setTimeout(r,450));
}
const summary={status:reports.every(x=>x.status==='SAVED')?'ASSET_SAMPLE_PASS':'ASSET_PARTIAL',
 source_origin:manifest.origin,snapshot_at:new Date().toISOString(),role,start,limit:max,requested:reports.length,saved:reports.filter(x=>x.status==='SAVED').length,
 downloaded_bytes:reports.reduce((n,x)=>n+x.bytes,0),source_media_count:manifest.media_assets.length,source_css_count:manifest.css_dependencies.length,
 assets:reports};
const report=path.join(out,'asset-report-'+role+'-'+start+'-'+max+'.json');fs.writeFileSync(report,JSON.stringify(summary,null,2)+'\n');
console.log('SUMMARY '+JSON.stringify({status:summary.status,saved:summary.saved,requested:summary.requested,bytes:summary.downloaded_bytes,report}));
process.exit(summary.status==='ASSET_SAMPLE_PASS'?0:3);
