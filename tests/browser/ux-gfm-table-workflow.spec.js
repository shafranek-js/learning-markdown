import {undo,redo} from './support/history-actions.js';
import {test,expect} from '@playwright/test';
import {setAppLanguage,setAppTheme} from './support/settings.js';
import {readFile} from 'node:fs/promises';
import {openCompatibility,closeCompatibility} from './support/compatibility.js';

test('GFM checklist shows checked state and Preview clicks edit source with Undo/Redo',async({page})=>{
 await page.goto('/');
 const editor=page.locator('#markdown-input');
 await editor.fill('- [x] Completed task\n- [ ] Open task');
 const boxes=page.locator('#markdown-preview li input[type="checkbox"]');
 await expect(boxes).toHaveCount(2);
 await expect(boxes.first()).toBeChecked();
 await expect(boxes.nth(1)).not.toBeChecked();
 await expect(boxes.first()).toBeEnabled();
 await boxes.nth(1).check();
 await expect(editor).toHaveValue('- [x] Completed task\n- [x] Open task');
 await expect(boxes.nth(1)).toBeChecked();
 await boxes.first().uncheck();
 await expect(editor).toHaveValue('- [ ] Completed task\n- [x] Open task');
 await undo(page);
 await expect(boxes.first()).toBeChecked();
 await redo(page);
 await expect(boxes.first()).not.toBeChecked();
 await page.reload();
 await expect(boxes.first()).not.toBeChecked();
 await expect(boxes.nth(1)).toBeChecked();
});

test('GFM task clicks preserve nested lists and fenced-code examples',async({page})=>{
 await page.goto('/');
 const source='- [x] Same\n  - [ ] Same\n- [x] Same\n\n~~~md\n- [ ] Code only\n~~~';
 await page.locator('#markdown-input').fill(source);
 const boxes=page.locator('#markdown-preview input[data-task-index]');
 await expect(boxes).toHaveCount(3);
 await boxes.nth(1).check();
 await expect(page.locator('#markdown-input')).toHaveValue(source.replace('  - [ ] Same','  - [x] Same'));
 await expect(boxes.nth(0)).toBeChecked();
 await expect(boxes.nth(2)).toBeChecked();
});

test('exported checkboxes retain checked and disabled attributes while remaining safe',async({page})=>{
 await page.goto('/');
 await page.locator('#markdown-input').fill('- [x] Done\n- [ ] Pending\n\n<input type="checkbox" onclick="alert(1)" checked>');
 const boxes=page.locator('#markdown-preview li input');
 await expect(boxes).toHaveCount(2);
 await expect(boxes.first()).toBeDisabled();
 const promise=page.waitForEvent('download');
 await closeCompatibility(page);
 await page.locator('#export-trigger').click();
 await page.locator('#download-html-btn').click();
 const file=await promise;
 const {readFile}=await import('node:fs/promises');
 const html=await readFile(await file.path(),'utf8');
 expect(html).toContain('checked=""');
 expect(html).toContain('disabled=""');
 expect(html).not.toContain('onclick=');
});

test('CommonMark treats GFM task markers as text, not interactive checkboxes',async({page})=>{
 await page.goto('/');
 await page.locator('#markdown-input').fill('- [x] Done\n- [ ] Pending');
 await page.locator('#dialect-selector').selectOption('commonmark');
 await expect(page.locator('#markdown-preview input[type="checkbox"]')).toHaveCount(0);
});


test('Word-like picker selects a 5 by 4 grid and generates an undoable GFM table',async({page})=>{
 await page.goto('/');
 const input=page.locator('#markdown-input');
 await input.fill('');
 await page.locator('#table-picker-trigger').click();
 await expect(page.locator('#table-picker-popup')).toBeVisible();
 await page.locator('.table-picker-cell[data-col="5"][data-row="4"]').hover();
 await expect(page.locator('#table-picker-size')).toContainText('5 × 4');
 await expect(page.locator('.table-picker-cell.selected')).toHaveCount(20);
 await page.locator('.table-picker-cell[data-col="5"][data-row="4"]').click();
 await expect(page.locator('#table-picker-popup')).toBeHidden();
 await expect(page.locator('#markdown-preview table th')).toHaveCount(5);
 await expect(page.locator('#markdown-preview table tbody tr')).toHaveCount(3);
 await expect(input).toHaveValue(/\| Column 5 \|/);
 await undo(page);
 await expect(input).toHaveValue('');
 await redo(page);
 await expect(page.locator('#markdown-preview table th')).toHaveCount(5);
});

