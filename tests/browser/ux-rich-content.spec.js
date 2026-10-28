import {test,expect} from '@playwright/test';
import {setAppLanguage,setAppTheme} from './support/settings.js';
import {readFile} from 'node:fs/promises';
import {openCompatibility,closeCompatibility} from './support/compatibility.js';

test('issue #13 advanced image builder creates accessible responsive figures with Undo/Redo',async({page})=>{
 await page.goto('/');
 const input=page.locator('#markdown-input');
 await input.fill('A short introduction.');
 await page.locator('#advanced-tools-toggle').click();
 await page.locator('#figure-dialog-trigger').click();
 await expect(page.locator('#figure-dialog')).toBeVisible();
 await page.locator('#figure-url').fill('https://example.org/diagram.png');
 await page.locator('#figure-alt').fill('A flow diagram');
 await page.locator('#figure-width-preset').selectOption('custom');
 await page.locator('#figure-width-custom').fill('800');
 await page.locator('#figure-natural').uncheck();
 await page.locator('#figure-height').fill('340');
 await page.locator('#figure-caption').fill('Figure 1: A & B < C');
 await page.locator('#figure-insert').click();
 await expect(page.locator('#figure-dialog')).not.toBeVisible();
 await expect(input).toHaveValue(/<figure class="af-figure af-figure-fixed">/);
 await expect(input).toHaveValue(/width="800" height="340"/);
 const picture=page.locator('#markdown-preview figure.af-figure');
 await expect(picture).toHaveCount(1);
 await expect(picture.locator('img')).toHaveAttribute('alt','A flow diagram');
 await expect(picture.locator('img')).toHaveAttribute('width','800');
 await expect(picture.locator('img')).toHaveAttribute('height','340');
 await expect(picture.locator('figcaption')).toHaveText('Figure 1: A & B < C');
 expect(await picture.locator('img').evaluate(el=>getComputedStyle(el).objectFit)).toBe('contain');
 await page.locator('#undo-btn').click();
 await expect(input).toHaveValue('A short introduction.');
 await expect(page.locator('#markdown-preview figure')).toHaveCount(0);
 await page.locator('#redo-btn').click();
 await expect(picture).toHaveCount(1);
});

test('issue #13 image builder rejects invalid sizes and URLs, supports decorative alt',async({page})=>{
 await page.goto('/');
 await page.locator('#advanced-tools-toggle').click();
 await page.locator('#figure-dialog-trigger').click();
 await page.locator('#figure-url').fill('javascript:alert(1)');
 await page.locator('#figure-alt').fill('Test image');
 await page.locator('#figure-insert').click();
 await expect(page.locator('#figure-error')).not.toBeEmpty();
 await expect(page.locator('#figure-dialog')).toBeVisible();
 await page.locator('#figure-url').fill('https://example.org/test.png');
 await page.locator('#figure-width-preset').selectOption('custom');
 await page.locator('#figure-width-custom').fill('1601');
 await page.locator('#figure-insert').click();
 await expect(page.locator('#figure-error')).toContainText('1600');
 await page.locator('#figure-width-custom').fill('640');
 await page.locator('#figure-decorative').check();
 await expect(page.locator('#figure-alt')).toBeDisabled();
 await page.locator('#figure-insert').click();
 await expect(page.locator('#figure-dialog')).not.toBeVisible();
 await expect(page.locator('#markdown-preview figure img')).toHaveAttribute('alt','');
 await expect(page.locator('#markdown-preview figure img')).toHaveAttribute('width','640');
});

