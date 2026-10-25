import {test,expect} from '@playwright/test';

test('issue #6 converts selected paragraphs and complete lists to numbered list without losing source',async({page})=>{
 await page.goto('/');
 const source='Before\n\n<table><tr><td>'+
  '<p>Alpha <strong>bold</strong></p><ul><li>Beta <em>italic</em></li><li>Gamma</li></ul>'+
  '<p>Delta</p></td><td>Neighbor</td></tr></table>\n\nAfter';
 const input=page.locator('#markdown-input');
 await input.fill(source);
 await page.locator('#markdown-preview td').first().click();
 const rich=page.locator('#table-edit-rich-content');
 await expect(page.locator('#table-edit-block-choice')).toHaveAttribute('aria-pressed','true');
 await rich.locator(':scope > p').first().evaluate(p=>{
  const end=p.parentElement.querySelector(':scope > p:last-child').firstChild;
  const selection=window.getSelection(),range=document.createRange();
  p.closest('[contenteditable]').focus();
  range.setStart(p.firstChild,2);range.setEnd(end,3);
  selection.removeAllRanges();selection.addRange(range);
 });
 await page.locator('#table-edit-convert-ol').click();
 await expect(rich.locator(':scope > ol')).toHaveCount(1);
 await expect(rich.locator(':scope > ol > li')).toHaveCount(4);
 await expect(rich.locator(':scope > ol > li strong')).toHaveText('bold');
 await expect(rich.locator(':scope > ol > li em')).toHaveText('italic');
 await expect(rich.locator(':scope > p')).toHaveCount(0);
 await expect(input).toHaveValue(source);
 await page.locator('#table-edit-content-save').click();
 const updated=await input.inputValue();
 expect(updated).toContain('<ol>');
 expect(updated).toContain('Neighbor');
 expect(updated).toContain('Before');
 expect(updated).toContain('After');
 await expect(page.locator('#markdown-preview td').first().locator('ol > li')).toHaveCount(4);
 await page.locator('#undo-btn').click();
 await expect(input).toHaveValue(source);
 await page.locator('#redo-btn').click();
 await expect(page.locator('#markdown-preview td').first().locator('ol > li')).toHaveCount(4);
});

test('issue #6 convert complete ordered list into paragraphs preserves inline formatting',async({page})=>{
 await page.goto('/');
 const source='<table><tr><td><p>Before</p><ol type="i"><li>One</li>'+
  '<li><strong>Two</strong></li></ol><p>After</p></td></tr></table>';
 const input=page.locator('#markdown-input');
 await input.fill(source);
 await page.locator('#markdown-preview td').click();
 const rich=page.locator('#table-edit-rich-content');
 await rich.locator(':scope > ol > li').first().evaluate(li=>{
  const last=li.parentElement.lastElementChild.querySelector('strong').firstChild;
  const selection=window.getSelection(),range=document.createRange();
  li.closest('[contenteditable]').focus();
  range.setStart(li.firstChild,0);range.setEnd(last,last.length);
  selection.removeAllRanges();selection.addRange(range);
 });
 await page.locator('#table-edit-convert-p').click();
 await expect(rich.locator(':scope > ol')).toHaveCount(0);
 await expect(rich.locator(':scope > p')).toHaveCount(4);
 await expect(rich.locator(':scope > p > strong')).toHaveText('Two');
 await page.locator('#table-edit-content-save').click();
 const modified=await input.inputValue();
 expect(modified).toContain('<p><strong>Two</strong></p>');
 expect(modified).not.toContain('<ol');
 await page.locator('#undo-btn').click();
 await expect(input).toHaveValue(source);
});

test('issue #6 Russian mobile refuses partially selected list conversion without changing draft',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.goto('/');
 await page.locator('#lang-selector').selectOption('ru');
 const source='<table><tr><td><p>Сначала</p><ul><li>Один</li>'+
  '<li>Два</li></ul><p>Потом</p></td></tr></table>';
 const input=page.locator('#markdown-input');
 await input.fill(source);
 await page.locator('#mobile-tabs button[data-mobile-tab="preview"]').click();
 await page.locator('#markdown-preview td').click();
 const rich=page.locator('#table-edit-rich-content');
 const before=await rich.innerHTML();
 await rich.locator(':scope > ul > li').first().evaluate(li=>{
  const selection=window.getSelection(),range=document.createRange();
  li.closest('[contenteditable]').focus();
  range.setStart(li.firstChild,0);range.setEnd(li.firstChild,li.firstChild.length);
  selection.removeAllRanges();selection.addRange(range);
 });
 await expect(page.locator('#table-edit-convert-p')).toHaveText('В абзацы');
 await page.locator('#table-edit-convert-p').click();
 await expect(page.locator('#table-edit-message')).toContainText('Выделите целые пункты списка');
 expect(await rich.innerHTML()).toBe(before);
 await expect(input).toHaveValue(source);
 await expect(page.locator('#table-edit-bar')).toBeInViewport();
});