test('picker restores the source caret and inserts table in the correct place',async({page})=>{
 await page.goto('/');
 const input=page.locator('#markdown-input');
 await input.fill('Before\n\nAfter');
 await input.evaluate(x=>{x.focus();x.setSelectionRange(8,8);});
 await page.locator('#table-picker-trigger').click();
 await page.locator('.table-picker-cell[data-col="2"][data-row="2"]').click();
 const source=await input.inputValue();
 expect(source.indexOf('Column 1')).toBeGreaterThan(source.indexOf('Before'));
 expect(source.indexOf('Column 1')).toBeLessThan(source.indexOf('After'));
});

test('manual sizes, Russian labels and accessible arrow-key navigation',async({page})=>{
 await page.goto('/');
 await page.locator('#markdown-input').fill('');
 await setAppLanguage(page,'ru');
 await page.locator('#table-picker-trigger').click();
 await expect(page.locator('#table-picker-title')).toHaveText('Вставить таблицу');
 await page.locator('#table-picker-columns').fill('12');
 await page.locator('#table-picker-rows').fill('9');
 await page.locator('#table-picker-insert').click();
 await expect(page.locator('#markdown-preview table th')).toHaveCount(12);
 await expect(page.locator('#markdown-preview table tbody tr')).toHaveCount(8);
 await page.locator('#table-picker-trigger').focus();
 await page.keyboard.press('ArrowDown');
 await expect(page.locator('#table-picker-popup')).toBeVisible();
 await page.keyboard.press('ArrowRight');
 await expect(page.locator('#table-picker-size')).toContainText('2 × 1');
 await page.keyboard.press('Escape');
 await expect(page.locator('#table-picker-popup')).toBeHidden();
});

test('picker remains accessible on mobile and warns in non-GFM mode',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.goto('/');
 await page.locator('#dialect-selector').selectOption('commonmark');
 await page.locator('#table-picker-trigger').click();
 await expect(page.locator('#table-picker-popup')).toBeInViewport();
 await expect(page.locator('#table-picker-mode-hint')).toBeVisible();
 await page.locator('#table-picker-cancel').click();
 await expect(page.locator('#table-picker-popup')).toBeHidden();
});


