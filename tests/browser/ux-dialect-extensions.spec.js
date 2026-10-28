import {test,expect} from '@playwright/test';
import {setAppLanguage,setAppTheme} from './support/settings.js';
import {readFile} from 'node:fs/promises';
import {openCompatibility,closeCompatibility} from './support/compatibility.js';

test('issue #8 GFM alignment survives live Preview, standalone HTML and print',async({page})=>{
 await page.goto('/');
 const source='| Product | Quantity | Price |\n| :--- | :---: | ---: |\n| Box | 12 | 99.50 |';
 const input=page.locator('#markdown-input');
 await input.fill(source);
 const expected=['left','center','right'];
 for(const scope of ['thead th','tbody td']){
  const cells=page.locator('#markdown-preview '+scope);
  await expect(cells).toHaveCount(3);
  for(let i=0;i<3;i++){
   await expect(cells.nth(i)).toHaveAttribute('align',expected[i]);
   expect(await cells.nth(i).evaluate(el=>getComputedStyle(el).textAlign)).toBe(expected[i]);
  }
 }
 const downloadPromise=page.waitForEvent('download');
 await closeCompatibility(page);
 await page.locator('#export-trigger').click();
 await page.locator('#download-html-btn').click();
 const download=await downloadPromise;
 const {readFile}=await import('node:fs/promises');
 const html=await readFile(await download.path(),'utf8');
 for(const align of expected)expect(html).toContain('align="'+align+'"');
 // CSS is minified in production; verify actual computed styles below instead.
 expect(html).not.toContain('<script');
 await page.setContent(html);
 for(const scope of ['thead th','tbody td']){
  for(let i=0;i<3;i++){
   expect(await page.locator('main.md-preview '+scope).nth(i)
    .evaluate(el=>getComputedStyle(el).textAlign)).toBe(expected[i]);
  }
 }
 await page.emulateMedia({media:'print'});
 for(let i=0;i<3;i++)
  expect(await page.locator('main.md-preview tbody td').nth(i)
   .evaluate(el=>getComputedStyle(el).textAlign)).toBe(expected[i]);
});

test('issue #8 sanitizer rejects injected alignment and styling',async({page})=>{
 await page.goto('/');
 const input=page.locator('#markdown-input');
 const source='<table><tr><td align="right" onclick="alert(1)" style="text-align:left">OK</td>'
 +'<td align="center;position:fixed" style="color:red">Bad</td></tr></table>';
 await input.fill(source);
 const cells=page.locator('#markdown-preview td');
 await expect(cells).toHaveCount(2);
 await expect(cells.first()).toHaveAttribute('align','right');
 await expect(cells.first()).not.toHaveAttribute('onclick',/./);
 await expect(cells.first()).not.toHaveAttribute('style',/./);
 await expect(cells.nth(1)).not.toHaveAttribute('align',/./);
 await expect(cells.nth(1)).not.toHaveAttribute('style',/./);
 await expect(input).toHaveValue(source);
 await page.locator('#dialect-selector').selectOption('commonmark');
 await input.fill('| A | B |\n| :--- | ---: |\n| x | y |');
 await expect(page.locator('#markdown-preview table')).toHaveCount(0);
});



