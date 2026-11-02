import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
const script=fileURLToPath(new URL('../source-http-read.mjs',import.meta.url));
function invoke(policy){
  const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'bwy-source-read-test-'));
  try { const p=path.join(tmp,'policy.json'); fs.writeFileSync(p,JSON.stringify(policy));
    return spawnSync(process.execPath,[script,p],{encoding:'utf8',timeout:6000});
  } finally { fs.rmSync(tmp,{force:true,recursive:true}); }
}
const valid={source_url:'https://www.basworld.com/',allowed_exact_urls:['https://www.basworld.com/'],allowed_hosts:['www.basworld.com'],user_agent:'BASWORLDY QA / owner approved',output_directory:path.join(os.tmpdir(),'bwy-source-read-test-output'),max_bytes:2000000,max_pages_per_run:1};
test('rejects unapproved source URLs before any HTTP request',()=>{
 const r=invoke({...valid,source_url:'https://www.example.com/'});
 assert.equal(r.status,2);assert.match(r.stderr,/URL must be in allowed_exact_urls/);
});
test('rejects batch reads, only one explicit source URL allowed',()=>{
 const r=invoke({...valid,max_pages_per_run:2});
 assert.equal(r.status,2);assert.match(r.stderr,/Only one URL/);
});
test('rejects remote URLs with credentials',()=>{
 const r=invoke({...valid,source_url:'https://user:pass@www.basworld.com/'});
 assert.equal(r.status,2);assert.match(r.stderr,/without embedded credentials/);
});
test('rejects invalid control character in User-Agent',()=>{
 const r=invoke({...valid,user_agent:'BASWORLDY\r\nX-Evil: allowed'});
 assert.equal(r.status,2);assert.match(r.stderr,/User-Agent required/);
});
test('rejects unbounded file sizes',()=>{
 const r=invoke({...valid,max_bytes:999999999});
 assert.equal(r.status,2);assert.match(r.stderr,/max_bytes/);
});
