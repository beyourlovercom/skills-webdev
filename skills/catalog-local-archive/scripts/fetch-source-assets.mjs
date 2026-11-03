#!/usr/bin/env node
/**
 * Download only media/CSS listed in a verified private manifest, preserving bytes.
 * Bounded, sequential, no recursive discovery, no cookies. Outputs private JSON report.
 * Usage: node fetch-source-assets.mjs --manifest <file> --out <abs> --limit 12
 */
import { enforceVisualFirst } from './visual-first-gate.mjs';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {spawnSync} from 'node:child_process';
const arg=n=>{const i=process.argv.indexOf('--'+n);return i>=0?process.argv[i+1]:null};
const file=arg('manifest'),out=arg('out'),max=Number(arg('limit')||6);
if(!file||!out||!path.isAbsolute(out)||!Number.isInteger(max)||max<1||max>120)throw Error('Require --manifest --out absolute --limit 1..120');
const manifest=JSON.parse(fs.readFileSync(file,'utf8'));
if(manifest.origin!=='https://www.basworld.com')throw Error('Unrecognized source origin');
const stage=arg('stage')||'PILOT_FIRST_PAGE';
if(stage==='PILOT_FIRST_PAGE'){
  if(manifest.pilot_scope!=='FIRST_PAGE' || manifest.verified_first_page_assets!==true)
    throw Error('OWNER_VISUAL_GATE_BLOCKED: first round media must come from a verified FIRST_PAGE scoped manifest; bulk gallery queues prohibited');
  if(manifest.source_page_numbers?.some(n=>n!==1))
    throw Error('OWNER_VISUAL_GATE_BLOCKED: media manifest references a later page');
}else{
  enforceVisualFirst({phase:stage,approvalFile:arg('visual-approval'),moduleId:arg('module'),mode:'media',from:2,limit:2});
}
const ua='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
const records=[...manifest.media_assets,...manifest.css_dependencies.map(url=>({url,role:'css',item_sku:null}))];
const allowHosts=['www.basworld.com','static.basworld.com','media.basworld.com','cms.media.basworld.com','basgroup.a.bigcontent.io'];
const format={'.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.svg':'image/svg+xml','.css':'text/css','.gif':'image/gif','.ico':'image/x-icon','.avif':'image/avif','.woff2':'font/woff2','.woff':'font/woff','.ttf':'font/ttf','.otf':'font/otf','.eot':'application/vnd.ms-fontobject'};
const role=arg('role')||'all';
if(!['all','logo','vehicle_gallery','page_image','css'].includes(role))throw Error('Invalid --role');
const start=Number(arg('start')||0);
if(!Number.isInteger(start)||start<0||start>100000)throw Error('Invalid --start');
function magicOK(ext,bytes){
 if(ext==='.jpg'||ext==='.jpeg')return bytes.length>4&&bytes[0]===255&&bytes[1]===216&&bytes[2]===255;
 if(ext==='.png')return bytes.length>8&&bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]));
 if(ext==='.webp')return bytes.length>12&&bytes.toString('ascii',0,4)==='RIFF'&&bytes.toString('ascii',8,12)==='WEBP';
 if(ext==='.svg')return /<svg[\s>]/i.test(bytes.toString('utf8',0,2000));
 if(ext==='.css')return !/^\s*</.test(bytes.toString('utf8',0,100));
 if(ext==='.gif')return bytes.toString('ascii',0,4)==='GIF8';
 if(ext==='.ico')return bytes.length>8&&bytes[0]===0&&bytes[1]===0&&bytes[2]===1&&bytes[3]===0;
 if(ext==='.avif')return bytes.length>12&&bytes.toString('ascii',4,8)==='ftyp'&&bytes.toString('ascii',8,12).startsWith('avi');
 if(ext==='.woff2')return bytes.toString('ascii',0,4)==='wOF2';
 if(ext==='.woff')return bytes.toString('ascii',0,4)==='wOFF';
 if(ext==='.ttf')return (bytes[0]===0&&bytes[1]===1&&bytes[2]===0&&bytes[3]===0)||bytes.toString('ascii',0,4)==='true';
 if(ext==='.otf')return bytes.toString('ascii',0,4)==='OTTO';
 if(ext==='.eot')return bytes.length>64;
 return false;
}
const selected=records.filter(x=>role==='all'||x.role===role).slice(start,start+max),seen=new Set();
const reports=[];
fs.mkdirSync(out,{recursive:true});
for(const entry of selected){
 let url,ext;try{url=new URL(entry.url);ext=path.extname(url.pathname).toLowerCase();if(!format[ext] && ['cms.media.basworld.com','media.basworld.com'].includes(url.hostname)){ext=url.searchParams.get('fmt')==='webp'?'.webp':'.jpg';}else if(!format[ext]&&url.hostname==='basgroup.a.bigcontent.io'){ext='.png';}}catch{throw Error('Invalid asset URL');}
 if(url.protocol!=='https:'||!allowHosts.includes(url.hostname)||!format[ext]||entry.url.length>2048)throw Error('Asset outside allowlist '+entry.url);
 if(seen.has(url.href))continue;seen.add(url.href);
 const id=crypto.createHash('sha256').update(url.href).digest('hex').slice(0,20);
 const rel=path.join('assets',entry.role,id+ext),dest=path.join(out,rel);
 fs.mkdirSync(path.dirname(dest),{recursive:true});
 const maxSize=8000000;
 const invalid=dest+'.invalid',headerFile=dest+'.headers';
 if(!fs.existsSync(dest)&&fs.existsSync(invalid)){
  const header=fs.existsSync(headerFile)?fs.readFileSync(headerFile,'utf8'):'';
  const b=fs.readFileSync(invalid);
  if(b.length>0&&b.length<=maxSize&&magicOK(ext,b)&&/^HTTP\/1\.1 (?:200 OK|201 Created)/m.test(header)&&/content-type:\s*image\/(?:jpeg|jpg)/im.test(header)){
   fs.renameSync(invalid,dest);console.log(JSON.stringify({role:entry.role,status:'RECOVERED_VERIFIED_HTTP_201_JPEG',bytes:b.length}));
  }
 }
 if(fs.existsSync(dest)&&fs.statSync(dest).size>0){
  const bytes=fs.statSync(dest).size;
  reports.push({role:entry.role,sku:entry.item_sku??null,order:entry.order??null,source_url:entry.url,
   status:'SAVED',http:(fs.existsSync(headerFile)&&/^HTTP\/1\.1 201 Created/m.test(fs.readFileSync(headerFile,'utf8'))?201:200),bytes,local_path:rel.replaceAll('\\','/'),
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
 const valid=proc.status===0&&(status===200||(status===201&&['.jpg','.jpeg','.png','.webp'].includes(ext)))&&finalOK&&bytes>0&&bytes<=maxSize&&
 ((mime||'').toLowerCase().startsWith(format[ext])||(['.jpg','.jpeg'].includes(ext)&&/^image\/jpg(?:\s*;|$)/i.test(mime||''))||(['.woff','.woff2','.ttf','.otf','.eot'].includes(ext)&&/(font|octet-stream|vnd.ms-fontobject)/i.test(mime||'')))&&magicOK(ext,fs.readFileSync(dest));
 if(!valid && ext==='.png' && status===200 && fs.existsSync(dest)){
  const bytesOnDisk=fs.readFileSync(dest);
  if(bytesOnDisk.length>12 && /^image\/webp(?:\s*;|$)/i.test(mime||'') &&
     magicOK('.webp',bytesOnDisk)){
    const newRel=path.join('assets',entry.role,id+'.webp');
    const newDest=path.join(out,newRel);
    fs.renameSync(dest,newDest);
    const recovered={role:entry.role,sku:entry.item_sku??null,order:entry.order??null,
      source_url:entry.url,status:'SAVED',http:status,bytes:bytesOnDisk.length,
      local_path:newRel.replaceAll('\\','/'),sha256:crypto.createHash('sha256').update(bytesOnDisk).digest('hex'),
      content_type:'image/webp',error:null,source_extension_mismatch:'.png URL returned image/webp'};
    reports.push(recovered);
    console.log(JSON.stringify({role:entry.role,status:'SAVED_SOURCE_FORMAT_WEBP',http:status,bytes:bytesOnDisk.length,url:entry.url.slice(0,120)}));
    await new Promise(r=>setTimeout(r,450));continue;
  }
 }
 if(!valid&&fs.existsSync(dest))fs.renameSync(dest,dest+'.invalid');
 const item={role:entry.role,sku:entry.item_sku??null,order:entry.order??null,source_url:entry.url,
 status:valid?'SAVED':'FAILED',http:status,bytes:valid?bytes:0,
 local_path:valid?rel.replaceAll('\\','/'):null,
 sha256:valid?crypto.createHash('sha256').update(fs.readFileSync(dest)).digest('hex'):null,
 content_type:mime??null,error:(proc.stderr||'').trim().slice(0,250)};
 reports.push(item);
 console.log(JSON.stringify({role:item.role,status:item.status,http:status,bytes:item.bytes,order:item.order,url:entry.url.slice(0,120)}));
 if(status===403 || status===429){console.log('ACCESS_BLOCK_STOP '+status+' '+url.href.slice(0,120));break;}
 await new Promise(r=>setTimeout(r,450));
}
const summary={status:reports.every(x=>x.status==='SAVED')?'ASSET_SAMPLE_PASS':'ASSET_PARTIAL',
 source_origin:manifest.origin,snapshot_at:new Date().toISOString(),role,start,limit:max,requested:reports.length,saved:reports.filter(x=>x.status==='SAVED').length,
 downloaded_bytes:reports.reduce((n,x)=>n+x.bytes,0),source_media_count:manifest.media_assets.length,source_css_count:manifest.css_dependencies.length,
 assets:reports};
const report=path.join(out,'asset-report-'+role+'-'+start+'-'+max+'.json');fs.writeFileSync(report,JSON.stringify(summary,null,2)+'\n');
console.log('SUMMARY '+JSON.stringify({status:summary.status,saved:summary.saved,requested:summary.requested,bytes:summary.downloaded_bytes,report}));
process.exit(summary.status==='ASSET_SAMPLE_PASS'?0:3);
