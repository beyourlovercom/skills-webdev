#!/usr/bin/env node
// S0: dependency-free, evidence-first site Skill generator (Node 20+).
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

export const UNKNOWN = 'UNKNOWN';
export const STAGES = [
  {id:'S1', slug:'site-intelligence', title:'多源证据与建站策略',
   inputs:'授权的 GA4、GSC、Ads、Semrush、订单与关键词导出及来源证明',
   outputs:'data-quality.md、opportunity-matrix.csv、keyword-url-map.csv、IA P0/P1/P2、Word 报告、Codex handoff',
   gate:'数据来源与日期可追溯，指标定义及归因限制清楚'},
  {id:'S2-A', slug:'site-builder-local', title:'Windows Local 网站研发',
   inputs:'S1 报告、旧站获授权内容、项目 AGENTS.md、当前代码 SHA',
   outputs:'隔离的 Local 网站、页面 URL 映射、变更集、Local UAT 证据',
   gate:'真实 Local 浏览器/功能验收 PASS；缺证据不得进入 Dev'},
  {id:'S2-B', slug:'site-dev-uat', title:'Dev 真实验收',
   inputs:'Local PASS 的精确 SHA、Dev 授权及环境基线',
   outputs:'浏览器/SEO/性能/插件/商品/流程证据、失败清单、回滚包',
   gate:'Dev UAT PASS 且 noindex/Coming Soon 隔离有效'},
  {id:'S2-C', slug:'site-www-release', title:'WWW 差异发布',
   inputs:'Dev PASS、准确 SHA、待发布差异、Owner 独立 pass',
   outputs:'受控差异发布记录、前后读回、回滚记录',
   gate:'Owner 明确批准，WWW 业务/索引与支付关键路径读回 PASS'},
  {id:'S3', slug:'analytics-live', title:'WWW 追踪与转化核验',
   inputs:'WWW 已上线、正式追踪权限、事件规范和真实业务证据',
   outputs:'事件字典、GA4/GSC/GTM/Ads 接入核验、去重与归因记录',
   gate:'正式 WWW 转化读回有效；测试事件不计真实转化'},
  {id:'S4', slug:'seo-live', title:'WWW 搜索优化',
   inputs:'S1 关键词映射、正式 GSC/GA4、实时 URL 与 SERP 证据',
   outputs:'URL-关键词簇-动作-复测 KPI 闭环台账',
   gate:'修改获准、可回撤；涉及代码退回 S2'},
  {id:'S5', slug:'content-migration', title:'旧内容迁移/重写',
   inputs:'旧站文章、授权证明、搜索表现、两站关系',
   outputs:'保留/合并/更新/新研/弃用决策表、分批审核与回撤记录',
   gate:'版权、品牌独立性、重复内容风险及批量审批 PASS'},
  {id:'S6', slug:'content-automation', title:'研究、写作与受控排期',
   inputs:'批准的发布策略、GSC/SERP/产品机会、编辑标准',
   outputs:'选题 Brief、事实检查、草稿、排期、审批与发布日志',
   gate:'未审批只写草稿；批准频率及质量门禁后才能自动发布'}
];

const PRIVATE_KEY = /(?:secret|password|token|api[_-]?key|private[_-]?key|authorization|cookie|client[_-]?secret|session|credential)/i;
const PRIVATE_VALUE = /(?:gh[pousr]_[A-Za-z0-9_]{20,}|sk-[A-Za-z0-9_-]{20,}|Bearer\s+[A-Za-z0-9._-]{16,}|AIza[A-Za-z0-9_-]{20,})/;
const SAFE_FIELD = ['brand','business_model','product_type','conversion_goal','cms','theme','commerce','hosting','relation','old_domain','new_domain','target_markets','languages','currencies','industry_constraints','content_ownership','project_repo','environments','data_sources','sources','field_evidence','approved_media','existing_features','accepted_uat','open_items','observed_at'];
const ALLOWED_SOURCE_STATES = ['AUTHORIZED','NOT_CONNECTED','NO_ACCESS','UNKNOWN'];
const scalar = v => v === null || v === undefined || v === '' ? UNKNOWN : v;

