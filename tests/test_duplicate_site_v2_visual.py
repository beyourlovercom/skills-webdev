import importlib.util
import pathlib
import unittest

SCRIPT=pathlib.Path(__file__).resolve().parents[1] / "skills" / "duplicate-site-skills" / "v2" / "scripts" / "visual-canary.py"
spec=importlib.util.spec_from_file_location("visual_canary_v2",SCRIPT)
visual=importlib.util.module_from_spec(spec)
spec.loader.exec_module(visual)

class ThreePageCanaryTests(unittest.TestCase):
    def test_source_scope_is_exactly_three_pages(self):
        self.assertEqual(visual.SAMPLES,{
            "home":"/","services":"/services/","cnc":"/services/cnc-machining/"})
        self.assertEqual(visual.SIZES,{"desktop":(1440,900),"mobile":(375,812)})

    def test_same_origin_local_get_only(self):
        self.assertTrue(visual.secure_local_request("http://127.0.0.1:8766/snapshots/home.html","GET"))
        self.assertTrue(visual.secure_local_request("http://127.0.0.1:8766/wp-content/uploads/img.webp","HEAD"))
        for url,method in [
            ("https://www.rapiddirect.com/","GET"),
            ("http://127.0.0.1:8765/","GET"),
            ("http://localhost:8766/","GET"),
            ("http://127.0.0.1:8766/checkout","POST"),
            ("http://127.0.0.1:8766/api/quote","DELETE"),
            ("javascript:alert(1)","GET"),
        ]:
            with self.subTest(url=url,method=method):
                self.assertFalse(visual.secure_local_request(url,method))

    def test_source_is_public_get_only_and_first_party(self):
        self.assertTrue(visual.secure_source_request("https://www.rapiddirect.com/services/","GET"))
        self.assertTrue(visual.secure_source_request("https://static.rapiddirect.com/a.css","HEAD"))
        for url,method in [
            ("https://www.rapiddirect.com/wp-admin/","POST"),
            ("https://www.rapiddirect.com/api/quote","DELETE"),
            ("https://tracker.example.com/pixel","GET"),
            ("http://www.rapiddirect.com/","GET"),
            ("https://not-rapiddirect.com/","GET"),
        ]:
            with self.subTest(url=url,method=method):
                self.assertFalse(visual.secure_source_request(url,method))

    def test_capture_needs_explicit_live_read(self):
        self.assertTrue(visual.SOURCE.startswith("https://"))
        self.assertEqual(visual.LOCAL,"http://127.0.0.1:8766")

if __name__=="__main__":
    unittest.main()
