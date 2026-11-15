import copy
import importlib.machinery
from pathlib import Path
import unittest

ROOT=Path(__file__).resolve().parents[1]
M=importlib.machinery.SourceFileLoader(
    "byl_es_r6_blind_scoring_tests",str(ROOT/"scripts/byl-es-r6-score-blind.py")
).load_module()

def sample():
    cases=[{"case_id":f"R6-{i:03d}"} for i in range(14)]
    packet={
        "schema_version":"byl-es-v2-r6-blind-editor-packet-v1",
        "post_id":37413,"source_sha256":"fixture_only",
        "blind_key_in_packet":False,
        "independent_reviewer_completed":False,"cases":cases,
    }
    key={
        "schema_version":"byl-es-v2-r6-private-answer-key-v1","private_only":True,
        "key":[{
            "case_id":case["case_id"],
            "X_is":"COMMON_FIRST_PASS" if i%2 else "V2_SECOND_PASS",
            "Y_is":"V2_SECOND_PASS" if i%2 else "COMMON_FIRST_PASS",
            "control_identical":i>=9,
        } for i,case in enumerate(cases)]
    }
    rows=[]
    for i,c in enumerate(cases):
        rows.append({
            "case_id":c["case_id"],
            "X_naturalness":"4","Y_naturalness":"3",
            "X_terms":"4","Y_terms":"3",
            "X_facts":"5","Y_facts":"4",
            "preferred":"TIE" if i>=9 else "X",
            "source_p0":"NO" if i else "YES",
            "evidence_comment":"Synthetic fixture comment; not human judgment"
        })
    metadata={
        "schema_version":"byl-es-v2-r6-independent-review-v1",
        "post_id":37413,
        "reviewer_is_independent":True,"reviewer_saw_answer_key":False,
        "reviewer_label":"TEST_FIXTURE_NOT_A_HUMAN",
        "reviewer_language_qualification":"TEST ONLY",
        "net_review_minutes":15
    }
    return packet,key,rows,metadata

class TestBlindReviewScoring(unittest.TestCase):
    def test_template_stays_unrated(self):
        packet,_,_,_=sample()
        rows=M.template(packet)
        self.assertEqual(len(rows),14)
        self.assertTrue(all(not x["X_naturalness"] for x in rows))
        self.assertNotIn("answer_key",str(rows))

    def test_incomplete_review_is_rejected(self):
        p,k,rows,meta=sample()
        with self.assertRaisesRegex(ValueError,"incomplete"):
            M.validate_review(p,rows[:-1],meta)

    def test_cannot_unblind_review_without_reviewer_declaration(self):
        p,k,rows,meta=sample()
        meta["reviewer_is_independent"]=False
        with self.assertRaisesRegex(ValueError,"reviewer identity"):
            M.validate_review(p,rows,meta)

    def test_refuse_review_if_reviewer_saw_key(self):
        p,k,rows,meta=sample()
        meta["reviewer_saw_answer_key"]=True
        with self.assertRaisesRegex(ValueError,"must not have seen"):
            M.validate_review(p,rows,meta)

    def test_refuse_unrated_or_invalid_factual_scores(self):
        p,k,rows,meta=sample()
        rows[0]["X_facts"]=""
        with self.assertRaisesRegex(ValueError,"score missing"):
            M.validate_review(p,rows,meta)
        rows[0]["X_facts"]="6"
        with self.assertRaisesRegex(ValueError,"score missing"):
            M.validate_review(p,rows,meta)

    def test_allow_matching_na_in_terminology_only(self):
        p,k,rows,meta=sample()
        rows[0]["X_terms"]="NA";rows[0]["Y_terms"]="NA"
        self.assertIsNone(M.validate_review(p,rows,meta)[0]["X_terms"])
        rows[0]["X_terms"]="1"
        with self.assertRaisesRegex(ValueError,"terms NA"):
            M.validate_review(p,rows,meta)

    def test_control_case_detects_bias(self):
        p,k,rows,meta=sample()
        result=M.score(p,rows,meta,k)
        self.assertEqual(result["scored_pairs"],14)
        self.assertEqual(result["unchanged_identical_control_cases"],5)
        self.assertEqual(result["paired_changed_cases"],9)
        self.assertEqual(result["control_score_disagreements"],0)
        self.assertFalse(result["human_score_reliability_warning"])
        self.assertFalse(result["translation_and_revision_time_not_measured"] is False)
        self.assertEqual(result["release_gate"],"NO_RELEASE_AUTHORITY")

    def test_control_disagreement_requires_warning(self):
        p,k,rows,meta=sample()
        rows[13]["preferred"]="X"
        result=M.score(p,rows,meta,k)
        self.assertTrue(result["human_score_reliability_warning"])
        self.assertEqual(result["control_score_disagreements"],1)

    def test_source_p0_kept_separate_from_score(self):
        p,k,rows,meta=sample()
        result=M.score(p,rows,meta,k)
        self.assertEqual(result["source_p0_review"][0]["case_id"],"R6-000")
        self.assertEqual(result["source_p0_review"][0]["judgment"],"YES")
        self.assertEqual(result["www_writes"],0)

    def test_key_mismatch_rejected(self):
        p,k,rows,meta=sample()
        k["key"][0]["case_id"]="WRONG"
        with self.assertRaisesRegex(ValueError,"do not match"):
            M.score(p,rows,meta,k)

if __name__=="__main__":
    unittest.main()
