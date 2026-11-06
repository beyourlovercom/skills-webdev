"""Synthetic fail-closed final CSS/JS packaging policy tests. Never approve a real site."""
import importlib.util,pathlib,unittest,copy
HERE=pathlib.Path(__file__).parent
SRC=HERE.parent/"skills"/"duplicate-site-skills"/"v2"/"scripts"/"wp-final-package-gate.py"
if not SRC.is_file():SRC=HERE/"wp-final-package-gate.py"
spec=importlib.util.spec_from_file_location("wp_final_gate",SRC)
g=importlib.util.module_from_spec(spec);spec.loader.exec_module(g)
def evidence():
 owner_ref="synthetic-owned-approved-reference-2026-only"
 site={"schema":"wp-site-completion/v1","build_policy":"ONE_FINAL_CSS_JS_BATCH_AFTER_ALL_PAGES",
       "site_complete":True,"scope_inventory_complete":True,"expected_route_count":1,
       "routes":[{"path":"/","state":"OWNER_VISUAL_PASS","owner_evidence_ref":owner_ref,"visual_similarity":0.99}],
       "owner_acceptance":{"status":"PASS","evidence_ref":owner_ref},"expected_reference_views":1}
 contract={"schema":"wordpress-template-data-contract/v1","allow_batch":False,"routes":[{"path":"/"}]}
 browser={"total":2,"passed":2,"site_writes":0,"owner_visual_pass":False,
          "views":[{"h1_count":1,"main_text_chars":300,"result":"PASS"},{"h1_count":1,"main_text_chars":300,"result":"PASS"}]}
 canary={"total":2,"passed":2,"site_writes":0,"published":False,"manifest_entries":4}
 reference={"pairs":[{"comparable":True,"diff":{"rgb_similarity":0.991}}],"owner_approved":True}
 return site,contract,browser,canary,reference
class FinalGateTests(unittest.TestCase):
 def test_synthetic_all_gates(self):
  self.assertEqual(g.evaluate(*evidence())["status"],"FINAL_CSS_JS_BATCH_RELEASE_ALLOWED_BY_EVIDENCE_ONLY")
 def test_site_not_complete(self):
  x=list(copy.deepcopy(evidence()));x[0]["site_complete"]=False
  self.assertIn("SITE_NOT_COMPLETE",g.evaluate(*x)["reasons"])
 def test_no_owner_final_approval(self):
  x=list(copy.deepcopy(evidence()));x[0]["owner_acceptance"]["status"]="PENDING"
  self.assertIn("OWNER_FINAL_ACCEPTANCE_MISSING",g.evaluate(*x)["reasons"])
 def test_source_visual_below_threshold(self):
  x=list(copy.deepcopy(evidence()));x[4]["pairs"][0]["diff"]["rgb_similarity"]=0.795
  self.assertIn("REFERENCE_VISUAL_BELOW_THRESHOLD_OR_UNAVAILABLE",g.evaluate(*x)["reasons"])
 def test_missing_route_inventory(self):
  x=list(copy.deepcopy(evidence()));x[0]["scope_inventory_complete"]=False
  self.assertIn("SCOPE_INVENTORY_NOT_COMPLETE",g.evaluate(*x)["reasons"])
 def test_h1_missing(self):
  x=list(copy.deepcopy(evidence()));x[2]["views"][0]["h1_count"]=0
  self.assertIn("CONTENT_SEMANTIC_OR_PAGE_INTEGRITY_OPEN",g.evaluate(*x)["reasons"])
 def test_canary_not_complete(self):
  x=list(copy.deepcopy(evidence()));x[3]["passed"]=1
  self.assertIn("STAGED_BUILD_CANARY_NOT_COMPLETE",g.evaluate(*x)["reasons"])
 def test_unsafe_route_rejected(self):
  x=list(copy.deepcopy(evidence()));x[0]["routes"][0]["path"]="//outside"
  self.assertIn("INVENTORY_ROUTE_DUPLICATE_OR_UNSAFE",g.evaluate(*x)["reasons"])
if __name__=="__main__":unittest.main(verbosity=2)