import {test,expect} from '@playwright/test';
import {setAppLanguage,setAppTheme} from './support/settings.js';
import {mermaidSnippet} from '../../js/data/mermaid-templates.js';

test('Mermaid Advanced insertion creates editable source and safe live image',async({page})=>{
 await page.goto('/');
 await page.locator('#advanced-tools-toggle').click();
 await expect(page.locator('#mermaid-template-choice')).toBeVisible();
 await page.locator('#mermaid-template-choice').selectOption('flowchart');
 await page.locator('#mermaid-template-insert').click();
 const editor=page.locator('#markdown-input');
 await expect(editor).toHaveValue(/```mermaid\nflowchart LR/);
 const figure=page.locator('#markdown-preview figure.mermaid-diagram');
 await expect(figure).toHaveCount(1,{timeout:20000});
 const img=figure.locator('img');
 await expect(img).toHaveAttribute('src',/^data:image\/svg\+xml;charset=utf-8,/);
 await expect(img).toHaveJSProperty('complete',true);
 expect(await img.evaluate(el=>el.naturalWidth)).toBeGreaterThan(0);
 await figure.locator('summary').click();
 await expect(figure.locator('pre code')).toContainText('flowchart LR');
 await page.locator('#undo-btn').click();
 await expect(editor).not.toHaveValue(/```mermaid/);
});

test('Mermaid independently renders three blocks and preserves original Markdown',async({page})=>{
 await page.goto('/');
 const source=['```mermaid','flowchart LR',' A[One] --> B[Two]','```','','```mermaid',
 'sequenceDiagram',' Alice->>Bob: Hello','```','','```mermaid','pie showData',
 ' "Yes" : 60',' "No" : 40','```'].join('\n');
 await page.locator('#markdown-input').fill(source);
 await expect(page.locator('#markdown-preview figure.mermaid-diagram')).toHaveCount(3,{timeout:30000});
 await expect(page.locator('#markdown-input')).toHaveValue(source);
});

test('Mermaid invalid input retains code and forbids inline configuration',async({page})=>{
 await page.goto('/');
 const source='```mermaid\n%%{init: { "securityLevel": "loose" }}%%\nflowchart LR\n A-->B\n```';
 await page.locator('#markdown-input').fill(source);
 await expect(page.locator('#markdown-preview .mermaid-error')).toBeVisible({timeout:15000});
 await expect(page.locator('#markdown-preview pre code.language-mermaid')).toContainText('securityLevel');
 await expect(page.locator('#markdown-preview figure.mermaid-diagram')).toHaveCount(0);
 await expect(page.locator('#markdown-input')).toHaveValue(source);
});

test('Mermaid preview does not apply an outdated asynchronous render',async({page})=>{
 await page.goto('/');
 const input=page.locator('#markdown-input');
 await input.fill('```mermaid\nflowchart LR\n A[Old] --> B[Branch]\n```');
 await input.fill('```mermaid\nflowchart LR\n A[New] --> B[Branch]\n```');
 const diagram=page.locator('#markdown-preview figure.mermaid-diagram img');
 await expect(diagram).toBeVisible({timeout:20000});
 const svg=await diagram.getAttribute('src');
 expect(decodeURIComponent(svg.split(',')[1])).toContain('New');
 expect(decodeURIComponent(svg.split(',')[1])).not.toContain('>Old<');
});

test('Mermaid Advanced insertion labels are localized in all five languages',async({page})=>{
 await page.goto('/');
 await page.locator('#advanced-tools-toggle').click();
 const expected={en:'Diagrams',cs:'Diagramy',uk:'Діаграми',ro:'Diagrame',ru:'Диаграммы'};
 for(const [lang,label] of Object.entries(expected)){
  await setAppLanguage(page,lang);
  await expect(page.locator('#mermaid-insert-controls')).toContainText(label);
  await expect(page.locator('#mermaid-template-choice option')).toHaveCount(9);
 }
});


test('Mermaid diagram cache avoids re-rendering after unrelated Markdown changes',async({page})=>{
 await page.goto('/');
 const input=page.locator('#markdown-input');
 const source='```mermaid\nflowchart LR\n A[Stable] --> B[Diagram]\n```';
 await input.fill(source);
 const diagram=page.locator('#markdown-preview figure.mermaid-diagram img');
 await expect(diagram).toBeVisible({timeout:20000});
 const previous=await diagram.getAttribute('src');
 await input.fill(source+'\n\nSome unrelated paragraph.');
 await expect(page.locator('#markdown-preview figure.mermaid-diagram img')).toHaveAttribute('src',previous);
 await expect(page.locator('#markdown-preview .mermaid-status')).toHaveCount(0);
});


