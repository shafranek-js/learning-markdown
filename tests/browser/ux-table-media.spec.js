import {undo,redo} from './support/history-actions.js';
import {test,expect} from '@playwright/test';
import {setAppLanguage,setAppTheme} from './support/settings.js';
import {readFile} from 'node:fs/promises';
import {openCompatibility,closeCompatibility} from './support/compatibility.js';

test('issue #6 Blocks mode preserves paragraphs, nested lists, quote, code and export',async({page})=>{
 test.setTimeout(75000);
 await page.goto('/');
 const source='Before\n\n<table class="af-table-outline"><tr><td rowspan="2">'+
  '<p>Opening <strong>bold</strong> <a href="https://example.org/docs">docs</a></p>'+
  '<ul><li>Alpha</li><li>Beta<ul><li>Nested</li></ul></li></ul>'+
  '<blockquote><p>Quote text</p></blockquote><pre><code>const n = 1;</code></pre>'+
  '</td><td>Neighbor</td></tr><tr><td>Bottom</td></tr></table>\n\nAfter';
 const input=page.locator('#markdown-input');
 await input.fill(source);
 await page.locator('#markdown-preview > table td[rowspan="2"]').click();
 await expect(page.locator('#table-edit-block-choice')).toHaveAttribute('aria-pressed','true');
 await expect(page.locator('#table-edit-rich-choice')).toBeDisabled();
 const editor=page.locator('#table-edit-rich-content');
 await expect(editor.locator('ul li')).toHaveCount(3);
 await expect(editor.locator('blockquote')).toContainText('Quote text');
 await expect(editor.locator('pre code')).toContainText('const n = 1;');
 await editor.locator('ul > li').first().evaluate(el=>{el.firstChild.textContent='Updated Alpha';});
 await page.locator('#table-edit-content-save').click();
 const changed=await input.inputValue();
 expect(changed).toContain('Updated Alpha');
 expect(changed).toContain('<blockquote>');
 expect(changed).toContain('<pre><code>const n = 1;</code></pre>');
 expect(changed).toContain('href="https://example.org/docs"');
 expect(changed).toContain('rowspan="2"');
 expect(changed).toContain('Neighbor');
 expect(changed).toContain('Bottom');
 await undo(page);
 await expect(input).toHaveValue(source);
 await redo(page);
 await expect(page.locator('#markdown-preview > table td[rowspan="2"]')).toContainText('Updated Alpha');
 const dl=page.waitForEvent('download');
 await closeCompatibility(page);
 await page.locator('#export-trigger').click();
 await page.locator('#download-html-btn').click();
 const downloaded=await dl;
 const html=await readFile(await downloaded.path(),'utf8');
 expect(html).toContain('<blockquote>');
 expect(html).toContain('Updated Alpha');
 expect(html).not.toMatch(/onmouseover=|<script[\s>]|javascript:/i);
});

test('issue #6 Blocks toolbar inserts paragraph, lists, quote and code, preserving neighbors',async({page})=>{
 await page.goto('/');
 await page.locator('#markdown-input').fill('<table><tr><td>Start</td><td>Other</td></tr></table>');
 await page.locator('#markdown-preview td').first().click();
 await page.locator('#table-edit-block-choice').click();
 await expect(page.locator('#table-edit-block-actions')).toBeVisible();
 for(const kind of ['p','ul','ol','quote','pre'])
  await page.locator('#table-edit-block-'+kind).click();
 const rich=page.locator('#table-edit-rich-content');
 await expect(rich.locator('p')).toHaveCount(2);
 await expect(rich.locator('ul > li')).toHaveCount(1);
 await expect(rich.locator('ol > li')).toHaveCount(1);
 await expect(rich.locator('blockquote')).toHaveCount(1);
 await expect(rich.locator('pre code')).toHaveCount(1);
 await rich.locator('ul > li').fill('Bullet item');
 await rich.locator('ol > li').fill('Numbered item');
 await rich.locator('blockquote p').fill('Quote item');
 await rich.locator('pre code').fill('code item');
 await page.locator('#table-edit-content-save').click();
 const source=await page.locator('#markdown-input').inputValue();
 for(const part of ['<ul>','<ol>','Bullet item','Numbered item','Quote item','<pre>code item</pre>','<td>Other</td>'])
  expect(source).toContain(part);
});

