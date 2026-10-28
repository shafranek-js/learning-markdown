import {test,expect} from '@playwright/test';
import {undo,redo} from './support/history-actions.js';
import {setAppLanguage} from './support/settings.js';

const messages={
 en:'crosses the boundary between header, body or footer',
 cs:'přesahuje hranici záhlaví',
 uk:'перетинає межу',
 ro:'granița dintre antet',
 ru:'пересекает границу'
};

for(const [locale,phrase] of Object.entries(messages)){
 test('cross-section row span stays source-only with clear feedback ('+locale+')',async({page})=>{
  if(locale==='ru')await page.setViewportSize({width:390,height:844});
  await page.goto('/');
  await setAppLanguage(page,locale);
  const source='Before\n\n<table><thead><tr><th rowspan="2">Header</th></tr></thead>'+
   '<tbody><tr><td>Body</td></tr></tbody></table>\n\nAfter';
  const input=page.locator('#markdown-input');
  await input.fill(source);
  if(locale==='ru')await page.locator('#mobile-tabs [data-mobile-tab="preview"]').click();
  await page.locator('#markdown-preview table th').first().click();
  await expect(page.locator('#table-edit-bar')).toHaveAttribute('data-readonly','true');
  await expect(page.locator('#table-edit-readonly-message')).toContainText(phrase);
  await expect(page.locator('#table-edit-content-save')).toBeHidden();
  await expect(input).toHaveValue(source);
 });
}

test('row span confined to one tbody remains editable with undo',async({page})=>{
 await page.goto('/');
 const original='<table><tbody><tr><td rowspan="2">Item</td><td>A</td></tr>'+
  '<tr><td>B</td></tr></tbody></table>';
 const input=page.locator('#markdown-input');
 await input.fill(original);
 await page.locator('#markdown-preview table td').last().click();
 await expect(page.locator('#table-edit-bar')).not.toHaveAttribute('data-readonly','true');
 await page.locator('#table-edit-content-input').fill('Updated');
 await page.locator('#table-edit-content-save').click();
 const changed=await input.inputValue();
 expect(changed).toContain('rowspan="2"');
 expect(changed).toContain('Updated');
 await undo(page);
 await expect(input).toHaveValue(original);
});