export function normalizeDomain(value) {
  if (!value || typeof value !== 'string') throw new Error('Missing domain');
  const input = value.trim();
  if (/[\/\\?#@]/.test(input)) throw new Error('Use a bare public domain, not an URL/path/credential');
  const u = new URL('https://' + input);
  if (u.hostname !== input.toLowerCase() || !u.hostname.includes('.') || u.hostname === 'localhost' ||
      /^(\d+\.){3}\d+$/.test(u.hostname) || u.hostname.endsWith('.local')) throw new Error('Invalid public domain');
  return u.hostname;
}
function safeText(v) {
  if (typeof v === 'string') {
    if (PRIVATE_VALUE.test(v)) throw new Error('Suspected credential in evidence value');
    if (/[\r\n\u0000-\u001F]/.test(v) || /<!--|-->|S0-MANAGED/i.test(v)) throw new Error('Unsafe multi-line or managed-marker evidence');
    return v.slice(0, 500);
  }
  return v;
}
export function sanitizeEvidence(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Evidence must be a JSON object');
  for (const k of Object.keys(input)) if (PRIVATE_KEY.test(k)) throw new Error('Credential-like evidence key: ' + k);
  const out = {};
  for (const field of SAFE_FIELD) {
    const v = input[field];
    if (v === undefined) continue;
    if (typeof v === 'string') out[field] = safeText(v);
    else if (Array.isArray(v)) out[field] = v.slice(0,100).map(x => {
      if (typeof x !== 'string') throw new Error('Array evidence must contain strings: ' + field);
      return safeText(x);
    });
    else if (v && typeof v === 'object' && ['environments','data_sources','field_evidence'].includes(field)) {
      const clean = Object.create(null);
      for (const [k,x] of Object.entries(v)) {
        if (PRIVATE_KEY.test(k) || !/^[A-Za-z][A-Za-z0-9_.-]*$/.test(k) || typeof x !== 'string') throw new Error('Invalid map entry: ' + field);
        clean[k] = safeText(x);
      }
      out[field] = clean;
    } else throw new Error('Invalid evidence shape: ' + field);
  }
  return out;
}
export function discoverProject(root) {
  const exists = p => fs.existsSync(path.join(root,p));
  const markers = [];
  if (exists('wp-content') || exists('wp-includes')) markers.push('wordpress-directory');
  if (exists('composer.json')) markers.push('composer');
  if (exists('package.json')) markers.push('node-package');
  if (exists('shopify.app.toml')) markers.push('shopify-app');
  return {agents_present:exists('AGENTS.md'), markers,
    cms_hint:markers.includes('wordpress-directory') ? 'WordPress (source marker, verify runtime)' : UNKNOWN};
}
export function buildProfile(domain, input, projectRoot) {
  const e = sanitizeEvidence(input);
  const d = discoverProject(projectRoot);
  const model = String(e.business_model || UNKNOWN).toUpperCase();
  if (!['B2B','B2C','B2B+B2C','CONTENT','UNKNOWN'].includes(model)) throw new Error('Invalid business_model');
  const data_sources = {};
  for (const name of ['ga4','gsc','semrush','ads','orders','keywords']) {
    const state = (e.data_sources || {})[name] || UNKNOWN;
    if (!ALLOWED_SOURCE_STATES.includes(state)) throw new Error('Invalid data source status: ' + name);
    data_sources[name] = state;
  }
  const fields = {};
  for (const key of ['brand','product_type','conversion_goal','theme','commerce','hosting','relation','old_domain','new_domain','content_ownership','project_repo','observed_at']) fields[key] = scalar(e[key]);
  fields.cms = scalar(e.cms || d.cms_hint);
  fields.business_model = model;
  const profile = {
    schema_version:1, domain, fields,
    target_markets:e.target_markets || [UNKNOWN], languages:e.languages || [UNKNOWN],
    currencies:e.currencies || [UNKNOWN], industry_constraints:e.industry_constraints || [UNKNOWN],
    environments:{local:(e.environments||{}).local||UNKNOWN, dev:(e.environments||{}).dev||UNKNOWN, www:(e.environments||{}).www||('https://'+domain)},
    data_sources, sources:e.sources||[], field_evidence:e.field_evidence||{},
    approved_media:e.approved_media||[], existing_features:e.existing_features||[],
    accepted_uat:e.accepted_uat||[], open_items:e.open_items||[],
    project_discovery:d,
    unknown_policy:'Missing or unchecked evidence remains UNKNOWN; no inferred approvals',
    owner_approval:'REQUIRED_FOR_PRODUCTION'
  };
  if (!['migration','coexist','new','UNKNOWN'].includes(fields.relation)) throw new Error('relation must be migration/coexist/new/UNKNOWN');
  return profile;
}
function renderScalar(x) {
  if (typeof x === 'number' || typeof x === 'boolean') return String(x);
  return JSON.stringify(String(x));
}
export function toYaml(data, indent=0) {
  const pad=' '.repeat(indent);
  if (Array.isArray(data)) return data.length ? data.map(v =>
    (typeof v==='object' && v!==null ? pad+'-\n'+toYaml(v,indent+2) : pad+'- '+renderScalar(v))).join('\n') : pad+'[]';
  if (data && typeof data==='object') {
    const pairs=Object.entries(data);
    return pairs.length ? pairs.map(([k,v]) =>
      (v && typeof v==='object' && Object.keys(v).length ? pad+k+':\n'+toYaml(v,indent+2)
      : pad+k+': '+((v && typeof v==='object') ? (Array.isArray(v)?'[]':'{}') : renderScalar(v)))).join('\n') : pad+'{}';
  }
  return pad+renderScalar(data);
}
function domainSlug(domain) { return domain.replace(/[^a-z0-9]/g,'-').slice(0,32); }
export function siteRules(p) {
  const f=p.fields, rules=[];
  const b=f.business_model, cms=String(f.cms).toLowerCase(), product=String(f.product_type).toLowerCase();
  if (b.includes('B2B')) rules.push('B2B: 核验有效询盘（去重、垃圾线索、销售跟进/有效性），表单点击不等于转化。');
  if (b.includes('B2C') || /woocommerce|shopify/.test(String(f.commerce).toLowerCase())) rules.push('电商: 验证 SKU、变体、库存、币种/税/运费、支付结果及订单事实，不将 add_to_cart 当成交。');
  if (/wordpress|woocommerce/.test(cms)) rules.push('WordPress: 核对实际插件/主题、WP-CLI 可用性、noindex、固定链接及 WooCommerce 兼容性，不假设环境已安装工具。');
  if (/shopify/.test(cms)) rules.push('Shopify: 核对主题、商品/variant、Checkout 限制、像素与应用权限；不得将 WordPress WP-CLI 作为必需步骤。');
  if (/adult|娃娃|性|regulated/i.test(product+' '+p.industry_constraints.join(' '))) rules.push('行业约束: 审核目标市场法规、年龄/内容限制及支付商户允许范围；未核验不得声明可售或可支付。');
  if (f.relation==='coexist') rules.push('旧新站并行: 不默认 301；核对独立品牌、版权、canonical 与跨站重复内容风险。');
  else if (f.relation==='migration') rules.push('迁移: 建立 URL 对照、301、canonical、GSC 迁移与恢复监控；任何正式跳转须单独审批。');
  else if (f.relation===UNKNOWN) rules.push('站点关系 UNKNOWN: 禁止默认迁移、批量 301 或同时复制开放相同内容。');
  if (p.target_markets.some(x=>x!==UNKNOWN)) rules.push('目标市场: '+p.target_markets.join(', ')+'；逐市场校验语言、货币、SERP 与合规，不混合国家结论。');
  rules.push('若字段/数据源 UNKNOWN 或 NO_ACCESS，登记缺口和来源，不填模拟数据冒充真实成果。');
  return rules;
}
const BEG='<!-- S0-MANAGED:START -->', END='<!-- S0-MANAGED:END -->';
export function renderStage(p, stage) {
  const name=(stage.slug+'-'+domainSlug(p.domain)).slice(0,64);
  const rules=siteRules(p);
  return [
    '---','name: '+name,
    'description: Project-specific '+stage.id+' workflow for '+p.domain+'; generated from explicitly declared evidence.',
    '---','# '+stage.id+' | '+stage.title+' — '+p.domain,
    '本文件由 S0 管理；项目 AGENTS.md 和 Owner 审批优先。缺失的权限或证据不得推断为 PASS。','',
    BEG,
    '## 实测画像（缺失项保持 UNKNOWN）',
    '- 业务: '+p.fields.business_model+' / '+p.fields.product_type+' / '+p.fields.conversion_goal,
    '- CMS: '+p.fields.cms+'；Commerce: '+p.fields.commerce+'；站点关系: '+p.fields.relation,
    '- 市场: '+p.target_markets.join(', ')+'；语言: '+p.languages.join(', ')+'；币种: '+p.currencies.join(', '),
    '- 环境: Local='+p.environments.local+'；Dev='+p.environments.dev+'；WWW='+p.environments.www,
    '- 数据权限: '+Object.entries(p.data_sources).map(([k,v])=>k+'='+v).join('; '),'',
    '## 输入契约',stage.inputs,'要求每个关键业务事实附实际来源、采集日期及授权/缺失状态。','',
    '## 执行流程',
    '1. 只读核查项目 AGENTS.md、当前 GitHub SHA、运行状态、既有 PASS 与适用权限。',
    '2. 对照 site-profile.yaml 与 field_evidence；只补差异，不重做已验收工作。',
    '3. 根据业务类型逐项执行以下项目专属规则；遇 UNKNOWN 登记 OPEN。',
    ...rules.map(x=>'- '+x),
    '4. 写入变更前核对审批；执行后保存逐项事实与可回滚证据。','',
    '## 输出契约',stage.outputs,
    '必须注明实际主机/环境、SHA、输入来源、运行命令、PASS/FAIL/OPEN、截图/日志位置与回滚状态。','',
    '## 阶段门禁',stage.gate,
    stage.id==='S2-C' ? '独立 Owner pass 是硬门禁：没有明确批准只能准备计划，禁止正式发布。' :
    ['S3','S4','S5','S6'].includes(stage.id) ? '日常运营针对 WWW；代码/主题/插件/模板/数据库结构变更必须回到 Local→Dev→WWW。首次追踪启用、批量变更和自动发布另行审批。' :
    '不可将文档、模拟测试或静态检查冒充真实浏览器/环境 PASS。',
    END,'','## 项目人工规则（S0 永不覆盖此区）','请在此添加已审批的本项目特殊执行与验收规则。',''
  ].join('\n');
}
export function mergeManaged(previous, current) {
  if (!previous) return current;
  const a=previous.indexOf(BEG), b=previous.indexOf(END);
  const x=current.indexOf(BEG), y=current.indexOf(END);
  if (a<0 || b<a || x<0 || y<x) return null;
  return previous.slice(0,a)+current.slice(x,y+END.length)+previous.slice(b+END.length);
}
export function renderFiles(p) {
  const files = {'skills/site-profile.yaml':'# S0 GENERATED. Edit source evidence; preserve AGENTS.md for human governance.\n'+toYaml(p)+'\n'};
  for (const s of STAGES) files['skills/'+s.slug+'/SKILL.md']=renderStage(p,s);
  files['skills/approval-gates.md']=[
    '# '+p.domain+'｜审批门禁（S0 生成，不代表授权）',
    BEG,
    'Owner 尚未通过此文件批准任何生产写入。', 'S2-A → S2-B: Local 实测 PASS。',
    'S2-B → S2-C: Dev 实测 PASS + 精确 SHA + 可回滚差异 + Owner 单独 pass。',
    'S3–S6: 正常运营在 WWW；涉及代码/插件/主题/模板/数据库结构回到 S2。',
    '首次追踪启用、批量内容/SEO、删除、301、自动排期/发布均须明确审批。',
    'PUBLIC 仓库不得出现凭据、客户/订单数据或商业私密报表。',
    END,'','## 人工审批记录（S0 不覆盖）','请仅在真实 Owner 明确批准后记录审批范围、时间及证据链接。',''
  ].join('\n');
  files['skills/site-roadmap.md']=[
    '# '+p.domain+'｜S0→S6 Roadmap',
    BEG,
    '本报告仅列计划，不宣称已连接 Analytics 或已实际发布。',
    ...STAGES.map(s=>'- [ ] '+s.id+' '+s.title+' | gate: '+s.gate),
    '先完成 S0 画像及来源补齐，再进入 S1；S2 Local/Dev/WWW 逐层；正式 WWW 的 S3–S6 依各阶段审批。',
    'OPEN: '+(p.open_items.length?p.open_items.join('; '):'逐一核实 UNKNOWN 项与项目授权'),
    END,'','## 人工 Roadmap 备注（S0 不覆盖）','请在此记录已经确认的例外和验收证据。',''
  ].join('\n');
  files['skills/evidence-manifest.json']=JSON.stringify({
    domain:p.domain, observed_at:p.fields.observed_at, sources:p.sources,
    field_evidence:p.field_evidence, data_sources:p.data_sources,
    note:'This is a source index, not attached analytics raw data or verified user consent.'
  },null,2)+'\n';
  return files;
}
export function applyFiles(root, files, write=false) {
  const actions=[];
  for (const [name,content] of Object.entries(files)) {
    const dest=path.resolve(root,name);
    if (!dest.startsWith(path.resolve(root)+path.sep)) throw new Error('Path escape rejected');
    let parent=path.dirname(dest);
    while (parent.startsWith(path.resolve(root)) && parent!==path.resolve(root)) {
      if (fs.existsSync(parent) && fs.lstatSync(parent).isSymbolicLink()) throw new Error('Symlink directory rejected');
      parent=path.dirname(parent);
    }
    if (fs.existsSync(dest) && fs.lstatSync(dest).isSymbolicLink()) throw new Error('Symlink file rejected');
    const previous=fs.existsSync(dest)?fs.readFileSync(dest,'utf8'):null;
    const merged= name.endsWith('.md') ? mergeManaged(previous,content) : content;
    if (merged===null) { actions.push({path:name,action:'CONFLICT_UNMANAGED'}); continue; }
    const state=previous===merged?'UNCHANGED':previous?'UPDATE':'CREATE';
    actions.push({path:name,action:state});
    if (write && state!=='UNCHANGED') {fs.mkdirSync(path.dirname(dest),{recursive:true});fs.writeFileSync(dest,merged,{flag:'w',mode:0o644});}
  }
  return actions;
}
export function run(argv) {
  const options={};
  for (let i=0;i<argv.length;i++) {
    const arg=argv[i];
    if (arg==='--write') options.write=true;
    else if (['--domain','--project-root','--output-root','--evidence'].includes(arg)) {
      if (!argv[i+1]) throw new Error('Missing value: '+arg);
      options[arg.slice(2)]=argv[++i];
    } else if (arg==='--help') {
      process.stdout.write('node src/site-skill-factory.mjs --domain example.org --project-root ./site --evidence ./evidence.json --output-root ./site [--write]\nDefault: dry-run. Evidence is an approved sanitized JSON file; no automatic GA4/GSC login.\n');
      return [];
    } else throw new Error('Unknown argument: '+arg);
  }
  if (!options.domain || !options['project-root'] || !options.evidence || !options['output-root']) throw new Error('Required: --domain --project-root --evidence --output-root');
  const domain=normalizeDomain(options.domain);
  const projectRoot=path.resolve(options['project-root']);
  const outputRoot=path.resolve(options['output-root']);
  const e=JSON.parse(fs.readFileSync(path.resolve(options.evidence),'utf8'));
  const p=buildProfile(domain,e,projectRoot);
  const actions=applyFiles(outputRoot,renderFiles(p),!!options.write);
  process.stdout.write(JSON.stringify({mode:options.write?'WRITE':'DRY_RUN',domain,actions},null,2)+'\n');
  if (actions.some(x=>x.action==='CONFLICT_UNMANAGED')) process.exitCode=2;
  return actions;
}
if (process.argv[1] && import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href) {
  try {run(process.argv.slice(2));} catch(e) {console.error('S0 FAILED: '+e.message);process.exitCode=1;}
}
