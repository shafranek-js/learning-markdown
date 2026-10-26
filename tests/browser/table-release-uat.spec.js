import {test,expect} from '@playwright/test';
import {readFile} from 'node:fs/promises';

// Release gate: visual edits must preserve the canonical Markdown source,
// semantic HTML table structure, keyboard access and standalone exports.
test('release UAT: keyboard table edit round-trips semantic sections and both exports',async({page})=>{
 await page.goto('/');
 const source='Before\n\n<table><caption><strong>Monthly metrics</strong></caption>'+
  '<thead><tr><th scope="col">Team</th><th scope="col">Score</th></tr></thead>'+
  '<tbody><tr><th scope="row">First</th><td>10</td></tr>'+
  '<tr><th scope="row">Second</th><td>20</td></tr></tbody>'+
  '<tfoot><tr><th scope="row">Total</th><td>30</td></tr></tfoot></table>\n\nAfter';
 const input=page.locator('#markdown-input');
 await input.fill(source);
 const table=page.locator('#markdown-preview table');
 const firstValue=table.locator('tbody td').first();
 await firstValue.focus();
 await page.keyboard.press('Enter');
 await expect(page.locator('#table-edit-content-input')).toBeFocused();
 await page.locator('#table-edit-content-input').fill('42');
 await page.locator('#table-edit-content-save').click();
 const updated=await input.inputValue();
 expect(updated).toContain('<caption><strong>Monthly metrics</strong>');
 expect(updated).toContain('<thead>');
 expect(updated).toContain('<tbody>');
 expect(updated).toContain('<tfoot>');
 expect(updated).toContain('scope="col"');
 expect(updated).toContain('scope="row"');
 await expect(table.locator('tbody td').first()).toHaveText('42');
 await expect(table.locator('thead th[scope="col"]')).toHaveCount(2);
 await expect(table.locator('tfoot th[scope="row"]')).toHaveCount(1);

 await page.locator('#undo-btn').click();
 await expect(input).toHaveValue(source);
 await page.locator('#redo-btn').click();
 await expect(input).toHaveValue(updated);

 const mdPromise=page.waitForEvent('download');
 await page.locator('#export-trigger').click();
 await page.locator('#download-md-btn').click();
 const mdDownload=await mdPromise;
 expect(await readFile(await mdDownload.path(),'utf8')).toBe(updated);

 const htmlPromise=page.waitForEvent('download');
 await page.locator('#export-trigger').click();
 await page.locator('#download-html-btn').click();
 const htmlDownload=await htmlPromise;
 const html=await readFile(await htmlDownload.path(),'utf8');
 for(const token of ['<caption>','Monthly metrics','<thead>','<tbody>','<tfoot>','scope="col"','scope="row"','42'])
  expect(html).toContain(token);
 expect(html).toContain('script-src &#39;none&#39;');
 expect(html).not.toMatch(/<script[\s>]|onerror=|onclick=/i);
 await expect(input).toHaveValue(updated);
});

test('release security UAT: malformed attributes stay source-only and unsafe HTML is removed from export',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.goto('/');
 await page.locator('#lang-selector').selectOption('ru');
 const source='<table><caption>Quarterly report</caption>'+
  '<thead><tr><th scope="col">Товар</th></tr></thead>'+
  '<tbody class="unsafe"><tr><td onclick="window.__attack=1">'+
  '<a href="javascript:alert(1)">Unsafe link</a>'+
  '<script>window.__attack=2</script>'+
  '<img src="data:image/svg+xml,%3Csvg%3E" onerror="window.__attack=3">'+
  'Обычный текст</td></tr></tbody></table>';
 const input=page.locator('#markdown-input');
 await input.fill(source);
 await page.locator('#mobile-tabs button[data-mobile-tab="preview"]').click();
 await page.locator('#markdown-preview tbody td').focus();
 await page.keyboard.press('Enter');
 await expect(page.locator('#table-edit-bar')).toHaveAttribute('data-readonly','true');
 await expect(page.locator('#table-edit-readonly-message')).toBeVisible();
 await expect(input).toHaveValue(source);
 expect(await page.evaluate(()=>window.__attack)).toBeUndefined();

 const downloadPromise=page.waitForEvent('download');
 await page.locator('#export-trigger').click();
 await page.locator('#download-html-btn').click();
 const output=await downloadPromise;
 const html=await readFile(await output.path(),'utf8');
 expect(html).toContain('Quarterly report');
 expect(html).toContain('Обычный текст');
 expect(html).not.toMatch(/<script[\s>]|onclick=|onerror=|javascript:|data:image\/svg/i);
 expect(await page.evaluate(()=>window.__attack)).toBeUndefined();
 await expect(input).toHaveValue(source);
});