test('issue #9 six fenced languages are highlighted and safely exported',async({page})=>{
 await page.goto('/');
 const source=[
  '~~~javascript','const n = 42;','~~~',
  '~~~json','{"active": true, "count": 3}','~~~',
  '~~~html','<div title="hi">& text</div>','~~~',
  '~~~css','.demo { color: red; }','~~~',
  '~~~sql','SELECT id FROM products;','~~~',
  '~~~python','def greet(name):','    return name','~~~',
  '~~~unknown','<script>alert(1)</script>','~~~'
 ].join('\n\n').replace(/\n\n(?=~~~)/g,'\n');
 const input=page.locator('#markdown-input');
 await input.fill(source);
 const blocks=page.locator('#markdown-preview pre > code');
 await expect(blocks).toHaveCount(7);
 for(let i=0;i<6;i++){
  await expect(blocks.nth(i).locator('span[class^="hljs-"]').first()).toBeVisible();
  // Check actual colored output, not a particular grammar's first token.
  const colors=await blocks.nth(i).locator('span[class^="hljs-"]')
   .evaluateAll(nodes=>nodes.map(el=>getComputedStyle(el).color));
  expect(colors.some(color=>color!=='rgb(248, 250, 252)')).toBe(true);
 }
 await expect(blocks.nth(6).locator('span[class^="hljs-"]')).toHaveCount(0);
 await expect(page.locator('#markdown-preview script')).toHaveCount(0);
 await expect(input).toHaveValue(source);
 for(const theme of ['codepen','midnight','daylight','dracula','nord','solarized']){
  await setAppTheme(page,theme);
  await expect(blocks.first().locator('.hljs-keyword')).toHaveCount(1);
 }
 await setAppLanguage(page,'ru');
 // Language switching loads the corresponding per-language draft.
 await input.fill(source);
 await expect(page.locator('#markdown-preview pre').first()).toHaveAttribute('title',/Офлайн-подсветка/);
 const promise=page.waitForEvent('download');
 await closeCompatibility(page);
 await page.locator('#export-trigger').click();
 await page.locator('#download-html-btn').click();
 const dl=await promise;
 const {readFile}=await import('node:fs/promises');
 const exported=await readFile(await dl.path(),'utf8');
 expect(exported).toContain('hljs-keyword');
 expect(exported).toContain('<style>'); // Computed styles are checked below; Vite minifies selectors.
 expect(exported).not.toContain('<script');
 expect(exported).toContain('Content-Security-Policy');
 await page.setContent(exported);
 expect(await page.locator('main pre code .hljs-keyword').count()).toBeGreaterThan(0);
 await page.emulateMedia({media:'print'});
 expect(await page.locator('main pre code .hljs-keyword').first()
  .evaluate(el=>getComputedStyle(el).color)).toBe('rgb(76, 29, 149)');
});

test('issue #9 highlighted Markdown remains available on offline reload',async({page,context})=>{
 await page.goto('/');
 await page.waitForFunction(async()=>{
  if(!('serviceWorker' in navigator))return false;
  await navigator.serviceWorker.ready;
  return !!navigator.serviceWorker.controller;
 },null,{timeout:15000});
 const source='~~~js\nconst ready = true;\n~~~';
 await page.locator('#markdown-input').fill(source);
 await expect(page.locator('#markdown-preview .hljs-keyword')).toHaveCount(1);
 await context.setOffline(true);
 try{
  await page.reload({waitUntil:'domcontentloaded'});
  await expect(page.locator('#markdown-input')).toHaveValue(source);
  await expect(page.locator('#markdown-preview .hljs-keyword')).toHaveCount(1);
 }finally{await context.setOffline(false);}
});


test('issue #10 opt-in line breaks persist by document and preserve standard dialects',async({page})=>{
 await page.goto('/');
 const source='First line\nSecond line';
 const input=page.locator('#markdown-input');
 await input.fill(source);
 await page.locator('#compatibility-trigger').click();
 const toggle=page.locator('#extension-softbreaks-toggle');
 await expect(toggle).toHaveValue('off');
 await expect(page.locator('#markdown-preview p br')).toHaveCount(0);
 await openCompatibility(page);
 await toggle.selectOption('on');
 await expect(page.locator('#markdown-preview p br')).toHaveCount(1);
 await expect(input).toHaveValue(source);
 await expect(page.locator('#extension-matrix-body tr')).toHaveCount(8);
 await page.reload();
 await expect(toggle).toHaveValue('on');
 // The <details> panel intentionally collapses after a page reload.
 await page.locator('#compatibility-trigger').click();
 await expect(toggle).toBeVisible();
 await expect(page.locator('#markdown-preview p br')).toHaveCount(1);
 await page.locator('#dialect-selector').selectOption('commonmark');
 await expect(toggle).toBeDisabled();
 await expect(page.locator('#markdown-preview p br')).toHaveCount(0);
 await page.locator('#dialect-selector').selectOption('original');
 await expect(toggle).toBeDisabled();
 await expect(page.locator('#markdown-preview p br')).toHaveCount(0);
 await page.locator('#dialect-selector').selectOption('gfm');
 await expect(toggle).toBeEnabled();
 await expect(toggle).toHaveValue('on');
 await page.locator('#help-menu-trigger').click();
 await page.locator('#sandbox-mode-btn').click();
 await expect(toggle).toHaveValue('off');
 await input.fill(source);
 await openCompatibility(page);
 await toggle.selectOption('on');
 await expect(page.locator('#markdown-preview p br')).toHaveCount(1);
 await page.locator('#help-menu-trigger').click();
 await page.locator('#sandbox-mode-btn').click();
 await expect(toggle).toHaveValue('on');
 await setAppLanguage(page,'ru');
 await expect(toggle).toHaveValue('off');
 await expect(page.locator('#extension-softbreaks-label')).toContainText('переносы');
 await expect(page.locator('#extension-matrix-title')).toHaveText('Матрица совместимости');
 await input.fill(source);
 await openCompatibility(page);
 await toggle.selectOption('on');
 await expect(page.locator('#markdown-preview p br')).toHaveCount(1);
});

