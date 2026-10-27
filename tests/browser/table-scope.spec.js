import {test,expect} from '@playwright/test';
import {setAppLanguage} from './support/settings.js';

test('table header scope remains accessible through cell editing and row insertion',async({page})=>{
 await page.goto('/');
 const source='<table><caption>Metrics</caption>'+
  '<thead><tr><th scope="col">Name</th><th scope="col">Value</th></tr></thead>'+
  '<tbody><tr><th scope="row">A</th><td>1</td></tr>'+
  '<tr><th scope="row">B</th><td>2</td></tr></tbody></table>';
 const input=page.locator('#markdown-input');
 await input.fill(source);
 const table=page.locator('#markdown-preview table');
 await expect(table.locator('thead th[scope="col"]')).toHaveCount(2);
 await expect(table.locator('tbody th[scope="row"]')).toHaveCount(2);
 await table.locator('tbody td').first().click();
 await page.locator('#table-edit-content-input').fill('42');
 await page.locator('#table-edit-content-save').click();
 expect(await input.inputValue()).toContain('scope="col"');
 expect(await input.inputValue()).toContain('scope="row"');
 await table.locator('tbody td').first().click();
 await page.locator('#table-edit-rows').selectOption('row-below');
 await expect(table.locator('tbody tr')).toHaveCount(3);
 await expect(table.locator('thead th[scope="col"]')).toHaveCount(2);
 await expect(table.locator('tbody th[scope="row"]')).toHaveCount(2);
 await page.locator('#undo-btn').click();
 await expect(table.locator('tbody tr')).toHaveCount(2);
 await page.locator('#undo-btn').click();
 await expect(input).toHaveValue(source);
});

test('mobile read-only guard keeps unsupported header relationships intact',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.goto('/');
 await setAppLanguage(page,'ru');
 const source='<table><thead><tr><th abbr="Title">Название</th></tr></thead>'+
  '<tbody><tr><td>Один</td></tr></tbody></table>';
 const input=page.locator('#markdown-input');
 await input.fill(source);
 await page.locator('#mobile-tabs button[data-mobile-tab="preview"]').click();
 await page.locator('#markdown-preview tbody td').click();
 await expect(page.locator('#table-edit-bar')).toHaveAttribute('data-readonly','true');
 await expect(page.locator('#table-edit-readonly-message')).toBeVisible();
 await expect(input).toHaveValue(source);
});
