// Shared S1 evidence writer: private-only, symlink-aware, never overwrites.
import fs from 'node:fs';
import path from 'node:path';
const fail=s=>{throw Error('BLOCKED: '+s)};
export function writePrivateJson(output,content){
 if(typeof output!=='string'||!output.trim())fail('private output path required');
 const dest=path.resolve(output),parts=dest.split(path.sep),index=parts.lastIndexOf('.private-s1');
 if(index<0||index===parts.length-1)fail('output must be within .private-s1 directory');
 const root=parts.slice(0,index+1).join(path.sep)||path.sep;
 fs.mkdirSync(path.dirname(dest),{recursive:true,mode:0o700});
 const rootInfo=fs.lstatSync(root);
 if(rootInfo.isSymbolicLink()||!rootInfo.isDirectory())fail('private root cannot be a symlink');
 const rootReal=fs.realpathSync(root),parentReal=fs.realpathSync(path.dirname(dest));
 if(parentReal!==rootReal&&!parentReal.startsWith(rootReal+path.sep))fail('output parent escapes private root via symlink');
 if(process.platform!=='win32'&&(fs.statSync(root).mode&0o077)!==0)fail('private root permissions must be owner-only');
 fs.writeFileSync(dest,JSON.stringify(content,null,2),{flag:'wx',mode:0o600});
 return dest;
}
