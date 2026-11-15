import importlib.util
from pathlib import Path
import unittest

ROOT=Path(__file__).resolve().parents[1]
SPEC=importlib.util.spec_from_file_location("byl_es_languagetool_local",ROOT/"scripts"/"byl-es-languagetool-local.py")
M=importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(M)


class TestLocalLanguageTool(unittest.TestCase):
    def test_accepts_only_local_server(self):
        self.assertEqual(M.safe_endpoint("http://127.0.0.1:8010/v2/check"),
                         "http://127.0.0.1:8010/v2/check")
        self.assertEqual(M.safe_endpoint("http://localhost:8010/v2/check"),
                         "http://localhost:8010/v2/check")

    def test_public_api_is_forbidden_for_batch_automation(self):
        with self.assertRaises(ValueError):
            M.safe_endpoint("https://api.languagetool.org/v2/check")

    def test_network_redirection_and_credentials_are_forbidden(self):
        for url in ["http://user:pass@127.0.0.1:8010/v2/check",
                    "http://example.com:8010/v2/check",
                    "http://127.0.0.1:8010/v2/check?unsafe=1",
                    "http://127.0.0.1:8010/admin",
                    "http://127.0.0.1/v2/check"]:
            with self.subTest(url=url), self.assertRaises(ValueError):
                M.safe_endpoint(url)


if __name__ == "__main__":
    unittest.main()
