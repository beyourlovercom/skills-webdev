import importlib.util
import json
from pathlib import Path
import tempfile
import unittest

SCRIPT=Path(__file__).resolve().parents[1]/"skills"/"duplicate-site-skills"/"v2"/"scripts"/"template-data-map.py"
spec=importlib.util.spec_from_file_location("v2_template_data_map",SCRIPT)
mapping=importlib.util.module_from_spec(spec)
spec.loader.exec_module(mapping)

HTML='''<!doctype html><html><head><title>Original Title</title>
<meta name="description" content="Original description"></head>
<body><main><h1 class="hero">Custom <span>Steel Parts</span></h1>
<p class="intro">Make parts &amp; ship.</p><h2>Services</h2>
<a href="/services/">CNC Machining</a>
<img src="/wp-content/uploads/original.webp" alt="CNC part">
</main><script>const msg="<h1>NOT CONTENT</h1>";</script></body></html>'''

class MappingTests(unittest.TestCase):
    def setUp(self):
        self.temp=tempfile.TemporaryDirectory(prefix="v2-map-")
        self.root=Path(self.temp.name)
        self.mirror=self.root/"mirror"
        self.mirror.mkdir()
        self.file=self.mirror/"index.html"
        self.file.write_text(HTML,encoding="utf-8")
        self.scratch=self.root/"uat"/"data-mapping-smoke"
        self.scratch.mkdir(parents=True)
        self.ledger={
            "project_id":"rapiddirect-v2-pilot",
            "bulk_enabled":False,"production_writes":False,
            "templates":[{
                "sample_id":"home",
                "template_id":"shared-shell","representative_route":"/",
                "representative_local_file":str(self.file),
                "representative_html_sha256":mapping.digest(self.file.read_bytes()),
                "owner_visual_pass":True
            }]
        }

    def tearDown(self):
        self.temp.cleanup()

    def test_inspect_captures_text_image_link_and_meta_without_source_changes(self):
        data=mapping.inspect(self.file,"home",self.ledger)
        ids={slot["id"] for slot in data["slots"]}
        for slot in ("title:0:text:0","h1:0:text:0","h1:0:text:1",
                     "p:0:text:0","h2:0:text:0",
                     "img:0:attr:src","img:0:attr:alt","a:0:attr:href",
                     "meta:0:attr:content"):
            self.assertIn(slot,ids)
        self.assertFalse(data["is_generalized_template"])
        self.assertFalse(data["batch_authorized"])
        self.assertEqual(self.file.read_text(encoding="utf-8"),HTML)

    def test_safe_simulated_data_updates_preserve_html_structure_and_source(self):
        data=mapping.inspect(self.file,"home",self.ledger)
        result=mapping.render(self.file,data,{
            "title:0:text:0":"Updated Title",
            "h1:0:text:1":"Aluminium Parts",
            "img:0:attr:src":"/wp-content/uploads/new.webp",
            "img:0:attr:alt":"Machined part",
            "a:0:attr:href":"/services/cnc-machining/"
        })
        self.assertIn("<title>Updated Title</title>",result)
        self.assertIn('<h1 class="hero">Custom <span>Aluminium Parts</span></h1>',result)
        self.assertIn('<img src="/wp-content/uploads/new.webp" alt="Machined part">',result)
        self.assertIn('href="/services/cnc-machining/"',result)
        self.assertIn('const msg="<h1>NOT CONTENT</h1>";',result)
        self.assertEqual(self.file.read_text(encoding="utf-8"),HTML)
        self.assertEqual(mapping.extract_slots(result)[1],data["structure_sha256"])

    def test_markup_escape_does_not_inject_script(self):
        data=mapping.inspect(self.file,"home",self.ledger)
        result=mapping.render(self.file,data,{"h2:0:text:0":"<script>alert(1)</script> & More"})
        self.assertIn("&lt;script&gt;alert(1)&lt;/script&gt; &amp; More",result)
        self.assertNotIn("<h2><script>alert(1)</script>",result)

    def test_bad_reference_hash_and_unknown_fields_fail_closed(self):
        data=mapping.inspect(self.file,"home",self.ledger)
        self.file.write_text(HTML+"<!-- local drift -->",encoding="utf-8")
        with self.assertRaisesRegex(ValueError,"SOURCE_SHA_DRIFT"):
            mapping.render(self.file,data,{"h2:0:text:0":"X"})
        self.file.write_text(HTML,encoding="utf-8")
        with self.assertRaisesRegex(ValueError,"unknown slot"):
            mapping.render(self.file,data,{"h2:123:text:0":"X"})

    def test_out_of_scope_html_and_unapproved_user_refused(self):
        self.ledger["templates"][0]["owner_visual_pass"]=False
        with self.assertRaisesRegex(ValueError,"approval missing"):
            mapping.inspect(self.file,"home",self.ledger)
        self.ledger["templates"][0]["owner_visual_pass"]=True
        outsider=self.root/"other.html"
        outsider.write_text(HTML,encoding="utf-8")
        with self.assertRaisesRegex(ValueError,"not the approved"):
            mapping.inspect(outsider,"home",self.ledger)
        with self.assertRaisesRegex(ValueError,"outside designated private scratch"):
            mapping.assert_scratch_output(self.mirror/"replacement.html",self.scratch)

    def test_url_replacements_are_local_only(self):
        data=mapping.inspect(self.file,"home",self.ledger)
        for bad in ("https://evil.example/","//evil.example/","/../secret","/wp-content/../../secret"):
            with self.subTest(url=bad):
                with self.assertRaisesRegex(ValueError,"external/unsafe"):
                    mapping.render(self.file,data,{"img:0:attr:src":bad})
        with self.assertRaisesRegex(ValueError,"media path"):
            mapping.render(self.file,data,{"img:0:attr:src":"/api/quote"})

if __name__=="__main__":
    unittest.main()
