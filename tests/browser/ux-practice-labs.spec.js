import {test,expect} from '@playwright/test';
import {setAppLanguage,setAppTheme} from './support/settings.js';

test('issue #17 optional GFM lab validates rendered alignment and preserves isolated drafts',async({page})=>{
 await page.goto('/');
 const originalRoute=new URL(page.url()).hash;
 const main=page.locator('#markdown-input'),originalMarkdown=await main.inputValue();
 const coreProgress=await page.locator('#progress-label').textContent();
 const advancedProgress=await page.locator('#advanced-progress-label').textContent();
 await page.locator('#contents-toggle-btn').click();
 await page.locator('#extensions-lab-open').click();
 const modal=page.locator('#extensions-lab-modal');
 await expect(modal).toBeVisible();
 await expect(page.locator('#extensions-lab-checks li')).toHaveCount(2);
 await expect(page.locator('#extensions-lab-progress')).toHaveText('0 / 16');
 await expect(page.locator('#extensions-lab-status')).toContainText('Keep editing');
 const source=page.locator('#extensions-lab-source');
 await source.fill('| Feature | Score |\n| :---: | ---: |\n| Markdown | 5 |');
 await expect(page.locator('#extensions-lab-preview th[align="center"]')).toHaveCount(1);
 await expect(page.locator('#extensions-lab-preview td[align="right"]')).toHaveText('5');
 await expect(page.locator('#extensions-lab-progress')).toHaveText('1 / 16');
 await page.locator('#extensions-lab-close').click();
 await expect(modal).toBeHidden();
 await expect(main).toHaveValue(originalMarkdown);
 expect(new URL(page.url()).hash).toBe(originalRoute);
 await expect(page.locator('#progress-label')).toHaveText(coreProgress);
 await expect(page.locator('#advanced-progress-label')).toHaveText(advancedProgress);
 await page.reload();
 await page.locator('#contents-toggle-btn').click();
 await expect(page.locator('#extensions-lab-open-progress')).toHaveText('1 / 16');
 await page.locator('#extensions-lab-open').click();
 await expect(source).toHaveValue('| Feature | Score |\n| :---: | ---: |\n| Markdown | 5 |');
 await expect(page.locator('#extensions-lab-status')).toContainText('All checks pass');
});

test('issue #17 fenced examples cannot pass without rendered highlighting; successful samples persist',async({page})=>{
 await page.goto('/');
 await page.locator('#contents-toggle-btn').click();
 await page.locator('#extensions-lab-open').click();
 const selector=page.locator('#extensions-lab-select'),source=page.locator('#extensions-lab-source');
 await selector.selectOption('fenced-code-highlighting');
 await expect(source).toHaveValue(/^~~~\nconst answer/);
 await source.fill('~~~~markdown\n~~~javascript\nconst answer = 42;\n~~~\n~~~~');
 await expect(page.locator('#extensions-lab-checks li strong')).toHaveText(['○ ','○ ']);
 await page.locator('#extensions-lab-example').click();
 await expect(page.locator('#extensions-lab-preview code.language-javascript')).toHaveCount(1);
 await expect(page.locator('#extensions-lab-preview code.language-javascript .hljs-keyword')).toContainText('const');
 await expect(page.locator('#extensions-lab-checks li strong')).toHaveText(['✓ ','✓ ']);
 await expect(page.locator('#extensions-lab-progress')).toHaveText('1 / 16');
 await page.locator('#extensions-lab-reset').click();
 await expect(source).toHaveValue(/^~~~\nconst answer/);
 await expect(page.locator('#extensions-lab-status')).toContainText('Keep editing');
 await expect(page.locator('#extensions-lab-progress')).toHaveText('1 / 16'); // historical achievement persists
 await page.locator('#extensions-lab-close').click();
 await page.reload();
 await page.locator('#contents-toggle-btn').click();
 await page.locator('#extensions-lab-open').click();
 await expect(selector).toHaveValue('fenced-code-highlighting');
 await expect(source).toHaveValue(/^~~~\nconst answer/);
});

