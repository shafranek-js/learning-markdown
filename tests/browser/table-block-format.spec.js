import {test,expect} from '@playwright/test';
import {setAppLanguage} from './support/settings.js';

test('issue #6 multi-block Bold preserves paragraphs, lists, rich markup, source and Undo',async({page})=>{
 await page.goto('/');
 const source='Before\n\n<table class="af-table-outline"><tr><td>'+
  '<p>Intro <em>soft</em> closing</p><ul><li>First</li><li>Second</li></ul>'+
  '<blockquote><p>Quoted</p></blockquote></td><td>Neighbor</td></tr></table>\n\nAfter';
 const input=page.locator('#markdown-input');
 await input.fill(source);
 await page.locator('#markdown-preview td').first().click();
 const rich=page.locator('#table-edit-rich-content');
 await expect(page.locator('#table-edit-block-choice')).toHaveAttribute('aria-pressed','true');
 await rich.locator(':scope > p').evaluate((p)=>{
  const end=p.parentElement.querySelectorAll('ul > li')[1].firstChild;
  const range=document.createRange(),selection=window.getSelection();
  p.closest('[contenteditable]').focus();
  range.setStart(p.firstChild,2);range.setEnd(end,3);
  selection.removeAllRanges();selection.addRange(range);
 });
 await page.locator('#table-edit-rich-bold').click();
 await expect(rich.locator(':scope > p > strong').first()).toHaveText('tro ');
 await expect(rich.locator(':scope > p > em > strong')).toHaveText('soft');
 await expect(rich.locator(':scope > ul > li > strong')).toHaveCount(2);
 await expect(rich.locator(':scope > ul > li').last()).toHaveText('Second');
 await expect(rich.locator(':scope > blockquote > p')).toHaveText('Quoted');
 await expect(rich.locator(':scope > strong')).toHaveCount(0);
 await expect(rich.locator(':scope > ul > strong')).toHaveCount(0);
 await expect(input).toHaveValue(source);
 await page.locator('#table-edit-content-save').click();
 const modified=await input.inputValue();
 for(const token of ['<p>','<ul>','<li>','<blockquote>','<em><strong>soft</strong></em>','Neighbor','Before','After'])
  expect(modified).toContain(token);
 await expect(page.locator('#markdown-preview td').first()).toContainText('Intro soft closingFirstSecondQuoted');
 await page.locator('#undo-btn').click();
 await expect(input).toHaveValue(source);
 await page.locator('#redo-btn').click();
 await expect(page.locator('#markdown-preview td').first().locator('ul > li > strong')).toHaveCount(2);
});

test('issue #6 code crossing selection refuses all formatting without partial changes',async({page})=>{
 await page.goto('/');
 const source='<table><tr><td><p>Before</p><pre><code>let x = 1;</code></pre>'+
  '<p>After</p></td><td>Neighbor</td></tr></table>';
 const input=page.locator('#markdown-input');
 await input.fill(source);
 await page.locator('#markdown-preview td').first().click();
 const rich=page.locator('#table-edit-rich-content');
 const original=await rich.innerHTML();
 await rich.locator(':scope > p').first().evaluate(p=>{
  const end=p.parentElement.querySelector('p:last-child').firstChild;
  const selection=window.getSelection(),range=document.createRange();
  p.closest('[contenteditable]').focus();
  range.setStart(p.firstChild,0);range.setEnd(end,3);
  selection.removeAllRanges();selection.addRange(range);
 });
 await page.locator('#table-edit-rich-italic').click();
 await expect(page.locator('#table-edit-message')).toContainText('Nothing was changed');
 expect(await rich.innerHTML()).toBe(original);
 await expect(input).toHaveValue(source);
 await expect(rich.locator('pre code')).toHaveText('let x = 1;');
});

test('issue #6 mobile Russian mixed-block Underline preserves list geometry',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.goto('/');
 await setAppLanguage(page,'ru');
 const source='<table><tr><td><p>Первый текст</p><ol><li>Один</li>'+
  '<li><em>Второй</em></li></ol></td></tr></table>';
 const input=page.locator('#markdown-input');
 await input.fill(source);
 await page.locator('#mobile-tabs button[data-mobile-tab="preview"]').click();
 await page.locator('#markdown-preview td').click();
 const rich=page.locator('#table-edit-rich-content');
 await rich.locator(':scope > p').evaluate(p=>{
  const end=p.parentElement.querySelector('em').firstChild;
  const range=document.createRange(),selection=window.getSelection();
  p.closest('[contenteditable]').focus();
  range.setStart(p.firstChild,0);range.setEnd(end,end.length);
  selection.removeAllRanges();selection.addRange(range);
 });
 await page.locator('#table-edit-rich-underline').click();
 await expect(rich.locator(':scope > p > u')).toHaveText('Первый текст');
 await expect(rich.locator(':scope > ol > li')).toHaveCount(2);
 await expect(rich.locator(':scope > ol > li > em > u')).toHaveText('Второй');
 await expect(input).toHaveValue(source);
 await page.locator('#table-edit-content-save').click();
 const modified=await input.inputValue();
 expect(modified).toContain('<ol>');
 expect(modified).toContain('<em><u>Второй</u></em>');
 await page.locator('#undo-btn').click();
 await expect(input).toHaveValue(source);
});
