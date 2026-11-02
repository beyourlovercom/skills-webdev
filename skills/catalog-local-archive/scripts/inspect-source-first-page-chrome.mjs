#!/usr/bin/env node
import fs from 'node:fs';import os from 'node:os';import path from 'node:path';import {spawn} from 'node:child_process';
const chrome='C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',host='https://www.basworld.com';
const out='D:\\ai\\basworldy-source-archive\\source-browser-reference-first-page';fs.mkdirSync(out,{recursive:true});
const profile=fs.mkdtempSync(path.join(os.tmpdir(),'bwy-source-chrome-'));
const child=spawn(chrome,['--headless=new','--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36','--disable-gpu','--disable-extensions','--no-first-run','--remote-debugging-port=0','--user-data-dir='+profile,'about:blank'],{windowsHide:true,stdio:'ignore'});
const delay=ms=>new Promise(r=>setTimeout(r,ms));let ws,seq=0,errs=[],remotes=[],externalResponses=[],results=[],pending=new Map();
async function rpc(method,params={}){const id=++seq;const promise=new Promise((resolve,reject)=>pending.set(id,{resolve,reject}));ws.send(JSON.stringify({id,method,params}));const reply=await promise;if(reply.error)throw Error(method+JSON.stringify(reply.error));return reply.result;}
async function evaluate(expression){const value=await rpc('Runtime.evaluate',{expression,returnByValue:true});return value.result.value;}
async function visit(route,name){await rpc('Page.navigate',{url:host+route});for(let j=0;j<70;j++){await delay(110);if(await evaluate("document.readyState==='complete' && location.pathname==="+JSON.stringify(new URL(host+route).pathname)).catch(()=>false))break;}await delay(800);
const expr="JSON.stringify({title:document.title,url:location.href,h1:document.querySelector('h1')?.innerText?.slice(0,100),scroll_width:document.documentElement.scrollWidth,image_count:document.images.length,loaded_images:[...document.images].filter(i=>i.complete&&i.naturalWidth>0).length,local_real_images:[...document.images].filter(i=>i.src.includes('/source-mirror/assets/')&&i.complete&&i.naturalWidth>0).length,local_css:[...document.styleSheets].filter(s=>s.href?.includes('/source-mirror/assets/css/')).length})";
const d=JSON.parse(await evaluate(expr));const shot=await rpc('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});fs.writeFileSync(path.join(out,name),Buffer.from(shot.data,'base64'));results.push({route,...d,screenshot:name});}
async function main(){
 let port;for(let i=0;i<90;i++){const fp=path.join(profile,'DevToolsActivePort');if(fs.existsSync(fp)){port=fs.readFileSync(fp,'utf8').split(/\r?\n/)[0];break;}await delay(100);}if(!port)throw Error('Chrome CDP missing');
 const tabs=await(await fetch('http://127.0.0.1:'+port+'/json')).json();ws=new WebSocket(tabs.find(t=>t.type==='page').webSocketDebuggerUrl);
 await new Promise((res,rej)=>{ws.addEventListener('open',res,{once:true});ws.addEventListener('error',rej,{once:true});});
 await rpc('Network.setBlockedURLs',{urls:['*google-analytics.com*','*googletagmanager.com*','*facebook.com/tr*','*doubleclick.net*']});
 ws.addEventListener('message',e=>{const m=JSON.parse(e.data);if(m.id&&pending.has(m.id)){pending.get(m.id).resolve(m);pending.delete(m.id);}if(m.method==='Runtime.exceptionThrown')errs.push(m.params.exceptionDetails?.text);if(m.method==='Network.requestWillBeSent'){try{const u=new URL(m.params.request.url);if(['http:','https:'].includes(u.protocol)&&u.hostname!=='localdev.basworldy.com')remotes.push(u.href.slice(0,170));}catch{}}if(m.method==='Network.responseReceived'){try{const u=new URL(m.params.response.url);if(['http:','https:'].includes(u.protocol)&&u.hostname!=='localdev.basworldy.com')externalResponses.push({url:u.href.slice(0,160),status:m.params.response.status});}catch{}}});
 await rpc('Page.enable');await rpc('Runtime.enable');await rpc('Network.enable');await rpc('Emulation.setDeviceMetricsOverride',{width:1440,height:900,deviceScaleFactor:1,mobile:false});
 await visit('/','source-home-desktop.png');
 // FIRST_PAGE_ONLY: no page-2 or secondary product reads before Owner visual PASS.
 await rpc('Emulation.setDeviceMetricsOverride',{width:375,height:812,deviceScaleFactor:1,mobile:true});await visit('/','source-home-mobile.png');
 const report={status:'PUBLIC_SOURCE_FIRST_PAGE_REFERENCE_ONLY',pages:results,external_attempts:remotes.length,external_success_responses:externalResponses.length,external_success_sample:externalResponses.slice(0,3),external_sample:remotes.slice(0,3),js_exceptions:errs.length,exceptions:errs.slice(0,3),evidence_dir:out,proxy:'SYSTEM_DEFAULT'};
 fs.writeFileSync(path.join(out,'browser-report.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));
}
try{await main()}finally{ws?.close();child.kill();await delay(200);try{fs.rmSync(profile,{recursive:true,force:true})}catch{}}
