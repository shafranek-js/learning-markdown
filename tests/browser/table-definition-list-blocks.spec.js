import {test,expect} from '@playwright/test';
import {undo,redo} from './support/history-actions.js';
import {setAppLanguage} from './support/settings.js';

test('definition lists and dividers round-trip inside a rich HTML table cell',async({page})=>{
 await page.goto('/');
 const input=page.locator('#markdown-input');
 const source='Before\n\n<table><tr><td><p>Introduction</p>'+
  '<dl><dt>API</dt><dd>Application <strong>interface</strong></dd>'+
  '<dt>UAT</dt><dd>User acceptance testing</dd></dl><hr>'+
  '</td><td>Neighbor cell</td></tr></table>\n\nAfter';
 await input.fill(source);
 await page.locator('#markdown-preview table td').first().click();
 const blocks=page.locator('#table-edit-rich-content');
 await expect(page.locator('#table-edit-block-choice')).toHaveAttribute('aria-pressed','true');
 await expect(blocks.locator('dl dt')).toHaveCount(2);
 await expect(blocks.locator('dl dd').first()).toContainText('Application');
 await expect(blocks.locator('hr')).toHaveCount(1);
 await expect(input).toHaveValue(source);
 await blocks.locator('dl dd').last().evaluate(el=>{
  el.textContent='Functional acceptance testing';
  el.dispatchEvent(new InputEvent('input',{bubbles:true,inputType:'insertText',data:null}));
 });
 await page.locator('#table-edit-content-save').click();
 const edited=await input.inputValue();
 expect(edited).toContain('<dt>API</dt>');
 expect(edited).toContain('<strong>interface</strong>');
 expect(edited).toContain('<dd>Functional acceptance testing</dd>');
 expect(edited).toContain('<hr>');
 expect(edited).toContain('<td>Neighbor cell</td>');
 expect(edited.startsWith('Before\n\n')).toBe(true);
 expect(edited.endsWith('\n\nAfter')).toBe(true);
 await undo(page);
 await expect(input).toHaveValue(source);
 await redo(page);
 await expect(input).toHaveValue(edited);
});

test('definition list blocks work on narrow Russian mobile Preview',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.goto('/');
 await setAppLanguage(page,'ru');
 const input=page.locator('#markdown-input');
 const source='<table><tr><td><dl><dt>Термин</dt><dd>Описание</dd></dl><hr></td>'+
  '<td>Соседняя ячейка</td></tr></table>';
 await input.fill(source);
 await page.locator('#mobile-tabs [data-mobile-tab="preview"]').click();
 await page.locator('#markdown-preview table td').first().click();
 await expect(page.locator('#table-edit-block-choice')).toHaveAttribute('aria-pressed','true');
 const blocks=page.locator('#table-edit-rich-content');
 await expect(blocks.locator('dt')).toHaveText('Термин');
 await expect(blocks.locator('dd')).toHaveText('Описание');
 await blocks.locator('dd').evaluate(el=>{
  el.textContent='Исправленное описание';
  el.dispatchEvent(new InputEvent('input',{bubbles:true,inputType:'insertText',data:null}));
 });
 await page.locator('#table-edit-content-save').click();
 const edited=await input.inputValue();
 expect(edited).toContain('<dd>Исправленное описание</dd>');
 expect(edited).toContain('<hr>');
 expect(edited).toContain('Соседняя ячейка');
 await undo(page);
 await expect(input).toHaveValue(source);
});

test('definition-list metadata retains original source under read-only protection',async({page})=>{
 await page.goto('/');
 const source='<table><tr><td><dl data-source="keep"><dt>Term</dt>'+
  '<dd>Definition</dd></dl></td><td>Neighbor</td></tr></table>';
 const input=page.locator('#markdown-input');
 await input.fill(source);
 await page.locator('#markdown-preview table td').first().click();
 await expect(page.locator('#table-edit-bar')).toHaveAttribute('data-readonly','true');
 await expect(page.locator('#table-edit-readonly-message')).toBeVisible();
 await expect(page.locator('#table-edit-content-save')).toBeHidden();
 await expect(input).toHaveValue(source);
});
