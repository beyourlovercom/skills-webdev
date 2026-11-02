import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {spawn} from "node:child_process";
const HOST="http://localdev.basworldy.com";
const chromeBin="C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const out="C:\\Users\\Administrator\\Documents\\catalog-local-archive-pilot-20261102\\core-pages-review-20261102";
fs.mkdirSync(out,{recursive:true});
const profile=fs.mkdtempSync(path.join(os.tmpdir(),"bwy-theme-uat-"));
const chrome=spawn(chromeBin,["--headless=new","--disable-gpu","--no-first-run","--disable-extensions","--disable-background-networking","--no-proxy-server","--remote-debugging-port=0","--user-data-dir="+profile,"about:blank"],{stdio:"ignore",windowsHide:true});
const delay=ms=>new Promise(r=>setTimeout(r,ms));
let ws,seq=0,checks=0,external=[],errors=[],broken=[],screens=[];
const pending=new Map();
async function cmd(method,params={}){const id=++seq;const result=new Promise((resolve,reject)=>pending.set(id,{resolve,reject}));ws.send(JSON.stringify({id,method,params}));const r=await result;if(r.error)throw new Error(method+":"+JSON.stringify(r.error));return r.result;}
async function evaluate(expression){const r=await cmd("Runtime.evaluate",{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value;}
async function expect(exp,meaning){const v=await evaluate(exp);assert.ok(v,meaning+" got "+JSON.stringify(v));checks++;return v;}
async function navigate(route){await cmd("Page.navigate",{url:HOST+route});for(let i=0;i<55;i++){await delay(90);if(await evaluate("document.readyState==='complete'").catch(()=>false))break;}await delay(170);await expect("location.hostname==='localdev.basworldy.com'","host");}
async function snap(name){const r=await cmd("Page.captureScreenshot",{format:"png",captureBeyondViewport:false});const p=path.join(out,name);fs.writeFileSync(p,Buffer.from(r.data,"base64"));assert.ok(fs.statSync(p).size>2500,"small image "+name);screens.push(name);checks++;}
async function view(width,height,mobile){await cmd("Emulation.setDeviceMetricsOverride",{width,height,deviceScaleFactor:1,mobile});}
async function main(){
 let port;for(let i=0;i<90;i++){const f=path.join(profile,"DevToolsActivePort");if(fs.existsSync(f)){port=fs.readFileSync(f,"utf8").split(/\r?\n/)[0];break;}await delay(100);}
 assert.ok(port,"CDP unavailable");const tabs=await(await fetch("http://127.0.0.1:"+port+"/json")).json();const page=tabs.find(x=>x.type==="page");
 ws=new WebSocket(page.webSocketDebuggerUrl);
 await new Promise((resolve,reject)=>{ws.addEventListener("open",resolve,{once:true});ws.addEventListener("error",reject,{once:true});});
 ws.addEventListener("message",e=>{const x=JSON.parse(e.data);if(x.id&&pending.has(x.id)){pending.get(x.id).resolve(x);pending.delete(x.id);}if(x.method==="Runtime.exceptionThrown")errors.push(x.params.exceptionDetails?.text||"exception");if(x.method==="Network.requestWillBeSent"){const url=x.params.request.url;try{const u=new URL(url);if(["http:","https:"].includes(u.protocol)&&u.hostname!=="localdev.basworldy.com")external.push(u.origin);}catch{}}});
 await cmd("Page.enable");await cmd("Runtime.enable");await cmd("Network.enable");
 await view(1440,950,false);
 await navigate("/");
 await expect("document.querySelector('h1')?.innerText.includes('Heavy vehicles')","home H1");
 await expect("document.querySelectorAll('.category-tile').length===3","category tiles");
 await expect("document.querySelectorAll('.vehicle-card').length===3","home vehicles");
 await expect("document.querySelector('.brandmark')?.innerText.includes('BASWORLDY')","brand");
 await snap("01-home-desktop.png");
 await navigate("/vehicles/");
 await expect("document.querySelectorAll('.catalog-item[data-vehicle]').length===4","vehicle cards + wrappers"); 
 await expect("!!document.querySelector('#vehicle-filters')","filters exist");
 await evaluate("document.querySelector('[name=brand]').value='Atlas';document.querySelector('[name=brand]').dispatchEvent(new Event('input',{bubbles:true}))");
 await expect("document.querySelector(\'#vehicle-count\').textContent===\'2\'","brand Atlas count 2");await expect("document.querySelectorAll(\'.catalog-item:not([hidden]) .vehicle-card:not([hidden])\').length===2","two visible product cards");
 await evaluate("document.querySelector('[name=year]').value='2022';document.querySelector('[name=year]').dispatchEvent(new Event('input',{bubbles:true}))");
 await expect("document.querySelector(\'#vehicle-count\').textContent===\'1\'","brand + year count 1");await expect("document.querySelectorAll(\'.catalog-item:not([hidden]) .vehicle-card:not([hidden])\').length===1","one visible filtered card");
 await snap("02-vehicles-filtered-desktop.png");
 await navigate("/vehicles/atlas-hx-520/");
 await expect("document.querySelector('h1')?.innerText.includes('Atlas HX 520')","detail H1");
 await expect("document.querySelectorAll('.spec-table>div').length===10","detail 10 specs");
 await expect("document.querySelector('.detail-svg')?.complete&&document.querySelector('.detail-svg')?.naturalWidth>0","detail image loaded");
 await snap("03-vehicle-detail-desktop.png");
 await navigate("/about-us/");await expect("document.querySelector(\'h1\')?.innerText.includes(\'About Us\')","about page");await navigate("/transport-export/");await expect("document.querySelectorAll(\'.step-list>div\').length===3","transport page steps");await navigate("/contact/");await expect("document.querySelectorAll(\'.form-preview input[disabled],.form-preview textarea[disabled]\').length===3","contact form remains disabled");await navigate("/how-to-buy/");
 await expect("document.querySelectorAll('.step-list>div').length===3","page three steps");
 await snap("04-page-how-to-buy-desktop.png");
 await navigate("/insights/");
 await expect("document.querySelectorAll('.article-card').length>=3","blog archive posts");
 await snap("05-blog-index-desktop.png");
 await navigate("/understanding-axle-configurations/");
 await expect("document.querySelector('.article-detail h1')?.innerText.includes('axle')","blog single");
 await snap("06-blog-article-desktop.png");
 await view(375,812,true);
 for(const [url,name] of [["/","07-home-mobile.png"],["/vehicles/","08-vehicles-mobile.png"],["/vehicles/atlas-hx-520/","09-detail-mobile.png"],["/how-to-buy/","10-page-mobile.png"],["/insights/","11-blog-mobile.png"]]){
  await navigate(url);const diff=await evaluate("document.documentElement.scrollWidth-document.documentElement.clientWidth");if(diff>2)console.log("OVERFLOW",url,diff,await evaluate("JSON.stringify({innerWidth,clientWidth:document.documentElement.clientWidth,scrollWidth:document.documentElement.scrollWidth})"),await evaluate("JSON.stringify([...document.querySelectorAll(\u0027body *\u0027)].filter(e=>e.getBoundingClientRect().right>document.documentElement.clientWidth+2).slice(0,12).map(e=>({tag:e.tagName,classes:e.className,w:Math.round(e.getBoundingClientRect().width),right:Math.round(e.getBoundingClientRect().right)})))"));await expect("document.documentElement.scrollWidth-document.documentElement.clientWidth<=2","mobile no overflow "+url);await snap(name);
 }
 assert.deepEqual(external,[],"external origins");checks++;
 assert.deepEqual(errors,[],"JS errors");checks++;
 const result={status:"LOCAL_CORE_BROWSER_PASS",checks,origin:HOST,desktop:1440,mobile:375,shots:screens,external_requests:external,js_exceptions:errors,evidence_dir:out};
 console.log(JSON.stringify(result,null,2));
}
try{await main()}finally{ws?.close();chrome.kill();await delay(300);try{fs.rmSync(profile,{recursive:true,force:true})}catch{}}