test('issue #18 additional Mermaid types render as safe images',async({page})=>{
 test.setTimeout(120000);
 await page.goto('/');
 const editor=page.locator('#markdown-input');
 for(const kind of ['class','state','er','gantt','mindmap','timeline']){
  const source=mermaidSnippet(kind);
  await editor.fill(source);
  const image=page.locator('#markdown-preview figure.mermaid-diagram img');
  await expect(image).toHaveCount(1,{timeout:25000});
  await expect(image).toHaveAttribute('src',/^data:image\/svg\+xml;charset=utf-8,/);
  await expect(image).toHaveJSProperty('complete',true);
  expect(await image.evaluate(el=>el.naturalWidth),kind).toBeGreaterThan(0);
  await expect(page.locator('#markdown-preview .mermaid-error')).toHaveCount(0);
  await expect(editor).toHaveValue(source);
 }
});

test('issue #18 Mermaid has accessible zoom, fit and source controls',async({page})=>{
 await page.goto('/');
 await page.locator('#markdown-input').fill(mermaidSnippet('flowchart'));
 const image=page.locator('#markdown-preview figure.mermaid-diagram img');
 await expect(image).toBeVisible({timeout:20000});
 const toolbar=page.locator('#markdown-preview .mermaid-zoom-controls');
 await expect(toolbar.locator('button')).toHaveCount(3);
 await toolbar.getByRole('button',{name:'Zoom in'}).click();
 await expect(toolbar.locator('output')).toHaveText('125%');
 await expect(image).toHaveAttribute('style',/width:\s*125%/);
 await toolbar.getByRole('button',{name:'Zoom out'}).click();
 await expect(toolbar.locator('output')).toHaveText('100%');
 await toolbar.getByRole('button',{name:'Zoom out'}).click();
 await expect(toolbar.getByRole('button',{name:'Zoom out'})).toBeDisabled();
 await toolbar.getByRole('button',{name:'Fit to width'}).click();
 await expect(toolbar.locator('output')).toHaveText('100%');
 const source=page.locator('#markdown-preview .mermaid-source');
 await source.locator('summary').click();
 await expect(source.locator('code.language-mermaid')).toContainText('flowchart LR');
});

test('issue #18 Mermaid zoom works on narrow mobile Preview',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.goto('/');
 await page.locator('#markdown-input').fill(mermaidSnippet('sequence'));
 await page.locator('#mobile-tabs [data-mobile-tab="preview"]').click();
 await expect(page.locator('#markdown-preview .mermaid-diagram img')).toBeVisible({timeout:25000});
 const viewport=page.locator('#markdown-preview .mermaid-viewport');
 const width=await viewport.evaluate(el=>el.getBoundingClientRect().width);
 expect(width).toBeGreaterThan(100);
 expect(width).toBeLessThanOrEqual(390);
 await page.locator('#markdown-preview .mermaid-zoom-controls').getByRole('button',{name:'Zoom in'}).click();
 await expect(page.locator('#markdown-preview .mermaid-zoom-level')).toHaveText('125%');
});

test('issue #18 Mermaid renders after an offline reload with precached chunks',async({page,context})=>{
 test.setTimeout(90000);
 await page.goto('/');
 const source=mermaidSnippet('flowchart');
 await page.locator('#markdown-input').fill(source);
 await expect(page.locator('#markdown-preview .mermaid-diagram img')).toBeVisible({timeout:25000});
 await page.evaluate(async()=>{
  const registration=await navigator.serviceWorker.ready;
  if(!navigator.serviceWorker.controller)
   await new Promise((resolve,reject)=>{
    const timeout=setTimeout(()=>reject(new Error('Service worker did not claim page')),15000);
    navigator.serviceWorker.addEventListener('controllerchange',()=>{clearTimeout(timeout);resolve();},{once:true});
   });
  return registration.active?.state;
 });
 await context.setOffline(true);
 try{
  await page.reload();
  await expect(page.locator('#markdown-input')).toHaveValue(source);
  const diagram=page.locator('#markdown-preview .mermaid-diagram img');
  await expect(diagram).toBeVisible({timeout:25000});
  expect(await diagram.evaluate(el=>el.naturalWidth)).toBeGreaterThan(0);
 }finally{
  await context.setOffline(false);
 }
});


