#!/usr/bin/env node
/**
 * BASWORLDY scoped nested catalog intake.
 * Read EXACT first-page URLs already present in the authorized source homepage.
 * No URL discovery network, no pagination, no cookies, stop on 403/429/challenge.
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {enforceVisualFirst} from './visual-first-gate.mjs';
const arg=n=>{const i=process.argv.indexOf('--'+n);return i<0?null:process.argv[i+1]};
const original=arg('home'),out=arg('out'),approval=arg('visual-approval'),from=Number(arg('from')||0),limit=Number(arg('limit')||12);
if(!original||!out||!path.isAbsolute(out)||!Number.isInteger(from)||from<0||!Number.isInteger(limit)||limit<1||limit>30)throw Error('Requires --home, --out, --from>=0, --limit 1..30');
const gate=enforceVisualFirst({phase:'EXPANSION_AFTER_OWNER_PASS',approvalFile:approval,moduleId:'catalog-listings',mode:'inventory',from:1,limit:1});
if(gate.scope_mode!=='FIRST_PAGE_CATALOG')throw Error('Project scope forbids pagination');
const src=fs.readFileSync(original,'utf8'),origin='https://www.basworld.com';
const urls=[...new Set([...src.matchAll(/\bhref=["'](\/stock\/[^"'\?#]+)["']/gi)]
  .map(m=>m[1].replace(/\/$/,''))
  .filter(u=>u.split('/').length>3&&!/\/(?:page[/-][2-9]\d*|next)(?:\/|$)/i.test(u)))].sort();
const file=path.join(out,'nested-listing-index.json'),hash=b=>crypto.createHash('sha256').update(b).digest('hex');
fs.mkdirSync(out,{recursive:true});fs.mkdirSync(path.join(out,'pages'),{recursive:true});
let db=fs.existsSync(file)?JSON.parse(fs.readFileSync(file,'utf8')):{
 schema_version:1,origin,scope:'NESTED_LISTING_FIRST_PAGE_ONLY',approved_template_sha:gate.template_sha256,
 source_home_sha256:hash(Buffer.from(src)),all_source_paths:urls,records:[],updated_at:null};
if(db.source_home_sha256!==hash(Buffer.from(src))||db.all_source_paths.length!==urls.length)
 throw Error('Source homepage scope changed; do not silently expand approved route inventory');
const done=new Map(db.records.map(x=>[x.source_path,x]));
const ua='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
const save=()=>{db.updated_at=new Date().toISOString();fs.writeFileSync(file,JSON.stringify(db,null,2)+'\n');};
let attempted=0,success=0,skipped=0,blocks=0;
for(const sourcePath of urls.slice(from,from+limit)){
 const existing=done.get(sourcePath);
 if(existing?.status==='SAVED'&&fs.existsSync(path.join(out,existing.file_path))&&
  hash(fs.readFileSync(path.join(out,existing.file_path)))===existing.sha256){
   skipped++;continue;
 }
 const u=new URL(sourcePath,origin);
 if(u.origin!==origin||u.search||u.hash||!u.pathname.startsWith('/stock/'))
  throw Error('Out-of-scope listing URL: '+sourcePath);
 const id=hash(u.pathname).slice(0,20),rel='pages/'+id+'.html',dest=path.join(out,rel),hdr=dest+'.headers';
 const proc=spawnSync('curl.exe',['--silent','--show-error','--location','--max-redirs','1',
  '--connect-timeout','9','--max-time','25','--retry','0','--max-filesize','2500000',
  '--user-agent',ua,'--dump-header',hdr,'--output',dest,
  '--write-out','%{http_code}\t%{url_effective}\t%{content_type}',u.href],{
  encoding:'utf8',timeout:30000,windowsHide:true,maxBuffer:100000});
 const [stat,final,mime]=(proc.stdout||'').trim().split('\t');
 const code=Number(stat||0),buf=fs.existsSync(dest)?fs.readFileSync(dest):Buffer.alloc(0),html=buf.toString('utf8');
 let finalOK=false;try{finalOK=new URL(final).origin===origin}catch{}
 const challenge=/Just a moment|cf-chl|challenge-platform|Attention Required!/i.test(html.slice(0,12000));
 const valid=proc.status===0&&code===200&&finalOK&&/^text\/html/i.test(mime||'')&&buf.length>1500&&!challenge;
 const title=(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]||'').replace(/\s+/g,' ').slice(0,160);
 const cards=valid?[...new Set([...html.matchAll(/\bhref=["'](\/vehicles\/(?:new|used)\/[^"'\?#]+)["']/gi)].map(m=>m[1]))]:[];
 const record={source_path:sourcePath,source_url:u.href,status:valid?'SAVED':(code===403||code===429||challenge?'BLOCKED_ACCESS':'FAILED'),
  http_status:code,final_url:final||null,title,sha256:valid?hash(buf):null,
  bytes:valid?buf.length:0,file_path:valid?rel:null,product_card_urls:cards.length,
  error:(proc.stderr||'').trim().slice(0,200),challenge,checked_at:new Date().toISOString()};
 db.records=db.records.filter(x=>x.source_path!==sourcePath).concat(record);
 if(!valid&&fs.existsSync(dest))fs.renameSync(dest,dest+'.rejected');
 attempted++;
 if(valid)success++;else blocks++;
 save();
 console.log(JSON.stringify({index:urls.indexOf(sourcePath),path:sourcePath,status:record.status,
  http:code,bytes:record.bytes,cards:record.product_card_urls}));
 if(code===403||code===429||challenge){console.log('STOP_ON_ACCESS_BLOCK');break}
 if(!valid)continue;
 await new Promise(r=>setTimeout(r,600));
}
save();
console.log('SUMMARY '+JSON.stringify({scope_total:urls.length,from,limit,attempted,success,skipped,blocks,
 saved_total:db.records.filter(x=>x.status==='SAVED').length,index:file}));
if(blocks)process.exitCode=3;
