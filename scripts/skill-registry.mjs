#!/usr/bin/env node
// Offline directory of documented Skills. Never loads third-party credentials or calls GitHub.
import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL,fileURLToPath} from 'node:url';

export const REGISTRY_PATH = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../registry/skills.json');
const NAME_RE=/^[a-z][a-z0-9-]{2,63}$/;
const REF_RE=/^[a-zA-Z0-9][a-zA-Z0-9._/-]*$/;
const SOURCE_STATUSES=new Set(['IN_MAIN','DRAFT_PR']);

export function readRegistry(file=REGISTRY_PATH){return JSON.parse(fs.readFileSync(file,'utf8'));}

export function validateRegistry(doc){
 const errors=[];
 if(!doc||typeof doc!=='object')return {status:'FAIL',errors:['Registry must be an object']};
 if(doc.schema_version!==1)errors.push('schema_version must be 1');
 if(!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(doc.repository||''))errors.push('repository must be owner/name');
 if(doc.default_branch!=='main')errors.push('default_branch must be main');
 if(!/^\d{4}-\d{2}-\d{2}$/.test(doc.snapshot_date||''))errors.push('snapshot_date required');
 if(!Array.isArray(doc.skills)||!doc.skills.length)errors.push('skills must be nonempty array');
 if(!Array.isArray(doc.planned_skills))errors.push('planned_skills must be array');
 if(!Array.isArray(doc.pilots))errors.push('pilots must be array');
 const ids=new Set();
 for(const s of [...(doc.skills||[]),...(doc.planned_skills||[])]){
  if(!NAME_RE.test(s?.id||'')||ids.has(s.id)){errors.push('invalid or duplicate Skill id');continue;}
  ids.add(s.id);
  if(typeof s.name_zh!=='string'||!s.name_zh.trim()||typeof s.summary_zh!=='string'||!s.summary_zh.trim())errors.push('missing description for '+s.id);
  if((doc.planned_skills||[]).includes(s)){
   if(s.status!=='PLANNED'||s.skill_path!==null||s.source_ref!==null||s.pr!==null)errors.push('planned skill cannot have real file or PR: '+s.id);
  }else{
   if(!SOURCE_STATUSES.has(s.status))errors.push('invalid state for '+s.id);
   if(s.skill_path!==`skills/${s.id}/SKILL.md`)errors.push('invalid Skill path for '+s.id);
   if(!REF_RE.test(s.source_ref||'')||s.source_ref.includes('..')||s.source_ref.includes('//'))errors.push('invalid source ref for '+s.id);
   if(s.status==='IN_MAIN'&&(s.source_ref!=='main'||s.pr!==null))errors.push('incorrect main status for '+s.id);
   if(s.status==='DRAFT_PR'&&(s.source_ref==='main'||!Number.isInteger(s.pr)||s.pr<1))errors.push('Draft must point to PR/feature ref: '+s.id);
   if(!Array.isArray(s.inputs_zh)&&typeof s.inputs_zh!=='string')errors.push('inputs_zh missing for '+s.id);
  }
 }
 if(!ids.has('rapid-webdev'))errors.push('rapid-webdev missing');
 return {status:errors.length?'FAIL':'PASS',count:ids.size,errors};
}

export function resolveSkill(doc,id){
 const proof=validateRegistry(doc);
 if(proof.status!=='PASS')throw Error('Invalid registry: '+proof.errors.join('; '));
 const found=doc.skills.find(s=>s.id===id);
 if(!found){const planned=doc.planned_skills.find(s=>s.id===id);if(planned)return {id,status:'PLANNED',message:'尚无可执行 SKILL.md；不得声称已实现。'};throw Error('Unknown skill: '+id);}
 const encoded=found.source_ref.split('/').map(encodeURIComponent).join('/');
 return {id:found.id,stage:found.stage,status:found.status,ref:found.source_ref,path:found.skill_path,
  file_url:`https://github.com/${doc.repository}/blob/${encoded}/${found.skill_path}`,
  pr_url:found.pr?`https://github.com/${doc.repository}/pull/${found.pr}`:null,
  instructions:'先在 GitHub 复核 PR/分支是否仍有效；读取完整 SKILL.md 和 references，核对目标项目 AGENTS.md 与账号授权；此索引本身不执行任何操作。'};
}

export function main(argv, file=REGISTRY_PATH, write=s=>process.stdout.write(s)){
 const reg=readRegistry(file);const v=validateRegistry(reg);
 if(argv.length===1 && argv[0]==='--validate'){write(JSON.stringify(v,null,2)+'\n');return v.status==='PASS'?0:2;}
 if(v.status!=='PASS')throw Error('Registry validation failed: '+v.errors.join('; '));
 if(argv.length===1 && argv[0]==='--list'){
  write(reg.skills.map(s=>`${s.stage}\t${s.id}\t${s.status}\t${s.name_zh}`).join('\n')+'\n');
  write(reg.planned_skills.map(s=>`${s.stage}\t${s.id}\tPLANNED\t${s.name_zh}`).join('\n')+'\n');return 0;
 }
 if(argv.length===2 && argv[0]==='--resolve'){
  write(JSON.stringify(resolveSkill(reg,argv[1]),null,2)+'\n');return 0;
 }
 throw Error('Usage: node scripts/skill-registry.mjs --validate | --list | --resolve <skill-id>');
}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href){
 try{process.exitCode=main(process.argv.slice(2));}catch(e){console.error(e.message);process.exitCode=2;}
}
