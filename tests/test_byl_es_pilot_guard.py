from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]
PILOT = ROOT / "scripts" / "byl-es-dev-snapshot-pilot.php"
RENDER = ROOT / "scripts" / "byl-es-render-qa.py"


class TestPilotFailClosed(unittest.TestCase):
    def test_dev_guards_and_private_path_required(self):
        text = PILOT.read_text(encoding="utf-8")
        for phrase in ("https://dev.beyourlover.com", "blog_public",
                       "byl_trp_seo_gate_enabled", "BYL_ES_V2_PRIVATE_DIR",
                       "byl_trp_source_hash", "byl_trp_post_review",
                       "STOP_SOURCE_SHA_DRIFT"):
            self.assertIn(phrase, text)
        self.assertNotIn("/home/u247343654/", text)  # public repo must not leak host path

    def test_no_wordpress_business_writes(self):
        text = PILOT.read_text(encoding="utf-8")
        forbidden = ("wp_update_post(", "wp_insert_post(", "$wpdb->update(",
                     "$wpdb->insert(", "update_option(", "wp_delete_post(")
        for phrase in forbidden:
            self.assertNotIn(phrase, text)
        self.assertIn("file_put_contents($filename", text)  # private audit output only

    def test_qa_never_claims_to_release_articles(self):
        text = RENDER.read_text(encoding="utf-8")
        self.assertIn('"qa95_release": "NOT_EVALUATED"', text)
        self.assertIn('"independent_semantic_review": "REQUIRED"', text)
        self.assertIn('"www_writes": 0', text)
        self.assertIn('"paid_google_calls": 0', text)


if __name__ == "__main__":
    unittest.main()
