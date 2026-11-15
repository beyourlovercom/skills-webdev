import importlib.machinery
from pathlib import Path
import unittest

S=Path(__file__).resolve().parents[1]/"scripts"
F=importlib.machinery.SourceFileLoader("byl_es_fidelity_qa",str(S/"byl-es-fidelity-qa.py")).load_module()
L=importlib.machinery.SourceFileLoader("byl_es_linguistic_qa",str(S/"byl-es-linguistic-qa.py")).load_module()


def packet(a,b,terms=None):
    return {"post_id":1,"source_hash":"fixed-dev-hash",
            "en_html":"<p>"+a+"</p>","es_html":"<p>"+b+"</p>",
            "preserve_terms":terms or [],"www_writes":0,"google_calls":0}

class TestFidelityQA(unittest.TestCase):
    def test_decimal_localization_is_not_mismatch(self):
        out=F.findings_for(packet("Approximately 5.5 kg was recorded.",
                                  "Se registraron aproximadamente 5,5 kg."))
        self.assertNotIn("NUMBER_MISSING",out["findings_by_kind"])

    def test_number_deleted_is_high_priority_for_review(self):
        out=F.findings_for(packet("A 45 °C temperature limit needs verification.",
                                  "Es necesario revisar el límite de temperatura."))
        self.assertEqual(out["findings_by_kind"].get("NUMBER_MISSING"),1)
        self.assertFalse(out["fidelity_certified"])

    def test_product_names_not_translated(self):
        out=F.findings_for(packet("The BeYourLover Skull Man requires cleaning.",
                                  "Este modelo requiere limpieza.",["Skull Man"]))
        self.assertEqual(out["findings_by_kind"].get("PROTECTED_NAME_MISSING"),2)

    def test_source_negation_lost_is_proposal_not_certainty(self):
        out=F.findings_for(packet("This device does not guarantee any medical outcomes.",
                                  "Este aparato proporciona resultados médicos."))
        self.assertEqual(out["findings_by_kind"].get("NEGATION_MAY_BE_LOST"),1)
        self.assertEqual(out["reviewer_decision"],"INDEPENDENT_REVIEW_REQUIRED")

    def test_bad_new_guarantee_detected(self):
        out=F.findings_for(packet("It may improve comfort for some people.",
                                  "Este producto garantiza comodidad total."))
        self.assertEqual(out["findings_by_kind"].get("NEW_STRONG_PROMISE"),1)

    def test_negated_guarantee_is_not_bad_promise(self):
        out=F.findings_for(packet("An accessory may help some people feel comfortable.",
                                  "El accesorio no garantiza la comodidad de todas las personas."))
        self.assertNotIn("NEW_STRONG_PROMISE",out["findings_by_kind"])

    def test_required_terminology_is_reviewed(self):
        t=[{"source":"flared base","es":["base ensanchada"],"importance":"P0_REVIEW"}]
        out=F.findings_for(packet("A flared base is required for anal toys.",
                                  "Un extremo redondeado es necesario."),t)
        self.assertEqual(out["findings_by_kind"].get("TERM_REVIEW"),1)
        self.assertFalse(out["fidelity_certified"])

    def test_actual_inline_markup_preserves_spacing_for_grammar(self):
        text=L.rendered_block_texts(
            '<p>Escoge <a href="/x">un modelo</a>, y revisa la ficha.</p>'
        )[0]
        self.assertEqual(text,"Escoge un modelo, y revisa la ficha.")

    def test_batching_preserves_order_and_bounds(self):
        x=list(L.batches(["Esta es una frase suficientemente larga.",
                         "Otra frase un poco más extensa para la prueba."],200))
        self.assertEqual(len(x),1)
        self.assertEqual([i for i,_ in x[0]],[0,1])

    def test_linguistic_never_evaluates_qa95(self):
        # No network call; verify before the engine starts.
        with self.assertRaisesRegex(ValueError,"verified Dev"):
            L.review(packet("One paragraph is plain text.","Un párrafo está traducido."))


if __name__=="__main__":
    unittest.main()
