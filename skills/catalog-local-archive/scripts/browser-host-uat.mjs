#!/usr/bin/env node
// Actual Windows Chrome file:// UAT via native Node WebSocket/CDP (no npm, no network access).
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {spawn} from "node:child_process";
import {fileURLToPath,pathToFileURL} from "node:url";
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"../demo");
const output=path.resolve(root,"../browser-evidence-host");
fs.mkdirSync(output,{recursive:true});
const chromePath=process.env.CHROME_BIN || "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
assert.ok(fs.existsSync(chromePath),"Chrome executable must exist");
const profile=fs.mkdtempSync(path.join(os.tmpdir(),"catalog-archive-chrome-"));
const chrome=spawn(chromePath,[
 "--headless=new","--disable-gpu","--no-first-run","--no-default-browser-check",
 "--disable-extensions","--disable-background-networking","--no-proxy-server",
 "--remote-debugging-port=0","--user-data-dir="+profile,"about:blank"
],{stdio:"ignore",windowsHide:true});
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
let ws,seq=0,requests=[],checks=0;
const pending=new Map();
async function rpc(method,params={}) {
 const id=++seq;
 const promise=new Promise((resolve,reject)=>pending.set(id,{resolve,reject}));
 ws.send(JSON.stringify({id,method,params}));
 const result=await promise;
 if(result.error)throw new Error(method+": "+JSON.stringify(result.error));
 return result;
}
async function js(expression){
 const x=await rpc("Runtime.evaluate",{expression,returnByValue:true,awaitPromise:true});
 if(x.result.exceptionDetails)throw new Error("JS: "+JSON.stringify(x.result.exceptionDetails));
 return x.result.result.value;
}
async function until(expression){
 for(let i=0;i<50;i++){
  try{const result=await js(expression); if(result)return result;}catch{}
  await sleep(100);
 }
 throw new Error("Timed out waiting for: "+expression);
}
async function navigate(url){
 await rpc("Page.navigate",{url});
 await until("document.readyState==='complete' && !!document.querySelector('[data-page]')");
 await sleep(140);
}
async function screenshot(name){
 const img=await rpc("Page.captureScreenshot",{format:"png",captureBeyondViewport:false});
 const dest=path.join(output,name);
 fs.writeFileSync(dest,Buffer.from(img.result.data,"base64"));
 assert.ok(fs.statSync(dest).size>2500,"Screenshot not empty: "+name);checks++;
}
async function test(){
 let port;
 for(let i=0;i<80;i++){
  const p=path.join(profile,"DevToolsActivePort");
  if(fs.existsSync(p)){port=fs.readFileSync(p,"utf8").split(/\r?\n/)[0];break;}
  if(chrome.exitCode!==null)throw new Error("Chrome exited prematurely: "+chrome.exitCode);
  await sleep(100);
 }
 assert.ok(port,"Chrome CDP port unavailable");
 let pages;
 for(let i=0;i<30;i++){
  try{pages=await (await fetch("http://127.0.0.1:"+port+"/json")).json();if(pages.length)break;}catch{}
  await sleep(100);
 }
 const tab=pages.find(x=>x.type==="page");
 assert.ok(tab?.webSocketDebuggerUrl,"No inspectable Chrome tab");
 ws=new WebSocket(tab.webSocketDebuggerUrl);
 await new Promise((resolve,reject)=>{ws.addEventListener("open",resolve,{once:true});ws.addEventListener("error",reject,{once:true});});
 ws.addEventListener("message",evt=>{
  const m=JSON.parse(evt.data);
  if(m.id && pending.has(m.id)){pending.get(m.id).resolve(m);pending.delete(m.id);}
  if(m.method==="Network.requestWillBeSent") requests.push(m.params.request.url);
 });
 await rpc("Page.enable");
 await rpc("Runtime.enable");
 await rpc("Network.enable");
 await rpc("Network.setCacheDisabled",{cacheDisabled:true});
 const index="http://localdev.basworldy.com/catalog-pilot/index.html";
 const detail="http://localdev.basworldy.com/catalog-pilot/detail.html?id=DEMO-001";
 await rpc("Emulation.setDeviceMetricsOverride",{width:1440,height:900,deviceScaleFactor:1,mobile:false});
 await navigate(index);
 assert.equal(await js("location.hostname"),"localdev.basworldy.com");checks++;
 assert.equal(await until("document.querySelector('#count')?.textContent==='4' && document.querySelectorAll('.vehicle').length===4"),true);checks++;
 assert.equal(await until("[...document.querySelectorAll('.vehicle img')].every(i=>i.complete&&i.naturalWidth>0)"),true);checks++;
 await screenshot("list-desktop.png");
 await js("document.querySelector('#brand').value='Atlas'; document.querySelector('#brand').dispatchEvent(new Event('change',{bubbles:true}));");
 assert.equal(await js("document.querySelector('#count').textContent"),"2");checks++;
 await js("document.querySelector('#year').value='2022'; document.querySelector('#year').dispatchEvent(new Event('input',{bubbles:true}));");
 assert.equal(await js("document.querySelector('#count').textContent"),"1");checks++;
 assert.equal(await js("document.querySelector('.vehicle').getAttribute('data-product-id')"),"DEMO-003");checks++;
 await js("document.querySelector('#reset').click()");
 assert.equal(await js("document.querySelector('#count').textContent"),"4");checks++;
 await js("document.querySelector('#sort').value='price-low'; document.querySelector('#sort').dispatchEvent(new Event('change',{bubbles:true}));");
 assert.equal(await js("document.querySelector('.vehicle').getAttribute('data-product-id')"),"DEMO-004");checks++;
 await screenshot("filtered-list-desktop.png");
 await navigate(detail);
 assert.equal(await until("document.querySelector('#asset-state')?.textContent.startsWith('Local image loaded')"),true);checks++;
 assert.equal(await js("document.querySelector('#vehicle-img').naturalWidth > 0"),true);checks++;
 assert.equal(await js("document.querySelector('#detail').textContent.includes('Atlas HX 520')"),true);checks++;
 await screenshot("detail-desktop.png");
 await rpc("Emulation.setDeviceMetricsOverride",{width:375,height:812,deviceScaleFactor:1,mobile:true});
 await navigate(index);
 assert.equal(await until("document.querySelector('#count')?.textContent==='4'"),true);checks++;
 const overflow=await js("document.documentElement.scrollWidth-document.documentElement.clientWidth");
 assert.ok(overflow<=2,"mobile horizontal overflow: "+overflow);checks++;
 await screenshot("list-mobile.png");
 assert.equal(requests.filter(url=>/^https?:/i.test(url) && !url.startsWith("http://localdev.basworldy.com/")).length,0,"Remote requests found");checks++;
 console.log(JSON.stringify({status:"LOCAL_HOST_BROWSER_PASS",checks,browser:"Windows Chrome headless CDP",mode:"http://localdev.basworldy.com/catalog-pilot/ + local assets only",vehicles:4,images_loaded:true,filter_events:true,detail:true,mobile_overflow_px:overflow,remote_requests:0,screenshots:["list-desktop.png","filtered-list-desktop.png","detail-desktop.png","list-mobile.png"],evidence:output},null,2));
}
try{await test();}
finally{
 if(ws)ws.close();
 chrome.kill();
 await sleep(350);
 try{fs.rmSync(profile,{recursive:true,force:true,maxRetries:3,retryDelay:150});}catch{}
}