test('issue #17 optional lab supports all five locales and keyboard Escape',async({page})=>{
 await page.goto('/');
 for(const [lang,heading] of [
  ['en','Extensions & Hacks Lab'],
  ['cs','Laboratoř rozšíření a triků'],
  ['uk','Практикум розширень і прийомів'],
  ['ro','Laborator de extensii și trucuri'],
  ['ru','Практикум Extensions & Hacks']
 ]){
  await setAppLanguage(page,lang);
  await page.locator('#contents-toggle-btn').click();
  const launch=page.locator('#extensions-lab-open');
  await launch.click();
  await expect(page.locator('#extensions-lab-title')).toHaveText(heading);
  await expect(page.locator('#extensions-lab-description')).not.toBeEmpty();
  await expect(page.locator('#extensions-lab-checks li')).toHaveCount(2);
  await page.keyboard.press('Escape');
  await expect(page.locator('#extensions-lab-modal')).toBeHidden();
  await expect(page.locator('#contents-toggle-btn')).toBeFocused();
 }
});

test('issue #17 lab stays usable on mobile and does not execute source HTML',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.goto('/');
 await page.locator('#contents-toggle-btn').click();
 await page.locator('#extensions-lab-open').click();
 await expect(page.locator('#extensions-lab-modal')).toBeVisible();
 const source=page.locator('#extensions-lab-source');
 await source.fill('<script>window.__labXss = 1</script>\n\n<img src="x" onerror="window.__labXss=2">');
 await expect(page.locator('#extensions-lab-preview script')).toHaveCount(0);
 await expect(page.locator('#extensions-lab-preview img')).not.toHaveAttribute('onerror',/./);
 expect(await page.evaluate(()=>window.__labXss)).toBeUndefined();
 await expect(page.locator('#extensions-lab-status')).toBeVisible();
 const size=await page.locator('#extensions-lab-modal > div').boundingBox();
 expect(size.width).toBeLessThanOrEqual(390);
 await page.locator('#extensions-lab-close').click();
 await expect(page.locator('#extensions-lab-modal')).toBeHidden();
});

test('issue #17 second learning wave: four opt-in exercises pass with real sanitized semantics',async({page})=>{
 await page.goto('/');
 const originalHash=new URL(page.url()).hash;
 const originalDraft=await page.locator('#markdown-input').inputValue();
 await page.locator('#contents-toggle-btn').click();
 await page.locator('#extensions-lab-open').click();
 const select=page.locator('#extensions-lab-select');
 const source=page.locator('#extensions-lab-source');
 await expect(select.locator('option')).toHaveCount(16);
 for(const id of ['github-footnotes','custom-heading-toc','figure-caption','definition-list']){
  await select.selectOption(id);
  await expect(page.locator('#extensions-lab-checks li strong')).toHaveText(['○ ','○ ']);
  await page.locator('#extensions-lab-example').click();
  await expect(page.locator('#extensions-lab-checks li strong')).toHaveText(['✓ ','✓ ']);
  if(id==='github-footnotes'){
   await expect(page.locator('#extensions-lab-preview a.fn-ref')).toHaveCount(2);
   await expect(page.locator('#extensions-lab-preview a.fn-backref')).toHaveCount(2);
   await page.locator('#extensions-lab-preview a.fn-backref').first().click();
   expect(new URL(page.url()).hash).toBe(originalHash);
  }else if(id==='custom-heading-toc'){
   await expect(page.locator('#extensions-lab-preview h1#manual-overview')).toHaveCount(1);
   await page.locator('#extensions-lab-preview a[href="#manual-overview"]').click();
   expect(new URL(page.url()).hash).toBe(originalHash);
  }else if(id==='figure-caption'){
   await expect(page.locator('#extensions-lab-preview figure.af-figure figcaption')).toHaveText('Front of carton');
   await expect(page.locator('#extensions-lab-preview figure img')).toHaveAttribute('width','640');
  }else if(id==='definition-list'){
   await expect(page.locator('#extensions-lab-preview dl.md-definition-list dd')).toHaveCount(2);
  }
 }
 await expect(page.locator('#extensions-lab-progress')).toHaveText('4 / 16');
 await page.locator('#extensions-lab-close').click();
 await expect(page.locator('#markdown-input')).toHaveValue(originalDraft);
 expect(new URL(page.url()).hash).toBe(originalHash);
 await page.reload();
 await page.locator('#contents-toggle-btn').click();
 await expect(page.locator('#extensions-lab-open-progress')).toHaveText('4 / 16');
 await page.locator('#extensions-lab-open').click();
 await expect(select).toHaveValue('definition-list');
 await expect(source).toHaveValue(/First \*\*definition\*\*/);
});

