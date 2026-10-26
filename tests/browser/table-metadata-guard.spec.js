import {test,expect} from '@playwright/test';

// #57: Preserve structural metadata the HTML table serializer cannot model.
// The raw Markdown source is the authority, even when Preview omits attributes.
const localeCases=['en','cs','uk','ro','ru'];
for(const lang of localeCases){
 test('table metadata is read-only without source loss: '+lang,async({page})=>{
  if(lang==='ru')await page.setViewportSize({width:390,height:844});
  await page.goto('/');
  await page.locator('#lang-selector').selectOption(lang);
  const original='Intro\n\n<table data-report="annual">'+
   '<thead><tr><th scope="col">Product</th><th scope="col">Value</th></tr></thead>'+
   '<tbody><tr><td title="External identifier">A</td><td>10</td></tr></tbody>'+
   '</table>\n\nOutro';
  const editor=page.locator('#markdown-input');
  await editor.fill(original);
  if(lang==='ru')await page.locator('#mobile-tabs button[data-mobile-tab="preview"]').click();
  await page.locator('#markdown-preview tbody td').last().click();
  const bar=page.locator('#table-edit-bar');
  await expect(bar).toBeVisible();
  await expect(bar).toHaveAttribute('data-readonly','true');
  await expect(page.locator('#table-edit-readonly-message')).toBeVisible();
  await expect(page.locator('#table-edit-content-save')).toBeHidden();
  await expect(page.locator('#table-edit-rows')).toBeHidden();
  await expect(editor).toHaveValue(original);
  await page.locator('#table-edit-close').click();
  await expect(editor).toHaveValue(original);
 });
}
