import {test,expect} from '@playwright/test';
import {undo,redo} from './support/history-actions.js';

async function enableAdvanced(page){
 const toggle=page.locator('#advanced-tools-toggle');
 if(await page.locator('#advanced-rich-toolbar').isHidden())await toggle.click();
 await expect(page.locator('#advanced-rich-toolbar')).toBeVisible();
}
async function selectText(input,term){
 await input.evaluate((el,word)=>{
  const start=el.value.indexOf(word);
  if(start<0)throw new Error('Selection not found');
  el.focus();el.setSelectionRange(start,start+word.length);
 },term);
}
test('static rich table preserves a selected Markdown link and inserts after its line',async({page})=>{
 await page.goto('/');
 await enableAdvanced(page);
 const input=page.locator('#markdown-input');
 const original='Before [important](https://example.org) after\nNext paragraph';
 await input.fill(original);
 await selectText(input,'important');
 await page.locator('#rich-tables').selectOption('colspan');
 await page.locator('[data-rich-apply="tables"]').click();
 const updated=await input.inputValue();
 expect(updated).toContain('Before [important](https://example.org) after\n\n<table');
 expect(updated).toContain('Next paragraph');
 await expect(page.locator('#markdown-preview th[colspan="2"]')).toHaveText('Merged heading');
 await undo(page);
 await expect(input).toHaveValue(original);
 await redo(page);
 await expect(input).toHaveValue(updated);
});
test('static rich details preserves selected emphasis without replacing it',async({page})=>{
 await page.goto('/');
 await enableAdvanced(page);
 const input=page.locator('#markdown-input');
 const original='Start **important** end\nTail';
 await input.fill(original);
 await selectText(input,'important');
 await page.locator('#rich-blocks').selectOption('details');
 await page.locator('[data-rich-apply="blocks"]').click();
 const updated=await input.inputValue();
 expect(updated).toContain('Start **important** end\n\n<details>');
 expect(updated).toContain('Tail');
 await undo(page);
 await expect(input).toHaveValue(original);
});
test('static rich templates preserve all CodeMirror selections as one Undo step',async({page})=>{
 await page.goto('/');
 await enableAdvanced(page);
 const input=page.locator('#markdown-input'),original='Alpha\nAlpha\nAlpha';
 await input.fill(original);
 await page.locator('#multi-cursor-toggle').click();
 const cm=page.locator('#codemirror-mount .cm-content');
 await expect(cm).toBeVisible();
 await cm.click();
 await page.keyboard.press('Control+Home');
 await page.keyboard.press('Shift+End');
 await page.keyboard.press('Control+Shift+l');
 await expect(page.locator('#multi-cursor-count')).toContainText('3');
 await page.locator('#rich-tables').selectOption('rowspan');
 await page.locator('[data-rich-apply="tables"]').click();
 const updated=await input.inputValue();
 expect((updated.match(/Alpha/g)||[]).length).toBe(3);
 expect((updated.match(/<table/g)||[]).length).toBe(3);
 await undo(page);
 await expect(input).toHaveValue(original);
 await redo(page);
 await expect(input).toHaveValue(updated);
});
test('static rich table refuses fenced-code selection without mutating Markdown',async({page})=>{
 await page.goto('/');
 await enableAdvanced(page);
 const input=page.locator('#markdown-input');
 const original='Intro\n\n~~~js\nconst test = 1;\n~~~\n\nEnd';
 await input.fill(original);
 await selectText(input,'const test = 1;');
 await page.locator('#rich-tables').selectOption('colspan');
 const dialog=page.waitForEvent('dialog').then(async d=>d.accept());
 await page.locator('[data-rich-apply="tables"]').click();
 await dialog;
 await expect(input).toHaveValue(original);
 await expect(page.locator('#markdown-preview table')).toHaveCount(0);
});
