import {test,expect} from '@playwright/test';

test('unsupported HTML table explains why visual editing is disabled, without changing source',async({page})=>{
 await page.goto('/');
 const editor=page.locator('#markdown-input');
 const source='<table><tr><td>First<td>Second</td></tr></table>';
 await editor.fill(source);
 await page.locator('#markdown-preview td').first().click();
 const bar=page.locator('#table-edit-bar');
 await expect(bar).toBeVisible();
 await expect(bar).toHaveAttribute('data-readonly','true');
 await expect(page.locator('#table-edit-readonly-message')).toContainText('missing or mismatched HTML closing tags');
 await expect(page.locator('#table-edit-readonly-message')).toContainText('Edit this table directly');
 await expect(page.locator('#table-edit-rows')).toBeHidden();
 await expect(page.locator('#table-edit-content-save')).toBeHidden();
 await expect(editor).toHaveValue(source);
 await page.locator('#table-edit-close').click();
 await expect(bar).toBeHidden();
 await editor.fill('| A | B |\n| --- | --- |\n| one | two |');
 await page.locator('#markdown-preview tbody td').first().click();
 await expect(bar).not.toHaveAttribute('data-readonly','true');
 await expect(page.locator('#table-edit-rows')).toBeVisible();
 await page.locator('#table-edit-rows').selectOption('row-below');
 await expect(page.locator('#markdown-preview tbody tr')).toHaveCount(2);
});

test('adjacent table roots display a specific read-only notice, keyboard-accessibly',async({page})=>{
 await page.goto('/');
 const editor=page.locator('#markdown-input');
 const source='<table><tr><td>First</td></tr></table>'+
  '<table><tr><td>Second</td></tr></table>';
 await editor.fill(source);
 await expect(page.locator('#markdown-preview table')).toHaveCount(2);
 const cell=page.locator('#markdown-preview td').first();
 await cell.focus();
 await cell.press('Enter');
 await expect(page.locator('#table-edit-bar')).toHaveAttribute('data-readonly','true');
 await expect(page.locator('#table-edit-readonly-message')).toContainText('multiple table roots');
 await expect(editor).toHaveValue(source);
 await expect(page.locator('#table-edit-content-input')).toBeHidden();
});

test('nested parent is read-only with Russian explanation; leaf remains editable on mobile',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.goto('/');
 await page.locator('#lang-selector').selectOption('ru');
 const editor=page.locator('#markdown-input');
 const source='<table><tr><td>Снаружи<table><tr><td>Внутри</td></tr></table>Конец</td></tr></table>';
 await editor.fill(source);
 await page.locator('#mobile-tabs button[data-mobile-tab="preview"]').click();
 const outerCell=page.locator('#markdown-preview table').first().locator(':scope > tbody > tr > td').first();
 await outerCell.focus();
 await outerCell.press('Enter');
 await expect(page.locator('#table-edit-title')).toHaveText('Таблица только для просмотра');
 await expect(page.locator('#table-edit-readonly-message')).toContainText('вложенные таблицы');
 await expect(page.locator('#table-edit-bar')).toBeInViewport();
 await expect(editor).toHaveValue(source);
 await page.locator('#markdown-preview table').last().locator('td').first().click();
 await expect(page.locator('#table-edit-bar')).not.toHaveAttribute('data-readonly','true');
 await expect(page.locator('#table-edit-content-input')).toBeVisible();
 await expect(page.locator('#table-edit-content-input')).toHaveValue('Внутри');
});


const localeTitles={
 en:'Table is read-only',
 cs:'Tabulka je pouze pro čtení',
 uk:'Таблиця лише для читання',
 ro:'Tabel doar pentru citire',
 ru:'Таблица только для просмотра'
};
for(const [lang,title] of Object.entries(localeTitles)){
 test('existing HTML source annotations remain untouched in visual table editing ('+lang+')',async({page})=>{
  if(lang==='ru')await page.setViewportSize({width:390,height:844});
  await page.goto('/');
  await page.locator('#lang-selector').selectOption(lang);
  const input=page.locator('#markdown-input');
  const original='<table><tr><td>First <!-- preserve author annotation --></td>'+
   '<td>Safe neighbor</td></tr></table>';
  await input.fill(original);
  if(lang==='ru')await page.locator('#mobile-tabs button[data-mobile-tab="preview"]').click();
  await page.locator('#markdown-preview td').last().click();
  await expect(page.locator('#table-edit-title')).toHaveText(title);
  await expect(page.locator('#table-edit-bar')).toHaveAttribute('data-readonly','true');
  await expect(page.locator('#table-edit-readonly-message')).toBeVisible();
  await expect(page.locator('#table-edit-rows')).toBeHidden();
  await expect(input).toHaveValue(original);
 });
}

test('existing unsupported raw-text elements are guarded, unrelated plain HTML tables stay editable',async({page})=>{
 await page.goto('/');
 const input=page.locator('#markdown-input');
 const first='<table><tr><td>Original <textarea>Hidden author data</textarea></td>'+
  '<td>Neighbor</td></tr></table>';
 const second='<table><tr><td>Independent</td></tr></table>';
 const source=first+'\n\n'+second;
 await input.fill(source);
 await page.locator('#markdown-preview table').first().locator('td').last().click();
 await expect(page.locator('#table-edit-bar')).toHaveAttribute('data-readonly','true');
 await expect(input).toHaveValue(source);
 await page.locator('#markdown-preview table').last().locator('td').click();
 await expect(page.locator('#table-edit-bar')).not.toHaveAttribute('data-readonly','true');
 await page.locator('#table-edit-rows').selectOption('row-below');
 const updated=await input.inputValue();
 expect(updated.startsWith(first+'\n\n')).toBe(true);
 await expect(page.locator('#markdown-preview table').last().locator('tr')).toHaveCount(2);
 await page.locator('#undo-btn').click();
 await expect(input).toHaveValue(source);
});
