#!/usr/bin/env python3
"""Audit assistant second-pass editorial labels against exact private Dev snapshots.

Read-only. No network, WordPress mutations, article text export, or API calls.
"""
import argparse
from collections import Counter
from importlib.machinery import SourceFileLoader
import json
from pathlib import Path
import sys

render=SourceFileLoader("byl_es_editorial_label_render",str(Path(__file__).with_name("byl-es-render-qa.py"))).load_module()

ANCHORS={
 (38427,9):("Devil Flower","Flor del Diablo"),
 (38427,21):("Unique Black & Red Design","Diseño único en negro y rojo"),
 (38427,31):("Ugly Tongue","Lengua fea"),
 (38427,33):("6.29-inch","16 cm"),
 (38427,67):("BeYourLover Skull Man","Sé tu amante Hombre calavera"),
 (38427,68):("SKULL MAN","HOMBRE CALAVERA"),
 (38427,87):("BeYourLover","nuestra selección de dildos"),
 (38547,10):("SodaPopCurtis1983","SodaPopCurtis1983"),
 (38547,58):("10–15 minutes","No tengas prisa"),
 (38587,64):("water-based","fórmulas acuosas"),
 (38587,71):("1 to 3 years","fecha de caducidad"),
 (38587,79):("Want to learn more?","¿Quieres seguir leyendo?"),
 (38607,18):("BEYOURLOVER ANGELA","Sé tu amante, Angela"),
 (38607,40):("BeYourLover Wavey","Sé tu amante Ondulante"),
 (38628,12):("360-degree","diez estilos de lamido"),
 (38628,61):("Jessica S.","Jessica S."),
 (38628,63):("BEYOURLOVER HEART","SÉ TU AMANTE CORAZÓN"),
 (38628,89):("never felt like","evitar tirones"),
 (38628,121):("Stephanie I.","Stephanie I."),
}
ALLOWED={"CONFIRMED_EDIT","EDITORIAL_VERIFY","NON_ISSUE"}
def audit(labels,root):
    if labels.get("not_independent_human_blind") is not True:
        raise ValueError("labels must disclose that they are not a blind external human panel")
    items=labels["labels"]
    if len(items)!=len(ANCHORS):
        raise ValueError("expected one label per anchored evidence unit")
    audited=[]
    for label in items:
        id=int(label["post_id"]);index=int(label["block"])
        if label["verdict"] not in ALLOWED:
            raise ValueError("unrecognized adjudication verdict")
        key=(id,index)
        if key not in ANCHORS:
            raise ValueError("unrecognized sample/block")
        file=Path(root)/f"BYL_ES_V2_R1_snapshot_{id}_20261115.json"
        snapshot=json.loads(file.read_text(encoding="utf-8"))
        if snapshot["post_id"]!=id or snapshot["snapshot_type"]!="DEV_READ_ONLY_RENDER":
            raise ValueError("untrusted Dev snapshot")
        if snapshot["www_writes"]!=0 or snapshot["google_calls"]!=0:
            raise ValueError("snapshot has side effects")
        english=render.blocks_from_html(snapshot["en_html"])
        spanish=render.blocks_from_html(snapshot["es_html"])
        if index>=len(english) or index>=len(spanish):
            raise ValueError("block index no longer exists")
        source,target=ANCHORS[key]
        if render.normalized(source) not in render.normalized(english[index]["whole"]):
            raise ValueError(f"source evidence drift {key}")
        if render.normalized(target) not in render.normalized(spanish[index]["whole"]):
            raise ValueError(f"target evidence drift {key}")
        observed=[]
        for prefix in ("R4_revised_render","R4_revised_fidelity","R4_blind_render","R4_blind_fidelity"):
            report=Path(root)/f"BYL_ES_V2_{prefix}_{id}_20261115.json"
            if report.exists():
                data=json.loads(report.read_text(encoding="utf-8"))
                if data["post_id"]==id:
                    observed += [x.get("kind","") for x in data.get("findings",[]) if x.get("block")==index]
        audited.append({"post_id":id,"block":index,"issue":label["issue"],
                        "verdict":label["verdict"],"priority":label["priority"],
                        "auto_findings":list(dict.fromkeys(observed))})
    labels_by=Counter(x["verdict"] for x in audited)
    by_post={}
    for x in audited:
        by_post.setdefault(str(x["post_id"]),Counter())[x["verdict"]]+=1
    return {"schema_version":"byl-es-v2-second-pass-evidence-v1",
            "assistant_review_not_external_human_blind":True,
            "post_count":len(by_post),"labels_verified":len(audited),
            "verdict_counts":dict(labels_by),
            "by_post":{k:dict(v) for k,v in by_post.items()},
            "all_labels_source_and_spanish_anchors_verified":True,
            "actual_precision_or_recall_certified":False,
            "www_writes":0,"paid_google_calls":0,
            "items":audited}

def main():
    p=argparse.ArgumentParser()
    p.add_argument("--labels",required=True)
    p.add_argument("--private-snapshots",required=True)
    p.add_argument("--output",required=True)
    a=p.parse_args()
    try:
        labels=json.loads(Path(a.labels).read_text(encoding="utf-8"))
        result=audit(labels,a.private_snapshots)
        Path(a.output).write_text(json.dumps(result,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
        print("EDITORIAL_EVIDENCE_VERIFIED="+str(result["labels_verified"])+" "+json.dumps(result["verdict_counts"]))
        return 0
    except (KeyError,ValueError,OSError,TypeError,json.JSONDecodeError) as exc:
        print("EDITORIAL_EVIDENCE_FAIL: "+str(exc),file=sys.stderr)
        return 2
if __name__=="__main__":
    raise SystemExit(main())
