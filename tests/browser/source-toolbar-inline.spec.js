import {test,expect} from '@playwright/test';

test('textarea Bold/Italic/Strikethrough toggle existing source markers with Undo/Redo',async({page})=>{
 await page.goto('/');
 const input=page.locator('#markdown-input');
 for(const [action,marked,plain] of [
  ['bold','**Alpha**','Alpha'],
  ['italic','_Bravo_','Bravo'],
  ['strike','~~Charlie~~','Charlie']
 ]){
  await input.fill(marked);
  await input.evaluate(el=>{el.focus();el.setSelectionRange(0,el.value.length);});
  await page.locator('.toolbar-btn[data-action="'+action+'"]').click();
  await expect(input).toHaveValue(plain);
  await page.locator('#undo-btn').click();
  await expect(input).toHaveValue(marked);
  await page.locator('#redo-btn').click();
  await expect(input).toHaveValue(plain);
 }
});

test('textarea wraps new bold selection once and selects its original text',async({page})=>{
 await page.goto('/');
 const input=page.locator('#markdown-input');
 await input.fill('Before Alpha After');
 await input.evaluate(el=>{
  el.focus();
  el.setSelectionRange(el.value.indexOf('Alpha'),el.value.indexOf('Alpha')+5);
 });
 await page.locator('.toolbar-btn[data-action="bold"]').click();
 await expect(input).toHaveValue('Before **Alpha** After');
 expect(await input.evaluate(el=>el.value.slice(el.selectionStart,el.selectionEnd))).toBe('Alpha');
});

test('CodeMirror native multi-range Bold toggle is one Undo step',async({page})=>{
 await page.goto('/');
 const input=page.locator('#markdown-input');
 const source='**Alpha**\n**Alpha**\n**Alpha**';
 await input.fill(source);
 await page.locator('#multi-cursor-toggle').click();
 const editor=page.locator('#codemirror-mount .cm-content');
 await expect(editor).toBeVisible();
 await editor.click();
 await page.keyboard.press('Control+Home');
 await page.keyboard.press('Shift+End');
 await page.keyboard.press('Control+Shift+l');
 await expect(page.locator('#multi-cursor-count')).toContainText('3');
 await page.locator('.toolbar-btn[data-action="bold"]').click();
 await expect(input).toHaveValue('Alpha\nAlpha\nAlpha');
 await page.locator('#undo-btn').click();
 await expect(input).toHaveValue(source);
 await page.locator('#redo-btn').click();
 await expect(input).toHaveValue('Alpha\nAlpha\nAlpha');
});

test('fenced code rejects all inline changes atomically in textarea and CodeMirror',async({page})=>{
 await page.goto('/');
 const input=page.locator('#markdown-input');
 const source='Alpha\n~~~js\nconsole.log(1);\n~~~\nBravo';
 await input.fill(source);
 await input.evaluate(el=>{el.focus();el.setSelectionRange(0,el.value.length);});
 let done=page.waitForEvent('dialog').then(dialog=>{
  expect(dialog.message()).toContain('fenced code block');
  return dialog.accept();
 });
 await page.locator('.toolbar-btn[data-action="italic"]').click();
 await done;
 await expect(input).toHaveValue(source);
 await page.locator('#multi-cursor-toggle').click();
 const editor=page.locator('#codemirror-mount .cm-content');
 await editor.click();
 await page.keyboard.press('Control+a');
 done=page.waitForEvent('dialog').then(dialog=>{
  expect(dialog.message()).toContain('fenced code block');
  return dialog.accept();
 });
 await page.locator('.toolbar-btn[data-action="bold"]').click();
 await done;
 await expect(input).toHaveValue(source);
});

test('Russian mobile editor keeps source unchanged when inline formatting touches code',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.goto('/');
 await page.locator('#lang-selector').selectOption('ru');
 const input=page.locator('#markdown-input');
 const source='Текст\n~~~\nкод\n~~~';
 await input.fill(source);
 await input.evaluate(el=>{el.focus();el.setSelectionRange(0,el.value.length);});
 const handled=page.waitForEvent('dialog').then(dialog=>{
  expect(dialog.message()).toContain('Форматирование не применено');
  return dialog.accept();
 });
 await page.locator('.toolbar-btn[data-action="bold"]').click();
 await handled;
 await expect(input).toHaveValue(source);
});
