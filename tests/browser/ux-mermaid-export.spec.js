import {test,expect} from '@playwright/test';
import {setAppLanguage,setAppTheme} from './support/settings.js';
import {mermaidSnippet} from '../../js/data/mermaid-templates.js';
import {readFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
import {openCompatibility,closeCompatibility} from './support/compatibility.js';

test('issue #19 exports validated Mermaid SVG without changing Markdown source',async({page})=>{
 await page.goto('/');
 const source=mermaidSnippet('flowchart');
 const editor=page.locator('#markdown-input');
 await editor.fill(source);
 await expect(page.locator('#markdown-preview .mermaid-diagram img')).toBeVisible({timeout:20000});
 const downloadPromise=page.waitForEvent('download');
 await page.locator('#markdown-preview .mermaid-export-controls').getByRole('button',{name:'Export SVG'}).click();
 const download=await downloadPromise;
 expect(download.suggestedFilename()).toBe('mermaid-diagram-1.svg');
 const svg=await readFile(await download.path(),'utf8');
 expect(svg).toContain('<svg');
 expect(svg).not.toMatch(/<script|<foreignObject|@import|href\s*=\s*["'](?:https?:|javascript:)/i);
 await expect(editor).toHaveValue(source);
});

test('issue #19 exports Mermaid PNG at 2x with no remote requests',async({page})=>{
 await page.goto('/');
 const source=mermaidSnippet('sequence');
 await page.locator('#markdown-input').fill(source);
 await expect(page.locator('#markdown-preview .mermaid-diagram img')).toBeVisible({timeout:20000});
 const controls=page.locator('#markdown-preview .mermaid-export-controls');
 await controls.getByRole('combobox',{name:'PNG resolution'}).selectOption('2');
 const downloadPromise=page.waitForEvent('download');
 await controls.getByRole('button',{name:'Export PNG'}).click();
 const download=await downloadPromise;
 expect(download.suggestedFilename()).toBe('mermaid-diagram-1.png');
 const file=await readFile(await download.path());
 expect(file.subarray(0,8).toString('hex')).toBe('89504e470d0a1a0a');
 expect(file.readUInt32BE(16)).toBeGreaterThan(100);
 expect(file.readUInt32BE(20)).toBeGreaterThan(80);
 await expect(page.locator('#markdown-input')).toHaveValue(source);
});

test('issue #19 copy Mermaid source is accessible and localized',async({page,context})=>{
 await context.grantPermissions(['clipboard-read','clipboard-write']);
 await page.goto('/');
 const source=mermaidSnippet('pie');
 await page.locator('#markdown-input').fill(source);
 await expect(page.locator('#markdown-preview .mermaid-export-controls')).toBeVisible({timeout:20000});
 await page.locator('#markdown-preview .mermaid-export-controls').getByRole('button',{name:'Copy source'}).click();
 expect(await page.evaluate(()=>navigator.clipboard.readText())).toContain('pie showData');
 await expect(page.locator('#markdown-preview .mermaid-export-status')).toContainText('copied');
 await setAppLanguage(page,'ru');
 // Lessons have language-specific drafts: insert the same source into the RU draft.
 await page.locator('#markdown-input').fill(source);
 await expect(page.locator('#markdown-preview .mermaid-export-controls')).toBeVisible({timeout:20000});
 await expect(page.locator('#markdown-preview .mermaid-export-controls')).toContainText('Экспорт SVG');
 await expect(page.locator('#markdown-preview .mermaid-export-controls')).toContainText('Экспорт PNG');
 await expect(page.locator('#markdown-preview .mermaid-export-controls')).toContainText('Копировать код');
 await expect(page.locator('#markdown-input')).toHaveValue(source);
});


test('issue #19 standalone HTML embeds multiple Mermaid diagrams as safe offline images',async({page,context},testInfo)=>{
 test.setTimeout(90000);
 await page.goto('/');
 const source=mermaidSnippet('flowchart')+'\nBetween diagrams.\n'+mermaidSnippet('sequence');
 const editor=page.locator('#markdown-input');
 await editor.fill(source);
 // Export immediately: do not depend on Live Preview debounce.
 const downloadPromise=page.waitForEvent('download');
 await closeCompatibility(page);
 await page.locator('#export-trigger').click();
 await page.locator('#download-html-btn').click();
 const download=await downloadPromise;
 // Chromium treats Playwright's extensionless temporary download as text/plain.
 // Save with a real .html extension to test the browser's HTML file handler.
 const path=testInfo.outputPath('offline-mermaid-export.html');
 await download.saveAs(path);
 const html=await readFile(path,'utf8');
 expect(html).toContain('Content-Security-Policy');
 expect(html).not.toMatch(/<script[\s>]|<iframe[\s>]|<foreignObject[\s>]/i);
 expect((html.match(/class="md-mermaid-export"/g)||[]).length).toBe(2);
 expect((html.match(/src="data:image\/svg\+xml;charset=utf-8,/g)||[]).length).toBe(2);
 expect(html).toContain('Between diagrams.');
 await context.setOffline(true);
 try{
  const local=await context.newPage();
  const outbound=[];
  local.on('request',request=>{if(/^https?:/i.test(request.url()))outbound.push(request.url());});
  await local.goto(pathToFileURL(path).href);
  await expect(local.locator('.md-mermaid-export img')).toHaveCount(2);
  for(const img of await local.locator('.md-mermaid-export img').all()){
   await expect(img).toHaveJSProperty('complete',true);
   expect(await img.evaluate(el=>el.naturalWidth)).toBeGreaterThan(0);
  }
  expect(outbound).toEqual([]);
  await expect(local.locator('script,iframe,foreignObject')).toHaveCount(0);
  await local.close();
 }finally{
  await context.setOffline(false);
 }
 await expect(editor).toHaveValue(source);
});

test('issue #19 print tab contains static diagrams and makes a valid PDF',async({page})=>{
 test.setTimeout(65000);
 await page.goto('/');
 const source=mermaidSnippet('pie')+'\n'+mermaidSnippet('flowchart');
 await page.locator('#markdown-input').fill(source);
 const popupPromise=page.waitForEvent('popup');
 await closeCompatibility(page);
 await page.locator('#export-trigger').click();
 await page.locator('#print-document-btn').click();
 const popup=await popupPromise;
 await expect(popup.locator('figure.md-mermaid-export img')).toHaveCount(2,{timeout:25000});
 const rendered=await popup.locator('figure.md-mermaid-export img').evaluateAll(list=>list.every(img=>img.complete&&img.naturalWidth>0));
 expect(rendered).toBe(true);
 await expect(popup.locator('.mermaid-zoom-controls,script')).toHaveCount(0);
 const pdf=await popup.pdf({format:'A4',printBackground:true});
 expect(pdf.subarray(0,5).toString()).toBe('%PDF-');
 expect(pdf.length).toBeGreaterThan(9000);
 await popup.close();
 await expect(page.locator('#markdown-input')).toHaveValue(source);
});

test('issue #19 failed Mermaid render keeps source visible and warns on HTML export',async({page})=>{
 await page.goto('/');
 const source='~~~mermaid\n%%{init: {"securityLevel":"loose"}}%%\nflowchart LR\n A-->B\n~~~\n\nSafe text';
 await page.locator('#markdown-input').fill(source);
 let warning='';
 page.on('dialog',dialog=>{warning=dialog.message();dialog.accept();});
 const downloadPromise=page.waitForEvent('download');
 await closeCompatibility(page);
 await page.locator('#export-trigger').click();
 await page.locator('#download-html-btn').click();
 const download=await downloadPromise;
 const html=await readFile(await download.path(),'utf8');
 expect(html).toContain('md-mermaid-export-error');
 expect(html).toContain('securityLevel');
 expect(html).toContain('Safe text');
 expect(html).not.toContain('class="md-mermaid-export"');
 expect(warning).toMatch(/Mermaid/i);
 await expect(page.locator('#markdown-input')).toHaveValue(source);
});

test('issue #19 standalone HTML drops hostile inline SVG/image payloads',async({page},testInfo)=>{
 await page.goto('/');
 const source=mermaidSnippet('flowchart')+'\n<svg onload="window.__svgAttack=1"><script>window.__svgAttack=2</script></svg>\n\n'+
  '<img src="data:image/svg+xml,%3Csvg%20onload%3D%22alert(1)%22%3E" onerror="window.__svgAttack=3">';
 await page.locator('#markdown-input').fill(source);
 const downloadPromise=page.waitForEvent('download');
 await closeCompatibility(page);
 await page.locator('#export-trigger').click();
 await page.locator('#download-html-btn').click();
 const dl=await downloadPromise;
 const exportedPath=testInfo.outputPath('safe-mermaid-export.html');
 await dl.saveAs(exportedPath);
 const html=await readFile(exportedPath,'utf8');
 expect((html.match(/class="md-mermaid-export"/g)||[]).length).toBe(1);
 expect(html).not.toMatch(/<script[\s>]|<svg[\s>]|onload=|onerror=|javascript:/i);
 const page2=await page.context().newPage();
 await page2.goto(pathToFileURL(exportedPath).href);
 await expect(page2.locator('.md-mermaid-export img')).toHaveCount(1);
 expect(await page2.evaluate(()=>window.__svgAttack)).toBeUndefined();
 await page2.close();
});


test('issue #19 optional Mermaid labs render real diagrams and persist separately',async({page})=>{
 test.setTimeout(90000);
 await page.goto('/');
 const mainDraft=await page.locator('#markdown-input').inputValue();
 const progressBefore=await page.locator('#progress-label').innerText();
 await page.locator('#contents-toggle-btn').click();
 await page.locator('#extensions-lab-open').click();
 await expect(page.locator('#extensions-lab-select option')).toHaveCount(16);
 const ids=['mermaid-flowchart','mermaid-sequence','mermaid-pie'];
 const source=page.locator('#extensions-lab-source');
 for(const id of ids){
  await page.locator('#extensions-lab-select').selectOption(id);
  await expect(page.locator('#extensions-lab-checks li strong')).toHaveText(['○ ','○ ']);
  await page.locator('#extensions-lab-example').click();
  await expect(page.locator('#extensions-lab-preview figure.mermaid-diagram img')).toHaveCount(1,{timeout:25000});
  const image=page.locator('#extensions-lab-preview figure.mermaid-diagram img');
  expect(await image.evaluate(el=>el.complete&&el.naturalWidth>0)).toBe(true);
  await expect(page.locator('#extensions-lab-checks li strong')).toHaveText(['✓ ','✓ '],{timeout:20000});
  await expect(source).toHaveValue(/~~~mermaid/);
 }
 await expect(page.locator('#extensions-lab-progress')).toHaveText('3 / 16');
 await page.locator('#extensions-lab-close').click();
 await expect(page.locator('#markdown-input')).toHaveValue(mainDraft);
 await expect(page.locator('#progress-label')).toHaveText(progressBefore);
 await page.reload();
 await page.locator('#contents-toggle-btn').click();
 await expect(page.locator('#extensions-lab-open-progress')).toHaveText('3 / 16');
 await page.locator('#extensions-lab-open').click();
 await expect(page.locator('#extensions-lab-select')).toHaveValue('mermaid-pie');
 await expect(source).toHaveValue(/pie showData/);
});

test('issue #19 Mermaid labs refuse code examples and invalid Mermaid input',async({page})=>{
 test.setTimeout(65000);
 await page.goto('/');
 await page.locator('#contents-toggle-btn').click();
 await page.locator('#extensions-lab-open').click();
 const source=page.locator('#extensions-lab-source');
 for(const id of ['mermaid-flowchart','mermaid-sequence','mermaid-pie']){
  await page.locator('#extensions-lab-select').selectOption(id);
  await page.locator('#extensions-lab-example').click();
  const example=await source.inputValue();
  await source.fill('~~~~markdown\n'+example+'\n~~~~');
  await expect(page.locator('#extensions-lab-checks li strong')).toHaveText(['○ ','○ ']);
  await source.fill('~~~mermaid\nthisIsNotARealDiagram\n~~~');
  await expect(page.locator('#extensions-lab-checks li strong')).toHaveText(['○ ','○ ']);
  await expect(page.locator('#extensions-lab-preview figure.mermaid-diagram img')).toHaveCount(0);
 }
});

test('issue #19 Mermaid exercise descriptions and results are localized on mobile',async({page})=>{
 test.setTimeout(90000);
 await page.setViewportSize({width:390,height:844});
 await page.goto('/');
 const titles={en:'Mermaid',cs:'Mermaid',uk:'Mermaid',ro:'Mermaid',ru:'Mermaid'};
 for(const lang of Object.keys(titles)){
  await setAppLanguage(page,lang);
  await page.locator('#contents-toggle-btn').click();
  await page.locator('#extensions-lab-open').click();
  await expect(page.locator('#extensions-lab-select option')).toHaveCount(16);
  for(const id of ['mermaid-flowchart','mermaid-sequence','mermaid-pie']){
   await page.locator('#extensions-lab-select').selectOption(id);
   await expect(page.locator('#extensions-lab-description')).not.toBeEmpty();
   await expect(page.locator('#extensions-lab-portability')).toContainText('Mermaid');
   await expect(page.locator('#extensions-lab-checks li')).toHaveCount(2);
  }
  await page.keyboard.press('Escape');
  await expect(page.locator('#extensions-lab-modal')).toBeHidden();
 }
});


