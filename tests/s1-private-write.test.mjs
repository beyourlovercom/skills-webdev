import test from 'node:test';import assert from 'node:assert/strict';
import fs from 'node:fs';import os from 'node:os';import path from 'node:path';
import {writePrivateJson} from '../skills/s1-cross-source/scripts/private-write.mjs';
test('private evidence writer is exclusive and stays below real .private-s1 root',()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'s1-private-'));
 try{const filename=path.join(dir,'.private-s1','site','evidence.json');
 assert.equal(writePrivateJson(filename,{safe:true}),filename);
 assert.deepEqual(JSON.parse(fs.readFileSync(filename,'utf8')),{safe:true});
 assert.throws(()=>writePrivateJson(filename,{safe:false}),/EEXIST/);
 assert.throws(()=>writePrivateJson(path.join(dir,'public.json'),{}),/BLOCKED/);
 }finally{fs.rmSync(dir,{recursive:true,force:true});}
});
test('private output refuses symlinked root or child path escaping to public directory',(t)=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'s1-private-link-'));
 try{
  const safe=path.join(dir,'.private-s1');const outside=path.join(dir,'public');fs.mkdirSync(outside);
  try{fs.symlinkSync(outside,safe,'dir');}catch(e){if(e.code==='EPERM'||e.code==='EACCES'){t.skip('OS disallows symlink creation');return;}throw e;}
  assert.throws(()=>writePrivateJson(path.join(safe,'export.json'),{secret:'do not leak'}),/symlink/);
  assert.equal(fs.existsSync(path.join(outside,'export.json')),false);
  fs.rmSync(safe);fs.mkdirSync(safe,{mode:0o700});
  const link=path.join(safe,'linked');fs.symlinkSync(outside,link,'dir');
  assert.throws(()=>writePrivateJson(path.join(link,'export.json'),{secret:'do not leak'}),/escapes/);
  assert.equal(fs.existsSync(path.join(outside,'export.json')),false);
 }finally{fs.rmSync(dir,{recursive:true,force:true});}
});
