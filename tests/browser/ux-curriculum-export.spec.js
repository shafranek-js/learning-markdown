import {test,expect} from '@playwright/test';
import {setAppLanguage,setAppTheme} from './support/settings.js';
import {readFile} from 'node:fs/promises';
import {openCompatibility,closeCompatibility} from './support/compatibility.js';

test('Advanced curriculum navigation keeps the base course progress separate',async({page})=>{
 await page.goto('/');
 const base=await page.locator('#progress-label').innerText();
 await page.locator('#advanced-course-btn').click();
 await expect(page.locator('#lesson-badge')).toContainText('1 / 7');
 await expect(page.locator('#lesson-nav-list button')).toHaveCount(15);
 await expect(page.locator('#lesson-title')).toContainText('Portability');
 await expect(page.locator('#advanced-toolbar')).toBeVisible();
 await expect(page.locator('#deep-practice')).toBeHidden();
 await expect(page.locator('#progress-label')).toHaveText(base);
 await expect(page.locator('#advanced-progress-label')).toContainText('0 / 7');
});

test('All seven Beyond Markdown lesson solutions earn an independent 7/7 certificate',async({page})=>{
 await page.goto('/');
 const basicProgress=await page.locator('#progress-label').innerText();
 await page.locator('#advanced-course-btn').click();
 for(let i=0;i<7;i++){
  if(i>0)await page.locator('#next-lesson-btn').click();
  await page.locator('#toggle-hint-btn').click();
  await page.locator('#insert-solution-btn').click();
  const count=i===6?6:3;
  await expect(page.locator('#tasks-counter-badge')).toHaveText(count+' / '+count);
  await expect(page.locator('#lesson-status-pill')).toContainText('Completed');
 }
 await expect(page.locator('#advanced-progress-label')).toContainText('7 / 7');
 await expect(page.locator('#progress-label')).toHaveText(basicProgress);
 await page.locator('#advanced-cert-top-btn').click();
 await expect(page.locator('#advanced-cert-count')).toHaveText('7 / 7');
 await expect(page.locator('#download-advanced-cert')).toBeEnabled();
 await expect(page.locator('#copy-advanced-cert')).toBeEnabled();
});

test('Advanced drafts and completion are independent and persist after reload',async({page})=>{
 await page.goto('/');
 await page.locator('#advanced-course-btn').click();
 await page.locator('#markdown-input').fill('<u>Persisted advanced draft</u>');
 await expect(page.locator('#tasks-counter-badge')).toHaveText('1 / 3');
 await page.reload();
 await expect(page.locator('#markdown-input')).toHaveValue('<u>Persisted advanced draft</u>');
 await expect(page.locator('#lesson-badge')).toContainText('1 / 7');
 await page.locator('#contents-toggle-btn').click();
 await expect(page.locator('#lesson-nav-list button')).toHaveCount(15);
 await page.locator('#lesson-nav-list button').first().click();
 await expect(page.locator('#markdown-input')).not.toHaveValue('<u>Persisted advanced draft</u>');
 await page.locator('#contents-toggle-btn').click();
 await page.locator('#lesson-nav-list button').nth(8).click();
 await expect(page.locator('#markdown-input')).toHaveValue('<u>Persisted advanced draft</u>');
});

test('Advanced certificate cannot be downloaded before completion and escapes user name',async({page})=>{
 await page.goto('/');
 await page.locator('#advanced-cert-top-btn').click();
 await expect(page.locator('#download-advanced-cert')).toBeDisabled();
 await expect(page.locator('#copy-advanced-cert')).toBeDisabled();
 await page.locator('#close-advanced-certificate-btn').click();
 await page.evaluate(()=>{
  const state=JSON.parse(localStorage.getItem('md_course_state_v1'));
  state.completedAdvancedLessons=['04_01','04_02','04_03','04_04','04_05','04_06','04_07'];
  localStorage.setItem('md_course_state_v1',JSON.stringify(state));
 });
 await page.reload();
 await page.locator('#advanced-cert-top-btn').click();
 await page.locator('#advanced-cert-name').fill('<img src=x onerror=alert(1)>');
 const waiting=page.waitForEvent('download');
 await page.locator('#download-advanced-cert').click();
 const download=await waiting;
 const {readFile}=await import('node:fs/promises');
 const html=await readFile(await download.path(),'utf8');
 expect(html).toContain('&lt;img src=x onerror=alert(1)&gt;');
 expect(html).not.toContain('<img src=x');
 expect(html).toContain('7 / 7');
 expect(html).not.toContain('onclick=');
});

test('All advanced lessons translate into Czech, Ukrainian, Romanian and Russian',async({page})=>{
 await page.goto('/');
 await page.locator('#advanced-course-btn').click();
 for(const [lang,title] of [['ru','HTML и совместимость'],['cs','HTML a přenositelnost'],['uk','HTML і сумісність'],['ro','HTML și compatibilitate']]){
  await setAppLanguage(page,lang);
  await expect(page.locator('#lesson-title')).toHaveText(title);
  await expect(page.locator('#tasks-counter-badge')).toHaveText('0 / 3');
 }
});


