import {defineConfig} from 'vite';
import {readFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';

// Package version is human-readable; the Git revision identifies the exact deployed build.
const {version}=JSON.parse(readFileSync(new URL('./package.json',import.meta.url),'utf8'));
function commitRevision(){
 for(const value of [process.env.CF_PAGES_COMMIT_SHA,process.env.GITHUB_SHA]){
  if(/^[0-9a-f]{7,40}$/i.test(value||''))return value.toLowerCase();
 }
 try{
  const sha=execFileSync('git',['rev-parse','HEAD'],{cwd:import.meta.dirname,encoding:'utf8',stdio:['ignore','pipe','ignore']}).trim();
  if(/^[0-9a-f]{40}$/i.test(sha))return sha.toLowerCase();
 }catch{} // Source archives without Git metadata still build.
 return 'local';
}
export default defineConfig({
 base:'./',
 build:{outDir:'dist',emptyOutDir:true},
 define:{
  __APP_VERSION__:JSON.stringify(version),
  __APP_REVISION__:JSON.stringify(commitRevision())
 }
});
