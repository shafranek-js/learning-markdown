import {undo,redo} from './support/history-actions.js';
import {test,expect} from '@playwright/test';
import {setAppLanguage} from './support/settings.js';

test('issue #6 table caption survives visual cell Save, row insertion, Undo and Redo',async({page})=>{
 await page.goto('/');
 const source='Before\n\n<table class="af-table-outline"><caption>'+
  '<strong>Quarterly results</strong> <a href="https://example.org/report">report</a>'+
  '</caption><tr><td>Alpha</td><td>Beta</td></tr>'+
  '<tr><td>Gamma</td><td>Delta</td></tr></table>\n\nAfter';
 const input=page.locator('#markdown-input');
 await input.fill(source);
 const table=page.locator('#markdown-preview table');
 await expect(table.locator(':scope > caption')).toContainText('Quarterly results report');
 await table.locator('td').first().click();
 await expect(page.locator('#table-edit-bar')).not.toHaveAttribute('data-readonly','true');
 await page.locator('#table-edit-content-input').fill('Changed');
 await page.locator('#table-edit-content-save').click();
 let updated=await input.inputValue();
 expect(updated).toContain('<caption><strong>Quarterly results</strong>');
 expect(updated).toContain('report</a>');
 expect(updated).toContain('Changed');
 expect(updated).toContain('Before');
 expect(updated).toContain('After');
 await expect(table.locator(':scope > caption')).toContainText('Quarterly results report');
 await undo(page);
 await expect(input).toHaveValue(source);
 await redo(page);
 await expect(table.locator('td').first()).toHaveText('Changed');
 await table.locator('td').first().click();
 await page.locator('#table-edit-rows').selectOption('row-below');
 await expect(table.locator('tr')).toHaveCount(3);
 await expect(table.locator(':scope > caption')).toContainText('Quarterly results report');
 updated=await input.inputValue();
 expect(updated).toContain('<caption><strong>Quarterly results</strong>');
 await undo(page);
 await expect(table.locator('tr')).toHaveCount(2);
 await expect(table.locator(':scope > caption')).toContainText('Quarterly results report');
});

test('issue #6 mobile rejects caption metadata that serializer cannot preserve',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.goto('/');
 await setAppLanguage(page,'ru');
 const source='<table><caption class="custom">Важная подпись</caption>'+
  '<tr><td>Первый</td><td>Второй</td></tr></table>';
 const input=page.locator('#markdown-input');
 await input.fill(source);
 await page.locator('#mobile-tabs button[data-mobile-tab="preview"]').click();
 await page.locator('#markdown-preview td').first().click();
 await expect(page.locator('#table-edit-bar')).toHaveAttribute('data-readonly','true');
 await expect(page.locator('#table-edit-readonly-message')).toBeVisible();
 await expect(page.locator('#table-edit-rows')).toBeHidden();
 await expect(input).toHaveValue(source);
 await expect(page.locator('#table-edit-bar')).toBeInViewport();
});