test('Resetting core course preserves advanced completion and advanced drafts',async({page})=>{
 await page.goto('/');
 await page.locator('#advanced-course-btn').click();
 await page.locator('#markdown-input').fill('<u>Saved advanced draft</u>');
 await expect(page.locator('#tasks-counter-badge')).toHaveText('1 / 3');
 await page.locator('#toggle-hint-btn').click();
 await page.locator('#insert-solution-btn').click();
 await expect(page.locator('#advanced-progress-label')).toContainText('1 / 7');
 const advancedDraft=await page.locator('#markdown-input').inputValue();
 await page.locator('#contents-toggle-btn').click();
 page.once('dialog',dialog=>dialog.accept());
 await page.locator('#reset-course-btn').click();
 await expect(page.locator('#progress-label')).toContainText('0');
 await expect(page.locator('#advanced-progress-label')).toContainText('1 / 7');
 await page.locator('#advanced-course-btn').click();
 await expect(page.locator('#markdown-input')).toHaveValue(advancedDraft);
});


test('Portability panel diagnoses Markdown differences without treating code as active HTML',async({page})=>{
 await page.goto('/');
 await page.locator('#compatibility-trigger').click();
 const input=page.locator('#markdown-input');
 await input.fill('# Safe heading\n\n**Portable text**');
 await expect(page.locator('#compatibility-advanced-status')).toHaveText('Not detected');
 await input.fill('| A | B |\n| --- | --- |\n| 1 | 2 |');
 await expect(page.locator('#compatibility-gfm-status')).toHaveText('May differ');
 await input.fill('~~~html\n<span class="af-color-blue">Code only</span>\n~~~');
 await expect(page.locator('#compatibility-advanced-status')).toHaveText('Not detected');
 await input.fill('<u>Underlined</u>');
 await expect(page.locator('#compatibility-advanced-status')).toContainText('May be removed');
});

test('Markdown download warns about portability but keeps source bytes unchanged',async({page})=>{
 await page.goto('/');
 const input=page.locator('#markdown-input');
 const source='<div class="af-align-center">Centered</div>';
 await input.fill(source);
 page.once('dialog',dialog=>dialog.dismiss());
 await closeCompatibility(page);
 await page.locator('#export-trigger').click();
 await page.locator('#download-md-btn').click();
 page.once('dialog',dialog=>{expect(dialog.message()).toContain('HTML/CSS');dialog.accept();});
 const pending=page.waitForEvent('download');
 await closeCompatibility(page);
 await page.locator('#export-trigger').click();
 await page.locator('#download-md-btn').click();
 const artifact=await pending;
 const {readFile}=await import('node:fs/promises');
 const file=await readFile(await artifact.path(),'utf8');
 expect(file).toBe(source);
 await input.fill('# Ordinary document');
 const second=page.waitForEvent('download');
 await closeCompatibility(page);
 await page.locator('#export-trigger').click();
 await page.locator('#download-md-btn').click();
 await second;
});

test('Standalone exported HTML uses strict CSP and preserves print-only page breaks',async({page})=>{
 await page.goto('/');
 await page.locator('#markdown-input').fill('<h1>Printable document</h1>\n\n<div class="af-page-break"></div>\n\n<div class="af-align-center">Page two</div>\n\n<script>alert(1)</script>');
 const pending=page.waitForEvent('download');
 await closeCompatibility(page);
 await page.locator('#export-trigger').click();
 await page.locator('#download-html-btn').click();
 const result=await pending;
 const {readFile}=await import('node:fs/promises');
 const output=await readFile(await result.path(),'utf8');
 expect(output).toContain('script-src &#39;none&#39;');
 expect(output).toContain('object-src &#39;none&#39;');
 expect(output).toContain('break-after:page');
 expect(output).not.toContain('<script>alert(1)</script>');
 await page.setContent(output);
 await page.emulateMedia({media:'print'});
 const style=await page.locator('.af-page-break').evaluate(node=>getComputedStyle(node).breakAfter);
 expect(style).toBe('page');
 const pdf=await page.pdf({format:'A4',printBackground:true});
 expect(pdf.subarray(0,5).toString()).toBe('%PDF-');
 expect(pdf.length).toBeGreaterThan(1500);
});

test('Print / PDF opens a printable HTML copy rather than printing the application UI',async({page,context})=>{
 await page.goto('/');
 await page.locator('#markdown-input').fill('<u>Print-only document</u>\n\n<div class="af-page-break"></div>');
 const nextPage=context.waitForEvent('page');
 await closeCompatibility(page);
 await page.locator('#export-trigger').click();
 await page.locator('#print-document-btn').click();
 const printable=await nextPage;
 await printable.waitForLoadState('domcontentloaded');
 await expect(printable.locator('main.md-preview u')).toHaveText('Print-only document');
 await expect(printable.locator('main.md-preview .af-page-break')).toHaveCount(1);
 await expect(printable.locator('#contents-toggle-btn')).toHaveCount(0);
 await printable.close();
});

test('Offline reload uses the versioned service-worker shell and still renders Markdown',async({page,context})=>{
 await page.goto('/');
 await page.waitForFunction(async()=>{
  if(!('serviceWorker' in navigator))return false;
  await navigator.serviceWorker.ready;
  return !!navigator.serviceWorker.controller;
 },null,{timeout:15000});
 const source='# Offline heading\n\n**Available without a connection**';
 await page.locator('#markdown-input').fill(source);
 await context.setOffline(true);
 try{
  await page.reload({waitUntil:'domcontentloaded'});
  await expect(page.locator('#markdown-input')).toHaveValue(source);
  await expect(page.locator('#markdown-preview h1')).toHaveText('Offline heading');
 }finally{await context.setOffline(false);}
});


