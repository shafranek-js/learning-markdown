import {undo,redo} from './support/history-actions.js';
import {test,expect} from '@playwright/test';
import {setAppLanguage,setAppTheme} from './support/settings.js';
import {readFile} from 'node:fs/promises';
import {openCompatibility,closeCompatibility} from './support/compatibility.js';

test('issue #6 Blocks list Tab/Shift+Tab preserve inline formatting, source and Undo/Redo',async({page})=>{
 await page.goto('/');
 const source='Before\n\n<table class="af-table-outline"><tr><td>'+
  '<ul><li>Alpha <strong>bold</strong></li><li>Beta <em>italic</em></li><li>Gamma</li></ul>'+
  '</td><td>Neighbor</td></tr></table>\n\nAfter';
 const input=page.locator('#markdown-input');
 await input.fill(source);
 await page.locator('#markdown-preview td').first().click();
 await expect(page.locator('#table-edit-block-choice')).toHaveAttribute('aria-pressed','true');
 const rich=page.locator('#table-edit-rich-content');
 await rich.locator('ul > li').nth(1).evaluate(el=>{
  const text=el.firstChild,range=document.createRange(),sel=window.getSelection();
  el.closest('[contenteditable]').focus();
  range.setStart(text,2);range.collapse(true);
  sel.removeAllRanges();sel.addRange(range);
 });
 await page.keyboard.press('Tab');
 await expect(rich.locator('ul > li > ul > li')).toContainText('Beta italic');
 await expect(rich.locator('ul > li > ul > li em')).toHaveText('italic');
 await page.keyboard.press('Shift+Tab');
 await expect(rich.locator('ul > li > ul > li')).toHaveCount(0);
 await expect(rich.locator('ul > li')).toHaveCount(3);
 await page.keyboard.press('Tab');
 await expect(rich.locator('ul > li > ul > li')).toHaveCount(1);
 await expect(input).toHaveValue(source);
 await page.locator('#table-edit-content-save').click();
 const changed=await input.inputValue();
 expect(changed).toContain('<ul><li>Beta <em>italic</em></li></ul>');
 for(const token of ['Alpha','<strong>bold</strong>','Gamma','Neighbor','Before','After'])
  expect(changed).toContain(token);
 await undo(page);
 await expect(input).toHaveValue(source);
 await redo(page);
 await expect(page.locator('#markdown-preview td ul > li > ul > li')).toContainText('Beta italic');
 const downloading=page.waitForEvent('download');
 await closeCompatibility(page);
 await page.locator('#export-trigger').click();
 await page.locator('#download-html-btn').click();
 const file=await downloading;
 const html=await readFile(await file.path(),'utf8');
 expect(html).toContain('<em>italic</em>');
 expect(html).toContain('Neighbor');
});

test('issue #6 Blocks multi-item list selection indents and outdents together',async({page})=>{
 await page.goto('/');
 const source='<table><tr><td><ol><li>One</li><li>Two</li><li>Three</li><li>Four</li></ol></td></tr></table>';
 await page.locator('#markdown-input').fill(source);
 await page.locator('#markdown-preview td').click();
 const rich=page.locator('#table-edit-rich-content');
 await rich.locator('ol > li').nth(1).evaluate(el=>{
  const next=el.nextElementSibling;
  const sel=window.getSelection(),r=document.createRange();
  el.closest('[contenteditable]').focus();
  r.setStart(el.firstChild,0);
  r.setEnd(next.firstChild,next.firstChild.length);
  sel.removeAllRanges();sel.addRange(r);
 });
 await page.keyboard.press('Tab');
 await expect(rich.locator('ol > li > ol > li')).toHaveCount(2);
 await expect(rich.locator('ol > li > ol > li').first()).toHaveText('Two');
 await expect(rich.locator('ol > li > ol > li').last()).toHaveText('Three');
 await page.keyboard.press('Shift+Tab');
 await expect(rich.locator('ol > li > ol')).toHaveCount(0);
 await expect(rich.locator('ol > li')).toHaveCount(4);
 await expect(page.locator('#markdown-input')).toHaveValue(source);
});

test('issue #6 Blocks Enter exits empty item, Backspace outdents nested and preserves markup',async({page})=>{
 await page.goto('/');
 const input=page.locator('#markdown-input');
 await input.fill('<table><tr><td><ul><li>First</li><li><br></li></ul><p>Following</p></td></tr></table>');
 await page.locator('#markdown-preview td').click();
 const rich=page.locator('#table-edit-rich-content');
 await rich.locator('ul > li').last().evaluate(el=>{
  const r=document.createRange(),s=window.getSelection();
  el.closest('[contenteditable]').focus();
  r.setStart(el,0);r.collapse(true);
  s.removeAllRanges();s.addRange(r);
 });
 await page.keyboard.press('Enter');
 await expect(rich.locator('ul > li')).toHaveCount(1);
 await expect(rich.locator('p')).toHaveCount(2);
 await page.locator('#table-edit-content-save').click();
 await expect(page.locator('#markdown-preview td')).toContainText('Following');
 await input.fill('<table><tr><td><ul><li>Main<ul><li><strong>Inner</strong></li>'+
  '<li>Another</li></ul></li><li>Last</li></ul></td></tr></table>');
 await page.locator('#markdown-preview td').click();
 await rich.locator('strong').evaluate(el=>{
  const r=document.createRange(),s=window.getSelection();
  el.closest('[contenteditable]').focus();
  r.setStart(el.firstChild,0);r.collapse(true);
  s.removeAllRanges();s.addRange(r);
 });
 await page.keyboard.press('Backspace');
 // Count only direct top-level <li> nodes, not the remaining nested item.
 await expect(rich.locator(':scope > ul > li')).toHaveCount(3);
 await expect(rich.locator(':scope > ul > li').nth(1)).toContainText('Inner');
 await expect(rich.locator(':scope > ul > li > ul > li')).toHaveCount(1);
 await page.locator('#table-edit-content-save').click();
 const result=await input.inputValue();
 expect(result).toContain('<strong>Inner</strong>');
 expect(result).toContain('Another');
 expect(result).toContain('Last');
});

