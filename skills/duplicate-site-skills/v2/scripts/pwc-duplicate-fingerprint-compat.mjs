#!/usr/bin/env node
// Reversible duplicate-fingerprint compatibility fix for the audited PWC 3.0.0 source.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
export const ORIGINAL_SHA256='dc0eadc6f0fd4bd6b4538f936357e7e1e9906624d3671216a1decd942221f65e';
const sha=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
const oldMap=[
'    post_by_fingerprint = {',
'        _fingerprint(region): region',
'        for region in post',
'        if _fingerprint(region)',
'    }',
'    missing_critical: List[str] = []',
'    collapsed_critical: List[str] = []',
'',
'    for region in pre:',
'        if not _is_critical(region):',
'            continue',
'        fingerprint = _fingerprint(region)'
].join('\n');
const newMap=[
'    # Preserve duplicate semantic fingerprints in DOM order; a last-wins map',
'    # compares unrelated Elementor sections and creates false collapses.',
'    post_by_fingerprint: Dict[str, List[Dict[str, Any]]] = {}',
'    for region in post:',
'        fp = _fingerprint(region)',
'        if fp:',
'            post_by_fingerprint.setdefault(fp, []).append(region)',
'    pre_occurrence: Dict[str, int] = {}',
'    missing_critical: List[str] = []',
'    collapsed_critical: List[str] = []',
'',
'    for region in pre:',
'        fingerprint = _fingerprint(region)',
'        occurrence = pre_occurrence.get(fingerprint, 0)',
'        pre_occurrence[fingerprint] = occurrence + 1',
'        if not _is_critical(region):',
'            continue'
].join('\n');
const oldCandidate=[
'        candidate = post_by_fingerprint.get(fingerprint)',
'        if candidate is None:'
].join('\n');
const newCandidate=[
'        matches = post_by_fingerprint.get(fingerprint, [])',
'        candidate = matches[occurrence] if occurrence < len(matches) else None',
'        if candidate is None:'
].join('\n');
export function transformGate(source){
 const text=source.replaceAll('\r\n','\n');
 if(text.includes(newCandidate)&&text.includes(newMap))return {status:'ALREADY_PATCHED'};
 if(!text.includes(oldMap)||!text.includes(oldCandidate))return {status:'UNKNOWN_UPSTREAM'};
 return {status:'PATCH_CANDIDATE',changed:text.replace(oldMap,newMap).replace(oldCandidate,newCandidate)};
}
export function patchGate({workspace,file,apply=false}){
 if(!workspace||!file)throw Error('workspace/file required');
 const root=fs.realpathSync(path.resolve(workspace));
 const target=fs.realpathSync(path.resolve(file));
 const rel=path.relative(root,target).replaceAll('\\','/');
 if(!rel||rel.startsWith('../')||path.isAbsolute(rel)||
  !rel.endsWith('/core/capture_integrity.py'))throw Error('PWC gate source must be isolated under workspace');
 const bytes=fs.readFileSync(target); const original_sha256=sha(bytes);
 const check=transformGate(bytes.toString('utf8'));
 if(check.status!=='PATCH_CANDIDATE')return {status:check.status,modified:false,original_sha256};
 if(original_sha256!==ORIGINAL_SHA256)return {status:'UNKNOWN_SHA_NOT_PATCHED',modified:false,original_sha256};
 if(!apply)return {status:'READY_FOR_EXPLICIT_APPLY',modified:false,original_sha256};
 const backup=target+'.v2-original-'+original_sha256.slice(0,12)+'.bak';
 fs.copyFileSync(target,backup,fs.constants.COPYFILE_EXCL);
 const eol=bytes.toString('utf8').includes('\r\n')?'\r\n':'\n';
 fs.writeFileSync(target,check.changed.replaceAll('\n',eol));
 return {status:'PATCHED',modified:true,backup,original_sha256,patched_sha256:sha(fs.readFileSync(target))};
}
if(process.argv[1]&&fileURLToPath(import.meta.url)===path.resolve(process.argv[1])){
 try{
  const o={};
  for(const a of process.argv.slice(2)){if(a==='--apply')o.apply=true;
   else{const m=a.match(/^--(workspace|file)=(.+)$/);if(!m)throw Error('unknown arg '+a);o[m[1]]=m[2];}}
  console.log(JSON.stringify(patchGate(o),null,2));
 }catch(e){console.error(e.message);process.exitCode=2;}
}
