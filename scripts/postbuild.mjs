import {cp,copyFile,readdir,readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve,relative,join} from 'node:path';
import {createHash} from 'node:crypto';
const root=resolve(import.meta.dirname,'..'),dist=join(root,'dist');
for(const name of ['manifest.json','vendor','assets'])await cp(join(root,name),join(dist,name),{recursive:true,force:true});

// Vite may relocate the manifest link to ./assets/manifest-<hash>.json.
// The manifest's relative icon paths would then resolve as /assets/assets/*.
// Use the copied root manifest for both Cloudflare and subpath GitHub Pages.
const htmlPath=join(dist,'index.html');
const html=await readFile(htmlPath,'utf8');
const manifestLinks=html.match(/<link\b[^>]*\brel=["']manifest["'][^>]*>/gi)||[];
if(manifestLinks.length!==1)throw new Error('Expected exactly one manifest link in built index.html');
const corrected=html.replace(/(<link\b[^>]*\brel=["']manifest["'][^>]*\bhref=["'])[^"']+(["'])/i,
 '$1./manifest.json$2');
if(!corrected.includes('<link rel="manifest" href="./manifest.json"'))
 throw new Error('Unable to point built HTML at the root PWA manifest');
await writeFile(htmlPath,corrected);
// Fail the build if any manifest icon would resolve to a missing/wrong path.
const appManifest=JSON.parse(await readFile(join(dist,'manifest.json'),'utf8'));
for(const icon of appManifest.icons||[]){
 const location=new URL(icon.src,'https://example.test/project/manifest.json').pathname;
 if(!location.startsWith('/project/assets/')||location.includes('/assets/assets/'))
  throw new Error('Invalid PWA icon path: '+icon.src);
 await readFile(join(dist,location.slice('/project/'.length)));
}
const files=[];
async function collect(path){for(const d of await readdir(path,{withFileTypes:true})){
 const full=join(path,d.name);if(d.isDirectory())await collect(full);else files.push('./'+relative(dist,full).replaceAll('\\','/'));
}}
await collect(dist);
const original=await readFile(join(root,'sw.js'),'utf8');
const precache=files.filter(x=>x!=='./sw.js').sort();
const hash=createHash('sha256');
for(const asset of precache){
 hash.update(asset);
 hash.update(await readFile(join(dist,asset.slice(2))));
}
const cacheVersion='learning-markdown-'+hash.digest('hex').slice(0,12);
const built=original.replace(/const VERSION='[^']+';/, `const VERSION='${cacheVersion}';`).replace(/const urls=\[[\s\S]*?\]\.map\(path=>new URL\(path,ROOT\)\.href\);/,
 `const urls=${JSON.stringify(precache)}.map(path=>new URL(path,ROOT).href);`);
await writeFile(join(dist,'sw.js'),built);
console.log(`Built application: ${precache.length} assets pre-cached for offline use.`);
