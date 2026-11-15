import importlib.machinery
import copy
from pathlib import Path
import unittest

SCRIPT=Path(__file__).resolve().parents[1]/"scripts"/"byl-es-r4-compare.py"
R4=importlib.machinery.SourceFileLoader("byl_es_r4_comparison",str(SCRIPT)).load_module()

def fixture():
    return {
        "post_id":99999,"source_hash":"sha256-fixture-only",
        "en_html":(
            "<p>The BeYourLover device is described for careful use.</p>"
            "<p>This tested model reports 14 settings in the brochure.</p>"
            '<p>Review <a href="/source">this helpful guide</a> before using the device.</p>'),
        "es_html":(
            "<p>El dispositivo BeYourLover se presenta para un uso cuidadoso.</p>"
            "<p>El modelo evaluado indica 14 ajustes en el folleto.</p>"
            '<p>Revisa <a href="/source">esta guía</a> antes de utilizar el equipo.</p>'),
        "dictionary":[],"preserve_terms":["BeYourLover"],
        "snapshot_type":"DEV_READ_ONLY_RENDER",
        "www_writes":0,"google_calls":0,
    }

class TestR4HonestOfflineComparison(unittest.TestCase):
    def test_mutations_never_change_input(self):
        s=fixture()
        before=copy.deepcopy(s)
        for _,_,f in R4.CHALLENGES:
            f(s)
        self.assertEqual(s,before)

    def test_r4_synthetic_faults_detected_with_report_not_release(self):
        original=fixture()
        old={"post_id":99999,"source_sha256":"sha256-fixture-only",
             "coverage_pct":99,"p0_state":"CLEAR",
             "dev_only":True,"www_writes":0}
        result=R4.evaluate(original,old,[])
        detected=[x for x in result["cases"] if x["result"]=="DETECTED"]
        self.assertGreaterEqual(len(detected),4)
        self.assertEqual(result["scope"],"LOCAL_ONLY_SYNTHETIC_MUTATIONS")
        self.assertFalse(result["full_old_qa95_end_to_end_tested"])
        self.assertFalse(result["independent_human_blind_review"])
        self.assertFalse(result["semantic_fidelity_certified"])
        self.assertEqual(result["www_writes"],0)

    def test_old_qa95_gate_hash_mismatch_fail_closed(self):
        s=fixture()
        old={"post_id":99999,"source_sha256":"wrong",
             "coverage_pct":99,"p0_state":"CLEAR",
             "dev_only":True,"www_writes":0}
        with self.assertRaisesRegex(ValueError,"source hash"):
            R4.evaluate(s,old,[])

    def test_not_credit_non_applicable_challenges(self):
        original=fixture()
        original["en_html"]="<p>A simple paragraph.</p>"
        original["es_html"]="<p>Un párrafo sencillo.</p>"
        old={"post_id":99999,"source_sha256":"sha256-fixture-only",
             "coverage_pct":99,"p0_state":"CLEAR","dev_only":True,"www_writes":0}
        result=R4.evaluate(original,old,[])
        lookup={x["case"]:x["result"] for x in result["cases"]}
        self.assertEqual(lookup["brand_corruption"],"NOT_APPLICABLE")
        self.assertEqual(lookup["numeric_omission"],"NOT_APPLICABLE")


if __name__=="__main__":
    unittest.main()