test('issue #13 figures survive standalone HTML and print, and portable Markdown remains untouched',async({page})=>{
 await page.goto('/');
 await page.locator('#advanced-tools-toggle').click();
 await page.locator('#figure-dialog-trigger').click();
 await page.locator('#figure-url').fill('https://example.org/photo.png');
 await page.locator('#figure-alt').fill('A photo');
 await page.locator('#figure-caption').fill('Simple caption');
 await page.locator('#figure-insert').click();
 const source=await page.locator('#markdown-input').inputValue();
 const download=page.waitForEvent('download');
 await closeCompatibility(page);
 await page.locator('#export-trigger').click();
 await page.locator('#download-html-btn').click();
 const file=await download;
 const {readFile}=await import('node:fs/promises');
 const html=await readFile(await file.path(),'utf8');
 expect(html).toContain('<figure class="af-figure">');
 expect(html).toContain('<figcaption>Simple caption</figcaption>');
 expect(html).toContain('af-figure'); // Browser layout is verified below.
 expect(html).not.toContain('<script');
 await page.setContent(html);
 await expect(page.locator('main.md-preview figure figcaption')).toHaveText('Simple caption');
 await page.emulateMedia({media:'print'});
 await expect(page.locator('main.md-preview figure img')).toHaveAttribute('width','640');
 // Print media hides the app editor after navigating back to the SPA.
 await page.emulateMedia({media:'screen'});
 await page.goto('/');
 await page.locator('#markdown-input').fill('');
 // Advanced mode is persisted: do not accidentally close an already open ribbon.
 if(await page.locator('#advanced-rich-toolbar').isHidden())
  await page.locator('#advanced-tools-toggle').click();
 await page.locator('#figure-dialog-trigger').click();
 await page.locator('#figure-url').fill('https://example.org/photo.png');
 await page.locator('#figure-alt').fill('A photo');
 await page.locator('#figure-markdown').click();
 await expect(page.locator('#markdown-input')).toHaveValue(/!\[A photo\]\(https:\/\/example.org\/photo.png\)/);
 await expect(page.locator('#markdown-preview figure')).toHaveCount(0);
 await expect(page.locator('#markdown-preview img')).toHaveCount(1);
 expect(source).not.toBe('');
});

test('issue #13 wide figures and captions never overflow the mobile preview',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.goto('/');
 await page.locator('#markdown-input').fill('<figure class="af-figure"><img src="https://example.org/diagram.png" width="1600" alt="Very wide diagram"><figcaption>Long explanatory caption associated with the image.</figcaption></figure>');
 await page.locator('[data-mobile-tab="preview"]').click();
 const measure=await page.locator('#markdown-preview figure').evaluate(el=>{
  const figure=el.getBoundingClientRect(),container=el.closest('#markdown-preview').getBoundingClientRect();
  return {figureWidth:figure.width,containerWidth:container.width,right:figure.right,containerRight:container.right};
 });
 expect(measure.figureWidth).toBeLessThanOrEqual(measure.containerWidth+1);
 expect(measure.right).toBeLessThanOrEqual(measure.containerRight+1);
 await expect(page.locator('#markdown-preview figure figcaption')).toContainText('Long explanatory caption');
});


test('issue #14 definition lists are opted in and persist per document without affecting base dialects',async({page})=>{
 await page.goto('/');
 const input=page.locator('#markdown-input');
 const source='Term A\nTerm B\n: First **definition**\n: Second *definition*\n  with continuation.\nAnother term\n: Final definition.';
 await input.fill(source);
 await expect(page.locator('#markdown-preview dl')).toHaveCount(0);
 await page.locator('#compatibility-trigger').click();
 const toggle=page.locator('#extension-definitions-toggle');
 await expect(toggle).toHaveValue('off');
 await openCompatibility(page);
 await toggle.selectOption('on');
 await expect(page.locator('#markdown-preview dl.md-definition-list')).toHaveCount(1);
 await expect(page.locator('#markdown-preview dl dt')).toHaveCount(3);
 await expect(page.locator('#markdown-preview dl dd')).toHaveCount(3);
 await expect(page.locator('#markdown-preview dl strong')).toHaveText('definition');
 await expect(page.locator('#markdown-preview dl em')).toHaveText('definition');
 await expect(page.locator('#extension-definitions-practice')).toContainText('Complete');
 await expect(input).toHaveValue(source);
 await page.reload();
 await expect(toggle).toHaveValue('on');
 await expect(page.locator('#markdown-preview dl')).toHaveCount(1);
 await page.locator('#dialect-selector').selectOption('commonmark');
 await expect(toggle).toBeDisabled();
 await expect(page.locator('#markdown-preview dl')).toHaveCount(0);
 await page.locator('#dialect-selector').selectOption('original');
 await expect(page.locator('#markdown-preview dl')).toHaveCount(0);
 await page.locator('#dialect-selector').selectOption('gfm');
 await expect(toggle).toHaveValue('on');
 await expect(page.locator('#markdown-preview dl')).toHaveCount(1);
 await setAppLanguage(page,'ru');
 await expect(toggle).toHaveValue('off');
 await expect(page.locator('#extension-definitions-label')).toContainText('Списки определений');
 await expect(page.locator('#extension-matrix-body tr')).toHaveCount(8);
});

