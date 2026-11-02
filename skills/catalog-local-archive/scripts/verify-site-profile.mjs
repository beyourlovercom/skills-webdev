#!/usr/bin/env node
// Local-only profile validation. It does not resolve DNS or deploy anything.
import fs from "node:fs";
import assert from "node:assert/strict";

const input=process.argv[2];
if(!input){console.error("Usage: node verify-site-profile.mjs <site-profile.json>");process.exit(2);}
const d=JSON.parse(fs.readFileSync(input,"utf8"));
const source=new URL(d.source.origin);
const target=new URL(d.target.public_origin);
const local=new URL(d.environments.local_origin);
const dev=new URL(d.environments.online_dev_origin);
const www=new URL(d.environments.future_www_origin);
assert.equal(d.schema_version,1);
assert.equal(d.project_id,target.hostname.replace(/\.com$/,""));
assert.equal(source.hostname,"basworld.com");
assert.equal(local.hostname,"localdev."+target.hostname);
assert.equal(dev.hostname,"dev."+target.hostname);
assert.equal(www.origin,target.origin);
assert.ok(new Set([source.origin,local.origin,dev.origin,www.origin]).size===4);
assert.equal(d.target.indexing,"hold");
assert.equal(d.source.rights_status,"unverified");
assert.equal(d.source.copy_photos,false);
assert.equal(d.scope.real_site_crawl,false);
assert.equal(d.gates.licensed_source_backup,"BLOCKED_RIGHTS");
assert.equal(d.gates.online_dev,"BLOCKED_OWNER_PASS");
assert.equal(d.gates.www,"BLOCKED_OWNER_PASS");
assert.equal(d.gates.seo,"HOLD");
console.log(JSON.stringify({
 status:"PROFILE_SCHEMA_PASS",
 source:source.origin,
 windows_local:local.origin,
 online_dev:dev.origin,
 future_www:www.origin,
 runtime:"NOT_TESTED_BY_THIS_SCRIPT",
 source_archive:d.gates.licensed_source_backup,
 local_host:d.gates.live_local_hostname,
 deploy_gate:d.gates.online_dev,
 indexing:d.gates.seo
},null,2));
