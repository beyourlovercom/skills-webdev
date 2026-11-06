#!/usr/bin/env node
// Reversible local-only compatibility guard for PWC 3.0.0 inline scripts. No default writes.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';

export const VERIFIED_ORIGINAL_SHA256='6cd1151d2bc160c2b25b917bdfd77274ef8fb1fb9b186798a12599e1fe3a41f2';
export const oldBlock=[
'        def dedupe_pass(items):',
'            seen, out = set(), []',
'            for it in items:',
'                if it["url"] not in seen:',
'                    seen.add(it["url"])',
'                    out.append(AssetInfo(**it))',
'            return out'].join('\n');
export const newBlock=[
'        def dedupe_pass(items):',
'            seen, out = set(), []',
'            for it in items:',
'                candidate = it.get("url") if isinstance(it, dict) else None',
'                if not isinstance(candidate, str) or not candidate.strip():',
'                    continue  # Inline script/stylesheet without a fetchable URL.',
'                if candidate not in seen:',
'                    seen.add(candidate)',
'                    out.append(AssetInfo(url=candidate, type=it.get("type") or "script"))',
'            return out'].join('\n');
const digest=txt=>crypto.createHash('sha256').update(txt).digest('hex');
export function inspectSource(txt){
 const normalized=txt.replaceAll('\r\n','\n');
 if(normalized.includes(newBlock))return {status:'ALREADY_PATCHED'};
 if(!normalized.includes(oldBlock))return {status:'UNKNOWN_UPSTREAM'};
 return {status:'PATCH_CANDIDATE',changed:normalized.replace(oldBlock,newBlock)};
}
export function patchLocal({workspace,file,apply=false}){
 if(!workspace||!file)throw Error('--workspace and --file are required');
 const root=fs.realpathSync(path.resolve(workspace));
 const target=fs.realpathSync(path.resolve(file));
 const rel=path.relative(root,target).replaceAll('\\','/');
 if(!rel||rel.startsWith('../')||path.isAbsolute(rel)||
    !rel.endsWith('/core/extractor/service.py'))throw Error('target must be an isolated PWC core/extractor/service.py inside workspace');
 const bytes=fs.readFileSync(target);
 const sha=digest(bytes);
 const check=inspectSource(bytes.toString('utf8'));
 if(check.status!=='PATCH_CANDIDATE')return {status:check.status,source_sha256:sha,modified:false};
 if(sha!==VERIFIED_ORIGINAL_SHA256)return {status:'UNKNOWN_SHA_NOT_PATCHED',source_sha256:sha,modified:false};
 if(!apply)return {status:'READY_FOR_EXPLICIT_APPLY',source_sha256:sha,modified:false};
 const backup=target+'.v2-original-'+sha.slice(0,12)+'.bak';
 fs.copyFileSync(target,backup,fs.constants.COPYFILE_EXCL);
 const eol=bytes.toString('utf8').includes('\r\n')?'\r\n':'\n';
 fs.writeFileSync(target,check.changed.replaceAll('\n',eol),'utf8');
 return {status:'PATCHED',source_sha256:sha,backup,patched_sha256:digest(fs.readFileSync(target)),modified:true};
}
function cli(argv){
 const o={};
 for(const arg of argv){const m=arg.match(/^--(workspace|file)=(.+)$/);if(m)o[m[1]]=m[2];else if(arg==='--apply')o.apply=true;else throw Error('Unknown argument '+arg);}
 return patchLocal(o);
}
if(process.argv[1]&&fileURLToPath(import.meta.url)===path.resolve(process.argv[1])){
 try{console.log(JSON.stringify(cli(process.argv.slice(2)),null,2));}catch(e){console.error(e.message);process.exitCode=2;}
}
