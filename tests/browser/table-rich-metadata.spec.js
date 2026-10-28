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

const unexpectedAttributes={
 en:'class="author-paragraph"',
 cs:'id="authored-block"',
 uk:'class="af-color-blue custom"',
 ro:'draggable="true"',
 ru:'download="saved-copy"'
};
for(const [language,attribute] of Object.entries(unexpectedAttributes)){
 test('issue #57 unmapped rich cell attribute refuses visual rewrite in '+language,async({page})=>{
  if(language==='ru')await page.setViewportSize({width:390,height:844});
  await page.goto('/');
  await setAppLanguage(page,language);
  const content=attribute.startsWith('download')
   ?'<a href="https://example.org/report" '+attribute+'>Report</a>'
   :'<p '+attribute+'>Original content</p>';
  const source='Intro\n\n<table><tr><td>'+content+
   '</td><td>Editable neighbor</td></tr></table>\n\nOutro';
  const input=page.locator('#markdown-input');
  await input.fill(source);
  if(language==='ru')
   await page.locator('#mobile-tabs button[data-mobile-tab="preview"]').click();
  await page.locator('#markdown-preview td').last().click();
  await expect(page.locator('#table-edit-bar')).toHaveAttribute('data-readonly','true');
  await expect(page.locator('#table-edit-readonly-message')).toBeVisible();
  await expect(page.locator('#table-edit-content-save')).toBeHidden();
  await expect(input).toHaveValue(source);
  await page.locator('#table-edit-close').click();
  await expect(input).toHaveValue(source);
 });
}

test('issue #57 modeled rich classes still support neighboring cell Save and Undo/Redo',async({page})=>{
 await page.goto('/');
 const original='Before\n\n<table><tr><td><p><span class="af-color-blue">Blue</span></p>'+
  '<ol type="i" start="5" class="af-list-lower-roman"><li>Five</li></ol></td>'+
  '<td>Neighbor</td></tr></table>\n\nAfter';
 const input=page.locator('#markdown-input');
 await input.fill(original);
 await page.locator('#markdown-preview td').last().click();
 await expect(page.locator('#table-edit-bar')).not.toHaveAttribute('data-readonly','true');
 await page.locator('#table-edit-content-input').fill('Changed');
 await page.locator('#table-edit-content-save').click();
 const saved=await input.inputValue();
 expect(saved).toContain('af-color-blue');
 expect(saved).toContain('af-list-lower-roman');
 expect(saved).toContain('start="5"');
 expect(saved).toContain('Changed');
 expect(saved).toContain('Before');
 expect(saved).toContain('After');
 await undo(page);
 await expect(input).toHaveValue(original);
 await redo(page);
 await expect(page.locator('#markdown-preview ol[start="5"] > li')).toHaveText('Five');
});

test('issue #57 nested leaf edit preserves custom class on untouched outer paragraph',async({page})=>{
 await page.goto('/');
 const original='<table><tr><td><p class="author-paragraph">Unchanged outer</p>'+
  '<table><tr><td>Inner</td></tr></table></td></tr></table>';
 const input=page.locator('#markdown-input');
 await input.fill(original);
 await page.locator('#markdown-preview table table td').first().click();
 await expect(page.locator('#table-edit-bar')).not.toHaveAttribute('data-readonly','true');
 await page.locator('#table-edit-content-input').fill('Updated inner');
 await page.locator('#table-edit-content-save').click();
 const saved=await input.inputValue();
 expect(saved).toContain('class="author-paragraph"');
 expect(saved).toContain('Unchanged outer');
 expect(saved).toContain('Updated inner');
 await undo(page);
 await expect(input).toHaveValue(original);
});