test('issue #14 Advanced HTML definition template is semantic, reversible and available across dialects',async({page})=>{
 await page.goto('/');
 await page.locator('#advanced-tools-toggle').click();
 const input=page.locator('#markdown-input');
 await input.fill('');
 await page.locator('#definition-html-insert').click();
 await expect(page.locator('#markdown-preview dl')).toHaveCount(1);
 await expect(page.locator('#markdown-preview dl dt')).toHaveCount(2);
 await expect(page.locator('#markdown-preview dl dd')).toHaveCount(3);
 await expect(page.locator('#markdown-preview dl strong')).toHaveText('definition');
 await expect(input).toHaveValue(/<dl>/);
 const source=await input.inputValue();
 await page.locator('#undo-btn').click();
 await expect(page.locator('#markdown-preview dl')).toHaveCount(0);
 await page.locator('#redo-btn').click();
 await expect(input).toHaveValue(source);
 for(const dialect of ['commonmark','original','gfm']){
  await page.locator('#dialect-selector').selectOption(dialect);
  await expect(page.locator('#markdown-preview dl')).toHaveCount(1);
 }
 await setAppLanguage(page,'ru');
 await expect(page.locator('#definition-html-insert')).toContainText('HTML-список');
});

test('issue #14 example, standalone HTML and print keep sanitized definition list semantics',async({page})=>{
 await page.goto('/');
 const input=page.locator('#markdown-input');
 await input.fill('');
 await page.locator('#compatibility-trigger').click();
 await openCompatibility(page);
 await page.locator('#extension-definitions-toggle').selectOption('on');
 await openCompatibility(page);
 await page.locator('#extension-definitions-demo').click();
 await expect(page.locator('#markdown-preview dl.md-definition-list')).toHaveCount(1);
 await expect(page.locator('#markdown-preview dl dd')).toHaveCount(3);
 await expect(page.locator('#extension-definitions-practice')).toContainText('Complete');
 const source=await input.inputValue();
 const download=page.waitForEvent('download');
 await closeCompatibility(page);
 await page.locator('#export-trigger').click();
 await page.locator('#download-html-btn').click();
 const file=await download;
 const {readFile}=await import('node:fs/promises');
 const html=await readFile(await file.path(),'utf8');
 expect(html).toContain('<dl class="md-definition-list">');
 expect(html).toContain('<dt>Term A</dt>');
 expect(html).not.toContain('<script');
 await page.setContent(html);
 await expect(page.locator('main.md-preview dl dd')).toHaveCount(3);
 await page.emulateMedia({media:'print'});
 expect(await page.locator('main.md-preview dl dt').first().evaluate(el=>getComputedStyle(el).fontWeight)).toMatch(/700|bold/);
 await page.emulateMedia({media:'screen'});
 await page.goto('/');
 await expect(page.locator('#markdown-input')).toHaveValue(source);
});

test('issue #14 definition syntax never creates executable markup from hostile terms or definitions',async({page})=>{
 await page.goto('/');
 const input=page.locator('#markdown-input');
 const source='Safe term\n: <script>window.__definitionXss=1</script> **safe definition**\n\nOrdinary: paragraph';
 await input.fill(source);
 await page.locator('#compatibility-trigger').click();
 await openCompatibility(page);
 await page.locator('#extension-definitions-toggle').selectOption('on');
 await expect(page.locator('#markdown-preview dl')).toHaveCount(1);
 await expect(page.locator('#markdown-preview dl strong')).toHaveText('safe definition');
 await expect(page.locator('#markdown-preview script')).toHaveCount(0);
 expect(await page.evaluate(()=>window.__definitionXss)).toBeUndefined();
 await expect(page.locator('#markdown-preview')).toContainText('Ordinary: paragraph');
});