test('issue #10 warns about nonstandard MD export without modifying Markdown',async({page})=>{
 await page.goto('/');
 const source='Hello\nWorld';
 const input=page.locator('#markdown-input');
 await input.fill(source);
 await page.locator('#compatibility-trigger').click();
 await openCompatibility(page);
 await page.locator('#extension-softbreaks-toggle').selectOption('on');
 const messages=[];
 page.once('dialog',async dialog=>{messages.push(dialog.message());await dialog.accept();});
 const downloadPromise=page.waitForEvent('download');
 await closeCompatibility(page);
 await page.locator('#export-trigger').click();
 await page.locator('#download-md-btn').click();
 const file=await downloadPromise;
 expect(messages).toHaveLength(1);
 expect(messages[0]).toContain('single newlines');
 const {readFile}=await import('node:fs/promises');
 expect(await readFile(await file.path(),'utf8')).toBe(source);
 const htmlPromise=page.waitForEvent('download');
 await closeCompatibility(page);
 await page.locator('#export-trigger').click();
 await page.locator('#download-html-btn').click();
 const htmlFile=await htmlPromise;
 const html=await readFile(await htmlFile.path(),'utf8');
 expect(html).toMatch(/Hello<br\s*\/?>World/);
 expect(html).not.toContain('<script');
 await expect(input).toHaveValue(source);
});



test('issue #11 footnotes are optional with repeated references and route-safe backlinks',async({page})=>{
 await page.goto('/');
 const input=page.locator('#markdown-input');
 const source='One fact[^study], repeated[^study].\n\n[^study]: **Reliable** source.\n\n    More details.';
 await input.fill(source);
 const panel=page.locator('#compatibility-panel');
 await page.locator('#compatibility-trigger').click();
 const toggle=page.locator('#extension-footnotes-toggle');
 await expect(toggle).toHaveValue('off');
 await expect(page.locator('#markdown-preview .md-footnotes')).toHaveCount(0);
 await openCompatibility(page);
 await toggle.selectOption('on');
 await expect(page.locator('#markdown-preview .md-footnotes')).toHaveCount(1);
 await expect(page.locator('#markdown-preview .fn-ref')).toHaveCount(2);
 await expect(page.locator('#markdown-preview .fn-backref')).toHaveCount(2);
 await expect(page.locator('#markdown-preview .md-footnotes strong')).toHaveText('Reliable');
 await expect(page.locator('#markdown-preview .md-footnotes p')).toHaveCount(2);
 const oldHash=await page.evaluate(()=>location.hash);
 await closeCompatibility(page);
 await page.locator('#markdown-preview .fn-ref').first().click();
 expect(await page.evaluate(()=>location.hash)).toBe(oldHash);
 await page.locator('#markdown-preview .fn-backref').nth(1).click();
 expect(await page.evaluate(()=>location.hash)).toBe(oldHash);
 await expect(input).toHaveValue(source);
 await page.reload();
 await expect(toggle).toHaveValue('on');
 await expect(page.locator('#markdown-preview .fn-ref')).toHaveCount(2);
 await page.locator('#dialect-selector').selectOption('commonmark');
 await expect(toggle).toBeDisabled();
 await expect(page.locator('#markdown-preview .fn-ref')).toHaveCount(0);
 await page.locator('#dialect-selector').selectOption('original');
 await expect(page.locator('#markdown-preview .fn-ref')).toHaveCount(0);
 await page.locator('#dialect-selector').selectOption('gfm');
 await expect(toggle).toBeEnabled();
 await expect(toggle).toHaveValue('on');
 await expect(page.locator('#markdown-preview .fn-ref')).toHaveCount(2);
});

