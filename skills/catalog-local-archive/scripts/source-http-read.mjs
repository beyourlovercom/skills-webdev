#!/usr/bin/env node
/**
 * One-request, owner-authorized HTML source preflight for catalog-local-archive.
 * Reads exactly one allowlisted URL. No link discovery, retries, cookie reuse,
 * challenge-solving, proxy rotation, robots bypass, or publication.
 * Usage: node source-http-read.mjs <policy.json>
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';

const fail = (message) => { console.error(JSON.stringify({status:'PREFLIGHT_CONFIG_FAIL',message})); process.exit(2); };
const source = process.argv[2];
if (!source || process.argv.length !== 3) fail('Usage: source-http-read.mjs <policy.json>');
let policy;
try { policy = JSON.parse(fs.readFileSync(source,'utf8')); } catch (e) { fail('Cannot read policy JSON: '+e.message); }

const { source_url, user_agent, output_directory, expected_title_fragment } = policy;
const maxBytes=Number(policy.max_bytes ?? 2000000);
let u;
try {u=new URL(source_url);} catch {fail('Invalid source_url');}
if (u.protocol !== 'https:' || u.username || u.password || u.hash) fail('Only public HTTPS URLs without embedded credentials or fragment are supported');
if (!Array.isArray(policy.allowed_exact_urls) || !policy.allowed_exact_urls.includes(u.href)) fail('URL must be in allowed_exact_urls');
if (!Array.isArray(policy.allowed_hosts) || !policy.allowed_hosts.includes(u.hostname)) fail('Host must be allowlisted');
if (typeof user_agent !== 'string' || user_agent.length < 12 || user_agent.length > 512 || /[\r\n]/.test(user_agent)) fail('Explicit, single User-Agent required');
if (!output_directory || typeof output_directory!=='string' || !path.isAbsolute(output_directory)) fail('Absolute output_directory required');
if (!Number.isInteger(maxBytes) || maxBytes<1024 || maxBytes>20000000) fail('max_bytes must be 1024..20000000');
if (policy.max_pages_per_run !== 1) fail('Only one URL per run is permitted');
const root=path.resolve(output_directory);
const dest=path.join(root,'single-read-'+new Date().toISOString().replace(/[:.]/g,'-')+'-'+process.pid);
fs.mkdirSync(dest,{recursive:true});
const body=path.join(dest,'source.html');
const headers=path.join(dest,'headers.txt');
const curl=(process.platform==='win32')?'curl.exe':'curl';
const started=new Date().toISOString();
const result=spawnSync(curl,[
 '--silent','--show-error','--compressed','--location','--max-redirs','2',
 '--connect-timeout','8','--max-time','30','--retry','0','--max-filesize',String(maxBytes),
 '--user-agent',user_agent,'--dump-header',headers,'--output',body,
 '--write-out','\n%{http_code}\t%{url_effective}\t%{content_type}\n',source_url
],{encoding:'utf8',timeout:35000,windowsHide:true,maxBuffer:1024*1024});
const fields=(result.stdout||'').trim().split(/\t/);
const code=Number(fields[0]||0);
const finalUrl=fields[1]||null;
const mime=fields[2]||null;
const headerText=fs.existsSync(headers)?fs.readFileSync(headers,'utf8'):'';
const fileSize=fs.existsSync(body)?fs.statSync(body).size:0;
const html=(fileSize>0&&fileSize<=maxBytes)?fs.readFileSync(body,'utf8'):'';
const title=html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1].replace(/\s+/g,' ').trim() || null;
const ray=[...headerText.matchAll(/^cf-ray:\s*(\S+)/gim)].map(x=>x[1]).at(-1)||null;
let finalHostOk=false;
try{finalHostOk=!!finalUrl && policy.allowed_hosts.includes(new URL(finalUrl).hostname);}catch{}
const challenge=/Attention Required! \| Cloudflare|Just a moment\.\.\.|cf-chl|challenge-platform/i.test((title||'')+' '+html.slice(0,12000));
const valid= result.status===0 && code===200 && fileSize>0 && fileSize<=maxBytes && /text\/html/i.test(mime||'') && finalHostOk && !challenge &&
 (!expected_title_fragment || (title||'').toLowerCase().includes(String(expected_title_fragment).toLowerCase()));
const status=valid?'SOURCE_HTML_READ_PASS':(code===403?'BLOCKED_CLOUDFLARE_403':'SOURCE_HTTP_READ_FAIL');
const report={status,started_at:started,source_url,final_url:finalUrl,status_code:code,content_type:mime,
 user_agent,bytes:fileSize,sha256:fileSize>0?crypto.createHash('sha256').update(fs.readFileSync(body)).digest('hex'):null,
 html_title:title,cloudflare_ray:ray,challenge_detected:challenge,allowed_host:finalHostOk,
 curl_exit:result.status,curl_error:(result.stderr||'').trim().slice(0,400),
 body_path:fs.existsSync(body)?body:null,headers_path:headers,scope:'ONE_EXPLICIT_ALLOWLISTED_URL_NO_CRAWLING'};
fs.writeFileSync(path.join(dest,'report.json'),JSON.stringify(report,null,2)+'\n','utf8');
console.log(JSON.stringify(report,null,2));
process.exit(valid?0:3);