test('issue #6 Blocks mode is localized on mobile and explicit Plain text save replaces markup',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.goto('/');
 await setAppLanguage(page,'ru');
 await page.locator('#markdown-input').fill('<table><tr><td><p>Первый абзац</p><ul><li>Пункт</li></ul></td></tr></table>');
 await page.locator('#mobile-tabs button[data-mobile-tab="preview"]').click();
 await page.locator('#markdown-preview td').click();
 await expect(page.locator('#table-edit-block-choice')).toHaveText('Блоки');
 await expect(page.locator('#table-edit-block-choice')).toHaveAttribute('aria-pressed','true');
 await expect(page.locator('#table-edit-block-p')).toHaveText('Добавить абзац');
 await expect(page.locator('#table-edit-bar')).toBeInViewport();
 await page.locator('#table-edit-plain-choice').click();
 await expect(page.locator('#table-edit-content-input')).toBeVisible();
 await page.locator('#table-edit-block-choice').click();
 await expect(page.locator('#table-edit-rich-content ul li')).toHaveText('Пункт');
 await page.locator('#table-edit-plain-choice').click();
 await page.locator('#table-edit-content-input').fill('Только текст');
 await page.locator('#table-edit-content-save').click();
 const result=await page.locator('#markdown-input').inputValue();
 expect(result).toContain('Только текст');
 expect(result).not.toContain('<ul>');
 expect(result).not.toContain('<p>');
});


test('issue #6 unsupported media cells remain read-only and preserve source',async({page})=>{
 await page.goto('/');
 const source='<table><tr><td><p>Caption</p><img src="https://example.org/picture.png" alt="Artwork"><img src="https://example.org/second.png" alt="Second artwork"></td><td>Neighbor</td></tr></table>';
 await page.locator('#markdown-input').fill(source);
 await page.locator('#markdown-preview td').first().click();
 await expect(page.locator('#table-edit-content-input')).toBeDisabled();
 await expect(page.locator('#table-edit-content-save')).toBeDisabled();
 await expect(page.locator('#table-edit-mode')).toBeHidden();
 await expect(page.locator('#table-edit-content-warning')).toContainText('read-only');
 await expect(page.locator('#markdown-input')).toHaveValue(source);
 await expect(page.locator('#markdown-preview img').first()).toHaveAttribute('alt','Artwork');
});


test('issue #6 image properties preserve mixed cell content, Undo and standalone HTML',async({page})=>{
 test.setTimeout(65000);
 await page.goto('/');
 const src='Before\n\n<table class="af-table-outline"><tr><td rowspan="2">'+
  '<p>Intro <strong>strong</strong> <a href="https://example.org/guide">Guide</a></p>'+
  '<img src="https://example.org/old.png" alt="Original diagram" width="300" height="150">'+
  '<blockquote><p>Keep quote</p></blockquote></td><td>Neighbor</td></tr>'+
  '<tr><td>Last row</td></tr></table>\n\nAfter';
 const source=page.locator('#markdown-input');
 await source.fill(src);
 await page.locator('#markdown-preview td[rowspan="2"]').click();
 const form=page.locator('#table-edit-image-form');
 await expect(form).toBeVisible();
 await expect(page.locator('#table-edit-content-form')).toBeHidden();
 await expect(page.locator('#table-edit-image-url')).toHaveValue('https://example.org/old.png');
 await expect(page.locator('#table-edit-image-alt')).toHaveValue('Original diagram');
 await expect(page.locator('#table-edit-image-width')).toHaveValue('300');
 await page.locator('#table-edit-image-url').fill('https://example.org/new.png');
 await page.locator('#table-edit-image-alt').fill('Updated diagram');
 await page.locator('#table-edit-image-width').fill('620');
 await page.locator('#table-edit-image-height').fill('');
 await page.locator('#table-edit-image-save').click();
 const changed=await source.inputValue();
 for(const token of ['<strong>strong</strong>','href="https://example.org/guide"',
  'Keep quote','Neighbor','Last row','rowspan="2"','src="https://example.org/new.png"',
  'alt="Updated diagram"','width="620"','Before','After'])expect(changed).toContain(token);
 expect(changed).not.toContain('height="150"');
 await expect(page.locator('#markdown-preview img')).toHaveAttribute('alt','Updated diagram');
 await undo(page);
 await expect(source).toHaveValue(src);
 await redo(page);
 await expect(page.locator('#markdown-preview img')).toHaveAttribute('width','620');
 const downloaded=page.waitForEvent('download');
 await closeCompatibility(page);
 await page.locator('#export-trigger').click();
 await page.locator('#download-html-btn').click();
 const file=await downloaded;
 const html=await readFile(await file.path(),'utf8');
 expect(html).toContain('Updated diagram');
 expect(html).toContain('Keep quote');
 expect(html).toContain('Neighbor');
 expect(html).not.toMatch(/<script[\s>]|onerror=|javascript:/i);
});

