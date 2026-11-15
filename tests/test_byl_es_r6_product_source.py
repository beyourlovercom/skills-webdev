import importlib.machinery
import copy
from pathlib import Path
import unittest

M=importlib.machinery.SourceFileLoader(
    "byl_es_r6_product_source",str(Path(__file__).resolve().parents[1]/"scripts/byl-es-r6-product-source-check.py")
).load_module()

def sample():
    return {
       "post_id":36354,"source_sha256":M.SOURCE_SHA,
       "readonly":True,"www_writes":0,"paid_google_calls":0,
       "review_snapshot":False,
       "raw_html":("""
        BeYourLover GuiTar PLAYME. The 2mm suction opening.
        Has 10 suction modes and 10 vibration modes.
        Up to 8,000 vibrations per minute and over 8,000 pleasure nerves.
        compatible with BeYourLover’s app and magnetic charge connection.
        before cleaning, separate the body and main unit.
        The main unit is not waterproof.
        Waterproof & Easy Maintenance.
        clitoris.It wraps the around the clitoris.
        GuiTar GuiTar.
        """)
    }

class TestR6ProductSourceHoldout(unittest.TestCase):
    def test_12_real_source_anchors_classified_but_no_fact_confirmation(self):
        x=sample()
        result=M.check(x)
        self.assertEqual(result["matched_anchor_count"],12)
        self.assertEqual(result["protected_names_found"],3)
        self.assertTrue(all(not r["verified_external_fact"] for r in result["anchors"]))
        self.assertFalse(result["source_p0_clear"])
        self.assertFalse(result["ready_for_blind_brand_comparison"])
        self.assertEqual(result["dev_article_writes"],0)
        self.assertEqual(len(result["source_quality_warnings"]),4)

    def test_fail_closed_if_name_or_claim_drift(self):
        x=sample()
        x["raw_html"]=x["raw_html"].replace("PLAYME","PRODUCTNAME")
        with self.assertRaisesRegex(ValueError,"source fact anchor missing"):
            M.check(x)

    def test_reject_if_dev_is_approved_or_scope_wrong(self):
        x=sample()
        x["review_snapshot"]=True
        with self.assertRaisesRegex(ValueError,"wrong Dev source"):
            M.check(x)
        x=sample();x["source_sha256"]="wrong"
        with self.assertRaisesRegex(ValueError,"wrong Dev source"):
            M.check(x)

if __name__=="__main__":
    unittest.main()
