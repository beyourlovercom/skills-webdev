#!/usr/bin/env python3
"""R3: deterministic, offline, scratch-only WordPress CSS/JS final build.
Requires an existing esbuild executable; never installs dependencies, modifies
the theme, or claims live visual/production PASS.
"""
import argparse, hashlib, json, pathlib, re, shutil, subprocess, sys
def sha(p):return hashlib.sha256(pathlib.Path(p).read_bytes()).hexdigest()
def path_in(root, rel):
 if not isinstance(rel,str) or not rel or "\\" in rel or rel.startswith("/") or ":" in rel or ".." in rel.split("/"):
  raise ValueError("UNSAFE_PATH:"+str(rel))
 p=(root/rel).resolve()
 if not p.is_relative_to(root.resolve()) or p==root.resolve():raise ValueError("PATH_OUTSIDE_ROOT")
 return p
def recipe(theme, workspace, build_id):
 theme=pathlib.Path(theme).resolve(strict=True);workspace=pathlib.Path(workspace).resolve(strict=True)
 if workspace.is_relative_to(theme) or theme.is_relative_to(workspace):raise ValueError("WORKSPACE_NOT_ISOLATED")
 if "wp-content" in workspace.parts or "app" in workspace.parts and "public" in workspace.parts:raise ValueError("WORKSPACE_NOT_PRIVATE")
 if not re.fullmatch(r"[a-zA-Z0-9_-]{3,60}",build_id):raise ValueError("BAD_BUILD_ID")
 manifest=theme/"assets"/"manifest.json"
 data=json.loads(manifest.read_text(encoding="utf-8-sig"))
 if not isinstance(data,dict) or not data:raise ValueError("INVALID_MANIFEST")
 rows=[]
 for source, dest in data.items():
  if pathlib.Path(source).suffix.lower() not in (".css",".js"):raise ValueError("NOT_CSS_JS")
  sp=path_in(theme,source);path_in(theme,dest)
  if not sp.is_file():raise ValueError("SOURCE_MISSING:"+source)
  rows.append((source,sp,sha(sp)))
 return theme,workspace,workspace/"r3-build"/build_id,manifest,rows
def rebase_css(text,theme,stage,assets):
 def fix(m):
  target=m.group(2).strip()
  if target.startswith(("/","#","//")) or target.startswith(("data:","http:","https:")):return m.group(0)
  bare=target.split("?",1)[0].split("#",1)[0]
  if not bare or bare.startswith(".") or ".." in bare.split("/"):raise ValueError("UNSUPPORTED_CSS_RELATIVE_ASSET")
  source=path_in(theme,bare)
  if not source.is_file():raise ValueError("CSS_ASSET_MISSING:"+bare)
  dest=path_in(stage,bare);dest.parent.mkdir(parents=True,exist_ok=True)
  if not dest.exists():shutil.copy2(source,dest)
  assets[bare]=sha(dest)
  rel=pathlib.PurePosixPath("../../"+bare)
  return "url("+json.dumps(str(rel))+")"
 return re.sub(r"url\(\s*([\"']?)([^\"'()]+)\1\s*\)",fix,text,flags=re.I)
