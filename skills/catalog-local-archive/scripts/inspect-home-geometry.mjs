#!/usr/bin/env node
import fs from 'node:fs';import os from 'node:os';import path from 'node:path';import {spawn} from 'node:child_process';
const chrome='C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',host='http://localdev.basworldy.com';
const out='D:\\ai\\basworldy-source-archive\\review-evidence';fs.mkdirSync(out,{recursive:true});
const profile=fs.mkdtempSync(path.join(os.tmpdir(),'bwy-source-chrome-'));
const child=spawn(chrome,['--headless=new','--disable-gpu','--disable-extensions','--no-first-run','--remote-debugging-port=0','--user-data-dir='+profile,'about:blank'],{windowsHide:true,stdio:'ignore'});
const delay=ms=>new Promise(r=>setTimeout(r,ms));let ws,seq=0,errs=[],remotes=[],externalResponses=[],results=[],pending=new Map();
async function rpc(method,params={}){const id=++seq;const promise=new Promise((resolve,reject)=>pending.set(id,{resolve,reject}));ws.send(JSON.stringify({id,method,params}));const reply=await promise;if(reply.error)throw Error(method+JSON.stringify(reply.error));return reply.result;}
async function evaluate(expression){const value=await rpc('Runtime.evaluate',{expression,returnByValue:true});return value.result.value;}
async function visit(route,name){await rpc('Page.navigate',{url:host+route});for(let j=0;j<70;j++){await delay(110);if(await evaluate("document.readyState==='complete' && location.pathname==="+JSON.stringify(new URL(host+route).pathname)).catch(()=>false))break;}await delay(800);
const scrolled=await rpc('Runtime.evaluate',{expression:"(async()=>{const h=Math.min(24000,document.documentElement.scrollHeight);let count=0;for(let y=0;y<h;y+=750){scrollTo(0,y);await new Promise(r=>setTimeout(r,110));count++;}scrollTo(0,0);await new Promise(r=>setTimeout(r,450));return {steps:count,scroll_height:document.documentElement.scrollHeight};})()",awaitPromise:true,returnByValue:true});
const expr="JSON.stringify({title:document.title,url:location.href,h1:document.querySelector('h1')?.innerText?.slice(0,100),scroll_width:document.documentElement.scrollWidth,image_count:document.images.length,loaded_images:[...document.images].filter(i=>i.complete&&i.naturalWidth>0).length,local_real_images:[...document.images].filter(i=>i.src.includes('/source-mirror/assets/')&&i.complete&&i.naturalWidth>0).length,local_css:[...document.styleSheets].filter(s=>s.href?.includes('/source-mirror/assets/css/')).length,broken_images:[...document.images].filter(i=>i.complete&&i.naturalWidth===0&&i.currentSrc).slice(0,20).map(i=>i.currentSrc),fonts_status:document.fonts.status})";
const d=JSON.parse(await evaluate(expr));const shot=await rpc('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});fs.writeFileSync(path.join(out,name),Buffer.from(shot.data,'base64'));results.push({route,...d,scrolled:scrolled.result.value,screenshot:name});}
async function main(){
 let port;for(let i=0;i<90;i++){const fp=path.join(profile,'DevToolsActivePort');if(fs.existsSync(fp)){port=fs.readFileSync(fp,'utf8').split(/\r?\n/)[0];break;}await delay(100);}if(!port)throw Error('Chrome CDP missing');
 const tabs=await(await fetch('http://127.0.0.1:'+port+'/json')).json();ws=new WebSocket(tabs.find(t=>t.type==='page').webSocketDebuggerUrl);
 await new Promise((res,rej)=>{ws.addEventListener('open',res,{once:true});ws.addEventListener('error',rej,{once:true});});
 ws.addEventListener('message',e=>{const m=JSON.parse(e.data);if(m.id&&pending.has(m.id)){pending.get(m.id).resolve(m);pending.delete(m.id);}if(m.method==='Runtime.exceptionThrown')errs.push(m.params.exceptionDetails?.text);if(m.method==='Network.requestWillBeSent'){try{const u=new URL(m.params.request.url);if(['http:','https:'].includes(u.protocol)&&u.hostname!=='localdev.basworldy.com')remotes.push(u.href.slice(0,170));}catch{}}if(m.method==='Network.responseReceived'){try{const u=new URL(m.params.response.url);if(['http:','https:'].includes(u.protocol)&&u.hostname!=='localdev.basworldy.com')externalResponses.push({url:u.href.slice(0,160),status:m.params.response.status});}catch{}}});
 await rpc('Page.enable');await rpc('Runtime.enable');await rpc('Network.enable');await rpc('Emulation.setDeviceMetricsOverride',{width:1440,height:900,deviceScaleFactor:1,mobile:false});

 await rpc('Page.navigate',{url:host+'/source-mirror/'});
 for(let j=0;j<70;j++){await delay(150);if(await evaluate("location.pathname==='/source-mirror/' && document.readyState==='complete'").catch(()=>false))break;}
 await delay(1000);
 const expr=String.raw`JSON.stringify((()=>{
 const q=s=>document.querySelector(s);
 const dims=e=>{if(!e)return null;const b=e.getBoundingClientRect(),s=getComputedStyle(e);return {tag:e.tagName,class:e.className?.toString().slice(0,110),top:Math.round(b.top+scrollY),height:Math.round(b.height),width:Math.round(b.width),display:s.display,visibility:s.visibility,opacity:s.opacity,position:s.position,background:s.backgroundImage?.slice(0,155),font:s.fontFamily?.slice(0,80),color:s.color,bgColor:s.backgroundColor,fontSize:s.fontSize,fontWeight:s.fontWeight,transform:s.transform,animation:s.animationName,overflow:s.overflow,clipPath:s.clipPath,text:e.innerText?.slice(0,100)}};
 const hidden=[...document.querySelectorAll('body *')].filter(e=>{const b=e.getBoundingClientRect();return b.height>24&&b.width>100&&getComputedStyle(e).opacity==='0';}).slice(0,60).map(dims);
 const huge=[...document.querySelectorAll('body *')].filter(e=>e.getBoundingClientRect().height>2400).map(dims).sort((a,b)=>b.height-a.height).slice(0,25);
 const hero=[...document.querySelectorAll('[class*=Hero], [class*=Page_pageWrapper], [class*=ReviewCard], [class*=CategoryBar], [class*=CTAWithImage], [class*=SimpleCTA]')].slice(0,55).map(dims);
 const h1=dims(q('h1'));const cats={hidden,body:dims(document.body),html:dims(document.documentElement),hero,title:dims(q('[class*=HeroBannerWithVideo_title]')),h1,review:dims(q('[class*=ReviewCardWrapper_reviewsWrapper]')),huge,css:document.styleSheets.length,cssLoaded:[...document.styleSheets].filter(s=>s.href).length,scrollheight:document.documentElement.scrollHeight,viewport:[innerWidth,innerHeight]};
 return cats;})())`;
 const data=JSON.parse(await evaluate(expr));fs.writeFileSync(path.join(out,'home-geometry.json'),JSON.stringify(data,null,2));
 const shot=await rpc('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});fs.writeFileSync(path.join(out,'home-geometry.png'),Buffer.from(shot.data,'base64'));
 console.log(JSON.stringify(data,null,2));

 const report={status:'GEOMETRY_ONLY',visual_gate:'FAIL',pages:results,full_page_lazyload_scrolled:true,source_comparison_screenshot_verified:false,dynamic_components_pass:false,external_attempts:remotes.length,external_success_responses:externalResponses.length,external_success_sample:externalResponses.slice(0,3),external_sample:remotes.slice(0,3),js_exceptions:errs.length,exceptions:errs.slice(0,3),evidence_dir:out,proxy:'SYSTEM_DEFAULT'};
 fs.writeFileSync(path.join(out,'browser-report.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));
}
try{await main()}finally{ws?.close();child.kill();await delay(200);try{fs.rmSync(profile,{recursive:true,force:true})}catch{}}