test('issue #17 second wave ignores fenced examples, strips scripts and keeps opt-in local',async({page})=>{
 await page.goto('/');
 await page.locator('#contents-toggle-btn').click();
 await page.locator('#extensions-lab-open').click();
 const select=page.locator('#extensions-lab-select');
 const source=page.locator('#extensions-lab-source');
 const examples={
  'github-footnotes':'Reference[^note].\n\n[^note]: **Text**.',
  'custom-heading-toc':'# Overview {#manual-overview}\n\n[Jump](#manual-overview)',
  'figure-caption':'<figure class="af-figure"><img src="https://example.org/a.png" alt="Test" width="640"><figcaption>Caption</figcaption></figure>',
  'definition-list':'Term\n: **First**\n: *Second*'
 };
 for(const [id,snippet] of Object.entries(examples)){
  await select.selectOption(id);
  await source.fill('~~~~markdown\n'+snippet+'\n~~~~');
  await expect(page.locator('#extensions-lab-checks li strong')).toHaveText(['○ ','○ ']);
 }
 await source.fill('Term\n: <script>window.__labAttack=1</script> **First**\n: *Second* <img src="javascript:alert(1)" onerror="window.__labAttack=2">');
 await expect(page.locator('#extensions-lab-preview script')).toHaveCount(0);
 await expect(page.locator('#extensions-lab-preview img')).toHaveCount(0);
 expect(await page.evaluate(()=>window.__labAttack)).toBeUndefined();
 await page.locator('#extensions-lab-close').click();
 await page.locator('#markdown-input').fill('An unhandled note[^x].\n\n[^x]: Source.');
 await expect(page.locator('#markdown-preview .md-footnotes')).toHaveCount(0);
});

test('issue #17 all exercises show localized titles and portability notes in five languages',async({page})=>{
 await page.goto('/');
 for(const language of ['en','cs','uk','ro','ru']){
  await setAppLanguage(page,language);
  await page.locator('#contents-toggle-btn').click();
  await page.locator('#extensions-lab-open').click();
  await expect(page.locator('#extensions-lab-select option')).toHaveCount(16);
  for(const id of ['github-footnotes','custom-heading-toc','figure-caption','definition-list']){
   await page.locator('#extensions-lab-select').selectOption(id);
   await expect(page.locator('#extensions-lab-description')).not.toBeEmpty();
   await expect(page.locator('#extensions-lab-portability')).not.toBeEmpty();
   await expect(page.locator('#extensions-lab-checks li')).toHaveCount(2);
  }
  await page.locator('#extensions-lab-close').click();
 }
});