def build(a):
 theme,ws,dest,source_manifest,rows=recipe(a.theme,a.workspace,a.build_id)
 if not a.execute:return {"status":"DRY_RUN","count":len(rows),"scratch":str(dest),"site_writes":0}
 if not a.esbuild or not pathlib.Path(a.esbuild).is_file():raise ValueError("OFFLINE_ESBUILD_REQUIRED")
 if dest.exists():raise ValueError("NO_OVERWRITE_EXISTING_BUILD")
 stage=dest.with_name(dest.name+".tmp")
 if stage.exists():raise ValueError("STALE_STAGE_EXISTS")
 stage.mkdir(parents=True)
 successful=False
 try:
  manifest_out={};receipts=[];assets={}
  for index,(src,srcpath,source_hash) in enumerate(rows):
   ext=srcpath.suffix
   tmp=stage/("_tmp"+str(index)+ext)
   r=subprocess.run([a.esbuild,str(srcpath),"--minify","--target=es2018","--charset=utf8","--log-level=error","--outfile="+str(tmp)],capture_output=True,text=True,timeout=30)
   if r.returncode:raise ValueError("ESBUILD_FAIL:"+src+":"+(r.stderr or r.stdout)[:180])
   data=tmp.read_bytes()
   if ext==".css":data=rebase_css(data.decode("utf-8"),theme,stage,assets).encode("utf-8")
   if not data:raise ValueError("EMPTY_BUILD")
   hashed=hashlib.sha256(data).hexdigest()
   output="assets/dist/"+srcpath.stem+"."+hashed[:16]+".min"+ext
   out=path_in(stage,output);out.parent.mkdir(parents=True,exist_ok=True);out.write_bytes(data)
   tmp.unlink()
   manifest_out[src]=output
   receipts.append({"source":src,"source_sha256":source_hash,"dist":output,"dist_sha256":hashed,"source_bytes":srcpath.stat().st_size,"dist_bytes":len(data)})
  manifest_file=stage/"assets"/"manifest.json"
  manifest_file.write_text(json.dumps(manifest_out,indent=2)+"\n",encoding="utf-8")
  version=subprocess.run([a.esbuild,"--version"],capture_output=True,text=True,timeout=10)
  receipt={"schema":"wp-isolated-final-build/v1","source_theme":str(theme),"source_manifest_sha256":sha(source_manifest),
   "engine":"esbuild","engine_version":version.stdout.strip(),"assets":assets,"files":receipts,
   "site_writes":0,"visual_pass":False,"production_ready":False}
  (stage/"build-receipt.json").write_text(json.dumps(receipt,indent=2)+"\n",encoding="utf-8")
  dest.parent.mkdir(parents=True,exist_ok=True);stage.rename(dest);successful=True
  return {"status":"SCRATCH_BUILD_COMPLETE","files":len(receipts),"css_assets":len(assets),
   "dist_bytes":sum(x["dist_bytes"] for x in receipts),"out":str(dest),"site_writes":0,"production_ready":False}
 finally:
  if not successful and stage.exists():shutil.rmtree(stage)
def verify(a):
 theme,ws,dest,source_manifest,rows=recipe(a.theme,a.workspace,a.build_id)
 receipt=json.loads((dest/"build-receipt.json").read_text(encoding="utf-8"))
 manifest=json.loads((dest/"assets"/"manifest.json").read_text(encoding="utf-8"))
 if receipt["source_theme"]!=str(theme) or receipt["source_manifest_sha256"]!=sha(source_manifest):raise ValueError("SOURCE_MANIFEST_DRIFT")
 for row in receipt["files"]:
  if sha(path_in(theme,row["source"]))!=row["source_sha256"]:raise ValueError("SOURCE_CHANGED")
  if sha(path_in(dest,row["dist"]))!=row["dist_sha256"]:raise ValueError("DIST_CHANGED")
  if manifest.get(row["source"])!=row["dist"]:raise ValueError("BUILD_MANIFEST_CHANGED")
 for asset,h in receipt["assets"].items():
  if sha(path_in(dest,asset))!=h:raise ValueError("COPIED_ASSET_CHANGED")
 return {"status":"R3_BUILD_VERIFIED","files":len(receipt["files"]),"assets":len(receipt["assets"]),"site_writes":0,"visual_pass":False}
def main():
 ap=argparse.ArgumentParser()
 ap.add_argument("--theme",required=True);ap.add_argument("--workspace",required=True)
 ap.add_argument("--build-id",default="stage-v1");ap.add_argument("--esbuild")
 ap.add_argument("--execute",action="store_true");ap.add_argument("--verify",action="store_true")
 a=ap.parse_args()
 print(json.dumps(verify(a) if a.verify else build(a)))
if __name__=="__main__":
 try:main()
 except (OSError,ValueError,KeyError,subprocess.TimeoutExpired,json.JSONDecodeError) as ex:
  print("R3_BLOCKED:"+str(ex),file=sys.stderr);sys.exit(2)