test('Preview table context menu inserts/deletes GFM rows and columns with Undo',async({page})=>{
 await page.goto('/');
 const editor=page.locator('#markdown-input');
 await editor.fill('| A | B |\n| --- | --- |\n| Alpha | Beta |');
 await page.locator('#markdown-preview tbody td').first().click();
 await expect(page.locator('#table-edit-bar')).toBeVisible();
 await page.locator('#table-edit-rows').selectOption('row-below');
 await expect(page.locator('#markdown-preview tbody tr')).toHaveCount(2);
 await expect(editor).toHaveValue(/\| Alpha \| Beta \|/);
 await undo(page);
 await expect(page.locator('#markdown-preview tbody tr')).toHaveCount(1);
 await page.locator('#markdown-preview tbody td').first().click();
 await page.locator('#table-edit-cols').selectOption('column-right');
 await expect(page.locator('#markdown-preview thead th')).toHaveCount(3);
 await page.locator('#markdown-preview tbody td').first().click();
 await page.locator('#table-edit-cols').selectOption('delete-column');
 await expect(page.locator('#markdown-preview thead th')).toHaveCount(2);
});
test('Shift-selection merges GFM cells as safe HTML, supports split and Undo',async({page})=>{
 await page.goto('/');
 const editor=page.locator('#markdown-input');
 await editor.fill('| A | B |\n| --- | --- |\n| Alpha | Beta |');
 const cells=page.locator('#markdown-preview tbody td');
 await cells.first().click();
 await cells.nth(1).click({modifiers:['Shift']});
 await expect(page.locator('#markdown-preview .table-edit-selected')).toHaveCount(2);
 await page.locator('#table-edit-merge').selectOption('merge');
 await expect(page.locator('#markdown-preview td[colspan="2"]')).toHaveText('AlphaBeta');
 await expect(editor).toHaveValue(/<table/);
 await undo(page);
 await expect(editor).not.toHaveValue(/<table/);
 await redo(page);
 await expect(page.locator('#markdown-preview td[colspan="2"]')).toHaveCount(1);
 await page.locator('#markdown-preview td[colspan="2"]').click();
 await page.locator('#table-edit-merge').selectOption('split');
 await expect(page.locator('#markdown-preview td[colspan="2"]')).toHaveCount(0);
 await expect(page.locator('#markdown-preview tbody td')).toHaveCount(2);
});
test('HTML table formatting preserves cells, sanitizer and downloaded HTML',async({page})=>{
 await page.goto('/');
 const editor=page.locator('#markdown-input');
 await editor.fill('<table class="af-table-outline"><tr><td>A</td><td>B</td></tr><tr><td>C</td><td>D</td></tr></table>');
 await page.locator('#markdown-preview td').first().click();
 await page.locator('#table-edit-style').selectOption('cell-blue');
 await expect(page.locator('#markdown-preview td.af-cell-blue')).toHaveCount(1);
 await page.locator('#markdown-preview td').first().click();
 await page.locator('#table-edit-style').selectOption('borderless');
 await expect(page.locator('#markdown-preview table.af-table-borderless')).toHaveCount(1);
 const promise=page.waitForEvent('download');
 await closeCompatibility(page);
 await page.locator('#export-trigger').click();
 await page.locator('#download-html-btn').click();
 const download=await promise;
 const {readFile}=await import('node:fs/promises');
 const html=await readFile(await download.path(),'utf8');
 expect(html).toContain('af-table-borderless');
 expect(html).toContain('af-cell-blue');
 expect(html).not.toContain('onclick=');
});
test('Existing table edit menu localizes and remains reachable on mobile',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.goto('/');
 await setAppLanguage(page,'ru');
 await page.locator('#markdown-input').fill('| A | B |\n| --- | --- |\n| One | Two |');
 await page.locator('#mobile-tabs button[data-mobile-tab="preview"]').click();
 await page.locator('#markdown-preview tbody td').first().click();
 await expect(page.locator('#table-edit-title')).toHaveText('Изменить таблицу');
 await expect(page.locator('#table-edit-bar')).toBeInViewport();
 await page.locator('#table-edit-close').click();
 await expect(page.locator('#table-edit-bar')).toBeHidden();
});


test('editing an existing GFM table cell remains GFM, supports Undo/Redo and exports',async({page})=>{
 await page.goto('/');
 const source='Before\n\n| A | B |\n| --- | --- |\n| Alpha | Beta |\n\nAfter';
 await page.locator('#markdown-input').fill(source);
 await page.locator('#markdown-preview tbody td').first().click();
 await expect(page.locator('#table-edit-content-input')).toHaveValue('Alpha');
 await page.locator('#table-edit-content-input').fill('Changed | value <script>');
 await page.locator('#table-edit-content-save').click();
 const updated=await page.locator('#markdown-input').inputValue();
 expect(updated).toContain('Changed \\| value &lt;script&gt;');
 expect(updated).not.toContain('<table');
 expect(updated).toContain('Before');
 expect(updated).toContain('After');
 await expect(page.locator('#markdown-preview tbody td').first()).toHaveText('Changed | value <script>');
 await undo(page);
 await expect(page.locator('#markdown-preview tbody td').first()).toHaveText('Alpha');
 await redo(page);
 await expect(page.locator('#markdown-preview tbody td').first()).toHaveText('Changed | value <script>');
 const pending=page.waitForEvent('download');
 await closeCompatibility(page);
 await page.locator('#export-trigger').click();
 await page.locator('#download-html-btn').click();
 const file=await pending;
 const {readFile}=await import('node:fs/promises');
 const output=await readFile(await file.path(),'utf8');
 expect(output).not.toContain('<script>');
 expect(output).toContain('Changed');
});
test('editing a merged HTML cell retains rowspan/colspan and escapes entered HTML',async({page})=>{
 await page.goto('/');
 await page.locator('#markdown-input').fill('<table class="af-table-outline"><tr><td colspan="2">Combined</td></tr><tr><td>Left</td><td>Right</td></tr></table>');
 await page.locator('#markdown-preview td[colspan="2"]').click();
 await expect(page.locator('#table-edit-content-input')).toHaveValue('Combined');
 await page.locator('#table-edit-content-input').fill('Safe <img onerror="alert(1)">');
 await page.locator('#table-edit-content-save').click();
 await expect(page.locator('#markdown-preview td[colspan="2"]')).toHaveText('Safe <img onerror="alert(1)">');
 const text=await page.locator('#markdown-input').inputValue();
 expect(text).toContain('colspan="2"');
 expect(text).toContain('&lt;img');
 expect(text).not.toContain('<img');
 await expect(page.locator('#markdown-preview tbody td')).toHaveCount(3);
});
test('table cell content editor works in Russian mobile Preview',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.goto('/');
 await setAppLanguage(page,'ru');
 await page.locator('#markdown-input').fill('| A |\n| --- |\n| Original |');
 await page.locator('#mobile-tabs button[data-mobile-tab="preview"]').click();
 await page.locator('#markdown-preview tbody td').click();
 await expect(page.locator('#table-edit-content-save')).toHaveText('Сохранить ячейку');
 await page.locator('#table-edit-content-input').fill('Изменено');
 await page.locator('#table-edit-content-input').press('Enter');
 await expect(page.locator('#markdown-preview tbody td')).toHaveText('Изменено');
});


