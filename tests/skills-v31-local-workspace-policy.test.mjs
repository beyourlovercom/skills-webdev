import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const config = JSON.parse(fs.readFileSync(new URL('../registry/skills.json',import.meta.url),'utf8'));
test('new V3.1 Windows Local projects default to isolated D drive workspace',()=>{
 const p=config.windows_local_workspace_policy;
 assert.equal(p.default_root_template,'D:\\ai\\sites\\<domain>\\');
 assert.equal(p.scope,'NEW_AUTHORIZED_V31_SITE_PROJECTS_ONLY');
 assert.deepEqual(p.required_directories,['source','mirror','local','uat','release']);
 assert.equal(p.first_new_site,'D:\\ai\\sites\\lelo.com');
 assert.equal(p.existing_sites,'PRESERVE_IN_PLACE_NO_MOVE_NO_REINSTALL_NO_DB_CHANGE');
 assert.equal(p.preexisting_lelo_blog,'C:\\ai\\lelo-blog-local');
 assert.equal(p.source_capture_gate,'R0_SCOPE_AND_PERMISSIONS_REQUIRED');
 assert.equal(p.site_release,'INDEPENDENT_OWNER_APPROVAL_REQUIRED');
});
test('new workspace policy does not mutate the V3.1.0 release version',()=>{
 assert.equal(config.system_release.version,'3.1.0');
 assert.equal(config.system_release.status,'IN_MAIN');
 assert.equal(config.windows_local_workspace_policy.policy_document,'docs/skills-v3.1/windows-local-workspace-policy.md');
});
