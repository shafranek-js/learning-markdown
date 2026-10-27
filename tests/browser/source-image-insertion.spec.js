import {test,expect} from '@playwright/test';

const url='https://placehold.co/600x160/png';
const imageButton=page=>page.locator('.toolbar-btn[data-action="image"]');

test('textarea Image turns single-line selection into alt text and Undo restores source',async({page})=>{
 await page.goto('/');
 const input=page.locator('#markdown-input');
 const source='Before selected image After';
 await input.fill(source);
 await input.evaluate(el=>{
  const start=el.value.indexOf('selected image');
  el.focus();el.setSelectionRange(start,start+'selected image'.length);
 });
 await imageButton(page).click();
 const expected='Before ![selected image]('+url+') After';
 await expect(input).toHaveValue(expected);
 expect(await input.evaluate(el=>el.value.slice(el.selectionStart,el.selectionEnd))).toBe('selected image');
 await page.locator('#undo-btn').click();
 await expect(input).toHaveValue(source);
 await page.locator('#redo-btn').click();
 await expect(input).toHaveValue(expected);
});

test('Image with empty caret retains the previous placeholder template in both editors',async({page})=>{
 await page.goto('/');
 const input=page.locator('#markdown-input');
 const expected='Before\n![Image]('+url+')\n';
 for(const multi of [false,true]){
  await page.goto('/');
  await input.fill('Before');
  await input.evaluate(el=>{
   el.focus();el.setSelectionRange(el.value.length,el.value.length);
  });
  if(multi){
   await page.locator('#multi-cursor-toggle').click();
   await expect(page.locator('#codemirror-mount .cm-content')).toBeVisible();
  }
  await imageButton(page).click();
  await expect(input).toHaveValue(expected);
  await page.locator('#undo-btn').click();
  await expect(input).toHaveValue('Before');
 }
});

test('CodeMirror Image converts all selected occurrences in one undoable transaction',async({page})=>{
 await page.goto('/');
 const input=page.locator('#markdown-input');
 const source='Photo\nPhoto\nPhoto';
 await input.fill(source);
 await page.locator('#multi-cursor-toggle').click();
 const editor=page.locator('#codemirror-mount .cm-content');
 await expect(editor).toBeVisible();
 await editor.click();
 await page.keyboard.press('Control+Home');
 await page.keyboard.press('Shift+End');
 await page.keyboard.press('Control+Shift+l');
 await expect(page.locator('#multi-cursor-count')).toContainText('3');
 await imageButton(page).click();
 const expected=Array(3).fill('![Photo]('+url+')').join('\n');
 await expect(input).toHaveValue(expected);
 await page.locator('#undo-btn').click();
 await expect(input).toHaveValue(source);
 await page.locator('#redo-btn').click();
 await expect(input).toHaveValue(expected);
});

test('mixed multi-line and code-fenced selections reject entire Image operation',async({page})=>{
 await page.goto('/');
 const input=page.locator('#markdown-input');
 const source='Safe\n~~~js\nconst code=1;\n~~~\nMore';
 await input.fill(source);
 await input.evaluate(el=>{el.focus();el.setSelectionRange(0,el.value.length);});
 let notice=page.waitForEvent('dialog').then(d=>{
  expect(d.message()).toContain('fenced code block');return d.accept();
 });
 await imageButton(page).click();
 await notice;
 await expect(input).toHaveValue(source);
 await input.fill('First\nSecond');
 await input.evaluate(el=>{el.focus();el.setSelectionRange(0,el.value.length);});
 notice=page.waitForEvent('dialog').then(d=>{
  expect(d.message()).toContain('single line');return d.accept();
 });
 await imageButton(page).click();
 await notice;
 await expect(input).toHaveValue('First\nSecond');

 await page.locator('#multi-cursor-toggle').click();
 const editor=page.locator('#codemirror-mount .cm-content');
 await expect(editor).toBeVisible();
 await editor.click();
 await page.keyboard.press('Control+a');
 notice=page.waitForEvent('dialog').then(d=>{
  expect(d.message()).toContain('single line');return d.accept();
 });
 await imageButton(page).click();
 await notice;
 await expect(input).toHaveValue('First\nSecond');
});

test('Russian narrow view preserves alt text and gives localized multiline feedback',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.goto('/');
 await page.locator('#lang-selector').selectOption('ru');
 const input=page.locator('#markdown-input');
 await input.fill('Описание изображения');
 await input.evaluate(el=>{el.focus();el.setSelectionRange(0,el.value.length);});
 await imageButton(page).click();
 await expect(input).toHaveValue('![Описание изображения]('+url+')');
 await input.fill('Первая\nВторая');
 await input.evaluate(el=>{el.focus();el.setSelectionRange(0,el.value.length);});
 const notice=page.waitForEvent('dialog').then(d=>{
  expect(d.message()).toContain('одной строке');return d.accept();
 });
 await imageButton(page).click();
 await notice;
 await expect(input).toHaveValue('Первая\nВторая');
});
