import importlib.machinery
import copy
import json
from pathlib import Path
import unittest

ROOT=Path(__file__).resolve().parents[1]
S=ROOT/"scripts"
def load(filename,tag):
    return importlib.machinery.SourceFileLoader(tag,str(S/filename)).load_module()

CORPUS=load("byl-es-r6-sampled-corpus.py","byl_r6_corpus_test")
EDIT=load("byl-es-r6-review-edits.py","byl_r6_edits_test")
EVAL=load("byl-es-r6-evaluate-sample.py","byl_r6_eval_test")
FACT=load("byl-es-r6-fact-markers.py","byl_r6_fact_test")
BLIND=load("byl-es-r6-blind-packet.py","byl_r6_blind_test")
LT=load("byl-es-r6-lt-domain-review.py","byl_r6_lt_test")

IDX=[0,8,9,12,13,19,24,33,39,40,44,51,58,60,66,69,71,76,79,81,89,91,94]

def inputs():
    blocks=[f"<p>Original English passage with source identifier {i}.</p>" for i in range(99)]
    raw="\n".join(blocks)
    source={"post_id":37413,"source_sha256":CORPUS.SHA,
            "site_scope":"DEV_ONLY","readonly":True,"www_writes":0,"paid_google_calls":0,
            "raw_html":raw,"word_count":2287,"title":"A real Dev article"}
    first={"post_id":37413,"source_sha256":CORPUS.SHA,
           "translation_es_by_index":{str(i):f"Este es un párrafo de prueba traducido, número {i}, para el experimento." for i in IDX},
           "title_es":"Título de prueba", "origin":"offline fixture"}
    return source,first

def sample():
    a,b=inputs()
    return CORPUS.assemble(a,b,{})

def edits():
    return {"post_id":37413,"source_sha256":CORPUS.SHA,
            "editor":"same_assistant_not_independent",
            "source_scope":"DEV_ONLY_OFFLINE","website_writes":0,
            "title_es":"Título corregido",
            "edited_blocks":{str(i):f"Versión nueva del párrafo {i}, para comparar dos opciones en español."
                             for i in EDITED}}

EDITED=[8,13,19,24,58,76,81,89,94]


class R6Corpus(unittest.TestCase):
    def test_sample_has_true_short_scope(self):
        s=sample()
        self.assertEqual(s["sampled_block_count"],23)
        self.assertEqual(s["source_block_total"],99)
        self.assertEqual(s["completeness"],"SAMPLED_NOT_FULL_ARTICLE")
        self.assertTrue(s["no_legacy_r9"])
        self.assertEqual(s["www_writes"],0)

    def test_source_sha_mismatch_fails_closed(self):
        a,b=inputs();b["source_sha256"]="wrong"
        with self.assertRaisesRegex(ValueError,"source SHA drift"):
            CORPUS.assemble(a,b,{})

    def test_inline_markup_and_href_guard(self):
        a,b=inputs()
        a["raw_html"]=a["raw_html"].replace(
            "<p>Original English passage with source identifier 8.</p>",
            '<p>Original <a href="/real">English passage</a> with source identifier 8.</p>')
        with self.assertRaisesRegex(ValueError,"markup or link"):
            CORPUS.assemble(a,b,{})
        fixed={'8':'Original <a href="/real">un texto traducido</a> bien redactado.'}
        self.assertEqual(CORPUS.assemble(a,b,fixed)["sampled_block_count"],23)


class R6EditsAndBlind(unittest.TestCase):
    def test_edits_remain_offline_and_preserve_original_sample(self):
        base=sample();orig=copy.deepcopy(base)
        changed=EDIT.apply_changes(base,edits())
        self.assertEqual(base,orig)
        self.assertEqual(changed["changes_count"],9)
        self.assertFalse(changed["independent_human_review"])
        self.assertEqual(changed["website_writes"],0)
        self.assertEqual(changed["en_html"],base["en_html"])

    def test_missing_or_extra_edits_fail(self):
        d=edits();d["edited_blocks"].pop("8")
        with self.assertRaisesRegex(ValueError,"exactly 9"):
            EDIT.apply_changes(sample(),d)

    def test_invalid_target_markup_changes_rejected(self):
        d=edits()
        d["edited_blocks"]["8"]='<a href="/changed">NO AUTORIZADO</a>'
        with self.assertRaisesRegex(ValueError,"unsafe HTML"):
            EDIT.apply_changes(sample(),d)

    def test_blind_packet_has_hidden_key_and_human_pending(self):
        base=sample()
        changed=EDIT.apply_changes(base,edits())
        packet,key=BLIND.build(base,changed)
        self.assertEqual(packet["review_cases"],14)
        self.assertFalse(packet["independent_reviewer_completed"])
        self.assertFalse(packet["blind_key_in_packet"])
        self.assertNotIn("V2_SECOND_PASS",json.dumps(packet))
        self.assertEqual(len(key["key"]),14)
        self.assertEqual(sum(i["control_identical"] for i in key["key"]),5)
        self.assertEqual({x["case_id"] for x in packet["cases"]},
                         {x["case_id"] for x in key["key"]})
        self.assertFalse(any(x["review_dimensions"]["X_naturalness_1to5"] is not None for x in packet["cases"]))

    def test_blind_rejects_different_english_source(self):
        a=sample();b=EDIT.apply_changes(a,edits())
        b["en_html"]=b["en_html"].replace("English","Changed")
        with self.assertRaisesRegex(ValueError,"source drift"):
            BLIND.build(a,b)


class R6LocalChecks(unittest.TestCase):
    def test_old_style_proxy_cannot_evaluate_legacy_r9(self):
        s=sample()
        v=EVAL.machine_report(s,[],lt=False)
        self.assertFalse(v["legacy_r9_executed"])
        self.assertEqual(v["legacy_p0_gate"],"SOURCE_P0_REVIEW_REQUIRED")
        self.assertIsNone(v["manual_editor_minutes"])
        self.assertEqual(v["coverage_proxy_percent"],100)

    def test_fact_marker_cases_are_source_grounded(self):
        self.assertEqual(len(FACT.CASES),20)
        self.assertTrue(all(idx in IDX for idx,_,_ in FACT.CASES))
        with self.assertRaisesRegex(ValueError,"not an immutable"):
            FACT.check({"post_id":0,"snapshot_type":"bad"})

    def test_anatomical_ano_is_preserved(self):
        status,_=LT.classify("ANO","ano","Your butthole needs care.","El ano no produce lubricación.")
        self.assertEqual(status,"DOMAIN_FALSE_POSITIVE")
        status,_=LT.classify("ANO","ano","The document was created last night.","En este ano.")
        self.assertEqual(status,"HUMAN_REVIEW")

    def test_plug_term_only_suppressed_with_context(self):
        status,_=LT.classify("MORFOLOGIK_RULE_ES","plug","Anal helpers for you.","Prueba un plug anal.")
        self.assertEqual(status,"DOMAIN_FALSE_POSITIVE")
        status,_=LT.classify("MORFOLOGIK_RULE_ES","plug","A tractor guide.","Utiliza el plug industrial.")
        self.assertEqual(status,"HUMAN_REVIEW")
        status,_=LT.classify("SPANISH_WORD_REPEAT_BEGINNING_RULE","Antes","Before","Antes de empezar")
        self.assertEqual(status,"STYLE_NONBLOCKING")


if __name__=="__main__":
    unittest.main()
