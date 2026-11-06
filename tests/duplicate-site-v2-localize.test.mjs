import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {rewriteAssets,localize} from '../skills/duplicate-site-skills/v2/scripts/localize-siteone-assets.mjs';

test('origin-scoped asset rewrite leaves all external sites and page links untouched',()=>{
 const s='https://www.rapiddirect.com/wp-content/a.webp https://cdn.example/a.webp https://www.rapiddirect.com/services/ http://www.rapiddirect.com/wp-content/a.css';
 const r=rewriteAssets(s,'https://www.rapiddirect.com/');
 assert.equal(r.replaced,2);
 assert.match(r.text,/\/wp-content\/a.webp/);
 assert.match(r.text,/\/wp-content\/a.css/);
 assert.match(r.text,/https:\/\/cdn.example/);
 assert.match(r.text,/https:\/\/www.rapiddirect.com\/services\//);
});
test('localize is dry-run by default and writes reversible backups on explicit apply',()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'siteone-v2-'));
 try {
  const mirror=path.join(dir,'mirror');fs.mkdirSync(mirror);
  const html=path.join(mirror,'index.html');const before='<img src="https://www.rapiddirect.com/wp-content/logo.svg">';
  fs.writeFileSync(html,before);
  const mf=path.join(dir,'pilot.json');
  fs.writeFileSync(mf,JSON.stringify({
   schema_version:2,source:{origin:'https://www.rapiddirect.com/'},
   rights:{owner_attested:true},execution:{scope:'PILOT_SAMPLES',enable_bulk:false}}));
  assert.equal(localize({workspace:dir,manifest:mf}).status,'DRY_RUN');
  assert.equal(fs.readFileSync(html,'utf8'),before);
  const result=localize({workspace:dir,manifest:mf,apply:true});
  assert.equal(result.changed_files,1);
  assert.equal(result.rewritten_asset_refs,1);
  assert.match(fs.readFileSync(html,'utf8'),/src="\/wp-content\/logo.svg"/);
  assert.equal(fs.readFileSync(path.join(dir,'pre-localize','index.html'),'utf8'),before);
  assert.equal(localize({workspace:dir,manifest:mf,apply:true}).changed_files,0);
 }finally{fs.rmSync(dir,{recursive:true,force:true});}
});
