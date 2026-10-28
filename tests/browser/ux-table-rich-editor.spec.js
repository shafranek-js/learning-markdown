import {undo,redo} from './support/history-actions.js';
import {test,expect} from '@playwright/test';
import {setAppLanguage,setAppTheme} from './support/settings.js';
import {readFile} from 'node:fs/promises';
import {openCompatibility,closeCompatibility} from './support/compatibility.js';

test('issue #6: merging a rectangle crossing a colspan expands its visual selection',async({page})=>{
 await page.goto('/');
 const source='<table class="af-table-outline"><tr><td>A</td><td>B</td><td>C</td></tr>'+
  '<tr><td colspan="2">D</td><td>E</td></tr>'+
  '<tr><td>F</td><td>G</td><td>H</td></tr></table>';
 const editor=page.locator('#markdown-input');
 await editor.fill(source);
 const rows=page.locator('#markdown-preview table tr');
 await rows.nth(0).locator('td').nth(1).click();
 await rows.nth(2).locator('td').nth(1).click({modifiers:['Shift']});
 await expect(page.locator('#markdown-preview .table-edit-selected')).toHaveCount(5);
 await expect(page.locator('#table-edit-status')).toContainText('Selection automatically includes entire merged cells');
 await page.locator('#table-edit-merge').selectOption('merge');
 const merged=page.locator('#markdown-preview td[rowspan="3"][colspan="2"]');
 await expect(merged).toHaveCount(1);
 for(const value of ['A','B','D','F','G'])await expect(merged).toContainText(value);
 for(const value of ['C','E','H'])await expect(page.locator('#markdown-preview table')).toContainText(value);
 const raw=await editor.inputValue();
 expect(raw).toContain('rowspan="3"');
 expect(raw).toContain('colspan="2"');
 await undo(page);
 await expect(editor).toHaveValue(source);
 await redo(page);
 await expect(page.locator('#markdown-preview td[rowspan="3"][colspan="2"]')).toHaveCount(1);
 const downloadPromise=page.waitForEvent('download');
 await closeCompatibility(page);
 await page.locator('#export-trigger').click();
 await page.locator('#download-html-btn').click();
 const saved=await downloadPromise;
 const html=await readFile(await saved.path(),'utf8');
 expect(html).toContain('rowspan="3"');
 expect(html).toContain('colspan="2"');
 expect(html).not.toMatch(/onclick=|onerror=|<script[\s>]/i);
});

test('issue #6: merging right and down uses the edge of an existing merged cell',async({page})=>{
 await page.goto('/');
 const source='<table><tr><td colspan="2">Top</td><td>Right</td></tr>'+
  '<tr><td>Below 1</td><td>Below 2</td><td>Below 3</td></tr></table>';
 const editor=page.locator('#markdown-input');
 await editor.fill(source);
 await page.locator('#markdown-preview td[colspan="2"]').click();
 await page.locator('#table-edit-merge').selectOption('merge-right');
 await expect(page.locator('#markdown-preview td[colspan="3"]')).toHaveText('TopRight');
 await undo(page);
 await expect(editor).toHaveValue(source);
 await page.locator('#markdown-preview td[colspan="2"]').click();
 await page.locator('#table-edit-merge').selectOption('merge-down');
 const merged=page.locator('#markdown-preview td[rowspan="2"][colspan="2"]');
 await expect(merged).toHaveCount(1);
 await expect(merged).toContainText('Below 1');
 await expect(merged).toContainText('Below 2');
 await expect(page.locator('#markdown-preview table')).toContainText('Below 3');
});

test('issue #6: span-aware table selection is localized on mobile',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.goto('/');
 await setAppLanguage(page,'ru');
 await page.locator('#markdown-input').fill('<table><tr><td>A</td><td>B</td></tr>'+
  '<tr><td colspan="2">C</td></tr><tr><td>D</td><td>E</td></tr></table>');
 await page.locator('#mobile-tabs button[data-mobile-tab="preview"]').click();
 const rows=page.locator('#markdown-preview table tr');
 await rows.nth(0).locator('td').nth(1).click();
 await rows.nth(2).locator('td').nth(1).click({modifiers:['Shift']});
 await expect(page.locator('#markdown-preview .table-edit-selected')).toHaveCount(5);
 await expect(page.locator('#table-edit-status')).toContainText('объединённые ячейки');
 await expect(page.locator('#table-edit-bar')).toBeInViewport();
});


