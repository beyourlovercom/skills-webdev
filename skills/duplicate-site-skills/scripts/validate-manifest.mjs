#!/usr/bin/env node
// Offline schema & release-gate helper. Does NOT verify ownership or contact remote sites.
// No external dependencies, network calls, credentials, or filesystem mutations.
import fs from 'node:fs';
import { pathToFileURL } from 'node:url';
import path from 'node:path';

const RIGHTS = new Set(['owned','licensed','public-domain']);
const TYPES = new Set(['structure','text','assets','code']);
const STATE = new Set(['OPEN','PASS','FAIL','BLOCKED']);
const SENSITIVE_KEY = /(?:password|secret|token|private.key|cookie|credential|access.key|api.key)/i;
const SHA_RE = /^[a-f0-9]{40}$/i;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function plain(v) { return v!==null && typeof v==='object' && !Array.isArray(v); }
function urlOrigin(value,where,errors) {
  try {
    const u = new URL(value);
    if(!['https:','http:'].includes(u.protocol) || !u.hostname || u.username || u.password ||
       u.search || u.hash || u.pathname!=='/') {
      errors.push(where + ' must be an origin URL without credentials/path/query');
      return null;
    }
    return u.origin;
  } catch { errors.push(where + ' must be a valid absolute URL'); return null; }
}
function routePath(v) {
  if(typeof v!=='string'||!v.startsWith('/')||v.includes('?')||v.includes('#')||v.includes('\\')||
     v.includes('//')||v.includes('..')||/[<>"'\u0000-\u001f\u007f]/g.test(v)||
     /%(?:2f|5c|00|0a|0d)/i.test(v)) return false;
  try {
    const decoded=decodeURIComponent(v);
    if(decoded.includes('\\')||decoded.includes('//')||/[\u0000-\u001f\u007f]/.test(decoded)||
       decoded.split('/').some(segment=>segment==='.'||segment==='..')) return false;
  } catch { return false; }
  return v==='/' || v.endsWith('/');
}
function scanSecrets(v,where,errors) {
  if(Array.isArray(v)){ v.forEach((item,i)=>scanSecrets(item,where+'['+i+']',errors)); return; }
  if(plain(v)){ for(const [k,item] of Object.entries(v)) {
    if(SENSITIVE_KEY.test(k))errors.push('sensitive key forbidden in manifest: '+where+'.'+k);
    scanSecrets(item,where+'.'+k,errors);
  } return; }
  if(typeof v==='string'&&(/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/.test(v) ||
      /(?:ghp_|gho_|github_pat_|sk-proj-)[a-zA-Z0-9_-]{12,}/.test(v)))
     errors.push('possible embedded secret at '+where);
}
export function validateManifest(doc) {
  const errors=[],warnings=[];
  if(!plain(doc))return {schema_status:'FAIL',errors:['manifest must be a JSON object'],warnings};
  scanSecrets(doc,'manifest',errors);
  if(doc.schema_version!==1)errors.push('schema_version must be 1');
  if(typeof doc.project_id!=='string'||!/^[a-z][a-z0-9-]{2,63}$/.test(doc.project_id))errors.push('invalid project_id');
  if(typeof doc.demo_only!=='boolean')errors.push('demo_only must be boolean');
  if(!plain(doc.source)||!plain(doc.target)||!plain(doc.environments)||!plain(doc.release)||!plain(doc.inquiry)||!plain(doc.evidence))
     errors.push('missing source/target/environments/release/inquiry/evidence object');
  const source=doc.source||{},target=doc.target||{},env=doc.environments||{},
        release=doc.release||{},inq=doc.inquiry||{},evidence=doc.evidence||{};
  const src=urlOrigin(source.origin,'source.origin',errors);
  const dst=urlOrigin(target.origin,'target.origin',errors);
  if(src&&dst&&src===dst)warnings.push('same source and target origin: verify in-place migration instead of a new mirror');
  if(!RIGHTS.has(source.relationship))errors.push('source.relationship must be owned/licensed/public-domain');
  if(!['verified','unverified','blocked'].includes(source.rights_status))errors.push('source.rights_status invalid');
  if(source.rights_evidence_ref!==null&&(typeof source.rights_evidence_ref!=='string'||source.rights_evidence_ref.trim().length<5))
    errors.push('source.rights_evidence_ref invalid');
  if(!Array.isArray(source.authorized_content_types)||source.authorized_content_types.length===0||
     source.authorized_content_types.some(t=>!TYPES.has(t)))
    errors.push('source.authorized_content_types required from structure/text/assets/code');
  if(typeof source.authorized_publication!=='boolean'||typeof source.authorized_search_index!=='boolean')
    errors.push('source publication and search-index permission flags must be boolean');
  if(typeof target.platform!=='string'||!target.platform.trim())errors.push('target.platform required');
  if(!['hold','allow-index'].includes(target.indexing))errors.push('target.indexing must be hold or allow-index');
  if(typeof env.local!=='string'||env.local.length<3)errors.push('environments.local required');
  const dev=urlOrigin(env.dev,'environments.dev',errors),www=urlOrigin(env.www,'environments.www',errors);
  if(www&&dst&&www!==dst)errors.push('environments.www must match target.origin');
  if(dst&&new URL(dst).protocol!=='https:')errors.push('target.origin must use HTTPS for public deployment');
  if(typeof env.dev_is_www_exception_approved!=='boolean')
    errors.push('environments.dev_is_www_exception_approved must be boolean');
  const devIsWww=!!(dev&&dst&&dev===dst);
  if(devIsWww&&!env.dev_is_www_exception_approved)
    warnings.push('Dev shares WWW origin; explicit site-profile exception required');
  if(env.dev_is_www_exception_approved&&!devIsWww)
    warnings.push('Dev=WWW exception flag set although environments are separate');
  if(!Array.isArray(doc.routes)||!doc.routes.length)errors.push('routes must be a non-empty array');
  else{
    const from=new Set(),to=new Set();
    for(const [i,r] of doc.routes.entries()){
      if(!plain(r)||!routePath(r.source_path)||!routePath(r.target_path)||!['planned','captured','verified','excluded'].includes(r.status))
        errors.push('invalid route at index '+i);
      else{
        if(from.has(r.source_path))errors.push('duplicate source route: '+r.source_path);
        if(to.has(r.target_path))errors.push('duplicate target route: '+r.target_path);
        from.add(r.source_path);to.add(r.target_path);
      }
    }
  }
  if(!EMAIL_RE.test(inq.public_email||''))errors.push('inquiry.public_email invalid');
  if(!EMAIL_RE.test(inq.internal_recipient||''))errors.push('inquiry.internal_recipient invalid');
  if(typeof release.owner_pass!=='boolean'||typeof release.seo_owner_pass!=='boolean'||
     typeof release.backup_verified!=='boolean'||typeof release.www_deployed!=='boolean')
    errors.push('release booleans missing, including independent SEO approval');
  if(release.approved_sha!==null&&(typeof release.approved_sha!=='string'||!SHA_RE.test(release.approved_sha)))
    errors.push('release.approved_sha must be a full 40-digit SHA or null');
  for(const f of ['local_qa','dev_qa','www_readback','gsc_indexed'])
    if(!STATE.has(evidence[f]))errors.push('evidence.'+f+' must be OPEN/PASS/FAIL/BLOCKED');
  const rightsGate=source.rights_status==='verified' && typeof source.rights_evidence_ref==='string' &&
    source.rights_evidence_ref.trim().length>=5 && doc.demo_only===false ? 'CHECK_EVIDENCE' : 'BLOCKED';
  const wwwGate=rightsGate==='CHECK_EVIDENCE' && source.authorized_publication===true &&
    (!devIsWww || env.dev_is_www_exception_approved===true) &&
    release.owner_pass===true && SHA_RE.test(release.approved_sha||'') &&
    release.backup_verified===true && evidence.local_qa==='PASS' && evidence.dev_qa==='PASS' ?
       'READY_FOR_MANUAL_REVIEW' : 'BLOCKED';
  const indexGate=target.indexing==='allow-index' && wwwGate==='READY_FOR_MANUAL_REVIEW' &&
    source.authorized_search_index===true && release.seo_owner_pass===true ?
       'READY_FOR_SEO_EVIDENCE_REVIEW' : 'HOLD';
  if(doc.demo_only===true)warnings.push('demo manifest: never deploy or index');
  if(rightsGate!=='CHECK_EVIDENCE')warnings.push('rights unverified in the schema; execution blocked');
  if(target.indexing==='allow-index'&&indexGate==='HOLD')
    warnings.push('indexing requested but source publication, SEO consent or release gate is not complete');
  return {schema_status:errors.length?'FAIL':'PASS',project_id:doc.project_id,
      rights_gate:rightsGate,www_gate:wwwGate,index_gate:indexGate,
      route_count:Array.isArray(doc.routes)?doc.routes.length:0,errors,warnings};
}
export function main(args) {
  if(args.length!==1){console.error('Usage: node validate-manifest.mjs <manifest.json>');return 2;}
  try{
    const file=path.resolve(args[0]);
    const result=validateManifest(JSON.parse(fs.readFileSync(file,'utf8')));
    console.log(JSON.stringify(result,null,2));
    return result.schema_status==='PASS'?0:2;
  }catch(e){console.error('Cannot validate manifest: '+e.message);return 2;}
}
if(process.argv[1] && import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href)
  process.exitCode=main(process.argv.slice(2));
