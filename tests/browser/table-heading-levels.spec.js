import {test,expect} from '@playwright/test';

test('H1, H5, H6 mixed headings open in block editor and round-trip untouched sections',async({page})=>{
 await page.goto('/');
 const source='Before\n\n<table class="af-table-outline"><tr><td>'+
  '<h1>Main title</h1><p>Body text</p><h5>Detail title</h5>'+
  '<h6>Fine print</h6></td><td>Unchanged</td></tr></table>\n\nAfter';
 const input=page.locator('#markdown-input');
 await input.fill(source);
 await page.locator('#markdown-preview table td').first().click();
 const blocks=page.locator('#table-edit-rich-content');
 await expect(page.locator('#table-edit-block-choice')).toHaveAttribute('aria-pressed','true');
 await expect(blocks.locator(':scope > h1')).toHaveText('Main title');
 await expect(blocks.locator(':scope > h5')).toHaveText('Detail title');
 await expect(blocks.locator(':scope > h6')).toHaveText('Fine print');
 await expect(input).toHaveValue(source);
 await blocks.locator(':scope > h5').evaluate(el=>{
  el.textContent='Updated detail heading';
  el.dispatchEvent(new InputEvent('input',{bubbles:true,inputType:'insertText',data:null}));
 });
 await page.locator('#table-edit-content-save').click();
 const updated=await input.inputValue();
 for(const piece of ['Before','After','<h1>Main title</h1>','<h5>Updated detail heading</h5>',
  '<h6>Fine print</h6>','<td>Unchanged</td>'])expect(updated).toContain(piece);
 await page.locator('#undo-btn').click();
 await expect(input).toHaveValue(source);
 await page.locator('#redo-btn').click();
 await expect(input).toHaveValue(updated);
});

test('Russian narrow-screen table retains H1 and H6 when editing a cell heading',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.goto('/');
 await page.locator('#lang-selector').selectOption('ru');
 const original='<table><tr><td><h1>Заголовок</h1><h6>Примечание</h6></td>'+
  '<td>Другая ячейка</td></tr></table>';
 const input=page.locator('#markdown-input');
 await input.fill(original);
 await page.locator('#mobile-tabs button[data-mobile-tab="preview"]').click();
 await page.locator('#markdown-preview table td').first().click();
 await expect(page.locator('#table-edit-block-choice')).toHaveAttribute('aria-pressed','true');
 const rich=page.locator('#table-edit-rich-content');
 await expect(rich.locator('h1')).toHaveText('Заголовок');
 await expect(rich.locator('h6')).toHaveText('Примечание');
 await rich.locator('h6').evaluate(el=>{
  el.textContent='Новое примечание';
  el.dispatchEvent(new InputEvent('input',{bubbles:true,inputType:'insertText',data:null}));
 });
 await page.locator('#table-edit-content-save').click();
 const changed=await input.inputValue();
 expect(changed).toContain('<h1>Заголовок</h1>');
 expect(changed).toContain('<h6>Новое примечание</h6>');
 expect(changed).toContain('Другая ячейка');
 await page.locator('#undo-btn').click();
 await expect(input).toHaveValue(original);
});
