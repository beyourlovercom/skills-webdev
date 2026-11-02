#!/usr/bin/env node
// Read-only offline fixture validation; no network and no source-site downloads.
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import crypto from "node:crypto";
import {fileURLToPath} from "node:url";
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"../demo");
const rel=["index.html","detail.html","data.js","catalog.js","site.js","site.css","assets/vehicle.svg"];
let checks=0;
for(const p of rel) {
 const file=path.join(root,p);
 assert.ok(fs.statSync(file).size>0,p+" should exist");
 const content=fs.readFileSync(file,"utf8");
 assert.doesNotMatch(content,/(?:https?:)?\/\//i,p+" must not load external URLs");
 if(/\.(html|js)$/.test(p))assert.doesNotMatch(content,/\b(fetch|XMLHttpRequest|WebSocket)\s*\(/i,p+" must be network-free");
 checks+=2;
}
const context=vm.createContext({});
vm.runInContext(fs.readFileSync(path.join(root,"data.js"),"utf8"),context);
vm.runInContext(fs.readFileSync(path.join(root,"catalog.js"),"utf8"),context);
const data=context.CATALOG_VEHICLES,filter=context.CATALOG_QUERY.filterProducts;
assert.equal(data.length,4);checks++;
assert.equal(new Set(data.map(x=>x.id)).size,4);checks++;
for(const item of data) {
 assert.match(item.id,/^DEMO-\d{3}$/);
 assert.ok(fs.existsSync(path.join(root,item.image)),"local asset "+item.id);
 assert.equal(typeof item.price,"number");
 checks+=3;
}
function check(query,expected) {assert.deepEqual(Array.from(filter(data,query),p=>p.id),expected);checks++;}
check({},["DEMO-001","DEMO-002","DEMO-003","DEMO-004"]);
check({brand:"Atlas"},["DEMO-001","DEMO-003"]);
check({type:"Tractorhead"},["DEMO-002"]);
check({brand:"Atlas",year:"2022"},["DEMO-003"]);
check({axle:"6X4"},["DEMO-001","DEMO-004"]);
check({keyword:"transit"},["DEMO-002"]);
check({sort:"price-low"},["DEMO-004","DEMO-002","DEMO-003","DEMO-001"]);
assert.match(fs.readFileSync(path.join(root,"index.html"),"utf8"),/id="results"/);checks++;
assert.match(fs.readFileSync(path.join(root,"detail.html"),"utf8"),/id="detail"/);checks++;
const hash=crypto.createHash("sha256").update(fs.readFileSync(path.join(root,"assets/vehicle.svg"))).digest("hex");
console.log(JSON.stringify({status:"FIXTURE_UNIT_PASS",count:checks,records:data.length,local_assets:1,asset_sha256:hash,mode:"synthetic-only",remote_source_archived:false},null,2));