test('issue #6: rich cell editing preserves emphasis, links, spans and undo history',async({page})=>{
 await page.goto('/');
 const source='Before\n\n<table class="af-table-outline"><tr><td colspan="2" class="af-cell-mint">'+
  '<strong>Bold</strong> <em>Italic</em> <a href="https://example.org/docs">Link</a>'+
  '</td></tr><tr><td>Left</td><td>Right</td></tr></table>\n\nAfter';
 const editor=page.locator('#markdown-input');
 await editor.fill(source);
 await page.locator('#markdown-preview td[colspan="2"]').click();
 await expect(page.locator('#table-edit-rich-choice')).toHaveAttribute('aria-pressed','true');
 await expect(page.locator('#table-edit-rich-panel')).toBeVisible();
 const rich=page.locator('#table-edit-rich-content');
 await expect(rich.locator('strong')).toHaveText('Bold');
 await expect(rich.locator('em')).toHaveText('Italic');
 await expect(rich.locator('a')).toHaveAttribute('href','https://example.org/docs');
 await page.locator('#table-edit-plain-choice').click();
 await page.locator('#table-edit-rich-choice').click();
 await expect(rich.locator('strong')).toHaveText('Bold');
 await expect(rich.locator('em')).toHaveText('Italic');
 await expect(rich.locator('a')).toHaveAttribute('href','https://example.org/docs');
 await rich.focus();
 await rich.press('End');
 await page.keyboard.type(' addition');
 await page.locator('#table-edit-content-save').click();
 const updated=await editor.inputValue();
 expect(updated).toContain('<strong>Bold</strong>');
 expect(updated).toContain('<em>Italic</em>');
 expect(updated).toContain('href="https://example.org/docs"');
 expect(updated).toContain('addition');
 expect(updated).toContain('colspan="2"');
 expect(updated).toContain('af-cell-mint');
 expect(updated).toContain('Before');
 expect(updated).toContain('After');
 await undo(page);
 await expect(editor).toHaveValue(source);
 await redo(page);
 await expect(page.locator('#markdown-preview td[colspan="2"]')).toContainText('addition');
 const filePromise=page.waitForEvent('download');
 await closeCompatibility(page);
 await page.locator('#export-trigger').click();
 await page.locator('#download-html-btn').click();
 const file=await filePromise;
 const html=await readFile(await file.path(),'utf8');
 expect(html).toContain('<strong>Bold</strong>');
 expect(html).toContain('<em>Italic</em>');
 expect(html).toContain('https://example.org/docs');
 expect(html).not.toMatch(/<script[\s>]|onerror=|onclick=/);
});

test('issue #6: rich cell toolbar styles selected text and paste strips HTML',async({page})=>{
 await page.goto('/');
 await page.locator('#markdown-input').fill('<table><tr><td>Before</td><td>Other</td></tr></table>');
 await page.locator('#markdown-preview td').first().click();
 await expect(page.locator('#table-edit-plain-choice')).toHaveAttribute('aria-pressed','true');
 await page.locator('#table-edit-rich-choice').click();
 const rich=page.locator('#table-edit-rich-content');
 await rich.evaluate(el=>{
  const range=document.createRange();
  range.selectNodeContents(el);
  const selection=window.getSelection();
  selection.removeAllRanges();selection.addRange(range);
 });
 await page.locator('#table-edit-rich-bold').click();
 await expect(rich.locator('strong')).toHaveText('Before');
 await rich.focus();
 await rich.press('End');
 await rich.evaluate(el=>{
  const transfer=new DataTransfer();
  transfer.setData('text/plain',' Safe');
  transfer.setData('text/html','<img src=x onerror="alert(1)"><script>alert(2)</script>');
  el.dispatchEvent(new ClipboardEvent('paste',{bubbles:true,cancelable:true,clipboardData:transfer}));
 });
 await expect(rich.locator('img,script')).toHaveCount(0);
 await expect(rich).toContainText('Safe');
 await page.locator('#table-edit-content-save').click();
 const content=await page.locator('#markdown-input').inputValue();
 // The caret remained inside the formatted range; pasted plain text inherits
 // the current bold style, as in standard rich-text editors.
 expect(content).toContain('<strong>Before Safe</strong>');
 expect(content).toContain('Safe');
 expect(content).not.toMatch(/<script[\s>]|onerror=|onclick=/);
 expect(content).toContain('<td>Other</td>');
});

test('issue #6: Russian mobile cell editor can retain rich formatting or choose plain text',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.goto('/');
 await setAppLanguage(page,'ru');
 await page.locator('#markdown-input').fill('<table><tr><td><strong>Важное</strong> описание</td></tr></table>');
 await page.locator('#mobile-tabs button[data-mobile-tab="preview"]').click();
 await page.locator('#markdown-preview td').click();
 await expect(page.locator('#table-edit-rich-choice')).toHaveText('Форматированный');
 await expect(page.locator('#table-edit-plain-choice')).toHaveText('Обычный текст');
 await expect(page.locator('#table-edit-rich-panel')).toBeVisible();
 await expect(page.locator('#table-edit-bar')).toBeInViewport();
 await page.locator('#table-edit-plain-choice').click();
 await expect(page.locator('#table-edit-content-input')).toBeVisible();
 await page.locator('#table-edit-content-input').fill('Новый текст');
 await page.locator('#table-edit-content-save').click();
 await expect(page.locator('#markdown-preview td')).toHaveText('Новый текст');
 const content=await page.locator('#markdown-input').inputValue();
 expect(content).not.toContain('<strong>');
 expect(content).toContain('Новый текст');
});