test('Advanced formatting groups can filter ribbon controls and persist across reload',async({page})=>{
 await page.goto('/');
 await page.locator('#advanced-tools-toggle').click();
 await expect(page.locator('#advanced-category-nav button')).toHaveCount(6);
 await page.locator('[data-advanced-category="tables"]').click();
 await expect(page.locator('#rich-tables')).toBeVisible();
 await expect(page.locator('#advanced-color')).toBeHidden();
 await expect(page.locator('#rich-blocks')).toBeHidden();
 await page.reload();
 await expect(page.locator('[data-advanced-category="tables"]')).toHaveAttribute('aria-pressed','true');
 await expect(page.locator('#rich-tables')).toBeVisible();
 await page.locator('[data-advanced-category="paragraph"]').click();
 await expect(page.locator('#advanced-align')).toBeVisible();
 await expect(page.locator('#advanced-page-break')).toBeVisible();
 await expect(page.locator('#rich-tables')).toBeHidden();
 await page.locator('[data-advanced-category="all"]').click();
 await expect(page.locator('#advanced-color')).toBeVisible();
 await expect(page.locator('#rich-tables')).toBeVisible();
});


test('custom ordered-list types are case-sensitive in Preview and downloaded HTML',async({page})=>{
 await page.goto('/');
 const types=['a','A','i','I','1'];
 const styles=['lower-alpha','upper-alpha','lower-roman','upper-roman','decimal'];
 const source=types.map(t=>'<ol type="'+t+'"><li>First</li><li>Second</li><li>Third</li></ol>').join('\n\n');
 await page.locator('#markdown-input').fill(source);
 const lists=page.locator('#markdown-preview ol');
 await expect(lists).toHaveCount(types.length);
 for(let i=0;i<types.length;i++){
  await expect(lists.nth(i)).toHaveAttribute('type',types[i]);
  expect(await lists.nth(i).evaluate(el=>getComputedStyle(el).listStyleType)).toBe(styles[i]);
 }
 const pending=page.waitForEvent('download');
 await closeCompatibility(page);
 await page.locator('#export-trigger').click();
 await page.locator('#download-html-btn').click();
 const file=await pending;
 const {readFile}=await import('node:fs/promises');
 const html=await readFile(await file.path(),'utf8');
 expect(html).toContain('class="af-list-lower-alpha"');
 expect(html).toContain('class="af-list-upper-alpha"');
 await page.setContent(html);
 const exported=page.locator('main.md-preview ol');
 await expect(exported).toHaveCount(types.length);
 for(let i=0;i<types.length;i++)
  expect(await exported.nth(i).evaluate(el=>getComputedStyle(el).listStyleType)).toBe(styles[i]);
});


