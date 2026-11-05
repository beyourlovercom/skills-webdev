"""Synthetic tests for local WordPress theme inspector; no websites or credentials."""
import importlib.util,json,pathlib,tempfile,unittest
HERE=pathlib.Path(__file__).parent
SCRIPT=HERE/"inspect-local-wp-theme.py"
if not SCRIPT.is_file():
 SCRIPT=HERE.parent/"skills"/"duplicate-site-skills"/"v2"/"scripts"/"inspect-local-wp-theme.py"
spec=importlib.util.spec_from_file_location("wp_local_audit",SCRIPT)
m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
class LocalAuditTests(unittest.TestCase):
 def setUp(self):
  self.tmp=tempfile.TemporaryDirectory()
  self.addCleanup(self.tmp.cleanup)
  self.root=pathlib.Path(self.tmp.name)
  (self.root/"assets"/"dist").mkdir(parents=True)
  (self.root/"style.css").write_text("/* local fixture */",encoding="utf-8")
  (self.root/"assets"/"dist"/"style.min.css").write_text("body{}",encoding="utf-8")
  (self.root/"assets"/"manifest.json").write_text(json.dumps({"style.css":"assets/dist/style.min.css"}),encoding="utf-8")
  (self.root/"functions.php").write_text("<?php function harmless_example() {};",encoding="utf-8")
  (self.root/"home-config.json").write_text('{"items":[]}',encoding="utf-8")
 def test_valid_fixture(self):
  d=m.scan(self.root)
  self.assertEqual(d["status"],"STATIC_PASS")
  self.assertEqual(d["manifest"]["existing"],1)
  self.assertEqual(d["json"]["home-config.json"],"PASS")
 def test_missing_compiled_asset_fails(self):
  (self.root/"assets"/"dist"/"style.min.css").unlink()
  d=m.scan(self.root)
  self.assertEqual(d["status"],"FAIL")
  self.assertIn("FAIL_MANIFEST_MISSING_PAIR",d["findings"])
 def test_path_escape_is_blocked(self):
  (self.root/"assets"/"manifest.json").write_text(json.dumps({"../../elsewhere.css":"assets/dist/style.min.css"}),encoding="utf-8")
  with self.assertRaisesRegex(ValueError,"traversal"):
   m.scan(self.root)
 def test_remote_network_rejected(self):
  with self.assertRaisesRegex(ValueError,"Only explicit localhost"):
   m.scan(self.root,"https://example.com",["/"])
 def test_json_error_is_blocked(self):
  (self.root/"home-config.json").write_text('{"oops":,}',encoding="utf-8")
  d=m.scan(self.root)
  self.assertEqual(d["status"],"FAIL")
  self.assertIn("FAIL_JSON",d["findings"])
 def test_unbounded_product_query_report_only(self):
  (self.root/"functions.php").write_text("<?php wc_get_products(['limit'=>-1]);",encoding="utf-8")
  d=m.scan(self.root)
  self.assertEqual(d["status"],"OPEN")
  self.assertIn("REVIEW_UNBOUNDED_PRODUCT_QUERY",d["findings"])
 def test_external_redirect_is_blocked(self):
  guard=m.LocalRedirectGuard()
  with self.assertRaisesRegex(ValueError,"External redirect"):
   guard.redirect_request(None,None,302,"Found",{},"https://example.com/")

if __name__=="__main__":unittest.main(verbosity=2)