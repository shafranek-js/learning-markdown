// Compare the real application builds after deployment. Uses isolated, uncached browser contexts.
import {chromium} from '@playwright/test';
import {readFile} from 'node:fs/promises';

const {version}=JSON.parse(await readFile(new URL('../package.json',import.meta.url),'utf8'));
const expected=(process.env.EXPECTED_SHA||'').trim().toLowerCase();
if(!/^[a-f0-9]{40}$/.test(expected))throw new Error('EXPECTED_SHA requires a full 40-character Git SHA.');
const short=expected.slice(0,7);
const locations=[
 ['GitHub Pages','https://shafranek-js.github.io/learning-markdown/'],
 ['Cloudflare Pages','https://learning-markdown.pages.dev/']
];
const maxAttempts=16,delayMs=20000;
const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const browser=await chromium.launch({headless:true});
async function inspectSite(name,address){
 const context=await browser.newContext({serviceWorkers:'block',ignoreHTTPSErrors:false});
 const page=await context.newPage();
 const problems=[];
 let versionText='not loaded';
 try{
  const response=await page.goto(address,{waitUntil:'domcontentloaded',timeout:30000});
  if(!response?.ok())problems.push('site HTTP '+(response?.status()??'no response'));
  await page.locator('#app-version-status').waitFor({state:'visible',timeout:15000});
  await page.waitForFunction(()=>/^v\d+\.\d+\.\d+\s*·\s*(?:[a-f\d]{7}|local)$/.test(
   document.querySelector('#app-version-status')?.textContent?.trim()||''),null,{timeout:10000});
  versionText=(await page.locator('#app-version-status').innerText()).trim();
  const wanted='v'+version+' · '+short;
  if(versionText!==wanted)problems.push('build mismatch: expected '+wanted+' but received '+versionText);
  const wrap=page.locator('#wrap-text-toggle');
  await wrap.waitFor({state:'visible',timeout:12000});
  if(await wrap.getAttribute('aria-pressed')!=='true')problems.push('Wrap text is not enabled by default');
  await page.locator('#markdown-input').fill('# Deployment check\n\n**Preview renders**');
  await page.locator('#markdown-preview h1').getByText('Deployment check').waitFor({timeout:10000});
  const manifestUrl=new URL('./manifest.json',address).href;
  const manifestResponse=await context.request.get(manifestUrl,{timeout:15000});
  if(!manifestResponse.ok())throw new Error('Manifest unavailable: HTTP '+manifestResponse.status());
  const manifest=await manifestResponse.json();
  const pngs=(manifest.icons||[]).filter(icon=>icon.type==='image/png');
  if(pngs.length<2)problems.push('PWA manifest lacks 192/512 PNG icons');
  for(const icon of pngs){
   const iconUrl=new URL(icon.src,manifestUrl).href;
   const result=await context.request.get(iconUrl,{timeout:15000});
   const mime=result.headers()['content-type']||'';
   if(!result.ok()||!mime.toLowerCase().includes('image/png'))
    problems.push('PWA icon failed: '+iconUrl+' (HTTP '+result.status()+', '+mime+')');
  }
 }catch(error){problems.push(String(error.message||error).slice(0,250));}
 finally{await context.close();}
 return {name,versionText,problems};
}
try{
 for(let attempt=1;attempt<=maxAttempts;attempt++){
  const results=[];
  for(const [name,address] of locations)results.push(await inspectSite(name,address));
  const summary=results.map(r=>r.name+': '+r.versionText+(r.problems.length?' — '+r.problems.join('; '):' OK')).join(' | ');
  console.log('Live deployment parity '+attempt+'/'+maxAttempts+': '+summary);
  if(results.every(r=>r.problems.length===0)){
   console.log('PASS: both live hosts serve version '+version+', revision '+short+', working editor/Preview and PWA icons.');
   process.exitCode=0;
   break;
  }
  if(attempt===maxAttempts){
   console.error('FAIL: the deployment hosts did not both reach commit '+expected+' with working core functionality.');
   process.exitCode=1;
  }else await pause(delayMs);
 }
}finally{await browser.close();}
