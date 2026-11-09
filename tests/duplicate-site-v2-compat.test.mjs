import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {inspectSource,patchLocal,oldBlock,newBlock} from '../skills/duplicate-site-skills/v2/scripts/pwc-null-assets-compat.mjs';

test('filters null URLs in isolated PWC asset path without removing valid scripts',()=>{
 const found=inspectSource(oldBlock);
 assert.equal(found.status,'PATCH_CANDIDATE');
 assert.match(found.changed,/candidate = it.get\("url"\)/);
 assert.match(found.changed,/not candidate.strip\(\)/);
 assert.match(found.changed,/AssetInfo\(url=candidate/);
 assert.equal(inspectSource(newBlock).status,'ALREADY_PATCHED');
});
test('unknown PWC upstream body is default denied',()=>{
 assert.equal(inspectSource('def some_unrelated_function(): pass').status,'UNKNOWN_UPSTREAM');
});
test('unverified SHA cannot patch even with explicit apply',()=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'pwc-v2-'));
 try{
  const folder=path.join(root,'repo','core','extractor');
  fs.mkdirSync(folder,{recursive:true});
  const file=path.join(folder,'service.py');
  fs.writeFileSync(file,'# fixture\n'+oldBlock+'\n');
  const original=fs.readFileSync(file,'utf8');
  assert.equal(patchLocal({workspace:root,file}).status,'UNKNOWN_SHA_NOT_PATCHED');
  assert.equal(patchLocal({workspace:root,file,apply:true}).modified,false);
  assert.equal(fs.readFileSync(file,'utf8'),original);
  assert.throws(()=>patchLocal({workspace:path.join(root,'repo','core'),file}),/inside workspace/);
 }finally{fs.rmSync(root,{recursive:true,force:true});}
});