test('issue #6 convert-selection controls have labels in all five locales',async({page})=>{
 await page.goto('/');
 await page.locator('#markdown-input').fill('<table><tr><td><p>Example</p></td></tr></table>');
 const words={
  en:['Paragraphs','Bullets','Numbered'],
  cs:['Odstavce','Odrážky','Číslování'],
  uk:['Абзаци','Маркери','Нумерація'],
  ro:['Paragrafe','Marcatori','Numerotare'],
  ru:['В абзацы','В маркеры','В нумерацию']
 };
 for(const [language,expected] of Object.entries(words)){
  await page.locator('#lang-selector').selectOption(language);
  // Language changes reset the lesson sample; re-load the controlled fixture.
  await page.locator('#markdown-input').fill('<table><tr><td><p>Example</p></td></tr></table>');
  await page.locator('#markdown-preview td').first().click();
  for(const [index,kind] of ['p','ul','ol'].entries()){
   const button=page.locator('#table-edit-convert-'+kind);
   await expect(button).toHaveText(expected[index]);
   await expect(button).toHaveAttribute('aria-label',expected[index]);
  }
 }
});


test('issue #6 nested list conversion changes only selected depth and keeps outer roman numbering',async({page})=>{
 await page.goto('/');
 const source='Before\n\n<table><tr><td><ol type="i"><li>Parent<ul>'+
  '<li>Inner one</li><li><em>Inner two</em><ul><li>Deep</li></ul></li>'+
  '</ul>Tail</li><li>Outer two</li></ol></td><td>Neighbor</td></tr></table>\n\nAfter';
 const input=page.locator('#markdown-input');
 await input.fill(source);
 await page.locator('#markdown-preview td').first().click();
 const rich=page.locator('#table-edit-rich-content');
 await expect(page.locator('#table-edit-block-choice')).toHaveAttribute('aria-pressed','true');
 await rich.locator(':scope > ol > li > ul > li em').evaluate(el=>{
  const text=el.firstChild,range=document.createRange(),selection=window.getSelection();
  el.closest('[contenteditable]').focus();
  range.setStart(text,2);range.collapse(true);
  selection.removeAllRanges();selection.addRange(range);
 });
 await page.locator('#table-edit-convert-ol').click();
 await expect(rich.locator(':scope > ol[type="i"]')).toHaveCount(1);
 await expect(rich.locator(':scope > ol > li > ul')).toHaveCount(0);
 await expect(rich.locator(':scope > ol > li > ol > li')).toHaveCount(2);
 await expect(rich.locator(':scope > ol > li > ol > li em')).toHaveText('Inner two');
 await expect(rich.locator(':scope > ol > li > ol > li ul > li')).toHaveText('Deep');
 await expect(rich.locator(':scope > ol > li').last()).toHaveText('Outer two');
 await expect(input).toHaveValue(source);
 await page.locator('#table-edit-content-save').click();
 const updated=await input.inputValue();
 expect(updated).toContain('type="i"');
 expect(updated).toContain('<em>Inner two</em>');
 expect(updated).toContain('Neighbor');
 expect(updated).toContain('Before');
 expect(updated).toContain('After');
 await expect(page.locator('#markdown-preview td').first().locator('ol > li > ol > li')).toHaveCount(2);
 await page.locator('#undo-btn').click();
 await expect(input).toHaveValue(source);
 await page.locator('#redo-btn').click();
 await expect(page.locator('#markdown-preview td').first().locator('ol > li > ol > li')).toHaveCount(2);
});

test('issue #6 Russian mobile prevents partial nested conversions and explains paragraph limitation',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.goto('/');
 await page.locator('#lang-selector').selectOption('ru');
 const source='<table><tr><td><ol type="i"><li>Родитель<ul>'+
  '<li>Первый</li><li>Второй</li><li>Третий</li></ul></li>'+
  '<li>Сосед</li></ol></td></tr></table>';
 const input=page.locator('#markdown-input');
 await input.fill(source);
 await page.locator('#mobile-tabs button[data-mobile-tab="preview"]').click();
 await page.locator('#markdown-preview td').first().click();
 const rich=page.locator('#table-edit-rich-content');
 const before=await rich.innerHTML();
 await rich.locator(':scope > ol > li > ul > li').first().evaluate(li=>{
  const range=document.createRange(),selection=window.getSelection();
  li.closest('[contenteditable]').focus();
  range.setStart(li.firstChild,0);
  range.setEnd(li.nextElementSibling.firstChild,li.nextElementSibling.firstChild.length);
  selection.removeAllRanges();selection.addRange(range);
 });
 await page.locator('#table-edit-convert-ol').click();
 await expect(page.locator('#table-edit-message')).toContainText('Выделите целые пункты');
 expect(await rich.innerHTML()).toBe(before);
 await expect(input).toHaveValue(source);
 await rich.locator(':scope > ol > li > ul > li').first().evaluate(li=>{
  const range=document.createRange(),selection=window.getSelection();
  li.closest('[contenteditable]').focus();
  range.setStart(li.firstChild,1);range.collapse(true);
  selection.removeAllRanges();selection.addRange(range);
 });
 await page.locator('#table-edit-convert-p').click();
 await expect(page.locator('#table-edit-message')).toContainText('Вложенные списки можно переключать');
 expect(await rich.innerHTML()).toBe(before);
 await expect(page.locator('#table-edit-bar')).toBeInViewport();
 await page.locator('#table-edit-convert-ol').click();
 await expect(rich.locator(':scope > ol > li > ol > li')).toHaveCount(3);
 await expect(rich.locator(':scope > ol[type="i"]')).toHaveCount(1);
 await expect(input).toHaveValue(source);
});