test('issue #6 image editor rejects unsafe URLs and cannot flatten multiple media',async({page})=>{
 await page.goto('/');
 const original='<table><tr><td><p>Keep text</p>'+
  '<img src="https://example.org/old.png" alt="Existing"></td></tr></table>';
 const input=page.locator('#markdown-input');
 await input.fill(original);
 await page.locator('#markdown-preview td').click();
 await page.locator('#table-edit-image-url').fill('javascript:alert(1)');
 await page.locator('#table-edit-image-save').click();
 await expect(page.locator('#table-edit-message')).toContainText('HTTPS');
 await expect(input).toHaveValue(original);
 const multiple='<table><tr><td>Keep both '+
  '<img src="https://example.org/a.png" alt="A">'+
  '<img src="https://example.org/b.png" alt="B"></td></tr></table>';
 await input.fill(multiple);
 await page.locator('#markdown-preview td').click();
 await expect(page.locator('#table-edit-image-form')).toBeHidden();
 await expect(page.locator('#table-edit-content-input')).toBeDisabled();
 await expect(page.locator('#table-edit-content-save')).toBeDisabled();
 await expect(input).toHaveValue(multiple);
});

test('issue #6 Russian mobile image editing supports decorative alt and nested leaf tables',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.goto('/');
 await setAppLanguage(page,'ru');
 const original='<table><tr><td>Снаружи <table><tr><td>'+
  '<p>Подпись <strong>важно</strong></p>'+
  '<img src="https://example.org/leaf.png" alt="Рисунок" width="250">'+
  '</td></tr></table> После</td></tr></table>';
 const input=page.locator('#markdown-input');
 await input.fill(original);
 await page.locator('#mobile-tabs button[data-mobile-tab="preview"]').click();
 await page.locator('#markdown-preview table table td').click();
 await expect(page.locator('#table-edit-image-form')).toBeVisible();
 await expect(page.locator('#table-edit-image-title')).toHaveText('Свойства изображения');
 await page.locator('#table-edit-image-decorative').check();
 await expect(page.locator('#table-edit-image-alt')).toBeDisabled();
 await page.locator('#table-edit-image-save').click();
 const updated=await input.inputValue();
 expect(updated).toContain('alt=""');
 expect(updated).toContain('Снаружи');
 expect(updated).toContain('После');
 expect(updated).toContain('<strong>важно</strong>');
 await expect(page.locator('#markdown-preview table table img')).toHaveAttribute('alt','');
});


test('issue #6 keyboard Enter targets image URL without flattening a cell',async({page})=>{
 await page.goto('/');
 const source='<table><tr><td>Text before <img src="https://example.org/a.png" alt="A"> after</td></tr></table>';
 await page.locator('#markdown-input').fill(source);
 const cell=page.locator('#markdown-preview td');
 await cell.focus();
 await cell.press('Enter');
 await expect(page.locator('#table-edit-image-form')).toBeVisible();
 await expect(page.locator('#table-edit-image-url')).toBeFocused();
 await expect(page.locator('#table-edit-content-form')).toBeHidden();
 await expect(page.locator('#markdown-input')).toHaveValue(source);
});


test('issue #6 insert HTML cell image without changing surrounding rich blocks, Undo or export',async({page})=>{
 test.setTimeout(65000);
 await page.goto('/');
 const source='# Before\n\n<table class="af-table-outline"><tr><td rowspan="2">'+
  '<p>Introduction <strong>important</strong> <a href="https://example.org/guide">guide</a></p>'+
  '<ul><li>First item</li></ul><blockquote><p>Keep quote</p></blockquote>'+
  '</td><td>Neighbor</td></tr><tr><td>Bottom</td></tr></table>\n\n# After';
 const editor=page.locator('#markdown-input');
 await editor.fill(source);
 await page.locator('#markdown-preview td[rowspan="2"]').click();
 await expect(page.locator('#table-edit-image-add')).toHaveText('Add image');
 await page.locator('#table-edit-image-add').click();
 await expect(page.locator('#table-edit-image-form')).toBeVisible();
 await expect(page.locator('#table-edit-content-form')).toBeHidden();
 await expect(page.locator('#table-edit-image-url')).toBeFocused();
 await page.locator('#table-edit-image-url').fill('https://example.org/image.png');
 await page.locator('#table-edit-image-alt').fill('Artwork diagram');
 await page.locator('#table-edit-image-width').fill('380');
 await page.locator('#table-edit-image-save').click();
 const changed=await editor.inputValue();
 for(const token of ['Introduction','<strong>important</strong>','https://example.org/guide',
  'First item','Keep quote','Neighbor','Bottom','rowspan="2"',
  'src="https://example.org/image.png"','alt="Artwork diagram"','width="380"'])
  expect(changed).toContain(token);
 await expect(page.locator('#markdown-preview td[rowspan="2"] img')).toHaveAttribute('alt','Artwork diagram');
 await expect(page.locator('#table-edit-image-add')).toBeHidden();
 await undo(page);
 await expect(editor).toHaveValue(source);
 await redo(page);
 await expect(page.locator('#markdown-preview td[rowspan="2"] img')).toHaveAttribute('width','380');
 const downloadPromise=page.waitForEvent('download');
 await closeCompatibility(page);
 await page.locator('#export-trigger').click();
 await page.locator('#download-html-btn').click();
 const downloaded=await downloadPromise;
 const html=await readFile(await downloaded.path(),'utf8');
 expect(html).toContain('Artwork diagram');
 expect(html).toContain('Keep quote');
 expect(html).toContain('Neighbor');
 expect(html).not.toMatch(/onerror=|<script[\s>]|javascript:/i);
});

