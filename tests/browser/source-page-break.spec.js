import {undo,redo} from './support/history-actions.js';
import {test,expect} from '@playwright/test';
import {setAppLanguage} from './support/settings.js';

async function reveal(page){
 const toggle=page.locator('#advanced-tools-toggle');
 if(await toggle.getAttribute('aria-expanded')!=='true')await toggle.click();
 await expect(page.locator('#advanced-page-break')).toBeVisible();
}
async function select(input,substring){
 await input.evaluate((el,needle)=>{
  const at=el.value.indexOf(needle);
  if(at<0)throw new Error('Missing selected source: '+needle);
  el.focus();el.setSelectionRange(at,at+needle.length);
 },substring);
}

test('Page break inserts after textarea selection and Undo restores source',async({page})=>{
 await page.goto('/');
 const input=page.locator('#markdown-input');
 const source='Before Alpha After';
 await input.fill(source);await select(input,'Alpha');
 await reveal(page);
 await page.locator('#advanced-page-break').click();
 const expected='Before Alpha\n\n<div class="af-page-break"></div>\n\n After';
 await expect(input).toHaveValue(expected);
 await undo(page);
 await expect(input).toHaveValue(source);
 await redo(page);
 await expect(input).toHaveValue(expected);
});

test('Page break empty caret retains original example in both source engines',async({page})=>{
 await page.addInitScript(()=>localStorage.clear());
 const input=page.locator('#markdown-input');
 for(const multi of [false,true]){
  await page.goto('/');
  await input.fill('Prefix');
  await input.evaluate(el=>{el.focus();el.setSelectionRange(6,6);});
  if(multi){
   await page.locator('#multi-cursor-toggle').click();
   await expect(page.locator('#codemirror-mount .cm-content')).toBeVisible();
  }
  await reveal(page);
  await page.locator('#advanced-page-break').click();
  await expect(input).toHaveValue('Prefix\n\n<div class="af-page-break"></div>\n');
  await undo(page);
  await expect(input).toHaveValue('Prefix');
 }
});

test('Page break preserves all CodeMirror selections as one undoable operation',async({page})=>{
 await page.goto('/');
 const input=page.locator('#markdown-input');
 const source='Alpha\nAlpha\nAlpha';
 await input.fill(source);
 await page.locator('#multi-cursor-toggle').click();
 const editor=page.locator('#codemirror-mount .cm-content');
 await expect(editor).toBeVisible();
 await editor.click();
 await page.keyboard.press('Control+Home');
 await page.keyboard.press('Shift+End');
 await page.keyboard.press('Control+Shift+l');
 await expect(page.locator('#multi-cursor-count')).toContainText('3');
 await reveal(page);
 await page.locator('#advanced-page-break').click();
 const changed=await input.inputValue();
 expect((changed.match(/Alpha/g)||[]).length).toBe(3);
 expect((changed.match(/af-page-break/g)||[]).length).toBe(3);
 await undo(page);
 await expect(input).toHaveValue(source);
 await redo(page);
 await expect(input).toHaveValue(changed);
});

test('Page break refuses fenced-code edits in either mode without data loss',async({page})=>{
 await page.goto('/');
 const input=page.locator('#markdown-input');
 const source='Safe\n~~~js\nconst x=1;\n~~~\nMore';
 await input.fill(source);
 await input.evaluate(el=>{el.focus();el.setSelectionRange(0,el.value.length);});
 await reveal(page);
 let dialog=page.waitForEvent('dialog').then(d=>{
  expect(d.message()).toContain('fenced code block');return d.accept();
 });
 await page.locator('#advanced-page-break').click();
 await dialog;
 await expect(input).toHaveValue(source);
 await page.locator('#multi-cursor-toggle').click();
 const editor=page.locator('#codemirror-mount .cm-content');
 await expect(editor).toBeVisible();
 await editor.click();
 await page.keyboard.press('Control+a');
 dialog=page.waitForEvent('dialog').then(d=>{
  expect(d.message()).toContain('fenced code block');return d.accept();
 });
 await page.locator('#advanced-page-break').click();
 await dialog;
 await expect(input).toHaveValue(source);
});

test('Russian narrow view keeps selected prose when inserting Page break',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.goto('/');
 await setAppLanguage(page,'ru');
 const input=page.locator('#markdown-input');
 await input.fill('Начало\nСодержимое\nКонец');
 await select(input,'Содержимое');
 await reveal(page);
 await page.locator('#advanced-page-break').click();
 await expect(input).toHaveValue('Начало\nСодержимое\n\n<div class="af-page-break"></div>\n\n\nКонец');
 await undo(page);
 await expect(input).toHaveValue('Начало\nСодержимое\nКонец');
});
