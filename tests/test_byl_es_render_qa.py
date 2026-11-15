import importlib.util
from pathlib import Path
import json
import subprocess
import sys
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[1]
SCRIPT = ROOT / "scripts" / "byl-es-render-qa.py"
spec = importlib.util.spec_from_file_location("byl_es_render_qa", SCRIPT)
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)


def snapshot(en, es, **kwargs):
    return {"post_id": 38305, "en_html": en, "es_html": es,
            "dictionary": [], **kwargs}


class TestRenderAwareQA(unittest.TestCase):
    def test_curly_quote_alias_from_actual_rendered_html(self):
        source = snapshot(
            "<p>It&#8217;s important to check the source.</p>",
            "<p>It&#8217;s important to check the source.</p>",
            dictionary=[{"original": "It's important to check the source.",
                         "translated": "Es importante comprobar la fuente.",
                         "status": 1}],
        )
        result = module.check(source)
        self.assertEqual(result["findings_by_kind"].get("RENDER_KEY_ALIAS"), 1)
        self.assertEqual(result["qa95_release"], "NOT_EVALUATED")
        self.assertEqual(result["www_writes"], 0)

    def test_alias_already_localized_must_not_be_reported(self):
        source = snapshot(
            "<p>It&#8217;s important to check the source.</p>",
            "<p>Es importante comprobar la fuente.</p>",
            dictionary=[{"original": "It's important to check the source.",
                         "translated": "Es importante comprobar la fuente.", "status": 1}],
        )
        result = module.check(source)
        self.assertIsNone(result["findings_by_kind"].get("RENDER_KEY_ALIAS"))

    def test_trailing_slash_canonicalization_is_not_link_change(self):
        result = module.check(snapshot(
            '<p>Read <a href="/sex-toys">the article</a> for further information.</p>',
            '<p>Lee <a href="/sex-toys/">el artículo</a> para obtener información.</p>',
        ))
        self.assertIsNone(result["findings_by_kind"].get("LINK_CHANGED"))
    def test_inline_em_splits_full_dictionary_segment(self):
        en = "<p>If you stumble upon the practice of <em>edging</em> you can read more.</p>"
        es = "<p>Si conoces la práctica del <em>edging</em> puedes leer más.</p>"
        source = snapshot(en, es, packet={"blocks": [
            {"en": "If you stumble upon the practice of edging you can read more."}
        ]}, dictionary=[{"original": "If you stumble upon the practice of edging you can read more.",
                         "translated": "Puedes aprender más.", "status": 1}])
        result = module.check(source)
        # Already translated into Spanish: no actionable English residue.
        self.assertEqual(result["findings_by_kind"].get("DOM_SPLIT", 0), 0)

    def test_untranslated_inline_split_is_still_reported(self):
        en = "<p>If you stumble upon the practice of <em>edging</em> you can read more.</p>"
        source = snapshot(en, en, packet={"blocks": [
            {"en": "If you stumble upon the practice of edging you can read more."}
        ]}, dictionary=[{"original": "If you stumble upon the practice of edging you can read more.",
                         "translated": "Si conoces la práctica puedes leer más.", "status": 1}])
        result = module.check(source)
        self.assertGreaterEqual(result["findings_by_kind"].get("DOM_SPLIT", 0), 1)

    def test_detect_visible_english_after_translation(self):
        src = "<p>This long English sentence was not actually localized.</p>"
        result = module.check(snapshot(src, src))
        self.assertEqual(result["findings_by_kind"].get("VISIBLE_ENGLISH"), 1)
        self.assertIn("P0_REVIEW", [f["severity"] for f in result["findings"]])

    def test_protect_brand_as_entire_node(self):
        result = module.check(snapshot("<p>BeYourLover</p>", "<p>BeYourLover</p>"))
        self.assertEqual(result["findings_count"], 0)

    def test_link_mutation_is_detected(self):
        result = module.check(snapshot(
            '<p>Read <a href="https://example.com/source">the guide</a> for updates.</p>',
            '<p>Lee <a href="https://example.com/other">la guía</a> para ver novedades.</p>',
        ))
        self.assertEqual(result["findings_by_kind"].get("LINK_CHANGED"), 1)

    def test_shortcode_is_not_a_translatepress_segment(self):
        result = module.check(snapshot(
            "<p>[product_card id=\"26657\"]</p><p>Another article to consider.</p>",
            "<p>[product_card id=\"26657\"]</p><p>Otro artículo para considerar.</p>",
        ))
        self.assertEqual(result["en_blocks"], 1)

    def test_seo_metadata_checks(self):
        result = module.check(snapshot(
            "<p>This is an example source paragraph.</p>",
            "<p>Este es un párrafo de ejemplo.</p>",
            seo={"title_es": "A" * 62, "meta_es": "B" * 156,
                 "primary_keyword_es": "deseo sexual"},
        ))
        self.assertEqual(result["findings_by_kind"].get("SEO_LENGTH"), 2)
        self.assertEqual(result["findings_by_kind"].get("SEO_KEYWORD"), 1)

    def test_identical_source_target_does_not_mean_release_pass(self):
        html = "<p>Something in English that must be translated.</p>"
        result = module.check(snapshot(html, html))
        self.assertEqual(result["qa95_release"], "NOT_EVALUATED")

    def test_cli_creates_local_report_only(self):
        src = snapshot("<p>Use some gentle guidance when considering accessories.</p>",
                       "<p>Considera algunas recomendaciones al elegir accesorios.</p>")
        with tempfile.TemporaryDirectory() as tmp:
            file = Path(tmp) / "fixture.json"
            report = Path(tmp) / "report.json"
            file.write_text(json.dumps(src), encoding="utf-8")
            run = subprocess.run([sys.executable, str(SCRIPT), str(file),
                                  "--output", str(report)], capture_output=True, text=True)
            self.assertEqual(run.returncode, 0, run.stderr)
            output = json.loads(report.read_text(encoding="utf-8"))
            self.assertEqual(output["site_scope"], "DEV_ONLY")
            self.assertEqual(output["paid_google_calls"], 0)

    def test_bad_input_fails_closed(self):
        with self.assertRaises(ValueError):
            module.check({"post_id": "wrong", "en_html": "<p>x</p>", "es_html": "<p>y</p>"})

    def test_html_entities_match_readable_text(self):
        self.assertEqual(module.normalized("You&#8217;re here."),
                         module.normalized("You're here."))


if __name__ == "__main__":
    unittest.main()
