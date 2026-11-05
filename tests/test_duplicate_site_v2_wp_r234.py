"""R2/R3 isolated synthetic regressions: no external network or site writes."""
from pathlib import Path
import importlib.util, tempfile, unittest, json
from unittest.mock import patch
HERE=Path(__file__).parent
def load(alias,name):
 p=HERE.parent/"skills"/"duplicate-site-skills"/"v2"/"scripts"/name
 if not p.is_file():p=HERE/name
 spec=importlib.util.spec_from_file_location(alias,p);m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m);return m
r2=load("r2_contract","wp-template-data-contract.py")
r3=load("r3_final","wp-final-build.py")
class FakeHTTP:
 status=200
 def __init__(self,url):self.url=url
 def __enter__(self):return self
 def __exit__(self,*args):return False
 def read(self,n=-1):
  item=self.url.rsplit("/",2)[-2]
  title="Sample "+item
  return ('<!doctype html><html><head><title>'+title+'</title></head><body><h1>'+title+
          '</h1><img src="/assets/'+item+'.png"><a href="#details">Details</a></body></html>').encode()
class FakeOpener:
 def open(self,req,timeout=0):return FakeHTTP(req.full_url)
class WPTests(unittest.TestCase):
 def setUp(self):
  self.temp=tempfile.TemporaryDirectory()
  self.addCleanup(self.temp.cleanup)
  base=Path(self.temp.name);self.theme=base/"wp-content"/"themes"/"sample";self.workspace=base/"_research"
  self.theme.mkdir(parents=True);self.workspace.mkdir()
  for filenames in r2.TEMPLATES.values():
   for filename in filenames:(self.theme/filename).write_text('<?php // fixture '+filename,encoding="utf-8")
  (self.theme/"assets").mkdir()
  (self.theme/"fonts").mkdir()
  (self.theme/"fonts"/"local.woff2").write_bytes(b"local fake font fixture")
  (self.theme/"style.css").write_text('@font-face{src:url(fonts/local.woff2)} .x{color:red}',encoding="utf-8")
  (self.theme/"app.js").write_text('(() => { const a = 1+1; return a; })();',encoding="utf-8")
  (self.theme/"assets"/"manifest.json").write_text(json.dumps({"style.css":"assets/dist/style.fake.min.css","app.js":"assets/dist/app.fake.min.js"}),encoding="utf-8")
 def test_r2_route_kind_validation(self):
  self.assertEqual(r2.route_kind({"path":"/products/alpha/","kind":"product"}),("/products/alpha/","product"))
  with self.assertRaisesRegex(ValueError,"ROUTE_KIND_MISMATCH"):r2.route_kind({"path":"/wp-admin/","kind":"product"})
  with self.assertRaisesRegex(ValueError,"ROUTE_SCOPE_INVALID"):r2.route_kind({"path":"//evil.test","kind":"content"})
 def test_r2_template_frozen_data_distinct(self):
  with patch.object(r2,"build_opener",return_value=FakeOpener()):
   proof=r2.plan(self.theme,"http://fixture.local",[{"path":"/products/item-a/","kind":"product"},{"path":"/products/item-b/","kind":"product"}])
  self.assertEqual(proof["status"],"R2_DATA_CONTRACT_READY_NOT_FROZEN")
  self.assertEqual(proof["groups"][0]["distinct_data_variants"],2)
  self.assertEqual(proof["groups"][0]["routes"],2)
  self.assertFalse(proof["allow_batch"])
  self.assertEqual(proof["routes"][0]["template_sha256"],proof["routes"][1]["template_sha256"])
  self.assertNotEqual(proof["routes"][0]["data_sha256"],proof["routes"][1]["data_sha256"])
 def test_r2_no_remote(self):
  with self.assertRaisesRegex(ValueError,"LOCAL_ORIGIN_REQUIRED"):
   r2.plan(self.theme,"https://shop.example.org",[{"path":"/","kind":"home"}])
  with self.assertRaisesRegex(ValueError,"REMOTE_REDIRECT_BLOCKED"):
   r2.NoRemoteRedirect("fixture.local").redirect_request(None,None,302,"Found",{},"https://shop.example.org/")
 def test_r3_manifest_invalid(self):
  (self.theme/"assets"/"manifest.json").write_text(json.dumps({"../escape.js":"assets/dist/x.js"}),encoding="utf-8")
  with self.assertRaisesRegex(ValueError,"UNSAFE_PATH"):
   r3.recipe(self.theme,self.workspace,"sample-stage")
 def test_r3_plan_is_read_only(self):
  class Args:pass
  a=Args();a.theme=str(self.theme);a.workspace=str(self.workspace);a.build_id="sample-stage";a.execute=False;a.esbuild=None
  proof=r3.build(a)
  self.assertEqual(proof["status"],"DRY_RUN")
  self.assertFalse((self.workspace/"r3-build").exists())
 def test_r3_font_rebase_isolation(self):
  stage=self.workspace/"sandbox";stage.mkdir()
  assets={}
  out=r3.rebase_css("h1{src:url(fonts/local.woff2)}",self.theme,stage,assets)
  self.assertIn("../../fonts/local.woff2",out)
  self.assertEqual(len(assets),1)
  self.assertTrue((stage/"fonts"/"local.woff2").is_file())
  self.assertFalse((self.theme/"assets"/"dist").exists())
 def test_r3_reject_nonexistent_font(self):
  stage=self.workspace/"sandbox";stage.mkdir()
  with self.assertRaisesRegex(ValueError,"CSS_ASSET_MISSING"):
   r3.rebase_css("a{background:url(fonts/not-there.woff2)}",self.theme,stage,{})
if __name__=="__main__":unittest.main(verbosity=2)