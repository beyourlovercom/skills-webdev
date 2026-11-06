import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {transformGate,patchGate} from '../skills/duplicate-site-skills/v2/scripts/pwc-duplicate-fingerprint-compat.mjs';

test('duplicate PWC critical regions no longer use last-wins geometry',()=>{
 const code='    post_by_fingerprint = {\n        _fingerprint(region): region\n        for region in post\n        if _fingerprint(region)\n    }\n    missing_critical: List[str] = []\n    collapsed_critical: List[str] = []\n\n    for region in pre:\n        if not _is_critical(region):\n            continue\n        fingerprint = _fingerprint(region)\n        candidate = post_by_fingerprint.get(fingerprint)\n        if candidate is None:';
 const result=transformGate(code);
 assert.equal(result.status,'PATCH_CANDIDATE');
 assert.match(result.changed,/pre_occurrence/);
 assert.match(result.changed,/matches\[occurrence\]/);
 assert.equal(transformGate(result.changed).status,'ALREADY_PATCHED');
 assert.equal(transformGate('unrelated implementation').status,'UNKNOWN_UPSTREAM');
});
test('unknown version source cannot be modified even when apply is requested',()=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'pwc-integrity-'));
 try{
  const folder=path.join(root,'pwc','core');fs.mkdirSync(folder,{recursive:true});
  const file=path.join(folder,'capture_integrity.py');
  fs.writeFileSync(file,'not the verified upstream');
  assert.equal(patchGate({workspace:root,file,apply:true}).modified,false);
  assert.throws(()=>patchGate({workspace:path.join(root,'pwc'),file:path.join(root,'outside.py'),apply:true}));
 }finally{fs.rmSync(root,{recursive:true,force:true});}
});
