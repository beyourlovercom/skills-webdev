#!/usr/bin/env node
// Duplicate Site V2: bounded, opt-in Windows Local integration. No unattended downloads.
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {spawn,spawnSync} from 'node:child_process';
import {fileURLToPath,pathToFileURL} from 'node:url';

const SAFE_ID=/^[a-z0-9][a-z0-9_-]{1,63}$/i;
const SAFE_PATH=/^\/(?:[a-zA-Z0-9._~!$&'()+,;=:@%-]+\/?)*$/;
const MODULES=new Set(['shell','service','category','product','content','interaction']);
const BLOCKED_PREFIXES=['/blog/','/post/','/wp-admin/','/search/','/docs/','/checkout/','/cart/'];
const supported=new Set(['doctor','plan','capture','extract','score']);
const abs=(p)=>path.resolve(p);
const isObject=v=>v!==null && typeof v==='object' && !Array.isArray(v);

export function validatePilot(pilot){
  const errors=[];
  if(!isObject(pilot)||pilot.schema_version!==2)return {status:'FAIL',errors:['schema_version must be 2']};
  if(!SAFE_ID.test(pilot.project_id||''))errors.push('invalid project_id');
  if(pilot.rights?.owner_attested!==true)errors.push('owner_attested must be true before execution');
  if(typeof pilot.rights?.evidence_ref!=='string'||!pilot.rights.evidence_ref.trim())errors.push('rights evidence_ref required');
  let origin;
  try{
    origin=new URL(pilot.source?.origin);
    if(origin.protocol!=='https:' || origin.username || origin.password || origin.search || origin.hash || origin.pathname!=='/')
      errors.push('source origin must be root HTTPS without credentials');
  }catch{errors.push('invalid source origin');}
  const samples=pilot.source?.samples;
  if(!Array.isArray(samples)||samples.length<1||samples.length>24)errors.push('samples must contain 1..24 bounded entries');
  const ids=new Set(), routes=new Set();
  for(const s of Array.isArray(samples)?samples:[]){
    if(!SAFE_ID.test(s?.id||'')||ids.has(s.id))errors.push('invalid/duplicate sample id');
    ids.add(s?.id);
    if(!MODULES.has(s?.module))errors.push('invalid sample module');
    if(typeof s?.path!=='string'||!SAFE_PATH.test(s.path)||s.path.includes('..')||
        /%(?:2e|2f|5c|00)/i.test(s.path)|| s.path.includes('//'))errors.push('invalid sample path');
    if(BLOCKED_PREFIXES.some(prefix=>(s.path||'').toLowerCase().startsWith(prefix)))errors.push('excluded or sensitive sample path');
    if(routes.has(s?.path))errors.push('duplicate sample path');
    routes.add(s?.path);
  }
  if(pilot.execution?.scope!=='PILOT_SAMPLES')errors.push('V2 pilot only supports PILOT_SAMPLES');
  const rpm=pilot.execution?.max_requests_per_second;
  if(!Number.isInteger(rpm)||rpm<1||rpm>3)errors.push('request rate must be 1..3 per second');
  const workers=pilot.execution?.workers;
  if(!Number.isInteger(workers)||workers<1||workers>2)errors.push('workers must be 1..2');
  if(pilot.execution?.allow_production_write!==false)errors.push('production writes forbidden');
  if(pilot.execution?.enable_bulk!==false)errors.push('bulk forbidden before Owner module PASS');
  if(!isObject(pilot.approvals)||pilot.approvals.owner_visual_pass!==false)errors.push('visual owner PASS must default false');
  return {status:errors.length?'FAIL':'PASS',errors,sample_count:Array.isArray(samples)?samples.length:0};
}

export function buildCommands(pilot, workspace){
  const valid=validatePilot(pilot);
  if(valid.status!=='PASS')throw new Error(valid.errors.join('; '));
  const origin=pilot.source.origin;
  const samples=pilot.source.samples.map(s=>({...s,url:new URL(s.path,origin).href}));
  const root=abs(workspace);
  const siteone={
    binary:'siteone-crawler',
    args:[
      '--url-list='+path.join(root,'input-urls.txt'),'--single-page',
      '--workers='+pilot.execution.workers,
      '--max-reqs-per-sec='+pilot.execution.max_requests_per_second,
      '--max-visited-urls=5000',
      '--force-relative-urls',
      '--offline-export-dir='+path.join(root,'mirror'),
      '--offline-export-preserve-url-structure',
      '--output-json-file='+path.join(root,'siteone-report.json'),
      '--output-html-report='+path.join(root,'siteone-report.html'),
      '--output-text-file='+path.join(root,'siteone-report.txt')
    ]
  };
  return {project_id:pilot.project_id,workspace:root,samples,siteone,
    pwc_extract:samples.map(s=>({id:s.id,cwd:path.join(root,'pwc',s.id),binary:'pwc',args:['extract',s.url]})),
    next_step:'Agent reviews pwc extract JSON; per sample complete plan → author → assemble → build → screenshots → score → repair → Owner visual PASS. No automatic source-to-code generation is claimed.',
    production_write:'BLOCKED',bulk:'BLOCKED until existing V1.2 module factory approval is accepted'};
}

const locate=(name)=>{
  const lookup=process.platform==='win32'?'where.exe':'which';
  const result=spawnSync(lookup,[name],{encoding:'utf8',timeout:5000});
  return result.status===0?result.stdout.trim().split(/\r?\n/)[0]:null;
};

export function diagnostic(){
  return {node:process.version,platform:process.platform,host:os.hostname(),
    siteone:locate('siteone-crawler')||locate('siteone-crawler.exe'),
    pwc:locate('pwc')||locate('pwc.exe'),python:locate('python')||locate('python3'),
    playwright:'NOT_VERIFIED_BY_DOCTOR',
    meaning:'path detection only; real capture/visual tests remain OPEN'};
}

async function execute(binary,args,cwd,logfile){
  fs.mkdirSync(cwd,{recursive:true});
  const log=fs.createWriteStream(logfile,{flags:'a'});
  const exitCode=await new Promise((resolve,reject)=>{
    const p=spawn(binary,args,{cwd,shell:false,windowsHide:true,timeout:1200000,stdio:['ignore','pipe','pipe']});
    p.stdout.pipe(log,{end:false});
    p.stderr.pipe(log,{end:false});
    p.on('error',reject);
    p.on('close',(code,signal)=>resolve(signal?128:(code??1)));
  }).finally(()=>log.end());
  return {ok:exitCode===0,exit_code:exitCode,log:logfile};
}

function parseArgs(argv){
  const [command,...rest]=argv;
  if(!supported.has(command))throw new Error('Usage: clone-v2.mjs doctor|plan|capture|extract|score --manifest=<file> --workspace=<dir> [--id=<sample>] [--ref=<image> --cand=<image>] [--execute]');
  const opts={command,execute:rest.includes('--execute')};
  for(const arg of rest){
    if(arg==='--execute')continue;
    const m=arg.match(/^--(manifest|workspace|id|ref|cand)=(.+)$/);
    if(!m)throw new Error('Unknown argument: '+arg);
    opts[m[1]]=m[2];
  }
  return opts;
}

export async function main(argv,write=(s)=>process.stdout.write(s)){
  const opt=parseArgs(argv);
  if(opt.command==='doctor'){write(JSON.stringify(diagnostic(),null,2)+'\n');return 0;}
  if(!opt.manifest)throw new Error('--manifest required');
  const pilot=JSON.parse(fs.readFileSync(abs(opt.manifest),'utf8'));
  const valid=validatePilot(pilot);
  if(valid.status!=='PASS'){write(JSON.stringify(valid,null,2)+'\n');return 2;}
  if(!opt.workspace)throw new Error('--workspace required (isolated non-Production folder)');
  const cmd=buildCommands(pilot,opt.workspace);
  if(opt.command==='plan'){write(JSON.stringify({...cmd,mode:'DRY_RUN_ONLY'},null,2)+'\n');return 0;}
  if(!opt.execute)throw new Error('Read-only default: explicitly pass --execute for Local captures');
  fs.mkdirSync(cmd.workspace,{recursive:true});
  let result;
  if(opt.command==='capture'){
    fs.writeFileSync(path.join(cmd.workspace,'input-urls.txt'),cmd.samples.map(s=>s.url).join('\n')+'\n');
    result=await execute(cmd.siteone.binary,cmd.siteone.args,cmd.workspace,path.join(cmd.workspace,'siteone.log'));
  }else if(opt.command==='extract'){
    const job=cmd.pwc_extract.find(s=>s.id===opt.id);
    if(!job)throw new Error('--id must be one of: '+cmd.pwc_extract.map(x=>x.id).join(', '));
    result=await execute(job.binary,job.args,job.cwd,path.join(job.cwd,'extract.log'));
    result.sample_id=job.id;
  }else if(opt.command==='score'){
    if(!opt.ref||!opt.cand)throw new Error('--ref and --cand required for local screenshots');
    for(const p of [opt.ref,opt.cand])if(!fs.statSync(abs(p)).isFile())throw new Error('Screenshot not a file: '+p);
    result=await execute('pwc',['score','--ref',abs(opt.ref),'--cand',abs(opt.cand)],cmd.workspace,path.join(cmd.workspace,'score.log'));
  }
  write(JSON.stringify({phase:opt.command,...result,release:'BLOCKED',visual_acceptance:'OPEN'},null,2)+'\n');
  return result.ok?0:3;
}

if(process.argv[1]&&import.meta.url===pathToFileURL(abs(process.argv[1])).href){
  main(process.argv.slice(2)).then(code=>{process.exitCode=code}).catch(e=>{console.error(e.message);process.exitCode=2});
}