test('issue #15 Unicode picker searches offline and inserts at caret with Undo/Redo',async({page})=>{
 await page.goto('/');
 const input=page.locator('#markdown-input');
 await input.fill('Price: ');
 await page.locator('#unicode-picker-trigger').click();
 await expect(page.locator('#unicode-picker-dialog')).toBeVisible();
 await page.locator('#unicode-search').fill('euro');
 await expect(page.locator('#unicode-results button[data-item-id="euro"]')).toHaveCount(1);
 await page.locator('#unicode-results button[data-item-id="euro"]').click();
 await expect(page.locator('#unicode-picker-dialog')).not.toBeVisible();
 await expect(input).toHaveValue('Price: €');
 await page.locator('#undo-btn').click();
 await expect(input).toHaveValue('Price: ');
 await page.locator('#redo-btn').click();
 await expect(input).toHaveValue('Price: €');
 await expect(page.locator('#markdown-preview')).toContainText('Price: €');
});

test('issue #15 Enter, Escape and keyboard search work in localized Unicode palette',async({page})=>{
 await page.goto('/');
 const input=page.locator('#markdown-input');
 await input.fill('');
 await setAppLanguage(page,'ru');
 await page.locator('#unicode-picker-trigger').click();
 await expect(page.locator('#unicode-picker-title')).toHaveText('Символы Unicode и emoji');
 await expect(page.locator('#unicode-categories')).toHaveAttribute('aria-label','Категории символов');
 await expect(page.locator('#unicode-results')).toHaveAttribute('aria-label','Результаты поиска');
 const search=page.locator('#unicode-search');
 await search.fill('стрелка');
 await expect(page.locator('#unicode-results button').first()).toBeVisible();
 // All seven category buttons and the results are reachable by Tab.
 for(let index=0;index<8;index++)await page.keyboard.press('Tab');
 await expect(page.locator('#unicode-results button').first()).toBeFocused();
 await page.keyboard.press('Enter');
 await expect(page.locator('#unicode-picker-dialog')).not.toBeVisible();
 await expect(input).not.toHaveValue('');
 await page.locator('#unicode-picker-trigger').click();
 await search.fill('совершенно-несуществующий');
 await expect(page.locator('#unicode-empty')).toBeVisible();
 await search.fill('copyright');
 await search.press('Enter');
 await expect(page.locator('#unicode-picker-dialog')).not.toBeVisible();
 await expect(input).toHaveValue(/©$/);
 await page.locator('#unicode-picker-trigger').click();
 await page.keyboard.press('Escape');
 await expect(page.locator('#unicode-picker-dialog')).not.toBeVisible();
});

test('issue #15 opt-in shortcodes expand only in selected GFM documents',async({page})=>{
 await page.goto('/');
 const input=page.locator('#markdown-input');
 const source='Hello :joy: :tent: :unknown:.\n\n'+String.fromCharCode(96)+':joy:'+String.fromCharCode(96)+'\n\n~~~text\n:tent:\n~~~';
 await input.fill(source);
 await expect(page.locator('#markdown-preview p').first()).toContainText(':joy:');
 await page.locator('#compatibility-trigger').click();
 const toggle=page.locator('#extension-emoji-toggle');
 await expect(toggle).toHaveValue('off');
 await openCompatibility(page);
 await toggle.selectOption('on');
 await expect(page.locator('#markdown-preview p').first()).toContainText('😂');
 await expect(page.locator('#markdown-preview p').first()).toContainText('⛺');
 await expect(page.locator('#markdown-preview p').first()).toContainText(':unknown:');
 await expect(page.locator('#markdown-preview code').first()).toHaveText(':joy:');
 await expect(page.locator('#markdown-preview pre')).toContainText(':tent:');
 await expect(input).toHaveValue(source);
 await page.reload();
 await expect(toggle).toHaveValue('on');
 await page.locator('#dialect-selector').selectOption('commonmark');
 await expect(toggle).toBeDisabled();
 await expect(page.locator('#markdown-preview p').first()).toContainText(':joy:');
 await page.locator('#dialect-selector').selectOption('original');
 await expect(page.locator('#markdown-preview p').first()).toContainText(':joy:');
 await page.locator('#dialect-selector').selectOption('gfm');
 await expect(toggle).toHaveValue('on');
 await expect(page.locator('#markdown-preview p').first()).toContainText('😂');
 await page.locator('#help-menu-trigger').click();
 await page.locator('#sandbox-mode-btn').click();
 await expect(toggle).toHaveValue('off');
 await setAppLanguage(page,'ru');
 await expect(page.locator('#extension-emoji-label')).toContainText('shortcodes');
 await expect(page.locator('#extension-matrix-body tr')).toHaveCount(8);
});

