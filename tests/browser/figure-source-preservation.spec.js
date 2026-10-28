import {undo,redo} from './support/history-actions.js';
import {test,expect} from '@playwright/test';

async function revealFigureDialog(page){
 const toggle=page.locator('#advanced-tools-toggle');
 if(await toggle.getAttribute('aria-expanded')!=='true')await toggle.click();
 await page.locator('#figure-dialog-trigger').click();
 await expect(page.locator('#figure-dialog')).toBeVisible();
 await page.locator('#figure-url').fill('https://example.org/diagram.png');
 await page.locator('#figure-alt').fill('Diagram');
}
async function selectSource(input,needle){
 await input.evaluate((el,value)=>{
  const start=el.value.indexOf(value);
  if(start<0)throw new Error('Selection not found');
  el.focus();el.setSelectionRange(start,start+value.length);
 },needle);
}

test('figure modal preserves a partially selected Markdown link and supports one Undo',async({page})=>{
 await page.goto('/');
 const input=page.locator('#markdown-input');
 const source='Before [important](https://example.org) after';
 await input.fill(source);
 await selectSource(input,'important');
 await revealFigureDialog(page);
 await page.locator('#figure-caption').fill('Source-safe example');
 await page.locator('#figure-insert').click();
 await expect(page.locator('#figure-dialog')).toBeHidden();
 const result=await input.inputValue();
 expect(result).toContain(source+'\n\n<figure');
 expect(result).toContain('<figcaption>Source-safe example</figcaption>');
 await expect(page.locator('#markdown-preview a[href="https://example.org"]')).toHaveText('important');
 await undo(page);
 await expect(input).toHaveValue(source);
 await redo(page);
 await expect(input).toHaveValue(result);
});

test('portable figure modal insertion preserves selected source and existing Markdown',async({page})=>{
 await page.goto('/');
 const input=page.locator('#markdown-input');
 const source='Before *selected* source After';
 await input.fill(source);await selectSource(input,'selected');
 await revealFigureDialog(page);
 await page.locator('#figure-markdown').click();
 const result=await input.inputValue();
 expect(result).toContain(source+'\n\n![Diagram](https://example.org/diagram.png)');
 await expect(page.locator('#markdown-preview em')).toHaveText('selected');
 await undo(page);
 await expect(input).toHaveValue(source);
});

test('multi-cursor figure modal inserts after every selected line atomically',async({page})=>{
 await page.goto('/');
 const input=page.locator('#markdown-input'),source='Alpha\nAlpha';
 await input.fill(source);
 await page.locator('#multi-cursor-toggle').click();
 const cm=page.locator('#codemirror-mount .cm-content');
 await expect(cm).toBeVisible();await cm.click();
 await page.keyboard.press('Control+Home');
 await page.keyboard.press('Shift+End');
 await page.keyboard.press('Control+Shift+l');
 await expect(page.locator('#multi-cursor-count')).toContainText('2');
 await revealFigureDialog(page);
 await page.locator('#figure-insert').click();
 const result=await input.inputValue();
 expect((result.match(/Alpha/g)||[]).length).toBe(2);
 expect((result.match(/<figure\b/g)||[]).length).toBe(2);
 await undo(page);
 await expect(input).toHaveValue(source);
 await redo(page);
 await expect(input).toHaveValue(result);
});

test('figure modal protects fenced source and retains Russian mobile editing',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.goto('/');
 await page.locator('#lang-selector').selectOption('ru');
 const input=page.locator('#markdown-input');
 const source='Вступление\n~~~md\n# literal\n~~~\nКонец';
 await input.fill(source);await selectSource(input,'literal');
 await revealFigureDialog(page);
 const dialog=page.waitForEvent('dialog').then(async d=>{
  expect(d.message()).toContain('Выделение содержит блок кода');
  await d.accept();
 });
 await page.locator('#figure-markdown').click();
 await dialog;
 await expect(input).toHaveValue(source);
 await input.fill('Начало **выделение** конец');
 await selectSource(input,'выделение');
 await revealFigureDialog(page);
 await page.locator('#figure-markdown').click();
 const changed=await input.inputValue();
 expect(changed).toContain('Начало **выделение** конец\n\n![Diagram]');
 await undo(page);
 await expect(input).toHaveValue('Начало **выделение** конец');
});
