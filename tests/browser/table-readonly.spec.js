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

test('unmapped adjacent tables display a safe read-only notice, keyboard-accessibly',async({page})=>{
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
 await expect(page.locator('#table-edit-readonly-message')).toContainText('cannot be reliably matched');
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
 await page.locator('#markdown-preview table').first().locator(':scope > tbody > tr > td').first().click();
 await expect(page.locator('#table-edit-title')).toHaveText('Таблица только для просмотра');
 await expect(page.locator('#table-edit-readonly-message')).toContainText('вложенные таблицы');
 await expect(page.locator('#table-edit-bar')).toBeInViewport();
 await expect(editor).toHaveValue(source);
 await page.locator('#markdown-preview table').last().locator('td').first().click();
 await expect(page.locator('#table-edit-bar')).not.toHaveAttribute('data-readonly','true');
 await expect(page.locator('#table-edit-content-input')).toBeVisible();
 await expect(page.locator('#table-edit-content-input')).toHaveValue('Внутри');
});
