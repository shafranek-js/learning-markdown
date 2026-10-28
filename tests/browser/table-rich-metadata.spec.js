import {undo,redo} from './support/history-actions.js';
import {test,expect} from '@playwright/test';
import {setAppLanguage} from './support/settings.js';

// Visual editing must never silently erase metadata on rich cell descendants.
// All languages share the same source integrity guard and localize its notice.
for(const language of ['en','cs','uk','ro','ru']){
 test('rich cell metadata remains source-only in '+language,async({page})=>{
  if(language==='ru')await page.setViewportSize({width:390,height:844});
  await page.goto('/');
  await setAppLanguage(page,language);
  const original='Before\n\n<table><tr>'+
   '<td><p title="Imported value"><strong>Original</strong></p>'+
   '<span aria-label="Source label">Accessible</span></td>'+
   '<td>Editable looking neighbor</td></tr></table>\n\nAfter';
  const input=page.locator('#markdown-input');
  await input.fill(original);
  if(language==='ru')await page.locator('#mobile-tabs [data-mobile-tab="preview"]').click();
  await page.locator('#markdown-preview table td').last().click();
  await expect(page.locator('#table-edit-bar')).toHaveAttribute('data-readonly','true');
  await expect(page.locator('#table-edit-readonly-message')).toBeVisible();
  await expect(page.locator('#table-edit-content-save')).toBeHidden();
  await expect(input).toHaveValue(original);
 });
}

test('nested leaf is editable although untouched parent cell has metadata',async({page})=>{
 await page.goto('/');
 const original='<table><tr><td><p title="Preserved parent">Introduction</p>'+
  '<table><tr><td>Inner text</td></tr></table>'+
  '</td></tr></table>';
 const input=page.locator('#markdown-input');
 await input.fill(original);
 const inner=page.locator('#markdown-preview table table td').first();
 await inner.click();
 await expect(page.locator('#table-edit-bar')).not.toHaveAttribute('data-readonly','true');
 await page.locator('#table-edit-content-input').fill('Updated inner');
 await page.locator('#table-edit-content-save').click();
 const changed=await input.inputValue();
 expect(changed).toContain('title="Preserved parent"');
 expect(changed).toContain('Updated inner');
 await undo(page);
 await expect(input).toHaveValue(original);
});