test('issue #15 Unicode picker stays usable on 390px mobile screen and inserts symbols',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.goto('/');
 await page.locator('#markdown-input').fill('Road ');
 await page.locator('#unicode-picker-trigger').click();
 const dialog=page.locator('#unicode-picker-dialog');
 await expect(dialog).toBeVisible();
 const geometry=await dialog.evaluate(el=>{
  const rect=el.getBoundingClientRect();
  return {left:rect.left,right:rect.right,width:rect.width,viewport:innerWidth};
 });
 expect(geometry.left).toBeGreaterThanOrEqual(0);
 expect(geometry.right).toBeLessThanOrEqual(geometry.viewport+1);
 await page.locator('#unicode-categories button[data-category="arrows"]').click();
 await expect(page.locator('#unicode-results button').first()).toBeVisible();
 await page.locator('#unicode-results button[data-item-id="right"]').click();
 await expect(dialog).not.toBeVisible();
 await expect(page.locator('#markdown-input')).toHaveValue('Road →');
});

test('issue #15 Unicode sample and Markdown/HTML export preserve source and rendered output',async({page})=>{
 await page.goto('/');
 const input=page.locator('#markdown-input');
 await input.fill('');
 await page.locator('#unicode-picker-trigger').click();
 await page.locator('#unicode-lesson-example').click();
 await expect(input).toHaveValue(/Unicode: © € → π/);
 await expect(input).toHaveValue(/&copy; &euro; &rarr;/);
 await expect(input).toHaveValue(/\\\*literal asterisks\\\*/);
 await input.fill('One :joy: © €');
 await page.locator('#compatibility-trigger').click();
 await openCompatibility(page);
 await page.locator('#extension-emoji-toggle').selectOption('on');
 const messages=[];
 page.once('dialog',async dialog=>{messages.push(dialog.message());await dialog.accept();});
 const download=page.waitForEvent('download');
 await closeCompatibility(page);
 await page.locator('#export-trigger').click();
 await page.locator('#download-md-btn').click();
 const file=await download;
 const {readFile}=await import('node:fs/promises');
 expect(await readFile(await file.path(),'utf8')).toBe('One :joy: © €');
 expect(messages).toHaveLength(1);
 expect(messages[0]).toContain('shortcode');
 const htmlDownload=page.waitForEvent('download');
 await closeCompatibility(page);
 await page.locator('#export-trigger').click();
 await page.locator('#download-html-btn').click();
 const htmlFile=await htmlDownload;
 const html=await readFile(await htmlFile.path(),'utf8');
 expect(html).toContain('One 😂 © €');
 expect(html).not.toContain('<script');
});

