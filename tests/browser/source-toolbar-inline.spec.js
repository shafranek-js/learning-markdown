import {undo,redo} from './support/history-actions.js';
import {test,expect} from '@playwright/test';
import {setAppLanguage} from './support/settings.js';

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
  await undo(page);
  await expect(input).toHaveValue(marked);
  await redo(page);
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
 await page.locator('.toolbar-btn[data-action="bold"]').click();
 await expect(input).toHaveValue('Before Alpha After');
 await undo(page);
 await expect(input).toHaveValue('Before **Alpha** After');
 await redo(page);
 await expect(input).toHaveValue('Before Alpha After');
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
 await undo(page);
 await expect(input).toHaveValue(source);
 await redo(page);
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
 await setAppLanguage(page,'ru');
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


test('textarea toggles alternative strong/italic delimiters without nested markers',async({page})=>{
 await page.goto('/');
 const input=page.locator('#markdown-input');
 for(const [action,original,expected] of [
  ['bold','__Strong__','Strong'],
  ['italic','*Emphasis*','Emphasis']
 ]){
  await input.fill(original);
  await input.evaluate(el=>{el.focus();el.setSelectionRange(0,el.value.length);});
  await page.locator('.toolbar-btn[data-action="'+action+'"]').click();
  await expect(input).toHaveValue(expected);
  await undo(page);
  await expect(input).toHaveValue(original);
 }
});

test('italic toolbar preserves strong underscores and formats inside identifiers',async({page})=>{
 await page.goto('/');
 const input=page.locator('#markdown-input');
 await input.fill('__Strong__');
 await input.evaluate(el=>{el.focus();el.setSelectionRange(2,8);});
 await page.locator('.toolbar-btn[data-action="italic"]').click();
 await expect(input).toHaveValue('__*Strong*__');
 await page.locator('.toolbar-btn[data-action="italic"]').click();
 await expect(input).toHaveValue('__Strong__');
 await input.fill('some_file_name');
 await input.evaluate(el=>{
  el.focus();
  const start=el.value.indexOf('file');
  el.setSelectionRange(start,start+4);
 });
 await page.locator('.toolbar-btn[data-action="italic"]').click();
 await expect(input).toHaveValue('some_*file*_name');
 await page.locator('.toolbar-btn[data-action="italic"]').click();
 await expect(input).toHaveValue('some_file_name');
});

test('CodeMirror bold recognizes alternate double-underscore markers at several cursors',async({page})=>{
 await page.goto('/');
 const input=page.locator('#markdown-input');
 const original='__Alpha__\n__Alpha__\n__Alpha__';
 await input.fill(original);
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
 await undo(page);
 await expect(input).toHaveValue(original);
 await redo(page);
 await expect(input).toHaveValue('Alpha\nAlpha\nAlpha');
});
