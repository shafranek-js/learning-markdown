import {cp,copyFile,readdir,readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve,relative,join} from 'node:path';
import {createHash} from 'node:crypto';
const root=resolve(import.meta.dirname,'..'),dist=join(root,'dist');
for(const name of ['manifest.json','vendor','assets'])await cp(join(root,name),join(dist,name),{recursive:true,force:true});
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
