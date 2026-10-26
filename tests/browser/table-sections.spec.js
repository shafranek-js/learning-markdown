import {test,expect} from '@playwright/test';

test('semantic table sections survive visual cell save, body row insertion and Undo/Redo',async({page})=>{
 await page.goto('/');
 const source='Before\\n\\n<table><caption><strong>Yearly report</strong></caption>'+
  '<thead><tr><th>Item</th><th>Total</th></tr></thead>'+
  '<tbody><tr><td>Alpha</td><td>10</td></tr><tr><td>Beta</td><td>20</td></tr></tbody>'+
  '<tfoot><tr><th>Sum</th><td>30</td></tr></tfoot></table>\\n\\nAfter';
 const input=page.locator('#markdown-input');
 await input.fill(source);
 const table=page.locator('#markdown-preview table');
 await table.locator('tbody tr').first().locator('td').first().click();
 await expect(page.locator('#table-edit-bar')).not.toHaveAttribute('data-readonly','true');
 await page.locator('#table-edit-content-input').fill('Changed');
 await page.locator('#table-edit-content-save').click();
 await expect(table.locator('thead th').first()).toHaveText('Item');
 await expect(table.locator('tbody tr').first().locator('td').first()).toHaveText('Changed');
 await expect(table.locator('tfoot th')).toHaveText('Sum');
 let updated=await input.inputValue();
 expect(updated).toContain('<thead>');
 expect(updated).toContain('<tbody>');
 expect(updated).toContain('<tfoot>');
 expect(updated).toContain('<caption><strong>Yearly report</strong>');
 await page.locator('#undo-btn').click();
 await expect(input).toHaveValue(source);
 await page.locator('#redo-btn').click();
 await table.locator('tbody tr').first().locator('td').first().click();
 await page.locator('#table-edit-rows').selectOption('row-below');
 await expect(table.locator('thead tr')).toHaveCount(1);
 await expect(table.locator('tbody tr')).toHaveCount(3);
 await expect(table.locator('tfoot tr')).toHaveCount(1);
 updated=await input.inputValue();
 expect(updated).toContain('<tfoot>');
 await page.locator('#undo-btn').click();
 await expect(table.locator('tbody tr')).toHaveCount(2);
});

test('Russian mobile reports unsupported semantic section attributes without changing source',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.goto('/');
 await page.locator('#lang-selector').selectOption('ru');
 const source='<table><thead class="custom"><tr><th>Товар</th></tr></thead>'+
  '<tbody><tr><td>Значение</td></tr></tbody></table>';
 const input=page.locator('#markdown-input');
 await input.fill(source);
 await page.locator('#mobile-tabs button[data-mobile-tab="preview"]').click();
 await page.locator('#markdown-preview tbody td').click();
 await expect(page.locator('#table-edit-bar')).toHaveAttribute('data-readonly','true');
 await expect(page.locator('#table-edit-readonly-message')).toBeVisible();
 await expect(input).toHaveValue(source);
});