test('issue #6 nested leaf table edits remain scoped and undoable',async({page})=>{
 test.setTimeout(65000);
 await page.goto('/');
 const source='# Before\n\n<table class="af-table-outline"><tr><td>'+
  'Outer <strong>content</strong> <table class="af-table-borderless"><tr>'+
  '<td><strong>Inner</strong></td><td>Second</td></tr>'+
  '<tr><td>Third</td><td>Fourth</td></tr></table> After</td>'+
  '<td>Outside sibling</td></tr></table>\n\n# After';
 const editor=page.locator('#markdown-input');
 await editor.fill(source);
 await expect(page.locator('#markdown-preview table')).toHaveCount(2);
 await page.locator('#markdown-preview table table td').first().click();
 await expect(page.locator('#table-edit-content-input')).toHaveValue('Inner');
 await expect(page.locator('#table-edit-rich-panel')).toBeVisible();
 await page.locator('#table-edit-rich-content').fill('Nested revised');
 await page.locator('#table-edit-content-save').click();
 await expect(page.locator('#markdown-preview table table td').first()).toHaveText('Nested revised');
 const changed=await editor.inputValue();
 expect(changed).toContain('Outer <strong>content</strong>');
 expect(changed).toContain('Outside sibling');
 expect(changed).toContain('After</td>');
 expect(changed).toContain('class="af-table-outline"');
 expect(changed).toContain('class="af-table-borderless"');
 await undo(page);
 await expect(editor).toHaveValue(source);
 await redo(page);
 await expect(page.locator('#markdown-preview table table td').first()).toHaveText('Nested revised');
 const downloading=page.waitForEvent('download');
 await closeCompatibility(page);
 await page.locator('#export-trigger').click();
 await page.locator('#download-html-btn').click();
 const file=await downloading;
 const html=await readFile(await file.path(),'utf8');
 expect(html).toContain('Nested revised');
 expect(html).toContain('Outside sibling');
 expect(html).not.toMatch(/<script[\s>]|onerror=|onclick=/);
});

test('issue #6 nested leaf merge and row insertion preserve outer table geometry',async({page})=>{
 await page.goto('/');
 const source='<table class="af-table-outline"><tr><td>Parent '+
  '<table class="af-table-borderless"><tr><td>A</td><td>B</td></tr>'+
  '<tr><td>C</td><td>D</td></tr></table> End</td><td>Sibling</td></tr></table>';
 await page.locator('#markdown-input').fill(source);
 const leafCells=page.locator('#markdown-preview table table td');
 await leafCells.first().click();
 await leafCells.nth(1).click({modifiers:['Shift']});
 await expect(page.locator('#markdown-preview table table .table-edit-selected')).toHaveCount(2);
 await page.locator('#table-edit-merge').selectOption('merge');
 await expect(page.locator('#markdown-preview table table td[colspan="2"]')).toHaveText('AB');
 await expect(page.locator('#markdown-preview > table > tbody > tr > td')).toHaveCount(2);
 await page.locator('#markdown-preview table table td[colspan="2"]').click();
 await page.locator('#table-edit-rows').selectOption('row-below');
 await expect(page.locator('#markdown-preview table table tr')).toHaveCount(3);
 await expect(page.locator('#markdown-preview > table > tbody > tr')).toHaveCount(1);
 await expect(page.locator('#markdown-preview > table')).toContainText('Sibling');
});

test('issue #6 nested table editing remains accessible on mobile with locales',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.goto('/');
 await setAppLanguage(page,'ru');
 const source='<table><tr><td>Внешняя '+
  '<table><tr><td>Внутренняя</td></tr></table> конец</td></tr></table>';
 await page.locator('#markdown-input').fill(source);
 await page.locator('#mobile-tabs button[data-mobile-tab="preview"]').click();
 await page.locator('#markdown-preview table table td').click();
 await expect(page.locator('#table-edit-title')).toHaveText('Изменить таблицу');
 await expect(page.locator('#table-edit-content-input')).toHaveValue('Внутренняя');
 await expect(page.locator('#table-edit-bar')).toBeInViewport();
 await page.locator('#table-edit-content-input').fill('Изменена');
 await page.locator('#table-edit-content-save').click();
 await expect(page.locator('#markdown-preview table table td')).toHaveText('Изменена');
 await expect(page.locator('#markdown-preview > table > tbody > tr > td')).toContainText('Внешняя');
 const raw=await page.locator('#markdown-input').inputValue();
 expect(raw).toContain('конец');
 expect(raw).toContain('Изменена');
});