test('issue #11 footnote exercise and safe standalone HTML / print export',async({page})=>{
 await page.goto('/');
 await page.locator('#compatibility-trigger').click();
 const toggle=page.locator('#extension-footnotes-toggle');
 await openCompatibility(page);
 await toggle.selectOption('on');
 const input=page.locator('#markdown-input');
 await input.fill('');
 await openCompatibility(page);
 await page.locator('#extension-footnote-demo').click();
 await expect(input).toHaveValue(/A documented claim\[\^source\]/);
 await expect(page.locator('#markdown-preview .fn-ref')).toHaveCount(2);
 await expect(page.locator('#markdown-preview .fn-backref')).toHaveCount(2);
 await expect(page.locator('#extension-footnote-practice')).toContainText('Complete');
 await setAppLanguage(page,'ru');
 await expect(page.locator('#extension-footnotes-label')).toContainText('Сноски');
 await expect(toggle).toHaveValue('off'); // separate language document
 await openCompatibility(page);
 await toggle.selectOption('on');
 const source='Threat[^s].\n\n[^s]: <script>alert(1)</script> Plain text.';
 await input.fill(source);
 await expect(page.locator('#markdown-preview script')).toHaveCount(0);
 await expect(page.locator('#markdown-preview .fn-ref')).toHaveCount(1);
 const download=page.waitForEvent('download');
 await closeCompatibility(page);
 await page.locator('#export-trigger').click();
 await page.locator('#download-html-btn').click();
 const file=await download;
 const {readFile}=await import('node:fs/promises');
 const html=await readFile(await file.path(),'utf8');
 expect(html).toContain('fn-item-1');
 expect(html).toContain('fn-ref-1-1');
 expect(html).toContain('fn-backref');
 expect(html).not.toContain('<script');
 await page.setContent(html);
 await expect(page.locator('main.md-preview .md-footnotes')).toHaveCount(1);
 await expect(page.locator('main.md-preview .fn-backref')).toHaveCount(1);
 await page.emulateMedia({media:'print'});
 expect(await page.locator('main.md-preview .md-footnotes').evaluate(el=>getComputedStyle(el).borderTopStyle)).toBe('solid');
});

test('issue #11 MD export warns for non-GFM footnotes and leaves source intact',async({page})=>{
 await page.goto('/');
 await page.locator('#compatibility-trigger').click();
 await openCompatibility(page);
 await page.locator('#extension-footnotes-toggle').selectOption('on');
 const source='A[^one].\n\n[^one]: Note.';
 await page.locator('#markdown-input').fill(source);
 const messages=[];
 page.once('dialog',async dialog=>{messages.push(dialog.message());await dialog.accept();});
 const downloading=page.waitForEvent('download');
 await closeCompatibility(page);
 await page.locator('#export-trigger').click();
 await page.locator('#download-md-btn').click();
 const file=await downloading;
 const {readFile}=await import('node:fs/promises');
 expect(await readFile(await file.path(),'utf8')).toBe(source);
 expect(messages).toHaveLength(1);
 expect(messages[0]).toContain('GitHub.com');
});


