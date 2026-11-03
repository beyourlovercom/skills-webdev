import importlib.util
import pathlib
import unittest

SCRIPT=(pathlib.Path(__file__).resolve().parents[1] / "skills" / "duplicate-site-skills" / "v2" / "scripts" / "interaction-canary.py")
spec=importlib.util.spec_from_file_location("interaction_canary_v2",SCRIPT)
mod=importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)

class LocalInteractionGateTests(unittest.TestCase):
    def test_scope_stays_on_three_pages(self):
        self.assertEqual(list(mod.PAGES),["home","services","cnc"])
        self.assertEqual(mod.VIEWS,{"desktop":(1440,900),"mobile":(375,812)})

    def test_no_external_navigation_or_writes(self):
        self.assertTrue(mod.allowed_request("http://127.0.0.1:8766/snapshots/home.html","GET"))
        self.assertTrue(mod.allowed_request("http://127.0.0.1:8766/wp-content/uploads/a.webp","HEAD"))
        for url,method in [
            ("http://127.0.0.1:8766/api/quote","POST"),
            ("http://127.0.0.1:8766/wp-json/orders","PATCH"),
            ("http://localhost:8766/","GET"),
            ("https://www.rapiddirect.com/","GET"),
            ("http://127.0.0.1:8765/","GET")
        ]:
            with self.subTest(url=url,method=method):
                self.assertFalse(mod.allowed_request(url,method))

if __name__=="__main__":
    unittest.main()
