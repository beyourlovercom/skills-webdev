import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {planMissing,complete} from '../skills/duplicate-site-skills/v2/scripts/complete-offline-media.mjs';

test('plans only locally missing same-origin wp-content media from pilot HTML',async()=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'asset-completion-v2-'));
 try {
  const mirror=path.join(root,'mirror');
  fs.mkdirSync(path.join(mirror,'wp-content','uploads'),{recursive:true});
  fs.writeFileSync(path.join(mirror,'wp-content','uploads','present.webp'),'old');
  fs.writeFileSync(path.join(mirror,'index.html'),'<img src="/wp-content/uploads/missing.webp"><img src="/wp-content/uploads/present.webp"><a href="/blog/">Blog</a>');
  const mf=path.join(root,'pilot.json');
  fs.writeFileSync(mf,JSON.stringify({schema_version:2,execution:{scope:'PILOT_SAMPLES',enable_bulk:false},rights:{owner_attested:true},source:{origin:'https://www.rapiddirect.com/'}}));
  const p=planMissing({workspace:root,manifest:mf});
  assert.equal(p.missing.length,1);
  assert.equal(p.missing[0].path,'/wp-content/uploads/missing.webp');
  assert.equal((await complete({workspace:root,manifest:mf})).status,'DRY_RUN');
  assert.equal(fs.existsSync(path.join(mirror,'wp-content','uploads','missing.webp')),false);
  const bad=JSON.parse(fs.readFileSync(mf,'utf8'));bad.execution.enable_bulk=true;fs.writeFileSync(mf,JSON.stringify(bad));
  assert.throws(()=>planMissing({workspace:root,manifest:mf}),/pilot gate denied/);
 }finally{fs.rmSync(root,{recursive:true,force:true});}
});