test('issue #6 Blocks Russian mobile help and Backspace at first list item',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.goto('/');
 await setAppLanguage(page,'ru');
 const original='<table><tr><td><ol><li><strong>Первый</strong></li><li>Второй</li></ol></td></tr></table>';
 const input=page.locator('#markdown-input');
 await input.fill(original);
 await page.locator('#mobile-tabs button[data-mobile-tab="preview"]').click();
 await page.locator('#markdown-preview td').click();
 await expect(page.locator('#table-edit-content-warning')).toContainText('Shift+Tab');
 await expect(page.locator('#table-edit-bar')).toBeInViewport();
 const rich=page.locator('#table-edit-rich-content');
 await rich.locator('strong').evaluate(el=>{
  const r=document.createRange(),s=window.getSelection();
  el.closest('[contenteditable]').focus();
  r.setStart(el.firstChild,0);r.collapse(true);
  s.removeAllRanges();s.addRange(r);
 });
 await page.keyboard.press('Backspace');
 await expect(rich.locator('p > strong')).toHaveText('Первый');
 await expect(rich.locator('ol > li')).toHaveCount(1);
 await page.locator('#table-edit-content-save').click();
 const modified=await input.inputValue();
 expect(modified).toContain('<p><strong>Первый</strong></p>');
 expect(modified).toContain('<ol><li>Второй</li></ol>');
 await undo(page);
 await expect(input).toHaveValue(original);
});


test('issue #6 multi-item outdent preserves trailing nested list order, formatting and Undo',async({page})=>{
 await page.goto('/');
 const source='Before\n\n<table><tr><td><ol><li>Root<ol type="i">'+
  '<li>One</li><li>Two <em>rich</em></li><li>Three</li><li>Four</li></ol></li>'+
  '<li>End</li></ol></td><td>Neighbor</td></tr></table>\n\nAfter';
 const input=page.locator('#markdown-input');
 await input.fill(source);
 await page.locator('#markdown-preview td').first().click();
 const rich=page.locator('#table-edit-rich-content');
 await rich.locator(':scope > ol > li > ol > li').nth(1).evaluate(el=>{
  const next=el.nextElementSibling;
  const sel=window.getSelection(),range=document.createRange();
  el.closest('[contenteditable]').focus();
  range.setStart(el.firstChild,0);range.setEnd(next.firstChild,4);
  sel.removeAllRanges();sel.addRange(range);
 });
 await page.keyboard.press('Shift+Tab');
 const top=rich.locator(':scope > ol > li');
 await expect(top).toHaveCount(4);
 await expect(top.nth(0).locator(':scope > ol > li')).toHaveText(['One']);
 await expect(top.nth(1)).toContainText('Two rich');
 await expect(top.nth(1).locator('em')).toHaveText('rich');
 await expect(top.nth(2).locator(':scope > ol > li')).toHaveText(['Four']);
 await expect(top.nth(2).locator(':scope > ol')).toHaveAttribute('type','i');
 await expect(top.nth(3)).toHaveText('End');
 await expect(input).toHaveValue(source);
 await page.locator('#table-edit-content-save').click();
 const updated=await input.inputValue();
 expect(updated).toContain('Neighbor');
 expect(updated).toContain('<em>rich</em>');
 expect(updated).toContain('type="i"');
 await expect(page.locator('#markdown-preview td').first()).toContainText('RootOneTwo richThreeFourEnd');
 await undo(page);
 await expect(input).toHaveValue(source);
 await redo(page);
 await expect(page.locator('#markdown-preview td').first()).toContainText('RootOneTwo richThreeFourEnd');
});

test('issue #6 mixed list/paragraph selection safely keeps focus and shows Russian guidance',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.goto('/');
 await setAppLanguage(page,'ru');
 const source='<table><tr><td><p>Начало</p><ul><li>Один</li>'+
  '<li>Два</li></ul><p>Конец</p></td></tr></table>';
 const input=page.locator('#markdown-input');
 await input.fill(source);
 await page.locator('#mobile-tabs button[data-mobile-tab="preview"]').click();
 await page.locator('#markdown-preview td').first().click();
 const rich=page.locator('#table-edit-rich-content');
 const original=await rich.innerHTML();
 await rich.locator('ul > li').first().evaluate(el=>{
  const end=el.closest('[contenteditable]').querySelector('p:last-child').firstChild;
  const sel=window.getSelection(),range=document.createRange();
  el.closest('[contenteditable]').focus();
  range.setStart(el.firstChild,0);range.setEnd(end,3);
  sel.removeAllRanges();sel.addRange(range);
 });
 await page.keyboard.press('Tab');
 await expect(page.locator('#table-edit-message')).toContainText('Выделение между абзацами и списками');
 await expect(rich).toBeFocused();
 await expect(rich).toHaveJSProperty('innerHTML',original);
 await expect(input).toHaveValue(source);
 await expect(page.locator('#table-edit-bar')).toBeInViewport();
});