test('issue #6 insert portable Markdown image without converting a GFM table to HTML',async({page})=>{
 await page.goto('/');
 const source='| Name | Result |\n| --- | --- |\n| First **bold** | Completed |\n';
 const editor=page.locator('#markdown-input');
 await editor.fill(source);
 await page.locator('#markdown-preview table tbody tr td').first().click();
 await expect(page.locator('#table-edit-image-add')).toBeVisible();
 await page.locator('#table-edit-image-add').click();
 await expect(page.locator('#table-edit-image-form')).toBeVisible();
 await expect(page.locator('#table-edit-image-width')).toBeHidden();
 await expect(page.locator('#table-edit-image-height')).toBeHidden();
 await expect(page.locator('#table-edit-content-warning')).toContainText('GFM');
 await page.locator('#table-edit-image-url').fill('https://example.org/picture.png');
 await page.locator('#table-edit-image-alt').fill('Preview');
 await page.locator('#table-edit-image-save').click();
 const updated=await editor.inputValue();
 expect(updated).toContain('First **bold** ![Preview](https://example.org/picture.png)');
 expect(updated).toContain('Completed');
 expect(updated).not.toContain('<table');
 await expect(page.locator('#markdown-preview table tbody tr td img')).toHaveAttribute('alt','Preview');
 await undo(page);
 await expect(editor).toHaveValue(source);
});

test('issue #6 image insertion refuses unsaved cell drafts and unsafe URL; cancel is lossless',async({page})=>{
 await page.goto('/');
 const source='<table><tr><td>Original text</td><td>Another</td></tr></table>';
 const editor=page.locator('#markdown-input');
 await editor.fill(source);
 await page.locator('#markdown-preview td').first().click();
 await page.locator('#table-edit-content-input').fill('Unsaved draft');
 await page.locator('#table-edit-image-add').click();
 await expect(page.locator('#table-edit-image-form')).toBeHidden();
 await expect(page.locator('#table-edit-message')).toContainText('Save the current cell edits');
 await expect(page.locator('#table-edit-content-input')).toHaveValue('Unsaved draft');
 await page.locator('#table-edit-content-input').fill('Original text');
 await page.locator('#table-edit-image-add').click();
 await expect(page.locator('#table-edit-image-form')).toBeVisible();
 await page.locator('#table-edit-image-url').fill('https://example.org/will-cancel.png');
 await page.locator('#table-edit-image-alt').fill('Draft');
 await page.locator('#table-edit-image-add').click();
 await expect(page.locator('#table-edit-image-form')).toBeHidden();
 await expect(editor).toHaveValue(source);
 await page.locator('#table-edit-image-add').click();
 await page.locator('#table-edit-image-url').fill('javascript:alert(1)');
 await page.locator('#table-edit-image-alt').fill('Invalid');
 await page.locator('#table-edit-image-save').click();
 await expect(page.locator('#table-edit-message')).toContainText('HTTPS');
 await expect(editor).toHaveValue(source);
});

test('issue #6 mobile nested table image insertion preserves parent and decorative alt',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.goto('/');
 await setAppLanguage(page,'ru');
 const source='<table><tr><td>Снаружи <table><tr><td><p>Внутри <strong>важно</strong></p>'+
 '</td></tr></table> После</td></tr></table>';
 const editor=page.locator('#markdown-input');
 await editor.fill(source);
 await page.locator('#mobile-tabs button[data-mobile-tab="preview"]').click();
 await page.locator('#markdown-preview table table td').click();
 await expect(page.locator('#table-edit-image-add')).toHaveText('Добавить изображение');
 await page.locator('#table-edit-image-add').click();
 await page.locator('#table-edit-image-url').fill('https://example.org/leaf.png');
 await page.locator('#table-edit-image-decorative').check();
 await expect(page.locator('#table-edit-image-alt')).toBeDisabled();
 await page.locator('#table-edit-image-save').click();
 const changed=await editor.inputValue();
 for(const text of ['Снаружи','После','Внутри','<strong>важно</strong>',
  'src="https://example.org/leaf.png"','alt=""'])expect(changed).toContain(text);
 await expect(page.locator('#markdown-preview table table img')).toHaveAttribute('alt','');
 await undo(page);
 await expect(editor).toHaveValue(source);
});


