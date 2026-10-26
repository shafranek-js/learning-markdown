import {test,expect} from '@playwright/test';

test('nested HTML leaf edits preserve untouched outer raw markup and Undo/Redo',async({page})=>{
 await page.goto('/');
 const input=page.locator('#markdown-input');
 const before='Before\n\n<table class="af-table-outline">\n'+
  '<tr><td><p title="unchanged source attribute">Outer <strong>rich</strong></p>\n'+
  '<table><tr><td>Alpha</td><td>Beta</td></tr></table>\n'+
  '<p><em>After</em></p></td><td>Sibling text</td></tr>\n</table>\n\nAfter';
 await input.fill(before);
 const nested=page.locator('#markdown-preview table table');
 await expect(nested).toHaveCount(1);
 await nested.locator('td').first().click();
 const bar=page.locator('#table-edit-bar');
 await expect(bar).toBeVisible();
 await expect(bar).not.toHaveAttribute('data-readonly','true');
 await page.locator('#table-edit-content-input').fill('Revised');
 await page.locator('#table-edit-content-save').click();
 const after=await input.inputValue();
 const leaf='<table><tr><td>Alpha</td><td>Beta</td></tr></table>';
 const leafStart=before.indexOf(leaf);
 expect(after.startsWith(before.slice(0,leafStart))).toBe(true);
 expect(after.endsWith(before.slice(leafStart+leaf.length))).toBe(true);
 expect(after).toContain('<td>Revised</td>');
 expect(after).toContain('title="unchanged source attribute"');
 await page.locator('#undo-btn').click();
 await expect(input).toHaveValue(before);
 await page.locator('#redo-btn').click();
 await expect(input).toHaveValue(after);
});

test('nested sibling leaf editing on mobile keeps the other nested table source',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.goto('/');
 await page.locator('#lang-selector').selectOption('ru');
 const first='<table><tr><td>Первая</td></tr></table>';
 const second='<table><tr><td>Вторая</td></tr></table>';
 const before='Старт\n\n<table><tr><td>Начало '+first+' Между '+second+' Конец</td></tr></table>';
 const input=page.locator('#markdown-input');
 await input.fill(before);
 await page.locator('#mobile-tabs button[data-mobile-tab="preview"]').click();
 const leaves=page.locator('#markdown-preview table table');
 await expect(leaves).toHaveCount(2);
 await leaves.last().locator('td').first().click();
 await expect(page.locator('#table-edit-bar')).not.toHaveAttribute('data-readonly','true');
 await page.locator('#table-edit-content-input').fill('Изменено');
 await page.locator('#table-edit-content-save').click();
 const after=await input.inputValue();
 expect(after).toContain(first);
 expect(after).toContain('Начало ');
 expect(after).toContain(' Между ');
 expect(after).toContain(' Конец');
 expect(after).toContain('Изменено');
});
