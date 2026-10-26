// Capture the actual production application for the README.
// Run after npm run build and npx playwright install chromium.
import {spawn} from 'node:child_process';
import {mkdir} from 'node:fs/promises';
import {resolve} from 'node:path';
import {chromium} from '@playwright/test';

const base='http://127.0.0.1:4173/';
const file=resolve('docs/images/readme-studio.png');
const server=spawn('npm',['run','preview','--','--host','127.0.0.1','--port','4173','--strictPort'],{
 stdio:'inherit',env:{...process.env,CI:'true'}
});
let browser;
try{
 let ready=false;
 for(let attempt=0;attempt<80;attempt++){
  if(server.exitCode!==null)throw Error('Vite preview stopped before it was reachable.');
  try{const response=await fetch(base);if(response.ok){ready=true;break;}}catch{}
  await new Promise(resolve=>setTimeout(resolve,250));
 }
 if(!ready)throw Error('Vite preview did not start.');
 browser=await chromium.launch({headless:true});
 const page=await browser.newPage({viewport:{width:1600,height:850},deviceScaleFactor:1});
 await page.goto(base,{waitUntil:'networkidle'});
 await page.locator('#theme-selector').selectOption('dracula');
 await page.locator('#sandbox-mode-btn').click();
 // Replace the default course draft with anonymous, reproducible demonstration text.
 await page.locator('#markdown-input').fill([
  '# Markdown, made practical',
  '',
  '> **Write in Markdown.** See your formatted content as you type.',
  '',
  '## What you can do',
  '',
  '- Learn syntax with interactive lessons',
  '- Edit in Split View with **Wrap text**',
  '- Use **Multi-cursor** for repeated edits',
  '- Export clean **Markdown** and **HTML**',
  '',
  '## Quick example',
  '',
  '| Source | Result |',
  '| :--- | :--- |',
  '| `**bold**` | **bold** |',
  '| `_italic_` | _italic_ |',
  '',
  '[Open the CommonMark reference](https://spec.commonmark.org/)'
 ].join('\n'));
 // The screenshot is taken from a real production build; no HTML is modified.
 await page.locator('#markdown-preview h1').waitFor();
 await page.evaluate(()=>document.fonts.ready);
 await page.locator('#wrap-text-toggle').waitFor();
 if(await page.locator('#wrap-text-toggle').getAttribute('aria-pressed')!=='true')
  throw Error('Expected Wrap text on in the current production app.');
 await mkdir(resolve('docs/images'),{recursive:true});
 await page.screenshot({path:file,animations:'disabled'});
 console.log('Captured real Learning Markdown screenshot:',file);
}finally{
 await browser?.close();
 server.kill('SIGTERM');
}