test('issue #16 Practical Hacks are labeled, localized and undoable',async({page})=>{
 await page.goto('/');
 const editor=page.locator('#markdown-input');
 await editor.fill('Existing content');
 await page.locator('#help-menu-trigger').click();
 await page.locator('#cheatsheet-btn').click();
 await expect(page.locator('#cheatsheet-grid [data-hack-id]')).toHaveCount(10);
 await expect(page.locator('[data-hack-id="table-pipe"] [data-portability]')).toContainText('GFM only');
 await expect(page.locator('[data-hack-id="author-html-comment"] [data-portability]')).toContainText('HTML');
 const before=await editor.inputValue();
 await page.locator('[data-hack-id="portable-callout"] button').click();
 await expect(page.locator('#cheatsheet-modal')).toHaveClass(/hidden/);
 await expect(editor).toHaveValue(/Keep the original Markdown source/);
 await expect(page.locator('#markdown-preview blockquote strong')).toContainText('Note:');
 await page.locator('#undo-btn').click();
 await expect(editor).toHaveValue(before);
 await setAppLanguage(page,'ru');
 await page.locator('#help-menu-trigger').click();
 await page.locator('#cheatsheet-btn').click();
 await expect(page.locator('[data-hack-id="portable-callout"] h5')).toHaveText('Переносимое примечание');
 await expect(page.locator('[data-hack-id="table-pipe"] [data-portability]')).toHaveText('Только GFM');
 await expect(page.locator('[data-hack-id="video-thumbnail"] p').last()).toContainText('интернет');
});

test('issue #16 GFM table tricks render safely and retain dialect semantics',async({page})=>{
 await page.goto('/');
 await page.locator('#markdown-input').fill('');
 await page.locator('#help-menu-trigger').click();
 await page.locator('#cheatsheet-btn').click();
 await page.locator('[data-hack-id="table-pipe"] button').click();
 await expect(page.locator('#markdown-preview table')).toHaveCount(1);
 await expect(page.locator('#markdown-preview tbody td')).toHaveCount(4);
 await expect(page.locator('#markdown-preview tbody td').first()).toContainText('A | B');
 const source=await page.locator('#markdown-input').inputValue();
 await page.locator('#dialect-selector').selectOption('commonmark');
 await expect(page.locator('#markdown-preview table')).toHaveCount(0);
 await expect(page.locator('#markdown-input')).toHaveValue(source);
 await page.locator('#dialect-selector').selectOption('gfm');
 await page.locator('#markdown-input').fill('| Term | Notes |\n| --- | --- |\n| **Alpha** | First<br>Second |');
 await expect(page.locator('#markdown-preview td br')).toHaveCount(1);
 await expect(page.locator('#markdown-preview td strong')).toContainText('Alpha');
});

test('issue #16 author notes stay in Markdown but not in safe HTML export; video links are not embeds',async({page})=>{
 await page.goto('/');
 const markdown='Public text.\n\n[editor-note]: # (Internal: not for publication)\n\n<!-- Editor: verify data -->\n\n[![Video preview](https://placehold.co/320x180/png)](https://example.com/watch)';
 await page.locator('#markdown-input').fill(markdown);
 await expect(page.locator('#markdown-preview')).not.toContainText('not for publication');
 await expect(page.locator('#markdown-preview')).not.toContainText('Editor: verify data');
 await expect(page.locator('#markdown-preview a[href="https://example.com/watch"] img')).toHaveCount(1);
 await expect(page.locator('#markdown-preview iframe')).toHaveCount(0);
 const pending=page.waitForEvent('download');
 await closeCompatibility(page);
 await page.locator('#export-trigger').click();
 await page.locator('#download-html-btn').click();
 const file=await pending;
 const {readFile}=await import('node:fs/promises');
 const html=await readFile(await file.path(),'utf8');
 expect(html).toContain('https://example.com/watch');
 expect(html).not.toContain('Internal: not for publication');
 expect(html).not.toContain('Editor: verify data');
 expect(html).not.toMatch(/<iframe|<script/i);
 await expect(page.locator('#markdown-input')).toHaveValue(markdown);
});

test('issue #16 practical hacks can be reached on a narrow viewport',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.goto('/');
 await page.locator('#help-menu-trigger').click();
 await page.locator('#cheatsheet-btn').click();
 await expect(page.locator('[data-hack-id="entities-and-unicode"] button')).toBeAttached();
 await page.locator('[data-hack-id="entities-and-unicode"] button').click();
 await expect(page.locator('#markdown-input')).toHaveValue(/Unicode: © ® ™ € π ° →/);
});