test('issue #17 practical lessons: seven complete by rendered effects and persist',async({page})=>{
 await page.goto('/');
 const mainBefore=await page.locator('#markdown-input').inputValue();
 const routeBefore=new URL(page.url()).hash;
 await page.locator('#contents-toggle-btn').click();
 await page.locator('#extensions-lab-open').click();
 const source=page.locator('#extensions-lab-source'),select=page.locator('#extensions-lab-select');
 await expect(select.locator('option')).toHaveCount(16);
 const ids=['unicode-entities','emoji-shortcodes','gfm-table-tricks','html-table-list','portable-callout','author-notes','video-preview-links'];
 for(const id of ids){
  await select.selectOption(id);
  await expect(page.locator('#extensions-lab-checks li strong')).toHaveText(['○ ','○ ']);
  await page.locator('#extensions-lab-example').click();
  await expect(page.locator('#extensions-lab-checks li strong')).toHaveText(['✓ ','✓ ']);
  if(id==='unicode-entities'){
   await expect(page.locator('#extensions-lab-preview')).toContainText('العربية');
   await expect(page.locator('#extensions-lab-preview')).toContainText('עברית');
  }else if(id==='emoji-shortcodes'){
   await expect(page.locator('#extensions-lab-preview p > code')).toHaveText(':rocket:');
  }else if(id==='gfm-table-tricks'){
   await expect(page.locator('#extensions-lab-preview table tbody tr:first-child td')).toHaveCount(2);
   await expect(page.locator('#extensions-lab-preview td br')).toHaveCount(1);
  }else if(id==='html-table-list'){
   await expect(page.locator('#extensions-lab-preview table td ul > li')).toHaveText(['One','Two']);
  }else if(id==='portable-callout'){
   await expect(page.locator('#extensions-lab-preview blockquote blockquote')).toHaveCount(1);
  }else if(id==='author-notes'){
   await expect(page.locator('#extensions-lab-preview')).not.toContainText('Internal:');
   await expect(page.locator('#extensions-lab-preview')).not.toContainText('Editor:');
  }else if(id==='video-preview-links'){
   await expect(page.locator('#extensions-lab-preview a[href="https://example.com/watch"] img[alt="Video preview"]')).toHaveCount(1);
   await expect(page.locator('#extensions-lab-preview iframe')).toHaveCount(0);
  }
 }
 await expect(page.locator('#extensions-lab-progress')).toHaveText('7 / 16');
 await page.locator('#extensions-lab-close').click();
 await expect(page.locator('#markdown-input')).toHaveValue(mainBefore);
 expect(new URL(page.url()).hash).toBe(routeBefore);
 await page.reload();
 await page.locator('#contents-toggle-btn').click();
 await expect(page.locator('#extensions-lab-open-progress')).toHaveText('7 / 16');
 await page.locator('#extensions-lab-open').click();
 await expect(select).toHaveValue('video-preview-links');
 await expect(source).toHaveValue(/\[!\[Video preview\]/);
});

test('issue #17 practical lessons reject all code-fenced examples and embedded frames',async({page})=>{
 await page.goto('/');
 await page.locator('#contents-toggle-btn').click();
 await page.locator('#extensions-lab-open').click();
 const source=page.locator('#extensions-lab-source'),select=page.locator('#extensions-lab-select');
 for(const id of ['unicode-entities','emoji-shortcodes','gfm-table-tricks','html-table-list','portable-callout','author-notes','video-preview-links']){
  await select.selectOption(id);
  await page.locator('#extensions-lab-example').click();
  const example=await source.inputValue();
  await source.fill('~~~~markdown\n'+example+'\n~~~~');
  await expect(page.locator('#extensions-lab-checks li strong')).toHaveText(['○ ','○ ']);
 }
 await select.selectOption('author-notes');
 await source.fill('Public text stays visible.\n\n<!-- Editor: draft note. -->');
 await expect(page.locator('#extensions-lab-checks li strong')).toHaveText(['○ ','✓ ']);
 await select.selectOption('video-preview-links');
 await source.fill('[Watch the video](https://example.com/watch)\n\n<iframe src="https://example.com/watch"></iframe>');
 await expect(page.locator('#extensions-lab-checks li strong')).toHaveText(['✓ ','○ ']);
 await expect(page.locator('#extensions-lab-preview iframe')).toHaveCount(0);
});

test('issue #17 practical instructions are complete across five locales on mobile',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.goto('/');
 for(const lang of ['en','cs','uk','ro','ru']){
  await setAppLanguage(page,lang);
  await page.locator('#contents-toggle-btn').click();
  await page.locator('#extensions-lab-open').click();
  await expect(page.locator('#extensions-lab-select option')).toHaveCount(16);
  for(const id of ['unicode-entities','emoji-shortcodes','gfm-table-tricks','html-table-list','portable-callout','author-notes','video-preview-links']){
   await page.locator('#extensions-lab-select').selectOption(id);
   await expect(page.locator('#extensions-lab-description')).not.toBeEmpty();
   await expect(page.locator('#extensions-lab-portability')).not.toBeEmpty();
   await expect(page.locator('#extensions-lab-checks li')).toHaveCount(2);
  }
  await page.keyboard.press('Escape');
  await expect(page.locator('#extensions-lab-modal')).toBeHidden();
 }
});


