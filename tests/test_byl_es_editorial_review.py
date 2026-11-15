import importlib.machinery
import json
from pathlib import Path
import tempfile
import unittest

ROOT=Path(__file__).resolve().parents[1]
S=ROOT/"scripts"
P=importlib.machinery.SourceFileLoader("byl_es_p1_check_tests",str(S/"byl-es-p1-proposal-validate.py")).load_module()
E=importlib.machinery.SourceFileLoader("byl_es_evidence_tests",str(S/"byl-es-editorial-evidence.py")).load_module()
T=importlib.machinery.SourceFileLoader("byl_es_timing_tests",str(S/"byl-es-local-profile.py")).load_module()

def fixture(folder):
    post={"post_id":98765,"source_hash":"fixture-sha","snapshot_type":"DEV_READ_ONLY_RENDER",
          "en_html":"<p>A product <a href=\"/example/\">Brand Example</a> is available today.</p>",
          "es_html":"<p>Un producto <a href=\"/example/\">Marca Ejemplo</a> está disponible hoy.</p>",
          "dictionary":[],"www_writes":0,"google_calls":0}
    path=Path(folder)/"BYL_ES_V2_R1_snapshot_98765_20261115.json"
    path.write_text(json.dumps(post,ensure_ascii=False),encoding="utf-8")
    return post

def proposal(old=None,new=None):
    return {"mode":"OFFLINE_PROPOSALS_ONLY","live_writes_authorized":False,
            "proposals":[{"post_id":98765,"block":0,"source_sha256":"fixture-sha",
                          "replacements":[{"find":old or "Marca Ejemplo",
                                            "replace":new or "Brand Example"}]}]}

class TestEditorialEvidenceIntegrity(unittest.TestCase):
    def test_label_inventory_is_nonblind_and_has_no_release_override(self):
        j=json.loads((ROOT/"docs"/"byl-es-editorial-v2"/"editorial-adjudication-20261115.json").read_text(encoding="utf-8"))
        self.assertTrue(j["not_independent_human_blind"])
        self.assertFalse(j["qa95_release_override"])
        self.assertEqual(len(j["labels"]),19)
        self.assertTrue(all((a["post_id"],a["block"]) in E.ANCHORS for a in j["labels"]))

    def test_fail_closed_on_unsafe_label_claim(self):
        with self.assertRaisesRegex(ValueError,"not a blind"):
            E.audit({"not_independent_human_blind":False,"labels":[]},Path("."))


class TestP1ProposalDryRun(unittest.TestCase):
    def test_substitution_keeps_links_and_tags(self):
        with tempfile.TemporaryDirectory() as path:
            fixture(path)
            r=P.check_proposals(proposal(),path)
            self.assertEqual(r["proposals_checked"],1)
            self.assertEqual(r["live_edits_performed"],0)
            self.assertFalse(r["edits_approved_for_release"])

    def test_does_not_allow_href_change(self):
        with tempfile.TemporaryDirectory() as path:
            fixture(path)
            p=proposal('href="/example/"','href="/wrong/"')
            with self.assertRaisesRegex(ValueError,"HTML structure / URLs changed"):
                P.check_proposals(p,path)

    def test_source_hash_mismatch_rejected(self):
        with tempfile.TemporaryDirectory() as path:
            fixture(path)
            p=proposal()
            p["proposals"][0]["source_sha256"]="wrong"
            with self.assertRaisesRegex(ValueError,"source hash mismatch"):
                P.check_proposals(p,path)

    def test_duplicate_or_missing_target_rejected(self):
        with tempfile.TemporaryDirectory() as path:
            fixture(path)
            with self.assertRaisesRegex(ValueError,"non-unique"):
                P.check_proposals(proposal("not-present","Brand"),path)

    def test_writes_never_authorized_by_proposal_file(self):
        with tempfile.TemporaryDirectory() as path:
            fixture(path)
            p=proposal()
            p["live_writes_authorized"]=True
            with self.assertRaisesRegex(ValueError,"safe offline"):
                P.check_proposals(p,path)


class TestTimingGuard(unittest.TestCase):
    def test_rejects_excessive_repeat(self):
        with self.assertRaisesRegex(ValueError,"repeat"):
            T.run(".", "none.json", [], False, repeat=100)


if __name__=="__main__":
    unittest.main()
