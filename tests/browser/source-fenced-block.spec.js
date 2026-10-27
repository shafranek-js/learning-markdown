import {test,expect} from '@playwright/test';
import {setAppLanguage} from './support/settings.js';

const fence='\x60\x60\x60';
const codeBlock=page=>page.locator('.toolbar-btn[data-action="code-block"]');

test('textarea Code Block wraps the selected Markdown without deleting it, in one Undo step',async({page})=>{
 await page.goto('/');
 const input=page.locator('#markdown-input');
 const source='Before\nconst value = 42;\nAfter';
 await input.fill(source);
 await input.evaluate(el=>{
  el.focus();
  const start=el.value.indexOf('const value');
  el.setSelectionRange(start,start+'const value = 42;'.length);
 });
 await codeBlock(page).click();
 const expected='Before\n'+fence+'\nconst value = 42;\n'+fence+'\nAfter';
 await expect(input).toHaveValue(expected);
 expect(await input.evaluate(el=>el.value.slice(el.selectionStart,el.selectionEnd))).toBe('const value = 42;');
 await page.locator('#undo-btn').click();
 await expect(input).toHaveValue(source);
 await page.locator('#redo-btn').click();
 await expect(input).toHaveValue(expected);
});

test('Code Block preserves previous empty-caret code sample in both editor modes',async({page})=>{
 await page.goto('/');
 const input=page.locator('#markdown-input');
 const snippet=fence+'js\nconsole.log("Markdown Studio");\n'+fence+'\n';
 for(const multi of [false,true]){
  await input.fill('Before');
  await input.evaluate(el=>{el.focus();el.setSelectionRange(el.value.length,el.value.length);});
  if(multi){
   await page.locator('#multi-cursor-toggle').click();
   await expect(page.locator('#codemirror-mount .cm-content')).toBeVisible();
  }
  await codeBlock(page).click();
  await expect(input).toHaveValue('Before\n'+snippet);
  await page.locator('#undo-btn').click();
  await expect(input).toHaveValue('Before');
 }
});

test('CodeMirror Code Block wraps every multi-selection atomically and Undo restores original',async({page})=>{
 await page.goto('/');
 const input=page.locator('#markdown-input');
 const source='One\nOne\nOne';
 await input.fill(source);
 await page.locator('#multi-cursor-toggle').click();
 const editor=page.locator('#codemirror-mount .cm-content');
 await expect(editor).toBeVisible();
 await editor.click();
 await page.keyboard.press('Control+Home');
 await page.keyboard.press('Shift+End');
 await page.keyboard.press('Control+Shift+l');
 await expect(page.locator('#multi-cursor-count')).toContainText('3');
 await codeBlock(page).click();
 const expected=Array(3).fill(fence+'\nOne\n'+fence).join('\n');
 await expect(input).toHaveValue(expected);
 await page.locator('#undo-btn').click();
 await expect(input).toHaveValue(source);
 await page.locator('#redo-btn').click();
 await expect(input).toHaveValue(expected);
});

test('Code Block refuses nested fencing atomically in either editor',async({page})=>{
 await page.goto('/');
 const input=page.locator('#markdown-input');
 const source='Safe\n~~~js\nconst x = 1;\n~~~\nMore';
 await input.fill(source);
 await input.evaluate(el=>{el.focus();el.setSelectionRange(0,el.value.length);});
 let dialog=page.waitForEvent('dialog').then(d=>{expect(d.message()).toContain('fenced code block');return d.accept();});
 await codeBlock(page).click();
 await dialog;
 await expect(input).toHaveValue(source);
 await page.locator('#multi-cursor-toggle').click();
 const editor=page.locator('#codemirror-mount .cm-content');
 await expect(editor).toBeVisible();
 await editor.click();
 await page.keyboard.press('Control+a');
 dialog=page.waitForEvent('dialog').then(d=>{expect(d.message()).toContain('fenced code block');return d.accept();});
 await codeBlock(page).click();
 await dialog;
 await expect(input).toHaveValue(source);
});

test('narrow Russian editor keeps selected text when creating a code block',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.goto('/');
 await setAppLanguage(page,'ru');
 const input=page.locator('#markdown-input');
 const source='Пример кода';
 await input.fill(source);
 await input.evaluate(el=>{el.focus();el.setSelectionRange(0,el.value.length);});
 await codeBlock(page).click();
 await expect(input).toHaveValue(fence+'\n'+source+'\n'+fence);
 expect(await input.evaluate(el=>el.value.slice(el.selectionStart,el.selectionEnd))).toBe(source);
});