test('issue #12 safe heading IDs and live TOC across three Markdown dialects',async({page})=>{
 await page.goto('/');
 const source='# Intro\n\n## Details\n\n## Details\n\n### Привет, мир!\n\n#### 42 steps\n\n##### !!!';
 const input=page.locator('#markdown-input');
 await input.fill(source);
 const expected=['intro','details','details-2','привет-мир','section-42-steps','section'];
 for(const mode of ['gfm','commonmark','original']){
  await page.locator('#dialect-selector').selectOption(mode);
  expect(await page.locator('#markdown-preview :is(h1,h2,h3,h4,h5,h6)').evaluateAll(els=>els.map(el=>el.id))).toEqual(expected);
 }
 await page.locator('#outline-trigger').click();
 await expect(page.locator('#toc-list a')).toHaveCount(6);
 await page.locator('#toc-depth').selectOption('2');
 await expect(page.locator('#toc-list a')).toHaveCount(3);
 await expect(page.locator('#toc-list a').nth(2)).toHaveAttribute('href','#details-2');
 await expect(input).toHaveValue(source);
 await page.locator('#toc-insert').click();
 await expect(input).toHaveValue(/- \[Intro\]\(#intro\)/);
 await expect(input).toHaveValue(/- \[Details\]\(#details-2\)/);
 await expect(page.locator('#toc-list a')).toHaveCount(3);
});

test('issue #12 TOC keyboard navigation preserves lesson hash even with Unicode headings',async({page})=>{
 await page.goto('/');
 await page.locator('#markdown-input').fill('# Start\n\n## Next\n\n## Next\n\n### 中文标题');
 await page.locator('#outline-trigger').click();
 const hash=await page.evaluate(()=>location.hash);
 await page.locator('#toc-list a[href="#next-2"]').click();
 expect(await page.evaluate(()=>location.hash)).toBe(hash);
 await page.locator('#toc-list a[href="#中文标题"]').focus();
 await page.keyboard.press('Enter');
 expect(await page.evaluate(()=>location.hash)).toBe(hash);
 await expect(page.locator('#toc-list a')).toHaveCount(4);
 await page.reload();
 await expect(page.locator('#toc-panel')).not.toHaveAttribute('open','');
 await page.locator('#outline-trigger').click();
 await expect(page.locator('#toc-panel')).toHaveAttribute('open','');
 await expect(page.locator('#toc-depth')).toHaveValue('6');
});

test('issue #12 opt-in custom heading IDs stay isolated and survive HTML export and print',async({page})=>{
 await page.goto('/');
 const input=page.locator('#markdown-input');
 const source='# Title {#chosen-id}\n\n## Another {#chosen-id}\n\n## Защита {#безопасно}';
 await input.fill(source);
 await page.locator('#compatibility-trigger').click();
 const toggle=page.locator('#extension-headingids-toggle');
 await expect(toggle).toHaveValue('off');
 await expect(page.locator('#markdown-preview h1')).not.toHaveAttribute('id','chosen-id');
 await openCompatibility(page);
 await toggle.selectOption('on');
 await expect(page.locator('#markdown-preview h1')).toHaveAttribute('id','chosen-id');
 await expect(page.locator('#markdown-preview h2').first()).toHaveAttribute('id','chosen-id-2');
 await expect(page.locator('#markdown-preview h2').nth(1)).toHaveAttribute('id','безопасно');
 await expect(input).toHaveValue(source);
 await page.locator('#dialect-selector').selectOption('commonmark');
 await expect(toggle).toBeDisabled();
 await expect(page.locator('#markdown-preview h1')).not.toHaveAttribute('id','chosen-id');
 await page.locator('#dialect-selector').selectOption('gfm');
 await expect(toggle).toBeEnabled();
 await expect(toggle).toHaveValue('on');
 const downloaded=page.waitForEvent('download');
 await closeCompatibility(page);
 await page.locator('#export-trigger').click();
 await page.locator('#download-html-btn').click();
 const file=await downloaded;
 const {readFile}=await import('node:fs/promises');
 const html=await readFile(await file.path(),'utf8');
 for(const id of ['chosen-id','chosen-id-2','безопасно'])expect(html).toContain('id="'+id+'"');
 await page.setContent(html);
 await expect(page.locator('main h1#chosen-id')).toHaveCount(1);
 await page.emulateMedia({media:'print'});
 await expect(page.locator('main h2#chosen-id-2')).toHaveCount(1);
});

test('issue #12 mobile and 150-heading outline remains usable',async({page})=>{
 // Rendering and opening an outline with 150 headings can be slow on shared CI runners.
 // Preserve the full stress test instead of deleting or weakening its assertions.
 test.slow();
 await page.setViewportSize({width:390,height:844});
 await page.goto('/');
 const source=Array.from({length:150},(_,i)=>'## Chapter '+(i+1)).join('\n\n');
 await page.locator('#markdown-input').fill(source);
 await page.locator('[data-mobile-tab="preview"]').click();
 await page.locator('#outline-trigger').click();
 await expect(page.locator('#toc-list a')).toHaveCount(150);
 const ids=await page.locator('#markdown-preview h2').evaluateAll(els=>els.map(el=>el.id));
 expect(new Set(ids).size).toBe(150);
 await page.locator('#toc-depth').selectOption('1');
 await expect(page.locator('#toc-list a')).toHaveCount(0);
 await expect(page.locator('#toc-empty')).toBeVisible();
 await page.locator('#toc-depth').selectOption('2');
 await expect(page.locator('#toc-list a')).toHaveCount(150);
 await page.locator('#toc-example').click();
 await expect(page.locator('#markdown-input')).toHaveValue(/# Introduction/);
});


